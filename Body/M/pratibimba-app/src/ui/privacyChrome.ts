/**
 * Coordinate: M' M4' (privacy-class chrome — 25.T25.18, DR-WC-M4-5)
 * Residency: Body/M/pratibimba-app/src/ui/privacyChrome.ts
 * Position (#n): #4 — Context/Type; the per-surface privacy register
 * Actualises: the three-tint privacy register of tranche 25.18. Every Wave-C
 *   M4' surface declares, at mount, WHICH KIND of material it puts on screen —
 *   protected-local body, handle-only reference, or opt-in shared archetype —
 *   and wears the matching border tint plus a title carrying the full
 *   PRIVACY_CLASS string. Per DR-WC-M4-5 the indicator lives on the surface's
 *   own chrome and NEVER in the status bar: 15.10 pins that bar to exactly six
 *   entries, and a privacy indicator is not one of them.
 *
 *   WHERE THE CLASSIFICATIONS COME FROM. Not from reading the panes and
 *   judging. The Track-25 brief ASSIGNS a privacy chrome per widget, on the
 *   widget's own spec line ("Privacy chrome: `mext-privacy-…`"), and that line
 *   is the authority — quoted per row below with its line number. A first cut
 *   of this module inferred classes from pane headers instead and got three
 *   wrong (25.4 and the Arena) and three missing (25.1, 25.14, 25.17). A
 *   privacy class is a claim about what happens to someone's data; it is read
 *   off the spec, never inferred.
 *
 *   Two groups, deliberately separate, because they carry DIFFERENT AUTHORITY:
 *     • SPEC_ASSIGNED_SURFACES — the Track-25 Wave-C set. Class comes from the
 *       brief. 25.16 is spec-EXEMPT ("Privacy chrome: none — indicator only,
 *       no body") and therefore correctly wears nothing.
 *     • CARRIER_EXTENSION_SURFACES — M4' surfaces this carrier has that the
 *       Track-25 brief never classified (they belong to other tracks). Their
 *       class is read off the surface's own header, quoted per row, and is
 *       flagged for the Architect rather than presented as spec law.
 *
 *   DECISION STATUS — DR-WC-M4-5 is **ROUTED, not RATIFIED** (13-decision-
 *   register.md:2084, "user final-validation pending"). What it still asks is
 *   the visual register: border colour vs glyph vs both. This module builds the
 *   border-colour option, which is what the 25.18 brief specifies — it does NOT
 *   settle the decision, and nothing here may be cited as validating it. A
 *   prior close of this tranche was reset as fraudulent for claiming exactly
 *   that.
 * Public surface: PrivacyClass, PRIVACY_CLASSES, PRIVACY_TINT_CLASS,
 *   PRIVACY_GLOSS, privacyTitle, privacyChrome, SPEC_ASSIGNED_SURFACES,
 *   CARRIER_EXTENSION_SURFACES, PRIVACY_CHROME_SURFACES, SPEC_EXEMPT_SURFACES.
 * Does NOT own: the privacy law itself (S0 privacy classes), the session
 *   privacy class (state/stores.ts), the badge components
 *   (ui/PrivacyClassBadge.tsx, panes/omni/PrivacyClassBadge.tsx), or the tint
 *   colours (styles.css + ui/tokens.ts are the token sources).
 * Contract: [[M4'-SPEC]] + rerun tranche [[25.T25.18]]; [[DR-WC-M4-5]] (ROUTED).
 */

/** The three M4 privacy classes, as the m4-nara contract spells them. */
export type PrivacyClass = 'protected_local' | 'protected_local_handle_only' | 'shared_archetype_opt_in';

export const PRIVACY_CLASSES: readonly PrivacyClass[] = Object.freeze([
    'protected_local',
    'protected_local_handle_only',
    'shared_archetype_opt_in'
] as const);

/** The tint class each privacy class wears. These names are CONTRACT — the
 *  25.18 brief spells them out verbatim. */
export const PRIVACY_TINT_CLASS: Readonly<Record<PrivacyClass, string>> = Object.freeze({
    protected_local: 'mext-privacy-protected-local',
    protected_local_handle_only: 'mext-privacy-protected-local-handle-only',
    shared_archetype_opt_in: 'mext-privacy-shared-archetype-opt-in'
});

/** What each class means, in the viewer's terms. The title carries the full
 *  PRIVACY_CLASS string AND this gloss: the raw token alone is not an
 *  accessible label, and the brief asks for the tooltip "for accessibility". */
export const PRIVACY_GLOSS: Readonly<Record<PrivacyClass, string>> = Object.freeze({
    protected_local: 'protected-local content — this never leaves your machine',
    protected_local_handle_only:
        'handle-only — this shows references and metadata, never the protected body',
    shared_archetype_opt_in: 'shared archetype — opt-in material that may cross the public bridge'
});

export function privacyTitle(privacyClass: PrivacyClass): string {
    return `${privacyClass} — ${PRIVACY_GLOSS[privacyClass]}`;
}

/**
 * The chrome a Wave-C surface spreads onto its outer container: the tint class
 * and the title carrying the full PRIVACY_CLASS string.
 *
 * Deliberately NOT a `data-privacy-class` attribute. Several surfaces already
 * expose that attribute with hyphenated values (`protected-local`), asserted by
 * landed specs; emitting a second, underscored one would put two spellings of
 * the same fact in the DOM. The tint class IS the machine-readable declaration
 * the 25.18 brief specifies, so it carries that role alone.
 */
export function privacyChrome(privacyClass: PrivacyClass): {
    readonly className: string;
    readonly title: string;
} {
    return {
        className: PRIVACY_TINT_CLASS[privacyClass],
        title: privacyTitle(privacyClass)
    };
}

export interface PrivacySurface {
    /** Source file, relative to `src/`. */
    readonly file: string;
    readonly privacyClass: PrivacyClass;
    /** Tranche that owns the surface. */
    readonly tranche: string;
    /** Where the class comes from — a quoted spec line, or the surface's own
     *  header for a carrier extension. */
    readonly warrant: string;
}

const SPEC = '25-m4-nara-frontend-deep.md';

/**
 * The Track-25 Wave-C set present in this carrier, each with the class the
 * brief ASSIGNS it. `warrant` quotes the assigning line.
 */
export const SPEC_ASSIGNED_SURFACES: readonly PrivacySurface[] = Object.freeze([
    {
        file: 'panes/DayCalendarPane.tsx',
        privacyClass: 'protected_local',
        tranche: '25.1',
        warrant: `${SPEC}:69 — "Privacy chrome: \`mext-privacy-protected-local\` border-tint (25.18)"`
    },
    {
        file: 'panes/M4SessionCloseCeremonyPane.tsx',
        privacyClass: 'protected_local_handle_only',
        tranche: '25.19',
        warrant: `${SPEC}:245 — "View id: \`m4.nara.sessionCloseCeremony\` (new — modal-class, mounts over current view). Privacy chrome: \`mext-privacy-protected-local-handle-only\`"`
    },
    {
        file: 'panes/M4PsycheAnchorCoherencePane.tsx',
        privacyClass: 'protected_local_handle_only',
        tranche: '25.20',
        warrant: `${SPEC}:253 — "View id: \`m4.nara.psycheAnchorCoherence\` (new). Privacy chrome: \`mext-privacy-protected-local-handle-only\`"`
    },
    {
        file: 'panes/NaraRFactorFretboardPane.tsx',
        privacyClass: 'protected_local',
        tranche: '25.23',
        warrant: `${SPEC}:335 — "View id: \`m4.nara.rfactorFretboard\` (new). Privacy chrome: \`mext-privacy-protected-local\` (a personal traversal record)"`
    },
    {
        file: 'panes/M4PersonalCoordinatePane.tsx',
        privacyClass: 'protected_local',
        tranche: '25.7',
        warrant: `${SPEC}:119 — "View id: \`m4.nara.personalCoordinate\` (new). Privacy chrome: \`mext-privacy-protected-local\`"`
    },
    {
        file: 'panes/PasuWizardPane.tsx',
        privacyClass: 'protected_local',
        tranche: '25.4',
        warrant: `${SPEC}:91 — "View id: \`m4.nara.pasuWizard\` (new). Privacy chrome: \`mext-privacy-protected-local\`"`
    },
    {
        // Found by the 25.21 contribution register: the brief assigns this
        // surface a class, the surface exists and renders a user's NOW
        // inscriptions, and it was wearing no tint at all. An unclassified
        // surface is not a neutral one — it tells the user nothing about what
        // it is showing them.
        file: 'panes/JournalTimelinePane.tsx',
        privacyClass: 'protected_local',
        tranche: '25.3',
        warrant: `${SPEC}:83 — "Privacy chrome: \`mext-privacy-protected-local\`"`
    },
    {
        // Same finding, same pass: the oracle cast surface was unclassified.
        file: 'panes/OraclePane.tsx',
        privacyClass: 'protected_local',
        tranche: '25.8',
        warrant: `${SPEC}:133 — "Privacy chrome: \`mext-privacy-protected-local\`"`
    },
    {
        file: 'panes/OracleHistoryPane.tsx',
        privacyClass: 'protected_local_handle_only',
        tranche: '25.9',
        warrant: `${SPEC}:143 — "View id: \`m4.nara.oracleHistory\` (new). Privacy chrome: \`mext-privacy-protected-local-handle-only\`"`
    },
    {
        file: 'panes/MedicineViewPane.tsx',
        privacyClass: 'protected_local',
        tranche: '25.10',
        warrant: `${SPEC}:157 — "View id: \`m4.nara.medicine\` (new). Privacy chrome: \`mext-privacy-protected-local\`"`
    },
    {
        file: 'panes/TransformContainersPane.tsx',
        privacyClass: 'protected_local',
        tranche: '25.11',
        warrant: `${SPEC}:165 — "View id: \`m4.nara.transformContainers\` (new). Privacy chrome: \`mext-privacy-protected-local\`"`
    },
    {
        file: 'panes/M4LogosCyclePane.tsx',
        privacyClass: 'protected_local',
        tranche: '25.13',
        warrant: `${SPEC}:181 — "View id: \`m4.nara.logosCycle\` (new). Privacy chrome: \`mext-privacy-protected-local\`"`
    },
    {
        file: 'panes/PratibimbaCoordinatePane.tsx',
        privacyClass: 'protected_local_handle_only',
        tranche: '25.14',
        warrant: `${SPEC}:189 — "View id: \`m4.nara.pratibimbaCoordinate\` (new). Privacy chrome: \`mext-privacy-protected-local-handle-only\`"`
    },
    {
        file: 'panes/beingPattern/M4BeingPatternPerspectiveCard.tsx',
        privacyClass: 'protected_local_handle_only',
        tranche: '25.22',
        warrant: `${SPEC}:315 — "View id: \`m4.nara.beingPatternPerspective\` (new). Privacy chrome: \`mext-privacy-protected-local-handle-only\`"`
    },
    {
        file: 'components/TimeAxisSwitcher.tsx',
        privacyClass: 'protected_local',
        tranche: '25.17',
        warrant: `${SPEC}:219 — "View id: \`m4.nara.timeAxisSwitcher\` (new). Privacy chrome: \`mext-privacy-protected-local\`"`
    },
    {
        file: 'panes/M4DialogicalArenaPane.tsx',
        privacyClass: 'protected_local_handle_only',
        tranche: '41.7 (Track-25 surface-contract reservation)',
        warrant: `${SPEC}:62 — "Privacy chrome: \`mext-privacy-protected-local-handle-only\` (dialogue body stays in DOM, never projects globally)"`
    }
]);

/**
 * Surfaces the brief EXEMPTS. They must wear no tint — the absence is the
 * declaration, and the gate proves it stays absent.
 */
export const SPEC_EXEMPT_SURFACES: readonly { readonly file: string; readonly warrant: string }[] =
    Object.freeze([
        {
            file: 'panes/M4MercuriusRelayPane.tsx',
            warrant: `${SPEC}:207 — "Privacy chrome: none (indicator only — no body)"`
        }
    ]);

/**
 * M4' surfaces this carrier carries that the Track-25 brief never classified —
 * they belong to other tracks. Their class is read off the surface's OWN
 * header, quoted per row. These are carrier judgments, not spec law, and are
 * flagged for the Architect: if a class here is wrong, the surface is telling
 * a user something untrue about their data, so it should be confirmed rather
 * than inherited.
 */
export const CARRIER_EXTENSION_SURFACES: readonly PrivacySurface[] = Object.freeze([
    {
        file: 'panes/NaraCanvasEditor.tsx',
        privacyClass: 'protected_local',
        tranche: '11.T11.10 (carrier extension)',
        warrant: 'own header — "the day’s Markdown as a Tiptap canvas with protected-local marks"'
    },
    {
        file: 'panes/NaraAmbientTuning.tsx',
        privacyClass: 'protected_local_handle_only',
        tranche: '11.T11.12 (carrier extension)',
        warrant: 'own header — "strict ambient reads and canonical session-NOW tuning writes" (settings, not body)'
    },
    {
        file: 'panes/M4NaraResonanceSurface.tsx',
        privacyClass: 'protected_local_handle_only',
        tranche: '05.T5.1 (carrier extension)',
        warrant:
            'own header — "sourceHandle stays a title-attribute handle reference (handle-only per DR-M4-3)"'
    }
]);

/**
 * Every surface that wears a tint, both groups. The gate holds this in lockstep
 * with the real sources in both directions.
 *
 * NOTE — `shared_archetype_opt_in` has NO surface. Its rule is part of the
 * three-tint contract and is defined, but the brief assigns it to nothing and
 * no carrier surface renders opt-in-shared material. Force-fitting a personal
 * surface into the shareable class would be the one misclassification with
 * real consequences, so the class waits for a surface that earns it.
 */
export const PRIVACY_CHROME_SURFACES: readonly PrivacySurface[] = Object.freeze([
    ...SPEC_ASSIGNED_SURFACES,
    ...CARRIER_EXTENSION_SURFACES
]);
