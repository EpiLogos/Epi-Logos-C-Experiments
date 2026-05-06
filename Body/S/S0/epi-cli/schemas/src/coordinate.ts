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
