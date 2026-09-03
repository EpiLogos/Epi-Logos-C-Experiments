use serde::{Deserialize, Serialize};

use crate::ananda_music_bridge::{AnandaRatioEvidence, RatioEvidenceKind};
use crate::ananda_ql_bridge::{AnandaQlMusicalRealization, PairOrientation};
use ql_core::QlCoordinate;
use ql_mef::{pitch_at_lens, ContextFrameId, LensId, MusicalBasis};

pub const JANKO_PROJECTION_SCHEMA: &str = "epi.m1-prime.janko-projection.v1";
pub const JANKO_FIGURE_REF: &str =
    "EpiLogos/QL-MEF#81:docs/music/JANKO-QL-INSTRUMENT-FIGURE.md";
pub const JANKO_MUSICAL_AUTHORITY_REF: &str =
    "EpiLogos/QL-MEF#81@ed754d1cd65d92b54620f4305145970b84c3b53f";

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum JankoWholeToneRowFamily {
    EvenPitchClass,
    OddPitchClass,
}

impl JankoWholeToneRowFamily {
    pub const fn from_pitch_class(pitch_class: u8) -> Self {
        if pitch_class % 2 == 0 {
            Self::EvenPitchClass
        } else {
            Self::OddPitchClass
        }
    }

    pub const fn row_offset(self) -> u8 {
        match self {
            Self::EvenPitchClass => 0,
            Self::OddPitchClass => 1,
        }
    }

    pub const fn historical_colour_counts(self) -> (u8, u8) {
        match self {
            // C D E F# G# A# => 3 piano-natural / 3 accidental colours.
            Self::EvenPitchClass => (3, 3),
            // C# D# F G A B => 4 piano-natural / 2 accidental colours.
            Self::OddPitchClass => (4, 2),
        }
    }

    pub const fn project_figure_reading(self) -> &'static str {
        match self.historical_colour_counts() {
            (3, 3) => "First Spanda 3:3 controller Figure",
            (4, 2) => "Second Spanda 4:2 controller Figure",
            _ => unreachable!(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JankoKeyProjection {
    pub sounding_pitch_class: u8,
    pub whole_tone_row_family: JankoWholeToneRowFamily,
    /// Physical row 0..5. Each sounding note has three repeated touch-points on
    /// rows of the same whole-tone family: 0/2/4 or 1/3/5.
    pub physical_row: u8,
    pub repeated_touch_point: u8,
    /// Position within the six-note whole-tone cycle on the physical row.
    pub whole_tone_slot: u8,
    pub historical_white_count: u8,
    pub historical_black_count: u8,
    pub figure_reading: String,

    /// Canonical QL state remains distinct from physical controller placement.
    pub kernel_position: u8,
    pub kernel_face: String,
    pub musical_basis: String,
    pub lens_anchor: String,
    pub context_frame: String,

    pub musical_authority_ref: String,
    pub controller_figure_ref: String,
}

pub fn project_janko_key(
    basis: MusicalBasis,
    lens: LensId,
    context_frame: ContextFrameId,
    coordinate: QlCoordinate,
    repeated_touch_point: u8,
) -> Result<JankoKeyProjection, String> {
    if repeated_touch_point >= 3 {
        return Err(format!(
            "Jankó repeated touch-point must be 0..2, got {repeated_touch_point}"
        ));
    }

    let sounding_pitch_class = pitch_at_lens(basis, lens, coordinate);
    let whole_tone_row_family = JankoWholeToneRowFamily::from_pitch_class(sounding_pitch_class);
    let physical_row = whole_tone_row_family.row_offset() + repeated_touch_point * 2;
    let whole_tone_slot = sounding_pitch_class / 2;
    let (historical_white_count, historical_black_count) =
        whole_tone_row_family.historical_colour_counts();

    Ok(JankoKeyProjection {
        sounding_pitch_class,
        whole_tone_row_family,
        physical_row,
        repeated_touch_point,
        whole_tone_slot,
        historical_white_count,
        historical_black_count,
        figure_reading: whole_tone_row_family.project_figure_reading().to_owned(),
        kernel_position: coordinate.position.value(),
        kernel_face: coordinate.face.kernel_code().to_owned(),
        musical_basis: basis_name(basis).to_owned(),
        lens_anchor: lens.code().to_owned(),
        context_frame: context_frame.code().to_owned(),
        musical_authority_ref: JANKO_MUSICAL_AUTHORITY_REF.to_owned(),
        controller_figure_ref: JANKO_FIGURE_REF.to_owned(),
    })
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JankoRatioOverlay {
    pub numerator: u16,
    pub denominator: u16,
    pub evidence_kind: String,
    pub source_ref: String,
    pub derivation_ref: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JankoTraversalProjection {
    pub schema: String,
    pub source_key: JankoKeyProjection,
    pub target_key: JankoKeyProjection,
    pub relation_family: String,
    pub pair_index: u8,
    pub pair_orientation: String,
    pub completion_degree: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub expansion_side: Option<String>,
    pub interval_semitones: u8,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub exact_ratio_overlay: Option<JankoRatioOverlay>,
    pub relation_operator_ref: String,
    pub completion_operator_ref: String,
    pub provenance: Vec<String>,
}

pub fn project_janko_traversal(
    realization: &AnandaQlMusicalRealization,
    context_frame: ContextFrameId,
    source_touch_point: u8,
    target_touch_point: u8,
    ratio: Option<&AnandaRatioEvidence>,
) -> Result<JankoTraversalProjection, String> {
    let source_key = project_janko_key(
        realization.basis,
        realization.lens,
        context_frame,
        realization.traversal_source,
        source_touch_point,
    )?;
    let target_key = project_janko_key(
        realization.basis,
        realization.lens,
        context_frame,
        realization.traversal_target,
        target_touch_point,
    )?;

    let exact_ratio_overlay = ratio.map(|evidence| JankoRatioOverlay {
        numerator: evidence.ratio.numerator,
        denominator: evidence.ratio.denominator,
        evidence_kind: ratio_evidence_name(evidence.evidence_kind).to_owned(),
        source_ref: evidence.source_ref.clone(),
        derivation_ref: evidence.derivation_ref.clone(),
    });

    Ok(JankoTraversalProjection {
        schema: JANKO_PROJECTION_SCHEMA.to_owned(),
        source_key,
        target_key,
        relation_family: realization.relation.family.as_str().to_owned(),
        pair_index: realization.relation.pair_index,
        pair_orientation: orientation_name(realization.relation.orientation).to_owned(),
        completion_degree: realization.completion_degree.as_str().to_owned(),
        expansion_side: realization
            .expansion_side
            .map(|side| side.as_str().to_owned()),
        interval_semitones: realization.interval_semitones,
        exact_ratio_overlay,
        relation_operator_ref: realization.relation.operator_ref.clone(),
        completion_operator_ref: realization.completion.structural_operator_ref.clone(),
        provenance: vec![
            JANKO_MUSICAL_AUTHORITY_REF.to_owned(),
            JANKO_FIGURE_REF.to_owned(),
            realization.relation.operator_ref.clone(),
            realization.completion.structural_operator_ref.clone(),
        ],
    })
}

const fn basis_name(basis: MusicalBasis) -> &'static str {
    match basis {
        MusicalBasis::Chromatic => "chromatic",
        MusicalBasis::Fifths => "fifths",
    }
}

const fn orientation_name(orientation: PairOrientation) -> &'static str {
    match orientation {
        PairOrientation::Canonical => "canonical",
        PairOrientation::Reverse => "reverse",
    }
}

const fn ratio_evidence_name(kind: RatioEvidenceKind) -> &'static str {
    match kind {
        RatioEvidenceKind::SourceRow => "source-row",
        RatioEvidenceKind::Reciprocal => "reciprocal",
        RatioEvidenceKind::Composition => "composition",
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ananda_ql_bridge::{bridge_ananda_ql_traversal, ConjugateParticipation};
    use crate::ananda_vortex::{AnandaMatrixOp, AnandaVortexCell};
    use ql_core::{QlFace, QlPosition};

    fn q(position: u8, face: QlFace) -> QlCoordinate {
        QlCoordinate::new(QlPosition::new(position).unwrap(), face)
    }

    #[test]
    fn l0_chromatic_surface_exhausts_all_twelve_pitch_classes() {
        let mut pitches = Vec::new();
        for face in [QlFace::Direct, QlFace::Conjugate] {
            for position in 0..6 {
                pitches.push(
                    project_janko_key(
                        MusicalBasis::Chromatic,
                        LensId::L0,
                        ContextFrameId::Cf1,
                        q(position, face),
                        0,
                    )
                    .unwrap()
                    .sounding_pitch_class,
                );
            }
        }
        pitches.sort_unstable();
        assert_eq!(pitches, (0u8..12).collect::<Vec<_>>());
    }

    #[test]
    fn each_pitch_has_three_repeated_touch_points_on_its_row_family() {
        let coordinate = q(2, QlFace::Direct); // E at L0 chromatic.
        let rows = (0..3)
            .map(|touch| {
                project_janko_key(
                    MusicalBasis::Chromatic,
                    LensId::L0,
                    ContextFrameId::Cf1,
                    coordinate,
                    touch,
                )
                .unwrap()
                .physical_row
            })
            .collect::<Vec<_>>();
        assert_eq!(rows, vec![0, 2, 4]);

        let prime = q(2, QlFace::Conjugate); // F at L0 chromatic.
        let rows = (0..3)
            .map(|touch| {
                project_janko_key(
                    MusicalBasis::Chromatic,
                    LensId::L0,
                    ContextFrameId::Cf1,
                    prime,
                    touch,
                )
                .unwrap()
                .physical_row
            })
            .collect::<Vec<_>>();
        assert_eq!(rows, vec![1, 3, 5]);
    }

    #[test]
    fn whole_tone_and_cross_row_semitone_geometry_are_recovered_from_pitch() {
        let c = project_janko_key(
            MusicalBasis::Chromatic,
            LensId::L0,
            ContextFrameId::Cf1,
            q(0, QlFace::Direct),
            0,
        )
        .unwrap();
        let d = project_janko_key(
            MusicalBasis::Chromatic,
            LensId::L0,
            ContextFrameId::Cf1,
            q(1, QlFace::Direct),
            0,
        )
        .unwrap();
        let c_sharp = project_janko_key(
            MusicalBasis::Chromatic,
            LensId::L0,
            ContextFrameId::Cf1,
            q(0, QlFace::Conjugate),
            0,
        )
        .unwrap();

        assert_eq!(c.whole_tone_row_family, d.whole_tone_row_family);
        assert_eq!(d.whole_tone_slot, c.whole_tone_slot + 1);
        assert_ne!(c.whole_tone_row_family, c_sharp.whole_tone_row_family);
        assert_eq!(c.whole_tone_slot, c_sharp.whole_tone_slot);
        assert_eq!(c_sharp.sounding_pitch_class, c.sounding_pitch_class + 1);
    }

    #[test]
    fn physical_row_family_and_kernel_face_remain_distinct_under_transposition() {
        let direct_at_prime_lens = project_janko_key(
            MusicalBasis::Chromatic,
            LensId::L0Prime,
            ContextFrameId::Cf1,
            q(0, QlFace::Direct),
            0,
        )
        .unwrap();
        assert_eq!(direct_at_prime_lens.kernel_face, "direct");
        assert_eq!(direct_at_prime_lens.sounding_pitch_class, 1);
        assert_eq!(
            direct_at_prime_lens.whole_tone_row_family,
            JankoWholeToneRowFamily::OddPitchClass
        );
        assert_eq!(direct_at_prime_lens.physical_row, 1);
    }

    #[test]
    fn historical_colour_counts_expose_both_3_3_and_4_2_figures() {
        let even = JankoWholeToneRowFamily::EvenPitchClass;
        let odd = JankoWholeToneRowFamily::OddPitchClass;
        assert_eq!(even.historical_colour_counts(), (3, 3));
        assert_eq!(odd.historical_colour_counts(), (4, 2));
        assert!(even.project_figure_reading().contains("3:3"));
        assert!(odd.project_figure_reading().contains("4:2"));
    }

    #[test]
    fn traversal_projection_consumes_w2_relation_completion_and_ratio_without_rederiving() {
        let cell = AnandaVortexCell::project(AnandaMatrixOp::Pratibimba, 3, 1).unwrap();
        let bridge = bridge_ananda_ql_traversal(
            &cell,
            q(0, QlFace::Direct),
            q(1, QlFace::Direct),
            ConjugateParticipation::None,
            MusicalBasis::Chromatic,
            LensId::L0,
        )
        .unwrap();
        let realization = &bridge.realizations[0];
        let projection = project_janko_traversal(
            realization,
            ContextFrameId::Cf1,
            0,
            0,
            bridge.ananda_ratio.as_ref(),
        )
        .unwrap();

        assert_eq!(projection.relation_family, "A");
        assert_eq!(projection.completion_degree, "D1");
        assert_eq!(projection.interval_semitones, 2);
        assert_eq!(
            projection.exact_ratio_overlay.as_ref().map(|r| (r.numerator, r.denominator)),
            Some((4, 3))
        );
        assert!(projection.relation_operator_ref.contains("pair:A:0"));
    }

    #[test]
    fn fifths_basis_is_an_overlay_on_the_same_physical_chromatic_surface() {
        let source = project_janko_key(
            MusicalBasis::Fifths,
            LensId::L0,
            ContextFrameId::Cf1,
            q(0, QlFace::Direct),
            0,
        )
        .unwrap();
        let target = project_janko_key(
            MusicalBasis::Fifths,
            LensId::L0,
            ContextFrameId::Cf1,
            q(1, QlFace::Direct),
            0,
        )
        .unwrap();
        assert_eq!(source.sounding_pitch_class, 0);
        assert_eq!(target.sounding_pitch_class, 7);
        assert_eq!(source.musical_basis, "fifths");
        assert_ne!(source.whole_tone_row_family, target.whole_tone_row_family);
    }
}
