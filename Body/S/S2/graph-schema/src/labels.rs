use crate::{
    CoordinateHome, ARCHETYPAL_LABEL, BIMBA_LABEL, GNOSTIC_CORPUS_LABEL, GNOSTIC_ETYMOLOGY_LABEL,
    GNOSTIC_LABEL, GNOSTIC_NOTEBOOK_LABEL, GNOSTIC_SKILLS_LABEL, WORLD_LABEL,
};

pub const BIMBA_LABEL: &str = "Bimba";
pub const WORLD_LABEL: &str = "World";
pub const ARCHETYPAL_LABEL: &str = "Archetypal";
pub const GNOSTIC_LABEL: &str = "Gnostic";
pub const GNOSTIC_CORPUS_LABEL: &str = "Gnostic:Corpus";
pub const GNOSTIC_NOTEBOOK_LABEL: &str = "Gnostic:Notebook";
pub const GNOSTIC_ETYMOLOGY_LABEL: &str = "Gnostic:Etymology";
pub const GNOSTIC_SKILLS_LABEL: &str = "Gnostic:Skills";

pub const COMPAT_LABELS: &[&str] = &[
    "Coordinate",
    "VaultArtifact",
    "MarkdownArtifact",
    "BimbaNode",
    "BimbaCoordinate",
];

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct GraphLabelSpec {
    pub label: &'static str,
    pub coordinate_home: CoordinateHome,
    pub source_family: &'static str,
    pub compatibility: bool,
}

pub const LABEL_SPECS: &[GraphLabelSpec] = &[
    GraphLabelSpec {
        label: "Coordinate",
        coordinate_home: "S2.compat",
        source_family: "compatibility",
        compatibility: true,
    },
    GraphLabelSpec {
        label: "VaultArtifact",
        coordinate_home: "S1.compat",
        source_family: "compatibility",
        compatibility: true,
    },
    GraphLabelSpec {
        label: "MarkdownArtifact",
        coordinate_home: "S1.compat",
        source_family: "compatibility",
        compatibility: true,
    },
    GraphLabelSpec {
        label: "ThoughtArtifact",
        coordinate_home: "T",
        source_family: "thought",
        compatibility: false,
    },
    GraphLabelSpec {
        label: "DailyNote",
        coordinate_home: "S1-4",
        source_family: "vault",
        compatibility: false,
    },
    GraphLabelSpec {
        label: "NowSession",
        coordinate_home: "S1-4'",
        source_family: "vault",
        compatibility: false,
    },
    GraphLabelSpec {
        label: "Psychoid",
        coordinate_home: "M",
        source_family: "coordinate",
        compatibility: false,
    },
    GraphLabelSpec {
        label: "ContextFrame",
        coordinate_home: "CF",
        source_family: "coordinate",
        compatibility: false,
    },
    GraphLabelSpec {
        label: "VakCoordinate",
        coordinate_home: "VAK",
        source_family: "coordinate",
        compatibility: false,
    },
    GraphLabelSpec {
        label: "KernelResonanceObservation",
        coordinate_home: "S2-5",
        source_family: "graph-services",
        compatibility: false,
    },
    GraphLabelSpec {
        label: BIMBA_LABEL,
        coordinate_home: "C0",
        source_family: "namespace",
        compatibility: false,
    },
    GraphLabelSpec {
        label: WORLD_LABEL,
        coordinate_home: "C0..C5",
        source_family: "world-entity",
        compatibility: false,
    },
    GraphLabelSpec {
        label: ARCHETYPAL_LABEL,
        coordinate_home: "C0..C5",
        source_family: "world-entity",
        compatibility: false,
    },
    GraphLabelSpec {
        label: GNOSTIC_LABEL,
        coordinate_home: "S5",
        source_family: "gnostic",
        compatibility: false,
    },
    GraphLabelSpec {
        label: GNOSTIC_CORPUS_LABEL,
        coordinate_home: "S5",
        source_family: "gnostic",
        compatibility: false,
    },
    GraphLabelSpec {
        label: GNOSTIC_NOTEBOOK_LABEL,
        coordinate_home: "S5",
        source_family: "gnostic",
        compatibility: false,
    },
    GraphLabelSpec {
        label: GNOSTIC_ETYMOLOGY_LABEL,
        coordinate_home: "S5",
        source_family: "gnostic",
        compatibility: false,
    },
    GraphLabelSpec {
        label: GNOSTIC_SKILLS_LABEL,
        coordinate_home: "S5",
        source_family: "gnostic",
        compatibility: false,
    },
    GraphLabelSpec {
        label: "Stack",
        coordinate_home: "S",
        source_family: "system",
        compatibility: false,
    },
    GraphLabelSpec {
        label: "BimbaNode",
        coordinate_home: "M.compat",
        source_family: "compatibility",
        compatibility: true,
    },
    GraphLabelSpec {
        label: "BimbaCoordinate",
        coordinate_home: "M.compat",
        source_family: "compatibility",
        compatibility: true,
    },
];

pub fn label_spec(label: &str) -> Option<&'static GraphLabelSpec> {
    LABEL_SPECS.iter().find(|spec| spec.label == label)
}

pub fn compatibility_labels() -> Vec<&'static str> {
    LABEL_SPECS
        .iter()
        .filter(|spec| spec.compatibility)
        .map(|spec| spec.label)
        .collect()
}

pub fn labels_for_coordinate_node(
    coordinate: &str,
    artifact_kind: &str,
) -> Result<Vec<String>, String> {
    if coordinate.trim().is_empty() {
        return Err("coordinate is required for label derivation".to_owned());
    }

    let mut labels = vec!["Bimba".to_owned()];

    let root = coordinate
        .chars()
        .find(|ch| ch.is_ascii_alphabetic())
        .map(|ch| ch.to_ascii_uppercase());
    match root {
        Some('S') => labels.push("Stack".to_owned()),
        Some('M') => labels.push("Psychoid".to_owned()),
        Some('C') if coordinate.starts_with("CF") => labels.push("ContextFrame".to_owned()),
        _ => {}
    }

    match artifact_kind {
        "ThoughtArtifact" | "thought" => labels.push("ThoughtArtifact".to_owned()),
        "DailyNote" | "daily_note" => labels.push("DailyNote".to_owned()),
        "NowSession" | "now_session" => labels.push("NowSession".to_owned()),
        _ => {}
    }

    for label in &labels {
        let Some(spec) = label_spec(label) else {
            return Err(format!("derived unregistered label: {label}"));
        };
        if spec.compatibility {
            return Err(format!("derived compatibility label as canonical: {label}"));
        }
    }

    labels.sort();
    labels.dedup();
    Ok(labels)
}
