export * from './bridge-api';
export * from './bridge-readiness';
export * from './contribution-contracts';
export * from './coordinate-context';
export * from './empty-state-registry';
export * from './observability';
export * from './profile';
export * from './preferences-schema';
export * from './readiness';
export * from './recursive-self-review-gate';
export * from './route';
export * from './shared-bridge';

// Browser-runtime helpers — re-exported here so any consumer (M-extensions,
// integrated plugins, the kernel-bridge contract layer) can import everything
// from the package root rather than juggling subpaths.
export { ReadinessBanner } from '../browser/readiness-banner';
export type { ReadinessBannerProps } from '../browser/readiness-banner';
export { EpiLogosSettingsPage, EpiLogosSettingsPreferenceContribution } from '../browser/settings/epi-logos-settings-page';
export type { EpiLogosSettingsPageProps } from '../browser/settings/epi-logos-settings-page';
export { SHARED_BRIDGE_ADAPTER } from '../browser/frontend-module';
export { registerIntentTarget } from '../browser/intent-target-registration';
export { ColdStartOrchestrator, COLD_START_STAGE_ORDER } from '../browser/cold-start-orchestrator';
export type {
    ColdStartState,
    Stage6ResumeMode,
    PreStage6Gate
} from '../browser/cold-start-orchestrator';
