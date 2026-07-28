//! dataset_import::property_mapping — source-key → canonical-property mapping.
//!
//! The reviewed maps that promote raw dataset `filteredProps` / `relProperties`
//! keys into canonical `c_/p_/l_/s_/t_/q_/m_` coordinate-family properties, the
//! asset-field lifting, the string-list whitelist, the relationship-type
//! sanitizer, the relation-family classifier, and the coordinate-layer string.
//! Split out of the former `dataset_import.rs` per S2-ARCHITECTURE.md §5.7
//! (finding 7).

use super::cypher::{cypher_literal, escape_cypher};
use super::json_utils::{coordinate_from_node, nested_filtered_property};
use crate::coordinate::{convert_hash_to_m_family, CoordLayer};
use epi_s2_graph_schema::relation_family_for_relationship_type;
use serde_json::Value;

pub(super) const STRING_LIST_TARGETS: &[&str] = &[
    "c_1_asset_uri",
    "c_4_ql_operator_types",
    "c_5_resonances",
    "l_2_therapeutic_properties",
    "s_5_tool_affinity",
];

/// The node-kind tag, or `None` where the kind adds nothing.
///
/// `CoordLayer::Family` — an ordinary coordinate — returns `None`. Saying
/// "COORDINATE" about a node in the coordinate graph is a tautology, and the
/// labels already carry the real typology. Every other variant genuinely
/// discriminates a scaffold node kind, so those are still written.
pub(super) fn layer_string(layer: &CoordLayer) -> Option<&'static str> {
    match layer {
        CoordLayer::Psychoid => Some("PSYCHOID"),
        CoordLayer::Family => None,
        CoordLayer::FamilyRoot => Some("FAMILY_ROOT"),
        CoordLayer::Lens => Some("LENS"),
        CoordLayer::ContextFrame => Some("CONTEXT_FRAME"),
        CoordLayer::Vak => Some("VAK"),
        CoordLayer::Weave => Some("WEAVE"),
    }
}

pub(super) fn append_deep_prefixed_filtered_props(
    node: &Value,
    parsed: Option<&crate::coordinate::ParsedCoordinate>,
    set_parts: &mut Vec<String>,
) {
    let Some(props) = node
        .get("filteredProps")
        .and_then(|value| value.as_object())
    else {
        return;
    };

    append_asset_field_mapping(props, set_parts);

    for (source_key, value) in props {
        if is_deep_coordinate_source_key(source_key) {
            continue;
        }
        let Some(target_key) = canonical_deep_property_key(source_key, node, parsed) else {
            continue;
        };
        if target_already_set(set_parts, &target_key) {
            continue;
        }
        let Some(literal) = cypher_literal(value, &target_key) else {
            continue;
        };
        set_parts.push(format!("n.{target_key} = {literal}"));
    }
}

fn append_asset_field_mapping(props: &serde_json::Map<String, Value>, set_parts: &mut Vec<String>) {
    if !target_already_set(set_parts, "c_1_asset_uri") {
        let asset_uris = asset_uri_values(props);
        if !asset_uris.is_empty() {
            let literal = asset_uris
                .iter()
                .map(|uri| format!("'{}'", escape_cypher(uri)))
                .collect::<Vec<_>>()
                .join(", ");
            set_parts.push(format!("n.c_1_asset_uri = [{literal}]"));
        }
    }

    if target_already_set(set_parts, "c_1_asset_kind") {
        return;
    }
    if let Some(kind) = asset_kind_value(props) {
        set_parts.push(format!("n.c_1_asset_kind = '{}'", escape_cypher(&kind)));
    }
}

fn asset_uri_values(props: &serde_json::Map<String, Value>) -> Vec<String> {
    let mut values = Vec::new();
    for (key, _) in ASSET_URI_FIELD_KEYS {
        let Some(raw) = props.get(*key) else {
            continue;
        };
        push_asset_uri_values(raw, &mut values);
    }
    values
}

fn push_asset_uri_values(raw: &Value, values: &mut Vec<String>) {
    match raw {
        Value::String(value) => {
            for item in value
                .split(',')
                .map(str::trim)
                .filter(|item| !item.is_empty())
            {
                push_unique_asset_uri(item, values);
            }
        }
        Value::Array(items) => {
            for item in items {
                push_asset_uri_values(item, values);
            }
        }
        Value::Null | Value::Bool(_) | Value::Number(_) | Value::Object(_) => {}
    }
}

fn push_unique_asset_uri(uri: &str, values: &mut Vec<String>) {
    if values.iter().any(|value| value == uri) {
        return;
    }
    values.push(uri.to_string());
}

fn asset_kind_value(props: &serde_json::Map<String, Value>) -> Option<String> {
    for key in [
        "c_1_asset_kind",
        "assetKind",
        "asset_kind",
        "assetType",
        "asset_type",
    ] {
        if let Some(kind) = props
            .get(key)
            .and_then(Value::as_str)
            .map(str::trim)
            .filter(|kind| !kind.is_empty())
        {
            return Some(kind.to_string());
        }
    }

    ASSET_URI_FIELD_KEYS.iter().find_map(|(key, source_kind)| {
        if props.contains_key(*key) {
            source_kind.map(str::to_string)
        } else {
            None
        }
    })
}

const ASSET_URI_FIELD_KEYS: &[(&str, Option<&str>)] = &[
    ("c_1_asset_uri", None),
    ("asset_uri", Some("image")),
    ("assetUri", Some("image")),
    ("assetURI", Some("image")),
    ("assetUris", Some("image")),
    ("asset_uris", Some("image")),
    ("asset", Some("image")),
    ("image", Some("image")),
    ("imageUri", Some("image")),
    ("imageURI", Some("image")),
    ("image_uri", Some("image")),
    ("imageUrl", Some("image")),
    ("imageURL", Some("image")),
    ("seal", Some("seal")),
    ("sealUri", Some("seal")),
    ("sealURI", Some("seal")),
    ("seal_uri", Some("seal")),
    ("sealUrl", Some("seal")),
    ("sealURL", Some("seal")),
    ("sigil", Some("sigil")),
    ("sigilUri", Some("sigil")),
    ("sigilURI", Some("sigil")),
    ("sigil_uri", Some("sigil")),
    ("sigilUrl", Some("sigil")),
    ("sigilURL", Some("sigil")),
    ("glyph", Some("glyph")),
    ("glyphUri", Some("glyph")),
    ("glyphURI", Some("glyph")),
    ("glyph_uri", Some("glyph")),
    ("glyphUrl", Some("glyph")),
    ("glyphURL", Some("glyph")),
];

#[cfg(test)]
pub(super) fn mapped_filtered_props_for_test(
    node: &Value,
    parsed: Option<&crate::coordinate::ParsedCoordinate>,
) -> Vec<String> {
    let mut set_parts = Vec::new();
    append_deep_prefixed_filtered_props(node, parsed, &mut set_parts);
    set_parts
}

fn is_deep_coordinate_source_key(source_key: &str) -> bool {
    matches!(source_key, "coordinate" | "bimbaCoordinate")
}

fn target_already_set(set_parts: &[String], target_key: &str) -> bool {
    let prefix = format!("n.{target_key} ");
    set_parts.iter().any(|part| part.starts_with(&prefix))
}

fn canonical_deep_property_key(
    source_key: &str,
    node: &Value,
    parsed: Option<&crate::coordinate::ParsedCoordinate>,
) -> Option<String> {
    explicit_deep_property_key(source_key)
        .and_then(|target| canonicalize_prime_surface_property(&target, node))
        .or_else(|| {
            let semantic = deep_property_semantic(source_key)?;
            source_key.starts_with("q_").then(|| {
                canonical_q_import_property_key(
                    &semantic,
                    u8::try_from(node_position(node, parsed)).unwrap_or(5),
                )
            })
        })
}

pub fn canonical_q_import_property_key(semantic: &str, position: u8) -> String {
    let _ = position;
    format!("q_5_{semantic}")
}

fn canonicalize_prime_surface_property(target_key: &str, node: &Value) -> Option<String> {
    if !target_key.starts_with("m_") {
        return Some(target_key.to_string());
    }

    let semantic = target_key.splitn(3, '_').nth(2)?;
    let prefix = m_prime_property_prefix(node)?;
    Some(format!("{prefix}_{semantic}"))
}

fn m_prime_property_prefix(node: &Value) -> Option<String> {
    let coord = coordinate_from_node(node)?;
    let normalized = convert_hash_to_m_family(coord);
    let mut chars = normalized.chars();
    if chars.next()? != 'M' {
        return None;
    }

    let root = chars.next()?.to_digit(10)?;
    let mut prefix = format!("m_{root}");

    if chars.next() == Some('-') {
        let slot = chars
            .take_while(|ch| ch.is_ascii_digit())
            .collect::<String>();
        if !slot.is_empty() {
            prefix.push('_');
            prefix.push_str(&slot);
        }
    }

    Some(prefix)
}

fn deep_property_semantic(source_key: &str) -> Option<String> {
    let raw = source_key
        .strip_prefix("q_")
        .or_else(|| source_key.strip_prefix("f_"))
        .unwrap_or(source_key);
    let mut out = String::new();
    let mut last_was_underscore = false;

    for ch in raw.chars() {
        let replacement = ascii_property_char(ch);
        if replacement == "_" {
            if !last_was_underscore && !out.is_empty() {
                out.push('_');
                last_was_underscore = true;
            }
            continue;
        }
        if ch.is_uppercase() && !out.is_empty() && !last_was_underscore {
            out.push('_');
        }
        out.push_str(&replacement);
        last_was_underscore = false;
    }

    let semantic = out.trim_matches('_').to_string();
    if semantic.is_empty() {
        None
    } else {
        Some(semantic)
    }
}

fn ascii_property_char(ch: char) -> String {
    match ch {
        'a'..='z' | '0'..='9' => ch.to_string(),
        'A'..='Z' => ch.to_ascii_lowercase().to_string(),
        'ā' | 'á' | 'à' | 'â' | 'ä' | 'ã' | 'å' | 'Ā' | 'Á' | 'À' | 'Â' | 'Ä' | 'Ã' | 'Å' => {
            "a".into()
        }
        'ç' | 'Ç' => "c".into(),
        'ḍ' | 'ď' | 'Ḍ' | 'Ď' => "d".into(),
        'é' | 'è' | 'ê' | 'ë' | 'É' | 'È' | 'Ê' | 'Ë' => "e".into(),
        'ī' | 'í' | 'ì' | 'î' | 'ï' | 'Ī' | 'Í' | 'Ì' | 'Î' | 'Ï' => "i".into(),
        'ñ' | 'Ñ' => "n".into(),
        'ó' | 'ò' | 'ô' | 'ö' | 'õ' | 'Ó' | 'Ò' | 'Ô' | 'Ö' | 'Õ' => "o".into(),
        'ṛ' | 'ř' | 'Ṛ' | 'Ř' => "r".into(),
        'ś' | 'ṣ' | 'š' | 'Ś' | 'Ṣ' | 'Š' => "s".into(),
        'ṭ' | 'ť' | 'Ṭ' | 'Ť' => "t".into(),
        'ú' | 'ù' | 'û' | 'ü' | 'Ú' | 'Ù' | 'Û' | 'Ü' => "u".into(),
        'ý' | 'ÿ' | 'Ý' => "y".into(),
        _ => "_".into(),
    }
}

fn explicit_deep_property_key(source_key: &str) -> Option<String> {
    let target = match source_key {
        "name" => "c_1_name",
        "primaryDesignation" => "c_1_primary_designation",
        "description" => "c_1_description",
        "coreNature" => "c_0_core_nature",
        "operationalEssence" => "c_0_essence",
        "internalStructure" => "c_1_structure",
        "completeFormulation" => "c_1_complete_formulation",
        "formulationBreakdown" => "c_1_formulation_breakdown",
        "keyPrinciples" => "c_1_key_principles",
        "practicalApplications" => "c_3_practical_applications",
        "relatedCoordinates" => "c_3_related_coordinates",
        "lastUpdated" | "updatedAt" | "updated_at" => "c_3_updated_at",
        "contextFrame" => "c_3_context_frame",
        "qlCategory" => "c_4_ql_category",
        "qlOperatorTypes" => "c_4_ql_operator_types",
        "accessLevel" => "c_4_access_level",
        "resonances" => "c_5_resonances",
        "qlVariant" => "p_1_variant",
        "qlPositionWeave" => "p_1_weave",
        "positionId" => "p_1_position_id",
        "stageId" => "p_1_stage_id",
        "sequence" => "p_3_sequence",
        "therapeuticProperties" => "l_2_therapeutic_properties",
        "temperamentBalance" => "l_2_temperament_balance",
        "healingSpecialty" => "l_2_healing_specialty",
        "chakraCorrespondence" => "l_2_chakra_correspondence",
        "breathPattern" => "l_2_breath_pattern",
        "elementalNature" => "l_2_elemental_nature",
        "seasonalPosition" => "l_3_seasonal_position",
        "modality" => "l_4_modality",
        "mefCondition" => "l_4_mef_condition",
        "interpretiveRole" => "l_4_interpretive_role",
        "reflectionTable" => "l_4_reflection_table",
        "f_role" => "s_4_function_role",
        "f_description" => "s_4_function_description",
        "f_inputContracts" => "s_4_input_contracts",
        "f_outputContracts" => "s_4_output_contracts",
        "f_queryableProperties" => "s_4_queryable_properties",
        "f_translationSchema" => "s_4_translation_schema",
        "f_agent" => "s_5_agent",
        "f_tool_affinity" => "s_5_tool_affinity",
        "f_system_prompt" => "s_5_system_prompt",
        "f_capabilities" => "s_5_capabilities",
        "safetyClass" => "s_4_safety_class",
        "eligibleFormats" => "s_4_eligible_formats",
        "epistemicFunction" => "t_1_epistemic_function",
        "developmentalStage" => "t_3_developmental_stage",
        "processRealization" => "t_3_process_realization",
        "nextEvolutionPhase" => "t_5_next_evolution_phase",
        "q_theoreticalThesis" => "q_1_theoretical_thesis",
        "q_sophiaLogosDialectic" => "q_2_sophia_logos_dialectic",
        "q_instantiationMode" => "q_2_instantiation_mode",
        "q_dialecticalMovement" => "q_3_dialectical_movement",
        "q_historicalDiagnosis" => "q_4_historical_diagnosis",
        "q_localitySignature" => "q_4_locality_signature",
        "q_integrationTemplate" => "q_5_integration_template",
        "q_conjunctiveThreshold" => "q_5_conjunctive_threshold",
        "consciousnessOperation" => "m_0_consciousness_operation",
        "consciousnessFunction" => "m_0_consciousness_function",
        "grammaticalFunction" => "m_0_grammatical_function",
        "spandaRelationship" => "m_0_spanda_relationship",
        "metaphysicalNames" => "m_0_metaphysical_names",
        "adamEveClassification" => "m_0_adam_eve_classification",
        "topologicalSignificance" => "m_1_topological_significance",
        "topologicalFormula" => "m_1_topological_formula",
        "processualTopologyRole" => "m_1_processual_topology_role",
        "matrixType" => "m_1_matrix_type",
        "constructionPhase" => "m_1_construction_phase",
        "algebraicCorrespondence" => "m_1_algebraic_correspondence",
        "abjadValue" => "m_2_abjad_value",
        "arabicText" => "m_2_arabic_text",
        "trilateralRoot" => "m_2_trilateral_root",
        "dhikrApplication" => "m_2_dhikr_application",
        "recitationCount" => "m_2_recitation_count",
        "zodiacalInfluence" => "m_2_zodiacal_influence",
        "therapeuticCluster" => "m_2_therapeutic_cluster",
        "digitalRoot" => "m_2_digital_root",
        "matrixConstant" => "m_2_matrix_constant",
        "magicSquareSum" => "m_2_magic_square_sum",
        "degree" => "m_3_degree",
        "quadrant" => "m_3_quadrant",
        "rotationalPhase" => "m_3_rotational_phase",
        "yinYangBalance" => "m_3_yin_yang_balance",
        "elementalAffinity" => "m_3_elemental_affinity",
        "aminoAcidCode" => "m_3_amino_acid_code",
        "positive_codon_binary" => "m_3_positive_codon_binary",
        "negative_codon_binary" => "m_3_negative_codon_binary",
        "upper_Pair_binary" => "m_3_upper_pair_binary",
        "lower_Pair_binary" => "m_3_lower_pair_binary",
        "tarotCard" => "m_3_tarot_card",
        "hebrewLetter" => "m_3_hebrew_letter",
        "twoStrokeDoctrine" => "m_4_two_stroke_doctrine",
        "temporalStructure" => "m_4_temporal_structure",
        "temporalIntelligenceLayer" => "m_4_temporal_intelligence_layer",
        "kashmirShaivismAlignment" => "m_4_kashmir_shaivism_alignment",
        "practicalManifestations" => "m_4_practical_manifestations",
        "capabilitySignals" => "m_4_capability_signals",
        "preferredTiming" => "m_4_preferred_timing",
        "lacanianPublicInterface" => "m_5_lacanian_interface",
        "whiteheadLacanSynthesis" => "m_5_whitehead_lacanian",
        "lacanianEtymologicalArchaeology" => "m_5_archaeology_method",
        _ => return None,
    };
    Some(target.to_string())
}

fn node_position(node: &Value, parsed: Option<&crate::coordinate::ParsedCoordinate>) -> u8 {
    parsed
        .and_then(|parsed| parsed.ql_position)
        .or_else(|| {
            nested_filtered_property(node, "qlPosition").and_then(|value| value.parse::<u8>().ok())
        })
        .or_else(|| {
            coordinate_from_node(node).and_then(|coord| {
                coord
                    .trim_start_matches('#')
                    .chars()
                    .find(|ch| ch.is_ascii_digit())
                    .and_then(|ch| ch.to_digit(10))
                    .map(|digit| digit as u8)
            })
        })
        .filter(|position| *position <= 5)
        .unwrap_or(0)
}

/// Sanitize relationship type to valid Neo4j identifier (uppercase, underscores only)
pub(super) fn sanitize_rel_type(t: &str) -> String {
    t.chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || c == '_' {
                c.to_ascii_uppercase()
            } else {
                '_'
            }
        })
        .collect()
}

pub(super) fn relation_family_for_rel_type(rel_type: &str) -> &'static str {
    relation_family_for_relationship_type(rel_type)
}

pub(super) fn append_deep_prefixed_rel_props(rel: &Value, set_parts: &mut Vec<String>) {
    let Some(props) = rel.get("relProperties").and_then(|value| value.as_object()) else {
        return;
    };

    for (source_key, value) in props {
        let Some(target_key) = explicit_deep_relation_property_key(source_key) else {
            continue;
        };
        if rel_target_already_set(set_parts, &target_key) {
            continue;
        }
        let Some(literal) = cypher_literal(value, &target_key) else {
            continue;
        };
        set_parts.push(format!(
            "r.{target_key} = COALESCE(r.{target_key}, {literal})"
        ));
    }
}

fn explicit_deep_relation_property_key(source_key: &str) -> Option<String> {
    let target = match source_key {
        "description" => "c_1_relation_description",
        "type" | "relationship" | "relationshipType" => "c_2_relation_kind",
        "createdAt" => "c_3_created_at",
        "correspondenceType" | "specificCorrespondence" | "correspondence" => "c_5_correspondence",
        "basis" => "c_5_correspondence_basis",
        "fromCoordinate" => "c_0_source_coordinate",
        "toCoordinate" => "c_0_target_coordinate",
        "realizationLevel" => "l_5_realization_level",
        "mysticalIdentity" => "l_5_mystical_identity",
        "functionalRole" | "systemicFunction" => "s_4_function_role",
        "hierarchyLevel" => "s_4_hierarchy_level",
        "insight" | "holisticInsight" => "t_5_insight",
        "patternStructure" => "p_3_pattern_structure",
        "patternName" => "p_3_pattern_name",
        "developmentalFunction" => "t_3_developmental_function",
        _ => return None,
    };
    Some(target.to_string())
}

fn rel_target_already_set(set_parts: &[String], target_key: &str) -> bool {
    let prefix = format!("r.{target_key} ");
    set_parts.iter().any(|part| part.starts_with(&prefix))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::coordinate::CoordinateArrayParser;
    use crate::dataset_import::{node_text_property, relation_endpoint, relation_type_from_value};

    #[test]
    fn helpers_understand_deep_dataset_shape() {
        let node = serde_json::json!({
            "coordinate": "#2-3-0",
            "filteredProps": {
                "bimbaCoordinate": "#2-3-0",
                "operationalEssence": "Parashakti operational body"
            }
        });
        assert_eq!(coordinate_from_node(&node), Some("#2-3-0"));
        assert_eq!(
            node_text_property(&node, &["essence", "operationalEssence"]),
            Some("Parashakti operational body")
        );

        let rel = serde_json::json!({
            "source": "#2",
            "target": "#2-3",
            "relType": "has-deep child"
        });
        assert_eq!(relation_endpoint(&rel, "source"), Some("#2"));
        assert_eq!(relation_type_from_value(&rel), Some("has-deep child"));
        assert_eq!(
            sanitize_rel_type(relation_type_from_value(&rel).unwrap()),
            "HAS_DEEP_CHILD"
        );
    }

    #[test]
    fn deep_properties_are_promoted_with_canonical_prefixes() {
        let node = serde_json::json!({
            "coordinate": "#2-4",
            "filteredProps": {
                "q_theoreticalThesis": "QV is quintessential",
                "f_role": "Knowing surface",
                "therapeuticProperties": "grounding, integration",
                "topologicalSignificance": "M-prime expression",
                "qlVariant": "0/1",
                "matrixConstant": 21,
                "vimarśaFunction": "self-recognition"
            }
        });
        let parsed = CoordinateArrayParser::parse_one("M2-4").ok();
        let mut set_parts = Vec::new();

        append_deep_prefixed_filtered_props(&node, parsed.as_ref(), &mut set_parts);

        assert!(set_parts.contains(&"n.q_1_theoretical_thesis = 'QV is quintessential'".into()));
        assert!(set_parts.contains(&"n.s_4_function_role = 'Knowing surface'".into()));
        assert!(set_parts
            .contains(&"n.l_2_therapeutic_properties = ['grounding', 'integration']".into()));
        assert!(
            set_parts.contains(&"n.m_2_4_topological_significance = 'M-prime expression'".into())
        );
        assert!(set_parts.contains(&"n.p_1_variant = '0/1'".into()));
        assert!(set_parts.contains(&"n.m_2_4_matrix_constant = 21".into()));
        assert!(
            set_parts
                .iter()
                .all(|part| !part.contains("vimarsa_function")),
            "unreviewed non-q properties must not be guessed into coordinate families"
        );
        assert!(
            set_parts.iter().all(|part| !part.contains("n.`")),
            "deep properties must never be written as raw backtick-escaped source keys"
        );
    }

    #[test]
    fn deep_coordinate_source_keys_are_not_written_as_duplicate_properties() {
        let node = serde_json::json!({
            "coordinate": "#2-1",
            "filteredProps": {
                "bimbaCoordinate": "#2-1",
                "coordinate": "#2-1",
                "name": "Already handled by identity path"
            }
        });
        let parsed = CoordinateArrayParser::parse_one("M2-1").ok();
        let mut set_parts = Vec::new();
        set_parts.push("n.c_1_name = COALESCE(n.c_1_name, 'Already handled')".into());

        append_deep_prefixed_filtered_props(&node, parsed.as_ref(), &mut set_parts);

        assert!(
            set_parts
                .iter()
                .all(|part| !part.contains("bimbaCoordinate") && !part.contains("`coordinate`")),
            "coordinate aliases are node identity, not deep properties"
        );
        assert!(
            set_parts.iter().filter(|part| part.starts_with("n.c_1_name ")).count() == 1,
            "canonical targets already set by higher-priority importer paths must not be duplicated"
        );
    }

    #[test]
    fn q_properties_keep_their_own_class_and_node_position() {
        let node = serde_json::json!({
            "coordinate": "#5-1",
            "filteredProps": {
                "q_instantiationMode": "Quick-view surface",
                "q_paramādvaita": "supreme nondualism",
                "q_śivaŚaktiPlay": "light-power play"
            }
        });
        let parsed = CoordinateArrayParser::parse_one("M5-1").ok();
        let mut set_parts = Vec::new();

        append_deep_prefixed_filtered_props(&node, parsed.as_ref(), &mut set_parts);

        assert!(set_parts.contains(&"n.q_2_instantiation_mode = 'Quick-view surface'".into()));
        assert!(set_parts.contains(&"n.q_5_paramadvaita = 'supreme nondualism'".into()));
        assert!(set_parts.contains(&"n.q_5_siva_sakti_play = 'light-power play'".into()));
    }

    #[test]
    fn m_prime_properties_use_coordinate_slot_prefixes() {
        let root_node = serde_json::json!({
            "coordinate": "#3",
            "filteredProps": {
                "degree": 0
            }
        });
        let sub_node = serde_json::json!({
            "coordinate": "#3-5-8",
            "filteredProps": {
                "degree": 248
            }
        });
        let mut root_parts = Vec::new();
        let mut sub_parts = Vec::new();

        append_deep_prefixed_filtered_props(&root_node, None, &mut root_parts);
        append_deep_prefixed_filtered_props(&sub_node, None, &mut sub_parts);

        assert!(root_parts.contains(&"n.m_3_degree = 0".into()));
        assert!(sub_parts.contains(&"n.m_3_5_degree = 248".into()));
    }

    #[test]
    fn lifts_asset_seal_sigil_and_glyph_keys_to_c1_slots() {
        let node = serde_json::json!({
            "coordinate": "#0",
            "filteredProps": {
                "asset": "vault://Idea/Bimba/Map/assets/root.png",
                "assetKind": "image",
                "seal": "ipfs://bafybeigdecanseal",
                "sigilUri": "vault://Idea/Bimba/Map/assets/sigil.svg",
                "glyph": "vault://Idea/Bimba/Map/assets/glyph.svg"
            }
        });
        let parsed = CoordinateArrayParser::parse_one("M0").ok();

        let set_parts = mapped_filtered_props_for_test(&node, parsed.as_ref());

        assert!(set_parts.contains(
            &"n.c_1_asset_uri = ['vault://Idea/Bimba/Map/assets/root.png', 'ipfs://bafybeigdecanseal', 'vault://Idea/Bimba/Map/assets/sigil.svg', 'vault://Idea/Bimba/Map/assets/glyph.svg']".into()
        ));
        assert!(set_parts.contains(&"n.c_1_asset_kind = 'image'".into()));
        assert_eq!(
            set_parts
                .iter()
                .filter(|part| part.starts_with("n.c_1_asset_uri "))
                .count(),
            1,
            "asset aliases should merge into the canonical StringList once"
        );
    }

    #[test]
    fn test_sanitize_rel_type() {
        assert_eq!(sanitize_rel_type("LINKS_TO"), "LINKS_TO");
        assert_eq!(
            sanitize_rel_type("SUCCEEDED_BY_AND_MANIFESTS_THROUGH"),
            "SUCCEEDED_BY_AND_MANIFESTS_THROUGH"
        );
        assert_eq!(sanitize_rel_type("has-relation"), "HAS_RELATION");
    }

    #[test]
    fn relation_family_classifies_dataset_relationships() {
        assert_eq!(relation_family_for_rel_type("CONTAINS"), "structural");
        assert_eq!(relation_family_for_rel_type("SYNCED_FROM"), "sync");
        assert_eq!(relation_family_for_rel_type("ELABORATES"), "inferred");
        assert_eq!(
            relation_family_for_rel_type("POS0_LINKS_TO"),
            "compatibility"
        );
        assert_eq!(
            relation_family_for_rel_type("HAS_KERNEL_RESONANCE"),
            "kernel_core"
        );
        assert_eq!(
            relation_family_for_rel_type("HAS_DECAN"),
            "correspondential"
        );
        assert_eq!(
            relation_family_for_rel_type("HAS_MAQAM_FAMILY"),
            "correspondential"
        );
        assert_eq!(relation_family_for_rel_type("RULED_BY"), "correspondential");
        assert_eq!(
            relation_family_for_rel_type("VORTEX_SPIRIT_AXIS"),
            "correspondential"
        );
    }

    #[test]
    fn relation_properties_are_promoted_from_reviewed_map_only() {
        let rel = serde_json::json!({
            "relProperties": {
                "description": "relation prose",
                "correspondenceType": "harmonic",
                "functionalRole": "bridge",
                "patternStructure": "triadic",
                "mysteryField": "do not guess"
            }
        });
        let mut set_parts = Vec::new();

        append_deep_prefixed_rel_props(&rel, &mut set_parts);

        assert!(set_parts.contains(
            &"r.c_1_relation_description = COALESCE(r.c_1_relation_description, 'relation prose')"
                .into()
        ));
        assert!(set_parts
            .contains(&"r.c_5_correspondence = COALESCE(r.c_5_correspondence, 'harmonic')".into()));
        assert!(set_parts
            .contains(&"r.s_4_function_role = COALESCE(r.s_4_function_role, 'bridge')".into()));
        assert!(set_parts.contains(
            &"r.p_3_pattern_structure = COALESCE(r.p_3_pattern_structure, 'triadic')".into()
        ));
        assert!(
            set_parts.iter().all(|part| !part.contains("mystery")),
            "unreviewed relation properties must not be guessed into coordinate families"
        );
    }

    #[test]
    fn layer_string_covers_all_variants() {
        assert_eq!(layer_string(&CoordLayer::Psychoid), Some("PSYCHOID"));
        assert_eq!(layer_string(&CoordLayer::Family), None, "an ordinary coordinate gets no kind tag");
        assert_eq!(layer_string(&CoordLayer::FamilyRoot), Some("FAMILY_ROOT"));
        assert_eq!(layer_string(&CoordLayer::Lens), Some("LENS"));
    }
}
