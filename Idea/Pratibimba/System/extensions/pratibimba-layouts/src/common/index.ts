export * from './layout-types';
export * from './cross-layout-intent';

// Browser-runtime helpers re-exported so consumers can import everything
// from the package root (`@pratibimba/pratibimba-layouts`) rather than
// juggling subpaths. Mirrors the m-extension-runtime barrel pattern.
export {
    LAYOUT_SWITCHER,
    PratibimbaLayoutSwitcher,
    EMPTY_PRESERVED_STATE
} from '../browser/layout-switcher';
export type { LayoutModeChange, PreservedLayoutState } from '../browser/layout-switcher';
export {
    SWITCH_TO_DAILY,
    SWITCH_TO_IDE_DEEP,
    TOGGLE_LAYOUT,
    PratibimbaLayoutCommandContribution
} from '../browser/layout-commands';
export {
    CROSS_LAYOUT_INTENT_DISPATCHER,
    DISPATCH_INTENT_COMMAND,
    CrossLayoutIntentDispatcher
} from '../browser/cross-layout-intent-dispatcher';
export {
    SESSION_STATE_SERVICE,
    PratibimbaSessionStateService
} from '../browser/session-state-service';
export type { PratibimbaSessionState } from '../browser/session-state-service';
