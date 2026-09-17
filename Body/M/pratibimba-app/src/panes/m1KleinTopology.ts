/**
 * Coordinate: M' M1' (Klein-topology instrument logic — Track 02.T2.3)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the `m1.paramasiva.kleinTopology` view model — the M1-5
 *   single-torus invariants (DOUBLE_COVER_DEG / TORUS_GENUS / Hopf identity /
 *   kernel-owned torus-knot `(p,q)` phase / K² tritone crossing / M1-origin Klein flip) sourced from the bridge
 *   profile payload's `m1Topology` (portal-core `M1TopologyProjection`), plus
 *   the live Klein-flip signal. When the profile carries `kleinFlip = Some(..)`
 *   the view yields an `m1.klein_flip.source` observability event for the
 *   current generation. Contract surfaces (topology field shape, the event
 *   type) are LAW; provenance: ported from the frozen epi-theia
 *   `extensions/m1-paramasiva/src/common/clock-instrument.ts`
 *   (buildM1KleinTopologyView / topologyFromPayload), re-verified against the
 *   live portal-core `profile_projections.rs::M1TopologyProjection` producer.
 * Does NOT own: topology genesis (portal-core), gateway I/O, flexlayout.
 */

export const M1_KLEIN_TOPOLOGY_EXTENSION_ID = 'm1.paramasiva' as const;
export const M1_KLEIN_FLIP_SOURCE_EVENT = 'm1.klein_flip.source' as const;
const PRIVACY_CLASS = 'public-current-context' as const;

/** The topology block the carrier renders. Mirrors the frozen
 *  `M1ProfileClockModel['topology']` contract shape exactly. */
export interface M1KleinTopology {
    readonly doubleCoverDeg: number | null;
    readonly torusGenus: number | null;
    /** Kernel-owned `(p,q)` phase of the M1 topology; never locally derived. */
    readonly torusKnotPhase: Readonly<{ p: number; q: number }> | null;
    readonly hopfIdentity: string | null;
    readonly k2TritoneCrossing: string | null;
    readonly m1OriginKleinFlip: string | null;
    readonly parentAttribution: string;
    readonly priorGround: string;
    readonly downstreamDoubleTorus: string;
    readonly source: string;
}

export interface M1ObservabilityEvent {
    readonly type: typeof M1_KLEIN_FLIP_SOURCE_EVENT;
    readonly extensionId: typeof M1_KLEIN_TOPOLOGY_EXTENSION_ID;
    readonly emittedAt: number;
    readonly payload: Readonly<Record<string, unknown>>;
}

export interface M1KleinTopologyViewModel {
    readonly topology: M1KleinTopology;
    readonly kleinFlip: {
        readonly present: boolean;
        readonly tickFlip: boolean;
        readonly source: unknown;
    };
    readonly observabilityEvents: readonly M1ObservabilityEvent[];
}

function objectValue(value: unknown): Record<string, unknown> | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

/** Strictly read the kernel's `M1TopologyProjection.torus_knot_phase` pair.
 *  A malformed or absent pair remains pending; the carrier never synthesises
 *  a local phase from tick or degree. */
export function readTorusKnotPhase(
    topology: Readonly<Record<string, unknown>> | null
): Readonly<{ p: number; q: number }> | null {
    const raw = objectValue(topology?.torusKnotPhase ?? topology?.torus_knot_phase);
    const p = numberValue(raw?.p);
    const q = numberValue(raw?.q);
    return p === null || q === null ? null : Object.freeze({ p, q });
}

/** Read the M1-5 topology block from the profile payload's `m1Topology`
 *  (falling back to `topology`). The three attribution strings are canonical
 *  M1 law — read the live bridge value when present, else the canonical
 *  fallback, so the view is truthful whether or not the substrate emitted
 *  them. `source` records whether the invariants came from the kernel. */
export function topologyFromPayload(payload: Readonly<Record<string, unknown>>): M1KleinTopology {
    const topology = objectValue(payload.m1Topology ?? payload.topology);
    return Object.freeze({
        doubleCoverDeg: numberValue(topology?.doubleCoverDeg ?? topology?.DOUBLE_COVER_DEG),
        torusGenus: numberValue(topology?.torusGenus ?? topology?.TORUS_GENUS),
        torusKnotPhase: readTorusKnotPhase(topology),
        hopfIdentity: stringValue(topology?.hopfIdentity ?? topology?.hopfBundle),
        k2TritoneCrossing: stringValue(topology?.k2TritoneCrossing ?? topology?.tritoneCrossing),
        m1OriginKleinFlip: stringValue(topology?.m1OriginKleinFlip ?? topology?.kleinFlipSource),
        parentAttribution:
            stringValue(topology?.parentAttribution) ??
            'M1-5 is the +1 parent / single-torus recognition site.',
        priorGround:
            stringValue(topology?.priorGround) ??
            'M0 is the prior 0/1 ground that M1 receives; M0 is not the +1.',
        downstreamDoubleTorus:
            stringValue(topology?.downstreamDoubleTorus) ??
            'Double-torus rendering is delegated downstream to M3-5.',
        source: topology
            ? 'kernel/profile topology payload'
            : 'blocked until kernel/profile exposes M1 topology constants'
    });
}

/**
 * Build the `m1.paramasiva.kleinTopology` view model from a bridge profile
 * payload. The live `kleinFlip` field (Rust `Option<..>` → object / null)
 * decides whether an `m1.klein_flip.source` observability event fires for this
 * generation; `anandaVortex.kleinFlipAtThisTick` reports the tick-latched flip.
 */
export function buildM1KleinTopologyView(input: {
    readonly payload: Readonly<Record<string, unknown>>;
    readonly generation: number;
    readonly emittedAt: number;
    readonly coordinate?: string;
}): M1KleinTopologyViewModel {
    const payload = input.payload;
    const topology = topologyFromPayload(payload);
    const vortex = objectValue(payload.anandaVortex);
    const kleinFlipValue = payload.kleinFlip ?? payload.klein_flip ?? null;
    const tickFlip = vortex?.kleinFlipAtThisTick === true;
    const present = kleinFlipValue !== null && kleinFlipValue !== undefined;

    const events: M1ObservabilityEvent[] = [];
    if (present) {
        events.push(
            Object.freeze({
                type: M1_KLEIN_FLIP_SOURCE_EVENT,
                extensionId: M1_KLEIN_TOPOLOGY_EXTENSION_ID,
                emittedAt: input.emittedAt,
                payload: Object.freeze({
                    m1Origin: true,
                    sourceExtension: M1_KLEIN_TOPOLOGY_EXTENSION_ID,
                    coordinate: input.coordinate ?? 'M1',
                    profileGeneration: input.generation,
                    privacyClass: PRIVACY_CLASS,
                    kleinFlip: kleinFlipValue,
                    kleinFlipAtThisTick: tickFlip,
                    doubleCoverDeg: topology.doubleCoverDeg,
                    torusGenus: topology.torusGenus,
                    hopfIdentity: topology.hopfIdentity,
                    k2TritoneCrossing: topology.k2TritoneCrossing
                })
            })
        );
    }

    return Object.freeze({
        topology,
        kleinFlip: Object.freeze({ present, tickFlip, source: kleinFlipValue }),
        observabilityEvents: Object.freeze(events)
    });
}
