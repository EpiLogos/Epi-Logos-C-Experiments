use crate::{
    relationships::{
        GraphRelationshipTypeSpec, ARENA_DIALOGUE_OF, DIALOGICAL_RESONANCE_AT,
        WORLD_FORM_OF_RELATION, WORLD_ONTOLOGY_OF_RELATION,
    },
    CoordinateHome,
};

pub const RELATION_FAMILY_PROPERTY: &str = "c_1_relation_family";
pub const RELATION_FAMILY_STRUCTURAL: &str = "structural";
pub const RELATION_FAMILY_CORRESPONDENTIAL: &str = "correspondential";
pub const RELATION_FAMILY_KERNEL_CORE: &str = "kernel_core";
pub const RELATION_FAMILY_INFERRED: &str = "inferred";
pub const RELATION_FAMILY_SYNC: &str = "sync";
pub const RELATION_FAMILY_COMPATIBILITY: &str = "compatibility";
pub const RELATION_FAMILY_VALUES: &[&str] = &[
    RELATION_FAMILY_STRUCTURAL,
    RELATION_FAMILY_CORRESPONDENTIAL,
    RELATION_FAMILY_KERNEL_CORE,
    RELATION_FAMILY_INFERRED,
    RELATION_FAMILY_SYNC,
    RELATION_FAMILY_COMPATIBILITY,
];

pub const RELATIONSHIP_TYPE_SPECS: &[GraphRelationshipTypeSpec] = &[
    GraphRelationshipTypeSpec {
        rel_type: "REFERENCES",
        coordinate_home: CoordinateHome::S1_2,
        source_family: "wikilink",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "SOURCES",
        coordinate_home: CoordinateHome::S1_0,
        source_family: "frontmatter",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "CONTAINS",
        coordinate_home: CoordinateHome::C0,
        source_family: "coordinate",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "PART_OF",
        coordinate_home: CoordinateHome::C0,
        source_family: "coordinate",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "ELABORATES",
        coordinate_home: CoordinateHome::T5,
        source_family: "llm-inference",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "CONTRASTS",
        coordinate_home: CoordinateHome::L2,
        source_family: "llm-inference",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "IMPLEMENTS",
        coordinate_home: CoordinateHome::S4,
        source_family: "llm-inference",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "OPERATES_IN",
        coordinate_home: CoordinateHome::S,
        source_family: "llm-inference",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "REFLECTS_AS",
        coordinate_home: CoordinateHome::C5,
        source_family: "llm-inference",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "INVERTS_TO",
        coordinate_home: CoordinateHome::Root,
        source_family: "coordinate",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "SUPPORTS",
        coordinate_home: CoordinateHome::P2,
        source_family: "llm-inference",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "CRITIQUES",
        coordinate_home: CoordinateHome::L4,
        source_family: "llm-inference",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "DERIVES_FROM",
        coordinate_home: CoordinateHome::C1,
        source_family: "llm-inference",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: WORLD_FORM_OF_RELATION,
        coordinate_home: CoordinateHome::C0ThroughC5,
        source_family: "world-entity",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: WORLD_ONTOLOGY_OF_RELATION,
        coordinate_home: CoordinateHome::C4,
        source_family: "world-entity",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "PROMOTES_TO",
        coordinate_home: CoordinateHome::S1SlashS2,
        source_family: "sync",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "SYNCED_FROM",
        coordinate_home: CoordinateHome::S2,
        source_family: "sync",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "POS0_LINKS_TO",
        coordinate_home: CoordinateHome::MCompat,
        source_family: "compatibility",
        compatibility: true,
    },
    GraphRelationshipTypeSpec {
        rel_type: "POS5_INTEGRATES_INTO",
        coordinate_home: CoordinateHome::MCompat,
        source_family: "compatibility",
        compatibility: true,
    },
    GraphRelationshipTypeSpec {
        rel_type: "GENERATES",
        coordinate_home: CoordinateHome::C0,
        source_family: "seed-topology",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "ENTANGLES",
        coordinate_home: CoordinateHome::C0,
        source_family: "seed-topology",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "INTERLEAVES",
        coordinate_home: CoordinateHome::C0,
        source_family: "seed-topology",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "MANIFESTS",
        coordinate_home: CoordinateHome::M,
        source_family: "seed-topology",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "BEDROCK",
        coordinate_home: CoordinateHome::M,
        source_family: "seed-topology",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "FAMILY_CONTAINS",
        coordinate_home: CoordinateHome::M,
        source_family: "seed-topology",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "MOBIUS_RETURN",
        coordinate_home: CoordinateHome::M,
        source_family: "seed-topology",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "ADJACENTLY_ARTICULATES",
        coordinate_home: CoordinateHome::C4SlashL,
        source_family: "harmonic-coordinate",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "MIRRORS_COMPLEMENT",
        coordinate_home: CoordinateHome::C4SlashL,
        source_family: "harmonic-coordinate",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "CROSSES_KNOWING_LIMIT",
        coordinate_home: CoordinateHome::C4SlashL,
        source_family: "harmonic-coordinate",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "INVERTS_THROUGH_FIRST",
        coordinate_home: CoordinateHome::C4SlashLPrime,
        source_family: "harmonic-coordinate",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "INVERTS_THROUGH_SECOND",
        coordinate_home: CoordinateHome::C4SlashLPrime,
        source_family: "harmonic-coordinate",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "INVERTS_THROUGH_PAIR",
        coordinate_home: CoordinateHome::C4SlashLPrime,
        source_family: "harmonic-coordinate",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "ANCHORED_TO",
        coordinate_home: CoordinateHome::CF,
        source_family: "seed-topology",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: ARENA_DIALOGUE_OF,
        coordinate_home: CoordinateHome::M4Prime,
        source_family: "arena-dialogue",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: DIALOGICAL_RESONANCE_AT,
        coordinate_home: CoordinateHome::M4Prime,
        source_family: "arena-dialogue",
        compatibility: false,
    },
];
