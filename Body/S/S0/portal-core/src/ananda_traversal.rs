use serde::{Deserialize, Serialize};

use crate::ananda_music_bridge::AnandaRatioEvidence;
use crate::ananda_ql_bridge::{
    bridge_ananda_ql_traversal, ConjugateParticipation, PairOrientation,
};
use crate::ananda_vortex::{AnandaMatrixOp, AnandaVortexCell};
use ql_core::{ExpansionSide, QlCoordinate, QlFace, QlPosition};
use ql_mef::{LensId, MusicalBasis};

pub const ANANDA_QL_TRAVERSAL_SCHEMA: &str = "epi.m1.ananda-ql-traversal.v1";
pub const ANANDA_QL_TRAVERSAL_OWNER: &str = "M1-4'/M1-2' traversal composition";
pub const ANANDA_QL_TRAVERSAL_SOURCE_REF: &str =
    "Idea/Bimba/Seeds/M/M1'/m1-prime-paramasiva-instrument.md";

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum TraversalFace {
    Direct,
    Prime,
}

impl TraversalFace {
    fn ql_face(self) -> QlFace {
        match self {
            Self::Direct => QlFace::Direct,
            Self::Prime => QlFace::Conjugate,
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum TraversalBasis {
    Chromatic,
    Fifths,
}

impl TraversalBasis {
    fn musical_basis(self) -> MusicalBasis {
        match self {
            Self::Chromatic => MusicalBasis::Chromatic,
            Self::Fifths => MusicalBasis::Fifths,
        }
    }

    fn as_str(self) -> &'static str {
        match self {
            Self::Chromatic => "chromatic",
            Self::Fifths => "fifths",
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum TraversalConjugateParticipation {
    None,
    SourceOnly,
    TargetOnly,
    Both,
}

impl TraversalConjugateParticipation {
    fn bridge_state(self) -> ConjugateParticipation {
        match self {
            Self::None => ConjugateParticipation::None,
            Self::SourceOnly => ConjugateParticipation::SourceOnly,
            Self::TargetOnly => ConjugateParticipation::TargetOnly,
            Self::Both => ConjugateParticipation::Both,
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TraversalCoordinate {
    pub position6: u8,
    pub face: TraversalFace,
}

impl TraversalCoordinate {
    fn ql_coordinate(self) -> Result<QlCoordinate, String> {
        let position = QlPosition::new(self.position6)
            .ok_or_else(|| format!("traversal position must be 0..5, got {}", self.position6))?;
        Ok(QlCoordinate::new(position, self.face.ql_face()))
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PointerTraversalEvidence {
    /// Stable source node/coordinate reference supplied by the S2/M1-4' walker.
    pub source_ref: String,
    /// Stable target node/coordinate reference supplied by the S2/M1-4' walker.
    pub target_ref: String,
    /// Stable pointer/edge/operator reference. The adapter never invents this.
    pub relation_ref: String,
    /// All relation-role labels already known at the pointer layer. Multiple
    /// roles are retained because one traversal can satisfy more than one law.
    #[serde(default)]
    pub relation_roles: Vec<String>,
}

impl PointerTraversalEvidence {
    fn validate(&self) -> Result<(), String> {
        if self.source_ref.trim().is_empty() {
            return Err("pointer traversal source_ref is required".to_owned());
        }
        if self.target_ref.trim().is_empty() {
            return Err("pointer traversal target_ref is required".to_owned());
        }
        if self.relation_ref.trim().is_empty() {
            return Err("pointer traversal relation_ref is required".to_owned());
        }
        Ok(())
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnandaTraversalSelection {
    /// M1-4' chooses which M1-2' family/cell is read for this walk-step.
    pub family: AnandaMatrixOp,
    pub row12: u8,
    pub col12: u8,
}

impl AnandaTraversalSelection {
    fn project(self) -> Result<AnandaVortexCell, String> {
        AnandaVortexCell::project(self.family, self.row12, self.col12).ok_or_else(|| {
            format!(
                "Ananda traversal cell must be inside the canonical 12x12 field, got ({},{})",
                self.row12, self.col12
            )
        })
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnandaQlTraversalRequest {
    pub source: TraversalCoordinate,
    pub target: TraversalCoordinate,
    pub pointer: PointerTraversalEvidence,
    pub ananda: AnandaTraversalSelection,
    pub conjugate_participation: TraversalConjugateParticipation,
    pub basis: TraversalBasis,
    /// Twelvefold lens address in the project-native order:
    /// `0..5 = L0..L5`, `6..11 = L0'..L5'`.
    pub lens12: u8,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TraversalCompletionCoordinate {
    pub position6: u8,
    pub face: TraversalFace,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnandaQlTraversalRelation {
    pub family: String,
    pub pair_index: u8,
    pub orientation: String,
    pub operator_ref: String,
    pub completion_degree: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expansion_side: Option<String>,
    pub interval_semitones: u8,
    pub completion_coordinates: Vec<TraversalCompletionCoordinate>,
    pub completion_pitches: Vec<u8>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnandaQlTraversalProvenance {
    pub owner: String,
    pub traversal_source: String,
    pub ananda_relation_table: String,
    pub ql_music_revision: String,
    pub law: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnandaQlTraversalEvent {
    pub schema: String,
    pub source: TraversalCoordinate,
    pub target: TraversalCoordinate,
    pub pointer: PointerTraversalEvidence,
    pub ananda_cell: AnandaVortexCell,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ananda_ratio: Option<AnandaRatioEvidence>,
    pub conjugate_participation: TraversalConjugateParticipation,
    pub basis: String,
    pub lens: String,
    /// Zero-to-many primary relation participations. This is intentionally a
    /// vector: authored geometry overlaps at positions such as 2<->3.
    pub relations: Vec<AnandaQlTraversalRelation>,
    pub provenance: AnandaQlTraversalProvenance,
}

fn lens_from_12fold(lens12: u8) -> Option<LensId> {
    match lens12 {
        0 => Some(LensId::L0),
        1 => Some(LensId::L1),
        2 => Some(LensId::L2),
        3 => Some(LensId::L3),
        4 => Some(LensId::L4),
        5 => Some(LensId::L5),
        6 => Some(LensId::L0Prime),
        7 => Some(LensId::L1Prime),
        8 => Some(LensId::L2Prime),
        9 => Some(LensId::L3Prime),
        10 => Some(LensId::L4Prime),
        11 => Some(LensId::L5Prime),
        _ => None,
    }
}

fn traversal_face(face: QlFace) -> TraversalFace {
    match face {
        QlFace::Direct => TraversalFace::Direct,
        QlFace::Conjugate => TraversalFace::Prime,
    }
}

fn orientation_name(orientation: PairOrientation) -> &'static str {
    match orientation {
        PairOrientation::Canonical => "canonical",
        PairOrientation::Reverse => "reverse",
    }
}

fn expansion_name(side: Option<ExpansionSide>) -> Option<String> {
    side.map(|side| match side {
        ExpansionSide::Left => "left".to_owned(),
        ExpansionSide::Right => "right".to_owned(),
    })
}

/// Produce the deterministic W2 event at the actual walk-step boundary.
///
/// The caller must supply the pointer evidence and the Ananda cell chosen by
/// M1-4'. This adapter never substitutes the tick-derived profile cell for the
/// walk-selected cell and never fabricates an S2 relation.
pub fn ananda_ql_traversal_event(
    request: AnandaQlTraversalRequest,
) -> Result<AnandaQlTraversalEvent, String> {
    request.pointer.validate()?;
    let source = request.source.ql_coordinate()?;
    let target = request.target.ql_coordinate()?;
    let cell = request.ananda.project()?;
    let lens = lens_from_12fold(request.lens12)
        .ok_or_else(|| format!("lens12 must be 0..11, got {}", request.lens12))?;

    let result = bridge_ananda_ql_traversal(
        &cell,
        source,
        target,
        request.conjugate_participation.bridge_state(),
        request.basis.musical_basis(),
        lens,
    )
    .map_err(|error| error.to_string())?;

    let relations = result
        .realizations
        .into_iter()
        .map(|realization| AnandaQlTraversalRelation {
            family: realization.relation.family.as_str().to_owned(),
            pair_index: realization.relation.pair_index,
            orientation: orientation_name(realization.relation.orientation).to_owned(),
            operator_ref: realization.relation.operator_ref,
            completion_degree: realization.completion_degree.as_str().to_owned(),
            expansion_side: expansion_name(realization.expansion_side),
            interval_semitones: realization.interval_semitones,
            completion_coordinates: realization
                .completion
                .coordinates
                .into_iter()
                .map(|coordinate| TraversalCompletionCoordinate {
                    position6: coordinate.position.value(),
                    face: traversal_face(coordinate.face),
                })
                .collect(),
            completion_pitches: realization.completion.pitches,
        })
        .collect();

    Ok(AnandaQlTraversalEvent {
        schema: ANANDA_QL_TRAVERSAL_SCHEMA.to_owned(),
        source: request.source,
        target: request.target,
        pointer: request.pointer,
        ananda_cell: cell,
        ananda_ratio: result.ananda_ratio,
        conjugate_participation: request.conjugate_participation,
        basis: request.basis.as_str().to_owned(),
        lens: lens.code().to_owned(),
        relations,
        provenance: AnandaQlTraversalProvenance {
            owner: ANANDA_QL_TRAVERSAL_OWNER.to_owned(),
            traversal_source: ANANDA_QL_TRAVERSAL_SOURCE_REF.to_owned(),
            ananda_relation_table: result.ananda_relation_table_ref.to_owned(),
            ql_music_revision: result.ql_music_revision.to_owned(),
            law: "S2/M1-4' supplies the actual walk; M1-2' supplies selected Ananda evidence; QL-MEF classifies/renders relation and completion"
                .to_owned(),
        },
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ananda_music_bridge::ExactRatio;

    fn pointer() -> PointerTraversalEvidence {
        PointerTraversalEvidence {
            source_ref: "S2:#2".to_owned(),
            target_ref: "S2:#3".to_owned(),
            relation_ref: "pointer:test:2->3".to_owned(),
            relation_roles: vec!["epogdoon-tick".to_owned(), "mirror-x+y=5".to_owned()],
        }
    }

    fn request() -> AnandaQlTraversalRequest {
        AnandaQlTraversalRequest {
            source: TraversalCoordinate {
                position6: 2,
                face: TraversalFace::Direct,
            },
            target: TraversalCoordinate {
                position6: 3,
                face: TraversalFace::Direct,
            },
            pointer: pointer(),
            ananda: AnandaTraversalSelection {
                family: AnandaMatrixOp::Pratibimba,
                row12: 3,
                col12: 4,
            },
            conjugate_participation: TraversalConjugateParticipation::Both,
            basis: TraversalBasis::Chromatic,
            lens12: 0,
        }
    }

    #[test]
    fn event_composes_walk_cell_and_ql_owner_without_collapsing_them() {
        let event = ananda_ql_traversal_event(request()).unwrap();

        assert_eq!(event.schema, ANANDA_QL_TRAVERSAL_SCHEMA);
        assert_eq!(event.pointer.relation_roles.len(), 2);
        assert_eq!(event.ananda_cell.raw_value, Some(13));
        assert_eq!(event.ananda_cell.dr_value, Some(4));
        assert_eq!(
            event.ananda_ratio.as_ref().unwrap().ratio,
            ExactRatio::new(4, 3).unwrap()
        );
        assert_eq!(event.relations.len(), 2);
        assert_eq!(event.relations[0].family, "A");
        assert_eq!(event.relations[1].family, "C");
        assert!(event.relations.iter().all(|relation| relation.completion_degree == "D3"));
        assert!(event.provenance.traversal_source.contains("paramasiva-instrument"));
        assert!(event.provenance.ql_music_revision.contains("QL-MEF#81"));
    }

    #[test]
    fn selected_ananda_cell_is_not_reconstructed_from_walk_positions() {
        let mut input = request();
        input.ananda = AnandaTraversalSelection {
            family: AnandaMatrixOp::Bimba,
            row12: 10,
            col12: 11,
        };
        let event = ananda_ql_traversal_event(input).unwrap();

        assert_eq!(event.source.position6, 2);
        assert_eq!(event.target.position6, 3);
        assert_eq!(event.ananda_cell.row12, 10);
        assert_eq!(event.ananda_cell.col12, 11);
        assert_eq!(event.ananda_cell.raw_value, Some(110));
        assert_eq!(event.ananda_cell.decimal10_value, None);
        assert!(event.ananda_ratio.is_none());
    }

    #[test]
    fn lens12_uses_project_native_direct_then_prime_order() {
        let mut input = request();
        input.lens12 = 8;
        let event = ananda_ql_traversal_event(input).unwrap();
        assert_eq!(event.lens, "L2'");
    }

    #[test]
    fn d2_expansion_is_visible_in_serialized_traversal_event() {
        let mut input = request();
        input.source = TraversalCoordinate {
            position6: 0,
            face: TraversalFace::Direct,
        };
        input.target = TraversalCoordinate {
            position6: 1,
            face: TraversalFace::Direct,
        };
        input.pointer.source_ref = "S2:#0".to_owned();
        input.pointer.target_ref = "S2:#1".to_owned();
        input.conjugate_participation = TraversalConjugateParticipation::SourceOnly;

        let event = ananda_ql_traversal_event(input).unwrap();
        assert_eq!(event.relations.len(), 1);
        assert_eq!(event.relations[0].family, "A");
        assert_eq!(event.relations[0].completion_degree, "D2");
        assert_eq!(event.relations[0].expansion_side.as_deref(), Some("left"));
        assert_eq!(event.relations[0].completion_coordinates.len(), 3);
    }

    #[test]
    fn invalid_or_provenance_free_walk_is_rejected() {
        let mut input = request();
        input.pointer.relation_ref.clear();
        assert!(ananda_ql_traversal_event(input).is_err());

        let mut input = request();
        input.target.position6 = 6;
        assert!(ananda_ql_traversal_event(input).is_err());

        let mut input = request();
        input.lens12 = 12;
        assert!(ananda_ql_traversal_event(input).is_err());
    }

    #[test]
    fn event_is_json_serializable_for_runtime_handoff() {
        let event = ananda_ql_traversal_event(request()).unwrap();
        let encoded = serde_json::to_string(&event).unwrap();
        assert!(encoded.contains("epi.m1.ananda-ql-traversal.v1"));
        assert!(encoded.contains("pointer:test:2->3"));
        assert!(encoded.contains("\"family\":\"A\""));
        assert!(encoded.contains("\"family\":\"C\""));
    }
}
