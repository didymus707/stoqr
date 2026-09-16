ALTER TABLE items
  ALTER COLUMN quantity SET NOT NULL,
  ALTER COLUMN low_stock_threshold SET NOT NULL;

BEGIN;
  CREATE TABLE item_status_snapshot AS SELECT id, name, status FROM items;
  CREATE TYPE item_status AS ENUM ('ok', 'low', 'out');
  ALTER TABLE items DROP COLUMN status;

  ALTER TABLE items 
    ADD COLUMN status item_status
    GENERATED ALWAYS AS (
      CASE
        WHEN quantity <= 0 THEN 'out'::item_status
        WHEN quantity <= low_stock_threshold THEN 'low'::item_status
        ELSE 'ok'::item_status
      END
    ) STORED;
COMMIT;

