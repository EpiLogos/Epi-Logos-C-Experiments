//! dataset_import - canonical Bimba corpus import planning and field normalization.
//!
//! # Coordinate
//!
//! | Field | Value |
//! |-------|-------|
//! | Coordinate | S2-2 |
//! | Residency  | Body/S/S2/graph-services/src/dataset_import/mod.rs |
//! | Position   | #2 - Graph Operations |
//! | Actualises | [[S2-SPEC]] dataset import surface for canonical Bimba corpus ingestion |
//!
//! # Module tree (per S2-ARCHITECTURE.md §5.7 finding 7)
//! * `importer` — `DatasetImporter` struct + node/relation import loops.
//! * `branch` — dataset branch descriptors and import-report types.
//! * `plans` — canonical / low-detail / deep dataset branch tables.
//! * `property_mapping` — source-key → canonical coordinate-family property maps.
//! * `json_utils` — JSON normalization + node/relation field readers.
//! * `cypher` — Cypher literal escaping and value templating.
//!
//! # Public surface
//! * `DatasetImporter` — import canonical low-detail and deep Bimba dataset branches into S2 graph storage.
//! * `canonical_dataset_plan`, `deep_dataset_plan`, `low_detail_dataset_plan` — dataset branch planning helpers.
//! * `coordinate_from_node`, `node_text_property`, `canonical_q_import_property_key` — normalized node import helpers.
//!
//! # Does NOT own
//! * Schema registry law from `epi-s2-graph-schema`.
//! * Neo4j client/runtime ownership outside the sibling graph-services client surface.
//! * M' inspector rendering or UI asset presentation.

mod branch;
mod cypher;
mod importer;
mod json_utils;
mod plans;
mod property_mapping;

pub use branch::{DatasetBranch, DatasetBranchReport, DatasetImportReport, DatasetSkip};
pub use importer::DatasetImporter;
pub use json_utils::{
    coordinate_from_node, node_text_property, relation_endpoint, relation_type_from_value,
    strip_json_bom,
};
pub use plans::{canonical_dataset_plan, deep_dataset_plan, low_detail_dataset_plan};
pub use property_mapping::canonical_q_import_property_key;
