-- Run this in Supabase SQL Editor to set salihlaakiri@gmail.com as admin
UPDATE profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'salihlaakiri@gmail.com');
