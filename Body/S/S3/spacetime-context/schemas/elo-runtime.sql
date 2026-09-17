-- S3 SpacetimeDB Elo runtime schema for Aletheia/Mercurius.
-- Owns persistence shape only; Elo threshold and hyperparameter values come from
-- ~/.epi-logos/config.toml [aletheia.elo] and [aletheia.drift_detection].

CREATE TABLE mercurius_elo_ratings (
  rating_id TEXT PRIMARY KEY,
  agent TEXT NOT NULL,
  model TEXT NOT NULL,
  harness TEXT NOT NULL,
  skill TEXT NOT NULL,
  channel TEXT NOT NULL,
  vak_cp_position TEXT NOT NULL,
  mef_lens TEXT NOT NULL,
  content_class TEXT NOT NULL,
  kairos_window TEXT NOT NULL,
  cfp_thread_type TEXT NOT NULL,
  r_factor_slot TEXT NOT NULL,
  rating DOUBLE PRECISION NOT NULL,
  sigma DOUBLE PRECISION NOT NULL,
  trial_count BIGINT NOT NULL,
  effective_rating DOUBLE PRECISION,
  source_trial_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE mercurius_trial_log (
  trial_id TEXT PRIMARY KEY,
  tournament TEXT NOT NULL,
  trial_class TEXT NOT NULL,
  agent TEXT NOT NULL,
  model TEXT NOT NULL,
  harness TEXT NOT NULL,
  skill TEXT NOT NULL,
  vak_cp_position TEXT NOT NULL,
  mef_lens TEXT NOT NULL,
  content_class TEXT NOT NULL,
  kairos_window TEXT NOT NULL,
  cfp_thread_type TEXT NOT NULL,
  r_factor_slot TEXT NOT NULL,
  verifier_score DOUBLE PRECISION,
  lens_score DOUBLE PRECISION,
  user_score DOUBLE PRECISION,
  fair_comparison_trial_id TEXT,
  fair_comparison_score DOUBLE PRECISION,
  threshold_decision TEXT,
  recorded_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ
);

CREATE TABLE anansi_rating_index (
  context_key TEXT NOT NULL,
  identity_key TEXT NOT NULL,
  channel TEXT NOT NULL,
  rating_id TEXT NOT NULL REFERENCES mercurius_elo_ratings(rating_id),
  vak_cp_position TEXT NOT NULL,
  mef_lens TEXT NOT NULL,
  content_class TEXT NOT NULL,
  kairos_window TEXT NOT NULL,
  cfp_thread_type TEXT NOT NULL,
  r_factor_slot TEXT NOT NULL,
  indexed_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (context_key, identity_key, channel)
);

CREATE TABLE moirai_comparison_cache (
  comparison_id TEXT PRIMARY KEY,
  trial_id TEXT NOT NULL REFERENCES mercurius_trial_log(trial_id),
  comparable_trial_id TEXT REFERENCES mercurius_trial_log(trial_id),
  similarity_score DOUBLE PRECISION,
  comparable BOOLEAN NOT NULL,
  atropos_decision TEXT NOT NULL,
  reason TEXT,
  computed_at TIMESTAMPTZ NOT NULL
);
