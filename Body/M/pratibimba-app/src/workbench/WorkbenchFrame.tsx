/**
 * Coordinate: M' workbench shell
 * Residency: Body/M/pratibimba-app/src/workbench
 * Position (#n): #5 - stable seven-region workbench frame
 * Actualises: title/workspace bar, activity rail, contextual host, editor and
 *   instrument groups, adjacent agent host, operational panel, and status bar
 *   around the existing FlexLayout carrier.
 * Public surface: WorkbenchFrame.
 * Does NOT own: workspace routing, activity command execution, pane bodies,
 *   gateway events, readiness reports, or runtime provenance.
 */

import { useState, type ReactNode } from 'react';

import { useEventsStore } from '../state/eventsStore';
import { useReadinessStore } from '../state/readinessStore';
import { useCoordinateStore, useProvenanceStore, useSessionStore, useTickStore } from '../state/stores';
import { iconMaskStyle } from '../ui/iconography';
import { readinessSeverity } from '../ui/bridgeReadiness';
import {
    WORKBENCH_ACTIVITIES,
    WORKBENCH_WORKSPACES,
    type WorkbenchActivityId,
    type WorkbenchWorkspaceId
} from './workbenchModel';

type OperationalTab = 'output' | 'problems' | 'evidence' | 'diagnostics';

interface WorkbenchFrameProps {
    readonly workspace: WorkbenchWorkspaceId;
    readonly activeActivity: WorkbenchActivityId;
    readonly onWorkspaceChange: (workspace: WorkbenchWorkspaceId) => void;
    readonly onActivityChange: (activity: WorkbenchActivityId) => void;
    readonly status: ReactNode;
    readonly children: ReactNode;
}

const OPERATIONAL_TABS: readonly { readonly id: OperationalTab; readonly label: string }[] = [
    { id: 'output', label: 'Output' },
    { id: 'problems', label: 'Problems' },
    { id: 'evidence', label: 'Evidence' },
    { id: 'diagnostics', label: 'Diagnostics' }
];

function OperationalPanelContent({ tab }: { readonly tab: OperationalTab }) {
    const events = useEventsStore(state => state.events);
    const bindings = useReadinessStore(state => state.bindings);
    const coordinate = useCoordinateStore(state => state.selected);
    const sessionKey = useSessionStore(state => state.sessionKey);
    const generation = useTickStore(state => state.generation);
    const connection = useProvenanceStore(state => state.connection);
    const supervisor = useProvenanceStore(state => state.supervisor);

    if (tab === 'output') {
        const recent = events.slice(-8).reverse();
        return recent.length > 0 ? (
            <ol className="workbench-operation-list" aria-label="Recent runtime events">
                {recent.map(event => (
                    <li key={event.seq}>
                        <time dateTime={new Date(event.emittedAtMs).toISOString()}>
                            {new Date(event.emittedAtMs).toLocaleTimeString()}
                        </time>
                        <span>{event.channel ?? event.kind}</span>
                    </li>
                ))}
            </ol>
        ) : (
            <p className="workbench-operation-empty">No runtime events in this session.</p>
        );
    }

    if (tab === 'problems') {
        const problems = Object.entries(bindings).filter(([, binding]) => readinessSeverity(binding.state) !== 'ok');
        return problems.length > 0 ? (
            <ol className="workbench-operation-list" aria-label="Reported readiness problems">
                {problems.map(([bindingKey, binding]) => (
                    <li key={bindingKey} data-severity={readinessSeverity(binding.state)}>
                        <span>{bindingKey}</span>
                        <span>{binding.reason ?? binding.state.replaceAll('_', ' ')}</span>
                    </li>
                ))}
            </ol>
        ) : (
            <p className="workbench-operation-empty">No reported readiness problems.</p>
        );
    }

    if (tab === 'evidence') {
        return (
            <dl className="workbench-operation-facts">
                <div><dt>Session</dt><dd>{sessionKey ?? 'not bound'}</dd></div>
                <div><dt>Coordinate</dt><dd>{coordinate ?? 'not selected'}</dd></div>
                <div><dt>Profile generation</dt><dd>{generation ?? 'awaiting profile'}</dd></div>
            </dl>
        );
    }

    return (
        <dl className="workbench-operation-facts">
            <div><dt>Gateway</dt><dd>{connection.connected ? 'connected' : connection.state}</dd></div>
            <div><dt>Supervisor</dt><dd>{supervisor.state}</dd></div>
            <div><dt>Runtime</dt><dd>{supervisor.binarySource ?? 'unresolved'}</dd></div>
            <div><dt>Binary</dt><dd title={supervisor.binaryPath ?? undefined}>{supervisor.binaryPath ?? 'unresolved'}</dd></div>
        </dl>
    );
}

export function WorkbenchFrame({
    workspace,
    activeActivity,
    onWorkspaceChange,
    onActivityChange,
    status,
    children
}: WorkbenchFrameProps) {
    const [operationalTab, setOperationalTab] = useState<OperationalTab>('output');
    const [operationalPanelOpen, setOperationalPanelOpen] = useState(false);

    return (
        <div
            className="workbench-frame"
            data-workbench-workspace={workspace}
            data-workbench-activity={activeActivity}
        >
            <header className="workbench-titlebar" role="banner" aria-label="Workbench">
                <strong className="workbench-product">Pratibimba</strong>
                <span className="workbench-title-divider" aria-hidden="true" />
                <label className="workbench-workspace-picker">
                    <span>Workspace</span>
                    <select
                        aria-label="Workspace"
                        value={workspace}
                        onChange={event => onWorkspaceChange(event.target.value as WorkbenchWorkspaceId)}
                    >
                        {WORKBENCH_WORKSPACES.map(candidate => (
                            <option key={candidate.id} value={candidate.id}>{candidate.label}</option>
                        ))}
                    </select>
                </label>
            </header>

            <nav className="workbench-activity-rail" aria-label="Workbench activities">
                {WORKBENCH_ACTIVITIES.map(activity => (
                    <button
                        key={activity.id}
                        type="button"
                        className={activity.id === activeActivity ? 'workbench-activity is-active' : 'workbench-activity'}
                        aria-label={activity.label}
                        aria-current={activity.id === activeActivity ? 'page' : undefined}
                        title={activity.label}
                        onClick={() => onActivityChange(activity.id)}
                    >
                        <span className="workbench-activity-icon" style={iconMaskStyle(activity.icon, 24)} aria-hidden="true" />
                    </button>
                ))}
            </nav>

            <main className="workbench-editor-host" aria-label="Editor and instrument groups">
                {children}
            </main>

            <section
                className={operationalPanelOpen ? 'workbench-operational-panel is-open' : 'workbench-operational-panel'}
                aria-label="Operational panel"
            >
                <div className="workbench-operational-tabs" role="tablist" aria-label="Operational views">
                    {OPERATIONAL_TABS.map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            aria-selected={operationalPanelOpen && operationalTab === tab.id}
                            className={operationalPanelOpen && operationalTab === tab.id ? 'is-active' : undefined}
                            onClick={() => {
                                setOperationalTab(tab.id);
                                setOperationalPanelOpen(true);
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                    <button
                        type="button"
                        className="workbench-operational-collapse"
                        aria-label={operationalPanelOpen ? 'Collapse operational panel' : 'Expand operational panel'}
                        aria-expanded={operationalPanelOpen}
                        onClick={() => setOperationalPanelOpen(open => !open)}
                    >
                        {operationalPanelOpen ? '\u2304' : '\u2303'}
                    </button>
                </div>
                {operationalPanelOpen ? (
                    <div className="workbench-operational-content" role="tabpanel">
                        <OperationalPanelContent tab={operationalTab} />
                    </div>
                ) : null}
            </section>

            <div className="workbench-status-host">{status}</div>
        </div>
    );
}
