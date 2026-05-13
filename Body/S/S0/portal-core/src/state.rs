use crate::aspect::compute_aspects;
use crate::codon::{classify_codon, codon_sequence, codon_to_amino_acid, wc_anticodon};
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

    let composed = quat_normalize(quat_mul(
        quat_mul(state.quintessence_quaternion, state.transit_quaternion),
        live_q,
    ));
    state.composed_quaternion = composed;
    state.walk_mode = derive_walk_mode(composed);
    let (lambda, res) = derive_bifurcation(composed);
    state.bifurcation_param = lambda;
    state.resolution_level = res;
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

    state.generation += 1;
}

/// Full kairos update: set kairos, compute transit quaternion from element distribution,
/// and compute aspects.
pub fn update_kairos_full(state: &mut PortalClockState, kairos: KairosState) {
    let mut elem_counts = [0.0f32; 4];
    let mut valid_count = 0.0f32;
    for ps in &kairos.planets {
        if ps.degree == 0xFFFF {
            continue;
        }
        let sign = (ps.degree / 30) as usize % 12;
        let elem = sign % 4;
        let qi = match elem {
            0 => 1, // Fire -> x
            1 => 0, // Earth -> w
            2 => 3, // Air -> z
            3 => 2, // Water -> y
            _ => 0,
        };
        elem_counts[qi] += 1.0;
        valid_count += 1.0;
    }

    state.transit_quaternion = if valid_count > 0.0 {
        let raw = [
            elem_counts[0] / valid_count,
            elem_counts[1] / valid_count,
            elem_counts[2] / valid_count,
            elem_counts[3] / valid_count,
        ];
        quat_normalize(raw)
    } else {
        [1.0, 0.0, 0.0, 0.0]
    };

    state.kairos = kairos;
    compute_aspects(state);
    state.generation += 1;
}

/// Update quintessence quaternion after identity augment.
/// `profiles`: 5 x [FIRE, WATER, EARTH, AIR] from identity layers.
pub fn update_quintessence_quaternion(
    state: &mut PortalClockState,
    profiles: &[[f32; 4]; 5],
) {
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
    state.generation += 1;
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
