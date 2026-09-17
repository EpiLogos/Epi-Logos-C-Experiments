/**
 * Coordinate: M' `/` membrane (psyche-facet vocabulary — Track 27.T27.3 / 26.T26.8)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Actualises: the psyche-facet vocabulary the Dispatch trace badges + legend
 *   render. Psyche facets are Anima's AUTHORIAL registers (DR-M5-1) — the voice
 *   a dispatch speaks in — NOT separate dispatch authorities. Colours ride CSS
 *   classes (`facet-<id>`), never raw hex, per the carrier-token lint.
 *
 *   26.T26.8 — DR-WC-M5-3's NEGATIVE CLAIM LIVES HERE. "Sophia surfaces only as
 *   a facet, never an actor row" was, until this tranche, an annotation on a
 *   STATIC projection (`acrGovernance.ts::acrRoster`) over a frozen list. The
 *   LIVE producer never consulted it: `dispatchGenealogyFromSessions` derived an
 *   actor straight from the session key, so a real `agent:sophia:*` session
 *   minted an actor row LABELLED `sophia` with role `pi` — and the suite that
 *   was supposed to prove the facet rendering fed exactly that key and asserted
 *   only that a badge appeared beside it. `resolveDispatchIdentity` is the
 *   enforcement: a dispatch attributed to one of the six non-dispatch registers
 *   resolves to the Pi HARNESS actor CARRYING that facet — which is the decision
 *   read literally ("psyche-facet badges on Pi dispatch traces, not peer agent
 *   rows"). Nothing is dropped; the register surfaces as the badge it was ruled
 *   to be. `anima` is excluded because it IS the dispatcher (DR-M5-1) — it keeps
 *   its actor row and carries its facet as a voice.
 * Public surface: PSYCHE_FACETS, PSYCHE_FACET_LABEL, PSYCHE_FACET_SATTVA,
 *   PI_HARNESS_ACTOR, psycheFacetClass, psycheFacetForAgent,
 *   psycheFacetSourceAnchor, isPsycheAspectRegister, resolveDispatchIdentity.
 * Does NOT own: the facet type (evidenceShapes.ts), the aspect-register list
 *   (omnipanelCapabilities.ts — PROJECTED here, never re-enumerated), dispatch
 *   structure, or the session→record fold (dispatchGenealogyFromSessions.ts).
 * Contract: DR-M5-1 · DR-WC-M5-3 · rerun tranche 26.T26.8.
 */

import type { PsycheFacet } from './evidenceShapes';
import { PSYCHE_ASPECT_REGISTERS } from './omnipanelCapabilities';

/** Legend order (stable) + human labels. */
export const PSYCHE_FACETS: readonly PsycheFacet[] = Object.freeze([
    'sophia',
    'anima',
    'logos',
    'eros',
    'mythos',
    'psyche',
    'nous'
]);

export const PSYCHE_FACET_LABEL: Readonly<Record<PsycheFacet, string>> = Object.freeze({
    sophia: 'Sophia',
    anima: 'Anima',
    logos: 'Logos',
    eros: 'Eros',
    mythos: 'Mythos',
    psyche: 'Psyche',
    nous: 'Nous'
});

/**
 * The one-line register reading each facet's `## 6. Sattva` section carries,
 * quoted down to a tooltip. The FULL section is the source of record — see
 * `psycheFacetSourceAnchor` — and the Disposition paragraph under each is what
 * DR-M5-1 ruled: "authorial-register rendering material, not a separate
 * dispatch authority".
 */
export const PSYCHE_FACET_SATTVA: Readonly<Record<PsycheFacet, string>> = Object.freeze({
    sophia:
        'CT5 review-crystallisation / Möbius-return register — Spanda-Shakti, exitus and reditus undifferentiated.',
    anima:
        'The dispatcher — Svātantrya and Spanda as dispatch; one life differentiating into six functions.',
    logos:
        'CT1 nomos / scope-and-definition register — Madhyamā at the cardiac threshold; law in service of the household.',
    eros:
        'CT2 relational-operator register — Camatkāra, the Sphoṭa descending into operation.',
    mythos:
        'CT3 pattern / archetypal-analysis register — Paśyantī, the vision-word; the viśvavikalpa that holds you.',
    psyche:
        'CT4 oikonomia / NOW-holder continuity register — ahaṃvimarśa; the household that knows its law serves the home.',
    nous: 'CT0 epistemic-clearing register — Parā Vāk, the bindu before the alphabet.'
});

/** Where the facet's Sattva reading is canon (the S4 agent definition). */
export function psycheFacetSourceAnchor(facet: PsycheFacet): string {
    return `Body/S/S4/pi-agent/agents/${facet}.md#6-sattva`;
}

/** The CSS class carrying the facet's colour (defined in styles.css). */
export function psycheFacetClass(facet: PsycheFacet): string {
    return `facet-${facet}`;
}

const FACET_IDS = new Set<string>(PSYCHE_FACETS);

/** The single agent harness (DR-M5-1). A facet is a voice Pi speaks in. */
export const PI_HARNESS_ACTOR = 'pi';

const ASPECT_REGISTER_IDS: ReadonlySet<string> = new Set<string>(PSYCHE_ASPECT_REGISTERS);

/**
 * DR-M5-1 / DR-WC-M5-3: is this identity one of the six NON-DISPATCH authorial
 * registers? Projected from `PSYCHE_ASPECT_REGISTERS` so the list has exactly
 * one home — `anima` is deliberately NOT among them (it is the dispatcher).
 */
export function isPsycheAspectRegister(agentId: string): boolean {
    return ASPECT_REGISTER_IDS.has(agentId.toLowerCase());
}

/**
 * The psyche facet an agent identity speaks in, when it is a constitutional
 * register (sophia/nous/logos/eros/mythos/psyche/anima). Returns undefined for
 * Pi, gateways, and Aletheia subagents (those carry an aletheia identity, not a
 * psyche facet). Never invents a facet.
 */
export function psycheFacetForAgent(agentId: string): PsycheFacet | undefined {
    const normalised = agentId.toLowerCase();
    return FACET_IDS.has(normalised) ? (normalised as PsycheFacet) : undefined;
}

/** What a dispatch attributed to `agentId` actually IS, once DR-WC-M5-3 is
 *  applied: the actor row it may occupy, and the facet it speaks in. */
export interface DispatchIdentity {
    /** The actor that may hold a row. Never one of the six aspect registers. */
    readonly actor: string;
    /** The authorial voice, rendered as a badge — never as a row. */
    readonly psycheFacet?: PsycheFacet;
}

/**
 * DR-WC-M5-3 ENFORCED. Resolve a raw agent identity into the row/badge split
 * the decision ruled:
 *
 *   - one of the six aspect registers (nous/logos/eros/mythos/psyche/sophia)
 *     → the **Pi harness** row carrying that facet as its badge. Sophia can
 *     therefore never occupy an actor row, no matter what the wire says;
 *   - `anima` → its own dispatcher row, carrying `anima` as its voice;
 *   - anything else (Pi, gateways, Aletheia subagents) → itself, no facet.
 *
 * This is the ONLY place a session identity becomes a rendered actor, so the
 * negative claim is a property of the fold rather than a comment beside it.
 */
export function resolveDispatchIdentity(agentId: string): DispatchIdentity {
    const facet = psycheFacetForAgent(agentId);
    if (facet === undefined) {
        return { actor: agentId };
    }
    return isPsycheAspectRegister(agentId)
        ? { actor: PI_HARNESS_ACTOR, psycheFacet: facet }
        : { actor: agentId.toLowerCase(), psycheFacet: facet };
}
