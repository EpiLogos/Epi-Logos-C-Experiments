use serde::{Deserialize, Serialize};

use super::super::{l2_prime_element, p_position_element};

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeElementalProjection {
    pub p_position_element: String,
    pub l2_prime_element: String,
    pub rendering_role: String,
}

impl MathemeElementalProjection {
    pub(in crate::kernel) fn from_position(position: u8) -> Self {
        Self {
            p_position_element: p_position_element(position).to_owned(),
            l2_prime_element: l2_prime_element(position).to_owned(),
            rendering_role: if matches!(position, 0 | 5) {
                "nodal-boundary"
            } else {
                "explicate-sounded"
            }
            .to_owned(),
        }
    }
}
