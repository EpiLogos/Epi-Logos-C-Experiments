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
    }

    #[repr(C)]
    struct M0VerifierReport {
        virtue_witness_vector: u16,
        virtue_scores: [f32; M0_VERIFIER_VIRTUE_COUNT],
        unsatisfied_count: u16,
        unsatisfied_constraints:
            [[c_char; M0_VERIFIER_COORDINATE_MAX]; M0_VERIFIER_MAX_UNSATISFIED],
        coherence_score: f32,
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
        assert!(report.coherence_score > 0.99);
        for score in report.virtue_scores {
            assert!(score > 0.99);
        }
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
