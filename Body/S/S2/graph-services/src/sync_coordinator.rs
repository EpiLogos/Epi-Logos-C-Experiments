use std::collections::BTreeMap;

use epi_s2_graph_schema::{
    coordinate_prefix_families, coordinate_prefix_family_spec, label_spec,
    labels_for_coordinate_node, node_property_spec, property_spec, relationship_spec,
    validate_coordinate_prefix_property, GraphPropertyType, COORDINATE_PROPERTY,
    M_COMPONENT_PROPERTY, M_REPO_PATH_PROPERTY, M_SYMBOL_REFS_PROPERTY,
    REL_CREATED_BY_SYNC_VERSION_PROPERTY, REL_EVIDENCE_KIND_PROPERTY, REL_EVIDENCE_TEXT_PROPERTY,
    S_COMPONENT_PROPERTY, S_DEPENDS_ON_PATHS_PROPERTY, S_EXECUTION_FLOW_REFS_PROPERTY,
    S_FILE_KIND_PROPERTY, S_OWNED_BY_COORDINATE_PROPERTY, S_REPO_PATH_PROPERTY,
    S_REPO_ROOT_PROPERTY, S_SYMBOL_REFS_PROPERTY,
};
use epi_s3_gateway_contract::{
    GraphitiAdapterContract, GRAPHITI_INVOCATION_OWNER, GRAPHITI_RUNTIME_AUTHORITY,
};
use neo4rs::{query, Query};
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::CoordinateArrayParser;
use crate::Neo4jClient;
use crate::{RelationshipManager, RelationshipWritePlan};

/// Map a bare frontmatter key to its coordinate-driven canonical name.
/// Returns None for unknown keys (caller decides whether to skip).
fn canonical_frontmatter_key(key: &str) -> Option<&'static str> {
    Some(match key {
        "coordinate" => "coordinate",
        "title" => "title",
        "name" => "c_1_name",
        "description" => "c_1_description",
        "form" | "formulation" => "c_1_form",
        "structure" => "c_1_structure",
        "essence" => "c_0_essence",
        "core_nature" | "coreNature" => "c_0_core_nature",
        "family" => "c_4_family",
        "ql_position" => "c_4_ql_position",
        "layer" => "c_4_layer",
        "topo_mode" => "c_4_topo_mode",
        "vault_path" => "s_1_vault_path",
        "source_coordinates" => "c_0_source_coordinates",
        "ct_type" => "c_1_ct_type",
        "artifact_role" => "c_4_artifact_role",
        _ => return None,
    })
}

pub struct SyncResult {
    pub coordinate: String,
    pub vault_path: String,
    pub relationships_created: usize,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct S2GraphPromotionIntent {
    pub node: S2GraphPromotionNode,
    pub link_evidence: Vec<PromotionLinkEvidence>,
    pub frontmatter_evidence: Vec<PromotionFrontmatterEvidence>,
    #[serde(default)]
    pub property_proposals: Vec<PropertyProposal>,
    pub relation_candidates: Vec<PromotionRelationCandidate>,
    pub content_hash: String,
    pub markdown_body_hash: String,
    pub compatibility_source_label: Option<String>,
    pub compatibility_source_property: Option<String>,
    pub compatibility_source_coordinate: Option<String>,
    pub promotion_source: String,
    pub sync_version: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct S2GraphPromotionNode {
    pub coordinate: String,
    pub identity_property: String,
    pub vault_path: String,
    pub requested_label_hints: Vec<String>,
    pub properties: BTreeMap<String, Value>,
}

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

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PropertyProposal {
    pub key: String,
    pub value: Value,
    pub evidence_kind: String,
    pub evidence_text: String,
    pub source_path: Option<String>,
    pub source_line: Option<usize>,
    pub proposed_by: String,
    pub reasoning: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum PropertySchemaStatus {
    Registered,
    CoordinatePrefixDynamic,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ValidatedPropertyProposal {
    pub key: String,
    pub value: Value,
    pub coordinate_family: String,
    pub leading_family_hint: bool,
    pub schema_status: PropertySchemaStatus,
    pub evidence_kind: String,
    pub evidence_text: String,
    pub source_path: Option<String>,
    pub source_line: Option<usize>,
    pub proposed_by: String,
    pub reasoning: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum FrontmatterPropertyRuleKind {
    Identity,
    SemanticProperty,
    RelationAndProperty,
    CompatibilityIgnored,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct FrontmatterPropertyRule {
    pub frontmatter_key: &'static str,
    pub canonical_property: &'static str,
    pub kind: FrontmatterPropertyRuleKind,
    pub agent_guidance: &'static str,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct CodeProvenanceEvidence {
    pub repo_path: String,
    pub repo_root: String,
    pub file_kind: String,
    pub component: String,
    pub symbol_refs: Vec<String>,
    pub execution_flow_refs: Vec<String>,
    pub depends_on_paths: Vec<String>,
    pub owned_by_coordinate: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct GraphitiEpisodePlan {
    pub class: PromotionClass,
    pub target_surface: String,
    pub runtime_authority: String,
    pub invocation_owner: String,
    pub gateway_method: String,
    pub adapter_required_capabilities: Vec<String>,
    pub source_path: String,
    pub source_coordinate: Option<String>,
    pub episode_kind: String,
    pub creates_neo4j_coordinate_node: bool,
    pub reason: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PromotionNodeIntent {
    pub coordinate: String,
    pub identity_property: String,
    pub vault_path: String,
}

impl From<S2GraphPromotionNode> for PromotionNodeIntent {
    fn from(node: S2GraphPromotionNode) -> Self {
        Self {
            coordinate: node.coordinate,
            identity_property: node.identity_property,
            vault_path: node.vault_path,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct PromotionLinkEvidence {
    pub raw: String,
    pub target_text: String,
    pub alias: Option<String>,
    pub source_path: String,
    pub source_line: usize,
    pub source_column: usize,
    pub context: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct PromotionFrontmatterEvidence {
    pub key: String,
    pub value: String,
    pub evidence_kind: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PromotionRelationCandidate {
    pub source_coordinate: String,
    pub target_coordinate: String,
    pub relation_type: String,
    pub confidence: f64,
    pub evidence_kind: String,
    pub evidence_text: String,
    pub source_path: Option<String>,
    pub source_line: Option<usize>,
    pub target_text: Option<String>,
    pub inferred_by: Option<String>,
    pub prompt_hash: Option<String>,
}

#[derive(Clone, Debug, PartialEq)]
pub struct PromotionPlan {
    pub coordinate: String,
    pub identity_property: &'static str,
    pub labels: Vec<String>,
    pub properties: BTreeMap<String, Value>,
    pub source_path: String,
    pub relationships: Vec<RelationshipWritePlan>,
    pub compatibility_migrations: Vec<String>,
    pub sync_version: String,
    pub promotion_source: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct GraphPromotionSyncReport {
    pub source_path: String,
    pub coordinate: String,
    pub node_action: String,
    pub relation_actions: Vec<String>,
    pub compatibility_migrations: Vec<String>,
    pub validation_errors: Vec<String>,
    pub sync_version: String,
}

impl GraphPromotionSyncReport {
    pub fn planned(plan: &PromotionPlan) -> Self {
        Self {
            source_path: plan.source_path.clone(),
            coordinate: plan.coordinate.clone(),
            node_action: "planned_upsert".to_owned(),
            relation_actions: plan
                .relationships
                .iter()
                .map(|relationship| relationship.rel_type.clone())
                .collect(),
            compatibility_migrations: plan.compatibility_migrations.clone(),
            validation_errors: Vec::new(),
            sync_version: plan.sync_version.clone(),
        }
    }
}

impl PromotionPlan {
    pub fn new(
        coordinate: impl Into<String>,
        artifact_kind: impl AsRef<str>,
    ) -> Result<Self, String> {
        let coordinate = coordinate.into();
        if !crate::CoordinateArrayParser::parse_one(&coordinate).is_ok()
            && !coordinate
                .split('/')
                .all(|part| crate::CoordinateArrayParser::parse_one(part).is_ok())
        {
            return Err(format!("invalid graph promotion coordinate: {coordinate}"));
        }

        let labels = labels_for_coordinate_node(&coordinate, artifact_kind.as_ref())?;
        let mut properties = BTreeMap::new();
        properties.insert("coordinate".to_owned(), Value::String(coordinate.clone()));
        properties.insert(
            "coordinate_depth".to_owned(),
            Value::Number(serde_json::Number::from(
                coordinate
                    .split('/')
                    .filter(|part| !part.is_empty())
                    .count() as i64,
            )),
        );
        if let Some(prefix) = coordinate.split('/').next().filter(|part| !part.is_empty()) {
            properties.insert(
                "coordinate_prefix".to_owned(),
                Value::String(prefix.to_owned()),
            );
        }
        properties.insert(
            "artifact_kind".to_owned(),
            Value::String(artifact_kind.as_ref().to_owned()),
        );

        Ok(Self {
            coordinate,
            identity_property: COORDINATE_PROPERTY,
            labels,
            properties,
            source_path: String::new(),
            relationships: Vec::new(),
            compatibility_migrations: Vec::new(),
            sync_version: "s2-promotion-plan-v1".to_owned(),
            promotion_source: "graph-services".to_owned(),
        })
    }

    pub fn from_intent_fixture(coordinate: &str, artifact_kind: &str) -> Result<Self, String> {
        Self::new(coordinate, artifact_kind)
    }

    /// Absorb a `portal_core::VakAddress` into the plan's properties map under
    /// the canonical VAK prefix keys (`cpf`, `ct`, `cp`, `cf`, `cfp`,
    /// `cs_code`, `cs_direction`). Sophia-promoted artifacts inherit their
    /// producing VAK address this way.
    ///
    /// Leans on the serde `rename` markers on [`portal_core::CpfState`] and
    /// [`portal_core::CsDirection`] so the canonical wire literals — `(00/00)`,
    /// `(4.0/1-4.4/5)`, `Night'` — survive round-trip into the property map.
    pub fn attach_vak_address(&mut self, vak: &portal_core::VakAddress) {
        if let Ok(value) = serde_json::to_value(&vak.cpf) {
            self.properties.insert("cpf".to_owned(), value);
        }
        self.properties
            .insert("ct".to_owned(), serde_json::json!(vak.ct));
        self.properties
            .insert("cp".to_owned(), Value::String(vak.cp.clone()));
        self.properties
            .insert("cf".to_owned(), Value::String(vak.cf.clone()));
        self.properties
            .insert("cfp".to_owned(), Value::String(vak.cfp.clone()));
        self.properties
            .insert("cs_code".to_owned(), Value::String(vak.cs.code.clone()));
        if let Ok(value) = serde_json::to_value(&vak.cs.direction) {
            self.properties.insert("cs_direction".to_owned(), value);
        }
    }

    pub fn node_upsert_cypher(&self) -> String {
        let label_clause = if self.labels.is_empty() {
            String::new()
        } else {
            format!(
                " SET n:{}",
                self.labels
                    .iter()
                    .map(String::as_str)
                    .collect::<Vec<_>>()
                    .join(":")
            )
        };
        let property_clause = self
            .properties
            .keys()
            .map(|key| format!("n.{key} = ${}", node_property_param_name(key)))
            .collect::<Vec<_>>();
        let property_clause = if property_clause.is_empty() {
            String::new()
        } else {
            format!(" SET {}", property_clause.join(", "))
        };

        format!(
            "MERGE (n {{coordinate: $coordinate}}){label_clause}{property_clause} \
             REMOVE n:Coordinate REMOVE n:VaultArtifact \
             REMOVE n:BimbaNode REMOVE n:BimbaCoordinate \
             REMOVE n.bimbaCoordinate REMOVE n.bimba_coordinate \
             RETURN n.coordinate AS coordinate"
        )
    }

    pub fn node_upsert_query(&self) -> Result<Query, String> {
        let mut q = query(&self.node_upsert_cypher()).param("coordinate", self.coordinate.clone());
        for (key, value) in &self.properties {
            q = bind_json_param(q, &node_property_param_name(key), value)?;
        }
        Ok(q)
    }
}

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

    pub fn validate_property_proposals(
        _class: PromotionClass,
        leading_property_families: &[String],
        proposals: &[PropertyProposal],
    ) -> Result<Vec<ValidatedPropertyProposal>, String> {
        let mut errors = Vec::new();
        let mut validated = Vec::new();

        for proposal in proposals {
            if proposal.key.trim().is_empty() {
                errors.push("property proposal key is required".to_owned());
                continue;
            }
            if proposal.evidence_kind.trim().is_empty() {
                errors.push(format!("{} missing evidence_kind", proposal.key));
            }
            if proposal.evidence_text.trim().is_empty() {
                errors.push(format!("{} missing evidence_text", proposal.key));
            }
            if proposal.proposed_by.trim().is_empty() {
                errors.push(format!("{} missing proposed_by", proposal.key));
            } else if !is_pi_agent_authority(&proposal.proposed_by) {
                errors.push(format!(
                    "{} proposed_by must be a PI-agent authority, got {}",
                    proposal.key, proposal.proposed_by
                ));
            }
            if proposal
                .reasoning
                .as_deref()
                .map(str::trim)
                .unwrap_or_default()
                .is_empty()
            {
                errors.push(format!("{} missing PI-agent reasoning", proposal.key));
            }

            let (schema_status, expected_type) = match node_property_spec(&proposal.key)
                .map(|spec| spec.value_type)
            {
                Some(value_type) => (PropertySchemaStatus::Registered, Some(value_type)),
                None if validate_coordinate_prefix_property(&proposal.key).is_ok() => {
                    (PropertySchemaStatus::CoordinatePrefixDynamic, None)
                }
                None => {
                    errors.push(format!(
                            "{} is not a registered or canonical coordinate-prefix property; use i for prime/inversion properties",
                            proposal.key
                        ));
                    continue;
                }
            };

            if let Some(expected_type) = expected_type {
                if let Err(error) =
                    validate_property_value_type(&proposal.key, &proposal.value, expected_type)
                {
                    errors.push(error);
                }
            } else if proposal.value.is_null() {
                errors.push(format!("{} value cannot be null", proposal.key));
            }

            let family = proposal
                .key
                .split('_')
                .next()
                .filter(|family| coordinate_prefix_family_spec(family).is_some())
                .unwrap_or("c")
                .to_owned();
            let leading_family_hint = leading_property_families
                .iter()
                .any(|leading| leading == &family);

            validated.push(ValidatedPropertyProposal {
                key: proposal.key.clone(),
                value: proposal.value.clone(),
                coordinate_family: family,
                leading_family_hint,
                schema_status,
                evidence_kind: proposal.evidence_kind.clone(),
                evidence_text: proposal.evidence_text.clone(),
                source_path: proposal.source_path.clone(),
                source_line: proposal.source_line,
                proposed_by: proposal.proposed_by.clone(),
                reasoning: proposal.reasoning.clone(),
            });
        }

        if errors.is_empty() {
            Ok(validated)
        } else {
            Err(errors.join("; "))
        }
    }

    pub fn frontmatter_property_rules() -> &'static [FrontmatterPropertyRule] {
        &FRONTMATTER_PROPERTY_RULES
    }

    pub fn plan_frontmatter_properties(
        frontmatter: serde_yaml::Value,
    ) -> Result<BTreeMap<String, String>, String> {
        let Some(map) = frontmatter.as_mapping() else {
            return Err("frontmatter must be a YAML mapping".to_owned());
        };
        let mut properties = BTreeMap::new();
        for (key, value) in map {
            let Some(raw_key) = key.as_str() else {
                continue;
            };
            let Some(canonical) = canonical_frontmatter_key(raw_key) else {
                continue;
            };
            if raw_key == "bimbaCoordinate" || raw_key == "bimba_coordinate" {
                continue;
            }
            if let Some(value) = yaml_scalar_or_first_sequence_value(value) {
                properties.insert(canonical.to_owned(), value);
            }
        }
        Ok(properties)
    }

    pub fn plan_code_provenance_properties(
        coordinate: &str,
        evidence: &CodeProvenanceEvidence,
    ) -> Result<BTreeMap<String, Value>, String> {
        validate_promotion_coordinate(coordinate)?;
        if evidence.owned_by_coordinate != coordinate {
            return Err(format!(
                "code provenance owner {} does not match coordinate {coordinate}",
                evidence.owned_by_coordinate
            ));
        }

        let mut properties = BTreeMap::new();
        if coordinate.starts_with('M') {
            properties.insert(
                M_REPO_PATH_PROPERTY.to_owned(),
                Value::String(evidence.repo_path.clone()),
            );
            properties.insert(
                M_COMPONENT_PROPERTY.to_owned(),
                Value::String(evidence.component.clone()),
            );
            properties.insert(
                M_SYMBOL_REFS_PROPERTY.to_owned(),
                Value::Array(
                    evidence
                        .symbol_refs
                        .iter()
                        .cloned()
                        .map(Value::String)
                        .collect(),
                ),
            );
        } else {
            properties.insert(
                S_REPO_PATH_PROPERTY.to_owned(),
                Value::String(evidence.repo_path.clone()),
            );
            properties.insert(
                S_REPO_ROOT_PROPERTY.to_owned(),
                Value::String(evidence.repo_root.clone()),
            );
            properties.insert(
                S_FILE_KIND_PROPERTY.to_owned(),
                Value::String(evidence.file_kind.clone()),
            );
            properties.insert(
                S_COMPONENT_PROPERTY.to_owned(),
                Value::String(evidence.component.clone()),
            );
            properties.insert(
                S_SYMBOL_REFS_PROPERTY.to_owned(),
                Value::Array(
                    evidence
                        .symbol_refs
                        .iter()
                        .cloned()
                        .map(Value::String)
                        .collect(),
                ),
            );
            properties.insert(
                S_EXECUTION_FLOW_REFS_PROPERTY.to_owned(),
                Value::Array(
                    evidence
                        .execution_flow_refs
                        .iter()
                        .cloned()
                        .map(Value::String)
                        .collect(),
                ),
            );
            properties.insert(
                S_DEPENDS_ON_PATHS_PROPERTY.to_owned(),
                Value::Array(
                    evidence
                        .depends_on_paths
                        .iter()
                        .cloned()
                        .map(Value::String)
                        .collect(),
                ),
            );
            properties.insert(
                S_OWNED_BY_COORDINATE_PROPERTY.to_owned(),
                Value::String(evidence.owned_by_coordinate.clone()),
            );
        }
        Ok(properties)
    }

    pub fn plan_graphiti_episode(
        source_path: &str,
        source_coordinate: Option<&str>,
    ) -> Result<GraphitiEpisodePlan, String> {
        let decision = Self::classify_promotion_path(source_path);
        let episode_kind = match decision.class {
            PromotionClass::EpisodicTemporalTrace => "day_now_temporal_episode",
            PromotionClass::ThoughtEpisode => "thought_episode",
            _ => return Err(format!("{source_path} does not route to Graphiti")),
        };
        let adapter = GraphitiAdapterContract::native_library();

        Ok(GraphitiEpisodePlan {
            class: decision.class,
            target_surface: "graphiti_episode".to_owned(),
            runtime_authority: GRAPHITI_RUNTIME_AUTHORITY.to_owned(),
            invocation_owner: GRAPHITI_INVOCATION_OWNER.to_owned(),
            gateway_method: "s5.episodic.deposit".to_owned(),
            adapter_required_capabilities: adapter
                .required_capabilities
                .iter()
                .map(|capability| (*capability).to_owned())
                .collect(),
            source_path: source_path.to_owned(),
            source_coordinate: source_coordinate.map(str::to_owned),
            episode_kind: episode_kind.to_owned(),
            creates_neo4j_coordinate_node: false,
            reason: decision.reason,
        })
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

        // Set additional frontmatter properties, remapping bare keys to their
        // coordinate-driven canonical names.
        if let Some(map) = frontmatter.as_mapping() {
            let skip_keys = ["coordinate"];
            for (key, value) in map {
                if let (Some(k), Some(v)) = (key.as_str(), value.as_str()) {
                    if skip_keys.contains(&k) {
                        continue;
                    }
                    let canonical = canonical_frontmatter_key(k);
                    // Only persist keys we've explicitly mapped or that already follow the prefix.
                    let target_key = match canonical {
                        Some(canonical) => canonical,
                        None if k.starts_with("c_") || k.starts_with("s_") => k,
                        None => continue,
                    };
                    let escaped_v = v.replace('\'', "\\'");
                    let set_cypher = format!(
                        "MATCH (n:Bimba {{coordinate: '{}'}}) SET n.{} = '{}'",
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

fn validate_promotion_coordinate(coordinate: &str) -> Result<(), String> {
    if coordinate.trim().is_empty() {
        return Err("canonical coordinate is required for graph promotion".to_owned());
    }
    if crate::CoordinateArrayParser::parse_one(coordinate).is_ok()
        || coordinate
            .split('/')
            .all(|part| !part.is_empty() && crate::CoordinateArrayParser::parse_one(part).is_ok())
    {
        Ok(())
    } else {
        Err(format!("invalid graph promotion coordinate: {coordinate}"))
    }
}

fn is_pi_agent_authority(authority: &str) -> bool {
    let normalized = authority.trim().to_ascii_lowercase();
    normalized == "pi"
        || normalized == "pi_agent"
        || normalized.starts_with("pi:")
        || normalized.starts_with("pi_agent:")
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

const FRONTMATTER_PROPERTY_RULES: [FrontmatterPropertyRule; 13] = [
    FrontmatterPropertyRule {
        frontmatter_key: "coordinate",
        canonical_property: "coordinate",
        kind: FrontmatterPropertyRuleKind::Identity,
        agent_guidance: "Canonical node identity. Agents must not infer a replacement coordinate from aliases or legacy fields.",
    },
    FrontmatterPropertyRule {
        frontmatter_key: "title",
        canonical_property: "title",
        kind: FrontmatterPropertyRuleKind::SemanticProperty,
        agent_guidance: "Human-facing artifact title; useful for retrieval but not coordinate identity.",
    },
    FrontmatterPropertyRule {
        frontmatter_key: "name",
        canonical_property: "c_1_name",
        kind: FrontmatterPropertyRuleKind::SemanticProperty,
        agent_guidance: "Canonical C1 naming surface when the content names the coordinate or artifact.",
    },
    FrontmatterPropertyRule {
        frontmatter_key: "description",
        canonical_property: "c_1_description",
        kind: FrontmatterPropertyRuleKind::SemanticProperty,
        agent_guidance: "C1 descriptive formulation; agents should refine from content if frontmatter is thin.",
    },
    FrontmatterPropertyRule {
        frontmatter_key: "essence",
        canonical_property: "c_0_essence",
        kind: FrontmatterPropertyRuleKind::SemanticProperty,
        agent_guidance: "C0 essence statement; should be short and evidence-backed.",
    },
    FrontmatterPropertyRule {
        frontmatter_key: "core_nature",
        canonical_property: "c_0_core_nature",
        kind: FrontmatterPropertyRuleKind::SemanticProperty,
        agent_guidance: "C0 core nature statement, not a free-form summary dump.",
    },
    FrontmatterPropertyRule {
        frontmatter_key: "source_coordinates",
        canonical_property: "c_0_source_coordinates",
        kind: FrontmatterPropertyRuleKind::RelationAndProperty,
        agent_guidance: "Stores source coordinate references and also drives relationship evidence; agents should inspect wikilink context before adding typed relations.",
    },
    FrontmatterPropertyRule {
        frontmatter_key: "ct_type",
        canonical_property: "c_1_ct_type",
        kind: FrontmatterPropertyRuleKind::SemanticProperty,
        agent_guidance: "Protocol/type declaration for S/S' artifacts.",
    },
    FrontmatterPropertyRule {
        frontmatter_key: "artifact_role",
        canonical_property: "c_4_artifact_role",
        kind: FrontmatterPropertyRuleKind::SemanticProperty,
        agent_guidance: "Operational role in the graph/vault workflow.",
    },
    FrontmatterPropertyRule {
        frontmatter_key: "family",
        canonical_property: "c_4_family",
        kind: FrontmatterPropertyRuleKind::SemanticProperty,
        agent_guidance: "Coordinate family; agents should keep this consistent with the coordinate parser.",
    },
    FrontmatterPropertyRule {
        frontmatter_key: "ql_position",
        canonical_property: "c_4_ql_position",
        kind: FrontmatterPropertyRuleKind::SemanticProperty,
        agent_guidance: "QL position as an integer-like semantic slot.",
    },
    FrontmatterPropertyRule {
        frontmatter_key: "vault_path",
        canonical_property: "s_1_vault_path",
        kind: FrontmatterPropertyRuleKind::SemanticProperty,
        agent_guidance: "S1 vault residency path; does not replace source_path evidence.",
    },
    FrontmatterPropertyRule {
        frontmatter_key: "bimbaCoordinate",
        canonical_property: "coordinate",
        kind: FrontmatterPropertyRuleKind::CompatibilityIgnored,
        agent_guidance: "Legacy compatibility only. Agents must use coordinate as canonical identity.",
    },
];

fn yaml_scalar_or_first_sequence_value(value: &serde_yaml::Value) -> Option<String> {
    if let Some(value) = value.as_str() {
        return Some(value.to_owned());
    }
    if let Some(value) = value.as_i64() {
        return Some(value.to_string());
    }
    if let Some(value) = value.as_bool() {
        return Some(value.to_string());
    }
    value
        .as_sequence()
        .and_then(|items| items.first())
        .and_then(yaml_scalar_or_first_sequence_value)
}

fn validate_property_value_type(
    key: &str,
    value: &Value,
    expected_type: GraphPropertyType,
) -> Result<(), String> {
    let ok = match expected_type {
        GraphPropertyType::String | GraphPropertyType::DateTime | GraphPropertyType::JsonString => {
            value.is_string()
        }
        GraphPropertyType::StringList => value
            .as_array()
            .map(|items| items.iter().all(Value::is_string))
            .unwrap_or(false),
        GraphPropertyType::Embedding => value
            .as_array()
            .map(|items| items.iter().all(|item| item.as_f64().is_some()))
            .unwrap_or(false),
        GraphPropertyType::Integer => value.as_i64().is_some() || value.as_u64().is_some(),
        GraphPropertyType::Float => value.as_f64().is_some(),
        GraphPropertyType::Boolean => value.is_boolean(),
    };
    if ok {
        Ok(())
    } else {
        Err(format!(
            "{key} expected {} value",
            graph_property_type_name(expected_type)
        ))
    }
}

fn graph_property_type_name(value_type: GraphPropertyType) -> &'static str {
    match value_type {
        GraphPropertyType::String => "string",
        GraphPropertyType::StringList => "string list",
        GraphPropertyType::Integer => "integer",
        GraphPropertyType::Float => "float",
        GraphPropertyType::Boolean => "boolean",
        GraphPropertyType::DateTime => "datetime string",
        GraphPropertyType::JsonString => "json string",
        GraphPropertyType::Embedding => "embedding",
    }
}

fn node_property_param_name(key: &str) -> String {
    format!("node_{}", key)
}

fn bind_json_param(q: Query, param: &str, value: &Value) -> Result<Query, String> {
    Ok(match value {
        Value::String(value) => q.param(param, value.clone()),
        Value::Number(value) if value.is_i64() => q.param(param, value.as_i64().unwrap()),
        Value::Number(value) if value.is_u64() => {
            let value = i64::try_from(value.as_u64().unwrap())
                .map_err(|_| format!("node property {param} exceeds i64"))?;
            q.param(param, value)
        }
        Value::Number(value) if value.is_f64() => q.param(param, value.as_f64().unwrap()),
        Value::Bool(value) => q.param(param, *value),
        other => {
            let serialized = serde_json::to_string(other).map_err(|error| {
                format!("node property serialization error for {param}: {error}")
            })?;
            q.param(param, serialized)
        }
    })
}

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
    }
}
