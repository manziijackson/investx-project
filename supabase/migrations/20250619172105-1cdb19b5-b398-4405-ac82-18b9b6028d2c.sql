
-- Update the admin user with a properly hashed password for 'Ishgad123@'
UPDATE public.users 
SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email = 'gadyishimwe1@gmail.com';
