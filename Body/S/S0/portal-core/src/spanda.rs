//! Coordinate: S0/#1 (M1-3 Spanda — the tick floor)
//! Residency: Body/S/S0/portal-core/src/spanda.rs
//! Position (#n): #1 — Definition/Form (the dual-oscillator primitive)
//! Actualises: [[02-m1-paramasiva-reconciliation]] T2.11 — the (0/1)/(1/0)
//!   dual counter-phase oscillation as a continuous HKB relative-phase field,
//!   authored in epi-lib C (m1.c/m1.h) and MIRRORED here (C ground → Rust
//!   surface; Rust reflects the dynamics, it does not own them).
//! Public surface: spanda_invert, spanda_half_turn, quantize_to_spanda_substage,
//!   SpandaHkbParams (config-driven via [ml.m1_paramasiva], derived defaults),
//!   hkb_{drift,potential,curvature,settle}, pole_wave, superposition,
//!   standing_envelope, pole_rms, intrinsic_twelvefold, ql_positions_derived,
//!   tick12_readout, codon_advance, delta_band_hz, frequency_citation.
//! Does NOT own: the oscillation reality (epi-lib m1.c owns it); the codon
//!   space (M3 owns it — this surface only carries the advancement clock);
//!   the 720° double cover (M1-5 quaternionic layer, hopf.rs/quaternion.rs).

use std::ffi::CStr;
use std::os::raw::c_char;

/// C `Quaternion` (m1.h FR 2.1.6) at the FFI boundary — w,x,y,z as f32.
#[repr(C)]
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct SpandaQuaternion {
    pub w: f32,
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

/// HKB dual-oscillator coefficients — mirrors C `Spanda_HKB_Params`.
///
/// Config-driven via the `[ml.m1_paramasiva]` section of
/// `~/.epi-logos/config.toml`; defaults are DERIVED, never guessed:
/// `a = 1.0` (fundamental normalization), `b = 9/16` (the 16/9 generative
/// gap inverted — octave-minus-wholetone as second-harmonic coupling, so
/// b/a = 0.5625 > 1/4 and both wells stand), `delta_omega = 0` (the poles
/// are co-original), `base_freq_hz = 2.5` (conserved-delta band centre —
/// a cited band, never a fake-precise 2.0).
#[repr(C)]
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct SpandaHkbParams {
    pub delta_omega: f64,
    pub a: f64,
    pub b: f64,
    pub base_freq_hz: f64,
}

extern "C" {
    fn spanda_hkb_params_default() -> SpandaHkbParams;
    fn spanda_hkb_frequency_band(lo_hz: *mut f64, hi_hz: *mut f64);
    fn spanda_hkb_frequency_citation() -> *const c_char;
    fn spanda_hkb_drift(phi: f64, p: *const SpandaHkbParams) -> f64;
    fn spanda_hkb_potential(phi: f64, p: *const SpandaHkbParams) -> f64;
    fn spanda_hkb_curvature(phi: f64, p: *const SpandaHkbParams) -> f64;
    fn spanda_hkb_settle(phi0: f64, dt: f64, steps: u32, p: *const SpandaHkbParams) -> f64;
    fn spanda_pole_wave(x: f64, t: f64, pole: u8, pole_swapped: bool) -> f64;
    fn spanda_superposition(x: f64, t: f64, pole_swapped: bool) -> f64;
    fn spanda_standing_envelope(x: f64, pole_swapped: bool) -> f64;
    fn spanda_pole_rms(pole: u8, pole_swapped: bool) -> f64;
    fn spanda_half_turn_index(n: u8) -> u8;
    fn spanda_intrinsic_twelvefold() -> u8;
    fn spanda_ql_positions_derived() -> u8;
    fn spanda_tick12_readout(cycle_phase: f64) -> u8;
    fn spanda_codon_advance(rot: SpandaQuaternion, cycle: u64) -> u8;
}

impl SpandaHkbParams {
    /// The derived defaults from the C ground.
    pub fn default_derived() -> Self {
        unsafe { spanda_hkb_params_default() }
    }

    /// Load from an `[ml.m1_paramasiva]` TOML section (config-driven law).
    /// Missing keys fall back to the derived defaults; a `base_freq_hz`
    /// outside the cited delta band is REFUSED — the anchor is a cited
    /// band, not a free knob.
    pub fn from_ml_config(toml_text: &str) -> Result<Self, String> {
        let value: toml::Value =
            toml::from_str(toml_text).map_err(|e| format!("config parse: {e}"))?;
        let defaults = Self::default_derived();
        let section = value.get("ml").and_then(|ml| ml.get("m1_paramasiva"));
        let get = |key: &str, fallback: f64| -> f64 {
            section
                .and_then(|s| s.get(key))
                .and_then(toml::Value::as_float)
                .unwrap_or(fallback)
        };
        let params = Self {
            delta_omega: get("delta_omega", defaults.delta_omega),
            a: get("a", defaults.a),
            b: get("b", defaults.b),
            base_freq_hz: get("base_freq_hz", defaults.base_freq_hz),
        };
        let (lo, hi) = delta_band_hz();
        if params.base_freq_hz < lo || params.base_freq_hz > hi {
            return Err(format!(
                "base_freq_hz {} outside the cited conserved-delta band [{lo}, {hi}] Hz — {}",
                params.base_freq_hz,
                frequency_citation()
            ));
        }
        Ok(params)
    }
}

/// The cited conserved-delta band (lo, hi) in Hz.
pub fn delta_band_hz() -> (f64, f64) {
    let (mut lo, mut hi) = (0.0f64, 0.0f64);
    unsafe { spanda_hkb_frequency_band(&mut lo, &mut hi) };
    (lo, hi)
}

/// The citation line for the frequency anchor (never a bare number).
pub fn frequency_citation() -> &'static str {
    unsafe {
        CStr::from_ptr(spanda_hkb_frequency_citation())
            .to_str()
            .expect("citation is static ASCII")
    }
}

/// φ̇ = Δω − a·sin φ − 2b·sin 2φ.
pub fn hkb_drift(phi: f64, params: &SpandaHkbParams) -> f64 {
    unsafe { spanda_hkb_drift(phi, params) }
}

/// V(φ) = −a·cos φ − b·cos 2φ.
pub fn hkb_potential(phi: f64, params: &SpandaHkbParams) -> f64 {
    unsafe { spanda_hkb_potential(phi, params) }
}

/// V″(φ) = a·cos φ + 4b·cos 2φ — V″(0)=a+4b, V″(π)=4b−a.
pub fn hkb_curvature(phi: f64, params: &SpandaHkbParams) -> f64 {
    unsafe { spanda_hkb_curvature(phi, params) }
}

/// Integrate the HKB ODE from `phi0`; returns settled φ wrapped to (−π, π].
pub fn hkb_settle(phi0: f64, dt: f64, steps: u32, params: &SpandaHkbParams) -> f64 {
    unsafe { spanda_hkb_settle(phi0, dt, steps, params) }
}

/// Pole 0 = bimba (0/1) cos(x−t); pole 1 = pratibimba (1/0) cos(x+t).
/// `pole_swapped` applies the half-turn on the field (π polarity flip of
/// the reflection pole).
pub fn pole_wave(x: f64, t: f64, pole: u8, pole_swapped: bool) -> f64 {
    unsafe { spanda_pole_wave(x, t, pole, pole_swapped) }
}

/// The counter-phase superposition — where 0/1 + 1/0 = 1/1 is computed.
pub fn superposition(x: f64, t: f64, pole_swapped: bool) -> f64 {
    unsafe { spanda_superposition(x, t, pole_swapped) }
}

/// Standing-wave envelope: antinode 2.0 (the 100%), node 0.0 (the ≠ as
/// silence); the pole-swap exchanges them.
pub fn standing_envelope(x: f64, pole_swapped: bool) -> f64 {
    unsafe { spanda_standing_envelope(x, pole_swapped) }
}

/// Solo-pole RMS over one period — invariant under the pole-swap.
pub fn pole_rms(pole: u8, pole_swapped: bool) -> f64 {
    unsafe { spanda_pole_rms(pole, pole_swapped) }
}

/// The intrinsic twelvefold, generated by the flowering progression
/// 4→6→8→10→12 (0 if the C LUT ever disagrees with the generation law).
pub fn intrinsic_twelvefold() -> u8 {
    unsafe { spanda_intrinsic_twelvefold() }
}

/// QL positions derived FROM the twelvefold: 6 = 12/2.
pub fn ql_positions_derived() -> u8 {
    unsafe { spanda_ql_positions_derived() }
}

/// tick12 as READOUT of a continuous oscillation cycle phase (radians).
/// Nothing re-grounds on this integer.
pub fn tick12_readout(cycle_phase: f64) -> u8 {
    unsafe { spanda_tick12_readout(cycle_phase) }
}

/// Codon advancement from the REAL quaternionic-rotational state + clock
/// cycle + epogdoon compression — never from a bare tick12 integer.
pub fn codon_advance(rot: SpandaQuaternion, cycle: u64) -> u8 {
    unsafe { spanda_codon_advance(rot, cycle) }
}

/// Apply the # REFLECTION involution to a Spanda substage index.
/// Base-pair rule: #(n) = 11 − n (Watson-Crick complement in 12-fold index
/// space) — the traversal-reversal, the `1/0` return-switch. On
/// RING_QUATERNION_LUT this is the SU(2) antipode (q ↦ −q). NOT the
/// antiphase pole-swap — that is `spanda_half_turn`. Every # application
/// names which involution it means.
pub fn spanda_invert(stage: u8) -> u8 {
    11u8.wrapping_sub(stage)
}

/// Apply the # HALF-TURN involution — n ↦ (n+6) mod 12, the antiphase
/// pole-swap. Distinct from `spanda_invert` (reflection); they compose to
/// 5−n, closing the Klein four-group. C ground: `spanda_half_turn_index`.
pub fn spanda_half_turn(stage: u8) -> u8 {
    unsafe { spanda_half_turn_index(stage % 12) }
}

/// Quantize oracle charges to the nearest Spanda substage index (0-11).
/// Uses Water(y/G/np) and Fire(x/A/nn) charges for the minor-circle angle.
pub fn quantize_to_spanda_substage(y: f32, x: f32) -> u8 {
    let phi_angle = y.atan2(x);
    let normalized = (phi_angle + std::f32::consts::PI) / std::f32::consts::TAU;
    ((normalized * 12.0).round() as u8) % 12
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn invert_symmetry() {
        for i in 0..12u8 {
            assert_eq!(spanda_invert(spanda_invert(i)), i);
        }
    }

    #[test]
    fn invert_complement_sums_to_11() {
        for i in 0..12u8 {
            assert_eq!(i + spanda_invert(i), 11);
        }
    }

    #[test]
    fn half_turn_is_order_two_and_distinct_from_reflection() {
        for i in 0..12u8 {
            assert_eq!(spanda_half_turn(spanda_half_turn(i)), i);
            assert_ne!(spanda_half_turn(i), spanda_invert(i));
        }
    }

    #[test]
    fn quantize_returns_valid_range() {
        for angle in 0..360 {
            let rad = (angle as f32) * std::f32::consts::TAU / 360.0;
            let result = quantize_to_spanda_substage(rad.sin(), rad.cos());
            assert!(result < 12);
        }
    }

    #[test]
    fn derived_defaults_hold_both_wells_and_the_cited_band() {
        let p = SpandaHkbParams::default_derived();
        assert!((p.b / p.a - 9.0 / 16.0).abs() < 1e-12);
        assert!(
            p.b / p.a > 0.25,
            "default coupling must hold the antiphase well"
        );
        let (lo, hi) = delta_band_hz();
        assert!(lo < p.base_freq_hz && p.base_freq_hz < hi);
        assert!((p.base_freq_hz - 2.0).abs() > 1e-9, "never fake-2.0");
        let citation = frequency_citation();
        assert!(
            citation.contains("Buzsaki"),
            "band must stay cited: {citation}"
        );
    }

    #[test]
    fn ml_config_section_overrides_and_band_is_enforced() {
        let params =
            SpandaHkbParams::from_ml_config("[ml.m1_paramasiva]\nbase_freq_hz = 2.7\nb = 0.5\n")
                .expect("in-band config loads");
        assert!((params.base_freq_hz - 2.7).abs() < 1e-12);
        assert!((params.b - 0.5).abs() < 1e-12);
        assert!(
            (params.a - 1.0).abs() < 1e-12,
            "missing keys fall to derived defaults"
        );
        let refused = SpandaHkbParams::from_ml_config("[ml.m1_paramasiva]\nbase_freq_hz = 12.0\n");
        assert!(
            refused.is_err(),
            "12 Hz is a display framerate, not the beat — must refuse"
        );
    }
}
