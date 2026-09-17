//! Canonical public module for the M' harmonic profile contract.
//!
//! The concrete profile generation still lives beside the S0 kernel tick
//! projection while the contract is being split out incrementally. New callers
//! should import profile shapes through this module or the crate root, not by
//! redefining renderer-local copies.

pub use crate::kernel::{
    AnandaBusRole, AnandaMatrixOp, AnandaSeatBinding, AnandaSeatKind, AnandaSkeletonEvent,
    AnandaVortexCell, AnandaVortexProjection,
    ConjugateFormCharacter, DrRingPhase, MathemeBedrockProjection, MathemeBinaryProjection,
    MathemeChromaticProfile, MathemeContextFrameWebProjection, MathemeDiatonicContext,
    MathemeElementalProjection, MathemeHarmonicFamilyProjection, MathemeHarmonicGrammarProjection,
    MathemeHarmonicProfile, MathemeNodalConstraint, MathemePlanetaryChakralProjection,
    MathemePointerAnchorProjection, MathemeResonance72Projection, ProfilePrivacyClass,
};
pub use crate::profile_projections::{
    AnuttaraWitnessBandBalance, AnuttaraWitnessPalindromeState, AnuttaraWitnessProjection,
    AnuttaraWitnessRFactorBand, AnuttaraWitnessRFactorPathStep, BeingEntityRef,
    BeingObserverAnchor, BeingPatternClockAddress, BeingPatternProtectedRef,
    BeingPatternRelationEdge, BioQuaternionHandle, CanonRecognitionEvent, CanonWriteBackState,
    CompositionLoadStatus, CosmicCompositionMountPoint, CosmicCompositionState,
    CosmicDegradationLevel, ElementalWeightProjection, M2M3RelationProjection, MonoPolyOperator,
    NaraFamilyRole, PasuBeingPatternProjection, PasuLiveStateHandle, PasuReviewRisk,
    PersonalPoleElementalBalance, PersonalPoleProjection, PersonalPoleResonance, PerspectiveRole,
    ProtectedHandle, PsychoidDipyramidGeometry, PsychoidDipyramidLocus, PsychoidDipyramidLocusRole,
    PsychoidFieldProjection, PsychoidFieldReadiness, StableIdentityHandle,
};
