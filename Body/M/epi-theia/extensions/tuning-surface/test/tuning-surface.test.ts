import { describe, expect, it } from 'vitest';
import type { AuditEntry, KnobCurrentValue, TunableMetadata } from '../src/common';

describe('tuning-surface common DTOs', () => {
    it('accepts full tunable metadata from the gateway registry contract', () => {
        const metadata = {
            key: 'nara.weights.pattern_threshold',
            type: 'number',
            default: 0.62,
            residency_class: 'hot-reload',
            scope_class: 'per-pasu',
            tuning_risk_class: 'B',
            ml_trainable: true,
            privacy_class: 'local-only',
            structural_invariant: false,
            owning_subsystem: 'nara',
            owning_carrier: 'S5',
            authoritative_doc: '[[38-tunability-surface-architecture]]',
            warrant_constants: ['DR-TUNE-1', 'DR-TUNE-2'],
            description: 'Pattern match threshold exposed through the tuning surface.'
        } satisfies TunableMetadata;

        expect(metadata.key).toBe('nara.weights.pattern_threshold');
        expect(metadata.warrant_constants).toContain('DR-TUNE-1');
        expect(metadata.structural_invariant).toBe(false);
    });

    it('accepts current knob values with lock/default state', () => {
        const current = {
            key: 'nara.weights.pattern_threshold',
            current: 0.71,
            is_default: false,
            locked: true
        } satisfies KnobCurrentValue;

        expect(current.current).toBe(0.71);
        expect(current.is_default).toBe(false);
        expect(current.locked).toBe(true);
    });

    it('accepts audit entries for human and system-originated tuning changes', () => {
        const auditEntry = {
            timestamp: '2026-06-17T18:27:00.000Z',
            knob_key: 'nara.weights.pattern_threshold',
            from_value: 0.62,
            to_value: 0.71,
            actor: 'anamnesis-proposer',
            tier: 2,
            risk_class: 'B',
            proposing_evidence: ['review:rev-42', 'session:sess-7'],
            rollback_handle: 'rollback:tuning:nara.weights.pattern_threshold:20260617'
        } satisfies AuditEntry;

        expect(auditEntry.actor).toBe('anamnesis-proposer');
        expect(auditEntry.tier).toBe(2);
        expect(auditEntry.proposing_evidence).toHaveLength(2);
    });
});
