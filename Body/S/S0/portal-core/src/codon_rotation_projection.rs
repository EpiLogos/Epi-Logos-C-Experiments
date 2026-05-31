use serde::{Deserialize, Serialize};

use crate::codon::{classify_codon, codon_sequence};

pub const LENS_COUNT: u8 = 12;
pub const MODE_COUNT: u8 = 7;
pub const LENS_MODE_COUNT: usize = 84;
pub const CODON_COUNT: u8 = 64;
pub const CODON_ROTATION_SURFACE_COUNT: usize = 472;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeLensMode {
    pub lens: u8,
    pub mode: u8,
}

impl MathemeLensMode {
    pub fn new(lens: u8, mode: u8) -> Option<Self> {
        if lens < LENS_COUNT && mode < MODE_COUNT {
            Some(Self { lens, mode })
        } else {
            None
        }
    }

    pub fn index(self) -> usize {
        self.lens as usize * MODE_COUNT as usize + self.mode as usize
    }

    pub fn lens_label(self) -> String {
        if self.lens < 6 {
            format!("L{}", self.lens)
        } else {
            format!("L{}'", self.lens - 6)
        }
    }

    pub fn mode_name(self) -> &'static str {
        mode_name(self.mode)
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CodonRotationSurfaceCell {
    pub surface_index: usize,
    pub codon_id: u8,
    pub codon: String,
    pub codon_class: String,
    pub rotation: u8,
    pub rotational_state_count: u8,
    pub rotation_degrees: u16,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CodonRotationProjection {
    pub lens: u8,
    pub mode: u8,
    pub lens_label: String,
    pub mode_name: String,
    pub surface_index: usize,
    pub codon_id: u8,
    pub codon: String,
    pub codon_class: String,
    pub rotation: u8,
    pub rotational_state_count: u8,
    pub rotation_degrees: u16,
    pub reverse_lens: u8,
    pub reverse_mode: u8,
    pub dataset_lut_state: String,
    pub provenance: String,
}

pub fn codon_rotation_surface() -> Vec<CodonRotationSurfaceCell> {
    let mut cells = Vec::with_capacity(CODON_ROTATION_SURFACE_COUNT);
    for codon_id in 0..CODON_COUNT {
        let codon_class = classify_codon(codon_id);
        let rotational_state_count = codon_class.rotational_state_count();
        for rotation in 0..rotational_state_count {
            cells.push(CodonRotationSurfaceCell {
                surface_index: cells.len(),
                codon_id,
                codon: codon_string(codon_id),
                codon_class: if codon_class.is_dual() {
                    "dual"
                } else {
                    "non-dual"
                }
                .to_owned(),
                rotation,
                rotational_state_count,
                rotation_degrees: rotation as u16 * 45,
            });
        }
    }
    cells
}

pub fn codon_rotation_from_lens_mode(lens: u8, mode: u8) -> Option<CodonRotationProjection> {
    let lens_mode = MathemeLensMode::new(lens, mode)?;
    let surface = codon_rotation_surface();
    let surface_index = forward_surface_index(lens_mode.index());
    let cell = surface.get(surface_index)?;
    Some(projection_from_cell(lens_mode, cell))
}

pub fn lens_mode_from_codon_rotation(codon_id: u8, rotation: u8) -> Option<MathemeLensMode> {
    let surface_index = surface_index_for_codon_rotation(codon_id, rotation)?;
    let lens_mode_index = reverse_lens_mode_index(surface_index);
    let lens = (lens_mode_index / MODE_COUNT as usize) as u8;
    let mode = (lens_mode_index % MODE_COUNT as usize) as u8;
    MathemeLensMode::new(lens, mode)
}

pub fn codon_charge_quaternion(codon_id: u8) -> [f32; 4] {
    let outer = nucleotide_iching_value((codon_id >> 4) & 0x03);
    let middle = nucleotide_iching_value((codon_id >> 2) & 0x03);
    let inner = nucleotide_iching_value(codon_id & 0x03);
    let pp = outer + middle + inner;
    let mm = outer - middle - inner;
    let mp = outer - middle + inner;
    let pm = outer + middle - inner;
    normalize_quaternion([pp, mm, mp, pm])
}

fn projection_from_cell(
    lens_mode: MathemeLensMode,
    cell: &CodonRotationSurfaceCell,
) -> CodonRotationProjection {
    let reverse = lens_mode_from_codon_rotation(cell.codon_id, cell.rotation)
        .expect("surface cell remains reverse-addressable");
    CodonRotationProjection {
        lens: lens_mode.lens,
        mode: lens_mode.mode,
        lens_label: lens_mode.lens_label(),
        mode_name: lens_mode.mode_name().to_owned(),
        surface_index: cell.surface_index,
        codon_id: cell.codon_id,
        codon: cell.codon.clone(),
        codon_class: cell.codon_class.clone(),
        rotation: cell.rotation,
        rotational_state_count: cell.rotational_state_count,
        rotation_degrees: cell.rotation_degrees,
        reverse_lens: reverse.lens,
        reverse_mode: reverse.mode,
        dataset_lut_state: "materialized-kernel-lut".to_owned(),
        provenance: "portal-core::codon_rotation_projection 84↔472 surface LUT".to_owned(),
    }
}

fn forward_surface_index(lens_mode_index: usize) -> usize {
    (lens_mode_index * CODON_ROTATION_SURFACE_COUNT + (LENS_MODE_COUNT - 1)) / LENS_MODE_COUNT
}

fn reverse_lens_mode_index(surface_index: usize) -> usize {
    (surface_index * LENS_MODE_COUNT) / CODON_ROTATION_SURFACE_COUNT
}

fn surface_index_for_codon_rotation(codon_id: u8, rotation: u8) -> Option<usize> {
    if codon_id >= CODON_COUNT {
        return None;
    }
    let mut index = 0usize;
    for codon in 0..codon_id {
        index += classify_codon(codon).rotational_state_count() as usize;
    }
    let rotational_state_count = classify_codon(codon_id).rotational_state_count();
    if rotation >= rotational_state_count {
        None
    } else {
        Some(index + rotation as usize)
    }
}

fn codon_string(codon_id: u8) -> String {
    let seq = codon_sequence(codon_id);
    String::from_utf8_lossy(&seq).into_owned()
}

fn nucleotide_iching_value(nucleotide: u8) -> f32 {
    match nucleotide & 0x03 {
        0 => 6.0,
        1 => 9.0,
        2 => 7.0,
        _ => 8.0,
    }
}

fn normalize_quaternion(q: [f32; 4]) -> [f32; 4] {
    let norm_sq = q.iter().map(|component| component * component).sum::<f32>();
    if norm_sq <= 0.0 {
        [1.0, 0.0, 0.0, 0.0]
    } else {
        let scale = 1.0 / norm_sq.sqrt();
        [q[0] * scale, q[1] * scale, q[2] * scale, q[3] * scale]
    }
}

fn mode_name(mode: u8) -> &'static str {
    match mode % MODE_COUNT {
        0 => "Ionian",
        1 => "Dorian",
        2 => "Phrygian",
        3 => "Lydian",
        4 => "Mixolydian",
        5 => "Aeolian",
        _ => "Locrian",
    }
}
