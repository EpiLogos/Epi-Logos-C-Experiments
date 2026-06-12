import * as React from 'react';
import { M3ProjectionSurface } from '../../common';
import { useM3ProfileTick } from '../context/M3ProfileTickContext';
import { useM3Readiness } from '../context/M3ReadinessContext';
import { ReadinessChip } from './ReadinessChip';

export type ThirdSpandaCanonicalFormId =
    | 'mersenne'
    | 'binary'
    | 'octave-field'
    | 'spanda-bridge'
    | 'm-stack';

export type ThirdSpandaSkeletonEvent =
    | 'Additive137'
    | 'MersenneM7Ground'
    | 'SpandaCrownBifurcation';

export interface ThirdSpandaCanonicalForm {
    readonly id: ThirdSpandaCanonicalFormId;
    readonly equation: string;
    readonly label: string;
    readonly warrant: string;
    readonly active: boolean;
}

export interface ThirdSpandaTranslationRule {
    readonly statement: string;
    readonly qcdAnalogue: string;
    readonly warrant: string;
}

export interface CouplingFlowAlignmentBoundary {
    readonly thirdSpandaForms: readonly ThirdSpandaCanonicalForm[];
    readonly executionOrderTrace: string;
    readonly translationRule: ThirdSpandaTranslationRule;
    readonly sevenEightNineSpine: {
        readonly seven: string;
        readonly eight: string;
        readonly nine: string;
    };
    readonly physicsDescent: readonly string[];
    readonly qcdUnderbody: readonly string[];
    readonly measurementCaveat: string;
    readonly recognitionContextWarrant: string;
    readonly skeletonEventsActive: readonly ThirdSpandaSkeletonEvent[];
    readonly sourceWarrant: string;
}

export interface ThirdSpandaMathemeProofPanelProps {
    readonly surface: M3ProjectionSurface;
    readonly couplingFlowAlignment?: CouplingFlowAlignmentBoundary;
}

const CANONICAL_CAVEAT =
    '137 is the integer skeleton; 137.035999... is the dressed low-energy measurement-face';

const DEFAULT_EXECUTION_TRACE =
    '64 + 72 = 136 -> (-9) -> 127 = 2^7 - 1 = M_7 -> (+1) -> 128 = 2^7 -> (+9) -> 137 -> (+delta) -> 137.035999...';

const DEFAULT_THIRD_SPANDA_FORMS: readonly Omit<ThirdSpandaCanonicalForm, 'active'>[] = Object.freeze([
    Object.freeze({
        id: 'mersenne',
        label: 'Mersenne view',
        equation: '137 = (2^7 - 1) + 1 + 9',
        warrant: 'M_7 ground + parent-seal + wholeness-dressing'
    }),
    Object.freeze({
        id: 'binary',
        label: 'Binary view',
        equation: '137 = 128 + 9',
        warrant: 'binary closure + wholeness'
    }),
    Object.freeze({
        id: 'octave-field',
        label: 'Octave-field view',
        equation: '137 = 8(17) + 1',
        warrant: 'octave-applied-to-(octave+wholeness) + parent'
    }),
    Object.freeze({
        id: 'spanda-bridge',
        label: 'Spanda-bridge view',
        equation: '137 = 64 + 2(36) + 1',
        warrant: 'Mahamaya + doubled recognition-square + parent'
    }),
    Object.freeze({
        id: 'm-stack',
        label: 'M-stack view',
        equation: '9_M2 = 8_M3 + 1_M1',
        warrant: 'M2 wholeness-gap bridges M3 discontinuity markers and the M1 parent unit'
    })
]);

const DEFAULT_PHYSICS_DESCENT: readonly string[] = Object.freeze([
    'G_SM',
    'D_mu',
    '(g3,g2,gY)',
    'RG',
    'EW breaking',
    'e(mu)',
    'alpha_EM(mu)',
    'alpha_EM(0)'
]);

const DEFAULT_QCD_UNDERBODY: readonly string[] = Object.freeze([
    'SU(3)c',
    'alpha_s',
    '8+1',
    'Lambda_QCD',
    'proton',
    'hydrogen spectrum'
]);

const DEFAULT_ALIGNMENT: CouplingFlowAlignmentBoundary = Object.freeze({
    thirdSpandaForms: canonicalForms([]),
    executionOrderTrace: DEFAULT_EXECUTION_TRACE,
    translationRule: Object.freeze({
        statement: '9_{M_2} = 8_{M_3} + 1_{M_1}',
        qcdAnalogue: '3 x 3bar = 8 + 1',
        warrant: 'Plain label 9_M2 = 8_M3 + 1_M1; M2 wholeness-gap projects as M3 discontinuity markers plus the M1 parent unit'
    }),
    sevenEightNineSpine: Object.freeze({
        seven: '7 (action/generator)',
        eight: '8 (octave-field)',
        nine: '9 (wholeness/recognition)'
    }),
    physicsDescent: DEFAULT_PHYSICS_DESCENT,
    qcdUnderbody: DEFAULT_QCD_UNDERBODY,
    measurementCaveat: CANONICAL_CAVEAT,
    recognitionContextWarrant:
        'recognition_context remains a Nara/Epii handoff warrant; no protected body text is loaded by M3',
    skeletonEventsActive: Object.freeze([]),
    sourceWarrant:
        'source-warrant display from kernel-canon Third Spanda alignment; renderer performs no physical-constant calculation'
});

export function couplingFlowAlignmentFromProfilePayload(
    payload: Readonly<Record<string, unknown>> | undefined
): CouplingFlowAlignmentBoundary {
    const alignment = objectValue(payload?.couplingFlowAlignment ?? payload?.coupling_flow_alignment);
    if (!alignment) {
        return DEFAULT_ALIGNMENT;
    }

    const skeletonEvents = skeletonEventsFrom(alignment.skeletonEventsActive ?? alignment.skeleton_events_active);
    const providedForms = formsFrom(alignment.thirdSpandaForms ?? alignment.third_spanda_forms);
    return Object.freeze({
        thirdSpandaForms: providedForms.length === 5 ? providedForms : canonicalForms(skeletonEvents),
        executionOrderTrace: stringValue(alignment.executionOrderTrace ?? alignment.execution_order_trace) ?? DEFAULT_EXECUTION_TRACE,
        translationRule: translationRuleFrom(alignment.translationRule ?? alignment.translation_rule),
        sevenEightNineSpine: spineFrom(alignment.sevenEightNineSpine ?? alignment.seven_eight_nine_spine),
        physicsDescent: stringArrayFrom(alignment.physicsDescent ?? alignment.physics_descent, DEFAULT_PHYSICS_DESCENT),
        qcdUnderbody: stringArrayFrom(alignment.qcdUnderbody ?? alignment.qcd_underbody, DEFAULT_QCD_UNDERBODY),
        measurementCaveat: stringValue(alignment.measurementCaveat ?? alignment.measurement_caveat) ?? CANONICAL_CAVEAT,
        recognitionContextWarrant:
            stringValue(alignment.recognitionContextWarrant ?? alignment.recognition_context_warrant) ??
            DEFAULT_ALIGNMENT.recognitionContextWarrant,
        skeletonEventsActive: Object.freeze(skeletonEvents),
        sourceWarrant: stringValue(alignment.sourceWarrant ?? alignment.source_warrant) ?? DEFAULT_ALIGNMENT.sourceWarrant
    });
}

export const ThirdSpandaMathemeProofPanel: React.FC<ThirdSpandaMathemeProofPanelProps> = ({
    surface,
    couplingFlowAlignment = DEFAULT_ALIGNMENT
}) => {
    const profileTick = useM3ProfileTick();
    const inheritedReadiness = useM3Readiness();
    const provenanceHandles = surface.provenance.map(handle => handle.handle);
    return (
        <article
            className="m3-third-spanda-matheme-proof"
            data-widget-id="pratibimba.m3-mahamaya:third-spanda-matheme-proof"
            data-provenance="source-warrant"
            data-profile-tick={profileTick.tick ?? 'pending'}
            data-context-readiness={inheritedReadiness.snapshot.state}
            style={rootStyle}
        >
            <header style={headerStyle}>
                <div>
                    <h3 style={titleStyle}>Coupling-flow / measurement-face inspector</h3>
                    <p style={subtitleStyle}>
                        symbolic skeleton, physics_descent, measurement-face, and recognition_context
                    </p>
                </div>
                <ReadinessChip
                    bindingKey="profile.couplingFlowAlignment.sourceWarrant"
                    style={warrantPillStyle}
                >
                    source-warrant
                </ReadinessChip>
            </header>

            <div style={laneGridStyle}>
                <section data-lane="symbolic_skeleton" style={laneStyle} aria-label="symbolic skeleton">
                    <LaneTitle label="Symbolic skeleton" register="symbolic_skeleton" />
                    <div style={spineRowStyle}>
                        <SpineChip label={couplingFlowAlignment.sevenEightNineSpine.seven} />
                        <SpineChip label={couplingFlowAlignment.sevenEightNineSpine.eight} />
                        <SpineChip label={couplingFlowAlignment.sevenEightNineSpine.nine} />
                    </div>
                    <div style={formGridStyle}>
                        {couplingFlowAlignment.thirdSpandaForms.map(form => (
                            <CanonicalFormCard key={form.id} form={form} />
                        ))}
                    </div>
                    <TraceStrip
                        trace={couplingFlowAlignment.executionOrderTrace}
                        active={couplingFlowAlignment.skeletonEventsActive.includes('SpandaCrownBifurcation')}
                    />
                    <div style={translationStyle}>
                        <strong>{couplingFlowAlignment.translationRule.statement}</strong>
                        <span>{couplingFlowAlignment.translationRule.qcdAnalogue}</span>
                        <small>{couplingFlowAlignment.translationRule.warrant}</small>
                    </div>
                </section>

                <section data-lane="physics_descent" style={laneStyle} aria-label="physics descent">
                    <LaneTitle label="Physics descent" register="physics_descent" />
                    <FlowLine items={couplingFlowAlignment.physicsDescent} />
                    <h4 style={microHeadingStyle}>QCD underbody</h4>
                    <FlowLine items={couplingFlowAlignment.qcdUnderbody} />
                    <p style={finePrintStyle}>
                        This lane displays source-warrant descent labels only; RG flow, electroweak
                        coupling relations, QCD corrections, and experimental constants remain outside the renderer.
                    </p>
                </section>

                <section data-lane="measurement_face" style={laneStyle} aria-label="measurement face">
                    <LaneTitle label="Measurement face" register="measurement_face" />
                    <p style={caveatStyle}>{couplingFlowAlignment.measurementCaveat}</p>
                    <p style={finePrintStyle}>
                        The inspector keeps the integer skeleton and dressed low-energy measurement-face
                        in distinct registers.
                    </p>
                </section>

                <section data-lane="recognition_context" style={laneStyle} aria-label="recognition context">
                    <LaneTitle label="Recognition context" register="recognition_context" />
                    <p style={recognitionStyle}>{couplingFlowAlignment.recognitionContextWarrant}</p>
                    <dl style={provenanceListStyle}>
                        <dt>profile generation</dt>
                        <dd>
                            <ReadinessChip bindingKey="surface.profileGeneration">
                                {surface.profileGeneration}
                            </ReadinessChip>
                        </dd>
                        <dt>profile bus handles</dt>
                        <dd>
                            <ReadinessChip
                                bindingKey="surface.provenance"
                                state={provenanceHandles.length > 0 ? 'ready' : 'pending'}
                            >
                                {provenanceHandles.join(' / ') || 'pending profile-bus provenance'}
                            </ReadinessChip>
                        </dd>
                    </dl>
                </section>
            </div>

            <footer style={footerStyle}>{couplingFlowAlignment.sourceWarrant}</footer>
        </article>
    );
};

export default ThirdSpandaMathemeProofPanel;

const LaneTitle: React.FC<{ readonly label: string; readonly register: string }> = ({ label, register }) => (
    <header style={laneHeaderStyle}>
        <h4 style={laneTitleStyle}>{label}</h4>
        <code style={registerStyle}>{register}</code>
    </header>
);

const CanonicalFormCard: React.FC<{ readonly form: ThirdSpandaCanonicalForm }> = ({ form }) => (
    <article
        data-canonical-form={form.id}
        data-active={form.active ? 'true' : 'false'}
        style={{
            ...formCardStyle,
            borderColor: form.active ? 'var(--theia-charts-yellow)' : 'var(--theia-contrastBorder)'
        }}
    >
        <strong>{form.label}</strong>
        <code>{form.equation}</code>
        <span>{form.warrant}</span>
    </article>
);

const SpineChip: React.FC<{ readonly label: string }> = ({ label }) => (
    <span style={spineChipStyle}>{label}</span>
);

const TraceStrip: React.FC<{ readonly trace: string; readonly active: boolean }> = ({ trace, active }) => {
    const crownSegment = '127 = 2^7 - 1 = M_7 -> (+1) -> 128 = 2^7';
    const crownIndex = trace.indexOf(crownSegment);
    const hasCrownSegment = active && crownIndex >= 0;
    return (
        <div
            data-trace="execution-order"
            data-active={active ? 'true' : 'false'}
            style={{
                ...traceStyle,
                borderColor: active ? 'var(--theia-charts-yellow)' : 'var(--theia-contrastBorder)'
            }}
        >
            {hasCrownSegment ? (
                <>
                    {trace.slice(0, crownIndex)}
                    <span data-trace-highlight="SpandaCrownBifurcation" style={traceSegmentActiveStyle}>
                        {crownSegment}
                    </span>
                    {trace.slice(crownIndex + crownSegment.length)}
                </>
            ) : (
                trace
            )}
        </div>
    );
};

const FlowLine: React.FC<{ readonly items: readonly string[] }> = ({ items }) => (
    <ol style={flowListStyle}>
        {items.map((item, index) => (
            <li key={`${item}-${index}`} style={flowItemStyle}>
                {item}
            </li>
        ))}
    </ol>
);

function canonicalForms(events: readonly ThirdSpandaSkeletonEvent[]): readonly ThirdSpandaCanonicalForm[] {
    return Object.freeze(
        DEFAULT_THIRD_SPANDA_FORMS.map(form =>
            Object.freeze({
                ...form,
                active:
                    (form.id === 'mersenne' && events.includes('MersenneM7Ground')) ||
                    (form.id === 'spanda-bridge' && events.includes('Additive137'))
            })
        )
    );
}

function formsFrom(value: unknown): readonly ThirdSpandaCanonicalForm[] {
    if (!Array.isArray(value)) {
        return Object.freeze([]);
    }
    const forms = value
        .map(entry => objectValue(entry))
        .filter((entry): entry is Readonly<Record<string, unknown>> => entry !== null)
        .map(entry => {
            const id = formIdValue(entry.id);
            const canonical = DEFAULT_THIRD_SPANDA_FORMS.find(form => form.id === id);
            return Object.freeze({
                id,
                label: stringValue(entry.label) ?? canonical?.label ?? id,
                equation: stringValue(entry.equation) ?? canonical?.equation ?? '',
                warrant: stringValue(entry.warrant) ?? canonical?.warrant ?? 'profile-bus supplied form',
                active: entry.active === true
            });
        });
    return Object.freeze(forms);
}

function translationRuleFrom(value: unknown): ThirdSpandaTranslationRule {
    const rule = objectValue(value);
    if (!rule) {
        return DEFAULT_ALIGNMENT.translationRule;
    }
    return Object.freeze({
        statement: stringValue(rule.statement) ?? DEFAULT_ALIGNMENT.translationRule.statement,
        qcdAnalogue:
            stringValue(rule.qcdAnalogue ?? rule.qcd_analogue) ?? DEFAULT_ALIGNMENT.translationRule.qcdAnalogue,
        warrant: stringValue(rule.warrant) ?? DEFAULT_ALIGNMENT.translationRule.warrant
    });
}

function spineFrom(value: unknown): CouplingFlowAlignmentBoundary['sevenEightNineSpine'] {
    const spine = objectValue(value);
    if (!spine) {
        return DEFAULT_ALIGNMENT.sevenEightNineSpine;
    }
    return Object.freeze({
        seven: stringValue(spine.seven) ?? DEFAULT_ALIGNMENT.sevenEightNineSpine.seven,
        eight: stringValue(spine.eight) ?? DEFAULT_ALIGNMENT.sevenEightNineSpine.eight,
        nine: stringValue(spine.nine) ?? DEFAULT_ALIGNMENT.sevenEightNineSpine.nine
    });
}

function stringArrayFrom(value: unknown, fallback: readonly string[]): readonly string[] {
    if (!Array.isArray(value)) {
        return fallback;
    }
    const items = value.map(item => stringValue(item)).filter((item): item is string => item !== null);
    return items.length > 0 ? Object.freeze(items) : fallback;
}

function skeletonEventsFrom(value: unknown): readonly ThirdSpandaSkeletonEvent[] {
    if (!Array.isArray(value)) {
        return Object.freeze([]);
    }
    return Object.freeze(value.filter(isSkeletonEvent));
}

function isSkeletonEvent(value: unknown): value is ThirdSpandaSkeletonEvent {
    return value === 'Additive137' || value === 'MersenneM7Ground' || value === 'SpandaCrownBifurcation';
}

function formIdValue(value: unknown): ThirdSpandaCanonicalFormId {
    if (
        value === 'mersenne' ||
        value === 'binary' ||
        value === 'octave-field' ||
        value === 'spanda-bridge' ||
        value === 'm-stack'
    ) {
        return value;
    }
    return 'm-stack';
}

function objectValue(value: unknown): Readonly<Record<string, unknown>> | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? value as Readonly<Record<string, unknown>>
        : null;
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

const warrantPillStyle: React.CSSProperties = {
    alignSelf: 'flex-start',
    border: '1px solid var(--theia-charts-blue)',
    borderRadius: 999,
    color: 'var(--theia-charts-blue)',
    padding: '2px 8px',
    fontSize: 'var(--theia-ui-font-size0)',
    textTransform: 'uppercase'
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

const spineRowStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10
};

const spineChipStyle: React.CSSProperties = {
    border: '1px solid var(--theia-charts-green)',
    borderRadius: 999,
    color: 'var(--theia-charts-green)',
    padding: '2px 8px',
    fontSize: 'var(--theia-ui-font-size0)'
};

const formGridStyle: React.CSSProperties = {
    display: 'grid',
    gap: 8
};

const formCardStyle: React.CSSProperties = {
    display: 'grid',
    gap: 4,
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 6,
    padding: 8
};

const traceStyle: React.CSSProperties = {
    marginTop: 10,
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 6,
    padding: 8,
    fontFamily: 'var(--theia-monospace-font-family)',
    fontSize: 'var(--theia-ui-font-size1)'
};

const traceSegmentActiveStyle: React.CSSProperties = {
    color: 'var(--theia-charts-yellow)',
    fontWeight: 700
};

const translationStyle: React.CSSProperties = {
    display: 'grid',
    gap: 4,
    marginTop: 10,
    color: 'var(--theia-descriptionForeground)'
};

const microHeadingStyle: React.CSSProperties = {
    margin: '12px 0 8px',
    fontSize: 'var(--theia-ui-font-size1)',
    fontWeight: 600
};

const flowListStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    listStyle: 'none',
    margin: 0,
    padding: 0
};

const flowItemStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 6,
    padding: '3px 7px',
    fontFamily: 'var(--theia-monospace-font-family)',
    fontSize: 'var(--theia-ui-font-size0)'
};

const caveatStyle: React.CSSProperties = {
    borderLeft: '3px solid var(--theia-charts-yellow)',
    margin: 0,
    padding: '4px 0 4px 10px',
    fontWeight: 600
};

const finePrintStyle: React.CSSProperties = {
    color: 'var(--theia-descriptionForeground)',
    fontSize: 'var(--theia-ui-font-size1)',
    margin: '10px 0 0'
};

const recognitionStyle: React.CSSProperties = {
    margin: 0
};

const provenanceListStyle: React.CSSProperties = {
    display: 'grid',
    gap: 4,
    margin: '10px 0 0'
};

const footerStyle: React.CSSProperties = {
    marginTop: 12,
    color: 'var(--theia-descriptionForeground)',
    fontSize: 'var(--theia-ui-font-size1)'
};
