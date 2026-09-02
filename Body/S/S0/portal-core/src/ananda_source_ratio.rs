use serde::{Deserialize, Serialize};

use crate::{AnandaMatrixOp, ANANDA_SOURCE_REF};

/// Source-authored rational identity attached to an Ananda row/family.
///
/// This is provenance from the Vortex Modulae source, not a QL interval
/// selector. In particular, callers must not infer A/B/C relation family,
/// D-completion, pitch class, or basis interval from this value alone.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnandaSourceRowRatio {
    pub family: AnandaMatrixOp,
    pub row12: u8,
    pub source_expression: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub source_fraction: Option<[i16; 2]>,
    pub source_ref: String,
}

impl AnandaSourceRowRatio {
    fn new(
        family: AnandaMatrixOp,
        row12: u8,
        source_expression: &str,
        source_fraction: Option<[i16; 2]>,
    ) -> Self {
        Self {
            family,
            row12,
            source_expression: source_expression.to_owned(),
            source_fraction,
            source_ref: ANANDA_SOURCE_REF.to_owned(),
        }
    }
}

/// Return the ratio identity explicitly authored for one Vortex source row.
///
/// The table deliberately preserves source irregularities instead of
/// recomputing the fraction from the recurring-decimal label. For example,
/// the source currently records Bimba row 10 as `101/999`; this API reports
/// that claim verbatim so later research can test/correct it with provenance.
pub fn ananda_source_row_ratio(
    family: AnandaMatrixOp,
    row12: u8,
) -> Option<AnandaSourceRowRatio> {
    if row12 >= 12 {
        return None;
    }

    let (expression, fraction) = match family {
        AnandaMatrixOp::Bimba => match row12 {
            0 => ("0/0", None),
            1 => ("1/9", Some([1, 9])),
            2 => ("2/9", Some([2, 9])),
            3 => ("1/3", Some([1, 3])),
            4 => ("4/9", Some([4, 9])),
            5 => ("5/9", Some([5, 9])),
            6 => ("2/3", Some([2, 3])),
            7 => ("7/9", Some([7, 9])),
            8 => ("8/9", Some([8, 9])),
            9 => ("1/1", Some([1, 1])),
            10 => ("101/999", Some([101, 999])),
            11 => ("1/9", Some([1, 9])),
            _ => unreachable!(),
        },
        AnandaMatrixOp::Pratibimba => match row12 {
            0 => ("1/1", Some([1, 1])),
            1 => ("10/9", Some([10, 9])),
            2 => ("11/9", Some([11, 9])),
            3 => ("4/3", Some([4, 3])),
            4 => ("13/9", Some([13, 9])),
            5 => ("14/9", Some([14, 9])),
            6 => ("5/3", Some([5, 3])),
            7 => ("16/9", Some([16, 9])),
            8 => ("17/9", Some([17, 9])),
            9 => ("2/2 = 1/1", Some([2, 2])),
            10 => ("109/99", Some([109, 99])),
            11 => ("10/9", Some([10, 9])),
            _ => unreachable!(),
        },
        AnandaMatrixOp::Sum => match row12 {
            0 => ("(0/1)/(0/1)", None),
            1 => ("11/9", Some([11, 9])),
            2 => ("13/9", Some([13, 9])),
            3 => ("5/3", Some([5, 3])),
            4 => ("17/9", Some([17, 9])),
            5 => ("19/9", Some([19, 9])),
            6 => ("7/3", Some([7, 3])),
            7 => ("23/9", Some([23, 9])),
            8 => ("25/9", Some([25, 9])),
            9 => ("3/3 = 2/2 = 1/1", Some([3, 3])),
            10 | 11 => return None,
            _ => unreachable!(),
        },
        AnandaMatrixOp::DiffA
        | AnandaMatrixOp::DiffB
        | AnandaMatrixOp::Quintessence => return None,
    };

    Some(AnandaSourceRowRatio::new(
        family,
        row12,
        expression,
        fraction,
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn source_row_ratios_preserve_core_m1_harmonic_identities() {
        let fourth = ananda_source_row_ratio(AnandaMatrixOp::Pratibimba, 3).unwrap();
        let grounding_inverse = ananda_source_row_ratio(AnandaMatrixOp::Bimba, 6).unwrap();
        let second_spanda = ananda_source_row_ratio(AnandaMatrixOp::Pratibimba, 7).unwrap();

        assert_eq!(fourth.source_fraction, Some([4, 3]));
        assert_eq!(grounding_inverse.source_fraction, Some([2, 3]));
        assert_eq!(second_spanda.source_fraction, Some([16, 9]));
    }

    #[test]
    fn source_identity_chains_are_not_silently_normalized() {
        let pratibimba_return =
            ananda_source_row_ratio(AnandaMatrixOp::Pratibimba, 9).unwrap();
        let sum_return = ananda_source_row_ratio(AnandaMatrixOp::Sum, 9).unwrap();

        assert_eq!(pratibimba_return.source_expression, "2/2 = 1/1");
        assert_eq!(pratibimba_return.source_fraction, Some([2, 2]));
        assert_eq!(sum_return.source_expression, "3/3 = 2/2 = 1/1");
        assert_eq!(sum_return.source_fraction, Some([3, 3]));
    }

    #[test]
    fn source_irregularity_is_preserved_for_falsifiable_follow_up() {
        let bimba10 = ananda_source_row_ratio(AnandaMatrixOp::Bimba, 10).unwrap();

        assert_eq!(bimba10.source_expression, "101/999");
        assert_eq!(bimba10.source_fraction, Some([101, 999]));
    }

    #[test]
    fn difference_and_quintessence_do_not_acquire_fabricated_ratios() {
        assert!(ananda_source_row_ratio(AnandaMatrixOp::DiffA, 3).is_none());
        assert!(ananda_source_row_ratio(AnandaMatrixOp::DiffB, 3).is_none());
        assert!(ananda_source_row_ratio(AnandaMatrixOp::Quintessence, 3).is_none());
    }
}
