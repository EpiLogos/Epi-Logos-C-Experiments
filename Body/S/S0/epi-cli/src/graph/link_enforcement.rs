use crate::graph::client::Neo4jClient;
use crate::graph::coordinate_array_parser::CoordinateArrayParser;

pub struct LinkValidationResult {
    pub valid: Vec<String>,
    pub broken: Vec<String>,
}

pub struct LinkEnforcer<'a> {
    client: &'a Neo4jClient,
}

impl<'a> LinkEnforcer<'a> {
    pub fn new(client: &'a Neo4jClient) -> Self {
        Self { client }
    }

    pub async fn validate_content_links(
        &self,
        content: &str,
    ) -> Result<LinkValidationResult, String> {
        let links = CoordinateArrayParser::extract_wikilinks(content);
        let mut valid = Vec::new();
        let mut broken = Vec::new();

        for link in &links {
            if self.node_exists(&link.target).await? {
                valid.push(link.target.clone());
            } else {
                broken.push(link.target.clone());
            }
        }

        Ok(LinkValidationResult { valid, broken })
    }

    async fn node_exists(&self, path_or_coord: &str) -> Result<bool, String> {
        let escaped = path_or_coord.replace('\'', "\\'");
        let cypher = format!(
            "MATCH (n:Bimba) WHERE n.vault_path = '{}' OR n.coordinate = '{}' RETURN count(n) > 0 AS exists",
            escaped, escaped
        );
        let rows = self
            .client
            .run(&cypher)
            .await
            .map_err(|e| format!("link check error: {}", e))?;
        if rows.is_empty() {
            return Ok(false);
        }
        Ok(rows[0].get::<bool>("exists").unwrap_or(false))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_link_validation_result_fields() {
        let result = LinkValidationResult {
            valid: vec!["M5".into()],
            broken: vec!["NONEXISTENT".into()],
        };
        assert_eq!(result.valid.len(), 1);
        assert_eq!(result.broken.len(), 1);
    }

    #[tokio::test]
    #[ignore] // requires Neo4j
    async fn test_validate_content_links() {
        let config = crate::graph::client::Neo4jConfig::from_env();
        let client = crate::graph::client::Neo4jClient::connect(&config).unwrap();
        let enforcer = LinkEnforcer::new(&client);
        let result = enforcer
            .validate_content_links("Link to [[M5]] and [[NONEXISTENT]]")
            .await
            .unwrap();
        // Results depend on graph state
        assert!(result.valid.len() + result.broken.len() == 2);
    }
}
