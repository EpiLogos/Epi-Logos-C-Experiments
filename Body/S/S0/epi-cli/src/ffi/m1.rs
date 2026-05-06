//! FFI struct mirrors for M1 (Paramasiva) C types — field-for-field #[repr(C)]

use static_assertions::assert_eq_size;

/// Mirror of C Spanda_Engine — 8 bytes
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct SpandaEngine {
    pub stage: u32, // Spanda_Stage enum (C int)
    pub state_bits: u8,
    pub track: u8,
    pub cf_substage: u8,
    pub _pad: u8,
}

assert_eq_size!(SpandaEngine, [u8; 8]);

/// Mirror of C QL_Tick — 1 byte
pub type QLTick = u8;

/// Mirror of C M1_Root — 40 bytes
///
/// Contains pointers — mirror the shape for size checking.
#[repr(C)]
#[derive(Debug)]
pub struct M1Root {
    pub hc: *mut super::HolographicCoordinate,
    pub active_cf: *const super::HolographicCoordinate,
    pub spanda: SpandaEngine,
    pub torus_pos: QLTick,
    pub _pad: [u8; 7],     // alignment padding after u8 before pointer
    pub ananda: *const u8, // DR_Matrix_12x12*
}

assert_eq_size!(M1Root, [u8; 40]);
