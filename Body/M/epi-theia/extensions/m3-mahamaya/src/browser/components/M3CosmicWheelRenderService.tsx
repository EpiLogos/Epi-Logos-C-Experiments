import * as React from 'react';
import {
    SharedBridgeAdapter,
    type MExtensionReadinessSnapshot
} from '@pratibimba/m-extension-runtime';
import { M3ProjectionSurface } from '../../common';
import { M1ChromaticLensConsumer } from './M1ChromaticLensConsumer';
import { M3LensApertureSwitcher } from './M3LensApertureSwitcher';
import {
    M3PentadicRelationInspector,
    pentadicRelationModelFromProfilePayload
} from './M3PentadicRelationInspector';
import { ReadinessChip } from './ReadinessChip';
import {
    useM3ProfileTick,
    type M3ProfileTickFibonacciGroundSnapshot
} from '../context/M3ProfileTickContext';
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

export interface M3FibonacciGroundWedge {
    readonly position: number;
    readonly digit: number;
}

export interface M3FibonacciGroundBackboneTick {
    readonly index: number;
    readonly degree: number;
}

export interface M3FibonacciGroundModel {
    readonly ready: boolean;
    readonly pendingFields: readonly string[];
    readonly wedges: readonly M3FibonacciGroundWedge[];
    readonly cardinalAnchors: readonly number[];
    readonly zodiacalAnchors: readonly number[];
    readonly backboneTicks: readonly M3FibonacciGroundBackboneTick[];
    readonly natalSunPosition: number | null;
    readonly liveSunPosition: number | null;
}

const FIBONACCI_GROUND_POSITION_COUNT = 60;
const FULL_CIRCLE_DEGREES = 360;
const CARDINAL_ZERO_ANCHORS = Object.freeze([0, 15, 30, 45]);
const ZODIACAL_FIVE_ANCHORS = Object.freeze([5, 10, 20, 25, 35, 40, 50, 55]);

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

    const fibonacciGround = React.useMemo(
        () => fibonacciGroundModelFromProfilePayload(profilePayload, profileTick.fibonacciGround),
        [profilePayload, profileTick.fibonacciGround]
    );
    const sections = React.useMemo(
        () => wheelSections(surface, mode, profileTick, fibonacciGround.ready),
        [fibonacciGround.ready, mode, profileTick, surface]
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
                    section.key === 'cosmic-clock' ? (
                        <FibonacciGroundSection
                            key={section.key}
                            section={section}
                            model={fibonacciGround}
                        />
                    ) : (
                        <WheelPlaceholderSection key={section.key} section={section} />
                    )
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
            {mode === 'mini-view' && (
                <PentadicHingeBadge
                    profilePayload={profilePayload}
                    readiness={readiness ?? inheritedReadiness.snapshot}
                />
            )}
            {mode === 'full' && (
                <div
                    className="m3-wheel-pentadic-inspector-zone"
                    data-inspector-zone="m3-pentadic-relation"
                    style={pentadicInspectorZoneStyle}
                >
                    <M3PentadicRelationInspector
                        profilePayload={profilePayload}
                        readiness={readiness ?? inheritedReadiness.snapshot}
                    />
                </div>
            )}
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

const FibonacciGroundSection: React.FC<{
    readonly section: WheelSection;
    readonly model: M3FibonacciGroundModel;
}> = ({ section, model }) => (
    <section
        aria-label={section.label}
        data-section={section.key}
        data-readiness={model.ready ? section.state : 'pending'}
        data-fibonacci-ground-readiness={model.ready ? 'ready' : 'pending'}
        data-fibonacci-ground-pending-fields={model.pendingFields.join(',')}
        style={{
            ...placeholderStyle,
            ...SECTION_POSITION_STYLE[section.position],
            borderColor: BADGE_STYLE[model.ready ? section.state : 'pending'].borderColor
        }}
    >
        <div style={placeholderHeaderStyle}>
            <span style={placeholderLabelStyle}>{section.label}</span>
            <ReadinessChip
                bindingKey="profile.fibonacciGround"
                state={model.ready ? section.state : 'pending'}
            >
                {model.ready ? 'level-0 ready' : 'ground pending'}
            </ReadinessChip>
        </div>
        <p style={placeholderDetailStyle}>{model.ready ? section.detail : model.pendingFields.join('; ')}</p>
        {model.ready && (
            <FibonacciGroundSvg model={model} />
        )}
    </section>
);

const FibonacciGroundSvg: React.FC<{ readonly model: M3FibonacciGroundModel }> = ({ model }) => (
    <svg
        role="img"
        aria-label="Fibonacci Ground Level 0 outer ring"
        viewBox="0 0 240 240"
        data-layer-order="fibonacci-ground,backbone-ticks,sixteen-lens-annular-sectors,nine-walk-overlay,torus-core"
        style={fibonacciGroundSvgStyle}
    >
        <circle cx="120" cy="120" r="106" fill="none" stroke="var(--theia-contrastBorder)" strokeWidth="1" />
        {model.wedges.map(wedge => (
            <g
                key={wedge.position}
                data-fibonacci-wedge={wedge.position}
                data-fibonacci-digit={wedge.digit}
            >
                <path
                    d={ringWedgePath(wedge.position, 102, 112)}
                    fill="var(--theia-editor-background)"
                    stroke="var(--theia-contrastBorder)"
                    strokeWidth="0.5"
                />
                <text
                    x={polarX(120, 107, positionMidpointDegree(wedge.position))}
                    y={polarY(120, 107, positionMidpointDegree(wedge.position))}
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={fibonacciDigitStyle}
                >
                    {wedge.digit}
                </text>
            </g>
        ))}
        {model.cardinalAnchors.map(position => (
            <circle
                key={`cardinal-${position}`}
                data-cardinal-anchor={position}
                cx={polarX(120, 94, positionDegree(position))}
                cy={polarY(120, 94, positionDegree(position))}
                r="4"
                fill="var(--epi-cardinal-anchor, var(--theia-charts-red))"
            />
        ))}
        {model.zodiacalAnchors.map(position => (
            <circle
                key={`zodiacal-${position}`}
                data-zodiacal-anchor={position}
                cx={polarX(120, 94, positionDegree(position))}
                cy={polarY(120, 94, positionDegree(position))}
                r="3"
                fill="none"
                stroke="var(--epi-zodiacal-anchor, var(--theia-charts-blue))"
                strokeWidth="1.5"
            />
        ))}
        {model.backboneTicks.map(tick => (
            <line
                key={`backbone-${tick.index}`}
                data-backbone-tick={tick.index}
                data-backbone-degree={tick.degree}
                x1={polarX(120, tick.index === 0 ? 80 : 84, tick.degree)}
                y1={polarY(120, tick.index === 0 ? 80 : 84, tick.degree)}
                x2={polarX(120, 92, tick.degree)}
                y2={polarY(120, 92, tick.degree)}
                stroke={tick.index === 0 ? 'var(--theia-focusBorder)' : 'var(--theia-descriptionForeground)'}
                strokeWidth={tick.index === 0 ? 2.5 : 1.2}
                strokeLinecap="round"
            />
        ))}
        {model.natalSunPosition !== null && (
            <circle
                data-sun-marker="natal"
                data-fibonacci-position={model.natalSunPosition}
                cx={polarX(120, 118, positionDegree(model.natalSunPosition))}
                cy={polarY(120, 118, positionDegree(model.natalSunPosition))}
                r="5"
                fill="none"
                stroke="gold"
                strokeWidth="2"
            />
        )}
        {model.liveSunPosition !== null && (
            <circle
                data-sun-marker="live"
                data-fibonacci-position={model.liveSunPosition}
                cx={polarX(120, 118, positionDegree(model.liveSunPosition))}
                cy={polarY(120, 118, positionDegree(model.liveSunPosition))}
                r="4"
                fill="silver"
                stroke="var(--theia-editor-background)"
                strokeWidth="1"
            />
        )}
    </svg>
);

const PentadicHingeBadge: React.FC<{
    readonly profilePayload?: Readonly<Record<string, unknown>>;
    readonly readiness: MExtensionReadinessSnapshot;
}> = ({ profilePayload, readiness }) => {
    const model = React.useMemo(
        () => pentadicRelationModelFromProfilePayload(profilePayload, readiness),
        [profilePayload, readiness]
    );
    const state = model.ready ? 'ready' : 'pending';
    const trace = model.trace;
    const hinge =
        trace?.sourceBinaryState &&
        typeof trace.wholeNumberEndpoint === 'number' &&
        typeof trace.naturalNumberEndpoint === 'number'
            ? `${trace.sourceBinaryState} -> ${trace.wholeNumberEndpoint} · ${trace.naturalNumberEndpoint}`
            : null;
    return (
        <div
            data-widget-id="pratibimba.m3-mahamaya:pentadic-hinge-badge"
            data-readiness-state={state}
            style={pentadicBadgeStyle}
        >
            <span style={badgeLabelStyle}>{hinge ?? 'pentadic hinge pending'}</span>
            <ReadinessChip
                bindingKey="profile.anuttara_pentadic_trace"
                state={state}
            />
        </div>
    );
};

function wheelSections(
    surface: M3ProjectionSurface,
    mode: M3CosmicWheelMode,
    tick: ReturnType<typeof useM3ProfileTick>,
    fibonacciGroundReady: boolean
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
            state: pending.has('s3.worldClock') || !fibonacciGroundReady ? 'pending' : 'ready',
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

export function fibonacciGroundModelFromProfilePayload(
    profilePayload: Readonly<Record<string, unknown>> | undefined,
    tickGround: M3ProfileTickFibonacciGroundSnapshot | null = null
): M3FibonacciGroundModel {
    const ground = objectValue(
        profilePayload?.fibonacciGround ??
        profilePayload?.fibonacci_ground ??
        profilePayload?.level0FibonacciGround ??
        profilePayload?.level0_fibonacci_ground
    );
    if (!ground) {
        return pendingFibonacciGroundModel(['profile.fibonacciGround']);
    }

    const digits = arrayValue(
        ground.pisano_digit_lut ??
        ground.fibonacciDigitLut ??
        ground.fibonacci_digit_lut ??
        ground.fibonacciDigits ??
        ground.fibonacci_digits ??
        ground.digits
    ).map(numberValue);
    const backbone = arrayValue(
        ground.clockBackbone ??
        ground.clock_backbone ??
        ground.backboneTicks ??
        ground.backbone_ticks ??
        ground.backbone
    );
    const pendingFields: string[] = [];
    if (digits.length !== FIBONACCI_GROUND_POSITION_COUNT || digits.some(digit => digit === null || digit < 0 || digit > 9)) {
        pendingFields.push('profile.fibonacciGround.digits60');
    }
    if (backbone.length !== 24) {
        pendingFields.push('profile.fibonacciGround.clockBackbone24');
    }

    const backboneTicks = backbone
        .map((entry, index) => {
            const node = objectValue(entry);
            const degree = numberValue(node?.degree);
            if (degree === null) {
                return null;
            }
            return Object.freeze({
                index: numberValue(node?.backboneIndex ?? node?.backbone_index) ?? index,
                degree
            });
        })
        .filter((tick): tick is M3FibonacciGroundBackboneTick => tick !== null);
    if (backboneTicks.length !== 24) {
        pendingFields.push('profile.fibonacciGround.clockBackbone24.degree');
    }

    const natalSun = objectValue(ground.natalSun ?? ground.natal_sun);
    const liveSun = objectValue(ground.liveSun ?? ground.live_sun);
    const natalSunPosition = tickGround?.natalSunPosition ?? boundedGroundPosition(
        ground.natalSunFibonacciPosition ??
        ground.natal_sun_fibonacci_position ??
        natalSun?.fibonacciPosition ??
        natalSun?.fibonacci_position
    );
    const liveSunPosition = tickGround?.liveSunPosition ?? boundedGroundPosition(
        ground.liveSunFibonacciPosition ??
        ground.live_sun_fibonacci_position ??
        liveSun?.fibonacciPosition ??
        liveSun?.fibonacci_position
    );
    if (natalSunPosition === null) {
        pendingFields.push('profile.fibonacciGround.natalSunFibonacciPosition');
    }
    if (liveSunPosition === null) {
        pendingFields.push('profile.fibonacciGround.liveSunFibonacciPosition');
    }

    if (pendingFields.length > 0) {
        return pendingFibonacciGroundModel(pendingFields);
    }

    return Object.freeze({
        ready: true,
        pendingFields: Object.freeze([]),
        wedges: Object.freeze(
            digits.map((digit, position) => Object.freeze({
                position,
                digit: digit as number
            }))
        ),
        cardinalAnchors: CARDINAL_ZERO_ANCHORS,
        zodiacalAnchors: ZODIACAL_FIVE_ANCHORS,
        backboneTicks: Object.freeze(backboneTicks),
        natalSunPosition,
        liveSunPosition
    });
}

function pendingFibonacciGroundModel(pendingFields: readonly string[]): M3FibonacciGroundModel {
    return Object.freeze({
        ready: false,
        pendingFields: Object.freeze([...pendingFields]),
        wedges: Object.freeze([]),
        cardinalAnchors: Object.freeze([]),
        zodiacalAnchors: Object.freeze([]),
        backboneTicks: Object.freeze([]),
        natalSunPosition: null,
        liveSunPosition: null
    });
}

function displayValue(value: unknown): string {
    if (typeof value === 'number' || typeof value === 'string') {
        return String(value);
    }
    return '-';
}

function objectValue(value: unknown): Readonly<Record<string, unknown>> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Readonly<Record<string, unknown>>
        : null;
}

function arrayValue(value: unknown): readonly unknown[] {
    return Array.isArray(value) ? value : [];
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function boundedGroundPosition(value: unknown): number | null {
    const number = numberValue(value);
    return number !== null && number >= 0 && number < FIBONACCI_GROUND_POSITION_COUNT
        ? number
        : null;
}

function positionDegree(position: number): number {
    return position * FULL_CIRCLE_DEGREES / FIBONACCI_GROUND_POSITION_COUNT;
}

function positionMidpointDegree(position: number): number {
    return positionDegree(position) + (FULL_CIRCLE_DEGREES / FIBONACCI_GROUND_POSITION_COUNT / 2);
}

function polarX(center: number, radius: number, degree: number): number {
    return center + radius * Math.cos((degree - 90) * Math.PI / 180);
}

function polarY(center: number, radius: number, degree: number): number {
    return center + radius * Math.sin((degree - 90) * Math.PI / 180);
}

function ringWedgePath(position: number, innerRadius: number, outerRadius: number): string {
    const start = positionDegree(position);
    const end = positionDegree(position + 1);
    const x1 = polarX(120, outerRadius, start);
    const y1 = polarY(120, outerRadius, start);
    const x2 = polarX(120, outerRadius, end);
    const y2 = polarY(120, outerRadius, end);
    const x3 = polarX(120, innerRadius, end);
    const y3 = polarY(120, innerRadius, end);
    const x4 = polarX(120, innerRadius, start);
    const y4 = polarY(120, innerRadius, start);
    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`;
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

const pentadicInspectorZoneStyle: React.CSSProperties = {
    marginTop: 12
};

const pentadicBadgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 10,
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 6,
    padding: '6px 8px',
    background: 'var(--theia-editor-background)'
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

const fibonacciGroundSvgStyle: React.CSSProperties = {
    display: 'block',
    inlineSize: 'min(100%, 360px)',
    aspectRatio: '1 / 1',
    margin: '10px auto 0'
};

const fibonacciDigitStyle: React.CSSProperties = {
    fill: 'var(--theia-descriptionForeground)',
    fontSize: 5,
    fontWeight: 600
};
