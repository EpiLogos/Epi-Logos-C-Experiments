use crate::Neo4jClient;
use std::path::Path;

pub struct DatasetImporter<'a> {
    client: &'a Neo4jClient,
    datasets_dir: String,
}

impl<'a> DatasetImporter<'a> {
    pub fn new(client: &'a Neo4jClient, datasets_dir: &str) -> Self {
        Self {
            client,
            datasets_dir: datasets_dir.to_string(),
        }
    }

    /// Import a nodes JSON file. Each entry becomes a Bimba node.
    /// Uses MERGE on coordinate to avoid duplicates with seed data.
    pub async fn import_nodes(&self, filename: &str) -> Result<usize, String> {
        let path = Path::new(&self.datasets_dir).join(filename);
        let data =
            std::fs::read_to_string(&path).map_err(|e| format!("read {}: {}", filename, e))?;
        let nodes: Vec<serde_json::Value> =
            serde_json::from_str(&data).map_err(|e| format!("parse {}: {}", filename, e))?;

        let mut count = 0;
        for node in &nodes {
            let coord = match node.get("coordinate").and_then(|v| v.as_str()) {
                Some(c) => c,
                None => continue,
            };

            // Build SET clause from available properties
            let mut set_parts = Vec::new();
            if let Some(name) = node.get("name").and_then(|v| v.as_str()) {
                set_parts.push(format!("n.name = '{}'", escape_cypher(name)));
            }
            if let Some(desc) = node.get("description").and_then(|v| v.as_str()) {
                // Truncate long descriptions for Neo4j property storage
                let truncated = if desc.len() > 2000 {
                    &desc[..2000]
                } else {
                    desc
                };
                set_parts.push(format!("n.description = '{}'", escape_cypher(truncated)));
            }
            if let Some(essence) = node.get("essence").and_then(|v| v.as_str()) {
                let truncated = if essence.len() > 1000 {
                    &essence[..1000]
                } else {
                    essence
                };
                set_parts.push(format!("n.essence = '{}'", escape_cypher(truncated)));
            }
            if let Some(cn) = node.get("coreNature").and_then(|v| v.as_str()) {
                let truncated = if cn.len() > 1000 { &cn[..1000] } else { cn };
                set_parts.push(format!("n.core_nature = '{}'", escape_cypher(truncated)));
            }

            let set_clause = if set_parts.is_empty() {
                String::new()
            } else {
                format!(" SET {}", set_parts.join(", "))
            };

            let cypher = format!(
                "MERGE (n:Bimba {{coordinate: '{}'}}){} RETURN n.coordinate",
                escape_cypher(coord),
                set_clause
            );

            match self.client.run(&cypher).await {
                Ok(_) => count += 1,
                Err(e) => {
                    eprintln!("  warn: skip node '{}': {}", coord, e);
                }
            }
        }
        Ok(count)
    }

    /// Import a relations JSON file. Each entry becomes a Neo4j relationship.
    pub async fn import_relations(&self, filename: &str) -> Result<usize, String> {
        let path = Path::new(&self.datasets_dir).join(filename);
        let data =
            std::fs::read_to_string(&path).map_err(|e| format!("read {}: {}", filename, e))?;
        let rels: Vec<serde_json::Value> =
            serde_json::from_str(&data).map_err(|e| format!("parse {}: {}", filename, e))?;

        let mut count = 0;
        for rel in &rels {
            let source = match rel.get("source").and_then(|v| v.as_str()) {
                Some(s) => s,
                None => continue,
            };
            let target = match rel.get("target").and_then(|v| v.as_str()) {
                Some(t) => t,
                None => continue,
            };
            let rel_type = match rel.get("type").and_then(|v| v.as_str()) {
                Some(t) => sanitize_rel_type(t),
                None => continue,
            };

            let cypher = format!(
                "MATCH (s:Bimba {{coordinate: '{}'}}) \
                 MATCH (t:Bimba {{coordinate: '{}'}}) \
                 MERGE (s)-[:{}]->(t)",
                escape_cypher(source),
                escape_cypher(target),
                rel_type
            );

            match self.client.run(&cypher).await {
                Ok(_) => count += 1,
                Err(e) => {
                    eprintln!(
                        "  warn: skip rel {} -[{}]-> {}: {}",
                        source, rel_type, target, e
                    );
                }
            }
        }
        Ok(count)
    }

    /// Import all datasets in dependency order
    pub async fn import_all(&self) -> Result<String, String> {
        let mut report = Vec::new();

        // Foundation relationships first
        if Path::new(&self.datasets_dir)
            .join("relations_foundation.json")
            .exists()
        {
            let n = self.import_relations("relations_foundation.json").await?;
            report.push(format!("  foundation relations: {}", n));
        }

        // M-branches in order
        let branches = [
            (
                "M0 Anuttara",
                "nodes_anuttara.json",
                "relations_anuttara.json",
            ),
            (
                "M1 Paramasiva",
                "nodes_paramasiva.json",
                "relations_paramasiva.json",
            ),
            (
                "M2 Parashakti",
                "nodes_parashakti.json",
                "relations_parashakti.json",
            ),
            (
                "M3 Mahamaya",
                "nodes_mahamaya.json",
                "relations_mahamaya.json",
            ),
            ("M4 Nara", "nodes_nara.json", "relations_nara.json"),
            ("M5 Epii", "nodes_epii.json", "relations_epii.json"),
        ];

        for (branch, node_file, rel_file) in &branches {
            let node_path = Path::new(&self.datasets_dir).join(node_file);
            let rel_path = Path::new(&self.datasets_dir).join(rel_file);

            if node_path.exists() {
                let nodes = self.import_nodes(node_file).await?;
                let rels = if rel_path.exists() {
                    self.import_relations(rel_file).await?
                } else {
                    0
                };
                report.push(format!("  {}: {} nodes, {} relations", branch, nodes, rels));
            }
        }

        Ok(format!("Dataset import complete:\n{}", report.join("\n")))
    }
}

/// Escape single quotes for Cypher string literals
fn escape_cypher(s: &str) -> String {
    s.replace('\\', "\\\\").replace('\'', "\\'")
}

/// Sanitize relationship type to valid Neo4j identifier (uppercase, underscores only)
fn sanitize_rel_type(t: &str) -> String {
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_escape_cypher() {
        assert_eq!(escape_cypher("hello"), "hello");
        assert_eq!(escape_cypher("it's"), "it\\'s");
        assert_eq!(escape_cypher("a\\b"), "a\\\\b");
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
}
