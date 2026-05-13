use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct LibrarySearchResult {
    pub id: String,
    pub title: String,
    pub excerpt: String,
    pub score: f32,
    pub source_path: Option<String>,
    pub coordinate: Option<String>,
    pub labels: Vec<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct LibrarySearchQuery {
    pub query: String,
    pub namespace: Option<LibraryNamespace>,
    pub limit: Option<u32>,
    pub min_score: Option<f32>,
}

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum LibraryNamespace {
    Bimba,
    Gnostic,
    Atelier,
    All,
}

impl Default for LibraryNamespace {
    fn default() -> Self {
        LibraryNamespace::All
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GraphitiEpisode {
    pub episode_id: String,
    pub arc_type: String,
    pub summary: String,
    pub timestamp: u64,
    pub references: Vec<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct KbaseContext {
    pub project_scope: String,
    pub entries: Vec<KbaseEntry>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct KbaseEntry {
    pub id: String,
    pub content: String,
    pub source: String,
    pub relevance: f32,
}
