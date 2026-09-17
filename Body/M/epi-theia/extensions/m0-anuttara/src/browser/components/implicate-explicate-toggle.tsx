import * as React from 'react';
import type { M0Phase, M0ProvenancedField } from '../../common/m0-inspector';

/**
 * 21.7 — Implicate / Explicate toggle (no-orphan-fill; resolves O-WC-M0-1, source
 * row WC-M0-08). A two-state toggle rendered to the right of the Layer Selector
 * (21.1). It carries the M0↔M5 Möbius hint at UI scale per SC-9 *without forking
 * the substrate*: both phases read the same payload, only the per-layer field
 * priority and pedagogy framing rotate.
 *
 * - `implicate`: per-layer selectors prefer the M0-side ground-state fields.
 *   Language (21.2) prioritises `c_1_form`; Relations (21.4) emphasise the
 *   structural family; the bridged-route pedagogy card frames a "forward
 *   projection".
 * - `explicate`: selectors prefer the Pratibimba-return reading. Language
 *   prioritises `c_1_complete_formulation` (articulated); pedagogy frames a
 *   "completed atelier route".
 *
 * Phase state is preserved across selections by the `m0-anuttara.activeLayer`
 * `currentStateSelectors` reader (cross-link 21.20); this component is a
 * controlled toggle and never owns the persisted value.
 */

export const M0_PHASES: readonly M0Phase[] = Object.freeze(['implicate', 'explicate']);

/** Language-layer (21.2) ground-state vs articulated priority key per phase. */
const PHASE_LANGUAGE_PRIORITY: Readonly<Record<M0Phase, string>> = Object.freeze({
    implicate: 'c_1_form',
    explicate: 'c_1_complete_formulation'
});

type PhaseGrammar = Readonly<{
    readonly label: string;
    readonly glyph: string;
    readonly relationEmphasis: 'structural-family' | 'pratibimba-return';
    readonly pedagogyFraming: string;
}>;

const PHASE_GRAMMAR: Readonly<Record<M0Phase, PhaseGrammar>> = Object.freeze({
    implicate: Object.freeze({
        label: 'Implicate',
        glyph: '0/1',
        relationEmphasis: 'structural-family',
        pedagogyFraming: 'forward projection'
    }),
    explicate: Object.freeze({
        label: 'Explicate',
        glyph: '5/0',
        relationEmphasis: 'pratibimba-return',
        pedagogyFraming: 'completed atelier route'
    })
});

/** Lemniscate-glyph dwell after a phase flip, in ms (CSS handles the visuals). */
const LEMNISCATE_TRANSITION_MS = 360;

/**
 * Reorder the language-layer fields (21.2) so the phase-preferred key leads.
 * `implicate` floats `c_1_form` (ground-state) to the front; `explicate` floats
 * `c_1_complete_formulation` (articulated). Field identity, provenance, and the
 * relative order of every other field are preserved — this is a stable rotation,
 * not a filter, so no substrate fork.
 */
export function selectLanguageFieldsForPhase(
    fields: readonly M0ProvenancedField[],
    phase: M0Phase
): readonly M0ProvenancedField[] {
    const priorityKey = PHASE_LANGUAGE_PRIORITY[phase];
    const prioritized = fields.filter(candidate => candidate.key === priorityKey);
    const rest = fields.filter(candidate => candidate.key !== priorityKey);
    return Object.freeze([...prioritized, ...rest]);
}

/** Relations-layer (21.4) emphasis per phase. */
export function relationEmphasisForPhase(
    phase: M0Phase
): PhaseGrammar['relationEmphasis'] {
    return PHASE_GRAMMAR[phase].relationEmphasis;
}

/** Pedagogy bridged-route card framing per phase. */
export function pedagogyFramingForPhase(phase: M0Phase): string {
    return PHASE_GRAMMAR[phase].pedagogyFraming;
}

export function nextM0Phase(phase: M0Phase): M0Phase {
    return phase === 'implicate' ? 'explicate' : 'implicate';
}

export interface ImplicateExplicateToggleProps {
    readonly phase: M0Phase;
    readonly onPhaseChange: (phase: M0Phase) => void;
    readonly className?: string;
}

export function ImplicateExplicateToggle(
    props: ImplicateExplicateToggleProps
): React.ReactElement {
    const { phase, onPhaseChange, className: classNameProp } = props;
    const [transitioning, setTransitioning] = React.useState(false);
    const previousPhase = React.useRef(phase);

    React.useEffect(() => {
        if (previousPhase.current === phase) {
            return undefined;
        }
        previousPhase.current = phase;
        setTransitioning(true);
        const handle = setTimeout(() => setTransitioning(false), LEMNISCATE_TRANSITION_MS);
        return () => clearTimeout(handle);
    }, [phase]);

    const selectPhase = React.useCallback(
        (next: M0Phase) => {
            if (next !== phase) {
                onPhaseChange(next);
            }
        },
        [phase, onPhaseChange]
    );

    const className = ['m0-implicate-explicate-toggle', classNameProp]
        .filter(Boolean)
        .join(' ');
    const lemniscateClassName = [
        'm0-iet-lemniscate',
        transitioning ? 'm0-iet-lemniscate--active' : ''
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div
            className={className}
            role="group"
            aria-label="M0 implicate / explicate phase"
            data-component="implicate-explicate-toggle"
            data-cross-link="21.20"
            data-phase={phase}
            data-transitioning={transitioning}
        >
            {M0_PHASES.map(option => {
                const grammar = PHASE_GRAMMAR[option];
                const selected = option === phase;
                return (
                    <button
                        key={option}
                        type="button"
                        role="switch"
                        aria-checked={selected}
                        data-phase-option={option}
                        data-relation-emphasis={grammar.relationEmphasis}
                        data-pedagogy-framing={grammar.pedagogyFraming}
                        title={`${grammar.label} (${grammar.pedagogyFraming})`}
                        onClick={() => selectPhase(option)}
                    >
                        <span aria-hidden="true" className="m0-iet-glyph">
                            {grammar.glyph}
                        </span>
                        <span className="m0-iet-label">{grammar.label}</span>
                    </button>
                );
            })}
            <span
                aria-hidden="true"
                className={lemniscateClassName}
                data-transitioning={transitioning}
            >
                {'∞'}
            </span>
        </div>
    );
}

export default ImplicateExplicateToggle;
