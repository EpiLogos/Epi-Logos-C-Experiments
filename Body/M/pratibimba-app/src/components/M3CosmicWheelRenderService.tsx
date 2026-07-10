/**
 * Coordinate: M' M3' (cosmic-wheel render service — Track 24.T24.1)
 * Residency: Body/M/pratibimba-app/src/components
 * Actualises: `M3CosmicWheelRenderService` — the single source of wheel
 *   rendering for all three composition modes (`badge` | `mini-view` |
 *   `full`). A PURE function of its `surface` prop: the 64-cell codon ring
 *   coloured by the bussed codonClass, the active cell luminous with its
 *   rotation arrow, the 22 Major-Arcana inner-ring SLOTS (the arcana map
 *   itself is kernel-owned and not yet bussed — rendered honest-pending,
 *   never from a local table), and the Quintessence centre slot (the
 *   indicator body is Tranche 24.11's). Refuses to render when the surface
 *   is not ready and falls through to the pending banner.
 * Does NOT own: the profile cache or tick store (callers build the surface
 *   via `buildM3WheelSurface`), codon/arcana/hexagram tables (kernel via
 *   bus only), the QuintessenceIndicator body (24.11), depth views (24.2+).
 */

import { useEffect } from 'react';
import { CL42_PALETTE, ProvenanceBadge } from '../ui/primitives';
import { ringLit, wheelUnlit } from '../ui/tokens';

export interface M3WheelProjection {
    readonly codonId: number;
    readonly codon: string | null;
    /** Wire label from portal-core codon_rotation_projection ('dual' |
     *  'non-dual' today; forward-compatible with the 4-class split). */
    readonly codonClass: string | null;
    readonly rotation: number | null;
    readonly rotationalStateCount: number | null;
    readonly rotationDegrees: number | null;
    readonly hexagramId: number | null;
    readonly tarotMinorId: number | null;
    readonly tarotShadowCodon: number | null;
    readonly datasetLutState: string | null;
}

export interface M3WheelSurface {
    readonly readiness: { readonly surfaceReady: boolean; readonly reason: string | null };
    readonly activeProjection: M3WheelProjection | null;
    /** WC-M3-SA-2: the codon → Major-Arcana card id is kernel-owned and not
     *  yet bussed; the inner ring renders slots + this pending marker. */
    readonly majorArcana: 'pending-major-arcana-map';
    readonly tick12: number | null;
    readonly degree720: number | null;
    readonly generation: number;
}

export interface M3CosmicWheelRenderServiceProps {
    readonly surface: M3WheelSurface;
    readonly mode: 'badge' | 'mini-view' | 'full';
    readonly tickHandler?: (tick: number, degree720: number) => void;
}

function objectValue(value: unknown): Record<string, unknown> | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function num(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function str(value: unknown): string | null {
    return typeof value === 'string' ? value : null;
}

/** Pure builder: bussed profile payload → wheel surface. Reads the same
 *  windows as m3Inspectors.ts (codonRotationProjection + mahamaya + clock);
 *  absence is pending, never fabricated. */
export function buildM3WheelSurface(input: {
    readonly payload: Readonly<Record<string, unknown>>;
    readonly generation: number;
}): M3WheelSurface {
    const root =
        objectValue((input.payload as { harmonicProfile?: unknown }).harmonicProfile) ??
        input.payload;
    const crp = objectValue(root.codonRotationProjection);
    const mahamaya = objectValue(root.mahamaya);
    const codonId = crp ? num(crp.codonId) : null;

    const activeProjection: M3WheelProjection | null =
        crp && codonId !== null && codonId >= 0 && codonId < 64
            ? Object.freeze({
                  codonId,
                  codon: str(crp.codon),
                  codonClass: str(crp.codonClass),
                  rotation: num(crp.rotation),
                  rotationalStateCount: num(crp.rotationalStateCount),
                  rotationDegrees: num(crp.rotationDegrees),
                  hexagramId: mahamaya ? num(mahamaya.hexagramId) : null,
                  tarotMinorId: mahamaya ? num(mahamaya.tarotMinorId) : null,
                  tarotShadowCodon: mahamaya ? num(mahamaya.tarotShadowCodon) : null,
                  datasetLutState: str(crp.datasetLutState)
              })
            : null;

    return Object.freeze({
        readiness: Object.freeze({
            surfaceReady: activeProjection !== null,
            reason: activeProjection === null ? 'pending-codon-rotation-projection' : null
        }),
        activeProjection,
        majorArcana: 'pending-major-arcana-map' as const,
        tick12: num(root.tick12),
        degree720: num(root.degree720),
        generation: input.generation
    });
}

const hex = (value: number): string => `#${value.toString(16).padStart(6, '0')}`;

/** Cell colour from the bussed codonClass label — the Cl(4,2) palette is the
 *  single colour source (dual = explicate warm, non-dual = implicate indigo). */
function classColour(codonClass: string | null): string {
    if (codonClass === null) {
        return wheelUnlit;
    }
    return codonClass.startsWith('dual')
        ? hex(CL42_PALETTE.explicateWarm)
        : hex(CL42_PALETTE.implicateIndigo);
}

const MODE_SIZE = { badge: 48, 'mini-view': 160, full: 340 } as const;

export function M3CosmicWheelRenderService({
    surface,
    mode,
    tickHandler
}: M3CosmicWheelRenderServiceProps) {
    const { tick12, degree720 } = surface;
    useEffect(() => {
        if (tickHandler && tick12 !== null && degree720 !== null) {
            tickHandler(tick12, degree720);
        }
    }, [tickHandler, tick12, degree720]);

    // Composition guard: no ready surface, no wheel — honest pending only.
    if (!surface.readiness.surfaceReady || surface.activeProjection === null) {
        const reason = surface.readiness.reason ?? 'pending-codon-rotation-projection';
        return (
            <p className="mext-widget-empty" data-testid="m3-wheel-pending" data-reason={reason}>
                <ProvenanceBadge state="pending" reason={reason} />
                cosmic wheel {reason} — the 64-cell ring renders when the bus carries
                the codon-rotation projection; no local codon table exists here.
            </p>
        );
    }

    const projection = surface.activeProjection;
    const size = MODE_SIZE[mode];
    const c = size / 2;
    const outerR = c * 0.88;
    const cellR = mode === 'badge' ? size * 0.028 : size * 0.022;
    const arcanaR = c * 0.58;
    const showLabels = mode === 'full';
    const showArcana = mode !== 'badge';

    const rotationArrow =
        projection.rotation !== null && projection.rotationalStateCount !== null
            ? { rotation: projection.rotation, states: projection.rotationalStateCount }
            : null;

    const cells = [];
    for (let i = 0; i < 64; i++) {
        const angle = -Math.PI / 2 + (i / 64) * Math.PI * 2;
        const x = c + Math.cos(angle) * outerR;
        const y = c + Math.sin(angle) * outerR;
        const active = i === projection.codonId;
        cells.push(
            <g key={i}>
                <circle
                    data-testid={`m3-wheel-cell-${i}`}
                    data-active={active ? 'true' : 'false'}
                    cx={x}
                    cy={y}
                    r={active ? cellR * 1.9 : cellR}
                    fill={active ? ringLit : classColour(projection.codonClass)}
                    opacity={active ? 1 : 0.55}
                />
                {showLabels && active ? (
                    <text
                        data-testid="m3-wheel-active-label"
                        x={x}
                        y={y - cellR * 3}
                        textAnchor="middle"
                        fontSize={size * 0.032}
                        fill={ringLit}
                    >
                        {projection.codon ?? `0x${i.toString(16).padStart(2, '0')}`}
                    </text>
                ) : null}
            </g>
        );
    }

    const arcanaSlots = [];
    if (showArcana) {
        for (let card = 0; card < 22; card++) {
            const angle = -Math.PI / 2 + (card / 22) * Math.PI * 2;
            arcanaSlots.push(
                <circle
                    key={card}
                    data-testid={`m3-wheel-arcana-slot-${card}`}
                    cx={c + Math.cos(angle) * arcanaR}
                    cy={c + Math.sin(angle) * arcanaR}
                    r={size * 0.014}
                    fill="none"
                    stroke={hex(CL42_PALETTE.implicateIndigo)}
                    strokeWidth={1}
                    opacity={0.7}
                />
            );
        }
    }

    return (
        <figure
            className="m3-cosmic-wheel"
            data-testid="m3-cosmic-wheel"
            data-mode={mode}
            data-codon-id={projection.codonId}
            data-generation={surface.generation}
        >
            <svg
                viewBox={`0 0 ${size} ${size}`}
                width={size}
                height={size}
                role="img"
                aria-label={`M3 cosmic wheel — codon ${projection.codon ?? projection.codonId}`}
            >
                {cells}
                {showArcana ? <g data-testid="m3-wheel-arcana-ring">{arcanaSlots}</g> : null}
                {rotationArrow ? (
                    <line
                        data-testid="m3-wheel-rotation-arrow"
                        data-rotation={rotationArrow.rotation}
                        data-rotation-states={rotationArrow.states}
                        x1={c}
                        y1={c}
                        x2={
                            c +
                            Math.cos(
                                -Math.PI / 2 +
                                    ((projection.rotationDegrees ?? 0) / 360) * Math.PI * 2
                            ) *
                                outerR *
                                0.42
                        }
                        y2={
                            c +
                            Math.sin(
                                -Math.PI / 2 +
                                    ((projection.rotationDegrees ?? 0) / 360) * Math.PI * 2
                            ) *
                                outerR *
                                0.42
                        }
                        stroke={ringLit}
                        strokeWidth={mode === 'badge' ? 1 : 2}
                    />
                ) : null}
                {mode === 'full' ? (
                    <circle
                        data-testid="m3-wheel-quintessence"
                        cx={c}
                        cy={c}
                        r={size * 0.03}
                        fill={hex(CL42_PALETTE.implicateIndigo)}
                        opacity={0.9}
                    />
                ) : null}
            </svg>
            {showArcana ? (
                <figcaption data-testid="m3-wheel-arcana-pending">
                    <ProvenanceBadge state="pending" reason={surface.majorArcana} />
                    arcana ring: slots only — {surface.majorArcana} (WC-M3-SA-2)
                    {mode === 'full' ? (
                        <span data-testid="m3-wheel-quintessence-pending">
                            {' '}
                            · centre: pending-quintessence-indicator (24.11)
                        </span>
                    ) : null}
                </figcaption>
            ) : null}
        </figure>
    );
}
