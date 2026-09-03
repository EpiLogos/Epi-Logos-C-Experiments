use crate::ananda_music_bridge::{AnandaRatioEvidence, source_ratio_evidence};
use crate::ananda_vortex::{AnandaMatrixOp, AnandaVortexCell};

fn source_row(family: AnandaMatrixOp, row12: u8) -> AnandaRatioEvidence {
    let cell = AnandaVortexCell::project(family, row12, 1)
        .expect("canonical source-row probe remains inside the 12x12 field");
    source_ratio_evidence(&cell).expect("canonical source-row probe carries ratio evidence")
}

/// Recover the accepted eight-ratio QL harmonic basis from Ananda source rows
/// plus only the explicit inversion/composition operations already authored in
/// the M1 derivation lock.
///
/// Order matches the accepted QL-MEF canonical ratio surface:
/// `1/1, 4/3, 3/4, 3/2, 2/3, 16/9, 9/8, 2/1`.
///
/// This establishes ratio parity only. It does not assign an A/B/C relation or
/// D completion degree to an arbitrary Ananda cell.
pub fn derive_accepted_ql_ratio_basis() -> [AnandaRatioEvidence; 8] {
    let identity = source_row(AnandaMatrixOp::Pratibimba, 0);
    let fourth = source_row(AnandaMatrixOp::Pratibimba, 3);
    let inverse_fourth = fourth.clone().reciprocal();
    let two_thirds = source_row(AnandaMatrixOp::Bimba, 6);
    let fifth = two_thirds.clone().reciprocal();
    let totality = source_row(AnandaMatrixOp::Pratibimba, 7);
    let epogdoon = source_row(AnandaMatrixOp::Bimba, 8).reciprocal();
    let octave = AnandaRatioEvidence::compose(&totality, &epogdoon);

    [
        identity,
        fourth,
        inverse_fourth,
        fifth,
        two_thirds,
        totality,
        epogdoon,
        octave,
    ]
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ananda_music_bridge::{ExactRatio, RatioEvidenceKind};

    #[test]
    fn ananda_source_recovers_the_complete_accepted_ratio_basis() {
        let basis = derive_accepted_ql_ratio_basis();
        let ratios = basis.map(|evidence| evidence.ratio);

        assert_eq!(
            ratios,
            [
                ExactRatio::new(1, 1).unwrap(),
                ExactRatio::new(4, 3).unwrap(),
                ExactRatio::new(3, 4).unwrap(),
                ExactRatio::new(3, 2).unwrap(),
                ExactRatio::new(2, 3).unwrap(),
                ExactRatio::new(16, 9).unwrap(),
                ExactRatio::new(9, 8).unwrap(),
                ExactRatio::new(2, 1).unwrap(),
            ]
        );
    }

    #[test]
    fn ratio_basis_retains_source_vs_derivation_class() {
        let basis = derive_accepted_ql_ratio_basis();
        assert_eq!(basis[0].evidence_kind, RatioEvidenceKind::SourceRow);
        assert_eq!(basis[1].evidence_kind, RatioEvidenceKind::SourceRow);
        assert_eq!(basis[2].evidence_kind, RatioEvidenceKind::Reciprocal);
        assert_eq!(basis[3].evidence_kind, RatioEvidenceKind::Reciprocal);
        assert_eq!(basis[4].evidence_kind, RatioEvidenceKind::SourceRow);
        assert_eq!(basis[5].evidence_kind, RatioEvidenceKind::SourceRow);
        assert_eq!(basis[6].evidence_kind, RatioEvidenceKind::Reciprocal);
        assert_eq!(basis[7].evidence_kind, RatioEvidenceKind::Composition);
    }

    #[test]
    fn octave_has_two_independent_authored_derivation_paths() {
        let fourth = source_row(AnandaMatrixOp::Pratibimba, 3);
        let fifth = source_row(AnandaMatrixOp::Bimba, 6).reciprocal();
        let via_fourth_fifth = AnandaRatioEvidence::compose(&fourth, &fifth);

        let totality = source_row(AnandaMatrixOp::Pratibimba, 7);
        let epogdoon = source_row(AnandaMatrixOp::Bimba, 8).reciprocal();
        let via_totality_epogdoon = AnandaRatioEvidence::compose(&totality, &epogdoon);

        assert_eq!(via_fourth_fifth.ratio, ExactRatio::new(2, 1).unwrap());
        assert_eq!(via_totality_epogdoon.ratio, ExactRatio::new(2, 1).unwrap());
    }
}
