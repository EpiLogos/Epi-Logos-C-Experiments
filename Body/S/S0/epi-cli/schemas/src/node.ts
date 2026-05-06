import { z } from "zod";
import { HCCoordinate } from "./coordinate.js";
import { CoordLayer, TopoMode } from "./enums.js";

/**
 * Ring 3: HCNode — the storage shape for Neo4j and Obsidian.
 * Extends HCCoordinate with all properties needed for persistent storage.
 * Maps to Bimba node properties in Neo4j and YAML frontmatter in Obsidian.
 */
export const HCNode = HCCoordinate.extend({
  /** Deterministic UUID v5 (Epi-Logos namespace) */
  uuid: z.string().uuid(),
  /** Human-readable name */
  name: z.string().min(1),
  layer: CoordLayer,
  topoMode: TopoMode,
  /** Pithy self-description (S0' compression trika) */
  essence: z.string().nullable(),
  description: z.string().nullable(),
  /** Obsidian vault file path */
  vaultPath: z.string().nullable(),
  /** Vector embedding (768/1536/3072 dims) */
  semanticEmbedding: z.array(z.number()).nullable(),
  /** ISO 8601 timestamps */
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export type HCNode = z.infer<typeof HCNode>;
