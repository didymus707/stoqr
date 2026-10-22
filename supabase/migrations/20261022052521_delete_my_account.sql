CREATE OR REPLACE FUNCTION delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  -- Delete in this order so no foreign key blocks the next step.
  DELETE FROM transaction_histories WHERE user_id = v_uid;
  DELETE FROM items WHERE inventory_id IN (SELECT id FROM inventories WHERE user_id = v_uid);
  DELETE FROM inventories WHERE user_id = v_uid;
  DELETE FROM profiles WHERE id = v_uid;
  DELETE FROM auth.users WHERE id = v_uid;
END;
$$;

-- Only signed-in users can run it, and it only ever deletes their own account.
REVOKE ALL ON FUNCTION delete_my_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION delete_my_account() TO authenticated;