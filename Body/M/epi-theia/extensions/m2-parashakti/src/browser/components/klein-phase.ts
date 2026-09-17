// Coordinate Header (convention:coordinate-header:v1)
//   Coordinate:     #2 browser component vocabulary for M2 Klein flip display.
//   Residency:      Body/M/epi-theia/extensions/m2-parashakti (browser components)
//   Position (#n):  Shared browser-local type vocabulary.
//   Actualises:     a local display type for Klein flip phase props used by M2
//                   browser components without importing the integrated-only
//                   composition mount.
//   Public surface: M2KleinFlipPhase.
//   Does NOT own:   the M2 composition contract module or the
//                   kernel-side flip law; this file only names browser prop states.
//   Contract:       Browser components read bridge/profile state directly.

export type M2KleinFlipPhase = 'primary' | 'inverted' | 'transitioning';
