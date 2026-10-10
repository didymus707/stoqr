CREATE OR REPLACE FUNCTION restock_items(
  p_store TEXT,
  p_items JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_item JSONB;
  v_user_id UUID := auth.uid();
  v_qty NUMERIC;
  v_unit_price NUMERIC;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  IF p_store IS NULL OR TRIM(p_store) = '' THEN
    RAISE EXCEPTION 'Store name is required';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := (v_item->>'quantity')::NUMERIC;
    v_unit_price := (v_item->>'unit_price')::NUMERIC;
    INSERT INTO transaction_histories (
      user_id,
      item_id,
      item_name,
      quantity,
      unit,
      unit_price,
      total_price,
      store,
      purchase_date
    )
    VALUES (
      v_user_id,
      (v_item->>'item_id')::UUID,
      v_item->>'item_name',
      v_qty,
      v_item ->> 'unit',
      v_unit_price,
      ROUND(v_qty * v_unit_price, 2),
      p_store,
      CURRENT_DATE
    );

    UPDATE items
    SET quantity = quantity + v_qty
    WHERE id = (v_item->>'item_id')::UUID
      AND inventory_id IN(
        SELECT id FROM inventories WHERE user_id = v_user_id
      );

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Item % not found or not owned by user', (v_item ->> 'item_id');
    END IF;
    END LOOP;
  END;
  $$;