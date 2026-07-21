/**
 * Coordinate: M' M5' (Pi axiom-translation inspector — 26.T26.14)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): the DR-B-2 axiom-translation read surface
 * Actualises: the four-column translation chain — Philosophical English →
 *   Formal Notation → OWL → SHACL — read verbatim from
 *   `s5'.epii.axiom_translation_history`. Each step's reasoning trace expands on
 *   click; the session verification badge reads green (human-final), amber (pi),
 *   or red (pending). Empty history is an honest empty state — this surface
 *   never fabricates a translation.
 * Public surface: PiAxiomTranslationInspector.
 * Does NOT own: the translation law or the producer (epi-cli gate::epii_axiom
 *   over the PI harness); it is a strict read consumer.
 * Contract: [[M5'-SPEC]] / [[S3-SPEC]].
 */

import { useEffect, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import { useProvenanceStore } from '../state/stores';
import type { AxiomForm } from './omni/evidenceShapes';
import {
    AXIOM_FORMS,
    AXIOM_TRANSLATION_HISTORY_METHOD,
    parseAxiomTranslationHistory,
    type PiAxiomTranslationSession
} from './axiomTranslation';

export interface PiAxiomTranslationInspectorProps {
    readonly readHistory?: () => Promise<readonly PiAxiomTranslationSession[]>;
}

const FORM_LABEL: Record<AxiomForm, string> = {
    'philosophical-english': 'Philosophical English',
    'formal-notation': 'Formal Notation',
    owl: 'OWL',
    shacl: 'SHACL'
};

const VERIFICATION_LABEL: Record<PiAxiomTranslationSession['verifiedBy'], string> = {
    human: 'human-verified',
    pi: 'pi-translated',
    pending: 'pending human verification'
};

/** The ordered {form, text} cells for a chain: the first step's input plus each
 *  step's output — the four forms in canonical order. */
function chainCells(session: PiAxiomTranslationSession): Array<{ form: AxiomForm; text: string }> {
    if (session.steps.length === 0) return [];
    const cells: Array<{ form: AxiomForm; text: string }> = [
        { form: session.steps[0].fromForm, text: session.steps[0].inputText }
    ];
    for (const step of session.steps) {
        cells.push({ form: step.toForm, text: step.outputText });
    }
    return cells;
}

export function PiAxiomTranslationInspector({ readHistory }: PiAxiomTranslationInspectorProps) {
    const connected = useProvenanceStore(s => s.connection.connected);
    const [sessions, setSessions] = useState<readonly PiAxiomTranslationSession[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());

    const invokeHistory = async (): Promise<readonly PiAxiomTranslationSession[]> => {
        if (readHistory) return readHistory();
        const response = await gateway().invoke(AXIOM_TRANSLATION_HISTORY_METHOD, {});
        return parseAxiomTranslationHistory(response.artifact);
    };

    useEffect(() => {
        if (!connected && !readHistory) return;
        let active = true;
        setError(null);
        void invokeHistory()
            .then(next => {
                if (active) setSessions(next);
            })
            .catch(cause => {
                if (active) setError(cause instanceof Error ? cause.message : String(cause));
            });
        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connected]);

    const toggle = (stepId: string) =>
        setExpanded(prev => {
            const next = new Set(prev);
            if (next.has(stepId)) {
                next.delete(stepId);
            } else {
                next.add(stepId);
            }
            return next;
        });

    return (
        <section
            className="axiom-translation-inspector"
            data-testid="pi-axiom-translation-inspector"
            data-view-id="m5.epii.axiomTranslation"
        >
            <header className="axiom-header">
                <strong>Pi axiom translation</strong>
                <span>Philosophical English → Formal → OWL → SHACL</span>
            </header>

            {error ? (
                <p className="axiom-error" data-testid="axiom-error" role="alert">
                    {error}
                </p>
            ) : sessions === null ? (
                <p data-testid="axiom-loading">{connected ? 'loading translation history' : 'gateway disconnected'}</p>
            ) : sessions.length === 0 ? (
                <p data-testid="axiom-empty">
                    No axiom translations yet — each session is produced by a Pi tool invocation.
                </p>
            ) : (
                <ol className="axiom-session-list" data-testid="axiom-session-list">
                    {sessions.map(session => {
                        const cells = chainCells(session);
                        return (
                            <li
                                key={session.id}
                                className="axiom-session"
                                data-testid="axiom-session"
                                data-session-id={session.id}
                                data-verified-by={session.verifiedBy}
                            >
                                <div className="axiom-session-header">
                                    <span className="axiom-session-id">{session.id}</span>
                                    <span
                                        className="axiom-verification-badge"
                                        data-testid="axiom-verification-badge"
                                        data-state={session.verifiedBy}
                                    >
                                        {VERIFICATION_LABEL[session.verifiedBy]}
                                    </span>
                                </div>
                                <ol className="axiom-chain" data-testid="axiom-chain">
                                    {cells.map((cell, index) => (
                                        <li
                                            key={`${session.id}-${cell.form}`}
                                            className="axiom-form-cell"
                                            data-testid={`axiom-form-${cell.form}`}
                                            data-form={cell.form}
                                        >
                                            <strong>{FORM_LABEL[cell.form]}</strong>
                                            {index < cells.length - 1 ? (
                                                <span className="axiom-arrow" aria-hidden="true">→</span>
                                            ) : null}
                                            <pre className="axiom-form-text">{cell.text}</pre>
                                        </li>
                                    ))}
                                </ol>
                                <ul className="axiom-reasoning-list">
                                    {session.steps.map((step, index) => (
                                        <li key={step.id}>
                                            <button
                                                type="button"
                                                data-testid={`axiom-step-toggle-${index}`}
                                                onClick={() => toggle(step.id)}
                                            >
                                                {FORM_LABEL[step.fromForm]} → {FORM_LABEL[step.toForm]}
                                                {step.verifiedBy ? ` · ${step.verifiedBy}` : ''}
                                            </button>
                                            {expanded.has(step.id) ? (
                                                <p data-testid={`axiom-reasoning-${index}`} className="axiom-reasoning">
                                                    {step.reasoningTrace || 'no reasoning trace recorded'}
                                                </p>
                                            ) : null}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        );
                    })}
                </ol>
            )}
        </section>
    );
}

/** Referenced so the canonical form order stays in lockstep with the contract. */
export const AXIOM_FORM_ORDER = AXIOM_FORMS;
