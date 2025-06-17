
-- Create users table to store user information
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password_hash TEXT NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0.00,
  total_invested DECIMAL(15,2) DEFAULT 0.00,
  total_earned DECIMAL(15,2) DEFAULT 0.00,
  referral_code VARCHAR(10) UNIQUE NOT NULL,
  referred_by VARCHAR(10),
  referral_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investment packages table
CREATE TABLE public.investment_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  min_amount DECIMAL(15,2) NOT NULL,
  max_amount DECIMAL(15,2) NOT NULL,
  duration_days INTEGER NOT NULL,
  profit_percentage DECIMAL(5,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user investments table
CREATE TABLE public.user_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.investment_packages(id),
  amount DECIMAL(15,2) NOT NULL,
  expected_return DECIMAL(15,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create withdrawal requests table
CREATE TABLE public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  fee DECIMAL(15,2) NOT NULL,
  net_amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_date TIMESTAMP WITH TIME ZONE,
  processed_by VARCHAR(255),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table for tracking user payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  payment_method VARCHAR(50),
  transaction_reference VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  payment_type VARCHAR(50) DEFAULT 'deposit',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create admin users table
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Create RLS policies for investment packages (public read access)
CREATE POLICY "Anyone can view active packages" ON public.investment_packages
  FOR SELECT USING (is_active = true);

-- Create RLS policies for user investments
CREATE POLICY "Users can view their own investments" ON public.user_investments
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own investments" ON public.user_investments
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Create RLS policies for withdrawal requests
CREATE POLICY "Users can view their own withdrawal requests" ON public.withdrawal_requests
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own withdrawal requests" ON public.withdrawal_requests
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Create RLS policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Insert some default investment packages
INSERT INTO public.investment_packages (name, min_amount, max_amount, duration_days, profit_percentage) VALUES
('Starter Package', 10000, 50000, 7, 15.00),
('Premium Package', 50000, 200000, 14, 25.00),
('VIP Package', 200000, 1000000, 30, 40.00),
('Enterprise Package', 1000000, 10000000, 60, 60.00);

-- Insert default admin user (password: admin123)
INSERT INTO public.admin_users (username, email, password_hash) VALUES
('admin', 'admin@investx.com', '$2b$10$rQJ5qG5Z9kK3H4wF2gT8/.wH3gJ9wF2gT8K3H4wF2gT8/.wH3gJ9w');

-- Create function to automatically return money when withdrawal is rejected
CREATE OR REPLACE FUNCTION handle_withdrawal_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If withdrawal is being rejected and was previously pending
  IF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    -- Return the withdrawal amount to user's balance
    UPDATE public.users 
    SET balance = balance + OLD.amount,
        updated_at = NOW()
    WHERE id = OLD.user_id;
  END IF;
  
  -- Update the processed_date
  IF NEW.status != OLD.status AND NEW.status IN ('approved', 'rejected') THEN
    NEW.processed_date = NOW();
    NEW.updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for withdrawal status changes
CREATE TRIGGER withdrawal_status_change_trigger
  BEFORE UPDATE ON public.withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_withdrawal_status_change();

-- Create function to update user balance when payment is completed
CREATE OR REPLACE FUNCTION handle_payment_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- If payment is being marked as completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Add payment amount to user's balance
    UPDATE public.users 
    SET balance = balance + NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    NEW.processed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for payment completion
CREATE TRIGGER payment_completion_trigger
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION handle_payment_completion();
