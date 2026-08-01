/**
 * Coordinate: M' M3' (hexagram body-dynamics viewer — Track 24.T24.8)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#n): M3' body-map read surface (presentational).
 * Actualises: the per-hexagram chakra + body-zone reading — a silhouette whose
 *   chakra points light from the resolved `primaryChakraId` /
 *   `secondaryChakraIds`, the body-zone list and dynamic descriptor beneath it,
 *   and a suit-element halo taken from the active codon's minor-arcana suit.
 * Public surface: M3HexagramBodyDynamicsViewer,
 *   M3_HEXAGRAM_BODY_DYNAMICS_WIDGET_ID, CHAKRA_POINT_COUNT.
 * Does NOT own: the body map. `HEXAGRAM_BODY_DYNAMICS[64]` and
 *   `CHAKRA_BODY_ZONES[8]` are substrate authority resolved over
 *   `s2.codon.scalar_ref.read`; this file holds NO chakra→zone table, NO
 *   per-hexagram row, and NO dynamic strings. The silhouette's point
 *   POSITIONS are renderer choreography over the chakra index — geometry, not
 *   anatomy data.
 * Contract: [[M3'-SPEC]] + rerun [[24-m3-mahamaya-frontend-deep]] 24.8.
 */

import { ProvenanceBadge } from '../ui/primitives';
import { inkDim, ringLit, wheelUnlit } from '../ui/tokens';
import {
    isResolvedHexagramBody,
    type HexagramBodyEntry,
    type HexagramBodyPending
} from '../services/m3/HexagramBodyDynamicsService';
import './m3HexagramBodyDynamics.css';

export const M3_HEXAGRAM_BODY_DYNAMICS_WIDGET_ID =
    'pratibimba.m3-mahamaya:hexagram-body-dynamics';

/**
 * Eight chakra ids, 0..7. Index 0 is Earth/Ground — the substrate's own
 * encoding (`oracle_identity::HexagramBodyEntry.primary_chakra`: "0=Earth/none,
 * 1=Muladhara … 7=Sahasrara"), so it sits BELOW the figure rather than on it.
 * These are positions on a silhouette, not chakra data.
 */
export const CHAKRA_POINT_COUNT = 8;

/** Vertical placement, 0 (ground, below the feet) → 7 (crown), as a 0..1 axis. */
const CHAKRA_AXIS: readonly number[] = Object.freeze([
    0.98, 0.84, 0.74, 0.63, 0.51, 0.38, 0.26, 0.14
]);

export interface M3HexagramBodyDynamicsViewerProps {
    /** The King Wen hexagram the reading was requested for (1..64), if any. */
    readonly hexagramId: number | null;
    /** Resolved row, honest-pending marker, or null (no read issued yet). */
    readonly entry: HexagramBodyEntry | HexagramBodyPending | null;
    /** Suit-element halo — name + colour from the active codon's minor arcana. */
    readonly halo?: { readonly element: string; readonly colour: string } | null;
    readonly size?: number;
}

export function M3HexagramBodyDynamicsViewer({
    hexagramId,
    entry,
    halo = null,
    size = 200
}: M3HexagramBodyDynamicsViewerProps) {
    const resolved = entry !== null && isResolvedHexagramBody(entry) ? entry : null;
    const state = resolved !== null ? 'ready' : entry === null ? 'idle' : 'pending';
    const secondary = new Set(resolved?.secondaryChakraIds ?? []);
    const centre = size / 2;

    return (
        <section
            className="m3-hexagram-body-dynamics"
            data-testid="m3-hexagram-body-dynamics"
            data-widget-id={M3_HEXAGRAM_BODY_DYNAMICS_WIDGET_ID}
            data-rpc-method="s2.codon.scalar_ref.read"
            data-state={state}
            data-hexagram-id={hexagramId ?? 'none'}
            data-primary-chakra={resolved?.primaryChakraId ?? 'pending'}
            data-secondary-chakra={resolved ? resolved.secondaryChakraIds.join(',') : 'pending'}
            data-halo-element={halo?.element ?? 'none'}
        >
            <header className="m3-hexagram-body-header">
                <h4>Body dynamics · King Wen {hexagramId ?? '—'}</h4>
            </header>

            <svg
                viewBox={`0 0 ${size} ${size}`}
                width={size}
                height={size}
                role="img"
                aria-label={
                    resolved
                        ? `Body dynamics for hexagram ${resolved.hexagramId}, primary chakra ${resolved.primaryChakraId}`
                        : 'Body dynamics pending'
                }
            >
                {halo ? (
                    <circle
                        data-testid="m3-hexagram-body-halo"
                        cx={centre}
                        cy={centre}
                        r={size * 0.46}
                        fill="none"
                        stroke={halo.colour}
                        strokeWidth={size * 0.02}
                        opacity={0.45}
                    >
                        <title>{`Suit-element halo · ${halo.element}`}</title>
                    </circle>
                ) : null}

                {/* Silhouette — a head, a trunk, and limbs. Pure geometry. */}
                <g className="m3-hexagram-body-silhouette" data-testid="m3-hexagram-body-silhouette">
                    <circle cx={centre} cy={size * 0.14} r={size * 0.06} />
                    <line x1={centre} y1={size * 0.2} x2={centre} y2={size * 0.62} />
                    <line x1={centre} y1={size * 0.3} x2={centre - size * 0.16} y2={size * 0.48} />
                    <line x1={centre} y1={size * 0.3} x2={centre + size * 0.16} y2={size * 0.48} />
                    <line x1={centre} y1={size * 0.62} x2={centre - size * 0.11} y2={size * 0.9} />
                    <line x1={centre} y1={size * 0.62} x2={centre + size * 0.11} y2={size * 0.9} />
                </g>

                {CHAKRA_AXIS.map((axis, chakraId) => {
                    const isPrimary = resolved?.primaryChakraId === chakraId;
                    const isSecondary = secondary.has(chakraId);
                    const lit = isPrimary || isSecondary;
                    return (
                        <circle
                            key={chakraId}
                            data-testid={`m3-hexagram-chakra-${chakraId}`}
                            data-lit={lit ? 'true' : 'false'}
                            data-role={isPrimary ? 'primary' : isSecondary ? 'secondary' : 'inert'}
                            cx={centre}
                            cy={size * axis}
                            r={isPrimary ? size * 0.035 : isSecondary ? size * 0.026 : size * 0.014}
                            fill={lit ? ringLit : wheelUnlit}
                            stroke={lit ? ringLit : inkDim}
                            strokeWidth={1}
                            opacity={isPrimary ? 1 : isSecondary ? 0.72 : 0.35}
                        >
                            <title>{`Chakra ${chakraId}${isPrimary ? ' · primary' : isSecondary ? ' · secondary' : ''}`}</title>
                        </circle>
                    );
                })}
            </svg>

            {resolved ? (
                <dl className="m3-hexagram-body-readout">
                    <dt>Chakras</dt>
                    <dd data-testid="m3-hexagram-body-chakras">
                        primary {resolved.primaryChakraId} · secondary{' '}
                        {resolved.secondaryChakraIds.join(', ')}
                    </dd>
                    <dt>Body zones</dt>
                    <dd data-testid="m3-hexagram-body-zones">{resolved.bodyZones.join(', ')}</dd>
                    <dt>Dynamic</dt>
                    <dd data-testid="m3-hexagram-body-dynamic">{resolved.dynamic}</dd>
                    {halo ? (
                        <>
                            <dt>Halo</dt>
                            <dd data-testid="m3-hexagram-body-halo-readout">{halo.element}</dd>
                        </>
                    ) : null}
                </dl>
            ) : (
                <p className="mext-widget-empty" data-testid="m3-hexagram-body-pending">
                    <ProvenanceBadge state="pending" reason="pending:s2-hexagram-body" />
                    pending:s2-hexagram-body — the 64-row body map and the chakra body-zone
                    table are substrate authority; nothing is drawn until
                    `s2.codon.scalar_ref.read` resolves the row.
                </p>
            )}
        </section>
    );
}

export default M3HexagramBodyDynamicsViewer;
