import { ContainerModule } from '@theia/core/shared/inversify';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import { CommandContribution } from '@theia/core/lib/common';
import { SharedBridgeAdapter } from '../common/shared-bridge';
import { ColdStartOrchestrator } from './cold-start-orchestrator';
import { ActiveCoordinateStatusEntry } from './status-bar/active-coordinate-status-entry';
import { DayNowStatusEntry } from './status-bar/day-now-status-entry';
import { GatewayReadinessStatusEntry } from './status-bar/gateway-readiness-status-entry';
import { ProfileGenerationStatusEntry } from './status-bar/profile-generation-status-entry';
import { ProfileTickStatusEntry } from './status-bar/profile-tick-status-entry';
import { SessionIdStatusEntry } from './status-bar/session-id-status-entry';

/**
 * DI symbol the six M-extensions resolve to obtain the single fan-out adapter.
 * Bound as a singleton here so any number of consumer extensions share the
 * same `SharedBridgeAdapter` instance.
 */
export const SHARED_BRIDGE_ADAPTER = Symbol('SharedBridgeAdapter');

export default new ContainerModule((bind, _unbind, isBound) => {
    if (!isBound(SharedBridgeAdapter)) {
        bind(SharedBridgeAdapter).toSelf().inSingletonScope();
    }
    if (!isBound(SHARED_BRIDGE_ADAPTER)) {
        bind(SHARED_BRIDGE_ADAPTER).toService(SharedBridgeAdapter);
    }

    // Driven by bridge readiness events, not the app lifecycle — bound as a
    // plain singleton, deliberately NOT a FrontendApplicationContribution.
    if (!isBound(ColdStartOrchestrator)) {
        bind(ColdStartOrchestrator).toSelf().inSingletonScope();
    }

    bind(ActiveCoordinateStatusEntry).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(ActiveCoordinateStatusEntry);
    bind(CommandContribution).toService(ActiveCoordinateStatusEntry);

    bind(DayNowStatusEntry).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(DayNowStatusEntry);

    bind(SessionIdStatusEntry).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(SessionIdStatusEntry);

    bind(GatewayReadinessStatusEntry).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(GatewayReadinessStatusEntry);

    bind(ProfileGenerationStatusEntry).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(ProfileGenerationStatusEntry);

    bind(ProfileTickStatusEntry).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(ProfileTickStatusEntry);
});
