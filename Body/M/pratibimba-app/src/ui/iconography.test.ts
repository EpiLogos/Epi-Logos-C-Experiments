/**
 * Coordinate: M' shell (iconography system proof — Track 30.T30.9)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: the tranche-30.9 verification line against the REAL asset set —
 *   the SVGs are read off disk through Vite's `?raw` glob, so these assertions
 *   fail when a file is deleted, renamed, or authored with a hardcoded colour,
 *   not merely when the TypeScript table is edited. The register and the files
 *   are proven to be the same nineteen, in both directions.
 * Does NOT own: the mode inventory (leftSidebarModes.test.ts proves that), the
 *   rendering (primitives.test.tsx + tests/e2e/iconography.spec.ts), or the
 *   family hue values (tokens/familyPalette).
 * Contract: rerun tranche [[30.T30.9]].
 */

import { describe, expect, it } from 'vitest';

import {
    FAMILY_LETTER_ICON,
    MN_FAMILY_ICON,
    SIDEBAR_MODE_ICON_BINDINGS,
    UI_ICON_ASSET_DIR,
    UI_ICON_BY_NAME,
    UI_ICON_SET,
    UI_ICON_SIZES,
    familyLetterIcon,
    iconAssetUrl,
    iconMaskStyle,
    isFamilyLetter,
    type FamilyLetter,
    type MnSubsystemId,
    type UiIconName
} from './iconography';
import { LEFT_SIDEBAR_MODES } from './leftSidebarModes';
import { FAMILY_HUES } from './tokens';

/** The real files, read as text. Keys look like `../assets/icons/family-m.svg`. */
const ICON_SOURCES = import.meta.glob('../assets/icons/*.svg', {
    eager: true,
    query: '?raw',
    import: 'default'
}) as Record<string, string>;

function sourceOf(name: UiIconName): string {
    const source = ICON_SOURCES[`../${UI_ICON_ASSET_DIR}/${name}.svg`];
    expect(source, `no SVG file for ${name}`).toBeTruthy();
    return source;
}

/**
 * What a resolved icon URL actually delivers. Vite inlines assets under its
 * 4KB threshold, and every glyph here is far below it, so the URL is normally a
 * `data:` payload rather than a path — which is the stronger outcome (the bytes
 * ship in the bundle, so there is no 404 to have). Decoding it lets the test
 * assert the served bytes ARE the file, not merely that a path looks plausible.
 * A path is accepted too, so raising `assetsInlineLimit` later does not turn
 * this suite red for a non-defect.
 */
function servedPayload(url: string): string | null {
    const base64 = url.match(/^data:image\/svg\+xml;base64,(.*)$/s);
    if (base64) {
        return atob(base64[1]);
    }
    const utf8 = url.match(/^data:image\/svg\+xml,(.*)$/s);
    return utf8 ? decodeURIComponent(utf8[1]) : null;
}

/** Vite minifies inlined SVG — it collapses inter-tag whitespace and swaps to
 *  single quotes. Normalising both sides compares the DRAWING, which is the
 *  thing under test, rather than the authoring whitespace. */
function normaliseSvg(markup: string): string {
    return markup
        .replace(/'/g, '"')
        .replace(/>\s+</g, '><')
        .replace(/\s+/g, ' ')
        .trim();
}

/** Every colour literal an SVG paints with: the value of every fill/stroke/
 *  stop-color attribute. `none` is absence of paint, not a colour. */
function paintValues(source: string): string[] {
    return [...source.matchAll(/(?:fill|stroke|stop-color)="([^"]+)"/g)]
        .map(match => match[1])
        .filter(value => value !== 'none');
}

describe('30.T30.9 — the icon register is the nineteen, and the nineteen are real files', () => {
    it('declares nineteen icons across the five categories, each named and identified once', () => {
        expect(UI_ICON_SET).toHaveLength(19);

        const names = UI_ICON_SET.map(entry => entry.name);
        expect(new Set(names).size, 'a glyph name is declared twice').toBe(names.length);
        const ids = UI_ICON_SET.map(entry => entry.id);
        expect(new Set(ids).size, 'a glyph id is declared twice').toBe(ids.length);

        const perCategory = UI_ICON_SET.reduce<Record<string, number>>((acc, entry) => {
            acc[entry.category] = (acc[entry.category] ?? 0) + 1;
            return acc;
        }, {});
        expect(perCategory).toEqual({
            'sidebar-mode': 5,
            'chrome-toggle': 1,
            'transition-primitive': 1,
            'mn-family': 6,
            'family-letter': 6
        });

        // the id is derived from the name, never hand-typed apart from it
        for (const entry of UI_ICON_SET) {
            expect(entry.id).toBe(`pratibimba.icon.${entry.name}`);
            expect(entry.assetPath).toBe(`${UI_ICON_ASSET_DIR}/${entry.name}.svg`);
            expect(entry.label.length, `${entry.name} has no fallback label`).toBeGreaterThan(0);
            expect(entry.description.length).toBeGreaterThan(0);
        }
        expect(Object.keys(UI_ICON_BY_NAME)).toHaveLength(19);
    });

    it('the asset directory holds exactly the declared set — no orphan file, no missing glyph', () => {
        const onDisk = Object.keys(ICON_SOURCES)
            .map(path => path.split('/').pop()!.replace(/\.svg$/, ''))
            .sort();
        const declared = UI_ICON_SET.map(entry => entry.name).sort();
        expect(onDisk).toEqual(declared);
    });

    it('every glyph is a 32x32 monoline SVG that derives to a single colour', () => {
        for (const entry of UI_ICON_SET) {
            const source = sourceOf(entry.name);
            expect(source, `${entry.name} is not an svg`).toMatch(/<svg[\s>]/);
            // one viewBox, and the shared 32-unit canvas: this is what lets one
            // asset serve 16 / 24 / 32 without per-size artwork
            expect(source.match(/viewBox="/g), `${entry.name} viewBox count`).toHaveLength(1);
            expect(source).toContain('viewBox="0 0 32 32"');

            // single-colour derivable: currentColor only. A hardcoded hex would
            // survive a mask (masks read alpha) but break every inline or <img>
            // consumer, and would fork a second palette off ui/tokens.
            const paints = paintValues(source);
            expect(paints.length, `${entry.name} paints nothing`).toBeGreaterThan(0);
            for (const paint of paints) {
                expect(
                    paint === 'currentColor' || paint.startsWith('url(#'),
                    `${entry.name} paints with a hardcoded colour: ${paint}`
                ).toBe(true);
            }
        }
    });

    it('no two glyphs share a DOM id, so inlining any pair keeps aria-labelledby honest', () => {
        const ids = UI_ICON_SET.flatMap(entry =>
            [...sourceOf(entry.name).matchAll(/\sid="([^"]+)"/g)].map(match => match[1])
        );
        expect(ids.length, 'the glyphs carry no ids at all').toBeGreaterThan(0);
        expect(new Set(ids).size, `duplicate id across the icon set: ${ids.join(', ')}`).toBe(
            ids.length
        );
    });

    it('every declared glyph resolves to a URL that serves that glyph, byte for byte', () => {
        for (const entry of UI_ICON_SET) {
            const url = iconAssetUrl(entry.name);
            expect(url, `${entry.name} resolved to an empty url`).toBeTruthy();
            const payload = servedPayload(url);
            if (payload === null) {
                // not inlined: the URL must at least name this glyph's file
                expect(url).toContain(`${entry.name}.svg`);
            } else {
                // inlined: the served bytes draw this glyph, not another's
                expect(normaliseSvg(payload), `${entry.name} serves another glyph`).toBe(
                    normaliseSvg(sourceOf(entry.name))
                );
            }
        }
        // a missing asset is a build defect that must surface, never a silent
        // empty box on a user's screen
        expect(() => iconAssetUrl('family-x' as UiIconName)).toThrow(/icon asset missing/);
    });

    it('one asset serves 16, 24 and 32', () => {
        expect(UI_ICON_SIZES).toEqual([16, 24, 32]);
        for (const size of UI_ICON_SIZES) {
            const style = iconMaskStyle('lemniscate', size);
            expect(style.width).toBe(`${size}px`);
            expect(style.height).toBe(`${size}px`);
            // the mask points at exactly what iconAssetUrl resolved — one
            // resolution path, not a second string built beside it
            expect(style.maskImage).toBe(`url(${JSON.stringify(iconAssetUrl('lemniscate'))})`);
            // Safari 15 is the declared build target, so the prefixed property
            // has to ship beside the standard one
            expect(style.WebkitMaskImage).toBe(style.maskImage);
        }
        // unsized is legal: the coordinate-string glyph sizes itself in `em`
        const unsized = iconMaskStyle('family-m');
        expect(unsized.width).toBeUndefined();
        expect(unsized.height).toBeUndefined();
    });
});

describe('30.T30.9 — bindings agree with the registries they read', () => {
    it('binds one glyph to every left-sidebar mode, in the registry order, with no glyph reused', () => {
        expect(SIDEBAR_MODE_ICON_BINDINGS.map(b => b.modeId)).toEqual(
            LEFT_SIDEBAR_MODES.map(mode => mode.id)
        );

        const glyphs = SIDEBAR_MODE_ICON_BINDINGS.map(b => b.iconName);
        expect(new Set(glyphs).size, 'two modes wear the same glyph').toBe(glyphs.length);

        for (const binding of SIDEBAR_MODE_ICON_BINDINGS) {
            const mode = LEFT_SIDEBAR_MODES.find(m => m.id === binding.modeId)!;
            // the fallback is the mode's own label, carried once — this carrier
            // ships no icon font, so the text IS the fallback
            expect(binding.fallbackLabel).toBe(mode.label);
            expect(binding.availableInLayouts).toEqual(mode.availableInLayouts);
            expect(binding.iconId).toBe(UI_ICON_BY_NAME[binding.iconName].id);
            expect(UI_ICON_BY_NAME[binding.iconName].category).toBe('sidebar-mode');
        }
    });

    it('every sidebar-mode glyph in the set is actually bound to a mode', () => {
        const boundGlyphs = new Set(SIDEBAR_MODE_ICON_BINDINGS.map(b => b.iconName));
        const declared = UI_ICON_SET.filter(entry => entry.category === 'sidebar-mode');
        for (const entry of declared) {
            expect(boundGlyphs.has(entry.name as never), `${entry.name} is a glyph no mode wears`).toBe(
                true
            );
        }
    });

    it('the six family letters map onto six distinct glyphs, keyed as ui/tokens keys them', () => {
        const letters = Object.keys(FAMILY_LETTER_ICON) as FamilyLetter[];
        expect(letters).toEqual(['P', 'S', 'T', 'M', 'L', 'C']);
        // same keys as FAMILY_HUES, so one letter keys both the hue and the glyph
        expect(letters.sort()).toEqual(Object.keys(FAMILY_HUES).sort());

        const glyphs = Object.values(FAMILY_LETTER_ICON);
        expect(new Set(glyphs).size).toBe(6);
        for (const glyph of glyphs) {
            expect(UI_ICON_BY_NAME[glyph].category).toBe('family-letter');
        }
    });

    it('resolves a family glyph case-insensitively and refuses to guess an unknown family', () => {
        expect(familyLetterIcon('M')).toBe('family-m');
        expect(familyLetterIcon('m')).toBe('family-m');
        expect(familyLetterIcon('c')).toBe('family-c');
        // an unknown letter renders no glyph rather than borrowing another
        // family's mark
        expect(familyLetterIcon('X')).toBeNull();
        expect(familyLetterIcon('')).toBeNull();
        expect(familyLetterIcon('4')).toBeNull();
        expect(isFamilyLetter('M')).toBe(true);
        expect(isFamilyLetter('X')).toBe(false);
        // guards against a prototype key leaking through the hasOwnProperty check
        expect(isFamilyLetter('toString')).toBe(false);
        expect(familyLetterIcon('constructor')).toBeNull();
    });

    it('the six Mn subsystems map onto six distinct glyphs', () => {
        const subsystems = Object.keys(MN_FAMILY_ICON) as MnSubsystemId[];
        expect(subsystems).toEqual(['M0', 'M1', 'M2', 'M3', 'M4', 'M5']);
        const glyphs = Object.values(MN_FAMILY_ICON);
        expect(new Set(glyphs).size).toBe(6);
        for (const glyph of glyphs) {
            expect(UI_ICON_BY_NAME[glyph].category).toBe('mn-family');
        }
    });
});
