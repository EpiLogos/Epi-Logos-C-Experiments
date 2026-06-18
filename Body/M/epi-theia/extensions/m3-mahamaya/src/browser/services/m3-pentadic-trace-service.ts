import { inject, injectable } from '@theia/core/shared/inversify';
import { Emitter, Event } from '@theia/core/lib/common/event';
import {
    Disposable,
    MathemeHarmonicProfileBoundary,
    MExtensionReadinessSnapshot,
    PENDING_M_READINESS,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import {
    M3PentadicRelationModel,
    pentadicRelationModelFromProfilePayload
} from '../components/M3PentadicRelationInspector';

export const M3_PENTADIC_TRACE_SERVICE = Symbol('PratibimbaM3PentadicTraceService');

export interface M3PentadicTraceSnapshot {
    readonly profileGeneration: number | null;
    readonly model: M3PentadicRelationModel;
}

@injectable()
export class M3PentadicTraceService {
    protected readonly onDidChangeEmitter = new Emitter<M3PentadicTraceSnapshot>();
    readonly onDidChange: Event<M3PentadicTraceSnapshot> = this.onDidChangeEmitter.event;

    protected readonly subscriptions: Disposable[] = [];
    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected readiness: MExtensionReadinessSnapshot = PENDING_M_READINESS;

    constructor(
        @inject(SHARED_BRIDGE_ADAPTER)
        protected readonly bridge: Pick<SharedBridgeAdapter, 'onProfile' | 'onReadiness'>
    ) {
        this.subscriptions.push(
            this.bridge.onProfile(profile => {
                this.profile = profile;
                this.emitSnapshot();
            })
        );
        this.subscriptions.push(
            this.bridge.onReadiness(readiness => {
                this.readiness = readiness;
                this.emitSnapshot();
            })
        );
    }

    dispose(): void {
        for (const sub of this.subscriptions) {
            sub.dispose();
        }
        this.subscriptions.length = 0;
        this.onDidChangeEmitter.dispose();
    }

    snapshot(): M3PentadicTraceSnapshot {
        return Object.freeze({
            profileGeneration: this.profile?.generation ?? null,
            model: pentadicRelationModelFromProfilePayload(this.profile?.payload, this.readiness)
        });
    }

    protected emitSnapshot(): void {
        this.onDidChangeEmitter.fire(this.snapshot());
    }
}
