/**
 * Coordinate: M' (subsystem-page workspace body — rerun 52.T5)
 * Residency: Body/M/pratibimba-app/src/panes/SubsystemWorkspacePane.tsx
 * Position (#n): the 4+2 body — one full-page workspace per M0'-M5'.
 * Actualises: the full-page experience [[M'-SYSTEM-SPEC]] :119 names — a
 *   subsystem page with room for inner 0-5 strata. Opens on stratum 0
 *   (Ground): the page's identity, its strata index, and its honest
 *   named-unbuilt list — NOT the shell preview enlarged
 *   ([[M'-TAURI-PORT-SPEC]] :65 "do not merge them" is the acceptance
 *   posture). Each further stratum mounts exactly ONE gathered depth surface,
 *   on an explicit click — which is what admits the `walk` mount-publication
 *   hazard, and why a page never mounts five instruments at once.
 * Public surface: SubsystemWorkspacePane.
 * Does NOT own: the strata declarations (`ui/subsystemPages.ts`), the
 *   disposition ledger (`ui/subsystemWorkspaceOwnership.ts`), the open
 *   commands, the Home grid, or any gathered surface's body.
 * Contract: [[M'-SYSTEM-SPEC]] :119 / :168 · [[CHROME-CONTRACT]] §2 ·
 *   [[DR-SUBSYS-1]] · rerun tranche [[52.T5]].
 */

import { useState, type ReactNode } from 'react';
import {
    SUBSYSTEM_PAGES,
    type SubsystemPageDefinition,
    type SubsystemPageId
} from '../ui/subsystemPages';
import { gatheredDispositions } from '../ui/subsystemWorkspaceOwnership';
import { GraphExplorerPane } from './GraphExplorerPane';
import { MocBaseReflectionPane } from '../bases/MocBaseReflectionPane';
import { M1SurfaceDispatchPane, resolveM1SurfaceContext } from './m1SurfaceDispatch';
import { SpandaNavigatorPane } from './SpandaNavigatorPane';
import { WalkPane } from './WalkPane';
import { KleinTopologyPane } from './KleinTopologyPane';
import { PlayedTorusPane } from './PlayedTorusPane';
import { M2CorrespondencePane } from './M2CorrespondencePane';
import { PentadicInspectorPane } from './PentadicInspectorPane';
import { M3InspectorsPane } from './M3InspectorsPane';
import { JournalTimelinePane } from './JournalTimelinePane';
import { DayCalendarPane } from './DayCalendarPane';
import { OraclePane } from './OraclePane';
import { PratibimbaCoordinatePane } from './PratibimbaCoordinatePane';
import { CanonUpdateLedgerPane } from './CanonUpdateLedgerPane';
import { M5EbmObservatoryPane } from './M5EbmObservatoryPane';
import { AutoresearchPane } from './AutoresearchPane';
import { AgenticControlRoomPane } from './acr/AgenticControlRoomPane';
import { PiAxiomTranslationInspector } from './PiAxiomTranslationInspector';

/**
 * The gathered surfaces' render table. MIRRORS: each entry renders the same
 * component the daily/deep-overview mount renders (DR-SUBSYS-2 — nothing
 * moves). `bimbaGraph` is pinned to its deep rendering mode: inside a
 * subsystem page the lattice IS the instrument (28.T28.3), never the daily
 * solar-anchor preview. `m1SurfaceComposed` renders its layout-invariant
 * composed mode (§2). Kept in ONE table so the sibling test can hold it
 * against the ledger's gathered rows — a gathered surface with no renderer
 * here is a broken stratum, not a silent fallback.
 */
const GATHERED_RENDERERS: Readonly<Record<string, () => ReactNode>> = Object.freeze({
    bimbaGraph: () => <GraphExplorerPane activeLayout="ide-deep" />,
    mocBases: () => <MocBaseReflectionPane />,
    m1SurfaceComposed: () => (
        <M1SurfaceDispatchPane
            context={resolveM1SurfaceContext({ face: 0, activeLayout: 'ide-deep' })}
        />
    ),
    spandaNavigator: () => <SpandaNavigatorPane />,
    walk: () => <WalkPane />,
    kleinTopology: () => <KleinTopologyPane />,
    m1PlayedTorus: () => <PlayedTorusPane />,
    m2Correspondence: () => <M2CorrespondencePane />,
    m3PentadicInspector: () => <PentadicInspectorPane />,
    m3Inspectors: () => <M3InspectorsPane />,
    journalTimeline: () => <JournalTimelinePane />,
    dayCalendar: () => <DayCalendarPane />,
    oracle: () => <OraclePane />,
    pratibimbaCoordinate: () => <PratibimbaCoordinatePane />,
    canonUpdateLedger: () => <CanonUpdateLedgerPane />,
    m5Ebm: () => <M5EbmObservatoryPane />,
    autoresearch: () => <AutoresearchPane requestedCapacity={null} />,
    agenticControlRoom: () => <AgenticControlRoomPane />,
    piAxiomTranslation: () => <PiAxiomTranslationInspector />
});

export { GATHERED_RENDERERS };

/**
 * The chosen stratum per page, surviving the shell's `routingRevision`
 * remounts (every layout switch and every cross-layout intent remounts both
 * `<Layout>` trees, which used to snap every open workspace back to Ground
 * mid-work). Module scope on purpose — the same discipline as the coordinate
 * tree's expand set, which survives the layout toggle the same way. A stratum
 * flagged `remountHazard` (its surface PUBLISHES shared state from its mount
 * effect) is deliberately NOT restored: it falls back to Ground so the
 * publish only ever happens on the user's own click.
 */
const chosenStrata = new Map<SubsystemPageId, number>();

function restoredStratum(page: SubsystemPageDefinition): number {
    const remembered = chosenStrata.get(page.id) ?? 0;
    const entry = page.strata.find(candidate => candidate.stratum === remembered);
    if (!entry || entry.remountHazard) {
        return 0;
    }
    return entry.stratum;
}

function GroundPanel({ page }: { readonly page: SubsystemPageDefinition }) {
    const gathered = gatheredDispositions(page.id);
    return (
        <div className="subsystem-ground" data-testid={`subsystem-ground-${page.id}`}>
            <div className="subsystem-ground-identity">
                <span className="subsystem-ground-coordinate">{page.coordinate}</span>
                <h2>{page.title}</h2>
                <p className="subsystem-ground-essence">{page.essence}</p>
            </div>
            <div className="subsystem-ground-strata">
                <h3>Gathered strata</h3>
                <ul>
                    {gathered.map(row => (
                        <li key={row.surfaceId}>
                            <span className="subsystem-ground-stratum-n">{row.workspace?.stratum}</span>{' '}
                            <code>{row.surfaceId}</code> — {row.evidence}
                        </li>
                    ))}
                </ul>
            </div>
            {page.namedUnbuilt.length > 0 ? (
                <div className="subsystem-ground-unbuilt" data-testid={`subsystem-unbuilt-${page.id}`}>
                    <h3>Named, not yet built here</h3>
                    <ul>
                        {page.namedUnbuilt.map(line => (
                            <li key={line}>{line}</li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </div>
    );
}

export function SubsystemWorkspacePane({ subsystem }: { readonly subsystem: SubsystemPageId }) {
    const page = SUBSYSTEM_PAGES.find(candidate => candidate.id === subsystem);
    const [activeStratum, setActiveStratumState] = useState<number>(() =>
        page ? restoredStratum(page) : 0
    );
    if (!page) {
        return <div className="pane-message">unknown subsystem page: {subsystem}</div>;
    }
    const setActiveStratum = (next: number) => {
        chosenStrata.set(page.id, next);
        setActiveStratumState(next);
    };
    const stratum = page.strata.find(candidate => candidate.stratum === activeStratum)
        ?? page.strata[0];
    const renderer = stratum.surfaceId ? GATHERED_RENDERERS[stratum.surfaceId] : null;
    return (
        <div
            className="subsystem-page"
            data-testid={`subsystem-page-${page.id}`}
            data-subsystem-stratum={stratum.stratum}
        >
            <nav className="subsystem-strata-rail" data-testid={`subsystem-strata-rail-${page.id}`}>
                <span className="subsystem-strata-coordinate">{page.coordinate}</span>
                {page.strata.map(entry => (
                    <button
                        key={entry.stratum}
                        type="button"
                        data-testid={`subsystem-stratum-${page.id}-${entry.stratum}`}
                        aria-pressed={entry.stratum === stratum.stratum}
                        title={entry.why}
                        onClick={() => setActiveStratum(entry.stratum)}
                    >
                        <span className="subsystem-stratum-n">{entry.stratum}</span> {entry.label}
                    </button>
                ))}
            </nav>
            <div className="subsystem-stratum-content" data-testid={`subsystem-stratum-content-${page.id}`}>
                {stratum.surfaceId === null ? (
                    <GroundPanel page={page} />
                ) : renderer ? (
                    renderer()
                ) : (
                    <div className="pane-message">
                        stratum surface {stratum.surfaceId} has no workspace renderer
                    </div>
                )}
            </div>
        </div>
    );
}
