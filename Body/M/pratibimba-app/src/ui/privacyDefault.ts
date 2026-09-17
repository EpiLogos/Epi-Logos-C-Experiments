/**
 * Coordinate: M' shell-0 (the privacy-class DEFAULT and its ceiling — 32.T32.8)
 * Residency: Body/M/pratibimba-app/src/ui/privacyDefault.ts
 * Position (#n): #4 — Context/Type; the class a new artifact RESTS at, before
 *   anything has been decided about it
 * Actualises: tranche 32.8 of the design-recon spec
 *   `32-onboarding-settings-empty-states.md:238-257` — "Settings binding (32.4
 *   Privacy section) `epi-logos.privacy.default-class` with default
 *   `protected_local`. The preference governs new writes from any M4-touching
 *   extension; per-extension contract `privacyClass` field (07-T0) declares the
 *   maximum permitted class, while user preference selects within that ceiling."
 *
 *   THE DEFAULT IS DERIVED, NOT RESTATED. `DEFAULT_PRIVACY_CLASS` is read off
 *   the preference register (`ui/preferences.ts`, 31.T31.9) at module load. A
 *   default declared in the register and separately hard-coded here would be
 *   two facts free to disagree, and the one that moves when someone edits the
 *   register is the one nothing reads. `privacyDefault.test.ts` scans the real
 *   `src` tree and fails on any second spelling of a class in a fallback
 *   position, which is the same discipline 31.T31.9 put on preference KEYS.
 *
 *   AND IT IS ENFORCED AT THE READ PATH. `readDefaultPrivacyClass` is the only
 *   way a stored value becomes a class: anything absent, misspelled, or from an
 *   older vocabulary (`'protected-local'`, `'public'`) resolves to the shipped
 *   default rather than to whatever the caller felt like. A default enforced
 *   only at the WRITE path is a default that has already failed for every user
 *   whose settings file predates it.
 *
 *   THE CEILING CANNOT AUTHORISE A CROSSING. The 07-T0 contract classes are a
 *   different vocabulary from the three carrier classes (25.T25.18) — only
 *   m4-nara's `protected_local` is spelled in both. Rather than invent a
 *   mapping that lets a `public_current_*` contract class silently raise a
 *   user's resting class to the shareable one, every non-matching contract
 *   class ceilings at `protected_local_handle_only`: references and metadata,
 *   never a body. NO ceiling row resolves to `shared_archetype_opt_in`. That
 *   makes the 32.8 law — "per-artifact opt-in is the ONLY public-bridge
 *   crossing path; no global make-everything-public switch" — a property of
 *   this table rather than a promise in prose, and the suite asserts it
 *   directly. The crossing itself lives in `panes/privacyCrossing.ts` and is
 *   reachable only through a per-artifact consent record.
 *
 *   The readings in `CONTRACT_CLASS_CEILING` below are CARRIER JUDGMENTS on a
 *   contract vocabulary this tranche does not own, flagged for the Architect in
 *   the same posture `privacyChrome.CARRIER_EXTENSION_SURFACES` takes: they are
 *   deliberately conservative in the direction that cannot hurt a user.
 * Public surface: PRIVACY_DEFAULT_CLASS_PREFERENCE, DEFAULT_PRIVACY_CLASS,
 *   PRIVACY_EXPOSURE_RANK, isPrivacyClass, readDefaultPrivacyClass,
 *   MExtensionId, M_EXTENSION_IDS, EXTENSION_CONTRACT_CLASS,
 *   CONTRACT_CLASS_CEILING, privacyCeiling, clampToCeiling,
 *   effectivePrivacyClass.
 * Does NOT own: the class vocabulary or the tints (`ui/privacyChrome.ts`,
 *   25.T25.18), the preference key/default/description (`ui/preferences.ts`,
 *   31.T31.9), the 07-T0 contract (`Body/M/epi-theia/extensions/contracts/
 *   07-t0-extension-contract-preflight.json` — mirrored here and held in
 *   lockstep by the suite, never edited from this side), the consent ledger or
 *   the crossing gate (`panes/privacyCrossing.ts`), or the STORAGE of the
 *   preference (each consumer keeps its own read path, per 31.T31.9).
 * Contract: rerun tranche [[32.T32.8]] over [[25.T25.18]] + [[31.T31.9]].
 */

import { PREFERENCE_KEYS, preferenceDescriptor } from './preferences';
import { PRIVACY_CLASSES, type PrivacyClass } from './privacyChrome';

/** Aliases the one preference-key authority (31.T31.9); never a literal. */
export const PRIVACY_DEFAULT_CLASS_PREFERENCE = PREFERENCE_KEYS.privacyDefaultClass;

export function isPrivacyClass(value: unknown): value is PrivacyClass {
    return typeof value === 'string' && (PRIVACY_CLASSES as readonly string[]).includes(value);
}

/**
 * The shipped default, READ from the register that declares it. Throwing at
 * module load is deliberate: a register whose default is not a class is a
 * defect the app must not boot past, because every unwritten preference would
 * silently resolve to whatever the first caller guessed.
 */
export const DEFAULT_PRIVACY_CLASS: PrivacyClass = (() => {
    const descriptor = preferenceDescriptor(PRIVACY_DEFAULT_CLASS_PREFERENCE);
    if (!descriptor) {
        throw new Error(`${PRIVACY_DEFAULT_CLASS_PREFERENCE} is not declared in the preference register`);
    }
    const value = descriptor.defaultValue;
    if (!isPrivacyClass(value)) {
        throw new Error(
            `${PRIVACY_DEFAULT_CLASS_PREFERENCE} default ${String(value)} is not a privacy class`
        );
    }
    return value;
})();

/**
 * How much of a person's material each class lets out. A strict order, so
 * "the tighter of the two" is a real `min` and never a tie that has to be
 * broken by declaration order.
 */
export const PRIVACY_EXPOSURE_RANK: Readonly<Record<PrivacyClass, number>> = Object.freeze({
    protected_local: 0,
    protected_local_handle_only: 1,
    shared_archetype_opt_in: 2
});

/**
 * Resolve a stored preference value to a class. THE READ PATH: an absent value,
 * a value from an older vocabulary, or a value from a hand-edited settings file
 * all land on the shipped default rather than on a caller's guess.
 */
export function readDefaultPrivacyClass(stored: unknown): PrivacyClass {
    return isPrivacyClass(stored) ? stored : DEFAULT_PRIVACY_CLASS;
}

export type MExtensionId =
    | 'm0-anuttara'
    | 'm1-paramasiva'
    | 'm2-parashakti'
    | 'm3-mahamaya'
    | 'm4-nara'
    | 'm5-epii';

export const M_EXTENSION_IDS: readonly MExtensionId[] = Object.freeze([
    'm0-anuttara',
    'm1-paramasiva',
    'm2-parashakti',
    'm3-mahamaya',
    'm4-nara',
    'm5-epii'
] as const);

/**
 * The `privacyClass` each extension declares in the 07-T0 preflight contract,
 * mirrored verbatim. The contract is the authority and is never written from
 * here; `privacyDefault.test.ts` reads the real JSON and fails on any drift in
 * either direction, including a seventh extension arriving.
 */
export const EXTENSION_CONTRACT_CLASS: Readonly<Record<MExtensionId, string>> = Object.freeze({
    'm0-anuttara': 'public_current_with_graph_provenance',
    'm1-paramasiva': 'public_current_audio_metadata_only',
    'm2-parashakti': 'public_current_with_pending_private_projection_blocks',
    'm3-mahamaya': 'public_current_with_scalar_oracle_refs_only',
    'm4-nara': 'protected_local',
    'm5-epii': 'governed_review_metadata_only'
});

/**
 * The maximum CARRIER class each contract class permits.
 *
 * One row is an identity (`protected_local` is spelled in both vocabularies).
 * The other five are readings, and all five land on `protected_local_handle_only`
 * for the same reason: every one of them is qualified — "metadata only",
 * "refs only", "pending private projection blocks", "review metadata only" —
 * so what the contract lets out is references and metadata, which IS the
 * handle-only class. None of them is an unqualified public body, so none of
 * them earns `shared_archetype_opt_in`.
 *
 * The consequence is the point: because no row reaches the crossing class, no
 * combination of extension and user preference can put an artifact into the
 * shareable class. Only a per-artifact consent record can, through
 * `panes/privacyCrossing.ts`.
 */
export const CONTRACT_CLASS_CEILING: Readonly<Record<string, PrivacyClass>> = Object.freeze({
    protected_local: 'protected_local',
    governed_review_metadata_only: 'protected_local_handle_only',
    public_current_audio_metadata_only: 'protected_local_handle_only',
    public_current_with_scalar_oracle_refs_only: 'protected_local_handle_only',
    public_current_with_pending_private_projection_blocks: 'protected_local_handle_only',
    public_current_with_graph_provenance: 'protected_local_handle_only'
});

/**
 * The ceiling for one extension. An id with no contract row, or a contract
 * class with no ceiling row, throws rather than defaulting open — an unknown
 * extension is exactly the case where guessing loosely would be a privacy
 * regression.
 */
export function privacyCeiling(extensionId: MExtensionId): PrivacyClass {
    const contractClass = EXTENSION_CONTRACT_CLASS[extensionId];
    if (!contractClass) {
        throw new Error(`no 07-T0 contract row for extension ${extensionId}`);
    }
    const ceiling = CONTRACT_CLASS_CEILING[contractClass];
    if (!ceiling) {
        throw new Error(`no ceiling declared for contract privacy class ${contractClass}`);
    }
    return ceiling;
}

/** The tighter of two classes. */
export function clampToCeiling(privacyClass: PrivacyClass, ceiling: PrivacyClass): PrivacyClass {
    return PRIVACY_EXPOSURE_RANK[privacyClass] <= PRIVACY_EXPOSURE_RANK[ceiling]
        ? privacyClass
        : ceiling;
}

/**
 * What a new write from this extension actually rests at: the user's stored
 * choice (defaulted at the read path) clamped to the extension's ceiling. The
 * preference SELECTS WITHIN the ceiling — it can only ever tighten, never widen.
 */
export function effectivePrivacyClass(extensionId: MExtensionId, stored: unknown): PrivacyClass {
    return clampToCeiling(readDefaultPrivacyClass(stored), privacyCeiling(extensionId));
}
