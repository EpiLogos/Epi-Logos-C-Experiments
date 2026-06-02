/**
 * @pratibimba/body-lite-surface — common barrel.
 *
 * Track 09 T9b: lite-surface review alerts + agent check-in + safe-source-
 * handle row + four typed deep-link intents. Pairs with the deep Agentic
 * Control Room (Thread A 05.T8 @pratibimba/agentic-control-room).
 *
 * Common-only exports — safe to import from Node test context without
 * pulling in Theia browser deps.
 */

export * from './lite-surface-types';
export * from './deep-link-intents';
export * from './snapshot';

export const EXTENSION_ID = 'body-lite-surface' as const;
