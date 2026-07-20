//! Canonical N-channel harmonic encoders over `MathemeHarmonicProfile`.
//!
//! These are pure functions of the S0-owned harmonic profile, so they live in
//! S0 (portal-core) as the single source of truth. Two consumers read them:
//!   * the S0 kernel's deterministic E₅ reading ([`deterministic_substrate_magnitude`]),
//!     and
//!   * the S5 trained N-channel EBM (`epii-autoresearch-core::resonance_ebm`),
//!     which imports these raw extractors down and adds its learned encoding on
//!     top — so the analytic prior and the learned score span the identical
//!     substrate.
//!
//! Personal/PASU data never enters any extractor here — E₅ is harmonic
//! substrate only (the E₄ separation is structural, kernel-spec §1.1).

use crate::MathemeHarmonicProfile;

pub const CHANNEL_LENS_RESONANCE_72: &str = "lens_resonance_72";
pub const CHANNEL_AUDIO_OCTET: &str = "audio_octet";
pub const CHANNEL_NODAL_QUARTET: &str = "nodal_quartet";
pub const CHANNEL_PLANETARY_CHAKRAL: &str = "planetary_chakral";
pub const CHANNEL_MAHAMAYA: &str = "mahamaya";
pub const CHANNEL_CODON_ROTATION: &str = "codon_rotation_projection";
pub const CHANNEL_Q_COSMIC: &str = "q_cosmic";

/// The seven canonical harmonic channels, in fixed order (kernel-spec §1.1).
pub const CANONICAL_CHANNEL_SET: [&str; 7] = [
    CHANNEL_LENS_RESONANCE_72,
    CHANNEL_AUDIO_OCTET,
    CHANNEL_NODAL_QUARTET,
    CHANNEL_PLANETARY_CHAKRAL,
    CHANNEL_MAHAMAYA,
    CHANNEL_CODON_ROTATION,
    CHANNEL_Q_COSMIC,
];

/// Number of canonical harmonic channels.
pub const HARMONIC_CHANNEL_COUNT: usize = CANONICAL_CHANNEL_SET.len();

/// Stable byte-hash of a categorical field to a unit scalar in `[0, 1]`.
pub fn stable_string_unit(value: &str) -> f32 {
    let mut hash = 0u32;
    for byte in value.bytes() {
        hash = hash.wrapping_mul(16_777_619) ^ byte as u32;
    }
    (hash % 10_000) as f32 / 9_999.0
}

/// Scale a channel's raw features into `[-1, 1]` by its own peak magnitude.
/// Empty input collapses to `[0.0]`.
pub fn normalise_channel(raw: &[f32]) -> Vec<f32> {
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
        if binary.round_trip_loss { 1.0 } else { 0.0 },
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

/// The raw (un-encoded) feature vectors for all seven canonical channels, in
/// `CANONICAL_CHANNEL_SET` order. This is the shared substrate: the S0 kernel
/// reduces it to a deterministic magnitude, the S5 EBM encodes and scores it.
pub fn raw_profile_channels(
    profile: &MathemeHarmonicProfile,
) -> [(&'static str, Vec<f32>); HARMONIC_CHANNEL_COUNT] {
    [
        (CHANNEL_LENS_RESONANCE_72, lens_resonance_features(profile)),
        (CHANNEL_AUDIO_OCTET, profile.audio_octet.to_vec()),
        (CHANNEL_NODAL_QUARTET, nodal_quartet_features(profile)),
        (CHANNEL_PLANETARY_CHAKRAL, planetary_chakral_features(profile)),
        (CHANNEL_MAHAMAYA, mahamaya_features(profile)),
        (CHANNEL_CODON_ROTATION, codon_rotation_features(profile)),
        (CHANNEL_Q_COSMIC, profile.q_cosmic.to_vec()),
    ]
}

/// Root-mean-square magnitude of a channel once normalised — its scalar
/// contribution to the deterministic harmonic energy.
pub fn channel_magnitude(raw: &[f32]) -> f32 {
    let normalised = normalise_channel(raw);
    if normalised.is_empty() {
        return 0.0;
    }
    (normalised.iter().map(|value| value * value).sum::<f32>() / normalised.len() as f32).sqrt()
}

/// Per-channel magnitudes over all seven canonical channels, in
/// `CANONICAL_CHANNEL_SET` order.
pub fn harmonic_channel_magnitudes(
    profile: &MathemeHarmonicProfile,
) -> [f32; HARMONIC_CHANNEL_COUNT] {
    let raw = raw_profile_channels(profile);
    core::array::from_fn(|index| channel_magnitude(&raw[index].1))
}

/// The kernel's deterministic E₅ substrate magnitude: the mean harmonic
/// magnitude across ALL seven canonical channels. A genuine reading of the
/// whole harmonic substrate (not a single-channel proxy) — the untrained
/// analytic prior. It is NOT the learned score: the trained N-channel EBM
/// (Stream C, S5 `resonance_ebm`) refines this, and when a checkpoint exists a
/// composition root injects its `energy_scalar` via `E5HarmonicInputs`.
pub fn deterministic_substrate_magnitude(profile: &MathemeHarmonicProfile) -> f32 {
    let magnitudes = harmonic_channel_magnitudes(profile);
    magnitudes.iter().sum::<f32>() / HARMONIC_CHANNEL_COUNT as f32
}
