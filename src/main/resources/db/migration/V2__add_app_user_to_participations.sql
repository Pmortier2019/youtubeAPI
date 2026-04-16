-- Add app_user_id FK to campaign_participations so earnings can be queried by user ID
-- instead of by creator name (which can change).
-- Nullable to preserve existing rows.
ALTER TABLE campaign_participations
    ADD COLUMN IF NOT EXISTS app_user_id BIGINT REFERENCES app_users(id);

CREATE INDEX IF NOT EXISTS idx_cp_app_user_id ON campaign_participations (app_user_id);
