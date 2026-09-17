import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { CommandContribution, CommandRegistry } from '@theia/core/lib/common';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import { KeybindingContribution, KeybindingRegistry } from '@theia/core/lib/browser/keybinding';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    CoordinateContext,
    Disposable,
    EMPTY_COORDINATE_CONTEXT,
    MathemeHarmonicProfileBoundary,
    MObservabilityEvent,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import { EXTENSION_ID, PRIVACY_CLASS } from '../../common';
import { privacyChromeClass, SURFACE_PRIVACY_TOOLTIP } from '../privacy-chrome';

export const TIME_AXIS_SWITCHER_VIEW_ID = 'm4.nara.timeAxisSwitcher';
export const TIME_AXIS_SWITCHER_LABEL = 'M4 Time Axis';
export const M4_TIME_AXIS_SWITCHER_CHIP_EXPORT = 'M4TimeAxisSwitcherChip' as const;
export const TIME_AXIS_SET_METHOD = 'nara.session.set_time_axis';
export const TIME_AXIS_SWITCHER_COMMAND_ID = 'm4.nara.timeAxisSwitcher.cycle';
export const TIME_AXIS_SWITCHER_OPEN_COMMAND_ID = 'm4.nara.timeAxisSwitcher.open';
export const TIME_AXIS_SWITCHER_KEYBINDING = 'cmd+shift+t';
export const TIME_AXIS_FOREGROUND_EVENT_TYPE = 'nara.time_axis.foreground.changed';

export type TimeAxisMode = 'natal' | 'real-time' | 'kairotic';
export type TimeAxisStatus = 'ready' | 'persisting' | 'error';

export interface TimeAxisHandles {
    readonly qIdentityHandle: string;
    readonly qTransitHandle: string;
    readonly qActivityHandle: string;
}

export interface TimeAxisState {
    readonly sessionKey: string;
    readonly mode: TimeAxisMode;
    readonly foregroundedHandle: string;
    readonly handles: TimeAxisHandles;
    readonly privacyClass: 'protected_local';
}

export interface M4TimeAxisSwitcherChipProps {
    readonly state: TimeAxisState;
    readonly status?: TimeAxisStatus;
    readonly errorMessage?: string | null;
    readonly onSelect: (mode: TimeAxisMode) => void;
}

interface GatewayBridge {
    invokeGatewayRpc(method: string, params: Record<string, unknown>): Promise<unknown>;
}

export const TIME_AXIS_MODES: readonly TimeAxisMode[] = Object.freeze([
    'natal',
    'real-time',
    'kairotic'
]);
export const DEFAULT_TIME_AXIS_MODE: TimeAxisMode = 'real-time';

const MODE_LABELS: Readonly<Record<TimeAxisMode, string>> = Object.freeze({
    natal: 'Natal',
    'real-time': 'Real-time',
    kairotic: 'Kairotic'
});

const MODE_DESCRIPTIONS: Readonly<Record<TimeAxisMode, string>> = Object.freeze({
    natal: 'Kerykeion natal baseline',
    'real-time': 'Current Kerykeion transit positions',
    kairotic: '4h activity perturbation reading'
});

export const M4TimeAxisSwitcherChip: React.FC<M4TimeAxisSwitcherChipProps> = props => {
    const { state, status = 'ready', errorMessage, onSelect } = props;
    const busy = status === 'persisting';

    return (
        <section
            className={`m4-time-axis-switcher ${privacyChromeClass('protected_local')}`}
            data-test="m4-time-axis-switcher"
            data-track="TRACK_08"
            data-export={M4_TIME_AXIS_SWITCHER_CHIP_EXPORT}
            data-view-id={TIME_AXIS_SWITCHER_VIEW_ID}
            data-mode={state.mode}
            data-status={status}
            data-session-key={state.sessionKey}
            data-foregrounded-handle={state.foregroundedHandle}
            data-privacy-class={state.privacyClass}
            aria-label="M4 time-axis switcher"
            style={{ minHeight: 28 }}
        >
            <div className="m4-time-axis-segmented" role="radiogroup" aria-label="Foregrounded quaternion reading">
                {TIME_AXIS_MODES.map(mode => (
                    <button
                        key={mode}
                        type="button"
                        role="radio"
                        className="m4-time-axis-option"
                        aria-checked={state.mode === mode}
                        aria-label={MODE_DESCRIPTIONS[mode]}
                        data-test="m4-time-axis-option"
                        data-mode={mode}
                        data-selected={state.mode === mode ? 'true' : 'false'}
                        disabled={busy}
                        title={MODE_DESCRIPTIONS[mode]}
                        onClick={() => onSelect(mode)}
                    >
                        {MODE_LABELS[mode]}
                    </button>
                ))}
            </div>
            <span className="m4-time-axis-privacy mext-privacy-protected-local" data-test="m4-time-axis-privacy">
                protected-local
            </span>
            {errorMessage ? (
                <span className="m4-time-axis-error" data-test="m4-time-axis-error">
                    {errorMessage}
                </span>
            ) : null}
        </section>
    );
};

@injectable()
export class TimeAxisSwitcherWidget extends ReactWidget {
    static readonly ID = TIME_AXIS_SWITCHER_VIEW_ID;
    static readonly LABEL = TIME_AXIS_SWITCHER_LABEL;

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected mode: TimeAxisMode = DEFAULT_TIME_AXIS_MODE;
    protected status: TimeAxisStatus = 'ready';
    protected errorMessage: string | null = null;
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = TimeAxisSwitcherWidget.ID;
        this.title.label = TimeAxisSwitcherWidget.LABEL;
        this.title.caption = SURFACE_PRIVACY_TOOLTIP;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.addClass('m4-nara-time-axis-switcher');
        this.addClass(privacyChromeClass('protected_local'));

        this.subscriptions.push(
            this.bridge.onProfile(profile => {
                this.profile = profile;
                this.mode = readProfileTimeAxisMode(profile) ?? this.mode;
                this.update();
                this.publishForeground();
            })
        );
        this.subscriptions.push(
            this.bridge.onCoordinateContext(context => {
                this.context = context;
                this.update();
            })
        );
        this.subscriptions.push(
            this.bridge.onObservabilityEvent(event => this.handleGatewayEvent(event))
        );
    }

    override dispose(): void {
        for (const sub of this.subscriptions) {
            try {
                sub.dispose();
            } catch {
                // best-effort
            }
        }
        super.dispose();
    }

    cycleMode(): void {
        void this.persistMode(cycleTimeAxisMode(this.mode));
    }

    protected override render(): React.ReactNode {
        return (
            <div
                className={`mext-widget-root ${privacyChromeClass('protected_local')}`}
                data-test="m4-time-axis-switcher-root"
            >
                <M4TimeAxisSwitcherChip
                    state={this.currentState()}
                    status={this.status}
                    errorMessage={this.errorMessage}
                    onSelect={mode => void this.persistMode(mode)}
                />
            </div>
        );
    }

    protected async persistMode(mode: TimeAxisMode): Promise<void> {
        const previousMode = this.mode;
        this.mode = mode;
        this.status = 'persisting';
        this.errorMessage = null;
        this.update();
        this.publishForeground();

        try {
            const persisted = await persistTimeAxisMode(this.bridge, this.currentSessionKey(), mode);
            this.mode = persisted.mode;
            this.status = 'ready';
            this.errorMessage = null;
        } catch (error) {
            this.mode = previousMode;
            this.status = 'error';
            this.errorMessage = error instanceof Error ? error.message : String(error);
        }
        this.update();
        this.publishForeground();
    }

    protected handleGatewayEvent(event: MObservabilityEvent): void {
        const next = reduceTimeAxisModeFromGatewayEvent(this.mode, event, this.currentSessionKey());
        if (next !== this.mode) {
            this.mode = next;
            this.status = 'ready';
            this.errorMessage = null;
            this.update();
            this.publishForeground();
        }
    }

    protected currentState(): TimeAxisState {
        return buildTimeAxisState({
            sessionKey: this.currentSessionKey(),
            mode: this.mode,
            handles: handlesFromProfile(this.profile, this.context)
        });
    }

    protected currentSessionKey(): string {
        return sessionKeyFromContext(this.context);
    }

    protected publishForeground(): void {
        this.bridge.publish({
            type: TIME_AXIS_FOREGROUND_EVENT_TYPE,
            extensionId: EXTENSION_ID,
            emittedAt: Date.now(),
            payload: buildRendererForegroundPayload(this.currentState())
        });
    }
}

@injectable()
export class M4TimeAxisSwitcherContribution
    extends AbstractViewContribution<TimeAxisSwitcherWidget>
    implements CommandContribution, FrontendApplicationContribution, KeybindingContribution
{
    constructor() {
        super({
            widgetId: TimeAxisSwitcherWidget.ID,
            widgetName: TimeAxisSwitcherWidget.LABEL,
            defaultWidgetOptions: { area: 'top' },
            toggleCommandId: TIME_AXIS_SWITCHER_OPEN_COMMAND_ID,
            toggleKeybinding: TIME_AXIS_SWITCHER_KEYBINDING
        });
    }

    async onStart(): Promise<void> {
        // Registered without auto-opening; layout composition or keybinding opens it.
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(
            { id: TIME_AXIS_SWITCHER_OPEN_COMMAND_ID, label: `${EXTENSION_ID}: open time-axis switcher` },
            { execute: () => this.openView({ activate: true, reveal: true }) }
        );
        commands.registerCommand(
            { id: TIME_AXIS_SWITCHER_COMMAND_ID, label: `${EXTENSION_ID}: cycle time-axis mode` },
            {
                execute: async () => {
                    const widget = await this.openView({ activate: false, reveal: true });
                    widget.cycleMode();
                }
            }
        );
    }

    override registerKeybindings(keybindings: KeybindingRegistry): void {
        super.registerKeybindings(keybindings);
        keybindings.registerKeybinding({
            command: TIME_AXIS_SWITCHER_COMMAND_ID,
            keybinding: TIME_AXIS_SWITCHER_KEYBINDING
        });
    }
}

export function cycleTimeAxisMode(mode: TimeAxisMode): TimeAxisMode {
    const index = TIME_AXIS_MODES.indexOf(mode);
    return TIME_AXIS_MODES[(index + 1) % TIME_AXIS_MODES.length] ?? DEFAULT_TIME_AXIS_MODE;
}

export function foregroundHandleForTimeAxis(mode: TimeAxisMode, handles: TimeAxisHandles): string {
    if (mode === 'natal') {
        return handles.qIdentityHandle;
    }
    if (mode === 'kairotic') {
        return handles.qActivityHandle;
    }
    return handles.qTransitHandle;
}

export function buildTimeAxisState(input: {
    readonly sessionKey: string;
    readonly mode?: TimeAxisMode | string | null;
    readonly handles: TimeAxisHandles;
}): TimeAxisState {
    const mode = normalizeTimeAxisMode(input.mode) ?? DEFAULT_TIME_AXIS_MODE;
    return Object.freeze({
        sessionKey: input.sessionKey,
        mode,
        foregroundedHandle: foregroundHandleForTimeAxis(mode, input.handles),
        handles: Object.freeze({ ...input.handles }),
        privacyClass: 'protected_local' as const
    });
}

export async function persistTimeAxisMode(
    bridge: GatewayBridge,
    sessionKey: string,
    mode: TimeAxisMode
): Promise<TimeAxisState> {
    const persisted = await bridge.invokeGatewayRpc(TIME_AXIS_SET_METHOD, { sessionKey, mode });
    return buildTimeAxisState({
        sessionKey: stringValue(objectRecord(persisted)?.sessionKey, sessionKey),
        mode: normalizeTimeAxisMode(objectRecord(persisted)?.mode) ?? mode,
        handles: fallbackHandles(sessionKey)
    });
}

export function buildRendererForegroundPayload(state: TimeAxisState): Readonly<Record<string, unknown>> {
    return Object.freeze({
        sessionKey: state.sessionKey,
        mode: state.mode,
        foregroundedHandle: state.foregroundedHandle,
        foregroundedHandleKind: foregroundHandleKind(state.mode),
        privacyClass: state.privacyClass,
        sourceViewId: TIME_AXIS_SWITCHER_VIEW_ID
    });
}

export function reduceTimeAxisModeFromGatewayEvent(
    current: TimeAxisMode,
    event: Pick<MObservabilityEvent, 'type' | 'payload'>,
    sessionKey?: string
): TimeAxisMode {
    const payload = objectRecord(event.payload);
    if (!payload) {
        return current;
    }
    if (sessionKey && typeof payload.sessionKey === 'string' && payload.sessionKey !== sessionKey) {
        return current;
    }
    if (isSenseOverrideEvent(event.type, payload)) {
        return timeAxisModeAfterSenseOverride(current, payload.senseOverride);
    }
    if (!isTimeAxisEvent(event.type, payload)) {
        return current;
    }
    return normalizeTimeAxisMode(payload.mode ?? payload.timeAxisMode) ?? current;
}

export function timeAxisModeAfterSenseOverride(current: TimeAxisMode, _senseOverride: unknown): TimeAxisMode {
    return current;
}

export function normalizeTimeAxisMode(value: unknown): TimeAxisMode | null {
    return TIME_AXIS_MODES.includes(value as TimeAxisMode) ? value as TimeAxisMode : null;
}

export function handlesFromProfile(
    profile: MathemeHarmonicProfileBoundary | null,
    context: CoordinateContext = EMPTY_COORDINATE_CONTEXT
): TimeAxisHandles {
    return Object.freeze({
        qIdentityHandle:
            profileString(profile, ['qIdentityHandle', 'Q_identity.handle', 'protectedPersonalFieldHandles.qIdentityHandle']) ??
            fallbackHandle('identity', context),
        qTransitHandle:
            profileString(profile, ['qTransitHandle', 'Q_transit.handle', 'protectedPersonalFieldHandles.qTransitHandle']) ??
            fallbackHandle('transit', context),
        qActivityHandle:
            profileString(profile, ['qActivityHandle', 'Q_activity.handle', 'protectedPersonalFieldHandles.qActivityHandle']) ??
            fallbackHandle('activity', context)
    });
}

function isTimeAxisEvent(type: string, payload: Readonly<Record<string, unknown>>): boolean {
    const kind = typeof payload.kind === 'string' ? payload.kind : '';
    return type === TIME_AXIS_SET_METHOD ||
        type === 'nara.session.time_axis.changed' ||
        type === 'nara.session.timeAxis.changed' ||
        kind === TIME_AXIS_SET_METHOD ||
        kind === 'nara.session.time_axis.changed' ||
        kind === 'nara.session.timeAxis.changed';
}

function isSenseOverrideEvent(type: string, payload: Readonly<Record<string, unknown>>): boolean {
    const kind = typeof payload.kind === 'string' ? payload.kind : '';
    return type === 'nara.tuning.sense_override.changed' ||
        type === 'nara.tuning.senseOverride.changed' ||
        kind === 'nara.tuning.sense_override.changed' ||
        kind === 'nara.tuning.senseOverride.changed' ||
        'senseOverride' in payload;
}

function foregroundHandleKind(mode: TimeAxisMode): keyof TimeAxisHandles {
    if (mode === 'natal') {
        return 'qIdentityHandle';
    }
    if (mode === 'kairotic') {
        return 'qActivityHandle';
    }
    return 'qTransitHandle';
}

function readProfileTimeAxisMode(profile: MathemeHarmonicProfileBoundary | null): TimeAxisMode | null {
    return normalizeTimeAxisMode(profileString(profile, [
        'timeAxisMode',
        'session.timeAxisMode',
        'naraSession.timeAxisMode',
        'm4TimeAxis.mode'
    ]));
}

function sessionKeyFromContext(context: CoordinateContext): string {
    if (typeof context.dayNowSessionHandle === 'string' && context.dayNowSessionHandle.trim() !== '') {
        return context.dayNowSessionHandle;
    }
    const generation = context.profileGeneration ?? 'default';
    return `m4-nara:session:${generation}`;
}

function fallbackHandles(sessionKeyOrKind: string | CoordinateContext): TimeAxisHandles {
    if (typeof sessionKeyOrKind === 'string') {
        return Object.freeze({
            qIdentityHandle: fallbackHandleForSession('identity', sessionKeyOrKind),
            qTransitHandle: fallbackHandleForSession('transit', sessionKeyOrKind),
            qActivityHandle: fallbackHandleForSession('activity', sessionKeyOrKind)
        });
    }
    const context = sessionKeyOrKind;
    return Object.freeze({
        qIdentityHandle: fallbackHandle('identity', context),
        qTransitHandle: fallbackHandle('transit', context),
        qActivityHandle: fallbackHandle('activity', context)
    });
}

function fallbackHandle(kind: 'identity' | 'transit' | 'activity', context: CoordinateContext): string {
    return fallbackHandleForSession(kind, sessionKeyFromContext(context));
}

function fallbackHandleForSession(kind: 'identity' | 'transit' | 'activity', sessionKey: string): string {
    const session = sessionKey.replace(/[^A-Za-z0-9_.:-]/g, '_');
    return `m4://protected-local/time-axis/${kind}/${session}`;
}

function profileString(profile: MathemeHarmonicProfileBoundary | null, dottedNames: readonly string[]): string | null {
    if (!profile) {
        return null;
    }
    for (const dotted of dottedNames) {
        let current: unknown = profile.payload;
        for (const segment of dotted.split('.')) {
            if (!current || typeof current !== 'object' || Array.isArray(current) || !(segment in current)) {
                current = undefined;
                break;
            }
            current = (current as Record<string, unknown>)[segment];
        }
        if (typeof current === 'string' && current.trim() !== '') {
            return current;
        }
    }
    return null;
}

function objectRecord(value: unknown): Readonly<Record<string, unknown>> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return null;
    }
    return value as Readonly<Record<string, unknown>>;
}

function stringValue(value: unknown, fallback: string): string {
    return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}

// Keep the imported privacy constant load-bearing for package-level privacy audits.
void PRIVACY_CLASS;
