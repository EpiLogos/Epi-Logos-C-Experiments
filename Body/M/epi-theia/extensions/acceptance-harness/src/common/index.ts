/**
 * @pratibimba/acceptance-harness — common barrel.
 *
 * Track 05 T9: full Theia-shell acceptance + release gate.
 */

export * from './acceptance-plan';

export const EXTENSION_ID = 'acceptance-harness' as const;

/** Widget IDs surfaced by this extension. */
export const ACCEPTANCE_WIDGET_IDS = {
    HARNESS_CONTROL: 'pratibimba.acceptance.harness-control',
    STEP_LOG: 'pratibimba.acceptance.step-log'
} as const;

/**
 * Verification handle the Theia-side contribution emits as the harness runs.
 * The Node-driven script reads stdout for these handles to confirm step
 * completion. Format: `[ACCEPTANCE:<step-id>:<key>=<value>]`.
 */
export const ACCEPTANCE_HANDLE_PREFIX = '[ACCEPTANCE:';
