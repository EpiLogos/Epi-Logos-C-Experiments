pub mod deep_bimba;
pub mod node;
pub mod rel;

pub use deep_bimba::*;
pub use node::*;
pub use rel::*;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct GraphRelationshipTypeSpec {
    pub rel_type: &'static str,
    pub coordinate_home: &'static str,
    pub source_family: &'static str,
    pub compatibility: bool,
}

pub fn relationship_spec(rel_type: &str) -> Result<&'static GraphRelationshipTypeSpec, String> {
    RELATIONSHIP_TYPE_SPECS
        .iter()
        .find(|spec| spec.rel_type == rel_type && !spec.compatibility)
        .ok_or_else(|| format!("not a canonical relationship type: {rel_type}"))
}

pub fn relation_family_for_relationship_type(rel_type: &str) -> &'static str {
    if rel_type == KERNEL_RESONANCE_RELATION {
        return RELATION_FAMILY_KERNEL_CORE;
    }
    if let Some(spec) = RELATIONSHIP_TYPE_SPECS
        .iter()
        .find(|spec| spec.rel_type == rel_type)
    {
        if spec.compatibility {
            return RELATION_FAMILY_COMPATIBILITY;
        }
        return match spec.source_family {
            "llm-inference" => RELATION_FAMILY_INFERRED,
            "sync" => RELATION_FAMILY_SYNC,
            "kernel-resonance" => RELATION_FAMILY_KERNEL_CORE,
            _ => RELATION_FAMILY_STRUCTURAL,
        };
    }
    RELATION_FAMILY_CORRESPONDENTIAL
}

pub fn relationship_types() -> Vec<&'static str> {
    RELATIONSHIP_TYPE_SPECS
        .iter()
        .filter(|spec| !spec.compatibility)
        .map(|spec| spec.rel_type)
        .collect()
}
