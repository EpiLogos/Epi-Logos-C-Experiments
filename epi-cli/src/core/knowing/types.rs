use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct KnowingDossier {
    pub coordinate: String,
    pub title: String,
    pub essence: EssenceFacet,
    pub structural_correspondences: Vec<StructuralCorrespondence>,
    pub relational_field: RelationalFieldFacet,
    pub vimarsa_field: VimarsaFieldFacet,
    pub notebook_pulse: NotebookPulseFacet,
    pub latest_snapshot: LatestSnapshotFacet,
    pub actions: Vec<KnowingAction>,
}

#[derive(Debug, Clone, Serialize)]
pub struct EssenceFacet {
    pub text: String,
    pub branch_id: String,
    pub branch_name: String,
    pub phase: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct StructuralCorrespondence {
    pub coordinate: String,
    pub family: String,
    pub label: String,
    pub is_self: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct RelationalFieldFacet {
    pub source: String,
    pub summary: Option<String>,
    pub constellation: Vec<FacetItem>,
    pub chain: Vec<FacetItem>,
    pub items: Vec<FacetItem>,
}

#[derive(Debug, Clone, Serialize)]
pub struct VimarsaFieldFacet {
    pub source: String,
    pub project_scope: Option<String>,
    pub summary: Option<String>,
    pub items: Vec<FacetItem>,
}

#[derive(Debug, Clone, Serialize)]
pub struct NotebookPulseFacet {
    pub source: String,
    pub text: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct LatestSnapshotFacet {
    pub source: String,
    pub text: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct KnowingAction {
    pub id: String,
    pub label: String,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct FacetItem {
    pub label: String,
    pub detail: Option<String>,
}
