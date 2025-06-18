
-- Enable RLS on users table if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Create policy to allow user registration (insert)
CREATE POLICY "Enable insert for registration" ON public.users
  FOR INSERT WITH CHECK (true);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- However, for login purposes, we need to allow reading user data by email
-- This is needed for the authentication process
CREATE POLICY "Allow login by email" ON public.users
  FOR SELECT USING (true);
