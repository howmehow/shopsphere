-- Initialize PostgreSQL database for ShopSphere
-- This file is executed when the PostgreSQL container starts for the first time

-- Create the webapp database if it doesn't exist
-- (This is handled by POSTGRES_DB environment variable, but keeping for reference)

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a function to generate random UUIDs (alternative to uuid-ossp)
CREATE OR REPLACE FUNCTION gen_random_uuid() RETURNS uuid AS $$
BEGIN
    RETURN uuid_generate_v4();
END;
$$ LANGUAGE plpgsql;

-- Set timezone to UTC
SET timezone = 'UTC';

-- Create indexes for better performance (these will be created by GORM migrations, but keeping for reference)
-- Note: GORM will handle table creation and indexing automatically

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'ShopSphere database initialized successfully';
END $$;
