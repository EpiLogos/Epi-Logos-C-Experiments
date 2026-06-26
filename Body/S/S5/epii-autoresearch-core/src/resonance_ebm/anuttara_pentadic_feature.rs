//! Track 36 — T36.6: the `anuttara_pentadic_runtime_trace` M3→M5 learning-loop
//! feature family.
//!
//! The Integrated 4-5-0 recognition handoff (plugin-integrated-4-5-0,
//! `recognition-handoff.tsx`, T36.5) projects the
//! [[AnuttaraPentadicRuntimeTrace]] into the M5 Epii energy model as read-only
//! EBM feature context. This module is the runtime half of that contract: it
//! registers the trace as a **named feature family** in the autoresearch /
//! self-improvement loop, and energy-evaluates whether a recognition event
//! preserves the Anuttara pentadic hinge coherently across the seven addressing
//! modes the trace binds together — `0/1`, `5`, `6`, `72`, `64`, `360`, `384`.
//!
//! Hinge law (mirrors the portal-core `AnuttaraPentadicRuntimeTraceProbe`):
//!   - `0/1`  — the binary helix hinge; the Family-B complement pair lives in the
//!              0..5 pentadic space and is a genuine (non mod-6-self) complement.
//!   - `5`    — whole-number endpoint (the pentad's closing position).
//!   - `6`    — natural-number endpoint (the same hinge in the 1..6 addressing).
//!   - `72`   — resonance lens-anchor index (12 lenses × 6 positions).
//!   - `64`   — Mahamaya hexagram address (the I-Ching transcription space).
//!   - `360`  — degree node (24 × 15 backbone).
//!   - `384`  — line-change operator (360 + 24 line-graph identity).
//!
//! **Output is a review annotation / wisdom delta — never a canon rewrite.** The
//! delta carries `rewrites_canon: false` by construction; it surfaces an advisory
//! coherence finding for the q-review / wisdom-curation surface, and the human
//! Architect (and the review gate) owns any downstream canon change.
//!
//! **Zero-gradient honesty.** Energy-evaluation routes through the same
//! [`ResonanceEbmRuntime`] zero-checkpoint fallback as the rest of position 5':
//! with no trained checkpoint loaded, the energy is exactly `0.0` and the
//! gradient is exactly zero. The feature family is still *recorded*
//! (`trained_energy_delta: None`, `checkpoint_loaded: false`) — it never
//! fabricates a trained score to stand in for a checkpoint that does not exist.

use portal_core::{BioQuaternionState, MathemeHarmonicProfile};

use super::inference::ResonanceEbmRuntime;
use super::kernel_invocation::ElementTickInvocation;

/// Stable feature-family id registered into the autoresearch loop.
pub const ANUTTARA_PENTADIC_RUNTIME_TRACE_FEATURE_FAMILY: &str =
    "anuttara_pentadic_runtime_trace";

/// The canonical backbone / line-graph identities the hinge must satisfy.
pub const PENTADIC_BACKBONE_IDENTITY: &str = "24x15=360";
pub const PENTADIC_LINE_GRAPH_IDENTITY: &str = "360+24=384";

/// The seven addressing modes whose mutual coherence the feature family scores.
pub const PENTADIC_HINGE_LABELS: [&str; 7] =
    ["0/1", "5", "6", "72", "64", "360", "384"];

/// The public-safe pentadic trace payload — the seven hinge fields lifted off a
/// `MathemeHarmonicProfile`, matching the `AnuttaraPentadicRuntimeTrace`
/// projection consumed by the recognition handoff. No protected body crosses
/// this seam; every field is a public coordinate quantum.
#[derive(Debug, Clone, PartialEq)]
pub struct PentadicRuntimeTracePayload {
    pub tick: u64,
    pub tick12: u8,
    pub helix_bit: u8,
    pub position6: u8,
    pub whole_number_endpoint: u8,
    pub natural_number_endpoint: u8,
    pub family_b_complement: [u8; 2],
    pub resonance72_index: usize,
    pub mahamaya_address64: Option<u8>,
    pub degree360: u16,
    pub line_change_operator: u16,
    pub codon_id: u8,
    pub codon: Option<String>,
    pub backbone_identity: String,
    pub line_graph_identity: String,
}

impl PentadicRuntimeTracePayload {
    /// Lift the seven-hinge payload straight off a real kernel profile — the
    /// same field reads the portal-core `AnuttaraPentadicRuntimeTraceProbe`
    /// performs. No renderer-local conversion; every value is profile-supplied.
    pub fn from_profile(profile: &MathemeHarmonicProfile) -> Self {
        Self {
            tick: profile.tick,
            tick12: profile.tick12,
            helix_bit: profile.resonance72.helix_bit,
            position6: profile.position6,
            whole_number_endpoint: 5,
            natural_number_endpoint: 6,
            family_b_complement: [profile.position6, profile.chromatic.mirror_position],
            resonance72_index: profile.resonance72.lens_anchor_index,
            mahamaya_address64: profile.binary.mahamaya_address64,
            degree360: profile.degree360,
            line_change_operator: profile.binary.line_change_operator_address,
            codon_id: profile.codon_rotation_projection.codon_id,
            codon: Some(profile.codon_rotation_projection.codon.clone()),
            backbone_identity: PENTADIC_BACKBONE_IDENTITY.to_owned(),
            line_graph_identity: PENTADIC_LINE_GRAPH_IDENTITY.to_owned(),
        }
    }
}

/// The four inputs the feature contract binds: the trace payload + profile, the
/// M3 codon charge tuple, the M4 composed-identity handle, and the M5 checkpoint
/// ref. The profile is retained so the energy-evaluation can read the full
/// harmonic channels without re-deriving them from the payload.
#[derive(Debug, Clone, PartialEq)]
pub struct AnuttaraPentadicRuntimeTraceInput {
    /// Real kernel profile the trace was emitted from (drives EBM channels).
    pub profile: MathemeHarmonicProfile,
    /// The seven-hinge payload (the public trace projection).
    pub trace: PentadicRuntimeTracePayload,
    /// M3 leg — the codon charge tuple (`q_cosmic` codon-charge quaternion).
    pub codon_charge: [f32; 4],
    /// M4 leg — the protected-local composed-identity quaternion handle.
    pub q_composed_handle: Option<String>,
    /// M5 leg — the learned-predictor checkpoint ref (advisory until loaded).
    pub checkpoint_ref: Option<String>,
}

impl AnuttaraPentadicRuntimeTraceInput {
    /// Build the contract input from a real portal-core profile (the M2/M3
    /// codon charge is read straight off `profile.q_cosmic`), the M4 composed
    /// handle, and the M5 checkpoint ref.
    pub fn from_profile(
        profile: MathemeHarmonicProfile,
        q_composed_handle: Option<String>,
        checkpoint_ref: Option<String>,
    ) -> Self {
        let trace = PentadicRuntimeTracePayload::from_profile(&profile);
        let codon_charge = profile.q_cosmic;
        Self {
            profile,
            trace,
            codon_charge,
            q_composed_handle,
            checkpoint_ref,
        }
    }
}

/// One hinge's coherence verdict.
#[derive(Debug, Clone, PartialEq)]
pub struct PentadicHingeCoherence {
    /// One of [`PENTADIC_HINGE_LABELS`].
    pub label: &'static str,
    /// The bound for this hinge (`2` for `0/1`, `5`, `6`, `72`, `64`, `360`, `384`).
    pub modulus: u32,
    /// The observed address, or `None` when the trace did not supply it.
    pub observed: Option<u32>,
    /// True when the observed address sits inside the hinge space and the
    /// hinge's structural identity (where it has one) holds.
    pub coherent: bool,
    /// Human-readable reason, surfaced into the review annotation.
    pub note: String,
}

/// The review annotation / wisdom delta the feature family emits. Advisory by
/// construction: `rewrites_canon` is always `false`.
#[derive(Debug, Clone, PartialEq)]
pub struct PentadicHingeWisdomDelta {
    /// Always [`ANUTTARA_PENTADIC_RUNTIME_TRACE_FEATURE_FAMILY`].
    pub feature_family: String,
    /// Per-hinge verdicts across the seven addressing modes.
    pub hinges: Vec<PentadicHingeCoherence>,
    /// True when every hinge is coherent — recognition preserves the hinge.
    pub hinge_coherent: bool,
    /// Advisory structural score in `0.0..=1.0` (coherent hinges / 7). This is
    /// NOT a trained score — see `trained_energy_delta`.
    pub structural_coherence: f32,
    /// EBM energy scalar from the runtime evaluation (`0.0` on the zero path).
    pub energy_scalar: f32,
    /// Gradient provenance string from the runtime gradient surface.
    pub gradient_provenance: String,
    /// True when a trained checkpoint was actually loaded for the evaluation.
    pub checkpoint_loaded: bool,
    /// The learned-predictor energy delta — `Some` only when a checkpoint was
    /// loaded. `None` on the zero-gradient path: the feature family is recorded
    /// without pretending a trained checkpoint exists.
    pub trained_energy_delta: Option<f32>,
    /// M5 checkpoint ref echoed from the input (advisory pointer, not a score).
    pub checkpoint_ref: Option<String>,
    /// M4 composed-identity handle echoed from the input.
    pub q_composed_handle: Option<String>,
    /// M3 codon charge tuple echoed from the input.
    pub codon_charge: [f32; 4],
    pub codon_id: u8,
    /// The advisory review note for the wisdom-curation surface.
    pub annotation: String,
    /// Invariant: the learning loop never rewrites canon directly.
    pub rewrites_canon: bool,
}

impl PentadicHingeWisdomDelta {
    /// Labels of every hinge that failed coherence, in canonical order.
    pub fn incoherent_hinges(&self) -> Vec<&'static str> {
        self.hinges
            .iter()
            .filter(|hinge| !hinge.coherent)
            .map(|hinge| hinge.label)
            .collect()
    }
}

/// Energy-evaluate a recognition event against the pentadic hinge and emit the
/// wisdom delta. The `runtime` carries the (possibly absent) trained checkpoint;
/// on the zero-checkpoint fallback the energy is `0.0` and the delta records the
/// feature family honestly rather than inventing a score.
pub fn evaluate_anuttara_pentadic_runtime_trace(
    input: &AnuttaraPentadicRuntimeTraceInput,
    runtime: &ResonanceEbmRuntime,
) -> Result<PentadicHingeWisdomDelta, String> {
    let hinges = score_pentadic_hinges(&input.trace);
    let hinge_coherent = hinges.iter().all(|hinge| hinge.coherent);
    let coherent_count = hinges.iter().filter(|hinge| hinge.coherent).count();
    let structural_coherence = coherent_count as f32 / hinges.len() as f32;

    // Element-tick within the 8-step element cycle, derived from the profile.
    let element_tick = (input.profile.tick12 % 8) as u8;
    // M3 codon charge tuple feeds the process pole of the bioquaternion; the
    // base pole stays at canonical identity so the gradient surface perturbs the
    // codon-charge axis the recognition event actually carries.
    let bioquaternion =
        BioQuaternionState::new([1.0, 0.0, 0.0, 0.0], input.codon_charge);
    let invocation =
        ElementTickInvocation::new(element_tick, input.profile.clone(), bioquaternion)?;

    let output = runtime.evaluate(&invocation)?;
    let gradient = runtime.gradient(&invocation)?;
    let checkpoint_loaded = output.checkpoint_loaded;
    let trained_energy_delta = checkpoint_loaded.then_some(output.energy_scalar);

    let annotation = build_annotation(
        hinge_coherent,
        checkpoint_loaded,
        &hinges,
        output.energy_scalar,
        input.checkpoint_ref.as_deref(),
    );

    Ok(PentadicHingeWisdomDelta {
        feature_family: ANUTTARA_PENTADIC_RUNTIME_TRACE_FEATURE_FAMILY.to_owned(),
        hinges,
        hinge_coherent,
        structural_coherence,
        energy_scalar: output.energy_scalar,
        gradient_provenance: gradient.provenance,
        checkpoint_loaded,
        trained_energy_delta,
        checkpoint_ref: input.checkpoint_ref.clone(),
        q_composed_handle: input.q_composed_handle.clone(),
        codon_charge: input.codon_charge,
        codon_id: input.trace.codon_id,
        annotation,
        rewrites_canon: false,
    })
}

/// Score the seven hinges against the trace payload — deterministic, no model.
pub fn score_pentadic_hinges(
    trace: &PentadicRuntimeTracePayload,
) -> Vec<PentadicHingeCoherence> {
    let [left, right] = trace.family_b_complement;
    let complement_in_space = left <= 5 && right <= 5;
    let genuine_complement = (u32::from(left) + u32::from(right)) % 6 != 0;
    let helix_binary = trace.helix_bit <= 1;
    let hinge_0_1 = PentadicHingeCoherence {
        label: "0/1",
        modulus: 2,
        observed: Some(u32::from(trace.helix_bit)),
        coherent: helix_binary && complement_in_space && genuine_complement,
        note: format!(
            "helix_bit={} family_b_complement=[{left},{right}] (in-space={complement_in_space}, genuine={genuine_complement})",
            trace.helix_bit
        ),
    };

    let hinge_5 = PentadicHingeCoherence {
        label: "5",
        modulus: 5,
        observed: Some(u32::from(trace.position6)),
        coherent: trace.whole_number_endpoint == 5 && trace.position6 <= 5,
        note: format!(
            "whole_number_endpoint={} position6={}",
            trace.whole_number_endpoint, trace.position6
        ),
    };

    let position_from_tick = trace.tick12 % 6;
    let hinge_6 = PentadicHingeCoherence {
        label: "6",
        modulus: 6,
        observed: Some(u32::from(trace.tick12)),
        coherent: trace.natural_number_endpoint == 6
            && trace.tick12 < 12
            && trace.position6 == position_from_tick,
        note: format!(
            "natural_number_endpoint={} tick12={} position6==tick12%6 ({}=={})",
            trace.natural_number_endpoint, trace.tick12, trace.position6, position_from_tick
        ),
    };

    let hinge_72 = PentadicHingeCoherence {
        label: "72",
        modulus: 72,
        observed: u32::try_from(trace.resonance72_index).ok(),
        coherent: trace.resonance72_index < 72,
        note: format!("resonance72_index={}", trace.resonance72_index),
    };

    let address64 = trace.mahamaya_address64;
    let hinge_64 = PentadicHingeCoherence {
        label: "64",
        modulus: 64,
        observed: address64.map(u32::from),
        coherent: address64.is_some_and(|address| address < 64),
        note: match address64 {
            Some(address) => format!("mahamaya_address64={address}"),
            None => "mahamaya_address64 missing (m2-wholeness-gap)".to_owned(),
        },
    };

    let backbone_holds = trace.backbone_identity == PENTADIC_BACKBONE_IDENTITY && 24 * 15 == 360;
    let hinge_360 = PentadicHingeCoherence {
        label: "360",
        modulus: 360,
        observed: Some(u32::from(trace.degree360)),
        coherent: trace.degree360 < 360 && backbone_holds,
        note: format!(
            "degree360={} backbone='{}' (24x15=360 holds={backbone_holds})",
            trace.degree360, trace.backbone_identity
        ),
    };

    let line_graph_holds =
        trace.line_graph_identity == PENTADIC_LINE_GRAPH_IDENTITY && 360 + 24 == 384;
    let hinge_384 = PentadicHingeCoherence {
        label: "384",
        modulus: 384,
        observed: Some(u32::from(trace.line_change_operator)),
        coherent: trace.line_change_operator < 384 && line_graph_holds,
        note: format!(
            "line_change_operator={} line_graph='{}' (360+24=384 holds={line_graph_holds})",
            trace.line_change_operator, trace.line_graph_identity
        ),
    };

    vec![
        hinge_0_1, hinge_5, hinge_6, hinge_72, hinge_64, hinge_360, hinge_384,
    ]
}

fn build_annotation(
    hinge_coherent: bool,
    checkpoint_loaded: bool,
    hinges: &[PentadicHingeCoherence],
    energy_scalar: f32,
    checkpoint_ref: Option<&str>,
) -> String {
    let checkpoint_clause = if checkpoint_loaded {
        format!("trained checkpoint loaded; energy={energy_scalar:.6}")
    } else {
        format!(
            "no trained checkpoint loaded (ref={}); energy recorded as zero-gradient advisory — feature family '{}' registered without a trained score",
            checkpoint_ref.unwrap_or("pending-learned-predictor"),
            ANUTTARA_PENTADIC_RUNTIME_TRACE_FEATURE_FAMILY
        )
    };

    if hinge_coherent {
        format!(
            "advisory: recognition event preserves the Anuttara pentadic hinge coherently across 0/1·5·6·72·64·360·384. {checkpoint_clause}. Review annotation only — canon is not rewritten."
        )
    } else {
        let broken = hinges
            .iter()
            .filter(|hinge| !hinge.coherent)
            .map(|hinge| format!("{} ({})", hinge.label, hinge.note))
            .collect::<Vec<_>>()
            .join("; ");
        format!(
            "advisory: recognition event does NOT preserve the pentadic hinge at [{broken}]. {checkpoint_clause}. Flagged for wisdom-curation review — canon is not rewritten."
        )
    }
}
