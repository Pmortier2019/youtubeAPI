-- =============================================================================
-- SoundTracker – Campaign Feature Migration
-- NOTE: Hibernate (ddl-auto: update) will auto-create/alter these tables from
--       the JPA entities. This file documents the intended schema and can be
--       run manually against the soundtracker-db container for reference or
--       for a fresh database setup where ddl-auto is not used.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- campaigns
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaigns (
    id                  BIGSERIAL       PRIMARY KEY,
    title               VARCHAR(256)    NOT NULL,
    description         TEXT,
    sound_video_id      VARCHAR(32)     NOT NULL,
    sound_url           VARCHAR(2048)   NOT NULL,
    rpm_rate            NUMERIC(19, 4)  NOT NULL,
    total_budget        NUMERIC(19, 4)  NOT NULL,
    spent_budget        NUMERIC(19, 4)  NOT NULL DEFAULT 0,
    min_duration_seconds INT            NOT NULL DEFAULT 35,
    max_duration_seconds INT            NOT NULL DEFAULT 60,
    min_volume_percent  INT             NOT NULL DEFAULT 15,
    status              VARCHAR(32)     NOT NULL,   -- CampaignStatus enum: ACTIVE, PAUSED, COMPLETED
    created_at          TIMESTAMPTZ     NOT NULL,
    start_date          DATE            NOT NULL,
    end_date            DATE
);

-- ---------------------------------------------------------------------------
-- campaign_participations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaign_participations (
    id              BIGSERIAL       PRIMARY KEY,
    campaign_id     BIGINT          NOT NULL REFERENCES campaigns(id),
    short_video_id  BIGINT          REFERENCES short_videos(id),   -- nullable
    creator_name    VARCHAR(128)    NOT NULL,
    short_url       VARCHAR(2048)   NOT NULL,
    video_id        VARCHAR(32)     NOT NULL,
    joined_at       TIMESTAMPTZ     NOT NULL,
    status          VARCHAR(32)     NOT NULL,   -- ParticipationStatus: PENDING_REVIEW, APPROVED, REJECTED
    approved_at     TIMESTAMPTZ,
    CONSTRAINT uq_campaign_video UNIQUE (campaign_id, video_id)
);

-- ---------------------------------------------------------------------------
-- payouts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payouts (
    id              BIGSERIAL       PRIMARY KEY,
    creator_name    VARCHAR(128)    NOT NULL,
    amount          NUMERIC(19, 4)  NOT NULL,
    month           INT             NOT NULL,
    year            INT             NOT NULL,
    status          VARCHAR(32)     NOT NULL,   -- PayoutStatus: PENDING, PAID
    payment_method  VARCHAR(64)     NOT NULL,
    payment_details VARCHAR(512)    NOT NULL,
    requested_at    TIMESTAMPTZ     NOT NULL,
    paid_at         TIMESTAMPTZ
);

-- ---------------------------------------------------------------------------
-- payment_methods
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_methods (
    id              BIGSERIAL       PRIMARY KEY,
    app_user_id     BIGINT          NOT NULL REFERENCES app_users(id),
    type            VARCHAR(64)     NOT NULL,
    details         VARCHAR(512)    NOT NULL,
    is_default      BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ     NOT NULL
);

-- ---------------------------------------------------------------------------
-- Indexes (optional but recommended for the query methods defined in
-- the Spring Data repositories)
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_campaigns_status
    ON campaigns (status);

CREATE INDEX IF NOT EXISTS idx_participations_campaign
    ON campaign_participations (campaign_id);

CREATE INDEX IF NOT EXISTS idx_participations_campaign_status
    ON campaign_participations (campaign_id, status);

CREATE INDEX IF NOT EXISTS idx_participations_creator
    ON campaign_participations (creator_name);

CREATE INDEX IF NOT EXISTS idx_payouts_creator
    ON payouts (creator_name);

CREATE INDEX IF NOT EXISTS idx_payouts_status
    ON payouts (status);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user
    ON payment_methods (app_user_id);

-- ---------------------------------------------------------------------------
-- creator_agreement_acceptances (PIE-15)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS creator_agreement_acceptances (
    id                  BIGSERIAL       PRIMARY KEY,
    user_id             BIGINT          NOT NULL REFERENCES app_users(id),
    agreement_version   VARCHAR(20)     NOT NULL DEFAULT '1.0',
    accepted_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    ip_address          VARCHAR(45),
    user_agent          TEXT,
    CONSTRAINT uq_user_agreement_version UNIQUE (user_id, agreement_version)
);

CREATE INDEX IF NOT EXISTS idx_creator_agreement_user
    ON creator_agreement_acceptances (user_id);
