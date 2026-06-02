import { injectable, inject } from '@theia/core/shared/inversify';
import { Emitter, Event } from '@theia/core/lib/common/event';
import { ApplicationShell } from '@theia/core/lib/browser';
import { PreferenceService, PreferenceScope } from '@theia/core/lib/browser/preferences';
import {
    PRATIBIMBA_LAYOUT_DAILY_0_1,
    PRATIBIMBA_LAYOUT_IDE_DEEP,
    PratibimbaLayoutId,
    PratibimbaLayoutDescriptor,
    layoutById,
    DAILY_0_1_DESCRIPTOR
} from '../common/layout-types';
import { LAYOUT_SWITCHER } from './tokens';

// Re-export the token from this module for backward compat with consumers
// that import it from `./layout-switcher` or the package barrel.
export { LAYOUT_SWITCHER };

export interface LayoutModeChange {
    readonly previousLayout: PratibimbaLayoutId | null;
    readonly currentLayout: PratibimbaLayoutId;
    readonly descriptor: PratibimbaLayoutDescriptor;
    readonly preservedState: PreservedLayoutState;
}

/**
 * State the LayoutSwitcher promises to preserve across a layout transition.
 * The actual preservation is done by upstream DI singletons (kernel-bridge,
 * session service, etc.); this is the contract enumerating which keys MUST
 * survive a round-trip per Track 05 T2 verification.
 */
export interface PreservedLayoutState {
    readonly selectedCoordinate: string | null;
    readonly sessionKey: string | null;
    readonly dayNowContext: string | null;
    readonly profileGeneration: number | null;
    readonly bridgeSubscriptionId: string | null;
}

export const EMPTY_PRESERVED_STATE: PreservedLayoutState = {
    selectedCoordinate: null,
    sessionKey: null,
    dayNowContext: null,
    profileGeneration: null,
    bridgeSubscriptionId: null
};

/**
 * Layout-mode switcher service.
 *
 * Track 05 T2 deliverable: implements layout switching via Theia's
 * `ApplicationShell` + `PreferenceService`. The active layout is recorded
 * as a User-scope preference (`epi-logos.layout.active`) so it survives
 * window reload and is observable by other extensions via preference change
 * events.
 *
 * Concrete widget materialisation (mounting M-extension widgets, opening
 * OmniPanel, focusing Canon Studio, etc.) is delegated to the owning
 * extensions — the switcher emits the `onLayoutChange` event with the
 * target descriptor; each extension subscribes and decides which of its
 * widgets to reveal/focus/hide.
 *
 * The kernel-bridge subscription is process-scoped (one Theia process, one
 * bridge instance) and therefore unaffected by layout switching. The
 * verification line "Layout switching between daily-0-1 and ide-deep does
 * not open a second bridge subscription or trigger a resubscribe" lands at
 * Track 05 T3 against this contract.
 */
@injectable()
export class PratibimbaLayoutSwitcher {
    @inject(ApplicationShell) protected readonly shell!: ApplicationShell;
    @inject(PreferenceService) protected readonly preferences!: PreferenceService;

    protected readonly _onLayoutChange = new Emitter<LayoutModeChange>();
    readonly onLayoutChange: Event<LayoutModeChange> = this._onLayoutChange.event;

    protected _currentLayout: PratibimbaLayoutId | null = null;

    get currentLayout(): PratibimbaLayoutId {
        return this._currentLayout ?? PRATIBIMBA_LAYOUT_DAILY_0_1;
    }

    /**
     * Initialise from persisted preference (or default to daily-0-1).
     * Called by the layout-bootstrap FrontendApplicationContribution at startup.
     */
    async restoreInitialLayout(): Promise<PratibimbaLayoutId> {
        const stored = this.preferences.get<string>(DAILY_0_1_DESCRIPTOR.preferenceKey);
        const target: PratibimbaLayoutId =
            stored === PRATIBIMBA_LAYOUT_IDE_DEEP ? PRATIBIMBA_LAYOUT_IDE_DEEP : PRATIBIMBA_LAYOUT_DAILY_0_1;
        await this.switchTo(target);
        return target;
    }

    async switchTo(target: PratibimbaLayoutId, preserved: PreservedLayoutState = EMPTY_PRESERVED_STATE): Promise<void> {
        const previousLayout = this._currentLayout;
        if (previousLayout === target) {
            return;
        }
        this._currentLayout = target;
        const descriptor = layoutById(target);

        // Persist the choice so the shell remembers across reloads.
        await this.preferences.set(descriptor.preferenceKey, target, PreferenceScope.User);

        // Fan-out the change event. Owning extensions subscribe and reveal/hide
        // their widgets per descriptor.expectedWidgets.
        this._onLayoutChange.fire({
            previousLayout,
            currentLayout: target,
            descriptor,
            preservedState: preserved
        });
    }

    /**
     * Convenience: switch to the *other* layout. Used by the OmniPanel "summon
     * IDE" / "return to daily" commands.
     */
    async toggleLayout(preserved: PreservedLayoutState = EMPTY_PRESERVED_STATE): Promise<PratibimbaLayoutId> {
        const next: PratibimbaLayoutId =
            this.currentLayout === PRATIBIMBA_LAYOUT_DAILY_0_1
                ? PRATIBIMBA_LAYOUT_IDE_DEEP
                : PRATIBIMBA_LAYOUT_DAILY_0_1;
        await this.switchTo(next, preserved);
        return next;
    }
}
