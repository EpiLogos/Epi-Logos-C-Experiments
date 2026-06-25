import * as React from 'react';
import {
    MathemeHarmonicProfileBoundary,
    SharedBridgeAdapter
} from '@pratibimba/m-extension-runtime';
import {
    CompositionProfileTickSubscription,
    openCompositionProfileSubscription
} from '../common/profile-tick-subscription';
import {
    BIMBA_PRATIBIMBA_UI_STATE_SPINE_FIELDS,
    BimbaPratibimbaUiState
} from '../common/workspace-persistence';
import { LemniscateTransition } from './design-primitives/lemniscate-transition';

export type Daily01Face = 'cosmic' | 'personal';

export const DAILY_0_1_TOGGLE_KEYSTROKE = 'cmd-period' as const;

export interface Daily01ToggleKeyEventLike {
    readonly key: string;
    readonly metaKey?: boolean;
    readonly ctrlKey?: boolean;
    preventDefault?: () => void;
}

export interface Daily01ToggleController {
    currentFace(): Daily01Face;
    toggle(): Daily01Face;
    handleKeyDown(event: Daily01ToggleKeyEventLike): Daily01Face | null;
}

export interface Daily01ToggleChromeProps {
    readonly activeFace?: Daily01Face;
    readonly defaultFace?: Daily01Face;
    readonly className?: string;
    readonly children?: React.ReactNode;
    readonly onToggle?: (face: Daily01Face) => void;
}

export const CompositionProfileContext: React.Context<CompositionProfileTickSubscription | null> =
    React.createContext<CompositionProfileTickSubscription | null>(null);

export const CompositionProfileProvider: React.FC<{
    readonly bridge: SharedBridgeAdapter;
    readonly children: React.ReactNode;
    readonly daily01ToggleChrome?: boolean;
    readonly daily01Face?: Daily01Face;
}> = ({ bridge, children, daily01ToggleChrome = true, daily01Face }) => {
    const [subscription] = React.useState(() => openCompositionProfileSubscription(bridge));
    React.useEffect(() => () => subscription.dispose(), [subscription]);
    const inferredFace = daily01Face ?? inferDaily01FaceFromChildren(children);
    const content = daily01ToggleChrome
        ? (
            <Daily01ToggleChrome defaultFace={inferredFace}>
                {children}
            </Daily01ToggleChrome>
        )
        : children;

    return (
        <CompositionProfileContext.Provider value={subscription}>
            {content}
        </CompositionProfileContext.Provider>
    );
};

export function isDaily01ToggleKeyEvent(event: Daily01ToggleKeyEventLike): boolean {
    return event.key === '.' && (event.metaKey === true || event.ctrlKey === true);
}

export function nextDaily01Face(face: Daily01Face): Daily01Face {
    return face === 'cosmic' ? 'personal' : 'cosmic';
}

export function createDaily01ToggleController(
    initialFace: Daily01Face = 'cosmic',
    onToggle?: (face: Daily01Face) => void
): Daily01ToggleController {
    let face = initialFace;
    const toggle = () => {
        face = nextDaily01Face(face);
        onToggle?.(face);
        return face;
    };
    return Object.freeze({
        currentFace: () => face,
        toggle,
        handleKeyDown: event => {
            if (!isDaily01ToggleKeyEvent(event)) {
                return null;
            }
            event.preventDefault?.();
            return toggle();
        }
    });
}

export function preserveBimbaPratibimbaUiStateAcrossDaily01Toggle(
    state: BimbaPratibimbaUiState,
    _from: Daily01Face,
    _to: Daily01Face
): BimbaPratibimbaUiState {
    const preserved = BIMBA_PRATIBIMBA_UI_STATE_SPINE_FIELDS.reduce(
        (acc, field) => ({ ...acc, [field]: state[field] }),
        {} as BimbaPratibimbaUiState
    );
    return Object.freeze(preserved);
}

export const Daily01ToggleChrome: React.FC<Daily01ToggleChromeProps> = ({
    activeFace,
    defaultFace = 'cosmic',
    className,
    children,
    onToggle
}) => {
    const [uncontrolledFace, setUncontrolledFace] = React.useState<Daily01Face>(defaultFace);
    const face = activeFace ?? uncontrolledFace;
    const nextFace = nextDaily01Face(face);
    const rootClassName = className
        ? `daily-0-1-toggle-chrome ${className}`
        : 'daily-0-1-toggle-chrome';
    const requestToggle = React.useCallback(() => {
        const next = nextDaily01Face(activeFace ?? uncontrolledFace);
        if (activeFace === undefined) {
            setUncontrolledFace(next);
        }
        onToggle?.(next);
    }, [activeFace, uncontrolledFace, onToggle]);

    return (
        <LemniscateTransition
            from={face}
            to={nextFace}
            phase={face === 'personal' ? 1 : 0}
            className={rootClassName}
            onFoldChange={requestToggle}
        >
            <div
                className="daily-0-1-titlebar"
                data-test="daily-0-1-toggle-chrome"
                data-active-face={face}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    minHeight: 28,
                    gap: 8
                }}
            >
                <button
                    type="button"
                    className="daily-0-1-coin-flip-button"
                    data-test="daily-0-1-coin-flip"
                    data-icon="coin-flip"
                    aria-label={`Toggle daily 0/1 face: ${face} to ${nextFace}`}
                    title={DAILY_0_1_TOGGLE_KEYSTROKE}
                    onClick={requestToggle}
                    style={{
                        alignItems: 'center',
                        background: 'transparent',
                        border: '1px solid var(--theia-focusBorder, currentColor)',
                        borderRadius: 14,
                        color: 'inherit',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        height: 24,
                        justifyContent: 'center',
                        minWidth: 32,
                        padding: '0 6px'
                    }}
                >
                    <span aria-hidden="true" style={{ position: 'relative', display: 'inline-flex', width: 18, height: 18 }}>
                        <span style={{
                            position: 'absolute',
                            inset: '2px 7px 2px 1px',
                            border: '1px solid currentColor',
                            borderRadius: '50%',
                            opacity: face === 'cosmic' ? 1 : 0.48
                        }} />
                        <span style={{
                            position: 'absolute',
                            inset: '2px 1px 2px 7px',
                            border: '1px solid currentColor',
                            borderRadius: '50%',
                            opacity: face === 'personal' ? 1 : 0.48
                        }} />
                        <span style={{
                            position: 'absolute',
                            left: 4,
                            top: 4,
                            fontSize: 8,
                            lineHeight: '8px'
                        }}>0</span>
                        <span style={{
                            position: 'absolute',
                            right: 4,
                            top: 4,
                            fontSize: 8,
                            lineHeight: '8px'
                        }}>1</span>
                    </span>
                </button>
            </div>
            <div
                className="daily-0-1-face-surface"
                data-active-face={face}
                data-next-face={nextFace}
            >
                {children}
            </div>
        </LemniscateTransition>
    );
};

export function useCompositionProfile(): {
    profile: MathemeHarmonicProfileBoundary | null;
    generation: number | null;
} {
    const subscription = React.useContext(CompositionProfileContext);
    const [snapshot, setSnapshot] = React.useState(() => readSnapshot(subscription));

    React.useEffect(() => {
        setSnapshot(readSnapshot(subscription));
        if (!subscription) {
            return undefined;
        }
        const disposable = subscription.subscribe(profile => {
            setSnapshot(Object.freeze({
                profile,
                generation: profile.generation
            }));
        });
        return () => disposable.dispose();
    }, [subscription]);

    return snapshot;
}

function readSnapshot(subscription: CompositionProfileTickSubscription | null): {
    profile: MathemeHarmonicProfileBoundary | null;
    generation: number | null;
} {
    return Object.freeze({
        profile: subscription?.currentProfile ?? null,
        generation: subscription?.currentGeneration ?? null
    });
}

function inferDaily01FaceFromChildren(children: React.ReactNode): Daily01Face {
    const stack = React.Children.toArray(children);
    while (stack.length > 0) {
        const child = stack.shift();
        if (!React.isValidElement(child)) {
            continue;
        }
        const explicitFace = child.props?.['data-daily-0-1-face'];
        if (explicitFace === 'cosmic' || explicitFace === 'personal') {
            return explicitFace;
        }
        const typeName = typeof child.type === 'string'
            ? child.type
            : (child.type as { displayName?: string; name?: string }).displayName ??
                (child.type as { displayName?: string; name?: string }).name ??
                '';
        if (/personal|jiva|siva|450|4-5-0/i.test(typeName)) {
            return 'personal';
        }
        if (/cosmic|123|1-2-3/i.test(typeName)) {
            return 'cosmic';
        }
        stack.push(...React.Children.toArray(child.props?.children));
    }
    return 'cosmic';
}
