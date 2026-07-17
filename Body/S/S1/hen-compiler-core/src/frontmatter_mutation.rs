//! Coordinate: S1 (Hen frontmatter mutation)
//! Residency: Body/S/S1/hen-compiler-core
//! Position (#n): governed artifact mutation primitive
//! Actualises: typed, idempotent append operations for coordinate-owned YAML fields.
//! Public surface: `append_frontmatter_string`.
//! Does NOT own: filesystem path selection, persistence, or domain-specific values.
//! Contract: [[S1-SPEC]] / [[S1-ARCHITECTURE]].

use serde_yaml::{Mapping, Value};

use crate::frontmatter::is_wellformed_q_vocabulary_key;

/// Append one string to a coordinate-owned frontmatter sequence.
///
/// The markdown body is retained byte-for-byte. Existing scalar or mixed-type
/// fields are refused instead of being silently coerced.
pub fn append_frontmatter_string(markdown: &str, key: &str, value: &str) -> Result<String, String> {
    validate_coordinate_key(key)?;
    if value.trim().is_empty() {
        return Err("frontmatter sequence values must not be empty".to_owned());
    }

    let content = markdown
        .strip_prefix("---\n")
        .ok_or_else(|| "artifact must begin with YAML frontmatter".to_owned())?;
    let (yaml, body) = content
        .split_once("\n---\n")
        .ok_or_else(|| "artifact frontmatter is missing its closing delimiter".to_owned())?;
    let mut mapping: Mapping =
        serde_yaml::from_str(yaml).map_err(|error| format!("invalid YAML frontmatter: {error}"))?;
    let yaml_key = Value::String(key.to_owned());

    match mapping.get_mut(&yaml_key) {
        None | Some(Value::Null) => {
            mapping.insert(
                yaml_key,
                Value::Sequence(vec![Value::String(value.to_owned())]),
            );
        }
        Some(Value::Sequence(values)) => {
            if values
                .iter()
                .any(|entry| !matches!(entry, Value::String(_)))
            {
                return Err(format!(
                    "frontmatter field '{key}' must contain only strings"
                ));
            }
            let candidate = Value::String(value.to_owned());
            if !values.contains(&candidate) {
                values.push(candidate);
            }
        }
        Some(_) => {
            return Err(format!(
                "frontmatter field '{key}' must be a string sequence"
            ));
        }
    }

    let serialized = serde_yaml::to_string(&mapping)
        .map_err(|error| format!("could not serialize YAML frontmatter: {error}"))?;
    let serialized = serialized.strip_prefix("---\n").unwrap_or(&serialized);
    Ok(format!("---\n{}---\n{}", serialized, body))
}

/// A reviewed Q articulation is a scalar replacement, never a list append.
///
/// This stays private to the Q amendment plan: generic callers must not gain a
/// bypass around the existing typed mutation surfaces.
fn set_frontmatter_string(markdown: &str, key: &str, value: &str) -> Result<String, String> {
    if value.trim().is_empty() {
        return Err("frontmatter scalar values must not be empty".to_owned());
    }
    let content = markdown
        .strip_prefix("---\n")
        .ok_or_else(|| "artifact must begin with YAML frontmatter".to_owned())?;
    let (yaml, body) = content
        .split_once("\n---\n")
        .ok_or_else(|| "artifact frontmatter is missing its closing delimiter".to_owned())?;
    let mut mapping: Mapping =
        serde_yaml::from_str(yaml).map_err(|error| format!("invalid YAML frontmatter: {error}"))?;
    mapping.insert(
        Value::String(key.to_owned()),
        Value::String(value.to_owned()),
    );
    let serialized = serde_yaml::to_string(&mapping)
        .map_err(|error| format!("could not serialize YAML frontmatter: {error}"))?;
    let serialized = serialized.strip_prefix("---\n").unwrap_or(&serialized);
    Ok(format!("---\n{}---\n{}", serialized, body))
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct QArticulationAmendmentRequest {
    pub q_key: String,
    pub q_value: String,
    pub review_epoch: u64,
    pub accepted_review_ref: String,
    pub opens_questions: Vec<String>,
    pub source_artifacts: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct QArticulationAmendmentPlan {
    pub markdown: String,
    pub q_key: String,
    pub review_epoch_key: String,
    pub accepted_review_ref: String,
    pub opens_questions: Vec<String>,
    pub source_artifacts: Vec<String>,
}

/// Plan the only permitted canonical mutation for an accepted Sophia Q proposal.
///
/// The proposal changes an existing `q_*` articulation and records its
/// corresponding `qm_*_review_epoch_*` scalar. The caller owns filesystem IO;
/// this pure S1 plan preserves the markdown body and rejects closed proposals.
pub fn plan_q_articulation_amendment(
    markdown: &str,
    request: QArticulationAmendmentRequest,
) -> Result<QArticulationAmendmentPlan, String> {
    if !is_wellformed_q_vocabulary_key(&request.q_key) || !request.q_key.starts_with("q_") {
        return Err("Q articulation key must be a canonical q_* vocabulary key".to_owned());
    }
    if request.q_key.starts_with("q_personal_") {
        return Err("private q_personal fields cannot be canonically amended".to_owned());
    }
    if request.accepted_review_ref.trim().is_empty() {
        return Err("accepted_review_ref is required for a canonical Q amendment".to_owned());
    }
    if request.opens_questions.is_empty()
        || request
            .opens_questions
            .iter()
            .any(|question| question.trim().is_empty())
    {
        return Err("opens_questions must contain at least one opening question".to_owned());
    }
    if request.source_artifacts.is_empty()
        || request
            .source_artifacts
            .iter()
            .any(|artifact| artifact.trim().is_empty())
    {
        return Err("source_artifacts must contain at least one provenance reference".to_owned());
    }

    let review_epoch_key = q_articulation_review_epoch_key(&request.q_key)?;
    let markdown = set_frontmatter_string(markdown, &request.q_key, &request.q_value)?;
    let markdown = set_frontmatter_string(
        &markdown,
        &review_epoch_key,
        &request.review_epoch.to_string(),
    )?;
    Ok(QArticulationAmendmentPlan {
        markdown,
        q_key: request.q_key,
        review_epoch_key,
        accepted_review_ref: request.accepted_review_ref,
        opens_questions: request.opens_questions,
        source_artifacts: request.source_artifacts,
    })
}

pub fn q_articulation_review_epoch_key(q_key: &str) -> Result<String, String> {
    let rest = q_key
        .strip_prefix("q_")
        .ok_or_else(|| "Q articulation key must begin with q_".to_owned())?;
    let mut chars = rest.chars();
    let position = chars
        .next()
        .filter(|position| matches!(position, '0'..='5'))
        .ok_or_else(|| "Q articulation key must declare a 0-5 position".to_owned())?;
    let suffix = chars.as_str();
    let suffix = suffix
        .strip_prefix('_')
        .ok_or_else(|| "Q articulation key must include a semantic suffix".to_owned())?;
    Ok(format!("qm_{position}_review_epoch_{suffix}"))
}

fn validate_coordinate_key(key: &str) -> Result<(), String> {
    let bytes = key.as_bytes();
    let valid = bytes.len() > 4
        && bytes[0] == b'c'
        && bytes[1] == b'_'
        && matches!(bytes[2], b'0'..=b'5')
        && bytes[3] == b'_'
        && bytes[4..]
            .iter()
            .all(|byte| byte.is_ascii_lowercase() || byte.is_ascii_digit() || *byte == b'_');
    if valid {
        Ok(())
    } else {
        Err(format!("'{key}' is not a coordinate-owned frontmatter key"))
    }
}
