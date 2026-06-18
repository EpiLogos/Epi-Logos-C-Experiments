-- S3 SpacetimeDB skill registry schema for Agora's Track 12.24 ML surface.
-- Persistence shape only: ratings come from Mercurius state and thresholds stay
-- in ~/.epi-logos/config.toml, never in DDL.

CREATE TABLE agora_skill_index (
  skill_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  source TEXT NOT NULL,
  subsystem TEXT NOT NULL,
  residency TEXT NOT NULL,
  skill_path TEXT NOT NULL,
  frontmatter_json TEXT NOT NULL,
  dependency_json TEXT NOT NULL,
  current_rating DOUBLE PRECISION,
  rating_channel TEXT,
  provenance_uri TEXT,
  registered_at TIMESTAMPTZ NOT NULL,
  refreshed_at TIMESTAMPTZ
);

CREATE TABLE agora_skill_dependency (
  skill_id TEXT NOT NULL REFERENCES agora_skill_index(skill_id),
  dependency_name TEXT NOT NULL,
  dependency_kind TEXT NOT NULL,
  dependency_residency TEXT,
  registered_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (skill_id, dependency_name, dependency_kind)
);

CREATE TABLE agora_skill_provenance (
  provenance_id TEXT PRIMARY KEY,
  skill_id TEXT NOT NULL REFERENCES agora_skill_index(skill_id),
  source TEXT NOT NULL,
  upstream_commit TEXT NOT NULL,
  vendored_at TIMESTAMPTZ NOT NULL,
  vendor_agent TEXT NOT NULL,
  manifest_json TEXT NOT NULL
);
