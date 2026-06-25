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
//! # Public surface
//! * `DatasetImporter` — import canonical low-detail and deep Bimba dataset branches into S2 graph storage.
//! * `canonical_dataset_plan`, `deep_dataset_plan`, `low_detail_dataset_plan` — dataset branch planning helpers.
//! * `coordinate_from_node`, `node_text_property`, `canonical_q_import_property_key` — normalized node import helpers.
//!
//! # Does NOT own
//! * Schema registry law from `epi-s2-graph-schema`.
//! * Neo4j client/runtime ownership outside the sibling graph-services client surface.
//! * M' inspector rendering or UI asset presentation.

mod edge_import;
mod node_import;
mod validation;

pub use edge_import::{relation_endpoint, relation_type_from_value};
pub use node_import::{
    canonical_q_import_property_key, coordinate_from_node, node_text_property, DatasetImporter,
};
pub use validation::{
    canonical_dataset_plan, deep_dataset_plan, low_detail_dataset_plan, strip_json_bom,
    DatasetBranch, DatasetBranchReport, DatasetImportReport, DatasetSkip,
};

#[cfg(test)]
mod asset_field_mapping {
    use super::node_import::mapped_filtered_props_for_test;
    use crate::coordinate::CoordinateArrayParser;

    #[test]
    fn lifts_asset_seal_sigil_and_glyph_keys_to_c1_slots() {
        let node = serde_json::json!({
            "coordinate": "#0",
            "filteredProps": {
                "asset": "vault://Idea/Bimba/Map/assets/root.png",
                "assetKind": "image",
                "seal": "ipfs://bafybeigdecanseal",
                "sigilUri": "vault://Idea/Bimba/Map/assets/sigil.svg",
                "glyph": "vault://Idea/Bimba/Map/assets/glyph.svg"
            }
        });
        let parsed = CoordinateArrayParser::parse_one("M0").ok();

        let set_parts = mapped_filtered_props_for_test(&node, parsed.as_ref());

        assert!(set_parts.contains(
            &"n.c_1_asset_uri = ['vault://Idea/Bimba/Map/assets/root.png', 'ipfs://bafybeigdecanseal', 'vault://Idea/Bimba/Map/assets/sigil.svg', 'vault://Idea/Bimba/Map/assets/glyph.svg']".into()
        ));
        assert!(set_parts.contains(&"n.c_1_asset_kind = 'image'".into()));
        assert_eq!(
            set_parts
                .iter()
                .filter(|part| part.starts_with("n.c_1_asset_uri "))
                .count(),
            1,
            "asset aliases should merge into the canonical StringList once"
        );
    }
}
