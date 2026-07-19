use serde::{Deserialize, Serialize};

use crate::codon_rotation_projection::{
    codon_charge_quaternion, codon_rotation_from_lens_mode, CodonRotationProjection,
    MathemeLensMode,
};
use crate::events::KleinFlipEvent;
use crate::parashakti::vimarsha_read_profile;
use crate::personal_identity::{PersonalIdentityProfile, PersonalResonance};
use crate::profile_projections::{
    AnuttaraWitnessBandBalance, AnuttaraWitnessPalindromeState, AnuttaraWitnessProjection,
    CanonRecognitionEvent, CosmicCompositionState, InversionOperatorHandle, M1TopologyProjection,
    PasuBeingPatternProjection, PersonalPoleProjection, PsychoidFieldProjection,
};
use crate::vak_address::{CpfState, VakAddress};

use super::projections::*;
use super::{
    conjugate_form_character_for_mode, pitch_class_for_tick, ratio_role_for_sub_tick,
    ConjugateFormCharacter, KernelPhase, KernelTick, MathemeNodalConstraint, ProfilePrivacyClass,
};

pub const CURRENT_PROFILE_SCHEMA_VERSION: u16 = 1;

fn bootstrap_anuttara_witness(tick12: u8, position6: u8) -> AnuttaraWitnessProjection {
    let witness = epi_lib::m0_verifier::bootstrap_witness_for_tick(tick12, position6);
    AnuttaraWitnessProjection {
        virtue_witness_vector: witness.virtue_witness_vector,
        syntax_witness_vector: witness.syntax_witness_vector,
        rfactor_path: Vec::new(),
        band_balance: AnuttaraWitnessBandBalance {
            pravritti_depth: 0,
            nivritti_depth: 0,
            reached_turn: false,
            returned: false,
        },
        palindrome_state: AnuttaraWitnessPalindromeState {
            normal_form_symmetric: false,
            mirror_normal_form: format!("bootstrap-tick-{tick12}-position-{position6}"),
        },
        open_questions: witness.open_questions,
        coherence_score: witness.coherence_score,
    }
}

/// Handle-only quintessence identity summary (quintessence-hash architecture
/// + DR-M4-3 opaque-handle law). What crosses the bus: the natal clock
/// address (`(natal_hash[0] | natal_hash[1] << 8) % 360` — hash-derived,
/// never the natal chart), the quintessence weight (1 − variance of the five
/// identity-layer elemental profiles), the enrichment-arc honesty
/// (`layer_count`/`partial` — only a full 5-layer hash reaches weight ≥ 0.5),
/// an 8-hex-char hash PREVIEW (the handle, never the 32-byte hash), and the
/// quintessence quaternion — the elemental distillation of identity in the
/// kernel's `[w=Earth, x=Fire, y=Water, z=Air]` axis law (clock_state
/// `update_quintessence_quaternion`), which is the public-safe
/// elemental-balance class per M4' privacy law. The natal 10-planet
/// distribution is NOT here by design: it renders from a local read on the
/// personal pole and never crosses this bus.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuintessenceProjection {
    /// The entity's Bimba address on the cosmic clock (0-359).
    pub natal_degree: u16,
    /// tick12 arc of the natal degree (0-11).
    pub natal_tick12: u8,
    /// 1.0 − variance across the present identity-layer profiles.
    pub quintessence_weight: f32,
    /// How many of the 5 identity layers are present (0-5).
    pub layer_count: u8,
    /// True while layer_count < 5 — the hash is still enriching.
    pub partial: bool,
    /// First 4 bytes of the BLAKE3 identity hash as 8 hex chars.
    pub hash_preview: String,
    /// Unit quaternion `[w=Earth, x=Fire, y=Water, z=Air]` — the stable
    /// ground reference the torus reads against `q_cosmic`.
    pub quintessence_quaternion: [f32; 4],
    pub authority: String,
}

/// Per-planet live-sky projection — the cosmic-clock `Clock_Planet_State`
/// (§5.2/§5.3) made profile-native. Every field is kernel data: the decan
/// ruler comes from the Chaldean `DECAN_RULERS_36` table, the element
/// identity and Keplerian velocity mirror `M2_PLANET_LUT` — renderers give
/// planets bodies from these fields and never carry their own tables.
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LivePlanetProjection {
    /// Canonical mod-10 id: Sun=0, Moon=1, Mercury=2, Venus=3, Mars=4,
    /// Jupiter=5, Saturn=6, Uranus=7, Neptune=8, Pluto=9. Earth is the
    /// observer-centre and never appears here.
    pub planet_id: u8,
    /// Ecliptic longitude 0.0-360.0, fractional precision preserved
    /// (cosmic-clock §13.4.4 percentile law).
    pub degree: f32,
    pub retrograde: bool,
    /// Decan the planet transits: `floor(degree / 10)`, 0-35.
    pub decan36: u8,
    /// Chaldean ruler of that decan (kernel table, never renderer-derived).
    pub decan_ruler: u8,
    /// True when the transiting planet stands in a decan it rules — the
    /// resonance event of cosmic-clock §5.2 ("at home in its own domain").
    /// The engine pulses the marker; it never recomputes the rulership.
    pub is_resonance: bool,
    /// Element_Id mirroring `ELEM_SIG_GET_ELEMENT(M2_PLANET_LUT[i].elem_sig)`
    /// — the planet's visual identity source (colour-binary is renderer
    /// choreography OVER this id, per M2-ARCHITECTURE §9.3).
    pub element_id: u8,
    /// `M2_PLANET_LUT[i].keplerian_vel` (arcsec/day × 10) — the kernel datum
    /// renderers may scale body size/weight from.
    pub keplerian_vel: u16,
}

impl LivePlanetProjection {
    pub fn from_degree(planet_id: u8, degree: f32, retrograde: bool) -> Self {
        let normalized = degree.rem_euclid(360.0);
        let decan36 = ((normalized / 10.0).floor() as u8).min(35);
        let decan_ruler = crate::parashakti::decan_ruler(decan36);
        let idx = (planet_id as usize).min(9);
        Self {
            planet_id,
            degree: normalized,
            retrograde,
            decan36,
            decan_ruler,
            is_resonance: planet_id == decan_ruler,
            element_id: crate::aspect::PLANET_ELEMENT_ID[idx],
            keplerian_vel: crate::aspect::PLANET_KEPLERIAN_VEL[idx],
        }
    }
}

/// Build the ten-planet live-sky projection from a complete Kerykeion read.
/// Callers gate completeness upstream (the `planetDegrees` law): this
/// function assumes ten finite canonical-order degrees.
pub fn live_planets_from_sky(
    degrees: &[f32; 10],
    retrograde: &[bool; 10],
) -> [LivePlanetProjection; 10] {
    std::array::from_fn(|i| LivePlanetProjection::from_degree(i as u8, degrees[i], retrograde[i]))
}

fn default_profile_schema_version() -> u16 {
    CURRENT_PROFILE_SCHEMA_VERSION
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeProfileProvenance {
    pub owner: String,
    pub contract: String,
    pub source: String,
    pub compatibility: MathemeProfileCompatibility,
}

impl MathemeProfileProvenance {
    fn current_public() -> Self {
        Self::default()
    }
}

impl Default for MathemeProfileProvenance {
    fn default() -> Self {
        Self {
            owner: "portal-core".to_owned(),
            contract: "MathemeHarmonicProfile.public-current".to_owned(),
            source: "S0 kernel tick + portal-core harmonic/codon/Vimarsha projections".to_owned(),
            compatibility: MathemeProfileCompatibility::default(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeProfileCompatibility {
    pub binary_alias: String,
    pub mahamaya_alias: String,
    pub policy: String,
}

impl Default for MathemeProfileCompatibility {
    fn default() -> Self {
        Self {
            binary_alias: "binary".to_owned(),
            mahamaya_alias: "mahamaya".to_owned(),
            policy: "binary and mahamaya serialize the same projection during IOD-04 migration"
                .to_owned(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeTickAddress {
    pub cycle: u64,
    pub sub_tick: u8,
    pub tick12: u8,
    pub absolute_tick: u64,
    pub phase: KernelPhase,
}

impl MathemeTickAddress {
    fn from_tick(tick: KernelTick, absolute_tick: u64, tick12: u8) -> Self {
        Self {
            cycle: tick.cycle,
            sub_tick: tick.sub_tick,
            tick12,
            absolute_tick,
            phase: tick.phase,
        }
    }
}

impl Default for MathemeTickAddress {
    fn default() -> Self {
        Self {
            cycle: 0,
            sub_tick: 0,
            tick12: 0,
            absolute_tick: 0,
            phase: KernelPhase::Descent,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeFutureAnchor {
    pub coordinate: String,
    pub readiness: String,
    pub provenance: String,
}

impl MathemeFutureAnchor {
    fn s2_coordinate_anchor(coordinate: &str) -> Self {
        Self {
            coordinate: coordinate.to_owned(),
            readiness: "cycle-2-s2-coordinate-anchor".to_owned(),
            provenance: "Body/S/S2/graph-services/src/pointers.rs::kernel_coordinate_anchor_for"
                .to_owned(),
        }
    }

    fn s3_profile_observation_anchor(coordinate: &str) -> Self {
        Self {
            coordinate: coordinate.to_owned(),
            readiness: "cycle-2-s3-profile-observation-anchor".to_owned(),
            provenance:
                "Body/S/S0/portal-core/src/events/kernel_events.rs::KernelProfileObservationEvent::from_profile"
                    .to_owned(),
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum BedrockProvenanceHandle {
    KernelMathemeBedrockProjectionV1,
}

impl BedrockProvenanceHandle {
    pub fn provenance_chain(self) -> String {
        match self {
            Self::KernelMathemeBedrockProjectionV1 =>
                "Body/S/S0/portal-core/src/kernel.rs:878 -> .rodata -> MathemeHarmonicProfile.bedrock -> readinessLedger.bedrock_link"
                    .to_owned(),
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MathemeHarmonicProfileReadinessState {
    Authoritative,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct MathemeHarmonicProfileReadinessFact {
    pub field: String,
    pub state: MathemeHarmonicProfileReadinessState,
    pub bedrock_link: BedrockProvenanceHandle,
    pub provenance_chain: String,
}

impl MathemeHarmonicProfileReadinessFact {
    fn bedrock() -> Self {
        let bedrock_link = BedrockProvenanceHandle::KernelMathemeBedrockProjectionV1;
        Self {
            field: "bedrock".to_owned(),
            state: MathemeHarmonicProfileReadinessState::Authoritative,
            bedrock_link,
            provenance_chain: bedrock_link.provenance_chain(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DepositionAnchorProjection {
    pub source_coordinate: String,
    pub resonance72_index: usize,
    pub mahamaya_address64: Option<u8>,
    pub s3_method: String,
    pub privacy_boundary: String,
}

impl DepositionAnchorProjection {
    fn from_profile_parts(
        source_coordinate: &str,
        resonance72_index: usize,
        mahamaya_address64: Option<u8>,
    ) -> Self {
        Self {
            source_coordinate: source_coordinate.to_owned(),
            resonance72_index,
            mahamaya_address64,
            s3_method: "s5.episodic.kernel_profile_observation.deposit".to_owned(),
            privacy_boundary: "public-current-context-to-protected-local-episodic-memory"
                .to_owned(),
        }
    }
}

impl Default for DepositionAnchorProjection {
    fn default() -> Self {
        Self::from_profile_parts("M0", 0, None)
    }
}

/// Typed graph residency home for a profile-bus coordinate.
///
/// Mirrors the M-branch + kernel-observation slice of
/// `epi_s2_graph_schema::CoordinateHome` (S2 graph-schema canon, Tranche 17.17).
/// portal-core (S0) does not link the S2 graph-schema crate — `epi-cli` is the
/// S0 crate that depends on it directly — so this is the projection mirror
/// published through the harmonic profile bus. Variants serialise to the
/// identical canon strings (`"M"`, `"M0'"`, `"S2-5"`, …) so an M' surface reads
/// the typed home here instead of re-parsing the coordinate string per tick.
///
/// The bus only ever produces M-branch psychoid homes; canon defines specific
/// `Mn'` variants for every pratibimba position but only the generic `M` family
/// home and the explicit `M5` for the bimba helix, so bimba positions 0..4 land
/// on the generic family home (the exact position stays in `canonical_form`).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum CoordinateHome {
    #[serde(rename = "M")]
    M,
    #[serde(rename = "M0'")]
    M0Prime,
    #[serde(rename = "M1'")]
    M1Prime,
    #[serde(rename = "M2'")]
    M2Prime,
    #[serde(rename = "M3'")]
    M3Prime,
    #[serde(rename = "M4'")]
    M4Prime,
    #[serde(rename = "M5")]
    M5,
    #[serde(rename = "M5'")]
    M5Prime,
    #[serde(rename = "S2-5")]
    S2_5,
}

impl CoordinateHome {
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::M => "M",
            Self::M0Prime => "M0'",
            Self::M1Prime => "M1'",
            Self::M2Prime => "M2'",
            Self::M3Prime => "M3'",
            Self::M4Prime => "M4'",
            Self::M5 => "M5",
            Self::M5Prime => "M5'",
            Self::S2_5 => "S2-5",
        }
    }

    /// Resolve the canon home for a tick-derived M-branch anchor. Pratibimba
    /// positions map to their explicit `Mn'` home; the bimba helix carries the
    /// generic `M` family home except for the explicit `M5` boundary.
    fn from_anchor(position6: u8, is_prime: bool) -> Self {
        if is_prime {
            match position6 % 6 {
                0 => Self::M0Prime,
                1 => Self::M1Prime,
                2 => Self::M2Prime,
                3 => Self::M3Prime,
                4 => Self::M4Prime,
                _ => Self::M5Prime,
            }
        } else if position6 % 6 == 5 {
            Self::M5
        } else {
            Self::M
        }
    }
}

/// Option-1 GDS overlay readiness for the active coordinate, surfaced so Theia
/// can render the cycle gate without a separate `graph doctor` call. Mirrors the
/// S2 readiness ladder (`Body/S/S2/graph-services/src/gds.rs`): `blocked` is the
/// production state for the default APOC-only local topology, `projection_ready`
/// once the `s2_public_bimba_option1_v1` projection exists, `algorithm_active`
/// once the projection runner is explicitly invoked.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum GdsOverlayState {
    #[default]
    Blocked,
    ProjectionReady,
    AlgorithmActive,
}

/// Pre-resolved S2 graph anchor for the active coordinate, published on the
/// profile bus so M' surfaces stop re-parsing `canonical_form` through the S2
/// `CoordinateArrayParser` on every tick (S2-ARCHITECTURE.md §4.3 / §10.4).
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GraphAnchorProjection {
    pub canonical_form: String,
    pub depth: i8,
    pub prefix: String,
    pub parent: Option<String>,
    pub axis: String,
    pub coordinate_home: CoordinateHome,
    pub gds_overlay_state: GdsOverlayState,
    pub resolver_provenance: String,
}

impl GraphAnchorProjection {
    fn from_anchor(source_coordinate: &str, position6: u8, helix: &str) -> Self {
        let is_prime = helix == "pratibimba";
        Self {
            canonical_form: source_coordinate.to_owned(),
            // Tick-derived anchors are top-level psychoid positions; S2 raises
            // `depth` for `-`/`.` sub-coordinates (M0-2 is depth 1, M0-2-4 is 2).
            depth: 0,
            prefix: "M".to_owned(),
            parent: Some("M".to_owned()),
            axis: helix.to_owned(),
            coordinate_home: CoordinateHome::from_anchor(position6, is_prime),
            gds_overlay_state: GdsOverlayState::Blocked,
            resolver_provenance:
                "Body/S/S2/graph-services/src/coordinate.rs::CoordinateArrayParser (pre-resolved at the S0 profile bus to avoid per-tick re-parse)"
                    .to_owned(),
        }
    }
}

impl Default for GraphAnchorProjection {
    fn default() -> Self {
        Self::from_anchor("M0", 0, "bimba")
    }
}

pub const M0_CF_ADDRESS: [(&str, &str); 7] = [
    ("(00/00)", "M0-2:00/00"),
    ("(0/1)", "M0-1/M0-3/M0-4/M0-5:(0/1)"),
    ("(0/1/2)", "M0-4.0/1/2"),
    ("(0/1/2/3)", "M0-4.0/1/2/3"),
    ("(4.0/1-4.4/5)", "M0-4"),
    ("(4.5/0)", "M0-4.5/0"),
    ("(5/0)", "M0-5"),
];

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum VakLevel {
    Para,
    Pashyanti,
    Madhyama,
    Vaikhari,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VakLanguificationTrace {
    pub cpf_notation: String,
    pub cf_notation: String,
    pub m0_address: String,
    pub vak_level: VakLevel,
    pub diatonic_degree: u8,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub mode_tonic_cf: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub resonance72_index: Option<usize>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub half_decan_index: Option<usize>,
    pub bias_weights_empty: bool,
    pub recognition_closed: bool,
    pub provenance: Vec<String>,
}

impl VakLanguificationTrace {
    pub fn from_profile(
        profile: &MathemeHarmonicProfile,
        bias_weights_empty: bool,
    ) -> Option<Self> {
        let vak = profile.vak_address.as_ref()?;
        let cf_notation = vak.cf.clone();
        let m0_address = m0_address_for_cf(&cf_notation)?.to_owned();
        let recognition_closed = vak.cs.recognized;
        let vak_level = vak_level_for(vak, bias_weights_empty, recognition_closed);
        let resonance72_index = Some(profile.resonance72.lens_anchor_index);
        let half_decan_index = resonance72_index.map(|index| index / 2);
        Some(Self {
            cpf_notation: cpf_notation(vak.cpf).to_owned(),
            cf_notation,
            m0_address,
            vak_level,
            diatonic_degree: if recognition_closed && vak.cf == "(5/0)" {
                0
            } else {
                profile
                    .diatonic
                    .as_ref()
                    .map(|context| context.degree)
                    .unwrap_or(0)
            },
            mode_tonic_cf: None,
            resonance72_index,
            half_decan_index,
            bias_weights_empty,
            recognition_closed,
            provenance: vec![
                "s4.vak.evaluate".to_owned(),
                "m0.vak_cf".to_owned(),
                "kernel.diatonic_context".to_owned(),
                "kernel.resonance72_projection".to_owned(),
            ],
        })
    }
}

fn cpf_notation(cpf: CpfState) -> &'static str {
    match cpf {
        CpfState::Dialogical => "(00/00)",
        CpfState::Mechanistic => "(4.0/1-4.4/5)",
    }
}

fn m0_address_for_cf(cf: &str) -> Option<&'static str> {
    M0_CF_ADDRESS
        .iter()
        .find_map(|(literal, address)| (*literal == cf).then_some(*address))
}

fn vak_level_for(vak: &VakAddress, bias_weights_empty: bool, recognition_closed: bool) -> VakLevel {
    if matches!(vak.cpf, CpfState::Dialogical) && bias_weights_empty {
        return VakLevel::Para;
    }
    match vak.cf.as_str() {
        "(0/1)" | "(0/1/2)" | "(0/1/2/3)" => VakLevel::Pashyanti,
        "(5/0)" if recognition_closed => VakLevel::Vaikhari,
        _ => VakLevel::Madhyama,
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeHarmonicProfile {
    #[serde(default = "default_profile_schema_version")]
    pub profile_schema_version: u16,
    #[serde(default)]
    pub profile_provenance: MathemeProfileProvenance,
    #[serde(default)]
    pub tick_address: MathemeTickAddress,
    pub tick: u64,
    pub tick12: u8,
    pub cycle: u64,
    pub degree720: u16,
    pub degree360: u16,
    pub su2_layer: String,
    pub phase: KernelPhase,
    pub position6: u8,
    pub helix: String,
    pub ratio_role: String,
    pub lens_mode: MathemeLensMode,
    #[serde(default)]
    pub klein_flip: Option<KleinFlipEvent>,
    /// Track 02.T2.3 — the M1-5 single-torus topology invariants + live
    /// Klein-flip descriptors, serialized as `m1Topology` for the carrier's
    /// `topologyFromPayload`. `#[serde(default)]` keeps schema-v1 payloads
    /// (which predate this field) deserializing — additive, never a second
    /// carrier ontology.
    #[serde(default)]
    pub m1_topology: M1TopologyProjection,
    /// Track 02.T2.5 — the `invert` field M1'-SPEC §14 wires into every
    /// coordinate: it points at the SINGLE session-held `#` (Inversion_Operator),
    /// identical across all coordinates (no per-coordinate forks). Serialized as
    /// `inversionOperator`; `#[serde(default)]` keeps pre-T2.5 payloads parsing.
    #[serde(default)]
    pub inversion_operator: InversionOperatorHandle,
    #[serde(default)]
    pub ananda_vortex: AnandaVortexProjection,
    /// Track 36 / 10.P5 — the 0/1 → 5 runtime hinge made first-class: the
    /// Anuttara archetypal number language bridged into the Mahāmāyā stack
    /// (whole-number 0→5 / natural 1→6 addressing, Shem 5° quantum 72×5=360,
    /// paired Mahāmāyā fifteens 24×15=360, line-change closure 360+24=384).
    /// Derived kernel-side by `AnuttaraPentadicRuntimeTrace::from_profile`
    /// (never renderer-recomputed); `None` only on pre-36.3 payloads.
    #[serde(default)]
    pub anuttara_pentadic_trace: Option<AnuttaraPentadicRuntimeTrace>,
    pub chromatic: MathemeChromaticProfile,
    pub diatonic: Option<MathemeDiatonicContext>,
    pub resonance72: MathemeResonance72Projection,
    #[serde(default)]
    pub deposition_anchor: DepositionAnchorProjection,
    #[serde(default)]
    pub graph_handle: GraphAnchorProjection,
    /// Track 21.T21.15 — exact 16-fold [[M0]] Void-Structure carrier, derived
    /// from the existing kernel `CLOCK_LENSES_16` authority. The explicit
    /// snake-case key preserves the frozen M0 contract while every lens body
    /// remains camelCase. Legacy profiles default to the same kernel projection.
    #[serde(rename = "m0_void_structure_ring", default = "m0_void_structure_ring")]
    pub m0_void_structure_ring: [M0VoidLensProjection; 16],
    pub audio_octet: [f32; 8],
    pub nodal_quartet: [MathemeNodalConstraint; 4],
    /// Modal/bell interpretation of the 8+4 bus (bell-kernel spec §4): the
    /// standing resonant body — 12-slot chromatic body, bell-partial roles
    /// over the live octet, nodal anchor roles, 7+5 diatonic/silent
    /// partition. Derived entirely from this profile's own state; authority
    /// for pitch and nodal truth stays with `audio_octet`/`nodal_quartet`
    /// (`liveOctet[i].hz` MUST equal `audio_octet[i]`). Optional on profile
    /// schema v1 so legacy payloads keep deserializing — additive, never a
    /// second carrier ontology.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub modal_resonator: Option<ModalResonatorProfile>,
    pub elements: MathemeElementalProjection,
    pub planetary_chakral: MathemePlanetaryChakralProjection,
    /// Live Kerykeion transit degrees, canonical mod-10 order Sun(0)..Pluto(9),
    /// ecliptic 0.0-360.0 with fractional precision preserved (cosmic-clock
    /// §13.4.4 percentile law — markers sit at exact positions, never snapped).
    /// Earth is the observer-centre and is never in this array. `None` IS the
    /// honest `kairos_valid = false` state (cosmic-clock §5.3): renderers show
    /// "kairos pending" and never invent positions. The kernel constructor never
    /// fabricates this field; the S3 gateway heartbeat attaches it from the
    /// `epi nara kairos` cache when fresh and complete.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub planet_degrees: Option<[f32; 10]>,
    /// Full per-planet live-sky projection (decan, Chaldean ruler, resonance
    /// event, element identity, Keplerian velocity) — same gating law as
    /// `planet_degrees`: attached by the gateway heartbeat only when the
    /// kairos cache is fresh and complete; never fabricated kernel-side.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub live_planets: Option<[LivePlanetProjection; 10]>,
    /// Which live-sky tier the S3 heartbeat resolved (kairotic > realtime),
    /// mirroring the kernel `m4_planet_degrees_live` precedence: `"kairotic"`
    /// when a fresh oracle-consultation capture preempts the daily transit,
    /// `"realtime"` for the transit; absent (None) when no live sky is attached
    /// (the "kairos pending" state). The carrier shows this so the user can tell
    /// a kairotic reading from the realtime sky.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub kairos_mode: Option<String>,
    /// The kairotic frame's decay deadline (unix milliseconds). Present only in
    /// `"kairotic"` mode; when the client clock passes it (or the next heartbeat
    /// re-resolves) the tier reverts to realtime. Absent otherwise.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub kairos_decays_at_ms: Option<u64>,
    /// The tick's address in the 720 possibility space (Sprint-8 E1): plane
    /// (codon vs hexagram valence), the full clock-degree node from the C
    /// `.rodata` LUT, and the tick carried across the 16+1 temporal apertures
    /// (E2). Derived entirely from `degree720`; optional on schema v1 so
    /// legacy payloads keep deserializing — always attached by `from_tick`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub phase_space: Option<PhaseSpaceAddress>,
    /// Handle-only quintessence identity summary (Sprint-8 E6, DR-M4-3): the
    /// person's address ON the clock, never raw identity bodies. Attached by
    /// the S3 gateway heartbeat from the local PASU identity when one exists;
    /// the kernel constructor never fabricates it. Absence IS the honest
    /// "no identity anchored" state.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub quintessence: Option<QuintessenceProjection>,
    /// Ambient environmental transform quaternion (DR-ENV-1/8): the collective
    /// sky's transpersonal planets aspected against the PASU natal, composed onto
    /// the base. Attached by the S3 gateway heartbeat when a natal chart exists;
    /// the kernel constructor never fabricates it. Absence IS the honest "env
    /// pending" state; the identity rotation IS "no ambient influence" (calm).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub environment_quaternion: Option<[f32; 4]>,
    pub binary: MathemeBinaryProjection,
    pub mahamaya: MathemeBinaryProjection,
    pub codon_rotation_projection: CodonRotationProjection,
    pub q_cosmic: [f32; 4],
    pub resonance: Option<f32>,
    pub conjugate_form_character: ConjugateFormCharacter,
    pub privacy_class: ProfilePrivacyClass,
    pub bedrock: MathemeBedrockProjection,
    #[serde(default)]
    pub readiness_ledger: Vec<MathemeHarmonicProfileReadinessFact>,
    pub pointer_anchor: MathemePointerAnchorProjection,
    pub context_frames: MathemeContextFrameWebProjection,
    pub harmonic_grammar: MathemeHarmonicGrammarProjection,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pasu_being_pattern: Option<PasuBeingPatternProjection>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub anuttara_witness: Option<AnuttaraWitnessProjection>,
    /// Track 21.T21.9 — the compiled [[M0]] contemplation authority projected
    /// verbatim from `epi-lib`; renderers select by canonical archetype index.
    #[serde(default)]
    pub contemplation_prompt_lut: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub cosmic_composition_state: Option<CosmicCompositionState>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub personal_pole: Option<PersonalPoleProjection>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub psychoid_field: Option<PsychoidFieldProjection>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub canon_recognition_stream: Vec<CanonRecognitionEvent>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub vak_address: Option<VakAddress>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub vak_languification_trace: Option<VakLanguificationTrace>,
    #[serde(default)]
    pub s2_anchor: Option<MathemeFutureAnchor>,
    #[serde(default)]
    pub s3_anchor: Option<MathemeFutureAnchor>,
}

impl MathemeHarmonicProfile {
    pub fn from_tick(tick: KernelTick) -> Self {
        let tick12 = tick.sub_tick % 12;
        let helix = if tick12 < 6 { "bimba" } else { "pratibimba" };
        let position = tick12 % 6;
        let pitch_class = pitch_class_for_tick(tick12);
        let degree720 = tick12 as u16 * 60;
        let degree360 = degree720 % 360;
        let diatonic = MathemeDiatonicContext::from_pitch_class(pitch_class);
        let resonance72 = MathemeResonance72Projection::from_tick(tick12, position);
        let lens_mode = MathemeLensMode::new(
            tick12,
            diatonic
                .as_ref()
                .map(|context| context.degree - 1)
                .unwrap_or(position % 7),
        )
        .expect("tick-derived lens-mode remains in the 12x7 landscape");
        let codon_rotation_projection =
            codon_rotation_from_lens_mode(lens_mode.lens, lens_mode.mode)
                .expect("tick-derived lens-mode maps into the codon-rotation surface");
        let q_cosmic = codon_charge_quaternion(codon_rotation_projection.codon_id);
        let vimarsha_reading = vimarsha_read_profile(tick, lens_mode);
        let absolute_tick = tick.cycle * 12 + tick12 as u64;
        let source_coordinate = anchor_coordinate_for_profile(position, helix);
        let binary = MathemeBinaryProjection::from_clock(
            degree360,
            position,
            resonance72.lens_anchor_index,
            tick12 >= 6,
        );
        let deposition_anchor = DepositionAnchorProjection::from_profile_parts(
            &source_coordinate,
            resonance72.lens_anchor_index,
            binary.mahamaya_address64,
        );
        let graph_handle = GraphAnchorProjection::from_anchor(&source_coordinate, position, helix);
        let modal_resonator = ModalResonatorProfile::from_profile_parts(
            absolute_tick,
            tick12,
            degree720,
            lens_mode,
            &resonance72,
            &vimarsha_reading.audio_octet,
            &vimarsha_reading.nodal_quartet,
        );
        let m1_ring_quaternion = crate::spanda::ring_quaternion(tick12);
        let m1_topology = M1TopologyProjection::from_tick_parts(
            tick12,
            degree720,
            m1_ring_quaternion,
            vimarsha_reading.klein_flip.as_ref(),
        );
        // Two-phase: the pentadic trace is a pure derivation OVER the finished
        // profile (36.1 law), so it attaches after construction — one source,
        // never a parallel computation of the same fields.
        let mut profile = Self {
            profile_schema_version: CURRENT_PROFILE_SCHEMA_VERSION,
            profile_provenance: MathemeProfileProvenance::current_public(),
            tick_address: MathemeTickAddress::from_tick(tick, absolute_tick, tick12),
            tick: absolute_tick,
            tick12,
            cycle: tick.cycle,
            degree720,
            degree360,
            su2_layer: if degree720 >= 360 {
                "shadow"
            } else {
                "primary"
            }
            .to_owned(),
            phase: tick.phase,
            position6: position,
            helix: helix.to_owned(),
            ratio_role: ratio_role_for_sub_tick(tick12).to_owned(),
            lens_mode,
            klein_flip: vimarsha_reading.klein_flip,
            m1_topology,
            inversion_operator: InversionOperatorHandle::session_held(),
            ananda_vortex: AnandaVortexProjection::from_tick(tick12, position, degree720),
            chromatic: MathemeChromaticProfile::from_tick(tick12, position, pitch_class),
            diatonic: diatonic.clone(),
            resonance72,
            deposition_anchor,
            graph_handle,
            m0_void_structure_ring: m0_void_structure_ring(),
            audio_octet: vimarsha_reading.audio_octet,
            nodal_quartet: vimarsha_reading.nodal_quartet,
            modal_resonator: Some(modal_resonator),
            elements: MathemeElementalProjection::from_position(position),
            planetary_chakral: MathemePlanetaryChakralProjection::from_diatonic(diatonic.as_ref()),
            planet_degrees: None,
            live_planets: None,
            kairos_mode: None,
            kairos_decays_at_ms: None,
            phase_space: Some(PhaseSpaceAddress::from_degree720(degree720)),
            // never fabricated kernel-side — the gateway attaches identity
            quintessence: None,
            environment_quaternion: None,
            binary: binary.clone(),
            mahamaya: binary,
            codon_rotation_projection,
            q_cosmic,
            resonance: None,
            conjugate_form_character: conjugate_form_character_for_mode(lens_mode.mode),
            privacy_class: ProfilePrivacyClass::PublicCurrentContext,
            bedrock: MathemeBedrockProjection::from_position(position),
            readiness_ledger: vec![MathemeHarmonicProfileReadinessFact::bedrock()],
            pointer_anchor: MathemePointerAnchorProjection::from_tick(
                tick12,
                position,
                helix,
                pitch_class,
            ),
            context_frames: MathemeContextFrameWebProjection::from_diatonic(diatonic.as_ref()),
            harmonic_grammar: MathemeHarmonicGrammarProjection::from_tick(tick12, position),
            pasu_being_pattern: None,
            anuttara_witness: Some(bootstrap_anuttara_witness(tick12, position)),
            contemplation_prompt_lut: epi_lib::m0_verifier::contemplation_prompt_lut(),
            cosmic_composition_state: None,
            personal_pole: None,
            psychoid_field: None,
            canon_recognition_stream: Vec::new(),
            vak_address: None,
            vak_languification_trace: None,
            s2_anchor: Some(MathemeFutureAnchor::s2_coordinate_anchor(
                &source_coordinate,
            )),
            s3_anchor: Some(MathemeFutureAnchor::s3_profile_observation_anchor(
                &source_coordinate,
            )),
            anuttara_pentadic_trace: None,
        };
        profile.anuttara_pentadic_trace =
            Some(AnuttaraPentadicRuntimeTrace::from_profile(&profile));
        profile
    }

    /// Construct a profile for the given tick and attach the supplied
    /// `VakAddress` as the current coordinate-state correlate.
    ///
    /// All other fields follow `from_tick` exactly — this constructor exists so
    /// callers (E4 Tauri command, kernel-side reasoners) can publish harmonic
    /// state and VAK state in a single artifact without reaching past the
    /// public API. The base `from_tick` constructor remains the canonical
    /// path; `vak_address` defaults to `None` there for backward compatibility.
    pub fn with_vak(tick: KernelTick, vak: VakAddress) -> Self {
        let mut profile = Self::from_tick(tick);
        profile.vak_address = Some(vak);
        let bias_weights_empty = profile
            .vak_address
            .as_ref()
            .map(|vak| matches!(vak.cpf, CpfState::Dialogical))
            .unwrap_or(false);
        profile.vak_languification_trace =
            VakLanguificationTrace::from_profile(&profile, bias_weights_empty);
        profile
    }

    pub fn with_pasu_being_pattern(
        tick: KernelTick,
        pasu_being_pattern: PasuBeingPatternProjection,
    ) -> Self {
        let mut profile = Self::from_tick(tick);
        profile.pasu_being_pattern = Some(pasu_being_pattern);
        profile
    }

    pub fn with_anuttara_witness(
        tick: KernelTick,
        anuttara_witness: AnuttaraWitnessProjection,
    ) -> Self {
        let mut profile = Self::from_tick(tick);
        profile.anuttara_witness = Some(anuttara_witness);
        profile
    }

    pub fn with_composition_projections(
        tick: KernelTick,
        cosmic_composition_state: CosmicCompositionState,
        personal_pole: PersonalPoleProjection,
        psychoid_field: PsychoidFieldProjection,
        canon_recognition_stream: Vec<CanonRecognitionEvent>,
    ) -> Self {
        let mut profile = Self::from_tick(tick);
        let q_composed_handle = personal_pole.q_composed_handle.handle.clone();
        profile.cosmic_composition_state = Some(cosmic_composition_state);
        profile.personal_pole = Some(personal_pole);
        profile.psychoid_field = Some(psychoid_field);
        profile.canon_recognition_stream = canon_recognition_stream;
        if let Some(trace) = profile.anuttara_pentadic_trace.as_mut() {
            trace.q_composed_handle = Some(q_composed_handle);
            trace
                .provenance
                .push("kernel.profile::with_composition_projections::q_composed_handle".to_owned());
        }
        profile
    }

    pub fn from_tick_with_personal_identity(
        tick: KernelTick,
        identity: &PersonalIdentityProfile,
    ) -> Self {
        let mut profile = Self::from_tick(tick);
        let resonance = PersonalResonance::from_quaternions(identity.q_personal, profile.q_cosmic);
        profile.resonance = Some(resonance.score);
        profile.conjugate_form_character = resonance.conjugate_form_character;
        profile
    }
}

fn anchor_coordinate_for_profile(position: u8, helix: &str) -> String {
    let prime = if helix == "pratibimba" { "'" } else { "" };
    format!("M{position}{prime}")
}
