use std::collections::BTreeMap;

use epi_s2_graph_schema::{
    label_spec, labels_for_coordinate_node, node_property_spec, property_spec, relationship_spec,
    COORDINATE_PROPERTY, CRYSTALLISATION_STATE_PROPERTY, C_LAYER_PATH_PROPERTY,
    RELATION_FAMILY_INFERRED, RELATION_FAMILY_PROPERTY, RELATION_FAMILY_SYNC,
    REL_CREATED_BY_SYNC_VERSION_PROPERTY, REL_EVIDENCE_KIND_PROPERTY, REL_EVIDENCE_TEXT_PROPERTY,
    SEMANTIC_AUTHORITY_PROPERTY, TYPE_COORDINATE_PROPERTY, TYPE_FAMILY_PROPERTY,
    TYPE_PATH_PROPERTY,
};
use serde_json::Value;

use crate::{CoordinateArrayParser, Neo4jClient, RelationshipManager, RelationshipWritePlan};

use super::code_provenance::{self, CodeProvenanceEvidence};
use super::frontmatter_rules::{self, FrontmatterPropertyRule};
use super::graphiti_episode::{self, GraphitiEpisodePlan};
use super::intent_types::S2GraphPromotionIntent;
use super::plan::{validate_promotion_coordinate, PromotionPlan};
use super::policy::{self, PromotionClass, PromotionPolicyDecision, PromotionTargetSurface};
use super::property_proposals::{
    self, is_pi_agent_authority, PropertyProposal, ValidatedPropertyProposal,
};
use super::report::{GraphPromotionSyncReport, SyncResult};

pub struct SyncCoordinator<'a> {
    client: &'a Neo4jClient,
    rel_manager: RelationshipManager<'a>,
}

impl<'a> SyncCoordinator<'a> {
    pub fn new(client: &'a Neo4jClient) -> Self {
        Self {
            client,
            rel_manager: RelationshipManager::new(client),
        }
    }

    pub fn classify_promotion_path(path: &str) -> PromotionPolicyDecision {
        policy::classify_promotion_path(path)
    }

    pub fn validate_property_proposals(
        class: PromotionClass,
        leading_property_families: &[String],
        proposals: &[PropertyProposal],
    ) -> Result<Vec<ValidatedPropertyProposal>, String> {
        property_proposals::validate_property_proposals(class, leading_property_families, proposals)
    }

    pub fn frontmatter_property_rules() -> &'static [FrontmatterPropertyRule] {
        frontmatter_rules::frontmatter_property_rules()
    }

    pub fn plan_frontmatter_properties(
        frontmatter: serde_yaml::Value,
    ) -> Result<BTreeMap<String, String>, String> {
        frontmatter_rules::plan_frontmatter_properties(frontmatter)
    }

    pub fn plan_code_provenance_properties(
        coordinate: &str,
        evidence: &CodeProvenanceEvidence,
    ) -> Result<BTreeMap<String, Value>, String> {
        code_provenance::plan_code_provenance_properties(coordinate, evidence)
    }

    pub fn plan_graphiti_episode(
        source_path: &str,
        source_coordinate: Option<&str>,
    ) -> Result<GraphitiEpisodePlan, String> {
        graphiti_episode::plan_graphiti_episode(source_path, source_coordinate)
    }

    pub fn validate_promotion_intent(
        intent: &S2GraphPromotionIntent,
    ) -> Result<PromotionPlan, String> {
        let coordinate = intent.node.coordinate.trim();
        if coordinate.is_empty() {
            return Err("canonical coordinate is required for graph promotion".to_owned());
        }
        validate_promotion_coordinate(coordinate)?;
        if intent.node.identity_property != COORDINATE_PROPERTY {
            return Err(format!(
                "graph promotion identity property must be {COORDINATE_PROPERTY}"
            ));
        }

        match intent.node.properties.get(COORDINATE_PROPERTY) {
            Some(Value::String(value)) if value == coordinate => {}
            Some(_) => {
                return Err("node coordinate property must equal canonical coordinate".to_owned())
            }
            None => return Err("node coordinate property is required".to_owned()),
        }

        for key in intent.node.properties.keys() {
            let Some(spec) = node_property_spec(key) else {
                if property_spec(key).is_ok() {
                    return Err(format!("property is not a node property: {key}"));
                }
                return Err(format!("unknown graph node property key: {key}"));
            };
            if spec.compatibility {
                return Err(format!(
                    "compatibility property cannot be canonical node data: {key}"
                ));
            }
        }
        validate_c_first_properties(&intent.node.properties)?;

        let artifact_kind = intent
            .node
            .properties
            .get("artifact_kind")
            .and_then(Value::as_str)
            .unwrap_or("vault_markdown");
        let policy = Self::classify_promotion_path(&intent.node.vault_path);
        if policy.target_surface == PromotionTargetSurface::Neo4jCoordinateGraph
            && policy.requires_intelligent_properties
            && intent.property_proposals.is_empty()
        {
            return Err(format!(
                "{} requires PI-agent property proposals before S2 graph promotion",
                intent.node.vault_path
            ));
        }
        let validated_property_proposals = Self::validate_property_proposals(
            policy.class,
            &policy.leading_property_families,
            &intent.property_proposals,
        )?;
        let mut labels = labels_for_coordinate_node(coordinate, artifact_kind)?;
        for hint in &intent.node.requested_label_hints {
            let Some(spec) = label_spec(hint) else {
                return Err(format!("unregistered graph label hint: {hint}"));
            };
            if spec.compatibility {
                return Err(format!(
                    "compatibility label hint cannot be canonical: {hint}"
                ));
            }
            labels.push(hint.clone());
        }
        labels.sort();
        labels.dedup();

        let mut relationships = Vec::new();
        for evidence in &intent.link_evidence {
            if validate_promotion_coordinate(&evidence.target_text).is_err() {
                continue;
            }
            let plan = RelationshipWritePlan::new(coordinate, &evidence.target_text, "REFERENCES")?
                .with_wikilink_evidence(
                    &evidence.source_path,
                    evidence.source_line as i64,
                    &evidence.raw,
                )
                .with_property("target_text", Value::String(evidence.target_text.clone()))?
                .with_property(
                    REL_CREATED_BY_SYNC_VERSION_PROPERTY,
                    Value::String(intent.sync_version.clone()),
                )?
                .with_property(
                    RELATION_FAMILY_PROPERTY,
                    Value::String(RELATION_FAMILY_SYNC.to_owned()),
                )?;
            plan.validate()?;
            relationships.push(plan);
        }

        let mut relation_inference_errors = Vec::new();
        for candidate in &intent.relation_candidates {
            if candidate.evidence_kind != "llm_inference" {
                relation_inference_errors.push(format!(
                    "relation candidate must be llm_inference evidence: {} -> {}",
                    candidate.source_coordinate, candidate.target_coordinate
                ));
            }
            if !candidate
                .inferred_by
                .as_deref()
                .map(is_pi_agent_authority)
                .unwrap_or(false)
            {
                relation_inference_errors.push(format!(
                    "relation candidate must be inferred by the PI agent: {} -> {}",
                    candidate.source_coordinate, candidate.target_coordinate
                ));
            }
            if candidate
                .prompt_hash
                .as_deref()
                .map(str::trim)
                .unwrap_or_default()
                .is_empty()
            {
                relation_inference_errors.push(format!(
                    "relation candidate prompt_hash is required for PI-agent inference: {} -> {}",
                    candidate.source_coordinate, candidate.target_coordinate
                ));
            }
        }
        if !relation_inference_errors.is_empty() {
            return Err(relation_inference_errors.join("; "));
        }

        for candidate in &intent.relation_candidates {
            validate_promotion_coordinate(&candidate.source_coordinate)?;
            validate_promotion_coordinate(&candidate.target_coordinate)?;
            if candidate.source_coordinate != coordinate {
                return Err(format!(
                    "relation candidate source {} does not match promotion coordinate {coordinate}",
                    candidate.source_coordinate
                ));
            }
            relationship_spec(&candidate.relation_type)?;
            if !(0.0..=1.0).contains(&candidate.confidence) {
                return Err(format!(
                    "relation candidate confidence must be between 0 and 1: {}",
                    candidate.confidence
                ));
            }
            let mut plan = RelationshipWritePlan::new(
                &candidate.source_coordinate,
                &candidate.target_coordinate,
                &candidate.relation_type,
            )?
            .with_property(
                REL_EVIDENCE_KIND_PROPERTY,
                Value::String(candidate.evidence_kind.clone()),
            )?
            .with_property(
                REL_EVIDENCE_TEXT_PROPERTY,
                Value::String(candidate.evidence_text.clone()),
            )?
            .with_property("confidence", serde_json::json!(candidate.confidence))?
            .with_property(
                REL_CREATED_BY_SYNC_VERSION_PROPERTY,
                Value::String(intent.sync_version.clone()),
            )?
            .with_property(
                RELATION_FAMILY_PROPERTY,
                Value::String(RELATION_FAMILY_INFERRED.to_owned()),
            )?;
            if let Some(source_path) = &candidate.source_path {
                plan = plan.with_property("source_path", Value::String(source_path.clone()))?;
            }
            if let Some(source_line) = candidate.source_line {
                plan = plan.with_property(
                    "source_line",
                    Value::Number(serde_json::Number::from(source_line as i64)),
                )?;
            }
            if let Some(target_text) = &candidate.target_text {
                plan = plan.with_property("target_text", Value::String(target_text.clone()))?;
            }
            if let Some(inferred_by) = &candidate.inferred_by {
                plan = plan.with_property("inferred_by", Value::String(inferred_by.clone()))?;
            }
            if let Some(prompt_hash) = &candidate.prompt_hash {
                plan = plan.with_property("prompt_hash", Value::String(prompt_hash.clone()))?;
            }
            plan.validate()?;
            relationships.push(plan);
        }

        let mut properties = intent.node.properties.clone();
        for proposal in validated_property_proposals {
            properties.insert(proposal.key, proposal.value);
        }
        properties.insert(
            "promotion_source".to_owned(),
            Value::String(intent.promotion_source.clone()),
        );
        properties.insert(
            "sync_version".to_owned(),
            Value::String(intent.sync_version.clone()),
        );

        let mut compatibility_migrations = Vec::new();
        if let Some(property) = &intent.compatibility_source_property {
            compatibility_migrations
                .push(format!("converge legacy coordinate property {property}"));
        }

        Ok(PromotionPlan {
            coordinate: coordinate.to_owned(),
            identity_property: COORDINATE_PROPERTY,
            labels,
            properties,
            source_path: intent.node.vault_path.clone(),
            relationships,
            compatibility_migrations,
            sync_version: intent.sync_version.clone(),
            promotion_source: intent.promotion_source.clone(),
        })
    }

    pub async fn promote_intent(
        &self,
        intent: &S2GraphPromotionIntent,
    ) -> Result<GraphPromotionSyncReport, String> {
        let plan = Self::validate_promotion_intent(intent)?;
        let mut txn = self
            .client
            .graph()
            .start_txn()
            .await
            .map_err(|error| format!("promotion transaction start error: {error}"))?;

        if let Err(error) = txn.run(plan.node_upsert_query()?).await {
            let _ = txn.rollback().await;
            return Err(format!("promotion node upsert error: {error}"));
        }
        for relationship in &plan.relationships {
            if let Err(error) = txn.run(relationship.to_query()?).await {
                let _ = txn.rollback().await;
                return Err(format!("promotion relationship upsert error: {error}"));
            }
        }
        txn.commit()
            .await
            .map_err(|error| format!("promotion transaction commit error: {error}"))?;

        let mut report = GraphPromotionSyncReport::planned(&plan);
        report.node_action = "upserted".to_owned();
        Ok(report)
    }

    pub async fn sync_from_vault(
        &self,
        vault_path: &str,
        frontmatter: &serde_yaml::Value,
        _content: &str,
    ) -> Result<SyncResult, String> {
        let coord = frontmatter
            .get("coordinate")
            .and_then(|v| v.as_str())
            .ok_or("no coordinate in frontmatter")?;

        if !crate::CoordinateArrayParser::parse_one(coord).is_ok() {
            return Err(format!("invalid coordinate: {}", coord));
        }

        // Upsert node
        let escaped_path = vault_path.replace('\'', "\\'");
        let cypher = format!(
            "MERGE (n:Bimba {{coordinate: '{}'}}) \
             SET n.s_1_vault_path = '{}', n.c_3_updated_at = datetime() \
             RETURN n.coordinate AS coord",
            coord, escaped_path
        );
        self.client
            .run(&cypher)
            .await
            .map_err(|e| format!("upsert error: {}", e))?;

        // Set additional frontmatter properties. CCT-16 (i)/DR-S1-6: keys
        // survive by SHAPE via the {family}_{n}_{i?}_{semantic} resolver —
        // q_/qm_ (and every codified family) persist verbatim, the DR-M4-4
        // private q-partition is rejected, and an unknown coordinate-key
        // family is a lint ERROR, never a silent drop.
        if let Some(map) = frontmatter.as_mapping() {
            let skip_keys = ["coordinate"];
            for (key, value) in map {
                if let (Some(k), Some(v)) = (key.as_str(), value.as_str()) {
                    if skip_keys.contains(&k) {
                        continue;
                    }
                    use frontmatter_rules::FrontmatterKeyResolution as KeyRes;
                    let target_key = match frontmatter_rules::resolve_frontmatter_key(k) {
                        KeyRes::Alias(alias) => alias.to_owned(),
                        KeyRes::Canonical(canonical) => canonical,
                        KeyRes::RejectedPrivacy | KeyRes::NotCoordinate => continue,
                        KeyRes::UnknownFamily(error) => return Err(error),
                    };
                    let escaped_v = v.replace('\'', "\\'");
                    let set_cypher = format!(
                        "MATCH (n:Bimba {{coordinate: '{}'}}) SET n.`{}` = '{}'",
                        coord, target_key, escaped_v
                    );
                    let _ = self.client.run(&set_cypher).await;
                }
            }
        }

        // Parse coordinate arrays and create relationships
        let arrays = CoordinateArrayParser::parse_frontmatter_arrays(frontmatter);
        let mut rel_count = 0;
        for (key, links) in &arrays {
            let targets: Vec<String> = links.iter().map(|l| l.target.clone()).collect();
            let kv = vec![(key.clone(), targets)];
            rel_count += self.rel_manager.create_from_frontmatter(coord, &kv).await?;
        }

        // CCT-16 (v): a vault→graph sync IS a :Bimba write — bump the
        // revision so the Redis cold-tier namespace flips atomically. A
        // bump failure must be observable, never fatal to the sync itself.
        if let Err(error) = crate::meta::bump_graph_revision(self.client).await {
            eprintln!(
                "[sync] graph_revision bump failed (cold-tier cache may serve stale hits): {error}"
            );
        }

        Ok(SyncResult {
            coordinate: coord.to_string(),
            vault_path: vault_path.to_string(),
            relationships_created: rel_count,
        })
    }

    pub fn relationship_plans_from_frontmatter(
        source_coord: &str,
        frontmatter: &serde_yaml::Value,
    ) -> Result<Vec<RelationshipWritePlan>, String> {
        let arrays = CoordinateArrayParser::parse_frontmatter_arrays(frontmatter);
        let coord_keys = arrays
            .iter()
            .map(|(key, links)| {
                (
                    key.clone(),
                    links.iter().map(|link| link.target.clone()).collect(),
                )
            })
            .collect::<Vec<_>>();
        RelationshipManager::plans_from_frontmatter(source_coord, &coord_keys)
    }
}

fn validate_c_first_properties(properties: &BTreeMap<String, Value>) -> Result<(), String> {
    let Some(type_coordinate) = properties
        .get(TYPE_COORDINATE_PROPERTY)
        .and_then(Value::as_str)
    else {
        return Ok(());
    };

    if !matches!(type_coordinate, "C0" | "C1" | "C2" | "C3" | "C4" | "C5") {
        return Err(format!(
            "type_coordinate must be a direct C-layer coordinate, got {type_coordinate}"
        ));
    }
    match properties.get(TYPE_FAMILY_PROPERTY).and_then(Value::as_str) {
        Some("C") => {}
        Some(other) => {
            return Err(format!(
                "type_family must be C for C-first evidence, got {other}"
            ))
        }
        None => return Err("type_family is required when type_coordinate is present".to_owned()),
    }
    for required in [
        TYPE_PATH_PROPERTY,
        C_LAYER_PATH_PROPERTY,
        SEMANTIC_AUTHORITY_PROPERTY,
        CRYSTALLISATION_STATE_PROPERTY,
    ] {
        if properties
            .get(required)
            .and_then(Value::as_str)
            .map(str::trim)
            .unwrap_or_default()
            .is_empty()
        {
            return Err(format!(
                "{required} is required when type_coordinate is present"
            ));
        }
    }
    Ok(())
}
