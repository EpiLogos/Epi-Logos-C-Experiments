//! Coordinate: M1 / M2 / M3 → M4-4-4-4 (ambient-conditions epi-genetic transform — the input head)
//! Residency: Body/S/S0/portal-core/src
//! Actualises: the ambient-input surface of [[M'-AMBIENT-EPIGENETIC-TRANSFORM-SPEC]]
//!   (DR-ENV-1/2/4/6/7). Live *ambient environmental conditions* — the collective
//!   sky's slow forces, outer/transpersonal planets the first populated band — are
//!   folded into an `env` quaternion, each condition **aspected against the natal
//!   invariant** and gained by its sensitivity. The result is a DISTINCT quaternion
//!   that TRANSFORMS the PASU base quaternion downstream; it is never `q_identity`
//!   (DR-ENV-1: no collapse — the transiting sky transforms, it does not identify).
//! Does NOT own: the composition onto the PASU base (personal_identity.rs /
//!   state.rs canonical site — a later phase), the codon-state expression
//!   (m3_quat_active_state), or the natal chart itself (PASU / birth data).

use crate::quaternion::quat_normalize;

/// The kind of ambient environmental condition. Planets are the first populated
/// band; the remaining variants are declared so the surface admits more inputs
/// from the start (DR-ENV-6 — build the full framework, not an outer-planet slice).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ConditionSource {
    /// A transpersonal (generational) planet: 7 = Uranus, 8 = Neptune, 9 = Pluto.
    /// These are the canonical ambient band — collective, not personal identity.
    TranspersonalPlanet(u8),
    /// Lunar node (Rahu / Ketu) — declared, not yet populated.
    LunarNode,
    /// Eclipse window — declared.
    Eclipse,
    /// Collective moon phase — declared.
    MoonPhase,
    /// Non-astrological ambient (season, geomagnetic, biometric) — declared.
    Ambient,
}

/// One live ambient condition: an environmental force the pratibimba is embedded
/// in, NOT part of its identity. Sky conditions carry an ecliptic `degree`; every
/// condition carries a `magnitude` (how present it is) and a per-condition
/// `sensitivity` gain (DR-ENV-7). It is only ever consumed AGAINST a natal
/// invariant, never written into one.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct EnvironmentalCondition {
    pub source: ConditionSource,
    /// Ecliptic degree 0..360 for sky conditions (the raw live position).
    pub degree: f32,
    /// Field strength 0..1 — how present this condition is.
    pub magnitude: f32,
    /// Per-condition gain on its transform contribution (DR-ENV-7).
    pub sensitivity: f32,
}

/// The natal invariant a condition is aspected AGAINST — the birth-time anchor
/// (a user's natal chart, or an entity's genesis constants). v1 anchor is the
/// natal Sun degree; this struct is the seam where richer natal references land.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct NatalReference {
    pub sun_degree: f32,
}

/// The Ptolemaic major aspects (degrees) an ambient condition can make to the
/// natal anchor, and the orb within which they count.
const MAJOR_ASPECTS: [f32; 5] = [0.0, 60.0, 90.0, 120.0, 180.0];
const ASPECT_ORB: f32 = 8.0;

/// Aspect strength (0..1) between a condition and the natal anchor: 1.0 at an
/// exact major aspect, falling linearly to 0 at the orb edge, 0 out of aspect.
/// This IS "computed against the personal invariants" (DR-ENV-7) — a condition
/// only transforms insofar as it engages the natal pattern.
fn aspect_strength(condition_degree: f32, natal_degree: f32) -> f32 {
    let d = (condition_degree - natal_degree).rem_euclid(360.0);
    let sep = if d > 180.0 { 360.0 - d } else { d };
    MAJOR_ASPECTS
        .iter()
        .map(|m| {
            let orb = (sep - m).abs();
            if orb <= ASPECT_ORB {
                1.0 - orb / ASPECT_ORB
            } else {
                0.0
            }
        })
        .fold(0.0, f32::max)
}

/// The quaternion axis a zodiac degree's element maps to — the SAME axis map the
/// transit quaternion uses (`update_kairos_full`): Fire→x, Earth→w, Air→z, Water→y.
fn element_axis(degree: f32) -> usize {
    let sign = ((degree.rem_euclid(360.0)) / 30.0) as usize % 12;
    match sign % 4 {
        0 => 1, // Fire  -> x
        1 => 0, // Earth -> w
        2 => 3, // Air   -> z
        _ => 2, // Water -> y
    }
}

/// Derive the environmental quaternion from the active ambient conditions, each
/// aspected against the natal invariant and gained by its sensitivity (DR-ENV-7).
///
/// The result is a DISTINCT quaternion (DR-ENV-1): it is composed as the
/// `q_environment` factor onto the PASU base downstream — it TRANSFORMS the base,
/// it is never `q_identity`. With no conditions (or none in aspect / zero
/// sensitivity) it is the identity rotation `[1,0,0,0]` — honest "no ambient
/// influence", transforming nothing, never a fabricated pull.
pub fn derive_env_quaternion(
    conditions: &[EnvironmentalCondition],
    natal: NatalReference,
) -> [f32; 4] {
    // accumulate weighted element mass on [w, x, y, z]
    let mut elem = [0.0f32; 4];
    let mut total = 0.0f32;
    for c in conditions {
        let weight = c.magnitude * c.sensitivity * aspect_strength(c.degree, natal.sun_degree);
        if weight <= 0.0 {
            continue;
        }
        elem[element_axis(c.degree)] += weight;
        total += weight;
    }
    if total <= f32::EPSILON {
        [1.0, 0.0, 0.0, 0.0]
    } else {
        quat_normalize(elem)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const IDENTITY: [f32; 4] = [1.0, 0.0, 0.0, 0.0];

    fn planet(degree: f32) -> EnvironmentalCondition {
        EnvironmentalCondition {
            source: ConditionSource::TranspersonalPlanet(9), // Pluto
            degree,
            magnitude: 1.0,
            sensitivity: 1.0,
        }
    }

    #[test]
    fn no_conditions_is_the_identity_rotation_never_a_fabricated_pull() {
        assert_eq!(
            derive_env_quaternion(&[], NatalReference { sun_degree: 0.0 }),
            IDENTITY
        );
    }

    #[test]
    fn a_condition_in_conjunction_to_natal_transforms_on_its_element_axis() {
        // Pluto at 10° Aries (Fire → x), exact conjunction to a natal Sun at 10°
        let env = derive_env_quaternion(&[planet(10.0)], NatalReference { sun_degree: 10.0 });
        assert_eq!(env, [0.0, 1.0, 0.0, 0.0]); // full weight on the x (Fire) axis
    }

    #[test]
    fn a_square_aspect_still_engages_the_natal_pattern() {
        // Pluto at 10°, natal Sun at 100° → separation 90° (a square) → in aspect
        let env = derive_env_quaternion(&[planet(10.0)], NatalReference { sun_degree: 100.0 });
        assert_ne!(env, IDENTITY);
    }

    #[test]
    fn out_of_aspect_is_no_transform_the_condition_does_not_engage_natal() {
        // separation 35° — no major aspect within orb → no transform (DR-ENV-7)
        let env = derive_env_quaternion(&[planet(10.0)], NatalReference { sun_degree: 45.0 });
        assert_eq!(env, IDENTITY);
    }

    #[test]
    fn zero_sensitivity_mutes_a_condition_entirely() {
        let mut c = planet(10.0);
        c.sensitivity = 0.0;
        let env = derive_env_quaternion(&[c], NatalReference { sun_degree: 10.0 });
        assert_eq!(env, IDENTITY);
    }

    #[test]
    fn the_env_quaternion_is_always_unit_when_conditions_are_active() {
        // Pluto in Aries (Fire→x) + a Neptune in Cancer (Water→y), both conjunct natal
        let neptune = EnvironmentalCondition {
            source: ConditionSource::TranspersonalPlanet(8),
            degree: 100.0, // Cancer → Water → y
            magnitude: 1.0,
            sensitivity: 1.0,
        };
        let env = derive_env_quaternion(
            &[planet(10.0), neptune],
            NatalReference { sun_degree: 10.0 },
        );
        // natal Sun at 10°: Pluto conjunct (sep 0), Neptune at sep 90 (square) — both engage
        let mag = (env.iter().map(|v| v * v).sum::<f32>()).sqrt();
        assert!((mag - 1.0).abs() < 1e-5, "env must be unit, got mag {mag}");
    }

    #[test]
    fn derivation_is_deterministic_under_the_same_conditions_and_natal() {
        let conds = [planet(10.0), planet(100.0)];
        let natal = NatalReference { sun_degree: 10.0 };
        assert_eq!(
            derive_env_quaternion(&conds, natal),
            derive_env_quaternion(&conds, natal)
        );
    }

    #[test]
    fn sensitivity_gains_relative_presence_across_conditions() {
        // two conditions on different axes; raising one's sensitivity biases the
        // env toward its axis — proving sensitivity is a real gain (DR-ENV-7)
        let natal = NatalReference { sun_degree: 10.0 };
        let fire = EnvironmentalCondition { source: ConditionSource::TranspersonalPlanet(9), degree: 10.0, magnitude: 1.0, sensitivity: 1.0 };
        let water = EnvironmentalCondition { source: ConditionSource::TranspersonalPlanet(8), degree: 100.0, magnitude: 1.0, sensitivity: 1.0 };
        let balanced = derive_env_quaternion(&[fire, water], natal);
        let fire_heavy = derive_env_quaternion(
            &[EnvironmentalCondition { sensitivity: 4.0, ..fire }, water],
            natal,
        );
        // x (Fire) share grows when Fire's sensitivity is raised
        assert!(fire_heavy[1] > balanced[1]);
    }
}
