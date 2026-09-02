use crate::ananda_music_bridge::{source_ratio_evidence, AnandaRatioEvidence};
use crate::ananda_vortex::AnandaVortexCell;
use ql_core::{
    ConjugationDegree, ExpansionSide, PairingError, QlCoordinate, RelationFamily,
};
use ql_mef::{
    directed_pitch_delta, musical_completion_frame, pitch_at_lens, LensId, MusicalBasis,
    MusicalCompletionFrame,
};

/// W2 bridge revision: compose the authored Ananda relation/evidence field with
/// the accepted QL traversal/completion operators rather than deriving A/B/C
/// from a scalar digit-root or decimal value.
pub const ANANDA_QL_BRIDGE_VERSION: &str = "0.1.0";
pub const ANANDA_RELATION_TABLE_REF: &str =
    "Idea/Bimba/Seeds/M/M1'/Legacy/plans/M1-C-architecture.md";
pub const M1_PRIME_TRAVERSAL_REF: &str =
    "Idea/Bimba/Seeds/M/M1'/m1-prime-paramasiva-instrument.md";
pub const QL_MEF_MUSIC_REVISION: &str =
    "EpiLogos/QL-MEF#81@ed754d1cd65d92b54620f4305145970b84c3b53f";

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum PairOrientation {
    Canonical,
    Reverse,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ConjugateParticipation {
    /// The selected within-face pair is present, with no opposite-face endpoint
    /// activated in the relation field.
    None,
    /// Only the traversal source has its conjugate endpoint participating.
    SourceOnly,
    /// Only the traversal target has its conjugate endpoint participating.
    TargetOnly,
    /// Both opposite-face endpoints participate: the full conjugate square.
    Both,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct AnandaQlRelationParticipation {
    pub family: RelationFamily,
    pub pair_index: u8,
    pub orientation: PairOrientation,
    pub operator_ref: String,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct AnandaQlMusicalRealization {
    pub relation: AnandaQlRelationParticipation,
    pub traversal_source: QlCoordinate,
    pub traversal_target: QlCoordinate,
    pub completion_degree: ConjugationDegree,
    pub expansion_side: Option<ExpansionSide>,
    pub basis: MusicalBasis,
    pub lens: LensId,
    /// Directed interval of the actual source -> target traversal after the
    /// selected basis and lens transform. This is a QL musical consequence,
    /// not a re-labelling of the Ananda source ratio.
    pub interval_semitones: u8,
    pub completion: MusicalCompletionFrame,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct AnandaQlBridgeResult {
    /// Exact source-row ratio evidence where the Vortex Modulae source actually
    /// provides it. Absence is preserved as absence rather than inferred from DR.
    pub ananda_ratio: Option<AnandaRatioEvidence>,
    /// Zero-to-many QL relation participations for the walked positional pair.
    /// Overlap is retained (for example 2 -> 3 participates in both A and C).
    pub realizations: Vec<AnandaQlMusicalRealization>,
    pub ananda_relation_table_ref: &'static str,
    pub traversal_ref: &'static str,
    pub ql_music_revision: &'static str,
}

/// Classify an actual within-face positional traversal against the accepted
/// A/B/C relation field.
///
/// The relation is owned by the walked coordinates. Ananda family/DR/value is
/// intentionally absent from this function: the Seeds corpus describes Ananda
/// as the harmonic relation/evidence table while M1-4'/S2 owns the walk itself.
///
/// Reverse traversal remains the same structural pair with explicit orientation
/// so directional interval consequences can be preserved. Distinct authored
/// families are never collapsed when their pair geometry overlaps.
pub fn classify_ql_relation_participation(
    source: QlCoordinate,
    target: QlCoordinate,
) -> Vec<AnandaQlRelationParticipation> {
    if source.face != target.face || source.position == target.position {
        return Vec::new();
    }

    let source_position = source.position.value();
    let target_position = target.position.value();
    let mut out = Vec::new();

    for family in [RelationFamily::A, RelationFamily::B, RelationFamily::C] {
        for (pair_index, (left, right)) in family.pairs().into_iter().enumerate() {
            let orientation = if source_position == left && target_position == right {
                Some(PairOrientation::Canonical)
            } else if source_position == right && target_position == left {
                Some(PairOrientation::Reverse)
            } else {
                None
            };

            if let Some(orientation) = orientation {
                let pair = family
                    .pair(pair_index as u8)
                    .expect("canonical A/B/C pair index remains valid");
                out.push(AnandaQlRelationParticipation {
                    family,
                    pair_index: pair_index as u8,
                    orientation,
                    operator_ref: pair.operator_ref(),
                });
            }
        }
    }

    out
}

fn completion_state(
    relation: &AnandaQlRelationParticipation,
    participation: ConjugateParticipation,
) -> (ConjugationDegree, Option<ExpansionSide>) {
    match participation {
        ConjugateParticipation::None => (ConjugationDegree::D1, None),
        ConjugateParticipation::Both => (ConjugationDegree::D3, None),
        ConjugateParticipation::SourceOnly => {
            let side = match relation.orientation {
                PairOrientation::Canonical => ExpansionSide::Left,
                PairOrientation::Reverse => ExpansionSide::Right,
            };
            (ConjugationDegree::D2, Some(side))
        }
        ConjugateParticipation::TargetOnly => {
            let side = match relation.orientation {
                PairOrientation::Canonical => ExpansionSide::Right,
                PairOrientation::Reverse => ExpansionSide::Left,
            };
            (ConjugationDegree::D2, Some(side))
        }
    }
}

/// Compose one information-complete Ananda cell with an actual positional walk
/// and the accepted QL-MEF musical operators.
///
/// This function makes the W2 ownership split executable:
///
/// - Ananda supplies source arithmetic / residue / exact-ratio evidence;
/// - the walked source -> target coordinates determine zero-to-many A/B/C
///   participation;
/// - explicit conjugate participation determines D1/D2/D3 completion;
/// - QL-MEF #81 determines the basis/lens musical realization.
///
/// No `% n`, digit-root, matrix-family, or raw-value shortcut selects A/B/C or
/// D completion.
pub fn bridge_ananda_ql_traversal(
    cell: &AnandaVortexCell,
    source: QlCoordinate,
    target: QlCoordinate,
    conjugate_participation: ConjugateParticipation,
    basis: MusicalBasis,
    lens: LensId,
) -> Result<AnandaQlBridgeResult, PairingError> {
    let relations = classify_ql_relation_participation(source, target);
    let interval_semitones = directed_pitch_delta(
        pitch_at_lens(basis, lens, source),
        pitch_at_lens(basis, lens, target),
    );

    let mut realizations = Vec::with_capacity(relations.len());
    for relation in relations {
        let (completion_degree, expansion_side) =
            completion_state(&relation, conjugate_participation);
        let completion = musical_completion_frame(
            basis,
            lens,
            relation.family,
            relation.pair_index,
            completion_degree,
            expansion_side,
        )?;

        realizations.push(AnandaQlMusicalRealization {
            relation,
            traversal_source: source,
            traversal_target: target,
            completion_degree,
            expansion_side,
            basis,
            lens,
            interval_semitones,
            completion,
        });
    }

    Ok(AnandaQlBridgeResult {
        ananda_ratio: source_ratio_evidence(cell),
        realizations,
        ananda_relation_table_ref: ANANDA_RELATION_TABLE_REF,
        traversal_ref: M1_PRIME_TRAVERSAL_REF,
        ql_music_revision: QL_MEF_MUSIC_REVISION,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ananda_music_bridge::ExactRatio;
    use crate::ananda_vortex::AnandaMatrixOp;
    use ql_core::{QlFace, QlPosition};

    fn q(position6: u8, face: QlFace) -> QlCoordinate {
        QlCoordinate::new(
            QlPosition::new(position6).expect("test position remains inside 0..5"),
            face,
        )
    }

    fn source_cell(family: AnandaMatrixOp, row12: u8) -> AnandaVortexCell {
        AnandaVortexCell::project(family, row12, 1).expect("canonical source probe")
    }

    #[test]
    fn natural_transition_and_mirror_traversals_recover_abc_from_positions() {
        let a = classify_ql_relation_participation(q(0, QlFace::Direct), q(1, QlFace::Direct));
        let b = classify_ql_relation_participation(q(1, QlFace::Direct), q(2, QlFace::Direct));
        let c = classify_ql_relation_participation(q(1, QlFace::Direct), q(4, QlFace::Direct));

        assert_eq!(a.len(), 1);
        assert_eq!(a[0].family, RelationFamily::A);
        assert_eq!(a[0].orientation, PairOrientation::Canonical);
        assert_eq!(b.len(), 1);
        assert_eq!(b[0].family, RelationFamily::B);
        assert_eq!(c.len(), 1);
        assert_eq!(c[0].family, RelationFamily::C);
    }

    #[test]
    fn authored_pair_overlap_is_preserved_instead_of_forced_to_one_family() {
        let relations =
            classify_ql_relation_participation(q(2, QlFace::Direct), q(3, QlFace::Direct));

        assert_eq!(relations.len(), 2);
        assert_eq!(relations[0].family, RelationFamily::A);
        assert_eq!(relations[0].pair_index, 1);
        assert_eq!(relations[1].family, RelationFamily::C);
        assert_eq!(relations[1].pair_index, 2);
    }

    #[test]
    fn reverse_walk_preserves_pair_identity_and_direction() {
        let relations =
            classify_ql_relation_participation(q(0, QlFace::Direct), q(5, QlFace::Direct));

        assert_eq!(relations.len(), 2);
        assert!(relations.iter().any(|relation| {
            relation.family == RelationFamily::B
                && relation.pair_index == 2
                && relation.orientation == PairOrientation::Reverse
        }));
        assert!(relations.iter().any(|relation| {
            relation.family == RelationFamily::C
                && relation.pair_index == 0
                && relation.orientation == PairOrientation::Canonical
        }));
    }

    #[test]
    fn cross_face_motion_is_not_mislabelled_as_a_primary_abc_relation() {
        let relations = classify_ql_relation_participation(
            q(1, QlFace::Direct),
            q(2, QlFace::Conjugate),
        );
        assert!(relations.is_empty());
    }

    #[test]
    fn completion_degree_is_derived_from_actual_conjugate_participation() {
        let cell = source_cell(AnandaMatrixOp::Bimba, 4);
        let source = q(0, QlFace::Direct);
        let target = q(1, QlFace::Direct);

        let d1 = bridge_ananda_ql_traversal(
            &cell,
            source,
            target,
            ConjugateParticipation::None,
            MusicalBasis::Chromatic,
            LensId::L0,
        )
        .unwrap();
        assert_eq!(d1.realizations[0].completion_degree, ConjugationDegree::D1);
        assert_eq!(d1.realizations[0].completion.coordinates.len(), 2);

        let d2 = bridge_ananda_ql_traversal(
            &cell,
            source,
            target,
            ConjugateParticipation::SourceOnly,
            MusicalBasis::Chromatic,
            LensId::L0,
        )
        .unwrap();
        assert_eq!(d2.realizations[0].completion_degree, ConjugationDegree::D2);
        assert_eq!(d2.realizations[0].expansion_side, Some(ExpansionSide::Left));
        assert_eq!(d2.realizations[0].completion.coordinates.len(), 3);

        let d3 = bridge_ananda_ql_traversal(
            &cell,
            source,
            target,
            ConjugateParticipation::Both,
            MusicalBasis::Chromatic,
            LensId::L0,
        )
        .unwrap();
        assert_eq!(d3.realizations[0].completion_degree, ConjugationDegree::D3);
        assert_eq!(d3.realizations[0].completion.coordinates.len(), 4);
    }

    #[test]
    fn reverse_traversal_maps_source_conjugate_to_canonical_right_endpoint() {
        let cell = source_cell(AnandaMatrixOp::Bimba, 4);
        let result = bridge_ananda_ql_traversal(
            &cell,
            q(1, QlFace::Direct),
            q(0, QlFace::Direct),
            ConjugateParticipation::SourceOnly,
            MusicalBasis::Chromatic,
            LensId::L0,
        )
        .unwrap();

        let a = result
            .realizations
            .iter()
            .find(|realization| realization.relation.family == RelationFamily::A)
            .unwrap();
        assert_eq!(a.relation.orientation, PairOrientation::Reverse);
        assert_eq!(a.expansion_side, Some(ExpansionSide::Right));
    }

    #[test]
    fn direct_and_prime_helices_share_the_same_primary_relation_grammar() {
        let cell = source_cell(AnandaMatrixOp::Bimba, 4);
        let direct = bridge_ananda_ql_traversal(
            &cell,
            q(0, QlFace::Direct),
            q(1, QlFace::Direct),
            ConjugateParticipation::None,
            MusicalBasis::Chromatic,
            LensId::L0,
        )
        .unwrap();
        let prime = bridge_ananda_ql_traversal(
            &cell,
            q(0, QlFace::Conjugate),
            q(1, QlFace::Conjugate),
            ConjugateParticipation::None,
            MusicalBasis::Chromatic,
            LensId::L0,
        )
        .unwrap();

        assert_eq!(direct.realizations[0].relation.family, RelationFamily::A);
        assert_eq!(prime.realizations[0].relation.family, RelationFamily::A);
        assert_eq!(direct.realizations[0].interval_semitones, 2);
        assert_eq!(prime.realizations[0].interval_semitones, 2);
    }

    #[test]
    fn ananda_ratio_evidence_and_ql_relation_are_composed_without_conflation() {
        let fourth_source = source_cell(AnandaMatrixOp::Pratibimba, 3);
        let result = bridge_ananda_ql_traversal(
            &fourth_source,
            q(0, QlFace::Direct),
            q(1, QlFace::Direct),
            ConjugateParticipation::None,
            MusicalBasis::Chromatic,
            LensId::L0,
        )
        .unwrap();

        assert_eq!(
            result.ananda_ratio.as_ref().unwrap().ratio,
            ExactRatio::new(4, 3).unwrap()
        );
        assert_eq!(result.realizations[0].relation.family, RelationFamily::A);
        assert_eq!(result.realizations[0].interval_semitones, 2);
        assert!(result.ananda_relation_table_ref.contains("M1-C-architecture"));
        assert!(result.traversal_ref.contains("paramasiva-instrument"));
        assert!(result.ql_music_revision.contains("QL-MEF#81"));
    }

    #[test]
    fn arbitrary_cell_without_ratio_evidence_can_still_carry_a_real_walk_relation() {
        let cell = source_cell(AnandaMatrixOp::Sum, 4);
        let result = bridge_ananda_ql_traversal(
            &cell,
            q(1, QlFace::Direct),
            q(2, QlFace::Direct),
            ConjugateParticipation::Both,
            MusicalBasis::Fifths,
            LensId::L3Prime,
        )
        .unwrap();

        assert!(result.ananda_ratio.is_none());
        assert_eq!(result.realizations.len(), 1);
        assert_eq!(result.realizations[0].relation.family, RelationFamily::B);
        assert_eq!(result.realizations[0].completion_degree, ConjugationDegree::D3);
        assert_eq!(result.realizations[0].completion.coordinates.len(), 4);
    }

    #[test]
    fn non_pair_walk_remains_unclassified_instead_of_forcing_a_family() {
        let cell = source_cell(AnandaMatrixOp::Pratibimba, 7);
        let result = bridge_ananda_ql_traversal(
            &cell,
            q(0, QlFace::Direct),
            q(2, QlFace::Direct),
            ConjugateParticipation::Both,
            MusicalBasis::Chromatic,
            LensId::L0,
        )
        .unwrap();

        assert_eq!(result.ananda_ratio.unwrap().ratio, ExactRatio::new(16, 9).unwrap());
        assert!(result.realizations.is_empty());
    }
}
