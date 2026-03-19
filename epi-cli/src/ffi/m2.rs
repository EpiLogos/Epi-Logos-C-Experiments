//! FFI struct mirrors for M2 (Parashakti) C types — field-for-field #[repr(C)]

use static_assertions::assert_eq_size;

/// Mirror of C M2_Vibrational_72_Space — 72 bytes
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct M2Vibrational72Space {
    pub raw_vibration: [u8; 72],
}

assert_eq_size!(M2Vibrational72Space, [u8; 72]);

/// Mirror of C Planet_Operator — 12 bytes
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct PlanetOperator {
    pub id: u8,
    pub group_type: u8,
    pub prime: u8,
    pub elem_sig: u8,
    pub cousto_freq: u16,
    pub keplerian_vel: u16,
    pub digital_root: u8,
    pub ananda_row: u8,
    pub meaning_id: u16,
}

assert_eq_size!(PlanetOperator, [u8; 12]);

/// Mirror of C M2_Root — 24 bytes
#[repr(C)]
#[derive(Debug)]
pub struct M2Root {
    pub hc: *mut super::HolographicCoordinate,
    pub active_cf: *const super::HolographicCoordinate,
    pub active_elem: u8,
    pub active_decan: u8,
    pub active_tattva: u8,
    pub _pad: u8,
    pub _pad2: [u8; 4], // struct alignment padding to 24
}

assert_eq_size!(M2Root, [u8; 24]);
