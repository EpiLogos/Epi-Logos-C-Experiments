use crate::relationships::{
    GraphRelationshipTypeSpec, ARENA_DIALOGUE_OF, DIALOGICAL_RESONANCE_AT, WORLD_FORM_OF_RELATION,
    WORLD_ONTOLOGY_OF_RELATION,
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
        coordinate_home: "S1-2",
        source_family: "wikilink",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "SOURCES",
        coordinate_home: "S1-0",
        source_family: "frontmatter",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "CONTAINS",
        coordinate_home: "C0",
        source_family: "coordinate",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "PART_OF",
        coordinate_home: "C0",
        source_family: "coordinate",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "ELABORATES",
        coordinate_home: "T5",
        source_family: "llm-inference",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "CONTRASTS",
        coordinate_home: "L2",
        source_family: "llm-inference",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "IMPLEMENTS",
        coordinate_home: "S4",
        source_family: "llm-inference",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "OPERATES_IN",
        coordinate_home: "S",
        source_family: "llm-inference",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "REFLECTS_AS",
        coordinate_home: "C5",
        source_family: "llm-inference",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "INVERTS_TO",
        coordinate_home: "#",
        source_family: "coordinate",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "SUPPORTS",
        coordinate_home: "P2",
        source_family: "llm-inference",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "CRITIQUES",
        coordinate_home: "L4",
        source_family: "llm-inference",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "DERIVES_FROM",
        coordinate_home: "C1",
        source_family: "llm-inference",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: WORLD_FORM_OF_RELATION,
        coordinate_home: "C0..C5",
        source_family: "world-entity",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: WORLD_ONTOLOGY_OF_RELATION,
        coordinate_home: "C4",
        source_family: "world-entity",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "PROMOTES_TO",
        coordinate_home: "S1/S2",
        source_family: "sync",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "SYNCED_FROM",
        coordinate_home: "S2",
        source_family: "sync",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "POS0_LINKS_TO",
        coordinate_home: "M.compat",
        source_family: "compatibility",
        compatibility: true,
    },
    GraphRelationshipTypeSpec {
        rel_type: "POS5_INTEGRATES_INTO",
        coordinate_home: "M.compat",
        source_family: "compatibility",
        compatibility: true,
    },
    GraphRelationshipTypeSpec {
        rel_type: "GENERATES",
        coordinate_home: "C0",
        source_family: "seed-topology",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "ENTANGLES",
        coordinate_home: "C0",
        source_family: "seed-topology",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "INTERLEAVES",
        coordinate_home: "C0",
        source_family: "seed-topology",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "MANIFESTS",
        coordinate_home: "M",
        source_family: "seed-topology",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "BEDROCK",
        coordinate_home: "M",
        source_family: "seed-topology",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "FAMILY_CONTAINS",
        coordinate_home: "M",
        source_family: "seed-topology",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "MOBIUS_RETURN",
        coordinate_home: "M",
        source_family: "seed-topology",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "ADJACENTLY_ARTICULATES",
        coordinate_home: "C4/L",
        source_family: "harmonic-coordinate",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "MIRRORS_COMPLEMENT",
        coordinate_home: "C4/L",
        source_family: "harmonic-coordinate",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "CROSSES_KNOWING_LIMIT",
        coordinate_home: "C4/L",
        source_family: "harmonic-coordinate",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "INVERTS_THROUGH_FIRST",
        coordinate_home: "C4/L'",
        source_family: "harmonic-coordinate",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "INVERTS_THROUGH_SECOND",
        coordinate_home: "C4/L'",
        source_family: "harmonic-coordinate",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "INVERTS_THROUGH_PAIR",
        coordinate_home: "C4/L'",
        source_family: "harmonic-coordinate",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: "ANCHORED_TO",
        coordinate_home: "CF",
        source_family: "seed-topology",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: ARENA_DIALOGUE_OF,
        coordinate_home: "M4'",
        source_family: "arena-dialogue",
        compatibility: false,
    },
    GraphRelationshipTypeSpec {
        rel_type: DIALOGICAL_RESONANCE_AT,
        coordinate_home: "M4'",
        source_family: "arena-dialogue",
        compatibility: false,
    },
];
