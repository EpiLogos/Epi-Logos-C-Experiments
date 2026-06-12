import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { Disposable } from '@theia/core/lib/common/disposable';
import { Emitter, Event } from '@theia/core/lib/common/event';
import {
    SHARED_BRIDGE_ADAPTER,
    SharedBridgeAdapter,
    type MathemeHarmonicProfileBoundary
} from '@pratibimba/m-extension-runtime';
import {
    activateOmniPanelTab,
    collapseOmniPanelManifest,
    createOmniPanelState,
    deactivateOmniPanelTab,
    toggleOmniPanelCollapse
} from '../../common/omnipanel-runtime';
import type {
    OmniPanelManifest,
    OmniPanelProfileTickEvent,
    OmniPanelProfileTickListener,
    OmniPanelState
} from '../../common/omnipanel-types';

export const OMNIPANEL_RUNTIME_SERVICE = Symbol('PratibimbaOmniPanelRuntimeService');

@injectable()
export class OmniPanelRuntimeService {
    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected readonly manifest: OmniPanelManifest = collapseOmniPanelManifest();
    protected _state: OmniPanelState = createOmniPanelState(this.manifest);
    protected bridgeProfileSubscription: { dispose(): void } | null = null;

    protected readonly onDidChangeStateEmitter = new Emitter<OmniPanelState>();
    readonly onDidChangeState: Event<OmniPanelState> = this.onDidChangeStateEmitter.event;

    protected readonly profileTickEmitter = new Emitter<OmniPanelProfileTickEvent>();
    readonly onProfileTick: Event<OmniPanelProfileTickEvent> = this.profileTickEmitter.event;

    protected currentProfileTick: OmniPanelProfileTickEvent = this.createProfileTick(null, false);

    @postConstruct()
    protected init(): void {
        const snapshot = this.bridge.currentSnapshot();
        this.currentProfileTick = this.createProfileTick(snapshot.profile, false);
        this.bridgeProfileSubscription = this.bridge.onProfile(profile => this.acceptProfileTick(profile));
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
        const subscription = this.onProfileTick(listener);
        listener(this.currentProfileTick);
        return subscription;
    }

    dispose(): void {
        this.bridgeProfileSubscription?.dispose();
        this.bridgeProfileSubscription = null;
        this.onDidChangeStateEmitter.dispose();
        this.profileTickEmitter.dispose();
    }

    protected acceptProfileTick(profile: MathemeHarmonicProfileBoundary | null): void {
        const nextGeneration = profile?.generation ?? null;
        const advanced = this.currentProfileTick.generation !== nextGeneration;
        this.currentProfileTick = this.createProfileTick(profile, advanced);
        this.profileTickEmitter.fire(this.currentProfileTick);
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
