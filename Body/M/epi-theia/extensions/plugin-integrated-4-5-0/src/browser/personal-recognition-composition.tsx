import * as React from 'react';
import {
    EMPTY_COORDINATE_CONTEXT,
    type MathemeHarmonicProfileBoundary,
    type MExtensionId,
    type MObservabilityEvent
} from '@pratibimba/m-extension-runtime';
import type {
    InhabitedBimbaFieldState,
    InhabitedBimbaEntityState,
    PerspectiveRoleDisplayLabel
} from '@pratibimba/integrated-composition/integrated-readiness';
import {
    perspectiveRoleDisplayLabelFor,
    readCurrentInhabitedBimbaField
} from '@pratibimba/integrated-composition/integrated-readiness';
import type {
    IntegratedEmptyStateReason,
    IntegratedEmptyStateView
} from '../../../integrated-composition/lib/common/empty-state';
import { IntegratedEmptyState } from '../../../integrated-composition/lib/browser/integrated-empty-state';
import {
    CanvasEditorSurface,
    createCanvasEditorModel
} from '../../../m4-nara/lib/browser/canvas-editor';
import type { HighlightService } from '../../../m4-nara/lib/browser/services/highlight-service';
import {
    M4AmbientStateStrip,
    ambientStateCells
} from '../../../m4-nara/lib/browser/widgets/ambient-state-strip';
import {
    M4KairosWheel,
    buildKairosWheelModel,
    readTransitPositions
} from '../../../m4-nara/lib/browser/widgets/kairos-display';
import {
    M4MercuriusRelayChip,
    initialRelayState
} from '../../../m4-nara/lib/browser/widgets/mercurius-relay-indicator';
import {
    M4TimeAxisSwitcherChip,
    buildTimeAxisState,
    handlesFromProfile
} from '../../../m4-nara/lib/browser/widgets/time-axis-switcher';
import {
    M4TuningBar,
    TUNING_PARAMETERS,
    seedTuningValues
} from '../../../m4-nara/lib/browser/widgets/tuning-bar';
import {
    M4SessionCloseCeremonyCard,
    isSessionCloseCompleteEvent,
    normalizeSessionCloseSummary,
    sessionKeyFromEvent
} from '../../../m4-nara/lib/browser/widgets/session-close-ceremony';
import { VirtueWitnessPanel } from '../../../m0-anuttara/lib/browser/panels/virtue-witness-panel';
import {
    assertGraphitiLiveStateProvenanceProtected
} from '@pratibimba/integrated-composition/graphiti-source-guard';

export type PersonalPerspectiveRole = PerspectiveRoleDisplayLabel;

export type PersonalCompositionBlockerId =
    | 'pending-psychoid-cymatic-solver'
    | 'pending-recognition-surface'
    | 'pending-q-composed'
    | 'pending-virtue-witness'
    | 'pending-kairos-populator';

export type PersonalGeometricSlotId = 'left' | 'center' | 'right' | 'under';

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

export interface ProtectedPersonalHandleSet {
    readonly qPersonalHandle: string | null;
    readonly qIdentityHandle: string | null;
    readonly qTransitHandle: string | null;
    readonly qActivityHandle: string | null;
    readonly qComposedHandle: string | null;
}

export interface PersonalCompositionSlotModel {
    readonly slot: PersonalGeometricSlotId;
    readonly owner: MExtensionId;
    readonly privacyClass:
        | 'protected_local'
        | 'protected_local_handle_only'
        | 'governed_review_metadata_only'
        | 'public_current_with_graph_provenance';
    readonly blocker: PersonalCompositionBlockerId | null;
}

export interface PersonalCompositionModel {
    readonly profile: MathemeHarmonicProfileBoundary | null;
    readonly generation: number | null;
    readonly selectedEntityId: string | null;
    readonly handles: ProtectedPersonalHandleSet;
    readonly personalRecognition: PersonalRecognitionModel;
    readonly slots: readonly PersonalCompositionSlotModel[];
    readonly blockers: readonly PersonalCompositionBlockerId[];
}

export interface PersonalRecognitionCompositionProps {
    readonly profile: MathemeHarmonicProfileBoundary | null;
    readonly selectedEntityId?: string | null;
    readonly sessionCloseEvent?: MObservabilityEvent | null;
}

const CompositionProfileContext =
    React.createContext<MathemeHarmonicProfileBoundary | null>(null);

const PERSONAL_CYMATIC_FIELD_AVAILABLE = false;
const MAHAMAYA_RECOGNITION_SURFACE_AVAILABLE = false;

const NULL_HIGHLIGHT_SERVICE = Object.freeze({
    onDidChange: () => ({ dispose() { /* no-op for integrated static mount */ } }),
    getHighlights: () => Object.freeze([])
}) as unknown as HighlightService;

const NULL_CANVAS_BRIDGE = Object.freeze({
    publish: () => undefined
});

export function useCompositionProfile(
    profile: MathemeHarmonicProfileBoundary | null
): MathemeHarmonicProfileBoundary | null {
    return React.useMemo(() => profile, [profile]);
}

export const PersonalRecognitionComposition: React.FC<PersonalRecognitionCompositionProps> = ({
    profile,
    selectedEntityId,
    sessionCloseEvent
}) => {
    const compositionProfile = useCompositionProfile(profile);
    const model = React.useMemo(
        () => buildPersonalCompositionModel(compositionProfile, selectedEntityId),
        [compositionProfile, selectedEntityId]
    );
    return (
        <CompositionProfileContext.Provider value={compositionProfile}>
            <section
                className="personal-recognition-composition"
                data-test="personal-recognition-composition"
                data-entity-id={model.personalRecognition.perspectiveCard?.entityId ?? ''}
                data-perspective-role={model.personalRecognition.perspectiveCard?.perspectiveRole ?? ''}
                data-nara-family-role={model.personalRecognition.perspectiveCard?.naraFamilyRole ?? ''}
                data-review-risk={model.personalRecognition.reviewLayer?.reviewRisk ?? ''}
                data-blockers={model.blockers.join(',')}
                data-profile-generation={model.generation ?? 'pending'}
            >
                <CompositionAmbientRow />
                <div
                    className="personal-recognition-editor-surface"
                    data-test="personal-recognition-editor-surface"
                    data-editor-surface="personal-recognition-composition"
                >
                    <div className="personal-recognition-slot-row">
                        <NaraJournalLeftSlot model={model} />
                        <PersonalCymaticCenterSlot model={model} />
                        <MahamayaRecognitionRightSlot model={model} />
                    </div>
                    <AnuttaraGroundingPanel model={model} />
                    <SessionCloseOverlay event={sessionCloseEvent} />
                </div>
            </section>
        </CompositionProfileContext.Provider>
    );
};

export function buildPersonalCompositionModel(
    profile: MathemeHarmonicProfileBoundary | null,
    selectedEntityId?: string | null
): PersonalCompositionModel {
    const personalRecognition = derivePersonalRecognitionModel(profile, selectedEntityId);
    const handles = readProtectedPersonalHandles(profile);
    const blockers = new Set<PersonalCompositionBlockerId>();
    if (!handles.qComposedHandle) {
        blockers.add('pending-q-composed');
    }
    if (!PERSONAL_CYMATIC_FIELD_AVAILABLE) {
        blockers.add('pending-psychoid-cymatic-solver');
    }
    if (!MAHAMAYA_RECOGNITION_SURFACE_AVAILABLE) {
        blockers.add('pending-recognition-surface');
    }
    if (!hasKairosPopulator(profile)) {
        blockers.add('pending-kairos-populator');
    }

    const slots: readonly PersonalCompositionSlotModel[] = Object.freeze([
        Object.freeze({
            slot: 'left',
            owner: 'm4-nara',
            privacyClass: 'protected_local',
            blocker: null
        }),
        Object.freeze({
            slot: 'center',
            owner: 'm4-nara',
            privacyClass: 'protected_local_handle_only',
            blocker: blockers.has('pending-q-composed')
                ? 'pending-q-composed'
                : blockers.has('pending-psychoid-cymatic-solver')
                    ? 'pending-psychoid-cymatic-solver'
                    : null
        }),
        Object.freeze({
            slot: 'right',
            owner: 'm5-epii',
            privacyClass: 'governed_review_metadata_only',
            blocker: blockers.has('pending-recognition-surface') ? 'pending-recognition-surface' : null
        }),
        Object.freeze({
            slot: 'under',
            owner: 'm0-anuttara',
            privacyClass: 'public_current_with_graph_provenance',
            blocker: null
        })
    ]);

    return Object.freeze({
        profile,
        generation: profile?.generation ?? null,
        selectedEntityId: selectedEntityId ?? null,
        handles,
        personalRecognition,
        slots,
        blockers: Object.freeze([...blockers])
    });
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

const CompositionAmbientRow: React.FC = () => {
    const profile = React.useContext(CompositionProfileContext);
    const relay = initialRelayState(false);
    return (
        <div
            className="personal-composition-ambient-row"
            data-test="composition-ambient-row"
            data-height="32"
        >
            <div className="personal-composition-ambient-kairos">
                <M4KairosWheel
                    model={buildKairosWheelModel({
                        natalPositions: readNested(profile, ['natalPositions', 'natal_positions']),
                        transitPositions: readTransitPositions(profile),
                        oracleHistory: readNested(profile, ['oracleHistory', 'oracle_history']),
                        nowMs: Date.now()
                    })}
                />
            </div>
            <M4MercuriusRelayChip
                kairosEnabled={relay.kairosEnabled}
                lastRefreshIso={relay.lastRefreshIso}
                deltaCount={relay.deltaCount}
                pulseToken={relay.pulseToken}
                connected={Boolean(profile)}
            />
            <M4TimeAxisSwitcherChip
                state={buildTimeAxisState({
                    sessionKey: readStringField(profile, ['sessionKey', 'session.key']) ?? 'm4-nara:session:pending',
                    mode: readStringField(profile, ['timeAxisMode', 'session.timeAxisMode']),
                    handles: handlesFromProfile(profile, EMPTY_COORDINATE_CONTEXT)
                })}
                onSelect={() => undefined}
            />
        </div>
    );
};

const NaraJournalLeftSlot: React.FC<{ readonly model: PersonalCompositionModel }> = ({ model }) => {
    const profile = React.useContext(CompositionProfileContext);
    const daySummary = objectValue(
        readNested(profile, ['naraSurface.daySummary', 'nara_surface.day_summary', 'daySummary'])
    );
    const canvasModel = createCanvasEditorModel({
        context: {
            profileGeneration: profile?.generation ?? null,
            pointerAnchor: profile?.pointerAnchor ?? null
        },
        nowContent: readDaySummaryText(daySummary)
    });
    return (
        <section
            className="personal-composition-slot personal-composition-slot-left"
            data-test="personal-geometric-slot"
            data-geometric-slot="left"
            data-slot-owner="m4-nara"
            data-privacy-class="protected_local"
        >
            <M4AmbientStateStrip
                cells={ambientStateCells(profile)}
                generation={profile?.generation ?? null}
                connected={Boolean(profile)}
                readinessState={profile ? 'ready_public_current' : 'profile_missing_field'}
            />
            <CanvasEditorSurface
                model={canvasModel}
                highlightService={NULL_HIGHLIGHT_SERVICE}
                bridge={NULL_CANVAS_BRIDGE}
            />
            <M4TuningBar
                parameters={TUNING_PARAMETERS}
                values={seedTuningValues(profile)}
                status="idle"
                dirty={false}
                onChange={() => undefined}
                onResonate={() => undefined}
                onReset={() => undefined}
            />
            <SlotStatus slot={model.slots[0]} />
        </section>
    );
};

const PersonalCymaticCenterSlot: React.FC<{ readonly model: PersonalCompositionModel }> = ({ model }) => {
    const slot = model.slots.find(item => item.slot === 'center')!;
    return (
        <section
            className="personal-composition-slot personal-composition-slot-center"
            data-test="personal-geometric-slot"
            data-geometric-slot="center"
            data-slot-owner="m4-nara"
            data-privacy-class="protected_local_handle_only"
            data-q-composed-handle={model.handles.qComposedHandle ?? 'pending-q-composed'}
        >
            {slot.blocker ? (
                <IntegratedEmptyState
                    view={buildSlotBlockerView(slot.blocker, 'm4-nara')}
                    title="Personal Cymatic Center"
                />
            ) : null}
            <SlotStatus slot={slot} />
        </section>
    );
};

const MahamayaRecognitionRightSlot: React.FC<{ readonly model: PersonalCompositionModel }> = ({ model }) => {
    const slot = model.slots.find(item => item.slot === 'right')!;
    return (
        <section
            className="personal-composition-slot personal-composition-slot-right"
            data-test="personal-geometric-slot"
            data-geometric-slot="right"
            data-slot-owner="m5-epii"
            data-privacy-class="governed_review_metadata_only"
            data-q-composed-handle={model.handles.qComposedHandle ?? 'pending-q-composed'}
        >
            {slot.blocker ? (
                <IntegratedEmptyState
                    view={buildSlotBlockerView(slot.blocker, 'm5-epii')}
                    title="Mahamaya Recognition Right"
                />
            ) : (
                <RecognitionHandleSummary model={model} />
            )}
            <SlotStatus slot={slot} />
        </section>
    );
};

const AnuttaraGroundingPanel: React.FC<{ readonly model: PersonalCompositionModel }> = ({ model }) => {
    const profile = React.useContext(CompositionProfileContext);
    const slot = model.slots.find(item => item.slot === 'under')!;
    return (
        <footer
            className="personal-composition-slot personal-composition-slot-under"
            data-test="personal-geometric-slot"
            data-geometric-slot="under"
            data-slot-owner="m0-anuttara"
            data-privacy-class="public_current_with_graph_provenance"
            style={{ minHeight: 64 }}
        >
            <VirtueWitnessPanel profile={profile} />
            <SlotStatus slot={slot} />
        </footer>
    );
};

const SessionCloseOverlay: React.FC<{ readonly event?: MObservabilityEvent | null }> = ({ event }) => {
    if (!event || !isSessionCloseCompleteEvent(event)) {
        return null;
    }
    const model = normalizeSessionCloseSummary(event.payload, {
        sessionKey: sessionKeyFromEvent(event),
        emittedAt: event.emittedAt
    });
    return (
        <aside
            className="personal-composition-session-close-overlay"
            data-test="personal-session-close-overlay"
        >
            <M4SessionCloseCeremonyCard model={model} />
        </aside>
    );
};

const SlotStatus: React.FC<{ readonly slot: PersonalCompositionSlotModel | undefined }> = ({ slot }) => {
    if (!slot) {
        return null;
    }
    return (
        <small
            className="personal-composition-slot-status"
            data-test="personal-slot-status"
            data-slot={slot.slot}
            data-owner={slot.owner}
            data-blocker={slot.blocker ?? ''}
        >
            {slot.owner}
        </small>
    );
};

const RecognitionHandleSummary: React.FC<{ readonly model: PersonalCompositionModel }> = ({ model }) => (
    <dl className="personal-recognition-handle-summary" data-test="personal-recognition-handle-summary">
        <dt>q_composed_handle</dt>
        <dd>{model.handles.qComposedHandle ?? 'pending-q-composed'}</dd>
        <dt>m3_export</dt>
        <dd>{readStringField(model.profile, ['m3CodonRotationExportHandle', 'm3.codonRotationExportHandle']) ?? 'read-only'}</dd>
    </dl>
);

function buildSlotBlockerView(
    blocker: PersonalCompositionBlockerId,
    contributorId: MExtensionId
): IntegratedEmptyStateView {
    const detail = BLOCKER_DETAILS[blocker];
    const reason: IntegratedEmptyStateReason = Object.freeze({
        contributorId,
        readinessState: 'authority_payload_missing',
        ownerTrack: detail.ownerTrack,
        blockerId: blocker,
        humanReason: detail.humanReason
    });
    return Object.freeze({
        pluginId: 'plugin-integrated-4-5-0',
        layoutId: 'jiva-siva.integrated',
        overall: 'authority_payload_missing',
        reasons: Object.freeze([reason]),
        missingContributors: Object.freeze([])
    });
}

const BLOCKER_DETAILS: Readonly<Record<PersonalCompositionBlockerId, {
    readonly ownerTrack: string;
    readonly humanReason: string;
}>> = Object.freeze({
    'pending-psychoid-cymatic-solver': Object.freeze({
        ownerTrack: 'Track 05.5 / 25.6',
        humanReason: 'The personal psychoid cymatic renderer handle is not yet available.'
    }),
    'pending-recognition-surface': Object.freeze({
        ownerTrack: 'Track 26.11',
        humanReason: 'The M5 recognition-layer widget is not yet landed at the requested surface path.'
    }),
    'pending-q-composed': Object.freeze({
        ownerTrack: 'Track 25.6',
        humanReason: 'The Q_composed opaque handle is absent; raw quaternion bodies remain forbidden.'
    }),
    'pending-virtue-witness': Object.freeze({
        ownerTrack: 'Track 21',
        humanReason: 'The Anuttara virtue-witness display is not available.'
    }),
    'pending-kairos-populator': Object.freeze({
        ownerTrack: 'Track 19.12',
        humanReason: 'The Mercurius kairos populator has not delivered a live mod-10 planet vector.'
    })
});

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

function readProtectedPersonalHandles(
    profile: MathemeHarmonicProfileBoundary | null
): ProtectedPersonalHandleSet {
    const candidates = [
        objectValue(profile?.payload.protectedPersonalFieldHandles),
        objectValue(profile?.payload.protected_personal_field_handles),
        objectValue(profile?.payload.ProtectedPersonalFieldInput),
        objectValue(profile?.payload.protectedPersonalFieldInput)
    ].filter(isRecord);
    return Object.freeze({
        qPersonalHandle: firstString(profile, candidates, ['qPersonalHandle', 'q_personal_handle']),
        qIdentityHandle: firstString(profile, candidates, ['qIdentityHandle', 'q_identity_handle']),
        qTransitHandle: firstString(profile, candidates, ['qTransitHandle', 'q_transit_handle']),
        qActivityHandle: firstString(profile, candidates, ['qActivityHandle', 'q_activity_handle']),
        qComposedHandle: firstString(profile, candidates, ['qComposedHandle', 'q_composed_handle'])
    });
}

function firstString(
    profile: MathemeHarmonicProfileBoundary | null,
    candidates: readonly Readonly<Record<string, unknown>>[],
    names: readonly string[]
): string | null {
    for (const name of names) {
        const direct = readStringField(profile, [name]);
        if (direct) {
            return direct;
        }
    }
    for (const candidate of candidates) {
        for (const name of names) {
            const value = candidate[name];
            if (typeof value === 'string' && value.trim() !== '') {
                return value;
            }
        }
    }
    return null;
}

function hasKairosPopulator(profile: MathemeHarmonicProfileBoundary | null): boolean {
    const temporalNow = objectValue(readNested(profile, ['M4_Temporal_Now', 'm4TemporalNow', 'temporalNow']));
    const natal = objectValue(temporalNow?.natal);
    const realtime = objectValue(temporalNow?.realtime ?? temporalNow?.realTime);
    const kairotic = objectValue(temporalNow?.kairotic);
    const kairoticActive = temporalNow?.kairotic_active === true || temporalNow?.kairotic_active === 1 ||
        temporalNow?.kairoticActive === true || temporalNow?.kairoticActive === 1;
    const live = kairoticActive ? kairotic : realtime;
    if (Array.isArray(natal?.planet_degrees ?? natal?.planetDegrees) &&
        Array.isArray(live?.planet_degrees ?? live?.planetDegrees)) {
        return true;
    }
    return Array.isArray(readNested(profile, ['M4_Temporal_Now.planet_degrees', 'm4TemporalNow.planetDegrees']));
}

function readDaySummaryText(daySummary: Readonly<Record<string, unknown>> | null): string {
    return readStringFromRecord(daySummary, ['summary', 'publicSummary', 'nowSummary', 'now_summary']) ??
        'Nara day summary pending.';
}

function readStringField(
    profile: MathemeHarmonicProfileBoundary | null,
    names: readonly string[]
): string | null {
    const value = readNested(profile, names);
    return typeof value === 'string' && value.trim() !== '' ? value : null;
}

function readNested(
    profile: MathemeHarmonicProfileBoundary | null,
    names: readonly string[]
): unknown {
    if (!profile) {
        return undefined;
    }
    for (const dotted of names) {
        let current: unknown = profile.payload;
        for (const segment of dotted.split('.')) {
            if (!current || typeof current !== 'object' || Array.isArray(current) || !(segment in current)) {
                current = undefined;
                break;
            }
            current = (current as Record<string, unknown>)[segment];
        }
        if (current !== undefined && current !== null) {
            return current;
        }
    }
    return undefined;
}

function objectValue(value: unknown): Readonly<Record<string, unknown>> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Readonly<Record<string, unknown>>
        : null;
}

function isRecord(value: Readonly<Record<string, unknown>> | null): value is Readonly<Record<string, unknown>> {
    return Boolean(value);
}

function readStringFromRecord(
    record: Readonly<Record<string, unknown>> | null,
    names: readonly string[]
): string | null {
    if (!record) {
        return null;
    }
    for (const name of names) {
        const value = record[name];
        if (typeof value === 'string' && value.trim() !== '') {
            return value;
        }
    }
    return null;
}
