// @vitest-environment node
/**
 * Coordinate: M' M0' chrome (the coordinate tree's pure law — 28.T28.6)
 * Residency: Body/M/pratibimba-app/src/panes/coordinateTree
 * Actualises: the half of tranche 28.6 that is LAW rather than markup, and the
 *   half a jsdom render cannot prove. Five claims:
 *
 *     (a) FAMILY COLOURING is a classification, not a palette lookup — every
 *         one of the six families yields `coordinate-family-{letter}` at every
 *         archetype grade, the namespace class is read from S1 residency and
 *         from nothing else, and a coordinate outside the six families is
 *         `unfamilied` rather than being coerced into one. The six letters are
 *         held against the real 36-token matrix so a class can never name a
 *         family the token source cannot paint.
 *     (b) the two containment relation types are held against the REAL S2
 *         substrate, each at the tier that actually carries it: `CONTAINS` is an
 *         enumerated `GraphRelationshipTypeSpec`; `HAS_INTERNAL_COMPONENT` is
 *         NOT in that table and must not be expected there — it is admitted by
 *         the deep-dataset CLASS convention. An earlier draft of the module
 *         header claimed both were enumerated; this test is why that is now
 *         corrected rather than merely believed.
 *     (c) the forest is the GRAPH's — rows missing an end, self-edges, and
 *         relation types outside the declared two are dropped rather than
 *         guessed at, duplicates collapse, and a graph-declared cycle
 *         terminates at the repeat instead of recursing.
 *     (d) CRUD-vs-GOVERNANCE (DR-M0-1): the authoring affordance produces an
 *         intent that the REAL `parseCrossLayoutIntent` accepts and the REAL
 *         target ledger resolves to `canon-studio` — and, the discipline half,
 *         that no file in this pane's directory can reach the wire except
 *         through the ONE read seam, with `s2.graph.query` as its only method.
 *         A write path cannot be "absent by inspection"; it is absent because
 *         this gate fails when one appears.
 *     (e) the OPENING-TAB LAW, statically: `useCoordinateStore` is never written
 *         from inside a `useEffect` in this pane. The behavioural proof is the
 *         sibling render suite; this one stops the regression at the shape.
 * Does NOT own: the render (`CoordinateTreePane.test.tsx`), the seam register
 *   (`coordinateTreeSeams.test.ts`), the deep mount (`ui/deepPaneSet.test.ts`),
 *   or the through-the-switch proof (`tests/e2e/coordinate-tree-deep.spec.ts`).
 * Contract: [[CHROME-CONTRACT]] §2 + §5 + §7 · [[DR-M0-1]] · [[DR-WC-DL-1]] ·
 *   rerun tranche [[28.T28.6]].
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import ts from 'typescript';

import {
    intentTarget,
    parseCrossLayoutIntent
} from '../../commands/crossLayoutIntent';
import { FAMILY_PALETTE, coordinateFamilyGrade } from '../../ui/tokens';
import {
    CANON_STUDIO_CONTRIBUTION_ID,
    COORDINATE_TREE_FAMILY_ROOTS,
    STRUCTURAL_CHILD_RELATIONS,
    authoringIntentFor,
    buildCoordinateForest,
    coordinateRowClasses,
    coordinateTreeRows,
    descendantsOf,
    familyOf,
    familyRowClass,
    namespaceRowClass,
    privacyRowClass,
    rowLabel,
    useCoordinateTreeStore
} from './coordinateTreeModel';
import { COORDINATE_TREE_LIVE_METHODS } from './coordinateTreeSeams';

const PANE_DIR = __dirname;
const REPO_ROOT = resolve(__dirname, '../../../../../..');
const GRAPH_SCHEMA_SRC = join(REPO_ROOT, 'Body/S/S2/graph-schema/src');

/** Every non-test source file this pane is made of. */
function paneSources(): { file: string; text: string }[] {
    return readdirSync(PANE_DIR)
        .filter(name => /\.tsx?$/.test(name) && !name.includes('.test.'))
        .sort()
        .map(name => ({ file: name, text: readFileSync(join(PANE_DIR, name), 'utf8') }));
}

function sourceFile(file: string, text: string): ts.SourceFile {
    return ts.createSourceFile(file, text, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX);
}

function walk(node: ts.Node, visit: (node: ts.Node) => void): void {
    visit(node);
    node.forEachChild(child => walk(child, visit));
}

// ── (a) family colouring ────────────────────────────────────────────────────

describe('28.T28.6 (a) — per-family colouring is a classification, not a guess', () => {
    it('every family × every archetype grade yields that family class', () => {
        for (const family of COORDINATE_TREE_FAMILY_ROOTS) {
            // the bare family root is a real :Bimba coordinate, not `[PSTMLC][0-5]`
            expect(familyRowClass(family)).toBe(`coordinate-family-${family}`);
            for (let grade = 0; grade <= 5; grade += 1) {
                expect(familyRowClass(`${family}${grade}`)).toBe(`coordinate-family-${family}`);
                // …and a deep coordinate keeps its family, at any depth
                expect(familyRowClass(`${family}${grade}-4-2-1`)).toBe(
                    `coordinate-family-${family}`
                );
            }
        }
    });

    it('the six classes name six families the 36-token matrix can really paint', () => {
        // The class is worthless if `ui/tokens.ts` has no hue behind it — that
        // would be a coloured row with a transparent tint and no way to tell.
        for (const family of COORDINATE_TREE_FAMILY_ROOTS) {
            expect(FAMILY_PALETTE[family]).toHaveLength(6);
            for (let grade = 0; grade <= 5; grade += 1) {
                const resolved = coordinateFamilyGrade(`${family}${grade}`);
                expect(resolved?.family).toBe(family);
                expect(resolved?.hue.light).toMatch(/^#[0-9a-f]{6}$/);
                expect(resolved?.hue.dark).toMatch(/^#[0-9a-f]{6}$/);
            }
        }
        expect(Object.keys(FAMILY_PALETTE).sort()).toEqual(
            [...COORDINATE_TREE_FAMILY_ROOTS].sort()
        );
    });

    it('a coordinate outside the six families is unfamilied, never coerced', () => {
        // The raw archetypes and the reflective six are NOT family coordinates
        // (CLAUDE.md §III.A / §III.C) — colouring them `C` because of a letter
        // would be the carrier inventing an ontology.
        for (const outsider of ['#4', 'cpf', 'ct', 'cfp', 'Empty/Present', '']) {
            expect(familyRowClass(outsider)).toBe('coordinate-family-unfamilied');
            expect(familyOf(outsider)).toBeNull();
        }
    });

    it('the namespace class is read from S1 residency and from nothing else', () => {
        expect(namespaceRowClass('Idea/Bimba/World/Types/M/M4.md')).toBe(
            'coordinate-namespace-bimba'
        );
        expect(namespaceRowClass('Idea/Empty/Present/07-30-2026/daily-note.md')).toBe(
            'coordinate-namespace-empty'
        );
        expect(namespaceRowClass('Idea/Pratibimba/Self/PASU.md')).toBe(
            'coordinate-namespace-pratibimba'
        );
        expect(namespaceRowClass('/Pratibimba/Self/PASU.md')).toBe(
            'coordinate-namespace-pratibimba'
        );
        // No vault path is NOT "it lives in Bimba" — it is no answer at all,
        // which is the honest state of most coordinates today.
        expect(namespaceRowClass(null)).toBeNull();
        expect(namespaceRowClass(undefined)).toBeNull();
        expect(namespaceRowClass('Body/M/pratibimba-app/src/App.tsx')).toBeNull();
    });

    it('the privacy class is the receipt class, and an absent one says `unset`', () => {
        expect(privacyRowClass('public')).toBe('coordinate-privacy-public');
        expect(privacyRowClass('private')).toBe('coordinate-privacy-private');
        expect(privacyRowClass(null)).toBe('coordinate-privacy-unset');
        expect(privacyRowClass('  ')).toBe('coordinate-privacy-unset');
    });

    it('a row composes exactly one family class, one privacy class, and highlight only when active', () => {
        const inactive = coordinateRowClasses({
            coordinate: 'M4-3',
            vaultPath: 'Idea/Bimba/World/Types/M/M4.md',
            privacyClass: 'public'
        });
        expect(inactive).toEqual([
            'coordinate-tree-node',
            'coordinate-family-M',
            'coordinate-namespace-bimba',
            'coordinate-privacy-public'
        ]);
        expect(inactive).not.toContain('active-coordinate');

        const active = coordinateRowClasses({
            coordinate: 'M4-3',
            privacyClass: 'public',
            active: true
        });
        expect(active).toContain('active-coordinate');
        // exactly one family class and exactly one privacy class, always
        expect(active.filter(cls => cls.startsWith('coordinate-family-'))).toHaveLength(1);
        expect(active.filter(cls => cls.startsWith('coordinate-privacy-'))).toHaveLength(1);
        // …and no namespace class was invented for a node that carries no path
        expect(active.filter(cls => cls.startsWith('coordinate-namespace-'))).toHaveLength(0);
    });
});

// ── (b) the containment relations, against the real substrate ───────────────

describe('28.T28.6 — the containment relation list is held against real S2', () => {
    const relRs = readFileSync(join(GRAPH_SCHEMA_SRC, 'relationships/rel.rs'), 'utf8');
    const deepRs = readFileSync(join(GRAPH_SCHEMA_SRC, 'relationships/deep_bimba.rs'), 'utf8');

    /** Is this an ENUMERATED `GraphRelationshipTypeSpec`? */
    const enumerated = (relType: string): boolean =>
        new RegExp(`rel_type:\\s*"${relType}"`).test(relRs);

    it('`CONTAINS` is an enumerated coordinate-family relationship spec', () => {
        expect(enumerated('CONTAINS')).toBe(true);
        expect(relRs).toContain('rel_type: "CONTAINS",\n        coordinate_home: CoordinateHome::C0,\n        source_family: "coordinate",');
    });

    it('`HAS_INTERNAL_COMPONENT` is a deep-dataset CLASS relation, not an enumerated spec', () => {
        // This is the correction. It is emitted by the `*-deep/relations.json`
        // importers and admitted by convention, so expecting it in the spec
        // table would be a red test against a healthy substrate.
        expect(enumerated('HAS_INTERNAL_COMPONENT')).toBe(false);
        expect(deepRs).toContain('pub fn is_deep_dataset_relation_type');
        // The convention deep_bimba.rs declares: uppercase ASCII + digits +
        // underscores, starts uppercase, no consecutive underscores.
        expect(/^[A-Z][A-Z0-9_]*$/.test('HAS_INTERNAL_COMPONENT')).toBe(true);
        expect('HAS_INTERNAL_COMPONENT').not.toContain('__');
    });

    it('every declared containment type has one of those two proofs, and no third slipped in', () => {
        expect([...STRUCTURAL_CHILD_RELATIONS]).toEqual(['CONTAINS', 'HAS_INTERNAL_COMPONENT']);
        for (const relType of STRUCTURAL_CHILD_RELATIONS) {
            const deepClass = /^[A-Z][A-Z0-9_]*$/.test(relType) && !relType.includes('__');
            expect(
                enumerated(relType) || deepClass,
                `${relType} is neither an enumerated spec nor a legal deep-dataset class`
            ).toBe(true);
        }
    });
});

// ── (c) the forest is the graph's ───────────────────────────────────────────

const ROOT_ROWS = [
    { coordinate: 'M', name: 'Subsystem Family', vaultPath: 'Idea/Bimba/World/Types/M/M.md' },
    { coordinate: 'C', name: 'Category Family', vaultPath: null }
];

const EDGE_ROWS = [
    { source: 'M', target: 'M4', type: 'CONTAINS', targetName: 'Nara', targetVaultPath: 'Idea/Bimba/World/Types/M/M4.md' },
    { source: 'M', target: 'M0', type: 'CONTAINS', targetName: 'Anuttara', targetVaultPath: null },
    { source: 'M4', target: 'M4-3', type: 'HAS_INTERNAL_COMPONENT', targetName: 'Nara Process', targetVaultPath: 'Idea/Pratibimba/Self/PASU.md' }
];

describe('28.T28.6 — the hierarchy is the graph’s, not the string’s', () => {
    it('builds only the containment the rows declared', () => {
        const forest = buildCoordinateForest(ROOT_ROWS, EDGE_ROWS);
        expect([...(forest.childrenOf.get('M') ?? [])]).toEqual(['M0', 'M4']);
        expect([...(forest.childrenOf.get('M4') ?? [])]).toEqual(['M4-3']);
        // `C` was read as a root and declared no children — an honest empty
        // family, never a fabricated C0…C5.
        expect(forest.childrenOf.get('C')).toBeUndefined();
        expect(forest.facts.get('M4-3')?.vaultPath).toBe('Idea/Pratibimba/Self/PASU.md');
        expect(forest.facts.get('M0')?.vaultPath).toBeNull();
    });

    it('drops what it cannot trust rather than guessing', () => {
        const forest = buildCoordinateForest(ROOT_ROWS, [
            ...EDGE_ROWS,
            { source: 'M', target: null, type: 'CONTAINS' },
            { source: 'M4', target: 'M4', type: 'CONTAINS' },
            { source: 'M', target: 'M4', type: 'CONTAINS' },
            { source: 'M', target: 'L2', type: 'RESONATES_WITH' }
        ]);
        expect([...(forest.childrenOf.get('M') ?? [])]).toEqual(['M0', 'M4']);
        expect(forest.childrenOf.get('M4')).not.toContain('M4');
        expect(forest.declared.has('L2')).toBe(false);
    });

    it('a graph-declared cycle renders marked and is never walked into', () => {
        const forest = buildCoordinateForest(
            [{ coordinate: 'M', name: 'Subsystem Family', vaultPath: null }],
            [
                { source: 'M', target: 'M2', type: 'CONTAINS' },
                { source: 'M2', target: 'M', type: 'HAS_INTERNAL_COMPONENT' }
            ]
        );
        const rows = coordinateTreeRows(forest, new Set(['M', 'M2']), ['M']);
        expect(rows.map(row => row.coordinate)).toEqual(['M', 'M2', 'M']);
        expect(rows[2]).toMatchObject({ coordinate: 'M', cyclic: true, hasChildren: false });
        expect(descendantsOf(forest, 'M')).toEqual(['M', 'M2']);
    });

    it('rows are the visible ones, in render order, honouring expand state', () => {
        const forest = buildCoordinateForest(ROOT_ROWS, EDGE_ROWS);
        expect(coordinateTreeRows(forest, new Set(), ['M']).map(r => r.coordinate)).toEqual(['M']);
        expect(coordinateTreeRows(forest, new Set(['M']), ['M']).map(r => r.coordinate)).toEqual([
            'M',
            'M0',
            'M4'
        ]);
        const deep = coordinateTreeRows(forest, new Set(['M', 'M4']), ['M']);
        expect(deep.map(r => `${r.depth}:${r.coordinate}`)).toEqual([
            '0:M',
            '1:M0',
            '1:M4',
            '2:M4-3'
        ]);
        expect(coordinateTreeRows(null, new Set())).toEqual([]);
    });

    it('the label is the graph’s name, the family name, or the coordinate — in that order', () => {
        expect(rowLabel({ coordinate: 'M4', name: 'Nara' })).toBe('Nara');
        expect(rowLabel({ coordinate: 'M', name: null })).toBe('Subsystem');
        expect(rowLabel({ coordinate: 'M4-3', name: null })).toBe('M4-3');
    });
});

// ── (d) per-family expand/collapse ──────────────────────────────────────────

describe('28.T28.6 (d) — the expand set is module-scope, so it outlives a remount', () => {
    it('toggle flips, and bulk-expand opens a family root and all its descendants', () => {
        const forest = buildCoordinateForest(ROOT_ROWS, EDGE_ROWS);
        useCoordinateTreeStore.setState({ forest, expanded: new Set<string>() });

        useCoordinateTreeStore.getState().toggle('M');
        expect([...useCoordinateTreeStore.getState().expanded]).toEqual(['M']);
        useCoordinateTreeStore.getState().toggle('M');
        expect([...useCoordinateTreeStore.getState().expanded]).toEqual([]);

        useCoordinateTreeStore.getState().expandFamily('M');
        expect([...useCoordinateTreeStore.getState().expanded].sort()).toEqual([
            'M',
            'M0',
            'M4',
            'M4-3'
        ]);

        // A family the graph declared no containment for still OPENS and shows
        // that — an honest empty family is a rendered fact, not a no-op.
        useCoordinateTreeStore.getState().expandFamily('C');
        expect(useCoordinateTreeStore.getState().expanded.has('C')).toBe(true);

        useCoordinateTreeStore.setState({ forest: null, expanded: new Set<string>() });
    });
});

// ── (e) CRUD vs governance ──────────────────────────────────────────────────

describe('28.T28.6 (c) — authoring ROUTES; there is no write path to compare it against', () => {
    it('the authoring intent is one the REAL parser accepts and the REAL ledger routes', () => {
        const intent = authoringIntentFor('M4-3', {
            dayNow: '07-30-2026',
            sessionKey: 'agent:pi',
            profileGeneration: 12,
            privacyClass: 'public'
        });
        // Parsed by the shipping parser, not compared against a shape guess.
        const parsed = parseCrossLayoutIntent(intent);
        expect(parsed.coordinate).toBe('M4-3');
        expect(parsed.requestedContributionId).toBe(CANON_STUDIO_CONTRIBUTION_ID);
        expect(parsed.requestedExtensionId).toBe('ide-shell-m0-m5');
        expect(parsed.artifactUri).toBeNull();

        const target = intentTarget(parsed);
        expect(target?.contributionId).toBe('canon-studio');
        expect(target?.component).toBeTruthy();
    });

    it('the ONE wire seam is a read, and `s2.graph.query` is its only method', () => {
        // The discipline check. A write path cannot be absent "by inspection" —
        // it is absent because every `invoke(` call site in this directory is
        // enumerated here and held against the live-method register.
        const methods = new Set<string>();
        const passThrough: string[] = [];
        const gatewayFiles: string[] = [];
        for (const { file, text } of paneSources()) {
            if (/\bgateway\s*\(/.test(text)) {
                gatewayFiles.push(file);
            }
            walk(sourceFile(file, text), node => {
                if (!ts.isCallExpression(node)) {
                    return;
                }
                const callee = node.expression;
                const name = ts.isPropertyAccessExpression(callee)
                    ? callee.name.text
                    : ts.isIdentifier(callee)
                      ? callee.text
                      : '';
                if (name !== 'invoke') {
                    return;
                }
                const [first] = node.arguments;
                if (first !== undefined && ts.isStringLiteralLike(first)) {
                    methods.add(first.text);
                    return;
                }
                // The ONE legal non-literal: the injectable seam's default,
                // forwarding its own argument to the holder. It claims no
                // method of its own, so it is counted, named, and bounded.
                passThrough.push(`${file}: ${callee.getText()}(${first?.getText() ?? ''})`);
            });
        }
        expect([...methods].sort()).toEqual([...COORDINATE_TREE_LIVE_METHODS].sort());
        expect([...methods]).toEqual(['s2.graph.query']);
        expect(passThrough).toEqual(['coordinateTreeLoad.ts: gateway().invoke(method)']);
        // …and only the ONE read module may even reach the holder.
        expect(gatewayFiles).toEqual(['coordinateTreeLoad.ts']);
    });

    it('no source in this pane names a canon-mutating S1/S2 method', () => {
        // Belt to the braces above: `mutatesGraphCanon: false` is a claim about
        // vocabulary as well as call sites (DR-M0-1 — Hen writes, this routes).
        const forbidden = [
            's2.graph.promotion.commit',
            's2.graph.ontology.reload',
            "s1'.vault.write_file",
            "s1'.entity.capture",
            "s1'.q_articulation.accept"
        ];
        for (const { file, text } of paneSources()) {
            for (const method of forbidden) {
                expect(text.includes(method), `${file} names the mutating method ${method}`).toBe(
                    false
                );
            }
        }
    });
});

// ── (f) the opening-tab law, statically ─────────────────────────────────────

describe('28.T28.6 — the pane cannot seize the shared coordinate on mount', () => {
    it('no `useEffect` in this pane writes `useCoordinateStore`', () => {
        // 52.T4's defect in one assertion: entering the deep layout mounts every
        // opening tab on BOTH faces, so a coordinate tree that published from an
        // effect would take the active coordinate away from the visible face.
        let effects = 0;
        for (const { file, text } of paneSources()) {
            walk(sourceFile(file, text), node => {
                if (!ts.isCallExpression(node)) {
                    return;
                }
                const callee = node.expression;
                const name = ts.isIdentifier(callee) ? callee.text : '';
                if (name !== 'useEffect') {
                    return;
                }
                effects += 1;
                const body = node.arguments[0]?.getText() ?? '';
                expect(
                    body.includes('useCoordinateStore'),
                    `${file}: a useEffect writes the SHARED coordinate store — that is the 52.T4 defect`
                ).toBe(false);
                expect(body.includes('setSelected')).toBe(false);
            });
        }
        // If the pane ever stops having an effect at all this assertion is
        // vacuous, so it must find the mount read it really has.
        expect(effects).toBeGreaterThan(0);
    });

    it('the shared store is written from exactly one place, and it is a click handler', () => {
        const pane = readFileSync(join(PANE_DIR, 'CoordinateTreePane.tsx'), 'utf8');
        const writes = pane.match(/useCoordinateStore\.getState\(\)\.setSelected/g) ?? [];
        expect(writes).toHaveLength(1);
        expect(pane).toContain('onClick={() => useCoordinateStore.getState().setSelected(row.coordinate)}');
    });
});
