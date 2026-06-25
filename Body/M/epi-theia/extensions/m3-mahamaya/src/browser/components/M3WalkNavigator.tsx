import * as React from 'react';
import type { M3ProjectionSurface } from '../../common';
import { useM3ProfileTick } from '../context/M3ProfileTickContext';
import { useM3Readiness } from '../context/M3ReadinessContext';
import { ReadinessChip } from './ReadinessChip';

export const M3_WALK_NAVIGATOR_WIDGET_ID = 'pratibimba.m3-mahamaya:walk-navigator';
export const M3_WALK_ADVANCE_RPC = 's3.world_clock.walk.advance';
export const M3_WALK_COUNT = 9;

export type CosmicClockWalkName =
    | 'WALK_SPANDA'
    | 'WALK_HEXAGRAM'
    | 'WALK_LINE_CHANGE'
    | 'WALK_DECAN'
    | 'WALK_AMINO'
    | 'WALK_ARCANA'
    | 'WALK_CHAKRA'
    | 'WALK_DEGREE'
    | 'WALK_AXIS_MUNDI';

export interface CosmicClockWalkDescriptor {
    readonly id: number;
    readonly name: CosmicClockWalkName;
    readonly stepCount: number;
    readonly stepDegrees: number;
    readonly currentStep: number;
}

export interface M3WalkNavigatorProps {
    readonly surface: M3ProjectionSurface;
    readonly walks?: readonly CosmicClockWalkDescriptor[];
    readonly onAdvance: (walkId: number, direction: 'forward' | 'backward') => void;
}

type M3WalkGlyphKind = 'spanda-wheel' | 'six-bit-binary' | 'linear-cells';

export const M3WalkNavigator: React.FC<M3WalkNavigatorProps> = ({
    surface,
    walks,
    onAdvance
}) => {
    const profileTick = useM3ProfileTick();
    const inheritedReadiness = useM3Readiness();
    const ready = Array.isArray(walks) && walks.length === M3_WALK_COUNT;
    const pendingState = ready ? 'ready' : 'pending';

    return (
        <article
            className="m3-walk-navigator"
            data-widget-id={M3_WALK_NAVIGATOR_WIDGET_ID}
            data-rpc-method={M3_WALK_ADVANCE_RPC}
            data-walk-count={walks?.length ?? 0}
            data-expected-walk-count={M3_WALK_COUNT}
            data-profile-generation={surface.profileGeneration}
            data-profile-tick={profileTick.tick ?? 'pending'}
            data-context-readiness={inheritedReadiness.snapshot.state}
            style={rootStyle}
        >
            <header style={headerStyle}>
                <h3 style={titleStyle}>Walk navigator</h3>
                <ReadinessChip
                    bindingKey="payload.cosmicClock.walks"
                    state={pendingState}
                    style={chipStyle}
                >
                    {ready ? '9/9' : `${walks?.length ?? 0}/9`}
                </ReadinessChip>
            </header>

            {ready ? (
                <div role="list" aria-label="Cosmic clock traversal walks" style={lanesStyle}>
                    {walks.map(walk => (
                        <WalkLane
                            key={walk.id}
                            walk={walk}
                            onAdvance={onAdvance}
                        />
                    ))}
                </div>
            ) : (
                <ReadinessChip
                    bindingKey="payload.cosmicClock.walks"
                    state="pending"
                    style={pendingStyle}
                >
                    Waiting for payload.cosmicClock.walks
                </ReadinessChip>
            )}
        </article>
    );
};

export default M3WalkNavigator;

const WalkLane: React.FC<{
    readonly walk: CosmicClockWalkDescriptor;
    readonly onAdvance: M3WalkNavigatorProps['onAdvance'];
}> = ({ walk, onAdvance }) => {
    const stepCount = boundedPositiveInteger(walk.stepCount);
    const currentStep = boundedStep(walk.currentStep, stepCount);
    const stepDegrees = boundedPositiveNumber(walk.stepDegrees);
    const glyphKind = glyphKindForWalk(walk);
    const cellWidth = `${stepDegrees}px`;
    const progressPercent = stepCount > 0 ? ((currentStep + 1) / stepCount) * 100 : 0;

    const dispatch = React.useCallback(
        (direction: 'forward' | 'backward') => {
            onAdvance(walk.id, direction);
        },
        [onAdvance, walk.id]
    );

    return (
        <section
            role="listitem"
            className="m3-walk-navigator-lane"
            data-test="m3-walk-navigator-lane"
            data-walk-id={walk.id}
            data-walk-name={walk.name}
            data-step-count={stepCount}
            data-step-degrees={stepDegrees}
            data-current-step={currentStep}
            data-glyph-kind={glyphKind}
            style={laneStyle}
        >
            <div style={laneTopStyle}>
                <div style={walkLabelStyle}>
                    {renderWalkGlyph(glyphKind, currentStep, stepCount)}
                    <span style={walkNameStyle}>{walk.name}</span>
                </div>
                <output
                    aria-label={`${walk.name} current step`}
                    style={stepReadoutStyle}
                >
                    {currentStep} / {stepCount}
                </output>
            </div>

            <div style={barFrameStyle}>
                <div
                    aria-hidden="true"
                    style={{
                        ...barFillStyle,
                        width: `${Math.max(0, Math.min(100, progressPercent))}%`
                    }}
                />
                <div
                    role="meter"
                    aria-label={`${walk.name} progress`}
                    aria-valuemin={0}
                    aria-valuemax={stepCount}
                    aria-valuenow={currentStep}
                    style={{
                        ...stepGridStyle,
                        gridTemplateColumns: `repeat(${stepCount}, ${cellWidth})`
                    }}
                >
                    {Array.from({ length: stepCount }, (_, index) => (
                        <span
                            key={index}
                            data-walk-step={index}
                            data-active-step={index === currentStep ? 'true' : 'false'}
                            style={index === currentStep ? activeStepCellStyle : stepCellStyle}
                        />
                    ))}
                </div>
            </div>

            <div style={actionsStyle}>
                <button
                    type="button"
                    aria-label={`Advance ${walk.name} backward`}
                    data-walk-advance="backward"
                    data-rpc-method={M3_WALK_ADVANCE_RPC}
                    onClick={() => dispatch('backward')}
                    style={buttonStyle}
                >
                    &lt;
                </button>
                <button
                    type="button"
                    aria-label={`Advance ${walk.name} forward`}
                    data-walk-advance="forward"
                    data-rpc-method={M3_WALK_ADVANCE_RPC}
                    onClick={() => dispatch('forward')}
                    style={buttonStyle}
                >
                    &gt;
                </button>
            </div>
        </section>
    );
};

function glyphKindForWalk(walk: CosmicClockWalkDescriptor): M3WalkGlyphKind {
    if (walk.stepCount === 12 && walk.stepDegrees === 30) {
        return 'spanda-wheel';
    }
    if (walk.stepCount === 64) {
        return 'six-bit-binary';
    }
    return 'linear-cells';
}

function renderWalkGlyph(
    kind: M3WalkGlyphKind,
    currentStep: number,
    stepCount: number
): React.ReactNode {
    if (kind === 'spanda-wheel') {
        return <SpandaWheelGlyph currentStep={currentStep} stepCount={stepCount} />;
    }
    if (kind === 'six-bit-binary') {
        return (
            <span aria-hidden="true" style={binaryGlyphStyle}>
                {currentStep.toString(2).padStart(6, '0').slice(-6)}
            </span>
        );
    }
    return (
        <span aria-hidden="true" style={linearGlyphStyle}>
            {currentStep + 1}
        </span>
    );
}

const SpandaWheelGlyph: React.FC<{
    readonly currentStep: number;
    readonly stepCount: number;
}> = ({ currentStep, stepCount }) => {
    const spokes = Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        const activeIndex = stepCount > 0 ? currentStep % 12 : 0;
        return (
            <line
                key={index}
                x1={12 + Math.cos(angle) * 4}
                y1={12 + Math.sin(angle) * 4}
                x2={12 + Math.cos(angle) * 10}
                y2={12 + Math.sin(angle) * 10}
                stroke={index === activeIndex ? 'var(--theia-focusBorder)' : 'currentColor'}
                strokeWidth={index === activeIndex ? 2.4 : 1.2}
                strokeLinecap="round"
            />
        );
    });
    return (
        <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            style={spandaGlyphStyle}
        >
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1" />
            {spokes}
            <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
    );
};

function boundedPositiveInteger(value: number): number {
    return Number.isFinite(value) && value > 0 ? Math.max(1, Math.floor(value)) : 1;
}

function boundedPositiveNumber(value: number): number {
    return Number.isFinite(value) && value > 0 ? Number(value.toFixed(4)) : 1;
}

function boundedStep(value: number, stepCount: number): number {
    if (!Number.isFinite(value)) {
        return 0;
    }
    return Math.max(0, Math.min(stepCount - 1, Math.floor(value)));
}

const rootStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 8,
    padding: 12,
    background: 'var(--theia-editorWidget-background)',
    color: 'var(--theia-foreground)',
    minWidth: 280
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10
};

const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 'var(--theia-ui-font-size2)',
    fontWeight: 600
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

const lanesStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
};

const laneStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 6,
    padding: 8,
    background: 'var(--theia-editor-background)'
};

const laneTopStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6
};

const walkLabelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0
};

const walkNameStyle: React.CSSProperties = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 'var(--theia-ui-font-size1)',
    fontWeight: 600
};

const stepReadoutStyle: React.CSSProperties = {
    color: 'var(--theia-descriptionForeground)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 'var(--theia-ui-font-size0)',
    whiteSpace: 'nowrap'
};

const barFrameStyle: React.CSSProperties = {
    position: 'relative',
    overflowX: 'auto',
    overflowY: 'hidden',
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 4,
    background: 'var(--theia-input-background)'
};

const barFillStyle: React.CSSProperties = {
    position: 'absolute',
    insetBlock: 0,
    left: 0,
    background: 'var(--theia-editor-selectionBackground)',
    pointerEvents: 'none'
};

const stepGridStyle: React.CSSProperties = {
    position: 'relative',
    display: 'grid',
    minHeight: 18,
    width: 'max-content'
};

const stepCellStyle: React.CSSProperties = {
    display: 'block',
    minHeight: 18,
    borderRight: '1px solid var(--theia-contrastBorder)'
};

const activeStepCellStyle: React.CSSProperties = {
    ...stepCellStyle,
    background: 'var(--theia-focusBorder)',
    boxShadow: '0 0 0 1px var(--theia-focusBorder) inset'
};

const actionsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 6
};

const buttonStyle: React.CSSProperties = {
    minWidth: 26,
    minHeight: 22,
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 4,
    background: 'var(--theia-button-secondaryBackground)',
    color: 'var(--theia-button-secondaryForeground)',
    cursor: 'pointer'
};

const spandaGlyphStyle: React.CSSProperties = {
    flex: '0 0 auto',
    color: 'var(--theia-descriptionForeground)'
};

const binaryGlyphStyle: React.CSSProperties = {
    flex: '0 0 auto',
    minWidth: 48,
    padding: '2px 4px',
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 4,
    color: 'var(--theia-descriptionForeground)',
    fontFamily: 'var(--theia-ui-font-family)',
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'center'
};

const linearGlyphStyle: React.CSSProperties = {
    flex: '0 0 auto',
    minWidth: 24,
    minHeight: 22,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 4,
    color: 'var(--theia-descriptionForeground)',
    fontVariantNumeric: 'tabular-nums'
};
