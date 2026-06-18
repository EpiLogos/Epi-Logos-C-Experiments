import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import { Disposable } from '@theia/core/lib/common/disposable';
import {
    SHARED_BRIDGE_ADAPTER,
    type SharedBridgeAdapter
} from '@pratibimba/m-extension-runtime';
import {
    CROSS_LAYOUT_INTENT_TELEMETRY_EVENT,
    type CrossLayoutIntent,
    type CrossLayoutIntentTelemetry
} from '@pratibimba/pratibimba-layouts/lib/common/cross-layout-intent';
import type { OmniPanelWidget } from '../omnipanel-widget';
import {
    OMNIPANEL_RUNTIME_SERVICE,
    type OmniPanelRuntimeService
} from './omnipanel-runtime-service';
import type { OmniPanelTabId } from '../../common/omnipanel-types';

export const OMNIPANEL_INTENT_ROUTER = Symbol('PratibimbaOmniPanelIntentRouter');
export const OMNIPANEL_WIDGET_ID_TOKEN = Symbol('PratibimbaOmniPanelWidgetIdResolver');
export const OMNIPANEL_ROUTING_EVENT = 'pratibimba:omnipanel-routing';

export type OmniPanelRoutingPayload = Record<string, unknown>;
export type OmniPanelRoutingResolver = (intent: CrossLayoutIntent) => OmniPanelRoutingResult;

export interface OmniPanelRoutingResult {
    readonly activateTab: OmniPanelTabId;
    readonly perTabPayload: OmniPanelRoutingPayload;
    readonly shouldRevealOmniPanel: boolean;
}

export interface OmniPanelRoutingEventDetail {
    readonly intent: CrossLayoutIntent;
    readonly routeKey: string;
    readonly result: OmniPanelRoutingResult;
    readonly perTabState: OmniPanelRoutingPayload;
}

interface OmniPanelWidgetRecord {
    omniState?: 'hidden' | 'minimal' | 'minimized' | 'normal' | 'fullscreen';
    update?: () => void;
}

type GlobalEventTarget = typeof globalThis & {
    addEventListener?: (type: string, listener: EventListener) => void;
    removeEventListener?: (type: string, listener: EventListener) => void;
    dispatchEvent?: (event: Event) => boolean;
    CustomEvent?: typeof CustomEvent;
};

export function omniPanelIntentRouteKey(intent: CrossLayoutIntent): string | null {
    if (!intent.requestedExtensionId || !intent.requestedContributionId) {
        return null;
    }
    return `${intent.requestedExtensionId}/${intent.requestedContributionId}`;
}

export const resolveDispatchTraceRoute: OmniPanelRoutingResolver = intent => routeTo('dispatch-trace', {
    selectedRunId: firstString(intent.artifactUri, intent.coordinate, intent.sessionKey),
    selectedDispatchNodeId: firstString(intent.coordinate, intent.artifactUri),
    sessionKey: intent.sessionKey,
    coordinate: intent.coordinate,
    profileGeneration: intent.profileGeneration,
    reason: intent.reason ?? null
});

export const resolveDispatchTraceRouteForCrystallisation: OmniPanelRoutingResolver = intent => routeTo(
    'dispatch-trace',
    {
        ...resolveDispatchTraceRoute(intent).perTabPayload,
        crystallisationMode: true,
        selectedCrystallisationId: firstString(intent.artifactUri, intent.coordinate, intent.sessionKey)
    }
);

export const resolveEvidenceRoute: OmniPanelRoutingResolver = intent => routeTo('evidence', {
    selectedPacketId: firstString(intent.artifactUri, intent.reviewId, intent.coordinate),
    selectedReviewId: intent.reviewId,
    dispatchNodeId: intent.coordinate,
    sessionKey: intent.sessionKey,
    privacyClass: intent.privacyClass,
    profileGeneration: intent.profileGeneration
});

export const resolveEvidenceRouteForWitness: OmniPanelRoutingResolver = intent => routeTo('evidence', {
    ...resolveEvidenceRoute(intent).perTabPayload,
    selectedWitnessId: firstString(intent.artifactUri, intent.coordinate),
    evidenceKind: 'witness'
});

export const resolveEvidenceRouteForContemplationObject: OmniPanelRoutingResolver = intent => routeTo('evidence', {
    ...resolveEvidenceRoute(intent).perTabPayload,
    selectedContemplationObjectId: firstString(intent.artifactUri, intent.coordinate),
    evidenceKind: 'contemplation-object'
});

export const resolveReviewRoute: OmniPanelRoutingResolver = intent => routeTo('review', {
    selectedReviewId: firstString(intent.reviewId, intent.artifactUri, intent.coordinate),
    selectedPacketId: firstString(intent.artifactUri, intent.coordinate),
    sessionKey: intent.sessionKey,
    privacyClass: intent.privacyClass,
    profileGeneration: intent.profileGeneration
});

export const resolveToolStreamRoute: OmniPanelRoutingResolver = intent => routeTo('tool-stream', {
    selectedEventId: firstString(intent.artifactUri, intent.coordinate),
    dispatchNodeId: firstString(intent.coordinate, intent.artifactUri),
    sessionKey: intent.sessionKey,
    privacyClass: intent.privacyClass,
    live: false
});

export const resolveGatewayRoute: OmniPanelRoutingResolver = intent => routeTo('gateway', {
    activeSubView: 'capabilities',
    selectedCapabilityName: firstString(intent.artifactUri, intent.coordinate),
    selectedBlockerId: firstString(intent.reviewId, intent.artifactUri, intent.coordinate),
    sessionKey: intent.sessionKey,
    privacyClass: intent.privacyClass
});

export const resolveDiagnosticsRoute: OmniPanelRoutingResolver = intent => routeTo('diagnostics', {
    activeSubSection: 'kernel-bridge',
    selectedReadinessId: firstString(intent.artifactUri, intent.coordinate, 'bridge-readiness'),
    sessionKey: intent.sessionKey,
    profileGeneration: intent.profileGeneration
});

export const resolveSessionsRoute: OmniPanelRoutingResolver = intent => routeTo('sessions', {
    selectedSessionId: intent.sessionKey,
    selectedMarkId: firstString(intent.artifactUri, intent.coordinate),
    coordinate: intent.coordinate,
    dayNow: intent.dayNow,
    privacyClass: intent.privacyClass
});

@injectable()
export class OmniPanelIntentRouter {
    private readonly customRoutes = new Map<string, OmniPanelRoutingResolver>();
    private readonly perTabState = new Map<OmniPanelTabId, OmniPanelRoutingPayload>();
    private eventSubscription: Disposable | null = null;

    private readonly defaultRoutes: ReadonlyMap<string, OmniPanelRoutingResolver> = new Map([
        ['ide-shell-m0-m5/agentic-control-room.select-run', resolveDispatchTraceRoute],
        ['ide-shell-m0-m5/evidence-pane.select-packet', resolveEvidenceRoute],
        ['ide-shell-m0-m5/review-pane.select-review', resolveReviewRoute],
        ['ide-shell-m0-m5/logos-atelier.invoke-aletheia', resolveDispatchTraceRouteForCrystallisation],
        ['m0-anuttara/verifier.open-witness', resolveEvidenceRouteForWitness],
        ['m4-nara/highlight-service.inscribe-agent-mark', resolveSessionsRoute],
        ['m5-epii/contemplation-object-viewer.open', resolveEvidenceRouteForContemplationObject],
        ['omnipanel-shell/dispatch-trace.open-evidence', resolveEvidenceRoute],
        ['omnipanel-shell/dispatch-trace.open-tool-stream', resolveToolStreamRoute],
        ['omnipanel-shell/tool-stream.open-dispatch-trace', resolveDispatchTraceRoute],
        ['omnipanel-shell/evidence.open-review', resolveReviewRoute],
        ['omnipanel-shell/review.open-gateway-blocker', resolveGatewayRoute],
        ['omnipanel-shell/gateway.open-bridge-readiness', resolveDiagnosticsRoute],
        ['omnipanel-shell/pi-chat.dispatch-emitted', resolveDispatchTraceRoute]
    ]);

    constructor(
        @inject(SHARED_BRIDGE_ADAPTER) private readonly bridge: SharedBridgeAdapter,
        @inject(OMNIPANEL_RUNTIME_SERVICE) private readonly runtime: OmniPanelRuntimeService,
        @inject(OMNIPANEL_WIDGET_ID_TOKEN) private readonly widgetIdResolver: () => OmniPanelWidget | null
    ) {}

    @postConstruct()
    protected init(): void {
        this.eventSubscription = this.subscribeToCrossLayoutIntentEvents();
    }

    register(key: string, resolver: OmniPanelRoutingResolver): Disposable {
        if (!key.trim()) {
            throw new Error('OmniPanel intent route key must be non-empty.');
        }
        this.customRoutes.set(key, resolver);
        return Disposable.create(() => {
            if (this.customRoutes.get(key) === resolver) {
                this.customRoutes.delete(key);
            }
        });
    }

    route(intent: CrossLayoutIntent): OmniPanelRoutingResult {
        const routeKey = omniPanelIntentRouteKey(intent);
        if (!routeKey) {
            throw new Error('CrossLayoutIntent must name requestedExtensionId and requestedContributionId.');
        }
        const resolver = this.customRoutes.get(routeKey) ?? this.defaultRoutes.get(routeKey);
        if (!resolver) {
            throw new Error(`No OmniPanel intent route registered for "${routeKey}".`);
        }

        const resolved = resolver(intent);
        const shouldRevealOmniPanel = this.shouldRevealOmniPanel();
        const perTabState = this.mergePerTabState(resolved.activateTab, resolved.perTabPayload);
        const result: OmniPanelRoutingResult = Object.freeze({
            activateTab: resolved.activateTab,
            perTabPayload: perTabState,
            shouldRevealOmniPanel
        });

        this.runtime.activateTab(result.activateTab);
        if (shouldRevealOmniPanel) {
            this.revealOmniPanel();
        }
        this.publishRoutingEvent(intent, routeKey, result, perTabState);
        return result;
    }

    tryRoute(intent: CrossLayoutIntent): OmniPanelRoutingResult | undefined {
        try {
            return this.route(intent);
        } catch {
            return undefined;
        }
    }

    getDefaultRoutes(): ReadonlyMap<string, OmniPanelRoutingResolver> {
        return this.defaultRoutes;
    }

    getPerTabState(tabId: OmniPanelTabId): OmniPanelRoutingPayload {
        return Object.freeze({ ...(this.perTabState.get(tabId) ?? {}) });
    }

    setPerTabState(tabId: OmniPanelTabId, state: OmniPanelRoutingPayload): void {
        this.perTabState.set(tabId, Object.freeze({ ...state }));
    }

    dispose(): void {
        this.eventSubscription?.dispose();
        this.eventSubscription = null;
    }

    private subscribeToCrossLayoutIntentEvents(): Disposable {
        const target = globalThis as GlobalEventTarget;
        if (typeof target.addEventListener !== 'function' || typeof target.removeEventListener !== 'function') {
            return Disposable.NULL;
        }
        const listener: EventListener = event => {
            const telemetry = (event as CustomEvent<CrossLayoutIntentTelemetry>).detail;
            if (!telemetry || telemetry.status !== 'success') {
                return;
            }
            this.tryRoute(telemetry.intent);
        };
        target.addEventListener(CROSS_LAYOUT_INTENT_TELEMETRY_EVENT, listener);
        return Disposable.create(() => target.removeEventListener?.(CROSS_LAYOUT_INTENT_TELEMETRY_EVENT, listener));
    }

    private shouldRevealOmniPanel(): boolean {
        const widget = this.widgetIdResolver();
        const state = (widget as unknown as OmniPanelWidgetRecord | null)?.omniState;
        return state === 'hidden' || state === 'minimal' || state === 'minimized';
    }

    private revealOmniPanel(): void {
        const widget = this.widgetIdResolver();
        if (!widget) {
            return;
        }
        const record = widget as unknown as OmniPanelWidgetRecord;
        record.omniState = 'fullscreen';
        record.update?.();
    }

    private mergePerTabState(
        tabId: OmniPanelTabId,
        routingPayload: OmniPanelRoutingPayload
    ): OmniPanelRoutingPayload {
        const existing = this.perTabState.get(tabId) ?? {};
        const merged = Object.freeze({
            ...existing,
            ...withoutUndefined(routingPayload)
        });
        this.perTabState.set(tabId, merged);
        return merged;
    }

    private publishRoutingEvent(
        intent: CrossLayoutIntent,
        routeKey: string,
        result: OmniPanelRoutingResult,
        perTabState: OmniPanelRoutingPayload
    ): void {
        const target = globalThis as GlobalEventTarget;
        if (typeof target.dispatchEvent !== 'function' || typeof target.CustomEvent !== 'function') {
            return;
        }
        target.dispatchEvent(new target.CustomEvent(OMNIPANEL_ROUTING_EVENT, {
            detail: {
                intent,
                routeKey,
                result,
                perTabState
            } satisfies OmniPanelRoutingEventDetail
        }));
        void this.bridge;
    }
}

function routeTo(
    activateTab: OmniPanelTabId,
    perTabPayload: OmniPanelRoutingPayload
): OmniPanelRoutingResult {
    return Object.freeze({
        activateTab,
        perTabPayload: Object.freeze(withoutUndefined(perTabPayload)),
        shouldRevealOmniPanel: false
    });
}

function firstString(...values: readonly unknown[]): string | null {
    for (const value of values) {
        if (typeof value === 'string' && value.trim().length > 0) {
            return value;
        }
    }
    return null;
}

function withoutUndefined(value: OmniPanelRoutingPayload): OmniPanelRoutingPayload {
    return Object.freeze(
        Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined))
    );
}
