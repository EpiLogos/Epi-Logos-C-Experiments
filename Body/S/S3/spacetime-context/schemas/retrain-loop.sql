-- S3 SpacetimeDB retrain loop schema for Aletheia drift detection.
-- Drift thresholds, retry counts, severity weights, Elo seeds, and confidence
-- parameters resolve from ~/.epi-logos/config.toml; this schema stores facts.

CREATE TABLE aletheia_retrain_queue (
  retrain_id TEXT PRIMARY KEY,
  drift_event_id TEXT NOT NULL,
  drift_kind TEXT NOT NULL,
  target_subsystem TEXT NOT NULL,
  target_skill TEXT NOT NULL,
  target_model_slot TEXT,
  action TEXT NOT NULL,
  priority TEXT NOT NULL,
  calibration_provenance_json TEXT NOT NULL,
  status TEXT NOT NULL,
  queued_at TIMESTAMPTZ NOT NULL,
  dispatched_at TIMESTAMPTZ,
  anima_dispatch_id TEXT
);

CREATE TABLE aletheia_retrain_history (
  retrain_id TEXT PRIMARY KEY REFERENCES aletheia_retrain_queue(retrain_id),
  run_id TEXT NOT NULL,
  artifact_uri TEXT NOT NULL,
  metrics_json TEXT NOT NULL,
  sample_outputs_json TEXT NOT NULL,
  ratification_status TEXT NOT NULL,
  reviewer TEXT,
  rejection_reason TEXT,
  completed_at TIMESTAMPTZ NOT NULL,
  promoted_at TIMESTAMPTZ
);

CREATE TABLE aletheia_retrain_signal (
  signal_id TEXT PRIMARY KEY,
  retrain_id TEXT NOT NULL REFERENCES aletheia_retrain_queue(retrain_id),
  signal_kind TEXT NOT NULL,
  observed_value DOUBLE PRECISION,
  baseline_value DOUBLE PRECISION,
  config_key TEXT NOT NULL,
  evidence_json TEXT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL
);
