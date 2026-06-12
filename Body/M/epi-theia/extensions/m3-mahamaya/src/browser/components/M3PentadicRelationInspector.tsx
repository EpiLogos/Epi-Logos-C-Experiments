import * as React from 'react';
import type { MExtensionReadinessSnapshot } from '@pratibimba/m-extension-runtime';
import { useM3ProfileTick } from '../context/M3ProfileTickContext';
import { useM3Readiness } from '../context/M3ReadinessContext';
import { ReadinessChip } from './ReadinessChip';

export interface M3MaxwellKaluzaKleinWitness {
    readonly total: number;
    readonly decomposition: string;
    readonly metricBody: string;
    readonly connectionField: string;
    readonly scalarFiberCondition: string;
}

export interface M3MahamayaFifteenCombination {
    readonly dnaCode: string;
    readonly trigram: string;
    readonly pauliMatrix: string;
}

export interface M3MahamayaFifteenWitness {
    readonly label: string;
    readonly total: number;
    readonly combinations: readonly M3MahamayaFifteenCombination[];
}

export interface M3PentadicTraceView {
    readonly pairedMahamayaFifteens: readonly [number, number] | null;
    readonly witnesses: readonly M3MahamayaFifteenWitness[];
    readonly backboneIdentity: string | null;
    readonly shemIdentity: string | null;
    readonly lineGraphIdentity: string | null;
    readonly mahamayaAddress64: number | null;
    readonly codon: string | null;
    readonly lineChangeOperator: number | null;
    readonly qCosmicRef: string | null;
}

export interface M3PentadicRelationModel {
    readonly ready: boolean;
    readonly maxwell: M3MaxwellKaluzaKleinWitness | null;
    readonly trace: M3PentadicTraceView | null;
    readonly pendingFields: readonly string[];
    readonly readiness: MExtensionReadinessSnapshot;
}

export interface M3PentadicRelationInspectorProps {
    readonly profilePayload: Readonly<Record<string, unknown>> | undefined;
    readonly readiness: MExtensionReadinessSnapshot;
}

export function pentadicRelationModelFromProfilePayload(
    profilePayload: Readonly<Record<string, unknown>> | undefined,
    readiness: MExtensionReadinessSnapshot
): M3PentadicRelationModel {
    const pending: string[] = [];
    const payload = profilePayload ?? {};
    const maxwell = maxwellWitnessFromPayload(payload, pending);
    const trace = pentadicTraceFromPayload(payload, pending);
    return Object.freeze({
        ready: pending.length === 0,
        maxwell,
        trace,
        pendingFields: Object.freeze(pending),
        readiness
    });
}

export const M3PentadicRelationInspector: React.FC<M3PentadicRelationInspectorProps> = ({
    profilePayload,
    readiness
}) => {
    const profileTick = useM3ProfileTick();
    const inheritedReadiness = useM3Readiness();
    const model = React.useMemo(
        () => pentadicRelationModelFromProfilePayload(profilePayload, readiness),
        [profilePayload, readiness]
    );

    return (
        <article
            className="m3-pentadic-relation-inspector"
            data-widget-id="pratibimba.m3-mahamaya:pentadic-relation-inspector"
            data-ready={model.ready ? 'true' : 'false'}
            data-profile-tick={profileTick.tick ?? 'pending'}
            data-context-readiness={inheritedReadiness.snapshot.state}
            style={rootStyle}
        >
            <header style={headerStyle}>
                <div>
                    <h3 style={titleStyle}>Pentadic relation inspector</h3>
                    <p style={subtitleStyle}>
                        Maxwell relation-space witness and Mahamaya runtime trace from the profile bus
                    </p>
                </div>
                <ReadinessChip
                    bindingKey="profile.anuttara_pentadic_trace"
                    state={model.ready ? 'ready' : 'pending'}
                    style={statePillStyle}
                >
                    {model.ready ? 'ready' : readiness.state}
                </ReadinessChip>
            </header>

            {model.pendingFields.length > 0 && (
                <div style={pendingStripStyle}>
                    {model.pendingFields.map(field => (
                        <PendingFieldChip
                            key={field}
                            field={field}
                            readiness={model.readiness}
                        />
                    ))}
                </div>
            )}

            <div style={laneGridStyle}>
                <section
                    data-relation-lane="maxwell-kaluza-klein"
                    aria-label="Maxwell Kaluza-Klein relation-space witness"
                    style={laneStyle}
                >
                    <LaneTitle label="Maxwell / Kaluza-Klein" register="relation-space witness" />
                    {model.maxwell ? (
                        <>
                            <strong style={equationStyle}>
                                {model.maxwell.total} = {model.maxwell.decomposition}
                            </strong>
                            <dl style={factListStyle}>
                                <dt>metric body</dt>
                                <dd>{model.maxwell.metricBody}</dd>
                                <dt>connection field</dt>
                                <dd>{model.maxwell.connectionField}</dd>
                                <dt>fiber condition</dt>
                                <dd>{model.maxwell.scalarFiberCondition}</dd>
                            </dl>
                        </>
                    ) : (
                        <PendingFieldChip
                            field="profile.coupling_flow_alignment.maxwellKaluzaKleinWitness"
                            readiness={model.readiness}
                        />
                    )}
                </section>

                <section
                    data-relation-lane="mahamaya-paired-fifteens"
                    aria-label="Mahamaya paired fifteens"
                    style={laneStyle}
                >
                    <LaneTitle label="Mahamaya paired fifteens" register="M3 helper trace" />
                    {model.trace?.pairedMahamayaFifteens ? (
                        <strong style={equationStyle}>
                            {model.trace.pairedMahamayaFifteens[0]}+{model.trace.pairedMahamayaFifteens[1]}
                        </strong>
                    ) : (
                        <PendingFieldChip
                            field="profile.anuttara_pentadic_trace.pairedMahamayaFifteens"
                            readiness={model.readiness}
                        />
                    )}
                    {model.trace?.witnesses.length ? (
                        <div style={witnessGridStyle}>
                            {model.trace.witnesses.map(witness => (
                                <FifteenWitnessCard key={witness.label} witness={witness} />
                            ))}
                        </div>
                    ) : (
                        <PendingFieldChip
                            field="profile.anuttara_pentadic_trace.pairedMahamayaFifteenWitnesses"
                            readiness={model.readiness}
                        />
                    )}
                </section>
            </div>

            <section data-relation-lane="shared-backbone" style={backboneStyle}>
                <LaneTitle label="Shared backbone" register="profile.anuttara_pentadic_trace" />
                <BackboneValue label="24-spoke relation" value={model.trace?.backboneIdentity} field="profile.anuttara_pentadic_trace.backboneIdentity" readiness={model.readiness} />
                <BackboneValue label="Shem pentadic relation" value={model.trace?.shemIdentity} field="profile.anuttara_pentadic_trace.shemIdentity" readiness={model.readiness} />
                <BackboneValue label="line graph" value={model.trace?.lineGraphIdentity} field="profile.anuttara_pentadic_trace.lineGraphIdentity" readiness={model.readiness} />
                <BackboneValue label="active 64-address" value={addressValue(model.trace?.mahamayaAddress64)} field="profile.anuttara_pentadic_trace.mahamayaAddress64" readiness={model.readiness} />
                <BackboneValue label="codon" value={model.trace?.codon ? `codon ${model.trace.codon}` : null} field="profile.anuttara_pentadic_trace.codon" readiness={model.readiness} />
                <BackboneValue label="line-change operator" value={operatorValue(model.trace?.lineChangeOperator)} field="profile.anuttara_pentadic_trace.lineChangeOperator" readiness={model.readiness} />
                <BackboneValue label="q_cosmic_ref" value={model.trace?.qCosmicRef} field="profile.anuttara_pentadic_trace.qCosmicRef" readiness={model.readiness} />
            </section>
        </article>
    );
};

export default M3PentadicRelationInspector;

function maxwellWitnessFromPayload(
    payload: Readonly<Record<string, unknown>>,
    pending: string[]
): M3MaxwellKaluzaKleinWitness | null {
    const alignment = objectValue(payload.couplingFlowAlignment ?? payload.coupling_flow_alignment);
    const raw = objectValue(alignment?.maxwellKaluzaKleinWitness ?? alignment?.maxwell_kaluza_klein_witness);
    if (!raw) {
        pending.push('profile.coupling_flow_alignment.maxwellKaluzaKleinWitness');
        return null;
    }
    const witness = Object.freeze({
        total: numberValue(raw.total),
        decomposition: stringValue(raw.decomposition),
        metricBody: stringValue(raw.metricBody ?? raw.metric_body),
        connectionField: stringValue(raw.connectionField ?? raw.connection_field),
        scalarFiberCondition: stringValue(raw.scalarFiberCondition ?? raw.scalar_fiber_condition)
    });
    const missing = [
        ['total', witness.total],
        ['decomposition', witness.decomposition],
        ['metricBody', witness.metricBody],
        ['connectionField', witness.connectionField],
        ['scalarFiberCondition', witness.scalarFiberCondition]
    ].filter(([, value]) => value === null);
    for (const [field] of missing) {
        pending.push(`profile.coupling_flow_alignment.maxwellKaluzaKleinWitness.${field}`);
    }
    if (missing.length > 0) {
        return null;
    }
    return witness as M3MaxwellKaluzaKleinWitness;
}

function pentadicTraceFromPayload(
    payload: Readonly<Record<string, unknown>>,
    pending: string[]
): M3PentadicTraceView | null {
    const raw = objectValue(payload.anuttaraPentadicTrace ?? payload.anuttara_pentadic_trace);
    if (!raw) {
        pending.push('profile.anuttara_pentadic_trace');
        return null;
    }
    const trace = Object.freeze({
        pairedMahamayaFifteens: pairedFifteens(raw.pairedMahamayaFifteens ?? raw.paired_mahamaya_fifteens),
        witnesses: fifteenWitnesses(raw.pairedMahamayaFifteenWitnesses ?? raw.paired_mahamaya_fifteen_witnesses),
        backboneIdentity: stringValue(raw.backboneIdentity ?? raw.backbone_identity),
        shemIdentity: stringValue(raw.shemIdentity ?? raw.shem_identity),
        lineGraphIdentity: stringValue(raw.lineGraphIdentity ?? raw.line_graph_identity),
        mahamayaAddress64: numberValue(raw.mahamayaAddress64 ?? raw.mahamaya_address64),
        codon: stringValue(raw.codon),
        lineChangeOperator: numberValue(raw.lineChangeOperator ?? raw.line_change_operator),
        qCosmicRef: stringValue(raw.qCosmicRef ?? raw.q_cosmic_ref)
    });
    const required: readonly [keyof M3PentadicTraceView, string][] = [
        ['pairedMahamayaFifteens', 'profile.anuttara_pentadic_trace.pairedMahamayaFifteens'],
        ['backboneIdentity', 'profile.anuttara_pentadic_trace.backboneIdentity'],
        ['shemIdentity', 'profile.anuttara_pentadic_trace.shemIdentity'],
        ['lineGraphIdentity', 'profile.anuttara_pentadic_trace.lineGraphIdentity'],
        ['mahamayaAddress64', 'profile.anuttara_pentadic_trace.mahamayaAddress64'],
        ['codon', 'profile.anuttara_pentadic_trace.codon'],
        ['lineChangeOperator', 'profile.anuttara_pentadic_trace.lineChangeOperator'],
        ['qCosmicRef', 'profile.anuttara_pentadic_trace.qCosmicRef']
    ];
    for (const [key, field] of required) {
        if (trace[key] === null) {
            pending.push(field);
        }
    }
    if (trace.witnesses.length === 0) {
        pending.push('profile.anuttara_pentadic_trace.pairedMahamayaFifteenWitnesses');
    }
    return trace;
}

function pairedFifteens(value: unknown): readonly [number, number] | null {
    if (!Array.isArray(value) || value.length !== 2) {
        return null;
    }
    const left = numberValue(value[0]);
    const right = numberValue(value[1]);
    return left === null || right === null ? null : Object.freeze([left, right] as const);
}

function fifteenWitnesses(value: unknown): readonly M3MahamayaFifteenWitness[] {
    if (!Array.isArray(value)) {
        return Object.freeze([]);
    }
    return Object.freeze(
        value
            .map(entry => objectValue(entry))
            .filter((entry): entry is Readonly<Record<string, unknown>> => entry !== null)
            .map((entry, index) => Object.freeze({
                label: stringValue(entry.label) ?? `profile witness ${index + 1}`,
                total: numberValue(entry.total),
                combinations: combinations(entry.combinations)
            }))
            .filter((entry): entry is M3MahamayaFifteenWitness =>
                entry.total !== null && entry.combinations.length > 0
            )
    );
}

function combinations(value: unknown): readonly M3MahamayaFifteenCombination[] {
    if (!Array.isArray(value)) {
        return Object.freeze([]);
    }
    return Object.freeze(
        value
            .map(entry => objectValue(entry))
            .filter((entry): entry is Readonly<Record<string, unknown>> => entry !== null)
            .map(entry => Object.freeze({
                dnaCode: stringValue(entry.dnaCode ?? entry.dna_code),
                trigram: stringValue(entry.trigram),
                pauliMatrix: stringValue(entry.pauliMatrix ?? entry.pauli_matrix)
            }))
            .filter((entry): entry is M3MahamayaFifteenCombination =>
                entry.dnaCode !== null && entry.trigram !== null && entry.pauliMatrix !== null
            )
    );
}

const LaneTitle: React.FC<{ readonly label: string; readonly register: string }> = ({ label, register }) => (
    <header style={laneHeaderStyle}>
        <h4 style={laneTitleStyle}>{label}</h4>
        <code style={registerStyle}>{register}</code>
    </header>
);

const FifteenWitnessCard: React.FC<{ readonly witness: M3MahamayaFifteenWitness }> = ({ witness }) => (
    <article style={witnessCardStyle}>
        <strong>{witness.label}</strong>
        <span>{witness.total}</span>
        <ul style={comboListStyle}>
            {witness.combinations.map(combo => (
                <li key={`${combo.dnaCode}-${combo.trigram}-${combo.pauliMatrix}`} style={comboItemStyle}>
                    <span>{combo.dnaCode}</span>
                    <span>{combo.trigram}</span>
                    <span>{combo.pauliMatrix}</span>
                </li>
            ))}
        </ul>
    </article>
);

const BackboneValue: React.FC<{
    readonly label: string;
    readonly value: string | null | undefined;
    readonly field: string;
    readonly readiness: MExtensionReadinessSnapshot;
}> = ({ label, value, field, readiness }) => (
    <div style={backboneItemStyle}>
        <span style={backboneLabelStyle}>{label}</span>
        {value ? <strong>{value}</strong> : <PendingFieldChip field={field} readiness={readiness} />}
    </div>
);

const PendingFieldChip: React.FC<{
    readonly field: string;
    readonly readiness: MExtensionReadinessSnapshot;
}> = ({ field, readiness }) => {
    const blocker = readiness.blockerIds.find(id => id === field || id.includes(field));
    return (
        <span
            data-pending-field={field}
            data-ledger-state={readiness.state}
            data-ledger-blocker={blocker ?? ''}
            style={pendingChipStyle}
        >
            <ReadinessChip bindingKey={field} state="pending">
                Track-10 readiness ledger: {readiness.state} awaits {field}
                {blocker ? ` (${blocker})` : ''}
            </ReadinessChip>
        </span>
    );
};

function addressValue(value: number | null | undefined): string | null {
    return typeof value === 'number' ? `address64 ${value}` : null;
}

function operatorValue(value: number | null | undefined): string | null {
    return typeof value === 'number' ? `line-change ${value}` : null;
}

function objectValue(value: unknown): Readonly<Record<string, unknown>> | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? value as Readonly<Record<string, unknown>>
        : null;
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && isFinite(value) ? value : null;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

const rootStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 8,
    padding: 16,
    background: 'var(--theia-editorWidget-background)',
    color: 'var(--theia-foreground)'
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12
};

const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 'var(--theia-ui-font-size2)',
    fontWeight: 600
};

const subtitleStyle: React.CSSProperties = {
    margin: '4px 0 0',
    color: 'var(--theia-descriptionForeground)',
    fontSize: 'var(--theia-ui-font-size1)'
};

const statePillStyle: React.CSSProperties = {
    border: '1px solid var(--theia-charts-blue)',
    borderRadius: 999,
    color: 'var(--theia-charts-blue)',
    padding: '2px 8px',
    fontSize: 'var(--theia-ui-font-size0)',
    textTransform: 'uppercase'
};

const pendingStripStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12
};

const laneGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 12
};

const laneStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 8,
    padding: 12,
    background: 'var(--theia-editor-background)'
};

const laneHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10
};

const laneTitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 'var(--theia-ui-font-size1)',
    fontWeight: 600
};

const registerStyle: React.CSSProperties = {
    fontSize: 'var(--theia-ui-font-size0)',
    color: 'var(--theia-descriptionForeground)'
};

const equationStyle: React.CSSProperties = {
    display: 'inline-block',
    marginBottom: 10,
    fontFamily: 'var(--theia-monospace-font-family)'
};

const factListStyle: React.CSSProperties = {
    display: 'grid',
    gap: 4,
    margin: 0
};

const witnessGridStyle: React.CSSProperties = {
    display: 'grid',
    gap: 8,
    marginTop: 10
};

const witnessCardStyle: React.CSSProperties = {
    display: 'grid',
    gap: 6,
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 6,
    padding: 8
};

const comboListStyle: React.CSSProperties = {
    display: 'grid',
    gap: 4,
    listStyle: 'none',
    margin: 0,
    padding: 0
};

const comboItemStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    color: 'var(--theia-descriptionForeground)',
    fontSize: 'var(--theia-ui-font-size1)'
};

const backboneStyle: React.CSSProperties = {
    display: 'grid',
    gap: 8,
    marginTop: 12,
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 8,
    padding: 12,
    background: 'var(--theia-editor-background)'
};

const backboneItemStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8
};

const backboneLabelStyle: React.CSSProperties = {
    color: 'var(--theia-descriptionForeground)'
};

const pendingChipStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    border: '1px solid var(--theia-charts-yellow)',
    borderRadius: 999,
    color: 'var(--theia-charts-yellow)',
    padding: '2px 8px',
    fontSize: 'var(--theia-ui-font-size0)'
};
