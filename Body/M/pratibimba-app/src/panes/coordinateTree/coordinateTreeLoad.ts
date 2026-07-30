/**
 * Coordinate: M' M0' chrome (the coordinate tree's one read — 28.T28.6)
 * Residency: Body/M/pratibimba-app/src/panes/coordinateTree/coordinateTreeLoad.ts
 * Position (#n): #2 — Operation: the single gateway operation this surface performs.
 * Actualises: `loadTree` from the tranche's spec, as one round trip over the
 *   live `s2.graph.query`. Two statements, one `Promise.all`, the same shape
 *   the Bimba graph viewer uses (`GraphExplorerPane`, 28.T28.3) — but a
 *   DIFFERENT dataset, so this is not a second reader of one payload: the
 *   viewer reads all nodes plus all 2 500 edges for a force layout; the tree
 *   reads only declared containment (953 edges probed 2026-07-30) plus the S1
 *   vault path that carries repo-ontology residency, which the viewer's
 *   statement does not select.
 *
 *   THE PRIVACY GATE RUNS BEFORE THE PAYLOAD REACHES A RENDER TREE
 *   (CHROME-CONTRACT §7), and a refused receipt is counted in the federated
 *   drop feed and never drawn — the same law, and the same feed, as 28.T28.3(e).
 * Public surface: COORDINATE_TREE_ROOTS_CYPHER, COORDINATE_TREE_EDGES_CYPHER,
 *   loadCoordinateForest.
 * Does NOT own: graph query law (S2), the forest shape
 *   (`coordinateTreeModel.ts`), the privacy verdict (`ui/privacyGate.ts`), or
 *   the render tree.
 * Contract: [[CHROME-CONTRACT]] §4 (bindings) + §7 (privacy) · rerun [[28.T28.6]].
 */

import { gateway } from '../../bridge/gatewayHolder';
import { isPrivacySafe, privacyRefusalReason } from '../../ui/privacyGate';
import { privacyDropFeed as sharedPrivacyDropFeed, type PrivacyDropFeed } from '../../services/privacyDropFeed';
import { queryRows } from '../graphData';
import {
    buildCoordinateForest,
    COORDINATE_TREE_FAMILY_ROOTS,
    COORDINATE_TREE_SURFACE_ID,
    STRUCTURAL_CHILD_RELATIONS,
    useCoordinateTreeStore
} from './coordinateTreeModel';

const ROOT_LIST = COORDINATE_TREE_FAMILY_ROOTS.map(letter => `'${letter}'`).join(', ');
const RELATION_LIST = STRUCTURAL_CHILD_RELATIONS.map(type => `'${type}'`).join(', ');

/** The six family roots' own identity. `c_1_name` is canon per DR-M0-2. */
export const COORDINATE_TREE_ROOTS_CYPHER =
    `MATCH (n:Bimba) WHERE n.coordinate IN [${ROOT_LIST}] ` +
    'RETURN n.coordinate AS coordinate, n.c_1_name AS name, n.s_1_vault_path AS vaultPath';

/** Declared containment, with the child's identity carried on the same row. */
export const COORDINATE_TREE_EDGES_CYPHER =
    'MATCH (parent:Bimba)-[r]->(child:Bimba) ' +
    `WHERE type(r) IN [${RELATION_LIST}] ` +
    'RETURN parent.coordinate AS source, child.coordinate AS target, type(r) AS type, ' +
    'child.c_1_name AS targetName, child.s_1_vault_path AS targetVaultPath ' +
    'LIMIT 4000';

export interface LoadCoordinateForestOptions {
    /** The gateway seam, injectable so a test can drive the load without a
     *  live socket. `params` is a `Record`, not `unknown`: that is what
     *  `gateway().invoke` accepts and what both call sites below pass, and
     *  widening it here only moved the type error onto the default. */
    readonly invoke?: (
        method: string,
        params: Record<string, unknown>
    ) => Promise<{ artifact: unknown; privacyClass: string }>;
    readonly privacyDropFeed?: PrivacyDropFeed;
}

/**
 * Read the containment forest and resolve it into the store. Never throws: a
 * failed read becomes an `error` status with the real message, so the pane
 * renders a refusal rather than unmounting the shell.
 */
export async function loadCoordinateForest(options: LoadCoordinateForestOptions = {}): Promise<void> {
    const store = useCoordinateTreeStore.getState();
    const invoke = options.invoke ?? ((method, params) => gateway().invoke(method, params));
    const feed = options.privacyDropFeed ?? sharedPrivacyDropFeed;
    store.beginLoad();
    try {
        const [rootsReceipt, edgesReceipt] = await Promise.all([
            invoke('s2.graph.query', { cypher: COORDINATE_TREE_ROOTS_CYPHER, params: {} }),
            invoke('s2.graph.query', { cypher: COORDINATE_TREE_EDGES_CYPHER, params: {} })
        ]);
        const refused = [rootsReceipt, edgesReceipt].find(receipt => !isPrivacySafe(receipt.privacyClass));
        if (refused) {
            feed.record(COORDINATE_TREE_SURFACE_ID, refused.privacyClass);
            useCoordinateTreeStore.getState().resolveLoad({
                status: 'privacy-refused',
                detail: privacyRefusalReason(refused.privacyClass, "M0′ coordinate tree"),
                forest: null,
                receiptPrivacyClass: refused.privacyClass
            });
            return;
        }
        const forest = buildCoordinateForest(
            queryRows(rootsReceipt.artifact),
            queryRows(edgesReceipt.artifact)
        );
        const edgeCount = [...forest.childrenOf.values()].reduce((total, kids) => total + kids.length, 0);
        useCoordinateTreeStore.getState().resolveLoad({
            status: forest.declared.size === 0 ? 'empty' : 'ready',
            detail:
                forest.declared.size === 0
                    ? 'the canonical graph declared no containment for the six family roots'
                    : `${forest.declared.size} coordinates · ${edgeCount} declared containments`,
            forest,
            receiptPrivacyClass: rootsReceipt.privacyClass
        });
    } catch (err) {
        useCoordinateTreeStore.getState().resolveLoad({
            status: 'error',
            detail: err instanceof Error ? err.message : String(err)
        });
    }
}
