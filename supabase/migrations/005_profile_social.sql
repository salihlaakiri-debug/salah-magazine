-- Add social link columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram text DEFAULT '';
