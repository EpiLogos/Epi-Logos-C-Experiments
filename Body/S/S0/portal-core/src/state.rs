use crate::aspect::compute_aspects;
use crate::codon::{classify_codon, codon_sequence, codon_to_amino_acid, wc_anticodon};
use crate::kernel::{E4PersonalInputs, E5HarmonicInputs, E6VerifierInputs, KernelProjection};
use crate::quaternion::{derive_bifurcation, derive_walk_mode, quat_mul, quat_normalize};
use crate::spanda::quantize_to_spanda_substage;
use crate::transcription::DEGREE_TO_HEXAGRAM;
use crate::types::{ActiveCodon, KairosState, OracleFaces, PortalClockState};

/// Compute torus surface position from (degree, tick12).
pub fn compute_orbital_position(degree: u16, tick12: u8) -> [f32; 3] {
    let theta = degree as f32 * std::f32::consts::TAU / 360.0;
    let phi = tick12 as f32 * std::f32::consts::TAU / 12.0;
    let (r, big_r) = (0.36f32, 0.64f32);
    [
        (big_r + r * phi.cos()) * theta.cos(),
        (big_r + r * phi.cos()) * theta.sin(),
        r * phi.sin(),
    ]
}

fn recompute_composed_quaternion_state(state: &mut PortalClockState) {
    // PASU base ⊗ ambient environment ⊗ transit ⊗ live (DR-ENV-1/8). The base
    // (quintessence) leads and is never overwritten here — the environment factor
    // TRANSFORMS it, it never becomes the base. With `environment_quaternion` at
    // the identity rotation this reduces byte-for-byte to the prior
    // quintessence ⊗ transit ⊗ live law (a ⊗ [1,0,0,0] === a).
    let composed = quat_normalize(quat_mul(
        quat_mul(
            quat_mul(state.quintessence_quaternion, state.environment_quaternion),
            state.transit_quaternion,
        ),
        state.live_quaternion,
    ));
    state.composed_quaternion = composed;
    state.walk_mode = derive_walk_mode(composed);
    let (lambda, res) = derive_bifurcation(composed);
    state.bifurcation_param = lambda;
    state.resolution_level = res;
}

/// Default fraction of the seven canonical harmonic channels a live/cast
/// projection engages when `PortalClockState::cast_e5_engagement` is unset
/// (0.0). 1.0 = the full harmonic substrate reads into E₅. Tunable via
/// `m3.energy.e5_cast_engagement` (registry value injected at the boundary).
pub const E5_CAST_ENGAGEMENT_DEFAULT: f32 = 1.0;

pub fn sync_kernel_projection(state: &mut PortalClockState) {
    let e_4_inputs = E4PersonalInputs::default();
    // A cast/live projection sounds the harmonic substrate — the tick's
    // `MathemeHarmonicProfile` (mahamaya channel included) is live — so E₅
    // engages the canonical harmonic channels. The engaged fraction is the
    // tunable `m3.energy.e5_cast_engagement` (0.0 = unset → the default),
    // making the harmonic ratio playable. E₄ (no personal inputs) and E₆ (no
    // declared verifier invariants) stay dormant for a bare clock sync.
    let engagement = if state.cast_e5_engagement > 0.0 {
        state.cast_e5_engagement
    } else {
        E5_CAST_ENGAGEMENT_DEFAULT
    }
    .clamp(0.0, 1.0);
    let engaged = (engagement * crate::kernel::harmonic_channels::HARMONIC_CHANNEL_COUNT as f32)
        .round() as usize;
    let e_5_inputs = E5HarmonicInputs {
        channel_set: crate::kernel::harmonic_channels::CANONICAL_CHANNEL_SET[..engaged]
            .iter()
            .map(|channel| (*channel).to_owned())
            .collect(),
        ebm_energy_scalar: None,
    };
    let e_6_inputs = E6VerifierInputs::default();
    state.kernel_projection = KernelProjection::from_clock_state(
        state.generation / 12,
        state.tick12,
        state.quintessence_quaternion,
        state.composed_quaternion,
        None,
        &e_4_inputs,
        &e_5_inputs,
        &e_6_inputs,
    );
}

/// Update clock state from a completed oracle cast. Pure math — no Arc/Mutex, no I/O.
///
/// `timestamp`: caller provides current unix seconds (or 0 in tests).
pub fn update_from_cast(
    state: &mut PortalClockState,
    pp: f32,
    nn: f32,
    np: f32,
    pn: f32,
    degree: u16,
    primary_hex: u8,
    temporal_hex: u8,
    changing_lines_mask: u8,
    timestamp: u64,
) {
    let total = pp + nn + np + pn;
    if total < f32::EPSILON {
        return;
    }

    let (w, x, y, z) = (pp / total, nn / total, np / total, pn / total);
    let mag = (w * w + x * x + y * y + z * z).sqrt();
    let live_q = if mag > f32::EPSILON {
        [w / mag, x / mag, y / mag, z / mag]
    } else {
        [1.0, 0.0, 0.0, 0.0]
    };

    let tick12 = quantize_to_spanda_substage(y, x);
    let deficient = (degree as u32 + 180) % 360;
    let implicate = degree;
    let orbital = compute_orbital_position(degree, tick12);

    state.live_quaternion = live_q;
    state.current_degree = degree;
    state.tick12 = tick12;
    state.orbital_position = orbital;
    state.last_cast_timestamp = timestamp;
    state.last_cast = Some(OracleFaces {
        primary_degree: degree,
        deficient_degree: deficient as u16,
        implicate_degree: implicate,
        temporal_hex,
        primary_hex,
        changing_lines_mask,
    });

    recompute_composed_quaternion_state(state);
    state.ql_position = if tick12 < 6 { tick12 } else { 11 - tick12 };

    state.micro_orbit.push(degree);
    if state.micro_orbit.len() > 360 {
        state.micro_orbit.remove(0);
    }

    let hex_a = DEGREE_TO_HEXAGRAM[(degree as usize) % 360];
    let codon_a = hex_a & 0x3F;
    let codon_b = primary_hex & 0x3F;
    let class_a = classify_codon(codon_a);
    let class_b = classify_codon(codon_b);
    state.active_codon = ActiveCodon {
        codon_a,
        codon_b,
        class_a,
        class_b,
        sequence_a: codon_sequence(codon_a),
        amino_acid: codon_to_amino_acid(codon_a),
        anticodon: wc_anticodon(codon_a),
        rotation_count_a: class_a.rotational_state_count(),
    };

    // Bounded cast-time lens reading (Architect 2026-07-19): the sky-at-cast
    // read through the pleromatic lens — cast-scoped record, composed law
    // untouched, nothing rides the tick. TWIN NOTE: the epi-cli TUI twin
    // (`portal::clock_state::update_from_cast`, its own local ClockState)
    // does NOT yet record this reading — flagged seam, lands with the
    // clock-state unification rather than as a half-port.
    let epsilon = if state.akasha_balance_epsilon > 0.0 {
        state.akasha_balance_epsilon
    } else {
        crate::lens_field::AKASHA_BALANCE_EPSILON_DEFAULT
    };
    state.last_cast_lens_reading = crate::lens_field::oracle_cast_reading(
        state,
        crate::pleroma_lens::PLEROMA_LENS_ID,
        epsilon,
    )
    .ok();

    state.generation += 1;
    sync_kernel_projection(state);
}

/// Full kairos update: set kairos, compute transit quaternion from element distribution,
/// and compute aspects.
pub fn update_kairos_full(state: &mut PortalClockState, kairos: KairosState) {
    // POSITION register (the ONE law, aspect.rs): the transit pole is the
    // sky's elemental posture — where the planets STAND, not what they are.
    state.transit_quaternion = crate::aspect::position_transit_quaternion(&kairos);

    state.kairos = kairos;
    compute_aspects(state);
    recompute_composed_quaternion_state(state);
    state.generation += 1;
    sync_kernel_projection(state);
}

/// Update quintessence quaternion after identity augment.
/// `profiles`: 5 x [FIRE, WATER, EARTH, AIR] from identity layers.
/// DUPLICATE-LAW NOTE (E6 verifier, 2026-07-02): this body is the same math
/// as epi-cli `portal::clock_state::quintessence_quaternion_from_profiles`
/// (the pure fn the TUI + S3 heartbeat share). Unification follow-up flagged
/// in the Sprint-8 plan — until then, any change to the filter/remap/
/// normalise law MUST land in both sites.
pub fn update_quintessence_quaternion(state: &mut PortalClockState, profiles: &[[f32; 4]; 5]) {
    let valid: Vec<_> = profiles
        .iter()
        .filter(|p| p.iter().any(|&v| v > f32::EPSILON))
        .collect();
    let n = valid.len() as f32;
    if n < f32::EPSILON {
        return;
    }

    let mut avg = [0.0f32; 4];
    for p in &valid {
        for i in 0..4 {
            avg[i] += p[i];
        }
    }
    let (w, x, y, z) = (avg[2] / n, avg[0] / n, avg[1] / n, avg[3] / n);
    let mag = (w * w + x * x + y * y + z * z).sqrt();
    if mag < f32::EPSILON {
        return;
    }
    state.quintessence_quaternion = [w / mag, x / mag, y / mag, z / mag];
    recompute_composed_quaternion_state(state);
    state.generation += 1;
    sync_kernel_projection(state);
}

/// Set the ambient environmental transform factor and recompute the composed
/// quaternion (DR-ENV-1/8). The `quintessence_quaternion` (PASU identity base) is
/// deliberately left untouched — the environment transforms the base, it never
/// becomes it. A near-zero env normalizes to the identity rotation, i.e. an honest
/// "no ambient influence" that composes as a pass-through. Unlike a clock advance
/// this does not bump `generation` — an ambient wind is a modulation, not a tick.
pub fn update_environment_quaternion(state: &mut PortalClockState, environment: [f32; 4]) {
    state.environment_quaternion = quat_normalize(environment);
    recompute_composed_quaternion_state(state);
    sync_kernel_projection(state);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn update_from_cast_populates_fields() {
        let mut state = PortalClockState::default();
        update_from_cast(&mut state, 2.0, 2.0, 1.0, 1.0, 90, 7, 12, 0b001100, 0);
        assert!(state.ql_position <= 5);
        assert_eq!(state.micro_orbit.len(), 1);
        assert_eq!(state.micro_orbit[0], 90);
        let _ = state.walk_mode.label();
    }

    // --- P3: q_environment composition onto the PASU base (DR-ENV-1/8) ---

    fn seeded_state() -> PortalClockState {
        let mut s = PortalClockState::default();
        s.quintessence_quaternion = quat_normalize([0.5, 0.3, 0.6, 0.2]);
        s.transit_quaternion = quat_normalize([0.9, 0.1, 0.2, 0.3]);
        s.live_quaternion = quat_normalize([0.2, 0.8, 0.1, 0.5]);
        s
    }

    #[test]
    fn environment_absent_preserves_prior_composed_behaviour_byte_for_byte() {
        // The default env is the identity rotation → composed must equal the prior
        // quintessence ⊗ transit ⊗ live law exactly (no ambient influence).
        let mut s = seeded_state();
        recompute_composed_quaternion_state(&mut s);
        let prior = quat_normalize(quat_mul(
            quat_mul(s.quintessence_quaternion, s.transit_quaternion),
            s.live_quaternion,
        ));
        assert_eq!(s.composed_quaternion, prior);
    }

    #[test]
    fn environment_transforms_composed_but_leaves_the_pasu_base_byte_stable() {
        let mut s = seeded_state();
        recompute_composed_quaternion_state(&mut s);
        let base_before = s.quintessence_quaternion;
        let composed_before = s.composed_quaternion;
        update_environment_quaternion(&mut s, quat_normalize([0.1, 0.9, 0.2, 0.3]));
        assert_eq!(
            s.quintessence_quaternion, base_before,
            "PASU base must not move under an ambient wind (DR-ENV-1)"
        );
        assert_ne!(
            s.composed_quaternion, composed_before,
            "composed must move under a real environment"
        );
    }

    #[test]
    fn dr_env_1_gate_fixed_base_changing_sky_moves_composed_not_identity() {
        // The standing gate re-run at every phase: fixed PASU base + changing
        // transit sky ⇒ q_identity (quintessence) byte-stable, Q_composed moves.
        let mut a = seeded_state();
        let mut b = seeded_state();
        update_environment_quaternion(&mut a, quat_normalize([0.9, 0.1, 0.0, 0.0]));
        update_environment_quaternion(&mut b, quat_normalize([0.0, 0.1, 0.9, 0.2]));
        assert_eq!(
            a.quintessence_quaternion, b.quintessence_quaternion,
            "the base is invariant across two different skies"
        );
        assert_ne!(
            a.composed_quaternion, b.composed_quaternion,
            "two different skies compose to two different states"
        );
    }

    #[test]
    fn a_near_zero_environment_is_an_honest_no_ambient_pass_through() {
        let mut with_zero = seeded_state();
        recompute_composed_quaternion_state(&mut with_zero);
        let prior = with_zero.composed_quaternion;
        update_environment_quaternion(&mut with_zero, [0.0, 0.0, 0.0, 0.0]);
        assert_eq!(with_zero.environment_quaternion, [1.0, 0.0, 0.0, 0.0]);
        assert_eq!(with_zero.composed_quaternion, prior);
    }

    #[test]
    fn composed_quaternion_is_unit_after_cast() {
        let mut state = PortalClockState::default();
        update_from_cast(&mut state, 3.0, 1.0, 1.0, 1.0, 45, 5, 10, 0, 0);
        let mag = (state.composed_quaternion[0].powi(2)
            + state.composed_quaternion[1].powi(2)
            + state.composed_quaternion[2].powi(2)
            + state.composed_quaternion[3].powi(2))
        .sqrt();
        assert!((mag - 1.0).abs() < 1e-4);
    }

    #[test]
    fn kairos_full_computes_transit() {
        let mut state = PortalClockState::default();
        let mut kairos = KairosState::default();
        kairos.planets[0].degree = 10;
        kairos.planets[1].degree = 100;
        kairos.planets[2].degree = 200;
        update_kairos_full(&mut state, kairos);
        let mag = (state.transit_quaternion[0].powi(2)
            + state.transit_quaternion[1].powi(2)
            + state.transit_quaternion[2].powi(2)
            + state.transit_quaternion[3].powi(2))
        .sqrt();
        assert!((mag - 1.0).abs() < 1e-4);
    }
}
