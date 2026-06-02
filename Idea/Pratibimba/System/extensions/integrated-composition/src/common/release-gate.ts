import { IntegratedEvidenceEnvelope } from './evidence-envelope';
import {
    IntegratedObservabilityEvent,
    IntegratedViewState
} from './integrated-state';
import { IntegratedWorkspaceSnapshot } from './workspace-persistence';

export type IntegratedPluginId =
    | 'plugin-integrated-1-2-3'
    | 'plugin-integrated-4-5-0';

export type ReleaseLevel = 'blocked' | 'alpha' | 'beta' | 'production';

export type PerformanceBudgetMetric =
    | 'firstMeaningfulRenderMs'
    | 'profileUpdatePropagationMs'
    | 'visibleReadinessUpdateMs'
    | 'miniInspectorOpenMs'
    | 'evidenceEnvelopeCreationMs'
    | 'graphOrCityOverlayRenderMs'
    | 'protectedOpenGateLatencyMs';

export type IntegratedPerformanceBudget = Readonly<Record<PerformanceBudgetMetric, number>>;
export type IntegratedPerformanceMeasurements =
    Readonly<Partial<Record<PerformanceBudgetMetric, number>>>;

export const INTEGRATED_PERFORMANCE_BUDGETS: Readonly<
    Record<IntegratedPluginId, IntegratedPerformanceBudget>
> = Object.freeze({
    'plugin-integrated-1-2-3': Object.freeze({
        firstMeaningfulRenderMs: 900,
        profileUpdatePropagationMs: 120,
        visibleReadinessUpdateMs: 160,
        miniInspectorOpenMs: 180,
        evidenceEnvelopeCreationMs: 75,
        graphOrCityOverlayRenderMs: 700,
        protectedOpenGateLatencyMs: 0
    }),
    'plugin-integrated-4-5-0': Object.freeze({
        firstMeaningfulRenderMs: 1100,
        profileUpdatePropagationMs: 120,
        visibleReadinessUpdateMs: 160,
        miniInspectorOpenMs: 220,
        evidenceEnvelopeCreationMs: 90,
        graphOrCityOverlayRenderMs: 900,
        protectedOpenGateLatencyMs: 200
    })
});

export interface IntegratedAccessibilitySmoke {
    readonly keyboardActivation: boolean;
    readonly commandPaletteDiscoverable: boolean;
    readonly screenReaderReadinessLabels: boolean;
    readonly screenReaderEvidenceLabels: boolean;
    readonly reducedMotionHonored: boolean;
    readonly nonAudioOperation: boolean;
    readonly noColorOnlyState: boolean;
}

export const INTEGRATED_ACCESSIBILITY_EXPECTATIONS: readonly (keyof IntegratedAccessibilitySmoke)[] =
    Object.freeze([
        'keyboardActivation',
        'commandPaletteDiscoverable',
        'screenReaderReadinessLabels',
        'screenReaderEvidenceLabels',
        'reducedMotionHonored',
        'nonAudioOperation',
        'noColorOnlyState'
    ]);

export interface IntegratedPrivacyAuditSurfaces {
    readonly uiState: unknown;
    readonly workspaceState: IntegratedWorkspaceSnapshot | unknown;
    readonly evidenceEnvelopes: readonly IntegratedEvidenceEnvelope[];
    readonly observabilityEvents: readonly IntegratedObservabilityEvent[];
    readonly s3Rows: readonly unknown[];
    readonly s5Dtos: readonly unknown[];
}

export interface UpstreamReadinessForRelease {
    readonly track01KernelBridge: 'blocked' | 'degraded' | 'ready';
    readonly track02GraphPayloads: 'blocked' | 'degraded' | 'ready';
    readonly track03GatewayStream: 'blocked' | 'degraded' | 'ready';
    readonly track04S5Review: 'blocked' | 'degraded' | 'ready';
    readonly track07IndividualExtensions: 'blocked' | 'degraded' | 'ready';
    readonly namedAlphaBlockers: readonly string[];
}

export interface IntegratedReleaseGateInput {
    readonly pluginId: IntegratedPluginId;
    readonly viewState: IntegratedViewState;
    readonly performance: IntegratedPerformanceMeasurements;
    readonly accessibility: IntegratedAccessibilitySmoke;
    readonly privacySurfaces: IntegratedPrivacyAuditSurfaces;
    readonly upstream: UpstreamReadinessForRelease;
    readonly acceptanceScenariosPassed: boolean;
}

export interface ReleaseViolation {
    readonly surface:
        | 'performance'
        | 'accessibility'
        | 'privacy'
        | 'acceptance'
        | 'upstream';
    readonly path: string;
    readonly message: string;
}

export interface IntegratedReleaseGateReport {
    readonly pluginId: IntegratedPluginId;
    readonly requestedAtProfileGeneration: number | null;
    readonly releaseLevel: ReleaseLevel;
    readonly privacyViolations: readonly ReleaseViolation[];
    readonly performanceViolations: readonly ReleaseViolation[];
    readonly accessibilityViolations: readonly ReleaseViolation[];
    readonly upstreamViolations: readonly ReleaseViolation[];
    readonly blockers: readonly string[];
    readonly budgets: IntegratedPerformanceBudget;
}

const FORBIDDEN_KEY_PATTERNS: readonly RegExp[] = Object.freeze([
    /^q_b$/i,
    /^q_p$/i,
    /^q_personal/i,
    /^q_nara/i,
    /^bioquaternion(_raw|_body|_personal)?$/i,
    /^protected_(natal|birth)_data/i,
    /^birth_(date|time|place|chart|data)$/i,
    /^natal_(chart|data|raw)$/i,
    /^journal_(body|text|raw|entry)/i,
    /^dream_(body|text|raw)/i,
    /^oracle_(interpretation_body|body|text|raw)/i,
    /^graphiti_(body|content|raw|episode_body)/i,
    /^identity_(raw|hash|private|data)/i,
    /^private_identity/i,
    /^personal_field_(body|raw)/i
]);

const FORBIDDEN_VALUE_PATTERNS: readonly RegExp[] = Object.freeze([
    /<protected:body>/i,
    /<protected:journal>/i,
    /<protected:dream>/i,
    /<protected:oracle>/i,
    /<bioquaternion:raw:/i,
    /raw graphiti episode body/i
]);

export function auditIntegratedReleaseGate(
    input: IntegratedReleaseGateInput
): IntegratedReleaseGateReport {
    const budgets = INTEGRATED_PERFORMANCE_BUDGETS[input.pluginId];
    const privacyViolations = auditPrivacySurfaces(input.privacySurfaces);
    const performanceViolations = auditPerformance(input.pluginId, input.performance);
    const accessibilityViolations = auditAccessibility(input.accessibility);
    const upstreamViolations = auditUpstream(input.upstream);
    const acceptanceViolations = input.acceptanceScenariosPassed
        ? []
        : [violation('acceptance', 'acceptanceScenariosPassed', 'acceptance scenarios have not passed')];
    const allBlockers = [
        ...privacyViolations,
        ...performanceViolations,
        ...accessibilityViolations,
        ...upstreamViolations,
        ...acceptanceViolations
    ].map(v => `${v.surface}:${v.path}:${v.message}`);
    const releaseLevel = decideReleaseLevel({
        privacyViolations,
        performanceViolations,
        accessibilityViolations,
        upstreamViolations,
        acceptanceViolations,
        upstream: input.upstream
    });

    return Object.freeze({
        pluginId: input.pluginId,
        requestedAtProfileGeneration: input.viewState.profileGeneration,
        releaseLevel,
        privacyViolations: Object.freeze(privacyViolations),
        performanceViolations: Object.freeze(performanceViolations),
        accessibilityViolations: Object.freeze(accessibilityViolations),
        upstreamViolations: Object.freeze(upstreamViolations),
        blockers: Object.freeze(allBlockers),
        budgets
    });
}

function decideReleaseLevel(input: {
    readonly privacyViolations: readonly ReleaseViolation[];
    readonly performanceViolations: readonly ReleaseViolation[];
    readonly accessibilityViolations: readonly ReleaseViolation[];
    readonly upstreamViolations: readonly ReleaseViolation[];
    readonly acceptanceViolations: readonly ReleaseViolation[];
    readonly upstream: UpstreamReadinessForRelease;
}): ReleaseLevel {
    if (
        input.privacyViolations.length > 0 ||
        input.performanceViolations.length > 0 ||
        input.accessibilityViolations.length > 0
    ) {
        return 'blocked';
    }
    if (input.acceptanceViolations.length > 0) {
        return input.upstream.namedAlphaBlockers.length > 0 ? 'alpha' : 'blocked';
    }
    if (input.upstreamViolations.length === 0) {
        return 'production';
    }
    const hasBlockedUpstream = input.upstreamViolations.some(v => /blocked/.test(v.message));
    return hasBlockedUpstream ? 'alpha' : 'beta';
}

function auditPerformance(
    pluginId: IntegratedPluginId,
    measurements: IntegratedPerformanceMeasurements
): readonly ReleaseViolation[] {
    const budgets = INTEGRATED_PERFORMANCE_BUDGETS[pluginId];
    const violations: ReleaseViolation[] = [];
    for (const metric of Object.keys(budgets) as PerformanceBudgetMetric[]) {
        const budget = budgets[metric];
        if (budget === 0) {
            continue;
        }
        const value = measurements[metric];
        if (typeof value !== 'number') {
            violations.push(violation('performance', metric, 'measurement missing'));
        } else if (value > budget) {
            violations.push(violation('performance', metric, `${value}ms exceeds ${budget}ms budget`));
        }
    }
    return violations;
}

function auditAccessibility(
    smoke: IntegratedAccessibilitySmoke
): readonly ReleaseViolation[] {
    return INTEGRATED_ACCESSIBILITY_EXPECTATIONS
        .filter(expectation => smoke[expectation] !== true)
        .map(expectation =>
            violation('accessibility', expectation, 'accessibility smoke expectation failed')
        );
}

function auditUpstream(
    upstream: UpstreamReadinessForRelease
): readonly ReleaseViolation[] {
    const checks = {
        track01KernelBridge: upstream.track01KernelBridge,
        track02GraphPayloads: upstream.track02GraphPayloads,
        track03GatewayStream: upstream.track03GatewayStream,
        track04S5Review: upstream.track04S5Review,
        track07IndividualExtensions: upstream.track07IndividualExtensions
    };
    return Object.entries(checks)
        .filter(([, state]) => state !== 'ready')
        .map(([path, state]) =>
            violation(
                'upstream',
                path,
                `${state} upstream readiness requires named degraded mode before release`
            )
        );
}

function auditPrivacySurfaces(
    surfaces: IntegratedPrivacyAuditSurfaces
): readonly ReleaseViolation[] {
    const violations: ReleaseViolation[] = [];
    walkPrivacy(surfaces.uiState, 'uiState', violations);
    walkPrivacy(surfaces.workspaceState, 'workspaceState', violations);
    surfaces.evidenceEnvelopes.forEach((envelope, i) =>
        walkPrivacy(envelope, `evidenceEnvelopes[${i}]`, violations)
    );
    surfaces.observabilityEvents.forEach((event, i) =>
        walkPrivacy(event, `observabilityEvents[${i}]`, violations)
    );
    surfaces.s3Rows.forEach((row, i) => walkPrivacy(row, `s3Rows[${i}]`, violations));
    surfaces.s5Dtos.forEach((dto, i) => walkPrivacy(dto, `s5Dtos[${i}]`, violations));
    return violations;
}

function walkPrivacy(value: unknown, path: string, violations: ReleaseViolation[]): void {
    if (value === null || value === undefined) {
        return;
    }
    if (typeof value === 'string') {
        for (const re of FORBIDDEN_VALUE_PATTERNS) {
            if (re.test(value)) {
                violations.push(violation('privacy', path, `contains forbidden marker ${re.source}`));
            }
        }
        return;
    }
    if (typeof value !== 'object') {
        return;
    }
    if (Array.isArray(value)) {
        value.forEach((child, i) => walkPrivacy(child, `${path}[${i}]`, violations));
        return;
    }
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        const childPath = `${path}.${key}`;
        for (const re of FORBIDDEN_KEY_PATTERNS) {
            if (re.test(key)) {
                violations.push(violation('privacy', childPath, `matches forbidden key ${re.source}`));
            }
        }
        walkPrivacy(child, childPath, violations);
    }
}

function violation(
    surface: ReleaseViolation['surface'],
    path: string,
    message: string
): ReleaseViolation {
    return Object.freeze({ surface, path, message });
}
