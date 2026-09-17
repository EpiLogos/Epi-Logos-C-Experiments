use serde::{Deserialize, Serialize};

use super::MathemeDiatonicContext;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeContextFrameWebProjection {
    pub frame_count: u8,
    pub active_frame_index: Option<u8>,
    pub active_frame: Option<String>,
    pub active_agent: Option<String>,
    pub projection: String,
}

impl MathemeContextFrameWebProjection {
    pub(in crate::kernel) fn from_diatonic(diatonic: Option<&MathemeDiatonicContext>) -> Self {
        Self {
            frame_count: 7,
            active_frame_index: diatonic.map(|context| context.degree - 1),
            active_frame: diatonic.map(|context| context.context_frame.clone()),
            active_agent: diatonic.map(|context| context.context_agent.clone()),
            projection: "CF7 diatonic lemniscate overlay".to_owned(),
        }
    }
}
