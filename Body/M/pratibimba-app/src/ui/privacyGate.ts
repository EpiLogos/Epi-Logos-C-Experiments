/**
 * Coordinate: M' shared chrome (receipt privacy gate — rerun 28.T28.3(e), 28.1 §7)
 * Residency: Body/M/pratibimba-app/src/ui/privacyGate.ts
 * Position (#n): #4 — Context/Type; the boundary a gateway payload crosses
 *   before any chrome surface commits it to a render tree
 * Actualises: CHROME-CONTRACT.md §7 "Privacy & Profile-Tick" — the
 *   `isPrivacySafe()` gate every M0'/M5' chrome surface applies to a
 *   `KernelBridgeCapabilityReceipt` BEFORE rendering it. Carrier translation of
 *   the frozen `ide-shell-m0-m5/src/common/contract.ts` vocabulary: the two
 *   class lists are LAW (copied verbatim, not re-derived), the Theia plumbing
 *   around them is dead. A refused payload never reaches the render tree; the
 *   refusal is recorded in the federated PrivacyDropFeed (28.16) so the drop is
 *   counted rather than silently swallowed.
 *
 *   THE UNSET RULE, kept verbatim from the frozen contract: a null/undefined
 *   privacy class is treated as public, because the GATEWAY is the privacy
 *   authority — a carrier that invented a refusal for an unlabelled payload
 *   would be asserting a class the authority never assigned.
 * Public surface: FORBIDDEN_PRIVACY_CLASSES, ALLOWED_PRIVACY_CLASSES,
 *   isPrivacySafe, privacyRefusalReason.
 * Does NOT own: the privacy classes themselves (S0/gateway authority), the M4'
 *   per-surface tint register (ui/privacyChrome.ts — a different register: what
 *   KIND of material a surface shows, not whether a receipt may be shown), the
 *   block-level gate (blocks/blockContract.ts privacyGate), or the drop sink
 *   (services/privacyDropFeed.ts).
 * Contract: [[CHROME-CONTRACT]] §7 + rerun tranche [[28.T28.3]].
 */

/**
 * Privacy classes forbidden from any chrome UI / state / event / persistence
 * pathway. Verbatim from the frozen ide-shell contract — this list is law, and
 * a carrier surface that widens it is widening a privacy boundary.
 */
export const FORBIDDEN_PRIVACY_CLASSES = Object.freeze([
    'private',
    'protected',
    'restricted-graphiti-body',
    'protected-nara-body',
    'private-journal',
    'private-birth-data',
    'private-quaternion',
    'private-profile'
] as const);

export type ForbiddenPrivacyClass = (typeof FORBIDDEN_PRIVACY_CLASSES)[number];

/** Public-grade classes the chrome will surface (frozen contract, verbatim). */
export const ALLOWED_PRIVACY_CLASSES = Object.freeze([
    'public',
    'safe-public-current-kernel-tick',
    'public_current_with_graph_provenance',
    'safe-public'
] as const);

export type AllowedPrivacyClass = (typeof ALLOWED_PRIVACY_CLASSES)[number];

/**
 * True when a receipt carrying this privacy class may be rendered.
 * Unset (null/undefined) is public: the gateway is the authority, so an
 * unlabelled payload is not a refusal the carrier gets to invent.
 */
export function isPrivacySafe(privacyClass: string | null | undefined): boolean {
    if (privacyClass === null || privacyClass === undefined) {
        return true;
    }
    return !(FORBIDDEN_PRIVACY_CLASSES as readonly string[]).includes(privacyClass);
}

/** The message a refusing surface shows — names the class, never the payload. */
export function privacyRefusalReason(privacyClass: string | null | undefined, surface: string): string {
    return `Privacy class "${privacyClass ?? 'unset'}" refused by the ${surface} gate`;
}
