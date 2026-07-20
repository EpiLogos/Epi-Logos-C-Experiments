use portal_core::{
    classify_codon, lens_codon_binary_projection, ClockDegreeNode, M3LensRole,
    M3_LENS_CODON_BINARY_SOURCE, M3_LENS_DIVISION_COUNT, M3_PRIMARY_GROUND_LENS_ID,
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
            assert_eq!(entry.codon_upper, (clock.hexagram_id >> 4) & 0x03);
            assert_eq!(entry.codon_middle, (clock.hexagram_id >> 2) & 0x03);
            assert_eq!(entry.codon_lower, clock.hexagram_id & 0x03);
            assert_eq!(
                entry.codon_pairs,
                [entry.codon_upper, entry.codon_middle, entry.codon_lower]
            );
            assert_eq!(
                entry.codon_pair_bits,
                entry.codon_pairs.map(|pair| format!("{pair:02b}"))
            );
            assert_eq!(entry.codon6_bit, clock.hexagram_id);
            let codon_class = classify_codon(entry.codon6_bit);
            assert_eq!(entry.codon_class, codon_class as u8);
            assert_eq!(entry.codon_class_label, codon_class.label());
            assert_eq!(entry.hexagram_id, clock.hexagram_id);
            assert_eq!(entry.line_change_operator, clock.hexagram_line_active);
            assert_eq!(entry.line_change_hops.len(), 6);
            for (line, hop) in entry.line_change_hops.iter().enumerate() {
                assert_eq!(hop.line, line as u8);
                assert_eq!(
                    hop.operator_address,
                    u16::from(entry.hexagram_id) * 6 + line as u16
                );
                assert_eq!(hop.from_hexagram_id, entry.hexagram_id);
                assert_eq!(hop.to_hexagram_id, entry.hexagram_id ^ (1u8 << line));
            }
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
            assert_eq!(entry.four_x, charge_sum);
            assert!(entry.x_logic_invariant);
            assert_eq!(
                entry.charge_identity[0].x_permutation,
                portal_core::XPermutation::X2
            );
            assert_eq!(
                entry.charge_identity[1].x_permutation,
                portal_core::XPermutation::X1
            );
            assert_eq!(
                entry.charge_identity[2].x_permutation,
                portal_core::XPermutation::X4
            );
            assert_eq!(
                entry.charge_identity[3].x_permutation,
                portal_core::XPermutation::X3
            );
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
fn rna_capability_is_projected_from_the_compiled_m3_codon_law() {
    let projection = lens_codon_binary_projection(0).expect("microscopic lens");
    let aaa = projection
        .per_degree
        .iter()
        .find(|entry| entry.codon6_bit == 0)
        .expect("AAA degree");
    let ttt = projection
        .per_degree
        .iter()
        .find(|entry| entry.codon6_bit == 0b01_01_01)
        .expect("TTT degree");

    assert!(!aaa.rna_capable);
    assert!(ttt.rna_capable);
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
