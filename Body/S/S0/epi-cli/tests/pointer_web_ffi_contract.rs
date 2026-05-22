use epi_logos::ffi::tagged;
use epi_logos::ffi::{
    CoordinateArena, CoordinateFamily, EpiLib, HolographicCoordinate, HC_BEDROCK_HASH_OPERATOR,
    HC_BEDROCK_INVERTED_PSYCHOID, HC_BEDROCK_PSYCHOID_NUMBER, HC_HELIX_BIMBA, HC_HELIX_PRATIBIMBA,
    HC_INTERVAL_OCTAVE, HC_INTERVAL_SEMITONE, HC_INTERVAL_TOTALITY_16_9, HC_INTERVAL_TRITONE,
    HC_INTERVAL_WHOLE_TONE, HC_REL_EPOGDOON_TICK, HC_REL_INVERSION_SPANDA, HC_REL_LENS_ANCHOR,
    HC_REL_MIRROR_XY5, HC_REL_MOBIUS_RETURN,
};
use std::ptr;

struct TestArena {
    epi: EpiLib,
    arena: CoordinateArena,
}

impl TestArena {
    fn new() -> Self {
        let epi = EpiLib::new();
        let mut arena = CoordinateArena {
            slots: ptr::null_mut(),
            capacity: 0,
            count: 0,
        };
        assert_eq!(epi.arena_init(&mut arena, 64), 0);

        let mut mirrors: [*mut HolographicCoordinate; 6] = [ptr::null_mut(); 6];
        for pos in 0..6u8 {
            let mirror = epi.arena_alloc(&mut arena);
            assert!(!mirror.is_null());
            let raw = epi.psychoid(pos).expect("psychoid exists");
            unsafe {
                (*mirror).ql_position = (*raw).ql_position;
                (*mirror).family = CoordinateFamily::None as u8;
                (*mirror).inversion_state = 0;
                (*mirror).flags = 0;
                (*mirror).weave_state = (*raw).weave_state;
                (*mirror).invoke_process = (*raw).invoke_process;
            }
            mirrors[pos as usize] = mirror;
        }

        assert_eq!(epi.families_init(&mut arena, &mut mirrors), 0);
        assert_eq!(epi.families_crosslink(&mut arena), 0);
        assert_eq!(epi.families_wire_reflective(&mut arena), 0);

        Self { epi, arena }
    }

    fn family_coord(&self, family: CoordinateFamily, pos: u8) -> *mut HolographicCoordinate {
        assert!(pos < 6);
        let offset = 6 + (family as usize * 6) + pos as usize;
        unsafe { self.arena.slots.add(offset) }
    }
}

impl Drop for TestArena {
    fn drop(&mut self) {
        self.epi.arena_destroy(&mut self.arena);
    }
}

#[test]
fn ffi_exposes_bedrock7_as_hash_plus_raw_psychoid_kernel_law() {
    let epi = EpiLib::new();
    let web = epi.bedrock_web7().expect("bedrock web fills");

    assert_eq!(web.hash.target, epi.psychoid_hash);
    assert_eq!(web.hash.bedrock_role, HC_BEDROCK_HASH_OPERATOR);
    assert_eq!(web.hash.relation_role, HC_REL_INVERSION_SPANDA);
    assert_eq!(web.hash.ql_position, 0xFF);

    for q in 0..6usize {
        assert_eq!(web.psychoid[q].target, epi.psychoid(q as u8).unwrap());
        assert_eq!(web.psychoid[q].bedrock_role, HC_BEDROCK_PSYCHOID_NUMBER);
        assert_eq!(web.psychoid[q].ql_position, q as u8);
        assert_eq!(web.inversion[q].target, web.psychoid[q].target);
        assert_eq!(web.inversion[q].bedrock_role, HC_BEDROCK_INVERTED_PSYCHOID);
        assert_eq!(web.inversion[q].relation_role, HC_REL_INVERSION_SPANDA);
        assert_eq!(web.inversion[q].interval_role, HC_INTERVAL_SEMITONE);
    }

    for q in 0..5usize {
        assert_eq!(web.successor[q].target, web.psychoid[q + 1].target);
        assert_eq!(web.successor[q].relation_role, HC_REL_EPOGDOON_TICK);
        assert_eq!(web.successor[q].interval_role, HC_INTERVAL_WHOLE_TONE);
    }
    assert_eq!(web.successor[5].target, epi.psychoid_0);
    assert_eq!(web.successor[5].relation_role, HC_REL_MOBIUS_RETURN);
    assert_eq!(web.successor[5].interval_role, HC_INTERVAL_OCTAVE);
}

#[test]
fn ffi_exposes_c_pointer_web36_without_widening_coordinate() {
    assert_eq!(std::mem::size_of::<HolographicCoordinate>(), 128);

    let fixture = TestArena::new();
    let source = fixture.family_coord(CoordinateFamily::M, 2);
    let web = fixture
        .epi
        .pointer_web36(&fixture.arena, source)
        .expect("C pointer web fills");

    for family in 0..6usize {
        assert_eq!(web.family[family].helix, HC_HELIX_BIMBA);
        assert_eq!(web.family[family].ql_position, 2);
        let target = tagged::get_ptr(web.family[family].target);
        unsafe {
            assert_eq!((*target).family, family as u8);
            assert_eq!((*target).ql_position, 2);
        }

        let prime = family + 6;
        assert_eq!(web.family[prime].helix, HC_HELIX_PRATIBIMBA);
        assert_eq!(web.family[prime].relation_role, HC_REL_INVERSION_SPANDA);
        assert_eq!(web.family[prime].interval_role, HC_INTERVAL_SEMITONE);
        assert!(tagged::decode_tags(web.family[prime].target).inverted);
        let prime_target = tagged::get_ptr(web.family[prime].target);
        unsafe {
            assert_eq!((*prime_target).family, family as u8);
            assert_eq!((*prime_target).ql_position, 2);
        }
    }
}

#[test]
fn ffi_pointer_web_separates_inversion_mirror_and_mobius_return() {
    let fixture = TestArena::new();

    let web_m2 = fixture
        .epi
        .pointer_web36(&fixture.arena, fixture.family_coord(CoordinateFamily::M, 2))
        .expect("M2 pointer web");
    assert_eq!(web_m2.position[8].relation_role, HC_REL_INVERSION_SPANDA);
    assert_eq!(web_m2.position[8].interval_role, HC_INTERVAL_SEMITONE);
    assert_eq!(web_m2.position[3].relation_role, HC_REL_MIRROR_XY5);
    assert_eq!(web_m2.position[3].interval_role, HC_INTERVAL_WHOLE_TONE);

    let web_m1 = fixture
        .epi
        .pointer_web36(&fixture.arena, fixture.family_coord(CoordinateFamily::M, 1))
        .expect("M1 pointer web");
    assert_eq!(web_m1.position[4].relation_role, HC_REL_MIRROR_XY5);
    assert_eq!(web_m1.position[4].interval_role, HC_INTERVAL_TRITONE);

    let web_m0 = fixture
        .epi
        .pointer_web36(&fixture.arena, fixture.family_coord(CoordinateFamily::M, 0))
        .expect("M0 pointer web");
    assert_eq!(web_m0.position[5].relation_role, HC_REL_MIRROR_XY5);
    assert_eq!(web_m0.position[5].interval_role, HC_INTERVAL_TOTALITY_16_9);

    let web_m5 = fixture
        .epi
        .pointer_web36(&fixture.arena, fixture.family_coord(CoordinateFamily::M, 5))
        .expect("M5 pointer web");
    assert_eq!(web_m5.position[6].relation_role, HC_REL_MOBIUS_RETURN);
    assert_eq!(web_m5.position[6].interval_role, HC_INTERVAL_OCTAVE);
    assert!(tagged::decode_tags(web_m5.position[6].target).inverted);
}

#[test]
fn ffi_pointer_web_exposes_twelve_mef_lens_anchors_and_cf7_overlay() {
    let fixture = TestArena::new();
    let source = fixture.family_coord(CoordinateFamily::P, 3);
    let web = fixture
        .epi
        .pointer_web36(&fixture.arena, source)
        .expect("P3 pointer web");

    let expected_pc = [0u8, 2, 4, 6, 8, 10, 1, 3, 5, 7, 9, 11];
    for (idx, pc) in expected_pc.iter().enumerate() {
        assert_eq!(web.lens[idx].pitch_class, *pc);
        if idx < 6 {
            assert_eq!(web.lens[idx].helix, HC_HELIX_BIMBA);
            assert_eq!(web.lens[idx].relation_role, HC_REL_LENS_ANCHOR);
        } else {
            assert_eq!(web.lens[idx].helix, HC_HELIX_PRATIBIMBA);
            assert_eq!(web.lens[idx].relation_role, HC_REL_INVERSION_SPANDA);
            assert!(tagged::decode_tags(web.lens[idx].target).inverted);
        }
    }

    let cf = fixture
        .epi
        .context_frame_web7()
        .expect("C context frame overlay fills");
    assert_eq!(cf.frame[0].diatonic_degree, 1);
    assert_eq!(cf.frame[0].ql_position, 0);
    assert_eq!(cf.frame[0].helix, HC_HELIX_BIMBA);
    assert_eq!(cf.frame[4].diatonic_degree, 5);
    assert_eq!(cf.frame[4].ql_position, 3);
    assert_eq!(cf.frame[4].helix, HC_HELIX_PRATIBIMBA);
    assert_eq!(cf.frame[4].pitch_class, 7);
    assert_eq!(cf.frame[6].diatonic_degree, 7);
    assert_eq!(cf.frame[6].ql_position, 5);
    assert_eq!(cf.frame[6].pitch_class, 11);
}
