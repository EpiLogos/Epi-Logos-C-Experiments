pub mod spacetime;

use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct PortalRuntimeState {
    pub day_id: String,
    pub now_path: String,
}
