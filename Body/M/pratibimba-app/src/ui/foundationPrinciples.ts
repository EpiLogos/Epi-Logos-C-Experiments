/**
 * Coordinate: M' shell (UI foundation-principle adherence — Track 15.T15.1)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: the carrier's adherence declaration to the nine binding UI
 *   foundation principles — the pratibimba-app equivalent of the Theia
 *   extensions' `contributes.uiFoundationPrincipleAdherence: true` flag.
 *   The CONTRACT lives at the frozen registry
 *   `Body/M/epi-theia/extensions/contracts/ui-foundation-principles.md`
 *   (LAW per the CHARTER retarget — contract surfaces are law, plumbing is
 *   dead); this module NAMES the nine and pins parity with the registry via
 *   its test, so drift between the app and the contract is mechanical to
 *   catch. Every shell-contributing surface in this app adheres.
 * Does NOT own: the principles' text (the contract registry), design tokens
 *   (Track 30 / src/ui/tokens.ts), block-kit (the surface standard).
 */

export const UI_FOUNDATION_PRINCIPLE_ADHERENCE = true as const;

export const UI_FOUNDATION_PRINCIPLES = Object.freeze([
    'Coordinate as Primary Navigation',
    'Profile-Tick As Primary Clock',
    'Provenance Always Visible',
    'Bimba/Pratibimba As UI Dial',
    'OmniPanel As `/` Operator Membrane',
    'Composition Over Juxtaposition',
    'Activity-Bar Discipline',
    'Theia Conventions',
    'Day-Now As Ambient Thread'
] as const);
