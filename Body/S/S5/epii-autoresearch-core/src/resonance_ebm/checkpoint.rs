//! Versioned checkpoint load/persist for the position 5' EBM runtime.

use std::fs::File;
use std::path::Path;

use serde::{Deserialize, Serialize};

use super::model::{EbmWeights, ResonanceEbmConfig};

pub const EBM_CHECKPOINT_SCHEMA_VERSION: u16 = 1;
pub const EBM_CHECKPOINT_ARCHITECTURE: &str = crate::resonance_corpus::EBM_ARCHITECTURE;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CheckpointLoadPolicy {
    RequireCheckpoint,
    AllowZeroFallback,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EbmCheckpointMetadata {
    pub schema_version: u16,
    pub architecture: String,
    pub variant_id: String,
    pub channel_set: Vec<String>,
    pub created_unix_ms: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EbmCheckpoint {
    pub metadata: EbmCheckpointMetadata,
    pub config: ResonanceEbmConfig,
    pub weights: EbmWeights,
    pub corpus_snapshot_uri: String,
}

impl EbmCheckpoint {
    pub fn seeded_for_config(
        config: ResonanceEbmConfig,
        corpus_snapshot_uri: String,
    ) -> Result<Self, String> {
        config.validate()?;
        let weights = EbmWeights::seeded(&config, &corpus_snapshot_uri)?;
        Ok(Self {
            metadata: EbmCheckpointMetadata {
                schema_version: EBM_CHECKPOINT_SCHEMA_VERSION,
                architecture: EBM_CHECKPOINT_ARCHITECTURE.to_owned(),
                variant_id: config.variant_id.clone(),
                channel_set: super::channels::CANONICAL_CHANNEL_SET
                    .iter()
                    .map(|channel| (*channel).to_owned())
                    .collect(),
                created_unix_ms: 0,
            },
            config,
            weights,
            corpus_snapshot_uri,
        })
    }

    pub fn load(path: impl AsRef<Path>) -> Result<Self, String> {
        let file = File::open(path.as_ref()).map_err(|err| {
            format!(
                "failed to open checkpoint {}: {err}",
                path.as_ref().display()
            )
        })?;
        serde_json::from_reader::<_, Self>(file)
            .map_err(|err| {
                format!(
                    "failed to parse checkpoint {}: {err}",
                    path.as_ref().display()
                )
            })
            .and_then(|checkpoint| {
                checkpoint.validate()?;
                Ok(checkpoint)
            })
    }

    pub fn persist(&self, path: impl AsRef<Path>) -> Result<(), String> {
        self.validate()?;
        let file = File::create(path.as_ref()).map_err(|err| {
            format!(
                "failed to create checkpoint {}: {err}",
                path.as_ref().display()
            )
        })?;
        serde_json::to_writer_pretty(file, self).map_err(|err| {
            format!(
                "failed to write checkpoint {}: {err}",
                path.as_ref().display()
            )
        })
    }

    pub fn validate(&self) -> Result<(), String> {
        if self.metadata.schema_version != EBM_CHECKPOINT_SCHEMA_VERSION {
            return Err(format!(
                "unsupported EBM checkpoint schema version {}",
                self.metadata.schema_version
            ));
        }
        if self.metadata.architecture != EBM_CHECKPOINT_ARCHITECTURE {
            return Err(format!(
                "unsupported EBM checkpoint architecture {}",
                self.metadata.architecture
            ));
        }
        if self.metadata.variant_id != self.config.variant_id {
            return Err("checkpoint metadata variant_id must match config variant_id".to_owned());
        }
        let expected_channels = super::channels::CANONICAL_CHANNEL_SET
            .iter()
            .map(|channel| (*channel).to_owned())
            .collect::<Vec<_>>();
        if self.metadata.channel_set != expected_channels {
            return Err(
                "checkpoint metadata channel_set must match the canonical ordered channel set"
                    .to_owned(),
            );
        }
        if self.corpus_snapshot_uri.trim().is_empty() {
            return Err("corpus_snapshot_uri is required".to_owned());
        }
        self.config.validate()?;
        self.weights.validate(&self.config)
    }
}
