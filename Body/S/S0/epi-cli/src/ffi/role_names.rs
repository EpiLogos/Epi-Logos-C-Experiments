//! Stable u8 → canonical string mappings for the FFI pointer-web enums.
//!
//! Track 01 T1 deliverable: "Add stable enum/string mapping boundaries so TS
//! schemas can validate relation roles, interval roles, ratio roles, helices,
//! ring names, and CF labels."
//!
//! The strings here MUST match the canonical names declared in the TypeScript
//! zod schemas at `Body/S/S0/epi-cli/schemas/src/coordinate.ts`. The drift
//! between these two files is locked by
//! `Body/S/S0/epi-cli/tests/ffi_role_name_contract.rs`.
//!
//! Rust does NOT rederive role semantics here — these strings are *labels* on
//! the C enum integers, not a reinterpretation of relation meaning.

/// Canonical name for a `HC_RelationRole` discriminant.
///
/// Maps the C values from `Body/S/S0/epi-lib/include/pointer_web.h`:
/// `HC_REL_FAMILY_LINK=0` … `HC_REL_CONTEXT_FRAME=8`.
pub fn relation_role_name(value: u8) -> Option<&'static str> {
    match value {
        0 => Some("family_link"),
        1 => Some("position_identity"),
        2 => Some("inversion_spanda"),
        3 => Some("epogdoon_tick"),
        4 => Some("mirror_xy5"),
        5 => Some("mobius_return"),
        6 => Some("position_project"),
        7 => Some("lens_anchor"),
        8 => Some("context_frame"),
        _ => None,
    }
}

/// Canonical name for a `HC_IntervalRole` discriminant.
///
/// Sparse mapping: C uses `HC_INTERVAL_TRITONE=6`, `HC_INTERVAL_TOTALITY_16_9=10`,
/// `HC_INTERVAL_OCTAVE=12`. Values 3-5, 7-9, 11 are unused.
pub fn interval_role_name(value: u8) -> Option<&'static str> {
    match value {
        0 => Some("none"),
        1 => Some("semitone"),
        2 => Some("whole_tone"),
        6 => Some("tritone"),
        10 => Some("totality_16_9"),
        12 => Some("octave"),
        _ => None,
    }
}

/// Canonical name for a `HC_RatioRole` discriminant.
pub fn ratio_role_name(value: u8) -> Option<&'static str> {
    match value {
        0 => Some("none"),
        1 => Some("unison"),
        2 => Some("epogdoon"),
        3 => Some("fourth"),
        4 => Some("fifth"),
        5 => Some("totality"),
        6 => Some("octave"),
        _ => None,
    }
}

/// Canonical name for a `HC_BedrockRole` discriminant.
pub fn bedrock_role_name(value: u8) -> Option<&'static str> {
    match value {
        0 => Some("hash_operator"),
        1 => Some("psychoid_number"),
        2 => Some("inverted_psychoid"),
        _ => None,
    }
}

/// Canonical name for a `HC_Helix` discriminant.
pub fn helix_name(value: u8) -> Option<&'static str> {
    match value {
        0 => Some("bimba"),
        1 => Some("pratibimba"),
        2 => Some("cross"),
        _ => None,
    }
}

/// Canonical name for a `HC_PointerRing` discriminant.
pub fn pointer_ring_name(value: u8) -> Option<&'static str> {
    match value {
        0 => Some("family"),
        1 => Some("position"),
        2 => Some("lens"),
        _ => None,
    }
}

/// Canonical CF notation by `cf_index` (0..6).
///
/// The C side stores notation as `const char*` in `HC_ContextFrameRef`; this
/// fallback lets callers validate the seven CF labels without dereferencing
/// the FFI string pointer when the cf_index is known.
pub fn context_frame_notation(cf_index: u8) -> Option<&'static str> {
    match cf_index {
        0 => Some("(00/00)"),
        1 => Some("(0/1)"),
        2 => Some("(0/1/2)"),
        3 => Some("(0/1/2/3)"),
        4 => Some("(4.0/1-4.4/5)"),
        5 => Some("(4.5/0)"),
        6 => Some("(5/0)"),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn relation_role_covers_zero_through_eight_inclusive_and_nothing_else() {
        for value in 0u8..=8 {
            assert!(
                relation_role_name(value).is_some(),
                "relation_role {value} must map"
            );
        }
        for value in 9u8..=255 {
            assert!(
                relation_role_name(value).is_none(),
                "relation_role {value} must not map"
            );
            if value == 255 {
                break;
            }
        }
    }

    #[test]
    fn interval_role_only_maps_zero_one_two_six_ten_twelve() {
        let mapped: Vec<u8> = (0u8..=20)
            .filter(|v| interval_role_name(*v).is_some())
            .collect();
        assert_eq!(mapped, vec![0u8, 1, 2, 6, 10, 12]);
    }

    #[test]
    fn ratio_role_covers_zero_through_six_inclusive() {
        for value in 0u8..=6 {
            assert!(ratio_role_name(value).is_some());
        }
        assert!(ratio_role_name(7).is_none());
    }

    #[test]
    fn helix_pointer_ring_bedrock_three_value_enums() {
        for value in 0u8..=2 {
            assert!(helix_name(value).is_some());
            assert!(pointer_ring_name(value).is_some());
            assert!(bedrock_role_name(value).is_some());
        }
        assert!(helix_name(3).is_none());
        assert!(pointer_ring_name(3).is_none());
        assert!(bedrock_role_name(3).is_none());
    }

    #[test]
    fn context_frame_notation_covers_seven_cf_labels() {
        for index in 0u8..=6 {
            assert!(context_frame_notation(index).is_some());
        }
        assert!(context_frame_notation(7).is_none());
    }
}
