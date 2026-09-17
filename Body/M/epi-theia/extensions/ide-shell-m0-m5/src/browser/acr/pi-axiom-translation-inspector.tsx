import * as React from 'react';
import {
    ANUTTARA_SYMBOLIC_PARSE_SOURCE_SKILL_PATH,
    PI_AXIOM_TRANSLATION_SOURCE_COORDINATE,
    type AxiomTranslationStep,
    type PiAxiomTranslationSession,
    type PiAxiomTranslationViewModel
} from '../services/pi-axiom-translation-service';

export interface PiAxiomTranslationInspectorProps {
    readonly model: PiAxiomTranslationViewModel;
    readonly expandedStepId?: string | null;
    readonly onToggleStep?: (stepId: string) => void;
    readonly onOpenSource?: (coordinate: string, sourceAnchor: string) => void;
}

export function PiAxiomTranslationInspector({
    model,
    expandedStepId = null,
    onToggleStep,
    onOpenSource
}: PiAxiomTranslationInspectorProps): React.ReactElement {
    const selected = model.sessions.find(s => s.id === model.selectedSessionId) ?? model.sessions[0] ?? null;
    return (
        <section className="ide-shell-widget-detail ide-shell-pi-axiom-inspector" data-test="pi-axiom-translation-inspector">
            <header className="ide-shell-subpane-header">
                <h4>PiAxiomTranslationInspector</h4>
                {selected !== null && <VerificationBadge verifiedBy={selected.verifiedBy} />}
            </header>
            <p className="ide-shell-identity-narrative">{model.identityNarrative}</p>
            {model.sessions.length > 1 && (
                <div className="ide-shell-pi-axiom-session-badges" data-test="pi-axiom-session-badges">
                    {model.sessions.map(session => (
                        <span key={session.id} data-session-id={session.id}>
                            <VerificationBadge verifiedBy={session.verifiedBy} />
                        </span>
                    ))}
                </div>
            )}
            {selected === null ? (
                <p className="ide-shell-widget-empty" data-test="pi-axiom-empty">
                    No axiom translation sessions surfaced from s5&apos;.epii.axiom_translation_history.
                </p>
            ) : (
                <SessionView
                    session={selected}
                    expandedStepId={expandedStepId}
                    onToggleStep={onToggleStep}
                    onOpenSource={onOpenSource}
                />
            )}
        </section>
    );
}

function SessionView({
    session,
    expandedStepId,
    onToggleStep,
    onOpenSource
}: {
    readonly session: PiAxiomTranslationSession;
    readonly expandedStepId: string | null;
    readonly onToggleStep?: (stepId: string) => void;
    readonly onOpenSource?: (coordinate: string, sourceAnchor: string) => void;
}): React.ReactElement {
    return (
        <div data-test={`pi-axiom-session-${session.id}`} data-dispatch-node={session.initiatingDispatchNodeId}>
            <dl className="ide-shell-pi-axiom-session-meta">
                <dt>Session</dt>
                <dd>{session.id}</dd>
                <dt>Dispatch node</dt>
                <dd>{session.initiatingDispatchNodeId}</dd>
            </dl>
            <div className="ide-shell-pi-axiom-headings" data-test="pi-axiom-four-column-headings">
                <strong>Philosophical English</strong>
                <strong>Formal Notation</strong>
                <strong>OWL</strong>
                <strong>SHACL</strong>
            </div>
            <ol className="ide-shell-pi-axiom-steps">
                {session.steps.map(step => (
                    <li key={step.id} data-test={`pi-axiom-step-${step.id}`}>
                        <button
                            type="button"
                            className="ide-shell-pi-axiom-step-button"
                            data-test={`pi-axiom-step-toggle-${step.id}`}
                            onClick={() => onToggleStep?.(step.id)}
                        >
                            <TranslationChain step={step} />
                        </button>
                        {expandedStepId === step.id && (
                            <div className="ide-shell-pi-axiom-reasoning" data-test="pi-axiom-reasoning-trace">
                                <strong>Reasoning trace</strong>
                                <p>{step.transitionReasoning}</p>
                                <button
                                    type="button"
                                    data-command="backend-studio.openSource"
                                    data-coordinate={PI_AXIOM_TRANSLATION_SOURCE_COORDINATE}
                                    data-source-skill-path={step.sourceSkillPath}
                                    data-source-anchor={step.sourceAnchor}
                                    onClick={() => onOpenSource?.(
                                        PI_AXIOM_TRANSLATION_SOURCE_COORDINATE,
                                        step.sourceSkillPath || ANUTTARA_SYMBOLIC_PARSE_SOURCE_SKILL_PATH
                                    )}
                                >
                                    Open source skill
                                </button>
                            </div>
                        )}
                    </li>
                ))}
            </ol>
        </div>
    );
}

function TranslationChain({ step }: { readonly step: AxiomTranslationStep }): React.ReactElement {
    const cells = [
        step.philosophicalEnglish,
        step.formalNotation,
        step.owl,
        step.shacl
    ];
    return (
        <span className="ide-shell-pi-axiom-chain">
            {cells.map((cell, index) => (
                <React.Fragment key={index}>
                    <span className="ide-shell-pi-axiom-cell">{cell}</span>
                    {index < cells.length - 1 && (
                        <span className="ide-shell-pi-axiom-arrow" data-test="pi-axiom-transition-arrow">
                            →
                        </span>
                    )}
                </React.Fragment>
            ))}
        </span>
    );
}

function VerificationBadge({
    verifiedBy
}: {
    readonly verifiedBy: PiAxiomTranslationSession['verifiedBy'];
}): React.ReactElement {
    const label = verifiedBy === 'human'
        ? 'human verified'
        : verifiedBy === 'pi'
            ? 'pi checked'
            : 'pending verification';
    return (
        <span
            className={`ide-shell-verification-badge ide-shell-verification-${verifiedBy}`}
            data-verification={verifiedBy}
        >
            {label}
        </span>
    );
}
