import * as React from 'react';
import type {
    Disposable,
    MObservabilityEvent,
    SharedBridgeAdapter
} from '@pratibimba/m-extension-runtime';
import type { M1ProfileClockModel } from '../common/clock-instrument';

export const KAPREKAR_PEDAGOGY_SEED_PATH =
    "Idea/Bimba/Seeds/M/M1'/m1-prime-kaprekar-pedagogy.md";
export const CANON_STUDIO_OPEN_MARKDOWN_COMMAND = 'canon-studio:openMarkdownFile';
export const KAPREKAR_POSITION6_TRIGGER = 4;

export interface KaprekarCommandExecutor {
    readonly executeCommand: (commandId: string, ...args: unknown[]) => unknown | Promise<unknown>;
}

export interface M1KaprekarInspectorProps {
    readonly model: Pick<M1ProfileClockModel, 'position6'> | null;
    readonly layoutMode?: string;
    readonly commands?: KaprekarCommandExecutor;
    readonly bridge?: Pick<SharedBridgeAdapter, 'onObservabilityEvent'>;
    readonly lastSkeletonEvent?: string | number | null;
}

export async function openKaprekarPedagogySeed(commands: KaprekarCommandExecutor): Promise<void> {
    await commands.executeCommand(CANON_STUDIO_OPEN_MARKDOWN_COMMAND, KAPREKAR_PEDAGOGY_SEED_PATH);
}

export function M1KaprekarInspector(props: M1KaprekarInspectorProps): React.ReactElement | null {
    const [observedHit, setObservedHit] = React.useState(
        () => isKaprekarPedagogyHit(props.lastSkeletonEvent)
    );

    React.useEffect(() => {
        setObservedHit(isKaprekarPedagogyHit(props.lastSkeletonEvent));
    }, [props.lastSkeletonEvent]);

    React.useEffect(() => {
        if (!props.bridge) {
            return undefined;
        }
        const disposable: Disposable = props.bridge.onObservabilityEvent(event => {
            if (observabilityEventIsKaprekarHit(event)) {
                setObservedHit(true);
            }
        });
        return () => disposable.dispose();
    }, [props.bridge]);

    const triggeredByRow = props.model?.position6 === KAPREKAR_POSITION6_TRIGGER;
    if (!triggeredByRow && !observedHit) {
        return null;
    }

    const ideDeep = props.layoutMode === 'ide-deep';
    return (
        <details
            open
            className="m1-kaprekar-inspector"
            data-test="m1-kaprekar-inspector"
            style={panelStyle}
        >
            <summary style={summaryStyle}>Kaprekar 6174</summary>
            <ol style={lineListStyle} aria-label="Kaprekar 6174 inspector">
                <li data-test="m1-kaprekar-line-1">
                    <code>6174 = 7² × 9 × 14 = 18 × 7³</code>
                </li>
                <li data-test="m1-kaprekar-line-2">
                    <code>{'{1, 4, 6, 7}'}</code>: 1 = DIFF_B axiom (+1 mod 10);
                    4 = DIFF_A matrix idx; 6 = six matrix families; 7 = 7-row producing 16/9.
                </li>
                <li data-test="m1-kaprekar-line-3">
                    archetype-7 binding via <code>QL_DIVINE_ACT_RATIO 16/9</code> at
                    <code> m1.h:417-422</code>; substrate read through the bridge.
                </li>
                <li data-test="m1-kaprekar-line-4">
                    {ideDeep && props.commands ? (
                        <button
                            type="button"
                            data-test="m1-kaprekar-seed-button"
                            onClick={() => {
                                void openKaprekarPedagogySeed(props.commands!);
                            }}
                            style={buttonStyle}
                        >
                            Read the pedagogy seed
                        </button>
                    ) : (
                        <span title={KAPREKAR_PEDAGOGY_SEED_PATH}>Read the pedagogy seed</span>
                    )}
                </li>
            </ol>
        </details>
    );
}

function observabilityEventIsKaprekarHit(event: MObservabilityEvent): boolean {
    return (
        isKaprekarPedagogyHit(event.payload.eventKind) ||
        isKaprekarPedagogyHit(event.payload.event_kind) ||
        isKaprekarPedagogyHit(event.payload.skeletonEvent) ||
        isKaprekarPedagogyHit(event.payload.skeleton_event) ||
        isKaprekarPedagogyHit(event.payload.anandaSkeletonEvent) ||
        isKaprekarPedagogyHit(event.payload.ananda_skeleton_event) ||
        isKaprekarPedagogyHit(event.type)
    );
}

function isKaprekarPedagogyHit(value: unknown): boolean {
    if (value === 6) {
        return true;
    }
    if (typeof value !== 'string' || value.length === 0) {
        return false;
    }
    const withoutPrefix = value.includes('.') ? value.slice(value.lastIndexOf('.') + 1) : value;
    return withoutPrefix === 'KaprekarPedagogyHit' || withoutPrefix === '6';
}

const panelStyle: React.CSSProperties = {
    border: '1px solid var(--theia-editorWidget-border, #444)',
    borderRadius: 6,
    padding: '0.65rem 0.75rem',
    background: 'var(--theia-editorWidget-background, transparent)'
};

const summaryStyle: React.CSSProperties = {
    cursor: 'pointer',
    fontWeight: 700
};

const lineListStyle: React.CSSProperties = {
    display: 'grid',
    gap: '0.45rem',
    margin: '0.6rem 0 0',
    paddingLeft: '1.25rem',
    fontSize: '0.9em',
    lineHeight: 1.45
};

const buttonStyle: React.CSSProperties = {
    border: '1px solid var(--theia-button-border, transparent)',
    borderRadius: 4,
    padding: '0.2rem 0.5rem',
    color: 'var(--theia-button-foreground)',
    background: 'var(--theia-button-background)',
    cursor: 'pointer'
};
