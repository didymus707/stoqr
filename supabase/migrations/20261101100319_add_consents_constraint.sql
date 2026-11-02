ALTER TABLE consents DROP CONSTRAINT IF EXISTS consents_policy_version_published;
ALTER TABLE consents
  ADD CONSTRAINT consents_policy_version_published
  CHECK (policy_version IN ('2026-11-01'));