// @vitest-environment node
/**
 * Coordinate: M' (chrome-contract validator — rerun 28.T28.1)
 * Residency: Body/M/pratibimba-app/src
 * Actualises: the doc-code consistency gate for CHROME-CONTRACT.md — the
 *   carrier equivalent of the frozen epi-theia contract-preflight extension.
 *   The LIVE chrome registry is derived from the real substrate (the
 *   imported `OMNIPANEL_TABS` manifest + a TypeScript AST walk of
 *   `App.tsx`'s factory switch and default-layout `component:` keys — never
 *   a regex grep of prose), then held in lockstep with the contract's §2
 *   partition table and §6 readiness taxonomy, both directions.
 * Does NOT own: the partition assignments (the contract), the tab manifest
 *   (omnipanelRuntime.ts), the factory (App.tsx).
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { OMNIPANEL_TABS } from './panes/omni/omnipanelRuntime';

const CONTRACT_PATH = resolve(__dirname, '../CHROME-CONTRACT.md');
const APP_PATH = resolve(__dirname, 'App.tsx');

const PARTITIONS = ["M0' chrome", "M5' chrome", 'shared infrastructure'] as const;
const STATUSES = ['live', 'pending-fold', 'pending', 'legacy', 'shell'] as const;

/** The nine-id readiness taxonomy (07-t0 lineage) — LAW, verbatim. */
const READINESS_IDS = [
    'bridge_unavailable',
    'profile_missing_field',
    's2_graph_blocked',
    's3_subscription_blocked',
    's5_review_blocked',
    'authority_payload_missing',
    'privacy_blocked',
    'degraded_but_readable',
    'ready_public_current'
];

interface ContractRow {
    id: string;
    mount: string;
    partition: string;
    status: string;
    owner: string;
}

/** Slice a `## n.` section out of the contract body. */
function section(body: string, n: number): string {
    const lines = body.split('\n');
    const start = lines.findIndex(line => line.startsWith(`## ${n}.`));
    expect(start, `contract section ## ${n}. exists`).toBeGreaterThan(-1);
    let end = lines.length;
    for (let i = start + 1; i < lines.length; i++) {
        if (lines[i].startsWith('## ')) {
            end = i;
            break;
        }
    }
    return lines.slice(start, end).join('\n');
}

/** Parse the §2 surface table into typed rows (id cells are backticked). */
function parseSurfaceTable(body: string): ContractRow[] {
    return section(body, 2)
        .split('\n')
        .filter(line => /^\| `[^`]+` \|/.test(line))
        .map(line => {
            const cells = line.split('|').map(cell => cell.trim());
            // cells[0] is the empty string before the leading pipe
            return {
                id: cells[1].replace(/`/g, ''),
                mount: cells[2],
                partition: cells[3],
                status: cells[4],
                owner: cells[5]
            };
        });
}

/**
 * The live chrome registry, from the real shell source: every string-literal
 * `component:` value in App.tsx (default layouts + dynamic `vault.open` tab)
 * plus every case label of the `factory` switch. AST walk, not a grep.
 */
function liveAppRegistry(): { componentKeys: Set<string>; factoryCases: Set<string> } {
    const source = ts.createSourceFile(
        APP_PATH,
        readFileSync(APP_PATH, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX
    );
    const componentKeys = new Set<string>();
    const factoryCases = new Set<string>();

    const visit = (node: ts.Node, inFactory: boolean) => {
        let nowInFactory = inFactory;
        if (ts.isFunctionDeclaration(node) && node.name?.text === 'factory') {
            nowInFactory = true;
        }
        if (
            ts.isPropertyAssignment(node) &&
            ts.isIdentifier(node.name) &&
            node.name.text === 'component' &&
            ts.isStringLiteral(node.initializer)
        ) {
            componentKeys.add(node.initializer.text);
        }
        if (nowInFactory && ts.isCaseClause(node) && ts.isStringLiteral(node.expression)) {
            factoryCases.add(node.expression.text);
        }
        ts.forEachChild(node, child => visit(child, nowInFactory));
    };
    visit(source, false);
    return { componentKeys, factoryCases };
}

const contract = readFileSync(CONTRACT_PATH, 'utf8');
const rows = parseSurfaceTable(contract);
const byId = new Map(rows.map(row => [row.id, row]));
const { componentKeys, factoryCases } = liveAppRegistry();

describe('chrome contract §2 — partition table well-formed (28.T28.1)', () => {
    it('parses a non-trivial surface table', () => {
        expect(rows.length).toBeGreaterThanOrEqual(30);
        expect(new Set(rows.map(row => row.id)).size).toBe(rows.length);
    });

    it('every named chrome surface id carries a partition category (M0\'/M5\'/shared)', () => {
        for (const row of rows) {
            expect(PARTITIONS, `surface \`${row.id}\` partition "${row.partition}"`).toContain(
                row.partition
            );
            expect(STATUSES, `surface \`${row.id}\` status "${row.status}"`).toContain(row.status);
        }
    });

    it('all three partitions are inhabited (one chrome system, three partitions)', () => {
        for (const partition of PARTITIONS) {
            expect(
                rows.some(row => row.partition === partition),
                `partition "${partition}" has at least one surface`
            ).toBe(true);
        }
    });
});

describe('chrome contract ⇄ live registry lockstep', () => {
    it('the shell factory and layouts expose a real registry', () => {
        // sanity: the AST walk found the real shell, not an empty file
        expect(factoryCases.size).toBeGreaterThanOrEqual(20);
        expect(componentKeys.has('cosmic')).toBe(true);
        expect(componentKeys.has('editor')).toBe(true);
    });

    it('every live pane/surface id in the app chrome registry appears in the contract', () => {
        const registry = new Set([...componentKeys, ...factoryCases]);
        const missing = [...registry].filter(id => !byId.has(id));
        expect(missing, 'live surface ids missing a contract row').toEqual([]);
    });

    it('every OMNIPANEL_TABS component appears in the contract with an agreeing status', () => {
        for (const tab of OMNIPANEL_TABS) {
            const row = byId.get(tab.component);
            expect(row, `omni tab \`${tab.id}\` component \`${tab.component}\` has a row`).toBeDefined();
            // the manifest's landed flag and the contract's status must agree:
            // landed folds are `live`, unlanded folds are `pending-fold`.
            expect(
                row!.status,
                `omni tab \`${tab.id}\` (landed: ${tab.landed}) contract status`
            ).toBe(tab.landed ? 'live' : 'pending-fold');
            // and the omni tab must actually be mountable by the factory
            expect(
                factoryCases.has(tab.component),
                `factory renders omni component \`${tab.component}\``
            ).toBe(true);
        }
    });

    it('contract rows claiming a mounted surface (live/pending-fold/legacy tabs) exist in the factory', () => {
        const shellIds = new Set(rows.filter(row => row.status === 'shell').map(row => row.id));
        for (const row of rows) {
            if (row.status === 'live' || row.status === 'pending-fold' || row.status === 'legacy') {
                if (shellIds.has(row.id)) {
                    continue;
                }
                expect(
                    factoryCases.has(row.id),
                    `contract claims \`${row.id}\` is mounted (${row.status}) but the factory cannot render it`
                ).toBe(true);
            }
        }
    });

    it('doc-ahead `pending` surfaces are NOT yet in the factory (landing one must flip its row)', () => {
        for (const row of rows) {
            if (row.status === 'pending') {
                expect(
                    factoryCases.has(row.id) || componentKeys.has(row.id),
                    `\`${row.id}\` is marked pending but already lives in the shell — flip its contract row`
                ).toBe(false);
            }
        }
    });
});

describe('chrome contract §6 — readiness taxonomy', () => {
    it('declares exactly the nine-id readiness taxonomy, verbatim, in order', () => {
        const declared = section(contract, 6)
            .split('\n')
            .map(line => /^- `([a-z0-9_]+)`$/.exec(line))
            .filter((match): match is RegExpExecArray => match !== null)
            .map(match => match[1]);
        expect(declared).toEqual(READINESS_IDS);
    });
});
