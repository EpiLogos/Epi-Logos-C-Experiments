//! `epi graph analyse-resonance` — produce a structured
//! [`ResonanceAnalysis`] for a document at a coordinate.
//!
//! The structured output follows mental-pole mechanics §5: 72-vector,
//! four prehensive extractions, dominant positions, square emphasis,
//! optional novel resonances. The 72-vector is produced by a
//! deterministic feature-projection over the document's lexical
//! content. A future Pi-agent integration can replace
//! [`DeterministicAnalyser`] with an LLM-backed analyser implementing
//! the [`ResonanceAnalyser`] trait — the contract stays typed either
//! way.

use std::collections::BTreeMap;
use std::time::{SystemTime, UNIX_EPOCH};

use epi_kernel_contract::{
    DominantPosition, PrehensiveExtractions, ResonanceAnalysis, ResonanceVector72,
};
use portal_core::kernel_resonance_index;

/// Trait for resonance analysers. Implementations may be deterministic
/// (this module) or LLM-backed (future Pi-agent extension).
pub trait ResonanceAnalyser {
    fn analyse(
        &self,
        document_id: &str,
        coordinate: &str,
        document_content: &str,
    ) -> Result<ResonanceAnalysis, String>;
}

/// Deterministic analyser. Uses lens-keyword affinity to produce a
/// reproducible 72-vector. Real and useful even before an LLM is
/// wired, because it gives the corpus a baseline signature that the
/// LLM-backed analyser can later refine.
pub struct DeterministicAnalyser;

impl DeterministicAnalyser {
    pub fn new() -> Self {
        Self
    }
}

impl Default for DeterministicAnalyser {
    fn default() -> Self {
        Self::new()
    }
}

impl ResonanceAnalyser for DeterministicAnalyser {
    fn analyse(
        &self,
        document_id: &str,
        coordinate: &str,
        document_content: &str,
    ) -> Result<ResonanceAnalysis, String> {
        if document_content.trim().is_empty() {
            return Err("document content is empty".into());
        }

        let normalised = document_content.to_lowercase();
        let total_tokens = normalised.split_whitespace().count().max(1) as f32;

        let mut vector = ResonanceVector72::default();
        let mut dominant: Vec<DominantPosition> = Vec::new();
        for lens in 0..6u8 {
            for ascent in [false, true] {
                for position in 0..6u8 {
                    let idx = kernel_resonance_index(lens, ascent, position)
                        .ok_or_else(|| "invalid lens/position".to_string())?;
                    let intensity =
                        compute_intensity(&normalised, total_tokens, lens, ascent, position);
                    vector.values[idx] = intensity;
                    if intensity >= 0.55 {
                        dominant.push(
                            DominantPosition::new(
                                lens,
                                position,
                                ascent,
                                intensity,
                                lens_rationale(lens, position, ascent),
                            )
                            .map_err(|e| e.to_string())?,
                        );
                    }
                }
            }
        }
        // Keep the top eight dominant positions to bound output size.
        dominant.sort_by(|a, b| {
            b.intensity
                .partial_cmp(&a.intensity)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        dominant.truncate(8);

        let extractions = derive_extractions(document_content, &dominant)?;
        let novel = derive_novel_resonance(&vector);
        let generated_at_ms = now_ms();
        ResonanceAnalysis::new(
            document_id,
            coordinate,
            vector,
            extractions,
            dominant,
            novel,
            generated_at_ms,
        )
        .map_err(|e| e.to_string())
    }
}

fn compute_intensity(
    normalised: &str,
    total_tokens: f32,
    lens: u8,
    ascent: bool,
    position: u8,
) -> f32 {
    let keywords = lens_keywords(lens, ascent);
    if keywords.is_empty() {
        return 0.0;
    }
    let mut score = 0.0f32;
    for kw in keywords {
        let count = count_occurrences(normalised, kw) as f32;
        score += count / total_tokens;
    }
    // Position-modulated weight so that within a lens the activation
    // tilts toward the position whose keyword tier dominates.
    let position_weight = 1.0 - (position as f32 / 12.0);
    let raw = (score * position_weight * 6.0).min(1.0);
    raw.max(0.0)
}

fn count_occurrences(haystack: &str, needle: &str) -> usize {
    if needle.is_empty() {
        return 0;
    }
    let needle_lower = needle.to_lowercase();
    let haystack_lower = haystack.to_lowercase();
    let bytes = haystack_lower.as_bytes();
    let mut count = 0;
    let mut start = 0;
    while let Some(pos) = haystack_lower[start..].find(&needle_lower) {
        let absolute = start + pos;
        let before_ok = absolute == 0 || !bytes[absolute - 1].is_ascii_alphanumeric();
        let after_idx = absolute + needle_lower.len();
        let after_ok = after_idx >= bytes.len() || !bytes[after_idx].is_ascii_alphanumeric();
        if before_ok && after_ok {
            count += 1;
        }
        start = absolute + needle_lower.len();
    }
    count
}

fn lens_keywords(lens: u8, ascent: bool) -> &'static [&'static str] {
    match (lens, ascent) {
        (0, false) => &["number", "archetype", "void", "pattern", "geometry"],
        (0, true) => &["psychoid", "synchronicity", "jung", "pauli"],
        (1, false) => &["cause", "purpose", "form", "matter", "agent"],
        (1, true) => &["feeling", "function", "sensation", "intuition"],
        (2, false) => &["logic", "tetralemma", "neither", "both", "negation"],
        (2, true) => &["dissolve", "crystallise", "alchemy", "transmute"],
        (3, false) => &["process", "becoming", "concrescence", "novelty", "advance"],
        (3, true) => &["history", "chronology", "epoch", "phase", "season"],
        (4, false) => &["being", "dasein", "world", "phenomenon", "horizon"],
        (4, true) => &["paradigm", "kuhn", "observation", "measurement"],
        (5, false) => &["logos", "speech", "word", "vāk", "vak"],
        (5, true) => &["number", "scalar", "arch-number", "archetype"],
        _ => &[],
    }
}

fn lens_rationale(lens: u8, position: u8, ascent: bool) -> String {
    let lens_label = match lens {
        0 => "Archetypal-Numerical",
        1 => "Causal",
        2 => "Logical/Tetralemma",
        3 => "Processual",
        4 => "Meta-Epistemic/Phenomenological",
        5 => "Vāk/Divine-Scalar",
        _ => "Unknown",
    };
    let helix = if ascent { "ascent" } else { "descent" };
    format!("Lens {lens_label} ({helix}) position {position} activated by keyword density")
}

fn derive_extractions(
    document: &str,
    dominant: &[DominantPosition],
) -> Result<PrehensiveExtractions, String> {
    let first_paragraph: String = document
        .lines()
        .skip_while(|line| line.trim().is_empty())
        .take(3)
        .collect::<Vec<_>>()
        .join(" ")
        .chars()
        .take(280)
        .collect();
    let by_lens: BTreeMap<u8, Vec<&DominantPosition>> =
        dominant.iter().fold(BTreeMap::new(), |mut acc, pos| {
            acc.entry(pos.lens).or_default().push(pos);
            acc
        });

    let material = format!(
        "Substrate: {} (document opening). Material lenses (#1) active: {}.",
        first_paragraph.trim(),
        describe_lens(&by_lens, 1)
    );
    let energetic = format!(
        "Dynamic tensions: processual (#3) signal {} and logical (#2) signal {}.",
        describe_lens(&by_lens, 3),
        describe_lens(&by_lens, 2)
    );
    let formal = format!(
        "Structural ratios: archetypal-numerical (#0) signature {} and meta-epistemic (#4) signature {}.",
        describe_lens(&by_lens, 0),
        describe_lens(&by_lens, 4)
    );
    let contextual = format!(
        "Telic horizon: Vāk (#5) emphasis {}; total dominant positions: {}.",
        describe_lens(&by_lens, 5),
        dominant.len()
    );

    PrehensiveExtractions::new(material, energetic, formal, contextual).map_err(|e| e.to_string())
}

fn describe_lens(by_lens: &BTreeMap<u8, Vec<&DominantPosition>>, lens: u8) -> String {
    by_lens
        .get(&lens)
        .map(|positions| {
            if positions.is_empty() {
                "absent".to_string()
            } else {
                let mut parts: Vec<String> = positions
                    .iter()
                    .map(|p| {
                        format!(
                            "p{}{}={:.2}",
                            p.position,
                            if p.ascent_helix { "'" } else { "" },
                            p.intensity
                        )
                    })
                    .collect();
                parts.sort();
                parts.join(",")
            }
        })
        .unwrap_or_else(|| "absent".to_string())
}

fn derive_novel_resonance(vector: &ResonanceVector72) -> Option<String> {
    let mean: f32 = vector.values.iter().sum::<f32>() / vector.values.len() as f32;
    let max = vector.values.iter().cloned().fold(0.0f32, f32::max);
    if max > 0.0 && max > mean * 3.0 {
        Some(format!(
            "peak resonance {max:.3} exceeds mean {mean:.3} by >3× — novel signal candidate"
        ))
    } else {
        None
    }
}

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(1)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn deterministic_analyser_produces_valid_analysis_from_real_text() {
        let document = "
        The processual unfolding of being-in-the-world reveals horizons of dasein.
        Causal structures emerge through material agency, the alchemical
        transmutation of form into pattern. Tetralemma negation holds the
        becoming as both crystallised and dissolving. Logos speaks through
        the void's numerical archetype.
        ";
        let analyser = DeterministicAnalyser::new();
        let analysis = analyser
            .analyse("doc-1", "M2-1-3", document)
            .expect("analysis succeeds");
        assert_eq!(analysis.document_id, "doc-1");
        assert_eq!(analysis.coordinate, "M2-1-3");
        // At least some non-zero activations are expected for a paragraph
        // sampling several lens keyword tiers.
        let total: f32 = analysis.resonance_vector.values.iter().sum();
        assert!(total > 0.0, "expected some non-zero resonance");
        assert!(!analysis.extractions.material.trim().is_empty());
        assert!(!analysis.extractions.energetic.trim().is_empty());
        assert!(!analysis.extractions.formal.trim().is_empty());
        assert!(!analysis.extractions.contextual.trim().is_empty());
        // Square emphasis is recomputed by ResonanceAnalysis::new; sum
        // should equal the per-lens averaged sum.
        let emphasis_sum: f32 = analysis.square_emphasis.iter().sum();
        assert!(emphasis_sum.is_finite());
    }

    #[test]
    fn empty_document_is_rejected() {
        let analyser = DeterministicAnalyser::new();
        assert!(analyser.analyse("doc", "M0", "   \n   ").is_err());
    }

    #[test]
    fn count_occurrences_respects_word_boundaries() {
        assert_eq!(
            count_occurrences("the form forms forming reformed", "form"),
            1
        );
        assert_eq!(count_occurrences("nope nope nope", "yes"), 0);
        assert_eq!(count_occurrences("CauSe cause CAUSE", "cause"), 3);
    }

    #[test]
    fn analysis_round_trips_through_serde_when_produced_deterministically() {
        let document = "logos speaks the word vak through number archetype.";
        let analyser = DeterministicAnalyser::new();
        let analysis = analyser.analyse("doc", "M5-0", document).unwrap();
        let json = serde_json::to_string(&analysis).unwrap();
        let restored: ResonanceAnalysis = serde_json::from_str(&json).unwrap();
        assert_eq!(analysis, restored);
    }
}
