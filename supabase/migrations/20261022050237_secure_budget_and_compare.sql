-- Budget: current values (price × quantity), only ever the signed-in user's items.
-- The parameter stays so the app's existing call keeps working, but it's ignored.
CREATE OR REPLACE FUNCTION get_budget_summary(user_id_input uuid)
RETURNS json
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH priced AS (
    SELECT
      i.name,
      COALESCE(i.store, 'No shop') AS store,
      i.price,
      i.quantity,
      i.unit,
      i.price * i.quantity AS item_value
    FROM items i
    JOIN inventories inv ON inv.id = i.inventory_id
    WHERE inv.user_id = auth.uid()
      AND i.price IS NOT NULL
  )
  SELECT json_build_object(
    'total_value', ROUND(COALESCE(SUM(item_value), 0)::numeric, 2),
    'item_count', COUNT(*),
    'store_breakdown', (
      SELECT json_agg(s ORDER BY s.store_total DESC)
      FROM (
        SELECT store, ROUND(SUM(item_value)::numeric, 2) AS store_total
        FROM priced
        GROUP BY store
      ) s
    ),
    'top_items', (
      SELECT json_agg(t ORDER BY t.item_value DESC)
      FROM (
        SELECT
          name,
          NULLIF(store, 'No shop') AS store,
          ROUND(item_value::numeric, 2) AS item_value,
          price,
          quantity,
          unit
        FROM priced
        ORDER BY item_value DESC
        LIMIT 5
      ) t
    )
  )
  FROM priced;
$$;

-- Price comparison: unchanged logic, plus a fixed search_path for safety.
CREATE OR REPLACE FUNCTION get_price_comparison(search_term text)
RETURNS TABLE (
  store text,
  avg_price numeric,
  min_price numeric,
  max_price numeric,
  data_points bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    i.store,
    ROUND(AVG(i.price)::numeric, 2) AS avg_price,
    ROUND(MIN(i.price)::numeric, 2) AS min_price,
    ROUND(MAX(i.price)::numeric, 2) AS max_price,
    COUNT(*) AS data_points
  FROM items i
  WHERE LOWER(i.name) LIKE LOWER('%' || search_term || '%')
    AND i.store IS NOT NULL
    AND i.price IS NOT NULL
  GROUP BY i.store
  ORDER BY avg_price ASC
  LIMIT 6;
$$;