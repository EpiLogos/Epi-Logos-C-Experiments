//! Coordinate: M0' cross-cutting (produced at S0, consumed M3/M4/M5/M0)
//! Residency: Body/S/S0/portal-core/src/kernel/projections/pentadic_trace.rs
//! Position (#0): the pentadic-content runtime trace — WHAT the system is
//!   computing (0/1 substrate → 5-degree quantum → 72-fold resonance →
//!   64-codon → recognition), Tranche 36.T36.1
//! Actualises: `AnuttaraPentadicRuntimeTrace` per the kernel-bridge interface
//!   (extensions/kernel-bridge/src/common/types.ts) — this is the Rust mirror
//!   of `buildPentadicTrace(profile)`; one law both sides of the wire
//! Public surface: AnuttaraPentadicRuntimeTrace, AnuttaraPentadicRuntimeTrace::from_profile
//! Does NOT own: the epogdoon 8/9 law or 64/360 address law (luts::mahamaya),
//!   the backbone 24x15 step (m3_transcription_bridge), the profile substrate
//!   (kernel::profile), renderer display facts (carrier panes)
//!
//! Anti-greenfield: every field derives from existing MathemeHarmonicProfile
//! payloads and the Mahamaya/M2/M3 helpers. No renderer-local tables.

use serde::{Deserialize, Serialize};

use crate::luts::mahamaya::{is_evolutionary_gap, mahamaya_address64_from_degree};
use crate::m3_transcription_bridge::{M3_BACKBONE_DEGREE_STEP, M3_BACKBONE_NODE_COUNT};

use super::super::profile::MathemeHarmonicProfile;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnuttaraPentadicRuntimeTrace {
    pub tick: u64,
    pub tick12: u8,
    /// 0 = bimba helix, 1 = pratibimba helix (profile.helix string mapped).
    pub helix: u8,
    pub position6: u8,
    /// The M0 substrate marker: tick 0 speaks "0", tick 1 speaks "1", every
    /// later tick carries the non-dual "0/1" (the substrate is present, not
    /// re-performed — Tranche 36.2 tick-substrate law).
    pub source_binary_state: String,
    /// Whole-number addressing endpoint (0→5) of the pentadic hinge.
    pub whole_number_endpoint: u8,
    /// Natural-number addressing endpoint (1→6) of the same hinge.
    pub natural_number_endpoint: u8,
    pub family_b_complement: [u8; 2],
    /// One resonance-72 step is one Shem degree quantum: 72 × 5 = 360.
    pub shem_degree_quantum: u8,
    pub resonance72_index: usize,
    pub degree360: u16,
    /// Epogdoon compression of the resonance index (8/9 law, M2→M3).
    pub m2_to_m3_symbol: u8,
    pub mahamaya_address64: u8,
    pub evolutionary_gap: String,
    pub codon_id: u8,
    pub codon: String,
    pub line_change_operator: u16,
    /// The two fifteens of the Mahamaya backbone, sourced from the M3
    /// transcription-bridge step constants — never a duplicated literal.
    pub paired_mahamaya_fifteens: [u16; 2],
    pub backbone_identity: String,
    pub line_graph_identity: String,
    pub q_cosmic_ref: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub q_composed_handle: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub learned_predictor_checkpoint_ref: Option<String>,
    pub provenance: Vec<String>,
}

impl AnuttaraPentadicRuntimeTrace {
    pub fn from_profile(profile: &MathemeHarmonicProfile) -> Self {
        let binary = &profile.binary;
        let resonance72_index = binary.m2_vibration_index;

        // Gap law: an index the 8/9 compression cannot round-trip is an
        // M2-only wholeness position; the Möbius return (tick 0) restores
        // the M1 parent; every other index transcribes into M3.
        let evolutionary_gap = if is_evolutionary_gap(resonance72_index) {
            "m2-wholeness-gap"
        } else if profile.tick12 == 0 {
            "m1-parent-restored"
        } else {
            "m3-transcription-gap"
        };

        let backbone_step = M3_BACKBONE_DEGREE_STEP;
        let backbone_count = M3_BACKBONE_NODE_COUNT;
        let degree_full = backbone_step * backbone_count;

        Self {
            tick: profile.tick,
            tick12: profile.tick12,
            helix: u8::from(profile.helix == "pratibimba"),
            position6: profile.position6,
            source_binary_state: match profile.tick12 {
                0 => "0".to_owned(),
                1 => "1".to_owned(),
                _ => "0/1".to_owned(),
            },
            whole_number_endpoint: 5,
            natural_number_endpoint: 6,
            family_b_complement: [profile.position6, profile.chromatic.mirror_position],
            shem_degree_quantum: 5,
            resonance72_index,
            degree360: profile.degree360,
            m2_to_m3_symbol: binary.m2_to_m3_symbol,
            mahamaya_address64: binary
                .mahamaya_address64
                .unwrap_or_else(|| mahamaya_address64_from_degree(profile.degree360)),
            evolutionary_gap: evolutionary_gap.to_owned(),
            codon_id: binary.codon_id,
            codon: binary
                .codon
                .clone()
                .unwrap_or_else(|| "pending-codon".to_owned()),
            line_change_operator: binary.line_change_operator_address,
            paired_mahamaya_fifteens: [backbone_step, backbone_step],
            backbone_identity: format!("{backbone_count}x{backbone_step}={degree_full}"),
            line_graph_identity: format!(
                "{degree_full}+{backbone_count}={}",
                degree_full + backbone_count
            ),
            q_cosmic_ref: profile.graph_handle.canonical_form.clone(),
            q_composed_handle: None,
            learned_predictor_checkpoint_ref: None,
            provenance: vec![
                "portal-core::MathemeHarmonicProfile::from_tick".to_owned(),
                "kernel.binary::MahamayaCodecProjection".to_owned(),
                "luts::mahamaya::apply_epogdoon_compression".to_owned(),
                "m3_transcription_bridge::M3_BACKBONE_DEGREE_STEP".to_owned(),
            ],
        }
    }
}
