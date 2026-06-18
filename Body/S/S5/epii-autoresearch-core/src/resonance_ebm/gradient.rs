//! Gradient surface for Stream D's Riemannian-quaternion projection wrapper.
//!
//! The zero-checkpoint path returns an exact zero gradient. Loaded checkpoints
//! expose a deterministic finite-difference gradient over `q_p`; the wrapper in
//! the later tranche can replace this estimator with framework autograd without
//! changing the public contract.

use portal_core::BioQuaternionState;

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
        let baseline = self.runtime.evaluate(invocation)?;
        if !baseline.checkpoint_loaded {
            return Ok(GradientEstimate {
                d_energy_d_q_p: [0.0; 4],
                provenance: "resonance_ebm::zero_checkpoint_fallback".to_owned(),
            });
        }

        let epsilon = 0.001f32;
        let mut gradient = [0.0f32; 4];
        for idx in 0..4 {
            let mut plus = invocation.clone();
            plus.bioquaternion = perturb_q_p(&plus.bioquaternion, idx, epsilon);
            let plus_energy = self.runtime.evaluate(&plus)?.energy_scalar;

            let mut minus = invocation.clone();
            minus.bioquaternion = perturb_q_p(&minus.bioquaternion, idx, -epsilon);
            let minus_energy = self.runtime.evaluate(&minus)?.energy_scalar;
            gradient[idx] = (plus_energy - minus_energy) / (2.0 * epsilon);
        }
        Ok(GradientEstimate {
            d_energy_d_q_p: gradient,
            provenance: "resonance_ebm::finite_difference_q_p".to_owned(),
        })
    }
}

fn perturb_q_p(state: &BioQuaternionState, idx: usize, delta: f32) -> BioQuaternionState {
    let mut q_p = state.q_p;
    q_p[idx] += delta;
    BioQuaternionState::new(state.q_b, q_p)
}
