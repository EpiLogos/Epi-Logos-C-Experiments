/**
 * Coordinate: M' M4' (Wave-C contribution register — rerun 25.T25.21)
 * Residency: Body/M/pratibimba-app/src/composition/waveCContributions.ts
 * Position (#n): #4 — Context/Type: the type law of "which M4' Wave-C surface
 *   is real, where it is reached, and what it may show".
 * Actualises: one carrier-native register mapping every Wave-C view id the
 *   Track-25 brief names to the surface this carrier actually renders — file,
 *   symbol, test handle, mount mechanism, layout law, privacy class — and, for
 *   the ids nothing renders, a declared gap naming the tranche that owes the
 *   work. The sibling gate (`waveCContributions.test.ts`) reads the real
 *   sources in both directions and fails when a row describes a surface that
 *   is not there, or when a surface exists with no row.
 *
 *   WHY THIS IS A MANIFEST AND NOT WIRING. The brief (`25-…:290`) says the
 *   `plugin-integrated-4-5-0` consumer "reads `TRACK_08_CONTRIBUTION`" and lays
 *   out the personal editor area from it. That is false in the tree it was
 *   written against: `setContributors` is defined at
 *   `epi-theia/extensions/plugin-integrated-4-5-0/src/browser/plugin-integrated-4-5-0-widget.tsx:87`
 *   and called nowhere — so its one assignment to `contributorRecords` is dead
 *   code, and the field never leaves the `[]` it initialises to. So
 *   `TRACK_08_CONTRIBUTION` has zero runtime consumers in any of the six barrels. The carrier's live composition path
 *   (`personalComposition.ts:167` → `compositionLoad.ts:84`) keys on
 *   `CompositionContributor`, which shares NO field with the TRACK_08 row
 *   shape. So there is no wiring to port. What the frozen table was actually
 *   protecting is name-truth — and it failed at that too: five of its 23 names
 *   (`M4ArtifactHandleChip`, `M4RecognitionMiniView`, `M4DayCalendarChip`,
 *   `M4TransformBadge`, `M4LogosChip`) have no definition anywhere in
 *   `m4-nara/src`, because a string literal in an `as const` array is never
 *   type-checked against anything. This register exists to make that class of
 *   lie impossible here: every non-gap row is read back off the real source.
 *
 *   THE THREE PER-EXPORT SEAMS (SPEC:288). The brief requires each export to
 *   declare a `currentStateSelector`, a `selectionHandler` and an
 *   `evidenceSerializer` "with `privacyClass` matching that widget's chrome".
 *   The frozen barrel satisfied that shape by `.map()`ing three templates over
 *   the 23 names (`${BARREL}:122-144`): every selector read the same three
 *   fields from a `shared-bridge` this carrier does not have, every handler
 *   routed to the same `ROUTE_PATH` constant, and every serializer carried the
 *   extension-wide `PRIVACY_CLASS` — so the one requirement the brief states in
 *   words, that the class match the widget, was violated on all nine handle-only
 *   surfaces. Here each seam names the real reader, the real intent target and
 *   the row's own class, and the gate reads all three back off the carrier. They
 *   are non-null EXACTLY on the rows that render: a pending surface has no state
 *   to select and no evidence to serialise, and declaring the seams anyway is
 *   the registered-but-unfired shape this register exists to refuse.
 *
 *   WHY THERE IS NO `layout` COLUMN BUT THERE IS A `layoutLaw`. Updated by
 *   [[52.T4]], which landed the thing this paragraph was written against.
 *   `ideDeepDefault()` now exists and the shell holds four models — one per
 *   (face, layout) cell — so `ide-deep` really does select a distinct pane set
 *   (`ui/deepPaneSet.ts`) and `layoutLaw` stops being vacuous.
 *
 *   IT IS DERIVED FOR EVERY ROW, AND THE DERIVATION IS TOTAL. The first cut of
 *   this paragraph claimed derivation and the gate only delivered it for the 12
 *   tab/nested rows; the other ten were hard-coded twice — once in the row, once
 *   in an `expect(law('x')).toBe(...)` beside it — which is the same assertion
 *   written in two places, not a check. Worse, those duplicates could not go
 *   stale loudly: had the deep layout later CARRIED `personalHome` or `cosmic`,
 *   row and test would have agreed with each other and disagreed with the shell.
 *   So the gate now resolves every mount kind to the HOST SURFACE it really
 *   renders in and reads the law off the pane set:
 *     `flexlayout-tab`    → its own `component`
 *     `nested-section`    → `hostComponent`
 *     `composition-slot`  → `personalHome`, bridged through the `personalHome`
 *                           factory arm rendering the root that runs
 *                           `loadPersonalComposition()` (the bridge is read out
 *                           of `App.tsx` + the engine, not assumed)
 *     `direct-jsx`        → the factory `case` its anchor SITS INSIDE, or, when
 *                           the anchor is a shell-level overlay outside the
 *                           factory, the `activeLayout === …` gate that wraps it
 *     `cross-coordinate`  → its host MODULE resolved to a component key through
 *                           `App.tsx`'s own import + factory arm
 *     `overlay-command`   → no pane host: a command overlay is outside both
 *                           `<Layout>`s, so `both`, and the id must be catalogued
 *     `model-only`/`absent` → no host at all, so `null` (see `layoutLaw`)
 *   Carried ⇒ `both` (every carried surface is in a daily model too), withdrawn
 *   ⇒ `daily-only`, carried-but-absent-from-the-daily-registry ⇒ `deep-only`,
 *   and a host still RESERVED for its 28.x tranche ⇒ `null`, because a surface
 *   in neither layout cannot have a layout law. So a row genuinely cannot claim
 *   a layout the shell does not give it.
 *
 *   Twelve rows are `daily-only` and five are `null` after 52.T4. The
 *   `daily-only` ones share one canon reason —
 *   [[M'-TAURI-PORT-SPEC]] :65, "Shell surfaces preview; subsystem pages
 *   deliver depth. Do not merge them." The deep layout withdraws the two
 *   integrated shell previews (`cosmic`, `personalHome`) and the daily
 *   lived-flow reading surfaces (journal, calendar, oracle, the close ceremony
 *   and its anchor, the personal-coordinate surface). Every M4 row whose host
 *   is one of those follows it into `daily-only`; the M4 DEPTH surfaces
 *   (arena, medicine, transform, logos cycle) are carried and stay `both`.
 *   `deep-only` is now representable — the deep layout is real — and no M4 row
 *   claims it, because every M4 surface that reaches depth is also mounted in
 *   the daily shell. The first honest claimant will be 28.T28.5's control room.
 *
 *   WHY `disposition` IS NULL ON EVERY ROW. Track 52 T5's acceptance
 *   (`52-four-plus-two-layout-layer.md:61`) is that the disposition record must
 *   account for every currently-scattered depth tab — "an unaccounted tab is a
 *   FAIL" — recorded the way `ui/dailySurfaceOwnership.ts` records its own. The
 *   slot is declared here and left null so that T5 fills a field instead of
 *   rewriting a table; the gate asserts it stays null until then.
 * Public surface: WaveCContribution, WaveCMount, WaveCGap, MiniMode, LayoutLaw,
 *   WaveCDisposition, WaveCStateSource, WaveCStateSelector, WaveCSelectionHandler,
 *   WaveCEvidenceSerializer, WaveCConsumerFate, WaveCConsumerSlot,
 *   M4_WAVE_C_CONTRIBUTIONS, INTEGRATED_450_CONSUMER_LAYOUT,
 *   UNENROLLED_FROZEN_EXPORTS, waveCContribution, presentWaveCContributions,
 *   gappedWaveCContributions, speccedConsumerSlots.
 * Does NOT own: the layout domain (`ui/layoutId.ts`), per-layout availability
 *   (`ui/leftSidebarModes.ts`, `panes/omni/omnipanelRuntime.ts`,
 *   `ui/layoutClaims.ts`, `ui/shellSlotPolicy.ts`), the privacy vocabulary or
 *   tints (`ui/privacyChrome.ts`), the composition blocker vocabulary
 *   (`integratedReadinessEnvelope.ts`), the geometric slot law
 *   (`geometricSlotEnforcement.ts`), the personal slot OWNERSHIP declaration
 *   (`personalComposition.ts`, 29.T29.3 — this register reconciles against it
 *   and never restates it), the cross-layout routing table
 *   (`commands/crossLayoutIntent.ts`, 31.T31.10), or any surface's behaviour.
 * Contract: [[M4-SPEC]] · 25-m4-nara-frontend-deep.md (Wave-C briefs) ·
 *   rerun tranche [[25.T25.21]].
 */

import type { PrivacyClass } from '../ui/privacyChrome';
import type { CompositionBlockerId } from './integratedReadinessEnvelope';
import type { PersonalGeometricSlotName } from './personalComposition';

/**
 * Runtime mirrors of two vocabularies this register BORROWS but does not own.
 * Neither upstream module exports a value form, and the gate needs one to check
 * a row against. Each is declared as a TOTAL record, so a member added to
 * `CompositionBlockerId` or `PersonalGeometricSlotName` upstream fails typecheck
 * HERE — the mirror cannot silently fall behind the vocabulary it mirrors, which
 * is the only way a mirror is safe to keep.
 */
const BLOCKER_ID_MIRROR: Readonly<Record<CompositionBlockerId, true>> = Object.freeze({
    'pending-k2-surface': true,
    'pending-cymatic-mount-point': true,
    'pending-codon-rotation-export': true,
    'pending-ananda-vortex': true,
    'pending-psychoid-cymatic-solver': true,
    'pending-recognition-surface': true,
    'pending-q-composed': true,
    'pending-virtue-witness': true,
    'pending-kairos-populator': true,
    'pending-klein-flip': true,
    'pending-resonance72': true,
    'pending-audio-octet': true,
    'pending-nodal-quartet': true
});

const SLOT_NAME_MIRROR: Readonly<Record<PersonalGeometricSlotName, true>> = Object.freeze({
    'left-composition': true,
    'center-composition': true,
    'right-composition': true,
    grounding: true,
    'composition-ambient': true,
    'composition-status': true
});

/** The 29.5 blocker vocabulary, in value form. */
export const KNOWN_COMPOSITION_BLOCKER_IDS: readonly CompositionBlockerId[] = Object.freeze(
    Object.keys(BLOCKER_ID_MIRROR) as CompositionBlockerId[]
);

/** The personal geometric slots, in value form. */
export const KNOWN_PERSONAL_SLOT_NAMES: readonly PersonalGeometricSlotName[] = Object.freeze(
    Object.keys(SLOT_NAME_MIRROR) as PersonalGeometricSlotName[]
);

/**
 * The subsystem domain, declared locally rather than imported from
 * `ui/iconography.ts` where it also lives.
 *
 * NOT a second vocabulary: `waveCContributions.test.ts` asserts this union is
 * identical to `MnSubsystemId`, in both directions, so the two cannot drift.
 * The reason for the copy is mechanical — the browser receipt imports this
 * register to derive its work-list, and `scripts/lint-e2e-import-graph.mjs`
 * walks import statements as text, so a TYPE-ONLY edge into `iconography.ts`
 * (which uses `import.meta.glob`) reads to that gate as if the spec pulled the
 * glob into Playwright's loader. It does not — TypeScript erases `import type`
 * before the loader sees it — but the lint cannot tell, and the cost of being
 * wrong there is the entire e2e suite failing to enumerate. So the register
 * stays free of that edge and the test does the reconciling, where Vite is
 * available and the glob is harmless.
 */
export type WaveCSubsystemId = 'M0' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5';

/**
 * A citation into carrier SOURCE, anchored by content rather than by line.
 *
 * The distinction this type enforces: a SPEC citation is line-exact and quoted,
 * because the design documents are stable and the quote is the claim. A SOURCE
 * citation cannot be, because source moves — the one target this register cites
 * most had moved twice before anyone first checked it. So source is cited by a
 * substring the gate reads back out of the named file. An anchor that stops
 * being true fails the gate; a line number that stops being true fails nobody.
 */
export interface SourceCitation {
    /** Path relative to `src/`. */
    readonly file: string;
    /** A substring the gate looks for in that file. */
    readonly anchor: string;
    /**
     * Invert the check: the anchor must NOT appear in the file.
     *
     * A gap is a claim of ABSENCE, and absence cannot be cited by pointing at a
     * file that contains the thing. The honest citation names the place the
     * surface WOULD be registered if it existed — the shell's component factory,
     * the cross-layout routing table — and proves it is not there. Without this,
     * three gap rows had nothing checkable to cite and fell back to prose.
     */
    readonly mustBeAbsent?: boolean;
}

/** The design source every `warrant` quotes. */
const SPEC = '25-m4-nara-frontend-deep.md';
/** The frozen barrel, cited only where an id predates the Track-25 brief. */
const BARREL = 'epi-theia/extensions/m4-nara/src/common/index.ts';

/**
 * Reduced-fidelity modes, declared ONLY where the brief actually defines what
 * each mode shows for that widget. The frozen barrel froze one triad and
 * `.map()`ed it onto all 23 rows, which carries exactly zero per-widget
 * information; an empty array is a true statement and a copied triad is not.
 * The carrier's one real precedent is `components/M3CosmicWheelRenderService.tsx:76`.
 */
export type MiniMode = 'badge' | 'compact-card' | 'inspector';

/**
 * HOW the surface is reached. A discriminated union because the carrier's
 * reachability mechanisms are genuinely different machines: a FlexLayout tab
 * (`App.tsx::personalDefault`, and since 52.T4 also `::ideDeepDefault` over
 * `ui/deepPaneSet.ts`) is not a command overlay (`App.tsx`'s
 * `identity.openWizard` registration) is not direct JSX in the shell's face
 * slot (the `activeLayout === 'daily-0-1'` overlays) is not a geometric
 * composition slot (`personalComposition.ts`'s `PERSONAL_SLOT_CARRIERS`). Cited by SYMBOL, not by
 * line: 52.T4 moved every one of these line numbers.
 */
export type WaveCMount =
    | {
          readonly kind: 'flexlayout-tab';
          /** Factory key — must appear in a default model AND have a `case` arm. */
          readonly component: string;
          /**
           * The tab's visible label. Carried so the register is enough to DRIVE
           * the surface, not merely describe it: the browser receipt derives its
           * work-list from these rows, so a row cannot claim reachability that
           * nobody ever clicks. The gate pins label and key adjacent in the
           * model, so a rename that touches one and not the other fails.
           */
          readonly tabLabel: string;
          readonly face: 0 | 1;
          readonly region: 'personal-main' | 'personal-left-border';
      }
    | {
          /** A region inside another enrolled surface's pane. */
          readonly kind: 'nested-section';
          readonly hostComponent: string;
          readonly note: string;
      }
    | {
          readonly kind: 'direct-jsx';
          /**
           * The JSX site, SYMBOL-ANCHORED rather than line-numbered. An earlier
           * cut carried `'App.tsx:1306-1308'`; by the time it was first verified
           * the same target had moved twice. A line number in prose is a claim
           * nothing can check and everything can invalidate, so the citation is
           * `{file, anchor}` and the gate reads the file for the anchor.
           */
          readonly site: SourceCitation;
      }
    | {
          readonly kind: 'overlay-command';
          /** Must exist in `commands/catalog.ts`. */
          readonly commandId: string;
      }
    | {
          readonly kind: 'composition-slot';
          readonly slot: PersonalGeometricSlotName;
      }
    | {
          /**
           * Landed, but on another coordinate's face. A quoted ruling is
           * required — otherwise "absorbed elsewhere" is indistinguishable from
           * "missing" — and the quote is backed by a `SourceCitation` so the
           * gate can read it out of the file that decided it.
           */
          readonly kind: 'cross-coordinate';
          readonly host: string;
          readonly ruling: string;
          readonly rulingCitation: SourceCitation;
      }
    | {
          /** The model landed; nothing renders it. */
          readonly kind: 'model-only';
          readonly note: string;
      }
    | { readonly kind: 'absent' };

/**
 * Layout law, DERIVED FROM A REAL GATE rather than asserted — see the header's
 * mount-kind → host table for how each row is resolved. 52.T4 landed
 * `ideDeepDefault()` and `ui/deepPaneSet.ts`, so `deep-only` is representable
 * for the first time AND derivable (carried into depth, absent from the daily
 * registry); nothing claims it yet. The gate holds every row's claim against the
 * pane set the shell really builds rather than against a promise.
 */
export type LayoutLaw = 'both' | 'daily-only' | 'deep-only';

/** Filled by Track 52 T5 when the 4+2 subsystem pages land. Null until then. */
export type WaveCDisposition = 'moves' | 'mirrored' | 'stays-preview';

export interface WaveCGap {
    /**
     * `no-face`      — the intent is real, nothing projects it (DR-FACE-7 fate B).
     * `model-only`   — a module landed, no renderer consumes it.
     * `substrate-dark` — the producer is absent or unusable (DR-FACE-7 fate C).
     */
    readonly kind: 'no-face' | 'model-only' | 'substrate-dark';
    /** The rerun tranche that owes the work. */
    readonly ownerTranche: string;
    /**
     * A registered composition blocker, ONLY when one already covers this gap.
     * The vocabulary is `integratedReadinessEnvelope.ts`'s, never minted here —
     * that registry's own law is that an id naming nothing is worse than no
     * blocker at all, so `null` is the honest value for a gap with no slot.
     */
    readonly compositionBlocker: CompositionBlockerId | null;
    /**
     * The ARGUMENT for the absence, in prose. Prose alone is unfalsifiable, so
     * it may not carry source line numbers (the gate rejects `file.ts:NN` here)
     * and it does not stand alone — `citations` is the checkable half.
     */
    readonly evidence: string;
    /**
     * The checkable half of the evidence: each cited file must exist and must
     * contain its anchor. Required non-empty.
     *
     * This field exists because the first cut let three of six gap rows carry
     * pure prose while the field's own doc promised `file:line`, and the gate
     * only measured the string's LENGTH — so a fabricated paragraph passed. An
     * anchor is a substring a reader can grep and a test can prove.
     */
    readonly citations: readonly SourceCitation[];
}

/**
 * WHERE a surface's current state really comes from in this carrier.
 *
 * The frozen contract declared one `currentStateSelectors` row per export,
 * every one of them `{source: 'shared-bridge', reads: ['profile','readiness',
 * 'coordinateContext']}` — a template `.map()`ed across 23 names, so it says
 * nothing about any of them. This carrier has no `shared-bridge`; it has four
 * real state sources and a gateway, and which one a surface reads is a fact
 * about that surface. `waveCContributions.test.ts` reads the carrier file back
 * and fails when the declared reader is not in it.
 */
export type WaveCStateSource =
    | 'composition-profile'
    | 'tick-store'
    | 'session-store'
    | 'provenance-store'
    | 'gateway-rpc';

export interface WaveCStateSelector {
    /** The frozen contract's id form, kept so the contract name survives. */
    readonly id: string;
    readonly source: WaveCStateSource;
    /** The hook or call symbol the carrier file really invokes. */
    readonly reader: string;
    /**
     * The field or method names it really pulls. Each must appear in the
     * carrier file, so a selector cannot outlive the read it names.
     */
    readonly reads: readonly string[];
}

export interface WaveCSelectionHandler {
    /** `<viewId>SelectionHandler`, per the frozen contract's naming. */
    readonly id: string;
    /** `<viewId>.selection`, per the frozen contract. */
    readonly inputKind: string;
    /**
     * The registered cross-layout intent that routes a selection to THIS
     * surface. The frozen contract gave all 23 handlers the same `ROUTE_PATH`
     * constant (`/m4-nara/artifact`), which is not a route to any of them. The
     * carrier's real routing spine is `CROSS_LAYOUT_INTENT_TARGETS`, and a
     * target either exists and lands on this surface's own component or it does
     * not — there is no third state. The gate resolves the target and compares
     * its component to the row's mount, in the carrier's own table.
     */
    readonly intentTarget: { readonly extensionId: string; readonly contributionId: string } | null;
    /** Required exactly when `intentTarget` is null: why nothing routes here. */
    readonly unrouted: string | null;
}

export interface WaveCEvidenceSerializer {
    /** `<viewId>.evidenceSerializer`, per the frozen contract. */
    readonly id: string;
    /** `<viewId>.evidence`, per the frozen contract. */
    readonly evidenceKind: string;
    /**
     * SPEC:288 requires this to match "that widget's chrome". The frozen
     * contract set every serializer to the extension-wide `PRIVACY_CLASS`
     * constant instead, so nine handle-only surfaces were serialising evidence
     * under a protected-local class. Here it is the row's own class and the
     * gate asserts the identity, which is the only way the requirement can hold.
     */
    readonly privacyClass: PrivacyClass | null;
    /**
     * The one thing in the carrier file that actually carries this surface's
     * evidence handle — a stamped `data-…` attribute, or a rendered handle
     * component. Read back off the source. A handle-only surface MUST have one:
     * handle-only means the surface's whole job is showing handles, so one with
     * nothing carrying a handle is a class with no referent.
     */
    readonly handleAttribute: string | null;
}

const selector = (
    viewId: string,
    source: WaveCStateSource,
    reader: string,
    reads: readonly string[]
): WaveCStateSelector =>
    Object.freeze({ id: `${viewId}.currentProfile`, source, reader, reads: Object.freeze([...reads]) });

const routed = (viewId: string, extensionId: string, contributionId: string): WaveCSelectionHandler =>
    Object.freeze({
        id: `${viewId}SelectionHandler`,
        inputKind: `${viewId}.selection`,
        intentTarget: Object.freeze({ extensionId, contributionId }),
        unrouted: null
    });

const unrouted = (viewId: string, reason: string): WaveCSelectionHandler =>
    Object.freeze({
        id: `${viewId}SelectionHandler`,
        inputKind: `${viewId}.selection`,
        intentTarget: null,
        unrouted: reason
    });

const evidence = (
    viewId: string,
    privacyClass: PrivacyClass | null,
    handleAttribute: string | null
): WaveCEvidenceSerializer =>
    Object.freeze({
        id: `${viewId}.evidenceSerializer`,
        evidenceKind: `${viewId}.evidence`,
        privacyClass,
        handleAttribute
    });

export interface WaveCContribution {
    readonly subsystem: WaveCSubsystemId;
    /**
     * The brief's `View id:` string. Where the brief and the frozen barrel
     * disagree the brief wins: the barrel is read-only reference, and a view id
     * is content, so it resolves to the design-recon section that assigns it.
     */
    readonly viewId: string;
    /** The frozen TRACK_08 export name, carried as lineage only. */
    readonly frozenExport: string | null;
    /** The tranche that OWNS the surface per the brief. */
    readonly tranche: string;
    /**
     * Set when the surface is live but `tranche` has not closed — names what
     * actually landed it. Without this the register would launder pending
     * siblings as delivered.
     */
    readonly landedBy: string | null;
    /** Real carrier file (relative to `src/`) and exported symbol. */
    readonly carrier: { readonly file: string; readonly symbol: string } | null;
    /** The stable handle a browser receipt drives. Required on every real row. */
    readonly testid: string | null;
    readonly mount: WaveCMount;
    /**
     * NULL when the row renders NOWHERE. A surface with no host has no layout
     * reach, so `both` would be a claim about two layouts it does not appear in
     * — the registered-but-unfired shape this register refuses. The sibling gate
     * derives this field for every row and requires `null` exactly here.
     */
    readonly layoutLaw: LayoutLaw | null;
    /** Null ONLY for a surface in `privacyChrome.ts`'s `SPEC_EXEMPT_SURFACES`. */
    readonly privacyClass: PrivacyClass | null;
    readonly miniModes: readonly MiniMode[];
    /** Required iff `miniModes` is non-empty: the line DEFINING the modes. */
    readonly miniModeWarrant: string | null;
    /**
     * The three per-export seams SPEC:288 requires, each carried ONLY where the
     * surface is live in this carrier: non-null exactly when `carrier` is set
     * and `gap` is null. A pending surface has no state to select, no selection
     * to route and no evidence to serialise, and declaring the seams anyway is
     * the registered-but-unfired shape this whole register exists to refuse.
     */
    readonly currentStateSelector: WaveCStateSelector | null;
    readonly selectionHandler: WaveCSelectionHandler | null;
    readonly evidenceSerializer: WaveCEvidenceSerializer | null;
    /** A quoted spec (or barrel) line, with its line number, naming `viewId`. */
    readonly warrant: string;
    readonly gap: WaveCGap | null;
    /** Track 52 T5 fills this. Null on every row today. */
    readonly disposition: WaveCDisposition | null;
}

/**
 * Every M4' Wave-C view id, in brief order.
 *
 * Three ids the frozen barrel carries do NOT appear here, each for a stated
 * reason rather than by omission:
 *   - `m4.nara.transform` (`${BARREL}:76`) — the brief assigns
 *     `m4.nara.transformContainers` (`${SPEC}:165`) and the carrier already
 *     emits that; the barrel's short form loses.
 *   - `m4.nara.kairosWheel` (`${BARREL}:80`) — the brief assigns
 *     `m4.nara.kairosDisplay` (`${SPEC}:197`). One id, not both.
 *   - `m4.nara.journalTimeline` (`${BARREL}:21`) — a second id for a surface
 *     the brief already names `m4.nara.journalEntries` (`${SPEC}:83`), which
 *     the barrel's own hand-added constant agrees with (`${BARREL}:55`).
 * `m4.nara.sessionBreakdown` (`${BARREL}:20`) is likewise not minted: the 25.2
 * brief assigns no view id, and the carrier's session breakdown is a section of
 * the day container, so it is enrolled under `m4.nara.dayContainer`.
 */
export const M4_WAVE_C_CONTRIBUTIONS: readonly WaveCContribution[] = Object.freeze([
    {
        subsystem: 'M4',
        viewId: 'm4.nara.dayCalendar',
        frozenExport: 'M4DayCalendarChip',
        tranche: '25.T25.1',
        landedBy: null,
        carrier: { file: 'panes/DayCalendarPane.tsx', symbol: 'DayCalendarPane' },
        testid: 'day-calendar',
        mount: { kind: 'flexlayout-tab', component: 'dayCalendar', tabLabel: 'Calendar', face: 1, region: 'personal-left-border' },
        layoutLaw: 'daily-only',
        privacyClass: 'protected_local',
        miniModes: ['badge', 'compact-card', 'inspector'],
        miniModeWarrant: `${SPEC}:69 — "badge mode: month-day chip; compact-card: week-strip; inspector: full month"`,
        warrant: `${SPEC}:69 — "View id: \`m4.nara.dayCalendar\` (new — extend \`ALL_VIEW_IDS\` in \`src/common/index.ts:11\`)"`,
        currentStateSelector: selector('m4.nara.dayCalendar', 'session-store', 'useSessionStore', ['dayNow']),
        selectionHandler: routed('m4.nara.dayCalendar', 'm4-nara', 'dayCalendar'),
        evidenceSerializer: evidence('m4.nara.dayCalendar', 'protected_local', 'data-provenance'),
        gap: null,
        disposition: null
    },
    {
        subsystem: 'M4',
        viewId: 'm4.nara.dayContainer',
        frozenExport: 'M4SessionBreakdownCard',
        tranche: '25.T25.2',
        landedBy: null,
        carrier: { file: 'panes/DayCalendarPane.tsx', symbol: 'day-container' },
        testid: 'day-container',
        mount: {
            kind: 'nested-section',
            hostComponent: 'dayCalendar',
            note: 'The 25.2 brief assigns no view id; it extends the widget whose view is the pre-existing day container, and the carrier renders it as the `day-container` section of the calendar pane, revealed by selecting a day.'
        },
        layoutLaw: 'daily-only',
        privacyClass: 'protected_local_handle_only',
        miniModes: [],
        miniModeWarrant: null,
        warrant: `${BARREL}:17 — the pre-existing \`m4.nara.dayContainer\` view id; class from ${SPEC}:75 — "Privacy chrome: \`mext-privacy-protected-local-handle-only\`"`,
        currentStateSelector: selector('m4.nara.dayContainer', 'session-store', 'useSessionStore', ['dayNow']),
        selectionHandler: unrouted(
            'm4.nara.dayContainer',
            'A nested section is entered by selecting a day inside its host, not addressed from outside. Minting an intent target for it would give one section two competing entry points, and the host already has one.'
        ),
        evidenceSerializer: evidence(
            'm4.nara.dayContainer',
            'protected_local_handle_only',
            'data-protected-bodies-rendered'
        ),
        gap: null,
        disposition: null
    },
    {
        subsystem: 'M4',
        viewId: 'm4.nara.journalEntries',
        frozenExport: 'M4JournalTimelineCard',
        tranche: '25.T25.3',
        landedBy: '03.T3.2 (the pane header names plan T3.2 as what built it)',
        carrier: { file: 'panes/JournalTimelinePane.tsx', symbol: 'JournalTimelinePane' },
        testid: 'journal-timeline',
        mount: { kind: 'flexlayout-tab', component: 'journalTimeline', tabLabel: 'Journal', face: 1, region: 'personal-left-border' },
        layoutLaw: 'daily-only',
        privacyClass: 'protected_local',
        miniModes: [],
        miniModeWarrant: null,
        warrant: `${SPEC}:83 — "View id: \`m4.nara.journalEntries\` (new — extend \`ALL_VIEW_IDS\`)"`,
        currentStateSelector: selector('m4.nara.journalEntries', 'session-store', 'useSessionStore', ['dayNow']),
        selectionHandler: routed('m4.nara.journalEntries', 'm4-nara', 'journalEntries'),
        evidenceSerializer: evidence('m4.nara.journalEntries', 'protected_local', null),
        gap: null,
        disposition: null
    },
    {
        subsystem: 'M4',
        viewId: 'm4.nara.pasuWizard',
        frozenExport: 'M4PasuWizardBadge',
        tranche: '25.T25.4',
        landedBy: null,
        carrier: { file: 'panes/PasuWizardPane.tsx', symbol: 'PasuWizardPane' },
        testid: 'pasu-wizard',
        mount: { kind: 'overlay-command', commandId: 'identity.openWizard' },
        layoutLaw: 'both',
        privacyClass: 'protected_local',
        miniModes: ['badge', 'compact-card', 'inspector'],
        miniModeWarrant: `${SPEC}:91 — "badge mode shows completion %; compact-card shows current-step summary; inspector shows full stepper"`,
        warrant: `${SPEC}:91 — "View id: \`m4.nara.pasuWizard\` (new)"`,
        currentStateSelector: selector('m4.nara.pasuWizard', 'gateway-rpc', 'PASU_SHOW_RPC', [
            'nara.pasu.show',
            'nara.pasu.set'
        ]),
        selectionHandler: unrouted(
            'm4.nara.pasuWizard',
            'The wizard is an overlay opened by the `identity.openWizard` command, and no cross-layout intent target names it. A selection elsewhere does not land IN the wizard; it opens it, which the mount already records.'
        ),
        evidenceSerializer: evidence('m4.nara.pasuWizard', 'protected_local', 'data-step-key'),
        gap: null,
        disposition: null
    },
    {
        subsystem: 'M4',
        viewId: 'm4.nara.quintessence',
        frozenExport: 'M4QuintessenceChip',
        tranche: '25.T25.5',
        landedBy: '25.T25.19 (the Möbius-return section of the close ceremony carries the handle read)',
        carrier: { file: 'panes/M4SessionCloseCeremonyPane.tsx', symbol: 'ceremony-quintessence-handle' },
        testid: 'ceremony-quintessence-handle',
        mount: {
            kind: 'nested-section',
            hostComponent: 'sessionCloseCeremony',
            note: 'The quintessence reaches the user as the `ceremony-quintessence-handle` line inside the ceremony, not as a standalone chip. Handle-form only: the hash and clock, never the reflection body.'
        },
        layoutLaw: 'daily-only',
        privacyClass: 'protected_local_handle_only',
        miniModes: [],
        miniModeWarrant: null,
        warrant: `${SPEC}:99 — "View id: \`m4.nara.quintessence\` (new)"`,
        currentStateSelector: selector('m4.nara.quintessence', 'tick-store', 'useTickStore', ['profile']),
        selectionHandler: unrouted(
            'm4.nara.quintessence',
            'The quintessence is a handle line inside the ceremony, reached by opening the ceremony. No intent target addresses it, and one would duplicate the ceremony tab as an entry point.'
        ),
        evidenceSerializer: evidence(
            'm4.nara.quintessence',
            'protected_local_handle_only',
            'data-session-key'
        ),
        gap: null,
        disposition: null
    },
    {
        subsystem: 'M4',
        viewId: 'm4.nara.personalField',
        frozenExport: 'M4PersonalCymaticField',
        tranche: '25.T25.6',
        landedBy: null,
        carrier: null,
        testid: null,
        mount: { kind: 'composition-slot', slot: 'center-composition' },
        layoutLaw: 'daily-only',
        privacyClass: 'protected_local_handle_only',
        miniModes: [],
        miniModeWarrant: null,
        warrant: `${SPEC}:107 — "View id is the existing \`m4.nara.personalField\`"`,
        currentStateSelector: null,
        selectionHandler: null,
        evidenceSerializer: null,
        gap: {
            kind: 'no-face',
            ownerTranche: '25.T25.6',
            compositionBlocker: 'pending-psychoid-cymatic-solver',
            evidence:
                'personalComposition.ts — the center-composition slot is owned by m4-nara and has no renderer; the blocker is already registered against the slot.',
            citations: [
                { file: 'composition/personalComposition.ts', anchor: "'center-composition': 'pending-psychoid-cymatic-solver'" },
                { file: 'panes/M2CorrespondencePane.tsx', anchor: 'CymaticField' }
            ],
        },
        disposition: null
    },
    {
        subsystem: 'M4',
        viewId: 'm4.nara.personalCoordinate',
        frozenExport: 'M4PersonalCoordinateBadge',
        tranche: '25.T25.7',
        landedBy: null,
        carrier: null,
        testid: null,
        mount: { kind: 'absent' },
        layoutLaw: null,
        privacyClass: 'protected_local',
        miniModes: [],
        miniModeWarrant: null,
        warrant: `${SPEC}:119 — "View id: \`m4.nara.personalCoordinate\` (new)"`,
        currentStateSelector: null,
        selectionHandler: null,
        evidenceSerializer: null,
        gap: {
            kind: 'no-face',
            ownerTranche: '25.T25.7',
            compositionBlocker: null,
            evidence:
                'crossLayoutIntent.ts routes the m4-nara/personalCoordinate INTENT to the pratibimbaCoordinate component, but that pane renders the handle panel, the consent editor and the proposals list — none of the four items 25.7 assigns (resonance score, ConjugateFormCharacter, four L2-ordered element glyphs, dominant chakra + sun-decan planet). The intent is real; the face is not. Enrolling this under the 25.14 row would close a pending tranche by adjacency.',
            citations: [
                { file: 'commands/crossLayoutIntent.ts', anchor: "target('m4-nara', 'personalCoordinate'" },
                { file: 'panes/PratibimbaCoordinatePane.tsx', anchor: 'data-testid="consent-editor"' },
                { file: 'panes/PratibimbaCoordinatePane.tsx', anchor: 'data-testid="personal-handle-panel"' }
            ],
        },
        disposition: null
    },
    {
        subsystem: 'M4',
        viewId: 'm4.nara.oracleCast',
        frozenExport: 'M4OracleCastBadge',
        tranche: '25.T25.8',
        landedBy: '05.T5.1 / 05.T5.11 (the pane header cites the oracle-modality tranches, not 25.8)',
        carrier: { file: 'panes/OraclePane.tsx', symbol: 'OraclePane' },
        testid: 'oracle-pane',
        mount: { kind: 'flexlayout-tab', component: 'oracle', tabLabel: 'Oracle', face: 1, region: 'personal-left-border' },
        layoutLaw: 'daily-only',
        privacyClass: 'protected_local',
        miniModes: [],
        miniModeWarrant: null,
        warrant: `${SPEC}:133 — "View id: \`m4.nara.oracleCast\` (new)"`,
        currentStateSelector: selector('m4.nara.oracleCast', 'tick-store', 'useTickStore', ['profile']),
        selectionHandler: routed('m4.nara.oracleCast', 'm4-nara', 'oracle'),
        evidenceSerializer: evidence('m4.nara.oracleCast', 'protected_local', '<ProvenanceBadge'),
        gap: null,
        disposition: null
    },
    {
        subsystem: 'M4',
        viewId: 'm4.nara.oracleHistory',
        frozenExport: 'M4OracleHistoryCard',
        tranche: '25.T25.9',
        landedBy: null,
        carrier: { file: 'panes/OracleHistoryPane.tsx', symbol: 'OracleHistoryPane' },
        testid: 'oracle-history',
        mount: {
            kind: 'nested-section',
            hostComponent: 'oracle',
            note: 'History belongs beside the cast that makes it, and `personal-main` is at its tab-strip limit, so the viewer nests in the Oracle pane rather than claiming an eleventh tab — the same discipline the day container uses (25.2). It reads the REAL S0 cast ledger through `nara.oracle.history` + `nara.oracle.hygiene`. TWO BRIEF CLAUSES ARE DISCLOSED RATHER THAN PAINTED: `show_history` drops `cast_at`, so only the newest row\u2019s 4h decay window is computable (from the hygiene line\u2019s minutes-ago) and older rows read `decay unknown` instead of an assumed `closed`; and the 5.17 spread-position aliveness join has no producer at any coordinate (`nara.oracle.update_position_state` is unserved), so the badge is absent and the pane names the missing wire.'
        },
        layoutLaw: 'daily-only',
        privacyClass: 'protected_local_handle_only',
        miniModes: [],
        miniModeWarrant: null,
        warrant: `${SPEC}:143 — "View id: \`m4.nara.oracleHistory\` (new)"`,
        currentStateSelector: selector('m4.nara.oracleHistory', 'tick-store', 'useTickStore', [
            'generation'
        ]),
        selectionHandler: unrouted(
            'm4.nara.oracleHistory',
            'A read-only record of casts already lived — a selection never travels INTO it, and its rows carry handles rather than routes because the brief\u2019s click-through target (25.8 read-only mode) is a mode the cast surface does not have. No intent target is registered rather than one that lands nowhere.'
        ),
        evidenceSerializer: evidence('m4.nara.oracleHistory', 'protected_local_handle_only', 'data-decay'),
        gap: null,
        disposition: null
    },
    {
        subsystem: 'M4',
        viewId: 'm4.nara.medicine',
        frozenExport: 'M4MedicineCard',
        tranche: '25.T25.10',
        landedBy: null,
        carrier: { file: 'panes/MedicineViewPane.tsx', symbol: 'MedicineViewPane' },
        testid: 'medicine-pane',
        mount: { kind: 'flexlayout-tab', component: 'medicineView', tabLabel: 'Medicine', face: 1, region: 'personal-main' },
        layoutLaw: 'both',
        privacyClass: 'protected_local',
        miniModes: [],
        miniModeWarrant: null,
        warrant: `${SPEC}:157 — "View id: \`m4.nara.medicine\` (new)"`,
        currentStateSelector: selector('m4.nara.medicine', 'tick-store', 'useTickStore', [
            'profile',
            'generation'
        ]),
        selectionHandler: routed('m4.nara.medicine', 'm4-nara', 'medicine'),
        evidenceSerializer: evidence('m4.nara.medicine', 'protected_local', 'data-owner-coordinate'),
        gap: null,
        disposition: null
    },
    {
        subsystem: 'M4',
        viewId: 'm4.nara.transformContainers',
        frozenExport: 'M4TransformBadge',
        tranche: '25.T25.11',
        landedBy: null,
        carrier: { file: 'panes/TransformContainersPane.tsx', symbol: 'M4TransformBadge' },
        testid: 'transform-containers-pane',
        mount: { kind: 'flexlayout-tab', component: 'transformContainers', tabLabel: 'Transform', face: 1, region: 'personal-main' },
        layoutLaw: 'both',
        privacyClass: 'protected_local',
        miniModes: [],
        miniModeWarrant: null,
        warrant: `${SPEC}:165 — "View id: \`m4.nara.transformContainers\` (new)"`,
        currentStateSelector: selector('m4.nara.transformContainers', 'gateway-rpc', 'gatewayReady', [
            'TRANSFORM_START_METHOD',
            'TRANSFORM_ADVANCE_METHOD'
        ]),
        selectionHandler: unrouted(
            'm4.nara.transformContainers',
            'FINDING: `m4-nara/transform` IS registered (crossLayoutIntent.ts:118) but resolves to the `personalHome` composition, not to the `transformContainers` tab this surface owns. So a cross-layout selection for M4 transform lands on the Now composition instead. Recorded rather than repaired: the target table is Track 31\'s routing spine (31.T31.10) and retargeting an entry is that track\'s behavioural change, not a side effect of enrolling a row here.'
        ),
        evidenceSerializer: evidence('m4.nara.transformContainers', 'protected_local', 'data-view-id'),
        gap: null,
        disposition: null
    },
    {
        subsystem: 'M4',
        viewId: 'm4.nara.lensApplication',
        frozenExport: 'M4LensCard',
        tranche: '25.T25.12',
        landedBy: null,
        carrier: { file: 'panes/m4LensApplication.ts', symbol: 'buildLensReadingCard' },
        testid: null,
        mount: {
            kind: 'model-only',
            note: 'The lens-application model landed with its own unit test and nothing else. Its only importer in the whole carrier is its sibling test file.'
        },
        layoutLaw: null,
        privacyClass: 'protected_local_handle_only',
        miniModes: [],
        miniModeWarrant: null,
        warrant: `${SPEC}:175 — "View id: \`m4.nara.lensApplication\` (new)"`,
        currentStateSelector: null,
        selectionHandler: null,
        evidenceSerializer: null,
        gap: {
            kind: 'model-only',
            ownerTranche: '25.T25.12',
            compositionBlocker: null,
            evidence:
                'panes/m4LensApplication.ts has zero non-test importers, and crossLayoutIntent.ts routes m4-nara/lens to the personalHome composition rather than to a lens surface. The model also mints a fourth privacy spelling of its own (`LENS_READING_PRIVACY_CLASS`), which is further evidence it was never wired to the register.',
            citations: [
                { file: 'panes/m4LensApplication.ts', anchor: 'buildLensReadingCard' },
                { file: 'panes/m4LensApplication.ts', anchor: 'LENS_READING_PRIVACY_CLASS' },
                { file: 'commands/crossLayoutIntent.ts', anchor: "target('m4-nara', 'lens'" }
            ],
        },
        disposition: null
    },
    {
        subsystem: 'M4',
        viewId: 'm4.nara.logosCycle',
        frozenExport: 'M4LogosChip',
        tranche: '25.T25.13',
        landedBy: null,
        carrier: { file: 'panes/M4LogosCyclePane.tsx', symbol: 'M4LogosChip' },
        testid: 'm4-logos-cycle',
        mount: { kind: 'flexlayout-tab', component: 'logosCycle', tabLabel: 'Logos', face: 1, region: 'personal-main' },
        layoutLaw: 'both',
        privacyClass: 'protected_local',
        miniModes: [],
        miniModeWarrant: null,
        warrant: `${SPEC}:181 — "View id: \`m4.nara.logosCycle\` (new)"`,
        currentStateSelector: selector('m4.nara.logosCycle', 'provenance-store', 'useProvenanceStore', [
            'connection'
        ]),
        selectionHandler: unrouted(
            'm4.nara.logosCycle',
            'FINDING: `m4-nara/logos` IS registered (crossLayoutIntent.ts:120) but resolves to the `personalHome` composition, not to the `logosCycle` tab this surface owns — the same drift as `m4-nara/transform`, in the same table. Recorded, not repaired, for the same reason: Track 31 owns that spine.'
        ),
        evidenceSerializer: evidence('m4.nara.logosCycle', 'protected_local', 'data-view-id'),
        gap: null,
        disposition: null
    },
    {
        subsystem: 'M4',
        viewId: 'm4.nara.pratibimbaCoordinate',
        frozenExport: 'M4PratibimbaCoordinateBadge',
        tranche: '25.T25.14',
        landedBy: null,
        carrier: { file: 'panes/PratibimbaCoordinatePane.tsx', symbol: 'PratibimbaCoordinatePane' },
        testid: 'pratibimba-coordinate-pane',
        mount: { kind: 'flexlayout-tab', component: 'pratibimbaCoordinate', tabLabel: 'Coordinate', face: 1, region: 'personal-main' },
        layoutLaw: 'daily-only',
        privacyClass: 'protected_local_handle_only',
        miniModes: [],
        miniModeWarrant: null,
        warrant: `${SPEC}:189 — "View id: \`m4.nara.pratibimbaCoordinate\` (new)"`,
        currentStateSelector: selector('m4.nara.pratibimbaCoordinate', 'tick-store', 'useTickStore', [
            'profile'
        ]),
        selectionHandler: routed('m4.nara.pratibimbaCoordinate', 'm4-nara', 'personalCoordinate'),
        evidenceSerializer: evidence(
            'm4.nara.pratibimbaCoordinate',
            'protected_local_handle_only',
            'extractPersonalHandles'
        ),
        gap: null,
        disposition: null
    },
    {
        subsystem: 'M4',
        viewId: 'm4.nara.kairosDisplay',
        frozenExport: 'M4KairosWheel',
        tranche: '25.T25.15',
        landedBy: null,
        carrier: null,
        testid: null,
        mount: {
            kind: 'cross-coordinate',
            host: 'engine/CosmicEngine.tsx',
            ruling:
                "25.15's kairos wheel was absorbed by the cosmic face and 25.16's Mercurius chip by the daily face (both DR-FACE-7 fate-A carries), and neither renders on the personal pole.",
            rulingCitation: {
                file: 'composition/personalComposition.ts',
                anchor: "25.15's kairos wheel was absorbed by"
            }
        },
        layoutLaw: 'daily-only',
        privacyClass: 'protected_local',
        miniModes: [],
        miniModeWarrant: null,
        warrant: `${SPEC}:197 — "View id: \`m4.nara.kairosDisplay\` (new)"`,
        currentStateSelector: null,
        selectionHandler: null,
        evidenceSerializer: null,
        gap: null,
        disposition: null
    },
    {
        subsystem: 'M4',
        viewId: 'm4.nara.mercuriusRelay',
        frozenExport: 'M4MercuriusRelayChip',
        tranche: '25.T25.16',
        landedBy: null,
        carrier: { file: 'panes/M4MercuriusRelayPane.tsx', symbol: 'M4MercuriusRelayChip' },
        testid: 'm4-mercurius-relay',
        mount: {
            kind: 'direct-jsx',
            site: { file: 'App.tsx', anchor: '<M4MercuriusRelayChip />' }
        },
        layoutLaw: 'daily-only',
        privacyClass: null,
        miniModes: [],
        miniModeWarrant: null,
        warrant: `${SPEC}:207 — "View id: \`m4.nara.mercuriusRelay\` (new)"`,
        currentStateSelector: selector('m4.nara.mercuriusRelay', 'tick-store', 'useTickStore', ['profile']),
        selectionHandler: unrouted(
            'm4.nara.mercuriusRelay',
            'Shell chrome on the cosmic face, not a selectable destination. No intent target names it, and per SPEC:207 it is an indicator with no body, so there is nothing for a selection to open.'
        ),
        evidenceSerializer: evidence('m4.nara.mercuriusRelay', null, 'data-pulse-seq'),
        gap: null,
        disposition: null
    },
    {
        subsystem: 'M4',
        viewId: 'm4.nara.timeAxisSwitcher',
        frozenExport: 'M4TimeAxisSwitcherChip',
        tranche: '25.T25.17',
        landedBy: null,
        carrier: { file: 'components/TimeAxisSwitcher.tsx', symbol: 'TimeAxisSwitcher' },
        testid: 'time-axis-switcher',
        mount: {
            kind: 'direct-jsx',
            // 52.T5: the `personalHome` case body moved into HomePane so Home
            // can carry the subsystems-grid toggle; the ambient switcher now
            // renders above the engine there, one import deep.
            site: { file: 'panes/HomePane.tsx', anchor: '<TimeAxisSwitcher />' }
        },
        layoutLaw: 'daily-only',
        privacyClass: 'protected_local',
        miniModes: [],
        miniModeWarrant: null,
        warrant: `${SPEC}:219 — "View id: \`m4.nara.timeAxisSwitcher\` (new)"`,
        currentStateSelector: selector('m4.nara.timeAxisSwitcher', 'tick-store', 'useTickStore', [
            'generation'
        ]),
        selectionHandler: unrouted(
            'm4.nara.timeAxisSwitcher',
            'The ambient control above the personal composition, not a selectable destination. It sets a reading mode; a selection does not travel INTO it, so no intent target is registered and minting one would invent a route nothing uses.'
        ),
        evidenceSerializer: evidence('m4.nara.timeAxisSwitcher', 'protected_local', 'data-mode'),
        gap: null,
        disposition: null
    },
    {
        subsystem: 'M4',
        viewId: 'm4.nara.sessionCloseCeremony',
        frozenExport: 'M4SessionCloseCeremonyCard',
        tranche: '25.T25.19',
        landedBy: null,
        carrier: { file: 'panes/M4SessionCloseCeremonyPane.tsx', symbol: 'M4SessionCloseCeremonyPane' },
        testid: 'session-close-ceremony',
        mount: { kind: 'flexlayout-tab', component: 'sessionCloseCeremony', tabLabel: 'Session close', face: 1, region: 'personal-left-border' },
        layoutLaw: 'daily-only',
        privacyClass: 'protected_local_handle_only',
        miniModes: [],
        miniModeWarrant: null,
        warrant: `${SPEC}:245 — "View id: \`m4.nara.sessionCloseCeremony\` (new — modal-class, mounts over current view)"`,
        currentStateSelector: selector('m4.nara.sessionCloseCeremony', 'session-store', 'useSessionStore', [
            'sessionKey'
        ]),
        selectionHandler: unrouted(
            'm4.nara.sessionCloseCeremony',
            'No cross-layout intent target names the ceremony. Its own tab is the entry point, and the surface is ceremonial — it never mutates state, so routing a selection into it would carry a selection nothing acts on.'
        ),
        evidenceSerializer: evidence(
            'm4.nara.sessionCloseCeremony',
            'protected_local_handle_only',
            'data-session-key'
        ),
        gap: null,
        disposition: null
    },
    {
        subsystem: 'M4',
        viewId: 'm4.nara.psycheAnchorCoherence',
        frozenExport: 'M4PsycheAnchorCoherenceCard',
        tranche: '25.T25.20',
        landedBy: null,
        carrier: { file: 'panes/M4PsycheAnchorCoherencePane.tsx', symbol: 'M4PsycheAnchorCoherencePane' },
        testid: 'psyche-anchor-coherence',
        mount: { kind: 'flexlayout-tab', component: 'psycheAnchorCoherence', tabLabel: 'Anchor', face: 1, region: 'personal-left-border' },
        layoutLaw: 'daily-only',
        privacyClass: 'protected_local_handle_only',
        miniModes: [],
        miniModeWarrant: null,
        warrant: `${SPEC}:253 — "View id: \`m4.nara.psycheAnchorCoherence\` (new)"`,
        currentStateSelector: selector('m4.nara.psycheAnchorCoherence', 'session-store', 'useSessionStore', [
            'sessionKey'
        ]),
        selectionHandler: unrouted(
            'm4.nara.psycheAnchorCoherence',
            'No cross-layout intent target names the coherence panel. It is a read-only reading of the session the shell already holds, so it has no selection to receive from elsewhere; its own tab is the entry point.'
        ),
        evidenceSerializer: evidence(
            'm4.nara.psycheAnchorCoherence',
            'protected_local_handle_only',
            'data-session-key'
        ),
        gap: null,
        disposition: null
    },
    {
        subsystem: 'M4',
        viewId: 'm4.nara.beingPatternPerspective',
        frozenExport: 'M4BeingPatternPerspectiveCard',
        tranche: '25.T25.22',
        landedBy: null,
        carrier: {
            file: 'panes/beingPattern/M4BeingPatternPerspectiveCard.tsx',
            symbol: 'M4BeingPatternPerspectiveCard'
        },
        testid: 'being-pattern-perspective',
        mount: {
            kind: 'nested-section',
            hostComponent: 'pratibimbaCoordinate',
            note: 'DR-WC-M4-6: PASU continuity is the personal-coordinate pane’s law, so the being-pattern READ nests there rather than costing the strip an eleventh tab; the M4′ subsystem page reaches it through the same pane’s workspace mirror (52.T5). The card reads the LIVE CCT-21 producer — `s3′.being_pattern.subscribe` (`Body/S/S3/gateway/src/being_pattern.rs`, registered in `S3_METHODS` since 373709f0, live-probe `exists: true`) — preferring the 18.10 `pasuBeingPattern` handle on the profile tick when the heartbeat attaches one. It never calls `observe`, because `observe` requires the CALLER to supply `perspectiveRole` and `monopolyOperator`, and authoring the reading is exactly what this surface must not do; an empty roster renders the producer’s own "no entity observed yet" sentence rather than a defaulted reading. The `ActualisingOne` gate opens a candidate through the emit-review-only arm `s3′.being_pattern.review_candidate` (no S2 canon write) and then routes to the Epii review fold — accepting is structurally impossible here.'
        },
        layoutLaw: 'daily-only',
        privacyClass: 'protected_local_handle_only',
        miniModes: [],
        miniModeWarrant: null,
        warrant: `${SPEC}:315 — "View id: \`m4.nara.beingPatternPerspective\` (new)"`,
        currentStateSelector: selector('m4.nara.beingPatternPerspective', 'tick-store', 'useTickStore', [
            'generation',
            'profile'
        ]),
        selectionHandler: unrouted(
            'm4.nara.beingPatternPerspective',
            'A protected-local READ of how the entity is being read — a selection never travels INTO it, so no intent target is registered. Its only outward routes are the S3′ emit-review-only candidate arm and the review fold (`omnipanel.openReview`) on the ActualisingOne review-gate, which are a method call and a command, not selections.'
        ),
        evidenceSerializer: evidence(
            'm4.nara.beingPatternPerspective',
            'protected_local_handle_only',
            'data-seam'
        ),
        gap: null,
        disposition: null
    },
    {
        subsystem: 'M4',
        viewId: 'm4.nara.rfactorFretboard',
        frozenExport: 'M4RFactorFretboardCard',
        tranche: '25.T25.23',
        landedBy: null,
        carrier: null,
        testid: null,
        mount: { kind: 'absent' },
        layoutLaw: null,
        privacyClass: 'protected_local',
        miniModes: [],
        miniModeWarrant: null,
        warrant: `${SPEC}:335 — "View id: \`m4.nara.rfactorFretboard\` (new)"`,
        currentStateSelector: null,
        selectionHandler: null,
        evidenceSerializer: null,
        gap: {
            kind: 'no-face',
            ownerTranche: '25.T25.23',
            compositionBlocker: null,
            evidence:
                'Enrolled although 25.21\'s own export list (SPEC:262-285) omits it: SPEC:335 declares it a TRACK_08 contribution in its own words, and 25.21\'s acceptance is that EVERY Wave-C view id maps to its owner. A register that silently drops a specced id fails its own contract.',
            citations: [
                { file: 'App.tsx', anchor: 'rfactorFretboard', mustBeAbsent: true },
                { file: 'commands/crossLayoutIntent.ts', anchor: 'fretboard', mustBeAbsent: true }
            ],
        },
        disposition: null
    },
    {
        subsystem: 'M4',
        viewId: 'm4.nara.dialogicalArena',
        frozenExport: 'M4DialogicalArenaCard',
        tranche: '41.T41.7',
        landedBy: null,
        carrier: { file: 'panes/M4DialogicalArenaPane.tsx', symbol: 'M4DialogicalArenaPane' },
        testid: 'm4-arena-root',
        mount: { kind: 'flexlayout-tab', component: 'm4DialogicalArena', tabLabel: 'Arena', face: 1, region: 'personal-main' },
        layoutLaw: 'both',
        privacyClass: 'protected_local_handle_only',
        miniModes: [],
        miniModeWarrant: null,
        warrant: `${SPEC}:62 — "owns the \`m4.nara.dialogicalArena\` view id"; same line: "Track 25\u2019s role for this widget is the surface-contract reservation only"`,
        currentStateSelector: selector('m4.nara.dialogicalArena', 'provenance-store', 'useProvenanceStore', [
            'connection'
        ]),
        selectionHandler: routed('m4.nara.dialogicalArena', 'm4-nara', 'dialogical-arena'),
        evidenceSerializer: evidence(
            'm4.nara.dialogicalArena',
            'protected_local_handle_only',
            'data-protected-bodies-projected'
        ),
        gap: null,
        disposition: null
    }
]);

/**
 * Frozen TRACK_08 names this register deliberately does not carry, with the
 * reason. Recording the refusal is the point: a silent omission and a ruled-out
 * name look identical in a table that only lists what it accepts.
 */
export const UNENROLLED_FROZEN_EXPORTS: readonly {
    readonly frozenExport: string;
    readonly frozenViewId: string;
    readonly reason: string;
}[] = Object.freeze([
    {
        frozenExport: 'M4RecognitionMiniView',
        frozenViewId: 'm4.nara.graphitiBrowser',
        reason:
            'No `View id:` line assigns it in the Track-25 brief, no widget file backs it in the frozen tree, and no rerun tranche owns it. The behaviour it names lives at other coordinates (the M0 community-clock episode list, the OmniPanel review blocks, the M1 session-close reader), so an M4 row would misattribute another coordinate\'s surface.'
    },
    {
        frozenExport: 'M4ArtifactHandleChip',
        frozenViewId: 'm4.nara.dayContainer',
        reason:
            'Not a separate surface in this carrier: the artifact rows are part of the day container and are enrolled with it. The frozen chip\'s bodySha256 handle has no carrier equivalent — the artifact\'s own vault path is its handle.'
    }
]);

/**
 * What became of the export SPEC:290 places in a slot.
 *
 *   `as-specced`        — the spec's export renders in the spec's slot.
 *   `carried-elsewhere` — the FUNCTION reaches the user, on a different mount
 *                         (DR-FACE-7 fate A). `carriedAt` names the enrolled row.
 *   `blocked`           — the slot is owned and has no renderer; the id must be
 *                         a registered composition blocker.
 *   `unspecced`         — a carrier slot SPEC:290 assigns no export to.
 */
export type WaveCConsumerFate = 'as-specced' | 'carried-elsewhere' | 'blocked' | 'unspecced';

export interface WaveCConsumerSlot {
    readonly slot: PersonalGeometricSlotName;
    /** The TRACK_08 export SPEC:290 places here, or null where it names none. */
    readonly specExport: string | null;
    /** That export's Wave-C view id, or null. Must be enrolled when set. */
    readonly specViewId: string | null;
    /** The extension that really owns the slot at mount. Checked against the
     *  live `loadPersonalComposition()`, not asserted. */
    readonly carrierOwner: string;
    /** The engine attribute publishing that owner to the DOM — the seam the
     *  browser receipt reads, so this record is drivable and not just legible. */
    readonly ownerAttribute: string;
    /** What really renders in the slot. Null exactly when the slot is blocked. */
    readonly carrier: { readonly file: string; readonly symbol: string } | null;
    readonly fate: WaveCConsumerFate;
    /** Required iff `carried-elsewhere`: the enrolled view id that carries the
     *  spec's function instead, so a carry can never read as a delivery. */
    readonly carriedAt: string | null;
    readonly evidence: string;
}

/**
 * The `plugin-integrated-4-5-0` composition consumer, per SPEC:290.
 *
 * SPEC:290 assigns three slots — cymatic field at centre, session breakdown at
 * right, journal timeline at left — and says the consumer "reads
 * `TRACK_08_CONTRIBUTION`" to lay them out. It does not, anywhere: that widget's
 * `setContributors` has no caller (header, above). The carrier's real consumer
 * is `PersonalRecognitionEngine`, which runs `loadPersonalComposition()` through
 * the mount-time law and publishes each slot's granted owner as a DOM attribute.
 *
 * TWO OF THE THREE SPECCED SLOTS ARE OCCUPIED BY SOMETHING ELSE, and that is a
 * landed decision, not drift: 29.T29.3 (DR-WC-IP-3) gave left to the day canvas
 * and right to the M5 recognition layer, and its screenshot baseline
 * (`composition-4-5-0-personal.png`) is built on that. The specced occupants are
 * not missing — both reach the user on other mounts — so each is recorded as a
 * DR-FACE-7 fate-A carry naming WHERE, rather than silently reconciled in either
 * direction. Repointing the slots is Track 29's call on its own composition; a
 * Track-25 register may state the divergence, not settle it.
 */
export const INTEGRATED_450_CONSUMER_LAYOUT: readonly WaveCConsumerSlot[] = Object.freeze([
    {
        slot: 'left-composition',
        specExport: 'M4JournalTimelineCard',
        specViewId: 'm4.nara.journalEntries',
        carrierOwner: 'm4-nara',
        ownerAttribute: 'data-left-composition-owner',
        carrier: { file: 'panes/NowPane.tsx', symbol: 'NaraCanvasEditor' },
        fate: 'carried-elsewhere',
        carriedAt: 'm4.nara.journalEntries',
        evidence:
            'SPEC:290 puts M4JournalTimelineCard left; 29.T29.3 gave the left slot to the day canvas (11.10) under its ambient strip and tuning bar (11.12) — which SPEC:290 itself also places there, so the two readings collide inside one sentence. The carrier resolved it by keeping the canvas in the slot and giving the journal timeline its own left-border tab, as PERSONAL_SLOT_CARRIERS records.'
    },
    {
        slot: 'center-composition',
        specExport: 'M4PersonalCymaticField',
        specViewId: 'm4.nara.personalField',
        carrierOwner: 'm4-nara',
        ownerAttribute: 'data-center-composition-owner',
        carrier: null,
        fate: 'blocked',
        carriedAt: null,
        evidence:
            'The one slot SPEC:290 and the carrier agree on, and it has no renderer: 25.T25.6 is pending and the slot carries the registered blocker `pending-psychoid-cymatic-solver` (personalComposition.ts). Owned and unbuilt, which is a different fact from unowned.'
    },
    {
        slot: 'right-composition',
        specExport: 'M4SessionBreakdownCard',
        specViewId: 'm4.nara.dayContainer',
        carrierOwner: 'm5-epii',
        ownerAttribute: 'data-right-composition-owner',
        carrier: { file: 'engine/PersonalRecognitionEngine.tsx', symbol: 'M5RecognitionLayer' },
        fate: 'carried-elsewhere',
        carriedAt: 'm4.nara.dayContainer',
        evidence:
            'SPEC:290 puts M4SessionBreakdownCard right; 29.T29.3 granted the right slot to m5-epii for the recognition layer (26.11). The session breakdown reaches the user as the day-container section of the calendar pane instead — enrolled above, with its own stricter tint. Note the owner differs by EXTENSION here, not only by widget.'
    },
    {
        slot: 'grounding',
        specExport: null,
        specViewId: null,
        carrierOwner: 'm0-anuttara',
        ownerAttribute: 'data-grounding-owner',
        carrier: { file: 'engine/PersonalRecognitionEngine.tsx', symbol: 'M0VirtueWitnessPanel' },
        fate: 'unspecced',
        carriedAt: null,
        evidence:
            'SPEC:290 names no under-layer. 29.T29.3 gave grounding to m0-anuttara for the 9-bit R-virtue witness (19.6 Verifier reading), which is an M0 surface and outside this register\'s M4 domain.'
    },
    {
        slot: 'composition-ambient',
        specExport: null,
        specViewId: null,
        carrierOwner: 'm4-nara',
        ownerAttribute: 'data-composition-ambient-owner',
        carrier: { file: 'panes/HomePane.tsx', symbol: 'TimeAxisSwitcher' },
        fate: 'unspecced',
        carriedAt: null,
        evidence:
            'SPEC:290 places "ambient strip + tuning bar (11.12) above the canvas" but assigns the region no TRACK_08 export, so there is no specced occupant to compare against. The carrier\'s ambient slot holds the time-axis switcher (25.17), enrolled above.'
    },
    {
        slot: 'composition-status',
        specExport: null,
        specViewId: null,
        carrierOwner: 'm4-nara',
        ownerAttribute: 'data-composition-status-owner',
        carrier: { file: 'panes/NaraCanvasEditor.tsx', symbol: 'privacyChrome' },
        fate: 'unspecced',
        carriedAt: null,
        evidence:
            'SPEC:290 names no status region. 29.T29.3 gave it to the per-surface privacy tint (25.18), which states WHICH KIND of material a slot shows and shows none itself.'
    }
]);

/** The slots SPEC:290 actually assigns an export to. */
export function speccedConsumerSlots(): readonly WaveCConsumerSlot[] {
    return INTEGRATED_450_CONSUMER_LAYOUT.filter(slot => slot.specExport !== null);
}

/** Look a contribution up by its view id. */
export function waveCContribution(viewId: string): WaveCContribution | null {
    return M4_WAVE_C_CONTRIBUTIONS.find(row => row.viewId === viewId) ?? null;
}

/** The rows a browser can actually drive. */
export function presentWaveCContributions(): readonly WaveCContribution[] {
    return M4_WAVE_C_CONTRIBUTIONS.filter(row => row.gap === null && row.testid !== null);
}

/** The rows that name work still owed, with the tranche that owes it. */
export function gappedWaveCContributions(): readonly WaveCContribution[] {
    return M4_WAVE_C_CONTRIBUTIONS.filter(row => row.gap !== null);
}
