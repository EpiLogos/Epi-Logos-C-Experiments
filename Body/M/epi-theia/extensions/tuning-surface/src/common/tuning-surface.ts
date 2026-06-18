export type ResidencyClass = 'hot-reload' | 'freeze-on-session-start' | 'restart-required';
export type ScopeClass = 'global' | 'per-pasu' | 'per-session';
export type TuningRiskClass = 'A' | 'B' | 'C';
export type PrivacyClass = 'local-only' | 'vector-derived' | 'non-sensitive';

export interface TunableMetadata {
    readonly key: string;
    readonly type: string;
    readonly default: unknown;
    readonly residency_class: ResidencyClass;
    readonly scope_class: ScopeClass;
    readonly tuning_risk_class: TuningRiskClass;
    readonly ml_trainable: boolean;
    readonly privacy_class: PrivacyClass;
    readonly structural_invariant: boolean;
    readonly owning_subsystem: string;
    readonly owning_carrier?: string;
    readonly authoritative_doc: string;
    readonly warrant_constants: readonly string[];
    readonly description?: string;
}

export interface KnobCurrentValue {
    readonly key: string;
    readonly current: unknown;
    readonly is_default: boolean;
    readonly locked: boolean;
}

export interface AuditEntry {
    readonly timestamp: string;
    readonly knob_key: string;
    readonly from_value: unknown;
    readonly to_value: unknown;
    readonly actor: 'user' | 'anamnesis-proposer' | 'aletheia-drift-detection' | 'user-rollback';
    readonly tier: 1 | 2 | 3;
    readonly risk_class: TuningRiskClass;
    readonly proposing_evidence: readonly string[];
    readonly rollback_handle: string;
}
