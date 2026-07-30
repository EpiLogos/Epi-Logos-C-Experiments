// @vitest-environment node
/**
 * Coordinate: M' (command-catalog completeness gate — rerun 31.T31.2)
 * Residency: Body/M/pratibimba-app/src/commands
 * Actualises: the no-orphan / no-drift gate for COMMAND_CATALOG. The LIVE
 *   command set is derived from the REAL substrate — a TypeScript AST walk of
 *   every non-test source file for AppCommand-shaped object literals
 *   ({ id, title, run }), with `id`/`title` resolved through string literals
 *   and module-level string consts (mirrors chromeContract.test.ts's AST
 *   discipline; never a regex grep of prose), plus the one data-driven family
 *   (M0LayerRail over the frozen `M0_LAYER_ROUTES` table) resolved from that
 *   real data. The catalog is then held in lockstep with that live set BOTH
 *   directions: no orphan (every registered id is catalogued) and no drift
 *   (every catalogued id is really registered), plus title agreement and no
 *   duplicate ids. Dead register sites (uncalled factories) are proven dead so
 *   their commands are honestly excluded.
 * Does NOT own: the command bodies (their owners), the catalog rows (catalog.ts),
 *   or the M0 layer table (m0Layers.ts).
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { COMMAND_CATALOG } from './catalog';
import { M0_LAYER_ROUTES } from '../panes/m0Layers';
import { COORDINATE_TREE_FAMILY_ROOTS } from '../panes/coordinateTree/coordinateTreeModel';
import {
    coordinateTreeExpandCommandId,
    coordinateTreeExpandCommandTitle
} from '../panes/coordinateTree/coordinateTreeCommands';

const SRC_ROOT = resolve(__dirname, '..');

/** The three register sites whose id/title cannot be resolved statically: two
 *  live data-driven families (M0LayerRail, coordinateTreeCommands) and one dead
 *  factory (leftSidebarModes). Any OTHER file with a dynamic AppCommand literal
 *  fails the gate — a new dynamic register idiom must be reconciled here on
 *  purpose, never silently. */
const M0_RAIL_FILE = 'M0LayerRail.tsx';
const LEFT_SIDEBAR_FILE = 'leftSidebarModes.ts';
const COORDINATE_TREE_FILE = 'coordinateTreeCommands.ts';

interface LiveCommand {
    id: string;
    title: string;
}

/** Recursively collect every non-test .ts/.tsx under src. */
function sourceFiles(dir: string): string[] {
    const out: string[] = [];
    for (const entry of readdirSync(dir)) {
        if (entry === 'node_modules' || entry === 'dist') {
            continue;
        }
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            out.push(...sourceFiles(full));
            continue;
        }
        if (!/\.tsx?$/.test(entry) || /\.test\.tsx?$/.test(entry) || /\.d\.ts$/.test(entry)) {
            continue;
        }
        out.push(full);
    }
    return out;
}

function parse(file: string): ts.SourceFile {
    return ts.createSourceFile(
        file,
        readFileSync(file, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );
}

/** Module-level `const NAME = 'literal'` table across all sources. A name that
 *  maps to conflicting values is dropped (treated as unresolvable). */
function buildConstTable(files: string[]): Map<string, string | null> {
    const table = new Map<string, string | null>();
    for (const file of files) {
        const visit = (node: ts.Node): void => {
            if (
                ts.isVariableDeclaration(node) &&
                ts.isIdentifier(node.name) &&
                node.initializer &&
                (ts.isStringLiteral(node.initializer) ||
                    ts.isNoSubstitutionTemplateLiteral(node.initializer))
            ) {
                const name = node.name.text;
                const value = node.initializer.text;
                if (table.has(name) && table.get(name) !== value) {
                    table.set(name, null);
                } else {
                    table.set(name, value);
                }
            }
            ts.forEachChild(node, visit);
        };
        visit(parse(file));
    }
    return table;
}

/** Resolve a property initializer to a concrete string, or null if dynamic. */
function resolveString(
    init: ts.Expression | undefined,
    consts: Map<string, string | null>
): string | null {
    if (!init) {
        return null;
    }
    if (ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init)) {
        return init.text;
    }
    if (ts.isIdentifier(init)) {
        return consts.get(init.text) ?? null;
    }
    return null;
}

function propNamed(obj: ts.ObjectLiteralExpression, name: string): ts.ObjectLiteralElementLike | undefined {
    return obj.properties.find(prop => {
        const key = prop.name;
        if (!key) {
            return false;
        }
        if (ts.isIdentifier(key) || ts.isStringLiteral(key)) {
            return key.text === name;
        }
        return false;
    });
}

interface Scan {
    staticCommands: LiveCommand[];
    dynamicFiles: Set<string>;
    calledFunctions: Set<string>;
}

/** Walk all sources: collect AppCommand-shaped literals and call-expression
 *  callee names (for the dead-code proof). */
function scanSources(files: string[], consts: Map<string, string | null>): Scan {
    const staticCommands: LiveCommand[] = [];
    const dynamicFiles = new Set<string>();
    const calledFunctions = new Set<string>();

    for (const file of files) {
        const source = parse(file);
        const visit = (node: ts.Node): void => {
            if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
                calledFunctions.add(node.expression.text);
            }
            if (ts.isObjectLiteralExpression(node)) {
                const idProp = propNamed(node, 'id');
                const titleProp = propNamed(node, 'title');
                const runProp = propNamed(node, 'run');
                // The AppCommand shape IS { id, title, run } — registry.ts:21.
                if (idProp && titleProp && runProp) {
                    const id =
                        ts.isPropertyAssignment(idProp) ? resolveString(idProp.initializer, consts) : null;
                    const title =
                        ts.isPropertyAssignment(titleProp)
                            ? resolveString(titleProp.initializer, consts)
                            : null;
                    if (id !== null && title !== null) {
                        staticCommands.push({ id, title });
                    } else {
                        dynamicFiles.add(basename(file));
                    }
                }
            }
            ts.forEachChild(node, visit);
        };
        visit(source);
    }
    return { staticCommands, dynamicFiles, calledFunctions };
}

/** The live data-driven M0 layer commands, reconstructed from the SAME real
 *  frozen data table M0LayerRail iterates (m0Layers.ts) — not a duplicated
 *  hardcode. Mirrors M0LayerRail.tsx: local routes only, title template. */
function m0LayerCommands(): LiveCommand[] {
    return M0_LAYER_ROUTES.filter(route => route.view.placement === 'local').map(route => ({
        id: route.commandId,
        title: `M0': ${route.view.label} layer`
    }));
}

/** The live per-family bulk-expand commands (28.T28.6 (d)), reconstructed from
 *  the SAME frozen family table and title builder `coordinateTreeCommands.ts`
 *  iterates — so the six catalog rows are checked against the source of truth,
 *  never against a second hardcode. */
function coordinateTreeCommands(): LiveCommand[] {
    return COORDINATE_TREE_FAMILY_ROOTS.map(family => ({
        id: coordinateTreeExpandCommandId(family),
        title: coordinateTreeExpandCommandTitle(family)
    }));
}

const files = sourceFiles(SRC_ROOT);
const consts = buildConstTable(files);
const scan = scanSources(files, consts);
const m0Live = m0LayerCommands();
const coordinateTreeLive = coordinateTreeCommands();
const liveCommands: LiveCommand[] = [...scan.staticCommands, ...m0Live, ...coordinateTreeLive];

const liveById = new Map(liveCommands.map(command => [command.id, command]));
const catalogById = new Map(COMMAND_CATALOG.map(command => [command.id, command]));

describe('command catalog — AST walk finds the real registry (31.T31.2)', () => {
    it('resolves a non-trivial static command set from real source (not an empty walk)', () => {
        expect(scan.staticCommands.length).toBeGreaterThanOrEqual(15);
        const ids = new Set(scan.staticCommands.map(command => command.id));
        // anchors that MUST exist — one shell, one const-resolved, one engine
        expect(ids.has('face.toggle')).toBe(true);
        expect(ids.has('engine.pauseToggle')).toBe(true);
        expect(ids.has('pratibimba.intent.dispatch')).toBe(true); // const-id resolution works
    });

    it('resolves exactly the four data-driven M0 layer commands from M0_LAYER_ROUTES', () => {
        expect(m0Live.map(command => command.id).sort()).toEqual([
            'm0.layer.lang',
            'm0.layer.ql',
            'm0.layer.rel',
            'm0.layer.time'
        ]);
    });

    it('resolves exactly the six data-driven coordinate-tree commands from the family table', () => {
        expect(coordinateTreeLive.map(command => command.id)).toEqual([
            'pratibimba.coordinate-tree.expand-family.P',
            'pratibimba.coordinate-tree.expand-family.S',
            'pratibimba.coordinate-tree.expand-family.T',
            'pratibimba.coordinate-tree.expand-family.M',
            'pratibimba.coordinate-tree.expand-family.L',
            'pratibimba.coordinate-tree.expand-family.C'
        ]);
    });

    it('the coordinate-tree family is still backed by a real dynamic register site', () => {
        // Same tether as the M0 rail below: if the factory stops registering
        // dynamically, coordinateTreeCommands() would silently invent rows.
        expect(scan.dynamicFiles.has(COORDINATE_TREE_FILE)).toBe(true);
        expect(
            scan.calledFunctions.has('registerCoordinateTreeCommands'),
            'registerCoordinateTreeCommands must have a live caller, or its six catalogued rows are fiction'
        ).toBe(true);
    });

    it('every dynamic register site is a KNOWN one (no unreconciled register idiom)', () => {
        const unexpected = [...scan.dynamicFiles].filter(
            file =>
                file !== M0_RAIL_FILE && file !== LEFT_SIDEBAR_FILE && file !== COORDINATE_TREE_FILE
        );
        expect(
            unexpected,
            'a new dynamic AppCommand register site appeared — reconcile it in catalog.test.ts before the gate can trust the catalog'
        ).toEqual([]);
    });

    it('the M0 layer family is still backed by a real dynamic register site', () => {
        // If M0LayerRail stops registering dynamically, m0LayerCommands() would
        // silently invent rows — this tether fails first.
        expect(scan.dynamicFiles.has(M0_RAIL_FILE)).toBe(true);
    });

    it('leftSidebar mode commands are excluded because their factory is dead code', () => {
        expect(scan.dynamicFiles.has(LEFT_SIDEBAR_FILE)).toBe(true);
        expect(
            scan.calledFunctions.has('registerLeftSidebarModeCommands'),
            'registerLeftSidebarModeCommands has a live caller — its commands are now registered and MUST be catalogued'
        ).toBe(false);
    });
});

describe('command catalog ⇄ live registry lockstep (both directions)', () => {
    it('has no duplicate catalog ids', () => {
        expect(catalogById.size).toBe(COMMAND_CATALOG.length);
    });

    it('the derived live set itself has no duplicate ids', () => {
        expect(liveById.size).toBe(liveCommands.length);
    });

    it('NO ORPHAN — every registered command id is catalogued', () => {
        const orphans = liveCommands.map(command => command.id).filter(id => !catalogById.has(id));
        expect(orphans, 'registered commands missing from COMMAND_CATALOG').toEqual([]);
    });

    it('NO DRIFT — every catalogued id is really registered', () => {
        const fabricated = COMMAND_CATALOG.map(command => command.id).filter(id => !liveById.has(id));
        expect(fabricated, 'catalog rows that no register site produces').toEqual([]);
    });

    it('titles agree between catalog and live registry', () => {
        const mismatches: string[] = [];
        for (const command of COMMAND_CATALOG) {
            const live = liveById.get(command.id);
            if (live && live.title !== command.title) {
                mismatches.push(`${command.id}: catalog "${command.title}" ≠ live "${live.title}"`);
            }
        }
        expect(mismatches).toEqual([]);
    });
});
