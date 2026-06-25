use serde::Serialize;

use crate::{CoordinateHome, COORDINATE_PROPERTY};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct CoordinatePrefixFamilySpec {
    pub prefix: &'static str,
    pub coordinate_home: CoordinateHome,
    pub source_family: &'static str,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub struct CoordinateSemanticFamilySpec {
    pub prefix: &'static str,
    pub coordinate_home: CoordinateHome,
    pub family_name: &'static str,
    pub semantic_domain: &'static str,
    pub direct_axis: &'static str,
    pub inverted_axis: &'static str,
    pub property_guidance: &'static str,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub struct CoordinatePositionSemanticSpec {
    pub position: u8,
    pub c_role: &'static str,
    pub p_question: &'static str,
    pub p_semantic_dual: &'static str,
    pub property_guidance: &'static str,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub struct CoordinatePropertyConstructionLaw {
    pub identity_property: &'static str,
    pub direct_key_pattern: &'static str,
    pub inverted_key_pattern: &'static str,
    pub inversion_marker: &'static str,
    pub direct_example: &'static str,
    pub inverted_example: &'static str,
    pub position_range: &'static str,
    pub semantic_suffix_grammar: &'static str,
    pub agent_rules: &'static [&'static str],
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub struct CoordinateSemanticRegistry {
    pub families: &'static [CoordinateSemanticFamilySpec],
    pub positions: &'static [CoordinatePositionSemanticSpec],
    pub property_law: CoordinatePropertyConstructionLaw,
    pub authority_paths: &'static [&'static str],
}

pub const COORDINATE_PREFIX_FAMILY_SPECS: &[CoordinatePrefixFamilySpec] = &[
    CoordinatePrefixFamilySpec {
        prefix: "c",
        coordinate_home: CoordinateHome::C,
        source_family: "coordinate",
    },
    CoordinatePrefixFamilySpec {
        prefix: "p",
        coordinate_home: CoordinateHome::P,
        source_family: "position",
    },
    CoordinatePrefixFamilySpec {
        prefix: "l",
        coordinate_home: CoordinateHome::L,
        source_family: "lens",
    },
    CoordinatePrefixFamilySpec {
        prefix: "s",
        coordinate_home: CoordinateHome::S,
        source_family: "system",
    },
    CoordinatePrefixFamilySpec {
        prefix: "t",
        coordinate_home: CoordinateHome::T,
        source_family: "thought",
    },
    CoordinatePrefixFamilySpec {
        prefix: "m",
        coordinate_home: CoordinateHome::M,
        source_family: "psychoid",
    },
    CoordinatePrefixFamilySpec {
        prefix: "q",
        coordinate_home: CoordinateHome::Q,
        source_family: "quickview",
    },
];

pub const COORDINATE_PREFIX_FAMILIES: &[&str] = &["c", "p", "l", "s", "t", "m", "q"];

pub const COORDINATE_SEMANTIC_FAMILY_SPECS: &[CoordinateSemanticFamilySpec] = &[
    CoordinateSemanticFamilySpec {
        prefix: "c",
        coordinate_home: CoordinateHome::C,
        family_name: "Category / C-family",
        semantic_domain: "Ontological identity, source, form, operation, process, context, and integration.",
        direct_axis: "C0-C5 describe the direct categorical unfolding of a thing.",
        inverted_axis: "C0'-C5' carry the reflective VAK ladder: CPF, CT, CP, CF, CFP, CS.",
        property_guidance: "Use c_* for artifact being, identity, source, definition, provenance, structural role, and cross-family grounding. C is the default when the property is about what the artifact is.",
    },
    CoordinateSemanticFamilySpec {
        prefix: "p",
        coordinate_home: CoordinateHome::P,
        family_name: "Position / P-family",
        semantic_domain: "Sixfold positional movement where P contains P' as its implicit inversion: why, what, how, who/which, where/when, why-for.",
        direct_axis: "P0-P5 are the explicate/day positional arc.",
        inverted_axis: "P0'-P5' are the implicit Klein inversion/night positional arc contained within P.",
        property_guidance: "Use p_* when the property names the artifact's positional movement, question-form, complement, phase, or day/night placement.",
    },
    CoordinateSemanticFamilySpec {
        prefix: "l",
        coordinate_home: CoordinateHome::L,
        family_name: "Lens / L-family",
        semantic_domain: "12fold MEF lens manifold: twelve full six-node lens branches attached to M2-1.",
        direct_axis: "L0-L5 are direct lens families: Quaternal, Causal, Logical, Processual, Phenomenological, Para Vak.",
        inverted_axis: "L0'-L5' are the prime lens families: Archetypal-Numerical, Phenomenal, Alchemical-Elemental, Chronological, Scientific, Divine Logos.",
        property_guidance: "Use l_* when the property is truly lens-specific: MEF branch, sixfold lens position, square membership, causal, logical, processual, phenomenological, vak, scientific, logos, elemental, or interpretive modality.",
    },
    CoordinateSemanticFamilySpec {
        prefix: "s",
        coordinate_home: CoordinateHome::S,
        family_name: "System / S-family",
        semantic_domain: "Technical-procedural system spine: stack layers, system-law layers, boundaries, runtime contracts, and implementation responsibilities.",
        direct_axis: "S0-S5 are direct system-spine stack layers from executable adapter through world return.",
        inverted_axis: "S0'-S5' are system-law and reflective runtime inversions of those layers.",
        property_guidance: "Use s_* for technical stack properties: repo paths, protocol roles, runtime boundaries, CRUD ownership, gateway surfaces, sync contracts, S4/S5 agent protocols, improvement law, and implementation provenance.",
    },
    CoordinateSemanticFamilySpec {
        prefix: "t",
        coordinate_home: CoordinateHome::T,
        family_name: "Thought / T-family",
        semantic_domain: "Universal thought planes and localized thought crystallizations.",
        direct_axis: "T0-T5 are universal thought planes.",
        inverted_axis: "T0'-T5' are localized instantiated thoughts and session traces.",
        property_guidance: "Use t_* for thought-plane classification, insight/tracing/challenge/pattern/discovery roles, and Thought/T' archive semantics.",
    },
    CoordinateSemanticFamilySpec {
        prefix: "m",
        coordinate_home: CoordinateHome::M,
        family_name: "Psychoid / M-family",
        semantic_domain: "Bimba psychoid/subsystem coordinates and M' Pratibimba application-expression surfaces.",
        direct_axis: "M0-M5 and children are the full Bimba map coordinates, including M5-2, M5-3, and M5-4 as direct system-spine/expression/protocol branches.",
        inverted_axis: "M' coordinates are Pratibimba/Electron application-expression surfaces and affordances, not replacements for direct M branch names.",
        property_guidance: "Use m_* for psychoid/domain-specific facts, M/M' subsystem semantics, direct Bimba-map branch identity, Nara/Mahamaya/etc. details, and M' implementation/application affordance properties.",
    },
    CoordinateSemanticFamilySpec {
        prefix: "q",
        coordinate_home: CoordinateHome::Q,
        family_name: "Quintessential / Q-family",
        semantic_domain: "Quintessential templates, reusable forms, and world-file synthesis properties.",
        direct_axis: "Q0-Q5 describe direct template/quintessence articulation.",
        inverted_axis: "Q0'-Q5' describe reflective or instantiated template inversions.",
        property_guidance: "Use q_* for Bimba World templates and reusable quintessential form properties rather than ordinary artifact identity.",
    },
];

pub const COORDINATE_POSITION_SEMANTICS: &[CoordinatePositionSemanticSpec] = &[
    CoordinatePositionSemanticSpec {
        position: 0,
        c_role: "Ground / source / origin",
        p_question: "Why?",
        p_semantic_dual: "Ground / source",
        property_guidance: "Use *_0_* for source, ground, provenance, essence, origin references, and source-coordinate links.",
    },
    CoordinatePositionSemanticSpec {
        position: 1,
        c_role: "Form / definition",
        p_question: "What?",
        p_semantic_dual: "Material / definition",
        property_guidance: "Use *_1_* for names, definitions, forms, descriptions, type names, and explicit formal identity.",
    },
    CoordinatePositionSemanticSpec {
        position: 2,
        c_role: "Entity / operation",
        p_question: "How?",
        p_semantic_dual: "Dynamis / operation",
        property_guidance: "Use *_2_* for operational identity, UUIDs, methods, active mechanisms, and procedural handles.",
    },
    CoordinatePositionSemanticSpec {
        position: 3,
        c_role: "Process / canvas",
        p_question: "Who/Which?",
        p_semantic_dual: "Pattern / identity",
        property_guidance: "Use *_3_* for process markers, update times, pattern/canvas references, and execution-flow evidence.",
    },
    CoordinatePositionSemanticSpec {
        position: 4,
        c_role: "Type / context",
        p_question: "Where/When?",
        p_semantic_dual: "Context / horizon",
        property_guidance: "Use *_4_* for contextual role, layer, family, QL position, boundary, invocation kind, and operational horizon.",
    },
    CoordinatePositionSemanticSpec {
        position: 5,
        c_role: "Integration / reflection",
        p_question: "Why-for?",
        p_semantic_dual: "Synthesis / integration",
        property_guidance: "Use *_5_* for integration, embeddings, reflection state, verification, resonance, and synthesis properties.",
    },
];

pub const COORDINATE_PROPERTY_AGENT_RULES: &[&str] = &[
    "coordinate is the canonical identity property and is never replaced by bimbaCoordinate.",
    "Graph labels describe node kind or role; coordinate remains a property.",
    "Construct queryable properties as {family}_{position}_{semantic_suffix}.",
    "For prime/inverted coordinates, insert i after the position: {family}_{position}_i_{semantic_suffix}.",
    "Never spell inversion as prime, inverted, or inversion inside property keys.",
    "semantic_suffix must be lower_snake_case ASCII using lowercase letters, digits, and underscores.",
    "C-family is the ontological default for artifact identity; use non-C families only for genuinely domain-specific facts.",
    "leading families are hints from the artifact class, not restrictions on valid agent reasoning.",
    "Every proposed property must be evidence-backed and schema-validated before Neo4j mutation.",
];

pub const COORDINATE_SEMANTIC_AUTHORITY_PATHS: &[&str] = &[
    "repo-ontology.md",
    "docs/resources/updated-ql-mef/epi_logos_cheat_sheet.md",
    "Idea/Bimba/World/Types/Coordinates",
    "Body/S/S2/graph-schema/src/lib.rs",
];

pub const COORDINATE_PROPERTY_CONSTRUCTION_LAW: CoordinatePropertyConstructionLaw =
    CoordinatePropertyConstructionLaw {
        identity_property: COORDINATE_PROPERTY,
        direct_key_pattern: "{family}_{position}_{semantic_suffix}",
        inverted_key_pattern: "{family}_{position}_i_{semantic_suffix}",
        inversion_marker: "i",
        direct_example: "s_4_runtime_boundary",
        inverted_example: "m_2_i_colour",
        position_range: "0..=5",
        semantic_suffix_grammar:
            "lower_snake_case ASCII: [a-z0-9]+ segments separated by underscores",
        agent_rules: COORDINATE_PROPERTY_AGENT_RULES,
    };

pub fn coordinate_prefix_family_spec(prefix: &str) -> Option<&'static CoordinatePrefixFamilySpec> {
    COORDINATE_PREFIX_FAMILY_SPECS
        .iter()
        .find(|spec| spec.prefix == prefix)
}

pub fn coordinate_prefix_families() -> &'static [&'static str] {
    COORDINATE_PREFIX_FAMILIES
}

pub fn coordinate_semantic_family_specs() -> &'static [CoordinateSemanticFamilySpec] {
    COORDINATE_SEMANTIC_FAMILY_SPECS
}

pub fn coordinate_position_semantics() -> &'static [CoordinatePositionSemanticSpec] {
    COORDINATE_POSITION_SEMANTICS
}

pub fn coordinate_property_construction_law() -> CoordinatePropertyConstructionLaw {
    COORDINATE_PROPERTY_CONSTRUCTION_LAW
}

pub fn coordinate_semantic_registry_authority_paths() -> &'static [&'static str] {
    COORDINATE_SEMANTIC_AUTHORITY_PATHS
}

pub fn coordinate_semantic_registry() -> CoordinateSemanticRegistry {
    CoordinateSemanticRegistry {
        families: COORDINATE_SEMANTIC_FAMILY_SPECS,
        positions: COORDINATE_POSITION_SEMANTICS,
        property_law: COORDINATE_PROPERTY_CONSTRUCTION_LAW,
        authority_paths: COORDINATE_SEMANTIC_AUTHORITY_PATHS,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{label_spec, node_property_spec, relationship_spec};

    #[test]
    fn coordinate_home_is_typed_but_preserves_legacy_string_surface() {
        assert_eq!(CoordinateHome::S2_3Prime.as_str(), "S2-3'");
        assert_eq!(CoordinateHome::S2_3Prime.to_string(), "S2-3'");

        assert_eq!(
            label_spec("Bimba")
                .expect("Bimba label missing")
                .coordinate_home,
            CoordinateHome::C0
        );
        assert_eq!(
            relationship_spec("PROMOTES_TO")
                .expect("PROMOTES_TO relationship missing")
                .coordinate_home,
            CoordinateHome::S1SlashS2
        );
        assert_eq!(
            node_property_spec("c_1_asset_uri")
                .expect("c_1_asset_uri property missing")
                .coordinate_home,
            CoordinateHome::C1
        );
    }
}
