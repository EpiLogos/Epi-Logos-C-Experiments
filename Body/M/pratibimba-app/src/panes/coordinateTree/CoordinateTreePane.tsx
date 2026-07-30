/**
 * Coordinate: M' M0' chrome (Coordinate Tree — rerun 28.T28.6)
 * Residency: Body/M/pratibimba-app/src/panes/coordinateTree/CoordinateTreePane.tsx
 * Position (#n): #0 — Ground: the navigation backbone every other surface roots in.
 * Actualises: the five deliverables of tranche 28.6 on the live carrier —
 *   (a) per-family colouring from `coordinateFamilyGrade` (DR-WC-DL-1's 36-token
 *       family-tier × archetype-grade matrix, theme-resolved) plus the
 *       repo-ontology namespace class read from S1 residency;
 *   (b) the active-coordinate highlight: this pane SUBSCRIBES to the one shared
 *       coordinate singleton and PUBLISHES into it on a user click, which is
 *       15-foundation principle 1 / 21-m0 SC-5 made real for the tree;
 *   (c) the CRUD-vs-governed-route separation of DR-M0-1 — a reading mode and
 *       an authoring mode, where authoring emits a CrossLayoutIntent to Canon
 *       Studio and there is no local write path at all;
 *   (d) per-family expand/collapse over a module-scope expand set that survives
 *       the layout toggle, with the six bulk-expand commands;
 *   (e) the privacy class of the read, applied per row — and the honest
 *       disclosure that no per-COORDINATE class exists to refine it with
 *       (`coordinateTreeSeams.ts`).
 *
 *   THIS PANE PUBLISHES NOTHING ON MOUNT. It reads the graph on mount and it
 *   subscribes to `useCoordinateStore`, but it writes that singleton only from
 *   `onClick`. That is THE OPENING-TAB LAW (`ui/deepPaneSet.ts`) obeyed by
 *   construction rather than by declaration: a coordinate tree is exactly the
 *   surface that would otherwise seize the active coordinate on the hidden face
 *   the instant the deep layout is entered. The sibling suite asserts the
 *   singleton is untouched across a mount.
 * Public surface: CoordinateTreePane.
 * Does NOT own: the forest shape, the identity strings or the expand law
 *   (`coordinateTreeModel.ts` — the tab label lives there so the e2e spec can
 *   name it without importing a `.tsx`), the
 *   gateway read (`coordinateTreeLoad.ts`), colour VALUES (`ui/tokens.ts`),
 *   canon mutation (DR-M0-1 — Hen writes, this routes), or the rail's position
 *   (`ui/deepPaneSet.ts` / `App.tsx`).
 * Contract: [[CHROME-CONTRACT]] §2 + §4 + §5 + §7 · [[DR-M0-1]] · 21-m0 SC-5 ·
 *   15-foundation principle 1 · rerun tranche [[28.T28.6]].
 */

import { useEffect, useMemo } from 'react';

import { commands } from '../../commands/registry';
import { CROSS_LAYOUT_INTENT_COMMAND, type IntentPrivacyClass } from '../../commands/crossLayoutIntent';
import { useCoordinateStore, useProvenanceStore, useSessionStore, useTickStore } from '../../state/stores';
import { BridgeReadinessBadge } from '../../ui/BridgeReadinessBadge';
import { BlockedOverlay, EmptyState, LoadingPulse } from '../../ui/primitives';
import { useThemeStore } from '../../state/themeStore';
import { coordinateFamilyGrade } from '../../ui/tokens';
import { decomposeCoordinate } from '../../ui/coordinateNames';
import { loadCoordinateForest } from './coordinateTreeLoad';
import {
    authoringIntentFor,
    coordinateRowClasses,
    coordinateTreeRows,
    rowLabel,
    useCoordinateTreeStore,
    type CoordinateTreeRow
} from './coordinateTreeModel';
import { COORDINATE_TREE_SEAMS } from './coordinateTreeSeams';

function intentPrivacy(value: string | null): IntentPrivacyClass | null {
    return value === 'public' || value === 'protected' || value === 'private' ? value : null;
}

export function CoordinateTreePane() {
    const connected = useProvenanceStore(state => state.connection.connected);
    const status = useCoordinateTreeStore(state => state.status);
    const detail = useCoordinateTreeStore(state => state.detail);
    const forest = useCoordinateTreeStore(state => state.forest);
    const expanded = useCoordinateTreeStore(state => state.expanded);
    const surfaceMode = useCoordinateTreeStore(state => state.surfaceMode);
    const receiptPrivacyClass = useCoordinateTreeStore(state => state.receiptPrivacyClass);
    // (b) SUBSCRIBE — the pane re-renders when any other surface publishes.
    const activeCoordinate = useCoordinateStore(state => state.selected);
    const theme = useThemeStore(state => state.applied);
    const dayNow = useSessionStore(state => state.dayNow);
    const sessionKey = useSessionStore(state => state.sessionKey);
    const sessionPrivacy = useSessionStore(state => state.privacyClass);

    useEffect(() => {
        // The forest is module-scope, so a layout toggle (which remounts every
        // pane) costs no second read — only a first mount reaches the gateway.
        //
        // `status !== 'idle'` is the whole guard and it has to stay that strict.
        // An earlier form excluded only `ready` and `loading`, which meant every
        // NON-ready terminal status — `error`, `empty`, `privacy-refused` — fed
        // straight back into this effect through its own status change and read
        // the gateway in a tight loop. A refused receipt would have hammered S2
        // for as long as the tab stayed open. A terminal status is terminal;
        // the retry is the reconnect below, and it happens exactly once.
        if (!connected || status !== 'idle') {
            return;
        }
        void loadCoordinateForest();
    }, [connected, status]);

    useEffect(() => {
        // A dropped bridge invalidates a terminal failure, so returning to
        // `idle` is what lets a reconnect retry — the pane owns no retry button
        // and must not invent a polling one.
        if (connected || status === 'idle' || status === 'ready' || status === 'loading') {
            return;
        }
        useCoordinateTreeStore.getState().resolveLoad({ status: 'idle', detail: null });
    }, [connected, status]);

    const rows = useMemo(() => coordinateTreeRows(forest, expanded), [forest, expanded]);

    // (c) DR-M0-1: authoring ROUTES. There is no branch here that writes.
    const proposeEdit = (coordinate: string) => {
        void commands.execute(
            CROSS_LAYOUT_INTENT_COMMAND,
            authoringIntentFor(coordinate, {
                dayNow,
                sessionKey,
                profileGeneration: useTickStore.getState().generation,
                privacyClass: intentPrivacy(sessionPrivacy)
            })
        );
    };

    const renderRow = (row: CoordinateTreeRow) => {
        const active = activeCoordinate === row.coordinate;
        const classes = coordinateRowClasses({
            coordinate: row.coordinate,
            vaultPath: row.vaultPath,
            privacyClass: receiptPrivacyClass,
            active
        });
        const grade = coordinateFamilyGrade(row.coordinate);
        const decomposed = decomposeCoordinate(row.coordinate);
        const tint = grade ? grade.hue[theme === 'light' ? 'light' : 'dark'] : undefined;
        return (
            <li
                key={`${row.depth}:${row.coordinate}`}
                className={classes.join(' ')}
                data-testid={`coordinate-tree-node-${row.coordinate}`}
                data-coordinate={row.coordinate}
                data-depth={row.depth}
                data-expanded={row.hasChildren ? String(row.expanded) : undefined}
                data-cyclic={row.cyclic ? 'true' : undefined}
                style={{
                    paddingLeft: 6 + row.depth * 12,
                    ...(tint ? { ['--coordinate-family-tint' as string]: tint } : {})
                }}
            >
                {row.hasChildren ? (
                    <button
                        type="button"
                        className="coordinate-tree-arrow"
                        aria-label={`${row.expanded ? 'Collapse' : 'Expand'} ${row.coordinate}`}
                        aria-expanded={row.expanded}
                        data-testid={`coordinate-tree-arrow-${row.coordinate}`}
                        onClick={() => useCoordinateTreeStore.getState().toggle(row.coordinate)}
                    >
                        {row.expanded ? '▾' : '▸'}
                    </button>
                ) : (
                    <span className="coordinate-tree-arrow coordinate-tree-arrow-leaf" aria-hidden="true" />
                )}
                <button
                    type="button"
                    className="coordinate-tree-label"
                    data-testid={`coordinate-tree-select-${row.coordinate}`}
                    aria-current={active ? 'true' : undefined}
                    title={
                        decomposed
                            ? `${decomposed.familyName} · ${decomposed.archetypeName}`
                            : 'outside the six coordinate families'
                    }
                    // (b) PUBLISH — user gesture only. Never a mount effect.
                    onClick={() => useCoordinateStore.getState().setSelected(row.coordinate)}
                >
                    <span className="coordinate-tree-coord">{row.coordinate}</span>
                    <span className="coordinate-tree-name">{rowLabel(row)}</span>
                    {row.cyclic ? (
                        <span className="coordinate-tree-cyclic" title="the graph declared this coordinate as its own ancestor">
                            ↺
                        </span>
                    ) : null}
                </button>
                {surfaceMode === 'authoring' ? (
                    <button
                        type="button"
                        className="coordinate-tree-propose"
                        data-testid={`coordinate-tree-propose-${row.coordinate}`}
                        title="Route this coordinate to Canon Studio — this surface never writes canon (DR-M0-1)"
                        onClick={() => proposeEdit(row.coordinate)}
                    >
                        Propose canonical edit
                    </button>
                ) : null}
            </li>
        );
    };

    return (
        <div
            className="coordinate-tree-pane"
            data-testid="coordinate-tree"
            data-surface-mode={surfaceMode}
            data-active-coordinate={activeCoordinate ?? ''}
            data-mutates-graph-canon="false"
            data-status={status}
        >
            <header className="coordinate-tree-header">
                <div className="coordinate-tree-title">
                    <span>M0′</span>
                    <h3>Coordinate tree</h3>
                    <BridgeReadinessBadge bindingKey="s2.graph.node" />
                </div>
                <div className="coordinate-tree-mode" role="group" aria-label="Surface mode">
                    {(['reading', 'authoring'] as const).map(mode => (
                        <button
                            key={mode}
                            type="button"
                            className="coordinate-tree-mode-option"
                            data-testid={`coordinate-tree-mode-${mode}`}
                            aria-pressed={surfaceMode === mode}
                            onClick={() => useCoordinateTreeStore.getState().setSurfaceMode(mode)}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </header>
            {surfaceMode === 'authoring' ? (
                <p className="coordinate-tree-governance" data-testid="coordinate-tree-governance">
                    Authoring routes to Canon Studio. This surface proposes; it never mutates canon (DR-M0-1).
                </p>
            ) : null}
            {!connected ? (
                <BlockedOverlay
                    readinessId="bridge_unavailable"
                    reason="the coordinate tree reads the canonical graph through S2"
                />
            ) : status === 'privacy-refused' ? (
                <BlockedOverlay readinessId="privacy_blocked" reason={detail ?? undefined} />
            ) : status === 'error' ? (
                <BlockedOverlay readinessId="s2_graph_blocked" reason={detail ?? undefined} />
            ) : status === 'loading' || status === 'idle' ? (
                <LoadingPulse family="C" readinessId="ready_public_current" label="reading declared containment" />
            ) : status === 'empty' ? (
                <EmptyState family="C" hint={detail ?? 'the canonical graph declared no containment'} />
            ) : (
                <ul className="coordinate-tree" data-testid="coordinate-tree-rows">
                    {rows.map(renderRow)}
                </ul>
            )}
            <footer className="coordinate-tree-footer">
                {detail && status === 'ready' ? (
                    <span data-testid="coordinate-tree-detail">{detail}</span>
                ) : null}
                {COORDINATE_TREE_SEAMS.map(seam => (
                    <span
                        key={seam.method}
                        className="coordinate-tree-seam"
                        data-testid={`coordinate-tree-seam-${seam.method}`}
                        data-registered={String(seam.registered)}
                        title={seam.reason}
                    >
                        {seam.deliverable}: <code>{seam.method}</code> carries no {seam.expected} — {seam.reason}
                    </span>
                ))}
            </footer>
        </div>
    );
}
