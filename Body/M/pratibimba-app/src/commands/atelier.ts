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
 *   SCENT_FOLLOWING_STAGES, ALETHEIA_LINEAGE, etymologyProvenanceHandle.
 * Does NOT own: the entity lifecycle law (Hen), the gateway socket (App owns it;
 *   the holder carries it), canon writes (never), Aletheia dispatch (emergent).
 *
 * 26.3 RETARGET (REVIEW proposal — awaiting Architect ratification).
 * The design-recon spec wires the stages to `aletheia_gnosis_query`,
 * `aletheia_thought_route`, `aletheia_crystallise` as **gateway methods** invoked
 * via `KERNEL_BRIDGE_API.invokeCapability`. That premise is FALSE: those names are
 * not dispatchable — they are Aletheia SUBAGENT tools, and per the S5 preflight
 * "all Aletheia invocation routes through Anima dispatch — Aletheia is emergent,
 * not routed independently." A pane cannot invoke them. The honest retarget rides
 * the REAL landed substrate: `s5'.gnostic.etymology` + `s5'.gnostic.query_with_layers`
 * (Tranche 6.1 — LANDED, dispatchable) plus the 16.T16.19 `s1'`/`s0'` routes.
 * Aletheia subagents surface as EVIDENCE LINEAGE (ALETHEIA_LINEAGE), never live
 * invocation. Ratification items: (1) the corrected aletheia_*→gnostic premise
 * (flag design-recon §26.3 + owning M5'-SPEC); (2) `pros-hen` is a LOCAL synthesis
 * stage (no substrate call — Klein-V4 pull realised client-side); (3) the App.tsx
 * `activeCoordinate` wiring for the root stage is deferred to the done-close.
 */

import { AppCommand, commands } from './registry';

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
export const ALETHEIA_LINEAGE: readonly { readonly subagent: string; readonly role: string }[] =
    Object.freeze([
        { subagent: 'Anansi', role: 'citation trail — source-to-source provenance' },
        { subagent: 'Janus', role: 'prospective / retrospective weighting' },
        { subagent: 'Moirai', role: 'tarot cast-anchor' },
        { subagent: 'Mercurius', role: 'kairos signal' },
        { subagent: 'Agora', role: 'deliberation log' },
        { subagent: 'Zeithoven', role: 'temporal-rhythm anchor' }
    ]);

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
            // psychoid (16.T16.19)
            id: 'atelier.psychoidTrace',
            title: 'Atelier: Psychoid trace — Anuttara grammatical tracing',
            enabled: () => deps.ready() && deps.activeMarkdownPath() !== null,
            run: withActiveFile(async path => {
                await deps.invoke("s0'.anuttara.trace", {
                    content: path,
                    sensitivity: 'public',
                    depth: 1
                });
            })
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
                await deps.invoke("s1'.entity.capture", { source: path, dayId });
            })
        }
    ];
}

/** Register the six Atelier bindings; returns their disposers. */
export function registerAtelierCommands(deps: AtelierDeps): Array<() => void> {
    return atelierCommands(deps).map(command => commands.register(command));
}
