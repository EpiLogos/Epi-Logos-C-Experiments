use serde::{Deserialize, Serialize};

use crate::hopf::hopf_clock_address;

pub const ANANDA_SOURCE_REF: &str = "Idea/Bimba/Map/datasets/(0_1) Vortex Modulae - (0_1) x 12Fold and 8_9fold (mod12 and mod10) Archetypal Number Identities - Sheet1.csv";
pub const ANANDA_DERIVATION_REF: &str =
    "Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-EXECUTABLE-SUBSTRATE-CONTRACT.md";
pub const ANANDA_PHASE_REF: &str =
    "Idea/Bimba/Seeds/M/M1'/M1-SPANDA-ANANDA-MUSICAL-DERIVATION-LOCK.md";

pub const DR_RING_MAHAMAYA: [u8; 6] = [1, 2, 4, 8, 7, 5];
pub const DR_RING_PARASHAKTI: [u8; 6] = [3, 6, 9, 3, 6, 9];
pub const CL42_SIGNATURE: [i8; 6] = [-1, 1, 1, 1, 1, -1];

pub const RING_QUATERNION_LUT: [[f32; 4]; 12] = [
    [1.0, 0.0, 0.0, 0.0],
    [0.866_025_4, 0.5, 0.0, 0.0],
    [0.5, 0.866_025_4, 0.0, 0.0],
    [0.0, 1.0, 0.0, 0.0],
    [-0.5, 0.866_025_4, 0.0, 0.0],
    [-0.866_025_4, 0.5, 0.0, 0.0],
    [0.866_025_4, -0.5, 0.0, 0.0],
    [0.5, -0.866_025_4, 0.0, 0.0],
    [0.0, -1.0, 0.0, 0.0],
    [-0.5, -0.866_025_4, 0.0, 0.0],
    [-0.866_025_4, -0.5, 0.0, 0.0],
    [-1.0, 0.0, 0.0, 0.0],
];

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[repr(u8)]
#[serde(rename_all = "kebab-case")]
pub enum AnandaMatrixOp {
    Bimba = 0,
    Pratibimba = 1,
    Sum = 2,
    DiffA = 3,
    DiffB = 4,
    Quintessence = 5,
}

impl AnandaMatrixOp {
    pub fn from_position(position6: u8) -> Self {
        match position6 % 6 {
            0 => Self::Bimba,
            1 => Self::Pratibimba,
            2 => Self::Sum,
            3 => Self::DiffA,
            4 => Self::DiffB,
            _ => Self::Quintessence,
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[repr(u8)]
#[serde(rename_all = "kebab-case")]
pub enum AnandaDirectPrimePhase {
    Direct = 0,
    Prime = 1,
}

impl AnandaDirectPrimePhase {
    pub fn from_tick12(tick12: u8) -> Self {
        if tick12 % 12 < 6 {
            Self::Direct
        } else {
            Self::Prime
        }
    }

    pub fn conjugate(self) -> Self {
        match self {
            Self::Direct => Self::Prime,
            Self::Prime => Self::Direct,
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnandaOscillatoryAddress {
    pub tick12: u8,
    pub position6: u8,
    pub phase: AnandaDirectPrimePhase,
    pub conjugate_tick12: u8,
    pub conjugate_position6: u8,
    pub conjugate_phase: AnandaDirectPrimePhase,
}

impl AnandaOscillatoryAddress {
    pub fn from_tick12(tick12: u8) -> Self {
        let tick12 = tick12 % 12;
        let position6 = tick12 % 6;
        let phase = AnandaDirectPrimePhase::from_tick12(tick12);
        Self {
            tick12,
            position6,
            phase,
            conjugate_tick12: (tick12 + 6) % 12,
            conjugate_position6: position6,
            conjugate_phase: phase.conjugate(),
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum AnandaSkeletonEvent {
    Hit36,
    Hit64,
    Hit72,
    Ratio64Over36,
    Additive137,
    IdentityReturn4Plus2,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnandaVortexCell {
    pub family: AnandaMatrixOp,
    pub row12: u8,
    pub col12: u8,

    pub raw_value: Option<i16>,
    pub raw_bimba: i16,
    pub raw_pratibimba: i16,
    pub raw_sum: i16,
    pub raw_difference_a: i16,
    pub raw_difference_b: i16,
    pub raw_delta: i8,

    pub dr_value: Option<u8>,
    pub dr_bimba: u8,
    pub dr_pratibimba: u8,
    pub dr_sum: u8,
    pub dr_difference_a: u8,
    pub dr_difference_b: u8,

    pub decimal10_value: Option<u8>,
    pub rule_value: Option<String>,
    pub skeleton_event: Option<AnandaSkeletonEvent>,
}

impl AnandaVortexCell {
    pub fn project(family: AnandaMatrixOp, row12: u8, col12: u8) -> Option<Self> {
        if row12 >= 12 || col12 >= 12 {
            return None;
        }

        let raw_bimba = i16::from(row12) * i16::from(col12);
        let raw_pratibimba = raw_bimba + 1;
        let raw_sum = (2 * raw_bimba) + 1;
        let raw_difference_a = -1;
        let raw_difference_b = 1;

        let dr_bimba = true_digit_root(raw_bimba as u16);
        let dr_pratibimba = true_digit_root(raw_pratibimba as u16);
        let dr_sum = true_digit_root(raw_sum as u16);
        let dr_difference_a = 9;
        let dr_difference_b = 1;

        let (raw_value, dr_value, rule_value) = match family {
            AnandaMatrixOp::Bimba => (Some(raw_bimba), Some(dr_bimba), None),
            AnandaMatrixOp::Pratibimba => {
                (Some(raw_pratibimba), Some(dr_pratibimba), None)
            }
            AnandaMatrixOp::Sum => (Some(raw_sum), Some(dr_sum), None),
            AnandaMatrixOp::DiffA => (Some(raw_difference_a), Some(dr_difference_a), None),
            AnandaMatrixOp::DiffB => (Some(raw_difference_b), Some(dr_difference_b), None),
            AnandaMatrixOp::Quintessence => (
                None,
                None,
                Some(format!("-1/{raw_bimba}/{raw_sum}")),
            ),
        };

        let decimal10_value = if row12 < 10 && col12 < 10 {
            match raw_value {
                Some(raw) => Some(decimal_mod10(raw)),
                None => None,
            }
        } else {
            None
        };

        let skeleton_event = match raw_value {
            Some(36) => Some(AnandaSkeletonEvent::Hit36),
            Some(64) => Some(AnandaSkeletonEvent::Hit64),
            Some(72) => Some(AnandaSkeletonEvent::Hit72),
            _ => None,
        };

        Some(Self {
            family,
            row12,
            col12,
            raw_value,
            raw_bimba,
            raw_pratibimba,
            raw_sum,
            raw_difference_a,
            raw_difference_b,
            raw_delta: 1,
            dr_value,
            dr_bimba,
            dr_pratibimba,
            dr_sum,
            dr_difference_a,
            dr_difference_b,
            decimal10_value,
            rule_value,
            skeleton_event,
        })
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DrRingPhase {
    pub position_index: u8,
    pub mahamaya_value: u8,
    pub parashakti_value: u8,
}

impl DrRingPhase {
    fn from_position(position6: u8) -> Self {
        let position_index = position6 % 6;
        Self {
            position_index,
            mahamaya_value: DR_RING_MAHAMAYA[position_index as usize],
            parashakti_value: DR_RING_PARASHAKTI[position_index as usize],
        }
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnandaVortexProjection {
    pub active_matrix_op: AnandaMatrixOp,
    pub active_cell: [u8; 2],
    pub active_cell_value: AnandaVortexCell,
    pub oscillatory: AnandaOscillatoryAddress,
    pub dr_ring_phase: DrRingPhase,
    pub cl42_signature_at_position: i8,
    pub ring_quaternion: [f32; 4],
    pub hopf_fiber: u8,
    pub klein_flip_at_this_tick: bool,
    pub spanda_stage_index: u8,
    pub source_ref: String,
    pub derivation_ref: String,
    pub phase_ref: String,
}

impl AnandaVortexProjection {
    pub fn from_clock(cycle: u64, tick12: u8) -> Self {
        let oscillatory = AnandaOscillatoryAddress::from_tick12(tick12);
        let position6 = oscillatory.position6;
        let active_matrix_op = AnandaMatrixOp::from_position(position6);
        let active_cell = [oscillatory.tick12, position6];
        let active_cell_value = AnandaVortexCell::project(
            active_matrix_op,
            active_cell[0],
            active_cell[1],
        )
        .expect("tick-derived Ananda cell is always inside the 12x12 source field");
        let hopf = hopf_clock_address(cycle, oscillatory.tick12);

        Self {
            active_matrix_op,
            active_cell,
            active_cell_value,
            oscillatory,
            dr_ring_phase: DrRingPhase::from_position(position6),
            cl42_signature_at_position: CL42_SIGNATURE[position6 as usize],
            ring_quaternion: RING_QUATERNION_LUT[oscillatory.tick12 as usize],
            hopf_fiber: hopf.fiber,
            klein_flip_at_this_tick: oscillatory.tick12 == 6,
            spanda_stage_index: position6,
            source_ref: ANANDA_SOURCE_REF.to_owned(),
            derivation_ref: ANANDA_DERIVATION_REF.to_owned(),
            phase_ref: ANANDA_PHASE_REF.to_owned(),
        }
    }
}

impl Default for AnandaVortexProjection {
    fn default() -> Self {
        Self::from_clock(0, 0)
    }
}

pub fn true_digit_root(value: u16) -> u8 {
    if value == 0 {
        0
    } else {
        1 + ((value - 1) % 9) as u8
    }
}

pub fn decimal_mod10(value: i16) -> u8 {
    value.rem_euclid(10) as u8
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn raw_dr_and_decimal_registers_remain_distinct() {
        let cell = AnandaVortexCell::project(AnandaMatrixOp::Bimba, 3, 4).unwrap();
        assert_eq!(cell.raw_value, Some(12));
        assert_eq!(cell.dr_value, Some(3));
        assert_eq!(cell.decimal10_value, Some(2));
    }

    #[test]
    fn source_rows_above_nine_preserve_full_raw_identity() {
        let b10 = AnandaVortexCell::project(AnandaMatrixOp::Bimba, 10, 11).unwrap();
        let p10 = AnandaVortexCell::project(AnandaMatrixOp::Pratibimba, 10, 11).unwrap();
        let s10 = AnandaVortexCell::project(AnandaMatrixOp::Sum, 10, 11).unwrap();
        let b11 = AnandaVortexCell::project(AnandaMatrixOp::Bimba, 11, 11).unwrap();
        let p11 = AnandaVortexCell::project(AnandaMatrixOp::Pratibimba, 11, 11).unwrap();
        let s11 = AnandaVortexCell::project(AnandaMatrixOp::Sum, 11, 11).unwrap();

        assert_eq!(b10.raw_value, Some(110));
        assert_eq!(p10.raw_value, Some(111));
        assert_eq!(s10.raw_value, Some(221));
        assert_eq!(b11.raw_value, Some(121));
        assert_eq!(p11.raw_value, Some(122));
        assert_eq!(s11.raw_value, Some(243));
        assert_eq!(b10.decimal10_value, None);
        assert_eq!(b11.decimal10_value, None);
    }

    #[test]
    fn quintessence_is_rule_bearing_not_scalar() {
        let cell = AnandaVortexCell::project(AnandaMatrixOp::Quintessence, 7, 5).unwrap();
        assert_eq!(cell.raw_value, None);
        assert_eq!(cell.dr_value, None);
        assert_eq!(cell.raw_bimba, 35);
        assert_eq!(cell.raw_pratibimba, 36);
        assert_eq!(cell.raw_sum, 71);
        assert_eq!(cell.rule_value.as_deref(), Some("-1/35/71"));
    }

    #[test]
    fn direct_prime_and_hopf_fiber_are_orthogonal() {
        let direct_primary = AnandaVortexProjection::from_clock(0, 1);
        let prime_primary = AnandaVortexProjection::from_clock(0, 7);
        let direct_shadow = AnandaVortexProjection::from_clock(1, 1);
        let prime_shadow = AnandaVortexProjection::from_clock(1, 7);

        assert_eq!(direct_primary.oscillatory.phase, AnandaDirectPrimePhase::Direct);
        assert_eq!(prime_primary.oscillatory.phase, AnandaDirectPrimePhase::Prime);
        assert_eq!(direct_shadow.oscillatory.phase, AnandaDirectPrimePhase::Direct);
        assert_eq!(prime_shadow.oscillatory.phase, AnandaDirectPrimePhase::Prime);
        assert_eq!(direct_primary.hopf_fiber, 0);
        assert_eq!(prime_primary.hopf_fiber, 0);
        assert_eq!(direct_shadow.hopf_fiber, 1);
        assert_eq!(prime_shadow.hopf_fiber, 1);
    }

    #[test]
    fn conjugate_is_opposite_phase_at_same_sixfold_position() {
        for tick12 in 0..12 {
            let address = AnandaOscillatoryAddress::from_tick12(tick12);
            assert_eq!(address.conjugate_position6, address.position6);
            assert_eq!(address.conjugate_tick12, (tick12 + 6) % 12);
            assert_eq!(address.conjugate_phase, address.phase.conjugate());
        }
    }
}
