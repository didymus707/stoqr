CREATE TABLE transaction_histories(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- ON DELETE SET NULL: Keeps the financial audit record intact even if the parent item is deleted from the catalog.
  item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,

  -- Financial purchase fields
  quantity NUMERIC NOT NULL CHECK(quantity > 0),
  unit TEXT,
  unit_price NUMERIC CHECK(unit_price >= 0),
  total_price NUMERIC NOT NULL CHECK(total_price >= 0),

  store TEXT,

  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- rendering transaction lists ordered by newest first per user
CREATE INDEX idx_transaction_histories_user_date 
ON transaction_histories (user_id, purchase_date DESC);

-- filtering history for a specific item on an item detail view
CREATE INDEX idx_transaction_histories_item_id 
ON transaction_histories (item_id) 
WHERE item_id IS NOT NULL;

ALTER TABLE transaction_histories ENABLE ROW LEVEL SECURITY;

-- Policy A: SELECT
CREATE POLICY "Users can view their own transactions"
ON transaction_histories
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy B: INSERT
CREATE POLICY "Users can insert their own transactions"
ON transaction_histories
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- No UPDATE or DELETE policies are declared.
-- This enforces an append-only transaction history at the database level.