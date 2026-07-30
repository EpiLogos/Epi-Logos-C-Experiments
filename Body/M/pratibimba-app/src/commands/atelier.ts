/**
 * Coordinate: M' M5-5' (Atelier scent-following commands — Track 16.T16.19 + 26.T26.3)
 * Residency: Body/M/pratibimba-app/src/commands
 * Actualises: the Atelier ACTIVATION — commands operating on the file/coordinate
 *   the user is already in (no scent-following workspace, no standalone extension).
 *   16.T16.19 landed three (scent-follow / cognate-search / psychoid-trace);
 *   26.T26.3 completes the six-stage scent-following sequence — root → cognate →
 *   drift → psychoid → pros-hen → Möbius write-back — wired to the REAL landed
 *   substrate. Dependencies are injected so the bindings are pure and testable.
 * Public surface: AtelierDeps, atelierCommands, registerAtelierCommands,
 *   SCENT_FOLLOWING_STAGES, ALETHEIA_LINEAGE, etymologyProvenanceHandle,
 *   AtelierScentStage.
 * Does NOT own: the entity lifecycle law (Hen), the gateway socket (App owns it;
 *   the holder carries it), canon writes (never), Aletheia dispatch (emergent),
 *   the surface law (`panes/atelier/atelierScentTrail.ts`), or the substrate
 *   disclosure (`panes/atelier/atelierSeams.ts`).
 *
 * 28.T28.7 completes the tranche's remaining three deliverables ON THESE
 * BINDINGS rather than on a rebuilt widget.
 *   (b) THE PSYCHOID STAGE IS DISABLED, and says why. `s0'.anuttara.trace` is
 *   contract-declared and advertised on the wire but has NO dispatch arm in any
 *   S-layer table (`panes/atelier/atelierSeams.ts`, held against the real
 *   sources). Invoking it would raise a gateway error the reader would read as
 *   "the stage ran and failed", so it does not run at all.
 *   (d) MÖBIUS WRITE-BACK ROUTES. `atelier.scentFollow` stages the Hen
 *   candidate and then emits the governed `CrossLayoutIntent` to Canon Studio
 *   carrying that candidate — the SC-2 governance flow, with
 *   `mutatesGraphCanon: false` intact (capture writes a CANDIDATE under
 *   `Empty/Present/{day}/entities/`; canon is Hen's).
 *
 * 26.3 WIRING (ratified 2026-07-23).
 * Agents use capabilities — they don't duplicate them. The `aletheia_gnosis_query`
 * / `aletheia_thought_route` / `aletheia_crystallise` names in the design-recon
 * spec are Aletheia/Sophia AGENT TOOLS routed through `s4'.mediation.route` under
 * entitlement (12-agentic-layer-s4-s5.md §"gnostic/Aletheia/GraphRAG tools"), NOT
 * bespoke gateway methods a pane calls. A pane simply uses the same underlying
 * CAPABILITY directly: root=`s5'.gnostic.etymology`, drift=`s5'.gnostic.query_with_layers`
 * (Tranche 6.1 — LANDED), cognate=`s1'.semantic.suggest_links`, psychoid=
 * `s0'.anuttara.trace`, Möbius=`s1'.entity.capture`. `pros-hen` is a LOCAL synthesis
 * stage (no substrate call — Klein-V4 pull realised client-side). The Aletheia
 * subagents surface as EVIDENCE LINEAGE (ALETHEIA_LINEAGE) in the scent-trail
 * provenance — the agents that use these capabilities, shown as lineage, never a
 * pane invocation.
 */

import { AppCommand, commands } from './registry';
import type { CrossLayoutIntent, IntentPrivacyClass } from './crossLayoutIntent';

/** The etymology:// provenance namespace (UX §5.3 namespace integrity). */
export const ETYMOLOGY_PROVENANCE_SCHEME = 'etymology://';

/** Build an etymology:// provenance handle for a scent-following stage. */
export function etymologyProvenanceHandle(stageId: string, ref: string): string {
    return `${ETYMOLOGY_PROVENANCE_SCHEME}${stageId}/${ref}`;
}

export interface AtelierScentStage {
    readonly id: 'root' | 'cognate' | 'drift' | 'psychoid' | 'pros-hen' | 'mobius-write-back';
    readonly label: string;
    readonly purpose: string;
    readonly commandId: string;
    /**
     * The REAL landed gateway method this stage rides; null = local synthesis
     * (no substrate call). NEVER an `aletheia_*` name — Aletheia is emergent.
     */
    readonly gatewayMethod: string | null;
}

/** The canonical six-stage scent-following sequence (UX §2.6). */
export const SCENT_FOLLOWING_STAGES: readonly AtelierScentStage[] = Object.freeze([
    {
        id: 'root',
        label: 'Root',
        purpose: 'Etymology root of the active coordinate',
        commandId: 'atelier.etymologyRoot',
        gatewayMethod: "s5'.gnostic.etymology"
    },
    {
        id: 'cognate',
        label: 'Cognate',
        purpose: 'Cross-language / semantic cognates of this note',
        commandId: 'atelier.cognateSearch',
        gatewayMethod: "s1'.semantic.suggest_links"
    },
    {
        id: 'drift',
        label: 'Semantic Drift',
        purpose: 'Historical sense drift over layered gnostic retrieval',
        commandId: 'atelier.semanticDrift',
        gatewayMethod: "s5'.gnostic.query_with_layers"
    },
    {
        id: 'psychoid',
        label: 'Psychoid Charge',
        purpose: 'Anuttara grammatical / archetypal-affective tracing',
        commandId: 'atelier.psychoidTrace',
        gatewayMethod: "s0'.anuttara.trace"
    },
    {
        id: 'pros-hen',
        label: 'Pros-hen Synthesis',
        purpose: 'Toward-the-One; local Klein-V4 square pull over the scent-trail',
        commandId: 'atelier.prosHen',
        gatewayMethod: null
    },
    {
        id: 'mobius-write-back',
        label: 'Möbius Write-Back',
        purpose: 'Stage a Hen-promotion candidate (CCT-14 lifecycle)',
        commandId: 'atelier.scentFollow',
        gatewayMethod: "s1'.entity.capture"
    }
]);

/**
 * Aletheia subagents surface as EVIDENCE LINEAGE in the scent-trail provenance —
 * NOT peer review actors, NOT gateway-invocable (Aletheia is emergent via Anima
 * dispatch). Rendered from provenance, never called from a pane (DR-M5-1 + 12.1).
 */
export interface AletheiaLineageEntry {
    readonly subagent: string;
    readonly role: string;
}

export const ALETHEIA_LINEAGE: readonly AletheiaLineageEntry[] =
    Object.freeze([
        { subagent: 'Anansi', role: 'citation trail — source-to-source provenance' },
        { subagent: 'Janus', role: 'prospective / retrospective weighting' },
        { subagent: 'Moirai', role: 'tarot cast-anchor' },
        { subagent: 'Mercurius', role: 'kairos signal' },
        { subagent: 'Agora', role: 'deliberation log' },
        { subagent: 'Zeithoven', role: 'temporal-rhythm anchor' }
    ]);

/**
 * 28.7 (d) / DR-M0-1 / 21-m0 SC-2, as a type rather than a comment: no Atelier
 * path mutates canon. The Möbius stage stages a CANDIDATE and routes it.
 */
export const ATELIER_MUTATES_GRAPH_CANON = false as const;

/** The governed receiver of a crystallised candidate (CHROME-CONTRACT §5). */
export const MOBIUS_WRITE_BACK_TARGET = Object.freeze({
    requestedExtensionId: 'ide-shell-m0-m5',
    requestedContributionId: 'canon-studio'
});

export interface MobiusWriteBackInput {
    /** The Hen candidate the capture produced (falls back to the source note). */
    readonly artifactUri: string;
    readonly coordinate?: string | null;
    readonly dayNow?: string | null;
    readonly sessionKey?: string | null;
    readonly profileGeneration?: number | null;
    readonly privacyClass?: IntentPrivacyClass | null;
}

/**
 * The nine-field envelope the Möbius stage hands to Canon Studio. One
 * declaration, so the governance route (and the fact that it names
 * `canon-studio` and nothing else) is something a test can hold.
 */
export function mobiusWriteBackIntent(input: MobiusWriteBackInput): CrossLayoutIntent {
    return Object.freeze({
        coordinate: input.coordinate ?? null,
        artifactUri: input.artifactUri,
        reviewId: null,
        dayNow: input.dayNow ?? null,
        sessionKey: input.sessionKey ?? null,
        profileGeneration: input.profileGeneration ?? null,
        privacyClass: input.privacyClass ?? null,
        ...MOBIUS_WRITE_BACK_TARGET
    });
}

/** Read the Hen candidate path out of an `s1'.entity.capture` receipt. */
function candidatePathOf(receipt: unknown): string | null {
    const artifact = (receipt as { artifact?: unknown } | null)?.artifact;
    const path = (artifact as { candidatePath?: unknown } | null)?.candidatePath;
    return typeof path === 'string' && path.length > 0 ? path : null;
}

export interface AtelierDeps {
    /** Vault-relative path of the currently-open markdown editor, if any. */
    readonly activeMarkdownPath: () => string | null;
    /**
     * Active bimba coordinate (for the etymology root stage — `s5'.gnostic.etymology`
     * takes a coordinate, not a path). Optional: until App.tsx wires it from the
     * coordinate store (deferred to the ratified done-close), the root stage stays
     * disabled rather than inventing a coordinate.
     */
    readonly activeCoordinate?: () => string | null;
    /** The bound day (DD-MM-YYYY) the candidate pool lives under. */
    readonly dayId: () => string | null;
    readonly invoke: (method: string, params: Record<string, unknown>) => Promise<unknown>;
    readonly ready: () => boolean;
    /**
     * 28.7 (d): the governed route out of the Möbius write-back stage. Injected
     * (App.tsx hands it the one `pratibimba.intent.dispatch` command) so the
     * write-back is testable and so the Atelier owns no transport of its own.
     */
    readonly dispatchIntent?: (intent: CrossLayoutIntent) => void | Promise<void>;
    /** Session context stamped onto the write-back envelope, when the shell has it. */
    readonly sessionKey?: () => string | null;
    readonly privacyClass?: () => IntentPrivacyClass | null;
}

export function atelierCommands(deps: AtelierDeps): AppCommand[] {
    const withActiveFile = (run: (path: string) => Promise<void>): AppCommand['run'] => {
        return async () => {
            const path = deps.activeMarkdownPath();
            if (!path) {
                return;
            }
            await run(path);
        };
    };

    const activeCoordinate = (): string | null => deps.activeCoordinate?.() ?? null;

    return [
        {
            // root
            id: 'atelier.etymologyRoot',
            title: 'Atelier: Etymology root — trace this coordinate to its gnostic root',
            enabled: () => deps.ready() && activeCoordinate() !== null,
            run: async () => {
                const coord = activeCoordinate();
                if (!coord) {
                    return;
                }
                await deps.invoke("s5'.gnostic.etymology", { coord });
            }
        },
        {
            // cognate (16.T16.19)
            id: 'atelier.cognateSearch',
            title: 'Atelier: Cognate search — semantic neighbours of this note',
            enabled: () => deps.ready() && deps.activeMarkdownPath() !== null,
            run: withActiveFile(async path => {
                await deps.invoke("s1'.semantic.suggest_links", { notePath: path });
            })
        },
        {
            // drift
            id: 'atelier.semanticDrift',
            title: 'Atelier: Semantic drift — layered gnostic retrieval of sense drift',
            enabled: () => deps.ready() && deps.activeMarkdownPath() !== null,
            run: withActiveFile(async path => {
                await deps.invoke("s5'.gnostic.query_with_layers", { query: path });
            })
        },
        {
            // psychoid (16.T16.19) — DISABLED at 28.T28.7 and disclosed.
            // `s0'.anuttara.trace` is declared in the gateway's METHOD_NAMES
            // registry (so it rides the advertised capability list and the
            // committed live-wire capture) but NO S-layer dispatch table carries
            // an arm for it — `Body/S/S3/gateway/tests/dispatch_contract.rs`
            // names it among the "contract rows but no S0 host match arm", and
            // the live probe answers `unimplemented`. A stage that fires an
            // unimplemented method reads to the user as "it ran and failed", so
            // this one does not fire. `panes/atelier/atelierSeams.ts` carries the
            // disclosure the surface prints, and its sibling suite turns RED the
            // moment a dispatch arm lands — at which point this `false` comes off.
            id: 'atelier.psychoidTrace',
            title: 'Atelier: Psychoid trace — Anuttara grammatical tracing',
            enabled: () => false,
            run: async () => {
                // Intentionally inert: the substrate has no arm to reach.
            }
        },
        {
            // pros-hen — LOCAL synthesis stage (no substrate call). The toward-the-One
            // Klein-V4 pull is realised client-side; its concrete local computation +
            // sink are a ratification item (26.3 review). Never invokes the gateway,
            // so it can fabricate nothing.
            id: 'atelier.prosHen',
            title: 'Atelier: Pros-hen synthesis — toward-the-One Klein-V4 pull',
            enabled: () => deps.ready() && deps.activeMarkdownPath() !== null,
            run: withActiveFile(async () => {
                // Local synthesis stage — intentionally no gateway invocation.
            })
        },
        {
            // möbius-write-back (16.T16.19 scent-follow): stages a CANDIDATE
            // (CCT-14 lifecycle); Hen reviews before anything touches canon.
            id: 'atelier.scentFollow',
            title: 'Atelier: Scent-follow — stage this note as a Hen candidate',
            enabled: () =>
                deps.ready() && deps.activeMarkdownPath() !== null && deps.dayId() !== null,
            run: withActiveFile(async path => {
                const dayId = deps.dayId();
                if (!dayId) {
                    return;
                }
                const receipt = await deps.invoke("s1'.entity.capture", { source: path, dayId });
                // 28.7 (d) — the Möbius turn. The candidate Hen just staged is
                // routed to Canon Studio for the governed review; this command
                // never writes canon (SC-2 / DR-M0-1). If the shell has not
                // wired a transport the capture still stands on its own.
                await deps.dispatchIntent?.(
                    mobiusWriteBackIntent({
                        artifactUri: candidatePathOf(receipt) ?? path,
                        coordinate: activeCoordinate(),
                        dayNow: dayId,
                        sessionKey: deps.sessionKey?.() ?? null,
                        privacyClass: deps.privacyClass?.() ?? null
                    })
                );
            })
        }
    ];
}

/** Register the six Atelier bindings; returns their disposers. */
export function registerAtelierCommands(deps: AtelierDeps): Array<() => void> {
    return atelierCommands(deps).map(command => commands.register(command));
}
