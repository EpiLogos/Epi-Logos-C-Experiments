/**
 * Coordinate: M' M5-3' (subsystem-workspace ownership gate — rerun 52.T5)
 * Residency: Body/M/pratibimba-app/src/ui/subsystemWorkspaceOwnership.test.ts
 * Position (#n): verification of the 4+2 disposition ledger.
 * Actualises: 52.T5's total-accounting acceptance — "an unaccounted tab is a
 *   FAIL, not an omission." The inventory is DERIVED from the real registries
 *   (every string-literal `component:` in App.tsx via AST + every
 *   `DEEP_PANE_SET` surface id), never hand-restated, so a new scattered tab
 *   fails this suite until the ledger disposes it. The gathered half is held
 *   against `SUBSYSTEM_PAGES` in BOTH directions: every gathered row names a
 *   real declared stratum, and every declared stratum surface has exactly one
 *   gathered row.
 * Does NOT own: the ledger's verdicts (`ui/subsystemWorkspaceOwnership.ts`),
 *   the strata declarations, or pane behavior.
 * Contract: rerun tranche [[52.T5]].
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import ts from 'typescript';
import { DEEP_PANE_SET } from './deepPaneSet';
import { OMNIPANEL_TABS } from '../panes/omni/omnipanelRuntime';
import { SUBSYSTEM_PAGES } from './subsystemPages';
import {
    SUBSYSTEM_WORKSPACE_OWNERSHIP,
    gatheredDispositions,
    workspaceDispositionFor
} from './subsystemWorkspaceOwnership';

const APP_PATH = join(__dirname, '..', 'App.tsx');

/** Every string-literal `component:` in App.tsx — the daily models' tabs plus
 *  the dynamic `vault.open` editor tab. AST walk, not a grep (the
 *  `chromeContract.test.ts` idiom). Omni tabs use a property access
 *  (`component: tab.component`) and are deliberately not captured: the `/`
 *  membrane has its own manifest and is not a scattered depth tab. */
function appComponentLiterals(): Set<string> {
    const source = ts.createSourceFile(
        APP_PATH,
        readFileSync(APP_PATH, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX
    );
    const componentKeys = new Set<string>();
    const visit = (node: ts.Node) => {
        if (
            ts.isPropertyAssignment(node) &&
            ts.isIdentifier(node.name) &&
            node.name.text === 'component' &&
            ts.isStringLiteral(node.initializer)
        ) {
            componentKeys.add(node.initializer.text);
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
    return componentKeys;
}

function scatteredInventory(): Set<string> {
    const inventory = appComponentLiterals();
    for (const mount of DEEP_PANE_SET) {
        inventory.add(mount.surfaceId);
    }
    // The six pages are the DESTINATION, not raw material; they mount by node
    // id through `subsystem.open.*`, never as a component literal, so they
    // cannot appear here — asserted rather than assumed. The omni manifest is
    // the one default-mount route this inventory deliberately skips
    // (`component: tab.component` is a property access), so DR-SUBSYS-1's
    // never-default-mounted law is asserted against it DIRECTLY:
    for (const page of SUBSYSTEM_PAGES) {
        expect(inventory.has(page.surfaceId)).toBe(false);
        expect(
            OMNIPANEL_TABS.some(tab => tab.component === page.surfaceId),
            `${page.surfaceId} must never be an OmniPanel fold — a page opens by gesture only`
        ).toBe(false);
    }
    return inventory;
}

describe('subsystem workspace ownership (52.T5)', () => {
    it('disposes every scattered depth tab exactly once — an unaccounted tab FAILS', () => {
        const inventory = scatteredInventory();
        const ledgerIds = SUBSYSTEM_WORKSPACE_OWNERSHIP.map(row => row.surfaceId);
        expect(new Set(ledgerIds).size).toBe(ledgerIds.length);
        expect([...inventory].sort()).toEqual([...ledgerIds].sort());
    });

    it('every row carries a real verdict shape and non-trivial evidence', () => {
        for (const row of SUBSYSTEM_WORKSPACE_OWNERSHIP) {
            expect(row.evidence.length, row.surfaceId).toBeGreaterThan(40);
            if (row.disposition === 'gathered') {
                expect(row.workspace, row.surfaceId).not.toBeNull();
                expect(row.subsystem, row.surfaceId).toBe(row.workspace?.page);
            } else {
                expect(row.workspace, row.surfaceId).toBeNull();
            }
        }
    });

    it('gathered rows and declared strata agree in BOTH directions', () => {
        // ledger → strata: every gathered row names a declared stratum.
        for (const row of SUBSYSTEM_WORKSPACE_OWNERSHIP) {
            if (row.disposition !== 'gathered' || !row.workspace) {
                continue;
            }
            const page = SUBSYSTEM_PAGES.find(p => p.id === row.workspace?.page);
            expect(page, row.surfaceId).toBeDefined();
            const stratum = page?.strata.find(s => s.surfaceId === row.surfaceId);
            expect(stratum, `${row.surfaceId} must be a declared stratum of ${row.workspace.page}`).toBeDefined();
            expect(stratum?.stratum, row.surfaceId).toBe(row.workspace.stratum);
        }
        // strata → ledger: every declared stratum surface has its gathered row.
        for (const page of SUBSYSTEM_PAGES) {
            for (const stratum of page.strata) {
                if (stratum.surfaceId === null) {
                    continue;
                }
                const row = workspaceDispositionFor(stratum.surfaceId);
                expect(row?.disposition, `${page.id} stratum ${stratum.stratum}`).toBe('gathered');
                expect(row?.workspace?.page, stratum.surfaceId).toBe(page.id);
                expect(row?.workspace?.stratum, stratum.surfaceId).toBe(stratum.stratum);
            }
        }
    });

    it('page strata are well-formed: unique positions, Ground first and surface-less', () => {
        for (const page of SUBSYSTEM_PAGES) {
            const positions = page.strata.map(s => s.stratum);
            expect(new Set(positions).size, page.id).toBe(positions.length);
            expect([...positions].sort((a, b) => a - b), page.id).toEqual(positions);
            expect(page.strata[0]?.stratum, page.id).toBe(0);
            expect(page.strata[0]?.surfaceId, page.id).toBeNull();
            for (const stratum of page.strata.slice(1)) {
                expect(stratum.surfaceId, `${page.id} stratum ${stratum.stratum}`).not.toBeNull();
            }
        }
    });

    it('nothing moves (DR-SUBSYS-2): gathering is mirroring, verdict enum is closed', () => {
        const verdicts = new Set(SUBSYSTEM_WORKSPACE_OWNERSHIP.map(row => row.disposition));
        for (const verdict of verdicts) {
            expect([
                'gathered',
                'stays-shell-preview',
                'stays-daily-lived',
                'stays-deep-overview',
                'stays-chrome',
                'stays-config'
            ]).toContain(verdict);
        }
    });

    it('gatheredDispositions returns each page in stratum order', () => {
        for (const page of SUBSYSTEM_PAGES) {
            const rows = gatheredDispositions(page.id);
            const strata = rows.map(row => row.workspace?.stratum ?? -1);
            expect([...strata].sort((a, b) => a - b), page.id).toEqual(strata);
            const declared = page.strata.filter(s => s.surfaceId !== null).length;
            expect(rows.length, page.id).toBe(declared);
        }
    });
});
