//! Canonical N-channel encoders over `portal-core::MathemeHarmonicProfile`.

use portal_core::MathemeHarmonicProfile;

use super::model::ResonanceEbmConfig;

pub const CHANNEL_LENS_RESONANCE_72: &str = "lens_resonance_72";
pub const CHANNEL_AUDIO_OCTET: &str = "audio_octet";
pub const CHANNEL_NODAL_QUARTET: &str = "nodal_quartet";
pub const CHANNEL_PLANETARY_CHAKRAL: &str = "planetary_chakral";
pub const CHANNEL_MAHAMAYA: &str = "mahamaya";
pub const CHANNEL_CODON_ROTATION: &str = "codon_rotation_projection";
pub const CHANNEL_Q_COSMIC: &str = "q_cosmic";

pub const CANONICAL_CHANNEL_SET: [&str; 7] = [
    CHANNEL_LENS_RESONANCE_72,
    CHANNEL_AUDIO_OCTET,
    CHANNEL_NODAL_QUARTET,
    CHANNEL_PLANETARY_CHAKRAL,
    CHANNEL_MAHAMAYA,
    CHANNEL_CODON_ROTATION,
    CHANNEL_Q_COSMIC,
];

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
    let raw_channels = vec![
        (CHANNEL_LENS_RESONANCE_72, lens_resonance_features(profile)),
        (CHANNEL_AUDIO_OCTET, profile.audio_octet.to_vec()),
        (CHANNEL_NODAL_QUARTET, nodal_quartet_features(profile)),
        (
            CHANNEL_PLANETARY_CHAKRAL,
            planetary_chakral_features(profile),
        ),
        (CHANNEL_MAHAMAYA, mahamaya_features(profile)),
        (CHANNEL_CODON_ROTATION, codon_rotation_features(profile)),
        (CHANNEL_Q_COSMIC, profile.q_cosmic.to_vec()),
    ];

    Ok(raw_channels
        .into_iter()
        .map(|(name, raw)| ChannelEmbedding {
            name: name.to_owned(),
            values: encode_raw_channel(&raw, config.latent_dim, config.channel_encoder_width),
        })
        .collect())
}

fn lens_resonance_features(profile: &MathemeHarmonicProfile) -> Vec<f32> {
    let resonance = profile.resonance72;
    vec![
        resonance.legacy_resonance_index as f32 / 71.0,
        resonance.lens_anchor_index as f32 / 71.0,
        resonance.base_lens as f32 / 11.0,
        resonance.helix_bit as f32,
        resonance.lens_anchor as f32 / 11.0,
        resonance.position as f32 / 5.0,
    ]
}

fn nodal_quartet_features(profile: &MathemeHarmonicProfile) -> Vec<f32> {
    let mut values = Vec::with_capacity(16);
    for node in profile.nodal_quartet.iter() {
        values.push(node.ql_position as f32 / 5.0);
        values.push(stable_string_unit(&node.helix));
        values.push(node.m as f32 / 11.0);
        values.push(node.n as f32 / 11.0);
    }
    values
}

fn planetary_chakral_features(profile: &MathemeHarmonicProfile) -> Vec<f32> {
    let planetary = &profile.planetary_chakral;
    vec![
        stable_string_unit(&planetary.body),
        stable_string_unit(&planetary.chakra_role),
        stable_string_unit(&planetary.element),
        stable_string_unit(&planetary.musical_role),
        stable_string_unit(&planetary.modal_color),
    ]
}

fn mahamaya_features(profile: &MathemeHarmonicProfile) -> Vec<f32> {
    let binary = &profile.mahamaya;
    let mut values = vec![
        binary.mahamaya_address64.unwrap_or(0) as f32 / 63.0,
        binary.hexagram_id as f32 / 63.0,
        binary.upper_trigram as f32 / 7.0,
        binary.lower_trigram as f32 / 7.0,
        binary.codon_id as f32 / 63.0,
        binary.line_index as f32 / 5.0,
        binary.line_change_operator_address as f32 / 4095.0,
        binary.m2_vibration_index as f32 / 71.0,
        binary.m2_to_m3_symbol as f32 / 255.0,
        if binary.evolutionary_gap { 1.0 } else { 0.0 },
    ];
    values.extend(binary.nucleotide_bits.iter().map(|bit| *bit as f32 / 3.0));
    values
}

fn codon_rotation_features(profile: &MathemeHarmonicProfile) -> Vec<f32> {
    let codon = &profile.codon_rotation_projection;
    vec![
        codon.lens as f32 / 11.0,
        codon.mode as f32 / 6.0,
        codon.surface_index as f32 / 471.0,
        codon.codon_id as f32 / 63.0,
        codon.rotation as f32 / 7.0,
        codon.rotational_state_count as f32 / 8.0,
        codon.rotation_degrees as f32 / 360.0,
        codon.reverse_lens as f32 / 11.0,
        codon.reverse_mode as f32 / 6.0,
        stable_string_unit(&codon.codon_class),
    ]
}

fn encode_raw_channel(raw: &[f32], latent_dim: usize, channel_encoder_width: usize) -> Vec<f32> {
    let normalized = normalize_raw(raw);
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

fn normalize_raw(raw: &[f32]) -> Vec<f32> {
    if raw.is_empty() {
        return vec![0.0];
    }
    let max_abs = raw
        .iter()
        .copied()
        .filter(|value| value.is_finite())
        .map(f32::abs)
        .fold(0.0f32, f32::max)
        .max(1.0);
    raw.iter()
        .map(|value| {
            if value.is_finite() {
                (*value / max_abs).clamp(-1.0, 1.0)
            } else {
                0.0
            }
        })
        .collect()
}

fn stable_string_unit(value: &str) -> f32 {
    let mut hash = 0u32;
    for byte in value.bytes() {
        hash = hash.wrapping_mul(16777619) ^ byte as u32;
    }
    (hash % 10_000) as f32 / 9_999.0
}

fn sigmoid(value: f32) -> f32 {
    1.0 / (1.0 + (-value).exp())
}
