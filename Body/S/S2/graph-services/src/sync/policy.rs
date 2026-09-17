use epi_s2_graph_schema::coordinate_prefix_families;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum PromotionClass {
    CanonicalBimbaSeed,
    BimbaWorldTemplate,
    TechnicalCoordinateDoc,
    CodeProvenanceEvidence,
    EpisodicTemporalTrace,
    ThoughtEpisode,
    ManualReviewRequired,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum PromotionTargetSurface {
    Neo4jCoordinateGraph,
    GraphitiEpisode,
    EvidenceOnly,
    ManualReview,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct PromotionPolicyDecision {
    pub class: PromotionClass,
    pub target_surface: PromotionTargetSurface,
    pub requires_intelligent_properties: bool,
    pub coordinate_property_families: Vec<String>,
    pub leading_property_families: Vec<String>,
    pub reason: String,
}

pub fn classify_promotion_path(path: &str) -> PromotionPolicyDecision {
    let normalized = path.replace('\\', "/");
    if normalized.starts_with("Idea/Empty/Present/") {
        return promotion_policy_decision(
            PromotionClass::EpisodicTemporalTrace,
            PromotionTargetSurface::GraphitiEpisode,
            false,
            &["c", "t"],
            "day/now/session material belongs to Graphiti episodic tracking by default",
        );
    }
    if normalized.starts_with("Idea/Pratibimba/Self/Thought/") {
        return promotion_policy_decision(
            PromotionClass::ThoughtEpisode,
            PromotionTargetSurface::GraphitiEpisode,
            true,
            &["t", "c"],
            "thought artifacts are T/T' episodes unless explicitly promoted",
        );
    }
    if normalized.starts_with("Idea/Bimba/World/") {
        return promotion_policy_decision(
            PromotionClass::BimbaWorldTemplate,
            PromotionTargetSurface::Neo4jCoordinateGraph,
            true,
            &["q", "c"],
            "Bimba World files usually lead with q_* and c_* properties, but PI must reason over the full coordinate schema",
        );
    }
    if normalized.starts_with("Idea/Bimba/Seeds/")
        && (normalized.contains("/Legacy/specs/S/") || normalized.contains("/Legacy/resources/S/"))
    {
        return promotion_policy_decision(
            PromotionClass::TechnicalCoordinateDoc,
            PromotionTargetSurface::Neo4jCoordinateGraph,
            true,
            &["s", "c"],
            "Seed-mirrored S/S' legacy technical docs require PI property reasoning before graph promotion",
        );
    }
    if normalized.starts_with("Idea/Bimba/Seeds/")
        && (normalized.contains("/Legacy/specs/M/") || normalized.contains("/Legacy/resources/M/"))
    {
        return promotion_policy_decision(
            PromotionClass::TechnicalCoordinateDoc,
            PromotionTargetSurface::Neo4jCoordinateGraph,
            true,
            &["m", "c"],
            "Seed-mirrored M/M' legacy technical docs require PI property reasoning before graph promotion",
        );
    }
    if normalized.starts_with("Idea/Bimba/Seeds/") {
        return promotion_policy_decision(
            PromotionClass::CanonicalBimbaSeed,
            PromotionTargetSurface::Neo4jCoordinateGraph,
            false,
            &["c"],
            "Bimba Seeds are canonical coordinate-map source material",
        );
    }
    if normalized.starts_with("Body/S/") {
        return promotion_policy_decision(
            PromotionClass::CodeProvenanceEvidence,
            PromotionTargetSurface::EvidenceOnly,
            false,
            &["s", "c"],
            "repo source files evidence S/S' coordinate implementation rather than becoming canonical nodes",
        );
    }
    if normalized.contains("/S/")
        || normalized.contains("/S'")
        || normalized.starts_with("docs/specs/S/")
        || normalized.starts_with("docs/dev/architecture/")
    {
        return promotion_policy_decision(
            PromotionClass::TechnicalCoordinateDoc,
            PromotionTargetSurface::Neo4jCoordinateGraph,
            true,
            &["s", "c"],
            "S/S' technical docs usually lead with s_* and c_* properties, but PI must reason over the full coordinate schema",
        );
    }
    if normalized.contains("/M'")
        || normalized.contains("M-prime")
        || normalized.contains("M4-prime")
        || normalized.contains("m-prime")
    {
        return promotion_policy_decision(
            PromotionClass::TechnicalCoordinateDoc,
            PromotionTargetSurface::Neo4jCoordinateGraph,
            true,
            &["m", "c"],
            "M' technical docs usually lead with m_* and c_* properties, but PI must reason over the full coordinate schema",
        );
    }

    promotion_policy_decision(
        PromotionClass::ManualReviewRequired,
        PromotionTargetSurface::ManualReview,
        true,
        &["c"],
        "path is outside known promotion surfaces; manual review required",
    )
}

fn promotion_policy_decision(
    class: PromotionClass,
    target_surface: PromotionTargetSurface,
    requires_intelligent_properties: bool,
    leading_property_families: &[&str],
    reason: &str,
) -> PromotionPolicyDecision {
    PromotionPolicyDecision {
        class,
        target_surface,
        requires_intelligent_properties,
        coordinate_property_families: coordinate_prefix_families()
            .iter()
            .map(|family| (*family).to_owned())
            .collect(),
        leading_property_families: leading_property_families
            .iter()
            .map(|family| (*family).to_owned())
            .collect(),
        reason: reason.to_owned(),
    }
}
