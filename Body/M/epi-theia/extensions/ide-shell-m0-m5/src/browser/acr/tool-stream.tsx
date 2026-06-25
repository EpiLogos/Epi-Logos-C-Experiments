import * as React from 'react';
import type { ToolInvocationRef } from './types';
import { PsycheFacetBadge } from './psyche-facets';

export interface ToolStreamProps {
    readonly tools: readonly ToolInvocationRef[];
}

export function ToolStream({ tools }: ToolStreamProps): React.ReactElement {
    if (tools.length === 0) {
        return (
            <p className="ide-shell-widget-empty" data-test="acr-tool-stream-empty">
                No tool invocations have been emitted for this run.
            </p>
        );
    }
    const ordered = [...tools].sort((left, right) => left.invokedAt - right.invokedAt);
    return (
        <ol data-test="acr-tool-stream">
            {ordered.map(tool => (
                <li
                    key={tool.id}
                    data-test={`acr-tool-invocation-${tool.id}`}
                    data-tool={tool.toolName}
                    data-dispatch-node-id={tool.dispatchNodeId ?? ''}
                >
                    <strong>{tool.toolName}</strong>
                    <span> @ {new Date(tool.invokedAt).toISOString()}</span>
                    {tool.actor && <span> — {tool.actor}</span>}
                    {tool.psycheFacet && (
                        <PsycheFacetBadge
                            facet={tool.psycheFacet}
                            testId={`acr-tool-psyche-facet-${tool.id}`}
                        />
                    )}
                    <dl>
                        {tool.inputDigest && (
                            <>
                                <dt>Input digest</dt>
                                <dd>{tool.inputDigest}</dd>
                            </>
                        )}
                        {tool.outputDigest && (
                            <>
                                <dt>Output digest</dt>
                                <dd>{tool.outputDigest}</dd>
                            </>
                        )}
                        {tool.errorMessage && (
                            <>
                                <dt>Error</dt>
                                <dd className="ide-shell-error">{tool.errorMessage}</dd>
                            </>
                        )}
                    </dl>
                </li>
            ))}
        </ol>
    );
}
