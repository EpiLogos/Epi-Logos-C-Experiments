/**
 * Coordinate: M' M0' chrome (the coordinate tree's model — rerun 28.T28.6)
 * Residency: Body/M/pratibimba-app/src/panes/coordinateTree/coordinateTreeModel.ts
 * Position (#n): #4 — Context/Type: the type law of what a coordinate-tree row IS.
 * Actualises: the four deliverables of tranche 28.6 that are DATA rather than
 *   markup — the graph-declared containment forest, the per-row class
 *   derivation (family · namespace · privacy), the expand-state that survives a
 *   layout toggle, and the reading/authoring surface mode whose authoring half
 *   ROUTES instead of writing (DR-M0-1).
 *
 *   THE HIERARCHY IS THE GRAPH'S, NOT THE STRING'S. A coordinate string looks
 *   like a path (`M0-3-2` under `M0-3` under `M0`), and deriving the tree from
 *   that shape would have needed no gateway at all — but it would have been the
 *   carrier inventing structure. The live graph declares containment with two
 *   relation types (`CONTAINS` at the family→archetype level, 125 edges;
 *   `HAS_INTERNAL_COMPONENT` below it, 828 edges — probed 2026-07-30), so this
 *   module reads those edges and nothing else. Where the graph declares no
 *   child the tree shows a leaf, even when the string shape suggests otherwise;
 *   where the graph declares a child whose coordinate does NOT extend its
 *   parent's (one such edge exists today, `M2-4.5 → M2-4`) the tree renders the
 *   edge the graph declared and marks the repeat rather than silently pruning
 *   it. `buildCoordinateForest` is therefore cycle-safe by construction.
 *
 *   THE FAMILY ROOTS ARE REAL NODES. `P` `S` `T` `M` `L` `C` are :Bimba
 *   coordinates in their own right ("P Position Family", "Epi-Logos Project",
 *   …), so the six top rows are read, not synthesised. Two of them (`C`, `T`)
 *   declare no containment children today; that renders as an honest empty
 *   family, never as a fabricated `C0…C5`.
 * Public surface: COORDINATE_TREE_SURFACE_ID, COORDINATE_TREE_TAB_LABEL,
 *   COORDINATE_TREE_FAMILY_ROOTS,
 *   STRUCTURAL_CHILD_RELATIONS, CoordinateTreeEdge, CoordinateTreeFacts,
 *   CoordinateTreeForest, CoordinateTreeRow, SurfaceMode, buildCoordinateForest,
 *   coordinateTreeRows, familyRowClass, namespaceRowClass, privacyRowClass,
 *   coordinateRowClasses, descendantsOf, useCoordinateTreeStore,
 *   authoringIntentFor, CANON_STUDIO_CONTRIBUTION_ID.
 * Does NOT own: the gateway read (`coordinateTreeLoad.ts`), the render tree
 *   (`CoordinateTreePane.tsx`), colour VALUES (`ui/tokens.ts`
 *   `coordinateFamilyGrade` — DR-WC-DL-1), coordinate NAMES
 *   (`ui/coordinateNames.ts`), the shared coordinate singleton
 *   (`state/stores.ts`), the privacy verdict (`ui/privacyGate.ts`), or canon
 *   mutation of any kind (DR-M0-1: this surface routes, Hen writes).
 * Contract: [[CHROME-CONTRACT]] §2 (`coordinateTree`) + §5 (CrossLayoutIntent)
 *   + §7 (privacy) · [[DR-M0-1]] · 21-m0 SC-5 · 15-foundation principle 1
 *   ("Coordinate as Primary Navigation") · rerun tranche [[28.T28.6]].
 */

import { create } from 'zustand';

import { FAMILY_NAMES } from '../../ui/coordinateNames';
import { coordinateFamilyGrade, type FamilyLetter } from '../../ui/tokens';

/** The [[CHROME-CONTRACT]] §2 surface id = this pane's flexlayout component key. */
export const COORDINATE_TREE_SURFACE_ID = 'coordinateTree';

/**
 * The rail tab label. Shorter than the activity-bar mode label ("Coordinate
 * Tree") because a 260px border strip is the constraint, and the two have never
 * been the same string in this carrier (`fileTree` = "Vault").
 *
 * It lives HERE rather than beside the component because the e2e spec must name
 * the tab it clicks, and `lint:e2e-graph` forbids a spec from reaching a `.tsx`
 * module (the render tree pulls in `import.meta.glob` through the iconography
 * registry, which Playwright cannot transform). Identity strings belong to the
 * model; the component consumes them.
 */
export const COORDINATE_TREE_TAB_LABEL = 'Coordinates';

/**
 * The six family roots, in CLAUDE.md §II.C declaration order. Each IS a real
 * `:Bimba` coordinate — the tree reads them, it does not synthesise a grouping
 * row. `FAMILY_NAMES` supplies the fallback label for a root the graph has not
 * answered for yet; the graph's own `c_1_name` wins once it has.
 */
export const COORDINATE_TREE_FAMILY_ROOTS: readonly FamilyLetter[] = Object.freeze([
    'P',
    'S',
    'T',
    'M',
    'L',
    'C'
]);

/**
 * The two relation types the LIVE graph uses for coordinate containment, and
 * they are declared at DIFFERENT tiers of S2 — the sibling suite holds each
 * against the tier that really carries it, because an earlier draft of this
 * comment claimed both were enumerated specs and only one is:
 *
 *  - `CONTAINS` is an enumerated `GraphRelationshipTypeSpec` in
 *    `Body/S/S2/graph-schema/src/relationships/rel.rs` (`coordinate_home: C0`,
 *    `source_family: "coordinate"`, `compatibility: false`).
 *  - `HAS_INTERNAL_COMPONENT` is NOT in that table and must not be expected
 *    there. It is a DEEP-DATASET-CLASS relation admitted by convention —
 *    `graph-schema/src/relationships/deep_bimba.rs::is_deep_dataset_relation_type`
 *    returns true for it — which is exactly how the `*-deep/relations.json`
 *    importers emit the sub-archetype containment this tree walks.
 *
 * Widening this list is therefore a deliberate act with two possible proofs,
 * and `coordinateTreeModel.test.ts` demands one of them per entry.
 */
export const STRUCTURAL_CHILD_RELATIONS: readonly string[] = Object.freeze([
    'CONTAINS',
    'HAS_INTERNAL_COMPONENT'
]);

export interface CoordinateTreeEdge {
    readonly source: string;
    readonly target: string;
    readonly relation: string;
}

/** What the graph says about one coordinate. Every field is READ; none derived. */
export interface CoordinateTreeFacts {
    readonly coordinate: string;
    /** `c_1_name` — the canonical name property (DR-M0-2). Null when unset. */
    readonly name: string | null;
    /** `s_1_vault_path` — S1 residency, the ONLY namespace authority. Null when
     *  the node carries none, which is the common case today. */
    readonly vaultPath: string | null;
}

export interface CoordinateTreeForest {
    readonly facts: ReadonlyMap<string, CoordinateTreeFacts>;
    /** Declared containment, parent → children in coordinate order. */
    readonly childrenOf: ReadonlyMap<string, readonly string[]>;
    /** Every coordinate the two reads mentioned, as parent or as child. */
    readonly declared: ReadonlySet<string>;
}

export type SurfaceMode = 'reading' | 'authoring';

const EMPTY_CHILDREN: readonly string[] = Object.freeze([]);

function text(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

/**
 * Build the containment forest from two `s2.graph.query` row sets: the family
 * root rows (`coordinate`/`name`/`vaultPath`) and the containment edge rows
 * (`source`/`target`/`type`, plus the target's name and vault path so one read
 * carries both the edge and the node it points at).
 *
 * Rows that do not name both ends are dropped rather than guessed at; a
 * self-edge is dropped (it is not containment); duplicate edges collapse.
 */
export function buildCoordinateForest(
    rootRows: readonly Record<string, unknown>[],
    edgeRows: readonly Record<string, unknown>[]
): CoordinateTreeForest {
    const facts = new Map<string, CoordinateTreeFacts>();
    const children = new Map<string, string[]>();
    const declared = new Set<string>();

    const note = (coordinate: string, name: string | null, vaultPath: string | null): void => {
        declared.add(coordinate);
        const existing = facts.get(coordinate);
        facts.set(coordinate, {
            coordinate,
            name: name ?? existing?.name ?? null,
            vaultPath: vaultPath ?? existing?.vaultPath ?? null
        });
    };

    for (const row of rootRows) {
        const coordinate = text(row.coordinate);
        if (!coordinate) {
            continue;
        }
        note(coordinate, text(row.name), text(row.vaultPath));
    }

    for (const row of edgeRows) {
        const source = text(row.source);
        const target = text(row.target);
        if (!source || !target || source === target) {
            continue;
        }
        const relation = text(row.type) ?? 'CONTAINS';
        if (!STRUCTURAL_CHILD_RELATIONS.includes(relation)) {
            continue;
        }
        note(source, null, null);
        note(target, text(row.targetName), text(row.targetVaultPath));
        const bucket = children.get(source) ?? [];
        if (!bucket.includes(target)) {
            bucket.push(target);
        }
        children.set(source, bucket);
    }

    const childrenOf = new Map<string, readonly string[]>();
    for (const [parent, bucket] of children) {
        childrenOf.set(parent, Object.freeze([...bucket].sort((a, b) => a.localeCompare(b))));
    }

    return Object.freeze({ facts, childrenOf, declared });
}

/**
 * The family-tier class for a coordinate. `coordinateFamilyGrade` is the ONE
 * derivation (30.T30.2 / DR-WC-DL-1) — this never re-parses a coordinate. The
 * six bare family roots are not `[PSTMLC][0-5]` shaped, so they are matched
 * first; anything the derivation refuses (a raw `#4`, a reflective `cpf`) is
 * `unfamilied` rather than being coerced into a family it does not belong to.
 */
export function familyRowClass(coordinate: string): string {
    const family = familyOf(coordinate);
    return family ? `coordinate-family-${family}` : 'coordinate-family-unfamilied';
}

/** The family letter a coordinate belongs to, or null when it has none. */
export function familyOf(coordinate: string): FamilyLetter | null {
    const trimmed = coordinate.trim();
    const root = COORDINATE_TREE_FAMILY_ROOTS.find(letter => letter === trimmed.toUpperCase());
    if (root) {
        return root;
    }
    return coordinateFamilyGrade(trimmed)?.family ?? null;
}

/**
 * The repo-ontology namespace class, read from S1 residency (`s_1_vault_path`)
 * and from nothing else. `Idea/Bimba/…` · `Idea/Empty/…` · `Idea/Pratibimba/…`
 * are the three roots repo-ontology names. Returns null when the node carries
 * no vault path — which is the honest answer for most coordinates today, and
 * is NOT the same as "it lives in Bimba".
 */
export function namespaceRowClass(vaultPath: string | null | undefined): string | null {
    if (typeof vaultPath !== 'string') {
        return null;
    }
    const normalised = vaultPath.replace(/^\.?\//, '').replace(/^Idea\//, '');
    if (normalised.startsWith('Empty/')) {
        return 'coordinate-namespace-empty';
    }
    if (normalised.startsWith('Pratibimba/')) {
        return 'coordinate-namespace-pratibimba';
    }
    if (normalised.startsWith('Bimba/')) {
        return 'coordinate-namespace-bimba';
    }
    return null;
}

/**
 * The privacy class of the RECEIPT the row's datum arrived on. See
 * `coordinateTreeSeams.ts`: no per-coordinate privacy class exists anywhere in
 * the stack, so every row of one read carries the same class — which is the
 * truth, not a shortcut.
 */
export function privacyRowClass(privacyClass: string | null | undefined): string {
    const value = typeof privacyClass === 'string' && privacyClass.trim().length > 0
        ? privacyClass.trim()
        : 'unset';
    return `coordinate-privacy-${value}`;
}

export function coordinateRowClasses(input: {
    readonly coordinate: string;
    readonly vaultPath?: string | null;
    readonly privacyClass?: string | null;
    readonly active?: boolean;
}): readonly string[] {
    const classes = ['coordinate-tree-node', familyRowClass(input.coordinate)];
    const namespaceClass = namespaceRowClass(input.vaultPath);
    if (namespaceClass) {
        classes.push(namespaceClass);
    }
    classes.push(privacyRowClass(input.privacyClass));
    if (input.active) {
        classes.push('active-coordinate');
    }
    return Object.freeze(classes);
}

/** One rendered line of the tree. */
export interface CoordinateTreeRow {
    readonly coordinate: string;
    readonly name: string | null;
    readonly depth: number;
    readonly hasChildren: boolean;
    readonly expanded: boolean;
    /** True when the graph declared this coordinate as its own ancestor. The
     *  row renders, marked, and is never walked into — that is the cycle guard. */
    readonly cyclic: boolean;
    readonly vaultPath: string | null;
}

/**
 * Flatten the forest into the visible rows, honouring expand state. The walk
 * carries its ancestor path so a declared cycle terminates at the repeat
 * instead of recursing; `visible` order IS render order.
 */
export function coordinateTreeRows(
    forest: CoordinateTreeForest | null,
    expanded: ReadonlySet<string>,
    roots: readonly string[] = COORDINATE_TREE_FAMILY_ROOTS
): readonly CoordinateTreeRow[] {
    const rows: CoordinateTreeRow[] = [];
    if (!forest) {
        return rows;
    }
    const walk = (coordinate: string, depth: number, path: readonly string[]): void => {
        const cyclic = path.includes(coordinate);
        const children = forest.childrenOf.get(coordinate) ?? EMPTY_CHILDREN;
        const isExpanded = !cyclic && expanded.has(coordinate) && children.length > 0;
        const facts = forest.facts.get(coordinate);
        rows.push({
            coordinate,
            name: facts?.name ?? null,
            depth,
            hasChildren: !cyclic && children.length > 0,
            expanded: isExpanded,
            cyclic,
            vaultPath: facts?.vaultPath ?? null
        });
        if (!isExpanded) {
            return;
        }
        const nextPath = [...path, coordinate];
        for (const child of children) {
            walk(child, depth + 1, nextPath);
        }
    };
    for (const root of roots) {
        walk(root, 0, []);
    }
    return rows;
}

/** Every coordinate reachable from `root` through declared containment, cycle-safe. */
export function descendantsOf(forest: CoordinateTreeForest | null, root: string): readonly string[] {
    if (!forest) {
        return EMPTY_CHILDREN;
    }
    const out: string[] = [];
    const seen = new Set<string>();
    const walk = (coordinate: string): void => {
        if (seen.has(coordinate)) {
            return;
        }
        seen.add(coordinate);
        out.push(coordinate);
        for (const child of forest.childrenOf.get(coordinate) ?? EMPTY_CHILDREN) {
            walk(child);
        }
    };
    walk(root);
    return Object.freeze(out);
}

// ── the store ───────────────────────────────────────────────────────────────

export type CoordinateTreeStatus =
    | 'idle'
    | 'loading'
    | 'ready'
    | 'empty'
    | 'privacy-refused'
    | 'error';

export interface CoordinateTreeState {
    status: CoordinateTreeStatus;
    detail: string | null;
    forest: CoordinateTreeForest | null;
    /** The privacy class of the receipt the forest arrived on. */
    receiptPrivacyClass: string | null;
    expanded: ReadonlySet<string>;
    surfaceMode: SurfaceMode;
    setSurfaceMode(mode: SurfaceMode): void;
    toggle(coordinate: string): void;
    /** Bulk-expand one family: its root and every declared descendant. */
    expandFamily(family: FamilyLetter): void;
    beginLoad(): void;
    resolveLoad(result: {
        readonly status: CoordinateTreeStatus;
        readonly detail: string | null;
        readonly forest?: CoordinateTreeForest | null;
        readonly receiptPrivacyClass?: string | null;
    }): void;
}

/**
 * Module-scope singleton — the same law `useLeftSidebarModeStore` follows. The
 * shell REMOUNTS every pane when the layout switches (52.T3's
 * `routingRevision`), so component state would lose the expand set on exactly
 * the gesture tranche 28.6 (d) requires it to survive. Keeping the forest here
 * too means the layout toggle costs no second gateway read.
 *
 * NOTE THE OPENING-TAB LAW: this store is the tree's OWN state. The tree writes
 * the SHARED coordinate singleton (`useCoordinateStore`) only from a user
 * click — never from a mount effect — so `coordinateTree` carries no
 * `mountPublishes` declaration in `ui/deepPaneSet.ts`, and the sibling suite
 * proves the absence rather than trusting it.
 */
export const useCoordinateTreeStore = create<CoordinateTreeState>((set, get) => ({
    status: 'idle',
    detail: null,
    forest: null,
    receiptPrivacyClass: null,
    expanded: new Set<string>(),
    surfaceMode: 'reading',
    setSurfaceMode: mode => set({ surfaceMode: mode }),
    toggle: coordinate =>
        set(state => {
            const next = new Set(state.expanded);
            if (next.has(coordinate)) {
                next.delete(coordinate);
            } else {
                next.add(coordinate);
            }
            return { expanded: next };
        }),
    expandFamily: family => {
        const { forest, expanded } = get();
        const next = new Set(expanded);
        // The root joins the set even when the graph declared it no children,
        // so a family with an empty containment set still opens and SHOWS that.
        next.add(family);
        for (const coordinate of descendantsOf(forest, family)) {
            next.add(coordinate);
        }
        set({ expanded: next });
    },
    beginLoad: () => set({ status: 'loading', detail: null }),
    resolveLoad: result =>
        set({
            status: result.status,
            detail: result.detail,
            ...(result.forest !== undefined ? { forest: result.forest } : {}),
            ...(result.receiptPrivacyClass !== undefined
                ? { receiptPrivacyClass: result.receiptPrivacyClass }
                : {})
        })
}));

// ── the governed-route half of DR-M0-1 ──────────────────────────────────────

/** The `requestedContributionId` Canon Studio answers to (`commands/crossLayoutIntent.ts`). */
export const CANON_STUDIO_CONTRIBUTION_ID = 'canon-studio';

export interface AuthoringIntentContext {
    readonly dayNow: string | null;
    readonly sessionKey: string | null;
    readonly profileGeneration: number | null;
    readonly privacyClass: 'public' | 'protected' | 'private' | null;
}

/**
 * DR-M0-1 in one function: "Propose canonical edit" builds the nine-field
 * CrossLayoutIntent that ROUTES the coordinate to Canon Studio. There is no
 * second branch — this surface has no write path to compare it against, and
 * `mutatesGraphCanon: false` holds because no mutation exists to gate.
 */
export function authoringIntentFor(coordinate: string, context: AuthoringIntentContext) {
    return Object.freeze({
        coordinate,
        artifactUri: null,
        reviewId: null,
        dayNow: context.dayNow,
        sessionKey: context.sessionKey,
        profileGeneration: context.profileGeneration,
        privacyClass: context.privacyClass,
        requestedExtensionId: 'ide-shell-m0-m5',
        requestedContributionId: CANON_STUDIO_CONTRIBUTION_ID
    });
}

/** The label of a row: the graph's name where it has one, the family name for a
 *  bare family root the graph has not answered for, else the coordinate alone. */
export function rowLabel(row: Pick<CoordinateTreeRow, 'coordinate' | 'name'>): string {
    if (row.name) {
        return row.name;
    }
    const family = COORDINATE_TREE_FAMILY_ROOTS.find(letter => letter === row.coordinate);
    return family ? FAMILY_NAMES[family] : row.coordinate;
}
