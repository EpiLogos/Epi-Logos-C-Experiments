use std::path::PathBuf;

use crate::coordinate::is_valid_coordinate;

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum GraphSyncMode {
    CanonicalWrite,
    MigrateLegacyCoordinate,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct GraphSyncIntent {
    pub mode: GraphSyncMode,
    pub coordinate: String,
    pub vault_path: PathBuf,
    pub target_label: &'static str,
    pub coordinate_property: &'static str,
    pub compatibility_source_label: Option<&'static str>,
    pub compatibility_source_property: Option<&'static str>,
    pub touches_live_graph: bool,
}
pub fn graph_sync_intent(
    coordinate: &str,
    vault_path: PathBuf,
    compatibility_source_label: Option<&str>,
) -> Result<GraphSyncIntent, String> {
    if !is_valid_coordinate(coordinate) {
        return Err(format!("invalid graph sync coordinate: {coordinate}"));
    }

    let legacy_label = match compatibility_source_label {
        Some("BimbaCoordinate") => Some("BimbaCoordinate"),
        Some("BimbaNode") => Some("BimbaNode"),
        Some(other) => return Err(format!("unsupported compatibility graph label: {other}")),
        None => None,
    };

    Ok(GraphSyncIntent {
        mode: if legacy_label.is_some() {
            GraphSyncMode::MigrateLegacyCoordinate
        } else {
            GraphSyncMode::CanonicalWrite
        },
        coordinate: coordinate.to_owned(),
        vault_path,
        target_label: "Bimba",
        coordinate_property: "coordinate",
        compatibility_source_label: legacy_label,
        compatibility_source_property: legacy_label.map(|_| "bimbaCoordinate"),
        touches_live_graph: false,
    })
}
