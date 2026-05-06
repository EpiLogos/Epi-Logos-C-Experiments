use serde::{Deserialize, Serialize};

// S5.2' kbase types — canonical definitions live in epi-s5-kbase-core
pub use epi_s5_kbase_core::types::{FacetItem, KbaseFieldFacet, VimarsaFieldFacet};

/// The four QL-structured vibrational properties for a coordinate.
#[derive(Debug, Clone, Default, Serialize)]
pub struct QvFacet {
    /// #1 formal/definitional nature
    pub q_nature: Option<String>,
    /// #2 operational/vibrational essence
    pub q_essence: Option<String>,
    /// #3 processual/pattern formulation
    pub q_formulation: Option<String>,
    /// #4 structural/contextual role
    pub q_structure: Option<String>,
}

impl QvFacet {
    pub fn is_empty(&self) -> bool {
        self.q_nature.is_none()
            && self.q_essence.is_none()
            && self.q_formulation.is_none()
            && self.q_structure.is_none()
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct KnowingDossier {
    pub coordinate: String,
    pub title: String,
    pub essence: EssenceFacet,
    pub qv_facet: QvFacet,
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

/// A single L-coordinate lens alignment extracted from frontmatter `l_alignments`.
///
/// Corresponds to a future Neo4j relation:
///   `(doc:BimbaNode)-[:HAS_LENS_ALIGNMENT {weight, sub_position, element, klein_square}]
///    ->(lens:LensNode {name, index, mode})`
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LensAlignment {
    /// Canonical lens name, e.g. "L2" or "L2'".
    pub lens: String,
    /// Index 0-11 (0-5 = day, 6-11 = night).
    pub lens_index: u8,
    /// "day" or "night".
    pub mode: String,
    /// Sub-position within the lens (0-5). None when dialetheic ("BOTH").
    pub sub_position: Option<u8>,
    /// Human-readable sub-position label (e.g. "BOTH", "air").
    pub sub_name: Option<String>,
    /// Agent-assessed emphasis weight [0.0, 1.0].
    pub weight: Option<f64>,
    /// Primary element for this lens activation (relevant for L2'/Alchemical-Elemental).
    pub element: Option<String>,
    /// The 4-element Klein V4 integration unit this lens belongs to.
    pub klein_square: Option<Vec<String>>,
    /// Day complement lens name (X + Y = 5 law).
    pub complement: Option<String>,
    /// Day-Night doubling partner lens name.
    pub night_partner: Option<String>,
    /// Agent that wrote this alignment entry.
    pub populated_by: Option<String>,
    /// ISO8601 timestamp of population.
    pub populated_at: Option<String>,
}
