export type HighlightCategory = 'coordinate' | 'codon' | 'hexagram' | 'provenance' | 'readiness' | 'transition';

export interface HighlightCategoryDefinition {
    readonly category: HighlightCategory;
    readonly tokenName: `epilogos.highlight.${HighlightCategory}`;
    readonly cssVar: string;
}

export const HIGHLIGHT_CATEGORY_REGISTRY: Readonly<Record<HighlightCategory, HighlightCategoryDefinition>> =
    Object.freeze({
        coordinate: defineHighlightCategory('coordinate'),
        codon: defineHighlightCategory('codon'),
        hexagram: defineHighlightCategory('hexagram'),
        provenance: defineHighlightCategory('provenance'),
        readiness: defineHighlightCategory('readiness'),
        transition: defineHighlightCategory('transition')
    });

export function highlightCategory(category: HighlightCategory): HighlightCategoryDefinition {
    return HIGHLIGHT_CATEGORY_REGISTRY[category];
}

function defineHighlightCategory(category: HighlightCategory): HighlightCategoryDefinition {
    return Object.freeze({
        category,
        tokenName: `epilogos.highlight.${category}`,
        cssVar: `var(--epilogos-highlight-${category})`
    });
}
