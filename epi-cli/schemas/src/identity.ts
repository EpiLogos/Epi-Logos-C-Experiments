import { z } from "zod";
import { CoordFamily } from "./enums.js";

/**
 * Ring 1: HCIdentity — the 8-byte kernel.
 * Maps to the first 8 bytes of struct Holographic_Coordinate in ontology.h.
 * Every system (Neo4j, Obsidian, Pi agent) shares this irreducible core.
 */
export const HCIdentity = z.object({
  /** Primary key: "#", "#0"-"#5", "M4", "CF_TRIKA", "CPF", etc. */
  coordinate: z.string().min(1),
  /** 0-5 for positions, 255 (0xFF) for the # node */
  qlPosition: z.number().int().refine(
    (n) => (n >= 0 && n <= 5) || n === 255,
    { message: "qlPosition must be 0-5 or 255" }
  ),
  family: CoordFamily,
  /** 0 = normal, 1 = inverted (result of # operation) */
  inversionState: z.literal(0).or(z.literal(1)),
  /** 8-bit flags byte (see FLAGS constants) */
  flags: z.number().int().min(0).max(255),
  /** Interlaced weave fraction: 0.0, 0.5, 1.0, ..., 5.5 */
  weaveState: z.number(),
});

export type HCIdentity = z.infer<typeof HCIdentity>;
