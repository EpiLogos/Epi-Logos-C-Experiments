use serde::Serialize;

use super::oracle_cast::IChingResult;

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
// Eval4 charges (pp/nn/pn/np): quaternionic polarity scores from the I-Ching
// line pattern. Named after the charge matrix in M3 Mahamaya.
//   pp = positive-positive (yang lines in yang positions: lines 1,3,5)
//   nn = negative-negative (yin lines in yin positions: lines 2,4,6) — stored negative
//   pn = positive-negative (yang in yin pos)
//   np = negative-positive (yin in yang pos)

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
    /// Quaternionic charge pp: yang lines (1) in yang positions (1,3,5). Range 0..+192.
    pub pp: f32,
    /// Quaternionic charge nn: yin lines in yin positions (2,4,6). Stored negative. Range -192..0.
    pub nn: f32,
    /// Quaternionic charge pn: yang in yin positions. Range 0..+192.
    pub pn: f32,
    /// Quaternionic charge np: yin in yang positions. Range 0..+192.
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

    // Eval4 charges: quaternionic polarity from the 6 line values.
    //
    // Yang positions (odd lines: 1, 3, 5 → indices 0, 2, 4):
    //   yang line (7 or 9) in yang pos → pp += 32.0
    //   yin line  (6 or 8) in yang pos → np += 32.0
    // Yin positions (even lines: 2, 4, 6 → indices 1, 3, 5):
    //   yin line  (6 or 8) in yin pos  → nn -= 32.0 (stored negative)
    //   yang line (7 or 9) in yin pos  → pn += 32.0
    //
    // Weight 32.0 per line × 6 lines = max |charge| = 192.0
    let mut pp: f32 = 0.0;
    let mut nn: f32 = 0.0;
    let mut pn: f32 = 0.0;
    let mut np: f32 = 0.0;

    for (i, &line_val) in result.lines.iter().enumerate() {
        let is_yang_line = line_val & 1 == 1; // 7 or 9 = yang (odd); 6 or 8 = yin (even)
        let is_yang_pos = i % 2 == 0; // positions 0,2,4 (lines 1,3,5) = yang
        match (is_yang_line, is_yang_pos) {
            (true, true) => pp += 32.0,
            (false, false) => nn -= 32.0,
            (true, false) => pn += 32.0,
            (false, true) => np += 32.0,
        }
    }

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
