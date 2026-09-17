import * as React from 'react';
import { M3ProjectionSurface } from '../../common';
import { useM3ProfileTick } from '../context/M3ProfileTickContext';
import { useM3Readiness } from '../context/M3ReadinessContext';
import { ReadinessChip } from './ReadinessChip';

// M3-ARCHITECTURE §5.7 — the four summonable depth-view modes for the M3-5'
// double-torus surface. The mode definitions read directly from the
// buildM3ProjectionSurface contract (surface.depthViews). The K² mesh and the
// Hopf fiber are M1-5 / M1-2 authorities referenced by handle only — this
// component never forks geometry and never invents codon/hexagram/tarot data.

export type M3DepthViewModeId =
    | 'flat-clock-debug'
    | 'lens-annulus'
    | 'toroidal-world-clock'
    | 'hopf-identity';

export interface M3DepthViewModeDescriptor {
    readonly id: M3DepthViewModeId;
    readonly label: string;
    readonly depthViewKey: string;
    readonly description: string;
}

export const M3_DEPTH_VIEW_MODES: readonly M3DepthViewModeDescriptor[] = Object.freeze([
    Object.freeze({
        id: 'flat-clock-debug',
        label: 'Flat Clock Debug',
        depthViewKey: 'flatClockDebug',
        description: 'Maximum legibility: degree/tick/codon/line-change/readiness data table.'
    }),
    Object.freeze({
        id: 'lens-annulus',
        label: 'Lens Annulus',
        depthViewKey: 'lensAnnulus',
        description: 'The 16+1 M3-aperture lens stack (DR-M3-3 namespace-gated).'
    }),
    Object.freeze({
        id: 'toroidal-world-clock',
        label: 'Toroidal / World Clock',
        depthViewKey: 'toroidalWorld',
        description: 'K² × T²_Mahāmāyā double-torus; K² borrowed from M1-5 by handle.'
    }),
    Object.freeze({
        id: 'hopf-identity',
        label: 'Hopf Identity',
        depthViewKey: 'hopfIdentity',
        description: 'SU(2) hopf-fiber identity trajectory; 720°→0 recognition pulse.'
    })
]);

export interface M3DepthViewModesProps {
    readonly surface: M3ProjectionSurface;
    readonly activeMode?: M3DepthViewModeId;
    readonly onSelectMode?: (mode: M3DepthViewModeId) => void;
}

export const M3DepthViewModes: React.FC<M3DepthViewModesProps> = ({
    surface,
    activeMode,
    onSelectMode
}) => {
    const profileTick = useM3ProfileTick();
    const inheritedReadiness = useM3Readiness();
    const [internalMode, setInternalMode] = React.useState<M3DepthViewModeId>('flat-clock-debug');
    const mode = activeMode ?? internalMode;
    const select = React.useCallback(
        (next: M3DepthViewModeId) => {
            setInternalMode(next);
            onSelectMode?.(next);
        },
        [onSelectMode]
    );

    const descriptor = M3_DEPTH_VIEW_MODES.find(entry => entry.id === mode) ?? M3_DEPTH_VIEW_MODES[0];
    const depthView = surface.depthViews[descriptor.depthViewKey] ?? null;

    return (
        <article
            className="m3-depth-view-modes"
            data-widget-id="pratibimba.m3-mahamaya:depth-view-modes"
            data-active-mode={mode}
            data-profile-tick={profileTick.tick ?? 'pending'}
            data-context-readiness={inheritedReadiness.snapshot.state}
            style={rootStyle}
        >
            <header style={headerStyle}>
                <div>
                    <h3 style={titleStyle}>M3-5′ depth-view modes</h3>
                    <p style={subtitleStyle}>Four summonable modes over the double-torus surface</p>
                </div>
            </header>
            <div role="tablist" aria-label="M3 depth-view modes" style={tabBarStyle}>
                {M3_DEPTH_VIEW_MODES.map(entry => (
                    <button
                        key={entry.id}
                        type="button"
                        role="tab"
                        aria-selected={entry.id === mode}
                        data-depth-view-mode={entry.id}
                        data-active={entry.id === mode ? 'true' : 'false'}
                        onClick={() => select(entry.id)}
                        style={entry.id === mode ? activeTabStyle : tabStyle}
                    >
                        {entry.label}
                    </button>
                ))}
            </div>
            <section
                data-depth-view={descriptor.id}
                aria-label={descriptor.label}
                style={panelStyle}
            >
                <p style={descriptionStyle}>{descriptor.description}</p>
                {depthView ? (
                    <dl style={factListStyle}>
                        {Object.entries(depthView).map(([key, value]) => (
                            <React.Fragment key={key}>
                                <dt style={dtStyle}>{key}</dt>
                                <dd style={ddStyle} data-depth-field={key}>
                                    <ReadinessChip bindingKey={`surface.depthViews.${descriptor.depthViewKey}.${key}`}>
                                        {displayValue(value)}
                                    </ReadinessChip>
                                </dd>
                            </React.Fragment>
                        ))}
                    </dl>
                ) : (
                    <ReadinessChip
                        bindingKey={`surface.depthViews.${descriptor.depthViewKey}`}
                        state="pending"
                        style={pendingChipStyle}
                    >
                        depth view {descriptor.depthViewKey} pending on the projection surface
                    </ReadinessChip>
                )}
            </section>
        </article>
    );
};

export default M3DepthViewModes;

function displayValue(value: unknown): string {
    if (value === null || value === undefined) {
        return '—';
    }
    if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
        return String(value);
    }
    if (Array.isArray(value)) {
        return value.map(displayValue).join(', ');
    }
    return JSON.stringify(value);
}

const rootStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 8,
    padding: 16,
    background: 'var(--theia-editorWidget-background)',
    color: 'var(--theia-foreground)'
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12
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

const tabBarStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12
};

const tabStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 6,
    padding: '4px 10px',
    background: 'var(--theia-editor-background)',
    color: 'var(--theia-foreground)',
    cursor: 'pointer',
    fontSize: 'var(--theia-ui-font-size1)'
};

const activeTabStyle: React.CSSProperties = {
    ...tabStyle,
    borderColor: 'var(--theia-charts-blue)',
    color: 'var(--theia-charts-blue)',
    fontWeight: 600
};

const panelStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 8,
    padding: 12,
    background: 'var(--theia-editor-background)'
};

const descriptionStyle: React.CSSProperties = {
    margin: '0 0 10px',
    color: 'var(--theia-descriptionForeground)',
    fontSize: 'var(--theia-ui-font-size1)'
};

const factListStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'minmax(160px, max-content) 1fr',
    gap: '4px 12px',
    margin: 0
};

const dtStyle: React.CSSProperties = {
    color: 'var(--theia-descriptionForeground)',
    fontFamily: 'var(--theia-monospace-font-family)',
    fontSize: 'var(--theia-ui-font-size0)'
};

const ddStyle: React.CSSProperties = {
    margin: 0,
    fontFamily: 'var(--theia-monospace-font-family)',
    fontSize: 'var(--theia-ui-font-size0)'
};

const pendingChipStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    border: '1px solid var(--theia-charts-yellow)',
    borderRadius: 999,
    color: 'var(--theia-charts-yellow)',
    padding: '2px 8px',
    fontSize: 'var(--theia-ui-font-size0)'
};
