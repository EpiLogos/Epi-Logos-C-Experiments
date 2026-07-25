/**
 * Coordinate: M' M4' (transform-container carrier - 25.T25.11)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): protected-local lifecycle control surface
 * Actualises: mode selection, canonical stage display, advance, confirmed back.
 * Public surface: TransformContainersPane, M4TransformBadge.
 * Does NOT own: transition law, persistence, or gateway response authority.
 * Contract: [[M4'-SPEC]] / [[CHROME-CONTRACT]].
 */

import { privacyChrome } from '../ui/privacyChrome';
import { useState } from 'react';
import { gateway, gatewayReady } from '../bridge/gatewayHolder';
import {
    parseTransformReceipt,
    TRANSFORM_ADVANCE_METHOD,
    TRANSFORM_CONTAINER_OPTIONS,
    TRANSFORM_START_METHOD,
    type AlchemicalOperation,
    type TransformAdvanceRequest,
    type TransformContainerMode,
    type TransformLifecycleReceipt
} from './transformContainers';
import { InlineConfirm } from '../ui/InlineConfirm';

export interface TransformContainersPaneProps {
    readonly startTransform?: (container: TransformContainerMode) => Promise<TransformLifecycleReceipt>;
    readonly advanceTransform?: (request: TransformAdvanceRequest) => Promise<TransformLifecycleReceipt>;
}

export function M4TransformBadge({ operation }: { readonly operation: AlchemicalOperation }) {
    return (
        <span className="transform-op-badge" data-testid="m4-transform-badge">
            {operation}
        </span>
    );
}

export function TransformContainersPane({
    startTransform,
    advanceTransform
}: TransformContainersPaneProps) {
    const [selected, setSelected] = useState<TransformContainerMode>('bohm-dialogue');
    const [receipt, setReceipt] = useState<TransformLifecycleReceipt | null>(null);
    const [writing, setWriting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // 31.T31.8: the backstep question is asked INLINE (CCT-8), in this pane's
    // own controls — never in a blocking dialog that seizes the shell.
    const [backstepArmed, setBackstepArmed] = useState(false);
    const selectedOption =
        TRANSFORM_CONTAINER_OPTIONS.find(option => option.id === selected) ??
        TRANSFORM_CONTAINER_OPTIONS[0];

    const invokeStart = async (container: TransformContainerMode) => {
        if (startTransform) return startTransform(container);
        if (!gatewayReady()) throw new Error('Gateway disconnected. Transform was not started.');
        const response = await gateway().invoke(TRANSFORM_START_METHOD, { container });
        return parseTransformReceipt(response.artifact);
    };

    const invokeAdvance = async (request: TransformAdvanceRequest) => {
        if (advanceTransform) return advanceTransform(request);
        if (!gatewayReady()) throw new Error('Gateway disconnected. Transform did not move.');
        const response = await gateway().invoke(TRANSFORM_ADVANCE_METHOD, { ...request });
        return parseTransformReceipt(response.artifact);
    };

    const run = (operation: () => Promise<TransformLifecycleReceipt>) => {
        setWriting(true);
        setError(null);
        void operation()
            .then(setReceipt)
            .catch(cause => setError(cause instanceof Error ? cause.message : String(cause)))
            .finally(() => setWriting(false));
    };

    const start = () => run(() => invokeStart(selected));
    const move = (direction: 'advance' | 'regress') => {
        if (!receipt) return;
        run(() =>
            invokeAdvance({
                container: receipt.container,
                expectedStage: receipt.stage.id,
                direction,
                ...(direction === 'regress' ? { confirmedBackstep: true } : {})
            })
        );
    };

    return (
        <section
            className={`transform-pane ${privacyChrome('protected_local').className}`}
            title={privacyChrome('protected_local').title}
            data-testid="transform-containers-pane"
            data-view-id="m4.nara.transformContainers"
            data-privacy-class="protected-local"
        >
            <header className="transform-header">
                <div>
                    <strong>Transform containers</strong>
                    <span>Protected local</span>
                </div>
                {receipt ? <M4TransformBadge operation={receipt.stage.alchemicalOp} /> : null}
            </header>

            <div className="transform-mode-tabs" role="tablist" aria-label="Transform container">
                {TRANSFORM_CONTAINER_OPTIONS.map(option => (
                    <button
                        key={option.id}
                        type="button"
                        role="tab"
                        aria-selected={selected === option.id}
                        onClick={() => {
                            setSelected(option.id);
                            setReceipt(null);
                            setError(null);
                        }}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {!receipt ? (
                <div className="transform-empty">
                    <button type="button" onClick={start} disabled={writing}>
                        {writing ? 'Starting' : `Start ${selectedOption.label}`}
                    </button>
                </div>
            ) : (
                <>
                    <ol className="transform-stage-list">
                        {receipt.stages.map((item, index) => (
                            <li
                                key={item.id}
                                data-active={index === receipt.stageIndex}
                                aria-current={index === receipt.stageIndex ? 'step' : undefined}
                            >
                                <span>{index + 1}</span>
                                <div>
                                    <strong>{item.label}</strong>
                                    <p>{item.description}</p>
                                    <small>{item.l2PrimeRegister} / {item.alchemicalOp}</small>
                                </div>
                            </li>
                        ))}
                    </ol>
                    <footer className="transform-controls">
                        <button
                            type="button"
                            onClick={() => setBackstepArmed(true)}
                            aria-expanded={backstepArmed}
                            disabled={writing || receipt.stageIndex === 0}
                        >
                            Back
                        </button>
                        <span data-testid="transform-position">
                            {receipt.stageIndex + 1} / {receipt.stageCount}
                        </span>
                        <button
                            type="button"
                            onClick={() => move('advance')}
                            disabled={writing || receipt.stageIndex === receipt.stageCount - 1}
                        >
                            Advance
                        </button>
                    </footer>
                    {backstepArmed ? (
                        <InlineConfirm
                            testId="transform-backstep-confirm"
                            prompt="Return to the previous transform stage?"
                            confirmLabel="Go back"
                            onConfirm={() => {
                                setBackstepArmed(false);
                                move('regress');
                            }}
                            onCancel={() => setBackstepArmed(false)}
                        />
                    ) : null}
                </>
            )}

            {error ? <p className="transform-error" role="alert">{error}</p> : null}
        </section>
    );
}
