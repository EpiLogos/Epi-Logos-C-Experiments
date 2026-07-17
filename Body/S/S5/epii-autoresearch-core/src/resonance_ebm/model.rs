//! Rust-native EBM architecture for the 72-dimensional resonance head.
//!
//! The runtime executes checkpoint weights with Candle tensors so the module
//! can load, invoke, and differentiate checkpoints without a Python sidecar.
//! The public shape mirrors the
//! locked architecture: parallel channel encoders, swappable cross-channel
//! attention, tritone-symmetric three-sub-head output, sigmoid-normalised
//! 72-vector projection, and a learned bioquaternion embedding projection.

use std::env;
use std::fs;
use std::path::{Path, PathBuf};

use candle_core::{Device, Tensor, Var};
use candle_nn::ops::sigmoid;
use serde::{Deserialize, Serialize};

use super::attention::{CrossChannelAttention, WeightedMeanAttention};
use super::channels::{encode_profile_channels, CANONICAL_CHANNEL_SET};
use super::inference::ResonanceEbmOutput;
use super::kernel_invocation::ElementTickInvocation;
use super::mirror_loss::MirrorConsistencyReport;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResonanceEbmConfig {
    pub latent_dim: usize,
    pub channel_encoder_width: usize,
    pub attention_width: usize,
    pub mirror_tolerance: f32,
    pub energy_weight: f32,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub checkpoint_path: Option<PathBuf>,
    pub variant_id: String,
}

impl ResonanceEbmConfig {
    pub fn load_from_default_path() -> Result<Self, String> {
        let home = env::var("HOME")
            .map_err(|_| "HOME is required to locate ~/.epi-logos/config.toml".to_owned())?;
        Self::load_from_path(Path::new(&home).join(".epi-logos/config.toml"))
    }

    pub fn load_from_path(path: impl AsRef<Path>) -> Result<Self, String> {
        let content = fs::read_to_string(path.as_ref())
            .map_err(|err| format!("failed to read {}: {err}", path.as_ref().display()))?;
        let section = parse_config_section(&content, "ml.parashakti_ebm_head")?;
        let config = Self {
            latent_dim: parse_usize(&section, "latent_dim")?,
            channel_encoder_width: parse_usize(&section, "channel_encoder_width")?,
            attention_width: parse_usize(&section, "attention_width")?,
            mirror_tolerance: parse_f32(&section, "mirror_tolerance")?,
            energy_weight: parse_f32(&section, "energy_weight")?,
            checkpoint_path: parse_optional_path(&section, "checkpoint_path"),
            variant_id: parse_string(&section, "variant_id")?,
        };
        config.validate()?;
        Ok(config)
    }

    pub fn from_checkpoint(path: impl AsRef<Path>) -> Result<Self, String> {
        let mut checkpoint = super::checkpoint::EbmCheckpoint::load(path.as_ref())?;
        checkpoint.config.checkpoint_path = Some(path.as_ref().to_path_buf());
        checkpoint.config.validate()?;
        Ok(checkpoint.config)
    }

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
        if self.variant_id.trim().is_empty() {
            return Err("variant_id is required".to_owned());
        }
        Ok(())
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EbmWeights {
    pub attention_weights: Vec<f32>,
    pub head_weights: Vec<Vec<f32>>,
    pub head_bias: Vec<f32>,
    pub bio_projection: Vec<Vec<f32>>,
}

impl EbmWeights {
    pub fn seeded(config: &ResonanceEbmConfig, corpus_snapshot_uri: &str) -> Result<Self, String> {
        config.validate()?;
        let seed = stable_seed(&[
            &config.variant_id,
            corpus_snapshot_uri,
            &config.latent_dim.to_string(),
            &config.channel_encoder_width.to_string(),
            &config.attention_width.to_string(),
        ]);
        let mut generator = DeterministicGenerator::new(seed);
        let attention_weights = CANONICAL_CHANNEL_SET
            .iter()
            .map(|_| generator.next_unit() + 0.5)
            .collect();
        let head_weights = (0..3)
            .map(|_| {
                (0..config.latent_dim)
                    .map(|_| generator.next_signed())
                    .collect::<Vec<_>>()
            })
            .collect();
        let head_bias = (0..3).map(|_| generator.next_signed() * 0.2).collect();
        let bio_projection = (0..4)
            .map(|_| {
                (0..config.latent_dim)
                    .map(|_| generator.next_signed())
                    .collect::<Vec<_>>()
            })
            .collect();
        Ok(Self {
            attention_weights,
            head_weights,
            head_bias,
            bio_projection,
        })
    }

    pub fn validate(&self, config: &ResonanceEbmConfig) -> Result<(), String> {
        if self.attention_weights.len() != CANONICAL_CHANNEL_SET.len() {
            return Err(format!(
                "attention_weights must have {} entries",
                CANONICAL_CHANNEL_SET.len()
            ));
        }
        if self.head_weights.len() != 3 || self.head_bias.len() != 3 {
            return Err("three tritone sub-heads are required".to_owned());
        }
        for head in self.head_weights.iter() {
            if head.len() != config.latent_dim {
                return Err("head weight length must equal latent_dim".to_owned());
            }
        }
        if self.bio_projection.len() != 4
            || self
                .bio_projection
                .iter()
                .any(|row| row.len() != config.latent_dim)
        {
            return Err("bio_projection must be shaped [4][latent_dim]".to_owned());
        }
        Ok(())
    }
}

pub struct ResonanceEbmModel {
    config: ResonanceEbmConfig,
    weights: EbmWeights,
    attention: Box<dyn CrossChannelAttention>,
}

impl ResonanceEbmModel {
    pub fn new(config: ResonanceEbmConfig, weights: EbmWeights) -> Result<Self, String> {
        config.validate()?;
        weights.validate(&config)?;
        let attention = Box::new(WeightedMeanAttention::new(
            config.variant_id.clone(),
            weights.attention_weights.clone(),
        ));
        Ok(Self {
            config,
            weights,
            attention,
        })
    }

    pub fn evaluate(
        &self,
        invocation: &ElementTickInvocation,
    ) -> Result<ResonanceEbmOutput, String> {
        let channels = encode_profile_channels(&invocation.profile, &self.config)?;
        let fused = self
            .attention
            .fuse(&channels, self.config.attention_width)?;
        let q_p = Tensor::from_slice(&invocation.bioquaternion.q_p, 4, &Device::Cpu)
            .map_err(candle_error)?;
        let (vector_tensor, energy_tensor) =
            self.forward_tensors(&fused, &q_p, invocation.element_tick)?;
        let vector = vector_tensor.to_vec1::<f32>().map_err(candle_error)?;
        let mirror_report =
            MirrorConsistencyReport::evaluate(&vector, self.config.mirror_tolerance);
        mirror_report.assert_invariant()?;
        let energy_scalar = energy_tensor.to_scalar::<f32>().map_err(candle_error)?;
        Ok(ResonanceEbmOutput {
            resonance_vector: vector,
            energy_scalar,
            mirror_report,
            channel_set: channels.into_iter().map(|channel| channel.name).collect(),
            checkpoint_variant_id: self.attention.variant_id().to_owned(),
            checkpoint_loaded: true,
        })
    }

    pub fn gradient_q_p(&self, invocation: &ElementTickInvocation) -> Result<[f32; 4], String> {
        let channels = encode_profile_channels(&invocation.profile, &self.config)?;
        let fused = self
            .attention
            .fuse(&channels, self.config.attention_width)?;
        let q_p = Var::from_slice(&invocation.bioquaternion.q_p, 4, &Device::Cpu)
            .map_err(candle_error)?;
        let (_, energy) = self.forward_tensors(&fused, q_p.as_tensor(), invocation.element_tick)?;
        let gradients = energy.backward().map_err(candle_error)?;
        let values = gradients
            .get(q_p.as_tensor())
            .ok_or_else(|| "Candle backward graph omitted q_p".to_owned())?
            .to_vec1::<f32>()
            .map_err(candle_error)?;
        values
            .try_into()
            .map_err(|_| "Candle q_p gradient must have four components".to_owned())
    }

    fn forward_tensors(
        &self,
        fused: &[f32],
        q_p: &Tensor,
        element_tick: u8,
    ) -> Result<(Tensor, Tensor), String> {
        let device = q_p.device();
        let fused =
            Tensor::from_slice(fused, self.config.latent_dim, device).map_err(candle_error)?;
        let projection = Tensor::from_vec(
            self.weights
                .bio_projection
                .iter()
                .flatten()
                .copied()
                .collect::<Vec<_>>(),
            (4, self.config.latent_dim),
            device,
        )
        .map_err(candle_error)?;
        let bio = q_p
            .unsqueeze(0)
            .and_then(|q| q.matmul(&projection))
            .and_then(|value| value.squeeze(0))
            .and_then(|value| sigmoid(&value))
            .map_err(candle_error)?;
        let latent = (&fused + &bio)
            .and_then(|value| value.affine(0.5, 0.0))
            .map_err(candle_error)?;

        let mut cells = Vec::with_capacity(72);
        for lens_anchor in 0..12 {
            let mut left = Vec::with_capacity(3);
            for pair in 0..3 {
                let weights = Tensor::from_slice(
                    &self.weights.head_weights[pair],
                    self.config.latent_dim,
                    device,
                )
                .map_err(candle_error)?;
                let phase = ((lens_anchor + 1) as f64 * (element_tick as f64 + 1.0)).sin() * 0.1;
                let score = latent
                    .broadcast_mul(&weights)
                    .and_then(|value| value.sum_all())
                    .and_then(|value| {
                        value.affine(
                            1.0 / self.config.latent_dim as f64,
                            self.weights.head_bias[pair] as f64 + phase,
                        )
                    })
                    .and_then(|value| sigmoid(&value))
                    .map_err(candle_error)?;
                left.push(score);
            }
            cells.extend(left.iter().cloned());
            cells.extend(left.into_iter().rev());
        }
        let refs = cells.iter().collect::<Vec<_>>();
        let vector = Tensor::stack(&refs, 0).map_err(candle_error)?;
        let energy = vector
            .sqr()
            .and_then(|value| value.mean_all())
            .and_then(|value| value.affine(self.config.energy_weight as f64, 0.0))
            .map_err(candle_error)?;
        Ok((vector, energy))
    }
}

fn candle_error(error: candle_core::Error) -> String {
    format!("Candle EBM backend: {error}")
}

fn parse_config_section(
    content: &str,
    section_name: &str,
) -> Result<Vec<(String, String)>, String> {
    let mut in_section = false;
    let mut values = Vec::new();
    for line in content.lines() {
        let line = line.split('#').next().unwrap_or("").trim();
        if line.is_empty() {
            continue;
        }
        if line.starts_with('[') && line.ends_with(']') {
            in_section = &line[1..line.len() - 1] == section_name;
            continue;
        }
        if in_section {
            if let Some((key, value)) = line.split_once('=') {
                values.push((
                    key.trim().to_owned(),
                    value.trim().trim_matches('"').to_owned(),
                ));
            }
        }
    }
    if values.is_empty() {
        Err(format!("[{section_name}] is required"))
    } else {
        Ok(values)
    }
}

fn parse_usize(section: &[(String, String)], key: &str) -> Result<usize, String> {
    parse_string(section, key)?
        .parse::<usize>()
        .map_err(|err| format!("{key} must be usize: {err}"))
}

fn parse_f32(section: &[(String, String)], key: &str) -> Result<f32, String> {
    parse_string(section, key)?
        .parse::<f32>()
        .map_err(|err| format!("{key} must be f32: {err}"))
}

fn parse_string(section: &[(String, String)], key: &str) -> Result<String, String> {
    section
        .iter()
        .find_map(|(candidate, value)| (candidate == key).then(|| value.clone()))
        .ok_or_else(|| format!("{key} is required in [ml.parashakti_ebm_head]"))
}

fn parse_optional_path(section: &[(String, String)], key: &str) -> Option<PathBuf> {
    section
        .iter()
        .find_map(|(candidate, value)| (candidate == key).then(|| PathBuf::from(value)))
}

fn stable_seed(parts: &[&str]) -> u64 {
    let mut hash = 14_695_981_039_346_656_037u64;
    for part in parts {
        for byte in part.bytes() {
            hash ^= byte as u64;
            hash = hash.wrapping_mul(1_099_511_628_211);
        }
    }
    hash
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
            .wrapping_mul(6_364_136_223_846_793_005)
            .wrapping_add(1);
        ((self.state >> 32) as u32) as f32 / u32::MAX as f32
    }

    fn next_signed(&mut self) -> f32 {
        self.next_unit() * 2.0 - 1.0
    }
}
