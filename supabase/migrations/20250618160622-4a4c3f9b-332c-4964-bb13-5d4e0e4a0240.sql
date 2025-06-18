
-- Clear existing default packages and add real investment packages
DELETE FROM public.investment_packages;

-- Insert real investment packages that match your requirements
INSERT INTO public.investment_packages (name, min_amount, max_amount, duration_days, profit_percentage, is_active) VALUES
('Starter Package', 10000, 50000, 7, 15.00, true),
('Premium Package', 50000, 200000, 14, 25.00, true),
('VIP Package', 200000, 1000000, 30, 40.00, true),
('Enterprise Package', 1000000, 10000000, 60, 60.00, true);

-- Add a referrals requirement field to track withdrawal eligibility
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referrals_required_for_withdrawal INTEGER DEFAULT 2;
