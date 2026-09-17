use serde::Serialize;

use super::oracle_cast::IChingResult;
use crate::ffi::kernel::compute_codon_charges;

// ─── OraclePayload — Four Faces + Eval4 Charges ──────────────────────────
//
// The OraclePayload is the canonical structured result of a cast. It exposes
// all four faces of the oracle moment and the quaternionic eval4 charges.
//
// Four faces (canonical; see CLOCK-AND-NARA-SPECS/08-oracle-four-faces):
//   explicate face:   degree (0-359), phase=0
//   deficient face:   (degree + 180) % 360 — the shadow complement
//   implicate face:   degree as f32 + 360.0 — upper-hemisphere (SU(2) map)
//   temporal face:    primary_hex XOR changing_lines_mask — hexagram after change
//
// Eval4 charges (pp/nn/np/pn): derived from the SINGLE kernel charge authority
// `m3_compute_charges` (FR 2.3.18 closed form) via the FFI — NOT an independent
// per-line algebra (recapture register §5.1 / LAW(04): the oracle routes through
// the kernel; Tao 5-/5 ≡ m3_compute_charges). The hexagram's six yin/yang lines
// form a 6-bit codon; the kernel reads its three nucleotides' I-Ching values
// (X,Y,Z) and returns:
//   pp = X + Y + Z    nn = X - Y - Z    np = X - Y + Z    pn = X + Y - Z

/// Full structured result of an oracle cast — four faces and quaternionic charges.
///
/// Produced by `oracle_eval4()` from an `IChingResult`. Always contains real
/// computed values — no zeros from stubs.
#[derive(Debug, Clone, Serialize)]
pub struct OraclePayload {
    /// Explicate degree (0-359): canonical clock position of the cast moment.
    pub degree: u16,
    /// Phase: 0 = explicate (normal), 1 = implicate (shadow/reversed).
    pub phase: u8,
    /// Primary hexagram index (0-63).
    pub primary_hex: u8,
    /// Deficient face: (degree + 180) % 360 — the shadow complement degree.
    pub deficient_degree: u16,
    /// Implicate face: degree as f32 + 360.0 — SU(2) upper hemisphere position.
    pub implicate_720: f32,
    /// Temporal face: primary_hex XOR changing_lines_mask — hexagram after change lines resolve.
    pub temporal_hex: u8,
    /// Kernel charge pp = X+Y+Z (sum of the three nucleotide I-Ching values), via `m3_compute_charges`.
    pub pp: f32,
    /// Kernel charge nn = X-Y-Z, via `m3_compute_charges`.
    pub nn: f32,
    /// Kernel charge pn = X+Y-Z, via `m3_compute_charges`.
    pub pn: f32,
    /// Kernel charge np = X-Y+Z, via `m3_compute_charges`.
    pub np: f32,
}

/// Compute `OraclePayload` from an `IChingResult` and the current kairos degree.
///
/// `kairos_degree`: current sun degree (0.0-360.0) from `KerykeionResult.planets[sun].degree`.
///                  Pass 0.0 if kairos is unavailable — the four faces still compute correctly.
/// `phase`: 0 = explicate, 1 = implicate (set to 1 if the cast moment is shadow/reversed).
pub fn oracle_eval4(result: &IChingResult, kairos_degree: f32, phase: u8) -> OraclePayload {
    let degree = (kairos_degree as u16).min(359);

    // Face 1 — Explicate: canonical degree position (already in `degree`)
    // Face 2 — Deficient: opposite degree (shadow complement on the 360-circle)
    let deficient_degree = (degree as u32 + 180) as u16 % 360;

    // Face 3 — Implicate: SU(2) upper hemisphere (degree_anchor in 360-719 range)
    let implicate_720 = kairos_degree + 360.0;

    // Face 4 — Temporal: hexagram AFTER changing lines resolve (XOR flip)
    let temporal_hex = (result.primary_hexagram ^ result.changing_mask) & 0x3F;

    // Eval4 charges route through the single kernel charge authority
    // (`m3_compute_charges`, FR 2.3.18) — recapture register §5.1 / LAW(04),
    // replacing the retired independent ±32-per-line algebra. The six yin/yang
    // lines are a 6-bit codon (bit i = line i is yang: values 7/9 are odd), and
    // the kernel derives pp/nn/np/pn from the three nucleotide I-Ching values.
    let codon6 = result
        .lines
        .iter()
        .enumerate()
        .fold(0u8, |acc, (i, &line_val)| {
            acc | (((line_val & 1) as u8) << i)
        });
    let kernel = compute_codon_charges(codon6);
    let pp = kernel.pp as f32;
    let nn = kernel.nn as f32;
    let np = kernel.np as f32;
    let pn = kernel.pn as f32;

    OraclePayload {
        degree,
        phase,
        primary_hex: result.primary_hexagram,
        deficient_degree,
        implicate_720,
        temporal_hex,
        pp,
        nn,
        pn,
        np,
    }
}
