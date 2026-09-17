/**
 * Coordinate: M' shell (error UX grammar + Diagnostics deep-link —
 *   Track 32.T32.7; cross-link 15.2)
 * Residency: Body/M/pratibimba-app/src/ui
 * Position (#n): #4 — the context frame a surface renders WHEN A CALL FAILED,
 *   as distinct from 32.6's frame for "nothing has arrived yet"
 * Actualises: the four error UX paths the 32.7 design-recon names (spec
 *   :226-230) as ONE declared table, plus the single Diagnostics deep-link the
 *   spec asks every blocked error surface to carry.
 *
 *   THE DEEP-LINK IS NOT MINTED HERE. The frozen spec fires
 *   `commands.executeCommand('omnipanel.openTab', 'diagnostics')`; the carrier
 *   has no such command. It has `omnipanel.tab.activate.7` — the CCT-4 chord
 *   command (⌘8) that selects the Diagnostics fold on the active face — and the
 *   28.11 readiness law ALREADY routes `bridge_unavailable` to it via
 *   `readinessRecovery`. So this module READS that recovery rather than
 *   restating an id: one route to Diagnostics, owned by the taxonomy, and a
 *   rename there cannot leave this table pointing at nothing.
 *
 *   `status` is the honest half of the table. A path is `live` only when a real
 *   carrier site raises it; a path with no producer in this carrier is
 *   `unwired` and MUST name why. That distinction is the point: a deep-link to
 *   a surface that never renders is exactly the registered-but-unfired seam
 *   this plan set exists to stop, and `errorUxGrammar.test.ts` refuses a live
 *   row whose command is not in `COMMAND_CATALOG` and an unwired row with no
 *   reason.
 *
 *   Scope boundary held verbatim from spec :232 — the OmniPanel Diagnostics tab
 *   CONTENTS belong to 15.2. This tranche contributes the routing affordance
 *   only, and owns no part of what the tab shows.
 * Public surface: ErrorUxPathId, ERROR_UX_PATH_IDS, ErrorUxAffordance,
 *   ErrorUxPathEntry, ERROR_UX_PATHS, errorUxPath, DIAGNOSTICS_DEEP_LINK,
 *   PASU_WIZARD_DEEP_LINK.
 * Does NOT own: the nine-id taxonomy or its recovery routes
 *   (ui/bridgeReadiness), the per-state copy (ui/readinessGrammar), the empty
 *   -state grammar (ui/emptyStateGrammar — "nothing yet" is not an error), the
 *   Diagnostics tab contents (15.2 / panes/omni/DiagnosticsPanel), or the
 *   command registry.
 * Contract: rerun tranche [[32.T32.7]] spec lines 209-236;
 *   [[CHROME-CONTRACT]] section 11 (every command id here is catalogued).
 */

import { readinessRecovery, type ReadinessRecovery } from './bridgeReadiness';

/**
 * The ONE route into Diagnostics, read from the readiness taxonomy's own
 * recovery for `bridge_unavailable` rather than declared a second time.
 */
export const DIAGNOSTICS_DEEP_LINK: ReadinessRecovery = readinessRecovery('bridge_unavailable');

/**
 * The route into the PASU wizard (25.T25.4's `identity.openWizard`, catalogued).
 * Path 4 deep-links here, per spec :230.
 */
export const PASU_WIZARD_DEEP_LINK: ReadinessRecovery = Object.freeze({
    label: 'Open PASU wizard',
    commandId: 'identity.openWizard'
});

/** The four paths of spec :226-230, in the spec's own order. */
export type ErrorUxPathId =
    | 'runtime-bridge-call'
    | 'contract-preflight'
    | 'integrated-readiness-blocked'
    | 'pasu-absent-kairos-enabled';

export const ERROR_UX_PATH_IDS: readonly ErrorUxPathId[] = Object.freeze([
    'runtime-bridge-call',
    'contract-preflight',
    'integrated-readiness-blocked',
    'pasu-absent-kairos-enabled'
]);

/** What a path's surface offers. `dismiss` is only honest where the surface
 *  can be re-reached; a banner over a persistent condition has none. */
export type ErrorUxAffordance = 'retry' | 'diagnostics' | 'dismiss' | 'wizard';

export interface ErrorUxPathEntry {
    readonly id: ErrorUxPathId;
    /** What raises it, in the spec's terms. */
    readonly trigger: string;
    /** Principle 5: inline at the failing surface, never a modal. `banner` is
     *  still inline — it is the extension-level variant rendered above a
     *  surface rather than at the failing datum. */
    readonly surface: 'inline' | 'banner';
    readonly affordances: readonly ErrorUxAffordance[];
    /** The command a reader is routed to, or null where the path routes
     *  nowhere. Held to `COMMAND_CATALOG` by the test. */
    readonly deepLinkCommandId: string | null;
    readonly status: 'live' | 'unwired';
    /** LAW: set exactly when `status === 'unwired'`. */
    readonly unwiredReason: string | null;
    /** The carrier modules that raise this path, `src`-relative. Empty only
     *  for an unwired path. */
    readonly sites: readonly string[];
}

export const ERROR_UX_PATHS: readonly ErrorUxPathEntry[] = Object.freeze([
    Object.freeze({
        id: 'runtime-bridge-call' as const,
        trigger:
            'A runtime call into the substrate rejected — a gateway RPC refusal, or the vault seam failing a read.',
        surface: 'inline' as const,
        affordances: Object.freeze([
            'retry',
            'diagnostics',
            'dismiss'
        ]) as readonly ErrorUxAffordance[],
        deepLinkCommandId: DIAGNOSTICS_DEEP_LINK.commandId,
        status: 'live' as const,
        unwiredReason: null,
        sites: Object.freeze([
            'panes/omni/gateway/TryItAffordance.tsx',
            'panes/omni/ContextPackSection.tsx',
            'panes/MarkdownEditorPane.tsx'
        ]) as readonly string[]
    }),
    Object.freeze({
        id: 'contract-preflight' as const,
        trigger:
            'An extension contract preflight failed; the banner would link to the preflight log above the surface on first mount.',
        surface: 'banner' as const,
        affordances: Object.freeze([]) as readonly ErrorUxAffordance[],
        deepLinkCommandId: null,
        status: 'unwired' as const,
        unwiredReason:
            'No carrier-side preflight RESULT exists to link to. The enforced contract JSON is real ' +
            '(Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json, read by ' +
            'scripts/lint-import-boundaries.mjs), but its consumer is a BUILD-time lint: the carrier ' +
            'preflight is `pnpm test`’s five lints plus src/chromeContract.test.ts, all of which fail ' +
            'the build and write no artefact. The spec’s validation-results.json is produced by nothing ' +
            'in this repository — `find` over the whole tree returns no such file, and the frozen ' +
            'validate-extension-contract-preflight.mjs only exits non-zero with console output. A banner ' +
            'linking to it would be a deep-link to nothing. Owner: whoever lands a runtime preflight ' +
            'result feed; until then this path is declared and not rendered.',
        sites: Object.freeze([]) as readonly string[]
    }),
    Object.freeze({
        id: 'integrated-readiness-blocked' as const,
        trigger:
            'The integrated composition reports Wave-A readiness blocked — the nine-id `profile_missing_field` — with named pending markers (11.8 substrate).',
        surface: 'inline' as const,
        affordances: Object.freeze(['diagnostics']) as readonly ErrorUxAffordance[],
        deepLinkCommandId: DIAGNOSTICS_DEEP_LINK.commandId,
        status: 'live' as const,
        unwiredReason: null,
        sites: Object.freeze([
            'engine/CosmicEngine.tsx',
            'engine/PersonalRecognitionEngine.tsx'
        ]) as readonly string[]
    }),
    Object.freeze({
        id: 'pasu-absent-kairos-enabled' as const,
        trigger:
            'Kairos is enabled while PASU carries no identity — the temporal signal has no natal anchor to transform.',
        surface: 'inline' as const,
        affordances: Object.freeze(['wizard']) as readonly ErrorUxAffordance[],
        deepLinkCommandId: PASU_WIZARD_DEEP_LINK.commandId,
        status: 'live' as const,
        unwiredReason: null,
        sites: Object.freeze(['ui/mExtensionEmptyStates.tsx']) as readonly string[]
    })
]);

const BY_ID: Readonly<Record<ErrorUxPathId, ErrorUxPathEntry>> = Object.freeze(
    Object.fromEntries(ERROR_UX_PATHS.map(entry => [entry.id, entry])) as Record<
        ErrorUxPathId,
        ErrorUxPathEntry
    >
);

export function errorUxPath(id: ErrorUxPathId): ErrorUxPathEntry {
    return BY_ID[id];
}

/**
 * The exact copy of spec :230. Kept here rather than at the render site so the
 * grammar owns the words and the empty state owns only when to say them.
 */
export const PASU_ABSENT_KAIROS_WARNING = 'PASU not configured — kairos defaulting to neutral';
