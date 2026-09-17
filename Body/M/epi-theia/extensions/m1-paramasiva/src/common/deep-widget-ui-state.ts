import type {
    BimbaPratibimbaUiState,
    CompositionToggleClass
} from '@pratibimba/integrated-composition';
import type { MathemeHarmonicProfileBoundary } from '@pratibimba/m-extension-runtime';

export type M1DeepWidgetUiState = Pick<
    BimbaPratibimbaUiState,
    (typeof M1_DEEP_WIDGET_UI_STATE_FIELDS)[number]
>;

export const M1_DEEP_WIDGET_UI_STATE_FIELDS = Object.freeze([
    'coordinate',
    'lens',
    'mode',
    'profileGeneration',
    'sessionKey',
    'dayNow'
] as const);

export const M1_DEEP_WIDGET_TOGGLE_CLASSES = Object.freeze([
    'layout:daily-0-1<->ide-deep'
] as const);

export type M1DeepWidgetToggleClass = Extract<
    CompositionToggleClass,
    typeof M1_DEEP_WIDGET_TOGGLE_CLASSES[number]
>;

export type M1KleinEventFilterKind = 'All' | 'M1TritoneCrossing' | 'M2MeaningPacket' | 'M3CodonRotation';
export type M1VortexPinnedFamily = 'Bimba' | 'Pratibimba' | 'Sum' | 'DiffA' | 'DiffB' | 'Quintessence';
export type M1VortexFaceMode = 'matrix' | 'raw';
export type M1AudioBusSubsection = 'audio_octet[8]' | 'nodal_quartet[4]' | 'source-provenance';
export type M1AudioBusSort = 'profile-order' | 'hz-asc' | 'hz-desc';

export interface M1WalkNavigatorWidgetState {
    readonly tick: number;
    readonly paused: boolean;
}

export interface M1Cl42InspectorWidgetState {
    readonly activePosition: number;
    readonly devModeEnabled: boolean;
}

export interface M1KleinEventStripWidgetState {
    readonly scrollPosition: number;
    readonly filterKind: M1KleinEventFilterKind;
}

export interface M1VortexBrowserWidgetState {
    readonly pinnedFamily: M1VortexPinnedFamily;
    readonly faceMode: M1VortexFaceMode;
}

export interface M1AudioBusInspectorWidgetState {
    readonly subsection: M1AudioBusSubsection;
    readonly sort: M1AudioBusSort;
}

export interface M1PlayedTorusOrientationWidgetState {
    readonly tick12: number;
    readonly orientationQuaternion: readonly [number, number, number, number];
    readonly slerpT: number;
}

export interface M1DeepWidgetStateById {
    readonly walkNavigator: M1WalkNavigatorWidgetState;
    readonly cl42Inspector: M1Cl42InspectorWidgetState;
    readonly kleinEventStrip: M1KleinEventStripWidgetState;
    readonly vortexBrowser: M1VortexBrowserWidgetState;
    readonly audioBusInspector: M1AudioBusInspectorWidgetState;
    readonly playedTorusOrientation: M1PlayedTorusOrientationWidgetState;
}

export type M1DeepWidgetId = keyof M1DeepWidgetStateById;
type AnyM1DeepWidgetState = M1DeepWidgetStateById[M1DeepWidgetId];

type MutableM1DeepWidgetStateById = Partial<Record<M1DeepWidgetId, AnyM1DeepWidgetState>>;

export interface M1DeepWidgetPersistedRecord<WidgetId extends M1DeepWidgetId = M1DeepWidgetId> {
    readonly uiState: M1DeepWidgetUiState;
    readonly widgetId: WidgetId;
    readonly widgetState: M1DeepWidgetStateById[WidgetId];
    readonly source: 'kernel-bridge-di-singleton';
}

export interface M1DeepWidgetBridgeSnapshot {
    readonly profile: MathemeHarmonicProfileBoundary | null;
    readonly context: {
        readonly canonicalMCoordinate: string | null;
        readonly profileGeneration: number | null;
        readonly dayNowSessionHandle: string | null;
    };
}

export interface M1DeepWidgetBridgeSource {
    currentSnapshot(): M1DeepWidgetBridgeSnapshot;
}

export interface M1DeepWidgetUiStateBridge {
    readWidgetState<WidgetId extends M1DeepWidgetId>(
        widgetId: WidgetId
    ): M1DeepWidgetPersistedRecord<WidgetId>;
    writeWidgetState<WidgetId extends M1DeepWidgetId>(
        widgetId: WidgetId,
        widgetState: M1DeepWidgetStateById[WidgetId]
    ): M1DeepWidgetPersistedRecord<WidgetId>;
    toggleLayout(toggle: M1DeepWidgetToggleClass): void;
}

export function createM1DeepWidgetUiStateBridge(
    bridge: M1DeepWidgetBridgeSource
): M1DeepWidgetUiStateBridge {
    return new BridgeBackedM1DeepWidgetUiStateBridge(bridge);
}

export function createM1StableMockProfile(): MathemeHarmonicProfileBoundary {
    return Object.freeze({
        generation: 314,
        pointerAnchor: 'M1-2/Pratibimba',
        capabilities: Object.freeze(['m1.deepWidgetUiState', 'm1.playedTorusOrientation']),
        payload: Object.freeze({
            tick12: 3.5,
            position6: 3,
            m1DeepWidgetUiState: Object.freeze({
                coordinate: 'M1-2/Pratibimba',
                lens: "M1'",
                mode: 'deep-widget',
                sessionKey: 'acceptance:m1-deep-widget',
                dayNow: '2026-06-11'
            }),
            anandaVortex: Object.freeze({
                ringQuaternion: Object.freeze([
                    0.9238795325112867,
                    0,
                    0.3826834323650898,
                    0
                ]),
                activeCell: Object.freeze([3, 5]),
                cl42SignatureAtPosition: 3,
                kleinFlipAtThisTick: true
            }),
            kleinFlip: Object.freeze({
                kind: 'M1TritoneCrossing',
                tick12: 3.5
            }),
            audioOctet: Object.freeze([
                432,
                384,
                360,
                324,
                288,
                270,
                243,
                216
            ])
        })
    });
}

export function m1PlayedTorusOrientationWithinTolerance(
    actual: readonly number[],
    expected: readonly number[],
    tolerance: number
): boolean {
    if (actual.length !== 4 || expected.length !== 4) {
        return false;
    }
    return actual.every((value, index) => Math.abs(value - expected[index]) <= tolerance);
}

class BridgeBackedM1DeepWidgetUiStateBridge implements M1DeepWidgetUiStateBridge {
    private readonly widgetStates: MutableM1DeepWidgetStateById = {};

    constructor(private readonly bridge: M1DeepWidgetBridgeSource) {}

    readWidgetState<WidgetId extends M1DeepWidgetId>(
        widgetId: WidgetId
    ): M1DeepWidgetPersistedRecord<WidgetId> {
        const snapshot = this.bridge.currentSnapshot();
        const stored = this.widgetStates[widgetId] as M1DeepWidgetStateById[WidgetId] | undefined;
        const widgetState =
            stored ??
            defaultWidgetState(widgetId, snapshot.profile);
        return freezeRecord({
            uiState: deriveM1DeepWidgetUiState(snapshot),
            widgetId,
            widgetState: cloneWidgetState(widgetState) as M1DeepWidgetStateById[WidgetId],
            source: 'kernel-bridge-di-singleton'
        });
    }

    writeWidgetState<WidgetId extends M1DeepWidgetId>(
        widgetId: WidgetId,
        widgetState: M1DeepWidgetStateById[WidgetId]
    ): M1DeepWidgetPersistedRecord<WidgetId> {
        this.widgetStates[widgetId] = normalizeWidgetState(widgetId, widgetState);
        return this.readWidgetState(widgetId);
    }

    toggleLayout(toggle: M1DeepWidgetToggleClass): void {
        if (!M1_DEEP_WIDGET_TOGGLE_CLASSES.includes(toggle)) {
            throw new Error(`unsupported M1 deep-widget toggle: ${String(toggle)}`);
        }
        for (const widgetId of Object.keys(this.widgetStates) as M1DeepWidgetId[]) {
            const state = this.widgetStates[widgetId];
            if (state) {
                this.widgetStates[widgetId] = normalizeWidgetState(
                    widgetId,
                    cloneWidgetState(state)
                );
            }
        }
    }
}

function deriveM1DeepWidgetUiState(snapshot: M1DeepWidgetBridgeSnapshot): M1DeepWidgetUiState {
    const payload = snapshot.profile?.payload ?? {};
    const profileUi = recordValue(payload.m1DeepWidgetUiState);
    const coordinate =
        stringValue(profileUi?.coordinate) ??
        snapshot.context.canonicalMCoordinate ??
        snapshot.profile?.pointerAnchor ??
        null;
    return Object.freeze({
        coordinate,
        lens: stringValue(profileUi?.lens) ?? inferLens(coordinate),
        mode: stringValue(profileUi?.mode) ?? 'deep-widget',
        profileGeneration:
            snapshot.context.profileGeneration ??
            snapshot.profile?.generation ??
            0,
        sessionKey: stringValue(profileUi?.sessionKey) ?? 'm1-paramasiva',
        dayNow:
            stringValue(profileUi?.dayNow) ??
            snapshot.context.dayNowSessionHandle ??
            null
    });
}

function defaultWidgetState<WidgetId extends M1DeepWidgetId>(
    widgetId: WidgetId,
    profile: MathemeHarmonicProfileBoundary | null
): M1DeepWidgetStateById[WidgetId] {
    const payload = profile?.payload ?? {};
    switch (widgetId) {
        case 'walkNavigator':
            return { tick: numberValue(payload.tick12) ?? 0, paused: false } as M1DeepWidgetStateById[WidgetId];
        case 'cl42Inspector':
            return { activePosition: numberValue(payload.position6) ?? 0, devModeEnabled: false } as M1DeepWidgetStateById[WidgetId];
        case 'kleinEventStrip':
            return { scrollPosition: 0, filterKind: 'All' } as M1DeepWidgetStateById[WidgetId];
        case 'vortexBrowser':
            return { pinnedFamily: 'Bimba', faceMode: 'matrix' } as M1DeepWidgetStateById[WidgetId];
        case 'audioBusInspector':
            return { subsection: 'audio_octet[8]', sort: 'profile-order' } as M1DeepWidgetStateById[WidgetId];
        case 'playedTorusOrientation':
            return {
                tick12: numberValue(payload.tick12) ?? 0,
                orientationQuaternion: orientationQuaternionFromProfile(profile),
                slerpT: 0
            } as M1DeepWidgetStateById[WidgetId];
        default:
            throw new Error(`unknown M1 deep widget: ${String(widgetId)}`);
    }
}

function normalizeWidgetState<WidgetId extends M1DeepWidgetId>(
    widgetId: WidgetId,
    state: M1DeepWidgetStateById[WidgetId]
): M1DeepWidgetStateById[WidgetId] {
    switch (widgetId) {
        case 'walkNavigator': {
            const candidate = state as M1WalkNavigatorWidgetState;
            return Object.freeze({
                tick: nonNegativeInteger(candidate.tick, 'walkNavigator.tick'),
                paused: candidate.paused === true
            }) as M1DeepWidgetStateById[WidgetId];
        }
        case 'cl42Inspector': {
            const candidate = state as M1Cl42InspectorWidgetState;
            const activePosition = nonNegativeInteger(candidate.activePosition, 'cl42Inspector.activePosition');
            if (activePosition > 5) {
                throw new Error('cl42Inspector.activePosition must be in the 0..5 position ring');
            }
            return Object.freeze({
                activePosition,
                devModeEnabled: candidate.devModeEnabled === true
            }) as M1DeepWidgetStateById[WidgetId];
        }
        case 'kleinEventStrip': {
            const candidate = state as M1KleinEventStripWidgetState;
            return Object.freeze({
                scrollPosition: nonNegativeInteger(candidate.scrollPosition, 'kleinEventStrip.scrollPosition'),
                filterKind: enumValue(
                    candidate.filterKind,
                    ['All', 'M1TritoneCrossing', 'M2MeaningPacket', 'M3CodonRotation'],
                    'kleinEventStrip.filterKind'
                )
            }) as M1DeepWidgetStateById[WidgetId];
        }
        case 'vortexBrowser': {
            const candidate = state as M1VortexBrowserWidgetState;
            return Object.freeze({
                pinnedFamily: enumValue(
                    candidate.pinnedFamily,
                    ['Bimba', 'Pratibimba', 'Sum', 'DiffA', 'DiffB', 'Quintessence'],
                    'vortexBrowser.pinnedFamily'
                ),
                faceMode: enumValue(candidate.faceMode, ['matrix', 'raw'], 'vortexBrowser.faceMode')
            }) as M1DeepWidgetStateById[WidgetId];
        }
        case 'audioBusInspector': {
            const candidate = state as M1AudioBusInspectorWidgetState;
            return Object.freeze({
                subsection: enumValue(
                    candidate.subsection,
                    ['audio_octet[8]', 'nodal_quartet[4]', 'source-provenance'],
                    'audioBusInspector.subsection'
                ),
                sort: enumValue(
                    candidate.sort,
                    ['profile-order', 'hz-asc', 'hz-desc'],
                    'audioBusInspector.sort'
                )
            }) as M1DeepWidgetStateById[WidgetId];
        }
        case 'playedTorusOrientation': {
            const candidate = state as M1PlayedTorusOrientationWidgetState;
            return Object.freeze({
                tick12: finiteNumber(candidate.tick12, 'playedTorusOrientation.tick12'),
                orientationQuaternion: normalizeQuaternion(candidate.orientationQuaternion),
                slerpT: finiteNumber(candidate.slerpT, 'playedTorusOrientation.slerpT')
            }) as M1DeepWidgetStateById[WidgetId];
        }
        default:
            throw new Error(`unknown M1 deep widget: ${String(widgetId)}`);
    }
}

function orientationQuaternionFromProfile(
    profile: MathemeHarmonicProfileBoundary | null
): readonly [number, number, number, number] {
    const vortex = recordValue(profile?.payload.anandaVortex);
    return normalizeQuaternion(vortex?.ringQuaternion);
}

function normalizeQuaternion(value: unknown): readonly [number, number, number, number] {
    if (!Array.isArray(value) || value.length !== 4) {
        throw new Error('playedTorusOrientation.orientationQuaternion must contain four numbers');
    }
    return Object.freeze([
        finiteNumber(value[0], 'orientationQuaternion[0]'),
        finiteNumber(value[1], 'orientationQuaternion[1]'),
        finiteNumber(value[2], 'orientationQuaternion[2]'),
        finiteNumber(value[3], 'orientationQuaternion[3]')
    ]);
}

function freezeRecord<WidgetId extends M1DeepWidgetId>(
    record: M1DeepWidgetPersistedRecord<WidgetId>
): M1DeepWidgetPersistedRecord<WidgetId> {
    return Object.freeze({
        ...record,
        uiState: Object.freeze({ ...record.uiState }),
        widgetState: cloneWidgetState(record.widgetState) as M1DeepWidgetStateById[WidgetId]
    });
}

function cloneWidgetState<WidgetId extends M1DeepWidgetId>(
    state: M1DeepWidgetStateById[WidgetId]
): M1DeepWidgetStateById[WidgetId] {
    return JSON.parse(JSON.stringify(state)) as M1DeepWidgetStateById[WidgetId];
}

function enumValue<T extends string>(value: unknown, allowed: readonly T[], label: string): T {
    if (typeof value === 'string' && allowed.includes(value as T)) {
        return value as T;
    }
    throw new Error(`${label} must be one of: ${allowed.join(', ')}`);
}

function nonNegativeInteger(value: unknown, label: string): number {
    const normalized = finiteNumber(value, label);
    if (!Number.isInteger(normalized) || normalized < 0) {
        throw new Error(`${label} must be a non-negative integer`);
    }
    return normalized;
}

function finiteNumber(value: unknown, label: string): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error(`${label} must be a finite number`);
    }
    return value;
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

function recordValue(value: unknown): Readonly<Record<string, unknown>> | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? (value as Readonly<Record<string, unknown>>)
        : null;
}

function inferLens(coordinate: string | null): string | null {
    if (!coordinate) {
        return null;
    }
    return coordinate.startsWith('M1') ? "M1'" : null;
}
