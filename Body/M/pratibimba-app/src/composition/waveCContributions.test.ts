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
    type WaveCStateSource,
    type WaveCSubsystemId
} from './waveCContributions';
import { PRIVACY_CHROME_SURFACES } from '../ui/privacyChrome';
import { MN_FAMILY_ICON, type MnSubsystemId } from '../ui/iconography';
import { CROSS_LAYOUT_INTENT_TARGETS } from '../commands/crossLayoutIntent';
import { ownerOfMountedSlot } from './compositionLoad';
import { PERSONAL_SLOT_BLOCKERS, loadPersonalComposition } from './personalComposition';

const SRC = resolve(__dirname, '..');
const APP = readFileSync(join(SRC, 'App.tsx'), 'utf8');
const CATALOG = readFileSync(join(SRC, 'commands/catalog.ts'), 'utf8');
const ENGINE = readFileSync(join(SRC, 'engine/PersonalRecognitionEngine.tsx'), 'utf8');

function readSurface(relFile: string): string {
    return readFileSync(join(SRC, relFile), 'utf8');
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
            const [file] = row.mount.site.split(':');
            const host = readSurface(file);
            expect(
                host.includes(`<${row.carrier!.symbol}`),
                `${row.viewId} claims to render at ${row.mount.site}, but ${file} contains no <${row.carrier!.symbol}`
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
            expect(row.mount.ruling).toMatch(/\.ts:\d+/);
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
        expect(live.length, 'no live row at all would make every assertion below vacuous').toBe(15);
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

describe('25.T25.21 — the layout law is derived from the real gate', () => {
    it('the one daily-only row really is gated on the layout, in App.tsx', () => {
        const dailyOnly = M4_WAVE_C_CONTRIBUTIONS.filter(row => row.layoutLaw === 'daily-only');
        expect(dailyOnly.map(row => row.viewId)).toEqual(['m4.nara.mercuriusRelay']);
        expect(
            APP.includes("activeLayout === 'daily-0-1'"),
            'the daily-only claim rests on a layout gate that App.tsx no longer has'
        ).toBe(true);
    });

    it('no row claims deep-only, because no deep pane set exists yet', () => {
        // `ideDeepDefault()` is unbuilt (Track 52 T4 pending) and the two models
        // are constructed once at boot and never rebuilt on a layout change, so
        // a deep-only claim could not be true. The type forbids it; this pins
        // the reason so a later widening is a deliberate act.
        expect(APP.includes('ideDeepDefault')).toBe(false);
        for (const row of M4_WAVE_C_CONTRIBUTIONS) {
            expect(['both', 'daily-only']).toContain(row.layoutLaw);
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
            'm4.nara.dayCalendar',
            'm4.nara.dayContainer',
            'm4.nara.dialogicalArena',
            'm4.nara.journalEntries',
            'm4.nara.logosCycle',
            'm4.nara.medicine',
            'm4.nara.mercuriusRelay',
            'm4.nara.oracleCast',
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
