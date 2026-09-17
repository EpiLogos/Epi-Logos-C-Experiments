import * as React from 'react';
import type { Run, RuntimeControlAction } from './types';

export interface AbortRetryContinueControlsProps {
    readonly run: Run | null;
    readonly disabled: boolean;
    readonly onControl?: (action: RuntimeControlAction, run: Run) => void;
}

const ACTIONS: readonly RuntimeControlAction[] = ['abort', 'retry', 'continue'];

export function AbortRetryContinueControls({
    run,
    disabled,
    onControl
}: AbortRetryContinueControlsProps): React.ReactElement {
    const blocked = disabled || run === null;
    return (
        <div
            data-test="acr-abort-retry-continue-controls"
            data-gateway-method="s5'.epii.runtime_control"
            data-human-required={run?.humanRequired ? 'true' : 'false'}
        >
            {ACTIONS.map(action => (
                <button
                    key={action}
                    type="button"
                    disabled={blocked}
                    data-test={`acr-runtime-control-${action}`}
                    data-runtime-control-action={action}
                    onClick={() => run && onControl?.(action, run)}
                >
                    {action}
                </button>
            ))}
            {disabled && (
                <p className="ide-shell-human-required" data-test="acr-runtime-control-human-required">
                    Runtime controls are disabled while human-required review is active.
                </p>
            )}
        </div>
    );
}
