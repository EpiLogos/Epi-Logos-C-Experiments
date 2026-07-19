/**
 * Coordinate: M' M3' (cosmic-wheel render service — Track 24.T24.1)
 * Residency: Body/M/pratibimba-app/src/components
 * Actualises: `M3CosmicWheelRenderService` — the single source of wheel
 *   rendering for all three composition modes (`badge` | `mini-view` |
 *   `full`). Its geometry and values are a pure function of `surface`; the
 *   shared M3 contexts contribute only profile-generation/readiness stamps.
 *   The 64-cell codon ring is coloured by the bussed codonClass, with the active cell luminous and its
 *   rotation arrow, the 22 Major-Arcana inner-ring SLOTS (the arcana map
 *   itself is kernel-owned and not yet bussed — rendered honest-pending,
 *   never from a local table), and the Quintessence centre audit over the
 *   optional authority-provided charge quaternion (Tranche 24.11). Refuses to render when the surface
 *   is not ready and falls through to the pending banner.
 * Does NOT own: the profile cache or tick store (callers build the surface
 *   via `buildM3WheelSurface`), codon/arcana/hexagram tables (kernel via
 *   bus only), charge-quaternion computation, depth views (24.2+).
 */

import { useEffect } from 'react';
import { CL42_PALETTE, ProvenanceBadge } from '../ui/primitives';
import { ringLit, wheelUnlit } from '../ui/tokens';
import {
    ChargeQuaternionBoundary,
    QuintessenceIndicator
} from './QuintessenceIndicator';
import { M3ReadinessBoundary } from '../panes/m3SurfaceContext';

export interface M3WheelProjection {
    readonly surfaceIndex: number | null;
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
    readonly lineChangeOperator: string | null;
    readonly datasetLutState: string | null;
}

export interface M3WheelSurface {
    readonly readiness: { readonly surfaceReady: boolean; readonly reason: string | null };
    readonly activeProjection: M3WheelProjection | null;
    /** WC-M3-SA-2: the codon → Major-Arcana card id is kernel-owned and not
     *  yet bussed; the inner ring renders slots + this pending marker. */
    readonly majorArcana: 'pending-major-arcana-map';
    readonly tick: number | null;
    readonly tick12: number | null;
    readonly degree720: number | null;
    readonly generation: number;
    readonly chargeQuaternion: ChargeQuaternionBoundary | null;
    readonly quintessenceState:
        | 'ready'
        | 'pending-charge-quaternion'
        | 'authority_payload_missing'
        | 'authority_payload_invariant_violation';
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

function chargeQuaternionFromMahamaya(
    mahamaya: Record<string, unknown> | null
): { charge: ChargeQuaternionBoundary | null; present: boolean } {
    const candidate = mahamaya?.chargeQuaternion;
    if (candidate === undefined || candidate === null) {
        return { charge: null, present: false };
    }
    const value = objectValue(candidate);
    if (!value) {
        return { charge: null, present: true };
    }
    const pp = num(value.pp);
    const mm = num(value.mm);
    const mp = num(value.mp);
    const pm = num(value.pm);
    const fourX = num(value.fourX);
    if (
        pp === null ||
        mm === null ||
        mp === null ||
        pm === null ||
        fourX === null ||
        typeof value.chargeQuaternionInvariant !== 'boolean'
    ) {
        return { charge: null, present: true };
    }
    return {
        charge: Object.freeze({
            pp,
            mm,
            mp,
            pm,
            fourX,
            chargeQuaternionInvariant: value.chargeQuaternionInvariant
        }),
        present: true
    };
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
    const chargeRead = chargeQuaternionFromMahamaya(mahamaya);
    const quintessenceState = !chargeRead.present
        ? ('pending-charge-quaternion' as const)
        : chargeRead.charge === null
          ? ('authority_payload_missing' as const)
          : chargeRead.charge.chargeQuaternionInvariant
            ? ('ready' as const)
            : ('authority_payload_invariant_violation' as const);
    const codonId = crp ? num(crp.codonId) : null;

    const activeProjection: M3WheelProjection | null =
        crp && codonId !== null && codonId >= 0 && codonId < 64
            ? Object.freeze({
                  surfaceIndex: num(crp.surfaceIndex),
                  codonId,
                  codon: str(crp.codon),
                  codonClass: str(crp.codonClass),
                  rotation: num(crp.rotation),
                  rotationalStateCount: num(crp.rotationalStateCount),
                  rotationDegrees: num(crp.rotationDegrees),
                  hexagramId: mahamaya ? num(mahamaya.hexagramId) : null,
                  tarotMinorId: mahamaya ? num(mahamaya.tarotMinorId) : null,
                  tarotShadowCodon: mahamaya ? num(mahamaya.tarotShadowCodon) : null,
                  lineChangeOperator: mahamaya
                      ? str(mahamaya.lineChangeOperator) ??
                        (num(mahamaya.lineChangeOperatorAddress) === null
                            ? null
                            : String(num(mahamaya.lineChangeOperatorAddress)))
                      : null,
                  datasetLutState: str(crp.datasetLutState)
              })
            : null;

    return Object.freeze({
        readiness: Object.freeze({
            surfaceReady:
                activeProjection !== null &&
                quintessenceState !== 'authority_payload_missing' &&
                quintessenceState !== 'authority_payload_invariant_violation',
            reason:
                activeProjection === null
                    ? 'pending-codon-rotation-projection'
                    : quintessenceState === 'authority_payload_missing' ||
                        quintessenceState === 'authority_payload_invariant_violation'
                      ? 'authority_payload_missing'
                      : null
        }),
        activeProjection,
        majorArcana: 'pending-major-arcana-map' as const,
        tick: num(root.tick),
        tick12: num(root.tick12),
        degree720: num(root.degree720),
        generation: input.generation,
        chargeQuaternion: chargeRead.charge,
        quintessenceState
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
    if (surface.activeProjection === null) {
        const reason = surface.readiness.reason ?? 'pending-codon-rotation-projection';
        return (
            <M3ReadinessBoundary
                bindingKey="m3.cosmic-wheel"
                fallback={{ state: 'pending', reason }}
            >
                <p className="mext-widget-empty" data-testid="m3-wheel-pending" data-reason={reason}>
                    <ProvenanceBadge state="pending" reason={reason} />
                    cosmic wheel {reason} — the 64-cell ring renders when the bus carries
                    the codon-rotation projection; no local codon table exists here.
                </p>
            </M3ReadinessBoundary>
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
        <M3ReadinessBoundary
            bindingKey="m3.cosmic-wheel"
            fallback={{
                state: surface.readiness.surfaceReady ? 'ready' : 'blocked',
                reason: surface.readiness.reason ?? 'profile-current'
            }}
        >
            <figure
                className="m3-cosmic-wheel"
                data-testid="m3-cosmic-wheel"
                data-mode={mode}
                data-codon-id={projection.codonId}
                data-generation={surface.generation}
                data-readiness={surface.readiness.surfaceReady ? 'ready' : surface.readiness.reason}
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
                    <QuintessenceIndicator
                        surface={surface}
                        cx={c}
                        cy={c}
                        radius={size * (mode === 'badge' ? 0.16 : 0.12)}
                    />
                </svg>
                {showArcana ? (
                    <figcaption data-testid="m3-wheel-arcana-pending">
                        <ProvenanceBadge state="pending" reason={surface.majorArcana} />
                        arcana ring: slots only — {surface.majorArcana} (WC-M3-SA-2)
                        {mode === 'full' && surface.quintessenceState === 'pending-charge-quaternion' ? (
                            <span data-testid="m3-wheel-quintessence-pending">
                                {' '}
                                · centre: pending-quintessence-indicator (24.11)
                            </span>
                        ) : null}
                        {surface.quintessenceState === 'authority_payload_invariant_violation' ? (
                            <span data-testid="m3-quintessence-invariant-violation">
                                {' '}
                                · authority_payload_invariant_violation
                            </span>
                        ) : null}
                        {surface.quintessenceState === 'authority_payload_missing' ? (
                            <span data-testid="m3-quintessence-authority-missing">
                                {' '}
                                · authority_payload_missing
                            </span>
                        ) : null}
                    </figcaption>
                ) : null}
            </figure>
        </M3ReadinessBoundary>
    );
}
