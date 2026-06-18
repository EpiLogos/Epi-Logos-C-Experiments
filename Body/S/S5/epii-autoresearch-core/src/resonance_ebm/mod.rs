//! Position 5' [[Epii]] resonance-vector EBM runtime surface.
//!
//! This module owns the runtime half of the `parashakti-ebm-head` contract:
//! checkpoint loading, canonical [[MathemeHarmonicProfile]] channel encoding,
//! tritone-symmetric 72-vector inference, zero-checkpoint fallback, and the
//! gradient surface consumed by the later Riemannian projection wrapper.

pub mod attention;
pub mod channels;
pub mod checkpoint;
pub mod gradient;
pub mod inference;
pub mod kernel_invocation;
pub mod mirror_loss;
pub mod model;
pub mod training;

pub use attention::*;
pub use channels::*;
pub use checkpoint::*;
pub use gradient::*;
pub use inference::*;
pub use kernel_invocation::*;
pub use mirror_loss::*;
pub use model::*;

#[cfg(test)]
mod mirror_consistency_loss {
    use super::MirrorConsistencyReport;

    #[test]
    fn asserts_x_plus_y_equals_five_tritone_invariance() {
        let mut vector = [0.0f32; 72];
        for lens_anchor in 0..12 {
            for position in 0..3 {
                let value = (lens_anchor + position + 1) as f32 / 24.0;
                vector[lens_anchor * 6 + position] = value;
                vector[lens_anchor * 6 + (5 - position)] = value;
            }
        }

        let report = MirrorConsistencyReport::evaluate(&vector, 0.0001);

        assert_eq!(report.checked_pairs, 36);
        assert_eq!(report.violations, 0);
        assert_eq!(report.loss, 0.0);
        assert!(report.assert_invariant().is_ok());
    }
}
