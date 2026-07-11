//! Tagged pointer decode helpers — mirrors the C macros in ontology.h

use super::HolographicCoordinate;

pub const MASK_ADDRESS: usize = 0x0000_FFFF_FFFF_FFFF;
pub const FLAG_INVERTED: usize = 0x8000_0000_0000_0000;
pub const FLAG_NESTING: usize = 0x4000_0000_0000_0000;
pub const FLAG_BRANCHING: usize = 0x2000_0000_0000_0000;
pub const FLAG_EXECUTING: usize = 0x1000_0000_0000_0000;
pub const FAMILY_BITS_MASK: usize = 0x0F00_0000_0000_0000;
pub const ARCH_BITS_MASK: usize = 0x00FF_0000_0000_0000;

pub const FLAG_STATUS_CANONICAL: u8 = 0x01;
pub const FLAG_STATUS_PROVISIONAL: u8 = 0x02;
pub const FLAG_BIMBA: u8 = 0x20;
pub const BIMBA_FLAGS: u8 = FLAG_STATUS_CANONICAL | FLAG_BIMBA;

#[derive(Debug, Clone, serde::Serialize)]
pub struct TagInfo {
    pub inverted: bool,
    pub nesting: bool,
    pub branching: bool,
    pub executing: bool,
    pub family_bits: u8,
    pub arch_bits: u8,
}

/// Decode tag bits from a tagged pointer
pub fn decode_tags(ptr: *const HolographicCoordinate) -> TagInfo {
    let bits = ptr as usize;
    TagInfo {
        inverted: bits & FLAG_INVERTED != 0,
        nesting: bits & FLAG_NESTING != 0,
        branching: bits & FLAG_BRANCHING != 0,
        executing: bits & FLAG_EXECUTING != 0,
        family_bits: ((bits & FAMILY_BITS_MASK) >> 56) as u8,
        arch_bits: ((bits & ARCH_BITS_MASK) >> 48) as u8,
    }
}

/// Strip all tag bits — equivalent to GET_PTR() in C
pub fn get_ptr(tagged: *const HolographicCoordinate) -> *const HolographicCoordinate {
    (tagged as usize & MASK_ADDRESS) as *const HolographicCoordinate
}

/// Describe the operator on a tagged pointer
pub fn operator_symbol(tags: &TagInfo) -> &'static str {
    if tags.nesting {
        "."
    } else if tags.branching {
        "-"
    } else if tags.inverted {
        "'"
    } else if tags.executing {
        "()"
    } else {
        ""
    }
}

/// Describe flags byte
pub fn flags_description(flags: u8) -> String {
    let mut parts = Vec::new();
    if flags & FLAG_BIMBA != 0 {
        parts.push("BIMBA");
    }
    if flags & FLAG_STATUS_CANONICAL != 0 {
        parts.push("CANONICAL");
    }
    if flags & FLAG_STATUS_PROVISIONAL != 0 {
        parts.push("PROVISIONAL");
    }
    if parts.is_empty() {
        "none".to_string()
    } else {
        parts.join(" | ")
    }
}


#[cfg(test)]
mod hash_flip_law {
    //! CCT-20 (a): `#` is the phase-flip act — a coordinate's ADDRESS
    //! survives while its PHASE flips. Single application preserves
    //! address identity and flips phase; double application returns to
    //! the original phase (X → X' → X). The XOR over FLAG_INVERTED IS
    //! the act; GET_PTR (MASK_ADDRESS) is the address-identity carrier.

    use super::{FLAG_INVERTED, MASK_ADDRESS};

    #[test]
    fn single_hash_preserves_address_and_flips_phase() {
        let x: usize = 0x0000_1234_5678_9ABC;
        let x_prime = x ^ FLAG_INVERTED;
        assert_ne!(x, x_prime, "phase flips");
        assert_eq!(x & MASK_ADDRESS, x_prime & MASK_ADDRESS, "address survives");
        assert_eq!(x_prime & FLAG_INVERTED, FLAG_INVERTED, "inverted phase set");
        assert_eq!(x & FLAG_INVERTED, 0, "original phase clear");
    }

    #[test]
    fn double_hash_returns_to_the_original_phase() {
        let x: usize = FLAG_INVERTED >> 3 | 0x0000_00AA_BBCC_DDEE; // carries other flag bits too
        let round_trip = (x ^ FLAG_INVERTED) ^ FLAG_INVERTED;
        assert_eq!(round_trip, x, "X -> X' -> X");
    }
}
