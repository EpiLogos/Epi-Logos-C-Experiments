use serde::Serialize;

/// A single item in a kbase/vimarsa search result set.
#[derive(Debug, Clone, Serialize)]
pub struct FacetItem {
    pub label: String,
    pub detail: Option<String>,
}

/// Kbase search facet — result of `build_kbase_field()`.
#[derive(Debug, Clone, Serialize)]
pub struct KbaseFieldFacet {
    pub source: String,
    pub project_scope: Option<String>,
    pub summary: Option<String>,
    pub items: Vec<FacetItem>,
}

/// Vimarsa search facet — result of `build_vimarsa_field()`.
#[derive(Debug, Clone, Serialize)]
pub struct VimarsaFieldFacet {
    pub source: String,
    pub project_scope: Option<String>,
    pub summary: Option<String>,
    pub items: Vec<FacetItem>,
}
