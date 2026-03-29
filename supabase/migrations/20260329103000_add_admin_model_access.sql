CREATE TABLE IF NOT EXISTS app_model_access (
  model_key TEXT PRIMARY KEY,
  is_global BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS app_model_access_users (
  model_key TEXT NOT NULL REFERENCES app_model_access(model_key) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (model_key, user_id)
);

DROP TRIGGER IF EXISTS update_app_model_access_updated_at ON app_model_access;
CREATE TRIGGER update_app_model_access_updated_at
BEFORE UPDATE ON app_model_access
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

ALTER TABLE app_model_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_model_access_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin read app_model_access"
ON app_model_access
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

CREATE POLICY "Allow admin insert app_model_access"
ON app_model_access
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

CREATE POLICY "Allow admin update app_model_access"
ON app_model_access
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

CREATE POLICY "Allow admin delete app_model_access"
ON app_model_access
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

CREATE POLICY "Allow admin read app_model_access_users"
ON app_model_access_users
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

CREATE POLICY "Allow admin insert app_model_access_users"
ON app_model_access_users
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

CREATE POLICY "Allow admin update app_model_access_users"
ON app_model_access_users
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

CREATE POLICY "Allow admin delete app_model_access_users"
ON app_model_access_users
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
