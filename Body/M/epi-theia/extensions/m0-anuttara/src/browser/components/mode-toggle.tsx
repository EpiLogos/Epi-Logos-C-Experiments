import * as React from 'react';
import type { M0GatewayAction, M0SurfaceMode } from '../../common/m0-inspector';

export type M0AuthoringContributionId = 'canonStudio' | 'logosAtelier';

export interface M0ModeToggleCommandRegistry {
    executeCommand(commandId: string, payload: unknown): unknown;
}

export interface M0ModeToggleProps {
    readonly mode: M0SurfaceMode;
    readonly coordinate: string | null;
    readonly actions: readonly M0GatewayAction[];
    readonly commands: M0ModeToggleCommandRegistry;
    readonly onModeChange: (mode: M0SurfaceMode) => void;
}

export function buildM0AuthoringIntent(
    requestedContributionId: M0AuthoringContributionId,
    coordinate: string | null
): Readonly<{
    readonly requestedExtensionId: 'ide-shell-m0-m5';
    readonly requestedContributionId: M0AuthoringContributionId;
    readonly coordinate: string | null;
    readonly source: 'm0-anuttara';
}> {
    return Object.freeze({
        requestedExtensionId: 'ide-shell-m0-m5',
        requestedContributionId,
        coordinate,
        source: 'm0-anuttara'
    });
}

export function M0ModeToggle(props: M0ModeToggleProps): React.ReactElement {
    const { mode, coordinate, actions, commands, onModeChange } = props;
    const visibleActions =
        mode === 'reading'
            ? actions.filter(action => action.id === 'deposit-graph-readiness-evidence')
            : actions;
    const nextMode: M0SurfaceMode = mode === 'reading' ? 'authoring' : 'reading';

    const runAction = React.useCallback(
        (action: M0GatewayAction) => {
            void commands.executeCommand(action.method, action.params);
        },
        [commands]
    );
    const openContribution = React.useCallback(
        (contributionId: M0AuthoringContributionId) => {
            void commands.executeCommand(
                'omnipanel.intent.dispatch',
                buildM0AuthoringIntent(contributionId, coordinate)
            );
        },
        [commands, coordinate]
    );

    return (
        <section className="mext-widget-detail m0-mode-toggle" data-surface-mode={mode}>
            <h3>M5 action hooks</h3>
            {mode === 'authoring' ? (
                <p className="mext-widget-empty" data-provenance-state="derived">
                    Per DR-M0-1: M0' never mutates canon. Routed-write via M5 atelier
                    governance.
                </p>
            ) : null}
            <div className="m0-mode-toggle-controls">
                <button type="button" onClick={() => onModeChange(nextMode)}>
                    {mode === 'reading' ? 'Switch to Authoring' : 'Switch to Reading'}
                </button>
            </div>
            <ul>
                {visibleActions.map(action => (
                    <li key={action.id}>
                        <button
                            type="button"
                            data-action-id={action.id}
                            data-method={action.method}
                            data-mutates-graph-canon={action.mutatesGraphCanon}
                            onClick={() => runAction(action)}
                        >
                            {action.label}
                        </button>
                        <code>{action.method}</code>
                    </li>
                ))}
            </ul>
            {mode === 'authoring' ? (
                <div className="m0-mode-toggle-deep-links">
                    <button
                        type="button"
                        data-contribution-id="canonStudio"
                        onClick={() => openContribution('canonStudio')}
                    >
                        Open in Canon Studio
                    </button>
                    <button
                        type="button"
                        data-contribution-id="logosAtelier"
                        onClick={() => openContribution('logosAtelier')}
                    >
                        Open in Logos Atelier
                    </button>
                </div>
            ) : null}
        </section>
    );
}

export default M0ModeToggle;
