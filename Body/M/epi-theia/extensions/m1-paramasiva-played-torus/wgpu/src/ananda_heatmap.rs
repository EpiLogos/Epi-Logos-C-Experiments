use portal_core::{AnandaMatrixOp, AnandaSkeletonEvent, AnandaVortexCell, AnandaVortexProjection};
use serde::Serialize;

/// The luminous cell on the active 12x12 matrix, read straight from the
/// profile-bus projection. Default colour reads the digit-root face; proof
/// mode overlays the raw/no-digi-root value so 36/64/72/137 events are
/// visible without local re-derivation (M1-2-ANANDA-VORTEX-ARCHITECTURE §5.2).
#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
pub struct AnandaHeatmapCell {
    pub active_cell: (u8, u8),
    pub value: AnandaVortexCell,
    pub source: &'static str,
}

pub fn active_cell_from_projection(projection: &AnandaVortexProjection) -> AnandaHeatmapCell {
    AnandaHeatmapCell {
        active_cell: projection.active_cell,
        value: projection.active_cell_value.clone(),
        source: "profile.ananda_vortex.active_cell_value",
    }
}

/// One glass layer of the six-family perspex stack (§5.2): the active family is
/// opaque at 100%; its ring neighbours sit at ~20%; the rest are near-clear.
/// `signature` is the family's implicate/explicate character, mirroring the
/// substrate `ANANDA_FAMILY_SIGNATURE[6]` LUT (Body/S/S0/epi-lib/src/m1.c) so
/// the renderer tints each glass layer without inventing the value:
/// Bimba (#X+0) and Quintessence (#X+0/1) are implicate boundaries (-1, cool
/// indigo); Pratibimba/Sum/DiffA/DiffB are explicate (+1, warm).
#[derive(Clone, Debug, PartialEq, Serialize)]
pub struct AnandaPerspexLayer {
    pub op: AnandaMatrixOp,
    pub opacity: f32,
    pub is_active: bool,
    pub signature: i8,
}

/// The six canonical Ananda matrix families rendered as a perspex cross-fade,
/// keyed off `active_matrix_op`. This is the 15.8 headline surface — the six
/// families ARE the vortex, and the stack makes all six legible at once with
/// the active one foregrounded. Layer ordering follows the canonical
/// `Ananda_Matrix_Op` enum (Bimba..Quintessence), never re-ordered renderer-side.
#[derive(Clone, Debug, PartialEq, Serialize)]
pub struct AnandaPerspexStack {
    pub active_matrix_op: AnandaMatrixOp,
    pub layers: [AnandaPerspexLayer; 6],
    pub skeleton_event: Option<AnandaSkeletonEvent>,
    pub source: &'static str,
}

/// Active = 1.0 (foreground glass); immediate ring neighbours (±1 mod 6) = 0.2
/// (the predecessor/successor cross-fade of §5.2); all others = 0.05 (the
/// remaining glass in the six-layer stack — present, not hidden).
const PERSPEX_ACTIVE_OPACITY: f32 = 1.0;
const PERSPEX_NEIGHBOUR_OPACITY: f32 = 0.2;
const PERSPEX_BACKGROUND_OPACITY: f32 = 0.05;

const ALL_FAMILIES: [AnandaMatrixOp; 6] = [
    AnandaMatrixOp::Bimba,
    AnandaMatrixOp::Pratibimba,
    AnandaMatrixOp::Sum,
    AnandaMatrixOp::DiffA,
    AnandaMatrixOp::DiffB,
    AnandaMatrixOp::Quintessence,
];

/// The per-family implicate/explicate signature. Mirrors the canonical
/// substrate `ANANDA_FAMILY_SIGNATURE[6] = {-1,+1,+1,+1,+1,-1}` — the two
/// implicate boundaries (Bimba, Quintessence) carry -1; the four explicate
/// families carry +1. Forced by canon (m1.h:103,108 enum), not chosen here.
fn family_signature(op: AnandaMatrixOp) -> i8 {
    match op {
        AnandaMatrixOp::Bimba | AnandaMatrixOp::Quintessence => -1,
        _ => 1,
    }
}

fn ring_distance(a: u8, b: u8) -> u8 {
    let forward = (a + 6 - b) % 6;
    forward.min(6 - forward)
}

fn perspex_opacity(active: u8, layer: u8) -> f32 {
    match ring_distance(active, layer) {
        0 => PERSPEX_ACTIVE_OPACITY,
        1 => PERSPEX_NEIGHBOUR_OPACITY,
        _ => PERSPEX_BACKGROUND_OPACITY,
    }
}

pub fn perspex_stack_from_projection(projection: &AnandaVortexProjection) -> AnandaPerspexStack {
    let active = projection.active_matrix_op as u8;
    let layers = std::array::from_fn(|i| {
        let op = ALL_FAMILIES[i];
        AnandaPerspexLayer {
            op,
            opacity: perspex_opacity(active, op as u8),
            is_active: op as u8 == active,
            signature: family_signature(op),
        }
    });
    AnandaPerspexStack {
        active_matrix_op: projection.active_matrix_op,
        layers,
        skeleton_event: projection.active_cell_value.skeleton_event,
        source: "profile.ananda_vortex.active_matrix_op",
    }
}
