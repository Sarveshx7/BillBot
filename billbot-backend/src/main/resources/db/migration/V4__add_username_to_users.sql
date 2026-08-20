-- Migration V4: Add username column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);