ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS app_api_keys (
  provider TEXT PRIMARY KEY,
  api_key TEXT NOT NULL CHECK (char_length(api_key) <= 4000),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TRIGGER update_app_api_keys_updated_at
BEFORE UPDATE ON app_api_keys
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

ALTER TABLE app_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin read app_api_keys"
ON app_api_keys
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = TRUE
  )
);

CREATE POLICY "Allow admin insert app_api_keys"
ON app_api_keys
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = TRUE
  )
);

CREATE POLICY "Allow admin update app_api_keys"
ON app_api_keys
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = TRUE
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = TRUE
  )
);

CREATE POLICY "Allow admin delete app_api_keys"
ON app_api_keys
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = TRUE
  )
);
