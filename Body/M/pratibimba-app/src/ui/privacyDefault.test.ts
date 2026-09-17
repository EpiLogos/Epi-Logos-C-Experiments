// @vitest-environment node
/**
 * 32.T32.8 — the privacy-class DEFAULT, held against its two authorities.
 *
 * Two failure shapes this suite exists to make impossible:
 *
 *   1. A default declared in `ui/preferences.ts` and separately hard-coded at
 *      the point of use, so changing the register changes nothing. The scan
 *      below walks the real `src` tree for any second spelling of a privacy
 *      class in a default position and fails on it — the same teeth 31.T31.9
 *      put on preference KEYS, applied to this preference's VALUE.
 *   2. A ceiling table that quietly authorises a crossing. The 32.8 law is
 *      "per-artifact opt-in is the ONLY public-bridge crossing path; no global
 *      make-everything-public switch". That is asserted here as a property of
 *      the data, not as a promise in a comment: NO row of the ceiling table may
 *      resolve to `shared_archetype_opt_in`, so no combination of extension and
 *      user preference can reach the crossing class without a consent record.
 *
 * The per-extension ceilings are held in lockstep with the REAL 07-T0 contract
 * (`Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json`),
 * read from disk — a ceiling that drifts from the contract it claims to honour
 * is a ceiling that is not being honoured.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
    CONTRACT_CLASS_CEILING,
    DEFAULT_PRIVACY_CLASS,
    EXTENSION_CONTRACT_CLASS,
    M_EXTENSION_IDS,
    PRIVACY_DEFAULT_CLASS_PREFERENCE,
    PRIVACY_EXPOSURE_RANK,
    clampToCeiling,
    effectivePrivacyClass,
    isPrivacyClass,
    privacyCeiling,
    readDefaultPrivacyClass
} from './privacyDefault';
import { PRIVACY_CLASSES, type PrivacyClass } from './privacyChrome';
import { EPI_LOGOS_PREFERENCES, PREFERENCE_KEYS, SPECIFIED_PREFERENCES } from './preferences';

const SRC_ROOT = resolve(__dirname, '..');
const REPO_ROOT = resolve(__dirname, '../../../../..');
const CONTRACT_PATH = join(
    REPO_ROOT,
    'Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json'
);

describe('32.T32.8 — the default is DECLARED once and READ from that declaration', () => {
    it('is a live preference with `protected_local` as its shipped default', () => {
        const descriptor = EPI_LOGOS_PREFERENCES.find(
            entry => entry.key === PREFERENCE_KEYS.privacyDefaultClass
        );
        expect(descriptor, 'epi-logos.privacy.default-class must be a LIVE preference').toBeDefined();
        expect(descriptor?.defaultValue).toBe('protected_local');
        expect(descriptor?.type).toBe('string');
        expect(descriptor?.enumValues).toEqual(PRIVACY_CLASSES);
        expect(PRIVACY_DEFAULT_CLASS_PREFERENCE).toBe('epi-logos.privacy.default-class');
    });

    it('no longer stands in the specified-but-not-live register', () => {
        expect(
            SPECIFIED_PREFERENCES.map(entry => entry.key),
            'the key is live now; leaving it disclosed as pending would tell Settings to render it as a dead row'
        ).not.toContain('epi-logos.privacy.default-class');
    });

    it('DERIVES the constant from the register rather than re-spelling it', () => {
        const descriptor = EPI_LOGOS_PREFERENCES.find(
            entry => entry.key === PREFERENCE_KEYS.privacyDefaultClass
        );
        expect(DEFAULT_PRIVACY_CLASS).toBe(descriptor?.defaultValue);
        // and the module body must not carry a second literal spelling of it
        const body = readFileSync(join(SRC_ROOT, 'ui/privacyDefault.ts'), 'utf8');
        const declarationLine = body
            .split('\n')
            .find(line => line.includes('export const DEFAULT_PRIVACY_CLASS'));
        expect(declarationLine, 'DEFAULT_PRIVACY_CLASS must exist').toBeDefined();
        expect(
            /['"]protected_local['"]/.test(declarationLine ?? ''),
            'DEFAULT_PRIVACY_CLASS must be derived from the preference register, not assigned a literal'
        ).toBe(false);
    });
});

describe('32.T32.8 — the default is ENFORCED at the read path', () => {
    const notAClass: readonly unknown[] = [
        null,
        undefined,
        '',
        'public',
        'protected-local',
        'PROTECTED_LOCAL',
        42,
        {},
        ['protected_local']
    ];

    it('falls back to the declared default for every value that is not a class', () => {
        for (const value of notAClass) {
            expect(
                readDefaultPrivacyClass(value),
                `${JSON.stringify(value) ?? 'undefined'} must resolve to the shipped default`
            ).toBe(DEFAULT_PRIVACY_CLASS);
        }
    });

    it('returns a stored class unchanged when it really is one of the three', () => {
        for (const value of PRIVACY_CLASSES) {
            expect(readDefaultPrivacyClass(value)).toBe(value);
        }
    });

    it('recognises exactly the three classes and nothing adjacent to them', () => {
        for (const value of PRIVACY_CLASSES) {
            expect(isPrivacyClass(value)).toBe(true);
        }
        for (const value of notAClass) {
            expect(isPrivacyClass(value)).toBe(false);
        }
    });
});

describe('32.T32.8 — the per-extension ceiling, held against the real 07-T0 contract', () => {
    const contract = JSON.parse(readFileSync(CONTRACT_PATH, 'utf8')) as {
        extensions: readonly { id: string; privacyClass: string }[];
    };

    it('reads the real contract, not an empty or stubbed file', () => {
        expect(contract.extensions).toHaveLength(6);
        for (const extension of contract.extensions) {
            expect(typeof extension.privacyClass).toBe('string');
            expect(extension.privacyClass.length).toBeGreaterThan(0);
        }
    });

    it('mirrors every extension id and contract class exactly', () => {
        const fromContract = Object.fromEntries(
            contract.extensions.map(extension => [extension.id, extension.privacyClass])
        );
        expect(EXTENSION_CONTRACT_CLASS).toEqual(fromContract);
        expect([...M_EXTENSION_IDS].sort()).toEqual(Object.keys(fromContract).sort());
    });

    it('gives EVERY contract class a ceiling row — a new extension cannot arrive unbounded', () => {
        for (const extension of contract.extensions) {
            expect(
                Object.prototype.hasOwnProperty.call(CONTRACT_CLASS_CEILING, extension.privacyClass),
                `${extension.id} declares ${extension.privacyClass}, which has no ceiling row`
            ).toBe(true);
            expect(PRIVACY_CLASSES).toContain(privacyCeiling(extension.id as never));
        }
    });

    it('NO ceiling row can authorise a crossing — the "no global switch" law, as data', () => {
        for (const [contractClass, ceiling] of Object.entries(CONTRACT_CLASS_CEILING)) {
            expect(
                ceiling,
                `${contractClass} would let an extension rest at the crossing class with no consent record`
            ).not.toBe('shared_archetype_opt_in');
        }
        for (const id of M_EXTENSION_IDS) {
            expect(PRIVACY_EXPOSURE_RANK[privacyCeiling(id)]).toBeLessThan(
                PRIVACY_EXPOSURE_RANK.shared_archetype_opt_in
            );
        }
    });

    it('m4-nara — the one extension whose contract class IS a carrier class — pins to it', () => {
        expect(EXTENSION_CONTRACT_CLASS['m4-nara']).toBe('protected_local');
        expect(privacyCeiling('m4-nara')).toBe('protected_local');
    });
});

describe('32.T32.8 — the effective class is min(user preference, extension ceiling)', () => {
    it('clamps a stored class DOWN to the ceiling, never up to it', () => {
        // m4-nara's ceiling is the tightest class there is
        for (const stored of PRIVACY_CLASSES) {
            expect(effectivePrivacyClass('m4-nara', stored)).toBe('protected_local');
        }
        // an extension with a looser ceiling still never exceeds the user's choice
        expect(effectivePrivacyClass('m0-anuttara', 'protected_local')).toBe('protected_local');
    });

    it('never returns a class more exposed than either input', () => {
        for (const id of M_EXTENSION_IDS) {
            for (const stored of PRIVACY_CLASSES) {
                const effective = effectivePrivacyClass(id, stored);
                expect(PRIVACY_EXPOSURE_RANK[effective]).toBeLessThanOrEqual(
                    PRIVACY_EXPOSURE_RANK[stored]
                );
                expect(PRIVACY_EXPOSURE_RANK[effective]).toBeLessThanOrEqual(
                    PRIVACY_EXPOSURE_RANK[privacyCeiling(id)]
                );
            }
        }
    });

    it('applies the DEFAULT — not the loosest class — when nothing is stored', () => {
        for (const id of M_EXTENSION_IDS) {
            expect(effectivePrivacyClass(id, undefined)).toBe(
                clampToCeiling(DEFAULT_PRIVACY_CLASS, privacyCeiling(id))
            );
        }
        // and the shipped default is the tightest of the three, so an unwritten
        // preference is the SAFEST resting state, not merely a defined one.
        expect(PRIVACY_EXPOSURE_RANK[DEFAULT_PRIVACY_CLASS]).toBe(
            Math.min(...PRIVACY_CLASSES.map(value => PRIVACY_EXPOSURE_RANK[value]))
        );
    });

    it('ranks the three classes strictly, so `min` is a real order and not a tie', () => {
        const ranks = PRIVACY_CLASSES.map(value => PRIVACY_EXPOSURE_RANK[value]);
        expect(new Set(ranks).size).toBe(PRIVACY_CLASSES.length);
        expect(PRIVACY_EXPOSURE_RANK.protected_local).toBeLessThan(
            PRIVACY_EXPOSURE_RANK.protected_local_handle_only
        );
        expect(PRIVACY_EXPOSURE_RANK.protected_local_handle_only).toBeLessThan(
            PRIVACY_EXPOSURE_RANK.shared_archetype_opt_in
        );
    });
});

describe('32.T32.8 — no second spelling of the default anywhere in `src`', () => {
    const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx']);
    /** The register and the vocabulary are where a class literal legitimately
     *  appears as a DEFAULT. Everything else must go through
     *  `readDefaultPrivacyClass` / `DEFAULT_PRIVACY_CLASS`. */
    const VOCABULARY_FILES = new Set([
        'ui/privacyChrome.ts',
        'ui/preferences.ts',
        'ui/privacyDefault.ts',
        'ui/tokens.ts',
        'ui/themeMapping.ts'
    ]);

    function sourceFiles(): string[] {
        const out: string[] = [];
        const walk = (directory: string) => {
            for (const entry of readdirSync(directory, { withFileTypes: true })) {
                if (entry.name === 'node_modules' || entry.name === 'dist') continue;
                const path = join(directory, entry.name);
                if (entry.isDirectory()) walk(path);
                else if (SOURCE_EXTENSIONS.has(extname(entry.name))) out.push(path);
            }
        };
        walk(SRC_ROOT);
        return out;
    }

    it('no module falls back to a privacy class of its own instead of the register', () => {
        // Precisely the drift shape, and nothing wider. A `??` / `||` fallback
        // or a default PARAMETER value is a module deciding for itself what an
        // absent class means — it would not move when the register moves.
        //
        // Deliberately NOT caught: a surface DECLARING its own class
        // (`export const NARA_PRIVACY_CLASS = 'protected_local' as const`,
        // `privacyClass: 'protected_local'` in a contribution row) or COMPARING
        // against one (`receipt.privacyClass !== 'protected_local'`). Those are
        // per-surface facts, which is exactly how 25.T25.18's own register
        // works; they are not defaults and collapsing the two would have made
        // this guard noise instead of teeth.
        const CLASS = '(?:protected_local|protected_local_handle_only|shared_archetype_opt_in)';
        const FALLBACK = new RegExp(`(?:\\?\\?|\\|\\|)\\s*['"]${CLASS}['"]`);
        // the lookbehind keeps `!==` / `===` comparisons out: a surface CHECKING
        // a class is not a surface defaulting to one.
        const DEFAULT_PARAM = new RegExp(`(?<![!=<>])=\\s*['"]${CLASS}['"]\\s*[,)]`);
        const offenders = sourceFiles()
            .filter(path => !/\.(test|spec)\.tsx?$/.test(path))
            .map(path => relative(SRC_ROOT, path))
            .filter(rel => !VOCABULARY_FILES.has(rel))
            .filter(rel => {
                const body = readFileSync(join(SRC_ROOT, rel), 'utf8');
                return FALLBACK.test(body) || DEFAULT_PARAM.test(body);
            });
        expect(
            offenders,
            'a privacy class used as a fallback default outside the register would not move when the register does'
        ).toEqual([]);
    });

    it('the guard has teeth — it catches both drift shapes on a synthetic body', () => {
        const CLASS = '(?:protected_local|protected_local_handle_only|shared_archetype_opt_in)';
        const FALLBACK = new RegExp(`(?:\\?\\?|\\|\\|)\\s*['"]${CLASS}['"]`);
        // the lookbehind keeps `!==` / `===` comparisons out: a surface CHECKING
        // a class is not a surface defaulting to one.
        const DEFAULT_PARAM = new RegExp(`(?<![!=<>])=\\s*['"]${CLASS}['"]\\s*[,)]`);
        expect(FALLBACK.test("const cls = stored ?? 'protected_local';")).toBe(true);
        expect(FALLBACK.test("const cls = stored || 'shared_archetype_opt_in';")).toBe(true);
        expect(DEFAULT_PARAM.test("function f(cls = 'protected_local') {}")).toBe(true);
        // and does not fire on the legitimate shapes it deliberately allows
        expect(FALLBACK.test("privacyClass: 'protected_local',")).toBe(false);
        expect(DEFAULT_PARAM.test("export const X = 'protected_local' as const;")).toBe(false);
        expect(DEFAULT_PARAM.test("if (receipt.privacyClass !== 'protected_local') {}")).toBe(false);
    });

    it('the scan really walked the tree it claims to walk', () => {
        const files = sourceFiles();
        expect(files.length).toBeGreaterThan(200);
        expect(files.some(path => path.endsWith(join('ui', 'privacyDefault.ts')))).toBe(true);
    });
});

describe('32.T32.8 — the default reaches the surfaces that describe it', () => {
    it('the walkthrough tells the user the real default, generated not transcribed', async () => {
        const { walkthroughSteps } = await import('../onboarding/walkthrough');
        const step = walkthroughSteps().find(entry => entry.id === 'walkthrough.cosmic-personal');
        expect(step, 'walkthrough step 6 must exist').toBeDefined();
        expect(step?.body).toContain(DEFAULT_PRIVACY_CLASS);
        expect(step?.body.toLowerCase()).toContain('per-artifact');
        expect(step?.body).toContain('Settings');
        // generated from the constant: the source must not transcribe the class
        const source = readFileSync(join(SRC_ROOT, 'onboarding/walkthrough.ts'), 'utf8');
        expect(source).toContain('DEFAULT_PRIVACY_CLASS');
    });

    it('Settings → Privacy carries it as a LIVE control, not a disclosure row', async () => {
        const { settingsSection, liveEntries, disclosedEntries } = await import('./settingsSections');
        const privacy = settingsSection('privacy');
        const live = liveEntries(privacy).map(entry => entry.key);
        expect(live).toContain(PREFERENCE_KEYS.privacyDefaultClass);
        expect(disclosedEntries(privacy).map(entry => entry.key)).not.toContain(
            PREFERENCE_KEYS.privacyDefaultClass
        );
    });
});

/** Type-level: the three carrier classes and nothing else can be a ceiling. */
const _ceilingIsAPrivacyClass: readonly PrivacyClass[] = Object.values(CONTRACT_CLASS_CEILING);
void _ceilingIsAPrivacyClass;
