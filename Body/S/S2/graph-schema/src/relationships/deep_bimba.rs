use crate::relationships::RELATIONSHIP_TYPE_SPECS;

///
/// `Idea/Bimba/Map/datasets/{anuttara,paramasiva,parashakti,mahamaya,nara,epii}-deep/relations.json`
/// emit thousands of semantically rich relation types
/// (`ARCHETYPAL_RESONANCE_ACTIVE_AGENCY`, `MIRRORS_SVATANTRYA`, ...). Per-instance
/// registration is infeasible; instead Track 02 T1 declares a CLASS convention:
/// uppercase ASCII + digits + underscores, starts with an uppercase letter,
/// no consecutive underscores. Importers MAY emit any string matching this
/// pattern as a deep-dataset relation; the registry classes them as
/// `deep_dataset_class` for drift accounting without enumerating each one.
///
/// Strings already registered in `RELATIONSHIP_TYPE_SPECS` (canonical or
/// compatibility) are NOT classed as deep-dataset, even when they match the
/// pattern.
pub fn is_deep_dataset_relation_type(rel_type: &str) -> bool {
    if rel_type.is_empty() {
        return false;
    }
    if RELATIONSHIP_TYPE_SPECS
        .iter()
        .any(|spec| spec.rel_type == rel_type)
    {
        return false;
    }
    let bytes = rel_type.as_bytes();
    if !bytes[0].is_ascii_uppercase() {
        return false;
    }
    let mut prev_underscore = false;
    for &b in bytes {
        let allowed = b.is_ascii_uppercase() || b.is_ascii_digit() || b == b'_';
        if !allowed {
            return false;
        }
        if b == b'_' && prev_underscore {
            return false;
        }
        prev_underscore = b == b'_';
    }
    !rel_type.ends_with('_')
}

/// Classify a relationship type emitted by seed.rs or dataset_import.rs.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RelationshipTypeClass {
    /// Registered canonical relationship (compatibility: false).
    Canonical,
    /// Registered compatibility relationship (compatibility: true).
    Compatibility,
    /// Matches the deep-dataset convention; not individually registered.
    DeepDataset,
    /// Drift — not registered and does not match any allowed class.
    Drift,
}

/// Classify a relationship type against the registry + deep-dataset class.
pub fn classify_relationship_type(rel_type: &str) -> RelationshipTypeClass {
    if let Some(spec) = RELATIONSHIP_TYPE_SPECS
        .iter()
        .find(|spec| spec.rel_type == rel_type)
    {
        if spec.compatibility {
            return RelationshipTypeClass::Compatibility;
        }
        return RelationshipTypeClass::Canonical;
    }
    if is_deep_dataset_relation_type(rel_type) {
        return RelationshipTypeClass::DeepDataset;
    }
    RelationshipTypeClass::Drift
}
