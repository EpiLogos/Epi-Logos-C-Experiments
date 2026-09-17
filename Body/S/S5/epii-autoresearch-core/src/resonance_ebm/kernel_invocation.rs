//! Element-tick invocation hook for kernel consumers.

use portal_core::{BioQuaternionState, MathemeHarmonicProfile};

#[derive(Debug, Clone, PartialEq)]
pub struct ElementTickInvocation {
    pub element_tick: u8,
    pub profile: MathemeHarmonicProfile,
    pub bioquaternion: BioQuaternionState,
}

impl ElementTickInvocation {
    pub fn new(
        element_tick: u8,
        profile: MathemeHarmonicProfile,
        bioquaternion: BioQuaternionState,
    ) -> Result<Self, String> {
        if element_tick >= 8 {
            return Err("element_tick must be in the 8-step element cycle".to_owned());
        }
        Ok(Self {
            element_tick,
            profile,
            bioquaternion,
        })
    }
}
