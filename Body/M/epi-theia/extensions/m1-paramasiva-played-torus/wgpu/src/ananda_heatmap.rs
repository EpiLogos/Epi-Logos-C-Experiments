use portal_core::{AnandaVortexCell, AnandaVortexProjection};
use serde::Serialize;

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
