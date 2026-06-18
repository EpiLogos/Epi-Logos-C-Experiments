import * as React from 'react';
import type { MathemeHarmonicProfileBoundary } from '@pratibimba/m-extension-runtime';
import type {
    InhabitedBimbaFieldState,
    InhabitedBimbaEntityState,
    PerspectiveRoleDisplayLabel
} from '@pratibimba/integrated-composition/integrated-readiness';
import {
    perspectiveRoleDisplayLabelFor,
    readCurrentInhabitedBimbaField
} from '@pratibimba/integrated-composition/integrated-readiness';
import {
    assertGraphitiLiveStateProvenanceProtected
} from '@pratibimba/integrated-composition/graphiti-source-guard';

export type PersonalPerspectiveRole = PerspectiveRoleDisplayLabel;

export interface M4BeingPatternPerspectiveView {
    readonly entityId: string;
    readonly pasuBeingPatternProjection: InhabitedBimbaEntityState;
    readonly stableIdentityHandle: string;
    readonly perspectiveRole: PersonalPerspectiveRole;
    readonly naraFamilyRole: InhabitedBimbaEntityState['naraFamilyRole'] | null;
    readonly monopolyOperator: InhabitedBimbaEntityState['monopolyOperator'];
    readonly elementalWeights: InhabitedBimbaEntityState['elementalWeights'];
}

export interface M5BeingPatternRecognitionView {
    readonly entityId: string;
    readonly pasuBeingPatternProjection: InhabitedBimbaEntityState;
    readonly liveStateHandle: string | null;
    readonly reviewRisk: InhabitedBimbaEntityState['reviewRisk'];
    readonly monopolyOperator: InhabitedBimbaEntityState['monopolyOperator'];
    readonly relationEdgeCount: number;
    readonly provenanceHandles: readonly string[];
}

export interface PersonalBeingPatternView {
    readonly m4Perspective: M4BeingPatternPerspectiveView;
    readonly m5Recognition: M5BeingPatternRecognitionView;
}

export interface PersonalRecognitionModel {
    readonly entity: InhabitedBimbaEntityState | null;
    readonly perspectiveCard: M4BeingPatternPerspectiveView | null;
    readonly reviewLayer: M5BeingPatternRecognitionView | null;
}

export function derivePersonalRecognitionModel(
    profile: MathemeHarmonicProfileBoundary | null,
    entityId?: string | null
): PersonalRecognitionModel {
    assertPasuProjectionProvenanceProtected(profile);
    const field = readCurrentInhabitedBimbaField(profile);
    const entity = entityId
        ? field.entities.find(item => item.entityRef.entityId === entityId) ?? null
        : field.entities[0] ?? null;
    const view = entity ? viewFromEntity(entity) : null;
    return Object.freeze({
        entity,
        perspectiveCard: view?.m4Perspective ?? null,
        reviewLayer: view?.m5Recognition ?? null
    });
}

export function buildPersonalBeingPatternView(
    field: InhabitedBimbaFieldState,
    entityId?: string | null
): PersonalBeingPatternView | null {
    const entity = entityId
        ? field.entities.find(item => item.entityRef.entityId === entityId)
        : field.entities[0];
    return entity ? viewFromEntity(entity) : null;
}

export interface PersonalRecognitionCompositionProps {
    readonly profile: MathemeHarmonicProfileBoundary | null;
    readonly selectedEntityId?: string | null;
}

export const PersonalRecognitionComposition: React.FC<PersonalRecognitionCompositionProps> = ({
    profile,
    selectedEntityId
}) => {
    const model = derivePersonalRecognitionModel(profile, selectedEntityId);
    if (!model.perspectiveCard || !model.reviewLayer) {
        return null;
    }
    const view = {
        m4Perspective: model.perspectiveCard,
        m5Recognition: model.reviewLayer
    };
    return (
        <section
            className="personal-being-pattern"
            data-test="personal-being-pattern"
            data-entity-id={view.m4Perspective.entityId}
            data-perspective-role={view.m4Perspective.perspectiveRole}
            data-review-risk={view.m5Recognition.reviewRisk}
        >
            <header className="personal-being-pattern-header">
                <h3>Being Pattern Perspective</h3>
                <span>{view.m4Perspective.perspectiveRole}</span>
            </header>
            <dl className="personal-being-pattern-m4">
                <dt>stable_identity</dt>
                <dd>{view.m4Perspective.stableIdentityHandle}</dd>
                <dt>perspective_role</dt>
                <dd>{view.m4Perspective.perspectiveRole}</dd>
                <dt>nara_family_role</dt>
                <dd>{view.m4Perspective.naraFamilyRole ?? '-'}</dd>
                <dt>monopoly_operator</dt>
                <dd>{view.m4Perspective.monopolyOperator}</dd>
            </dl>
            <dl className="personal-being-pattern-m5">
                <dt>live_state</dt>
                <dd>{view.m5Recognition.liveStateHandle ?? '-'}</dd>
                <dt>review_risk</dt>
                <dd>{view.m5Recognition.reviewRisk}</dd>
                <dt>graphiti_handles</dt>
                <dd>{view.m5Recognition.provenanceHandles.join(' / ') || '-'}</dd>
            </dl>
        </section>
    );
};

function viewFromEntity(entity: InhabitedBimbaEntityState): PersonalBeingPatternView {
    const perspectiveRole = perspectiveRoleDisplayLabelFor(entity.perspectiveRole);
    return Object.freeze({
        m4Perspective: Object.freeze({
            entityId: entity.entityRef.entityId,
            pasuBeingPatternProjection: entity,
            stableIdentityHandle: entity.stableIdentity.handle,
            perspectiveRole,
            naraFamilyRole: entity.naraFamilyRole ?? null,
            monopolyOperator: entity.monopolyOperator,
            elementalWeights: entity.elementalWeights
        }),
        m5Recognition: Object.freeze({
            entityId: entity.entityRef.entityId,
            pasuBeingPatternProjection: entity,
            liveStateHandle: entity.liveState.streamDelta ?? entity.liveState.spacetimeRowId ?? null,
            reviewRisk: entity.reviewRisk,
            monopolyOperator: entity.monopolyOperator,
            relationEdgeCount: entity.relationEdges.length,
            provenanceHandles: Object.freeze(
                (entity.liveState.graphitiEpisodeRefs ?? []).map(ref => ref.sourceRef)
            )
        })
    });
}

function assertPasuProjectionProvenanceProtected(
    profile: MathemeHarmonicProfileBoundary | null
): void {
    const payload = profile?.payload;
    if (!payload) {
        return;
    }
    const value =
        payload['pasuBeingPatternProjections'] ??
        payload['pasu_being_pattern_projections'] ??
        payload['pasuBeingPattern'] ??
        payload['pasu_being_pattern'] ??
        payload['pasuBeingPatternProjection'];
    if (Array.isArray(value)) {
        for (const projection of value) {
            if (projection && typeof projection === 'object') {
                assertGraphitiLiveStateProvenanceProtected(projection as Readonly<Record<string, unknown>>);
            }
        }
        return;
    }
    if (value && typeof value === 'object') {
        assertGraphitiLiveStateProvenanceProtected(value as Readonly<Record<string, unknown>>);
    }
}
