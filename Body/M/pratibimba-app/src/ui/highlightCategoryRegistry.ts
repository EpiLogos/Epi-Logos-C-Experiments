/**
 * Coordinate: M' shell-0 (highlight category register — 30.T30.7)
 * Residency: Body/M/pratibimba-app/src/ui/highlightCategoryRegistry.ts
 * Position (#n): #4 — the Type the highlight vocabulary is spoken through
 * Actualises: the promotion of 11.11's ten-category register to THE canonical
 *   `HighlightCategoryRegistry` — one source for the category language that
 *   m4-nara's mark, the Khora inscription writer and the Chronos response
 *   orbit had each been holding a private copy of. Per category: which side
 *   may author it, its colour token, what it means, which extensions are
 *   allowed to originate it, whether it may appear in the FloatingMenu, and
 *   (30.7 cross-link 19.11) the response orbit it is the inscription OF.
 *
 *   THE 19.11 ALIGNMENT IS STRUCTURAL, and that is why it lives here rather
 *   than in a lookup beside Chronos: the orbit IS the inscription. An
 *   `immediate` orbit writes a `recognition` highlight; a `next-morning` orbit
 *   writes a `retrospective-surfacing` highlight. Codifying the pair in one
 *   row is what stops the two vocabularies drifting into disagreement.
 *
 *   CROSS-STACK SHAPE — mirror, never import. The 30.7 brief asks the S4
 *   consumers (`S4-0p-khora`, `S4-3p-chronos`) to import this registry, but
 *   M -> S is a forbidden cross-stack edge (the same law that makes
 *   `ui/bridgeReadiness` MIRROR the 07-t0 taxonomy rather than import it), so
 *   a literally-shared module is not available. The honest equivalent, and
 *   the one this tranche lands: the registry is canonical here, the carrier
 *   consumers really do collapse onto it, and `highlightCategoryRegistry.test.ts`
 *   READS the S4 sources and fails when their vocabulary diverges. Drift
 *   breaks the build without either stack importing the other.
 * Public surface: HighlightCategoryId, HighlightCategorySide,
 *   ChronosResponseOrbit, HighlightCategoryEntry, HIGHLIGHT_CATEGORY_REGISTRY,
 *   HIGHLIGHT_CATEGORY_IDS, userHighlightCategories, agentHighlightCategories,
 *   highlightCategory, isHighlightCategory, categoryForOrbit.
 * Does NOT own: the Tiptap mark or its Markdown round-trip
 *   (panes/m4NaraHighlightMark), the highlight service (panes/m4NaraHighlightService),
 *   the FloatingMenu rendering (panes/NaraFloatingMenu), the colour VALUES
 *   (styles.css `--nara-highlight-*`), or the Khora/Chronos implementations.
 * Contract: [[M4'-SPEC]]; rerun tranche [[30.T30.7]]; cross-links 11.10, 11.11,
 *   19.11; colour tokens canon-locked per the 30.2 highlight-category block.
 */

/**
 * The two sides are separate unions rather than one flat list, so the
 * user/agent partition is enforced by the COMPILER and not only by a runtime
 * `side` field: a surface that may only offer user categories (the
 * FloatingMenu) can say so in its types, and passing an agent category to it
 * is a type error rather than a lint. `side` still carries the same fact at
 * runtime, and a test asserts the two never disagree.
 */
export type UserHighlightCategoryId = 'daily-note' | 'oracle' | 'dream' | 'expand';

export type AgentHighlightCategoryId =
    | 'recognition'
    | 'prospective-surfacing'
    | 'retrospective-surfacing'
    | 'kairos-touch'
    | 'somatic-mark'
    | 'live-spread';

/** The ten categories — four user-authored, six agent-authored. */
export type HighlightCategoryId = UserHighlightCategoryId | AgentHighlightCategoryId;

export type HighlightCategorySide = 'user' | 'agent';

/**
 * The Chronos response orbits (19.11). `hours:<n>` is a parameterised orbit and
 * is deliberately absent: it carries no fixed category, because the category is
 * a function of WHY the delay was chosen, not of its length.
 */
export type ChronosResponseOrbit = 'immediate' | 'next-morning' | 'saturnine';

export interface HighlightCategoryEntry {
    readonly id: HighlightCategoryId;
    readonly side: HighlightCategorySide;
    /** `epilogos.colour.highlight-category.<id>`, resolved by the CSS variable. */
    readonly colourToken: string;
    /** The custom property styles.css defines the value on. */
    readonly cssVariable: string;
    /** What marking something this way MEANS — the reason a reader reaches for it. */
    readonly semanticMeaning: string;
    /** The only extensions permitted to originate this category. */
    readonly allowedSourceExtensions: readonly string[];
    /** User-side categories are offered in the FloatingMenu; agent-side never are. */
    readonly floatingMenuEligible: boolean;
    /** The 11.11 visual register grouping, carried from the landed mark. */
    readonly visualRegister: string;
    /** The 19.11 orbit this category is the inscription of, where one is fixed. */
    readonly responseOrbit?: ChronosResponseOrbit;
    /** Optional #0–#5 archetype alignment. */
    readonly archetypeAffinity?: number;
}

const NARA_ONLY: readonly string[] = Object.freeze(['m4-nara']);
const AGENT_SOURCES: readonly string[] = Object.freeze([
    's4-3p-chronos',
    's4-0p-khora',
    's4-5p-aletheia'
]);

function token(id: HighlightCategoryId): string {
    return `epilogos.colour.highlight-category.${id}`;
}

function cssVariable(id: HighlightCategoryId): string {
    // `prospective-surfacing` / `retrospective-surfacing` / `kairos-touch` /
    // `somatic-mark` shorten in CSS; the map is explicit rather than derived so
    // a rename cannot silently point at a property that does not exist.
    const SHORT: Partial<Record<HighlightCategoryId, string>> = {
        'prospective-surfacing': 'prospective',
        'retrospective-surfacing': 'retrospective',
        'kairos-touch': 'kairos',
        'somatic-mark': 'somatic'
    };
    return `--nara-highlight-${SHORT[id] ?? id}`;
}

function entry(
    id: HighlightCategoryId,
    side: HighlightCategorySide,
    visualRegister: string,
    semanticMeaning: string,
    extra: Partial<HighlightCategoryEntry> = {}
): HighlightCategoryEntry {
    return Object.freeze({
        id,
        side,
        colourToken: token(id),
        cssVariable: cssVariable(id),
        semanticMeaning,
        allowedSourceExtensions: side === 'user' ? NARA_ONLY : AGENT_SOURCES,
        floatingMenuEligible: side === 'user',
        visualRegister,
        ...extra
    });
}

/** LAW: the ten categories, user-side first, in the 11.11 order. */
export const HIGHLIGHT_CATEGORY_REGISTRY: Readonly<
    Record<HighlightCategoryId, HighlightCategoryEntry>
> = Object.freeze({
    'daily-note': entry(
        'daily-note',
        'user',
        'user-reflection',
        'The reader marks a passage as belonging to the day — ordinary reflective attention.'
    ),
    oracle: entry(
        'oracle',
        'user',
        'user-symbolic',
        'The reader marks a passage as addressed TO them symbolically — asking it to be read as answer.'
    ),
    dream: entry(
        'dream',
        'user',
        'user-dream',
        'The reader marks dream material, which is read under its own logic rather than the waking one.'
    ),
    expand: entry(
        'expand',
        'user',
        'user-expansion',
        'The reader asks for this passage to be opened further — an explicit request for more.'
    ),
    recognition: entry(
        'recognition',
        'agent',
        'warm-recognition',
        'The agent marks something it recognises as already true of the reader — said back, not introduced.',
        { responseOrbit: 'immediate' }
    ),
    'prospective-surfacing': entry(
        'prospective-surfacing',
        'agent',
        'warm-forward',
        'The agent surfaces something forward-leaning: a possibility not yet lived, offered ahead of time.',
        { responseOrbit: 'saturnine' }
    ),
    'retrospective-surfacing': entry(
        'retrospective-surfacing',
        'agent',
        'cool-back',
        'The agent returns something from the past that has become legible only now.',
        { responseOrbit: 'next-morning' }
    ),
    'kairos-touch': entry(
        'kairos-touch',
        'agent',
        'mercurial',
        'The agent marks a timing coincidence — the moment, not the content, is what carries.'
    ),
    'somatic-mark': entry(
        'somatic-mark',
        'agent',
        'grounded',
        'The agent marks where the body is spoken of, so embodied material is not read as abstraction.'
    ),
    'live-spread': entry(
        'live-spread',
        'agent',
        'oracle-anchored',
        'The agent anchors the passage to a live oracular spread currently in play.'
    )
});

/** The ten ids in canonical order. */
export const HIGHLIGHT_CATEGORY_IDS: readonly HighlightCategoryId[] = Object.freeze(
    Object.keys(HIGHLIGHT_CATEGORY_REGISTRY) as HighlightCategoryId[]
);

/** The four user-authored categories — the FloatingMenu's whole inventory. */
export const userHighlightCategories: readonly UserHighlightCategoryId[] = Object.freeze(
    HIGHLIGHT_CATEGORY_IDS.filter(
        (id): id is UserHighlightCategoryId => HIGHLIGHT_CATEGORY_REGISTRY[id].side === 'user'
    )
);

/** The six agent-authored categories. */
export const agentHighlightCategories: readonly AgentHighlightCategoryId[] = Object.freeze(
    HIGHLIGHT_CATEGORY_IDS.filter(
        (id): id is AgentHighlightCategoryId => HIGHLIGHT_CATEGORY_REGISTRY[id].side === 'agent'
    )
);

export function highlightCategory(id: HighlightCategoryId): HighlightCategoryEntry {
    return HIGHLIGHT_CATEGORY_REGISTRY[id];
}

export function isHighlightCategory(value: unknown): value is HighlightCategoryId {
    return typeof value === 'string' && value in HIGHLIGHT_CATEGORY_REGISTRY;
}

/**
 * The 19.11 alignment, read forward: which category an orbit inscribes. Returns
 * null for an orbit no category claims, rather than guessing one — an
 * unclaimed orbit is a real state, not a default.
 */
export function categoryForOrbit(orbit: ChronosResponseOrbit): HighlightCategoryId | null {
    const match = HIGHLIGHT_CATEGORY_IDS.find(
        id => HIGHLIGHT_CATEGORY_REGISTRY[id].responseOrbit === orbit
    );
    return match ?? null;
}
