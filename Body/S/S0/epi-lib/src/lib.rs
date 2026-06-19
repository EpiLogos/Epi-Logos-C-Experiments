#[cfg(all(test, feature = "m0_verifier"))]
mod m0_verifier {
    use std::ffi::CStr;
    use std::os::raw::{c_char, c_int};

    const M0_VERIFIER_VIRTUE_COUNT: usize = 9;
    const M0_VERIFIER_MAX_UNSATISFIED: usize = 80;
    const M0_VERIFIER_COORDINATE_MAX: usize = 96;
    const M0_VERIFIER_SYNTAX_SPEECH: u16 = 1 << 0;
    const M0_VERIFIER_SYNTAX_RELATIONSHIP: u16 = 1 << 1;
    const M0_VERIFIER_SYNTAX_ACTION: u16 = 1 << 2;
    const M0_VERIFIER_SYNTAX_COMPLETION: u16 = 1 << 3;

    #[repr(C)]
    #[derive(Clone, Copy)]
    struct KernelState {
        committed_virtue_mask: u16,
        virtue_evidence: [f32; M0_VERIFIER_VIRTUE_COUNT],
        observed_core_relation_count: u16,
        syntax_layer_mask: u16,
        active_archetype: u8,
        active_tct_position: u8,
        slot_privacy_boundary_compliance: u8,
    }

    #[repr(C)]
    struct M0VerifierReport {
        virtue_witness_vector: u16,
        virtue_scores: [f32; M0_VERIFIER_VIRTUE_COUNT],
        unsatisfied_count: u16,
        unsatisfied_constraints:
            [[c_char; M0_VERIFIER_COORDINATE_MAX]; M0_VERIFIER_MAX_UNSATISFIED],
        coherence_score: f32,
        slot_privacy_boundary_compliance: u8,
    }

    impl Default for M0VerifierReport {
        fn default() -> Self {
            Self {
                virtue_witness_vector: 0,
                virtue_scores: [0.0; M0_VERIFIER_VIRTUE_COUNT],
                unsatisfied_count: 0,
                unsatisfied_constraints: [[0; M0_VERIFIER_COORDINATE_MAX];
                    M0_VERIFIER_MAX_UNSATISFIED],
                coherence_score: 0.0,
                slot_privacy_boundary_compliance: 0,
            }
        }
    }

    extern "C" {
        fn m0_verifier_check_state(state: *const KernelState, out: *mut M0VerifierReport) -> c_int;
        fn m0_verifier_emit_question(
            report: *const M0VerifierReport,
            out_buf: *mut c_char,
            buf_len: usize,
        ) -> c_int;
    }

    fn fully_witnessed_state() -> KernelState {
        KernelState {
            committed_virtue_mask: 0x01ff,
            virtue_evidence: [1.0; M0_VERIFIER_VIRTUE_COUNT],
            observed_core_relation_count: 65,
            syntax_layer_mask: M0_VERIFIER_SYNTAX_SPEECH
                | M0_VERIFIER_SYNTAX_RELATIONSHIP
                | M0_VERIFIER_SYNTAX_ACTION
                | M0_VERIFIER_SYNTAX_COMPLETION,
            active_archetype: 7,
            active_tct_position: 0,
            slot_privacy_boundary_compliance: 1,
        }
    }

    #[test]
    fn checks_against_virtue_lut() {
        let state = fully_witnessed_state();
        let mut report = M0VerifierReport::default();

        let status = unsafe { m0_verifier_check_state(&state, &mut report) };

        assert_eq!(status, 0);
        assert_eq!(report.virtue_witness_vector & 0x01ff, 0x01ff);
        assert_eq!(report.unsatisfied_count, 0);
        assert_eq!(report.slot_privacy_boundary_compliance, 1);
        assert!(report.coherence_score > 0.99);
        for score in report.virtue_scores {
            assert!(score > 0.99);
        }
    }

    #[test]
    fn reports_slot_privacy_boundary_violation() {
        let mut state = fully_witnessed_state();
        state.slot_privacy_boundary_compliance = 0;
        let mut report = M0VerifierReport::default();

        let status = unsafe { m0_verifier_check_state(&state, &mut report) };

        assert_eq!(status, 0);
        assert_eq!(report.slot_privacy_boundary_compliance, 0);
        assert!(report.unsatisfied_count > 0);
        let first_constraint =
            unsafe { CStr::from_ptr(report.unsatisfied_constraints[0].as_ptr()) }
                .to_str()
                .expect("constraint must be UTF-8 compatible");
        assert_eq!(first_constraint, "#R0-0/1/P-T0-slot-privacy-boundary?");
        assert!(report.coherence_score < 0.99);
    }

    #[test]
    fn emits_symbolic_coordinate_string() {
        let mut state = fully_witnessed_state();
        state.virtue_evidence[8] = 0.0;
        state.syntax_layer_mask &= !M0_VERIFIER_SYNTAX_COMPLETION;
        let mut report = M0VerifierReport::default();
        unsafe { m0_verifier_check_state(&state, &mut report) };
        let mut question = [0 as c_char; 128];

        let status =
            unsafe { m0_verifier_emit_question(&report, question.as_mut_ptr(), question.len()) };

        assert_eq!(status, 0);
        let question = unsafe { CStr::from_ptr(question.as_ptr()) }
            .to_str()
            .expect("verifier question must be UTF-8 compatible");
        assert_eq!(question, "#R5-0/1/A-T9-pending?");
    }
}

#[cfg(test)]
mod m0_m2_parity {
    const ARCHETYPE_LUT_SIZE: usize = 12;
    const M0_SENTINEL: u8 = 0xFF;

    const ELEMENT_ID_AKASHA: u8 = 0;
    const ELEMENT_ID_VAYU: u8 = 1;
    const ELEMENT_ID_AGNI: u8 = 2;
    const ELEMENT_ID_APAS: u8 = 3;
    const ELEMENT_ID_PRITHVI: u8 = 4;

    const PLANET_SUN: u8 = 0;
    const PLANET_MOON: u8 = 1;
    const PLANET_MERCURY: u8 = 2;
    const PLANET_VENUS: u8 = 3;
    const PLANET_MARS: u8 = 4;
    const PLANET_JUPITER: u8 = 5;
    const PLANET_SATURN: u8 = 6;

    #[repr(C)]
    #[derive(Clone, Copy)]
    struct DecanFaceDesc {
        element: u8,
        sign: u8,
        decan: u8,
        face: u8,
        ruling_planet: u8,
        pad: u8,
        meaning_id: u16,
    }

    extern "C" {
        static M0_M2_ZODIACAL_BRIDGE: [u8; ARCHETYPE_LUT_SIZE];
        static PSYCHOID_PLANETARY_CORRESPONDENCE: [u8; ARCHETYPE_LUT_SIZE];
        static ALCHEMICAL_TO_TATTVIC: [u8; ARCHETYPE_LUT_SIZE];
        static M2_DECAN_DESC: [DecanFaceDesc; 72];
    }

    #[test]
    fn parity_bridges_consistent() {
        let zodiacal_bridge = unsafe { M0_M2_ZODIACAL_BRIDGE };
        let psychoid_planets = unsafe { PSYCHOID_PLANETARY_CORRESPONDENCE };
        let alchemical_tattvas = unsafe { ALCHEMICAL_TO_TATTVIC };
        let decans = unsafe { M2_DECAN_DESC };

        for (idx, value) in zodiacal_bridge.iter().enumerate() {
            if idx == 5 {
                assert_eq!(*value, 0);
                assert_eq!(decans[*value as usize].element, ELEMENT_ID_AGNI);
                assert_eq!(decans[*value as usize].sign, 0);
            } else {
                assert_eq!(*value, M0_SENTINEL);
            }
        }

        assert_eq!(psychoid_planets[0], M0_SENTINEL);
        assert_eq!(psychoid_planets[1], M0_SENTINEL);
        assert_eq!(psychoid_planets[2], M0_SENTINEL);
        assert_eq!(psychoid_planets[3], PLANET_SUN);
        assert_eq!(psychoid_planets[4], PLANET_MOON);
        assert_eq!(psychoid_planets[5], PLANET_MERCURY);
        assert_eq!(psychoid_planets[6], PLANET_VENUS);
        assert_eq!(psychoid_planets[7], PLANET_MARS);
        assert_eq!(psychoid_planets[8], PLANET_JUPITER);
        assert_eq!(psychoid_planets[9], PLANET_SATURN);
        assert_eq!(psychoid_planets[10], M0_SENTINEL);
        assert_eq!(psychoid_planets[11], M0_SENTINEL);

        assert_eq!(alchemical_tattvas[0], ELEMENT_ID_AKASHA);
        assert_eq!(alchemical_tattvas[5], ELEMENT_ID_VAYU);
        assert_eq!(alchemical_tattvas[7], ELEMENT_ID_AGNI);
        assert_eq!(alchemical_tattvas[9], ELEMENT_ID_APAS);
        assert_eq!(alchemical_tattvas[11], ELEMENT_ID_PRITHVI);
    }
}

#[cfg(test)]
mod m3_major_arcana_transcription {
    use std::os::raw::c_char;

    const M3_MAJOR_ARCANA_COUNT: usize = 22;
    const M3_STOP_CODON_AA: u8 = 10;
    const M3_NO_ARCANA: u8 = 0xFF;

    #[repr(C)]
    #[derive(Clone, Copy)]
    struct M3MajorArcanaEntry {
        card_id: u8,
        name: *const c_char,
        chromosome_pair: u8,
        amino_acid_index: u8,
    }

    extern "C" {
        static M3_CODON_TO_AA: [u8; 64];
        static M3_MAJOR_ARCANA: [M3MajorArcanaEntry; M3_MAJOR_ARCANA_COUNT];
        fn m3_major_arcana_from_codon(codon: u8) -> u8;
    }

    #[test]
    fn m3_major_arcana_from_codon_roundtrip() {
        let codon_to_aa = unsafe { M3_CODON_TO_AA };
        let major_arcana = unsafe { M3_MAJOR_ARCANA };

        for codon in 0u8..64u8 {
            let aa_index = codon_to_aa[codon as usize];
            let card = unsafe { m3_major_arcana_from_codon(codon) };

            if aa_index == M3_STOP_CODON_AA {
                assert_eq!(card, M3_NO_ARCANA, "STOP codon {codon:#04x}");
                continue;
            }

            let expected = major_arcana
                .iter()
                .position(|entry| entry.amino_acid_index == aa_index)
                .map(|idx| idx as u8)
                .unwrap_or(M3_NO_ARCANA);

            assert_eq!(
                card, expected,
                "codon {codon:#04x} should reverse-map amino acid {aa_index}"
            );
            assert_ne!(card, M3_NO_ARCANA, "non-STOP codon {codon:#04x}");
            assert_eq!(major_arcana[card as usize].amino_acid_index, aa_index);
        }

        assert_eq!(unsafe { m3_major_arcana_from_codon(64) }, M3_NO_ARCANA);
    }
}

#[cfg(test)]
mod m4_session_lifecycle {
    use std::os::raw::{c_char, c_int};

    const M3_GOVERNANCE_ROLE_NONE: u8 = 0;
    const M3_GOVERNANCE_ROLE_START: u8 = 1;
    const M3_GOVERNANCE_ROLE_STOP: u8 = 2;
    const M3_CODON_ATG_AUG_VALUE: u8 = 0x07;
    const M3_STOP_CODON_TGA_VALUE: u8 = 0x1c;
    const M4_TRANSCRIPTION_STEP_START: u8 = 1 << 0;
    const M4_TRANSCRIPTION_STEP_STOP: u8 = 1 << 1;
    const M4_TRANSCRIPTION_STEP_TAIL: u8 = 1 << 2;
    const M4_TRANSCRIPTION_TAIL_MARKER_CODON: u8 = 0xfe;
    const M4_SYMBOLIC_PROTEIN_MAX_STEPS: usize = 256;

    #[repr(C)]
    #[derive(Clone, Copy, Default)]
    struct NucleotideBalance {
        adenine_water: u8,
        thymine_fire: u8,
        cytosine_earth: u8,
        guanine_air: u8,
    }

    #[repr(C)]
    #[derive(Clone, Copy, Default)]
    struct M4SymbolDnaProfile {
        gene_keys_activation: u64,
        nucleotide_balance: NucleotideBalance,
        sun_degree_anchor: u16,
        moon_degree_anchor: u16,
    }

    #[repr(C)]
    #[derive(Clone, Copy, Default)]
    struct M4NumerologicalLayer {
        numerological_key: u32,
        sixfold_difference: u8,
        sixfold_sum: u8,
        life_path: u8,
        _pad: u8,
    }

    #[repr(C)]
    #[derive(Clone, Copy, Default)]
    struct M4AstrologicalLayer {
        sun_degree_anchor: u16,
        moon_degree_anchor: u16,
        asc_degree_anchor: u16,
        mc_degree_anchor: u16,
        planet_degrees: [u16; 10],
        dominant_sign: u8,
        dominant_element: u8,
        dominant_modality: u8,
        _pad: u8,
    }

    #[repr(C)]
    #[derive(Clone, Copy, Default)]
    struct M4JungianLayer {
        nucleotide_balance: NucleotideBalance,
        mbti_raw: u8,
        dominant_function: u8,
        auxiliary_function: u8,
        enneagram_type: u8,
        enneagram_wing: u8,
        _pad: [u8; 3],
    }

    #[repr(C)]
    #[derive(Clone, Copy, Default)]
    struct M4GeneKeysLayer {
        gene_keys_activation: u64,
        shadow_mask: u64,
        gift_mask: u64,
        siddhi_mask: u64,
        life_work_hex: u8,
        evolution_hex: u8,
        radiance_hex: u8,
        purpose_hex: u8,
        attraction_hex: u8,
        iq_hex: u8,
        eq_hex: u8,
        sq_hex: u8,
    }

    #[repr(C)]
    #[derive(Clone, Copy, Default)]
    struct M4HumanDesignLayer {
        hd_type: u8,
        hd_authority: u8,
        hd_profile: [u8; 2],
        hd_definition: u8,
        incarnation_cross: u8,
        defined_channels: u16,
        defined_gates: [u32; 2],
        _pad: [u8; 4],
    }

    #[repr(C)]
    #[derive(Clone, Copy)]
    struct M4IdentityMatrix {
        layer_presence: u8,
        _pad_lp: [u8; 7],
        layer_0: M4NumerologicalLayer,
        layer_1: M4AstrologicalLayer,
        layer_2: M4JungianLayer,
        layer_3: M4GeneKeysLayer,
        layer_4: M4HumanDesignLayer,
        dna_profile: M4SymbolDnaProfile,
        quintessence_hash: [u8; 32],
        quintessence_preview: [c_char; 65],
        numerological_key: u32,
        jung_type: u8,
        computed: bool,
    }

    impl Default for M4IdentityMatrix {
        fn default() -> Self {
            Self {
                layer_presence: 0,
                _pad_lp: [0; 7],
                layer_0: M4NumerologicalLayer::default(),
                layer_1: M4AstrologicalLayer::default(),
                layer_2: M4JungianLayer::default(),
                layer_3: M4GeneKeysLayer::default(),
                layer_4: M4HumanDesignLayer::default(),
                dna_profile: M4SymbolDnaProfile::default(),
                quintessence_hash: [0; 32],
                quintessence_preview: [0; 65],
                numerological_key: 0,
                jung_type: 0,
                computed: false,
            }
        }
    }

    #[repr(C)]
    #[derive(Clone, Copy)]
    struct M4TarotDraw {
        cards: [u8; 78],
        drawn: [u8; 12],
        draw_count: u8,
        spread_type: u8,
        cast_degree: u16,
    }

    impl Default for M4TarotDraw {
        fn default() -> Self {
            Self {
                cards: [0; 78],
                drawn: [0; 12],
                draw_count: 0,
                spread_type: 0,
                cast_degree: 0,
            }
        }
    }

    #[repr(C)]
    #[derive(Clone, Copy, Default)]
    struct M4TranscriptionStep {
        degree: u16,
        hexagram: u8,
        codon: u8,
        amino_acid: u8,
        transcript_class: u8,
        governance_role: u8,
        flags: u8,
    }

    #[repr(C)]
    #[derive(Clone, Copy)]
    struct M4SymbolicProtein {
        session_id: [c_char; 64],
        start_codon: u8,
        stop_codon: u8,
        sealed: u8,
        truncated: u8,
        kairos_open: u64,
        kairos_close: u64,
        identity_hash: [u8; 32],
        step_count: u32,
        capacity: u32,
        has_mythos_archetype_reading: u8,
        mythos_archetype_reading: [c_char; 256],
        steps: [M4TranscriptionStep; M4_SYMBOLIC_PROTEIN_MAX_STEPS],
    }

    impl Default for M4SymbolicProtein {
        fn default() -> Self {
            Self {
                session_id: [0; 64],
                start_codon: 0,
                stop_codon: 0,
                sealed: 0,
                truncated: 0,
                kairos_open: 0,
                kairos_close: 0,
                identity_hash: [0; 32],
                step_count: 0,
                capacity: 0,
                has_mythos_archetype_reading: 0,
                mythos_archetype_reading: [0; 256],
                steps: [M4TranscriptionStep::default(); M4_SYMBOLIC_PROTEIN_MAX_STEPS],
            }
        }
    }

    #[repr(C)]
    struct M4SessionFrame {
        kairos: u64,
        identity: *mut M4IdentityMatrix,
        tarot_psyche_anchor: M4TarotDraw,
        protein_storage: M4SymbolicProtein,
        protein: *mut M4SymbolicProtein,
        stop_codon_policy: c_int,
        opened: bool,
    }

    impl Default for M4SessionFrame {
        fn default() -> Self {
            Self {
                kairos: 0,
                identity: std::ptr::null_mut(),
                tarot_psyche_anchor: M4TarotDraw::default(),
                protein_storage: M4SymbolicProtein::default(),
                protein: std::ptr::null_mut(),
                stop_codon_policy: 0,
                opened: false,
            }
        }
    }

    extern "C" {
        fn m4_session_open(
            identity: *mut M4IdentityMatrix,
            kairos: u64,
            out: *mut M4SessionFrame,
        ) -> c_int;
        fn m4_session_close(frame: *mut M4SessionFrame, out: *mut M4SymbolicProtein) -> c_int;
        fn m4_symbolic_protein_append_step(
            protein: *mut M4SymbolicProtein,
            degree: u16,
            hexagram: u8,
            codon: u8,
            role: c_int,
        ) -> c_int;
    }

    #[test]
    fn m4_session_open_emits_start_codon() {
        let mut identity = M4IdentityMatrix::default();
        identity.numerological_key = 42;
        let mut frame = M4SessionFrame::default();

        let status = unsafe { m4_session_open(&mut identity, 7205, &mut frame) };

        assert_eq!(status, 0);
        assert!(frame.opened);
        assert!(!frame.protein.is_null());
        let protein = unsafe { &*frame.protein };
        assert_eq!(protein.step_count, 1);
        assert_eq!(protein.start_codon, M3_CODON_ATG_AUG_VALUE);
        assert_eq!(protein.steps[0].codon, M3_CODON_ATG_AUG_VALUE);
        assert_eq!(protein.steps[0].governance_role, M3_GOVERNANCE_ROLE_START);
        assert_ne!(protein.steps[0].flags & M4_TRANSCRIPTION_STEP_START, 0);
        assert_eq!(frame.tarot_psyche_anchor.draw_count, 3);
    }

    #[test]
    fn m4_session_close_seals_protein_with_kairos_derived_stop() {
        let mut identity = M4IdentityMatrix::default();
        identity.numerological_key = 19;
        let mut frame = M4SessionFrame::default();
        let mut sealed = M4SymbolicProtein::default();

        let open_status = unsafe { m4_session_open(&mut identity, 7205, &mut frame) };
        assert_eq!(open_status, 0);
        let close_status = unsafe { m4_session_close(&mut frame, &mut sealed) };

        assert_eq!(close_status, 0);
        assert_eq!(sealed.sealed, 1);
        assert_eq!(sealed.stop_codon, M3_STOP_CODON_TGA_VALUE);
        assert_eq!(sealed.step_count, 2);
        assert_eq!(sealed.steps[1].governance_role, M3_GOVERNANCE_ROLE_STOP);
        assert_ne!(sealed.steps[1].flags & M4_TRANSCRIPTION_STEP_STOP, 0);
    }

    #[test]
    fn m4_session_protein_capacity_truncates_with_tail_marker() {
        let mut identity = M4IdentityMatrix::default();
        identity.numerological_key = 7;
        let mut frame = M4SessionFrame::default();

        let status = unsafe { m4_session_open(&mut identity, 8, &mut frame) };
        assert_eq!(status, 0);

        let protein = unsafe { &mut *frame.protein };
        protein.capacity = 2;
        let fill = unsafe {
            m4_symbolic_protein_append_step(
                frame.protein,
                9,
                0,
                0,
                M3_GOVERNANCE_ROLE_NONE as c_int,
            )
        };
        let truncate = unsafe {
            m4_symbolic_protein_append_step(
                frame.protein,
                10,
                1,
                1,
                M3_GOVERNANCE_ROLE_NONE as c_int,
            )
        };

        assert_eq!(fill, 0);
        assert_eq!(truncate, 0);
        let protein = unsafe { &*frame.protein };
        assert_eq!(protein.step_count, 2);
        assert_eq!(protein.truncated, 1);
        assert_eq!(protein.steps[1].codon, M4_TRANSCRIPTION_TAIL_MARKER_CODON);
        assert_ne!(protein.steps[1].flags & M4_TRANSCRIPTION_STEP_TAIL, 0);
    }
}

#[cfg(test)]
mod m0_contemplation_prompts {
    use std::ffi::CStr;
    use std::os::raw::c_char;

    extern "C" {
        static CONTEMPLATION_PROMPT_LUT: [*const c_char; 12];
    }

    fn prompt_at(prompts: &[*const c_char; 12], idx: usize) -> &str {
        unsafe { CStr::from_ptr(prompts[idx]) }
            .to_str()
            .expect("contemplation prompt must be UTF-8 compatible")
    }

    #[test]
    fn contemplation_prompt_lut_size() {
        let prompts = unsafe { &CONTEMPLATION_PROMPT_LUT };

        assert_eq!(prompts.len(), 12);
        assert_eq!(prompt_at(prompts, 0), "");
        assert_eq!(prompt_at(prompts, 1), "");
        assert_eq!(prompt_at(prompts, 2), "");
        assert_eq!(
            prompt_at(prompts, 3),
            "Did your speech articulate identity or just signal? Where did naming become performance?"
        );
        assert_eq!(prompt_at(prompts, 4), "");
        assert_eq!(
            prompt_at(prompts, 5),
            "Did unity-multiplicity hold or did one side eat the other? Where was the mercurial crossroads refused?"
        );
        assert_eq!(prompt_at(prompts, 6), "");
        assert_eq!(
            prompt_at(prompts, 7),
            "Did the four causes integrate or did one dominate? Which act was missing?"
        );
        assert_eq!(prompt_at(prompts, 8), "");
        assert_eq!(
            prompt_at(prompts, 9),
            "Did the cycle complete in wholeness or close prematurely? Which virtue went unwitnessed?"
        );
        assert_eq!(prompt_at(prompts, 10), "");
        assert_eq!(prompt_at(prompts, 11), "");
    }
}
