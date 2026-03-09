import { z } from "zod";

export const CoordFamily = z.enum(["C", "P", "L", "S", "T", "M", "NONE"]);
export type CoordFamily = z.infer<typeof CoordFamily>;

export const CoordLayer = z.enum(["PSYCHOID", "WEAVE", "CONTEXT_FRAME", "COORDINATE", "VAK"]);
export type CoordLayer = z.infer<typeof CoordLayer>;

export const TopoMode = z.enum(["ZERO_SPHERE", "TORUS", "LEMNISCATE", "KLEIN"]);
export type TopoMode = z.infer<typeof TopoMode>;

export const ContextFrame = z.enum([
  "CF_VOID", "CF_BINARY", "CF_TRIKA", "CF_QUATERNAL",
  "CF_FRACTAL", "CF_SYNTHESIS", "CF_MOBIUS",
]);
export type ContextFrame = z.infer<typeof ContextFrame>;

export const DisclosureLevel = z.enum([
  "UuidOnly", "Identity", "Summary", "Content", "Connected", "Complete",
]);
export type DisclosureLevel = z.infer<typeof DisclosureLevel>;

export const VakCoord = z.enum(["CPF", "CT", "CP", "CF", "CFP", "CS"]);
export type VakCoord = z.infer<typeof VakCoord>;
