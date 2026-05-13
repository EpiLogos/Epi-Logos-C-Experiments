use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::error::AppError;

/// Parsed QL frontmatter from a vault markdown file.
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct QlFrontmatter {
    pub coordinate: Option<String>,
    pub c_1_ct_type: Option<String>,
    pub c_4_artifact_role: Option<String>,
    pub c_3_day_id: Option<String>,
    pub c_3_created_at: Option<String>,
    pub c_3_ctx_frame: Option<String>,
    pub c_0_source_coordinates: Option<Vec<String>>,
    #[serde(flatten)]
    pub extra: HashMap<String, serde_yaml::Value>,
}

/// Extract frontmatter from markdown content.
/// Returns (frontmatter, body) — None frontmatter if no `---` delimiters found.
pub fn parse_frontmatter(content: &str) -> Result<(Option<QlFrontmatter>, &str), AppError> {
    let trimmed = content.trim_start();
    if !trimmed.starts_with("---") {
        return Ok((None, content));
    }

    let after_first = &trimmed[3..];
    let end_idx = after_first.find("\n---").ok_or_else(|| {
        AppError::Vault("malformed frontmatter: missing closing ---".into())
    })?;

    let yaml_str = &after_first[..end_idx];
    let body_start = 3 + end_idx + 4; // skip "---\n" + yaml + "\n---"
    let body = if body_start < trimmed.len() {
        &trimmed[body_start..]
    } else {
        ""
    };

    let fm: QlFrontmatter = serde_yaml::from_str(yaml_str)
        .map_err(|e| AppError::Vault(format!("frontmatter parse error: {e}")))?;

    Ok((Some(fm), body))
}

/// Serialize frontmatter + body back to markdown.
pub fn render_with_frontmatter(fm: &QlFrontmatter, body: &str) -> Result<String, AppError> {
    let yaml = serde_yaml::to_string(fm)
        .map_err(|e| AppError::Vault(format!("frontmatter serialize error: {e}")))?;
    Ok(format!("---\n{}---\n{}", yaml, body))
}

const VALID_PREFIXES: &[&str] = &[
    "c_", "s_", "t_", "m_", "l_", "p_",
];

const SPECIAL_KEYS: &[&str] = &[
    "coordinate",
    "c_4_artifact_role",
    "c_1_ct_type",
    "c_3_ctx_frame",
    "c_3_created_at",
    "c_3_day_id",
    "c_0_source_coordinates",
];

/// Validate frontmatter keys against the canonical {family}_{n}_{semantic} law.
/// Returns Ok(()) if valid, Err with the first unknown key.
pub fn validate_frontmatter(fm: &QlFrontmatter) -> Result<(), AppError> {
    for key in fm.extra.keys() {
        if SPECIAL_KEYS.contains(&key.as_str()) {
            continue;
        }
        let has_valid_prefix = VALID_PREFIXES.iter().any(|p| key.starts_with(p));
        if !has_valid_prefix {
            return Err(AppError::Vault(format!(
                "unknown frontmatter key '{}': must use {{family}}_{{n}}_{{semantic}} form",
                key
            )));
        }
        let rest = &key[2..];
        if !rest.starts_with(|c: char| c.is_ascii_digit()) {
            return Err(AppError::Vault(format!(
                "frontmatter key '{}': digit must follow family prefix",
                key
            )));
        }
    }

    if fm.coordinate.is_none() {
        return Err(AppError::Vault("missing required field: coordinate".into()));
    }
    if fm.c_4_artifact_role.is_none() {
        return Err(AppError::Vault("missing required field: c_4_artifact_role".into()));
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_simple_frontmatter() {
        let md = "---\ncoordinate: M3\nc_4_artifact_role: flow\n---\nBody content";
        let (fm, body) = parse_frontmatter(md).unwrap();
        let fm = fm.unwrap();
        assert_eq!(fm.coordinate.as_deref(), Some("M3"));
        assert_eq!(fm.c_4_artifact_role.as_deref(), Some("flow"));
        assert!(body.contains("Body content"));
    }

    #[test]
    fn parse_no_frontmatter() {
        let md = "Just plain text";
        let (fm, body) = parse_frontmatter(md).unwrap();
        assert!(fm.is_none());
        assert_eq!(body, "Just plain text");
    }

    #[test]
    fn validate_valid_keys() {
        let fm = QlFrontmatter {
            coordinate: Some("M3".into()),
            c_4_artifact_role: Some("flow".into()),
            extra: [("c_3_day_id".into(), serde_yaml::Value::String("2026-05-12".into()))]
                .into_iter()
                .collect(),
            ..Default::default()
        };
        assert!(validate_frontmatter(&fm).is_ok());
    }

    #[test]
    fn validate_rejects_unknown_key() {
        let fm = QlFrontmatter {
            coordinate: Some("M3".into()),
            c_4_artifact_role: Some("flow".into()),
            extra: [("random_key".into(), serde_yaml::Value::String("bad".into()))]
                .into_iter()
                .collect(),
            ..Default::default()
        };
        assert!(validate_frontmatter(&fm).is_err());
    }

    #[test]
    fn validate_missing_coordinate() {
        let fm = QlFrontmatter {
            c_4_artifact_role: Some("flow".into()),
            ..Default::default()
        };
        assert!(validate_frontmatter(&fm).is_err());
    }

    #[test]
    fn roundtrip_frontmatter() {
        let fm = QlFrontmatter {
            coordinate: Some("M3".into()),
            c_4_artifact_role: Some("flow".into()),
            c_3_day_id: Some("2026-05-12".into()),
            c_3_created_at: Some("2026-05-12T10:00:00Z".into()),
            ..Default::default()
        };
        let rendered = render_with_frontmatter(&fm, "Hello world\n").unwrap();
        assert!(rendered.starts_with("---\n"));
        assert!(rendered.contains("coordinate: M3"));
        assert!(rendered.contains("Hello world"));
    }
}
