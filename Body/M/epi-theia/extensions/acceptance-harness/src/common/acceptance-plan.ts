/**
 * Acceptance plan — Track 05 T9.
 *
 * Defines the repeatable acceptance recipe (services + steps) the harness
 * executes. The plan is data, not code; the harness script + Theia-side
 * contribution both interpret it. Keeping it as data also lets the operator
 * runbook reference the same shape.
 *
 * Service list mirrors `Body/M/epi-tauri/decisions/track-05-t0-runtime-baseline.json`
 * local_dev_topology.services — see that file for the canonical list.
 */

export interface AcceptanceServiceDescriptor {
    readonly id: string;
    readonly purpose: string;
    /**
     * Shell command to start the service (operator-runbook style). The
     * acceptance script PREFERS attaching to a service the operator already
     * started rather than spawning new processes.
     */
    readonly start: string;
    /** When false, the harness will continue with the service stubbed. */
    readonly alwaysRequired: boolean;
    /** Health endpoint or readiness probe. */
    readonly healthProbe?: string;
}

export interface AcceptanceStep {
    readonly id: string;
    readonly description: string;
    /** Layout that must be active to perform this step. */
    readonly layout: 'daily-0-1' | 'ide-deep' | 'any';
    /** Expected verification handle the step produces. */
    readonly produces: readonly string[];
}

export interface AcceptancePlan {
    readonly id: string;
    readonly version: string;
    readonly services: readonly AcceptanceServiceDescriptor[];
    readonly steps: readonly AcceptanceStep[];
    readonly privacyAuditSurfaces: readonly string[];
}

/**
 * Canonical acceptance plan for Track 05 T9. Bundled with the extension so
 * the Theia-side contribution + the Node script + the runbook agree on a
 * single source.
 */
export const TRACK_05_T9_ACCEPTANCE_PLAN: AcceptancePlan = {
    id: 'track-05-t9-acceptance',
    version: '1.0.0',
    services: [
        {
            id: 'gateway',
            purpose: 'S3 gateway RPC + event multiplexer',
            start: 'cargo run --manifest-path Body/S/S3/gateway/Cargo.toml',
            alwaysRequired: true,
            healthProbe: 'http://127.0.0.1:18794/_health'
        },
        {
            id: 'spacetimedb',
            purpose: 'Native presence + world_clock subscription',
            start: 'docker compose -f docker-compose.epi-s2.yml up -d spacetimedb',
            alwaysRequired: true
        },
        {
            id: 'neo4j',
            purpose: 'S2 bimba graph',
            start: 'docker compose -f docker-compose.epi-s2.yml up -d neo4j',
            alwaysRequired: true,
            healthProbe: 'bolt://127.0.0.1:7687'
        },
        {
            id: 'redis',
            purpose: 'S2 semantic cache + S3 redis-context',
            start: 'docker compose -f docker-compose.epi-s2.yml up -d redis',
            alwaysRequired: true,
            healthProbe: 'redis://127.0.0.1:6379'
        },
        {
            id: 's5_persisted_stores',
            purpose: 'Real review/autoresearch persistence (NOT mocked)',
            start: 'cargo test --offline --manifest-path Body/S/S5/epii-review-core/Cargo.toml',
            alwaysRequired: true
        },
        {
            id: 'theia_electron',
            purpose: 'The Theia Electron user-facing product',
            start: 'pnpm --filter @pratibimba/electron-app start',
            alwaysRequired: true,
            healthProbe: 'electron renderer ready event'
        },
        {
            id: 'theia_browser',
            purpose: 'Theia browser-mode build (CI / Docker headless parity)',
            start: 'pnpm --dir Body/M/epi-theia/theia-app start',
            alwaysRequired: false,
            healthProbe: 'http://127.0.0.1:3000'
        }
    ],
    steps: [
        {
            id: 'boot.kernel-bridge',
            description:
                'Kernel-bridge connects to gateway; a single profile generation arrives ' +
                'and surfaces in the 0/1 daily layout status display, the deep IDE layout ' +
                'status bar, an M-extension widget, and the Agentic Control Room. SAME ' +
                'process, SAME bridge subscription, SAME session key.',
            layout: 'daily-0-1',
            produces: [
                'profile-generation-handle',
                'bridge-subscription-id',
                'session-key'
            ]
        },
        {
            id: 'layout.switch-to-deep-ide',
            description:
                'OmniPanel command switches to ide-deep layout. PRESERVES selected ' +
                'coordinate state and bridge subscription identity (NO resubscribe, NO ' +
                'duplicate connection).',
            layout: 'ide-deep',
            produces: [
                'layout-mode-handle:ide-deep',
                'bridge-subscription-id:UNCHANGED'
            ]
        },
        {
            id: 'graph.open-s2-node',
            description:
                'Open a real S2 graph node in the Bimba graph viewer (via kernel-bridge ' +
                "s2.graph.node). Verify namespace, pointer anchor, source/spec/code/test " +
                'anchors.',
            layout: 'ide-deep',
            produces: ['graph-node-handle']
        },
        {
            id: 'review.open-s5-candidate',
            description:
                'Open a live S5 review/autoresearch record (via s5\'.review.inbox). ' +
                'Verify human-required gates BLOCK agent transition; only human via M5 ' +
                'review surface may approve/reject/revise.',
            layout: 'ide-deep',
            produces: ['review-handle', 'human-gate-block-evidence']
        },
        {
            id: 'evidence.deposit',
            description:
                'Compose evidence envelope; submit (gateway via s5\'.review.submit if ' +
                'human, else defer-only). Verify source/graph/review/test/profile/ ' +
                'DAY-NOW/session/bridge-readiness refs survive a workspace reload.',
            layout: 'ide-deep',
            produces: ['evidence-envelope-handle', 'reload-persistence-evidence']
        },
        {
            id: 'layout.switch-back-to-daily',
            description:
                'OmniPanel command returns to 0/1 daily layout. State preserved.',
            layout: 'daily-0-1',
            produces: [
                'layout-mode-handle:daily-0-1',
                'bridge-subscription-id:STILL-UNCHANGED'
            ]
        },
        {
            id: 'shutdown.clean',
            description:
                'Theia Electron exits cleanly; gateway stops; SpaceTimeDB + Neo4j + ' +
                'Redis remain (operator-managed).',
            layout: 'any',
            produces: ['exit-code:0']
        }
    ],
    privacyAuditSurfaces: [
        'Theia widget render state (Bimba graph viewer / Canon Studio / Agentic Control Room / Coordinate Tree / Logos Atelier / Evidence Pane / Review Pane / Autoresearch Pane)',
        'SpaceTimeDB rows visible to the renderer',
        'Graph payloads delivered via kernel-bridge',
        'Theia console + log output',
        'S5 evidence envelope persisted state',
        'Workspace-state file on disk'
    ]
};

/** Verify every required service is listed. Pure function for tests. */
export function requiredServiceIds(plan: AcceptancePlan): string[] {
    return plan.services.filter(s => s.alwaysRequired).map(s => s.id);
}

/** Verify every step targets one of the two real layouts (or 'any'). */
export function stepLayoutsAreCanonical(plan: AcceptancePlan): boolean {
    return plan.steps.every(s =>
        s.layout === 'daily-0-1' || s.layout === 'ide-deep' || s.layout === 'any'
    );
}
