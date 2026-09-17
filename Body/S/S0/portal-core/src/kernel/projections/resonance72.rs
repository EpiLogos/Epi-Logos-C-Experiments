use serde::{Deserialize, Serialize};

use super::super::kernel_resonance_index;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeResonance72Projection {
    pub legacy_resonance_index: usize,
    pub lens_anchor_index: usize,
    pub base_lens: u8,
    pub helix_bit: u8,
    pub lens_anchor: u8,
    pub position: u8,
}

impl MathemeResonance72Projection {
    pub(in crate::kernel) fn from_tick(tick12: u8, position: u8) -> Self {
        let helix_bit = tick12 / 6;
        let base_lens = position;
        Self {
            legacy_resonance_index: kernel_resonance_index(base_lens, helix_bit == 1, position)
                .expect("tick-derived resonance address remains in the 72-fold domain"),
            lens_anchor_index: tick12 as usize * 6 + position as usize,
            base_lens,
            helix_bit,
            lens_anchor: tick12,
            position,
        }
    }
}
