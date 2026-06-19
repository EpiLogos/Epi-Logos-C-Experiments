import * as React from 'react';
import type {
    CoordinateContext,
    MObservabilityPublisher
} from '@pratibimba/m-extension-runtime';
import type { M0ContemplationProjection } from '../../common/m0-inspector';

const EXTENSION_ID = 'm0-anuttara';
const PRIVACY_CLASS = 'public_current_with_graph_provenance';

export interface M0ContemplationPromptFooterProps {
    readonly contemplation: M0ContemplationProjection;
    readonly context: CoordinateContext;
    readonly profileGeneration: number | null;
    readonly publisher: MObservabilityPublisher;
    readonly onResponseDraftChange?: (draft: string) => void;
}

export interface M0ContemplationSubmission {
    readonly archetypeIndex: number | null;
    readonly prompt: string | null;
    readonly draft: string;
    readonly context: CoordinateContext;
    readonly profileGeneration: number | null;
    readonly publisher: MObservabilityPublisher;
}

export function publishM0ContemplationReviewRequest(
    submission: M0ContemplationSubmission
): boolean {
    const responseText = submission.draft.trim();
    if (
        submission.archetypeIndex === null ||
        !submission.prompt ||
        !responseText
    ) {
        return false;
    }

    submission.publisher.publish({
        type: 'm0.review.requested',
        extensionId: EXTENSION_ID,
        emittedAt: Date.now(),
        payload: {
            archetypeIndex: submission.archetypeIndex,
            prompt: submission.prompt,
            responseText,
            coordinate: submission.context.selectedCoordinate,
            profileGeneration: submission.profileGeneration,
            privacyClass: PRIVACY_CLASS
        }
    });
    return true;
}

export const M0ContemplationPromptFooter: React.FC<M0ContemplationPromptFooterProps> = (
    props: M0ContemplationPromptFooterProps
) => {
    const { contemplation, context, profileGeneration, publisher, onResponseDraftChange } = props;
    const [draft, setDraft] = React.useState(contemplation.responseDraft);
    const pendingLabel = 'pending: Track 19.3 — CONTEMPLATION_PROMPT_LUT[12]';
    const promptLabel =
        contemplation.state === 'blocked'
            ? pendingLabel
            : contemplation.prompt ?? 'No contemplation prompt for the selected archetype';
    const canSubmit =
        contemplation.state !== 'blocked' &&
        contemplation.archetypeIndex !== null &&
        Boolean(contemplation.prompt) &&
        Boolean(draft.trim());

    React.useEffect(() => {
        setDraft(contemplation.responseDraft);
    }, [contemplation.archetypeIndex, contemplation.prompt, contemplation.responseDraft]);

    const updateDraft = (nextDraft: string) => {
        setDraft(nextDraft);
        onResponseDraftChange?.(nextDraft);
    };

    const submit = () => {
        const submitted = publishM0ContemplationReviewRequest({
            archetypeIndex: contemplation.archetypeIndex,
            prompt: contemplation.prompt,
            draft,
            context,
            profileGeneration,
            publisher
        });
        if (submitted) {
            updateDraft('');
        }
    };

    return (
        <footer
            className="m0-contemplation-prompt-footer"
            data-widget-id="pratibimba.m0-anuttara:contemplation-prompt-footer"
            data-archetype-index={contemplation.archetypeIndex ?? ''}
            data-provenance-state={contemplation.state}
        >
            <div
                className="m0-contemplation-prompt-line"
                data-test="m0-contemplation-prompt"
                title={promptLabel}
            >
                {promptLabel}
            </div>
            <div className="m0-contemplation-response-row">
                <textarea
                    aria-label="Contemplation response"
                    data-test="m0-contemplation-response"
                    value={draft}
                    disabled={contemplation.state === 'blocked'}
                    rows={2}
                    onChange={event => updateDraft(event.currentTarget.value)}
                    onKeyDown={event => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            submit();
                        }
                    }}
                />
                <button
                    type="button"
                    data-test="m0-contemplation-submit"
                    disabled={!canSubmit}
                    onClick={() => submit()}
                >
                    Submit
                </button>
            </div>
        </footer>
    );
};

export default M0ContemplationPromptFooter;
