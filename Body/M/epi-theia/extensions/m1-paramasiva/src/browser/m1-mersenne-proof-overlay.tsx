import * as React from 'react';
import type { PreferenceService } from '@theia/core/lib/browser/preferences';
import type {
    Disposable,
    MObservabilityEvent,
    SharedBridgeAdapter
} from '@pratibimba/m-extension-runtime';

export const M1_MERSENNE_PROOF_LAYOUT = 'ide-deep';
export const M1_DEVELOPER_MODE_PREFERENCE = 'epi-logos.ui.developerMode';

export type AnandaSkeletonEventName =
    | 'Hit36'
    | 'Hit64'
    | 'Hit72'
    | 'Ratio64Over36'
    | 'Additive137'
    | 'IdentityReturn4Plus2'
    | 'KaprekarPedagogyHit';

export type MersenneProofActiveTarget = 'substrate' | 'line-2' | 'line-3' | 'line-4' | null;

export interface MersenneProofOverlayProps {
    readonly layoutMode?: string;
    readonly developerMode?: boolean;
    readonly preferences?: Pick<PreferenceService, 'get' | 'onPreferenceChanged'>;
    readonly bridge?: Pick<SharedBridgeAdapter, 'onObservabilityEvent'>;
    readonly lastSkeletonEvent?: AnandaSkeletonEventName | number | null;
}

interface ProofLine {
    readonly id: 1 | 2 | 3 | 4;
    readonly expression: string;
    readonly parenthetical: string;
    readonly annotation: string;
    readonly target: Exclude<MersenneProofActiveTarget, 'substrate' | null> | null;
}

const PROOF_LINES: readonly ProofLine[] = Object.freeze([
    Object.freeze({
        id: 1,
        expression: 'M_5 = 2^5 − 1 = 31',
        parenthetical: 'the prime-index of M_7',
        annotation:
            'prime-index of M_7 is itself a Mersenne prime; actional-Archetype-7 grounding at the Mersenne layer',
        target: null
    }),
    Object.freeze({
        id: 2,
        expression: 'M_7 = 2^7 − 1 = 127',
        parenthetical: 'Mersenne ground exposed by 9-gap withdrawal 136 − 9 = 127',
        annotation:
            'the additive substrate `64 + 72 = 136` minus 9-gap = 127 exposes the Mersenne prime',
        target: 'line-2'
    }),
    Object.freeze({
        id: 3,
        expression: '+1 → 128 = 2^7',
        parenthetical: 'the parent-seal effecting binary closure of 127 into 128',
        annotation:
            'the M1-5 +1 parent — this is the +1 attribution operationally decisive per Tranche 02.1',
        target: 'line-3'
    }),
    Object.freeze({
        id: 4,
        expression: '+9 → 137',
        parenthetical: 'atomic dressing; wholeness restored',
        annotation: '+9 restores wholeness — 137 is the atomically-dressed return',
        target: 'line-4'
    })
]);

const SKELETON_EVENT_BY_ORDINAL: Readonly<Record<number, AnandaSkeletonEventName>> = Object.freeze({
    0: 'Hit36',
    1: 'Hit64',
    2: 'Hit72',
    3: 'Ratio64Over36',
    4: 'Additive137',
    5: 'IdentityReturn4Plus2',
    6: 'KaprekarPedagogyHit'
});

const SUBSTRATE_EVENTS = new Set<AnandaSkeletonEventName>([
    'Hit36',
    'Hit64',
    'Hit72',
    'Ratio64Over36'
]);

export function MersenneProofOverlay(props: MersenneProofOverlayProps): React.ReactElement | null {
    const [developerMode, setDeveloperMode] = React.useState(() =>
        props.developerMode ?? developerModeFromPreferences(props.preferences)
    );
    const [lastObservedEvent, setLastObservedEvent] = React.useState<AnandaSkeletonEventName | null>(
        () => anandaSkeletonEventValue(props.lastSkeletonEvent)
    );

    React.useEffect(() => {
        setDeveloperMode(props.developerMode ?? developerModeFromPreferences(props.preferences));
    }, [props.developerMode, props.preferences]);

    React.useEffect(() => {
        if (!props.preferences || props.developerMode !== undefined) {
            return undefined;
        }
        const disposable = props.preferences.onPreferenceChanged(change => {
            if (change.preferenceName === M1_DEVELOPER_MODE_PREFERENCE) {
                setDeveloperMode(change.newValue === true);
            }
        });
        return () => disposable.dispose();
    }, [props.developerMode, props.preferences]);

    React.useEffect(() => {
        setLastObservedEvent(anandaSkeletonEventValue(props.lastSkeletonEvent));
    }, [props.lastSkeletonEvent]);

    React.useEffect(() => {
        if (!props.bridge) {
            return undefined;
        }
        const disposable: Disposable = props.bridge.onObservabilityEvent(event => {
            const next = anandaSkeletonEventFromObservabilityEvent(event);
            if (next !== null) {
                setLastObservedEvent(next);
            }
        });
        return () => disposable.dispose();
    }, [props.bridge]);

    if (props.layoutMode !== M1_MERSENNE_PROOF_LAYOUT || developerMode !== true) {
        return null;
    }

    const activeTarget = activeTargetForSkeletonEvent(lastObservedEvent);
    return (
        <aside
            className="m1-mersenne-proof-overlay"
            data-test="m1-mersenne-proof-overlay"
            data-active-target={activeTarget ?? 'none'}
            aria-label="Mersenne 137 additive proof overlay"
            style={overlayStyle}
        >
            <h4 style={headingStyle}>Mersenne / 137 additive proof</h4>
            <ol style={listStyle}>
                <li
                    data-test="m1-mersenne-proof-substrate"
                    data-active={activeTarget === 'substrate' ? 'true' : 'false'}
                    style={lineStyle(activeTarget === 'substrate')}
                >
                    <code style={codeStyle}>64 + 72 = 136</code>
                    <span style={annotationStyle}>
                        additive substrate before the 9-gap withdrawal into M_7
                    </span>
                </li>
                {PROOF_LINES.map(line => (
                    <MersenneProofLine
                        key={line.id}
                        line={line}
                        active={line.target !== null && activeTarget === line.target}
                    />
                ))}
            </ol>
        </aside>
    );
}

export function anandaSkeletonEventFromObservabilityEvent(
    event: MObservabilityEvent
): AnandaSkeletonEventName | null {
    return (
        anandaSkeletonEventValue(event.payload.eventKind) ??
        anandaSkeletonEventValue(event.payload.event_kind) ??
        anandaSkeletonEventValue(event.payload.skeletonEvent) ??
        anandaSkeletonEventValue(event.payload.skeleton_event) ??
        anandaSkeletonEventValue(event.payload.anandaSkeletonEvent) ??
        anandaSkeletonEventValue(event.payload.ananda_skeleton_event) ??
        anandaSkeletonEventValue(event.type)
    );
}

export function activeTargetForSkeletonEvent(
    value: AnandaSkeletonEventName | number | null | undefined
): MersenneProofActiveTarget {
    const event = anandaSkeletonEventValue(value);
    if (event === 'Additive137') return 'line-4';
    if (event === 'IdentityReturn4Plus2') return 'line-3';
    if (event === 'KaprekarPedagogyHit') return 'line-2';
    return event !== null && SUBSTRATE_EVENTS.has(event) ? 'substrate' : null;
}

function MersenneProofLine(props: {
    readonly line: ProofLine;
    readonly active: boolean;
}): React.ReactElement {
    return (
        <li
            data-test={`m1-mersenne-proof-line-${props.line.id}`}
            data-active={props.active ? 'true' : 'false'}
            style={lineStyle(props.active)}
        >
            <code style={codeStyle}>{props.line.expression}</code>
            <span style={parentheticalStyle}>({props.line.parenthetical})</span>
            <span style={annotationStyle}>{props.line.annotation}</span>
        </li>
    );
}

function anandaSkeletonEventValue(value: unknown): AnandaSkeletonEventName | null {
    if (typeof value === 'number' && Number.isInteger(value)) {
        return SKELETON_EVENT_BY_ORDINAL[value] ?? null;
    }
    if (typeof value !== 'string' || value.length === 0) {
        return null;
    }
    if (isAnandaSkeletonEventName(value)) {
        return value;
    }
    const withoutPrefix = value.includes('.') ? value.slice(value.lastIndexOf('.') + 1) : value;
    return isAnandaSkeletonEventName(withoutPrefix) ? withoutPrefix : null;
}

function isAnandaSkeletonEventName(value: string): value is AnandaSkeletonEventName {
    return (
        value === 'Hit36' ||
        value === 'Hit64' ||
        value === 'Hit72' ||
        value === 'Ratio64Over36' ||
        value === 'Additive137' ||
        value === 'IdentityReturn4Plus2' ||
        value === 'KaprekarPedagogyHit'
    );
}

function developerModeFromPreferences(
    preferences: Pick<PreferenceService, 'get' | 'onPreferenceChanged'> | undefined
): boolean {
    return preferences?.get<boolean>(M1_DEVELOPER_MODE_PREFERENCE, false) === true;
}

const overlayStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 6,
    padding: 12,
    marginTop: 12,
    background: 'var(--theia-editor-background)'
};

const headingStyle: React.CSSProperties = {
    margin: '0 0 10px',
    fontSize: 13,
    fontWeight: 700
};

const listStyle: React.CSSProperties = {
    display: 'grid',
    gap: 8,
    margin: 0,
    padding: 0,
    listStyle: 'none'
};

const codeStyle: React.CSSProperties = {
    fontFamily: 'var(--theia-code-font-family)',
    fontSize: 12
};

const parentheticalStyle: React.CSSProperties = {
    color: 'var(--theia-descriptionForeground)'
};

const annotationStyle: React.CSSProperties = {
    color: 'var(--theia-descriptionForeground)'
};

function lineStyle(active: boolean): React.CSSProperties {
    return {
        display: 'grid',
        gap: 3,
        padding: '8px 10px',
        border: `1px solid ${active ? 'var(--theia-charts-yellow)' : 'var(--theia-contrastBorder)'}`,
        borderRadius: 4,
        background: active ? 'rgba(255, 204, 0, 0.12)' : 'var(--theia-sideBar-background)'
    };
}
