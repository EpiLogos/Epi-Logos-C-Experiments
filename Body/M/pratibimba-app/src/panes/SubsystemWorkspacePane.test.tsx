/**
 * Coordinate: M' (subsystem-page workspace tests — rerun 52.T5)
 * Actualises: a page opens on the Ground stratum (identity + strata index +
 *   honest named-unbuilt), the strata rail lists every declared stratum, and
 *   the render table covers EXACTLY the ledger's gathered rows — a gathered
 *   surface with no renderer (or a renderer with no gathered row) fails.
 *   Depth-surface mounting itself is the e2e's half (real substrate); jsdom
 *   proves the workspace shell, never the instruments.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ts from 'typescript';
import { SUBSYSTEM_PAGES } from '../ui/subsystemPages';
import { SUBSYSTEM_WORKSPACE_OWNERSHIP } from '../ui/subsystemWorkspaceOwnership';
import { GATHERED_RENDERERS, SubsystemWorkspacePane } from './SubsystemWorkspacePane';

afterEach(cleanup);

/**
 * MIRROR FIDELITY (DR-SUBSYS-2): the component each renderer actually mounts,
 * read off the real source via AST. Key-set parity alone cannot see a
 * wired-wrong renderer (`oracle` rendering `<DayCalendarPane/>` passed every
 * gate when injected), so the expected component per surface id is pinned
 * here — the dailySurfaceOwnership discipline: the test carries its own
 * inventory.
 */
const EXPECTED_RENDERER_COMPONENTS: Readonly<Record<string, string>> = Object.freeze({
    bimbaGraph: 'GraphExplorerPane',
    mocBases: 'MocBaseReflectionPane',
    m1SurfaceComposed: 'M1SurfaceDispatchPane',
    spandaNavigator: 'SpandaNavigatorPane',
    walk: 'WalkPane',
    kleinTopology: 'KleinTopologyPane',
    m1PlayedTorus: 'PlayedTorusPane',
    m2Correspondence: 'M2CorrespondencePane',
    m3PentadicInspector: 'PentadicInspectorPane',
    m3Inspectors: 'M3InspectorsPane',
    journalTimeline: 'JournalTimelinePane',
    dayCalendar: 'DayCalendarPane',
    oracle: 'OraclePane',
    pratibimbaCoordinate: 'PratibimbaCoordinatePane',
    canonUpdateLedger: 'CanonUpdateLedgerPane',
    m5Ebm: 'M5EbmObservatoryPane',
    autoresearch: 'AutoresearchPane',
    agenticControlRoom: 'AgenticControlRoomPane',
    piAxiomTranslation: 'PiAxiomTranslationInspector'
});

/** surfaceId → the FIRST JSX element name inside its GATHERED_RENDERERS arrow
 *  body, parsed from the real pane source. */
function renderedComponentsBySurface(): Map<string, string> {
    const source = ts.createSourceFile(
        join(__dirname, 'SubsystemWorkspacePane.tsx'),
        readFileSync(join(__dirname, 'SubsystemWorkspacePane.tsx'), 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX
    );
    const out = new Map<string, string>();
    const firstJsxName = (node: ts.Node): string | null => {
        if (ts.isJsxSelfClosingElement(node)) {
            return node.tagName.getText();
        }
        if (ts.isJsxElement(node)) {
            return node.openingElement.tagName.getText();
        }
        let found: string | null = null;
        node.forEachChild(child => {
            if (found === null) {
                found = firstJsxName(child);
            }
        });
        return found;
    };
    const visit = (node: ts.Node, inTable: boolean) => {
        let nowInTable = inTable;
        if (
            ts.isVariableDeclaration(node) &&
            ts.isIdentifier(node.name) &&
            node.name.text === 'GATHERED_RENDERERS'
        ) {
            nowInTable = true;
        }
        if (
            nowInTable &&
            ts.isPropertyAssignment(node) &&
            ts.isIdentifier(node.name) &&
            (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))
        ) {
            const name = firstJsxName(node.initializer);
            if (name) {
                out.set(node.name.text, name);
            }
        }
        ts.forEachChild(node, child => visit(child, nowInTable));
    };
    visit(source, false);
    return out;
}

describe('SubsystemWorkspacePane (52.T5)', () => {
    it('render table covers exactly the gathered ledger rows, both directions', () => {
        const gathered = SUBSYSTEM_WORKSPACE_OWNERSHIP.filter(
            row => row.disposition === 'gathered'
        ).map(row => row.surfaceId);
        expect(Object.keys(GATHERED_RENDERERS).sort()).toEqual([...gathered].sort());
    });

    it('every renderer mounts the MIRRORED component, not a lookalike (AST off the real source)', () => {
        const rendered = renderedComponentsBySurface();
        expect([...rendered.keys()].sort()).toEqual(Object.keys(EXPECTED_RENDERER_COMPONENTS).sort());
        for (const [surfaceId, expected] of Object.entries(EXPECTED_RENDERER_COMPONENTS)) {
            expect(rendered.get(surfaceId), `renderer for ${surfaceId}`).toBe(expected);
        }
    });

    it('every page opens on Ground with identity, strata rail, and honest unbuilt list', () => {
        for (const page of SUBSYSTEM_PAGES) {
            render(<SubsystemWorkspacePane subsystem={page.id} />);
            const root = screen.getByTestId(`subsystem-page-${page.id}`);
            expect(root.getAttribute('data-subsystem-stratum')).toBe('0');
            expect(screen.getByTestId(`subsystem-ground-${page.id}`).textContent).toContain(
                page.title
            );
            for (const stratum of page.strata) {
                expect(
                    screen.getByTestId(`subsystem-stratum-${page.id}-${stratum.stratum}`)
                ).toBeTruthy();
            }
            if (page.namedUnbuilt.length > 0) {
                expect(screen.getByTestId(`subsystem-unbuilt-${page.id}`)).toBeTruthy();
            }
            cleanup();
        }
    });

    it('the Ground panel is NOT the shell preview: it lists the gathered strata by id', () => {
        render(<SubsystemWorkspacePane subsystem="m4" />);
        const ground = screen.getByTestId('subsystem-ground-m4');
        for (const surfaceId of ['journalTimeline', 'dayCalendar', 'oracle', 'pratibimbaCoordinate']) {
            expect(ground.textContent).toContain(surfaceId);
        }
    });
});
