//! Coordinate: S0 projection of the cumulative M1'→M2'→M3' Third-Spanda seam
//! Residency: Body/S/S0/portal-core/src/kernel/projections/pentadic_trace.rs
//! Position (#3): one live generation from M1 rotational activity through
//!   M2's 72-address field and the 9:8 epogdoon into M3 transcription
//! Actualises: `AnuttaraPentadicRuntimeTrace.thirdSpanda` per the active
//!   epi-cli Zod contract and pratibimba-app bridge types
//! Public surface: AnuttaraPentadicRuntimeTrace, AnuttaraPentadicRuntimeTrace::from_profile
//! Does NOT own: M0's prior 0/1 ground; the epogdoon 8/9 law or 64/360
//!   address law (luts::mahamaya),
//!   the backbone 24x15 step (m3_transcription_bridge), the profile substrate
//!   (kernel::profile), renderer display facts (carrier panes)
//!
//! Anti-greenfield: every field derives from existing MathemeHarmonicProfile
//! payloads and the Mahamaya/M2/M3 helpers. No renderer-local tables.

use serde::{Deserialize, Serialize};

use crate::codon_rotation_projection::CodonRotationProjection;
use crate::luts::mahamaya::{apply_epogdoon_compression, mahamaya_address64_from_degree};
use crate::m3_transcription_bridge::{M3_BACKBONE_DEGREE_STEP, M3_BACKBONE_NODE_COUNT};
use crate::parashakti::RoutingAxisViews;
use crate::quaternion::Quaternion;
use crate::spanda::ring_codon_advance;

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
    /// One cumulative M1→M2→M3 generation. This is process evidence inside
    /// the existing trace, not a second profile field or renderer proof layer.
    pub third_spanda: ThirdSpandaRuntimeTrace,
    pub provenance: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ThirdSpandaRuntimeTrace {
    pub m1: ThirdSpandaM1State,
    pub m2: ThirdSpandaM2State,
    pub epogdoon: EpogdoonRuntimeEvidence,
    pub m3: ThirdSpandaM3State,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ThirdSpandaM1State {
    pub prior_ground: String,
    pub parent_attribution: String,
    pub degree720: u16,
    pub hopf_fiber: u8,
    pub ring_quaternion: Quaternion,
    /// C `spanda_codon_advance` driven by this M1 ring state and cycle.
    pub advancement_address64: u8,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ThirdSpandaM2State {
    pub address72: u8,
    pub axis_views: RoutingAxisViews,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum EpogdoonCollisionRole {
    FirstSource,
    SecondSource,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EpogdoonCollisionEvidence {
    pub ordinal: u8,
    pub source_pair72: [u8; 2],
    pub active_role: EpogdoonCollisionRole,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EpogdoonCardinality {
    pub block_size: u8,
    pub block_count: u8,
    pub collision_pair_count: u8,
    pub exact_round_trip_count: u8,
    pub non_exact_round_trip_count: u8,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EpogdoonRuntimeEvidence {
    pub ratio_numerator: u8,
    pub ratio_denominator: u8,
    pub source_address72: u8,
    pub block_index: u8,
    pub block_phase: u8,
    pub compressed_address64: u8,
    pub expanded_address72: u8,
    pub round_trip_exact: bool,
    pub round_trip_loss: u8,
    pub collision: Option<EpogdoonCollisionEvidence>,
    pub cardinality: EpogdoonCardinality,
}

impl EpogdoonRuntimeEvidence {
    pub fn from_address72(source_address72: u8) -> Self {
        assert!(
            source_address72 < 72,
            "epogdoon source address must be in 0..72"
        );
        let compressed_address64 = apply_epogdoon_compression(source_address72 as usize);
        let expanded_address72 = ((u16::from(compressed_address64) * 9) / 8) as u8;
        let round_trip_loss = source_address72 - expanded_address72;
        let block_index = source_address72 / 9;
        let block_phase = source_address72 % 9;
        let collision = match block_phase {
            0 => Some(EpogdoonCollisionEvidence {
                ordinal: block_index,
                source_pair72: [block_index * 9, block_index * 9 + 1],
                active_role: EpogdoonCollisionRole::FirstSource,
            }),
            1 => Some(EpogdoonCollisionEvidence {
                ordinal: block_index,
                source_pair72: [block_index * 9, block_index * 9 + 1],
                active_role: EpogdoonCollisionRole::SecondSource,
            }),
            _ => None,
        };

        Self {
            ratio_numerator: 9,
            ratio_denominator: 8,
            source_address72,
            block_index,
            block_phase,
            compressed_address64,
            expanded_address72,
            round_trip_exact: round_trip_loss == 0,
            round_trip_loss,
            collision,
            cardinality: EpogdoonCardinality {
                block_size: 9,
                block_count: 8,
                collision_pair_count: 8,
                exact_round_trip_count: 8,
                non_exact_round_trip_count: 64,
            },
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ThirdSpandaM3State {
    /// The 64-address received through the M2 DET/epogdoon descent.
    pub det_reception_address64: u8,
    /// The independently clock-addressed Mahamaya cell.
    pub world_clock_address64: u8,
    pub codon_id: u8,
    pub codon: String,
    pub codon_rotation: CodonRotationProjection,
    pub transcription_state: String,
    pub line_change_operator: u16,
}

impl AnuttaraPentadicRuntimeTrace {
    pub fn from_profile(profile: &MathemeHarmonicProfile) -> Self {
        let binary = &profile.binary;
        let resonance72_index = binary.m2_vibration_index;
        let address72 =
            u8::try_from(resonance72_index).expect("profile resonance address remains in 0..72");
        let epogdoon = EpogdoonRuntimeEvidence::from_address72(address72);
        let world_clock_address64 = binary
            .mahamaya_address64
            .unwrap_or_else(|| mahamaya_address64_from_degree(profile.degree360));

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
            third_spanda: ThirdSpandaRuntimeTrace {
                m1: ThirdSpandaM1State {
                    prior_ground: profile.m1_topology.prior_ground.clone(),
                    parent_attribution: profile.m1_topology.parent_attribution.clone(),
                    degree720: profile.degree720,
                    hopf_fiber: profile.m1_topology.hopf_fiber,
                    ring_quaternion: profile.m1_topology.ring_quaternion,
                    advancement_address64: ring_codon_advance(profile.tick12, profile.cycle),
                },
                m2: ThirdSpandaM2State {
                    address72,
                    axis_views: RoutingAxisViews::for_index72(address72)
                        .expect("profile resonance address remains in 0..72"),
                },
                m3: ThirdSpandaM3State {
                    det_reception_address64: epogdoon.compressed_address64,
                    world_clock_address64,
                    codon_id: binary.codon_id,
                    codon: binary
                        .codon
                        .clone()
                        .unwrap_or_else(|| "pending-codon".to_owned()),
                    codon_rotation: profile.codon_rotation_projection.clone(),
                    transcription_state: if epogdoon.round_trip_exact {
                        "round-trip-anchor"
                    } else {
                        "compressed-nonexact-round-trip"
                    }
                    .to_owned(),
                    line_change_operator: binary.line_change_operator_address,
                },
                epogdoon,
            },
            provenance: vec![
                "portal-core::MathemeHarmonicProfile::from_tick".to_owned(),
                "kernel.binary::MahamayaCodecProjection".to_owned(),
                "luts::mahamaya::apply_epogdoon_compression".to_owned(),
                "m3_transcription_bridge::M3_BACKBONE_DEGREE_STEP".to_owned(),
            ],
        }
    }
}
