use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

/// Map a bare frontmatter key to its coordinate-driven canonical name.
/// Returns None for unknown keys (caller decides whether to skip).
pub(crate) fn canonical_frontmatter_key(key: &str) -> Option<&'static str> {
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

// ===================== CCT-16 (i): {family}_{n}_{i?}_{semantic} law =====================
//
// DR-S1-6: the static alias map above stays for legacy bare keys, but
// coordinate-prefixed keys survive vault → graph sync by SHAPE, not by
// enumeration. Unknown families are a lint ERROR, never a silent drop.
// DR-M4-4: the private q-partition is REJECTED at the sync boundary.

/// The codified coordinate-key family set (DR-S1-6).
pub const FRONTMATTER_KEY_FAMILIES: &[&str] = &["q", "qm", "c", "p", "s", "t", "m", "l"];

/// DR-M4-4 privacy partition: these q-roots (and derivatives) never cross
/// the sync boundary.
pub const REJECTED_PRIVACY_KEY_ROOTS: &[&str] =
    &["q_personal", "q_identity", "q_activity", "q_composed"];

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum FrontmatterKeyResolution {
    /// Legacy bare key remapped via the alias table.
    Alias(&'static str),
    /// A `{family}_{n}_{i?}_{semantic}` key surviving verbatim (the vault
    /// prime form `q_5'_x` canonicalises to the graph form `q_5_i_x`; both
    /// forms survive as DISTINCT properties on the same node per DR-S1-6).
    Canonical(String),
    /// DR-M4-4 private q-partition — rejected, never persisted.
    RejectedPrivacy,
    /// Plain metadata key, not coordinate-shaped — caller keeps its
    /// existing skip/alias behaviour.
    NotCoordinate,
    /// Coordinate-shaped but the family is not codified — lint ERROR.
    UnknownFamily(String),
}

pub fn resolve_frontmatter_key(key: &str) -> FrontmatterKeyResolution {
    if REJECTED_PRIVACY_KEY_ROOTS
        .iter()
        .any(|root| key == *root || key.starts_with(&format!("{root}_")))
    {
        return FrontmatterKeyResolution::RejectedPrivacy;
    }
    if let Some(alias) = canonical_frontmatter_key(key) {
        return FrontmatterKeyResolution::Alias(alias);
    }

    // Coordinate shape: {family}_{n}{'?}_{semantic} or {family}_{n}_i_{semantic}.
    let Some((family, rest)) = key.split_once('_') else {
        return FrontmatterKeyResolution::NotCoordinate;
    };
    let mut chars = rest.chars();
    let Some(position) = chars.next().filter(|ch| ('0'..='5').contains(ch)) else {
        return FrontmatterKeyResolution::NotCoordinate;
    };
    let after_position = chars.as_str();
    let (inverted, semantic) = if let Some(semantic) = after_position.strip_prefix("'_") {
        (true, semantic)
    } else if let Some(semantic) = after_position.strip_prefix("_i_") {
        (true, semantic)
    } else if let Some(semantic) = after_position.strip_prefix('_') {
        (false, semantic)
    } else {
        return FrontmatterKeyResolution::NotCoordinate;
    };
    let semantic_valid = !semantic.is_empty()
        && semantic.split('_').all(|part| {
            !part.is_empty()
                && part
                    .chars()
                    .all(|ch| ch.is_ascii_lowercase() || ch.is_ascii_digit())
        });
    if !semantic_valid {
        return FrontmatterKeyResolution::NotCoordinate;
    }
    if !FRONTMATTER_KEY_FAMILIES.contains(&family) {
        return FrontmatterKeyResolution::UnknownFamily(format!(
            "unknown coordinate-key family `{family}` in frontmatter key `{key}` — codified families are {FRONTMATTER_KEY_FAMILIES:?} (DR-S1-6 lint ERROR, not a silent drop)"
        ));
    }
    let canonical = if inverted {
        format!("{family}_{position}_i_{semantic}")
    } else {
        format!("{family}_{position}_{semantic}")
    };
    FrontmatterKeyResolution::Canonical(canonical)
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
        if raw_key == "bimbaCoordinate" || raw_key == "bimba_coordinate" {
            continue;
        }
        let target = match resolve_frontmatter_key(raw_key) {
            FrontmatterKeyResolution::Alias(alias) => alias.to_owned(),
            FrontmatterKeyResolution::Canonical(canonical) => canonical,
            FrontmatterKeyResolution::RejectedPrivacy
            | FrontmatterKeyResolution::NotCoordinate => continue,
            FrontmatterKeyResolution::UnknownFamily(error) => return Err(error),
        };
        if let Some(value) = yaml_scalar_or_first_sequence_value(value) {
            properties.insert(target, value);
        }
    }
    Ok(properties)
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
