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
    /// M3 codon charge computation via FFI.
    /// pp = X+Y+Z, nn = X-Y-Z, np = X-Y+Z, pn = X+Y-Z
    /// where X,Y,Z are nucleotide I-Ching values.
    pub fn m3_compute_charges_ffi(
        codon6bit: u8,
        pp_out: *mut i8,
        nn_out: *mut i8,
        np_out: *mut i8,
        pn_out: *mut i8,
    );
}

/// M3 codon charges returned by FFI.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct M3CodonCharges {
    pub pp: i8,
    pub nn: i8,
    pub np: i8,
    pub pn: i8,
}

/// Safe wrapper over `m3_compute_charges_ffi`.
/// Returns (pp, nn, np, pn) = (X+Y+Z, X-Y-Z, X-Y+Z, X+Y-Z)
/// where X,Y,Z are the I-Ching values of the three nucleotides.
pub fn compute_codon_charges(codon6bit: u8) -> M3CodonCharges {
    let mut pp: i8 = 0;
    let mut nn: i8 = 0;
    let mut np: i8 = 0;
    let mut pn: i8 = 0;
    unsafe {
        m3_compute_charges_ffi(codon6bit, &mut pp, &mut nn, &mut np, &mut pn);
    }
    M3CodonCharges { pp, nn, np, pn }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Mirror of the canonical C `NUCLEOTIDE_ICHING_VALUE[4] = {6, 9, 7, 8}`
    /// (`Body/S/S0/epi-lib/src/m3.c:25`). The test derives its own golden values
    /// from this LUT — it does NOT re-call the FFI to produce the expected side.
    const ICHING: [i16; 4] = [6, 9, 7, 8];

    fn golden(codon: u8) -> (i16, i16, i16) {
        let x = ICHING[((codon >> 4) & 0x03) as usize];
        let y = ICHING[((codon >> 2) & 0x03) as usize];
        let z = ICHING[(codon & 0x03) as usize];
        (x, y, z)
    }

    /// Cross-language parity: the FFI charge law must equal the canonical
    /// `pp=X+Y+Z, nn=X-Y-Z, np=X-Y+Z, pn=X+Y-Z` for every one of the 64 codons.
    /// This is the behavioral proof that `m3_compute_charges` is the single
    /// source of the Rust codon-charge surface (no drifting reimplementation).
    #[test]
    fn ffi_charges_match_canonical_formula_for_all_64_codons() {
        for codon in 0u8..64 {
            let (x, y, z) = golden(codon);
            let c = compute_codon_charges(codon);
            assert_eq!(c.pp as i16, x + y + z, "pp mismatch for codon {codon:#04x}");
            assert_eq!(c.nn as i16, x - y - z, "nn mismatch for codon {codon:#04x}");
            assert_eq!(c.np as i16, x - y + z, "np mismatch for codon {codon:#04x}");
            assert_eq!(c.pn as i16, x + y - z, "pn mismatch for codon {codon:#04x}");
        }
    }

    /// Aggregate integral invariant, in parity with the C
    /// `m3_verify_integral_invariant` (`m3.c:930`): the raw sum of `pp` over all
    /// 64 codons is 1440 (= 360 × 4, the "integral invariant"), and the per-suit
    /// (outer-nucleotide) raw sums are 336/384/352/368 (each ÷4 = 84/96/88/92,
    /// the suit integrals). Proves the FFI reproduces the kernel invariant.
    #[test]
    fn ffi_pp_integral_invariant_matches_c_kernel() {
        let mut total: i32 = 0;
        let mut per_suit = [0i32; 4];
        for codon in 0u8..64 {
            let pp = compute_codon_charges(codon).pp as i32;
            total += pp;
            per_suit[((codon >> 4) & 0x03) as usize] += pp;
        }
        assert_eq!(total, 1440, "sum(pp) over 64 codons must be 1440 (= 360 × 4)");
        assert_eq!(
            per_suit,
            [336, 384, 352, 368],
            "per-suit pp integrals (÷4 = 84/96/88/92)"
        );
    }
}
