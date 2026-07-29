// @vitest-environment node
/**
 * Coordinate: M' M4' (privacy-chrome contract gate — 25.T25.18)
 * Residency: Body/M/pratibimba-app/src/ui/privacyChrome.test.ts
 * Actualises: the four checks the 25.18 brief names as its verification —
 *   (1) the CSS contract: each of the three tints has a real rule carrying the
 *   specified hex; (2) the enumeration: every declared Wave-C surface really
 *   applies its tint at mount, read off the REAL source, both directions
 *   (no surface in the register that does not apply it, no surface applying a
 *   tint the register does not declare); (3) the title carries the full
 *   PRIVACY_CLASS string. Plus the cross-language lockstep between the CSS
 *   custom properties and the JS PRIVACY_COLOURS tokens, so the documented
 *   duplication cannot silently drift.
 *
 *   The 15.10 status-bar-discipline check is NOT here: this file reads sources
 *   as a manifest gate, and "the status bar carries no privacy entry" asserted
 *   against source TEXT is a grep, not a behaviour — the anti-fraud lint
 *   rejects it, rightly. It lives in privacyChromeStatusBar.test.tsx against
 *   the RENDERED strip, and in tests/e2e/privacy-chrome.spec.ts against the
 *   live app.
 * Does NOT own: the privacy law (S0), the tint values (styles.css +
 *   ui/tokens.ts), or the surfaces themselves.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
    CARRIER_EXTENSION_SURFACES,
    PRIVACY_CHROME_SURFACES,
    PRIVACY_CLASSES,
    PRIVACY_TINT_CLASS,
    SPEC_ASSIGNED_SURFACES,
    SPEC_EXEMPT_SURFACES,
    privacyChrome,
    privacyTitle,
    type PrivacyClass
} from './privacyChrome';
import { PRIVACY_COLOURS } from './tokens';

const SRC = resolve(__dirname, '..');
const STYLES = readFileSync(join(SRC, 'styles.css'), 'utf8');
/** Both directories that hold rendering surfaces. Scanning only `panes/` was a
 *  real hole: the 25.17 time-axis switcher lives in `components/`, so a
 *  panes-only reverse scan could never see it. */
const SURFACE_DIRS = ['panes', 'components'];

function readSurface(relFile: string): string {
    return readFileSync(join(SRC, relFile), 'utf8');
}

/** Every rendering source under the scanned dirs, as `dir/file` keys. */
function allSurfaceFiles(): string[] {
    const out: string[] = [];
    for (const dir of SURFACE_DIRS) {
        for (const entry of readdirSync(join(SRC, dir))) {
            if (!/\.tsx$/.test(entry) || /\.test\.tsx$/.test(entry)) continue;
            out.push(`${dir}/${entry}`);
        }
    }
    return out;
}

/** The hexes the 25.18 brief specifies, verbatim. */
const BRIEF_HEX: Readonly<Record<PrivacyClass, string>> = {
    protected_local: '#8a7355',
    protected_local_handle_only: '#6b7588',
    shared_archetype_opt_in: '#d4a574'
};

function cssRuleFor(selector: string): string | null {
    const match = new RegExp(`\\.${selector}\\s*\\{([^}]*)\\}`).exec(STYLES);
    return match ? match[1] : null;
}

/** The value a property resolves to at a scope. styles.css carries SEVERAL
 *  `:root` blocks (the base vocabulary, then per-tranche additions), so every
 *  matching block is scanned and the LAST definition wins — which is what the
 *  cascade does too. `scope` selects a themed block instead of the bare root. */
function rootValue(property: string, scope = ':root'): string | null {
    const selector = scope.replace(/[[\]'\\]/g, m => '\\' + m);
    const blocks = [...STYLES.matchAll(new RegExp(`${selector}[^{]*\\{([^}]*)\\}`, 'gs'))];
    let value: string | null = null;
    for (const block of blocks) {
        // a bare `:root` query must not pick up `:root[data-theme=…]` blocks
        if (scope === ':root' && /:root\s*\[/.test(block[0])) continue;
        const match = new RegExp(`${property}\\s*:\\s*([^;]+);`).exec(block[1]);
        if (match) value = match[1].trim();
    }
    return value;
}

describe('25.T25.18 — the CSS contract', () => {
    it('defines a real rule for each of the three tints', () => {
        for (const privacyClass of PRIVACY_CLASSES) {
            const rule = cssRuleFor(PRIVACY_TINT_CLASS[privacyClass]);
            expect(rule, `${PRIVACY_TINT_CLASS[privacyClass]} must have a CSS rule`).not.toBeNull();
            expect(rule).toMatch(/border-left:\s*3px solid/);
        }
    });

    it('carries the exact hex the brief specifies, reachable through the rule', () => {
        for (const privacyClass of PRIVACY_CLASSES) {
            const rule = cssRuleFor(PRIVACY_TINT_CLASS[privacyClass])!;
            const varName = /var\((--[a-z-]+)\)/.exec(rule)?.[1];
            expect(varName, `${privacyClass} tint must consume a token`).toBeTruthy();
            expect(rootValue(varName!)).toBe(BRIEF_HEX[privacyClass]);
        }
    });

    it('keeps the CSS custom properties and the JS tokens in lockstep', () => {
        for (const privacyClass of PRIVACY_CLASSES) {
            const rule = cssRuleFor(PRIVACY_TINT_CLASS[privacyClass])!;
            const varName = /var\((--[a-z-]+)\)/.exec(rule)![1];
            // dark (the :root default) and the light-polarity override
            expect(rootValue(varName)).toBe(PRIVACY_COLOURS[privacyClass].dark);
            expect(rootValue(varName, ":root[data-theme='light']")).toBe(
                PRIVACY_COLOURS[privacyClass].light
            );
        }
    });
});

describe('25.T25.18 — every Wave-C surface declares its tint at mount', () => {
    it('carries the whole Track-25 set the brief assigns, each with its spec line quoted', () => {
        // The brief assigns a privacy chrome per widget; these are the Track-25
        // surfaces this carrier actually has. A missing row here is a surface
        // silently left unclassified — the exact defect this gate exists for.
        expect(SPEC_ASSIGNED_SURFACES.map(s => s.file).sort()).toEqual([
            'components/TimeAxisSwitcher.tsx',
            'panes/DayCalendarPane.tsx',
            'panes/JournalTimelinePane.tsx',
            'panes/M4DialogicalArenaPane.tsx',
            'panes/M4LogosCyclePane.tsx',
            'panes/M4PsycheAnchorCoherencePane.tsx',
            'panes/M4SessionCloseCeremonyPane.tsx',
            'panes/MedicineViewPane.tsx',
            'panes/OraclePane.tsx',
            'panes/PasuWizardPane.tsx',
            'panes/PratibimbaCoordinatePane.tsx',
            'panes/TransformContainersPane.tsx'
        ]);
        for (const surface of SPEC_ASSIGNED_SURFACES) {
            expect(surface.warrant, `${surface.file} must quote its assigning spec line`).toMatch(
                /25-m4-nara-frontend-deep\.md:\d+ — "/
            );
            expect(surface.warrant, `${surface.file} warrant must name the class it assigns`).toContain(
                PRIVACY_TINT_CLASS[surface.privacyClass]
            );
        }
    });

    it('every carrier-extension row is marked as such and quotes its own header', () => {
        for (const surface of CARRIER_EXTENSION_SURFACES) {
            expect(surface.tranche).toContain('carrier extension');
            expect(surface.warrant).toContain('own header');
        }
    });

    it('each declared surface really applies its tint, in the real source', () => {
        for (const surface of PRIVACY_CHROME_SURFACES) {
            const source = readSurface(surface.file);
            expect(source, `${surface.file} must import the register`).toContain('privacyChrome');
            expect(
                source.includes(`privacyChrome('${surface.privacyClass}')`),
                `${surface.file} must apply privacyChrome('${surface.privacyClass}') at mount`
            ).toBe(true);
        }
    });

    it('honours the brief’s explicit EXEMPTION — an exempt surface wears no tint', () => {
        for (const surface of SPEC_EXEMPT_SURFACES) {
            const source = readSurface(surface.file);
            expect(
                /privacyChrome\(|mext-privacy-/.test(source),
                `${surface.file} is spec-exempt (${surface.warrant}) and must stay untinted`
            ).toBe(false);
        }
    });

    it('NO DRIFT — no surface wears a tint without a row, across BOTH surface dirs', () => {
        const declared = new Set(PRIVACY_CHROME_SURFACES.map(s => s.file));
        const stray = allSurfaceFiles().filter(file => {
            const source = readFileSync(join(SRC, file), 'utf8');
            return (/privacyChrome\(/.test(source) || /mext-privacy-/.test(source)) && !declared.has(file);
        });
        expect(stray, 'a surface wears a privacy tint without a row in the register').toEqual([]);
    });

    it('no surface hardcodes a tint class string instead of going through the register', () => {
        const offenders = allSurfaceFiles().filter(file =>
            /className=["'][^"']*mext-privacy-/.test(readFileSync(join(SRC, file), 'utf8'))
        );
        expect(offenders, 'tint classes are the register’s to emit, not a string literal').toEqual([]);
    });
});

describe('25.T25.18 — the title carries the full PRIVACY_CLASS string', () => {
    it('names the class verbatim, plus a gloss for accessibility', () => {
        for (const privacyClass of PRIVACY_CLASSES) {
            const { title, className } = privacyChrome(privacyClass);
            expect(title.startsWith(privacyClass), `${privacyClass} must lead its own title`).toBe(true);
            expect(title.length).toBeGreaterThan(privacyClass.length + 10);
            expect(className).toBe(PRIVACY_TINT_CLASS[privacyClass]);
            expect(privacyTitle(privacyClass)).toBe(title);
        }
    });

    it('emits a distinct tint class per privacy class', () => {
        const classes = PRIVACY_CLASSES.map(c => PRIVACY_TINT_CLASS[c]);
        expect(new Set(classes).size).toBe(PRIVACY_CLASSES.length);
    });
});
