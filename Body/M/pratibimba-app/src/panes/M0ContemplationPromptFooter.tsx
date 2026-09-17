/**
 * Coordinate: M' M0' (contemplation prompt footer, 21.T21.9)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): persistent footer beneath all six M0' layers.
 * Actualises: prompt response drafting and governed S5 review submission.
 * Public surface: M0ContemplationPromptFooter.
 * Does NOT own: prompt law, session-close evidence, or review persistence.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.9.
 */

import { useEffect, useMemo, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import { useCoordinateStore, useProvenanceStore, useTickStore } from '../state/stores';
import {
    contemplationFromProfile,
    submitM0ContemplationReview
} from './m0Contemplation';

function reviewItemId(artifact: unknown): string | null {
    if (!artifact || typeof artifact !== 'object') {
        return null;
    }
    const item = (artifact as { item?: unknown }).item;
    return item && typeof item === 'object' && typeof (item as { item_id?: unknown }).item_id === 'string'
        ? (item as { item_id: string }).item_id
        : null;
}

export function M0ContemplationPromptFooter() {
    const cached = useTickStore(state => state.profile);
    const generation = useTickStore(state => state.generation);
    const coordinate = useCoordinateStore(state => state.selected);
    const connected = useProvenanceStore(state => state.connection.connected);
    const liveContemplation = useMemo(() => contemplationFromProfile(cached), [cached]);
    const [contemplation, setContemplation] = useState(liveContemplation);
    const [draft, setDraft] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');
    const [detail, setDetail] = useState('');

    useEffect(() => {
        if (!draft) {
            setContemplation(liveContemplation);
        }
    }, [draft, liveContemplation]);
    const canSubmit =
        connected &&
        contemplation.state === 'canonical' &&
        contemplation.archetypeIndex !== null &&
        contemplation.prompt !== null &&
        draft.trim().length > 0 &&
        status !== 'submitting';

    const submit = async () => {
        if (
            !canSubmit ||
            contemplation.archetypeIndex === null ||
            contemplation.prompt === null
        ) {
            return;
        }
        setStatus('submitting');
        setDetail('');
        try {
            const receipt = await submitM0ContemplationReview(gateway(), {
                archetypeIndex: contemplation.archetypeIndex,
                prompt: contemplation.prompt,
                responseText: draft,
                coordinate,
                profileGeneration: generation
            });
            const itemId = reviewItemId(receipt.artifact);
            setDraft('');
            setContemplation(liveContemplation);
            setStatus('submitted');
            setDetail(itemId ? `Submitted for review: ${itemId}` : 'Submitted for review');
        } catch (error) {
            setStatus('error');
            setDetail(error instanceof Error ? error.message : String(error));
        }
    };

    const prompt =
        contemplation.state === 'blocked'
            ? 'Waiting for the compiled contemplation prompt bus'
            : contemplation.prompt ?? `No prompt is authored for archetype ${contemplation.archetypeIndex ?? '-'}`;

    return (
        <footer
            id="m0-contemplation-footer"
            className="m0-contemplation-footer"
            data-testid="m0-contemplation-footer"
            data-archetype-index={contemplation.archetypeIndex ?? undefined}
            data-provenance-state={contemplation.state}
        >
            <p className="m0-contemplation-prompt" data-testid="m0-contemplation-prompt">
                {prompt}
            </p>
            <div className="m0-contemplation-response-row">
                <textarea
                    aria-label="Contemplation response"
                    data-testid="m0-contemplation-response"
                    value={draft}
                    rows={2}
                    disabled={contemplation.state !== 'canonical' || status === 'submitting'}
                    onChange={event => {
                        setDraft(event.currentTarget.value);
                        if (status === 'submitted' || status === 'error') {
                            setStatus('idle');
                            setDetail('');
                        }
                    }}
                    onKeyDown={event => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            void submit();
                        }
                    }}
                />
                <button
                    type="button"
                    data-testid="m0-contemplation-submit"
                    disabled={!canSubmit}
                    onClick={() => void submit()}
                >
                    {status === 'submitting' ? 'Submitting' : 'Submit'}
                </button>
            </div>
            {detail ? (
                <p
                    className={status === 'error' ? 'm0-contemplation-status error' : 'm0-contemplation-status'}
                    data-testid="m0-contemplation-status"
                    role={status === 'error' ? 'alert' : 'status'}
                >
                    {detail}
                </p>
            ) : null}
        </footer>
    );
}
