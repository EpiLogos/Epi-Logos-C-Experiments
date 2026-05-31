//! Resonance analysis — the structured output of `analyse-resonance`.
//!
//! Follows mental-pole mechanics §5: every document analysis produces a
//! 72-dimensional [`ResonanceVector72`], four prehensive extractions
//! (material / energetic / formal / contextual), a list of dominant
//! lens-positions with rationales, the 3-square emphasis aggregates,
//! and optional novel resonances the document surfaces beyond the
//! coordinate's accumulated canon.

use serde::{Deserialize, Serialize};

use portal_core::{
    kernel_resonance_index, kernel_resonance_square_emphasis, tritone_square_for_lens,
    ResonanceVector72, TRITONE_SQUARES,
};

/// The four prehensive extractions of mental-pole mechanics §4 — one
/// short paragraph each. These are produced during the §4+2 phase of an
/// ingestion session and persisted with the resonance vector.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct PrehensiveExtractions {
    pub material: String,
    pub energetic: String,
    pub formal: String,
    pub contextual: String,
}

impl PrehensiveExtractions {
    pub fn new(
        material: impl Into<String>,
        energetic: impl Into<String>,
        formal: impl Into<String>,
        contextual: impl Into<String>,
    ) -> Result<Self, &'static str> {
        let me = Self {
            material: material.into(),
            energetic: energetic.into(),
            formal: formal.into(),
            contextual: contextual.into(),
        };
        if me.material.trim().is_empty()
            || me.energetic.trim().is_empty()
            || me.formal.trim().is_empty()
            || me.contextual.trim().is_empty()
        {
            return Err("all four prehensive extractions must be non-empty");
        }
        Ok(me)
    }
}

/// One dominant lens-position the analysis flagged as load-bearing.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct DominantPosition {
    pub lens: u8,
    pub position: u8,
    pub ascent_helix: bool,
    pub intensity: f32,
    pub rationale: String,
}

impl DominantPosition {
    pub fn new(
        lens: u8,
        position: u8,
        ascent_helix: bool,
        intensity: f32,
        rationale: impl Into<String>,
    ) -> Result<Self, &'static str> {
        if kernel_resonance_index(lens, ascent_helix, position).is_none() {
            return Err("dominant position lens and position must be in 0..6");
        }
        if !intensity.is_finite() || !(0.0..=1.0).contains(&intensity) {
            return Err("dominant position intensity must be finite and in [0, 1]");
        }
        let rationale: String = rationale.into();
        if rationale.trim().is_empty() {
            return Err("dominant position rationale must be non-empty");
        }
        Ok(Self {
            lens,
            position,
            ascent_helix,
            intensity,
            rationale,
        })
    }

    /// 72-dimension index this position occupies.
    pub fn resonance_index(&self) -> usize {
        kernel_resonance_index(self.lens, self.ascent_helix, self.position)
            .expect("validated in constructor")
    }

    /// Tritone square this lens belongs to (0..3).
    pub fn tritone_square(&self) -> usize {
        tritone_square_for_lens(self.lens).expect("validated in constructor")
    }
}

/// Full structured analysis produced by `analyse-resonance`.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ResonanceAnalysis {
    pub document_id: String,
    pub coordinate: String,
    pub resonance_vector: ResonanceVector72,
    pub extractions: PrehensiveExtractions,
    pub dominant_positions: Vec<DominantPosition>,
    pub square_emphasis: [f32; TRITONE_SQUARES],
    pub novel_resonances: Option<String>,
    pub generated_at_ms: u64,
}

impl ResonanceAnalysis {
    pub fn new(
        document_id: impl Into<String>,
        coordinate: impl Into<String>,
        resonance_vector: ResonanceVector72,
        extractions: PrehensiveExtractions,
        dominant_positions: Vec<DominantPosition>,
        novel_resonances: Option<String>,
        generated_at_ms: u64,
    ) -> Result<Self, &'static str> {
        let document_id = document_id.into();
        let coordinate = coordinate.into();
        if document_id.trim().is_empty() {
            return Err("document_id must be non-empty");
        }
        if coordinate.trim().is_empty() {
            return Err("coordinate must be non-empty");
        }
        if generated_at_ms == 0 {
            return Err("generated_at_ms is required");
        }
        for value in resonance_vector.values {
            if !value.is_finite() || !(0.0..=1.0).contains(&value) {
                return Err("every resonance value must be finite and in [0, 1]");
            }
        }
        let square_emphasis = kernel_resonance_square_emphasis(&resonance_vector);
        Ok(Self {
            document_id,
            coordinate,
            resonance_vector,
            extractions,
            dominant_positions,
            square_emphasis,
            novel_resonances,
            generated_at_ms,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn extractions() -> PrehensiveExtractions {
        PrehensiveExtractions::new(
            "raw substrate",
            "dynamic tensions",
            "structural ratios",
            "telic horizon",
        )
        .unwrap()
    }

    #[test]
    fn prehensive_extractions_reject_empty_fields() {
        assert!(PrehensiveExtractions::new("", "b", "c", "d").is_err());
        assert!(PrehensiveExtractions::new("a", "", "c", "d").is_err());
        assert!(PrehensiveExtractions::new("a", "b", " ", "d").is_err());
        assert!(PrehensiveExtractions::new("a", "b", "c", "").is_err());
        assert!(PrehensiveExtractions::new("a", "b", "c", "d").is_ok());
    }

    #[test]
    fn dominant_position_validates_inputs_and_exposes_indices() {
        let pos = DominantPosition::new(2, 4, true, 0.8, "tetralemma break").unwrap();
        assert_eq!(pos.tritone_square(), 2);
        assert_eq!(pos.resonance_index(), 2 * 12 + 6 + 4);

        assert!(DominantPosition::new(6, 0, false, 0.5, "x").is_err());
        assert!(DominantPosition::new(0, 6, false, 0.5, "x").is_err());
        assert!(DominantPosition::new(0, 0, false, 1.5, "x").is_err());
        assert!(DominantPosition::new(0, 0, false, 0.5, "").is_err());
    }

    #[test]
    fn analysis_clamps_invalid_resonance_values() {
        let mut vector = ResonanceVector72::default();
        vector.values[0] = -0.1;
        assert!(
            ResonanceAnalysis::new("doc", "M2-1-3", vector, extractions(), vec![], None, 1)
                .is_err()
        );
    }

    #[test]
    fn analysis_computes_square_emphasis_on_construction() {
        let mut vector = ResonanceVector72::default();
        // Activate lens 0 (square 0) at full intensity in every position.
        for ascent in [false, true] {
            for position in 0..6u8 {
                let idx = kernel_resonance_index(0, ascent, position).unwrap();
                vector.values[idx] = 1.0;
            }
        }
        let analysis =
            ResonanceAnalysis::new("doc", "M2-1-3", vector, extractions(), vec![], None, 1)
                .unwrap();
        assert!(analysis.square_emphasis[0] > analysis.square_emphasis[1]);
        assert!(analysis.square_emphasis[0] > analysis.square_emphasis[2]);
    }

    #[test]
    fn analysis_serde_round_trips() {
        let mut vector = ResonanceVector72::default();
        vector.values[0] = 0.5;
        let analysis = ResonanceAnalysis::new(
            "doc",
            "M2-1-3",
            vector,
            extractions(),
            vec![DominantPosition::new(0, 0, false, 0.5, "ground").unwrap()],
            Some("novel intuition".into()),
            42,
        )
        .unwrap();
        let json = serde_json::to_string(&analysis).unwrap();
        let restored: ResonanceAnalysis = serde_json::from_str(&json).unwrap();
        assert_eq!(analysis, restored);
    }
}
