/**
 * Coordinate: M' M0' (symbolic-coordinate console, 21.T21.11)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): in-widget verifier question/response surface.
 * Actualises: raw verifier questions, protected-local responses, and receipts.
 * Public surface: M0SymbolicQuestionConsole.
 * Does NOT own: symbolic parsing, verifier law, or re-verification claims.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.11.
 */

import { useEffect, useMemo, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import { useProvenanceStore, useTickStore } from '../state/stores';
import {
    readM0SymbolicQuestions,
    submitM0SymbolicQuestionResponse
} from './m0SymbolicQuestions';
import type { M0SymbolicResponseReceipt } from './m0SymbolicQuestions';

export interface M0SymbolicQuestionConsoleProps {
    readonly selectedQuestion: string | null;
    readonly onSelectedQuestionChange: (question: string) => void;
}

type RowStatus = 'awaiting' | 'submitting' | 'responded' | 'reverified' | 'error';

export function M0SymbolicQuestionConsole({
    selectedQuestion,
    onSelectedQuestionChange
}: M0SymbolicQuestionConsoleProps) {
    const cached = useTickStore(state => state.profile);
    const generation = useTickStore(state => state.generation);
    const connected = useProvenanceStore(state => state.connection.connected);
    const read = useMemo(() => readM0SymbolicQuestions(cached), [cached]);
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [statuses, setStatuses] = useState<Record<string, RowStatus>>({});
    const [receipts, setReceipts] = useState<Record<string, M0SymbolicResponseReceipt>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const questions = read.state === 'ready' ? read.questions : [];
    const activeQuestion =
        selectedQuestion && questions.includes(selectedQuestion)
            ? selectedQuestion
            : questions[0] ?? null;

    useEffect(() => {
        if (activeQuestion && activeQuestion !== selectedQuestion) {
            onSelectedQuestionChange(activeQuestion);
        }
    }, [activeQuestion, onSelectedQuestionChange, selectedQuestion]);

    if (read.state !== 'ready') {
        return (
            <section
                className="m0-symbolic-console m0-symbolic-console-status"
                data-testid={`m0-symbolic-console-${read.state}`}
                data-generation={read.generation ?? 'none'}
            >
                {read.state === 'pending'
                    ? 'Verifier questions are not emitted on the current profile.'
                    : `Verifier question console blocked: ${read.reason}`}
            </section>
        );
    }

    if (!activeQuestion) {
        return (
            <section
                className="m0-symbolic-console m0-symbolic-console-status"
                data-testid="m0-symbolic-console-empty"
                data-generation={read.generation}
            >
                No verifier questions are open.
            </section>
        );
    }

    const draft = drafts[activeQuestion] ?? '';
    const status = statuses[activeQuestion] ?? 'awaiting';
    const receipt = receipts[activeQuestion];
    const canSubmit = connected && draft.trim().length > 0 && status !== 'submitting';

    const submit = async () => {
        if (!canSubmit) {
            return;
        }
        setStatuses(current => ({ ...current, [activeQuestion]: 'submitting' }));
        setErrors(current => ({ ...current, [activeQuestion]: '' }));
        try {
            const next = await submitM0SymbolicQuestionResponse(gateway(), {
                coordinateString: activeQuestion,
                responseText: draft,
                profileGeneration: generation
            });
            setReceipts(current => ({ ...current, [activeQuestion]: next }));
            setStatuses(current => ({
                ...current,
                [activeQuestion]: next.reverified ? 'reverified' : 'responded'
            }));
            setDrafts(current => ({ ...current, [activeQuestion]: '' }));
        } catch (error) {
            setStatuses(current => ({ ...current, [activeQuestion]: 'error' }));
            setErrors(current => ({
                ...current,
                [activeQuestion]: error instanceof Error ? error.message : String(error)
            }));
        }
    };

    return (
        <section
            className="m0-symbolic-console"
            data-testid="m0-symbolic-console"
            data-generation={read.generation}
        >
            <header className="m0-symbolic-console-header">
                <h3>Symbolic questions</h3>
                <span data-testid="m0-symbolic-question-count">{questions.length}</span>
            </header>
            <div className="m0-symbolic-console-body">
                <ol className="m0-symbolic-question-list">
                    {questions.map(question => (
                        <li key={question}>
                            <button
                                type="button"
                                aria-pressed={question === activeQuestion}
                                data-testid="m0-symbolic-question"
                                data-response-status={statuses[question] ?? 'awaiting'}
                                onClick={() => onSelectedQuestionChange(question)}
                            >
                                <code>{question}</code>
                                <span>{statuses[question] ?? 'awaiting'}</span>
                            </button>
                        </li>
                    ))}
                </ol>
                <div className="m0-symbolic-response">
                    <code data-testid="m0-symbolic-active-question">{activeQuestion}</code>
                    {receipt ? (
                        <p data-testid="m0-symbolic-parse-summary">
                            {receipt.parse.namespace} · {receipt.parse.coordinate.join(' / ')}
                            {receipt.parse.archetypeIndex === null
                                ? ''
                                : ` · T${receipt.parse.archetypeIndex}`}
                            {' · '}
                            {receipt.parse.stateMarker}
                        </p>
                    ) : null}
                    <textarea
                        aria-label="Symbolic question response"
                        data-testid="m0-symbolic-response"
                        rows={3}
                        value={draft}
                        disabled={status === 'submitting'}
                        onChange={event => {
                            const value = event.currentTarget.value;
                            setDrafts(current => ({ ...current, [activeQuestion]: value }));
                            if (status === 'error') {
                                setStatuses(current => ({
                                    ...current,
                                    [activeQuestion]: 'awaiting'
                                }));
                            }
                        }}
                    />
                    <div className="m0-symbolic-response-actions">
                        <button
                            type="button"
                            data-testid="m0-symbolic-submit"
                            disabled={!canSubmit}
                            onClick={() => void submit()}
                        >
                            {status === 'submitting' ? 'Submitting' : 'Respond'}
                        </button>
                        <span
                            data-testid="m0-symbolic-status"
                            data-status={status}
                            role={status === 'error' ? 'alert' : 'status'}
                        >
                            {status === 'responded' && receipt
                                ? `responded · ${receipt.responseId}`
                                : status === 'reverified' && receipt
                                  ? `reverified · ${receipt.responseId}`
                                  : errors[activeQuestion] || status}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
