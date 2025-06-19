
-- Add is_admin column to users table
ALTER TABLE public.users ADD COLUMN is_admin BOOLEAN DEFAULT false;

-- Delete all existing users
DELETE FROM public.users;

-- Insert the admin user with correct bcrypt hash for 'Ishgad123@'
INSERT INTO public.users (
  name,
  email,
  phone,
  password_hash,
  referral_code,
  balance,
  total_invested,
  total_earned,
  referral_count,
  referrals_required_for_withdrawal,
  is_active,
  is_admin
) VALUES (
  'Admin User',
  'gadyishimwe1@gmail.com',
  '+250000000000',
  '$2a$10$VQ8O9K1lHv5t0bXr8uRKZO5YrE5J4p8V6L8x9J8x9J8x9J8x9J8x9',
  'ADMIN001',
  0,
  0,
  0,
  0,
  0,
  true,
  true
);
