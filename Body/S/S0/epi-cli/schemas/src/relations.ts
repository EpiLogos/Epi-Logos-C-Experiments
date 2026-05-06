import { z } from "zod";

/**
 * All 34 canonical Neo4j relation types.
 * Source: ql_schema.ts in .pi/extensions/s_i/modules/ql_graph/
 */
export const RELATION_TYPES = [
  // P (9)
  "P_0_LINKS_TO", "P_0_GROUNDS", "P_1_DEFINES", "P_1_REQUIRES",
  "P_2_OPERATES_VIA", "P_3_INSTANTIATES", "P_4_SITUATED_IN",
  "P_4_PERSPECTIVE_ON", "P_5_INTEGRATES_INTO",
  // T (5)
  "T_1_EXTRACTED_FROM", "T_3_DUPLICATES", "T_3_THREAD_OF",
  "T_5_CRYSTALLIZED_TO", "T_5_CRYSTALLIZED_FROM",
  // S (12)
  "S_2_CONTAINS", "S_3_ORPHANED", "S_3_BLOCKED_BY", "S_3_DEPENDS_ON", "S_3_REGISTERS",
  "S_4_SPAWNED", "S_4_SESSION_OF", "S_4_TRANSITIONED_TO",
  "S_4_COMMUNICATED", "S_4_MODULATED_TO", "S_4_HANDED_OFF_TO", "S_5_REFLECTS",
  // C (4)
  "C_0_LINKS_TO", "C_0_RELATES_TO", "C_4_CLASSIFIES", "C_4_CLASSIFIED",
  // M (3)
  "M_3_ARCHIVED", "M_5_MOBIUS_RETURN", "M_5_BIMBA_FORM",
  // Agent (1)
  "ALETHEIA_VERIFIES",
] as const;

export type RelationType = (typeof RELATION_TYPES)[number];

export const RelationType = z.enum(RELATION_TYPES);
