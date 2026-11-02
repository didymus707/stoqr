REVOKE INSERT ON consents FROM anon, authenticated;
GRANT INSERT (user_id, purpose, granted, policy_version, source) ON consents TO authenticated;

ALTER TABLE consents
  ADD CONSTRAINT consents_policy_version_published
  CHECK (policy_version IN ('2026-11-01')) NOT VALID;