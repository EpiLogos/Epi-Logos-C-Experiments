//! Kernel source for PASU's relational-grammar projections (Tranche 01.T1.16).
//!
//! `perspective_role` / `nara_family_role` derive from the M0 kernel LUTs
//! (`MSHARP_PERSON_LUT[6]`, `NARA_MSHARP_LUT[6]` in epi-lib m0.c) — never from
//! a dataset-only table. The mapping is one-to-one and order-preserving; roles
//! are read off the entry's own fields (name string / dominance × polarity).

use std::ffi::CStr;
use std::os::raw::c_char;

use epi_lib as _;

use crate::profile_projections::{NaraFamilyRole, PerspectiveRole};

const NARA_POLARITY_YIN: u8 = 0;
const NARA_POLARITY_YANG: u8 = 1;
const NARA_POLARITY_BOTH: u8 = 2;

const NARA_DOM_MATRIX: u8 = 0;
const NARA_DOM_DOMINANT: u8 = 1;
const NARA_DOM_SUBDOMINANT: u8 = 2;
const NARA_DOM_INTEGRATIVE: u8 = 3;

#[repr(C)]
struct NaraEntry {
    frame_position: u8,
    polarity: u8,
    dominant_val: u8,
    archetype_role: u8,
    dominance_mode: u8,
    coordinate: *const c_char,
}

#[repr(C)]
struct MsharpPersonEntry {
    position: u8,
    polarity: u8,
    dominance_mode: u8,
    name: *const c_char,
    coordinate: *const c_char,
    description: *const c_char,
}

extern "C" {
    static NARA_MSHARP_LUT: [NaraEntry; 6];
    static MSHARP_PERSON_LUT: [MsharpPersonEntry; 6];
}

fn lut_str(ptr: *const c_char) -> &'static str {
    debug_assert!(!ptr.is_null());
    unsafe { CStr::from_ptr(ptr) }.to_str().unwrap_or("")
}

/// Kinship role read off the kernel `NARA_MSHARP_LUT` entry at `position` —
/// gender = polarity, generation = dominance, both carried by the chiral
/// coordinate the LUT stores verbatim.
pub fn nara_family_role_from_kernel(position: u8) -> Option<NaraFamilyRole> {
    if position > 5 {
        return None;
    }
    let entry = unsafe { &NARA_MSHARP_LUT[position as usize] };
    match (entry.dominance_mode, entry.polarity) {
        (NARA_DOM_MATRIX, _) => Some(NaraFamilyRole::IntegralConsciousness),
        (NARA_DOM_DOMINANT, NARA_POLARITY_YANG) => Some(NaraFamilyRole::Father),
        (NARA_DOM_DOMINANT, NARA_POLARITY_BOTH) => Some(NaraFamilyRole::Tao),
        (NARA_DOM_SUBDOMINANT, NARA_POLARITY_YANG) => Some(NaraFamilyRole::Son),
        (NARA_DOM_SUBDOMINANT, NARA_POLARITY_YIN) => Some(NaraFamilyRole::Daughter),
        (NARA_DOM_INTEGRATIVE, _) => Some(NaraFamilyRole::Mother),
        _ => None,
    }
}

/// Person role read off the kernel `MSHARP_PERSON_LUT` entry at `position` —
/// the M# six persons renamed into grammatical-person vocabulary.
pub fn perspective_role_from_kernel(position: u8) -> Option<PerspectiveRole> {
    if position > 5 {
        return None;
    }
    let entry = unsafe { &MSHARP_PERSON_LUT[position as usize] };
    match lut_str(entry.name) {
        "I" => Some(PerspectiveRole::FirstPerson),
        "You" => Some(PerspectiveRole::SecondPerson),
        "You-and-I" => Some(PerspectiveRole::FirstPersonPlural),
        "They" => Some(PerspectiveRole::ThirdPerson),
        "We" => Some(PerspectiveRole::CollectiveWe),
        "We-I" => Some(PerspectiveRole::IntegralWeI),
        _ => None,
    }
}

/// Verbatim chiral coordinate for a kinship position (e.g. `"2-/2"`).
pub fn nara_chiral_coordinate(position: u8) -> Option<&'static str> {
    if position > 5 {
        return None;
    }
    Some(lut_str(unsafe {
        NARA_MSHARP_LUT[position as usize].coordinate
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn nara_family_role_sources_kernel_lut() {
        let expected = [
            NaraFamilyRole::IntegralConsciousness, // ## (0/1) kinship ground
            NaraFamilyRole::Daughter,              // 1/1-
            NaraFamilyRole::Father,                // 2-/2
            NaraFamilyRole::Son,                   // 3/3-
            NaraFamilyRole::Mother,                // 4./4
            NaraFamilyRole::Tao,                   // 5-/5 synthesis
        ];
        for (pos, want) in expected.iter().enumerate() {
            assert_eq!(nara_family_role_from_kernel(pos as u8), Some(*want));
        }
        assert_eq!(nara_family_role_from_kernel(6), None);
    }

    #[test]
    fn perspective_role_sources_kernel_lut() {
        let expected = [
            PerspectiveRole::FirstPerson,       // I (0/1)
            PerspectiveRole::SecondPerson,      // You (1+1=2)
            PerspectiveRole::FirstPersonPlural, // You-and-I (0-3)
            PerspectiveRole::ThirdPerson,       // They (1+2=3)
            PerspectiveRole::CollectiveWe,      // We (4+0)
            PerspectiveRole::IntegralWeI,       // We-I (0/1/4/5)
        ];
        for (pos, want) in expected.iter().enumerate() {
            assert_eq!(perspective_role_from_kernel(pos as u8), Some(*want));
        }
        assert_eq!(perspective_role_from_kernel(6), None);
    }

    #[test]
    fn apex_and_ground_converge_across_grammars() {
        // Position 5: We-I ≡ Tao (shared apex); position 0: I ≡ ## (shared 0/1 ground).
        assert_eq!(
            perspective_role_from_kernel(5),
            Some(PerspectiveRole::IntegralWeI)
        );
        assert_eq!(nara_family_role_from_kernel(5), Some(NaraFamilyRole::Tao));
        assert_eq!(nara_chiral_coordinate(0), Some("0/1"));
        assert_eq!(nara_chiral_coordinate(5), Some("5-/5"));
    }
}
