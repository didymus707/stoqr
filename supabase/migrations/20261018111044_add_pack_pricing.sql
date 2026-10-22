-- Items: how many units come in one pack, and what a pack costs.
ALTER TABLE items
  ADD COLUMN IF NOT EXISTS pack_size NUMERIC NOT NULL DEFAULT 1 CHECK (pack_size > 0),
  ADD COLUMN IF NOT EXISTS pack_price NUMERIC CHECK (pack_price >= 0);

-- Existing items were priced per unit, i.e. a "pack" of 1.
UPDATE items
  SET pack_price = price WHERE pack_price IS NULL AND price IS NOT NULL;

-- History: remember how it was bought ("2 × 24-pack").
ALTER TABLE transaction_histories
  ADD COLUMN IF NOT EXISTS packs NUMERIC,
  ADD COLUMN IF NOT EXISTS pack_size NUMERIC NOT NULL DEFAULT 1;

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
  v_packs NUMERIC;
  v_qty NUMERIC;
  v_pack_size NUMERIC;
  v_pack_price NUMERIC;
  v_unit_price NUMERIC;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  IF p_store IS NULL OR TRIM(p_store) = '' THEN
    RAISE EXCEPTION 'Store name is required';
  END IF;

  For v_item IN SELECT * FROM  jsonb_array_elements(p_items)
  LOOP
    v_packs := (v_item->>'packs')::NUMERIC;
    v_pack_size := COALESCE((v_item->>'pack_size')::NUMERIC,1);
    v_pack_price := (v_item->>'pack_price')::NUMERIC;

    IF v_packs IS NULL OR v_packs <= 0 THEN
      RAISE EXCEPTION 'Packs must be more than 0 for %', v_item->>'item_name';
    END IF;
    IF v_pack_size <= 0 THEN
      RAISE EXCEPTION 'Pack size must be more than 0 for %', v_item->>'item_name';
    END IF;
    IF v_pack_price IS NULL OR v_pack_price < 0 THEN
      RAISE EXCEPTION 'A price is required for %', v_item->>'item_name';
    END IF;

    v_qty := v_packs * v_pack_price;
    v_unit_price = v_pack_price / v_pack_size;

    INSERT INTO transaction_histories (
      user_id, item_id, item_name, quantity, unit, unit_price, total_price, packs, pack_size, store, purchase_date
    )
    VALUES (
      v_user_id,
      (v_item->>'item_id')::UUID,
      v_item->>'item_name',
      v_qty,
      v_item->>'unit',
      v_unit_price,
      ROUND(v_packs * v_pack_price, 2),
      v_packs,
      v_pack_size,
      p_store,
      CURRENT_DATE
    );

    UPDATE items
    SET quantity = quantity +v_qty,
        pack_size = v_pack_size,
        pack_price = v_pack_price,
        price = v_unit_price
    WHERE id = (v_item->>'item_id')::UUID
      AND inventory_id IN (SELECT id FROM inventories WHERE user_id  = v_user_id);

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Item % not found or not owned by user', v_item->>'item_id';
    END IF;
  END LOOP;
END;
$$;
