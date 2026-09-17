// Light-weight mirror of the contract identifiers defined in ./index.
//
// ./index re-exports values from `@pratibimba/m-extension-runtime`, whose
// common barrel eagerly loads browser-side React widgets (ReadinessBanner,
// frontend-module) and therefore the whole @theia/core/lib/browser stack. The
// pure clock/topology logic in clock-instrument.ts must stay requireable under
// a plain `node --test` (mirroring how m0-anuttara's inspector model imports
// only m0-layers). It therefore imports these constants from here instead of
// from ./index.
//
// These literals MUST stay in lock-step with ./index (generated from
// contracts/07-t0-extension-contract-preflight.json).
export const EXTENSION_ID = 'm1-paramasiva';
export const PRIVACY_CLASS = 'public_current_audio_metadata_only';
