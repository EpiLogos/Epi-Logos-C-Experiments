//! N-channel encoding for the position-5' EBM.
//!
//! The canonical channel set and the raw per-channel feature extractors are
//! S0-owned (`portal_core::kernel::harmonic_channels`) — the profile's own
//! concern, shared with the kernel's deterministic E₅ reading so both consumers
//! score the identical substrate. This module only adds the EBM's learned
//! encoding (`ChannelEmbedding`) on top of that shared raw substrate.

use portal_core::kernel::harmonic_channels::{normalise_channel, raw_profile_channels};
use portal_core::MathemeHarmonicProfile;

use super::model::ResonanceEbmConfig;

// Re-export the S0-owned canonical channel identifiers so existing consumers
// (`super::channels::CANONICAL_CHANNEL_SET`, the `resonance_ebm` glob) resolve
// unchanged against the single source of truth.
pub use portal_core::kernel::harmonic_channels::{
    CANONICAL_CHANNEL_SET, CHANNEL_AUDIO_OCTET, CHANNEL_CODON_ROTATION, CHANNEL_LENS_RESONANCE_72,
    CHANNEL_MAHAMAYA, CHANNEL_NODAL_QUARTET, CHANNEL_PLANETARY_CHAKRAL, CHANNEL_Q_COSMIC,
};

#[derive(Debug, Clone, PartialEq)]
pub struct ChannelEmbedding {
    pub name: String,
    pub values: Vec<f32>,
}

pub fn encode_profile_channels(
    profile: &MathemeHarmonicProfile,
    config: &ResonanceEbmConfig,
) -> Result<Vec<ChannelEmbedding>, String> {
    config.validate()?;
    Ok(raw_profile_channels(profile)
        .into_iter()
        .map(|(name, raw)| ChannelEmbedding {
            name: name.to_owned(),
            values: encode_raw_channel(&raw, config.latent_dim, config.channel_encoder_width),
        })
        .collect())
}

fn encode_raw_channel(raw: &[f32], latent_dim: usize, channel_encoder_width: usize) -> Vec<f32> {
    let normalized = normalise_channel(raw);
    (0..latent_dim)
        .map(|latent_idx| {
            let mut sum = 0.0f32;
            let mut count = 0.0f32;
            for width_idx in 0..channel_encoder_width {
                let raw_idx = (latent_idx + width_idx) % normalized.len();
                let phase = ((latent_idx + 1) * (width_idx + 1)) as f32;
                sum += normalized[raw_idx] * (phase.sin() + 1.5);
                count += 1.0;
            }
            sigmoid(sum / count)
        })
        .collect()
}

fn sigmoid(value: f32) -> f32 {
    1.0 / (1.0 + (-value).exp())
}
