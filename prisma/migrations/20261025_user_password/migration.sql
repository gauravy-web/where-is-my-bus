-- Add password column to User table for phone+password authentication.
-- OTP authentication has been removed. Existing users will be prompted to
-- set a password on their next login (column is nullable for migration safety).
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" text;
