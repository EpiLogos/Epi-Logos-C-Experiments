import * as React from 'react';
import type {
    SpineReading789Model,
    WisdomDeltaViewModel,
    XorFoldByteStep
} from './wisdom-delta-service';

export function WisdomDeltaInspector({
    model
}: {
    readonly model: WisdomDeltaViewModel;
}): React.ReactElement {
    return (
        <section className="mext-widget-detail m5-wisdom-delta" data-test="m5-wisdom-delta-inspector">
            <h3>WisdomDeltaInspector</h3>
            <p className="m5-contemplation-narrative">{model.identityNarrative}</p>
            <JointCompositionPanel model={model} />
            <XorFoldAnimation model={model} />
            <SpineReading789 model={model.spineReading789} />
            <SymbolicCoordinateQuestionsPanel model={model} />
        </section>
    );
}

export function JointCompositionPanel({
    model
}: {
    readonly model: WisdomDeltaViewModel;
}): React.ReactElement {
    const ebm = model.trace.ebmEvaluation;
    const verifier = model.trace.verifierReport;
    return (
        <section className="m5-wisdom-pane" data-test="m5-joint-composition-panel">
            <h4>JointCompositionPanel</h4>
            <div className="m5-joint-composition-grid">
                <article data-actor={model.trace.llmComposition.actor}>
                    <a href="epi-logos://ide/m4-nara/llm-position-4">
                        {model.trace.llmComposition.actor}
                    </a>
                    <strong>M4&apos; recognition</strong>
                    <p>{model.trace.llmComposition.synthesizedRecognition}</p>
                    <small>{model.trace.llmComposition.reasoningText}</small>
                </article>
                <article data-actor={ebm.actor}>
                    <a href="epi-logos://ide/m5-epii/ebm-position-5">{ebm.actor}</a>
                    <strong>energy {ebm.energyScore.toFixed(4)}</strong>
                    <p>{Object.entries(ebm.lensWeightings).map(([lens, weight]) => `${lens}:${weight}`).join(' · ')}</p>
                    <small>tritone coherences {ebm.tritoneSquareCoherences.map(value => value.toFixed(3)).join(' / ')}</small>
                </article>
                <article data-actor={verifier.actor}>
                    <a href="epi-logos://ide/m0-anuttara/verifier-position-0">{verifier.actor}</a>
                    <strong>{verifier.axiomChecks.length} axiom checks</strong>
                    <p>{verifier.axiomChecks.map(check => `${check.id}:${check.status}`).join(' · ')}</p>
                    <small>{verifier.symbolicCoordinateQuestions.length} symbolic-coordinate questions</small>
                </article>
            </div>
        </section>
    );
}

export function XorFoldAnimation({
    model
}: {
    readonly model: WisdomDeltaViewModel;
}): React.ReactElement {
    return (
        <section className="m5-wisdom-pane" data-test="m5-xor-fold-animation">
            <h4>XorFoldAnimation</h4>
            <div className="m5-xor-fold">
                <HashColumn label="pre" bytes={model.preXorHex} />
                <div className="m5-xor-steps" aria-label="8-byte wisdom_delta XOR-fold steps">
                    {model.xorFold.steps.map(step => (
                        <XorFoldStepView key={step.byteIndex} step={step} />
                    ))}
                </div>
                <HashColumn label="post" bytes={model.postXorHex} />
            </div>
        </section>
    );
}

export function SpineReading789({
    model
}: {
    readonly model: SpineReading789Model;
}): React.ReactElement {
    return (
        <section className="m5-wisdom-pane" data-test="m5-spine-reading-789">
            <h4>SpineReading789</h4>
            <div className="m5-spine-789-columns">
                {model.columns.map(column => (
                    <article key={column.key} data-register-label={column.label}>
                        <strong>{column.label}</strong>
                        <span>{column.register}</span>
                        <small>virtue bits {column.virtueBits}</small>
                    </article>
                ))}
            </div>
            <VirtueLut9WitnessGrid model={model} />
        </section>
    );
}

export function VirtueLut9WitnessGrid({
    model
}: {
    readonly model: SpineReading789Model;
}): React.ReactElement {
    return (
        <div className="m5-virtue-lut9" data-test="m5-virtue-lut9-witness" aria-label="VIRTUE_LUT[9] witness vector">
            {model.virtueLabels.map((label, index) => {
                const witnessed = model.virtueWitnessBits[index] === true;
                return (
                    <span
                        key={label}
                        title={label}
                        data-virtue-index={index}
                        data-virtue-label={label}
                        data-witness-state={witnessed ? 'lit' : 'dark'}
                    >
                        {witnessed ? '1' : '0'}
                    </span>
                );
            })}
        </div>
    );
}

export function SymbolicCoordinateQuestionsPanel({
    model
}: {
    readonly model: WisdomDeltaViewModel;
}): React.ReactElement {
    return (
        <section className="m5-wisdom-pane" data-test="m5-symbolic-coordinate-questions-panel">
            <h4>SymbolicCoordinateQuestionsPanel</h4>
            {model.symbolicCoordinateQuestions.length === 0 ? (
                <p className="mext-widget-empty">No Verifier symbolic-coordinate questions.</p>
            ) : (
                <ol className="m5-symbolic-question-list">
                    {model.symbolicCoordinateQuestions.map(question => (
                        <li key={question.raw} data-question-status={question.status}>
                            <code>{question.raw}</code>
                            <span>{question.status}</span>
                            <a
                                href={question.inspectorHref}
                                data-skill-route={question.skillRoute}
                                data-test="m5-pi-axiom-translation-link"
                            >
                                PiAxiomTranslationInspector
                            </a>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}

function HashColumn({
    label,
    bytes
}: {
    readonly label: string;
    readonly bytes: readonly string[];
}): React.ReactElement {
    return (
        <div className="m5-hash-column" data-hash-column={label}>
            <strong>{label}</strong>
            {bytes.map((byte, index) => (
                <span key={`${label}-${index}`}>
                    {index}:{byte}
                </span>
            ))}
        </div>
    );
}

function XorFoldStepView({
    step
}: {
    readonly step: XorFoldByteStep;
}): React.ReactElement {
    return (
        <article
            className="m5-xor-step"
            data-byte-index={step.byteIndex}
            data-hash-index={step.hashIndex}
            data-profile-tick={step.profileTick}
        >
            <strong>
                delta[{step.byteIndex}] {step.wisdomDeltaHex} {'->'} hash[{step.hashIndex}]
            </strong>
            <span>{step.beforeHex} ^ {step.wisdomDeltaHex} = {step.afterHex}</span>
            <div className="m5-xor-bit-flips">
                {step.bitFlips.map(flip => (
                    <span
                        key={`${flip.byteIndex}-${flip.bitIndex}`}
                        data-bit-index={flip.bitIndex}
                        data-from={flip.from}
                        data-to={flip.to}
                        style={{ animationDelay: `${flip.profileTick * 90}ms` }}
                    >
                        b{flip.bitIndex}
                    </span>
                ))}
            </div>
        </article>
    );
}
