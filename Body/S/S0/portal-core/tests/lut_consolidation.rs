use portal_core::luts::{codon, mahamaya, oracle, planet_keplerian, rotational, transcription};

#[test]
fn luts_subdir_exports_kernel_lut_modules() {
    assert_eq!(codon::codon_to_amino_acid(0x10), codon::AA_STOP);
    assert_eq!(transcription::DEGREE_TO_HEXAGRAM.len(), 360);
    assert_eq!(mahamaya::mahamaya_address64_from_degree(360), 0);
    assert_eq!(oracle::PAIR_MATRIX.len(), 16);
    assert_eq!(rotational::generate_rotational_states(0).len(), 8);
    assert_eq!(planet_keplerian::PLANET_COUNT, 10);
    assert_eq!(
        planet_keplerian::PLANET_KEPLERIAN_VELOCITY[oracle::planet::SUN as usize],
        35_999.0
    );
}

#[test]
fn legacy_lut_module_paths_remain_compatible() {
    assert_eq!(portal_core::codon::codon_sequence(0), [b'A', b'A', b'A']);
    assert_eq!(portal_core::oracle_lut::PAIR_MATRIX, oracle::PAIR_MATRIX);
    assert_eq!(
        portal_core::transcription::DEGREE_TO_HEXAGRAM[0],
        transcription::DEGREE_TO_HEXAGRAM[0]
    );
}
