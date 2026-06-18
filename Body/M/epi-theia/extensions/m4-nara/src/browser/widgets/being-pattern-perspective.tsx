import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    Disposable,
    MathemeHarmonicProfileBoundary,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import type {
    BeingPatternClockAddress,
    BeingPatternRelationEdge,
    ElementalWeightProjection,
    InhabitedBimbaEntityState,
    MonoPolyOperator,
    NaraFamilyRole,
    PerspectiveRole,
    PerspectiveRoleDisplayLabel
} from '@pratibimba/integrated-composition/integrated-readiness';
import {
    perspectiveRoleDisplayLabelFor,
    readCurrentInhabitedBimbaField
} from '@pratibimba/integrated-composition/integrated-readiness';
import { EXTENSION_ID } from '../../common';
import { privacyChromeClass, SURFACE_PRIVACY_TOOLTIP } from '../privacy-chrome';

export const BEING_PATTERN_PERSPECTIVE_VIEW_ID = 'm4.nara.beingPatternPerspective';
export const BEING_PATTERN_PERSPECTIVE_LABEL = 'M4 BeingPattern Perspective';
export const M4_BEING_PATTERN_PERSPECTIVE_EXPORT = 'M4BeingPatternPerspectiveCard' as const;
export const BEING_PATTERN_REVIEW_METHOD = 'm5.review.openBeingPatternCandidate';
export const BEING_PATTERN_PRIVACY_CLASS = 'protected_local_handle_only' as const;

export type RelationshipDialState =
    | 'one'
    | 'many'
    | 'true-many'
    | 'potentially-one'
    | 'review-forced-one'
    | 'generatively-many'
    | 'many-in-one';

export interface RelationshipDialSegment {
    readonly operator: MonoPolyOperator;
    readonly state: RelationshipDialState;
    readonly label: string;
    readonly summary: string;
}

export interface PerspectiveStripSegment {
    readonly role: PerspectiveRole;
    readonly label: PerspectiveRoleDisplayLabel;
}

export type CanonicalNaraFamilyRole =
    | 'Father'
    | 'Mother'
    | 'Son'
    | 'Daughter'
    | 'Tao'
    | 'IntegralConsciousness';

export interface BeingPatternVerifierRef {
    readonly key: string;
    readonly ref: string;
}

export interface BeingPatternPerspectiveModel {
    readonly viewId: typeof BEING_PATTERN_PERSPECTIVE_VIEW_ID;
    readonly privacyClass: typeof BEING_PATTERN_PRIVACY_CLASS;
    readonly entity: InhabitedBimbaEntityState;
    readonly entityHandle: string;
    readonly graphAnchor: string | null;
    readonly streamGeneration: number;
    readonly relationship: RelationshipDialSegment;
    readonly perspectiveRole: PerspectiveRole;
    readonly perspectiveLabel: PerspectiveRoleDisplayLabel;
    readonly naraFamilyRole: CanonicalNaraFamilyRole | null;
    readonly clockAddress: readonly [string, string][];
    readonly elementalWeights: readonly [string, number][];
    readonly relationEdgeCount: number;
    readonly foregroundRelation: BeingPatternRelationEdge | null;
    readonly verifierRefs: readonly BeingPatternVerifierRef[];
    readonly liveHandles: readonly string[];
    readonly reviewRisk: InhabitedBimbaEntityState['reviewRisk'];
    readonly reviewActionMethod: typeof BEING_PATTERN_REVIEW_METHOD | null;
}

export interface BuildBeingPatternPerspectiveOptions {
    readonly selectedEntityId?: string | null;
    readonly foregroundRelationEdgeId?: string | null;
}

export interface M4BeingPatternPerspectiveCardProps extends BuildBeingPatternPerspectiveOptions {
    readonly profile?: MathemeHarmonicProfileBoundary | null;
    readonly model?: BeingPatternPerspectiveModel | null;
    readonly onOpenReviewCandidate?: (model: BeingPatternPerspectiveModel) => void;
}

export const MONOPOLY_DIAL_SEGMENTS: readonly RelationshipDialSegment[] = Object.freeze([
    Object.freeze({
        operator: 'Mono',
        state: 'one',
        label: 'one',
        summary: 'single live anchor'
    }),
    Object.freeze({
        operator: 'Poly',
        state: 'many',
        label: 'many',
        summary: 'plural live field'
    }),
    Object.freeze({
        operator: 'ActuallyMany',
        state: 'true-many',
        label: 'true many',
        summary: 'actually many entities'
    }),
    Object.freeze({
        operator: 'PotentiallyOne',
        state: 'potentially-one',
        label: 'potentially one',
        summary: 'possible shared pattern'
    }),
    Object.freeze({
        operator: 'ActualisingOne',
        state: 'review-forced-one',
        label: 'review risk',
        summary: 'forced unity candidate'
    }),
    Object.freeze({
        operator: 'PotentiatingMany',
        state: 'generatively-many',
        label: 'generatively many',
        summary: 'differentiating field'
    }),
    Object.freeze({
        operator: 'MonoPoly',
        state: 'many-in-one',
        label: 'many-in-one',
        summary: 'held one and many'
    })
]);

export const PERSPECTIVE_STRIP_SEGMENTS: readonly PerspectiveStripSegment[] = Object.freeze([
    Object.freeze({ role: 'FirstPerson', label: 'I' }),
    Object.freeze({ role: 'SecondPerson', label: 'You' }),
    Object.freeze({ role: 'FirstPersonPlural', label: 'You-and-I' }),
    Object.freeze({ role: 'ThirdPerson', label: 'They' }),
    Object.freeze({ role: 'CollectiveWe', label: 'We' }),
    Object.freeze({ role: 'IntegralWeI', label: 'We-I' })
]);

export const NARA_FAMILY_ROLES: readonly CanonicalNaraFamilyRole[] = Object.freeze([
    'Father',
    'Mother',
    'Son',
    'Daughter',
    'Tao',
    'IntegralConsciousness'
]);

export function buildBeingPatternPerspectiveModel(
    profile: MathemeHarmonicProfileBoundary | null,
    options: BuildBeingPatternPerspectiveOptions = {}
): BeingPatternPerspectiveModel | null {
    const field = readCurrentInhabitedBimbaField(profile);
    const entity = selectEntity(field.entities, options.selectedEntityId);
    if (!entity) {
        return null;
    }
    const foregroundRelation = selectForegroundRelation(
        entity.relationEdges,
        options.foregroundRelationEdgeId
    );
    return modelFromEntity(entity, foregroundRelation);
}

export function modelFromEntity(
    entity: InhabitedBimbaEntityState,
    foregroundRelation: BeingPatternRelationEdge | null = entity.relationEdges[0] ?? null
): BeingPatternPerspectiveModel {
    const familyRole = canonicalNaraFamilyRole(entity.naraFamilyRole);
    const relationship = relationshipDialSegmentFor(entity.monopolyOperator);
    return Object.freeze({
        viewId: BEING_PATTERN_PERSPECTIVE_VIEW_ID,
        privacyClass: BEING_PATTERN_PRIVACY_CLASS,
        entity,
        entityHandle: beingEntityHandle(entity),
        graphAnchor: entity.entityRef.graphAnchor ?? entity.stableIdentity.graphAnchor ?? null,
        streamGeneration: entity.liveState.streamGeneration ?? entity.liveState.generation,
        relationship,
        perspectiveRole: entity.perspectiveRole,
        perspectiveLabel: perspectiveRoleDisplayLabelFor(entity.perspectiveRole),
        naraFamilyRole: familyRole,
        clockAddress: publicClockAddressItems(entity.clockAddress),
        elementalWeights: elementalWeightItems(entity.elementalWeights),
        relationEdgeCount: entity.relationEdges.length,
        foregroundRelation,
        verifierRefs: verifierRefsFor(entity),
        liveHandles: liveHandlesFor(entity),
        reviewRisk: entity.reviewRisk,
        reviewActionMethod: entity.monopolyOperator === 'ActualisingOne'
            ? BEING_PATTERN_REVIEW_METHOD
            : null
    });
}

export function relationshipDialSegmentFor(
    operator: MonoPolyOperator
): RelationshipDialSegment {
    return MONOPOLY_DIAL_SEGMENTS.find(segment => segment.operator === operator) ??
        MONOPOLY_DIAL_SEGMENTS[0];
}

export function canonicalNaraFamilyRole(
    value: NaraFamilyRole | undefined
): CanonicalNaraFamilyRole | null {
    return NARA_FAMILY_ROLES.includes(value as CanonicalNaraFamilyRole)
        ? value as CanonicalNaraFamilyRole
        : null;
}

export function beingPatternReviewRequest(
    model: BeingPatternPerspectiveModel
): Readonly<Record<string, unknown>> {
    return Object.freeze({
        entityRef: Object.freeze({
            entityId: model.entity.entityRef.entityId,
            entityKind: model.entity.entityRef.entityKind,
            ...(model.entity.entityRef.graphAnchor ? { graphAnchor: model.entity.entityRef.graphAnchor } : {})
        }),
        stableIdentityHandle: model.entity.stableIdentity.handle,
        liveState: Object.freeze({
            generation: model.streamGeneration,
            ...(model.entity.liveState.spacetimeRowId ? { spacetimeRowId: model.entity.liveState.spacetimeRowId } : {}),
            ...(model.entity.liveState.streamDelta ? { streamDelta: model.entity.liveState.streamDelta } : {})
        }),
        monopolyOperator: model.entity.monopolyOperator,
        perspectiveRole: model.entity.perspectiveRole,
        naraFamilyRole: model.naraFamilyRole,
        relationEdgeCount: model.relationEdgeCount,
        foregroundRelationEdgeId: model.foregroundRelation?.edgeId ?? null,
        verifierRefs: model.verifierRefs.map(item => item.ref),
        reviewRisk: model.reviewRisk
    });
}

export const M4BeingPatternPerspectiveCard: React.FC<M4BeingPatternPerspectiveCardProps> = ({
    profile = null,
    model,
    selectedEntityId,
    foregroundRelationEdgeId,
    onOpenReviewCandidate
}) => {
    const resolvedModel = model ?? buildBeingPatternPerspectiveModel(profile, {
        selectedEntityId,
        foregroundRelationEdgeId
    });
    if (!resolvedModel) {
        return (
            <section
                className={`m4-being-pattern-perspective ${privacyChromeClass(BEING_PATTERN_PRIVACY_CLASS)}`}
                data-test="m4-being-pattern-perspective"
                data-track="TRACK_08"
                data-export={M4_BEING_PATTERN_PERSPECTIVE_EXPORT}
                data-view-id={BEING_PATTERN_PERSPECTIVE_VIEW_ID}
                data-privacy-class={BEING_PATTERN_PRIVACY_CLASS}
                data-state="pending-pasu-being-pattern"
                aria-label="BeingPattern perspective"
            >
                <span
                    className="m4-being-pattern-privacy mext-privacy-protected-local-handle-only"
                    data-test="m4-being-pattern-privacy"
                >
                    protected_local_handle_only
                </span>
                <p data-test="m4-being-pattern-empty">pending PASU BeingPattern handle</p>
            </section>
        );
    }
    return (
        <section
            className={`m4-being-pattern-perspective ${privacyChromeClass(resolvedModel.privacyClass)}`}
            data-test="m4-being-pattern-perspective"
            data-track="TRACK_08"
            data-export={M4_BEING_PATTERN_PERSPECTIVE_EXPORT}
            data-view-id={BEING_PATTERN_PERSPECTIVE_VIEW_ID}
            data-privacy-class={resolvedModel.privacyClass}
            data-entity-id={resolvedModel.entity.entityRef.entityId}
            data-entity-kind={resolvedModel.entity.entityRef.entityKind}
            data-entity-handle={resolvedModel.entityHandle}
            data-monopoly-operator={resolvedModel.entity.monopolyOperator}
            data-relationship-state={resolvedModel.relationship.state}
            data-perspective-role={resolvedModel.perspectiveRole}
            data-perspective-label={resolvedModel.perspectiveLabel}
            data-nara-family-role={resolvedModel.naraFamilyRole ?? ''}
            data-relation-edge-count={resolvedModel.relationEdgeCount}
            data-review-risk={resolvedModel.reviewRisk}
            data-review-action-method={resolvedModel.reviewActionMethod ?? ''}
            aria-label="BeingPattern perspective"
        >
            <header className="m4-being-pattern-header">
                <div>
                    <h3>BeingPattern Perspective</h3>
                    <code data-test="m4-being-pattern-entity-handle">{resolvedModel.entityHandle}</code>
                </div>
                <span
                    className="m4-being-pattern-privacy mext-privacy-protected-local-handle-only"
                    data-test="m4-being-pattern-privacy"
                >
                    protected_local_handle_only
                </span>
            </header>

            <RelationshipDial model={resolvedModel} />
            <PerspectiveStrip activeRole={resolvedModel.perspectiveRole} />
            <FamilyOverlay role={resolvedModel.naraFamilyRole} />
            <PublicHandleSummary model={resolvedModel} />
            <ReviewRiskBanner model={resolvedModel} onOpenReviewCandidate={onOpenReviewCandidate} />
        </section>
    );
};

const RelationshipDial: React.FC<{ readonly model: BeingPatternPerspectiveModel }> = ({ model }) => (
    <section
        className="m4-being-pattern-dial"
        data-test="m4-being-pattern-relationship-dial"
        data-active-operator={model.entity.monopolyOperator}
        data-active-state={model.relationship.state}
    >
        <h4>Relationship dial</h4>
        <ol>
            {MONOPOLY_DIAL_SEGMENTS.map(segment => (
                <li
                    key={segment.operator}
                    data-test="m4-being-pattern-dial-segment"
                    data-monopoly-operator={segment.operator}
                    data-relationship-state={segment.state}
                    data-active={segment.operator === model.entity.monopolyOperator ? 'true' : 'false'}
                >
                    <strong>{segment.label}</strong>
                    <span>{segment.summary}</span>
                </li>
            ))}
        </ol>
    </section>
);

const PerspectiveStrip: React.FC<{ readonly activeRole: PerspectiveRole }> = ({ activeRole }) => (
    <section
        className="m4-being-pattern-perspective-strip"
        data-test="m4-being-pattern-perspective-strip"
        data-active-role={activeRole}
    >
        <h4>Perspective strip</h4>
        <ol>
            {PERSPECTIVE_STRIP_SEGMENTS.map(segment => (
                <li
                    key={segment.role}
                    data-test="m4-being-pattern-perspective-segment"
                    data-perspective-role={segment.role}
                    data-active={segment.role === activeRole ? 'true' : 'false'}
                >
                    {segment.label}
                </li>
            ))}
        </ol>
    </section>
);

const FamilyOverlay: React.FC<{ readonly role: CanonicalNaraFamilyRole | null }> = ({ role }) => {
    if (!role) {
        return null;
    }
    return (
        <section
            className="m4-being-pattern-family-overlay"
            data-test="m4-being-pattern-family-overlay"
            data-family-role={role}
        >
            <h4>Nara family overlay</h4>
            <span
                className="m4-being-pattern-family-chip"
                data-test="m4-being-pattern-family-chip"
                data-family-role={role}
            >
                {role}
            </span>
        </section>
    );
};

const PublicHandleSummary: React.FC<{ readonly model: BeingPatternPerspectiveModel }> = ({ model }) => (
    <section className="m4-being-pattern-public-handles" data-test="m4-being-pattern-public-handles">
        <h4>Public-safe handles</h4>
        <dl>
            <dt>stream generation</dt>
            <dd data-test="m4-being-pattern-generation">{model.streamGeneration}</dd>
            <dt>graph anchor</dt>
            <dd data-test="m4-being-pattern-graph-anchor">{model.graphAnchor ?? 'BeingEntityRef only'}</dd>
            <dt>relation edges</dt>
            <dd data-test="m4-being-pattern-relation-count">{model.relationEdgeCount}</dd>
            <dt>foreground relation</dt>
            <dd
                data-test="m4-being-pattern-foreground-relation"
                data-foreground-relation-edge-id={model.foregroundRelation?.edgeId ?? ''}
            >
                {foregroundRelationLabel(model.foregroundRelation)}
            </dd>
        </dl>

        <SafeKeyValueList
            title="Clock address"
            testId="m4-being-pattern-clock-address"
            emptyLabel="clock pending"
            items={model.clockAddress}
        />
        <ElementalWeights weights={model.elementalWeights} />
        <SafeStringList
            title="Live handles"
            testId="m4-being-pattern-live-handles"
            emptyLabel="live handle pending"
            values={model.liveHandles}
        />
        <SafeStringList
            title="Verifier refs"
            testId="m4-being-pattern-verifier-refs"
            emptyLabel="verifier pending"
            values={model.verifierRefs.map(item => item.ref)}
        />
    </section>
);

const ReviewRiskBanner: React.FC<{
    readonly model: BeingPatternPerspectiveModel;
    readonly onOpenReviewCandidate?: (model: BeingPatternPerspectiveModel) => void;
}> = ({ model, onOpenReviewCandidate }) => {
    if (model.entity.monopolyOperator !== 'ActualisingOne') {
        return null;
    }
    return (
        <aside
            className="m4-being-pattern-review-risk"
            data-test="m4-being-pattern-review-risk"
            data-review-action-method={BEING_PATTERN_REVIEW_METHOD}
            data-review-risk={model.reviewRisk}
            role="status"
        >
            <strong>Review required</strong>
            <p>ActualisingOne is a forced-unity candidate and cannot be accepted here.</p>
            <button
                type="button"
                data-test="m4-being-pattern-open-review"
                data-action-method={BEING_PATTERN_REVIEW_METHOD}
                onClick={() => onOpenReviewCandidate?.(model)}
            >
                Open Epii review
            </button>
        </aside>
    );
};

const SafeKeyValueList: React.FC<{
    readonly title: string;
    readonly testId: string;
    readonly emptyLabel: string;
    readonly items: readonly [string, string][];
}> = ({ title, testId, emptyLabel, items }) => (
    <section data-test={testId}>
        <h5>{title}</h5>
        {items.length > 0 ? (
            <dl>
                {items.map(([key, value]) => (
                    <React.Fragment key={key}>
                        <dt>{key}</dt>
                        <dd>{value}</dd>
                    </React.Fragment>
                ))}
            </dl>
        ) : (
            <p>{emptyLabel}</p>
        )}
    </section>
);

const SafeStringList: React.FC<{
    readonly title: string;
    readonly testId: string;
    readonly emptyLabel: string;
    readonly values: readonly string[];
}> = ({ title, testId, emptyLabel, values }) => (
    <section data-test={testId}>
        <h5>{title}</h5>
        {values.length > 0 ? (
            <ol>
                {values.map(value => (
                    <li key={value}>{value}</li>
                ))}
            </ol>
        ) : (
            <p>{emptyLabel}</p>
        )}
    </section>
);

const ElementalWeights: React.FC<{
    readonly weights: readonly [string, number][];
}> = ({ weights }) => (
    <section data-test="m4-being-pattern-elemental-weights">
        <h5>Elemental weights</h5>
        {weights.length > 0 ? (
            <ol>
                {weights.map(([element, weight]) => (
                    <li key={element} data-element={element} data-weight={weight}>
                        <span>{element}</span>
                        <strong>{formatWeight(weight)}</strong>
                    </li>
                ))}
            </ol>
        ) : (
            <p>elemental weights pending</p>
        )}
    </section>
);

@injectable()
export class BeingPatternPerspectiveWidget extends ReactWidget {
    static readonly ID = BEING_PATTERN_PERSPECTIVE_VIEW_ID;
    static readonly LABEL = BEING_PATTERN_PERSPECTIVE_LABEL;

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = BeingPatternPerspectiveWidget.ID;
        this.title.label = BeingPatternPerspectiveWidget.LABEL;
        this.title.caption = SURFACE_PRIVACY_TOOLTIP;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.addClass('m4-being-pattern-perspective-widget');
        this.addClass('mext-privacy-protected-local-handle-only');
        this.subscriptions.push(
            this.bridge.onProfile(profile => {
                this.profile = profile;
                this.update();
            })
        );
    }

    protected override render(): React.ReactNode {
        return (
            <M4BeingPatternPerspectiveCard
                profile={this.profile}
                onOpenReviewCandidate={model => this.openReviewCandidate(model)}
            />
        );
    }

    override dispose(): void {
        for (const subscription of this.subscriptions) {
            try {
                subscription.dispose();
            } catch {
                // best-effort
            }
        }
        this.subscriptions = [];
        super.dispose();
    }

    protected openReviewCandidate(model: BeingPatternPerspectiveModel): void {
        if (model.reviewActionMethod !== BEING_PATTERN_REVIEW_METHOD) {
            return;
        }
        void this.bridge.invokeGatewayRpc(
            BEING_PATTERN_REVIEW_METHOD,
            beingPatternReviewRequest(model)
        ).catch(() => {
            // Review routing failure should not mutate M4 state.
        });
    }
}

function selectEntity(
    entities: readonly InhabitedBimbaEntityState[],
    selectedEntityId?: string | null
): InhabitedBimbaEntityState | null {
    if (selectedEntityId) {
        return entities.find(entity => entity.entityRef.entityId === selectedEntityId) ?? null;
    }
    return entities[0] ?? null;
}

function selectForegroundRelation(
    relationEdges: readonly BeingPatternRelationEdge[],
    foregroundRelationEdgeId?: string | null
): BeingPatternRelationEdge | null {
    if (foregroundRelationEdgeId) {
        return relationEdges.find(edge => edge.edgeId === foregroundRelationEdgeId) ?? null;
    }
    return relationEdges[0] ?? null;
}

function beingEntityHandle(entity: InhabitedBimbaEntityState): string {
    return `BeingEntityRef:${entity.entityRef.entityKind}:${entity.entityRef.entityId}`;
}

function publicClockAddressItems(
    clockAddress: BeingPatternClockAddress
): readonly [string, string][] {
    return Object.freeze(
        Object.entries(clockAddress)
            .filter(([, value]) => isPublicScalar(value))
            .map(([key, value]) => [key, String(value)] as [string, string])
            .sort(([a], [b]) => a.localeCompare(b))
    );
}

function elementalWeightItems(
    weights: ElementalWeightProjection
): readonly [string, number][] {
    return Object.freeze(
        Object.entries(weights)
            .filter(([, value]) => Number.isFinite(value))
            .sort(([a], [b]) => a.localeCompare(b))
    );
}

function verifierRefsFor(
    entity: InhabitedBimbaEntityState
): readonly BeingPatternVerifierRef[] {
    const refs = new Map<string, BeingPatternVerifierRef>();
    for (const edge of entity.relationEdges) {
        for (const ref of edge.verifierRefs ?? []) {
            const safeRef = safeRefFromRecord(ref);
            if (safeRef) {
                refs.set(safeRef.ref, safeRef);
            }
        }
    }
    return Object.freeze([...refs.values()].slice(0, 8));
}

function liveHandlesFor(entity: InhabitedBimbaEntityState): readonly string[] {
    const handles = [
        entity.liveState.streamDelta,
        entity.liveState.spacetimeRowId,
        entity.liveState.dayRef,
        entity.liveState.nowRef,
        ...(entity.liveState.graphitiEpisodeRefs ?? []).map(ref => ref.sourceRef)
    ].filter((value): value is string => typeof value === 'string' && value.length > 0);
    return Object.freeze([...new Set(handles)].slice(0, 8));
}

function safeRefFromRecord(
    record: Readonly<Record<string, unknown>>
): BeingPatternVerifierRef | null {
    const keys = [
        'ref',
        'handle',
        'sourceRef',
        'verifierRef',
        'reviewRef',
        'evidenceHandle',
        'provenanceHandle'
    ];
    for (const key of keys) {
        const value = record[key];
        if (typeof value === 'string' && value.length > 0) {
            return Object.freeze({ key, ref: value });
        }
    }
    return null;
}

function isPublicScalar(value: unknown): value is string | number | boolean {
    return (
        typeof value === 'string' ||
        typeof value === 'number' && Number.isFinite(value) ||
        typeof value === 'boolean'
    );
}

function foregroundRelationLabel(relation: BeingPatternRelationEdge | null): string {
    if (!relation) {
        return 'no foreground relation';
    }
    return relation.aspectLabel ??
        relation.edgeKind ??
        relation.edgeId;
}

function formatWeight(weight: number): string {
    const value = Math.abs(weight) <= 1 ? weight * 100 : weight;
    return `${Math.round(value)}%`;
}
