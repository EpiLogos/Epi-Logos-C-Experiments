use serde::{Deserialize, Serialize};

use super::super::lens_anchor_label;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemePointerAnchorProjection {
    pub source_coordinate: String,
    pub ql_position: u8,
    pub helix: String,
    pub web_index: u8,
    pub bedrock_index: u8,
    pub family_ring_size: u8,
    pub position_ring_size: u8,
    pub lens_ring_size: u8,
    pub web_cardinality: u8,
    pub lens_anchor: String,
    pub relation_role: String,
    pub pitch_class: u8,
    pub provenance: String,
}

impl MathemePointerAnchorProjection {
    pub(in crate::kernel) fn from_tick(
        tick12: u8,
        position: u8,
        helix: &str,
        pitch_class: u8,
    ) -> Self {
        Self {
            source_coordinate: "S0/QL-meta".to_owned(),
            ql_position: position,
            helix: helix.to_owned(),
            web_index: tick12,
            bedrock_index: position,
            family_ring_size: 12,
            position_ring_size: 12,
            lens_ring_size: 12,
            web_cardinality: 36,
            lens_anchor: lens_anchor_label(tick12),
            relation_role: if tick12 < 6 {
                "position-identity"
            } else {
                "inversion-spanda"
            }
            .to_owned(),
            pitch_class,
            provenance: "S0 Bedrock7/PointerWeb36/CF7 harmonic pointer contract".to_owned(),
        }
    }
}
