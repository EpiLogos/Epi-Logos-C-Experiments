use epi_s2_graph_schema::{
    coordinate_prefix_family_spec, node_property_spec, validate_coordinate_prefix_property,
    GraphPropertyType,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;

use super::policy::PromotionClass;

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

pub(crate) fn is_pi_agent_authority(authority: &str) -> bool {
    let normalized = authority.trim().to_ascii_lowercase();
    normalized == "pi"
        || normalized == "pi_agent"
        || normalized.starts_with("pi:")
        || normalized.starts_with("pi_agent:")
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
        GraphPropertyType::Enum(values) => {
            value.as_str().is_some_and(|value| values.contains(&value))
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
        GraphPropertyType::Enum(_) => "enum string",
    }
}
