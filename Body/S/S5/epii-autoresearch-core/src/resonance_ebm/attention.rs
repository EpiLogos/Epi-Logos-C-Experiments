//! Cross-channel fusion surface for the position 5' EBM.
//!
//! The canonical architecture pins the shape, not the fusion topology. This
//! trait is intentionally swappable so checkpoint metadata can identify the
//! variant that Mercurius-Elo evaluates across runs.

use super::channels::ChannelEmbedding;

pub trait CrossChannelAttention: Send + Sync {
    fn variant_id(&self) -> &str;
    fn fuse(
        &self,
        channels: &[ChannelEmbedding],
        attention_width: usize,
    ) -> Result<Vec<f32>, String>;
}

#[derive(Debug, Clone)]
pub struct WeightedMeanAttention {
    variant_id: String,
    weights: Vec<f32>,
}

impl WeightedMeanAttention {
    pub fn new(variant_id: impl Into<String>, weights: Vec<f32>) -> Self {
        Self {
            variant_id: variant_id.into(),
            weights,
        }
    }
}

impl CrossChannelAttention for WeightedMeanAttention {
    fn variant_id(&self) -> &str {
        &self.variant_id
    }

    fn fuse(
        &self,
        channels: &[ChannelEmbedding],
        attention_width: usize,
    ) -> Result<Vec<f32>, String> {
        if channels.is_empty() {
            return Err("at least one harmonic channel is required".to_owned());
        }
        if attention_width == 0 {
            return Err("attention_width must be greater than zero".to_owned());
        }
        let latent_dim = channels[0].values.len();
        if latent_dim == 0 {
            return Err("channel latent_dim must be greater than zero".to_owned());
        }
        if channels
            .iter()
            .any(|channel| channel.values.len() != latent_dim)
        {
            return Err("all channel embeddings must share latent_dim".to_owned());
        }

        let mut fused = vec![0.0f32; latent_dim];
        let mut weight_sum = 0.0f32;
        for (idx, channel) in channels.iter().enumerate() {
            let raw = self.weights.get(idx).copied().unwrap_or(1.0);
            let width_gate = ((idx % attention_width) + 1) as f32 / attention_width as f32;
            let weight = raw.abs().max(f32::EPSILON) * width_gate;
            for (slot, value) in fused.iter_mut().zip(channel.values.iter()) {
                *slot += *value * weight;
            }
            weight_sum += weight;
        }
        if weight_sum <= 0.0 {
            return Err("attention weights collapsed to zero".to_owned());
        }
        for value in fused.iter_mut() {
            *value /= weight_sum;
        }
        Ok(fused)
    }
}
