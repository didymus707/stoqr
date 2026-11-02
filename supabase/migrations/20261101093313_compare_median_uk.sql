-- Compare with the middle price (median), so one reduced buy can't skew a shop,
-- and only count shoppers with a UK postcode district on their profile.
CREATE OR REPLACE FUNCTION get_price_comparison(search_term text)
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
    JOIN profiles p ON p.id = t.user_id AND p.postcode IS NOT NULL
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
    round((percentile_cont(0.5) WITHIN GROUP (ORDER BY unit_price))::numeric, 2) AS avg_unit_price,
    count(*) AS contributors
  FROM latest
  GROUP BY lower(store), unit
  HAVING count(*) >= 5
  ORDER BY avg_unit_price ASC
  LIMIT 6;
$$;