use serde::{Deserialize, Serialize};

use super::super::{bimba_pitch_class_for_position, pratibimba_pitch_class_for_position};

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeBedrockProjection {
    pub hash_operator: String,
    pub psychoid_number: String,
    pub inverted_psychoid_number: String,
    pub successor_psychoid_number: String,
    pub successor_relation: String,
    pub inversion_relation: String,
    pub bimba_pitch_class: u8,
    pub inversion_pitch_class: u8,
}

impl MathemeBedrockProjection {
    pub(in crate::kernel) fn from_position(position: u8) -> Self {
        let successor = (position + 1) % 6;
        Self {
            hash_operator: "#".to_owned(),
            psychoid_number: format!("#{position}"),
            inverted_psychoid_number: format!("#{position}'"),
            successor_psychoid_number: format!("#{successor}"),
            successor_relation: if position == 5 {
                "mobius-return"
            } else {
                "epogdoon-tick"
            }
            .to_owned(),
            inversion_relation: "inversion-spanda".to_owned(),
            bimba_pitch_class: bimba_pitch_class_for_position(position),
            inversion_pitch_class: pratibimba_pitch_class_for_position(position),
        }
    }
}
