// @vitest-environment node
/**
 * Coordinate: M' M4' (Wave-C contribution gate — 25.T25.21)
 * Residency: Body/M/pratibimba-app/src/composition/waveCContributions.test.ts
 * Actualises: the assertion that makes the register worth having — every row is
 *   read back off the REAL source, in both directions. A row that names a
 *   symbol, a test handle, a factory key or a command that is not there fails;
 *   a Wave-C surface that exists with no row fails.
 *
 *   This is the check the frozen barrel could not make. `TRACK_08_EXPORTS` is a
 *   `as const` array of string literals, and TypeScript never compares a string
 *   literal to anything — which is how five of its 23 names came to reference
 *   symbols that do not exist anywhere in the extension they belong to. Reading
 *   the sources is the only thing that closes that gap.
 * Does NOT own: the privacy vocabulary (`ui/privacyChrome.ts` — this file only
 *   asserts the two registers agree), the blocker vocabulary
 *   (`integratedReadinessEnvelope.ts`), or any surface's behaviour.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
    INTEGRATED_450_CONSUMER_LAYOUT,
    KNOWN_COMPOSITION_BLOCKER_IDS,
    KNOWN_PERSONAL_SLOT_NAMES,
    M4_WAVE_C_CONTRIBUTIONS,
    UNENROLLED_FROZEN_EXPORTS,
    gappedWaveCContributions,
    presentWaveCContributions,
    speccedConsumerSlots,
    waveCContribution,
    type SourceCitation,
    type WaveCStateSource,
    type WaveCSubsystemId
} from './waveCContributions';
import { DEEP_PANE_RESERVATIONS, DEEP_PANE_SET, DEEP_PANE_WITHDRAWALS } from '../ui/deepPaneSet';
import { PRIVACY_CHROME_SURFACES } from '../ui/privacyChrome';
import { MN_FAMILY_ICON, type MnSubsystemId } from '../ui/iconography';
import { CROSS_LAYOUT_INTENT_TARGETS } from '../commands/crossLayoutIntent';
import { ownerOfMountedSlot } from './compositionLoad';
import { PERSONAL_SLOT_BLOCKERS, loadPersonalComposition } from './personalComposition';

const SRC = resolve(__dirname, '..');
const APP = readFileSync(join(SRC, 'App.tsx'), 'utf8');
const CATALOG = readFileSync(join(SRC, 'commands/catalog.ts'), 'utf8');
const ENGINE = readFileSync(join(SRC, 'engine/PersonalRecognitionEngine.tsx'), 'utf8');
// 52.T5: the personalHome arm renders HomePane, which mounts the engine.
const HOME = readFileSync(join(SRC, 'panes/HomePane.tsx'), 'utf8');

function readSurface(relFile: string): string {
    return readFileSync(join(SRC, relFile), 'utf8');
}

/** Repo root, four levels up from `src/` (`Body/M/pratibimba-app/src`). */
const REPO = resolve(SRC, '..', '..', '..', '..');

/**
 * The files a `warrant` is allowed to cite by LINE, and where they really live.
 * Both are outside the app: the design brief that assigns each view id, and the
 * frozen barrel whose pre-existing ids predate that brief. Citing outside the
 * carrier is the point — the warrant's job is to be checkable against the
 * document it quotes, and a copy inside `src/` could drift from it silently.
 */
const CITABLE_FILES: Readonly<Record<string, string>> = Object.freeze({
    '25-m4-nara-frontend-deep.md': join(
        REPO,
        'Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation',
        '25-m4-nara-frontend-deep.md'
    ),
    'index.ts': join(REPO, 'Body/M/epi-theia/extensions/m4-nara/src/common/index.ts')
});

/** `file:line — "quote"`, the one citation form a warrant may take. */
const CITATION_RE = /([\w.-]+\.(?:md|ts)):(\d+) — "([^"]+)"/g;

const citedFileCache = new Map<string, readonly string[]>();

/** The cited line's text, or null if the file has no such line. */
function citedSourceLine(file: string, line: number): string | null {
    const abs = CITABLE_FILES[file];
    if (abs === undefined) {
        throw new Error(
            `a warrant cites '${file}', which is not in CITABLE_FILES — add it with its real path, ` +
                'or the citation cannot be verified and must not be made'
        );
    }
    let lines = citedFileCache.get(file);
    if (!lines) {
        lines = readFileSync(abs, 'utf8').split('\n');
        citedFileCache.set(file, lines);
    }
    return line >= 1 && line <= lines.length ? lines[line - 1] : null;
}

/**
 * Compare quotes on CONTENT, not on typography. A warrant is hand-transcribed
 * from a markdown line, so backtick placement, curly vs straight quotes and run
 * of whitespace differ harmlessly; the words and identifiers are the claim.
 */
function normalise(text: string): string {
    return text
        // JSDoc continuation markers: a quoted sentence in a source comment
        // wraps as `\n * `, which is typography, not content.
        .replace(/\n\s*\*\s?/g, ' ')
        .replace(/[`*]/g, '')
        .replace(/[‘’]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
}

/** Every `SourceCitation` on a row, with the field it came from. */
function sourceCitationsOf(row: (typeof M4_WAVE_C_CONTRIBUTIONS)[number]): [string, SourceCitation][] {
    const out: [string, SourceCitation][] = [];
    if (row.gap) for (const c of row.gap.citations) out.push([`${row.viewId}.gap`, c]);
    if (row.mount.kind === 'direct-jsx') out.push([`${row.viewId}.mount.site`, row.mount.site]);
    if (row.mount.kind === 'cross-coordinate')
        out.push([`${row.viewId}.mount.rulingCitation`, row.mount.rulingCitation]);
    return out;
}

/** Every rendering surface, as `dir/file` keys. `.tsx` only: this sweep is
 *  about things that draw. The `.ts` model modules beside them back an enrolled
 *  pane rather than rendering, and holding them to a row would demand a view id
 *  for a projection function. */
function allRenderingSurfaces(): string[] {
    const out: string[] = [];
    for (const dir of ['panes', 'components']) {
        for (const entry of readdirSync(join(SRC, dir))) {
            if (!/\.tsx$/.test(entry) || /\.test\.tsx$/.test(entry)) continue;
            out.push(`${dir}/${entry}`);
        }
    }
    return out;
}

describe('25.T25.21 — the register carries the whole Wave-C set', () => {
    it('carries exactly the view ids the brief assigns, and no invented ones', () => {
        // A hardcoded expectation, not a derived one: a missing row must fail
        // here rather than shrink the set the rest of this file checks.
        expect(M4_WAVE_C_CONTRIBUTIONS.map(row => row.viewId).sort()).toEqual([
            'm4.nara.beingPatternPerspective',
            'm4.nara.dayCalendar',
            'm4.nara.dayContainer',
            'm4.nara.dialogicalArena',
            'm4.nara.journalEntries',
            'm4.nara.kairosDisplay',
            'm4.nara.lensApplication',
            'm4.nara.logosCycle',
            'm4.nara.medicine',
            'm4.nara.mercuriusRelay',
            'm4.nara.oracleCast',
            'm4.nara.oracleHistory',
            'm4.nara.pasuWizard',
            'm4.nara.personalCoordinate',
            'm4.nara.personalField',
            'm4.nara.pratibimbaCoordinate',
            'm4.nara.psycheAnchorCoherence',
            'm4.nara.quintessence',
            'm4.nara.rfactorFretboard',
            'm4.nara.sessionCloseCeremony',
            'm4.nara.timeAxisSwitcher',
            'm4.nara.transformContainers'
        ]);
    });

    it('keeps its local subsystem union identical to the carrier icon register', () => {
        // The register declares `WaveCSubsystemId` locally so that the browser
        // receipt does not carry a text-level import edge into a module holding
        // `import.meta.glob`. That copy is only safe if it cannot drift, so the
        // reconciliation happens here — in both directions, at the type level
        // and at the value level. A member added on either side fails.
        const bothWays: WaveCSubsystemId extends MnSubsystemId
            ? MnSubsystemId extends WaveCSubsystemId
                ? true
                : never
            : never = true;
        expect(bothWays).toBe(true);
        const local: readonly WaveCSubsystemId[] = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5'];
        expect(Object.keys(MN_FAMILY_ICON).sort()).toEqual([...local].sort());
    });

    it('mints no view id twice, and every row is M4', () => {
        const ids = M4_WAVE_C_CONTRIBUTIONS.map(row => row.viewId);
        expect(new Set(ids).size, 'a duplicated view id means two surfaces claim one name').toBe(ids.length);
        for (const row of M4_WAVE_C_CONTRIBUTIONS) {
            expect(row.subsystem).toBe('M4');
            expect(row.viewId, `${row.viewId} must sit in the m4.nara namespace`).toMatch(/^m4\.nara\.[a-zA-Z]+$/);
        }
    });

    it('refuses the barrel ids that no spec line assigns', () => {
        const ids = new Set(M4_WAVE_C_CONTRIBUTIONS.map(row => row.viewId));
        for (const refused of [
            'm4.nara.transform',
            'm4.nara.kairosWheel',
            'm4.nara.journalTimeline',
            'm4.nara.sessionBreakdown',
            'm4.nara.graphitiBrowser'
        ]) {
            expect(ids.has(refused), `${refused} has no assigning spec line and must not be minted`).toBe(false);
        }
        // The refusal is recorded, not silent.
        expect(UNENROLLED_FROZEN_EXPORTS.length).toBeGreaterThan(0);
        for (const entry of UNENROLLED_FROZEN_EXPORTS) {
            expect(entry.reason.length, `${entry.frozenExport} must say WHY it is unenrolled`).toBeGreaterThan(80);
        }
    });

    it('every row quotes a real source line that names the id it claims', () => {
        for (const row of M4_WAVE_C_CONTRIBUTIONS) {
            expect(row.warrant, `${row.viewId} must cite a line number`).toMatch(
                /(25-m4-nara-frontend-deep\.md|index\.ts):\d+ — /
            );
            expect(row.warrant, `${row.viewId}'s warrant must name the id it warrants`).toContain(row.viewId);
        }
    });

    // THE CHECK THIS FILE WAS MISSING.
    //
    // Until now the warrant was only format-checked: a row could cite
    // `25-m4-nara-frontend-deep.md:99999 — "the medicine wheel SHALL be rendered
    // in interpretive dance"` and pass green. An independent verifier proved
    // exactly that. The whole point of a warrant is that a reader can trust the
    // quotation without opening the spec, so the quotation is worthless unless
    // something opens the spec. This does.
    it('every quoted warrant really appears at the line it cites', () => {
        const seen: string[] = [];
        for (const row of M4_WAVE_C_CONTRIBUTIONS) {
            const citations = [...row.warrant.matchAll(CITATION_RE)];
            expect(
                citations.length,
                `${row.viewId}: warrant carries no verifiable "file:line — \\"quote\\"" citation`
            ).toBeGreaterThan(0);
            for (const [, file, line, quote] of citations) {
                const text = citedSourceLine(file, Number(line));
                expect(
                    text,
                    `${row.viewId}: ${file}:${line} does not exist (the file has fewer lines)`
                ).not.toBeNull();
                expect(
                    normalise(text as string).includes(normalise(quote)),
                    `${row.viewId}: ${file}:${line} does not contain the quoted text.\n` +
                        `  quoted:  ${quote}\n` +
                        `  line is: ${(text as string).slice(0, 400)}`
                ).toBe(true);
                seen.push(`${file}:${line}`);
            }
        }
        // Guard the guard: if the spec files stopped resolving, every assertion
        // above would vacuously pass on an empty read. A healthy run checks the
        // real spec many times over.
        expect(seen.length, 'no warrant citations were checked at all').toBeGreaterThan(20);
    });

    it('quotes are verbatim, not paraphrases wearing quotation marks', () => {
        // One warrant shipped as a paraphrase inside quotation marks and read as
        // a citation. A paraphrase may be accurate and still mislead, because
        // the marks are the promise. Every quoted fragment must be findable.
        const paraphrases: string[] = [];
        for (const row of M4_WAVE_C_CONTRIBUTIONS) {
            for (const [, file, line, quote] of row.warrant.matchAll(CITATION_RE)) {
                const text = citedSourceLine(file, Number(line));
                if (!text || !normalise(text).includes(normalise(quote))) {
                    paraphrases.push(`${row.viewId} → ${file}:${line}`);
                }
            }
        }
        expect(paraphrases, 'a warrant quotes text that is not in the cited line').toEqual([]);
    });

    it('no prose field cites a SOURCE line number, because source moves', () => {
        // The register's most-cited target moved twice before anyone first
        // checked it (`crossLayoutIntent.ts` :86 → :115 → :143), and each stale
        // number read as a fact. Spec citations stay line-exact — the design
        // documents are stable and the quote is the claim — but a `.ts`/`.tsx`
        // line number in prose is unverifiable by construction, so it is banned
        // and `SourceCitation` is the checkable channel instead.
        const offenders: string[] = [];
        const SOURCE_LINE_REF = /[\w/.-]+\.tsx?:\d+/g;
        for (const row of M4_WAVE_C_CONTRIBUTIONS) {
            const prose: [string, string | undefined][] = [
                ['gap.evidence', row.gap?.evidence],
                ['mount.note', 'note' in row.mount ? row.mount.note : undefined],
                ['landedBy', row.landedBy ?? undefined]
            ];
            for (const [field, value] of prose) {
                for (const hit of (value ?? '').match(SOURCE_LINE_REF) ?? []) {
                    offenders.push(`${row.viewId}.${field} cites ${hit}`);
                }
            }
        }
        expect(offenders, 'prose cites a source line number instead of a SourceCitation anchor').toEqual([]);
    });
});

describe('25.T25.21 — every present row is real, read off the source', () => {
    it('names a symbol the carrier file actually exports or renders', () => {
        for (const row of M4_WAVE_C_CONTRIBUTIONS) {
            if (!row.carrier) continue;
            const source = readSurface(row.carrier.file);
            expect(
                source.includes(row.carrier.symbol),
                `${row.viewId} claims '${row.carrier.symbol}' in ${row.carrier.file}, which that file does not contain`
            ).toBe(true);
        }
    });

    it('names a symbol that is DECLARED there, not just any substring of the file', () => {
        // A bare `includes` was satisfiable by a single letter — an independent
        // verifier reduced a symbol to `'e'` and the gate stayed green. So the
        // symbol must appear in a position that means something: a declaration,
        // a component, or — for the two rows whose "symbol" is a DOM region
        // rather than an export — the test handle that names that region.
        for (const row of M4_WAVE_C_CONTRIBUTIONS) {
            if (!row.carrier) continue;
            const { file, symbol } = row.carrier;
            const source = readSurface(file);
            const s = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const declared = new RegExp(
                [
                    `export\\s+(?:default\\s+)?(?:async\\s+)?function\\s+${s}\\b`,
                    `export\\s+(?:const|let|class|type|interface)\\s+${s}\\b`,
                    `function\\s+${s}\\s*\\(`,
                    `const\\s+${s}\\s*[:=]`,
                    `<${s}[\\s/>]`,
                    `data-testid="${s}"`
                ].join('|')
            );
            expect(
                declared.test(source),
                `${row.viewId}: '${symbol}' occurs in ${file} but is not declared, rendered, ` +
                    'or emitted as a test handle there — a substring is not a symbol'
            ).toBe(true);
        }
    });

    it('every source citation resolves — anchors present, absences really absent', () => {
        // The checkable half of every prose claim. `mustBeAbsent` inverts it,
        // which is the only honest way to cite an ABSENCE: name the place the
        // surface would be registered, and prove it is not there.
        let checked = 0;
        for (const row of M4_WAVE_C_CONTRIBUTIONS) {
            for (const [where, citation] of sourceCitationsOf(row)) {
                const source = readSurface(citation.file);
                if (citation.mustBeAbsent) {
                    expect(
                        source.includes(citation.anchor),
                        `${where}: cites '${citation.anchor}' as ABSENT from ${citation.file}, but it is present`
                    ).toBe(false);
                } else {
                    expect(
                        source.includes(citation.anchor),
                        `${where}: cites '${citation.anchor}' in ${citation.file}, which does not contain it`
                    ).toBe(true);
                }
                checked += 1;
            }
        }
        expect(checked, 'no source citations were checked at all').toBeGreaterThan(10);
    });

    it('every flexlayout row names the face whose model really carries it', () => {
        // `face` was read by neither gate: a row could claim the cosmic face for
        // a personal tab and nothing noticed. The models are two named builders,
        // so the claim is checkable — the key must appear inside the body of the
        // one this row names.
        const bodyOf = (fn: string): string => {
            const start = APP.indexOf(`function ${fn}(`);
            expect(start, `App.tsx has no ${fn}()`).toBeGreaterThan(-1);
            // Up to the start of the next top-level function declaration.
            const next = APP.indexOf('\nfunction ', start + 1);
            return APP.slice(start, next === -1 ? undefined : next);
        };
        const models: Record<0 | 1, string> = { 0: bodyOf('cosmicDefault'), 1: bodyOf('personalDefault') };
        for (const row of M4_WAVE_C_CONTRIBUTIONS) {
            if (row.mount.kind !== 'flexlayout-tab') continue;
            const { face, component } = row.mount;
            expect(
                models[face].includes(`component: '${component}'`),
                `${row.viewId} claims face ${face}, but ${face === 1 ? 'personalDefault' : 'cosmicDefault'}() ` +
                    `does not declare '${component}'`
            ).toBe(true);
        }
    });

    it('a landedBy claim is backed by the carrier file that made it', () => {
        // `landedBy` is how the register refuses to launder a pending tranche as
        // delivered, so a fabricated one is worse than none. The tranche it names
        // must be traceable in the surface's own header.
        for (const row of M4_WAVE_C_CONTRIBUTIONS) {
            if (row.landedBy === null) continue;
            expect(row.carrier, `${row.viewId} claims landedBy but names no carrier`).not.toBeNull();
            const header = readSurface(row.carrier!.file).slice(0, 2500);
            // Accept either the full rerun id (25.T25.19) or the plan short form
            // (T3.2, 05.T5.1) — panes were authored under both conventions.
            const tokens = row.landedBy.match(/\d+\.T\d+\.\d+|T\d+\.\d+/g) ?? [];
            expect(tokens.length, `${row.viewId}: landedBy names no tranche id`).toBeGreaterThan(0);
            const found = tokens.some(t => header.includes(t) || header.includes(t.replace(/^0/, '')));
            expect(
                found,
                `${row.viewId}: landedBy claims ${tokens.join('/')}, but ${row.carrier!.file}'s header ` +
                    'names none of them'
            ).toBe(true);
        }
    });

    it('names a test handle the carrier file actually emits', () => {
        for (const row of M4_WAVE_C_CONTRIBUTIONS) {
            if (row.testid === null) continue;
            expect(row.carrier, `${row.viewId} declares a testid but no carrier file`).not.toBeNull();
            const source = readSurface(row.carrier!.file);
            expect(
                source.includes(`data-testid="${row.testid}"`),
                `${row.viewId} claims data-testid="${row.testid}" in ${row.carrier!.file}, which does not emit it`
            ).toBe(true);
        }
    });

    it('every flexlayout mount names a key that is in a model AND in the factory', () => {
        for (const row of M4_WAVE_C_CONTRIBUTIONS) {
            if (row.mount.kind !== 'flexlayout-tab') continue;
            const key = row.mount.component;
            // Both halves matter: a model entry with no factory arm renders an
            // empty tab, and a factory arm with no model entry is unreachable.
            expect(APP.includes(`component: '${key}'`), `${row.viewId}: no model tab declares '${key}'`).toBe(true);
            expect(APP.includes(`case '${key}':`), `${row.viewId}: the factory has no arm for '${key}'`).toBe(true);
        }
    });

    it('every flexlayout mount names the label its tab really wears', () => {
        for (const row of M4_WAVE_C_CONTRIBUTIONS) {
            if (row.mount.kind !== 'flexlayout-tab') continue;
            // Label and key must be adjacent in the model. The browser receipt
            // clicks by label, so a label that drifted from its key would send
            // the receipt at the wrong tab — or at nothing — while every
            // source-level assertion still passed.
            const adjacent = new RegExp(
                `name: '${row.mount.tabLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',\\s*component: '${row.mount.component}'`
            );
            expect(
                adjacent.test(APP),
                `${row.viewId}: no model tab pairs label '${row.mount.tabLabel}' with component '${row.mount.component}'`
            ).toBe(true);
        }
    });

    it('every overlay-command mount names a registered command', () => {
        for (const row of M4_WAVE_C_CONTRIBUTIONS) {
            if (row.mount.kind !== 'overlay-command') continue;
            expect(
                CATALOG.includes(`id: '${row.mount.commandId}'`),
                `${row.viewId} mounts on '${row.mount.commandId}', which the command catalog does not register`
            ).toBe(true);
        }
    });

    it('every nested section names a host that is itself enrolled', () => {
        const hosts = new Set(
            M4_WAVE_C_CONTRIBUTIONS.filter(r => r.mount.kind === 'flexlayout-tab').map(r =>
                r.mount.kind === 'flexlayout-tab' ? r.mount.component : ''
            )
        );
        for (const row of M4_WAVE_C_CONTRIBUTIONS) {
            if (row.mount.kind !== 'nested-section') continue;
            expect(
                hosts.has(row.mount.hostComponent),
                `${row.viewId} nests inside '${row.mount.hostComponent}', which is not an enrolled surface`
            ).toBe(true);
        }
    });

    it('every direct-jsx mount points at a site that really renders the symbol', () => {
        for (const row of M4_WAVE_C_CONTRIBUTIONS) {
            if (row.mount.kind !== 'direct-jsx') continue;
            const { file, anchor } = row.mount.site;
            const host = readSurface(file);
            // Both halves: the cited anchor is really there, and it really
            // mounts this row's symbol. The anchor used to be a line number,
            // which no test read and which had silently gone stale twice.
            expect(
                host.includes(anchor),
                `${row.viewId} cites '${anchor}' in ${file}, which does not contain it`
            ).toBe(true);
            expect(
                host.includes(`<${row.carrier!.symbol}`),
                `${row.viewId} claims to render in ${file}, which contains no <${row.carrier!.symbol}`
            ).toBe(true);
        }
    });

    it('every composition-slot mount names a real geometric slot', () => {
        for (const row of M4_WAVE_C_CONTRIBUTIONS) {
            if (row.mount.kind !== 'composition-slot') continue;
            expect(
                (KNOWN_PERSONAL_SLOT_NAMES as readonly string[]).includes(row.mount.slot),
                `${row.viewId} claims slot '${row.mount.slot}', which is not a personal geometric slot`
            ).toBe(true);
        }
    });

    it('every cross-coordinate row quotes the ruling that moved it', () => {
        for (const row of M4_WAVE_C_CONTRIBUTIONS) {
            if (row.mount.kind !== 'cross-coordinate') continue;
            // A surface recorded as landed elsewhere must cite where that was
            // decided; otherwise "absorbed" is indistinguishable from "missing".
            const { ruling, rulingCitation } = row.mount;
            const decided = readSurface(rulingCitation.file);
            expect(
                decided.includes(rulingCitation.anchor),
                `${row.viewId}: the ruling cites '${rulingCitation.anchor}' in ${rulingCitation.file}, ` +
                    'which does not contain it'
            ).toBe(true);
            expect(
                normalise(decided).includes(normalise(ruling)),
                `${row.viewId}: the quoted ruling does not appear in ${rulingCitation.file} — ` +
                    'a ruling that cannot be read back is a paraphrase, and this row rests on it'
            ).toBe(true);
            expect(row.carrier, `${row.viewId} is cross-coordinate and must not claim an m4-owned carrier`).toBeNull();
        }
    });
});

describe('25.T25.21 — every gap is declared, never faked', () => {
    it('a gapped row renders nothing, except the model-only case', () => {
        for (const row of gappedWaveCContributions()) {
            if (row.gap!.kind === 'model-only') {
                expect(row.carrier, `${row.viewId} is model-only and must name the model that landed`).not.toBeNull();
                expect(row.testid, `${row.viewId} is model-only — nothing renders, so there is no handle`).toBeNull();
            } else {
                expect(row.carrier, `${row.viewId} declares a gap but names a carrier`).toBeNull();
                expect(row.testid, `${row.viewId} declares a gap but names a test handle`).toBeNull();
            }
        }
    });

    it('names the tranche that owes the work, in rerun form', () => {
        for (const row of gappedWaveCContributions()) {
            expect(row.gap!.ownerTranche, `${row.viewId} must name an owing tranche`).toMatch(/^\d+\.T\d+\.\d+$/);
            expect(row.gap!.evidence.length, `${row.viewId}'s gap must carry evidence`).toBeGreaterThan(60);
        }
    });

    it('never invents a composition blocker id', () => {
        for (const row of gappedWaveCContributions()) {
            const blocker = row.gap!.compositionBlocker;
            if (blocker === null) continue;
            // `null` is the honest value for a gap with no composition slot —
            // the 29.5 registry's own law is that an id naming nothing is worse
            // than no blocker at all.
            expect(
                (KNOWN_COMPOSITION_BLOCKER_IDS as readonly string[]).includes(blocker),
                `${row.viewId} claims blocker '${blocker}', which the 29.5 registry does not define`
            ).toBe(true);
        }
    });

    it('a gap with a composition blocker really is a composition slot', () => {
        for (const row of gappedWaveCContributions()) {
            if (row.gap!.compositionBlocker === null) continue;
            expect(row.mount.kind).toBe('composition-slot');
        }
    });
});

describe('25.T25.21 — the register borrows vocabularies, never restates them', () => {
    it('agrees with the privacy register wherever both name the same file', () => {
        for (const row of M4_WAVE_C_CONTRIBUTIONS) {
            if (!row.carrier) continue;
            const declared = PRIVACY_CHROME_SURFACES.find(s => s.file === row.carrier!.file);
            if (!declared) continue;
            // The one legitimate divergence is a nested section that is
            // STRICTER than its host pane: the day container carries handles,
            // so it wears handle-only inside a protected-local pane.
            if (row.mount.kind === 'nested-section') {
                expect(row.privacyClass).toBe('protected_local_handle_only');
                continue;
            }
            expect(
                row.privacyClass,
                `${row.viewId} and the privacy register disagree about ${row.carrier!.file}`
            ).toBe(declared.privacyClass);
        }
    });

    it('carries a null class only where the brief exempts the surface', () => {
        const exempt = M4_WAVE_C_CONTRIBUTIONS.filter(row => row.privacyClass === null);
        expect(exempt.map(row => row.viewId)).toEqual(['m4.nara.mercuriusRelay']);
        expect(exempt[0].warrant).toContain('m4.nara.mercuriusRelay');
    });
});

describe('25.T25.21 — mini modes are declared, never copied', () => {
    it('declares modes only where the brief defines what each mode shows', () => {
        const withModes = M4_WAVE_C_CONTRIBUTIONS.filter(row => row.miniModes.length > 0);
        // The frozen barrel froze one triad and mapped it onto all 23 rows,
        // which carries no per-widget information at all. Two rows here name
        // their modes because two briefs define them; the rest say nothing,
        // which is the true statement.
        expect(withModes.map(row => row.viewId).sort()).toEqual(['m4.nara.dayCalendar', 'm4.nara.pasuWizard']);
        expect(withModes.length).toBeLessThan(M4_WAVE_C_CONTRIBUTIONS.length);
    });

    it('requires a defining quote exactly when modes are declared', () => {
        for (const row of M4_WAVE_C_CONTRIBUTIONS) {
            if (row.miniModes.length > 0) {
                expect(row.miniModeWarrant, `${row.viewId} declares modes and must quote what they show`).not.toBeNull();
                expect(row.miniModeWarrant!).toMatch(/25-m4-nara-frontend-deep\.md:\d+ — /);
                expect(row.miniModeWarrant!).toMatch(/badge|compact-card|inspector/);
            } else {
                expect(row.miniModeWarrant, `${row.viewId} declares no modes, so it must quote none`).toBeNull();
            }
        }
    });
});

describe('25.T25.21 — the three per-export seams are real (SPEC:288)', () => {
    /** A live surface — the only kind that can honestly carry a seam. */
    const live = M4_WAVE_C_CONTRIBUTIONS.filter(row => row.carrier !== null && row.gap === null);

    it('carries all three seams exactly on the rows that render', () => {
        expect(live.length, 'no live row at all would make every assertion below vacuous').toBe(17);
        for (const row of M4_WAVE_C_CONTRIBUTIONS) {
            const shouldCarry = row.carrier !== null && row.gap === null;
            const carries = [row.currentStateSelector, row.selectionHandler, row.evidenceSerializer];
            for (const seam of carries) {
                expect(
                    seam !== null,
                    `${row.viewId}: a seam is declared iff the surface renders (carrier=${row.carrier !== null}, gap=${row.gap !== null})`
                ).toBe(shouldCarry);
            }
        }
    });

    it('names a state reader the carrier file actually calls, on a source that matches it', () => {
        // The frozen contract said `shared-bridge` for all 23. This carrier has
        // four stores and a gateway, and which one a surface reads is a fact
        // about that surface — so it is read back off the file.
        const READER_FOR: Readonly<Partial<Record<WaveCStateSource, string>>> = {
            'composition-profile': 'useCompositionProfile',
            'tick-store': 'useTickStore',
            'session-store': 'useSessionStore',
            'provenance-store': 'useProvenanceStore'
        };
        for (const row of live) {
            const sel = row.currentStateSelector!;
            expect(sel.id, `${row.viewId}: the frozen contract's selector id form`).toBe(
                `${row.viewId}.currentProfile`
            );
            const source = readSurface(row.carrier!.file);
            expect(
                source.includes(sel.reader),
                `${row.viewId} reads via '${sel.reader}', which ${row.carrier!.file} never calls`
            ).toBe(true);
            const expected = READER_FOR[sel.source];
            if (expected) {
                expect(sel.reader, `${row.viewId}: source '${sel.source}' means reader '${expected}'`).toBe(
                    expected
                );
            }
            expect(sel.reads.length, `${row.viewId}: a selector that reads nothing selects nothing`).toBeGreaterThan(
                0
            );
            for (const field of sel.reads) {
                expect(
                    source.includes(field),
                    `${row.viewId} claims to read '${field}', which is not in ${row.carrier!.file}`
                ).toBe(true);
            }
        }
    });

    it('routes a selection through a REGISTERED intent that lands on this surface', () => {
        // This is the assertion the frozen contract could not make: it gave all
        // 23 handlers the same `ROUTE_PATH` string, which is not a route to any
        // of them. Here the target is resolved in the carrier's own table and
        // its component compared to where the surface actually mounts.
        const byKey = new Map(
            CROSS_LAYOUT_INTENT_TARGETS.map(t => [`${t.extensionId} ${t.contributionId}`, t])
        );
        for (const row of live) {
            const handler = row.selectionHandler!;
            expect(handler.id).toBe(`${row.viewId}SelectionHandler`);
            expect(handler.inputKind).toBe(`${row.viewId}.selection`);
            expect(
                (handler.intentTarget === null) !== (handler.unrouted === null),
                `${row.viewId}: a handler is routed or it says why not — never both, never neither`
            ).toBe(true);

            if (handler.intentTarget === null) {
                expect(
                    handler.unrouted!.length,
                    `${row.viewId} must say WHY nothing routes to it`
                ).toBeGreaterThan(40);
                continue;
            }
            const key = `${handler.intentTarget.extensionId} ${handler.intentTarget.contributionId}`;
            const target = byKey.get(key);
            expect(
                target,
                `${row.viewId} routes via ${handler.intentTarget.extensionId}/${handler.intentTarget.contributionId}, which is not a registered cross-layout target`
            ).toBeDefined();
            if (row.mount.kind === 'flexlayout-tab') {
                expect(
                    target!.component,
                    `${row.viewId}: its intent target lands on '${target!.component}', but the surface mounts at '${row.mount.component}'`
                ).toBe(row.mount.component);
            }
        }
    });

    it('serialises evidence under the row own class, and a handle-only row really carries a handle', () => {
        for (const row of live) {
            const ser = row.evidenceSerializer!;
            expect(ser.id).toBe(`${row.viewId}.evidenceSerializer`);
            expect(ser.evidenceKind).toBe(`${row.viewId}.evidence`);
            // SPEC:288's stated requirement, which the frozen contract broke on
            // all nine handle-only surfaces by using one extension-wide class.
            expect(
                ser.privacyClass,
                `${row.viewId}: the serializer class must match the widget's chrome (SPEC:288)`
            ).toBe(row.privacyClass);

            if (row.privacyClass === 'protected_local_handle_only') {
                expect(
                    ser.handleAttribute,
                    `${row.viewId} is handle-only, so something in it must carry a handle`
                ).not.toBeNull();
            }
            if (ser.handleAttribute !== null) {
                const source = readSurface(row.carrier!.file);
                expect(
                    source.includes(ser.handleAttribute),
                    `${row.viewId} claims '${ser.handleAttribute}' carries its handle, but ${row.carrier!.file} has no such thing`
                ).toBe(true);
            }
        }
    });

    it('never lets the frozen contract single-class defect reappear', () => {
        // The concrete regression: two DIFFERENT classes across the live set. A
        // future edit that collapses them back to one constant fails here.
        const classes = new Set(live.map(row => row.evidenceSerializer!.privacyClass));
        expect(classes.size, 'every serializer carrying one class is the frozen barrel bug').toBeGreaterThan(1);
        expect(classes.has('protected_local_handle_only')).toBe(true);
    });
});

describe('25.T25.21 — the integrated 4-5-0 consumer layout (SPEC:290)', () => {
    const mounted = loadPersonalComposition();

    it('covers every personal geometric slot exactly once', () => {
        expect(INTEGRATED_450_CONSUMER_LAYOUT.map(s => s.slot).sort()).toEqual(
            [...KNOWN_PERSONAL_SLOT_NAMES].sort()
        );
    });

    it('names the owner the live composition really grants that slot', () => {
        // Not asserted against a copy of the 29.3 table — resolved through the
        // same `loadPersonalComposition()` the engine runs, so a re-grant
        // upstream fails here instead of drifting silently.
        for (const slot of INTEGRATED_450_CONSUMER_LAYOUT) {
            expect(
                ownerOfMountedSlot(mounted, slot.slot),
                `${slot.slot}: the register and the live composition disagree about the owner`
            ).toBe(slot.carrierOwner);
        }
    });

    it('names an owner attribute the engine really publishes', () => {
        for (const slot of INTEGRATED_450_CONSUMER_LAYOUT) {
            expect(slot.ownerAttribute).toBe(`data-${slot.slot}-owner`);
            expect(
                ENGINE.includes(slot.ownerAttribute),
                `${slot.slot}: PersonalRecognitionEngine publishes no ${slot.ownerAttribute}`
            ).toBe(true);
        }
    });

    it('names a carrier that really renders it, except where the slot is blocked', () => {
        for (const slot of INTEGRATED_450_CONSUMER_LAYOUT) {
            if (slot.fate === 'blocked') {
                expect(slot.carrier, `${slot.slot} is blocked and must name no renderer`).toBeNull();
                expect(
                    Object.keys(PERSONAL_SLOT_BLOCKERS),
                    `${slot.slot} claims to be blocked but carries no registered blocker`
                ).toContain(slot.slot);
                continue;
            }
            expect(slot.carrier, `${slot.slot} is not blocked and must name what renders it`).not.toBeNull();
            const source = readSurface(slot.carrier!.file);
            expect(
                source.includes(slot.carrier!.symbol),
                `${slot.slot} claims '${slot.carrier!.symbol}' in ${slot.carrier!.file}, which does not contain it`
            ).toBe(true);
        }
    });

    it('assigns an export to exactly the three slots SPEC:290 names', () => {
        expect(speccedConsumerSlots().map(s => s.slot)).toEqual([
            'left-composition',
            'center-composition',
            'right-composition'
        ]);
        for (const slot of speccedConsumerSlots()) {
            expect(slot.specViewId, `${slot.slot} names an export and must name its view id`).not.toBeNull();
            expect(
                waveCContribution(slot.specViewId!),
                `${slot.slot} points at ${slot.specViewId}, which is not enrolled`
            ).not.toBeNull();
            expect(waveCContribution(slot.specViewId!)!.frozenExport).toBe(slot.specExport);
        }
        for (const slot of INTEGRATED_450_CONSUMER_LAYOUT) {
            if (slot.specExport !== null) continue;
            expect(slot.fate, `${slot.slot} has no specced occupant, so it cannot diverge from one`).toBe(
                'unspecced'
            );
            expect(slot.specViewId).toBeNull();
        }
    });

    it('a carried-elsewhere slot names where the function actually reaches the user', () => {
        // The failure this forbids: recording "the spec put X here, X is not
        // here" and stopping — which reads as a delivery to anyone scanning for
        // the export name, and as a loss to anyone scanning for the slot.
        for (const slot of INTEGRATED_450_CONSUMER_LAYOUT) {
            if (slot.fate !== 'carried-elsewhere') {
                expect(slot.carriedAt, `${slot.slot} is ${slot.fate} and must claim no carry`).toBeNull();
                continue;
            }
            const carried = waveCContribution(slot.carriedAt!);
            expect(carried, `${slot.slot} carries at ${slot.carriedAt}, which is not enrolled`).not.toBeNull();
            expect(
                carried!.mount.kind,
                `${slot.slot} claims ${slot.carriedAt} carries its function, but that row renders nowhere`
            ).not.toBe('absent');
            expect(carried!.gap, `${slot.slot} cannot be carried by a gapped row`).toBeNull();
            expect(slot.carriedAt).toBe(slot.specViewId);
        }
    });

    it('every slot states its evidence', () => {
        for (const slot of INTEGRATED_450_CONSUMER_LAYOUT) {
            expect(slot.evidence.length, `${slot.slot} must say why it is what it is`).toBeGreaterThan(80);
        }
    });
});

describe('25.T25.21 + 52.T4 — the layout law is DERIVED, for every row', () => {
    /**
     * The first cut of this block claimed derivation and delivered it for the 12
     * tab/nested rows only; the other ten were hard-coded a second time in
     * `expect(law('x')).toBe(...)` assertions sitting beside the rows they were
     * supposed to check. That is the same claim written twice, and it could not
     * fail loudly: if the deep layout later CARRIED `personalHome` or `cosmic`,
     * row and test would have agreed with each other while both disagreed with
     * the shell. So every mount kind now resolves to the HOST SURFACE it really
     * renders in, and the law is read off the pane set the shell really builds.
     */

    /** Where a row's law comes from once its mount is resolved. */
    type LayoutHost =
        | { kind: 'surface'; component: string; via: string }
        | { kind: 'layout-gated'; layout: string; via: string }
        | { kind: 'command-overlay'; commandId: string }
        | { kind: 'unrendered' };

    const carried = new Set(DEEP_PANE_SET.map(mount => mount.surfaceId));
    const withdrawn = new Set(DEEP_PANE_WITHDRAWALS.map(entry => entry.surfaceId));
    const reserved = new Set(DEEP_PANE_RESERVATIONS.map(entry => entry.surfaceId));

    /**
     * The DAILY component registry. The deep models are built from
     * `ui/deepPaneSet.ts`, so every string-literal `component:` key in `App.tsx`
     * is a daily-model key (plus the dynamic `editor` tab). This is what makes
     * `deep-only` derivable rather than merely representable: carried into depth
     * AND absent here.
     */
    const dailyComponents = new Set(
        [...APP.matchAll(/component: '([^']+)'/g)].map(match => match[1])
    );

    /** The factory is declared ahead of `App`, so an anchor's side of that
     *  boundary tells us whether it is a pane body or a shell-level overlay. */
    const FACTORY_AT = APP.indexOf('function factory(');
    const APP_AT = APP.indexOf('export function App(');

    /** The `case 'x':` arm an offset sits inside, or null outside the factory. */
    function enclosingFactoryCase(body: string, at: number): string | null {
        if (body !== APP || at < FACTORY_AT || at > APP_AT) {
            return null;
        }
        const cases = [...body.slice(0, at).matchAll(/case '([^']+)':/g)];
        return cases.length > 0 ? cases[cases.length - 1][1] : null;
    }

    /** `component:` key whose factory arm renders `<Symbol`. */
    function componentRenderedBy(symbol: string): string | null {
        const arms = [...APP.matchAll(/case '([^']+)':/g)];
        for (let i = 0; i < arms.length; i++) {
            const from = arms[i].index! + arms[i][0].length;
            const to = i + 1 < arms.length ? arms[i + 1].index! : APP_AT;
            if (APP.slice(from, to).includes(`<${symbol}`)) {
                return arms[i][1];
            }
        }
        return null;
    }

    function resolveHost(row: (typeof M4_WAVE_C_CONTRIBUTIONS)[number]): LayoutHost {
        const mount = row.mount;
        if (mount.kind === 'flexlayout-tab') {
            return { kind: 'surface', component: mount.component, via: 'its own tab' };
        }
        if (mount.kind === 'nested-section') {
            return { kind: 'surface', component: mount.hostComponent, via: 'the pane it nests in' };
        }
        if (mount.kind === 'overlay-command') {
            return { kind: 'command-overlay', commandId: mount.commandId };
        }
        if (mount.kind === 'model-only' || mount.kind === 'absent') {
            return { kind: 'unrendered' };
        }
        if (mount.kind === 'composition-slot') {
            // BRIDGE, read out of the sources rather than assumed: since 52.T5
            // the `personalHome` arm renders HomePane, and HomePane's default
            // 0/1 view mounts the personal composition root — so a geometric
            // slot is hosted by `personalHome`, one indirection deep.
            const arm = componentRenderedBy('HomePane');
            expect(arm, 'the personal composition root is not rendered by any factory arm').toBe(
                'personalHome'
            );
            expect(
                HOME.includes('<PersonalRecognitionEngine'),
                'HomePane no longer mounts the personal composition root'
            ).toBe(true);
            expect(
                ENGINE.includes('loadPersonalComposition'),
                'the composition root no longer loads the personal composition'
            ).toBe(true);
            return { kind: 'surface', component: 'personalHome', via: 'the personal composition' };
        }
        if (mount.kind === 'cross-coordinate') {
            // The host is a MODULE path; resolve it to a component key through
            // App.tsx's own import + factory arm.
            const specifier = `./${mount.host.replace(/\.tsx?$/, '')}`;
            const imported = new RegExp(
                `import \\{([^}]+)\\} from '${specifier.replace(/[.\/]/g, m => `\\${m}`)}'`
            ).exec(APP);
            expect(imported, `App.tsx imports nothing from ${specifier}`).not.toBeNull();
            const symbol = imported![1].split(',')[0].trim();
            const component = componentRenderedBy(symbol);
            expect(component, `no factory arm renders <${symbol}>`).not.toBeNull();
            return { kind: 'surface', component: component!, via: `<${symbol}> in ${mount.host}` };
        }
        // direct-jsx: the anchor's own position decides. Inside the factory it is
        // a pane body and inherits that pane's law; outside it is a shell-level
        // overlay and the `activeLayout === …` gate wrapping it IS the law.
        const body = readSurface(mount.site.file);
        const at = body.indexOf(mount.site.anchor);
        expect(at, `${mount.site.file} no longer contains ${mount.site.anchor}`).toBeGreaterThan(-1);
        const arm = enclosingFactoryCase(body, at);
        if (arm !== null) {
            return { kind: 'surface', component: arm, via: `inside the \`${arm}\` factory arm` };
        }
        // 52.T5: a direct-jsx site OUTSIDE App.tsx is a component module some
        // factory arm mounts — resolve it to that arm through App.tsx's own
        // import, the same derivation the cross-coordinate branch uses. The
        // law still reads off the REAL hosting arm, never off the row.
        if (mount.site.file !== 'App.tsx') {
            const specifier = `./${mount.site.file.replace(/\.tsx?$/, '')}`;
            const imported = new RegExp(
                `import \\{([^}]+)\\} from '${specifier.replace(/[.\/]/g, m => `\\${m}`)}'`
            ).exec(APP);
            expect(imported, `App.tsx imports nothing from ${specifier}`).not.toBeNull();
            const symbol = imported![1].split(',')[0].trim();
            const component = componentRenderedBy(symbol);
            expect(component, `no factory arm renders <${symbol}>`).not.toBeNull();
            return {
                kind: 'surface',
                component: component!,
                via: `<${symbol}> hosts ${mount.site.anchor}`
            };
        }
        // bounded window: the gate must WRAP the anchor, not merely exist somewhere
        const gates = [...body.slice(Math.max(0, at - 200), at).matchAll(/activeLayout === '([^']+)'/g)];
        expect(
            gates.length,
            `${mount.site.anchor} is a shell-level overlay with no layout gate wrapping it — the daily-only claim would rest on nothing`
        ).toBeGreaterThan(0);
        return {
            kind: 'layout-gated',
            layout: gates[gates.length - 1][1],
            via: `the overlay gate wrapping ${mount.site.anchor}`
        };
    }

    function expectedLaw(host: LayoutHost, viewId: string): string | null {
        if (host.kind === 'unrendered') {
            return null;
        }
        if (host.kind === 'command-overlay') {
            expect(
                CATALOG.includes(`'${host.commandId}'`),
                `${viewId} mounts as command ${host.commandId}, which is not catalogued`
            ).toBe(true);
            return 'both';
        }
        if (host.kind === 'layout-gated') {
            return host.layout === 'ide-deep' ? 'deep-only' : 'daily-only';
        }
        const component = host.component;
        // A host still RESERVED for its 28.x tranche is in NEITHER layout, so no
        // layout law can be true of it yet. Nothing hits this today; the branch
        // exists so the tranche that lands one is not forced to lie.
        if (reserved.has(component)) {
            return null;
        }
        expect(
            carried.has(component) || withdrawn.has(component),
            `${viewId} hosts in \`${component}\` (${host.via}), which has no deep disposition at all`
        ).toBe(true);
        if (carried.has(component)) {
            return dailyComponents.has(component) ? 'both' : 'deep-only';
        }
        return 'daily-only';
    }

    it('resolves EVERY row to a real host — no mount kind is left out', () => {
        const kinds = new Set(M4_WAVE_C_CONTRIBUTIONS.map(row => row.mount.kind));
        // if a new mount kind appears, the derivation must grow to meet it
        expect([...kinds].sort()).toEqual([
            'absent',
            'composition-slot',
            'cross-coordinate',
            'direct-jsx',
            'flexlayout-tab',
            'model-only',
            'nested-section',
            'overlay-command'
        ]);
        for (const row of M4_WAVE_C_CONTRIBUTIONS) {
            expect(resolveHost(row).kind, `${row.viewId}`).toBeTruthy();
        }
    });

    it('every row reads its layout law off the real deep pane set', () => {
        for (const row of M4_WAVE_C_CONTRIBUTIONS) {
            const host = resolveHost(row);
            expect(
                row.layoutLaw,
                `${row.viewId} is resolved through ${host.kind === 'surface' ? `\`${host.component}\` (${host.via})` : host.kind}`
            ).toBe(expectedLaw(host, row.viewId));
        }
    });

    it('the derivation really exercises the verdicts it can produce', () => {
        // A gate that only ever produced one answer would pass while checking
        // nothing, so each live verdict must have at least one row behind it.
        // Deliberately NOT exact counts: a later tranche adding a row would then
        // fail here for a reason having nothing to do with what this checks, and
        // the derivation above is what actually holds each row to the shell.
        // `deep-only` is derivable and unclaimed — checked separately below.
        const laws = M4_WAVE_C_CONTRIBUTIONS.map(row => row.layoutLaw);
        expect(laws.filter(law => law === 'daily-only').length).toBeGreaterThan(0);
        expect(laws.filter(law => law === 'both').length).toBeGreaterThan(0);
        expect(laws.filter(law => law === null).length).toBeGreaterThan(0);
        expect(laws.length).toBe(M4_WAVE_C_CONTRIBUTIONS.length);
    });

    it('a host reserved for an unlanded 28.x tranche is honestly unreached today', () => {
        // The `null`-for-reserved branch above is not decoration: assert that no
        // row currently hosts in one, so the branch is a real future case rather
        // than dead code nobody has read.
        const hostedInReserved = M4_WAVE_C_CONTRIBUTIONS.filter(row => {
            const host = resolveHost(row);
            return host.kind === 'surface' && reserved.has(host.component);
        }).map(row => row.viewId);
        expect(hostedInReserved).toEqual([]);
        // 28.T28.5 consumed the `agenticControlRoom` reservation — it is now a
        // carried DEEP-ONLY mount, not a seam. Two remain.
        expect([...reserved].sort()).toEqual(['backendStudio']);
    });

    it('no M4 row claims deep-only — the derivation allows it, the carrier does not', () => {
        // `deep-only` became representable at 52.T4 AND derivable: a host carried
        // into depth but absent from the daily registry produces it. 28.T28.5's
        // control room is the first surface in the carrier that IS deep-only, but
        // it is M5' chrome and hosts no M4 Wave-C row — so every row here is still
        // mounted in daily too, and the derivation's `deep-only` branch stays a
        // real future case for an M4 surface rather than a claim anything makes.
        expect(APP.includes('ideDeepDefault'), 'the deep pane set this law derives from').toBe(true);
        for (const row of M4_WAVE_C_CONTRIBUTIONS) {
            expect(row.layoutLaw, `${row.viewId}`).not.toBe('deep-only');
        }
    });

    it('leaves the 4+2 disposition unfilled for Track 52 T5', () => {
        for (const row of M4_WAVE_C_CONTRIBUTIONS) {
            expect(
                row.disposition,
                `${row.viewId} must not pre-decide whether it moves to an M4' subsystem page`
            ).toBeNull();
        }
    });
});

describe('25.T25.21 — NO DRIFT in the other direction', () => {
    it('every Wave-C rendering surface in the tree has a row', () => {
        const enrolled = new Set(
            M4_WAVE_C_CONTRIBUTIONS.filter(row => row.carrier).map(row => row.carrier!.file)
        );
        const stray = allRenderingSurfaces().filter(file => {
            const header = readFileSync(join(SRC, file), 'utf8').slice(0, 2000);
            return /25\.T25\.\d+|41\.T41\.7/.test(header) && !enrolled.has(file);
        });
        expect(stray, 'a Wave-C surface renders with no row in the register').toEqual([]);
    });

    it('a live surface whose own tranche has not closed says what landed it', () => {
        // Three surfaces are on screen while their brief's tranche is still
        // open. Enrolling them without this field would let the register imply
        // that those tranches are delivered.
        const laundered = M4_WAVE_C_CONTRIBUTIONS.filter(
            row => row.landedBy !== null && row.landedBy === row.tranche
        );
        expect(laundered, 'landedBy must name a DIFFERENT tranche than the one that owns the surface').toEqual([]);
        expect(
            M4_WAVE_C_CONTRIBUTIONS.filter(row => row.landedBy !== null).map(row => row.viewId).sort()
        ).toEqual(['m4.nara.journalEntries', 'm4.nara.oracleCast', 'm4.nara.quintessence']);
    });

    it('exposes exactly the rows a browser can drive', () => {
        expect(presentWaveCContributions().map(row => row.viewId).sort()).toEqual([
            'm4.nara.beingPatternPerspective',
            'm4.nara.dayCalendar',
            'm4.nara.dayContainer',
            'm4.nara.dialogicalArena',
            'm4.nara.journalEntries',
            'm4.nara.logosCycle',
            'm4.nara.medicine',
            'm4.nara.mercuriusRelay',
            'm4.nara.oracleCast',
            'm4.nara.oracleHistory',
            'm4.nara.pasuWizard',
            'm4.nara.pratibimbaCoordinate',
            'm4.nara.psycheAnchorCoherence',
            'm4.nara.quintessence',
            'm4.nara.sessionCloseCeremony',
            'm4.nara.timeAxisSwitcher',
            'm4.nara.transformContainers'
        ]);
        expect(waveCContribution('m4.nara.medicine')?.testid).toBe('medicine-pane');
        expect(waveCContribution('m4.nara.nothing')).toBeNull();
    });
});
