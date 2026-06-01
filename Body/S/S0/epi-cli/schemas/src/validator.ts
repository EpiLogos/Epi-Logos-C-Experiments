import { z } from "zod";
import { CF_NAMES, VAK_NAMES, FAMILIES } from "./constants.js";
import type { CoordLayer } from "./enums.js";

export interface ParsedCoordinate {
  bimbaCoordinate: string;
  layer: CoordLayer;
  family: string | null;
  qlPosition: number | null;
  inverted: boolean;
}

/**
 * Parse a coordinate string into structured form.
 * Port of Rust CoordinateArrayParser::parse_one from coordinate_array_parser.rs.
 */
export function parseCoordinate(input: string): ParsedCoordinate | null {
  const s = input.trim();
  if (!s) return null;

  // # (hash alone)
  if (s === "#") {
    return { bimbaCoordinate: "#", layer: "PSYCHOID", family: null, qlPosition: null, inverted: false };
  }

  // Psychoids: #0-#5
  if (s.startsWith("#") && s.length === 2) {
    const d = parseInt(s[1], 10);
    if (!isNaN(d) && d >= 0 && d <= 5) {
      return { bimbaCoordinate: s, layer: "PSYCHOID", family: null, qlPosition: d, inverted: false };
    }
    return null;
  }

  // Weaves: Weave_*
  if (s.startsWith("Weave_")) {
    return { bimbaCoordinate: s, layer: "WEAVE", family: null, qlPosition: null, inverted: false };
  }

  // Context frames: CF_*
  const cfIdx = (CF_NAMES as readonly string[]).indexOf(s);
  if (cfIdx !== -1) {
    return { bimbaCoordinate: s, layer: "CONTEXT_FRAME", family: null, qlPosition: cfIdx, inverted: false };
  }

  // VAK: CPF, CT, CP, CF, CFP, CS
  const vakIdx = (VAK_NAMES as readonly string[]).indexOf(s);
  if (vakIdx !== -1) {
    return { bimbaCoordinate: s, layer: "VAK", family: null, qlPosition: vakIdx, inverted: false };
  }

  // Family coordinates: {F}{0-5} or {F}{0-5}'
  const inverted = s.endsWith("'");
  const base = inverted ? s.slice(0, -1) : s;
  if (base.length === 2) {
    const fam = base[0];
    const pos = parseInt(base[1], 10);
    if ((FAMILIES as readonly string[]).includes(fam) && !isNaN(pos) && pos >= 0 && pos <= 5) {
      return { bimbaCoordinate: s, layer: "COORDINATE", family: fam, qlPosition: pos, inverted };
    }
  }

  return null;
}

/** Check if a string is a valid bimba coordinate. */
export function isValidCoordinate(input: string): boolean {
  return parseCoordinate(input) !== null;
}

/** Zod string schema that validates bimba coordinate format. */
export const BimbaCoordinate = z.string().refine(isValidCoordinate, {
  message: "Invalid bimba coordinate",
});

export type BimbaCoordinate = z.infer<typeof BimbaCoordinate>;
