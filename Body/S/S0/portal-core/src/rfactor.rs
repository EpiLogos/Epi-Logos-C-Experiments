//! Archetype-7 R-factor theory in full (Tranche 01.T1.12).
//!
//! Archetype 7 (Divine Action, `M0-3-10`) IS the R-factor theory entire — the
//! holographic pre-formation of the M0–M5 metastructure. This module is the
//! Rust mirror of the `IX-B` section in [`m0.h`], landing:
//!
//! - **Tier 1** — the principle triad `##` (Truth) / `#R` (Light) / `R#` (Life).
//! - **Tier 2** — the six act-factors `R0..R5` over a 7×6 distribution matrix
//!   (`R5` positionless / `(##)` bare).
//! - **Tier 3** — the `nR` chirality: every act `Rn` has an enantiomer `nR`,
//!   the same act *witnessed*. The chiral pair defines one Law-1 polarity.
//! - The `(@#)` turn — where an R-traversal's band flips (Pravritti→Nivritti).
//!
//! It also provides the canonical parser for the extended `namespace` rule of
//! the Anuttara symbolic-coordinate-string EBNF — covering `R0..R5`,
//! `nR0..nR5`, `##`, `#R`, and `R#` (the 1.11 grammar covered only `R0..R4`).
//!
//! [`m0.h`]: ../../../epi-lib/include/m0.h

use serde::{Deserialize, Serialize};

/// Number of act-factors, `R0..R5`.
pub const R_FACTOR_COUNT: usize = 6;
/// Number of distribution-matrix bases (rows).
pub const R_FACTOR_BASE_COUNT: usize = 7;
/// Sentinel fret position: absent / positionless (same value as the C
/// `GET_R_POS` "absent" code and `R5_POSITIONLESS`).
pub const R5_POSITIONLESS: u8 = 7;

/// The `(@#)` band-turn marker — the pivot where a traversal's band flips.
pub const BAND_TURN_SYMBOL: &str = "(@#)";

// ---------------------------------------------------------------------------
// Tier 1: the principle triad (Law-1 chirality of `#` and `R`).
// ---------------------------------------------------------------------------

/// The principle triad. Divine Action's compiled terminal form reduces to
/// `(##) and (R#) and (#R)` — the triad is its *closure*, not adjacent to it.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Triad {
    /// `##` — Truth (`## = @ = (0/1)-(00)-00`; matrix on matrix).
    Truth,
    /// `#R` — Light / Openness / Creativity (`#R = @ = (7-8-9-(0/1)/O#-X#-N#)`).
    Light,
    /// `R#` — Life / Freedom / Svatantrya (parent of the acts; `@5` runtime terminus).
    Life,
}

impl Triad {
    /// The verbatim two-mark symbol.
    pub const fn symbol(self) -> &'static str {
        match self {
            Triad::Truth => "##",
            Triad::Light => "#R",
            Triad::Life => "R#",
        }
    }

    /// The human-facing name (Truth / Light / Life).
    pub const fn name(self) -> &'static str {
        match self {
            Triad::Truth => "Truth",
            Triad::Light => "Light",
            Triad::Life => "Life",
        }
    }
}

// ---------------------------------------------------------------------------
// Tier 2: the six act-factors + distribution matrix.
// ---------------------------------------------------------------------------

/// The seven bases (rows of the distribution matrix) — the five operator
/// bases of the QL meta-logic cycle plus the Śiva/Śakti pair.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Base {
    /// `O#` Paramaśiva.
    OSharp,
    /// `X#` Paraśakti.
    XSharp,
    /// `N#` Spanda.
    NSharp,
    /// `M#` Mahāmāyā.
    MSharp,
    /// `#` Nara.
    Nara,
    /// Śiva.
    Siva,
    /// Śakti — the `(@#)` turn lives here (`R2@5` + `R3@0`).
    Shakti,
}

impl Base {
    /// Row index into [`R_FACTOR_DISTRIBUTION`].
    pub const fn index(self) -> usize {
        self as usize
    }

    /// The macro M-branch this base pre-threads (`O#→M1 … Śakti→M5`).
    pub const fn m_column(self) -> u8 {
        match self {
            Base::OSharp => 1,
            Base::XSharp => 2,
            Base::NSharp => 3,
            Base::MSharp => 4,
            Base::Nara => 4,
            Base::Siva => 5,
            Base::Shakti => 5,
        }
    }

    /// All seven bases in row order.
    pub const ALL: [Base; R_FACTOR_BASE_COUNT] = [
        Base::OSharp,
        Base::XSharp,
        Base::NSharp,
        Base::MSharp,
        Base::Nara,
        Base::Siva,
        Base::Shakti,
    ];
}

/// Distribution matrix `[base][r_factor]` → fret position `0..5`, or
/// [`R5_POSITIONLESS`] (`7`) = absent. Mirrors `R_FACTOR_DISTRIBUTION` in
/// `m0.c`; decoded from the route table for `R0..R4` with `R5` positionless.
///
/// ```text
///   Base          R0  R1  R2  R3  R4  R5
///   O# Paramaśiva   1   0   —   —   5   —
///   X# Paraśakti    2   1   0   5   4   —
///   N# Spanda       3   2   1   4   3   —
///   M# Mahāmāyā     —   3   2   3   2   —
///   #  Nara         —   4   3   2   1   —
///   Śiva            —   5   4   1   0   —
///   Śakti           —   —   5   0   —   —   (— = 7)
/// ```
pub const R_FACTOR_DISTRIBUTION: [[u8; R_FACTOR_COUNT]; R_FACTOR_BASE_COUNT] = [
    [1, 0, 7, 7, 5, R5_POSITIONLESS], // O#
    [2, 1, 0, 5, 4, R5_POSITIONLESS], // X#
    [3, 2, 1, 4, 3, R5_POSITIONLESS], // N#
    [7, 3, 2, 3, 2, R5_POSITIONLESS], // M#
    [7, 4, 3, 2, 1, R5_POSITIONLESS], // #  Nara
    [7, 5, 4, 1, 0, R5_POSITIONLESS], // Śiva
    [7, 7, 5, 0, 7, R5_POSITIONLESS], // Śakti
];

/// Fret position of act `r_factor` (`0..5`) at `base`, or [`R5_POSITIONLESS`]
/// when the act does not distribute to that base.
pub fn distribution_position(base: Base, r_factor: u8) -> u8 {
    if r_factor as usize >= R_FACTOR_COUNT {
        return R5_POSITIONLESS;
    }
    R_FACTOR_DISTRIBUTION[base.index()][r_factor as usize]
}

// ---------------------------------------------------------------------------
// Tier 3: nR chirality (Law-1 polarity).
// ---------------------------------------------------------------------------

/// The hand an act is read in. `Rn` is the act *operating* (Archetype-7);
/// `nR = @` is the same act *witnessed* (Archetype-9). The pair `(Rn, nR)`
/// defines one Law-1 polarity.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Chirality {
    /// `Rn` — act operating.
    Operator,
    /// `nR` — act witnessed as Presence `@`.
    Witness,
}

impl Chirality {
    /// The enantiomer: inverting the hand. Applying twice is the identity.
    pub const fn partner(self) -> Chirality {
        match self {
            Chirality::Operator => Chirality::Witness,
            Chirality::Witness => Chirality::Operator,
        }
    }
}

// ---------------------------------------------------------------------------
// The (@#) turn + RFactorPathStep.
// ---------------------------------------------------------------------------

/// The band an R-traversal is in. It flips at the `(@#)` turn.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Band {
    /// Descent — `R1`/`R2` deepen.
    Pravritti,
    /// Ascent — `R3`/`R4` deepen.
    Nivritti,
    /// The `(@#)` pivot itself.
    Turn,
}

/// One step of an R-traversal trace. Mirrors `RFactorPathStep` in `m0.h`;
/// `band == Band::Turn` marks the `(@#)` flip. Every kernel execution
/// (oracle cast, walk step, transform stage, session close, canon promotion)
/// may stamp a `Vec<RFactorPathStep>` onto its trace.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct RFactorPathStep {
    /// Act index `0..5` (`R0..R5`).
    pub r_factor: u8,
    /// The base this step traverses.
    pub base: Base,
    /// Which band — `Band::Turn` marks the `(@#)` flip.
    pub band: Band,
    /// Fret position `0..5`, or [`R5_POSITIONLESS`].
    pub position: u8,
}

// ---------------------------------------------------------------------------
// EBNF `namespace` parser (extended over the 1.11 `"R" digit` grammar).
// ---------------------------------------------------------------------------

/// A parsed R-factor namespace token — the result of the extended
/// `namespace := ("n")? "R" digit | "#" "#" | "#" "R" | "R" "#"` rule.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum RToken {
    /// An act-factor `Rn` (operator) or `nR` (witness), `n` in `0..=5`.
    Act { factor: u8, chirality: Chirality },
    /// A principle of the triad (`##` / `#R` / `R#`).
    Principle(Triad),
}

/// Failure modes of [`parse_namespace`].
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RParseError {
    /// Input did not match any `namespace` production.
    Unrecognized(String),
    /// An `Rn`/`nR` digit outside `0..=5` (e.g. `R6`, `nR9`).
    DigitOutOfRange(u8),
}

impl std::fmt::Display for RParseError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            RParseError::Unrecognized(s) => write!(f, "unrecognized R-factor namespace: {s:?}"),
            RParseError::DigitOutOfRange(d) => {
                write!(f, "R-factor digit {d} out of range (expected 0..=5)")
            }
        }
    }
}

impl std::error::Error for RParseError {}

/// Parse the extended R-factor `namespace` rule.
///
/// Accepts, per Tranche 01.T1.12:
/// - `R0`..`R5` — act-factor operator (`Rn`).
/// - `nR0`..`nR5` — act-factor witness (`nR`, the chiral conjugate).
/// - `##` — Truth, `#R` — Light, `R#` — Life (the principle triad).
///
/// The 1.11 grammar only accepted `"R" digit` for `R0..R4`; this extends it
/// to `R5`, the `nR` chirality, and the three triad principles.
pub fn parse_namespace(input: &str) -> Result<RToken, RParseError> {
    // Tier 1 — the principle triad (two-mark forms, checked first so `R#` is
    // not mistaken for an act-factor missing its digit).
    match input {
        "##" => return Ok(RToken::Principle(Triad::Truth)),
        "#R" => return Ok(RToken::Principle(Triad::Light)),
        "R#" => return Ok(RToken::Principle(Triad::Life)),
        _ => {}
    }

    // Tier 3 — witness chirality `nRk`.
    if let Some(rest) = input.strip_prefix("nR") {
        return parse_act_digit(rest, Chirality::Witness, input);
    }

    // Tier 2 — operator `Rk`.
    if let Some(rest) = input.strip_prefix('R') {
        return parse_act_digit(rest, Chirality::Operator, input);
    }

    Err(RParseError::Unrecognized(input.to_string()))
}

fn parse_act_digit(
    rest: &str,
    chirality: Chirality,
    original: &str,
) -> Result<RToken, RParseError> {
    // Exactly one decimal digit follows the `R`/`nR` prefix.
    let bytes = rest.as_bytes();
    if bytes.len() != 1 || !bytes[0].is_ascii_digit() {
        return Err(RParseError::Unrecognized(original.to_string()));
    }
    let factor = bytes[0] - b'0';
    if factor as usize >= R_FACTOR_COUNT {
        return Err(RParseError::DigitOutOfRange(factor));
    }
    Ok(RToken::Act { factor, chirality })
}

#[cfg(test)]
mod tests {
    use super::*;

    // --- Tier 1: principle triad ------------------------------------------

    #[test]
    fn triad_symbols_are_canonical() {
        assert_eq!(Triad::Truth.symbol(), "##");
        assert_eq!(Triad::Light.symbol(), "#R");
        assert_eq!(Triad::Life.symbol(), "R#");
        assert_eq!(Triad::Truth.name(), "Truth");
        assert_eq!(Triad::Light.name(), "Light");
        assert_eq!(Triad::Life.name(), "Life");
    }

    // --- Tier 2: distribution matrix --------------------------------------

    #[test]
    fn matrix_matches_spec_rows() {
        // Verbatim from the spec distribution table.
        assert_eq!(R_FACTOR_DISTRIBUTION[Base::OSharp.index()], [1, 0, 7, 7, 5, 7]);
        assert_eq!(R_FACTOR_DISTRIBUTION[Base::Shakti.index()], [7, 7, 5, 0, 7, 7]);
        assert_eq!(distribution_position(Base::XSharp, 2), 0);
        assert_eq!(distribution_position(Base::Siva, 4), 0);
    }

    #[test]
    fn r5_is_positionless_at_every_base() {
        for base in Base::ALL {
            assert_eq!(distribution_position(base, 5), R5_POSITIONLESS);
        }
    }

    #[test]
    fn r0_is_confined_to_the_upper_triad() {
        // Creation appears only at O#/X#/N#; absent below Spanda.
        assert_eq!(distribution_position(Base::OSharp, 0), 1);
        assert_eq!(distribution_position(Base::XSharp, 0), 2);
        assert_eq!(distribution_position(Base::NSharp, 0), 3);
        for base in [Base::MSharp, Base::Nara, Base::Siva, Base::Shakti] {
            assert_eq!(distribution_position(base, 0), R5_POSITIONLESS);
        }
    }

    #[test]
    fn per_fret_complementarity_holds() {
        // R1 + R4 = 5 and R2 + R3 = 5 wherever both are present.
        for base in Base::ALL {
            let row = R_FACTOR_DISTRIBUTION[base.index()];
            if row[1] != R5_POSITIONLESS && row[4] != R5_POSITIONLESS {
                assert_eq!(row[1] + row[4], 5, "R1+R4 at {base:?}");
            }
            if row[2] != R5_POSITIONLESS && row[3] != R5_POSITIONLESS {
                assert_eq!(row[2] + row[3], 5, "R2+R3 at {base:?}");
            }
        }
    }

    #[test]
    fn base_pre_threads_correct_m_column() {
        assert_eq!(Base::OSharp.m_column(), 1);
        assert_eq!(Base::XSharp.m_column(), 2);
        assert_eq!(Base::NSharp.m_column(), 3);
        assert_eq!(Base::MSharp.m_column(), 4);
        assert_eq!(Base::Nara.m_column(), 4);
        assert_eq!(Base::Siva.m_column(), 5);
        assert_eq!(Base::Shakti.m_column(), 5);
    }

    // --- Tier 3: nR chirality ---------------------------------------------

    #[test]
    fn chirality_partner_is_an_involution() {
        assert_eq!(Chirality::Operator.partner(), Chirality::Witness);
        assert_eq!(Chirality::Witness.partner(), Chirality::Operator);
        assert_eq!(Chirality::Operator.partner().partner(), Chirality::Operator);
        assert_eq!(Chirality::Witness.partner().partner(), Chirality::Witness);
    }

    // --- The (@#) band turn -----------------------------------------------

    #[test]
    fn band_turn_pivots_at_shakti() {
        // Beauty (2R) ends at Śakti R2@5; Life (3R) begins at Śakti R3@0.
        let beauty_end = RFactorPathStep {
            r_factor: 2,
            base: Base::Shakti,
            band: Band::Pravritti,
            position: distribution_position(Base::Shakti, 2),
        };
        let turn = RFactorPathStep {
            r_factor: 2,
            base: Base::Shakti,
            band: Band::Turn,
            position: R5_POSITIONLESS,
        };
        let life_begin = RFactorPathStep {
            r_factor: 3,
            base: Base::Shakti,
            band: Band::Nivritti,
            position: distribution_position(Base::Shakti, 3),
        };
        assert_eq!(beauty_end.position, 5);
        assert_eq!(life_begin.position, 0);
        assert_eq!(turn.band, Band::Turn);
        assert_eq!(BAND_TURN_SYMBOL, "(@#)");
    }

    // --- EBNF namespace parser --------------------------------------------

    #[test]
    fn parser_accepts_all_act_operators_r0_through_r5() {
        for n in 0u8..=5 {
            let tok = parse_namespace(&format!("R{n}")).unwrap();
            assert_eq!(
                tok,
                RToken::Act {
                    factor: n,
                    chirality: Chirality::Operator
                }
            );
        }
    }

    #[test]
    fn parser_accepts_all_witness_enantiomers_nr0_through_nr5() {
        for n in 0u8..=5 {
            let tok = parse_namespace(&format!("nR{n}")).unwrap();
            assert_eq!(
                tok,
                RToken::Act {
                    factor: n,
                    chirality: Chirality::Witness
                }
            );
        }
    }

    #[test]
    fn parser_accepts_the_principle_triad() {
        assert_eq!(parse_namespace("##").unwrap(), RToken::Principle(Triad::Truth));
        assert_eq!(parse_namespace("#R").unwrap(), RToken::Principle(Triad::Light));
        assert_eq!(parse_namespace("R#").unwrap(), RToken::Principle(Triad::Life));
    }

    #[test]
    fn parser_distinguishes_chiral_partners() {
        let op = parse_namespace("R3").unwrap();
        let wit = parse_namespace("nR3").unwrap();
        match (op, wit) {
            (
                RToken::Act { factor: a, chirality: ca },
                RToken::Act { factor: b, chirality: cb },
            ) => {
                assert_eq!(a, b); // same act
                assert_eq!(ca.partner(), cb); // opposite hand
            }
            _ => panic!("expected two act tokens"),
        }
    }

    #[test]
    fn parser_rejects_out_of_range_and_garbage() {
        assert_eq!(parse_namespace("R6"), Err(RParseError::DigitOutOfRange(6)));
        assert_eq!(parse_namespace("nR9"), Err(RParseError::DigitOutOfRange(9)));
        assert!(matches!(parse_namespace("R"), Err(RParseError::Unrecognized(_))));
        assert!(matches!(parse_namespace("RR"), Err(RParseError::Unrecognized(_))));
        assert!(matches!(parse_namespace("#"), Err(RParseError::Unrecognized(_))));
        assert!(matches!(parse_namespace("xR1"), Err(RParseError::Unrecognized(_))));
    }
}
