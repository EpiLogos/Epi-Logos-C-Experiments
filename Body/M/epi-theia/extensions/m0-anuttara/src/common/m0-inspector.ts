import {
    CoordinateContext,
    MathemeHarmonicProfileBoundary,
    MExtensionReadinessSnapshot
} from '@pratibimba/m-extension-runtime';
import { M0_LAYER_VIEWS, M0LayerView } from './m0-layers';

export { M0_LAYER_VIEWS };
export type { M0LayerView };

const M0_PRIVACY_CLASS = 'public_current_with_graph_provenance';

export type M0ProvenanceState =
    | 'canonical'
    | 'canonical_absent'
    | 'derived'
    | 'inferred'
    | 'review_pending'
    | 'blocked';

export interface M0ProvenancedField {
    readonly key: string;
    readonly label: string;
    readonly value: string | null;
    readonly state: M0ProvenanceState;
    readonly provenance: string;
}

export interface M0GraphReadinessFact {
    readonly id: string;
    readonly label: string;
    readonly state: M0ProvenanceState;
    readonly summary: string;
    readonly canonical: boolean;
    readonly provenance: string;
}

export interface M0GatewayAction {
    readonly id: string;
    readonly label: string;
    readonly method: string;
    readonly params: Readonly<Record<string, unknown>>;
    readonly mutatesGraphCanon: false;
}

export interface M0InspectorModel {
    readonly query: {
        readonly input: string | null;
        readonly canonicalMCoordinate: string | null;
        readonly hashCompatible: boolean;
    };
    readonly node: {
        readonly coordinate: string | null;
        readonly label: string | null;
        readonly namespace: string | null;
        readonly badges: readonly string[];
    };
    readonly layerViews: readonly M0LayerView[];
    readonly languageFields: readonly M0ProvenancedField[];
    readonly anchors: readonly M0ProvenancedField[];
    readonly pointerSummary: M0ProvenancedField;
    readonly relationFamilies: readonly M0ProvenancedField[];
    readonly readinessFacts: readonly M0GraphReadinessFact[];
    readonly routeTargets: readonly string[];
    readonly actions: readonly M0GatewayAction[];
    readonly pedagogy: {
        readonly priorGroundBoundary: string;
        readonly parentAttribution: string;
        readonly contradiction: string;
    };
    readonly renderBudgetMs: 100;
}

export interface M0GraphNodePayload {
    readonly coordinate?: unknown;
    readonly canonicalCoordinate?: unknown;
    readonly label?: unknown;
    readonly labels?: unknown;
    readonly namespace?: unknown;
    readonly properties?: unknown;
    readonly pointerSummary?: unknown;
    readonly pointer_web?: unknown;
    readonly anchors?: unknown;
    readonly relations?: unknown;
    readonly readiness?: unknown;
}

export function normalizeM0CoordinateInput(input: string | null | undefined): {
    readonly input: string | null;
    readonly canonicalMCoordinate: string | null;
    readonly hashCompatible: boolean;
} {
    const raw = input?.trim() ?? '';
    if (!raw) {
        return Object.freeze({
            input: null,
            canonicalMCoordinate: null,
            hashCompatible: false
        });
    }
    const hashMatch = /^#([0-5])(?:\b|$)/.exec(raw);
    if (hashMatch) {
        return Object.freeze({
            input: raw,
            canonicalMCoordinate: `M${hashMatch[1]}`,
            hashCompatible: true
        });
    }
    const mMatch = /^(?:M|m)([0-5])(?:['.]|\b|$)/.exec(raw);
    if (mMatch) {
        return Object.freeze({
            input: raw,
            canonicalMCoordinate: `M${mMatch[1]}`,
            hashCompatible: false
        });
    }
    return Object.freeze({
        input: raw,
        canonicalMCoordinate: null,
        hashCompatible: false
    });
}

export function buildM0InspectorModel(input: {
    readonly selectedInput?: string | null;
    readonly graphNode?: M0GraphNodePayload | null;
    readonly profile?: MathemeHarmonicProfileBoundary | null;
    readonly readiness: MExtensionReadinessSnapshot;
    readonly context: CoordinateContext;
}): M0InspectorModel {
    const query = normalizeM0CoordinateInput(
        input.selectedInput ??
            input.context.hashInput ??
            input.context.selectedCoordinate ??
            input.context.canonicalMCoordinate
    );
    const properties = objectValue(input.graphNode?.properties);
    const coordinate =
        stringValue(input.graphNode?.canonicalCoordinate) ??
        stringValue(input.graphNode?.coordinate) ??
        stringValue(properties?.canonical_coordinate) ??
        stringValue(properties?.coordinate) ??
        query.canonicalMCoordinate;
    const namespace =
        stringValue(input.graphNode?.namespace) ??
        stringValue(properties?.namespace) ??
        stringValue(properties?.graph_namespace);
    const label = stringValue(input.graphNode?.label) ?? stringValue(properties?.label);

    return Object.freeze({
        query,
        node: Object.freeze({
            coordinate,
            label,
            namespace,
            badges: Object.freeze(nodeBadges(input.graphNode, namespace))
        }),
        layerViews: M0_LAYER_VIEWS,
        languageFields: Object.freeze([
            field('symbol', 'Symbol', properties?.symbol, 'canonical_absent'),
            field(
                'formulation_type',
                'Formulation type',
                properties?.formulation_type,
                'canonical_absent'
            ),
            field(
                'complete_formulation',
                'Complete formulation',
                properties?.complete_formulation,
                'canonical_absent'
            )
        ]),
        anchors: Object.freeze(anchorFields(input.graphNode?.anchors ?? properties?.anchors)),
        pointerSummary: pointerField(input.graphNode, properties, input.profile ?? null),
        relationFamilies: Object.freeze(relationFamilyFields(input.graphNode, properties)),
        readinessFacts: Object.freeze(readinessFacts(input.graphNode, input.readiness)),
        routeTargets: Object.freeze(['M1', 'M2', 'M3', 'M4', 'M5']),
        actions: Object.freeze(actions(coordinate, input)),
        pedagogy: Object.freeze({
            priorGroundBoundary:
                'M0 is the prior 0/1 ground that M1 receives; it does not absorb the +1 parent.',
            parentAttribution:
                'The 137 = 64 + 72 + 1 teaching routes the +1 parent through M1/M2/M3 detail.',
            contradiction:
                'DCC-01: residual alpha wording can read M0 as witness-axis +1; this surface follows M0-SPEC and M1-SPEC while keeping the contradiction visible.'
        }),
        renderBudgetMs: 100 as const
    });
}

function field(
    key: string,
    label: string,
    raw: unknown,
    absentState: M0ProvenanceState
): M0ProvenancedField {
    const value = stringValue(raw);
    return Object.freeze({
        key,
        label,
        value,
        state: value ? 'canonical' : absentState,
        provenance: value
            ? 'S2 graph payload property'
            : 'Canonical absence from S2 graph payload; not a client extraction failure'
    });
}

function anchorFields(raw: unknown): M0ProvenancedField[] {
    const anchors = objectValue(raw);
    return ['source', 'spec', 'code', 'test'].map(key =>
        field(`${key}_anchor`, `${key} anchor`, anchors?.[key], 'canonical_absent')
    );
}

function pointerField(
    node: M0GraphNodePayload | null | undefined,
    properties: Record<string, unknown> | undefined,
    profile: MathemeHarmonicProfileBoundary | null
): M0ProvenancedField {
    const pointer = objectValue(node?.pointer_web ?? properties?.pointer_web);
    const summary =
        stringValue(node?.pointerSummary) ??
        stringValue(pointer?.summary) ??
        stringValue(profile?.payload?.pointer_summary);
    return Object.freeze({
        key: 'pointer_summary',
        label: 'Pointer-web summary',
        value: summary,
        state: summary ? 'derived' : 'blocked',
        provenance: summary
            ? 'S2 pointer-web payload or bridge profile payload'
            : 'Track 01/02 pointer anchor unavailable'
    });
}

function relationFamilyFields(
    node: M0GraphNodePayload | null | undefined,
    properties: Record<string, unknown> | undefined
): M0ProvenancedField[] {
    const fromProperties = Object.entries(properties ?? {})
        .filter(([key]) => /^c_[0-5]_family$/.test(key) || key === 'relation_family')
        .map(([key, value]) => field(key, key, value, 'canonical_absent'));
    const relations = arrayValue(node?.relations ?? properties?.relations).flatMap(item => {
        const relation = objectValue(item);
        const relationProperties = objectValue(relation?.properties);
        const family =
            stringValue(relationProperties?.family) ??
            stringValue(relationProperties?.c_family) ??
            stringValue(relation?.family);
        return family
            ? [
                  Object.freeze({
                      key: `relation:${stringValue(relation?.type) ?? 'edge'}`,
                      label: stringValue(relation?.type) ?? 'Relation family',
                      value: family,
                      state: 'canonical' as const,
                      provenance: 'S2 relation/property payload'
                  })
              ]
            : [];
    });
    return [...fromProperties, ...relations];
}

function readinessFacts(
    node: M0GraphNodePayload | null | undefined,
    readiness: MExtensionReadinessSnapshot
): M0GraphReadinessFact[] {
    const payload = objectValue(node?.readiness);
    return [
        fact('owl', 'OWL/n10s readiness', payload?.owl ?? payload?.n10s, readiness),
        fact('shacl', 'SHACL validation', payload?.shacl, readiness),
        fact('gds', 'GDS overlay handle', payload?.gds, readiness),
        fact('kernel-core', 'Kernel-core relation audit', payload?.kernel_core, readiness)
    ];
}

function fact(
    id: string,
    label: string,
    raw: unknown,
    fallback: MExtensionReadinessSnapshot
): M0GraphReadinessFact {
    const obj = objectValue(raw);
    const state = provenanceState(stringValue(obj?.state) ?? stringValue(raw), fallback);
    return Object.freeze({
        id,
        label,
        state,
        summary: stringValue(obj?.summary) ?? fallback.reason,
        canonical: state === 'canonical',
        provenance: stringValue(obj?.provenance) ?? 'S2 readiness payload'
    });
}

function actions(
    coordinate: string | null,
    input: {
        readonly profile?: MathemeHarmonicProfileBoundary | null;
        readonly context: CoordinateContext;
    }
): M0GatewayAction[] {
    const base = {
        coordinate,
        profileGeneration: input.profile?.generation ?? input.context.profileGeneration,
        pointerAnchor: input.profile?.pointerAnchor ?? input.context.pointerAnchor,
        privacyClass: M0_PRIVACY_CLASS,
        sourceExtensionId: 'm0-anuttara'
    };
    return [
        action('open-language-development-route', 'Open language-development route', "s5'.improve.propose", base),
        action('deposit-graph-readiness-evidence', 'Deposit graph readiness evidence', 's5.episodic.deposit', base),
        action('request-anuttara-review', 'Request Anuttara review', "s5'.review.submit", base)
    ];
}

function action(
    id: string,
    label: string,
    method: string,
    base: Readonly<Record<string, unknown>>
): M0GatewayAction {
    return Object.freeze({
        id,
        label,
        method,
        params: Object.freeze({
            ...base,
            targetKind: 'm0-anuttara.graph-language-readiness',
            mutatesGraphCanon: false
        }),
        mutatesGraphCanon: false as const
    });
}

function nodeBadges(
    node: M0GraphNodePayload | null | undefined,
    namespace: string | null
): string[] {
    const labels = arrayValue(node?.labels).filter((item): item is string => typeof item === 'string');
    return [namespace ? `namespace:${namespace}` : null, ...labels]
        .filter((item): item is string => Boolean(item))
        .filter(item => !/^family[_-]?c/i.test(item));
}

function provenanceState(
    raw: string | null,
    fallback: MExtensionReadinessSnapshot
): M0ProvenanceState {
    switch (raw) {
        case 'canonical':
        case 'canonical_absent':
        case 'derived':
        case 'inferred':
        case 'review_pending':
        case 'blocked':
            return raw;
        default:
            return fallback.state === 'ready_public_current' ? 'review_pending' : 'blocked';
    }
}

function objectValue(value: unknown): Record<string, unknown> | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : undefined;
}

function arrayValue(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value : null;
}
