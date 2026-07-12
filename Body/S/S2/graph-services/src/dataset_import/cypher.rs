//! dataset_import::cypher — Cypher literal escaping and value templating.
//!
//! The embedded-Cypher primitives that turn a `serde_json::Value` into a safe
//! Cypher literal (single-string, string-list, or JSON-encoded object). Split out
//! of the former `dataset_import.rs` per S2-ARCHITECTURE.md §5.7 (finding 7).

use super::property_mapping::STRING_LIST_TARGETS;
use serde_json::Value;

/// Escape single quotes for Cypher string literals
pub(super) fn escape_cypher(s: &str) -> String {
    s.replace('\\', "\\\\")
        .replace('\'', "\\'")
        .replace('\n', "\\n")
        .replace('\r', "\\r")
        .replace('\t', "\\t")
}

pub(super) fn cypher_literal(value: &Value, target_key: &str) -> Option<String> {
    match value {
        Value::Null => None,
        Value::Bool(value) => Some(value.to_string()),
        Value::Number(value) => Some(value.to_string()),
        Value::String(value) if STRING_LIST_TARGETS.contains(&target_key) => {
            let items = value
                .split(',')
                .map(str::trim)
                .filter(|item| !item.is_empty())
                .map(|item| format!("'{}'", escape_cypher(item)))
                .collect::<Vec<_>>();
            Some(format!("[{}]", items.join(", ")))
        }
        Value::String(value) if value.trim().is_empty() => None,
        Value::String(value) => Some(format!("'{}'", escape_cypher(value))),
        Value::Array(values) => {
            let items = values
                .iter()
                .filter_map(|value| cypher_array_item_literal(value))
                .collect::<Vec<_>>();
            Some(format!("[{}]", items.join(", ")))
        }
        Value::Object(_) => serde_json::to_string(value)
            .ok()
            .map(|value| format!("'{}'", escape_cypher(&value))),
    }
}

fn cypher_array_item_literal(value: &Value) -> Option<String> {
    match value {
        Value::Null => None,
        Value::Bool(value) => Some(value.to_string()),
        Value::Number(value) => Some(value.to_string()),
        Value::String(value) if value.trim().is_empty() => None,
        Value::String(value) => Some(format!("'{}'", escape_cypher(value))),
        Value::Array(_) | Value::Object(_) => serde_json::to_string(value)
            .ok()
            .map(|value| format!("'{}'", escape_cypher(&value))),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_escape_cypher() {
        assert_eq!(escape_cypher("hello"), "hello");
        assert_eq!(escape_cypher("it's"), "it\\'s");
        assert_eq!(escape_cypher("a\\b"), "a\\\\b");
        assert_eq!(escape_cypher("line\nnext\tcell"), "line\\nnext\\tcell");
    }
}
