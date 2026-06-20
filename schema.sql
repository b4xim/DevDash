-- DevDash Schema
-- Run this in the Supabase SQL Editor

-- Enums
CREATE TYPE lab_status AS ENUM ('not_started', 'in_progress', 'done');
CREATE TYPE application_status AS ENUM ('applied', 'interview', 'offer', 'rejected');

-- Labs table
CREATE TABLE labs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  status lab_status NOT NULL DEFAULT 'not_started',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Job applications table
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  status application_status NOT NULL DEFAULT 'applied',
  date_applied DATE,
  link TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optional: Seed some sample labs
-- INSERT INTO labs (category, name) VALUES
--   ('linux', 'File system navigation'),
--   ('linux', 'User & permissions management'),
--   ('docker', 'Build and run containers'),
--   ('docker', 'Docker Compose multi-service'),
--   ('kubernetes', 'Deploy a Pod'),
--   ('kubernetes', 'Services and Ingress'),
--   ('aws', 'EC2 instance setup'),
--   ('aws', 'S3 bucket + IAM policies'),
--   ('terraform', 'Write a basic plan'),
--   ('ci-cd', 'GitHub Actions workflow'),
--   ('ansible', 'Write a playbook');

-- Disable Row Level Security (Since we handle auth via Next.js middleware)
ALTER TABLE labs DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications DISABLE ROW LEVEL SECURITY;

-- Activity Log table
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_date DATE UNIQUE NOT NULL,
  count INTEGER NOT NULL DEFAULT 1
);
ALTER TABLE activity_log DISABLE ROW LEVEL SECURITY;

-- Daily Focus table
CREATE TABLE daily_focus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  focus_date DATE UNIQUE NOT NULL,
  suggestion TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE daily_focus DISABLE ROW LEVEL SECURITY;
