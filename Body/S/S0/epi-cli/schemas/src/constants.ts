// Mirrors seed.rs and ontology.h .rodata exactly

export const FAMILIES = ["C", "P", "L", "S", "T", "M"] as const;

export const FAMILY_NAMES: readonly (readonly string[])[] = [
  ["Bimba", "Form", "Entity", "Process", "Type", "Pratibimba"],       // C
  ["Ground", "Definition", "Operation", "Pattern", "Context", "Integration"], // P
  ["Literal", "Functional", "Structural", "Archetypal", "Paradigmatic", "Integral"], // L
  ["Terminal", "Obsidian", "Neo4j", "Gateway", "PiAgent", "Sync"],    // S
  ["Questions", "Traces", "Challenges", "Patterns", "Discovery", "Insight"], // T
  ["Anuttara", "Paramasiva", "Parashakti", "Mahamaya", "Nara", "Epii"], // M
];

export const PSYCHOID_NAMES = [
  "Ground", "Form", "Operation", "Pattern", "Context", "Integration",
] as const;

export const PSYCHOID_TOPO = [
  "ZERO_SPHERE", "TORUS", "TORUS", "TORUS", "LEMNISCATE", "ZERO_SPHERE",
] as const;

export const WEAVE_COORDS: readonly (readonly [string, number])[] = [
  ["Weave_0_0", 0.0],
  ["Weave_0_5", 0.5],
  ["Weave_5_0", 5.0],
  ["Weave_5_5", 5.5],
];

export const CF_NAMES = [
  "CF_VOID", "CF_BINARY", "CF_TRIKA", "CF_QUATERNAL",
  "CF_FRACTAL", "CF_SYNTHESIS", "CF_MOBIUS",
] as const;

export const VAK_NAMES = ["CPF", "CT", "CP", "CF", "CFP", "CS"] as const;

/** Family enum ordinal (matches Coordinate_Family in ontology.h) */
export const FAMILY_ORDINAL: Record<string, number> = {
  C: 0, P: 1, L: 2, S: 3, T: 4, M: 5, NONE: 7,
};

/** Flags byte constants (ontology.h) */
export const FLAGS = {
  STATUS_CANONICAL: 0x01,
  STATUS_PROVISIONAL: 0x02,
  FLAG_BIMBA: 0x20,
  BIMBA_FLAGS: 0x21,
  TOPO_TORUS: 0x00,
  TOPO_LEMNISCATE: 0x40,
  TOPO_KLEIN: 0x80,
  TOPO_ZERO_SPHERE: 0xc0,
} as const;
