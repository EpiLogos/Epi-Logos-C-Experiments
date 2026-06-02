/**
 * @pratibimba/ide-shell-m0-m5 — common barrel export.
 *
 * Track 05 T4: M0/M5 IDE chrome (Bimba graph viewer, Canon Studio, Agentic
 * Control Room shell, Bimba coordinate tree, Logos Atelier, evidence/review/
 * autoresearch panes).
 *
 * NOTE: this barrel exports ONLY common/* modules so it is safe to import
 * from Node test contexts. Browser-side widgets are reached via the
 * `lib/browser/*.js` paths directly (or via the Theia frontend bundle).
 */

export * from './contract';
export * from './capability-matrix-types';
export * from './graph-types';
export * from './decorations';
export * from './vault-bridge-gate';
