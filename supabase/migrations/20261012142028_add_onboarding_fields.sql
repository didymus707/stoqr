ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preferred_stores TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ;

  UPDATE profiles SET onboarded_at = now() WHERE onboarded_at IS NULL;