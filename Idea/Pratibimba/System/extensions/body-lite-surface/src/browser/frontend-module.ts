import { ContainerModule, interfaces, injectable, inject } from '@theia/core/shared/inversify';
import { CommandContribution } from '@theia/core/lib/common';
import {
    WidgetFactory,
    FrontendApplicationContribution
} from '@theia/core/lib/browser';
import {
    LAYOUT_SWITCHER,
    PratibimbaLayoutSwitcher,
    PRATIBIMBA_LAYOUT_DAILY_0_1
} from '@pratibimba/pratibimba-layouts';
import {
    BodyLiteRuntimeService,
    BODY_LITE_RUNTIME_SERVICE
} from './body-lite-runtime-service';
import { ReviewAlertBadgeWidget } from './review-alert-badge-widget';
import { AgentCheckInWidget } from './agent-checkin-widget';
import { SafeSourceHandleRowWidget } from './safe-source-handle-row-widget';
import { BodyDeepLinkCommandContribution } from './deep-link-commands';
import { BODY_LITE_WIDGET_IDS } from '../common';

/**
 * Frontend module for `@pratibimba/body-lite-surface` — Track 09 T9b.
 *
 * Layout discipline: the three widgets ONLY mount in the 0/1 daily
 * layout. The deep IDE layout has the full Agentic Control Room
 * (Thread A 05.T8) and does not show the lite widgets. The
 * `BodyLiteLayoutContribution` listens to `layoutSwitcher.onLayoutChange`
 * and activates/deactivates the runtime accordingly.
 *
 * Subscription discipline: `BodyLiteRuntimeService.activate()` is
 * idempotent. The deep IDE control-room shares the same
 * `KERNEL_BRIDGE_API` singleton, so the upstream count stays at 1.
 */

@injectable()
export class BodyLiteLayoutContribution implements FrontendApplicationContribution {
    @inject(LAYOUT_SWITCHER)
    protected readonly layoutSwitcher!: PratibimbaLayoutSwitcher;

    @inject(BODY_LITE_RUNTIME_SERVICE)
    protected readonly runtime!: BodyLiteRuntimeService;

    async onStart(): Promise<void> {
        // Activate when the 0/1 daily layout is the active one (the default
        // first-mount layout per pratibimba-layouts). Idempotent across re-fires.
        if (this.layoutSwitcher.currentLayout === PRATIBIMBA_LAYOUT_DAILY_0_1) {
            this.runtime.activate();
        }
        this.layoutSwitcher.onLayoutChange(change => {
            if (change.currentLayout === PRATIBIMBA_LAYOUT_DAILY_0_1) {
                // Subscription is opened once and reused — calling activate()
                // again is a no-op.
                this.runtime.activate();
            }
            // We do NOT deactivate on switching to the deep IDE: the
            // KERNEL_BRIDGE_API is shared across both layouts and the deep
            // IDE control-room consumes the same upstream events. Keeping
            // the lite-runtime active ensures snapshots are warm when the
            // user returns to /body. The single-subscription invariant is
            // preserved because both subscribers share the bridge singleton.
        });
    }
}

export default new ContainerModule(bind => {
    // Runtime service — singleton, shared across the three widgets.
    bind(BodyLiteRuntimeService).toSelf().inSingletonScope();
    bind(BODY_LITE_RUNTIME_SERVICE).toService(BodyLiteRuntimeService);

    // Three lite-surface widgets.
    bind(ReviewAlertBadgeWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: BODY_LITE_WIDGET_IDS.REVIEW_ALERT_BADGE,
            createWidget: () => createChildBound(ctx.container, ReviewAlertBadgeWidget)
        }))
        .inSingletonScope();

    bind(AgentCheckInWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: BODY_LITE_WIDGET_IDS.AGENT_CHECKIN,
            createWidget: () => createChildBound(ctx.container, AgentCheckInWidget)
        }))
        .inSingletonScope();

    bind(SafeSourceHandleRowWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: BODY_LITE_WIDGET_IDS.SAFE_SOURCE_HANDLE_ROW,
            createWidget: () => createChildBound(ctx.container, SafeSourceHandleRowWidget)
        }))
        .inSingletonScope();

    // Four typed deep-link intent commands.
    bind(BodyDeepLinkCommandContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toService(BodyDeepLinkCommandContribution);

    // Layout-aware activation contribution.
    bind(BodyLiteLayoutContribution).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(BodyLiteLayoutContribution);
});

function createChildBound<T>(
    container: interfaces.Container,
    Ctor: interfaces.Newable<T>
): T {
    const child = container.createChild();
    child.bind(Ctor).toSelf();
    return child.get(Ctor);
}
