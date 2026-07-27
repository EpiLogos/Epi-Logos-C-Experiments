/**
 * DR-WC-M1-1 resolution (per 15.4 composition-pattern + 15.7 BimbaPratibimbaUiState,
 * retargeted to the pratibimba-app carrier per the cycle-3 full-rerun CHARTER):
 * the kernel-bridge singleton owns the state tuple `(coordinate, lens, mode,
 * profileGeneration, tick12, position6, active_matrix_op, k2_orientation_q)`.
 * Both surfaces (composed cosmic-1-2-3 + standalone `ide-deep`) are pure views
 * over this singleton. The deep faces (22.1 / 22.3 / 22.4 / 22.8 / 22.9)
 * subscribe to the singleton and render purely from it. Mid-tick layout
 * transitions preserve state because the singleton outlives any individual
 * widget; widget mount in the new layout reads the current state and resumes
 * rendering at that point. No state divergence is possible because both
 * surfaces share the same data source. If a future surface needs
 * surface-specific state (e.g. a "favourite matrix family" preference), it
 * MUST be modelled as a typed sub-record of the persisted UI state (15.7
 * contract), not as widget-local React state.
 *
 * Carrier mapping (Theia plumbing is DEAD; contract surfaces are LAW):
 * "kernel-bridge DI singleton" = the module-scope zustand stores in
 * `src/state/stores.ts` (`useTickStore` carries profileGeneration + the whole
 * profile payload: tick12, position6, anandaVortex.activeMatrixOp,
 * anandaVortex.ringQuaternion = k2_orientation_q; `useCoordinateStore` carries
 * the coordinate thread; lens/mode ride the profile's `lensMode`).
 * "SharedBridgeAdapter subscription" = the zustand hook subscription.
 * "composed vs standalone layouts" = the flexlayout 0/1 faces (App.tsx),
 * which render over the same store singletons and therefore cannot diverge.
 *
 * Coordinate: M' M1' (surface-dispatch contract — Track 22.T22.10)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position: #1 (M1' Paramaśiva)
 * Actualises: the typed standalone-vs-composed dispatch contract — the frozen
 *   `surface-dispatch.ts` type shape (M1SurfaceMode three-mode inventory,
 *   M1SurfaceContext discriminator, selectM1Body dispatch) as carrier faces
 *   per DR-FACE-7: `standalone-ide-deep` composes the landed M1' deep faces
 *   (SpandaNavigatorPane 22.1, WalkPane + # invert T2.5, KleinTopologyPane
 *   T2.3) plus the landed deep inspector faces (22.3 Cl(4,2) signature
 *   inspector / 22.4 Klein-flip event-strip / 22.8 vortex matrices browser /
 *   22.9 audio-bus inspector — all pure views over the same bus fields via
 *   `m1DeepFaceData.ts`); `composed-cosmic-1-2-3` renders the compact
 *   walk-strip + topology mini-view + the cosmic cross-pole contribution
 *   (overlays only — the played-torus centrepiece is the composition
 *   mount-point per 15.4, NOT rendered here); `compact-track-08` is the
 *   composed body minus the cosmic cross-pole contribution. ONE shared
 *   profile/clock state (the tick-store singleton) drives all three modes as
 *   pure views.
 * Public surface: M1_SURFACE_MODES, M1SurfaceMode, M1SurfaceContext,
 *   M1ExtensionBodyProps, selectM1Body, resolveM1SurfaceContext,
 *   readM1SharedState, useM1SharedSurfaceState, M1SurfaceDispatchPane.
 * Does NOT own: the store law (state/stores.ts), profile parsing beyond the
 *   tuple window (bridge/types.ts + m1PlayedTorus.ts vortexFromPayload — one
 *   parser ontology, never a second), the played-torus visual (15.4/15.8
 *   composition mount-point), gateway I/O, flexlayout face law (App.tsx).
 */

import { ComponentType, useMemo } from 'react';
import { KernelBridgeCachedProfile } from '../bridge/types';
import { useTickStore } from '../state/stores';
import { vortexFromPayload } from './m1PlayedTorus';
import { topologyFromPayload } from './m1KleinTopology';
import { SpandaNavigatorPane } from './SpandaNavigatorPane';
import { WalkPane } from './WalkPane';
import { KleinTopologyPane } from './KleinTopologyPane';
import { M1Cl42SignatureInspector } from './m1Cl42SignatureInspector';
import { M1KleinFlipEventStrip } from './m1KleinFlipEventStrip';
import { M1KaprekarInspector } from './m1KaprekarInspector';
import { M1VortexMatricesBrowser } from './m1VortexMatricesBrowser';
import { M1AudioBusInspector } from './m1AudioBusInspector';
import type { LayoutId } from '../ui/layoutId';

// ---- The typed contract (frozen surface-dispatch.ts shape — LAW) ----

export const M1_SURFACE_MODES = [
    'standalone-ide-deep',
    'composed-cosmic-1-2-3',
    'compact-track-08'
] as const;

export type M1SurfaceMode = (typeof M1_SURFACE_MODES)[number];

export interface M1SurfaceContext {
    readonly mode: M1SurfaceMode;
    readonly layoutId: LayoutId;
    readonly compositionPluginId?: 'plugin-integrated-1-2-3' | 'plugin-integrated-4-5-0';
    readonly activityBarMode?:
        | 'coordinate-tree'
        | 'bimba-graph-viewer'
        | 'canon-studio'
        | 'backend-studio'
        | 'smart-connections';
}

export interface M1ExtensionBodyProps {
    readonly surfaceContext: M1SurfaceContext;
}

/** Resolve the carrier surface context from the mounting face (App.tsx
 *  flexlayout 0/1). Face 0 (cosmic) is the composed `daily-0-1` layout —
 *  the 1-2-3 composition unless the mount is a non-cosmic compact strip;
 *  face 1 (personal) hosts the standalone `ide-deep` deep page. */
export function resolveM1SurfaceContext(input: {
    readonly face: 0 | 1;
    readonly cosmicComposition?: boolean;
}): M1SurfaceContext {
    if (input.face === 1) {
        return Object.freeze({ mode: 'standalone-ide-deep' as const, layoutId: 'ide-deep' as const });
    }
    if (input.cosmicComposition === false) {
        return Object.freeze({ mode: 'compact-track-08' as const, layoutId: 'daily-0-1' as const });
    }
    return Object.freeze({
        mode: 'composed-cosmic-1-2-3' as const,
        layoutId: 'daily-0-1' as const,
        compositionPluginId: 'plugin-integrated-1-2-3' as const
    });
}

// ---- The ONE shared M1 profile/clock state (pure window, no derivation) ----

/** The DR-WC-M1-1 state tuple as read from the tick-store singleton. Every
 *  field is a verbatim window onto a kernel write; absence is null (pending),
 *  never a locally-computed fallback. */
export interface M1SharedSurfaceState {
    readonly generation: number | null;
    readonly tick12: number | null;
    readonly position6: number | null;
    readonly activeMatrixOp: string | null;
    /** `anandaVortex.ringQuaternion` verbatim — the K² orientation. */
    readonly k2OrientationQ: readonly number[] | null;
}

function objectValue(value: unknown): Record<string, unknown> | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function num(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** The bus may nest the profile under `harmonicProfile` (wire shape) or hand
 *  the payload directly — the same unwrap the sibling view models apply. */
function profileRoot(payload: Record<string, unknown>): Record<string, unknown> {
    return objectValue(payload.harmonicProfile) ?? payload;
}

/** Read the DR-WC-M1-1 tuple off the cached profile. The vortex fields reuse
 *  the strict T2.6 reader (`vortexFromPayload`) — one parser ontology; a
 *  malformed projection yields null members, never a part-fill. */
export function readM1SharedState(cached: KernelBridgeCachedProfile | null): M1SharedSurfaceState {
    const payload = objectValue(cached?.profile ?? null);
    const root = payload ? profileRoot(payload) : null;
    const vortex = payload ? vortexFromPayload(payload) : null;
    return Object.freeze({
        generation: cached?.generation ?? null,
        tick12: num(root?.tick12),
        position6: num(root?.position6),
        activeMatrixOp: vortex?.activeMatrixOp ?? null,
        k2OrientationQ: vortex?.ringQuaternion ?? null
    });
}

/** The one subscription seam all three mode bodies consume — a pure view
 *  over the tick-store singleton (which outlives every mounted face). */
export function useM1SharedSurfaceState(): M1SharedSurfaceState {
    const cached = useTickStore(s => s.profile);
    return useMemo(() => readM1SharedState(cached), [cached]);
}

// ---- Shared chrome: the tuple readout every mode renders identically ----

function show(value: number | string | null): string {
    return value === null ? 'pending' : String(value);
}

function M1SharedStateStrip() {
    const shared = useM1SharedSurfaceState();
    return (
        <div
            className="pane-toolbar"
            data-testid="m1-shared-state"
            data-generation={shared.generation ?? ''}
            data-tick12={shared.tick12 ?? ''}
            data-position6={shared.position6 ?? ''}
            data-active-matrix-op={shared.activeMatrixOp ?? ''}
            data-k2-orientation-q={shared.k2OrientationQ?.join(',') ?? ''}
        >
            t12 {show(shared.tick12)} · p6 {show(shared.position6)} · family{' '}
            {show(shared.activeMatrixOp)} · q [{shared.k2OrientationQ?.join(', ') ?? 'pending'}] ·
            gen {show(shared.generation)}
        </div>
    );
}

// ---- Compact track-08 exports (carrier equivalents, pure views) ----

const TWELVEFOLD = 12;

/** Carrier equivalent of the track-08 `M1WalkStrip` compact export: twelve
 *  tick cells + the position6 marker, driven only by the shared state. */
function M1WalkStrip() {
    const shared = useM1SharedSurfaceState();
    return (
        <div className="spanda-stops" data-testid="m1-walk-strip">
            {Array.from({ length: TWELVEFOLD }, (_, stop) => (
                <span
                    key={stop}
                    data-testid={`m1-walk-strip-cell-${stop}`}
                    data-active={stop === shared.tick12 ? 'true' : 'false'}
                >
                    {stop}
                </span>
            ))}
            <span data-testid="m1-walk-strip-position6">p6 {show(shared.position6)}</span>
        </div>
    );
}

/** Carrier equivalent of the track-08 `M1TopologyMiniView` compact export:
 *  the M1-5 invariants verbatim from the bus (`m1Topology`), blocked text
 *  when the substrate has not emitted them. */
function M1TopologyMiniView() {
    const cached = useTickStore(s => s.profile);
    const topology = useMemo(
        () => topologyFromPayload(profileRoot(objectValue(cached?.profile ?? null) ?? {})),
        [cached]
    );
    return (
        <div className="pane-toolbar" data-testid="m1-topology-mini">
            double-cover {topology.doubleCoverDeg ?? 'blocked'}° · genus{' '}
            {topology.torusGenus ?? 'blocked'} · {topology.hopfIdentity ?? 'hopf blocked'}
        </div>
    );
}

/** The cosmic cross-pole contribution — what m1-paramasiva CONTRIBUTES to the
 *  1-2-3 composition (active family, Klein-flip latch, K² orientation) for the
 *  played-torus centrepiece to consume as overlays. The centrepiece itself
 *  (PlayedTorusPane / CosmicEngine K²) is the composition mount-point per
 *  15.4 and is NOT rendered by this body. */
function M1CosmicCrossPoleContribution() {
    const shared = useM1SharedSurfaceState();
    const cached = useTickStore(s => s.profile);
    const kleinFlipAtThisTick = useMemo(() => {
        const payload = objectValue(cached?.profile ?? null);
        return payload ? (vortexFromPayload(payload)?.kleinFlipAtThisTick ?? null) : null;
    }, [cached]);
    return (
        <div className="pane-toolbar" data-testid="m1-cosmic-crosspole">
            crosspole → family {show(shared.activeMatrixOp)} · klein-flip{' '}
            {kleinFlipAtThisTick === null ? 'pending' : String(kleinFlipAtThisTick)} · q [
            {shared.k2OrientationQ?.join(', ') ?? 'pending'}]
        </div>
    );
}

// ---- The three mode bodies (pure views over the singleton) ----

function M1StandaloneIdeDeepBody(props: M1ExtensionBodyProps) {
    return (
        <div
            className="m1-surface-body"
            data-testid="m1-body-standalone-ide-deep"
            data-m1-surface-mode="standalone-ide-deep"
        >
            <M1SharedStateStrip />
            <section data-testid="m1-slot-spanda-navigator">
                <SpandaNavigatorPane />
            </section>
            <section data-testid="m1-slot-kaprekar">
                <M1KaprekarInspector layoutId={props.surfaceContext.layoutId} />
            </section>
            <section data-testid="m1-slot-walk">
                <WalkPane />
            </section>
            <section data-testid="m1-slot-klein-topology">
                <KleinTopologyPane />
            </section>
            <section data-testid="m1-slot-cl42">
                <M1Cl42SignatureInspector />
            </section>
            <section data-testid="m1-slot-klein-flip-strip">
                <M1KleinFlipEventStrip />
            </section>
            <section data-testid="m1-slot-vortex-browser">
                <M1VortexMatricesBrowser />
            </section>
            <section data-testid="m1-slot-audio-bus">
                <M1AudioBusInspector />
            </section>
        </div>
    );
}

function M1ComposedCosmic123Body(_props: M1ExtensionBodyProps) {
    return (
        <div
            className="m1-surface-body"
            data-testid="m1-body-composed-cosmic-1-2-3"
            data-m1-surface-mode="composed-cosmic-1-2-3"
        >
            <M1SharedStateStrip />
            <M1WalkStrip />
            <M1TopologyMiniView />
            <M1CosmicCrossPoleContribution />
        </div>
    );
}

function M1CompactTrack08Body(_props: M1ExtensionBodyProps) {
    return (
        <div
            className="m1-surface-body"
            data-testid="m1-body-compact-track-08"
            data-m1-surface-mode="compact-track-08"
        >
            <M1SharedStateStrip />
            <M1WalkStrip />
            <M1TopologyMiniView />
        </div>
    );
}

const M1_SURFACE_BODIES: Readonly<Record<M1SurfaceMode, ComponentType<M1ExtensionBodyProps>>> =
    Object.freeze({
        'standalone-ide-deep': M1StandaloneIdeDeepBody,
        'composed-cosmic-1-2-3': M1ComposedCosmic123Body,
        'compact-track-08': M1CompactTrack08Body
    });

/** The typed dispatch — total over the three-mode inventory (LAW). */
export function selectM1Body(mode: M1SurfaceMode): ComponentType<M1ExtensionBodyProps> {
    return M1_SURFACE_BODIES[mode];
}

/** The mountable face: resolves (or receives) the surface context and routes
 *  through `selectM1Body`. Default context is the standalone deep page —
 *  App.tsx passes the face-resolved context at its mount sites. */
export function M1SurfaceDispatchPane(props: { readonly context?: M1SurfaceContext }) {
    const context = props.context ?? resolveM1SurfaceContext({ face: 1 });
    const Body = selectM1Body(context.mode);
    return <Body surfaceContext={context} />;
}
