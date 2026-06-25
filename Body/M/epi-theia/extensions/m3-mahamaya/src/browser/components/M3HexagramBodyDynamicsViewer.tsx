import * as React from 'react';
import type { M3ProjectionSurface } from '../../common';
import {
    M3HexagramBodyEntry,
    M3HexagramBodyResolver,
    hexagramBodyLookup
} from '../services/HexagramBodyDynamicsService';
import { useM3ProfileTick } from '../context/M3ProfileTickContext';
import { useM3Readiness } from '../context/M3ReadinessContext';
import { ReadinessChip } from './ReadinessChip';

// M3 Mahāmāyā — per-hexagram chakra-ID + body-zone viewer.
//
// Renders the canonical body dynamics for the active I-Ching hexagram: the two
// chakra seats it couples (primary / secondary), the named body zones it
// activates, and a one-line dynamics gloss. This is the hexagram→body arm of the
// [[M3']] Mahamaya medicine route — the I-Ching half-step that meets the
// decan-tarot chain (card → … → chakra → body zone) at the body.
//
// The viewer is presentational. The body map itself is the canonical
// `HEXAGRAM_BODY_DYNAMICS[64]` LUT owned by {@link M3HexagramBodyResolver}
// (HexagramBodyDynamicsService) — a 1:1 mirror of the kernel LUT in
// `oracle_identity.rs`. The renderer never reaches into a kernel crate (the S0
// crates, the S2/S3 substrate, and the portal core are forbidden imports); it
// only ever displays the entry the resolver returns. When a resolver is given,
// the optional live world-clock body resonance is surfaced; otherwise the
// component falls back to the local LUT lookup directly.

export const M3_HEXAGRAM_BODY_DYNAMICS_VIEWER_WIDGET_ID =
    'pratibimba.m3-mahamaya:hexagram-body-dynamics-viewer';
export const M3_HEXAGRAM_BODY_RPC_METHOD = 's3.world_clock.hexagram.body_resonance';
export const M3_HEXAGRAM_BODY_COUNT = 64;

export interface M3HexagramBodyDynamicsViewerProps {
    readonly surface: M3ProjectionSurface;
    /** Resolver used to turn a hexagram number into its body entry. */
    readonly resolver?: M3HexagramBodyResolver;
    /** Active hexagram (King Wen 1..64). Falls back to the projection. */
    readonly hexagramId?: number | null;
    /** Pre-resolved entry. When supplied, the resolver/LUT is not consulted. */
    readonly entry?: M3HexagramBodyEntry | null;
    /** Notified whenever an entry is resolved through the resolver. */
    readonly onResolve?: (entry: M3HexagramBodyEntry) => void;
}

export const M3HexagramBodyDynamicsViewer: React.FC<M3HexagramBodyDynamicsViewerProps> = ({
    surface,
    resolver,
    hexagramId,
    entry,
    onResolve
}) => {
    const profileTick = useM3ProfileTick();
    const inheritedReadiness = useM3Readiness();

    const activeHexagramId = boundedHexagramId(
        hexagramId ?? numberValue(surface.activeProjection.hexagramId)
    );

    // Local LUT lookup is always available synchronously — it is the floor the
    // async resolver only ever enriches (never replaces).
    const localEntry = React.useMemo(
        () => hexagramBodyLookup(activeHexagramId),
        [activeHexagramId]
    );
    const [resolvedEntry, setResolvedEntry] = React.useState<M3HexagramBodyEntry | null>(
        entry ?? localEntry
    );

    React.useEffect(() => {
        // An explicit entry prop wins — skip resolution entirely.
        if (entry !== undefined) {
            setResolvedEntry(entry);
            return;
        }
        if (!resolver || activeHexagramId === null) {
            setResolvedEntry(localEntry);
            return;
        }
        let cancelled = false;
        // Show the LUT entry immediately, then upgrade if the bridge enriches it.
        setResolvedEntry(localEntry);
        void resolver
            .resolveBody(activeHexagramId)
            .then(next => {
                if (cancelled || !next) {
                    return;
                }
                setResolvedEntry(next);
                onResolve?.(next);
            })
            .catch(() => {
                if (!cancelled) {
                    setResolvedEntry(localEntry);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [resolver, activeHexagramId, entry, localEntry, onResolve]);

    const effectiveEntry = entry !== undefined ? entry : resolvedEntry;
    const chainState = effectiveEntry ? 'ready' : 'pending';

    return (
        <article
            className="m3-hexagram-body-dynamics-viewer"
            data-widget-id={M3_HEXAGRAM_BODY_DYNAMICS_VIEWER_WIDGET_ID}
            data-rpc-method={M3_HEXAGRAM_BODY_RPC_METHOD}
            data-hexagram-count={M3_HEXAGRAM_BODY_COUNT}
            data-active-hexagram-id={activeHexagramId ?? 'pending'}
            data-primary-chakra-id={effectiveEntry?.primaryChakraId ?? ''}
            data-secondary-chakra-id={effectiveEntry?.secondaryChakraId ?? ''}
            data-body-zone-count={effectiveEntry?.bodyZones.length ?? 0}
            data-resonance={effectiveEntry?.resonance ?? ''}
            data-profile-generation={surface.profileGeneration}
            data-profile-tick={profileTick.tick ?? 'pending'}
            data-context-readiness={inheritedReadiness.snapshot.state}
            style={rootStyle}
        >
            <header style={headerStyle}>
                <div>
                    <h3 style={titleStyle}>Hexagram body dynamics</h3>
                    <p style={subtitleStyle}>
                        hexagram → primary chakra · secondary chakra → body zones
                    </p>
                </div>
                <ReadinessChip
                    bindingKey="surface.activeProjection.hexagramId"
                    state={chainState}
                    style={chipStyle}
                >
                    {effectiveEntry ? `#${effectiveEntry.hexagramNumber}` : 'no hexagram'}
                </ReadinessChip>
            </header>

            {effectiveEntry ? (
                <BodyDynamicsBody entry={effectiveEntry} />
            ) : (
                <ReadinessChip
                    bindingKey="surface.activeProjection.hexagramId"
                    state="pending"
                    style={pendingStyle}
                >
                    Cast or select a hexagram to read its body dynamics
                </ReadinessChip>
            )}
        </article>
    );
};

export default M3HexagramBodyDynamicsViewer;

const BodyDynamicsBody: React.FC<{ readonly entry: M3HexagramBodyEntry }> = ({ entry }) => (
    <div
        className="m3-hexagram-body-dynamics-viewer-body"
        data-test="m3-hexagram-body-dynamics-viewer-body"
        data-hexagram-id={entry.hexagramNumber}
        style={bodyStyle}
    >
        <p style={nameStyle}>{entry.name}</p>
        <p style={dynamicsStyle}>{entry.dynamics}</p>

        <div style={chakraRowStyle}>
            <ChakraChip
                role="primary"
                chakraName={entry.primaryChakra}
                chakraId={entry.primaryChakraId}
            />
            <span aria-hidden="true" style={separatorStyle}>·</span>
            <ChakraChip
                role="secondary"
                chakraName={entry.secondaryChakra}
                chakraId={entry.secondaryChakraId}
            />
        </div>

        <ul
            aria-label={`Body zones for hexagram ${entry.hexagramNumber}`}
            style={zonesStyle}
        >
            {entry.bodyZones.map(zone => (
                <li
                    key={zone}
                    data-test="m3-hexagram-body-zone"
                    data-body-zone={zone}
                    style={zoneChipStyle}
                >
                    {zone}
                </li>
            ))}
        </ul>

        {typeof entry.resonance === 'number' && (
            <p
                data-test="m3-hexagram-body-resonance"
                style={resonanceStyle}
            >
                live resonance {formatResonance(entry.resonance)}
            </p>
        )}
    </div>
);

const ChakraChip: React.FC<{
    readonly role: 'primary' | 'secondary';
    readonly chakraName: string;
    readonly chakraId: number;
}> = ({ role, chakraName, chakraId }) => (
    <span
        data-test="m3-hexagram-chakra-chip"
        data-chakra-role={role}
        data-chakra-id={chakraId}
        title={`${role} chakra — Chakra_Id ${chakraId}`}
        style={role === 'primary' ? chakraPrimaryStyle : chakraSecondaryStyle}
    >
        <span style={chakraRoleStyle}>{role}</span>
        <span style={chakraNameStyle}>{chakraName}</span>
    </span>
);

// ============================================================================
// Domain helpers
// ============================================================================

function boundedHexagramId(value: number | null): number | null {
    if (value === null || !Number.isFinite(value)) {
        return null;
    }
    const id = Math.floor(value);
    return id >= 1 && id <= M3_HEXAGRAM_BODY_COUNT ? id : null;
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function formatResonance(value: number): string {
    const clamped = Math.max(0, Math.min(1, value));
    return clamped.toFixed(2);
}

// ============================================================================
// Styles
// ============================================================================

const rootStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 8,
    padding: 12,
    background: 'var(--theia-editorWidget-background)',
    color: 'var(--theia-foreground)',
    minWidth: 320
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10
};

const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 'var(--theia-ui-font-size2)',
    fontWeight: 600
};

const subtitleStyle: React.CSSProperties = {
    margin: '4px 0 0',
    color: 'var(--theia-descriptionForeground)',
    fontSize: 'var(--theia-ui-font-size1)'
};

const chipStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 999,
    padding: '2px 8px',
    fontSize: 'var(--theia-ui-font-size0)',
    whiteSpace: 'nowrap'
};

const pendingStyle: React.CSSProperties = {
    display: 'block',
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 6,
    padding: 8,
    fontSize: 'var(--theia-ui-font-size1)'
};

const bodyStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
};

const nameStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 'var(--theia-ui-font-size1)',
    fontWeight: 600
};

const dynamicsStyle: React.CSSProperties = {
    margin: 0,
    color: 'var(--theia-descriptionForeground)',
    fontSize: 'var(--theia-ui-font-size1)',
    fontStyle: 'italic'
};

const chakraRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6
};

const chakraChipBaseStyle: React.CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 1,
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 6,
    padding: '3px 8px',
    lineHeight: 1.15
};

const chakraPrimaryStyle: React.CSSProperties = {
    ...chakraChipBaseStyle,
    background: 'var(--theia-editor-background)',
    color: 'var(--theia-foreground)',
    borderColor: 'var(--theia-focusBorder)'
};

const chakraSecondaryStyle: React.CSSProperties = {
    ...chakraChipBaseStyle,
    background: 'var(--theia-editorWidget-background)',
    color: 'var(--theia-foreground)'
};

const chakraRoleStyle: React.CSSProperties = {
    fontSize: 'var(--theia-ui-font-size0)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--theia-descriptionForeground)'
};

const chakraNameStyle: React.CSSProperties = {
    fontSize: 'var(--theia-ui-font-size1)',
    fontWeight: 600
};

const separatorStyle: React.CSSProperties = {
    color: 'var(--theia-descriptionForeground)',
    fontSize: 'var(--theia-ui-font-size1)',
    userSelect: 'none'
};

const zonesStyle: React.CSSProperties = {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4
};

const zoneChipStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 999,
    padding: '2px 8px',
    fontSize: 'var(--theia-ui-font-size0)',
    background: 'var(--theia-editor-background)'
};

const resonanceStyle: React.CSSProperties = {
    margin: 0,
    color: 'var(--theia-descriptionForeground)',
    fontSize: 'var(--theia-ui-font-size0)',
    fontVariantNumeric: 'tabular-nums'
};
