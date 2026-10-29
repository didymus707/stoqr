UPDATE profiles
SET postcode = regexp_replace(upper(replace(postcode, ' ', '')), '[0-9][A-Z]{2}$', '')
WHERE postcode IS NOT NULL
  AND upper(replace(postcode, ' ', '')) ~ '^[A-Z]{1,2}[0-9][0-9A-Z]?[0-9][A-Z]{2}$';
