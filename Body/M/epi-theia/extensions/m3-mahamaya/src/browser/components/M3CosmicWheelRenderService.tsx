import * as React from 'react';
import {
    SharedBridgeAdapter,
    type MExtensionReadinessSnapshot
} from '@pratibimba/m-extension-runtime';
import { M3ProjectionSurface } from '../../common';
import { M1ChromaticLensConsumer } from './M1ChromaticLensConsumer';
import { M3LensApertureSwitcher } from './M3LensApertureSwitcher';
import { ReadinessChip } from './ReadinessChip';
import { useM3ProfileTick } from '../context/M3ProfileTickContext';
import { useM3Readiness } from '../context/M3ReadinessContext';

export type M3CosmicWheelMode = 'badge' | 'mini-view' | 'full';

export interface M3CosmicWheelRenderServiceProps {
    readonly mode: M3CosmicWheelMode;
    readonly surface: M3ProjectionSurface;
    readonly profilePayload?: Readonly<Record<string, unknown>>;
    readonly readiness?: MExtensionReadinessSnapshot;
    readonly className?: string;
}

export const M3CosmicWheelBridgeContext = React.createContext<SharedBridgeAdapter | undefined>(
    undefined
);

interface WheelSection {
    readonly key: string;
    readonly label: string;
    readonly state: 'ready' | 'pending' | 'blocked';
    readonly detail: string;
    readonly position: 'center' | 'inner' | 'outer' | 'bottom' | 'right' | 'left';
}

const SECTION_POSITION_STYLE: Readonly<Record<WheelSection['position'], React.CSSProperties>> = {
    center: { gridArea: 'center' },
    inner: { gridArea: 'inner' },
    outer: { gridArea: 'outer' },
    bottom: { gridArea: 'bottom' },
    right: { gridArea: 'right' },
    left: { gridArea: 'left' }
};

const BADGE_STYLE: Readonly<Record<WheelSection['state'], React.CSSProperties>> = {
    ready: {
        borderColor: 'var(--theia-charts-green)',
        color: 'var(--theia-charts-green)'
    },
    pending: {
        borderColor: 'var(--theia-charts-yellow)',
        color: 'var(--theia-charts-yellow)'
    },
    blocked: {
        borderColor: 'var(--theia-errorForeground)',
        color: 'var(--theia-errorForeground)'
    }
};

export const M3CosmicWheelRenderService: React.FC<M3CosmicWheelRenderServiceProps> = ({
    mode,
    surface,
    profilePayload,
    readiness,
    className
}) => {
    const profileTick = useM3ProfileTick();
    const inheritedReadiness = useM3Readiness();

    const sections = React.useMemo(
        () => wheelSections(surface, mode, profileTick),
        [mode, profileTick, surface]
    );
    const readinessState = surface.readiness.surfaceReady ? 'ready' : 'blocked';
    const classes = [
        'm3-cosmic-wheel-render-service',
        `m3-cosmic-wheel-render-service-${mode}`,
        className
    ].filter(Boolean).join(' ');

    if (mode === 'badge') {
        return (
            <div
                className={classes}
                data-widget-id="pratibimba.m3-mahamaya:cosmic-wheel"
                data-mode={mode}
                data-readiness={readinessState}
                data-profile-tick={profileTick.tick ?? '-'}
                data-context-readiness={inheritedReadiness.snapshot.state}
                style={badgeRootStyle(readinessState)}
            >
                <span style={badgeLabelStyle}>Cosmic Wheel</span>
                <ReadinessChip bindingKey="surface.readiness.surfaceReady" state={readinessState} />
            </div>
        );
    }

    return (
        <article
            className={classes}
            data-widget-id="pratibimba.m3-mahamaya:cosmic-wheel"
            data-mode={mode}
            data-readiness={readinessState}
            data-profile-tick={profileTick.tick ?? '-'}
            data-context-readiness={inheritedReadiness.snapshot.state}
            style={rootStyle(mode, readinessState)}
        >
            <header style={headerStyle}>
                <div>
                    <h3 style={titleStyle}>M3 Cosmic Wheel</h3>
                    <p style={subtitleStyle}>
                        codon {displayValue(surface.activeProjection.codonId)} · rotation{' '}
                        {displayValue(surface.activeProjection.rotation)} /{' '}
                        {displayValue(surface.activeProjection.rotationalStateCount)}
                    </p>
                </div>
                <ReadinessChip
                    bindingKey="surface.readiness.surfaceReady"
                    state={readinessState}
                />
            </header>
            {!surface.readiness.surfaceReady && (
                <div role="status" style={blockerStyle}>
                    {surface.readiness.blockers.join('; ') || 'M3 projection surface pending'}
                </div>
            )}
            <div style={wheelGridStyle(mode)}>
                {sections.map(section => (
                    <WheelPlaceholderSection key={section.key} section={section} />
                ))}
            </div>
            <div
                className="m3-wheel-namespace-inspector-zone"
                data-inspector-zone="m1-m3-lens-namespace"
                style={namespaceInspectorZoneStyle}
            >
                <M1ChromaticLensConsumer surface={surface} />
                <M3LensApertureSwitcher
                    profilePayload={profilePayload}
                    readiness={readiness}
                />
            </div>
        </article>
    );
};

export default M3CosmicWheelRenderService;

const WheelPlaceholderSection: React.FC<{ readonly section: WheelSection }> = ({ section }) => (
    <section
        aria-label={section.label}
        data-section={section.key}
        data-readiness={section.state}
        style={{
            ...placeholderStyle,
            ...SECTION_POSITION_STYLE[section.position],
            borderColor: BADGE_STYLE[section.state].borderColor
        }}
    >
        <div style={placeholderHeaderStyle}>
            <span style={placeholderLabelStyle}>{section.label}</span>
            <ReadinessChip bindingKey={section.key} state={section.state} />
        </div>
        <p style={placeholderDetailStyle}>{section.detail}</p>
    </section>
);

function wheelSections(
    surface: M3ProjectionSurface,
    mode: M3CosmicWheelMode,
    tick: ReturnType<typeof useM3ProfileTick>
): WheelSection[] {
    const pending = new Set(surface.pendingFields);
    const active = surface.activeProjection;
    const tickDetail = `profile tick ${displayValue(tick.tick)} at degree ${displayValue(tick.degree720)}`;
    const sections: WheelSection[] = [
        {
            key: 'quintessence-akasha',
            label: 'Quintessence / Akasha indicator',
            state: surface.readiness.surfaceReady ? 'ready' : 'blocked',
            detail: `active codon ${displayValue(active.codon)} (${displayValue(active.codonId)})`,
            position: 'center'
        },
        {
            key: 'sixteen-lens-annulus',
            label: "M1' chromatic-lens inner ring",
            state: active.lens === null || active.lens === undefined ? 'pending' : 'ready',
            detail: `M1' chromatic lens ${displayValue(active.lens)} of 12 · mode ${displayValue(active.mode)}`,
            position: 'inner'
        },
        {
            key: 'cosmic-clock',
            label: 'Cosmic clock',
            state: pending.has('s3.worldClock') ? 'pending' : 'ready',
            detail: tickDetail,
            position: 'outer'
        },
        {
            key: 'hexagram-browser',
            label: 'Hexagram browser',
            state: active.hexagramId === null || active.hexagramId === undefined ? 'pending' : 'ready',
            detail: `hexagram ${displayValue(active.hexagram)} (${displayValue(active.hexagramId)})`,
            position: 'bottom'
        },
        {
            key: 'tarot-wheel',
            label: 'Tarot wheel',
            state: active.tarotMinorId === null || active.tarotMinorId === undefined ? 'pending' : 'ready',
            detail: `minor ${displayValue(active.tarotMinorId)} · shadow ${displayValue(active.tarotShadowCodon)}`,
            position: 'right'
        },
        {
            key: 'decan-chain-breadcrumb',
            label: 'Decan-chain breadcrumb',
            state: pending.has('s2.m3LibrarySummary') ? 'pending' : 'ready',
            detail: `M2 source ${displayValue(surface.m30ProvenanceStrip.m2SourceIndex72)} -> DET ${displayValue(surface.m30ProvenanceStrip.detResult64)}`,
            position: 'left'
        }
    ];
    if (mode === 'mini-view') {
        return sections.filter(section =>
            section.position === 'center' ||
            section.position === 'inner' ||
            section.position === 'outer'
        );
    }
    return sections;
}

function displayValue(value: unknown): string {
    if (typeof value === 'number' || typeof value === 'string') {
        return String(value);
    }
    return '-';
}

function rootStyle(mode: M3CosmicWheelMode, readinessState: 'ready' | 'blocked'): React.CSSProperties {
    return {
        border: `1px solid ${BADGE_STYLE[readinessState].borderColor}`,
        borderRadius: 8,
        padding: mode === 'full' ? 16 : 12,
        background: 'var(--theia-editorWidget-background)',
        color: 'var(--theia-foreground)'
    };
}

function badgeRootStyle(readinessState: 'ready' | 'blocked'): React.CSSProperties {
    return {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        border: `1px solid ${BADGE_STYLE[readinessState].borderColor}`,
        borderRadius: 6,
        padding: '4px 8px',
        background: 'var(--theia-editorWidget-background)'
    };
}

function wheelGridStyle(mode: M3CosmicWheelMode): React.CSSProperties {
    if (mode === 'mini-view') {
        return {
            display: 'grid',
            gridTemplateAreas: '"outer" "inner" "center"',
            gap: 8
        };
    }
    return {
        display: 'grid',
        gridTemplateColumns: 'minmax(128px, 1fr) minmax(220px, 1.4fr) minmax(128px, 1fr)',
        gridTemplateAreas:
            '"outer outer outer" "left inner right" "left center right" "bottom bottom bottom"',
        gap: 10
    };
}

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

const blockerStyle: React.CSSProperties = {
    marginBottom: 10,
    border: '1px solid var(--theia-errorForeground)',
    borderRadius: 6,
    padding: 8,
    color: 'var(--theia-errorForeground)',
    background: 'var(--theia-inputValidation-errorBackground)'
};

const namespaceInspectorZoneStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'minmax(180px, max-content) minmax(280px, 1fr)',
    alignItems: 'stretch',
    gap: 10,
    marginTop: 12
};

const placeholderStyle: React.CSSProperties = {
    minHeight: 74,
    border: '1px solid',
    borderRadius: 8,
    padding: 10,
    background: 'var(--theia-editor-background)'
};

const placeholderHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
};

const placeholderLabelStyle: React.CSSProperties = {
    fontWeight: 600
};

const placeholderDetailStyle: React.CSSProperties = {
    margin: '8px 0 0',
    color: 'var(--theia-descriptionForeground)',
    fontSize: 'var(--theia-ui-font-size1)'
};

const badgeLabelStyle: React.CSSProperties = {
    fontWeight: 600
};
