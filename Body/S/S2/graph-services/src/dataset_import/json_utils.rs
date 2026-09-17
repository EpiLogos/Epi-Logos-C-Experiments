//! dataset_import::json_utils — JSON normalization and node/relation field readers.
//!
//! BOM stripping, control-char sanitization, UTF-8 truncation, and the small
//! accessors that pull a coordinate / text property / relation endpoint out of a
//! raw dataset `serde_json::Value`. Split out of the former `dataset_import.rs`
//! per S2-ARCHITECTURE.md §5.7 (finding 7).

use serde_json::Value;

pub fn strip_json_bom(raw: &str) -> &str {
    raw.trim_start_matches('\u{feff}')
}

pub(super) fn sanitize_json_control_chars(raw: &str) -> String {
    let mut result = String::with_capacity(raw.len());
    let mut in_string = false;
    let mut escaped = false;

    for ch in raw.chars() {
        if escaped {
            result.push(ch);
            escaped = false;
            continue;
        }

        if ch == '\\' {
            result.push(ch);
            escaped = true;
            continue;
        }

        if ch == '"' {
            in_string = !in_string;
            result.push(ch);
            continue;
        }

        match ch {
            '\n' if in_string => result.push_str("\\n"),
            '\r' if in_string => result.push_str("\\r"),
            '\t' if in_string => result.push_str("\\t"),
            _ => result.push(ch),
        }
    }

    result
}

pub(super) fn truncate_utf8(value: &str, max_len: usize) -> &str {
    if value.len() <= max_len {
        return value;
    }
    let mut end = max_len;
    while !value.is_char_boundary(end) {
        end -= 1;
    }
    &value[..end]
}

pub fn coordinate_from_node(node: &Value) -> Option<&str> {
    node.get("coordinate")
        .and_then(|value| value.as_str())
        .or_else(|| nested_filtered_property(node, "coordinate"))
        .or_else(|| nested_filtered_property(node, "bimbaCoordinate"))
}

pub fn node_text_property<'a>(node: &'a Value, keys: &[&str]) -> Option<&'a str> {
    for key in keys {
        if let Some(value) = node.get(*key).and_then(|value| value.as_str()) {
            return Some(value);
        }
        if let Some(value) = nested_filtered_property(node, key) {
            return Some(value);
        }
    }
    None
}

pub(super) fn nested_filtered_property<'a>(node: &'a Value, key: &str) -> Option<&'a str> {
    node.get("filteredProps")?
        .get(key)
        .and_then(|value| value.as_str())
}

pub fn relation_type_from_value(rel: &Value) -> Option<&str> {
    rel.get("type")
        .and_then(|value| value.as_str())
        .or_else(|| rel.get("relType").and_then(|value| value.as_str()))
        .or_else(|| rel.get("relationshipType").and_then(|value| value.as_str()))
}

pub fn relation_endpoint<'a>(rel: &'a Value, key: &str) -> Option<&'a str> {
    rel.get(key).and_then(|value| match value {
        Value::String(s) if !s.trim().is_empty() => Some(s.as_str()),
        Value::Object(map) => map
            .get("coordinate")
            .and_then(|value| value.as_str())
            .or_else(|| map.get("id").and_then(|value| value.as_str())),
        _ => None,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn deep_dataset_json_sanitizer_preserves_multiline_string_content() {
        let raw =
            "[{\"coordinate\":\"#5\",\"filteredProps\":{\"f_system_prompt\":\"first\nsecond\"}}]";
        let sanitized = sanitize_json_control_chars(raw);
        let parsed: Vec<Value> =
            serde_json::from_str(&sanitized).expect("sanitized JSON should parse");

        assert_eq!(
            parsed[0]["filteredProps"]["f_system_prompt"],
            Value::String("first\nsecond".into())
        );
    }

    #[test]
    fn helpers_reject_null_relation_endpoints_and_strip_bom() {
        let raw = "\u{feff}[{\"coordinate\":\"#\"}]";
        assert!(strip_json_bom(raw).starts_with('['));

        let rel = serde_json::json!({
            "source": "#2",
            "target": null,
            "relType": "RELATES_TO"
        });
        assert_eq!(relation_endpoint(&rel, "target"), None);
    }
}
