//! Forward-pass runtime for the EBM head.

use super::checkpoint::{CheckpointLoadPolicy, EbmCheckpoint};
use super::gradient::{GradientEstimate, ResonanceGradientSurface};
use super::kernel_invocation::ElementTickInvocation;
use super::mirror_loss::MirrorConsistencyReport;
use super::model::{ResonanceEbmConfig, ResonanceEbmModel};

#[derive(Debug, Clone, PartialEq)]
pub struct ResonanceEbmOutput {
    pub resonance_vector: Vec<f32>,
    pub energy_scalar: f32,
    pub mirror_report: MirrorConsistencyReport,
    pub channel_set: Vec<String>,
    pub checkpoint_variant_id: String,
    pub checkpoint_loaded: bool,
}

pub struct ResonanceEbmRuntime {
    config: ResonanceEbmConfig,
    model: Option<ResonanceEbmModel>,
}

impl ResonanceEbmRuntime {
    pub fn load(config: ResonanceEbmConfig, policy: CheckpointLoadPolicy) -> Result<Self, String> {
        config.validate()?;
        let checkpoint_path = config.checkpoint_path.clone();
        let model = match checkpoint_path {
            Some(path) => {
                let checkpoint = EbmCheckpoint::load(&path)?;
                checkpoint.validate()?;
                Some(ResonanceEbmModel::new(
                    checkpoint.config,
                    checkpoint.weights,
                )?)
            }
            None if matches!(policy, CheckpointLoadPolicy::AllowZeroFallback) => None,
            None => {
                return Err("checkpoint_path is required by RequireCheckpoint policy".to_owned())
            }
        };
        Ok(Self { config, model })
    }

    pub fn evaluate(
        &self,
        invocation: &ElementTickInvocation,
    ) -> Result<ResonanceEbmOutput, String> {
        if let Some(model) = &self.model {
            model.evaluate(invocation)
        } else {
            Ok(ResonanceEbmOutput {
                resonance_vector: vec![0.0; 72],
                energy_scalar: 0.0,
                mirror_report: MirrorConsistencyReport::evaluate(
                    &[0.0; 72],
                    self.config.mirror_tolerance,
                ),
                channel_set: super::channels::CANONICAL_CHANNEL_SET
                    .iter()
                    .map(|channel| (*channel).to_owned())
                    .collect(),
                checkpoint_variant_id: self.config.variant_id.clone(),
                checkpoint_loaded: false,
            })
        }
    }

    pub fn gradient(&self, invocation: &ElementTickInvocation) -> Result<GradientEstimate, String> {
        ResonanceGradientSurface::new(self).estimate(invocation)
    }

    pub(crate) fn candle_gradient(
        &self,
        invocation: &ElementTickInvocation,
    ) -> Result<Option<[f32; 4]>, String> {
        self.model
            .as_ref()
            .map(|model| model.gradient_q_p(invocation))
            .transpose()
    }
}
