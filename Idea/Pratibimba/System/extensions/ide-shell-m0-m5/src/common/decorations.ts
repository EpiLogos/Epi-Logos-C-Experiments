/**
 * Canon Studio coordinate / wikilink decoration matcher — Track 05 T4.
 *
 * Pure function so it can be exercised from Node test context without
 * pulling in the Theia browser dependency tree. T4.5 will reuse this
 * matcher to power inline editor decorations + wikilink autocompletion.
 */

export interface CoordinateDecoration {
    readonly kind: 'ql-archetype' | 'm-coordinate' | 's-coordinate' | 'wikilink' | 'context-frame';
    readonly match: string;
}

export function decorateCoordinates(content: string): CoordinateDecoration[] {
    const decorations: CoordinateDecoration[] = [];
    // QL archetypes: #0..#5 (with optional .digit fractional positions).
    for (const m of content.matchAll(/#[0-5](?:\.[0-9]+)*/g)) {
        decorations.push({ kind: 'ql-archetype', match: m[0] });
    }
    // M coordinates: M0..M5 with optional dotted suffix.
    for (const m of content.matchAll(/\bM[0-5](?:\.[a-z0-9_-]+)*\b/gi)) {
        decorations.push({ kind: 'm-coordinate', match: m[0] });
    }
    // S coordinates: S0..S5 (and S0'..S5').
    for (const m of content.matchAll(/\bS[0-5]'?(?:\.[a-z0-9_-]+)*\b/gi)) {
        decorations.push({ kind: 's-coordinate', match: m[0] });
    }
    // Wikilinks: [[target]] or [[target|alias]].
    for (const m of content.matchAll(/\[\[([^\]]+)\]\]/g)) {
        decorations.push({ kind: 'wikilink', match: m[0] });
    }
    // Context frames: (0/1), (4.0/1-4.4/5), (5/0).
    for (const m of content.matchAll(/\([0-9.\/\-]+\)/g)) {
        decorations.push({ kind: 'context-frame', match: m[0] });
    }
    return decorations;
}
