// @vitest-environment node
/**
 * Coordinate: M5-3' Frontend Studio — registry gate (rerun 51.T51.2)
 * Residency: Body/M/pratibimba-app/src/panes/frontendStudio/paneRegistry.test.ts
 * Actualises: the tranche's "cannot drift from what actually rendered"
 *   acceptance, at the unit level. Two halves:
 *   (a) the ledger/inventory behaviour, and
 *   (b) a source-level tether proving the shell REALLY feeds the registry —
 *       `App.tsx::factory` calls `recordPaneRender` inside the factory, the
 *       shell publishes a four-cell walk, and every Track-51 surface has a
 *       factory arm, a CHROME-CONTRACT §2 `live` row, and a catalogued
 *       command. Without the tether the registry could report an empty world
 *       and every assertion below would still pass.
 * Does NOT own: the studio body, the factory, the declaration modules.
 * Contract: rerun tranche [[51.T51.2]].
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { beforeEach, describe, expect, it } from 'vitest';
import {
    compositionSlotOccupancy,
    declarationsFor,
    integratedPluginRecords,
    paneDeclarations,
    paneInventory,
    paneRegistrySnapshot,
    publishRegisteredPanes,
    recordPaneRender,
    resetPaneRegistry,
    subscribePaneRegistry,
    type RegisteredPaneMount
} from './paneRegistry';
import { TRACK_51_SURFACES } from '../track51Surfaces';
import { COMMAND_CATALOG } from '../../commands/catalog';
import { DEEP_PANE_SET } from '../../ui/deepPaneSet';
import { OMNIPANEL_TABS } from '../omni/omnipanelRuntime';
import { GEOMETRIC_SLOTS } from '../../composition/geometricSlotEnforcement';

const APP_PATH = resolve(__dirname, '../../App.tsx');
const APP = readFileSync(APP_PATH, 'utf8');
const CONTRACT_PATH = resolve(__dirname, '../../../CHROME-CONTRACT.md');
const CONTRACT = readFileSync(CONTRACT_PATH, 'utf8');

/** The factory's real `case` labels — the same AST idiom `chromeContract.test.ts`
 *  uses, so this gate reads the live registry, not prose. */
function factoryCases(): Set<string> {
    const source = ts.createSourceFile(APP_PATH, APP, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const cases = new Set<string>();
    const visit = (node: ts.Node, inFactory: boolean) => {
        let now = inFactory;
        if (ts.isFunctionDeclaration(node) && node.name?.text === 'factory') {
            now = true;
        }
        if (now && ts.isCaseClause(node) && ts.isStringLiteral(node.expression)) {
            cases.add(node.expression.text);
        }
        ts.forEachChild(node, child => visit(child, now));
    };
    visit(source, false);
    return cases;
}

/** §2 rows keyed by surface id, with their status cell. */
function contractRows(): Map<string, string> {
    const rows = new Map<string, string>();
    for (const line of CONTRACT.split('\n')) {
        if (!/^\| `[^`]+` \|/.test(line)) {
            continue;
        }
        const cells = line.split('|').map(cell => cell.trim());
        rows.set(cells[1].replace(/`/g, ''), cells[4]);
    }
    return rows;
}

function mount(component: string, overrides: Partial<RegisteredPaneMount> = {}): RegisteredPaneMount {
    return {
        component,
        nodeId: `node-${component}`,
        name: component,
        face: 0,
        layout: 'ide-deep',
        slot: 'main',
        selected: true,
        ...overrides
    };
}

beforeEach(() => {
    resetPaneRegistry();
});

describe('51.T51.2 — the shell really feeds the registry (source tether)', () => {
    it('the factory records every render it performs', () => {
        const factoryAt = APP.indexOf('function factory(');
        const appAt = APP.indexOf('export function App(');
        expect(factoryAt, 'App.tsx has no factory').toBeGreaterThan(-1);
        const body = APP.slice(factoryAt, appAt);
        expect(
            body.includes('recordPaneRender('),
            'App.tsx::factory must record its renders, or the studio reports a world it cannot see'
        ).toBe(true);
    });

    it('the shell publishes a FOUR-CELL mount walk, not just the active layout', () => {
        expect(APP).toContain('publishRegisteredPanes(collectRegisteredPaneMounts(models))');
        const walkAt = APP.indexOf('function collectRegisteredPaneMounts(');
        expect(walkAt, 'the four-cell walk is missing').toBeGreaterThan(-1);
        const walk = APP.slice(walkAt, walkAt + 1600);
        expect(walk, 'the walk must cover both layouts').toContain('LAYOUT_IDS');
        expect(walk, 'the walk must cover both faces').toContain('[0, 1] as const');
    });

    it('every Track-51 surface has a factory arm, a live §2 row, and a catalogued command', () => {
        const cases = factoryCases();
        const rows = contractRows();
        const catalogued = new Set(COMMAND_CATALOG.map(command => command.id));
        for (const surface of TRACK_51_SURFACES) {
            expect(cases.has(surface.surfaceId), `factory renders \`${surface.surfaceId}\``).toBe(true);
            expect(rows.get(surface.surfaceId), `§2 row for \`${surface.surfaceId}\``).toBe('live');
            expect(
                catalogued.has(surface.commandId),
                `\`${surface.commandId}\` must be catalogued, or the surface has no proven way in`
            ).toBe(true);
        }
    });

    it('declares at least the Frontend Studio itself (not an empty table)', () => {
        expect(TRACK_51_SURFACES.length).toBeGreaterThanOrEqual(1);
        expect(TRACK_51_SURFACES.map(surface => surface.surfaceId)).toContain('frontendStudio');
    });
});

describe('51.T51.2 — the render ledger', () => {
    it('counts renders per component and stamps first/last', () => {
        recordPaneRender('walk');
        recordPaneRender('walk');
        recordPaneRender('cosmic');
        const { renders } = paneRegistrySnapshot();
        const walk = renders.find(row => row.component === 'walk');
        expect(walk?.renders).toBe(2);
        expect(walk!.lastAtMs).toBeGreaterThanOrEqual(walk!.firstAtMs);
        expect(renders.map(row => row.component)).toEqual(['cosmic', 'walk']);
    });

    it('records the unknown-pane fallback too — an armless key IS the drift', () => {
        recordPaneRender('someSurfaceNoArmRendersYet');
        expect(
            paneRegistrySnapshot().renders.map(row => row.component)
        ).toContain('someSurfaceNoArmRendersYet');
    });

    it('bumps the revision and wakes subscribers on a microtask, never synchronously', async () => {
        let woken = 0;
        const dispose = subscribePaneRegistry(() => {
            woken += 1;
        });
        const before = paneRegistrySnapshot().revision;
        recordPaneRender('walk');
        expect(paneRegistrySnapshot().revision).toBe(before + 1);
        expect(woken, 'a synchronous wake would fire mid-render of another component').toBe(0);
        await Promise.resolve();
        expect(woken).toBe(1);
        dispose();
    });
});

describe('51.T51.2 — the published mount inventory', () => {
    it('holds what the shell published', () => {
        publishRegisteredPanes([mount('walk'), mount('cosmic', { face: 1, layout: 'daily-0-1' })]);
        expect(paneRegistrySnapshot().mounts.map(row => row.component)).toEqual(['walk', 'cosmic']);
    });

    it('no-ops an identical republish (the shell may call it on every render)', () => {
        publishRegisteredPanes([mount('walk')]);
        const revision = paneRegistrySnapshot().revision;
        publishRegisteredPanes([mount('walk')]);
        expect(paneRegistrySnapshot().revision).toBe(revision);
        publishRegisteredPanes([mount('walk'), mount('cosmic')]);
        expect(paneRegistrySnapshot().revision).toBe(revision + 1);
    });
});

describe('51.T51.2 — declarations are PROJECTED from the real registries', () => {
    it('every DEEP_PANE_SET mount appears as a deep-mount row from its own module', () => {
        const rows = paneDeclarations();
        for (const deep of DEEP_PANE_SET) {
            const row = rows.find(
                candidate => candidate.component === deep.surfaceId && candidate.kind === 'deep-mount'
            );
            expect(row, `no deep-mount row for ${deep.surfaceId}`).toBeDefined();
            expect(row!.declaredBy).toBe('ui/deepPaneSet.ts');
            expect(row!.label).toBe(deep.label);
        }
    });

    it('every OmniPanel fold appears with its own manifest label', () => {
        const rows = paneDeclarations();
        for (const tab of OMNIPANEL_TABS) {
            const row = rows.find(
                candidate => candidate.component === tab.component && candidate.kind === 'omni-fold'
            );
            expect(row, `no omni-fold row for ${tab.component}`).toBeDefined();
            expect(row!.label).toBe(tab.label);
            expect(row!.declaredBy).toBe('panes/omni/omnipanelRuntime.ts');
        }
    });

    it('the six subsystem pages and their strata are both declared', () => {
        const rows = paneDeclarations();
        expect(rows.filter(row => row.kind === 'subsystem-page')).toHaveLength(6);
        expect(rows.some(row => row.kind === 'subsystem-stratum')).toBe(true);
        expect(declarationsFor('m5SubsystemPage').map(row => row.kind)).toContain('subsystem-page');
    });
});

describe('51.T51.2 — the joined inventory', () => {
    it('classifies mounted-not-rendered, rendered-unmounted, and declared-only honestly', () => {
        publishRegisteredPanes([mount('walk'), mount('kleinTopology')]);
        recordPaneRender('walk');
        recordPaneRender('someTransientKey');
        const rows = paneInventory();
        const byComponent = new Map(rows.map(row => [row.component, row]));

        expect(byComponent.get('walk')!.renders).toBe(1);
        expect(byComponent.get('walk')!.mountedNeverRendered).toBe(false);
        expect(byComponent.get('kleinTopology')!.mountedNeverRendered).toBe(true);
        expect(byComponent.get('someTransientKey')!.renderedUnmounted).toBe(true);

        // A reserved seam is declared and nothing else — visible AS that.
        const backendStudio = byComponent.get('backendStudio');
        expect(backendStudio, 'the reserved 28.13 seam must be visible').toBeDefined();
        expect(backendStudio!.declaredOnly).toBe(true);
        expect(backendStudio!.renders).toBe(0);
    });

    it('is sorted and joins declarations onto their component', () => {
        publishRegisteredPanes([mount('walk')]);
        const rows = paneInventory();
        expect([...rows].map(row => row.component)).toEqual(
            [...rows].map(row => row.component).sort((a, b) => a.localeCompare(b))
        );
        expect(rows.find(row => row.component === 'walk')!.declarations.length).toBeGreaterThan(0);
    });
});

describe('51.T51.2 — composition slots and integrated plugins come from the real load law', () => {
    it('reports every registered geometric slot, filled or not', () => {
        const slots = compositionSlotOccupancy();
        expect(slots.map(slot => slot.slot)).toEqual([...GEOMETRIC_SLOTS]);
    });

    it('names the real owner of a filled slot and the registered blocker of a blocked one', () => {
        const slots = compositionSlotOccupancy();
        const byId = new Map(slots.map(slot => [slot.slot, slot]));
        expect(byId.get('surface')!.owner).toBe('m1-paramasiva-played-torus');
        expect(byId.get('surface')!.compositionId).toBe('cosmic-engine.integrated');
        expect(byId.get('texture')!.owner).toBe('m2-parashakti');
        expect(byId.get('center-composition')!.blockedBy).toBe('pending-psychoid-cymatic-solver');
    });

    it('runs BOTH integrated compositions through the real load and reports the outcome', () => {
        const plugins = integratedPluginRecords();
        expect(plugins.map(plugin => plugin.compositionId)).toEqual([
            'cosmic-engine.integrated',
            'jiva-siva.integrated'
        ]);
        for (const plugin of plugins) {
            expect(plugin.mounted, `${plugin.compositionId} must mount`).toBe(true);
            expect(plugin.contributors.length).toBeGreaterThan(0);
            expect(plugin.description.length).toBeGreaterThan(10);
        }
    });
});
