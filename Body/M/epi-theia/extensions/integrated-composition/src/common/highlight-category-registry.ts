export type HighlightCategoryId =
    | 'daily-note'
    | 'oracle'
    | 'dream'
    | 'expand'
    | 'recognition'
    | 'prospective-surfacing'
    | 'retrospective-surfacing'
    | 'kairos-touch'
    | 'somatic-mark'
    | 'live-spread';

export interface HighlightCategoryEntry {
    id: HighlightCategoryId;
    side: 'user' | 'agent';
    colourToken: string;
    semanticMeaning: string;
    allowedSourceExtensions: string[];
    floatingMenuEligible: boolean;
    archetypeAffinity?: number;
}

const USER_SOURCE_EXTENSIONS = Object.freeze(['m4-nara']);
const AGENT_SOURCE_EXTENSIONS = Object.freeze([
    's4-3p-chronos',
    's4-0p-khora',
    's4-5p-aletheia'
]);

function highlightCategoryEntry(
    id: HighlightCategoryId,
    side: HighlightCategoryEntry['side'],
    semanticMeaning: string,
    allowedSourceExtensions: readonly string[],
    archetypeAffinity?: number
): HighlightCategoryEntry {
    return Object.freeze({
        id,
        side,
        colourToken: `epilogos.colour.highlight-category.${id}`,
        semanticMeaning,
        allowedSourceExtensions: [...allowedSourceExtensions],
        floatingMenuEligible: side === 'user',
        ...(archetypeAffinity === undefined ? {} : { archetypeAffinity })
    });
}

export const HIGHLIGHT_CATEGORY_REGISTRY: Record<HighlightCategoryId, HighlightCategoryEntry> = Object.freeze({
    'daily-note': highlightCategoryEntry(
        'daily-note',
        'user',
        'User-authored daily-note emphasis in the protected Nara canvas.',
        USER_SOURCE_EXTENSIONS
    ),
    oracle: highlightCategoryEntry(
        'oracle',
        'user',
        'User-selected oracle material or spread-adjacent text for later agent attention.',
        USER_SOURCE_EXTENSIONS
    ),
    dream: highlightCategoryEntry(
        'dream',
        'user',
        'User-selected dream image, residue, or nocturnal fragment carried in the journal.',
        USER_SOURCE_EXTENSIONS
    ),
    expand: highlightCategoryEntry(
        'expand',
        'user',
        'User-selected passage asking the system to unfold, contextualize, or deepen the text.',
        USER_SOURCE_EXTENSIONS
    ),
    recognition: highlightCategoryEntry(
        'recognition',
        'agent',
        'Agent-side recognition: card-position activation, landed kairos window, or immediate orbit inscription.',
        AGENT_SOURCE_EXTENSIONS
    ),
    'prospective-surfacing': highlightCategoryEntry(
        'prospective-surfacing',
        'agent',
        'Agent-side prospective surfacing: what is forming and requesting future attention.',
        AGENT_SOURCE_EXTENSIONS
    ),
    'retrospective-surfacing': highlightCategoryEntry(
        'retrospective-surfacing',
        'agent',
        'Agent-side retrospective surfacing: what has gathered, especially re-entry and daily-briefing returns.',
        AGENT_SOURCE_EXTENSIONS
    ),
    'kairos-touch': highlightCategoryEntry(
        'kairos-touch',
        'agent',
        'Agent-side kairos touch: transit aspect activation, planet station, or timing-sensitive contact.',
        AGENT_SOURCE_EXTENSIONS
    ),
    'somatic-mark': highlightCategoryEntry(
        'somatic-mark',
        'agent',
        'Agent-side somatic mark: body-zone, chakra, element, or medicine-field shift.',
        AGENT_SOURCE_EXTENSIONS
    ),
    'live-spread': highlightCategoryEntry(
        'live-spread',
        'agent',
        'Agent-side live spread: active oracle spread-position reference on the same continuous page.',
        AGENT_SOURCE_EXTENSIONS
    )
});
