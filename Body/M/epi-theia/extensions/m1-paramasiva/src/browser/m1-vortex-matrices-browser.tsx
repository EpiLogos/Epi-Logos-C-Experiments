import * as React from 'react';
import type {
    MathemeHarmonicProfileBoundary,
    MObservabilityEvent
} from '@pratibimba/m-extension-runtime';
import {
    AnandaMatrixOp,
    buildVortexMatricesModel,
    familyPinnedEvent,
    M1_VORTEX_MATRICES_BROWSER_VIEW_ID,
    normalizeFaceMode,
    normalizeMatrixOp,
    VortexDualMatrixProjector,
    VortexFaceMode,
    VortexMatrixBridge,
    VORTEX_FACE_MODE_PREFERENCE,
    VortexMatricesModel
} from '../common/vortex-matrices-model';

export {
    M1_VORTEX_MATRICES_BROWSER_VIEW_ID,
    VORTEX_FACE_MODE_PREFERENCE
};

export interface VortexPreferenceService {
    get<T>(preferenceName: string, defaultValue: T): T;
    set?(preferenceName: string, value: unknown): Promise<void> | void;
    onPreferenceChanged?(listener: (change: { readonly preferenceName: string; readonly newValue?: unknown }) => void): {
        dispose(): void;
    };
}

export interface M1VortexMatricesBrowserProps {
    readonly profile: MathemeHarmonicProfileBoundary | null;
    readonly bridge?: VortexMatrixBridge & {
        readonly onObservabilityEvent?: (listener: (event: MObservabilityEvent) => void) => { dispose(): void };
        readonly publish?: (event: MObservabilityEvent) => void;
    };
    readonly preferences?: VortexPreferenceService;
    readonly faceMode?: VortexFaceMode | string | null;
    readonly initialPinnedOp?: AnandaMatrixOp | string | number | null;
    readonly onFaceModeChange?: (faceMode: VortexFaceMode) => void;
    readonly onObservabilityEvent?: (event: MObservabilityEvent) => void;
}

export function M1VortexMatricesBrowser(props: M1VortexMatricesBrowserProps): React.ReactElement {
    const [faceMode, setFaceMode] = React.useState<VortexFaceMode>(() =>
        normalizeFaceMode(props.faceMode ?? props.preferences?.get(VORTEX_FACE_MODE_PREFERENCE, 'digit-root'))
    );
    const [pinnedOp, setPinnedOp] = React.useState<AnandaMatrixOp | null>(() =>
        normalizeMatrixOp(props.initialPinnedOp)
    );
    const [dualProjector, setDualProjector] = React.useState(() => new VortexDualMatrixProjector());
    const previousActiveOp = React.useRef<AnandaMatrixOp | null>(null);
    const [eventCrossFadeOp, setEventCrossFadeOp] = React.useState<AnandaMatrixOp | null>(null);

    React.useEffect(() => {
        if (props.faceMode) {
            setFaceMode(normalizeFaceMode(props.faceMode));
        }
    }, [props.faceMode]);

    React.useEffect(() => {
        const subscription = props.preferences?.onPreferenceChanged?.(change => {
            if (change.preferenceName === VORTEX_FACE_MODE_PREFERENCE) {
                setFaceMode(normalizeFaceMode(change.newValue));
            }
        });
        return () => subscription?.dispose();
    }, [props.preferences]);

    React.useEffect(() => {
        let disposed = false;
        if (!props.bridge) {
            return undefined;
        }
        void VortexDualMatrixProjector.fromBridge(props.bridge).then(projector => {
            if (!disposed) {
                setDualProjector(projector);
            }
        }).catch(() => {
            if (!disposed) {
                setDualProjector(new VortexDualMatrixProjector());
            }
        });
        return () => {
            disposed = true;
        };
    }, [props.bridge]);

    React.useEffect(() => {
        const subscription = props.bridge?.onObservabilityEvent?.(event => {
            if (event.type !== 'm1.klein_flip.source') {
                return;
            }
            const from = normalizeMatrixOp(event.payload?.from ?? event.payload?.from_op ?? event.payload?.previousOp);
            const to = normalizeMatrixOp(event.payload?.to ?? event.payload?.to_op ?? event.payload?.currentOp);
            if (from !== null && to !== null) {
                dualProjector.remember(from, to);
                setDualProjector(new VortexDualMatrixProjector(dualProjector.pairs()));
                setEventCrossFadeOp(to);
            }
        });
        return () => subscription?.dispose();
    }, [props.bridge, dualProjector]);

    const activeBeforeBuild = previousActiveOp.current;
    const model = buildVortexMatricesModel({
        profile: props.profile,
        faceMode,
        pinnedOp,
        dualProjector,
        previousActiveMatrixOp: activeBeforeBuild
    });
    previousActiveOp.current = model.activeProfileOp;

    const changeFaceMode = (next: VortexFaceMode): void => {
        setFaceMode(next);
        props.onFaceModeChange?.(next);
        void props.preferences?.set?.(VORTEX_FACE_MODE_PREFERENCE, next);
    };

    const pinFamily = (op: AnandaMatrixOp): void => {
        const emittedAt = Date.now();
        setPinnedOp(op);
        const event = familyPinnedEvent({ pinnedOp: op, emittedAt });
        props.bridge?.publish?.(event);
        props.onObservabilityEvent?.(event);
    };

    const selectedCrossFadeOp = eventCrossFadeOp ?? model.kleinFlipCrossFadeOp;

    return (
        <section
            className="mext-widget-detail"
            data-test="m1-vortex-matrices-browser"
            data-view-id={M1_VORTEX_MATRICES_BROWSER_VIEW_ID}
            style={rootStyle}
        >
            <header style={headerStyle}>
                <div>
                    <h3 style={headingStyle}>Vortex matrices</h3>
                    <p style={subtleTextStyle}>
                        source={model.readiness.source} · view={model.viewId}
                    </p>
                </div>
                <FaceModeToggle faceMode={faceMode} onChange={changeFaceMode} />
            </header>

            <FamilyTabs
                model={model}
                crossFadeOp={selectedCrossFadeOp}
                onPin={pinFamily}
            />

            {model.readiness.blockers.length > 0 ? (
                <p className="mext-widget-empty" data-test="m1-vortex-readiness">
                    blocked: {model.readiness.blockers.join('; ')}
                </p>
            ) : null}

            <MatrixGrid model={model} />
        </section>
    );
}

function FaceModeToggle(props: {
    readonly faceMode: VortexFaceMode;
    readonly onChange: (faceMode: VortexFaceMode) => void;
}): React.ReactElement {
    return (
        <div role="group" aria-label="Vortex face mode" style={toggleStyle}>
            <button
                type="button"
                data-test="m1-vortex-face-digit-root"
                aria-pressed={props.faceMode === 'digit-root'}
                onClick={() => props.onChange('digit-root')}
                style={toggleButtonStyle(props.faceMode === 'digit-root')}
            >
                Digit-root face
            </button>
            <button
                type="button"
                data-test="m1-vortex-face-raw"
                aria-pressed={props.faceMode === 'raw'}
                onClick={() => props.onChange('raw')}
                style={toggleButtonStyle(props.faceMode === 'raw')}
            >
                Raw / no-DR face
            </button>
        </div>
    );
}

function FamilyTabs(props: {
    readonly model: VortexMatricesModel;
    readonly crossFadeOp: AnandaMatrixOp | null;
    readonly onPin: (op: AnandaMatrixOp) => void;
}): React.ReactElement {
    return (
        <div role="tablist" aria-label="Vortex matrix families" style={tabListStyle}>
            {props.model.families.map(family => {
                const selected = props.model.selectedOp === family.op;
                const pinned = props.model.pinnedOp === family.op;
                const dualPinned = props.model.dualPinnedOp === family.op;
                const crossFade = props.crossFadeOp === family.op;
                return (
                    <button
                        key={family.op}
                        type="button"
                        role="tab"
                        data-test={`m1-vortex-family-tab-${family.op}`}
                        aria-selected={selected}
                        data-pinned={pinned ? 'true' : 'false'}
                        data-dual-pin={dualPinned ? 'true' : 'false'}
                        data-cross-fade={crossFade ? 'true' : 'false'}
                        onClick={() => props.onPin(family.op)}
                        style={tabStyle({ selected, pinned, dualPinned, crossFade })}
                    >
                        <span>{family.label}</span>
                        {pinned ? <span aria-label="pinned family">pin</span> : null}
                    </button>
                );
            })}
        </div>
    );
}

function MatrixGrid(props: { readonly model: VortexMatricesModel }): React.ReactElement {
    return (
        <div
            role="grid"
            aria-label="12 by 12 vortex matrix cells"
            data-test="m1-vortex-matrix-grid"
            data-face-mode={props.model.faceMode}
            style={gridStyle}
        >
            {props.model.grid.map(cell => (
                <div
                    key={`${cell.rowTick12}:${cell.position12}`}
                    role="gridcell"
                    data-test={`m1-vortex-cell-${cell.rowTick12}-${cell.position12}`}
                    data-streamline={cell.streamline ?? 'none'}
                    data-proof-highlight={cell.proofHighlight ? 'true' : 'false'}
                    data-active={cell.active ? 'true' : 'false'}
                    data-shadow={cell.shadowColumn ? 'true' : 'false'}
                    title={cellTitle(cell)}
                    style={cellStyle(cell, props.model.activeCell.cl42Signature)}
                >
                    <span style={cellAddressStyle}>
                        {cell.rowTick12},{cell.position12}
                    </span>
                    <strong data-test="m1-vortex-cell-value" style={cellValueStyle}>
                        {cell.displayValue}
                    </strong>
                </div>
            ))}
        </div>
    );
}

function cellTitle(cell: VortexMatricesModel['grid'][number]): string {
    return [
        `tick12 ${cell.rowTick12}`,
        `position ${cell.position12}`,
        `value ${cell.displayValue}`,
        `source ${cell.source}`
    ].join(' · ');
}

const rootStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem'
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    flexWrap: 'wrap'
};

const headingStyle: React.CSSProperties = {
    margin: 0
};

const subtleTextStyle: React.CSSProperties = {
    margin: '0.2rem 0 0',
    opacity: 0.72,
    fontSize: '0.82rem'
};

const toggleStyle: React.CSSProperties = {
    display: 'inline-flex',
    gap: '0.25rem',
    padding: '0.18rem',
    border: '1px solid var(--theia-editorWidget-border, #444)',
    borderRadius: '6px'
};

function toggleButtonStyle(active: boolean): React.CSSProperties {
    return {
        border: '0',
        borderRadius: '4px',
        padding: '0.3rem 0.55rem',
        cursor: 'pointer',
        background: active ? 'var(--theia-button-background, #0e639c)' : 'transparent',
        color: active ? 'var(--theia-button-foreground, #fff)' : 'inherit',
        fontSize: '0.82rem'
    };
}

const tabListStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    gap: '0.35rem'
};

function tabStyle(state: {
    readonly selected: boolean;
    readonly pinned: boolean;
    readonly dualPinned: boolean;
    readonly crossFade: boolean;
}): React.CSSProperties {
    const glow = state.pinned
        ? '0 0 0 2px rgba(255, 196, 87, 0.45)'
        : state.dualPinned
          ? '0 0 0 2px rgba(122, 247, 190, 0.42)'
          : state.crossFade
            ? '0 0 12px rgba(132, 179, 255, 0.55)'
            : 'none';
    return {
        minWidth: 0,
        minHeight: '2.35rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.35rem',
        borderRadius: '6px',
        border: '1px solid var(--theia-editorWidget-border, #444)',
        background: state.selected
            ? 'var(--theia-editor-selectionBackground, rgba(90, 140, 220, 0.28))'
            : 'var(--theia-editorWidget-background, rgba(255,255,255,0.03))',
        color: 'inherit',
        cursor: 'pointer',
        fontSize: '0.78rem',
        boxShadow: glow,
        transition: 'background 140ms ease, box-shadow 180ms ease, transform 180ms ease',
        transform: state.crossFade ? 'translateY(-1px)' : 'none'
    };
}

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, minmax(32px, 1fr))',
    gap: '3px',
    width: '100%',
    overflowX: 'auto'
};

function cellStyle(
    cell: VortexMatricesModel['grid'][number],
    cl42Signature: number | null
): React.CSSProperties {
    const background =
        cell.streamline === 'mahamaya'
            ? 'rgba(255, 196, 87, 0.22)'
            : cell.streamline === 'parashakti'
              ? 'rgba(58, 211, 154, 0.2)'
              : cell.shadowColumn
                ? 'rgba(255,255,255,0.035)'
                : 'rgba(255,255,255,0.055)';
    const haloColour = cl42Signature !== null && cl42Signature < 0
        ? 'rgba(132, 179, 255, 0.88)'
        : 'rgba(255, 196, 87, 0.9)';
    return {
        aspectRatio: '1 / 1',
        minWidth: '32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        border: cell.active
            ? `1px solid ${haloColour}`
            : '1px solid var(--theia-editorWidget-border, rgba(255,255,255,0.15))',
        background,
        color: 'inherit',
        boxShadow: cell.active
            ? `0 0 0 2px ${haloColour}, 0 0 14px ${haloColour}`
            : cell.proofHighlight
              ? 'inset 0 0 0 2px rgba(255,255,255,0.5)'
              : 'none',
        fontVariantNumeric: 'tabular-nums'
    };
}

const cellAddressStyle: React.CSSProperties = {
    fontSize: '0.58rem',
    opacity: 0.62
};

const cellValueStyle: React.CSSProperties = {
    fontSize: '0.8rem',
    lineHeight: 1.05,
    textAlign: 'center',
    overflowWrap: 'anywhere'
};
