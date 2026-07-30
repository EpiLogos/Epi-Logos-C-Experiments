/**
 * Coordinate: M' M5-5' (the Logos Atelier's honest seam register — 28.T28.7)
 * Residency: Body/M/pratibimba-app/src/panes/atelier/atelierSeams.ts
 * Position (#n): #4 — Context/Type: the declared type of what this surface can
 *   and cannot reach.
 * Actualises: the register the Atelier RENDERS when a tranche 28.7 deliverable
 *   names something the substrate does not carry. Three of the six scent
 *   stages ride methods that are really dispatched; one rides a method that is
 *   CONTRACT-DECLARED and NOT DISPATCHED; the tranche's three `aletheia_*`
 *   bindings are agent tools rather than gateway methods (the ratified 26.T26.3
 *   CORRECTION); and the axiom-translation cross-link deliverable (e) names a
 *   receiver no `CrossLayoutIntent` target resolves to. Saying so on the surface
 *   — beside the name and the reason — is the whole point (the 28.T28.5 /
 *   28.T28.6 pattern): a disabled affordance that explains itself, never a
 *   fabricated badge implying a call is running.
 *
 *   THE CLAIMS ARE TESTED AGAINST THE SUBSTRATE. `atelierSeams.test.ts` reads
 *   the real S-layer dispatch sources and the real target ledger: it fails if a
 *   named LIVE method stops being dispatched, and it fails the moment an ABSENT
 *   one lands. So the disclosure cannot outlive the gap it describes — and the
 *   psychoid stage cannot stay disabled once `s0'.anuttara.trace` grows an arm.
 * Public surface: AtelierSeamKind, AtelierSeam, ATELIER_LIVE_METHODS,
 *   ATELIER_UNDISPATCHED_METHODS, ATELIER_SPEC_AGENT_TOOLS,
 *   ATELIER_AGENT_ROUTE, ATELIER_AXIOM_CROSSLINK_COMPONENT, ATELIER_SEAMS,
 *   atelierSeamFor.
 * Does NOT own: the S-layer method tables (`Body/S/S0/epi-cli/src/gate/server/dispatch.rs`,
 *   `Body/S/S1/hen-compiler-core/src/s1_handlers.rs`), the method-name registry
 *   (`Body/S/S3/gateway-contract/src/protocol.rs`), the intent ledger
 *   (`src/commands/crossLayoutIntent.ts`), or the render.
 * Contract: [[CHROME-CONTRACT]] §2 + §4 + §6 · rerun tranche [[28.T28.7]].
 */

/**
 * The methods the six scent stages really reach — each one confirmed present in
 * a live dispatch table by the sibling suite (and by the plan-corpus probe
 * `plan.runs/gateway-method-audit.json`, which answers `domain-error` for all
 * four: the arm runs and rejects the empty probe payload).
 */
export const ATELIER_LIVE_METHODS: readonly string[] = Object.freeze([
    "s5'.gnostic.etymology",
    "s5'.gnostic.query_with_layers",
    "s1'.semantic.suggest_links",
    "s1'.entity.capture"
]);

/**
 * CONTRACT-DECLARED, NOT DISPATCHED. `s0'.anuttara.trace` is in the gateway's
 * `METHOD_NAMES` registry (so it is advertised on the wire and appears in the
 * committed live-wire capture) and carries a `dispatch_plan.rs` row — but no
 * S-layer dispatch table has an arm for it, and `Body/S/S3/gateway/tests/
 * dispatch_contract.rs::s3_only_methods()` names it explicitly among the
 * "S0'/S2 projection helpers with contract rows but no S0 host match arm".
 * The probe agrees: `exists: false, errorClass: "unimplemented"`.
 */
export const ATELIER_UNDISPATCHED_METHODS: readonly string[] = Object.freeze([
    "s0'.anuttara.trace"
]);

/**
 * The three names tranche 28.7 (b) originally bound as `gatewayMethod`s. The
 * ratified CORRECTION (mirrors 26.T26.3, 2026-07-23) voids those bindings:
 * these are Aletheia/Sophia AGENT TOOLS reached through `s4'.mediation.route`
 * under entitlement, never a pane's gateway method. The substrate agrees —
 * none of the three exists anywhere in the S-stack.
 */
export const ATELIER_SPEC_AGENT_TOOLS: readonly string[] = Object.freeze([
    'aletheia_gnosis_query',
    'aletheia_thought_route',
    'aletheia_crystallise'
]);

/** The real route an agent tool travels — dispatched, and never called here. */
export const ATELIER_AGENT_ROUTE = "s4'.mediation.route";

/** The 26.T26.14 inspector deliverable (e) asks the Möbius stage to cross-link. */
export const ATELIER_AXIOM_CROSSLINK_COMPONENT = 'piAxiomTranslation';

export type AtelierSeamKind = 'gateway-method' | 'agent-tool' | 'intent-target';

export interface AtelierSeam {
    /** Which 28.7 deliverable named it. */
    readonly deliverable: string;
    readonly kind: AtelierSeamKind;
    /** The name the spec used — method, tool, or component. */
    readonly name: string;
    /** True only when the stack really dispatches/resolves it. */
    readonly available: boolean;
    /** What the spec expected it to do. */
    readonly expected: string;
    /** What it really is, and why the gap is disclosed rather than filled here. */
    readonly reason: string;
}

export const ATELIER_SEAMS: readonly AtelierSeam[] = Object.freeze([
    Object.freeze({
        deliverable: "28.7 (b) — psychoid stage · archetypal-affective charge",
        kind: 'gateway-method' as const,
        name: "s0'.anuttara.trace",
        available: false,
        expected: 'Anuttara grammatical / archetypal-affective tracing of the open note',
        reason:
            "the method is DECLARED (gateway-contract METHOD_NAMES + a dispatch_plan row naming "
            + "portal-core::coordinate_phase) and therefore advertised on the wire, but NO S-layer "
            + "dispatch table carries an arm for it: Body/S/S3/gateway/tests/dispatch_contract.rs "
            + 'lists it among the "S0\'/S2 projection helpers with contract rows but no S0 host match '
            + 'arm", and the live probe answers unimplemented. Invoking it would surface a gateway '
            + 'error as if the stage had run, so the stage is disabled and says why.'
    }),
    Object.freeze({
        deliverable: '28.7 (b) — Aletheia crystallisation tools',
        kind: 'agent-tool' as const,
        name: 'aletheia_gnosis_query / aletheia_thought_route / aletheia_crystallise',
        available: false,
        expected: 'three bespoke `gatewayMethod`s the Atelier pane invokes directly',
        reason:
            'agents USE capabilities, they do not duplicate them (CORRECTION ratified 2026-07-23, '
            + 'mirroring 26.T26.3). These three are Aletheia/Sophia agent tools dispatched through '
            + `${ATELIER_AGENT_ROUTE} under entitlement — none of them exists in any S-layer `
            + 'dispatch table. The Atelier therefore rides the same underlying capabilities directly '
            + '(gnostic etymology / layered query, S1 semantic suggestion, S1 entity capture) and '
            + 'surfaces the subagents as EVIDENCE LINEAGE only.'
    }),
    Object.freeze({
        deliverable: '28.7 (e) — cross-link to the PiAxiomTranslationInspector (26.14)',
        kind: 'intent-target' as const,
        name: ATELIER_AXIOM_CROSSLINK_COMPONENT,
        available: false,
        expected: 'a cross-layout route from the Möbius write-back stage into the axiom inspector',
        reason:
            'the inspector is mounted (CHROME-CONTRACT §2 `piAxiomTranslation`, carried in the cosmic '
            + 'deep model) but NO row of CROSS_LAYOUT_INTENT_TARGETS resolves to that component, so '
            + 'there is no envelope to dispatch. Minting a target id is a public-surface change owned '
            + 'by the Architect and by 28.T28.14 (the intent-completion ledger), so the affordance '
            + 'renders disabled and names the missing target instead of inventing one.'
    })
]);

/** The seam covering a spec name, if the register discloses one. */
export function atelierSeamFor(name: string): AtelierSeam | null {
    return ATELIER_SEAMS.find(seam => seam.name === name || seam.name.includes(name)) ?? null;
}
