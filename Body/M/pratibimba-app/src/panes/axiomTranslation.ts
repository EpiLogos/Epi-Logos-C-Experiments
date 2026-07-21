/**
 * Coordinate: M' M5' (axiom-translation gateway projection — 26.T26.14)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): strict read boundary for the Pi axiom-translation history
 * Actualises: the fail-closed parser for `s5'.epii.axiom_translation_history` —
 *   a list of PiAxiomTranslationSessions, each a Philosophical English → Formal
 *   Notation → OWL → SHACL chain (DR-B-2). Reuses the landed AxiomTranslationStep
 *   / AxiomForm contract from evidenceShapes (26.10).
 * Public surface: method constant, AXIOM_FORMS, parseAxiomTranslationHistory,
 *   PiAxiomTranslationSession.
 * Does NOT own: the translation law or the producer (epi-cli gate::epii_axiom
 *   over the PI harness); this is a strict read consumer.
 * Contract: [[M5'-SPEC]] / [[S3-SPEC]].
 */

import type { AxiomForm, AxiomTranslationStep } from './omni/evidenceShapes';

export const AXIOM_TRANSLATION_HISTORY_METHOD = "s5'.epii.axiom_translation_history";

export const AXIOM_FORMS = Object.freeze([
    'philosophical-english',
    'formal-notation',
    'owl',
    'shacl'
] as const);

const FORM_SET = new Set<string>(AXIOM_FORMS);

export type AxiomVerification = 'pi' | 'human' | 'pending';

export interface PiAxiomTranslationSession {
    readonly id: string;
    readonly initiatingDispatchNodeId: string;
    readonly steps: readonly AxiomTranslationStep[];
    readonly verifiedBy: AxiomVerification;
}

function record(value: unknown, label: string): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`${label} must be an object`);
    }
    return value as Record<string, unknown>;
}

function text(value: unknown, label: string): string {
    if (typeof value !== 'string' || value.length === 0) {
        throw new Error(`${label} must be a non-empty string`);
    }
    return value;
}

function form(value: unknown, label: string): AxiomForm {
    const parsed = text(value, label);
    if (!FORM_SET.has(parsed)) {
        throw new Error(`${label} is not a canonical axiom form`);
    }
    return parsed as AxiomForm;
}

function step(value: unknown, index: number): AxiomTranslationStep {
    const raw = record(value, `step ${index}`);
    const verifiedByRaw = raw.verifiedBy;
    if (verifiedByRaw !== undefined && verifiedByRaw !== 'pi' && verifiedByRaw !== 'human') {
        throw new Error(`step ${index} verifiedBy must be pi or human`);
    }
    return Object.freeze({
        id: text(raw.id, `step ${index} id`),
        fromForm: form(raw.fromForm, `step ${index} fromForm`),
        toForm: form(raw.toForm, `step ${index} toForm`),
        inputText: text(raw.inputText, `step ${index} inputText`),
        outputText: text(raw.outputText, `step ${index} outputText`),
        reasoningTrace: typeof raw.reasoningTrace === 'string' ? raw.reasoningTrace : '',
        ...(verifiedByRaw ? { verifiedBy: verifiedByRaw as 'pi' | 'human' } : {})
    });
}

function session(value: unknown, index: number): PiAxiomTranslationSession {
    const raw = record(value, `session ${index}`);
    if (!Array.isArray(raw.steps) || raw.steps.length === 0) {
        throw new Error(`session ${index} must carry at least one translation step`);
    }
    const verifiedBy = raw.verifiedBy;
    if (verifiedBy !== 'pi' && verifiedBy !== 'human' && verifiedBy !== 'pending') {
        throw new Error(`session ${index} verifiedBy must be pi, human, or pending`);
    }
    // The chain is contiguous: each step's input is the prior step's output.
    const steps = Object.freeze(raw.steps.map(step));
    for (let i = 1; i < steps.length; i += 1) {
        if (steps[i].fromForm !== steps[i - 1].toForm) {
            throw new Error(`session ${index} chain breaks at step ${i}`);
        }
    }
    return Object.freeze({
        id: text(raw.id, `session ${index} id`),
        initiatingDispatchNodeId: text(raw.initiatingDispatchNodeId, `session ${index} dispatch node`),
        steps,
        verifiedBy
    });
}

export function parseAxiomTranslationHistory(value: unknown): readonly PiAxiomTranslationSession[] {
    const raw = record(value, 'Axiom translation history');
    if (!Array.isArray(raw.sessions)) {
        throw new Error('Axiom translation history must carry a sessions array');
    }
    return Object.freeze(raw.sessions.map(session));
}
