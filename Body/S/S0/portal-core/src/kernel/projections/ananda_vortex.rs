use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnandaVortexProjection {
    pub active_matrix_op: AnandaMatrixOp,
    pub active_cell: (u8, u8),
    pub active_cell_value: AnandaVortexCell,
    pub dr_ring_phase: DrRingPhase,
    pub cl42_signature_at_position: i8,
    pub ring_quaternion: [f32; 4],
    pub helix_sheet: u8,
    pub klein_flip_at_this_tick: bool,
}

impl Default for AnandaVortexProjection {
    fn default() -> Self {
        Self::from_tick(0, 0, 0)
    }
}

impl AnandaVortexProjection {
    pub fn from_tick(tick12: u8, position6: u8, degree720: u16) -> Self {
        let row = tick12 % 12;
        let position = position6 % 6;
        let active_matrix_op = AnandaMatrixOp::from_position(position);
        Self {
            active_matrix_op,
            active_cell: (row, position),
            active_cell_value: AnandaVortexCell::from_address(active_matrix_op, row, position),
            dr_ring_phase: DrRingPhase::from_tick12(row),
            cl42_signature_at_position: cl42_signature(position),
            ring_quaternion: ring_quaternion(row),
            helix_sheet: if degree720 >= 360 { 1 } else { 0 },
            klein_flip_at_this_tick: row == 5,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnandaVortexCell {
    pub family: AnandaMatrixOp,
    pub row_k: u8,
    pub position_p: u8,
    pub raw_value: Option<i16>,
    pub raw_bimba: i16,
    pub raw_pratibimba: i16,
    pub raw_sum: i16,
    pub raw_delta: i8,
    pub dr_value: Option<u8>,
    pub dr_bimba: u8,
    pub dr_pratibimba: u8,
    pub dr_sum: u8,
    pub rule_value: Option<String>,
    pub skeleton_event: Option<AnandaSkeletonEvent>,
}

impl AnandaVortexCell {
    pub fn from_address(family: AnandaMatrixOp, row_k: u8, position_p: u8) -> Self {
        let row = (row_k % 12) as i16;
        let position = (position_p % 12) as i16;
        let raw_bimba = row * position;
        let raw_pratibimba = raw_bimba + 1;
        let raw_sum = raw_bimba + raw_pratibimba;
        let raw_delta = 1;
        let dr_bimba = digit_root(raw_bimba);
        let dr_pratibimba = digit_root(raw_pratibimba);
        let dr_sum = digit_root(raw_sum);
        let (raw_value, dr_value, rule_value) = match family {
            AnandaMatrixOp::Bimba => (Some(raw_bimba), Some(dr_bimba), None),
            AnandaMatrixOp::Pratibimba => (Some(raw_pratibimba), Some(dr_pratibimba), None),
            AnandaMatrixOp::Sum => (Some(raw_sum), Some(dr_sum), None),
            AnandaMatrixOp::DiffA => (Some(-1), Some(9), None),
            AnandaMatrixOp::DiffB => (Some(1), Some(1), None),
            AnandaMatrixOp::Quintessence => (
                None,
                None,
                Some(format!("{raw_bimba}/{raw_pratibimba}/{raw_sum}")),
            ),
        };

        Self {
            family,
            row_k: row as u8,
            position_p: position as u8,
            raw_value,
            raw_bimba,
            raw_pratibimba,
            raw_sum,
            raw_delta,
            dr_value,
            dr_bimba,
            dr_pratibimba,
            dr_sum,
            rule_value,
            skeleton_event: ananda_skeleton_event(family, row as u8, position as u8),
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[repr(u8)]
pub enum AnandaSkeletonEvent {
    Hit36 = 0,
    Hit64 = 1,
    Hit72 = 2,
    Ratio64Over36 = 3,
    Additive137 = 4,
    IdentityReturn4Plus2 = 5,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DrRingPhase {
    pub mahamaya_idx: u8,
    pub parashakti_idx: u8,
}

impl DrRingPhase {
    fn from_tick12(tick12: u8) -> Self {
        const MAHAMAYA: [u8; 6] = [1, 2, 4, 8, 7, 5];
        const PARASHAKTI: [u8; 6] = [3, 6, 9, 3, 6, 9];
        let idx = (tick12 % 6) as usize;
        Self {
            mahamaya_idx: MAHAMAYA[idx],
            parashakti_idx: PARASHAKTI[idx],
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
#[repr(u8)]
pub enum AnandaMatrixOp {
    Bimba = 0,
    Pratibimba = 1,
    Sum = 2,
    DiffA = 3,
    DiffB = 4,
    Quintessence = 5,
}

impl AnandaMatrixOp {
    fn from_position(position6: u8) -> Self {
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

fn digit_root(value: i16) -> u8 {
    if value == 0 {
        0
    } else {
        let reduced = value.abs() % 9;
        if reduced == 0 {
            9
        } else {
            reduced as u8
        }
    }
}

fn ananda_skeleton_event(
    family: AnandaMatrixOp,
    row_k: u8,
    position_p: u8,
) -> Option<AnandaSkeletonEvent> {
    let raw_bimba = (row_k as i16) * (position_p as i16);
    let raw_pratibimba = raw_bimba + 1;
    match (family, row_k, position_p, raw_bimba, raw_pratibimba) {
        (AnandaMatrixOp::Pratibimba, 7, 5, _, 36) => Some(AnandaSkeletonEvent::Hit36),
        (AnandaMatrixOp::Pratibimba, 7, 9, _, 64) => Some(AnandaSkeletonEvent::Ratio64Over36),
        (AnandaMatrixOp::Bimba, 8, 8, 64, _) => Some(AnandaSkeletonEvent::Hit64),
        (AnandaMatrixOp::Bimba, 8, 9, 72, _) => Some(AnandaSkeletonEvent::Hit72),
        (AnandaMatrixOp::Sum, 8, 9, 72, _) => Some(AnandaSkeletonEvent::Additive137),
        (AnandaMatrixOp::Quintessence, 4, 2, _, _) => {
            Some(AnandaSkeletonEvent::IdentityReturn4Plus2)
        }
        _ => None,
    }
}

fn cl42_signature(position6: u8) -> i8 {
    match position6 % 6 {
        0 | 5 => -1,
        _ => 1,
    }
}

fn ring_quaternion(tick12: u8) -> [f32; 4] {
    const RING_QUATERNION_LUT: [[f32; 4]; 12] = [
        [1.0, 0.0, 0.0, 0.0],
        [0.8660254, 0.5, 0.0, 0.0],
        [0.5, 0.8660254, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [-0.5, 0.8660254, 0.0, 0.0],
        [-0.8660254, 0.5, 0.0, 0.0],
        [0.8660254, -0.5, 0.0, 0.0],
        [0.5, -0.8660254, 0.0, 0.0],
        [0.0, -1.0, 0.0, 0.0],
        [-0.5, -0.8660254, 0.0, 0.0],
        [-0.8660254, -0.5, 0.0, 0.0],
        [-1.0, 0.0, 0.0, 0.0],
    ];
    RING_QUATERNION_LUT[(tick12 % 12) as usize]
}
