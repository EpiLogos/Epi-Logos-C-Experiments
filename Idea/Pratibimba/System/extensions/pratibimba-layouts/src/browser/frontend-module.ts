import { ContainerModule } from '@theia/core/shared/inversify';
import { CommandContribution, MenuContribution } from '@theia/core/lib/common';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import { LAYOUT_SWITCHER } from './tokens';
import { PratibimbaLayoutSwitcher } from './layout-switcher';
import { PratibimbaLayoutCommandContribution } from './layout-commands';
import { PratibimbaSessionStateService } from './session-state-service';
import { SESSION_STATE_SERVICE } from './session-state-service';
import {
    CROSS_LAYOUT_INTENT_DISPATCHER,
    CrossLayoutIntentDispatcher
} from './cross-layout-intent-dispatcher';
import { LayoutStatusBarContribution } from './layout-status-bar';

export default new ContainerModule(bind => {
    bind(PratibimbaLayoutSwitcher).toSelf().inSingletonScope();
    bind(LAYOUT_SWITCHER).toService(PratibimbaLayoutSwitcher);

    bind(PratibimbaLayoutCommandContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toService(PratibimbaLayoutCommandContribution);
    bind(MenuContribution).toService(PratibimbaLayoutCommandContribution);
    bind(FrontendApplicationContribution).toService(PratibimbaLayoutCommandContribution);

    // Track 05 T5: session-state service + cross-layout intent dispatcher.
    bind(PratibimbaSessionStateService).toSelf().inSingletonScope();
    bind(SESSION_STATE_SERVICE).toService(PratibimbaSessionStateService);

    bind(CrossLayoutIntentDispatcher).toSelf().inSingletonScope();
    bind(CROSS_LAYOUT_INTENT_DISPATCHER).toService(CrossLayoutIntentDispatcher);
    bind(CommandContribution).toService(CrossLayoutIntentDispatcher);

    // Status-bar layout indicator — always-visible UI for layout switching.
    bind(LayoutStatusBarContribution).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(LayoutStatusBarContribution);
});
