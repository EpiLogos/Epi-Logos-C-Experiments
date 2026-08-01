/**
 * Coordinate: M' M5' (live tunability surface — 38.T06.8, 38.T38.1)
 * Residency: Body/M/pratibimba-app/src/panes.
 * Position (#n): governed carrier projection over the S0 tuning adapter.
 * Actualises: live registry reads, Tier-1 developer writes, audit reads, and
 *   local locking through the declared `s5'.tune.*` gateway surface; the
 *   38.T38.1 render contract — an `owning_subsystem`-grouped tree, per-knob
 *   residency / scope / privacy / risk / ml-trainable / authority citation, and
 *   greyed never-editable structural invariants. No modals: the pane IS the
 *   landing surface.
 * Public surface: TuningPane.
 * Does NOT own: tunable schemas, validation policy, audit persistence, or the
 *   Tier-2 proposal lifecycle.
 * Contract: [[M5'-SPEC]] / [[S0-SPEC]] / [[S3-SPEC]] / [[DR-TUNE-1]] / [[DR-TUNE-3]].
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import { useProvenanceStore } from '../state/stores';
import { useOmniPanelSessionStore } from './omni/omnipanelSessionState';
import './TuningPane.css';

const REGISTRY_LIST_RPC = "s5'.tune.registry.list";
const REGISTRY_GET_RPC = "s5'.tune.registry.get";
const REGISTRY_SET_RPC = "s5'.tune.registry.set";
const AUDIT_READ_RPC = "s5'.tune.audit.read";
const LOCK_TOGGLE_RPC = "s5'.tune.lock.toggle";

type TuningValue = boolean | number | string | readonly string[] | Readonly<Record<string, number>>;

interface TunableKnob {
    readonly key: string;
    readonly value_type: string;
    readonly default: TuningValue;
    readonly current: TuningValue;
    readonly locked: boolean;
    readonly structural_invariant: boolean;
    readonly tuning_risk_class: string;
    readonly residency_class: string;
    readonly scope_class: string;
    readonly privacy_class: string;
    readonly ml_trainable: boolean;
    readonly authoritative_doc: string;
    readonly owning_subsystem: string;
    readonly description: string;
}

/**
 * The left tree is grouped by `owning_subsystem` per the 38.T38.1 render
 * contract, not sorted flat: the schema's subsystem column IS the tree's
 * spine, so a knob's coordinate home is legible before its key is read.
 */
interface KnobGroup {
    readonly subsystem: string;
    readonly knobs: readonly TunableKnob[];
}

function groupBySubsystem(knobs: readonly TunableKnob[]): readonly KnobGroup[] {
    const groups = new Map<string, TunableKnob[]>();
    for (const knob of knobs) {
        const subsystem = knob.owning_subsystem || 'unassigned';
        const bucket = groups.get(subsystem);
        if (bucket) bucket.push(knob); else groups.set(subsystem, [knob]);
    }
    return Object.freeze([...groups.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([subsystem, bucket]) => Object.freeze({ subsystem, knobs: Object.freeze(bucket) })));
}

interface AuditEntry {
    readonly timestamp: string;
    readonly knob_key: string;
    readonly from_value: TuningValue;
    readonly to_value: TuningValue;
    readonly actor: string;
    readonly proposing_evidence: readonly string[];
}

function asRecord(value: unknown): Readonly<Record<string, unknown>> | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? value as Readonly<Record<string, unknown>>
        : null;
}

function isTuningValue(value: unknown): value is TuningValue {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return true;
    if (Array.isArray(value)) return value.every(entry => typeof entry === 'string');
    const object = asRecord(value);
    return object !== null && Object.values(object).every(entry => typeof entry === 'number' && Number.isFinite(entry));
}

function normalizeKnob(value: unknown): TunableKnob | null {
    const row = asRecord(value);
    if (!row || typeof row.key !== 'string' || typeof row.type !== 'string' ||
        typeof row.locked !== 'boolean' || typeof row.structural_invariant !== 'boolean' ||
        typeof row.tuning_risk_class !== 'string' || typeof row.owning_subsystem !== 'string' ||
        !isTuningValue(row.default) || !isTuningValue(row.current)) {
        return null;
    }
    return Object.freeze({
        key: row.key,
        value_type: row.type,
        default: row.default,
        current: row.current,
        locked: row.locked,
        structural_invariant: row.structural_invariant,
        tuning_risk_class: row.tuning_risk_class,
        // The schema classes below ride the same `s5'.tune.registry.*` payload
        // (serialized `TunableMetadata`). They are optional-with-fallback rather
        // than required so an older gateway still lists its knobs instead of
        // dropping every row at the normalizer.
        residency_class: typeof row.residency_class === 'string' ? row.residency_class : '',
        scope_class: typeof row.scope_class === 'string' ? row.scope_class : '',
        privacy_class: typeof row.privacy_class === 'string' ? row.privacy_class : '',
        ml_trainable: row.ml_trainable === true,
        authoritative_doc: typeof row.authoritative_doc === 'string' ? row.authoritative_doc : '',
        owning_subsystem: row.owning_subsystem,
        description: typeof row.description === 'string' ? row.description : ''
    });
}

function normalizeKnobs(value: unknown): readonly TunableKnob[] {
    const rows = asRecord(value)?.knobs;
    return Object.freeze(Array.isArray(rows)
        ? rows.map(normalizeKnob).filter((row): row is TunableKnob => row !== null)
        : []);
}

function normalizeAudit(value: unknown): readonly AuditEntry[] {
    const rows = asRecord(value)?.entries;
    if (!Array.isArray(rows)) return [];
    return Object.freeze(rows.flatMap(entry => {
        const row = asRecord(entry);
        if (!row || typeof row.timestamp !== 'string' || typeof row.knob_key !== 'string' ||
            typeof row.actor !== 'string' || !isTuningValue(row.from_value) || !isTuningValue(row.to_value) ||
            !Array.isArray(row.proposing_evidence) || !row.proposing_evidence.every(item => typeof item === 'string')) {
            return [];
        }
        return [{
            timestamp: row.timestamp,
            knob_key: row.knob_key,
            from_value: row.from_value,
            to_value: row.to_value,
            actor: row.actor,
            proposing_evidence: row.proposing_evidence
        }];
    }));
}

function displayValue(value: TuningValue): string {
    return typeof value === 'string' ? value : JSON.stringify(value);
}

function valueDraft(value: TuningValue): string {
    return typeof value === 'string' ? value : JSON.stringify(value);
}

function parseDraft(knob: TunableKnob, draft: string): TuningValue {
    if (knob.value_type === 'bool') {
        if (draft === 'true') return true;
        if (draft === 'false') return false;
        throw new Error('Boolean values must be true or false.');
    }
    if (knob.value_type === 'f32' || knob.value_type === 'f64' || knob.value_type === 'u32' || knob.value_type === 'u64' || knob.value_type === 'i32' || knob.value_type === 'i64') {
        const value = Number(draft);
        if (!Number.isFinite(value)) throw new Error('Enter a finite number.');
        if ((knob.value_type.startsWith('u')) && (!Number.isInteger(value) || value < 0)) throw new Error('Enter a non-negative integer.');
        if (knob.value_type.startsWith('i') && !Number.isInteger(value)) throw new Error('Enter an integer.');
        return value;
    }
    if (knob.value_type === 'string') return draft;
    const parsed: unknown = JSON.parse(draft);
    if (!isTuningValue(parsed)) throw new Error('Enter a JSON string list or numeric object.');
    return parsed;
}

export function TuningPane() {
    const connected = useProvenanceStore(state => state.connection.connected);
    const tuningState = useOmniPanelSessionStore(state => state.session.perTabState.tuning);
    const patchTab = useOmniPanelSessionStore(state => state.patchTab);
    const [knobs, setKnobs] = useState<readonly TunableKnob[]>([]);
    const [audit, setAudit] = useState<readonly AuditEntry[]>([]);
    const [draft, setDraft] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const selected = useMemo(
        () => knobs.find(knob => knob.key === tuningState.selectedKnobKey) ?? knobs[0] ?? null,
        [knobs, tuningState.selectedKnobKey]
    );
    const groups = useMemo(() => groupBySubsystem(knobs), [knobs]);

    const refresh = useCallback(async () => {
        if (!connected) return;
        setLoading(true);
        setStatus('');
        try {
            const receipt = await gateway().invoke(REGISTRY_LIST_RPC, {});
            setKnobs(normalizeKnobs(receipt.artifact));
        } catch (error) {
            setStatus(error instanceof Error ? error.message : 'Could not load the tuning registry.');
        } finally {
            setLoading(false);
        }
    }, [connected]);

    useEffect(() => { void refresh(); }, [refresh]);

    useEffect(() => {
        if (selected || knobs.length === 0) return;
        patchTab('tuning', { selectedKnobKey: knobs[0].key });
    }, [knobs, patchTab, selected]);

    useEffect(() => {
        if (!connected || !selected) return;
        let active = true;
        setDraft(valueDraft(selected.current));
        void Promise.all([
            gateway().invoke(REGISTRY_GET_RPC, { key: selected.key }),
            gateway().invoke(AUDIT_READ_RPC, { key: selected.key })
        ]).then(([knobReceipt, auditReceipt]) => {
            if (!active) return;
            const live = normalizeKnob(knobReceipt.artifact);
            if (live) {
                setKnobs(previous => previous.map(knob => knob.key === live.key ? live : knob));
                // NB: draft is seeded synchronously above from the authoritative
                // registry list. Do NOT re-set it here — this async GET resolves
                // after the user may have started editing and would clobber their
                // input back to the current value (38.T06.8 tuning race).
            }
            setAudit(normalizeAudit(auditReceipt.artifact));
        }).catch(error => {
            if (active) setStatus(error instanceof Error ? error.message : 'Could not read this tunable.');
        });
        return () => { active = false; };
    }, [connected, selected?.key]);

    const apply = useCallback(async () => {
        if (!selected) return;
        try {
            const value = parseDraft(selected, draft);
            setLoading(true);
            setStatus('');
            await gateway().invoke(REGISTRY_SET_RPC, {
                key: selected.key,
                value,
                actor: 'user',
                tier: 1,
                evidence: ['pratibimba-app/TuningPane']
            });
            await refresh();
            const receipt = await gateway().invoke(AUDIT_READ_RPC, { key: selected.key });
            setAudit(normalizeAudit(receipt.artifact));
            setStatus('Saved.');
        } catch (error) {
            setStatus(error instanceof Error ? error.message : 'Could not save this tunable.');
        } finally {
            setLoading(false);
        }
    }, [draft, refresh, selected]);

    const toggleLock = useCallback(async () => {
        if (!selected) return;
        try {
            setLoading(true);
            setStatus('');
            await gateway().invoke(LOCK_TOGGLE_RPC, { key: selected.key, locked: !selected.locked });
            await refresh();
        } catch (error) {
            setStatus(error instanceof Error ? error.message : 'Could not change the lock.');
        } finally {
            setLoading(false);
        }
    }, [refresh, selected]);

    if (!connected) return <div className="pane-message">Gateway disconnected.</div>;

    return (
        <section className="tuning-pane" data-testid="tuning-pane">
            <header className="tuning-toolbar">
                <strong>Tuning</strong>
                <span>{loading ? 'Working' : `${knobs.length} tunables`}</span>
                <button type="button" onClick={() => void refresh()} disabled={loading}>Refresh</button>
            </header>
            <div className="tuning-grid">
                <aside className="tuning-list" aria-label="Tunables">
                    {groups.map(group => (
                        <section
                            key={group.subsystem}
                            className="tuning-group"
                            data-subsystem={group.subsystem}
                            aria-label={`${group.subsystem} tunables`}
                        >
                            <h3 className="tuning-group-label">{group.subsystem}<small>{group.knobs.length}</small></h3>
                            {group.knobs.map(knob => (
                                <button
                                    key={knob.key}
                                    type="button"
                                    data-selected={knob.key === selected?.key}
                                    data-structural-invariant={knob.structural_invariant}
                                    data-locked={knob.locked}
                                    onClick={() => patchTab('tuning', { selectedKnobKey: knob.key, subsystemFilter: knob.owning_subsystem })}
                                >
                                    <span>{knob.key}</span>
                                    <small>
                                        {knob.tuning_risk_class}
                                        {knob.ml_trainable ? ' · ml-trainable' : ''}
                                        {knob.locked ? ' · locked' : ''}
                                        {knob.structural_invariant ? ' · structural invariant' : ''}
                                    </small>
                                </button>
                            ))}
                        </section>
                    ))}
                </aside>
                <div className="tuning-detail">
                    {selected ? <>
                        <header>
                            <h2>{selected.key}</h2>
                            <p>{selected.description}</p>
                        </header>
                        <dl>
                            <div><dt>Type</dt><dd>{selected.value_type}</dd></div>
                            <div><dt>Default</dt><dd>{displayValue(selected.default)}</dd></div>
                            <div><dt>Risk</dt><dd>{selected.tuning_risk_class}</dd></div>
                            <div><dt>Residency</dt><dd>{selected.residency_class || 'unspecified'}</dd></div>
                            <div><dt>Scope</dt><dd>{selected.scope_class || 'unspecified'}</dd></div>
                            <div><dt>Privacy</dt><dd>{selected.privacy_class || 'unspecified'}</dd></div>
                            <div><dt>ML-trainable</dt><dd>{selected.ml_trainable ? 'yes' : 'no'}</dd></div>
                            <div><dt>Subsystem</dt><dd>{selected.owning_subsystem}</dd></div>
                            <div className="tuning-citation">
                                <dt>Authority</dt>
                                <dd>{selected.authoritative_doc || 'unattributed'}</dd>
                            </div>
                        </dl>
                        <label className="tuning-value">Value
                            <input value={draft} onChange={event => setDraft(event.currentTarget.value)} disabled={loading || selected.locked || selected.structural_invariant} />
                        </label>
                        <div className="tuning-actions">
                            <button type="button" onClick={() => void apply()} disabled={loading || selected.locked || selected.structural_invariant}>Apply</button>
                            <button type="button" onClick={() => void toggleLock()} disabled={loading || selected.structural_invariant}>{selected.locked ? 'Unlock' : 'Lock'}</button>
                        </div>
                        {selected.structural_invariant ? <p className="tuning-note">Structural invariant: read-only.</p> : null}
                        {status ? <p className="tuning-status" role="status">{status}</p> : null}
                        <section className="tuning-audit" aria-label="Audit trail">
                            <h3>Audit trail</h3>
                            {audit.length === 0 ? <p>No persisted changes.</p> : <ol>{audit.map(entry => (
                                <li key={`${entry.timestamp}-${entry.knob_key}`}>
                                    {entry.timestamp}: {displayValue(entry.from_value)} to {displayValue(entry.to_value)} by {entry.actor}
                                </li>
                            ))}</ol>}
                        </section>
                    </> : <p className="pane-message">No tunables were returned by the registry.</p>}
                </div>
            </div>
        </section>
    );
}
