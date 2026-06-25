use neo4rs::query;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

use crate::equivalence_classes::{
    equivalence_class_import_plan, in_identity_chain_cypher, m0_identity_chains,
};
use crate::Neo4jClient;

pub const EPI_ONTOLOGY_URI: &str = "https://epi-logos.org/ontology#";
pub const EPI_ONTOLOGY_VERSION_IRI: &str =
    "https://epi-logos.org/ontology/2026-06-01/s2-coordinate-bridge";
pub const EPI_ONTOLOGY_FORMAT: &str = "Turtle";
pub const EPI_ONTOLOGY_TURTLE: &str = include_str!("../../ontology/epi.ttl");
pub const OWL2_RL_PROFILE: &str = "OWL2_RL";
pub const SHACL_REPORTING_MODE: &str = "n10s-validation-or-blocked";

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OntologyImportPlan {
    pub ontology_uri: String,
    pub version_iri: String,
    pub source_format: String,
    pub turtle_sha256: String,
    pub import_cypher: String,
    pub export_cypher: String,
    pub shacl_report_cypher: String,
    pub fact_cypher: String,
    pub anuttara_properties: Vec<OntologyPropertyMapping>,
    pub ananda_vortex_properties: Vec<OntologyPropertyMapping>,
    pub equivalence_class_imports: Vec<(String, String)>,
    pub identity_chain_cypher: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OntologyPropertyMapping {
    pub alias: String,
    pub neo4j_property: String,
    pub ontology_property: String,
    pub disclosure: String,
}

pub fn epi_ontology_sha256() -> String {
    let mut hasher = Sha256::new();
    hasher.update(EPI_ONTOLOGY_TURTLE.as_bytes());
    format!("{:x}", hasher.finalize())
}

pub fn anuttara_property_mappings() -> Vec<OntologyPropertyMapping> {
    vec![
        OntologyPropertyMapping {
            alias: "symbol".to_owned(),
            neo4j_property: "c_1_symbol".to_owned(),
            ontology_property: "epi:hasSymbol".to_owned(),
            disclosure: "public-s2-supplied".to_owned(),
        },
        OntologyPropertyMapping {
            alias: "formulation_type".to_owned(),
            neo4j_property: "c_1_formulation_type".to_owned(),
            ontology_property: "epi:hasFormulationType".to_owned(),
            disclosure: "public-s2-supplied".to_owned(),
        },
        OntologyPropertyMapping {
            alias: "complete_formulation".to_owned(),
            neo4j_property: "c_1_complete_formulation".to_owned(),
            ontology_property: "epi:hasCompleteFormulation".to_owned(),
            disclosure: "public-s2-supplied".to_owned(),
        },
    ]
}

pub fn ananda_vortex_property_mappings() -> Vec<OntologyPropertyMapping> {
    vec![
        OntologyPropertyMapping {
            alias: "ananda_vortex_handle".to_owned(),
            neo4j_property: "m_1_2_ananda_vortex_handle".to_owned(),
            ontology_property: "epi:hasAnandaVortexHandle".to_owned(),
            disclosure: "public-profile-bus-typed-handle".to_owned(),
        },
        OntologyPropertyMapping {
            alias: "ananda_vortex_cell".to_owned(),
            neo4j_property: "m_1_2_ananda_vortex_cell".to_owned(),
            ontology_property: "epi:hasAnandaVortexCell".to_owned(),
            disclosure: "public-profile-bus-typed-handle".to_owned(),
        },
    ]
}

pub fn ontology_import_plan() -> OntologyImportPlan {
    let chains = m0_identity_chains();
    let identity_chain_cypher = in_identity_chain_cypher(&chains).join("\n");
    let equivalence_class_imports = equivalence_class_import_plan();

    OntologyImportPlan {
        ontology_uri: EPI_ONTOLOGY_URI.to_owned(),
        version_iri: EPI_ONTOLOGY_VERSION_IRI.to_owned(),
        source_format: EPI_ONTOLOGY_FORMAT.to_owned(),
        turtle_sha256: epi_ontology_sha256(),
        import_cypher: "CALL n10s.rdf.import.inline($rdf, $format, {handleVocabUris: 'MAP', keepLangTag: false, keepCustomDataTypes: true}) YIELD terminationStatus, triplesLoaded, triplesParsed RETURN terminationStatus, triplesLoaded, triplesParsed".to_owned(),
        export_cypher: "CALL n10s.rdf.export.cypher($cypher, $format, {handleVocabUris: 'MAP'}) YIELD subject, predicate, object, isLiteral, literalType, literalLang RETURN subject, predicate, object, isLiteral, literalType, literalLang".to_owned(),
        shacl_report_cypher: "CALL n10s.validation.shacl.validate() YIELD focusNode, nodeType, severity, resultPath, value, message RETURN focusNode, nodeType, severity, resultPath, value, message".to_owned(),
        fact_cypher: "MERGE (m:GraphMeta {graph_id: $graph_id}) SET m.epi_ontology_uri = $ontology_uri, m.epi_ontology_version_iri = $version_iri, m.epi_ontology_sha256 = $turtle_sha256, m.owl2_rl_profile = $owl2_rl_profile, m.shacl_reporting_mode = $shacl_reporting_mode, m.anuttara_property_contract = $anuttara_property_contract, m.profile_handle_contract = $profile_handle_contract, m.epi_ontology_checked_at = datetime() RETURN m.graph_id AS graph_id, m.epi_ontology_sha256 AS turtle_sha256".to_owned(),
        anuttara_properties: anuttara_property_mappings(),
        ananda_vortex_properties: ananda_vortex_property_mappings(),
        equivalence_class_imports,
        identity_chain_cypher,
    }
}

pub async fn record_ontology_bridge_facts(client: &Neo4jClient) -> Result<(), String> {
    let plan = ontology_import_plan();
    let contract =
        serde_json::to_string(&plan.anuttara_properties).map_err(|err| err.to_string())?;
    let profile_handle_contract =
        serde_json::to_string(&plan.ananda_vortex_properties).map_err(|err| err.to_string())?;
    client
        .run_query(
            query(&plan.fact_cypher)
                .param("graph_id", epi_s2_graph_schema::GRAPH_ID)
                .param("ontology_uri", plan.ontology_uri.as_str())
                .param("version_iri", plan.version_iri.as_str())
                .param("turtle_sha256", plan.turtle_sha256.as_str())
                .param("owl2_rl_profile", OWL2_RL_PROFILE)
                .param("shacl_reporting_mode", SHACL_REPORTING_MODE)
                .param("anuttara_property_contract", contract.as_str())
                .param("profile_handle_contract", profile_handle_contract.as_str()),
        )
        .await
        .map_err(|err| format!("record ontology bridge facts failed: {err}"))?;
    Ok(())
}

pub async fn import_epi_ontology_with_n10s(client: &Neo4jClient) -> Result<(), String> {
    let plan = ontology_import_plan();
    client
        .run_query(
            query(&plan.import_cypher)
                .param("rdf", EPI_ONTOLOGY_TURTLE)
                .param("format", EPI_ONTOLOGY_FORMAT),
        )
        .await
        .map_err(|err| format!("n10s epi ontology import failed: {err}"))?;
    record_ontology_bridge_facts(client).await
}

#[cfg(test)]
#[test]
fn anuttara_property_mappings_round_trip() {
    use std::collections::BTreeMap;

    let mappings = anuttara_property_mappings();
    let encoded = serde_json::to_string(&mappings).expect("serialize property mappings");
    let decoded: Vec<OntologyPropertyMapping> =
        serde_json::from_str(&encoded).expect("deserialize property mappings");

    assert_eq!(decoded, mappings);
    assert_eq!(decoded.len(), 3);

    let by_alias = decoded
        .iter()
        .map(|mapping| (mapping.alias.as_str(), mapping))
        .collect::<BTreeMap<_, _>>();

    assert_eq!(
        by_alias.get("symbol").expect("symbol alias").neo4j_property,
        "c_1_symbol"
    );
    assert_eq!(
        by_alias
            .get("formulation_type")
            .expect("formulation_type alias")
            .neo4j_property,
        "c_1_formulation_type"
    );
    assert_eq!(
        by_alias
            .get("complete_formulation")
            .expect("complete_formulation alias")
            .neo4j_property,
        "c_1_complete_formulation"
    );

    for mapping in by_alias.values() {
        assert!(
            mapping.neo4j_property.starts_with("c_1_"),
            "{} must map to a coordinate-prefixed canonical source property",
            mapping.alias
        );
        assert_ne!(
            mapping.alias, mapping.neo4j_property,
            "{} must remain an alias, not the stored source property",
            mapping.alias
        );
        assert_eq!(mapping.disclosure, "public-s2-supplied");
    }
}
