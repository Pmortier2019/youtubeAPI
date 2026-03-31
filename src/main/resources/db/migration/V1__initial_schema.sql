-- =============================================================================
-- V1__initial_schema.sql
-- Full SoundTracker schema.
-- Uses IF NOT EXISTS — safe to run against existing databases that were
-- previously managed by Hibernate ddl-auto: update.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- app_users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_users (
    id              BIGSERIAL       PRIMARY KEY,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    role            VARCHAR(32)     NOT NULL,
    creator_name    VARCHAR(255),
    email_verified  BOOLEAN         NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_app_user_creator_name ON app_users (creator_name);

-- ---------------------------------------------------------------------------
-- youtube_channels
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS youtube_channels (
    id              BIGSERIAL       PRIMARY KEY,
    app_user_id     BIGINT          NOT NULL REFERENCES app_users(id),
    channel_id      VARCHAR(255)    NOT NULL,
    channel_handle  VARCHAR(255),
    channel_name    VARCHAR(255),
    added_at        TIMESTAMP       NOT NULL DEFAULT NOW(),
    last_scraped_at TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- sounds
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sounds (
    id              BIGSERIAL       PRIMARY KEY,
    title           VARCHAR(256)    NOT NULL,
    artist_name     VARCHAR(256),
    sound_video_id  VARCHAR(32)     NOT NULL UNIQUE,
    sound_url       VARCHAR(2048)   NOT NULL,
    genre           VARCHAR(128),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- short_videos
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS short_videos (
    id              BIGSERIAL       PRIMARY KEY,
    url             VARCHAR(2048)   NOT NULL,
    video_id        VARCHAR(32)     NOT NULL UNIQUE,
    creator         VARCHAR(128)    NOT NULL,
    channel_id      BIGINT          REFERENCES youtube_channels(id),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    sound_used      BOOLEAN,
    paid_views      BIGINT          NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_short_video_creator ON short_videos (creator);
CREATE INDEX IF NOT EXISTS idx_short_video_id      ON short_videos (video_id);

-- ---------------------------------------------------------------------------
-- video_snapshots
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS video_snapshots (
    id              BIGSERIAL       PRIMARY KEY,
    video_id        VARCHAR(32)     NOT NULL,
    snapshot_date   DATE            NOT NULL,
    view_count      BIGINT          NOT NULL,
    like_count      BIGINT          NOT NULL,
    comment_count   BIGINT          NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_snap_video_date ON video_snapshots (video_id, snapshot_date);

-- ---------------------------------------------------------------------------
-- email_verification_tokens
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id          BIGSERIAL       PRIMARY KEY,
    token       VARCHAR(255)    NOT NULL UNIQUE,
    user_id     BIGINT          NOT NULL REFERENCES app_users(id),
    expires_at  TIMESTAMPTZ     NOT NULL
);

-- ---------------------------------------------------------------------------
-- campaigns
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaigns (
    id                      BIGSERIAL       PRIMARY KEY,
    title                   VARCHAR(256)    NOT NULL,
    description             TEXT,
    sound_video_id          VARCHAR(32)     NOT NULL,
    sound_url               VARCHAR(2048)   NOT NULL,
    rpm_rate                NUMERIC(19, 4)  NOT NULL,
    total_budget            NUMERIC(19, 4)  NOT NULL,
    spent_budget            NUMERIC(19, 4)  NOT NULL DEFAULT 0,
    min_duration_seconds    INT             NOT NULL DEFAULT 35,
    max_duration_seconds    INT             NOT NULL DEFAULT 60,
    min_volume_percent      INT             NOT NULL DEFAULT 15,
    status                  VARCHAR(32)     NOT NULL,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    start_date              DATE            NOT NULL,
    end_date                DATE
);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns (status);

-- ---------------------------------------------------------------------------
-- campaign_participations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaign_participations (
    id              BIGSERIAL       PRIMARY KEY,
    campaign_id     BIGINT          NOT NULL REFERENCES campaigns(id),
    short_video_id  BIGINT          REFERENCES short_videos(id),
    creator_name    VARCHAR(128)    NOT NULL,
    short_url       VARCHAR(2048)   NOT NULL,
    video_id        VARCHAR(32)     NOT NULL,
    joined_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    status          VARCHAR(32)     NOT NULL,
    approved_at     TIMESTAMPTZ,
    CONSTRAINT uq_campaign_video UNIQUE (campaign_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_cp_creator_name ON campaign_participations (creator_name);
CREATE INDEX IF NOT EXISTS idx_cp_video_id     ON campaign_participations (video_id);

-- ---------------------------------------------------------------------------
-- payouts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payouts (
    id              BIGSERIAL       PRIMARY KEY,
    app_user_id     BIGINT          NOT NULL REFERENCES app_users(id),
    creator_name    VARCHAR(128)    NOT NULL,
    amount          NUMERIC(19, 4)  NOT NULL,
    month           INT             NOT NULL,
    year            INT             NOT NULL,
    status          VARCHAR(32)     NOT NULL,
    payment_method  VARCHAR(64)     NOT NULL,
    payment_details VARCHAR(512)    NOT NULL,
    requested_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
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
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- creator_agreement_acceptances
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

CREATE INDEX IF NOT EXISTS idx_creator_agreement_user ON creator_agreement_acceptances (user_id);
