import { z } from "zod";
import { HCIdentity } from "./identity.js";

const coordRef = z.string().min(1).nullable();

/**
 * Ring 2: HCCoordinate — identity + 12-fold pointer web.
 * Maps to the 12 Holographic_Coordinate* pointers (96 bytes) in ontology.h.
 * In TS these are string references to other coordinates, or null.
 */
export const HCCoordinate = HCIdentity.extend({
  // 6 base family links (maps to c, p, l, s, t, m pointers)
  c: coordRef,
  p: coordRef,
  l: coordRef,
  s: coordRef,
  t: coordRef,
  m: coordRef,
  // 6 reflective/contextual links (maps to cpf, ct, cp, cf, cfp, cs pointers)
  cpf: coordRef,
  ct: coordRef,
  cp: coordRef,
  cf: coordRef,
  cfp: coordRef,
  cs: coordRef,
});

export type HCCoordinate = z.infer<typeof HCCoordinate>;

export const HCPointerRing = z.enum(["family", "position", "lens"]);
export const HCHelix = z.enum(["bimba", "pratibimba", "cross"]);
export const HCRelationRole = z.enum([
  "family_link",
  "position_identity",
  "inversion_spanda",
  "epogdoon_tick",
  "mirror_xy5",
  "mobius_return",
  "position_project",
  "lens_anchor",
  "context_frame",
]);
export const HCIntervalRole = z.enum([
  "none",
  "semitone",
  "whole_tone",
  "tritone",
  "totality_16_9",
  "octave",
]);
export const HCRatioRole = z.enum([
  "none",
  "unison",
  "epogdoon",
  "fourth",
  "fifth",
  "totality",
  "octave",
]);

export const HCBedrockRole = z.enum([
  "hash_operator",
  "psychoid_number",
  "inverted_psychoid",
]);

export const HCBedrockRef = z.object({
  target: coordRef,
  index: z.number().int().min(0).max(5),
  qlPosition: z.union([z.number().int().min(0).max(5), z.literal(255)]),
  bedrockRole: HCBedrockRole,
  relationRole: HCRelationRole,
  intervalRole: HCIntervalRole,
  ratioRole: HCRatioRole,
  pitchClass: z.number().int().min(0).max(11),
});

export const HCBedrockWeb7 = z.object({
  hash: HCBedrockRef.extend({
    qlPosition: z.literal(255),
    bedrockRole: z.literal("hash_operator"),
    relationRole: z.literal("inversion_spanda"),
  }),
  psychoid: z.array(HCBedrockRef.extend({
    bedrockRole: z.literal("psychoid_number"),
  })).length(6),
  successor: z.array(HCBedrockRef.extend({
    bedrockRole: z.literal("psychoid_number"),
  })).length(6),
  inversion: z.array(HCBedrockRef.extend({
    bedrockRole: z.literal("inverted_psychoid"),
    relationRole: z.literal("inversion_spanda"),
    intervalRole: z.literal("semitone"),
  })).length(6),
});

export const HCPointerRef = z.object({
  target: coordRef,
  ring: HCPointerRing,
  index: z.number().int().min(0).max(11),
  qlPosition: z.number().int().min(0).max(5),
  helix: HCHelix,
  relationRole: HCRelationRole,
  intervalRole: HCIntervalRole,
  ratioRole: HCRatioRole,
  pitchClass: z.number().int().min(0).max(11),
});

export const HCPointerWeb36 = z.object({
  family: z.array(HCPointerRef).length(12),
  position: z.array(HCPointerRef).length(12),
  lens: z.array(HCPointerRef).length(12),
});

export const HCContextFrameRef = z.object({
  target: coordRef,
  cfIndex: z.number().int().min(0).max(6),
  notation: z.enum([
    "(00/00)",
    "(0/1)",
    "(0/1/2)",
    "(0/1/2/3)",
    "(4.0/1-4.4/5)",
    "(4.5/0)",
    "(5/0)",
  ]),
  diatonicDegree: z.number().int().min(1).max(7),
  modeAnchor: z.number().int().min(0).max(6),
  qlPosition: z.number().int().min(0).max(5),
  helix: HCHelix,
  relationRole: z.literal("context_frame"),
  pitchClass: z.number().int().min(0).max(11),
});

export const HCContextFrameWeb7 = z.object({
  frame: z.array(HCContextFrameRef).length(7),
});

export type HCPointerRef = z.infer<typeof HCPointerRef>;
export type HCPointerWeb36 = z.infer<typeof HCPointerWeb36>;
export type HCBedrockRef = z.infer<typeof HCBedrockRef>;
export type HCBedrockWeb7 = z.infer<typeof HCBedrockWeb7>;
export type HCContextFrameRef = z.infer<typeof HCContextFrameRef>;
export type HCContextFrameWeb7 = z.infer<typeof HCContextFrameWeb7>;
