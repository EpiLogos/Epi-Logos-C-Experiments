// 07.T7.2 — Third Spanda Equation composition overlay.
//
// Renders the 137 = 64 + 72 + 1 matheme spine as a labelled overlay on the
// cosmic-engine composition. Every string here is an OVERLAY of the
// symbolic skeleton declared in ../common/third-spanda-composition.ts — this
// component computes nothing. The `parentAttribution` (`M1-5`) is bound from
// the model, never hard-coded as `M0-Anuttara-witness`.

import * as React from 'react';
import {
    THIRD_SPANDA_COMPOSITION,
    ThirdSpandaCompositionModel
} from '../common/third-spanda-composition';

export interface ThirdSpandaCompositionOverlayProps {
    /** Defaults to the canonical frozen model; injectable for tests. */
    readonly model?: ThirdSpandaCompositionModel;
}

/**
 * The composition overlay. Three slots (64-side, +1 parent, 72-side) carry the
 * translation-rule bridge between them, with the five canonical forms, the
 * 7-8-9 spine, the Mersenne grounding, and the physics reference faces shown as
 * labelled registers beneath.
 */
export const ThirdSpandaCompositionOverlay: React.FC<ThirdSpandaCompositionOverlayProps> = ({
    model = THIRD_SPANDA_COMPOSITION
}) => {
    return (
        <section className="third-spanda-overlay" data-test="third-spanda-overlay">
            <header className="third-spanda-header">
                <h3 className="third-spanda-title">{model.title}</h3>
                <span className="third-spanda-spine" data-test="third-spanda-spine">
                    {model.spine}
                </span>
                <span
                    className="third-spanda-parent"
                    data-test="parent-attribution"
                    data-parent-attribution={model.parentAttribution}
                >
                    +1 parent: {model.parentAttribution}
                </span>
            </header>

            {/* The composition slots, with the M1 parent unit sitting literally
                between the 64-side and the 72-side via the translation bridge. */}
            <div className="third-spanda-slots">
                {model.slots.map(slot => (
                    <div
                        key={slot.side}
                        className={`third-spanda-slot third-spanda-slot-${slot.side}`}
                        data-register={slot.register}
                    >
                        <span className="third-spanda-slot-value">{slot.value}</span>
                        <span className="third-spanda-slot-label">{slot.label}</span>
                    </div>
                ))}
            </div>
            <p className="third-spanda-bridge" data-test="translation-rule" data-register={model.translationRule.register}>
                <strong>{model.translationRule.rule}</strong> — {model.translationRule.parentUnit}{' '}
                ({model.translationRule.leftSide} ↔ {model.translationRule.rightSide})
            </p>

            <dl className="third-spanda-forms" data-test="canonical-forms">
                {model.canonicalForms.map(form => (
                    <React.Fragment key={form.form}>
                        <dt data-register={form.register}>
                            <code>{form.form}</code>
                        </dt>
                        <dd>
                            <span className="third-spanda-form-name">{form.name}</span> — {form.gloss}
                        </dd>
                    </React.Fragment>
                ))}
            </dl>

            {/* 7-8-9 Spanda-crown spine triad. */}
            <ul className="third-spanda-789" data-test="spine-789">
                {model.spine789.map(node => (
                    <li key={node.numeral} data-register={node.register}>
                        <strong>{node.numeral}</strong> = {node.role}: {node.gloss}
                    </li>
                ))}
            </ul>

            {/* Mersenne grounding of the archetype-7 generator. */}
            <p className="third-spanda-mersenne" data-test="mersenne" data-register={model.mersenne.register}>
                {model.mersenne.mersennePrime} (prime-index {model.mersenne.primeIndex}) —{' '}
                {model.mersenne.annotation}
            </p>

            {/* Physics lanes — labelled measurement / reference faces only. */}
            <ul className="third-spanda-physics" data-test="physics-faces">
                {model.physicsFaces.map(face => (
                    <li key={face.lane} data-register={face.register}>
                        <code>{face.lane}</code> <em>[{face.register}]</em> — {face.note}
                    </li>
                ))}
            </ul>

            <footer className="third-spanda-footer">
                <span className="third-spanda-crosslinks" data-test="cross-links">
                    {model.crossLinks.join(' / ')}
                </span>
                <p className="third-spanda-discipline">{model.registerDiscipline}</p>
            </footer>
        </section>
    );
};
