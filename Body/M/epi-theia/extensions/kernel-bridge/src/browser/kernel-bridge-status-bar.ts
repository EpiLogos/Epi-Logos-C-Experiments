import { injectable, inject } from '@theia/core/shared/inversify';
import { FrontendApplicationContribution, StatusBar, StatusBarAlignment } from '@theia/core/lib/browser';
import { Disposable } from '@theia/core/lib/common/disposable';
import {
    KernelBridgeCachedProfile,
    KernelBridgeConnectionStatus
} from '../common/types';
import {
    PratibimbaSessionStateService,
    SESSION_STATE_SERVICE
} from '@pratibimba/pratibimba-layouts';
import type { PratibimbaSessionState } from '@pratibimba/pratibimba-layouts';
import { KERNEL_BRIDGE_API, KernelBridgeAPI } from './kernel-bridge-api';

type StatusBarEntryKind =
    | 'profile-tick-state'
    | 'day-now-anchor'
    | 'session-id'
    | 'gateway-readiness'
    | 'profile-generation'
    | 'active-coordinate';

interface StatusBarEntryDescriptor {
    readonly kind: StatusBarEntryKind;
    readonly id: string;
    readonly priority: number;
}

interface StatusBarThreadState {
    readonly bridge: KernelBridgeConnectionStatus;
    readonly profile: KernelBridgeCachedProfile | null;
    readonly session: PratibimbaSessionState;
}

export const STATUS_BAR_ENTRIES: readonly StatusBarEntryDescriptor[] = Object.freeze([
    {
        kind: 'profile-tick-state',
        id: 'pratibimba.status.profileTickState',
        priority: 260
    },
    {
        kind: 'day-now-anchor',
        id: 'pratibimba.status.dayNowAnchor',
        priority: 250
    },
    {
        kind: 'session-id',
        id: 'pratibimba.status.sessionId',
        priority: 240
    },
    {
        kind: 'gateway-readiness',
        id: 'pratibimba.status.gatewayReadiness',
        priority: 230
    },
    {
        kind: 'profile-generation',
        id: 'pratibimba.status.profileGeneration',
        priority: 220
    },
    {
        kind: 'active-coordinate',
        id: 'pratibimba.status.activeCoordinate',
        priority: 210
    }
]);

@injectable()
export class KernelBridgeStatusBarContribution implements FrontendApplicationContribution {
    @inject(KERNEL_BRIDGE_API) protected readonly bridge!: KernelBridgeAPI;
    @inject(StatusBar) protected readonly statusBar!: StatusBar;
    @inject(SESSION_STATE_SERVICE)
    protected readonly sessionState!: PratibimbaSessionStateService;

    protected readonly subscriptions: Disposable[] = [];
    protected bridgeStatus: KernelBridgeConnectionStatus | undefined;
    protected profile: KernelBridgeCachedProfile | null | undefined;
    protected session: PratibimbaSessionState | undefined;

    async onStart(): Promise<void> {
        this.bridgeStatus = this.bridge.connectionStatus;
        this.profile = this.bridge.cachedProfile;
        this.session = this.sessionState.state;

        this.subscriptions.push(toDisposable(this.bridge.onConnectionChange(status => {
            this.bridgeStatus = status;
            this.render();
        })));
        this.subscriptions.push(toDisposable(this.bridge.onProfile(profile => {
            this.profile = profile;
            this.sessionState.setProfileGeneration(profile.generation);
            this.render();
        })));
        this.subscriptions.push(this.sessionState.onChange(session => {
            this.session = session;
            this.render();
        }));

        this.render();
    }

    onStop(): void {
        while (this.subscriptions.length > 0) {
            this.subscriptions.pop()?.dispose();
        }
        for (const entry of STATUS_BAR_ENTRIES) {
            this.statusBar.removeElement(entry.id);
        }
    }

    protected render(): void {
        const state: StatusBarThreadState = {
            bridge: this.bridgeStatus ?? this.bridge.connectionStatus,
            profile: this.profile ?? this.bridge.cachedProfile,
            session: this.session ?? this.sessionState.state
        };

        for (const entry of STATUS_BAR_ENTRIES) {
            this.statusBar.setElement(entry.id, statusBarEntry(entry, state));
        }
    }
}

function statusBarEntry(entry: StatusBarEntryDescriptor, state: StatusBarThreadState) {
    const profileGeneration = state.profile?.generation ??
        state.session.profileGeneration ??
        state.bridge.profileGeneration;
    const dayNowAnchor = normaliseDayNowAnchor(state.session.dayNow);
    const sessionId = state.session.sessionKey;
    const coordinate = state.session.selectedCoordinate;

    switch (entry.kind) {
        case 'profile-tick-state': {
            const tick = state.profile
                ? state.profile.stale ? 'stale' : 'live'
                : 'pending';
            return {
                text: `${tickIcon(tick)} profile-tick: ${tick}`,
                tooltip: `Profile tick state: ${tick}`,
                alignment: StatusBarAlignment.LEFT,
                priority: entry.priority
            };
        }
        case 'day-now-anchor':
            return {
                text: `$(calendar) day-now: ${compact(dayNowAnchor)}`,
                tooltip: `Day-now anchor: ${dayNowAnchor ?? 'pending'}`,
                alignment: StatusBarAlignment.LEFT,
                priority: entry.priority
            };
        case 'session-id':
            return {
                text: `$(key) session: ${compact(sessionId)}`,
                tooltip: `Session id: ${sessionId ?? 'pending'}`,
                alignment: StatusBarAlignment.LEFT,
                priority: entry.priority
            };
        case 'gateway-readiness':
            return {
                text: `${iconForState(state.bridge)} gateway: ${state.bridge.state}`,
                tooltip: `Gateway readiness: ${state.bridge.reason}\nmode: ${state.bridge.mode}`,
                alignment: StatusBarAlignment.LEFT,
                priority: entry.priority
            };
        case 'profile-generation':
            return {
                text: `$(versions) profile: ${profileGeneration === null ? 'pending' : `gen ${profileGeneration}`}`,
                tooltip: `Profile generation: ${profileGeneration ?? 'pending'}`,
                alignment: StatusBarAlignment.LEFT,
                priority: entry.priority
            };
        case 'active-coordinate':
            return {
                text: `$(symbol-namespace) coordinate: ${compact(coordinate)}`,
                tooltip: `Active coordinate: ${coordinate ?? 'pending'}`,
                alignment: StatusBarAlignment.LEFT,
                priority: entry.priority
            };
    }
}

export function normaliseDayNowAnchor(dayNow: string | null): string | null {
    if (!dayNow) {
        return null;
    }

    const presentPath = dayNow.match(/Idea\/Empty\/Present\/([^/\s]+)\//);
    if (presentPath) {
        const [, dayId] = presentPath;
        return `Idea/Empty/Present/${dayId}/`;
    }

    const dayId = dayNow.match(/\b(\d{2}-\d{2}-\d{4})\b/);
    if (dayId) {
        return `Idea/Empty/Present/${dayId[1]}/`;
    }

    const isoDay = dayNow.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
    if (isoDay) {
        const [, year, month, day] = isoDay;
        return `Idea/Empty/Present/${day}-${month}-${year}/`;
    }

    return dayNow;
}

function iconForState(status: KernelBridgeConnectionStatus): string {
    switch (status.state) {
        case 'connected':
        case 'resynced':
            return '$(check)';
        case 'connecting':
        case 'reconnecting':
            return '$(sync~spin)';
        case 'degraded':
        case 'pending_lut':
            return '$(warning)';
        case 'protocol_mismatch':
        case 'private_blocked':
            return '$(error)';
        case 'disconnected':
        default:
            return '$(circle-slash)';
    }
}

function tickIcon(tick: 'live' | 'stale' | 'pending'): string {
    switch (tick) {
        case 'live':
            return '$(pulse)';
        case 'stale':
            return '$(history)';
        case 'pending':
        default:
            return '$(circle-large-outline)';
    }
}

function compact(value: string | null, max = 34): string {
    if (!value) {
        return 'pending';
    }
    return value.length > max ? `${value.slice(0, max - 3)}...` : value;
}

function toDisposable(dispose: () => void): Disposable {
    return { dispose };
}
