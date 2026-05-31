//! Canonical public module for the M' harmonic profile contract.
//!
//! The concrete profile generation still lives beside the S0 kernel tick
//! projection while the contract is being split out incrementally. New callers
//! should import profile shapes through this module or the crate root, not by
//! redefining renderer-local copies.

pub use crate::kernel::{
    ConjugateFormCharacter, MathemeBedrockProjection, MathemeBinaryProjection,
    MathemeChromaticProfile, MathemeContextFrameWebProjection, MathemeDiatonicContext,
    MathemeElementalProjection, MathemeHarmonicProfile, MathemeNodalConstraint,
    MathemePlanetaryChakralProjection, MathemePointerAnchorProjection,
    MathemeResonance72Projection, ProfilePrivacyClass,
};
