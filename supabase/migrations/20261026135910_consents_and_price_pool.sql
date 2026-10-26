-- Consent log: one row per change, never edited. The newest row per purpose is the current choice.
CREATE TABLE IF NOT EXISTS consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purpose text NOT NULL CHECK (purpose IN ('price_sharing', 'product_analytics')),
  granted boolean NOT NULL,
  policy_version text NOT NULL,
  source text NOT NULL CHECK (source IN ('setup', 'profile')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consents_user_purpose_time
  ON consents (user_id, purpose, created_at DESC);

ALTER TABLE consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own consents"
  ON consents FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can record their own consents"
  ON consents FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
-- No UPDATE or DELETE policies: the log is append-only.
-- ON DELETE CASCADE removes it when the account is deleted.

-- Price comparison: consenting users only, purchases in the last 90 days,
-- at least 5 different people, averages only.
DROP FUNCTION IF EXISTS get_price_comparison(text);

CREATE FUNCTION get_price_comparison(search_term text)
RETURNS TABLE (store text, unit text, avg_unit_price numeric, contributors bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH sharing AS (
    SELECT DISTINCT ON (user_id) user_id, granted
    FROM consents
    WHERE purpose = 'price_sharing'
    ORDER BY user_id, created_at DESC
  ),
  latest AS (
    -- each person's most recent price per shop and unit
    SELECT DISTINCT ON (t.user_id, lower(t.store), coalesce(t.unit, ''))
      t.user_id, t.store, t.unit, t.unit_price
    FROM transaction_histories t
    JOIN sharing s ON s.user_id = t.user_id AND s.granted
    WHERE length(trim(search_term)) >= 2
      AND t.item_name ILIKE '%' || trim(search_term) || '%'
      AND t.store IS NOT NULL
      AND t.unit_price IS NOT NULL
      AND t.purchase_date >= current_date - 90
    ORDER BY t.user_id, lower(t.store), coalesce(t.unit, ''), t.purchase_date DESC, t.created_at DESC
  )
  SELECT
    min(store) AS store,
    unit,
    round(avg(unit_price)::numeric, 2) AS avg_unit_price,
    count(*) AS contributors
  FROM latest
  GROUP BY lower(store), unit
  HAVING count(*) >= 5
  ORDER BY avg_unit_price ASC
  LIMIT 6;
$$;

REVOKE ALL ON FUNCTION get_price_comparison(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION get_price_comparison(text) TO authenticated;
