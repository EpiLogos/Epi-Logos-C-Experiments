/**
 * 31.T31.9 — the preference-key authority, and the guard that keeps it the ONLY
 * one.
 *
 * The disease this cures is the same one 52.T1 cured for layout ids: a key
 * spelled in more than one place, with nothing keeping the copies equal. It was
 * already live here — `epi-logos.onboarding.pasu-skipped` was declared as a
 * constant in `onboarding/pasuOnboarding.ts` AND written as an inline literal in
 * `onboarding/firstSessionOrchestration.ts`, so a rename in one would have left
 * the other silently reading a key nothing writes (the user's PASU skip would
 * simply stop being remembered — no error, no crash).
 *
 * The scan below is the teeth. It walks the real `src` tree for preference-shaped
 * literals and fails on any that the authority does not declare. Command ids
 * share the `epi-logos.` prefix and are subtracted explicitly against the real
 * `COMMAND_CATALOG` rather than by pattern, so a command can never be mistaken
 * for an undeclared preference and an undeclared preference can never hide
 * behind "it's probably a command".
 */

import { readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { COMMAND_CATALOG } from '../commands/catalog';
import { LAYOUT_IDS } from './layoutId';
import { THEME_SELECTIONS } from './themeMapping';
import {
    EPI_LOGOS_PREFERENCES,
    PREFERENCE_KEYS,
    PREFERENCE_NAMESPACE_PATTERN,
    SPECIFIED_PREFERENCES,
    isPreferenceKey,
    preferenceDescriptor
} from './preferences';

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx']);
const SRC_ROOT = resolve(__dirname, '..');
const AUTHORITY_FILE = resolve(__dirname, 'preferences.ts');

/** Any `'epi-logos.<area>.<setting>'` string literal. */
const PREFERENCE_SHAPED_LITERAL = /['"](epi-logos\.[a-z][a-z0-9]*\.[a-zA-Z][a-zA-Z0-9.-]*)['"]/g;

const COMMAND_IDS = new Set(COMMAND_CATALOG.map(command => command.id));

function sourceFiles(root: string): string[] {
    const files: string[] = [];
    const walk = (directory: string) => {
        for (const entry of readdirSync(directory, { withFileTypes: true })) {
            if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'test-results') {
                continue;
            }
            const path = join(directory, entry.name);
            if (entry.isDirectory()) {
                walk(path);
            } else if (SOURCE_EXTENSIONS.has(extname(entry.name))) {
                files.push(path);
            }
        }
    };
    walk(root);
    return files;
}

interface Finding {
    readonly file: string;
    readonly key: string;
}

function scanForUndeclaredPreferenceLiterals(): { scanned: number; findings: Finding[] } {
    // Tests assert produced values; they are not the app and may spell a key.
    const files = sourceFiles(SRC_ROOT).filter(
        path => path !== AUTHORITY_FILE && !/\.(test|spec)\.tsx?$/.test(path)
    );
    const findings: Finding[] = [];
    for (const file of files) {
        const body = readFileSync(file, 'utf8');
        for (const match of body.matchAll(PREFERENCE_SHAPED_LITERAL)) {
            const key = match[1];
            if (COMMAND_IDS.has(key)) {
                continue; // a command id, a different register entirely
            }
            findings.push({ file: relative(SRC_ROOT, file), key });
        }
    }
    return { scanned: files.length, findings };
}

describe('31.T31.9 preference-key authority', () => {
    it('declares every key inside the 31.9 namespace law', () => {
        for (const descriptor of EPI_LOGOS_PREFERENCES) {
            expect(
                PREFERENCE_NAMESPACE_PATTERN.test(descriptor.key),
                `${descriptor.key} must match epi-logos.{area}.{setting}`
            ).toBe(true);
        }
        for (const entry of SPECIFIED_PREFERENCES) {
            expect(
                PREFERENCE_NAMESPACE_PATTERN.test(entry.key),
                `${entry.key} (specified) must match epi-logos.{area}.{setting}`
            ).toBe(true);
        }
    });

    it('holds each key exactly once, and the register agrees with the key map', () => {
        const keys = EPI_LOGOS_PREFERENCES.map(descriptor => descriptor.key);
        expect(new Set(keys).size).toBe(keys.length);
        expect([...keys].sort()).toEqual([...Object.values(PREFERENCE_KEYS)].sort());
    });

    it('gives every preference a usable default of its declared type', () => {
        for (const descriptor of EPI_LOGOS_PREFERENCES) {
            if (descriptor.type === 'boolean') {
                expect(typeof descriptor.defaultValue).toBe('boolean');
            } else if (descriptor.type === 'string-array') {
                expect(Array.isArray(descriptor.defaultValue)).toBe(true);
            } else {
                expect(typeof descriptor.defaultValue).toBe('string');
            }
            // A closed set must actually contain the default, or first run is
            // already outside its own vocabulary.
            if (descriptor.enumValues) {
                expect(descriptor.enumValues).toContain(descriptor.defaultValue as string);
            }
            expect(descriptor.description.length).toBeGreaterThan(20);
            expect(descriptor.owningTranche).toMatch(/\d/);
        }
    });

    it('CONSUMES the layout and theme vocabularies rather than restating them', () => {
        // If these forked, a preference could offer a layout the app cannot
        // mount, or a theme `themeMapping` cannot resolve.
        expect(preferenceDescriptor(PREFERENCE_KEYS.layoutActive)?.enumValues).toBe(LAYOUT_IDS);
        expect(preferenceDescriptor(PREFERENCE_KEYS.appearanceTheme)?.enumValues).toBe(
            THEME_SELECTIONS
        );
    });

    it('recognises its own keys and refuses a command id or a stranger', () => {
        expect(isPreferenceKey(PREFERENCE_KEYS.onboardingPasuSkipped)).toBe(true);
        expect(isPreferenceKey('epi-logos.help.openWalkthrough')).toBe(false); // a command
        expect(isPreferenceKey('epi-logos.nope.invented')).toBe(false);
        expect(preferenceDescriptor('epi-logos.nope.invented')).toBeUndefined();
    });

    it('records the spec keys the carrier does NOT read, with a reason each', () => {
        // 31.9 designs nine; the carrier reads six. Declaring the other three as
        // live keys nothing reads would be a registered-but-unfired seam, so they
        // are recorded here instead — and the record must stay honest.
        const live = new Set<string>(Object.values(PREFERENCE_KEYS));
        for (const entry of SPECIFIED_PREFERENCES) {
            expect(live.has(entry.key), `${entry.key} is recorded as unlanded but IS live`).toBe(
                false
            );
            expect(entry.note.length).toBeGreaterThan(20);
            expect(['pending', 'superseded', 'declined']).toContain(entry.status);
        }
        // The kairos opt-in really did land under a different name.
        const kairos = SPECIFIED_PREFERENCES.find(entry => entry.key === 'epi-logos.kairos.enabled');
        expect(kairos?.status).toBe('superseded');
        expect(live.has(PREFERENCE_KEYS.privacyKairosEnabled)).toBe(true);
    });

    it('is the ONLY place in src that spells a preference key', () => {
        const { scanned, findings } = scanForUndeclaredPreferenceLiterals();
        // Prove the walk actually looked — a scan over zero files is green and
        // meaningless (the 52.T1 guard learned this the hard way).
        expect(scanned).toBeGreaterThan(100);
        expect(
            findings,
            `preference keys must be declared in ui/preferences.ts and aliased, not spelled inline:\n${findings
                .map(finding => `  ${finding.file}: ${finding.key}`)
                .join('\n')}`
        ).toEqual([]);
    });
});
