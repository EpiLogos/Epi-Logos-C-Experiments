use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, BTreeSet};

pub const M_COORDINATE_MANIFEST_SCHEMA: &str = "epi.m-coordinate-manifest/v1";
pub const NARA_M4_MANIFEST_REF: &str = "epi:m-coordinate-manifest:nara-m4:v1";

#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum MFace {
    Bimba,
    Pratibimba,
}

#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MCoordinate {
    pub root: u8,
    pub path: Vec<u16>,
    pub face: MFace,
}

impl MCoordinate {
    pub fn new(root: u8, path: impl Into<Vec<u16>>, face: MFace) -> Result<Self, String> {
        if root > 5 {
            return Err(format!("M root must be 0..5, got {root}"));
        }
        Ok(Self {
            root,
            path: path.into(),
            face,
        })
    }

    pub fn bimba(root: u8, path: impl Into<Vec<u16>>) -> Result<Self, String> {
        Self::new(root, path, MFace::Bimba)
    }

    pub fn notation(&self) -> String {
        let mut value = format!("M{}", self.root);
        for segment in &self.path {
            value.push('-');
            value.push_str(&segment.to_string());
        }
        if self.face == MFace::Pratibimba {
            value.push('\'');
        }
        value
    }

    pub fn canonical_ref(&self) -> String {
        format!("epi:m-coordinate:{}", self.notation())
    }

    pub fn reflected(&self) -> Self {
        Self {
            root: self.root,
            path: self.path.clone(),
            face: match self.face {
                MFace::Bimba => MFace::Pratibimba,
                MFace::Pratibimba => MFace::Bimba,
            },
        }
    }

    pub fn parent(&self) -> Option<Self> {
        if self.path.is_empty() {
            return None;
        }
        let mut path = self.path.clone();
        path.pop();
        Some(Self {
            root: self.root,
            path,
            face: self.face,
        })
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum CoordinateImplementationState {
    Partial,
    Unbound,
    Research,
    NotAssessed,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MCoordinateNode {
    pub bimba: MCoordinate,
    pub pratibimba: MCoordinate,
    pub bimba_ref: String,
    pub pratibimba_ref: String,
    pub source_ref: String,
    pub parent_bimba_ref: Option<String>,
    pub name: String,
    pub implementation_state: CoordinateImplementationState,
    pub current_realisation: Option<String>,
}

impl MCoordinateNode {
    fn new(
        path: &[u16],
        source_ref: &str,
        name: &str,
        implementation_state: CoordinateImplementationState,
        current_realisation: Option<&str>,
    ) -> Result<Self, String> {
        let bimba = MCoordinate::bimba(4, path.to_vec())?;
        let pratibimba = bimba.reflected();
        let parent_bimba_ref = bimba.parent().map(|parent| parent.canonical_ref());
        Ok(Self {
            bimba_ref: bimba.canonical_ref(),
            pratibimba_ref: pratibimba.canonical_ref(),
            bimba,
            pratibimba,
            source_ref: source_ref.to_owned(),
            parent_bimba_ref,
            name: name.to_owned(),
            implementation_state,
            current_realisation: current_realisation.map(ToOwned::to_owned),
        })
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MCoordinateManifest {
    pub schema: String,
    pub manifest_ref: String,
    pub domain: String,
    pub source_documents: Vec<String>,
    pub nodes: Vec<MCoordinateNode>,
}

impl MCoordinateManifest {
    pub fn resolve_bimba(&self, coordinate: &MCoordinate) -> Option<&MCoordinateNode> {
        self.nodes.iter().find(|node| node.bimba == *coordinate)
    }

    pub fn resolve_source_ref(&self, source_ref: &str) -> Option<&MCoordinateNode> {
        self.nodes.iter().find(|node| node.source_ref == source_ref)
    }

    pub fn validate(&self) -> Result<(), String> {
        if self.schema != M_COORDINATE_MANIFEST_SCHEMA {
            return Err(format!("unsupported M coordinate manifest schema `{}`", self.schema));
        }
        if self.nodes.is_empty() {
            return Err("M coordinate manifest must contain at least one node".to_owned());
        }

        let by_ref: BTreeMap<&str, &MCoordinateNode> = self
            .nodes
            .iter()
            .map(|node| (node.bimba_ref.as_str(), node))
            .collect();
        if by_ref.len() != self.nodes.len() {
            return Err("M coordinate manifest contains duplicate bimba coordinates".to_owned());
        }

        let source_refs: BTreeSet<&str> = self.nodes.iter().map(|node| node.source_ref.as_str()).collect();
        if source_refs.len() != self.nodes.len() {
            return Err("M coordinate manifest contains duplicate source coordinate refs".to_owned());
        }

        for node in &self.nodes {
            if node.bimba.face != MFace::Bimba || node.pratibimba.face != MFace::Pratibimba {
                return Err(format!("coordinate {} has an invalid face pair", node.source_ref));
            }
            if node.bimba.root != node.pratibimba.root || node.bimba.path != node.pratibimba.path {
                return Err(format!("coordinate {} loses path identity across reflection", node.source_ref));
            }
            if node.bimba_ref != node.bimba.canonical_ref()
                || node.pratibimba_ref != node.pratibimba.canonical_ref()
            {
                return Err(format!("coordinate {} has a non-canonical executable ref", node.source_ref));
            }
            if let Some(parent) = node.parent_bimba_ref.as_deref() {
                if !by_ref.contains_key(parent) {
                    return Err(format!("coordinate {} is missing parent {parent}", node.source_ref));
                }
            }
        }

        self.validate_sixfold_children(&MCoordinate::bimba(4, Vec::<u16>::new())?)?;
        for position in 0u16..6 {
            self.validate_sixfold_children(&MCoordinate::bimba(4, vec![position])?)?;
        }
        Ok(())
    }

    fn validate_sixfold_children(&self, parent: &MCoordinate) -> Result<(), String> {
        let expected_parent = parent.canonical_ref();
        let mut observed = BTreeSet::new();
        for node in &self.nodes {
            if node.parent_bimba_ref.as_deref() == Some(expected_parent.as_str()) {
                if let Some(last) = node.bimba.path.last() {
                    if *last <= 5 {
                        observed.insert(*last);
                    }
                }
            }
        }
        let expected: BTreeSet<u16> = (0u16..6).collect();
        if observed != expected {
            return Err(format!(
                "{} must preserve the complete 0..5 sixfold; observed {:?}",
                parent.notation(), observed
            ));
        }
        Ok(())
    }
}

/// Executable reflection of the currently authored Nara/M4 coordinate floor.
///
/// Coordinate existence is deliberately independent from implementation
/// completeness. A node remains addressable when its current M' capability is
/// unbound or research-only; implementation state may deepen without changing
/// the Bimba path it answers to.
pub fn nara_m4_coordinate_manifest() -> Result<MCoordinateManifest, String> {
    let mut nodes = Vec::new();
    nodes.push(MCoordinateNode::new(
        &[],
        "#4",
        "Nara — Personal / Dialogical Interface",
        CoordinateImplementationState::Partial,
        Some("M4' protected personal field; Prompt-B daily vertical is one realised path"),
    )?);

    let branches: [(u16, &str, &str, CoordinateImplementationState, Option<&str>); 6] = [
        (0, "#4.0", "Mahamaya Identity Matrix", CoordinateImplementationState::Partial, Some("protected identity/personal-field handles; personal identity substrate exists but is not the daily surface")),
        (1, "#4.1", "Sympathetic Medicine", CoordinateImplementationState::Unbound, Some("native somatic/medicinal substrate exists; no Prompt-B provider binding")),
        (2, "#4.2", "Divinatory Frameworks", CoordinateImplementationState::Unbound, Some("oracle/transcription substrate is separately present; daily journal does not promote itself to oracle")),
        (3, "#4.3", "Mediating Transformation", CoordinateImplementationState::Partial, Some("journal parser yields bounded observations; full PatternPacket/cross-dialect engine remains ahead")),
        (4, "#4.4", "Context & Lenses", CoordinateImplementationState::Partial, Some("Prompt-B DAY episode, daily note, parser and bounded selection are realised here")),
        (5, "#4.5", "Epii Integration", CoordinateImplementationState::Partial, Some("governed selected-context sendoff exists; full review/promotion loop belongs to later 4/5/0 work")),
    ];
    for (position, source_ref, name, state, realisation) in branches {
        nodes.push(MCoordinateNode::new(&[position], source_ref, name, state, realisation)?);
    }

    let children: [(u16, [&str; 6], [&str; 6]); 6] = [
        (
            0,
            ["#4.0-0", "#4.0-1", "#4.0-2", "#4.0-3", "#4.0-4", "#4.0-5"],
            ["Birthdate / Numerological Encoding", "Astrological / Natal Chart", "Jungian / Typological Assessment", "Gene Keys / 64-Code Bridge", "Human Design / BodyGraph", "Identity Quintessence"],
        ),
        (
            1,
            ["#4.1-0", "#4.1-1", "#4.1-2", "#4.1-3", "#4.1-4", "#4.1-5"],
            ["Elemental Ground", "Energy-Body Architecture", "Materia & Reagents", "Operations & Techne", "Temporal Astrological Intelligence", "Integration, Safety & Feedback"],
        ),
        (
            2,
            ["#4.2-0", "#4.2-1", "#4.2-2", "#4.2-3", "#4.2-4", "#4.2-5"],
            ["Common Substrate", "Tarot Engines", "I-Ching Integration", "Casting & Randomness Layer", "Interpretation Layer", "Divinatory Hygiene & Pedagogy"],
        ),
        (
            3,
            ["#4.3-0", "#4.3-1", "#4.3-2", "#4.3-3", "#4.3-4", "#4.3-5"],
            ["Cycle Engine", "Operational Grammar (Alchemy)", "Dialogical & Inquiry Containers", "Control / Chaos & Safety", "Protocol Library (Storey Packets)", "Telemetry & Phase History"],
        ),
        (
            4,
            ["#4.4.0", "#4.4.1", "#4.4.2", "#4.4.3", "#4.4.4", "#4.4.5"],
            ["Gebser Lens", "Ontological Lens", "Epistemological Lens", "Jungian Depth Psychology Lens", "Phenomenological Lens", "Trika / Kashmir Saivism Lens"],
        ),
        (
            5,
            ["#4.5-0", "#4.5-1", "#4.5-2", "#4.5-3", "#4.5-4", "#4.5-5"],
            ["Curriculum Map", "Core Epi-Logos Voice", "Method Transparency Lab", "Integration Lab", "Pedagogy Lab", "Logos Cycle Engine"],
        ),
    ];

    for (branch, source_refs, names) in children {
        for position in 0u16..6 {
            nodes.push(MCoordinateNode::new(
                &[branch, position],
                source_refs[position as usize],
                names[position as usize],
                CoordinateImplementationState::NotAssessed,
                None,
            )?);
        }
    }

    nodes.push(MCoordinateNode::new(
        &[4, 4, 4],
        "#4.4.4.4",
        "Personal Pratibimba / Personal Nexus",
        CoordinateImplementationState::Partial,
        Some("protected living update carrier for day/activity evidence; identity promotion remains reviewed"),
    )?);

    let manifest = MCoordinateManifest {
        schema: M_COORDINATE_MANIFEST_SCHEMA.to_owned(),
        manifest_ref: NARA_M4_MANIFEST_REF.to_owned(),
        domain: "M4 / M4' — Nara".to_owned(),
        source_documents: vec![
            "Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md".to_owned(),
            "Idea/Bimba/Seeds/M/M4'/M4-ARCHITECTURE.md".to_owned(),
            "Idea/Bimba/Seeds/M/M4'/m4-prime-nara-activity-graphiti-instrument.md".to_owned(),
            "Idea/Pratibimba/System/Subsystems/Nara/nara-ux-full-m4-branch-update.md".to_owned(),
        ],
        nodes,
    };
    manifest.validate()?;
    Ok(manifest)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn coordinate_reflection_preserves_the_exact_path() {
        let bimba = MCoordinate::bimba(4, vec![4, 4, 4]).unwrap();
        let pratibimba = bimba.reflected();
        assert_eq!(bimba.notation(), "M4-4-4-4");
        assert_eq!(pratibimba.notation(), "M4-4-4-4'");
        assert_eq!(bimba.path, pratibimba.path);
        assert_ne!(bimba.face, pratibimba.face);
    }

    #[test]
    fn nara_manifest_preserves_sixfold_structure_at_root_and_first_granular_layer() {
        let manifest = nara_m4_coordinate_manifest().unwrap();
        assert_eq!(manifest.nodes.len(), 44);
        manifest.validate().unwrap();
        for position in 0u16..6 {
            let coordinate = MCoordinate::bimba(4, vec![position]).unwrap();
            assert!(manifest.resolve_bimba(&coordinate).is_some());
            for child in 0u16..6 {
                let child_coordinate = MCoordinate::bimba(4, vec![position, child]).unwrap();
                assert!(manifest.resolve_bimba(&child_coordinate).is_some());
            }
        }
    }

    #[test]
    fn personal_pratibimba_is_a_recursive_m4_4_coordinate_not_a_seventh_branch() {
        let manifest = nara_m4_coordinate_manifest().unwrap();
        let node = manifest.resolve_source_ref("#4.4.4.4").unwrap();
        assert_eq!(node.bimba.notation(), "M4-4-4-4");
        assert_eq!(node.pratibimba.notation(), "M4-4-4-4'");
        assert_eq!(node.parent_bimba_ref.as_deref(), Some("epi:m-coordinate:M4-4-4"));
    }
}
