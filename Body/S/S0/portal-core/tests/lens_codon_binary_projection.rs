use portal_core::{
    lens_codon_binary_projection, ClockDegreeNode, M3LensRole, M3_LENS_CODON_BINARY_SOURCE,
    M3_LENS_DIVISION_COUNT, M3_PRIMARY_GROUND_LENS_ID,
};

const I_CHING_VALUE: [i16; 4] = [6, 9, 7, 8];
const SLICES: [u16; 16] = [1, 2, 4, 8, 9, 10, 12, 15, 24, 30, 36, 40, 45, 90, 180, 360];

#[test]
fn all_sixteen_existing_lenses_round_trip_their_c_authored_boundary_degrees() {
    for lens_id in 0..M3_LENS_DIVISION_COUNT {
        let projection = lens_codon_binary_projection(lens_id).expect("valid clock lens");
        let slice = SLICES[lens_id as usize];
        let sections = 360 / slice;
        assert_eq!(projection.lens_id, lens_id);
        assert_eq!(projection.source, M3_LENS_CODON_BINARY_SOURCE);
        assert_eq!(projection.segment.len(), sections as usize);
        assert_eq!(projection.per_degree.len(), sections as usize);

        for (section, entry) in projection.per_degree.iter().enumerate() {
            let degree = section as u16 * slice;
            assert_eq!(projection.segment[section], degree);
            assert_eq!(entry.degree360, degree);
            assert_eq!(entry.exact_degree720, degree as f32 * 2.0);
            let clock = ClockDegreeNode::from_degree360(degree);
            assert_eq!(entry.codon_upper, clock.codon_upper_pair);
            assert_eq!(entry.codon_lower, clock.codon_lower_pair);
            assert_eq!(entry.codon_class, clock.codon_class);
            assert_eq!(entry.hexagram_id, clock.hexagram_id);
            assert_eq!(entry.line_change_operator, clock.hexagram_line_active);
            assert_eq!(entry.fibonacci_position, (degree / 6) as u8);
            assert!(entry.fibonacci_digit <= 9);
            assert_eq!(projection.grounding_lens_id, M3_PRIMARY_GROUND_LENS_ID);
            assert_eq!(projection.lens_role, M3LensRole::DerivedAperture);
            assert!(entry.codon_class <= 3);
            assert!(entry.element_m3_decan <= 4);
            assert!(entry.line_change_operator <= 5);

            let leading = ((entry.hexagram_id >> 4) & 0x03) as usize;
            let charge_sum = i16::from(entry.charges.pp)
                + i16::from(entry.charges.nn)
                + i16::from(entry.charges.np)
                + i16::from(entry.charges.pn);
            assert_eq!(charge_sum, 4 * I_CHING_VALUE[leading]);
            assert_eq!(
                entry.quaternion,
                [
                    f32::from(entry.charges.pp),
                    f32::from(entry.charges.nn),
                    f32::from(entry.charges.np),
                    f32::from(entry.charges.pn),
                ]
            );
        }
    }
}

#[test]
fn fibonacci_ground_is_the_addressable_primary_lens_that_grounds_the_sixteen() {
    let projection = lens_codon_binary_projection(M3_PRIMARY_GROUND_LENS_ID)
        .expect("Fibonacci Ground is the primary functional +1 lens");

    assert_eq!(projection.lens_id, M3_PRIMARY_GROUND_LENS_ID);
    assert_eq!(projection.grounding_lens_id, M3_PRIMARY_GROUND_LENS_ID);
    assert_eq!(projection.lens_role, M3LensRole::PrimaryGround);
    assert_eq!(projection.segment.len(), 60);
    assert_eq!(projection.per_degree.len(), 60);
    for (position, entry) in projection.per_degree.iter().enumerate() {
        assert_eq!(entry.degree360, position as u16 * 6);
        assert_eq!(entry.fibonacci_position, position as u8);
        assert_eq!(entry.fibonacci_phase01, 0.0);
    }

    assert!(lens_codon_binary_projection(M3_PRIMARY_GROUND_LENS_ID + 1).is_err());
}
