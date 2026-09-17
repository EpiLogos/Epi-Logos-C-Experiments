import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { Disposable } from '@theia/core/lib/common/disposable';
import { Emitter, Event } from '@theia/core/lib/common/event';
import { PreferenceService } from '@theia/core/lib/browser/preferences';
import {
    SHARED_BRIDGE_ADAPTER,
    SharedBridgeAdapter,
    type MathemeHarmonicProfileBoundary,
    type MExtensionReadinessSnapshot
} from '@pratibimba/m-extension-runtime';
import {
    DAILY_0_1_DESCRIPTOR,
    PRATIBIMBA_LAYOUT_DAILY_0_1,
    PRATIBIMBA_LAYOUT_IDE_DEEP
} from '@pratibimba/pratibimba-layouts';
import {
    activateOmniPanelTab,
    collapseOmniPanelManifest,
    createOmniPanelState,
    deactivateOmniPanelTab,
    toggleOmniPanelCollapse
} from '../../common/omnipanel-runtime';
import type {
    OmniPanelLayoutId,
    OmniPanelManifest,
    OmniPanelProfileTickEvent,
    OmniPanelProfileTickListener,
    OmniPanelState
} from '../../common/omnipanel-types';
import { OMNIPANEL_TABS } from '../../common/omnipanel-types';

export const OMNIPANEL_RUNTIME_SERVICE = Symbol('PratibimbaOmniPanelRuntimeService');

export interface OmniPanelProfileTickSubscriberTelemetry {
    readonly subscriberId: string;
    readonly lastProcessedAt: number | null;
    readonly lastGeneration: number | null;
}

export interface OmniPanelProfileTickTelemetry {
    readonly subscriberCount: number;
    readonly tickHistory: readonly OmniPanelProfileTickEvent[];
    readonly lastTickProcessedAt: number | null;
    readonly laggingSubscribers: readonly {
        readonly subscriberId: string;
        readonly lagMs: number;
    }[];
}

@injectable()
export class OmniPanelRuntimeService {
    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    @inject(PreferenceService)
    protected readonly preferences!: PreferenceService;

    protected manifest: OmniPanelManifest = collapseOmniPanelManifest();
    protected _state: OmniPanelState = createOmniPanelState(this.manifest);
    protected bridgeProfileSubscription: { dispose(): void } | null = null;
    protected bridgeReadinessSubscription: { dispose(): void } | null = null;
    protected preferenceSubscription: { dispose(): void } | null = null;

    protected readonly onDidChangeStateEmitter = new Emitter<OmniPanelState>();
    readonly onDidChangeState: Event<OmniPanelState> = this.onDidChangeStateEmitter.event;

    protected readonly profileTickEmitter = new Emitter<OmniPanelProfileTickEvent>();
    readonly onProfileTick: Event<OmniPanelProfileTickEvent> = this.profileTickEmitter.event;

    protected readonly readinessEmitter = new Emitter<MExtensionReadinessSnapshot>();
    readonly onReadiness: Event<MExtensionReadinessSnapshot> = this.readinessEmitter.event;

    protected currentProfileTick: OmniPanelProfileTickEvent = this.createProfileTick(null, false);
    protected currentReadiness: MExtensionReadinessSnapshot | null = null;
    protected profileTickHistory: OmniPanelProfileTickEvent[] = [];
    protected profileTickSubscriberSequence = 0;
    protected profileTickSubscribers = new Map<number, OmniPanelProfileTickSubscriberTelemetry>();

    @postConstruct()
    protected init(): void {
        this.refreshManifestFromActiveLayout();
        this.preferenceSubscription = this.preferences.onPreferenceChanged(change => {
            if (change.preferenceName === DAILY_0_1_DESCRIPTOR.preferenceKey) {
                this.refreshManifestFromActiveLayout();
            }
        });
        const snapshot = this.bridge.currentSnapshot();
        this.currentProfileTick = this.createProfileTick(snapshot.profile, false);
        this.currentReadiness = snapshot.readiness;
        this.bridgeProfileSubscription = this.bridge.onProfile(profile => this.acceptProfileTick(profile));
        this.bridgeReadinessSubscription = this.bridge.onReadiness(readiness => this.acceptReadiness(readiness));
    }

    get state(): OmniPanelState {
        return this._state;
    }

    getManifest(): OmniPanelManifest {
        return this.manifest;
    }

    activateTab(tabId: string): OmniPanelState {
        this._state = activateOmniPanelTab(this._state, this.manifest, tabId);
        this.onDidChangeStateEmitter.fire(this._state);
        return this._state;
    }

    deactivateTab(): OmniPanelState {
        this._state = deactivateOmniPanelTab(this._state, this.manifest);
        this.onDidChangeStateEmitter.fire(this._state);
        return this._state;
    }

    toggleCollapse(): OmniPanelState {
        this._state = toggleOmniPanelCollapse(this._state);
        this.onDidChangeStateEmitter.fire(this._state);
        return this._state;
    }

    getCurrentProfileTick(): OmniPanelProfileTickEvent {
        return this.currentProfileTick;
    }

    useProfileTick(listener: OmniPanelProfileTickListener): Disposable {
        const subscriberKey = ++this.profileTickSubscriberSequence;
        const subscriberId = `omnipanel-profile-subscriber-${subscriberKey}`;
        this.profileTickSubscribers.set(subscriberKey, {
            subscriberId,
            lastProcessedAt: null,
            lastGeneration: null
        });
        const wrapped = (event: OmniPanelProfileTickEvent) => {
            listener(event);
            this.profileTickSubscribers.set(subscriberKey, {
                subscriberId,
                lastProcessedAt: Date.now(),
                lastGeneration: event.generation
            });
        };
        const subscription = this.onProfileTick(wrapped);
        wrapped(this.currentProfileTick);
        return {
            dispose: () => {
                subscription.dispose();
                this.profileTickSubscribers.delete(subscriberKey);
            }
        };
    }

    getProfileTickTelemetry(): OmniPanelProfileTickTelemetry {
        const subscribers = [...this.profileTickSubscribers.values()];
        const lastTickProcessedAt = subscribers.reduce<number | null>((latest, subscriber) => {
            if (subscriber.lastProcessedAt === null) {
                return latest;
            }
            return latest === null ? subscriber.lastProcessedAt : Math.max(latest, subscriber.lastProcessedAt);
        }, null);
        const now = Date.now();
        return Object.freeze({
            subscriberCount: subscribers.length,
            tickHistory: Object.freeze([...this.profileTickHistory].slice(-12)),
            lastTickProcessedAt,
            laggingSubscribers: Object.freeze(
                subscribers
                    .filter(subscriber => (
                        this.currentProfileTick.generation !== null &&
                        subscriber.lastGeneration !== this.currentProfileTick.generation
                    ))
                    .map(subscriber => Object.freeze({
                        subscriberId: subscriber.subscriberId,
                        lagMs: subscriber.lastProcessedAt === null ? 0 : Math.max(0, now - subscriber.lastProcessedAt)
                    }))
            )
        });
    }

    getCurrentReadiness(): MExtensionReadinessSnapshot | null {
        return this.currentReadiness;
    }

    useReadiness(listener: (snapshot: MExtensionReadinessSnapshot) => void): Disposable {
        const subscription = this.onReadiness(listener);
        if (this.currentReadiness) {
            listener(this.currentReadiness);
        }
        return subscription;
    }

    invokeGatewayRpc(method: string, params: Record<string, unknown>): Promise<unknown> {
        return this.bridge.invokeGatewayRpc(method, params);
    }

    dispose(): void {
        this.bridgeProfileSubscription?.dispose();
        this.bridgeProfileSubscription = null;
        this.bridgeReadinessSubscription?.dispose();
        this.bridgeReadinessSubscription = null;
        this.preferenceSubscription?.dispose();
        this.preferenceSubscription = null;
        this.onDidChangeStateEmitter.dispose();
        this.profileTickEmitter.dispose();
        this.readinessEmitter.dispose();
    }

    protected refreshManifestFromActiveLayout(): void {
        const activeLayout = this.activeLayoutPreference();
        this.manifest = collapseOmniPanelManifest(OMNIPANEL_TABS, this._state.activeTab, activeLayout);
        this._state = createOmniPanelState(this.manifest, this._state);
        this.onDidChangeStateEmitter.fire(this._state);
    }

    protected activeLayoutPreference(): OmniPanelLayoutId {
        const stored = this.preferences.get<string>(DAILY_0_1_DESCRIPTOR.preferenceKey);
        return stored === PRATIBIMBA_LAYOUT_IDE_DEEP
            ? PRATIBIMBA_LAYOUT_IDE_DEEP
            : PRATIBIMBA_LAYOUT_DAILY_0_1;
    }

    protected acceptProfileTick(profile: MathemeHarmonicProfileBoundary | null): void {
        const nextGeneration = profile?.generation ?? null;
        const advanced = this.currentProfileTick.generation !== nextGeneration;
        this.currentProfileTick = this.createProfileTick(profile, advanced);
        this.profileTickHistory = [...this.profileTickHistory, this.currentProfileTick].slice(-12);
        this.profileTickEmitter.fire(this.currentProfileTick);
    }

    protected acceptReadiness(snapshot: MExtensionReadinessSnapshot): void {
        this.currentReadiness = snapshot;
        this.readinessEmitter.fire(snapshot);
    }

    protected createProfileTick(
        profile: MathemeHarmonicProfileBoundary | null,
        advanced: boolean
    ): OmniPanelProfileTickEvent {
        return Object.freeze({
            generation: profile?.generation ?? null,
            profile,
            advanced,
            emittedAt: Date.now()
        });
    }
}
