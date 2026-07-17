//! Corpus-backed EBM training/export surface for the position 5' resonance head.
//!
//! The store is deliberately file-backed: the canonical graph remains the
//! production substrate, while this module gives the CLI a reproducible local
//! checkpoint/corpus-snapshot artifact without introducing a background worker.

use std::collections::hash_map::DefaultHasher;
use std::fs::{self, File};
use std::hash::{Hash, Hasher};
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use serde_json::Value;

pub const RESONANCE_VECTOR_DIMENSIONS: usize = 72;
pub const EBM_CHECKPOINT_SCHEMA_VERSION: u16 = 1;
pub const EBM_ARCHITECTURE: &str =
    "candle/parallel-channel-encoders/cross-channel-attention/tritone-three-sub-head/sigmoid-72";
pub const DEFAULT_VARIANT_ID: &str = "pi-resonance-corpus-gated-fusion";

const STORE_FILE: &str = "resonance-corpus-store.json";
const CHECKPOINT_FILE: &str = "ebm-checkpoint.json";
const EXPORT_METADATA_FILE: &str = "metadata.json";
const CORPUS_SNAPSHOT_FILE: &str = "corpus-snapshot.json";
const DEFAULT_VALIDATION_SPLIT: f32 = 0.2;

const CANONICAL_CHANNEL_SET: [&str; 7] = [
    "lens_resonance_72",
    "audio_octet",
    "nodal_quartet",
    "planetary_chakral",
    "mahamaya",
    "codon_rotation_projection",
    "q_cosmic",
];

#[derive(Debug, Clone)]
pub struct ResonanceCorpusStore {
    root: PathBuf,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrainingPairInput {
    pub document_id: String,
    pub document_path: String,
    pub bimba_coordinate: String,
    pub content_hash: String,
    pub resonance_vector: Vec<f32>,
    pub profile_snapshot: Value,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EbmTrainingConfig {
    pub latent_dim: usize,
    pub channel_encoder_width: usize,
    pub attention_width: usize,
    pub mirror_tolerance: f32,
    pub energy_weight: f32,
    pub validation_split: f32,
    pub variant_id: String,
}

impl Default for EbmTrainingConfig {
    fn default() -> Self {
        Self {
            latent_dim: 16,
            channel_encoder_width: 16,
            attention_width: 16,
            mirror_tolerance: 0.0001,
            energy_weight: 1.0,
            validation_split: DEFAULT_VALIDATION_SPLIT,
            variant_id: DEFAULT_VARIANT_ID.to_owned(),
        }
    }
}

impl EbmTrainingConfig {
    pub fn validate(&self) -> Result<(), String> {
        if self.latent_dim == 0 {
            return Err("latent_dim must be greater than zero".to_owned());
        }
        if self.channel_encoder_width == 0 {
            return Err("channel_encoder_width must be greater than zero".to_owned());
        }
        if self.attention_width == 0 {
            return Err("attention_width must be greater than zero".to_owned());
        }
        if !(0.0..=1.0).contains(&self.mirror_tolerance) {
            return Err("mirror_tolerance must be in 0.0..=1.0".to_owned());
        }
        if !self.energy_weight.is_finite() || self.energy_weight <= 0.0 {
            return Err("energy_weight must be finite and positive".to_owned());
        }
        if !(0.0..1.0).contains(&self.validation_split) {
            return Err("validation_split must be in 0.0..1.0".to_owned());
        }
        if self.variant_id.trim().is_empty() {
            return Err("variant_id is required".to_owned());
        }
        Ok(())
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrainEbmRequest {
    pub dry_run: bool,
    pub config: EbmTrainingConfig,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrainEbmReport {
    pub dry_run: bool,
    pub plan: TrainingPlan,
    pub metrics: Option<ValidationMetrics>,
    pub checkpoint_id: Option<String>,
    pub checkpoint_path: Option<PathBuf>,
    pub corpus_snapshot_id: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrainingPlan {
    pub eligible_pairs: usize,
    pub blocked_pairs: usize,
    pub training_pairs: usize,
    pub validation_pairs: usize,
    pub corpus_snapshot_id: String,
    pub corpus_snapshot_uri: String,
    pub latest_checkpoint_id: Option<String>,
    pub manual_invocation_required: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ValidationMetrics {
    pub validation_mse: f32,
    pub square_1_mse: f32,
    pub square_2_mse: f32,
    pub square_3_mse: f32,
    pub mirror_consistency_loss: f32,
    pub cross_channel_coherence_loss: f32,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportedEbmState {
    pub checkpoint_id: String,
    pub corpus_snapshot_id: String,
    pub checkpoint_path: PathBuf,
    pub metadata_path: PathBuf,
    pub corpus_snapshot_path: PathBuf,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ResonanceCorpusState {
    schema_version: u16,
    documents: Vec<CorpusDocument>,
    training_pairs: Vec<TrainingPair>,
    bimba_nodes: Vec<BimbaNodeResonance>,
    latest_checkpoint_id: Option<String>,
}

impl Default for ResonanceCorpusState {
    fn default() -> Self {
        Self {
            schema_version: 1,
            documents: Vec::new(),
            training_pairs: Vec::new(),
            bimba_nodes: Vec::new(),
            latest_checkpoint_id: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CorpusDocument {
    pub document_id: String,
    pub document_path: String,
    pub content_hash: String,
    pub ingestion_status: String,
    pub target_coordinates: Vec<String>,
    pub last_updated_unix_ms: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrainingPair {
    pub pair_id: String,
    pub document_id: String,
    pub document_path: String,
    pub bimba_coordinate: String,
    pub content_hash: String,
    pub resonance_vector: Vec<f32>,
    pub profile_snapshot: Value,
    pub created_unix_ms: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BimbaNodeResonance {
    pub bimba_coordinate: String,
    pub primary_designation: String,
    pub canonical_content: Vec<Value>,
    pub resonance_contributions: Vec<Vec<f32>>,
    pub target_resonance_vector: Option<Vec<f32>>,
    pub last_updated_unix_ms: u64,
    pub contribution_count: usize,
    pub bootstrap_status: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CorpusSnapshot {
    schema_version: u16,
    corpus_snapshot_id: String,
    created_unix_ms: u64,
    document_count: usize,
    training_pair_count: usize,
    bimba_node_count: usize,
    latest_checkpoint_id: Option<String>,
    training_pairs: Vec<TrainingPair>,
    bimba_nodes: Vec<BimbaNodeResonance>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CheckpointMetadata {
    schema_version: u16,
    architecture: String,
    variant_id: String,
    channel_set: Vec<String>,
    created_unix_ms: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RuntimeConfig {
    latent_dim: usize,
    channel_encoder_width: usize,
    attention_width: usize,
    mirror_tolerance: f32,
    energy_weight: f32,
    variant_id: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RuntimeWeights {
    attention_weights: Vec<f32>,
    head_weights: Vec<Vec<f32>>,
    head_bias: Vec<f32>,
    bio_projection: Vec<Vec<f32>>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RuntimeCheckpoint {
    metadata: CheckpointMetadata,
    config: RuntimeConfig,
    weights: RuntimeWeights,
    corpus_snapshot_uri: String,
}

impl ResonanceCorpusStore {
    pub fn new(root: impl AsRef<Path>) -> Self {
        Self {
            root: root.as_ref().to_path_buf(),
        }
    }

    pub fn record_training_pair(&self, input: TrainingPairInput) -> Result<TrainingPair, String> {
        validate_training_pair_input(&input)?;
        let mut state = self.load_state()?;
        let now = now_ms();
        upsert_document(&mut state, &input, now);
        let pair = TrainingPair {
            pair_id: stable_pair_id(&input),
            document_id: input.document_id,
            document_path: input.document_path,
            bimba_coordinate: input.bimba_coordinate,
            content_hash: input.content_hash,
            resonance_vector: input.resonance_vector,
            profile_snapshot: input.profile_snapshot,
            created_unix_ms: now,
        };
        state
            .training_pairs
            .retain(|existing| existing.pair_id != pair.pair_id);
        state.training_pairs.push(pair.clone());
        upsert_node_contribution(&mut state, &pair, now);
        self.save_state(&state)?;
        Ok(pair)
    }

    pub fn training_plan(&self, config: EbmTrainingConfig) -> Result<TrainingPlan, String> {
        config.validate()?;
        let state = self.load_state()?;
        let snapshot = build_snapshot(&state);
        let eligible_pairs = state.training_pairs.len();
        let blocked_pairs = state
            .training_pairs
            .iter()
            .filter(|pair| !is_valid_vector(&pair.resonance_vector))
            .count();
        let usable_pairs = eligible_pairs.saturating_sub(blocked_pairs);
        let validation_pairs = validation_count(usable_pairs, config.validation_split);
        Ok(TrainingPlan {
            eligible_pairs,
            blocked_pairs,
            training_pairs: usable_pairs.saturating_sub(validation_pairs),
            validation_pairs,
            corpus_snapshot_id: snapshot.corpus_snapshot_id.clone(),
            corpus_snapshot_uri: corpus_snapshot_uri(&snapshot.corpus_snapshot_id),
            latest_checkpoint_id: state.latest_checkpoint_id,
            manual_invocation_required: true,
        })
    }

    pub fn train_ebm(&self, request: TrainEbmRequest) -> Result<TrainEbmReport, String> {
        request.config.validate()?;
        let mut state = self.load_state()?;
        let plan = self.training_plan(request.config.clone())?;
        if plan.blocked_pairs > 0 {
            return Err(format!(
                "{} training pairs have invalid 72-vector shape",
                plan.blocked_pairs
            ));
        }
        if request.dry_run {
            return Ok(TrainEbmReport {
                dry_run: true,
                metrics: None,
                checkpoint_id: None,
                checkpoint_path: None,
                corpus_snapshot_id: plan.corpus_snapshot_id.clone(),
                plan,
            });
        }

        let snapshot = build_snapshot(&state);
        let metrics = validate_fit(&snapshot.training_pairs, &request.config);
        let checkpoint_id = checkpoint_id("trained", &snapshot.corpus_snapshot_id);
        let checkpoint_dir = self.root.join("checkpoints").join(&checkpoint_id);
        fs::create_dir_all(&checkpoint_dir).map_err(|err| {
            format!(
                "failed to create checkpoint dir {}: {err}",
                checkpoint_dir.display()
            )
        })?;
        let checkpoint_path = checkpoint_dir.join(CHECKPOINT_FILE);
        let snapshot_path = checkpoint_dir.join(CORPUS_SNAPSHOT_FILE);
        let metadata_path = checkpoint_dir.join(EXPORT_METADATA_FILE);
        write_json(&snapshot_path, &snapshot)?;
        let checkpoint = build_checkpoint(
            &request.config,
            &snapshot,
            TrainingState::Trained,
            Some(&metrics),
        )?;
        write_json(&checkpoint_path, &checkpoint)?;
        write_json(
            &metadata_path,
            &export_metadata(
                &checkpoint_id,
                &snapshot,
                TrainingState::Trained,
                Some(&metrics),
                &checkpoint_path,
            ),
        )?;
        state.latest_checkpoint_id = Some(checkpoint_id.clone());
        self.save_state(&state)?;

        Ok(TrainEbmReport {
            dry_run: false,
            plan,
            metrics: Some(metrics),
            checkpoint_id: Some(checkpoint_id),
            checkpoint_path: Some(checkpoint_path),
            corpus_snapshot_id: snapshot.corpus_snapshot_id,
        })
    }

    pub fn export_ebm_state(
        &self,
        destination: impl AsRef<Path>,
        config: EbmTrainingConfig,
    ) -> Result<ExportedEbmState, String> {
        config.validate()?;
        let state = self.load_state()?;
        let snapshot = build_snapshot(&state);
        let destination = destination.as_ref();
        fs::create_dir_all(destination).map_err(|err| {
            format!(
                "failed to create export directory {}: {err}",
                destination.display()
            )
        })?;

        let checkpoint_path = destination.join(CHECKPOINT_FILE);
        let metadata_path = destination.join(EXPORT_METADATA_FILE);
        let corpus_snapshot_path = destination.join(CORPUS_SNAPSHOT_FILE);

        if let Some(checkpoint_id) = state.latest_checkpoint_id.clone() {
            let source_dir = self.root.join("checkpoints").join(&checkpoint_id);
            let checkpoint: RuntimeCheckpoint =
                read_json(source_dir.join(CHECKPOINT_FILE), "trained checkpoint")?;
            let trained_snapshot: CorpusSnapshot = read_json(
                source_dir.join(CORPUS_SNAPSHOT_FILE),
                "trained corpus snapshot",
            )?;
            let mut metadata: Value = read_json(
                source_dir.join(EXPORT_METADATA_FILE),
                "trained checkpoint metadata",
            )?;
            let expected_uri = corpus_snapshot_uri(&trained_snapshot.corpus_snapshot_id);
            if checkpoint.corpus_snapshot_uri != expected_uri {
                return Err(
                    "trained checkpoint does not match its paired corpus snapshot".to_owned(),
                );
            }
            metadata["checkpointPath"] = Value::String(checkpoint_path.display().to_string());
            write_json(&checkpoint_path, &checkpoint)?;
            write_json(&corpus_snapshot_path, &trained_snapshot)?;
            write_json(&metadata_path, &metadata)?;
            return Ok(ExportedEbmState {
                checkpoint_id,
                corpus_snapshot_id: trained_snapshot.corpus_snapshot_id,
                checkpoint_path,
                metadata_path,
                corpus_snapshot_path,
            });
        }

        let checkpoint_id = checkpoint_id("bootstrap", &snapshot.corpus_snapshot_id);
        write_json(&corpus_snapshot_path, &snapshot)?;

        let training_state = TrainingState::BootstrapUntrained;
        let checkpoint = build_checkpoint(&config, &snapshot, training_state, None)?;
        write_json(&checkpoint_path, &checkpoint)?;
        write_json(
            &metadata_path,
            &export_metadata(
                &checkpoint_id,
                &snapshot,
                training_state,
                None,
                &checkpoint_path,
            ),
        )?;

        Ok(ExportedEbmState {
            checkpoint_id,
            corpus_snapshot_id: snapshot.corpus_snapshot_id,
            checkpoint_path,
            metadata_path,
            corpus_snapshot_path,
        })
    }

    fn load_state(&self) -> Result<ResonanceCorpusState, String> {
        let path = self.root.join(STORE_FILE);
        if !path.exists() {
            return Ok(ResonanceCorpusState::default());
        }
        let file =
            File::open(&path).map_err(|err| format!("failed to open {}: {err}", path.display()))?;
        serde_json::from_reader(file)
            .map_err(|err| format!("failed to parse {}: {err}", path.display()))
    }

    fn save_state(&self, state: &ResonanceCorpusState) -> Result<(), String> {
        fs::create_dir_all(&self.root).map_err(|err| {
            format!(
                "failed to create corpus root {}: {err}",
                self.root.display()
            )
        })?;
        write_json(self.root.join(STORE_FILE), state)
    }
}

#[derive(Debug, Clone, Copy)]
enum TrainingState {
    BootstrapUntrained,
    Trained,
}

impl TrainingState {
    fn as_str(self) -> &'static str {
        match self {
            Self::BootstrapUntrained => "bootstrap-untrained",
            Self::Trained => "trained",
        }
    }
}

fn validate_training_pair_input(input: &TrainingPairInput) -> Result<(), String> {
    if input.document_id.trim().is_empty() {
        return Err("document_id is required".to_owned());
    }
    if input.document_path.trim().is_empty() {
        return Err("document_path is required".to_owned());
    }
    if input.bimba_coordinate.trim().is_empty() {
        return Err("bimba_coordinate is required".to_owned());
    }
    if input.content_hash.trim().is_empty() {
        return Err("content_hash is required".to_owned());
    }
    if !is_valid_vector(&input.resonance_vector) {
        return Err("resonance_vector must contain exactly 72 finite values in [0, 1]".to_owned());
    }
    Ok(())
}

fn is_valid_vector(vector: &[f32]) -> bool {
    vector.len() == RESONANCE_VECTOR_DIMENSIONS
        && vector
            .iter()
            .all(|value| value.is_finite() && (0.0..=1.0).contains(value))
}

fn upsert_document(state: &mut ResonanceCorpusState, input: &TrainingPairInput, now: u64) {
    if let Some(document) = state
        .documents
        .iter_mut()
        .find(|document| document.document_id == input.document_id)
    {
        document.document_path = input.document_path.clone();
        document.content_hash = input.content_hash.clone();
        document.last_updated_unix_ms = now;
        if !document
            .target_coordinates
            .iter()
            .any(|coord| coord == &input.bimba_coordinate)
        {
            document
                .target_coordinates
                .push(input.bimba_coordinate.clone());
        }
        document.ingestion_status = "analysed".to_owned();
        return;
    }

    state.documents.push(CorpusDocument {
        document_id: input.document_id.clone(),
        document_path: input.document_path.clone(),
        content_hash: input.content_hash.clone(),
        ingestion_status: "analysed".to_owned(),
        target_coordinates: vec![input.bimba_coordinate.clone()],
        last_updated_unix_ms: now,
    });
}

fn upsert_node_contribution(state: &mut ResonanceCorpusState, pair: &TrainingPair, now: u64) {
    if let Some(node) = state
        .bimba_nodes
        .iter_mut()
        .find(|node| node.bimba_coordinate == pair.bimba_coordinate)
    {
        node.resonance_contributions
            .push(pair.resonance_vector.clone());
        node.contribution_count = node.resonance_contributions.len();
        node.target_resonance_vector = Some(mean_vector(&node.resonance_contributions));
        node.last_updated_unix_ms = now;
        node.bootstrap_status = if node.contribution_count >= 6 {
            "mature".to_owned()
        } else {
            "developing".to_owned()
        };
        return;
    }

    state.bimba_nodes.push(BimbaNodeResonance {
        bimba_coordinate: pair.bimba_coordinate.clone(),
        primary_designation: pair.bimba_coordinate.clone(),
        canonical_content: Vec::new(),
        resonance_contributions: vec![pair.resonance_vector.clone()],
        target_resonance_vector: Some(pair.resonance_vector.clone()),
        last_updated_unix_ms: now,
        contribution_count: 1,
        bootstrap_status: "developing".to_owned(),
    });
}

fn mean_vector(vectors: &[Vec<f32>]) -> Vec<f32> {
    let mut mean = vec![0.0; RESONANCE_VECTOR_DIMENSIONS];
    for vector in vectors {
        for (slot, value) in mean.iter_mut().zip(vector.iter()) {
            *slot += *value;
        }
    }
    if !vectors.is_empty() {
        for slot in mean.iter_mut() {
            *slot /= vectors.len() as f32;
        }
    }
    mean
}

fn build_snapshot(state: &ResonanceCorpusState) -> CorpusSnapshot {
    let mut training_pairs = state.training_pairs.clone();
    training_pairs.sort_by(|a, b| a.pair_id.cmp(&b.pair_id));
    let mut bimba_nodes = state.bimba_nodes.clone();
    bimba_nodes.sort_by(|a, b| a.bimba_coordinate.cmp(&b.bimba_coordinate));
    let id = corpus_snapshot_id(&training_pairs, &bimba_nodes);
    CorpusSnapshot {
        schema_version: 1,
        corpus_snapshot_id: id,
        created_unix_ms: now_ms(),
        document_count: state.documents.len(),
        training_pair_count: training_pairs.len(),
        bimba_node_count: bimba_nodes.len(),
        latest_checkpoint_id: state.latest_checkpoint_id.clone(),
        training_pairs,
        bimba_nodes,
    }
}

fn validate_fit(pairs: &[TrainingPair], config: &EbmTrainingConfig) -> ValidationMetrics {
    let validation_pairs = validation_count(pairs.len(), config.validation_split);
    let start = pairs.len().saturating_sub(validation_pairs);
    let validation = if validation_pairs > 0 {
        &pairs[start..]
    } else {
        pairs
    };
    let means = square_means(pairs);
    let prediction = square_prediction(&means);
    let mut total_mse = 0.0;
    let mut square_mse = [0.0f32; 3];
    let mut mirror_loss = 0.0;

    for pair in validation {
        total_mse += mse(&prediction, &pair.resonance_vector);
        for square in 0..3 {
            square_mse[square] += mse_for_indexes(&prediction, &pair.resonance_vector, square);
        }
        mirror_loss += mirror_consistency_loss(&pair.resonance_vector);
    }
    let denom = validation.len().max(1) as f32;
    ValidationMetrics {
        validation_mse: total_mse / denom,
        square_1_mse: square_mse[0] / denom,
        square_2_mse: square_mse[1] / denom,
        square_3_mse: square_mse[2] / denom,
        mirror_consistency_loss: mirror_loss / denom,
        cross_channel_coherence_loss: 0.0,
    }
}

fn build_checkpoint(
    config: &EbmTrainingConfig,
    snapshot: &CorpusSnapshot,
    training_state: TrainingState,
    metrics: Option<&ValidationMetrics>,
) -> Result<RuntimeCheckpoint, String> {
    config.validate()?;
    Ok(RuntimeCheckpoint {
        metadata: CheckpointMetadata {
            schema_version: EBM_CHECKPOINT_SCHEMA_VERSION,
            architecture: EBM_ARCHITECTURE.to_owned(),
            variant_id: config.variant_id.clone(),
            channel_set: CANONICAL_CHANNEL_SET
                .iter()
                .map(|channel| (*channel).to_owned())
                .collect(),
            created_unix_ms: now_ms(),
        },
        config: RuntimeConfig {
            latent_dim: config.latent_dim,
            channel_encoder_width: config.channel_encoder_width,
            attention_width: config.attention_width,
            mirror_tolerance: config.mirror_tolerance,
            energy_weight: config.energy_weight,
            variant_id: config.variant_id.clone(),
        },
        weights: match training_state {
            TrainingState::BootstrapUntrained => {
                seeded_weights(config, &snapshot.corpus_snapshot_id)
            }
            TrainingState::Trained => fitted_weights(config, &snapshot.training_pairs, metrics),
        },
        corpus_snapshot_uri: corpus_snapshot_uri(&snapshot.corpus_snapshot_id),
    })
}

fn seeded_weights(config: &EbmTrainingConfig, corpus_snapshot_id: &str) -> RuntimeWeights {
    let mut generator = DeterministicGenerator::new(stable_hash(&[
        &config.variant_id,
        corpus_snapshot_id,
        "bootstrap",
    ]));
    RuntimeWeights {
        attention_weights: CANONICAL_CHANNEL_SET
            .iter()
            .map(|_| generator.next_unit() + 0.5)
            .collect(),
        head_weights: (0..3)
            .map(|_| {
                (0..config.latent_dim)
                    .map(|_| generator.next_signed())
                    .collect()
            })
            .collect(),
        head_bias: (0..3).map(|_| generator.next_signed() * 0.2).collect(),
        bio_projection: (0..4)
            .map(|_| {
                (0..config.latent_dim)
                    .map(|_| generator.next_signed())
                    .collect()
            })
            .collect(),
    }
}

fn fitted_weights(
    config: &EbmTrainingConfig,
    pairs: &[TrainingPair],
    metrics: Option<&ValidationMetrics>,
) -> RuntimeWeights {
    let means = square_means(pairs);
    let metric_scale = metrics
        .map(|m| (1.0 - m.validation_mse).clamp(0.1, 1.0))
        .unwrap_or(1.0);
    let mut weights = seeded_weights(config, &corpus_snapshot_id(pairs, &[]));
    for (head_index, head) in weights.head_weights.iter_mut().enumerate() {
        let mean = means[head_index].clamp(0.0001, 0.9999);
        for (index, slot) in head.iter_mut().enumerate() {
            let phase = ((index + 1) as f32 * (head_index + 1) as f32).sin();
            *slot = phase * mean * metric_scale;
        }
        weights.head_bias[head_index] = logit(mean);
    }
    for (index, slot) in weights.attention_weights.iter_mut().enumerate() {
        *slot = 1.0 + (index as f32 * 0.03125) + metric_scale * 0.25;
    }
    weights
}

fn export_metadata(
    checkpoint_id: &str,
    snapshot: &CorpusSnapshot,
    training_state: TrainingState,
    metrics: Option<&ValidationMetrics>,
    checkpoint_path: &Path,
) -> Value {
    serde_json::json!({
        "schemaVersion": 1,
        "checkpointId": checkpoint_id,
        "corpusSnapshotId": snapshot.corpus_snapshot_id,
        "corpusSnapshotUri": corpus_snapshot_uri(&snapshot.corpus_snapshot_id),
        "trainingState": training_state.as_str(),
        "trainingPairCount": snapshot.training_pair_count,
        "documentCount": snapshot.document_count,
        "bimbaNodeCount": snapshot.bimba_node_count,
        "checkpointPath": checkpoint_path,
        "validationMetrics": metrics,
        "createdUnixMs": now_ms(),
        "manualTrainingAct": true
    })
}

fn square_means(pairs: &[TrainingPair]) -> [f32; 3] {
    if pairs.is_empty() {
        return [0.0; 3];
    }
    let mut sums = [0.0f32; 3];
    let mut counts = [0usize; 3];
    for pair in pairs {
        for square in 0..3 {
            for index in square_indexes(square) {
                sums[square] += pair.resonance_vector[index];
                counts[square] += 1;
            }
        }
    }
    [
        sums[0] / counts[0].max(1) as f32,
        sums[1] / counts[1].max(1) as f32,
        sums[2] / counts[2].max(1) as f32,
    ]
}

fn square_prediction(means: &[f32; 3]) -> Vec<f32> {
    let mut prediction = vec![0.0; RESONANCE_VECTOR_DIMENSIONS];
    for square in 0..3 {
        for index in square_indexes(square) {
            prediction[index] = means[square];
        }
    }
    prediction
}

fn square_indexes(square: usize) -> Vec<usize> {
    match square {
        0 => (0..12).chain(60..72).collect(),
        1 => (12..24).chain(48..60).collect(),
        2 => (24..48).collect(),
        _ => Vec::new(),
    }
}

fn mse(predicted: &[f32], target: &[f32]) -> f32 {
    predicted
        .iter()
        .zip(target.iter())
        .map(|(a, b)| {
            let delta = a - b;
            delta * delta
        })
        .sum::<f32>()
        / predicted.len().max(1) as f32
}

fn mse_for_indexes(predicted: &[f32], target: &[f32], square: usize) -> f32 {
    let indexes = square_indexes(square);
    indexes
        .iter()
        .map(|index| {
            let delta = predicted[*index] - target[*index];
            delta * delta
        })
        .sum::<f32>()
        / indexes.len().max(1) as f32
}

fn mirror_consistency_loss(vector: &[f32]) -> f32 {
    if vector.len() != RESONANCE_VECTOR_DIMENSIONS {
        return 1.0;
    }
    let mut loss = 0.0;
    let mut count = 0usize;
    for lens_anchor in 0..12 {
        for position in 0..3 {
            let left = vector[lens_anchor * 6 + position];
            let right = vector[lens_anchor * 6 + (5 - position)];
            loss += (left - right).abs();
            count += 1;
        }
    }
    loss / count.max(1) as f32
}

fn validation_count(pair_count: usize, split: f32) -> usize {
    if pair_count <= 1 {
        0
    } else {
        ((pair_count as f32 * split).ceil() as usize).clamp(1, pair_count - 1)
    }
}

fn stable_pair_id(input: &TrainingPairInput) -> String {
    format!(
        "pair-{:016x}",
        stable_hash(&[
            &input.document_id,
            &input.bimba_coordinate,
            &input.content_hash
        ])
    )
}

fn corpus_snapshot_id(pairs: &[TrainingPair], nodes: &[BimbaNodeResonance]) -> String {
    let mut parts = Vec::new();
    for pair in pairs {
        parts.push(pair.pair_id.as_str());
        parts.push(pair.content_hash.as_str());
    }
    for node in nodes {
        parts.push(node.bimba_coordinate.as_str());
        parts.push(node.bootstrap_status.as_str());
    }
    format!("corpus-{:016x}", stable_hash(&parts))
}

fn corpus_snapshot_uri(id: &str) -> String {
    format!("resonance-corpus://snapshot/{id}")
}

fn checkpoint_id(prefix: &str, snapshot_id: &str) -> String {
    format!(
        "{prefix}-{}-{}",
        compact_timestamp(),
        &snapshot_id[0..snapshot_id.len().min(16)]
    )
}

fn stable_hash(parts: &[&str]) -> u64 {
    let mut hasher = DefaultHasher::new();
    for part in parts {
        part.hash(&mut hasher);
    }
    hasher.finish()
}

fn write_json(path: impl AsRef<Path>, value: &impl Serialize) -> Result<(), String> {
    if let Some(parent) = path.as_ref().parent() {
        fs::create_dir_all(parent)
            .map_err(|err| format!("failed to create {}: {err}", parent.display()))?;
    }
    let file = File::create(path.as_ref())
        .map_err(|err| format!("failed to create {}: {err}", path.as_ref().display()))?;
    serde_json::to_writer_pretty(file, value)
        .map_err(|err| format!("failed to write {}: {err}", path.as_ref().display()))
}

fn read_json<T: for<'de> Deserialize<'de>>(
    path: impl AsRef<Path>,
    artifact: &str,
) -> Result<T, String> {
    let file = File::open(path.as_ref()).map_err(|err| {
        format!(
            "failed to open {artifact} {}: {err}",
            path.as_ref().display()
        )
    })?;
    serde_json::from_reader(file).map_err(|err| {
        format!(
            "failed to parse {artifact} {}: {err}",
            path.as_ref().display()
        )
    })
}

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as u64)
        .unwrap_or(0)
}

fn compact_timestamp() -> String {
    now_ms().to_string()
}

fn logit(value: f32) -> f32 {
    (value / (1.0 - value)).ln()
}

struct DeterministicGenerator {
    state: u64,
}

impl DeterministicGenerator {
    fn new(seed: u64) -> Self {
        Self { state: seed.max(1) }
    }

    fn next_unit(&mut self) -> f32 {
        self.state = self
            .state
            .wrapping_mul(6364136223846793005)
            .wrapping_add(1442695040888963407);
        let value = (self.state >> 40) as u32;
        value as f32 / ((1u32 << 24) - 1) as f32
    }

    fn next_signed(&mut self) -> f32 {
        self.next_unit() * 2.0 - 1.0
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn vector(seed: f32) -> Vec<f32> {
        (0..72)
            .map(|index| ((index as f32 + seed) % 72.0) / 72.0)
            .collect()
    }

    #[test]
    fn dry_run_training_plan_counts_real_pairs_without_writing_checkpoint() {
        let temp = tempfile::tempdir().expect("tempdir");
        let store = ResonanceCorpusStore::new(temp.path());

        store
            .record_training_pair(TrainingPairInput {
                document_id: "doc-one".to_owned(),
                document_path: "corpus/doc-one.md".to_owned(),
                bimba_coordinate: "#2-1-0".to_owned(),
                content_hash: "hash-one".to_owned(),
                resonance_vector: vector(1.0),
                profile_snapshot: serde_json::json!({"tick": 1}),
            })
            .expect("record first pair");
        store
            .record_training_pair(TrainingPairInput {
                document_id: "doc-two".to_owned(),
                document_path: "corpus/doc-two.md".to_owned(),
                bimba_coordinate: "#2-1-5".to_owned(),
                content_hash: "hash-two".to_owned(),
                resonance_vector: vector(5.0),
                profile_snapshot: serde_json::json!({"tick": 2}),
            })
            .expect("record second pair");

        let report = store
            .train_ebm(TrainEbmRequest {
                dry_run: true,
                config: EbmTrainingConfig::default(),
            })
            .expect("dry-run report");

        assert!(report.dry_run);
        assert_eq!(report.plan.eligible_pairs, 2);
        assert_eq!(report.plan.training_pairs, 1);
        assert_eq!(report.plan.validation_pairs, 1);
        assert!(report.checkpoint_id.is_none());
        assert!(!temp.path().join("checkpoints").exists());
    }

    #[test]
    fn export_writes_checkpoint_metadata_and_paired_corpus_snapshot() {
        let temp = tempfile::tempdir().expect("tempdir");
        let export_dir = temp.path().join("snapshot");
        let store = ResonanceCorpusStore::new(temp.path().join("corpus"));

        store
            .record_training_pair(TrainingPairInput {
                document_id: "doc-one".to_owned(),
                document_path: "corpus/doc-one.md".to_owned(),
                bimba_coordinate: "#2-1-0".to_owned(),
                content_hash: "hash-one".to_owned(),
                resonance_vector: vector(1.0),
                profile_snapshot: serde_json::json!({"tick": 1}),
            })
            .expect("record pair");

        let exported = store
            .export_ebm_state(&export_dir, EbmTrainingConfig::default())
            .expect("export state");

        assert!(exported.checkpoint_path.exists());
        assert!(exported.metadata_path.exists());
        assert!(exported.corpus_snapshot_path.exists());

        let metadata: serde_json::Value = serde_json::from_str(
            &std::fs::read_to_string(&exported.metadata_path).expect("metadata file"),
        )
        .expect("metadata json");
        assert_eq!(metadata["checkpointId"], exported.checkpoint_id);
        assert_eq!(metadata["corpusSnapshotId"], exported.corpus_snapshot_id);
        assert_eq!(metadata["trainingPairCount"], 1);
        assert_eq!(metadata["trainingState"], "bootstrap-untrained");
    }

    #[cfg(feature = "resonance_ebm")]
    #[test]
    fn exported_checkpoint_round_trips_into_resonance_ebm_runtime() {
        use crate::resonance_ebm::{
            CheckpointLoadPolicy, EbmCheckpoint, ResonanceEbmConfig, ResonanceEbmRuntime,
        };

        let temp = tempfile::tempdir().expect("tempdir");
        let export_dir = temp.path().join("snapshot");
        let store = ResonanceCorpusStore::new(temp.path().join("corpus"));

        store
            .record_training_pair(TrainingPairInput {
                document_id: "doc-one".to_owned(),
                document_path: "corpus/doc-one.md".to_owned(),
                bimba_coordinate: "#2-1-0".to_owned(),
                content_hash: "hash-one".to_owned(),
                resonance_vector: vector(1.0),
                profile_snapshot: serde_json::json!({"tick": 1}),
            })
            .expect("record pair");

        let exported = store
            .export_ebm_state(&export_dir, EbmTrainingConfig::default())
            .expect("export state");

        let checkpoint = EbmCheckpoint::load(&exported.checkpoint_path).expect("load checkpoint");
        checkpoint.validate().expect("valid runtime checkpoint");
        let config =
            ResonanceEbmConfig::from_checkpoint(&exported.checkpoint_path).expect("config load");
        ResonanceEbmRuntime::load(config, CheckpointLoadPolicy::RequireCheckpoint)
            .expect("runtime load");
    }

    #[test]
    fn trained_export_preserves_exact_checkpoint_and_paired_snapshot() {
        let temp = tempfile::tempdir().expect("tempdir");
        let store = ResonanceCorpusStore::new(temp.path().join("corpus"));
        for seed in [1.0, 5.0] {
            store
                .record_training_pair(TrainingPairInput {
                    document_id: format!("doc-{seed}"),
                    document_path: format!("corpus/doc-{seed}.md"),
                    bimba_coordinate: format!("#2-1-{}", seed as usize),
                    content_hash: format!("hash-{seed}"),
                    resonance_vector: vector(seed),
                    profile_snapshot: serde_json::json!({"tick": seed}),
                })
                .expect("record training pair");
        }
        let trained = store
            .train_ebm(TrainEbmRequest {
                dry_run: false,
                config: EbmTrainingConfig::default(),
            })
            .expect("train checkpoint");
        let trained_path = trained.checkpoint_path.expect("trained path");
        let trained_checkpoint: Value =
            read_json(&trained_path, "trained checkpoint").expect("read trained checkpoint");
        let trained_snapshot_path = trained_path
            .parent()
            .expect("checkpoint dir")
            .join(CORPUS_SNAPSHOT_FILE);
        let trained_snapshot: Value =
            read_json(&trained_snapshot_path, "trained snapshot").expect("read trained snapshot");

        store
            .record_training_pair(TrainingPairInput {
                document_id: "doc-after-training".to_owned(),
                document_path: "corpus/doc-after-training.md".to_owned(),
                bimba_coordinate: "#2-1-3".to_owned(),
                content_hash: "hash-after-training".to_owned(),
                resonance_vector: vector(3.0),
                profile_snapshot: serde_json::json!({"tick": 3}),
            })
            .expect("mutate corpus after training");

        let export_dir = temp.path().join("export");
        let exported = store
            .export_ebm_state(&export_dir, EbmTrainingConfig::default())
            .expect("export trained state");
        let exported_checkpoint: Value =
            read_json(&exported.checkpoint_path, "exported checkpoint")
                .expect("read exported checkpoint");
        let exported_snapshot: Value =
            read_json(&exported.corpus_snapshot_path, "exported snapshot")
                .expect("read exported snapshot");
        let exported_metadata: Value = read_json(&exported.metadata_path, "exported metadata")
            .expect("read exported metadata");

        assert_eq!(exported_checkpoint, trained_checkpoint);
        assert_eq!(exported_snapshot, trained_snapshot);
        assert_eq!(exported.corpus_snapshot_id, trained.corpus_snapshot_id);
        assert_eq!(exported_metadata["trainingState"], "trained");
        assert_eq!(
            exported_metadata["checkpointPath"],
            exported.checkpoint_path.display().to_string()
        );
    }
}
