/**
 * Coordinate: M' `/` membrane (Aletheia crystallisation group — Track 27.T27.3 / DR-M5-1)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Actualises: when Anima dispatches a fan-out in crystallisation-mode, the
 *   subagent sub-traces are wrapped in a labelled group "Aletheia
 *   crystallisation — {intent}" carrying badges for the subagents ACTUALLY
 *   dispatched. Per DR-B-3 the subagents stay NESTED under Anima (this is a
 *   visual grouping of Anima's children, never a promotion to peer top-level
 *   nodes).
 * Public surface: AletheiaCrystallisationGroup.
 * Does NOT own: dispatch structure (dispatchGenealogy.ts), the subagent nodes
 *   (rendered as children and passed in).
 */

import type { ReactNode } from 'react';
import type { AletheiaSubagentId } from './evidenceShapes';

export function AletheiaCrystallisationGroup({
    intent,
    subagents,
    children
}: {
    readonly intent?: string;
    readonly subagents: readonly AletheiaSubagentId[];
    readonly children: ReactNode;
}) {
    return (
        <li className="aletheia-crystallisation-group" data-testid="aletheia-crystallisation-group">
            <div className="crystallisation-label">
                <strong>Aletheia crystallisation</strong>
                {intent && <span className="crystallisation-intent">— {intent}</span>}
                <span className="crystallisation-badges" role="list" aria-label="dispatched subagents">
                    {subagents.map(subagent => (
                        <span
                            key={subagent}
                            role="listitem"
                            className={`aletheia-subagent-badge subagent-${subagent}`}
                            data-testid={`subagent-badge-${subagent}`}
                        >
                            {subagent}
                        </span>
                    ))}
                </span>
            </div>
            <ul className="crystallisation-children">{children}</ul>
        </li>
    );
}
