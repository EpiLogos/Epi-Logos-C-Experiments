use super::types::NodeRef;

pub struct EntityMapper;

impl EntityMapper {
    pub fn new() -> Self { Self }

    pub fn path_to_labels(&self, path: &str) -> Vec<String> {
        // Derive Neo4j labels from file path
        // e.g., "Empty/Present/NOW.md" -> ["Present", "Note"]
        let parts: Vec<&str> = path.split('/').collect();
        let mut labels = vec!["Note".to_string()];
        if let Some(parent) = parts.get(parts.len().saturating_sub(2)) {
            labels.push(parent.to_string());
        }
        labels
    }

    pub fn node_to_ref(&self, labels: Vec<String>, file_path: Option<String>) -> NodeRef {
        NodeRef {
            uuid: uuid_from_path(file_path.as_deref().unwrap_or("")),
            labels,
            properties: serde_json::Value::Object(Default::default()),
            file_path,
        }
    }
}

fn uuid_from_path(path: &str) -> String {
    // Deterministic UUID-like ID from path
    format!("path:{}", path)
}
