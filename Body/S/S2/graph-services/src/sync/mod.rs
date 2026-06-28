mod code_provenance;
mod coordinator;
mod frontmatter_rules;
mod graphiti_episode;
mod intent_types;
mod plan;
mod policy;
mod property_proposals;
mod report;

pub use code_provenance::{plan_code_provenance_properties, CodeProvenanceEvidence};
pub use coordinator::SyncCoordinator;
pub use frontmatter_rules::{
    frontmatter_property_rules, plan_frontmatter_properties, FrontmatterPropertyRule,
    FrontmatterPropertyRuleKind,
};
pub use graphiti_episode::{plan_graphiti_episode, GraphitiEpisodePlan};
pub use intent_types::{
    PromotionFrontmatterEvidence, PromotionLinkEvidence, PromotionNodeIntent,
    PromotionRelationCandidate, S2GraphPromotionIntent, S2GraphPromotionNode,
};
pub use plan::PromotionPlan;
pub use policy::{
    classify_promotion_path, PromotionClass, PromotionPolicyDecision, PromotionTargetSurface,
};
pub use property_proposals::{
    validate_property_proposals, PropertyProposal, PropertySchemaStatus, ValidatedPropertyProposal,
};
pub use report::{GraphPromotionSyncReport, SyncResult};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sync_result_fields() {
        let result = SyncResult {
            coordinate: "M5".into(),
            vault_path: "/test/path.md".into(),
            relationships_created: 3,
        };
        assert_eq!(result.coordinate, "M5");
        assert_eq!(result.relationships_created, 3);
    }

    #[test]
    fn test_invalid_coordinate_rejected() {
        // We can test the validation logic without Neo4j
        let yaml: serde_yaml::Value = serde_yaml::from_str("coordinate: \"INVALID\"").unwrap();
        let coord = yaml.get("coordinate").and_then(|v| v.as_str()).unwrap();
        assert!(!crate::CoordinateArrayParser::parse_one(coord).is_ok());
    }

    #[test]
    fn test_valid_coordinate_accepted() {
        let yaml: serde_yaml::Value = serde_yaml::from_str("coordinate: \"M5\"").unwrap();
        let coord = yaml.get("coordinate").and_then(|v| v.as_str()).unwrap();
        assert!(crate::CoordinateArrayParser::parse_one(coord).is_ok());
    }

    #[test]
    fn promotion_plan_uses_coordinate_property_and_descriptive_labels() {
        let plan = PromotionPlan::from_intent_fixture("S2", "VaultMarkdown").unwrap();

        assert_eq!(plan.identity_property, "coordinate");
        assert!(plan.labels.contains(&"Bimba".to_string()));
        assert!(plan.labels.contains(&"Stack".to_string()));
        assert!(!plan.labels.contains(&"Coordinate".to_string()));
        assert!(!plan.labels.contains(&"VaultArtifact".to_string()));
        assert!(plan.properties.contains_key("coordinate_depth"));
    }

    #[test]
    fn sync_frontmatter_relationship_plans_are_canonical() {
        let yaml: serde_yaml::Value = serde_yaml::from_str(
            r#"
coordinate: "C0/T5"
c_0_source_coordinates:
  - "[[C0]]"
c_3_related_coordinates: "[[C1]]"
"#,
        )
        .unwrap();

        let plans = SyncCoordinator::relationship_plans_from_frontmatter("C0/T5", &yaml).unwrap();

        assert_eq!(plans.len(), 2);
        assert_eq!(plans[0].rel_type, "SOURCES");
        assert_eq!(plans[1].rel_type, "REFERENCES");
        assert!(plans
            .iter()
            .all(|plan| !plan.rel_type.starts_with("POS") && !plan.cypher().contains(":Bimba")));
        assert!(plans.iter().all(|plan| {
            plan.properties
                .get("c_1_relation_family")
                .and_then(Value::as_str)
                == Some("sync")
        }));
    }
}
