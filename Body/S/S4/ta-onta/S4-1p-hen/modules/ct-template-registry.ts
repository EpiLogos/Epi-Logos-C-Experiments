/**
 * ct-template-registry.ts — CT (S4-1′) → Hen (S1′) artifact-template resolution.
 *
 * CT is the semantic phase-type coordinate: it declares WHICH artifact a step
 * produces or consumes. Hen owns the CT template system (`S4-1p-hen/CONTRACT.md`
 * §"CT Template System"), so the CT→template table lives here and the
 * orchestration surface consumes it rather than carrying its own copy.
 *
 * CANON for the archetype table:
 *   - `Seeds/S/S4/S4'/FLOW-2026-04-24-PI-AGENT-API-v0.1.md:253` — "CT0=seed,
 *     CT1=prompt, CT2=task-spec, CT3=pattern-note, CT4a=integration-preview,
 *     CT4b'=daily-note/NOW, CT5=thought/synthesis".
 *   - `S4-1p-hen/CONTRACT.md` §Archetype Table — the same mapping with CF frames.
 *   - The template Forms state their own CT: `Idea/Bimba/World/FLOW.md`
 *     (`c_1_ctx_type: "CT0"`) and `Idea/Bimba/World/NOW.md` (`c_1_ct_type: "CT4b"`).
 *     That is why CT0 carries `flow` alongside `seed` — both are `(00/00)`
 *     artifacts — and why `now` sits with `daily-note` under CT4b.
 *
 * TWO GAPS, both recorded honestly rather than smoothed over:
 *
 *   1. Bare `CT4` has NO archetype. Canon treats CT4 as the *layer* whose two
 *      phases are CT4a and CT4b (`S4-4-SPEC.md:18`, `S4-4'-SPEC.md:18`: "the
 *      [[P4]] / [[CT4a]]-[[CT4b]] context layer"). A step that declares bare
 *      `CT4` has not said which phase it means, so resolution REFUSES instead of
 *      guessing one — picking `CT4b` because it is the common case would
 *      fabricate a coordinate.
 *   2. `CT4a` = `integration-preview` is real (`epi-cli/src/vault/templates.rs`
 *      renders `Integration-Preview.md`) but was absent from BOTH CT mapping
 *      tables and from `hen_template_invoke`'s parameter union, so the archetype
 *      existed in canon and on disk while being unreachable from either side.
 *
 * The single-table discipline: `CT_TEMPLATE_ARCHETYPES` is the only authored
 * mapping. `TEMPLATE_CT` is DERIVED from it by inversion, so the forward and
 * inverse readings cannot drift, and `templates.rs::template_ct_type` is pinned
 * against this table by a cross-language parity test.
 */

import type { CtLiteral } from "../../shared/vak_address.ts";

/**
 * Every template type Hen can render, i.e. the `template_type` union of
 * `hen_template_invoke` and the arms of `templates.rs::template_form_name`.
 */
export const HEN_TEMPLATE_TYPES = [
  "seed",
  "prompt",
  "task-spec",
  "pattern-note",
  "daily-note",
  "now",
  "flow",
  "thought",
  "integration-preview",
] as const;

export type HenTemplateType = (typeof HEN_TEMPLATE_TYPES)[number];

/**
 * THE authored table: which Hen templates each CT phase-type materialises.
 *
 * An empty array means "no archetype is declared for this CT", which is a
 * different statement from "this CT produces nothing" — see `CT_NO_ARCHETYPE`.
 */
export const CT_TEMPLATE_ARCHETYPES: Readonly<
  Record<CtLiteral, readonly HenTemplateType[]>
> = Object.freeze({
  CT0: Object.freeze(["seed", "flow"] as const),
  CT1: Object.freeze(["prompt"] as const),
  CT2: Object.freeze(["task-spec"] as const),
  CT3: Object.freeze(["pattern-note"] as const),
  CT4: Object.freeze([] as const),
  CT4a: Object.freeze(["integration-preview"] as const),
  CT4b: Object.freeze(["daily-note", "now"] as const),
  CT5: Object.freeze(["thought"] as const),
});

/** Why a CT literal resolves to no template, stated per literal. */
export const CT_NO_ARCHETYPE: Readonly<Partial<Record<CtLiteral, string>>> =
  Object.freeze({
    CT4:
      "CT4 is the context LAYER, not a phase — its phases are CT4a " +
      "(integration-preview) and CT4b (daily-note/now). Declare the phase you " +
      "mean; resolving bare CT4 would fabricate a coordinate.",
  });

/**
 * DERIVED inverse: which CT phase-type a template belongs to.
 *
 * Built by inverting the authored table so the two directions cannot disagree.
 * Every template type is claimed by exactly one CT; the assertion below is a
 * load-bearing check, not decoration — it fails at import time if the authored
 * table ever leaves a template unclaimed or claims one twice.
 */
export const TEMPLATE_CT: Readonly<Record<HenTemplateType, CtLiteral>> = (() => {
  const inverse = {} as Record<HenTemplateType, CtLiteral>;
  for (const [ct, templates] of Object.entries(CT_TEMPLATE_ARCHETYPES)) {
    for (const template of templates) {
      if (inverse[template]) {
        throw new Error(
          `ct-template-registry: ${template} is claimed by both ${inverse[template]} and ${ct}`,
        );
      }
      inverse[template] = ct as CtLiteral;
    }
  }
  const unclaimed = HEN_TEMPLATE_TYPES.filter((t) => !inverse[t]);
  if (unclaimed.length > 0) {
    throw new Error(
      `ct-template-registry: template type(s) with no CT archetype: ${unclaimed.join(", ")}`,
    );
  }
  return Object.freeze(inverse);
})();

export type CtResolution =
  | {
      readonly ct: CtLiteral;
      readonly status: "resolved";
      readonly templates: readonly HenTemplateType[];
    }
  | {
      readonly ct: CtLiteral;
      readonly status: "no-archetype";
      readonly templates: readonly [];
      readonly reason: string;
    };

/**
 * Resolve one CT literal to the Hen templates it materialises.
 *
 * Never throws and never guesses: an unmapped CT comes back as `no-archetype`
 * carrying the reason, so a caller can report which coordinate was under-declared.
 */
export function resolveCtTemplates(ct: CtLiteral): CtResolution {
  const templates = CT_TEMPLATE_ARCHETYPES[ct];
  if (templates && templates.length > 0) {
    return { ct, status: "resolved", templates };
  }
  return {
    ct,
    status: "no-archetype",
    templates: [],
    reason:
      CT_NO_ARCHETYPE[ct] ?? `CT literal ${ct} has no declared Hen template archetype`,
  };
}

export interface ArtifactTemplateResolution {
  /** Every template the declared CT set materialises, de-duplicated, in table order. */
  readonly templates: readonly HenTemplateType[];
  /** CT literals that carry no archetype, with the reason each was refused. */
  readonly unresolved: readonly { readonly ct: CtLiteral; readonly reason: string }[];
}

/**
 * Resolve a step's whole CT declaration (`VakAddress.ct` is an array) to the
 * Hen templates it should materialise.
 *
 * De-duplicates because two CT literals can legitimately name the same template
 * and a step should not be asked to render one artifact twice.
 */
export function resolveArtifactTemplates(
  cts: readonly CtLiteral[],
): ArtifactTemplateResolution {
  const templates: HenTemplateType[] = [];
  const unresolved: { ct: CtLiteral; reason: string }[] = [];
  for (const ct of cts) {
    const resolution = resolveCtTemplates(ct);
    if (resolution.status === "no-archetype") {
      unresolved.push({ ct, reason: resolution.reason });
      continue;
    }
    for (const template of resolution.templates) {
      if (!templates.includes(template)) templates.push(template);
    }
  }
  return { templates, unresolved };
}

/** The CT phase-type a Hen template belongs to. */
export function ctForTemplate(template: HenTemplateType): CtLiteral {
  return TEMPLATE_CT[template];
}

/** Type guard for the Hen template union, for values crossing a wire. */
export function isHenTemplateType(value: unknown): value is HenTemplateType {
  return (
    typeof value === "string" &&
    (HEN_TEMPLATE_TYPES as readonly string[]).includes(value)
  );
}
