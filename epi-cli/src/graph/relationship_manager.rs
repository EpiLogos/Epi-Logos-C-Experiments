use super::types::RelationshipType;

pub struct RelationshipManager;

impl RelationshipManager {
    pub fn new() -> Self { Self }

    pub fn create_relationship(
        &self,
        source: &str,
        target: &str,
        rel_type: RelationshipType,
    ) -> Result<String, String> {
        Ok(format!("Created {} -> {} [{}]", source, target, rel_type.as_str()))
    }
}
