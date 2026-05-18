//! FFI mirrors for the C bioquaternionic kernel.

#[repr(C)]
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Quaternion {
    pub w: f32,
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

#[repr(C)]
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct KernelBioquaternion {
    pub q_b: Quaternion,
    pub q_p: Quaternion,
}

#[repr(C)]
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct KernelResonanceVector {
    pub values: [f32; 72],
}

#[repr(C)]
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct KernelEnergy {
    pub bimba_pratibimba_energy: f32,
    pub lens_energy: f32,
    pub r_energy: f32,
    pub total_energy: f32,
}

#[repr(C)]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum KernelPhase {
    Descent = 0,
    Ascent = 1,
}

#[repr(C)]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum KernelElement {
    BimbaEncoding = 0,
    PratibimbaPrehension = 1,
    MobiusDescent = 2,
    SlashFlip = 3,
    PratibimbaAsBimba = 4,
    DoubledPrehension = 5,
    InverseMobius = 6,
    EnrichedReturn = 7,
}

#[repr(C)]
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct KernelTick {
    pub cycle: u64,
    pub sub_tick: u8,
    pub phase: KernelPhase,
    pub element: KernelElement,
    pub position6: u8,
    pub harmonic_ratio: f32,
}

extern "C" {
    pub fn kernel_epogdoon_ratio() -> f32;
    pub fn kernel_epogdoon_log() -> f32;
    pub fn kernel_ratio_ascending_fourth() -> f32;
    pub fn kernel_ratio_descending_fourth() -> f32;
    pub fn kernel_ratio_descending_fifth() -> f32;
    pub fn kernel_ratio_ascending_fifth() -> f32;
    pub fn kernel_bioquaternion_init(q_b: Quaternion, q_p: Quaternion) -> KernelBioquaternion;
    pub fn kernel_quat_distance_sq(a: Quaternion, b: Quaternion) -> f32;
    pub fn kernel_slash_flip_bimba_prime(state: KernelBioquaternion) -> Quaternion;
    pub fn kernel_resonance_index(lens: u8, helix: u8, position: u8) -> u8;
    pub fn kernel_tritone_square_for_lens(lens: u8) -> u8;
    pub fn kernel_resonance_square_emphasis(
        vector: *const KernelResonanceVector,
        out_square_emphasis: *mut f32,
    );
    pub fn kernel_energy_evaluate(
        state: KernelBioquaternion,
        observed: *const KernelResonanceVector,
        target: *const KernelResonanceVector,
        r_energy: f32,
    ) -> KernelEnergy;
    pub fn kernel_tick_from_epogdoon(cycle: u64, sub_tick: u8) -> KernelTick;
}
