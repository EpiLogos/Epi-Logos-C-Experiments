use crate::{nara_m4_coordinate_manifest, MCoordinateManifest};
use serde::{Deserialize, Serialize};
use std::collections::BTreeSet;

pub const M_RELATION_MANIFEST_SCHEMA: &str = "epi.m-relation-manifest/v1";
pub const NARA_M4_RELATION_MANIFEST_REF: &str = "epi:m-relation-manifest:nara-m4:v1";

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum MRelationKind {
    Contains,
    ConjugateReflects,
    AnchorsAt,
    SuppliesEvidenceTo,
    GovernedReturnTo,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MCoordinateRelation {
    pub relation_ref: String,
    pub kind: MRelationKind,
    pub from_ref: String,
    pub to_ref: String,
    pub source_basis: String,
    pub status: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MRelationManifest {
    pub schema: String,
    pub manifest_ref: String,
    pub coordinate_manifest_ref: String,
    pub relations: Vec<MCoordinateRelation>,
}

impl MRelationManifest {
    pub fn validate(&self, coordinates: &MCoordinateManifest) -> Result<(), String> {
        if self.schema != M_RELATION_MANIFEST_SCHEMA {
            return Err(format!("unsupported M relation manifest schema `{}`", self.schema));
        }
        if self.coordinate_manifest_ref != coordinates.manifest_ref {
            return Err("M relation manifest is bound to the wrong coordinate manifest".to_owned());
        }

        let valid_refs: BTreeSet<&str> = coordinates
            .nodes
            .iter()
            .flat_map(|node| [node.bimba_ref.as_str(), node.pratibimba_ref.as_str()])
            .collect();
        let mut relation_refs = BTreeSet::new();
        for relation in &self.relations {
            if !valid_refs.contains(relation.from_ref.as_str())
                || !valid_refs.contains(relation.to_ref.as_str())
            {
                return Err(format!(
                    "relation {} points outside the coordinate manifest: {} -> {}",
                    relation.relation_ref, relation.from_ref, relation.to_ref
                ));
            }
            if !relation_refs.insert(relation.relation_ref.as_str()) {
                return Err(format!("duplicate M relation ref `{}`", relation.relation_ref));
            }
        }
        Ok(())
    }
}

/// Minimum executable relational floor for the Nara/M4 reflection.
///
/// This deliberately models relation classes independently from feature
/// implementation. It captures the structural relations that must survive every
/// Nara implementation: Bimba containment, exact-path conjugate reflection, the
/// #4.4 -> #4.4.4.4 lived carrier, review flow to #4.5, and governed return to
/// #4.0. The wider Bimba relation corpus can add relation records without
/// changing coordinate identity or these invariants.
pub fn nara_m4_relation_manifest() -> Result<MRelationManifest, String> {
    let coordinates = nara_m4_coordinate_manifest()?;
    let mut relations = Vec::new();

    for node in &coordinates.nodes {
        relations.push(MCoordinateRelation {
            relation_ref: relation_ref("conjugate-reflects", &node.bimba_ref, &node.pratibimba_ref),
            kind: MRelationKind::ConjugateReflects,
            from_ref: node.bimba_ref.clone(),
            to_ref: node.pratibimba_ref.clone(),
            source_basis: node.source_ref.clone(),
            status: "structural".to_owned(),
        });
        if let Some(parent) = node.parent_bimba_ref.as_ref() {
            relations.push(MCoordinateRelation {
                relation_ref: relation_ref("contains", parent, &node.bimba_ref),
                kind: MRelationKind::Contains,
                from_ref: parent.clone(),
                to_ref: node.bimba_ref.clone(),
                source_basis: node.source_ref.clone(),
                status: "structural".to_owned(),
            });
            let reflected_parent = coordinates
                .nodes
                .iter()
                .find(|candidate| candidate.bimba_ref == *parent)
                .map(|candidate| candidate.pratibimba_ref.clone())
                .ok_or_else(|| format!("missing reflected parent for {}", node.source_ref))?;
            relations.push(MCoordinateRelation {
                relation_ref: relation_ref("contains", &reflected_parent, &node.pratibimba_ref),
                kind: MRelationKind::Contains,
                from_ref: reflected_parent,
                to_ref: node.pratibimba_ref.clone(),
                source_basis: node.source_ref.clone(),
                status: "structural".to_owned(),
            });
        }
    }

    let m44 = coordinates.resolve_source_ref("#4.4").unwrap();
    let personal = coordinates.resolve_source_ref("#4.4.4.4").unwrap();
    let review = coordinates.resolve_source_ref("#4.5").unwrap();
    let identity = coordinates.resolve_source_ref("#4.0").unwrap();

    relations.extend([
        MCoordinateRelation {
            relation_ref: relation_ref("anchors-at", &m44.pratibimba_ref, &personal.pratibimba_ref),
            kind: MRelationKind::AnchorsAt,
            from_ref: m44.pratibimba_ref.clone(),
            to_ref: personal.pratibimba_ref.clone(),
            source_basis: "M4'-SPEC §6.6/§7 + Nara activity-graph instrument: lived episodes converge at #4.4.4.4".to_owned(),
            status: "authored+implemented-partial".to_owned(),
        },
        MCoordinateRelation {
            relation_ref: relation_ref("supplies-evidence-to", &personal.pratibimba_ref, &review.pratibimba_ref),
            kind: MRelationKind::SuppliesEvidenceTo,
            from_ref: personal.pratibimba_ref.clone(),
            to_ref: review.pratibimba_ref.clone(),
            source_basis: "M4'-SPEC promotion law: protected activity supplies reviewable evidence to M4-5/M5'".to_owned(),
            status: "authored+implemented-partial".to_owned(),
        },
        MCoordinateRelation {
            relation_ref: relation_ref("governed-return-to", &review.pratibimba_ref, &identity.pratibimba_ref),
            kind: MRelationKind::GovernedReturnTo,
            from_ref: review.pratibimba_ref.clone(),
            to_ref: identity.pratibimba_ref.clone(),
            source_basis: "M4'-SPEC promotion lifecycle: identity changes only after explicit review/acceptance".to_owned(),
            status: "authored; full application remains ahead".to_owned(),
        },
    ]);

    let manifest = MRelationManifest {
        schema: M_RELATION_MANIFEST_SCHEMA.to_owned(),
        manifest_ref: NARA_M4_RELATION_MANIFEST_REF.to_owned(),
        coordinate_manifest_ref: coordinates.manifest_ref.clone(),
        relations,
    };
    manifest.validate(&coordinates)?;
    Ok(manifest)
}

fn relation_ref(kind: &str, from_ref: &str, to_ref: &str) -> String {
    fn stable(value: &str) -> String {
        value
            .chars()
            .map(|ch| if ch.is_ascii_alphanumeric() { ch } else { '-' })
            .collect::<String>()
            .trim_matches('-')
            .to_owned()
    }
    format!("epi:m-relation:{kind}:{}:{}", stable(from_ref), stable(to_ref))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn every_nara_coordinate_has_an_exact_conjugate_reflection_relation() {
        let coordinates = nara_m4_coordinate_manifest().unwrap();
        let relations = nara_m4_relation_manifest().unwrap();
        for node in &coordinates.nodes {
            assert!(relations.relations.iter().any(|relation| {
                relation.kind == MRelationKind::ConjugateReflects
                    && relation.from_ref == node.bimba_ref
                    && relation.to_ref == node.pratibimba_ref
            }));
        }
    }

    #[test]
    fn nara_lived_return_relations_are_rooted_in_4_4_4_4_and_reviewed_before_identity() {
        let coordinates = nara_m4_coordinate_manifest().unwrap();
        let relations = nara_m4_relation_manifest().unwrap();
        relations.validate(&coordinates).unwrap();

        let m44 = coordinates.resolve_source_ref("#4.4").unwrap();
        let personal = coordinates.resolve_source_ref("#4.4.4.4").unwrap();
        let review = coordinates.resolve_source_ref("#4.5").unwrap();
        let identity = coordinates.resolve_source_ref("#4.0").unwrap();

        assert!(relations.relations.iter().any(|relation| {
            relation.kind == MRelationKind::AnchorsAt
                && relation.from_ref == m44.pratibimba_ref
                && relation.to_ref == personal.pratibimba_ref
        }));
        assert!(relations.relations.iter().any(|relation| {
            relation.kind == MRelationKind::SuppliesEvidenceTo
                && relation.from_ref == personal.pratibimba_ref
                && relation.to_ref == review.pratibimba_ref
        }));
        assert!(relations.relations.iter().any(|relation| {
            relation.kind == MRelationKind::GovernedReturnTo
                && relation.from_ref == review.pratibimba_ref
                && relation.to_ref == identity.pratibimba_ref
        }));
    }
}
