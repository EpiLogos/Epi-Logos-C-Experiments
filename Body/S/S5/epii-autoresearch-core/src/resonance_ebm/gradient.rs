//! Gradient surface for Stream D's Riemannian-quaternion projection wrapper.
//!
//! The zero-checkpoint path returns an exact zero gradient. Loaded checkpoints
//! backpropagate through the Candle forward graph and learned bioquaternion
//! projection, exposing the differentiable surface consumed by Stream D.

use super::inference::ResonanceEbmRuntime;
use super::kernel_invocation::ElementTickInvocation;

#[derive(Debug, Clone, PartialEq)]
pub struct GradientEstimate {
    pub d_energy_d_q_p: [f32; 4],
    pub provenance: String,
}

pub struct ResonanceGradientSurface<'a> {
    runtime: &'a ResonanceEbmRuntime,
}

impl<'a> ResonanceGradientSurface<'a> {
    pub fn new(runtime: &'a ResonanceEbmRuntime) -> Self {
        Self { runtime }
    }

    pub fn estimate(&self, invocation: &ElementTickInvocation) -> Result<GradientEstimate, String> {
        let Some(gradient) = self.runtime.candle_gradient(invocation)? else {
            return Ok(GradientEstimate {
                d_energy_d_q_p: [0.0; 4],
                provenance: "resonance_ebm::zero_checkpoint_fallback".to_owned(),
            });
        };
        Ok(GradientEstimate {
            d_energy_d_q_p: gradient,
            provenance: "resonance_ebm::candle_autograd_q_p".to_owned(),
        })
    }
}
