use serde::{Deserialize, Serialize};

use crate::profile_projections::{
    ElementalWeightProjection, LensOrbiterRelationProjection, MahamayaLensStack,
    PlanetApertureAspectEdge, PlanetPlanetAspectEdge,
};
use crate::types::{PlanetaryAspect, PortalClockState};

/// (angle_degrees, orb_degrees) for the 5 Ptolemaic aspects.
/// 0=conjunction, 1=sextile, 2=square, 3=trine, 4=opposition.
pub const ASPECT_ANGLES: [(u16, u8); 5] = [(0, 10), (60, 6), (90, 8), (120, 8), (180, 10)];

/// Human-readable label for each aspect index, ordered to match `ASPECT_ANGLES`.
pub const ASPECT_LABELS: [&str; 5] = ["conjunction", "sextile", "square", "trine", "opposition"];

// ─────────────────────────────────────────────────────────────────────────────
// Planetary elemental-weight feed (23.19)
//
// The nine planetary orbiters each project a single Mahabhuta element (mirroring
// the C `M2_PLANET_LUT[*].elem_sig` → `ELEM_SIG_GET_ELEMENT`). The Sun (index 0)
// is the stable identity root and is EXCLUDED — the 9:8 epogdoon asymmetry is
// intentional (9 orbiters : 8 chakras, Earth the witnessing ground). Each
// orbiter's contribution is weighted by its Keplerian velocity
// (`M2_PLANET_LUT[*].keplerian_vel`). AKASHA (aether / quintessence) is the
// fifth element — it informs balance but never lands in the four-element bar.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// THE TWO ELEMENTAL REGISTERS — one system, harmonized (Architect ruling
// 2026-07-19). Both live HERE so the law is navigable in one file:
//
//   NATURE register  — what each planet IS (intrinsic Mahabhuta via
//     `PLANET_ELEMENT_ID`), Keplerian-weighted, Sun excluded (9:8), AKASHA
//     out of the bar, aspect-amplified. Authority for the four-element BAR
//     (`planetary_elemental_weights`, 23.19) and every lens-field aggregate.
//   POSITION register — where each planet STANDS (the sign it occupies,
//     `degree/30 % 4` element cycle), equal-count, all positioned bodies.
//     Authority for the portal TRANSIT POSE (`position_transit_quaternion`),
//     i.e. the sky's elemental posture as a quaternion.
//
// They interoperate but never substitute: nature weights feed magnitude
// surfaces; position counts feed the transit pole of the composed state.
// Both fold into the ONE canonical quaternion basis [w=EARTH, x=FIRE,
// y=WATER, z=AIR]. The former inline copies of the position law in
// portal-core `state.rs::update_kairos_full` and epi-cli
// `portal/clock_state.rs::update_kairos_full` now DELEGATE here — the
// duplicate-law drift is retired at this seam.
// ─────────────────────────────────────────────────────────────────────────────

/// Element_Id per planet, mirroring `ELEM_SIG_GET_ELEMENT(M2_PLANET_LUT[i].elem_sig)`.
/// AKASHA=0, VAYU=1 (air), AGNI=2 (fire), APAS=3 (water), PRITHVI=4 (earth).
pub const PLANET_ELEMENT_ID: [u8; 10] = [
    2, // Sun     — AGNI (excluded as identity root)
    3, // Moon    — APAS  (water)
    1, // Mercury — VAYU  (air)
    3, // Venus   — APAS  (water)
    2, // Mars    — AGNI  (fire)
    2, // Jupiter — AGNI  (fire)
    4, // Saturn  — PRITHVI (earth)
    0, // Uranus  — AKASHA  (aether / quintessence)
    3, // Neptune — APAS  (water)
    4, // Pluto   — PRITHVI (earth)
];

/// Keplerian velocity per planet, mirroring `M2_PLANET_LUT[*].keplerian_vel`.
/// Units are arcsec/day x 10.
pub const PLANET_KEPLERIAN_VEL: [u16; 10] = [35999, 47270, 14739, 3600, 1886, 299, 120, 42, 21, 14];

/// First orbiter included in the feed — Sun (0) is the excluded identity root.
const FIRST_ORBITER: usize = 1;

/// POSITION register: fold the positioned sky into the transit-pose
/// quaternion. Every positioned body (Sun included — the pose reads the WHOLE
/// sky, unlike the nature bar) contributes 1.0 to the element of the SIGN it
/// occupies; counts normalize into the canonical basis [w=EARTH, x=FIRE,
/// y=WATER, z=AIR]. Empty sky → identity rotation (honest no-pose).
pub fn position_transit_quaternion(kairos: &crate::types::KairosState) -> [f32; 4] {
    let mut elem_counts = [0.0f32; 4]; // [w=EARTH, x=FIRE, y=WATER, z=AIR]
    let mut valid_count = 0.0f32;
    for ps in &kairos.planets {
        if ps.degree == 0xFFFF {
            continue;
        }
        let sign = (ps.degree / 30) as usize % 12;
        // Sign cycle Fire, Earth, Air, Water → canonical slots x, w, z, y.
        let qi = match sign % 4 {
            0 => 1, // Fire -> x
            1 => 0, // Earth -> w
            2 => 3, // Air -> z
            _ => 2, // Water -> y
        };
        elem_counts[qi] += 1.0;
        valid_count += 1.0;
    }
    if valid_count > 0.0 {
        let raw = [
            elem_counts[0] / valid_count,
            elem_counts[1] / valid_count,
            elem_counts[2] / valid_count,
            elem_counts[3] / valid_count,
        ];
        let mag = raw.iter().map(|v| v * v).sum::<f32>().sqrt();
        if mag > f32::EPSILON {
            return [raw[0] / mag, raw[1] / mag, raw[2] / mag, raw[3] / mag];
        }
    }
    [1.0, 0.0, 0.0, 0.0]
}

/// Canonical lowercase element name for an `Element_Id` (mirrors the C enum order).
pub fn element_name(element_id: u8) -> &'static str {
    match element_id {
        0 => "aether",
        1 => "air",
        2 => "fire",
        3 => "water",
        4 => "earth",
        _ => "aether",
    }
}

/// One orbiter's projection into the elemental feed: which element it carries and
/// the Keplerian velocity weight it projects.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlanetaryElementContribution {
    pub planet_id: u8,
    pub element: String,
    pub cou_energy: f32,
}

/// A serialisable handle for one aspect's amplification of the elemental field.
/// Harmonious aspects (conjunction/sextile/trine) gain positive; hard aspects
/// (square/opposition) gain negative (tension drains the projected weight).
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlanetaryAspectHandle {
    pub handle: String,
    pub planet_a: u8,
    pub planet_b: u8,
    pub aspect_type: u8,
    pub aspect_label: String,
    pub gain: f32,
}

/// The full feed surfaced to `kernelBridge.m2.planetaryElementalWeights()`.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlanetaryElementalWeights {
    pub weights: ElementalWeightProjection,
    pub per_planet: Vec<PlanetaryElementContribution>,
    pub aspect_gain: Vec<PlanetaryAspectHandle>,
}

/// Compute the live elemental-weight vector projected by the nine planetary
/// orbiters, plus each orbiter's contribution and the aspect-gain handles.
///
/// Pure-math: reads `state.kairos.planets` and `state.aspects`, mutates nothing.
/// `weights` are normalised fractions over the four elements after applying
/// aspect-derived amplification (sum ≈ 1.0 when any orbiter is positioned);
/// AKASHA energy is reported per-planet but kept out of the bar.
pub fn planetary_elemental_weights(state: &PortalClockState) -> PlanetaryElementalWeights {
    // Buckets indexed [fire, water, air, earth].
    let mut buckets = [0.0f32; 4];
    let mut per_planet = Vec::new();

    for planet in FIRST_ORBITER..10usize {
        if state.kairos.planets[planet].degree == 0xFFFF {
            continue;
        }
        let element_id = PLANET_ELEMENT_ID[planet];
        let cou_energy = PLANET_KEPLERIAN_VEL[planet] as f32;
        if let Some(bucket) = bucket_for_element(element_id) {
            buckets[bucket] += cou_energy;
        }
        per_planet.push(PlanetaryElementContribution {
            planet_id: planet as u8,
            element: element_name(element_id).to_string(),
            cou_energy,
        });
    }

    let mut aspect_state = state.clone();
    compute_aspects(&mut aspect_state);
    for aspect in &aspect_state.aspects {
        apply_aspect_gain(&mut buckets, aspect);
    }

    let total: f32 = buckets.iter().sum();
    let weights = if total > 0.0 {
        ElementalWeightProjection {
            fire: buckets[0] / total,
            water: buckets[1] / total,
            air: buckets[2] / total,
            earth: buckets[3] / total,
        }
    } else {
        ElementalWeightProjection {
            fire: 0.0,
            water: 0.0,
            air: 0.0,
            earth: 0.0,
        }
    };

    let aspect_gain = aspect_state
        .aspects
        .iter()
        .map(aspect_handle)
        .collect::<Vec<_>>();

    PlanetaryElementalWeights {
        weights,
        per_planet,
        aspect_gain,
    }
}

/// Map an `Element_Id` to its four-element bucket index, or `None` for AKASHA.
fn bucket_for_element(element_id: u8) -> Option<usize> {
    match element_id {
        2 => Some(0), // fire
        3 => Some(1), // water
        1 => Some(2), // air
        4 => Some(3), // earth
        _ => None,    // AKASHA / aether — quintessence, not a bar segment
    }
}

/// Apply the aspect engine's handle as weight amplification. Exact harmonious
/// aspects amplify the shared element strongly; hard aspects add cross-element
/// tension to each participant's element without inventing a fifth bar bucket.
fn apply_aspect_gain(buckets: &mut [f32; 4], aspect: &PlanetaryAspect) {
    if aspect.planet_a == 0 || aspect.planet_b == 0 {
        return;
    }
    let a = aspect.planet_a as usize;
    let b = aspect.planet_b as usize;
    if a >= PLANET_ELEMENT_ID.len() || b >= PLANET_ELEMENT_ID.len() {
        return;
    }
    let Some(bucket_a) = bucket_for_element(PLANET_ELEMENT_ID[a]) else {
        return;
    };
    let Some(bucket_b) = bucket_for_element(PLANET_ELEMENT_ID[b]) else {
        return;
    };

    let handle = aspect_handle(aspect);
    if handle.gain == 0.0 {
        return;
    }
    let base = ((PLANET_KEPLERIAN_VEL[a] as f32) + (PLANET_KEPLERIAN_VEL[b] as f32)) / 2.0;
    let delta = base * handle.gain.abs();

    if handle.gain > 0.0 && bucket_a == bucket_b {
        buckets[bucket_a] += delta;
        return;
    }

    buckets[bucket_a] += delta / 2.0;
    buckets[bucket_b] += delta / 2.0;
}

/// Build the gain handle for one aspect. Tighter orbs amplify; harmonious aspects
/// add, hard aspects subtract.
fn aspect_handle(aspect: &PlanetaryAspect) -> PlanetaryAspectHandle {
    let idx = aspect.aspect_type as usize;
    let (_, orb) = ASPECT_ANGLES.get(idx).copied().unwrap_or((0, 10));
    let label = ASPECT_LABELS.get(idx).copied().unwrap_or("aspect");
    // Tightness in [0,1]: exact aspect → 1.0, edge of orb → 0.0.
    let tightness = if orb > 0 {
        (1.0 - (aspect.orb / orb as f32)).clamp(0.0, 1.0)
    } else {
        0.0
    };
    // Harmonious: conjunction(0), sextile(1), trine(3); hard: square(2), opposition(4).
    let polarity = match aspect.aspect_type {
        0 | 1 | 3 => 1.0,
        _ => -1.0,
    };
    PlanetaryAspectHandle {
        handle: format!("aspect:{}:{}-{}", label, aspect.planet_a, aspect.planet_b),
        planet_a: aspect.planet_a,
        planet_b: aspect.planet_b,
        aspect_type: aspect.aspect_type,
        aspect_label: label.to_string(),
        gain: polarity * tightness,
    }
}

/// Compute all planetary aspects from current kairos state.
/// Pure-math version: mutates state directly, no Arc/Mutex.
pub fn compute_aspects(state: &mut PortalClockState) {
    let mut aspects = Vec::new();
    for a in 0..10u8 {
        let deg_a = state.kairos.planets[a as usize].degree;
        if deg_a == 0xFFFF {
            continue;
        }
        for b in (a + 1)..10u8 {
            let deg_b = state.kairos.planets[b as usize].degree;
            if deg_b == 0xFFFF {
                continue;
            }
            let diff = ((deg_a as i32) - (deg_b as i32)).unsigned_abs() as u16;
            let angular_diff = diff.min(360 - diff);
            for (idx, &(target, orb)) in ASPECT_ANGLES.iter().enumerate() {
                let diff_from_exact = (angular_diff as f32 - target as f32).abs();
                if diff_from_exact <= orb as f32 {
                    aspects.push(PlanetaryAspect {
                        planet_a: a,
                        planet_b: b,
                        aspect_type: idx as u8,
                        angle: angular_diff as f32,
                        orb: diff_from_exact,
                    });
                }
            }
        }
    }
    state.aspects = aspects;
}

/// Compute `kernelBridge.m2m3.lensOrbiterRelations()` from the kernel's kairos
/// and M3 lens-stack state. Planet↔planet edges are a direct `compute_aspects`
/// projection; planet↔aperture edges treat each active aperture boundary as the
/// second body while preserving the same aspect angles/orbs.
pub fn lens_orbiter_relations(
    state: &PortalClockState,
    lens_stack: &MahamayaLensStack,
) -> LensOrbiterRelationProjection {
    let mut aspect_state = state.clone();
    compute_aspects(&mut aspect_state);
    let planet_planet_edges = aspect_state
        .aspects
        .iter()
        .map(planet_planet_edge)
        .collect::<Vec<_>>();

    LensOrbiterRelationProjection {
        relation_handle: format!("m2m3://lens-orbiter/{}", lens_stack.stack_id),
        source: "portal-core::aspect::lens_orbiter_relations".to_owned(),
        planet_planet_edges,
        planet_aperture_edges: planet_aperture_edges(state, lens_stack),
        pending_dataset_badges: Vec::new(),
    }
}

fn planet_planet_edge(aspect: &PlanetaryAspect) -> PlanetPlanetAspectEdge {
    PlanetPlanetAspectEdge {
        planet_a: aspect.planet_a,
        planet_b: aspect.planet_b,
        aspect_type: aspect.aspect_type,
        angle: aspect.angle,
        orb: aspect.orb,
    }
}

fn planet_aperture_edges(
    state: &PortalClockState,
    lens_stack: &MahamayaLensStack,
) -> Vec<PlanetApertureAspectEdge> {
    if lens_stack.aperture_count == 0 {
        return Vec::new();
    }

    let mut edges = Vec::new();
    for planet in FIRST_ORBITER..10usize {
        let planet_degree = state.kairos.planets[planet].degree;
        if planet_degree == 0xFFFF {
            continue;
        }

        for &lens_id in &lens_stack.active_segments {
            let aperture_phase = aperture_boundary_degree(lens_id, lens_stack.aperture_count);
            let angular_diff = angular_difference(planet_degree, aperture_phase);
            for (idx, &(target, orb)) in ASPECT_ANGLES.iter().enumerate() {
                let diff_from_exact = (angular_diff as f32 - target as f32).abs();
                if diff_from_exact <= orb as f32 {
                    edges.push(PlanetApertureAspectEdge {
                        planet: planet as u8,
                        lens_id,
                        aperture_phase,
                        aspect_type: idx as u8,
                        orb: diff_from_exact,
                    });
                }
            }
        }
    }

    edges
}

fn aperture_boundary_degree(lens_id: u8, aperture_count: u8) -> u16 {
    ((lens_id as u32 * 360) / aperture_count as u32 % 360) as u16
}

fn angular_difference(a: u16, b: u16) -> u16 {
    let diff = ((a % 360) as i32 - (b % 360) as i32).unsigned_abs() as u16;
    diff.min(360 - diff)
}

#[cfg(test)]
mod lens_orbiter_relation_tests {
    use super::{compute_aspects, lens_orbiter_relations};
    use crate::profile_projections::MahamayaLensStack;
    use crate::types::{PlanetState, PortalClockState};

    fn fixed_state() -> PortalClockState {
        let mut state = PortalClockState::default();
        for (planet, degree) in [
            (0usize, 12u16),
            (1, 0),
            (2, 30),
            (3, 90),
            (4, 120),
            (5, 180),
            (6, 240),
            (7, 60),
            (8, 300),
            (9, 270),
        ] {
            state.kairos.planets[planet] = PlanetState {
                degree,
                ..PlanetState::default()
            };
        }
        state
    }

    fn lens_stack() -> MahamayaLensStack {
        MahamayaLensStack {
            stack_id: "m3-lens-stack:test".to_owned(),
            aperture_count: 16,
            active_segments: vec![0, 4, 8, 12],
            fibonacci_ground_ref: "m3://fibonacci-ground/test".to_owned(),
        }
    }

    #[test]
    fn planet_planet_edges_match_compute_aspects_for_fixed_kairos() {
        let state = fixed_state();
        let projection = lens_orbiter_relations(&state, &lens_stack());

        let mut expected_state = state.clone();
        compute_aspects(&mut expected_state);

        assert_eq!(
            projection.planet_planet_edges.len(),
            expected_state.aspects.len()
        );
        for (edge, aspect) in projection
            .planet_planet_edges
            .iter()
            .zip(expected_state.aspects.iter())
        {
            assert_eq!(edge.planet_a, aspect.planet_a);
            assert_eq!(edge.planet_b, aspect.planet_b);
            assert_eq!(edge.aspect_type, aspect.aspect_type);
            assert_eq!(edge.angle, aspect.angle);
            assert_eq!(edge.orb, aspect.orb);
        }
    }

    #[test]
    fn planet_aperture_edges_are_kernel_computed_from_active_boundaries() {
        let projection = lens_orbiter_relations(&fixed_state(), &lens_stack());

        assert!(
            !projection.planet_aperture_edges.is_empty(),
            "fixed kairos should generate planet-aperture relations"
        );
        assert!(
            projection
                .planet_aperture_edges
                .iter()
                .all(|edge| edge.planet != 0),
            "Sun is the identity root and must not be counted among the nine orbiters"
        );
        assert!(projection.planet_aperture_edges.iter().any(|edge| {
            edge.planet == 1
                && edge.lens_id == 0
                && edge.aperture_phase == 0
                && edge.aspect_type == 0
                && edge.orb == 0.0
        }));
        assert!(projection.planet_aperture_edges.iter().any(|edge| {
            edge.planet == 3
                && edge.lens_id == 4
                && edge.aperture_phase == 90
                && edge.aspect_type == 0
                && edge.orb == 0.0
        }));
    }

    #[test]
    fn outer_planets_are_canonical_ambient_condition_edges_not_pending_datasets() {
        let projection = lens_orbiter_relations(&fixed_state(), &lens_stack());

        assert_eq!(
            projection.pending_dataset_badges,
            Vec::new(),
            "DR-ENV-2 retires the 23.10 pending-dataset badge: Uranus/Neptune/Pluto are canonical ambient-condition edges"
        );
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn finds_conjunction() {
        let mut state = PortalClockState::default();
        state.kairos.planets[0].degree = 100;
        state.kairos.planets[1].degree = 105;
        compute_aspects(&mut state);
        assert!(!state.aspects.is_empty());
        assert_eq!(state.aspects[0].aspect_type, 0);
    }

    #[test]
    fn finds_opposition() {
        let mut state = PortalClockState::default();
        state.kairos.planets[0].degree = 10;
        state.kairos.planets[1].degree = 190;
        compute_aspects(&mut state);
        let opp = state.aspects.iter().find(|a| a.aspect_type == 4);
        assert!(opp.is_some());
    }

    #[test]
    fn elemental_weights_normalise_over_four_elements() {
        let mut state = PortalClockState::default();
        // Position every orbiter (and the excluded Sun) somewhere on the wheel.
        for planet in 0..10usize {
            state.kairos.planets[planet].degree = (planet as u16) * 15;
        }
        let feed = planetary_elemental_weights(&state);
        // Sun (0) excluded → nine orbiter contributions.
        assert_eq!(feed.per_planet.len(), 9);
        assert!(feed.per_planet.iter().all(|c| c.planet_id != 0));
        let sum = feed.weights.fire + feed.weights.water + feed.weights.air + feed.weights.earth;
        assert!(
            (sum - 1.0).abs() < 1e-4,
            "weights should sum to 1.0, got {sum}"
        );
        // Uranus carries AKASHA → reported per-planet but not stacked in the bar.
        let uranus = feed.per_planet.iter().find(|c| c.planet_id == 7).unwrap();
        assert_eq!(uranus.element, "aether");
    }

    #[test]
    fn elemental_weights_use_keplerian_reference_for_fixed_kairos() {
        let mut state = PortalClockState::default();
        state.kairos.planets[0].degree = 0; // Sun excluded.
        state.kairos.planets[1].degree = 0; // Moon -> water, velocity 47270
        state.kairos.planets[2].degree = 31; // Mercury -> air, velocity 14739
        state.kairos.planets[4].degree = 73; // Mars -> fire, velocity 1886

        let feed = planetary_elemental_weights(&state);
        let total = 47270.0 + 14739.0 + 1886.0;
        assert!((feed.weights.water - (47270.0 / total)).abs() < 1e-5);
        assert!((feed.weights.air - (14739.0 / total)).abs() < 1e-5);
        assert!((feed.weights.fire - (1886.0 / total)).abs() < 1e-5);
        assert_eq!(feed.weights.earth, 0.0);
        assert_eq!(
            feed.per_planet
                .iter()
                .find(|c| c.planet_id == 1)
                .unwrap()
                .cou_energy,
            47270.0
        );
    }

    #[test]
    fn unpositioned_orbiters_are_skipped() {
        let state = PortalClockState::default();
        let feed = planetary_elemental_weights(&state);
        assert!(feed.per_planet.is_empty());
        assert_eq!(feed.weights.fire, 0.0);
        assert_eq!(feed.weights.earth, 0.0);
    }

    #[test]
    fn aspect_gain_signs_track_harmony() {
        let mut state = PortalClockState::default();
        state.kairos.planets[1].degree = 100;
        state.kairos.planets[3].degree = 100; // conjunction → harmonious gain
        compute_aspects(&mut state);
        let feed = planetary_elemental_weights(&state);
        let conj = feed
            .aspect_gain
            .iter()
            .find(|h| h.aspect_type == 0)
            .expect("conjunction handle");
        assert!(conj.gain > 0.0, "conjunction should add gain");
        assert!(conj.handle.starts_with("aspect:conjunction:"));
    }

    #[test]
    fn exact_shared_element_aspect_amplifies_weight_vector_from_compute_aspects() {
        let mut state = PortalClockState::default();
        state.kairos.planets[1].degree = 100; // Moon → water, velocity 47270
        state.kairos.planets[3].degree = 100; // Venus → water, velocity 3600
        state.kairos.planets[2].degree = 250; // Mercury → air, velocity 14739

        let mut reference = state.clone();
        compute_aspects(&mut reference);
        assert!(reference
            .aspects
            .iter()
            .any(|a| a.planet_a == 1 && a.planet_b == 3 && a.aspect_type == 0 && a.orb == 0.0));

        let feed = planetary_elemental_weights(&state);
        assert!(feed
            .aspect_gain
            .iter()
            .any(|h| h.planet_a == 1 && h.planet_b == 3 && h.aspect_type == 0 && h.gain == 1.0));

        let amplified_water = 47270.0 + 3600.0 + ((47270.0 + 3600.0) / 2.0);
        let total = amplified_water + 14739.0;
        assert!((feed.weights.water - (amplified_water / total)).abs() < 1e-5);
        assert!((feed.weights.air - (14739.0 / total)).abs() < 1e-5);
    }
}
