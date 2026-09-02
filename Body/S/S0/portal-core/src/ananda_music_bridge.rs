use serde::{Deserialize, Serialize};

use crate::ananda_vortex::{AnandaMatrixOp, AnandaVortexCell, ANANDA_SOURCE_REF};

/// Source/proof revision for the first W2 Ananda → music evidence layer.
pub const ANANDA_MUSIC_BRIDGE_VERSION: &str = "0.1.0";
pub const ANANDA_MUSIC_BRIDGE_REF: &str =
    "Idea/Bimba/Seeds/M/M1'/M1-SPANDA-ANANDA-MUSICAL-DERIVATION-LOCK.md";

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExactRatio {
    pub numerator: u16,
    pub denominator: u16,
}

impl ExactRatio {
    pub const fn new(numerator: u16, denominator: u16) -> Option<Self> {
        if numerator == 0 || denominator == 0 {
            return None;
        }
        let divisor = gcd(numerator, denominator);
        Some(Self {
            numerator: numerator / divisor,
            denominator: denominator / divisor,
        })
    }

    pub const fn reciprocal(self) -> Self {
        Self {
            numerator: self.denominator,
            denominator: self.numerator,
        }
    }

    pub const fn multiply(self, other: Self) -> Self {
        reduce(
            self.numerator * other.numerator,
            self.denominator * other.denominator,
        )
    }
}

const fn gcd(mut left: u16, mut right: u16) -> u16 {
    while right != 0 {
        let remainder = left % right;
        left = right;
        right = remainder;
    }
    left
}

const fn reduce(numerator: u16, denominator: u16) -> ExactRatio {
    let divisor = gcd(numerator, denominator);
    ExactRatio {
        numerator: numerator / divisor,
        denominator: denominator / divisor,
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum RatioEvidenceKind {
    SourceRow,
    Reciprocal,
    Composition,
}

/// Exact-ratio evidence carried separately from A/B/C relation selection.
///
/// `row12` and `family` identify the Vortex Modulae row that supplied the
/// arithmetic ratio. `source_ratio` remains the literal source reading even when
/// `ratio` is a reciprocal or composition derived from it.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnandaRatioEvidence {
    pub family: AnandaMatrixOp,
    pub row12: u8,
    pub source_ratio: ExactRatio,
    pub ratio: ExactRatio,
    pub evidence_kind: RatioEvidenceKind,
    pub source_ref: String,
    pub derivation_ref: String,
}

impl AnandaRatioEvidence {
    fn source(family: AnandaMatrixOp, row12: u8, ratio: ExactRatio) -> Self {
        Self {
            family,
            row12,
            source_ratio: ratio,
            ratio,
            evidence_kind: RatioEvidenceKind::SourceRow,
            source_ref: ANANDA_SOURCE_REF.to_owned(),
            derivation_ref: ANANDA_MUSIC_BRIDGE_REF.to_owned(),
        }
    }

    /// Apply an explicit inversion to source evidence.
    ///
    /// Reciprocal ratios are never silently substituted for the source row.
    pub fn reciprocal(mut self) -> Self {
        self.ratio = self.ratio.reciprocal();
        self.evidence_kind = RatioEvidenceKind::Reciprocal;
        self
    }

    /// Compose two already-proven exact ratios while retaining a synthetic
    /// provenance class rather than pretending the result appeared in one row.
    pub fn compose(left: &Self, right: &Self) -> Self {
        Self {
            family: left.family,
            row12: left.row12,
            source_ratio: left.source_ratio,
            ratio: left.ratio.multiply(right.ratio),
            evidence_kind: RatioEvidenceKind::Composition,
            source_ref: format!("{} + {}", left.source_ref, right.source_ref),
            derivation_ref: ANANDA_MUSIC_BRIDGE_REF.to_owned(),
        }
    }
}

/// Recover only the source rows that presently bear exact ratios used by the
/// accepted M1/QL harmonic derivation.
///
/// This is deliberately partial. It does not infer ratios from digit roots,
/// decimal remainders, arbitrary raw cell values, or Ananda matrix indices.
/// The source CSV presently gives the following directly useful row identities:
///
/// - Pratibimba 0X+1 = 1/1
/// - Pratibimba 3X+1 = 4/3
/// - Bimba 6X+0 = 2/3
/// - Pratibimba 7X+1 = 16/9
/// - Bimba 8X+0 = 8/9 (the explicit inverse precursor of the 9/8 epogdoon)
/// - Bimba 9X+0 = 1/1
pub fn source_ratio_evidence(cell: &AnandaVortexCell) -> Option<AnandaRatioEvidence> {
    let ratio = match (cell.family, cell.row12) {
        (AnandaMatrixOp::Pratibimba, 0) => ExactRatio::new(1, 1),
        (AnandaMatrixOp::Pratibimba, 3) => ExactRatio::new(4, 3),
        (AnandaMatrixOp::Bimba, 6) => ExactRatio::new(2, 3),
        (AnandaMatrixOp::Pratibimba, 7) => ExactRatio::new(16, 9),
        (AnandaMatrixOp::Bimba, 8) => ExactRatio::new(8, 9),
        (AnandaMatrixOp::Bimba, 9) => ExactRatio::new(1, 1),
        _ => None,
    }?;

    Some(AnandaRatioEvidence::source(cell.family, cell.row12, ratio))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn cell(family: AnandaMatrixOp, row12: u8) -> AnandaVortexCell {
        AnandaVortexCell::project(family, row12, 1).expect("test cell is in the source field")
    }

    #[test]
    fn source_rows_recover_literal_exact_ratios() {
        let cases = [
            (AnandaMatrixOp::Pratibimba, 0, ExactRatio::new(1, 1).unwrap()),
            (AnandaMatrixOp::Pratibimba, 3, ExactRatio::new(4, 3).unwrap()),
            (AnandaMatrixOp::Bimba, 6, ExactRatio::new(2, 3).unwrap()),
            (AnandaMatrixOp::Pratibimba, 7, ExactRatio::new(16, 9).unwrap()),
            (AnandaMatrixOp::Bimba, 8, ExactRatio::new(8, 9).unwrap()),
            (AnandaMatrixOp::Bimba, 9, ExactRatio::new(1, 1).unwrap()),
        ];

        for (family, row12, expected) in cases {
            let evidence = source_ratio_evidence(&cell(family, row12)).unwrap();
            assert_eq!(evidence.ratio, expected);
            assert_eq!(evidence.source_ratio, expected);
            assert_eq!(evidence.evidence_kind, RatioEvidenceKind::SourceRow);
            assert!(evidence.source_ref.contains("Vortex Modulae"));
        }
    }

    #[test]
    fn unrelated_rows_and_families_remain_unclassified() {
        assert!(source_ratio_evidence(&cell(AnandaMatrixOp::Bimba, 3)).is_none());
        assert!(source_ratio_evidence(&cell(AnandaMatrixOp::Pratibimba, 6)).is_none());
        assert!(source_ratio_evidence(&cell(AnandaMatrixOp::Sum, 7)).is_none());
        assert!(source_ratio_evidence(&cell(AnandaMatrixOp::DiffA, 3)).is_none());
        assert!(source_ratio_evidence(&cell(AnandaMatrixOp::Quintessence, 9)).is_none());
    }

    #[test]
    fn reciprocals_are_explicit_derived_evidence() {
        let fourth = source_ratio_evidence(&cell(AnandaMatrixOp::Pratibimba, 3)).unwrap();
        let inverse_fourth = fourth.reciprocal();
        assert_eq!(inverse_fourth.source_ratio, ExactRatio::new(4, 3).unwrap());
        assert_eq!(inverse_fourth.ratio, ExactRatio::new(3, 4).unwrap());
        assert_eq!(inverse_fourth.evidence_kind, RatioEvidenceKind::Reciprocal);

        let grounding = source_ratio_evidence(&cell(AnandaMatrixOp::Bimba, 6)).unwrap();
        assert_eq!(grounding.reciprocal().ratio, ExactRatio::new(3, 2).unwrap());

        let pre_epogdoon = source_ratio_evidence(&cell(AnandaMatrixOp::Bimba, 8)).unwrap();
        assert_eq!(pre_epogdoon.reciprocal().ratio, ExactRatio::new(9, 8).unwrap());
    }

    #[test]
    fn octave_closure_is_composed_not_relabelled_as_a_source_row() {
        let fourth = source_ratio_evidence(&cell(AnandaMatrixOp::Pratibimba, 3)).unwrap();
        let fifth = source_ratio_evidence(&cell(AnandaMatrixOp::Bimba, 6))
            .unwrap()
            .reciprocal();
        let octave = AnandaRatioEvidence::compose(&fourth, &fifth);

        assert_eq!(octave.ratio, ExactRatio::new(2, 1).unwrap());
        assert_eq!(octave.evidence_kind, RatioEvidenceKind::Composition);
    }

    #[test]
    fn totality_plus_explicit_epogdoon_closes_to_octave() {
        let totality = source_ratio_evidence(&cell(AnandaMatrixOp::Pratibimba, 7)).unwrap();
        let epogdoon = source_ratio_evidence(&cell(AnandaMatrixOp::Bimba, 8))
            .unwrap()
            .reciprocal();
        let octave = AnandaRatioEvidence::compose(&totality, &epogdoon);

        assert_eq!(octave.ratio, ExactRatio::new(2, 1).unwrap());
        assert_eq!(octave.evidence_kind, RatioEvidenceKind::Composition);
    }
}
