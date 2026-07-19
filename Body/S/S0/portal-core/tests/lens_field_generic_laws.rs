// Coordinate: M3' generic lens-field laws — proof suite for the shape every aperture shares.
// Residency: Body/S/S0/portal-core/tests.
// Position (#n): #3 pattern / verification.
// Actualises: the "Generic Lens-Field Dynamic" canon — parity opposition topology,
//             720-unit midpoint/element law, ground quantization, activation and
//             balance laws — over all 16+1 functional lenses, with the pleromatic
//             instance proven to be the generic law specialized at Lens 6.
// Public surface: test binary only.
// Does NOT own: the laws (src/lens_field.rs) or instance tables (src/pleroma_lens.rs).
// Contract: [[M3'-SPEC]] / 02-16-lenses "Generic Lens-Field Dynamic" (2026-07-19).

use portal_core::lens_field::{
    balance_quaternion, lens_field_activation, lens_field_structure, lens_slice_sections,
    segment_element_at, segment_midpoint_720, LensElement, LensGroundQuantization,
    LensOppositionTopology, AKASHA_BALANCE_EPSILON_DEFAULT,
};
use portal_core::pleroma_lens::{pleroma_instance_packet, segment_element, PleromaLayout};
use portal_core::profile_projections::ElementalWeightProjection;
use portal_core::types::{PlanetState, PortalClockState};

const FUNCTIONAL_LENS_IDS: std::ops::RangeInclusive<u8> = 0..=16;

#[test]
fn all_seventeen_functional_lenses_resolve_and_id_17_is_refused() {
    for lens_id in FUNCTIONAL_LENS_IDS {
        let structure = lens_field_structure(lens_id).expect("functional lens resolves");
        let (slice, sections) = lens_slice_sections(lens_id).unwrap();
        assert_eq!(u32::from(slice) * u32::from(sections), 360);
        assert_eq!(structure.segments.len(), sections as usize);
        assert_eq!(structure.grounding_lens_id, 16);
    }
    assert!(lens_field_structure(17).is_err(), "id 17 refused (16+1 sealed law)");
}

#[test]
fn parity_law_exactly_four_lenses_are_not_diameter_paired() {
    // The # inversion's shape at each lens: 12 even-section lenses pair across
    // diameters; the 4 odd-section members of the 4x4 matrix do not — three are
    // boundary-opposed (45, 15, 9 sections) and Unity (1) is self-opposed.
    let mut boundary = Vec::new();
    let mut self_opposed = Vec::new();
    for lens_id in FUNCTIONAL_LENS_IDS {
        let structure = lens_field_structure(lens_id).unwrap();
        match structure.topology {
            LensOppositionTopology::DiameterPaired { channels } => {
                assert_eq!(channels, structure.sections / 2);
            }
            LensOppositionTopology::BoundaryOpposed => boundary.push(lens_id),
            LensOppositionTopology::SelfOpposed => self_opposed.push(lens_id),
        }
    }
    assert_eq!(boundary, vec![3, 8, 11], "45/15/9-section lenses are boundary-opposed");
    assert_eq!(self_opposed, vec![15], "Unity is its own opposite");
}

#[test]
fn the_720_unit_midpoint_law_is_integral_for_every_lens() {
    // In 360° units the Microscopic lens midpoints would need halves; the SU(2)
    // double-cover is exactly what makes every lens midpoint exact.
    for lens_id in FUNCTIONAL_LENS_IDS {
        let (slice, sections) = lens_slice_sections(lens_id).unwrap();
        for segment in 0..sections {
            let midpoint = segment_midpoint_720(slice, segment);
            assert_eq!(
                u32::from(midpoint) % (2 * u32::from(slice)),
                u32::from(slice),
                "midpoint of lens {lens_id} segment {segment} is the odd multiple of its slice"
            );
        }
    }
}

#[test]
fn element_complement_theorem_holds_for_every_diameter_paired_lens() {
    // Partner midpoints differ by 360 in 720-units → +6 signs → element +2 mod 4:
    // every diameter pairs Fire↔Air or Earth↔Water, at EVERY even lens — the
    // pleromatic syzygy complement is the Lens-6 instance of this generic law.
    for lens_id in FUNCTIONAL_LENS_IDS {
        let structure = lens_field_structure(lens_id).unwrap();
        if let LensOppositionTopology::DiameterPaired { channels } = structure.topology {
            for channel in 0..channels {
                let prior = segment_element_at(structure.slice, channel);
                let consort = segment_element_at(structure.slice, channel + channels);
                assert_eq!(consort, prior.cross_complement(), "lens {lens_id} channel {channel}");
            }
        }
    }
}

#[test]
fn ground_quantization_is_integral_exactly_where_six_divides_slice() {
    let mut integral = Vec::new();
    for lens_id in FUNCTIONAL_LENS_IDS {
        let structure = lens_field_structure(lens_id).unwrap();
        match structure.ground_quantization {
            LensGroundQuantization::Integral { steps_per_segment } => {
                assert_eq!(steps_per_segment, structure.slice / 6);
                integral.push((lens_id, steps_per_segment));
            }
            LensGroundQuantization::Fractional => {
                assert_ne!(structure.slice % 6, 0);
            }
        }
    }
    // Lenses 6/8/9/10/13/14/15 (slices 12/24/30/36/90/180/360) + the ground itself.
    assert_eq!(
        integral,
        vec![(6, 2), (8, 4), (9, 5), (10, 6), (13, 15), (14, 30), (15, 60), (16, 1)]
    );
    // Lens 6 is the FINEST integral derived lens — the half-ground; this is why
    // the pleromatic instance seats there.
    assert_eq!(integral.iter().filter(|(id, _)| *id != 16).map(|(_, s)| *s).min(), Some(2));
}

#[test]
fn the_pleromatic_element_law_is_the_generic_law_at_lens_6() {
    for segment in 0..30u8 {
        assert_eq!(segment_element(segment), segment_element_at(12, u16::from(segment)));
    }
    // Canon spot anchors (Ring-1): 6°=Aries/Fire, 90°=Cancer/Water,
    // 270°=Capricorn/Earth, 354°=Pisces/Water.
    assert_eq!(segment_element_at(12, 0), LensElement::Fire);
    assert_eq!(segment_element_at(12, 7), LensElement::Water);
    assert_eq!(segment_element_at(12, 22), LensElement::Earth);
    assert_eq!(segment_element_at(12, 29), LensElement::Water);
}

#[test]
fn unpositioned_kairos_yields_honest_absence_never_fabrication() {
    let state = PortalClockState::default(); // all planets 0xFFFF
    for lens_id in FUNCTIONAL_LENS_IDS {
        let activation =
            lens_field_activation(&state, lens_id, AKASHA_BALANCE_EPSILON_DEFAULT).unwrap();
        assert_eq!(activation.positioned_orbiters, 0);
        assert!(activation.landings.is_empty());
        assert_eq!(activation.akasha_condition, None, "no verdict without positioned orbiters");
        assert!(activation
            .channel_balances
            .iter()
            .all(|c| c.signed_balance == 0.0));
    }
}

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

#[test]
fn activation_landings_follow_the_segment_law_and_akasha_stays_out_of_buckets() {
    let state = fixed_state();
    let activation =
        lens_field_activation(&state, 6, AKASHA_BALANCE_EPSILON_DEFAULT).unwrap();
    // Sun (identity root) excluded: 9 orbiters positioned.
    assert_eq!(activation.positioned_orbiters, 9);
    assert_eq!(activation.landings.len(), 9);
    for landing in &activation.landings {
        let expected_segment = (state.kairos.planets[landing.planet_id as usize].degree % 360) / 12;
        assert_eq!(landing.segment, expected_segment);
        assert_ne!(landing.planet_id, 0, "Sun never lands (9:8 law)");
    }
    // Uranus (planet 7, AKASHA carrier) informs presence, never a bucket.
    let uranus = activation.landings.iter().find(|l| l.planet_id == 7).unwrap();
    assert!(uranus.akasha_carrier);
    assert_eq!(uranus.element, "aether");
    assert!(activation.akasha_presence > 0.0);
    // Channel-balance conservation: totals decompose across the 15 channels.
    assert_eq!(activation.channel_balances.len(), 15);
    let channel_sum: f32 = activation
        .channel_balances
        .iter()
        .map(|c| c.signed_balance)
        .sum();
    let hemispheric: f32 = activation
        .landings
        .iter()
        .filter(|l| !l.akasha_carrier)
        .map(|l| if l.segment < 15 { l.cou_energy } else { -l.cou_energy })
        .sum();
    assert!((channel_sum - hemispheric).abs() < 1e-3);
    // The aggregate bar is the M2 feed's authority (aspect-amplified), delegated.
    let m2 = portal_core::planetary_elemental_weights(&state).weights;
    assert_eq!(activation.weights_total, m2);
    assert!(activation.akasha_condition.is_some());
}

#[test]
fn balance_quaternion_is_the_canonical_basis_identity() {
    // ElementalWeightProjection ≅ quaternion4 [w=EARTH, x=FIRE, y=WATER, z=AIR].
    let weights = ElementalWeightProjection {
        fire: 0.4,
        water: 0.3,
        air: 0.2,
        earth: 0.1,
    };
    let q = balance_quaternion(&weights);
    assert!((q[0] / q[1] - 0.25).abs() < 1e-6, "w:x = earth:fire");
    assert!((q[2] / q[3] - 1.5).abs() < 1e-6, "y:z = water:air");
    let norm: f32 = q.iter().map(|v| v * v).sum();
    assert!((norm - 1.0).abs() < 1e-6, "normalized");
    // The zero field maps to the identity quaternion, not a NaN.
    let zero = ElementalWeightProjection {
        fire: 0.0,
        water: 0.0,
        air: 0.0,
        earth: 0.0,
    };
    assert_eq!(balance_quaternion(&zero), [1.0, 0.0, 0.0, 0.0]);
}

#[test]
fn pleroma_instance_packet_decorates_the_generic_field_consistently() {
    for layout in [PleromaLayout::Interleaved456, PleromaLayout::Emanation] {
        let packet = pleroma_instance_packet(layout);
        assert_eq!(packet.kind, "pleroma");
        assert_eq!(packet.seats.len(), 30);
        assert_eq!(packet.syzygies.len(), 15);
        // Seat elements agree with the generic Lens-6 structure.
        let structure = lens_field_structure(6).unwrap();
        for seat in &packet.seats {
            assert_eq!(seat.element, structure.segments[seat.segment as usize].element);
        }
        // Syzygy channels agree with the generic diameter pairing and carry the
        // proven digit-sum law (13x20 + 2x10 = 280).
        let total: u16 = packet.syzygies.iter().map(|s| s.digit_sum).sum();
        assert_eq!(total, 280);
        assert_eq!(packet.syzygies.iter().filter(|s| s.threshold).count(), 2);
        for syzygy in &packet.syzygies {
            assert_eq!(
                syzygy.consort_element,
                syzygy.prior_element.cross_complement()
            );
        }
    }
    // Layout defaults and anchors: Bythos opens the default layout; Sophia sits
    // one seat shy of the seam (interleaved) and ON the seam (emanation).
    let default_packet = pleroma_instance_packet(PleromaLayout::default());
    assert_eq!(default_packet.layout, "interleaved456");
    assert_eq!(default_packet.seats[0].aeon, "Bythos");
    assert_eq!(default_packet.seats[28].aeon, "Sophia");
    let emanation = pleroma_instance_packet(PleromaLayout::Emanation);
    assert_eq!(emanation.seats[29].aeon, "Sophia");
}

#[test]
fn oracle_cast_records_the_bounded_pleromatic_reading() {
    // Architect ruling 2026-07-19: cast-time, never tick-time. A cast on an
    // unpositioned sky records the reading with honest-null Akasha; the
    // composed-quaternion law is untouched by the recording.
    let mut state = PortalClockState::default();
    assert!(state.last_cast_lens_reading.is_none());
    let before = state.composed_quaternion;
    portal_core::update_from_cast(&mut state, 2.0, 2.0, 1.0, 1.0, 90, 7, 12, 0, 0);
    let reading = state.last_cast_lens_reading.as_ref().expect("cast records the reading");
    assert_eq!(reading.lens_id, 6);
    assert_eq!(reading.channel_balances.len(), 15);
    assert_eq!(reading.akasha_condition, None, "honest-null without positioned orbiters");
    assert_eq!(reading.akasha_epsilon, AKASHA_BALANCE_EPSILON_DEFAULT, "unset state falls back");
    // The recording itself adds no fifth pole: composed still = base x env x transit x live.
    assert_ne!(state.composed_quaternion, before, "cast updated live pole as ever");
}

#[test]
fn transit_pole_delegates_to_the_one_position_register_law() {
    let mut state = PortalClockState::default();
    let mut kairos = state.kairos.clone();
    kairos.planets[0].degree = 15; // Aries -> Fire
    kairos.planets[3].degree = 95; // Cancer -> Water
    let expected = portal_core::aspect::position_transit_quaternion(&kairos);
    portal_core::update_kairos_full(&mut state, kairos);
    assert_eq!(state.transit_quaternion, expected);
}
