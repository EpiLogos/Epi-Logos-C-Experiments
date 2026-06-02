import * as React from 'react';
import { IntegratedEmptyStateView } from '../common/empty-state';

/**
 * Shared visual shell for the integrated empty state. Both plugin packages
 * render this when the composition cannot proceed — it lists every blocking
 * contributor with owner track + blocker id, never inventing demo data.
 */
export interface IntegratedEmptyStateProps {
    readonly view: IntegratedEmptyStateView;
    readonly title: string;
}

export const IntegratedEmptyState: React.FC<IntegratedEmptyStateProps> = ({ view, title }) => {
    return (
        <section className="integrated-empty-state" data-plugin={view.pluginId}>
            <header>
                <h2 className="integrated-empty-state-title">{title}</h2>
                <span className={`integrated-empty-state-overall integrated-overall-${view.overall}`}>
                    {view.overall}
                </span>
            </header>
            <p className="integrated-empty-state-summary">
                The {view.layoutId} layout cannot mount because upstream contributions are not
                ready. This view shows the real blockers — no demo content is fabricated.
            </p>
            {view.missingContributors.length > 0 && (
                <section className="integrated-empty-state-missing">
                    <h3>Missing contributors</h3>
                    <ul>
                        {view.missingContributors.map(id => (
                            <li key={id}>{id}</li>
                        ))}
                    </ul>
                </section>
            )}
            {view.reasons.length > 0 && (
                <section className="integrated-empty-state-reasons">
                    <h3>Blocking reasons</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Contributor</th>
                                <th>State</th>
                                <th>Owner track</th>
                                <th>Reason</th>
                            </tr>
                        </thead>
                        <tbody>
                            {view.reasons.map(reason => (
                                <tr key={`${reason.contributorId}:${reason.blockerId}`}>
                                    <td>{reason.contributorId}</td>
                                    <td>{reason.readinessState}</td>
                                    <td>{reason.ownerTrack}</td>
                                    <td>{reason.humanReason}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}
        </section>
    );
};
