// Coordinate: M3' generic lens-field dynamic — the shape every aperture shares.
// Residency: Body/S/S0/portal-core.
// Position (#n): #3 pattern / field carrier.
// Actualises: the generic per-lens field over all 16+1 functional lenses —
//             structure (parity opposition topology, 720-unit element law, ground
//             quantization) + live activation (objects→segments→elements) +
//             balance (quaternion identity, Akasha condition, channel balances).
//             Symbolic systems (pleroma@6, decans@5, …) are INSTANCES decorating
//             this generic field, never peers of it.
// Public surface: LensElement, LensOppositionTopology, LensGroundQuantization,
//                 LensFieldStructure/Activation types, lens_field_structure,
//                 lens_field_activation, balance_quaternion, segment_element_at,
//                 AKASHA_BALANCE_EPSILON_DEFAULT.
// Does NOT own: the 16-division table (phase_space), planetary element/velocity
//               LUTs and aspect gains (aspect.rs — the M2 feed stays the one
//               aggregate-weights authority), Fibonacci/Pisano law, symbolic
//               instance tables (pleroma_lens.rs), or wire dispatch.
// Contract: [[M3'-SPEC]] + 02-16-lenses spec "Generic Lens-Field Dynamic" +
//           `pleroma-30-syzygy-lens6-integration.md` (instance exemplar).

use serde::{Deserialize, Serialize};

use crate::aspect::{planetary_elemental_weights, PLANET_ELEMENT_ID, PLANET_KEPLERIAN_VEL};
use crate::kernel::projections::phase_space::{CLOCK_LENSES_16, PRIMARY_GROUND_LENS_ID};
use crate::profile_projections::ElementalWeightProjection;
use crate::quaternion::Quaternion;
use crate::types::PortalClockState;

/// Default epsilon for the Akasha balance condition: maximum deviation of any
/// normalized element weight from the balanced 0.25. Tunable-schema migration
/// is a flagged follow-up; until then this is the documented default.
pub const AKASHA_BALANCE_EPSILON_DEFAULT: f32 = 0.05;

/// The four elements as carried by the Ring-1 zodiacal cycle (cosmic-clock
/// spec §2.2 — Fire/Earth/Air/Water from Aries).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum LensElement {
    Fire,
    Earth,
    Air,
    Water,
}

impl LensElement {
    /// Same-polarity, cross-mobility complement (M3 Matrix-2): Fire↔Air (yang,
    /// T↔G), Earth↔Water (yin, C↔A). For every diameter-paired lens, partner
    /// segments carry cross-complements (midpoint +360 in 720-units → +6 signs
    /// → element index +2 mod 4).
    pub const fn cross_complement(self) -> LensElement {
        match self {
            LensElement::Fire => LensElement::Air,
            LensElement::Air => LensElement::Fire,
            LensElement::Earth => LensElement::Water,
            LensElement::Water => LensElement::Earth,
        }
    }

    pub const fn name(self) -> &'static str {
        match self {
            LensElement::Fire => "fire",
            LensElement::Earth => "earth",
            LensElement::Air => "air",
            LensElement::Water => "water",
        }
    }
}

/// Opposition topology by section parity — the # inversion's shape at each lens.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case", tag = "kind")]
pub enum LensOppositionTopology {
    /// Even sections: segment i pairs with i + N/2 across a diameter — the
    /// generic syzygy shape (N/2 channels).
    DiameterPaired { channels: u16 },
    /// Odd sections (>1): the polar opposite of every segment midpoint lands
    /// exactly ON a boundary between two segments — threshold opposition.
    BoundaryOpposed,
    /// N = 1 (Unity): the lens is its own opposite.
    SelfOpposed,
}

impl LensOppositionTopology {
    pub const fn for_sections(sections: u16) -> Self {
        if sections == 1 {
            LensOppositionTopology::SelfOpposed
        } else if sections % 2 == 0 {
            LensOppositionTopology::DiameterPaired {
                channels: sections / 2,
            }
        } else {
            LensOppositionTopology::BoundaryOpposed
        }
    }
}

/// Fibonacci-ground quantization: a lens inherits whole 6° ground steps iff
/// 6 | slice. Lens 6 (slice 12) is the FINEST integral lens — the half-ground —
/// which is why the pleromatic instance seats there.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case", tag = "kind")]
pub enum LensGroundQuantization {
    Integral { steps_per_segment: u16 },
    Fractional,
}

impl LensGroundQuantization {
    pub const fn for_slice(slice: u16) -> Self {
        if slice % 6 == 0 {
            LensGroundQuantization::Integral {
                steps_per_segment: slice / 6,
            }
        } else {
            LensGroundQuantization::Fractional
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct LensFieldError {
    pub lens_id: u8,
}

impl std::fmt::Display for LensFieldError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "lensId {} outside functional M3 lenses 0..16", self.lens_id)
    }
}

impl std::error::Error for LensFieldError {}

/// (slice°, sections) for any functional lens id 0..=16.
pub fn lens_slice_sections(lens_id: u8) -> Result<(u16, u16), LensFieldError> {
    if lens_id == PRIMARY_GROUND_LENS_ID {
        return Ok((6, 60));
    }
    CLOCK_LENSES_16
        .get(lens_id as usize)
        .map(|lens| (lens.slice, lens.sections))
        .ok_or(LensFieldError { lens_id })
}

/// The 720-unit midpoint law: midpoint of segment k in half-degree units is
/// (2k+1)·slice — INTEGRAL for every lens (the SU(2) double-cover is exactly
/// what makes every lens midpoint exact; in 360° units the 1° lens midpoints
/// would need halves).
pub fn segment_midpoint_720(slice: u16, segment: u16) -> u16 {
    ((2 * segment + 1) * slice) % 720
}

/// Generic element law: the Ring-1 sign element at the segment midpoint,
/// computed in 720-units (sign spans 60 such units). For lens 6 this reduces
/// to the pleromatic law ⌊(12k+6)/30⌋.
pub fn segment_element_at(slice: u16, segment: u16) -> LensElement {
    let sign = (u32::from(segment_midpoint_720(slice, segment)) / 60) % 12;
    match sign % 4 {
        0 => LensElement::Fire,
        1 => LensElement::Earth,
        2 => LensElement::Air,
        _ => LensElement::Water,
    }
}

/// One segment of a lens field's static structure.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LensSegmentField {
    pub segment: u16,
    pub start_degree: u16,
    pub midpoint720: u16,
    pub element: LensElement,
}

/// The static (state-free) field structure of one functional lens.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LensFieldStructure {
    pub lens_id: u8,
    pub grounding_lens_id: u8,
    pub slice: u16,
    pub sections: u16,
    pub topology: LensOppositionTopology,
    pub ground_quantization: LensGroundQuantization,
    pub segments: Vec<LensSegmentField>,
}

pub fn lens_field_structure(lens_id: u8) -> Result<LensFieldStructure, LensFieldError> {
    let (slice, sections) = lens_slice_sections(lens_id)?;
    let segments = (0..sections)
        .map(|segment| LensSegmentField {
            segment,
            start_degree: segment * slice,
            midpoint720: segment_midpoint_720(slice, segment),
            element: segment_element_at(slice, segment),
        })
        .collect();
    Ok(LensFieldStructure {
        lens_id,
        grounding_lens_id: PRIMARY_GROUND_LENS_ID,
        slice,
        sections,
        topology: LensOppositionTopology::for_sections(sections),
        ground_quantization: LensGroundQuantization::for_slice(slice),
        segments,
    })
}

/// One positioned orbiter's landing in a lens field (base positional energy —
/// aspect gains are element-level planet-pair phenomena and stay in the M2
/// aggregate authority, never localized to one segment).
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LensPlanetLanding {
    pub planet_id: u8,
    pub segment: u16,
    pub element: String,
    pub cou_energy: f32,
    pub akasha_carrier: bool,
}

/// One diameter channel's signed live balance (DiameterPaired lenses only):
/// prior-half segment energy minus consort-half segment energy.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LensChannelBalance {
    pub channel: u16,
    pub prior_segment: u16,
    pub consort_segment: u16,
    pub prior_element: LensElement,
    pub consort_element: LensElement,
    pub signed_balance: f32,
}

/// The live activation of one lens field. `weights_total` DELEGATES to the M2
/// planetary-elemental feed (the one aspect-amplified aggregate authority);
/// per-segment landings and channel balances are base positional energies.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LensFieldActivation {
    pub lens_id: u8,
    pub positioned_orbiters: u8,
    pub weights_total: ElementalWeightProjection,
    pub landings: Vec<LensPlanetLanding>,
    pub channel_balances: Vec<LensChannelBalance>,
    pub akasha_presence: f32,
    pub akasha_epsilon: f32,
    /// None when no orbiter is positioned — an honest absence, never fabricated.
    pub akasha_condition: Option<bool>,
}

/// First orbiter included — Sun (0) is the excluded identity root (9:8 law).
const FIRST_ORBITER: usize = 1;

pub fn lens_field_activation(
    state: &PortalClockState,
    lens_id: u8,
    akasha_epsilon: f32,
) -> Result<LensFieldActivation, LensFieldError> {
    let (slice, sections) = lens_slice_sections(lens_id)?;
    let mut landings = Vec::new();
    let mut segment_energy = vec![0.0f32; sections as usize];
    let mut akasha_presence = 0.0f32;
    let mut positioned = 0u8;

    for planet in FIRST_ORBITER..10usize {
        let degree = state.kairos.planets[planet].degree;
        if degree == 0xFFFF {
            continue;
        }
        positioned += 1;
        let segment = (degree % 360) / slice;
        let element_id = PLANET_ELEMENT_ID[planet];
        let cou_energy = PLANET_KEPLERIAN_VEL[planet] as f32;
        let akasha_carrier = element_id == 0;
        if akasha_carrier {
            // AKASHA informs balance but never lands in a segment bucket
            // (mirrors the M2 feed's bar exclusion).
            akasha_presence += cou_energy;
        } else {
            segment_energy[segment as usize] += cou_energy;
        }
        landings.push(LensPlanetLanding {
            planet_id: planet as u8,
            segment,
            element: crate::aspect::element_name(element_id).to_string(),
            cou_energy,
            akasha_carrier,
        });
    }

    let channel_balances = match LensOppositionTopology::for_sections(sections) {
        LensOppositionTopology::DiameterPaired { channels } => (0..channels)
            .map(|channel| {
                let prior = channel;
                let consort = channel + channels;
                LensChannelBalance {
                    channel,
                    prior_segment: prior,
                    consort_segment: consort,
                    prior_element: segment_element_at(slice, prior),
                    consort_element: segment_element_at(slice, consort),
                    signed_balance: segment_energy[prior as usize]
                        - segment_energy[consort as usize],
                }
            })
            .collect(),
        _ => Vec::new(),
    };

    let weights_total = planetary_elemental_weights(state).weights;
    let akasha_condition = if positioned == 0 {
        None
    } else {
        let deviations = [
            weights_total.fire,
            weights_total.water,
            weights_total.air,
            weights_total.earth,
        ]
        .map(|w| (w - 0.25).abs());
        Some(deviations.iter().all(|d| *d <= akasha_epsilon))
    };

    Ok(LensFieldActivation {
        lens_id,
        positioned_orbiters: positioned,
        weights_total,
        landings,
        channel_balances,
        akasha_presence,
        akasha_epsilon,
        akasha_condition,
    })
}

/// The bounded oracle-cast lens reading (Architect ruling 2026-07-19: cast-time,
/// never tick-time). Computed inside `update_from_cast` against the sky-at-cast
/// and recorded on the clock state — the composed-quaternion law is untouched;
/// this is a cast-scoped record feeding the reading/medicine chain. The lens is
/// fixed at the pleromatic 6 pending an active-lens selection seam.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CastLensReading {
    pub lens_id: u8,
    pub positioned_orbiters: u8,
    pub balance_quaternion: Quaternion,
    /// Signed per-channel balances (15 for the pleromatic lens) — the live
    /// planetary-energy register of the syzygy channels.
    pub channel_balances: Vec<f32>,
    pub akasha_presence: f32,
    pub akasha_epsilon: f32,
    /// None = honest absence (no positioned orbiters at cast).
    pub akasha_condition: Option<bool>,
}

pub fn oracle_cast_reading(
    state: &PortalClockState,
    lens_id: u8,
    akasha_epsilon: f32,
) -> Result<CastLensReading, LensFieldError> {
    let activation = lens_field_activation(state, lens_id, akasha_epsilon)?;
    Ok(CastLensReading {
        lens_id,
        positioned_orbiters: activation.positioned_orbiters,
        balance_quaternion: balance_quaternion(&activation.weights_total),
        channel_balances: activation
            .channel_balances
            .iter()
            .map(|c| c.signed_balance)
            .collect(),
        akasha_presence: activation.akasha_presence,
        akasha_epsilon,
        akasha_condition: activation.akasha_condition,
    })
}

/// The balance-quaternion identity: `ElementalWeightProjection` maps DIRECTLY
/// onto the canonical quaternion basis `[w=EARTH, x=FIRE, y=WATER, z=AIR]`
/// (canonical primitive vocab). Normalized; the zero field maps to the
/// identity quaternion. This is the per-lens q_cosmic refinement carrier:
/// personal resonance at lens L = PersonalResonance(q_personal,
/// balance_quaternion(weights at L)) — library-level, protected surface only.
pub fn balance_quaternion(weights: &ElementalWeightProjection) -> Quaternion {
    let q = [weights.earth, weights.fire, weights.water, weights.air];
    let norm = q.iter().map(|v| v * v).sum::<f32>().sqrt();
    if norm <= f32::EPSILON {
        return [1.0, 0.0, 0.0, 0.0];
    }
    [q[0] / norm, q[1] / norm, q[2] / norm, q[3] / norm]
}
