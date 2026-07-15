/**
 * Coordinate: M5' integrated composition persistence (29.T29.10)
 * Residency: Body/M/pratibimba-app/src/composition
 * Position (#n): #5 — integration of the M0'..M5' composition state
 * Actualises: one strict, durable state extension shared by the cosmic and
 *   personal compositions across face/layout replacement and app restart.
 * Public surface: IntegratedCompositionPersistedState,
 *   persistCompositionState, readCompositionState, CompositionStateProvider,
 *   useCompositionState.
 * Does NOT own: the four shell stores, domain calculations, raw quaternion
 *   bodies, or filesystem paths (the Tauri host owns those).
 * Contract: [[M'-SYSTEM-SPEC]] / [[29-integrated-plugins-composition-deep]] T29.10
 */

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type PropsWithChildren
} from 'react';
import { invokeCommand } from '../bridge/tauri';

export const COMPOSITION_IDS = ['cosmic-engine.integrated', 'jiva-siva.integrated'] as const;
export type IntegratedCompositionId = (typeof COMPOSITION_IDS)[number];
export type MExtensionId = string;

export interface IntegratedCompositionPersistedState {
    readonly compositionId: IntegratedCompositionId;
    readonly coordinate: string | null;
    readonly lens: string | null;
    readonly mode: string | null;
    readonly profileGeneration: number | null;
    readonly sessionKey: string | null;
    readonly dayNow: string | null;
    readonly pinnedMatrixFamily: number | null;
    readonly selectedLensCell: { readonly lensId: string; readonly cellIndex: number } | null;
    readonly activeCodonCell: number | null;
    readonly k2OrientationQ: readonly [number, number, number, number] | null;
    readonly mathemeProofModeEnabled: boolean;
    readonly timeAxisMode: 'natal' | 'real-time' | 'kairotic' | null;
    readonly senseOverride: 'prospective' | 'retrospective' | 'auto' | null;
    readonly qComposedSnapshotId: string | null;
    readonly recognitionLayerView: 'codon' | 'resonance72' | 'wisdom-delta' | null;
    readonly anuttaraGroundingExpanded: boolean;
    readonly miniInspectorActiveIds: readonly MExtensionId[];
}

export interface CompositionStatePort {
    load(compositionId: IntegratedCompositionId): Promise<string | null>;
    save(compositionId: IntegratedCompositionId, json: string): Promise<void>;
}

const TAURI_PORT: CompositionStatePort = {
    load: compositionId => invokeCommand<string | null>('composition_state_load', { compositionId }),
    save: (compositionId, json) => invokeCommand<void>('composition_state_save', { compositionId, json })
};

const EXPECTED_KEYS = [
    'compositionId',
    'coordinate',
    'lens',
    'mode',
    'profileGeneration',
    'sessionKey',
    'dayNow',
    'pinnedMatrixFamily',
    'selectedLensCell',
    'activeCodonCell',
    'k2OrientationQ',
    'mathemeProofModeEnabled',
    'timeAxisMode',
    'senseOverride',
    'qComposedSnapshotId',
    'recognitionLayerView',
    'anuttaraGroundingExpanded',
    'miniInspectorActiveIds'
] as const;

const OPAQUE_Q_HANDLE = /^q-composed:\/\/[A-Za-z0-9][A-Za-z0-9._~:/?#@!$&'()*+,;=%-]*$/;
const EXTENSION_ID = /^m[0-5]-[a-z0-9]+(?:-[a-z0-9]+)*$/;

function record(value: unknown, label: string): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`${label} must be an object`);
    }
    return value as Record<string, unknown>;
}

function nullableString(value: unknown, label: string): string | null {
    if (value === null) return null;
    if (typeof value !== 'string' || value.length === 0 || value.length > 256) {
        throw new Error(`${label} must be a non-empty string of at most 256 characters or null`);
    }
    return value;
}

function nullableInteger(value: unknown, label: string, minimum: number, maximum: number): number | null {
    if (value === null) return null;
    if (!Number.isSafeInteger(value) || (value as number) < minimum || (value as number) > maximum) {
        throw new Error(`${label} must be an integer in ${minimum}..${maximum} or null`);
    }
    return value as number;
}

function nullableEnum<T extends string>(value: unknown, label: string, values: readonly T[]): T | null {
    if (value === null) return null;
    if (typeof value !== 'string' || !values.includes(value as T)) {
        throw new Error(`${label} must be one of ${values.join(', ')} or null`);
    }
    return value as T;
}

function strictKeys(raw: Record<string, unknown>): void {
    const actual = Object.keys(raw).sort();
    const expected = [...EXPECTED_KEYS].sort();
    if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
        throw new Error(`composition state fields must be exactly: ${EXPECTED_KEYS.join(', ')}`);
    }
}

export function parseCompositionState(value: unknown): IntegratedCompositionPersistedState {
    const raw = record(value, 'composition state');
    strictKeys(raw);
    if (!COMPOSITION_IDS.includes(raw.compositionId as IntegratedCompositionId)) {
        throw new Error('compositionId is not a registered integrated composition');
    }
    const selectedRaw = raw.selectedLensCell === null
        ? null
        : record(raw.selectedLensCell, 'selectedLensCell');
    if (selectedRaw) {
        const keys = Object.keys(selectedRaw).sort();
        if (keys.length !== 2 || keys[0] !== 'cellIndex' || keys[1] !== 'lensId') {
            throw new Error('selectedLensCell must contain exactly lensId and cellIndex');
        }
    }
    const quaternion = raw.k2OrientationQ;
    if (
        quaternion !== null &&
        (!Array.isArray(quaternion) ||
            quaternion.length !== 4 ||
            quaternion.some(value => typeof value !== 'number' || !Number.isFinite(value)))
    ) {
        throw new Error('k2OrientationQ must be four finite numbers or null');
    }
    const qHandle = nullableString(raw.qComposedSnapshotId, 'qComposedSnapshotId');
    if (qHandle !== null && !OPAQUE_Q_HANDLE.test(qHandle)) {
        throw new Error('qComposedSnapshotId must be an opaque q-composed handle, never raw quaternion material');
    }
    if (!Array.isArray(raw.miniInspectorActiveIds)) {
        throw new Error('miniInspectorActiveIds must be an array');
    }
    const inspectorIds = raw.miniInspectorActiveIds.map((value, index) => {
        if (typeof value !== 'string' || !EXTENSION_ID.test(value)) {
            throw new Error(`miniInspectorActiveIds[${index}] must be an M-extension id`);
        }
        return value;
    });
    if (new Set(inspectorIds).size !== inspectorIds.length) {
        throw new Error('miniInspectorActiveIds must not contain duplicates');
    }
    if (typeof raw.mathemeProofModeEnabled !== 'boolean' || typeof raw.anuttaraGroundingExpanded !== 'boolean') {
        throw new Error('composition boolean fields must be booleans');
    }
    const profileGeneration = nullableInteger(
        raw.profileGeneration,
        'profileGeneration',
        0,
        Number.MAX_SAFE_INTEGER
    );

    return Object.freeze({
        compositionId: raw.compositionId as IntegratedCompositionId,
        coordinate: nullableString(raw.coordinate, 'coordinate'),
        lens: nullableString(raw.lens, 'lens'),
        mode: nullableString(raw.mode, 'mode'),
        profileGeneration,
        sessionKey: nullableString(raw.sessionKey, 'sessionKey'),
        dayNow: nullableString(raw.dayNow, 'dayNow'),
        pinnedMatrixFamily: nullableInteger(raw.pinnedMatrixFamily, 'pinnedMatrixFamily', 0, 5),
        selectedLensCell: selectedRaw
            ? Object.freeze({
                  lensId: nullableString(selectedRaw.lensId, 'selectedLensCell.lensId')!,
                  cellIndex: nullableInteger(selectedRaw.cellIndex, 'selectedLensCell.cellIndex', 0, 5)!
              })
            : null,
        activeCodonCell: nullableInteger(raw.activeCodonCell, 'activeCodonCell', 0, 63),
        k2OrientationQ: quaternion === null
            ? null
            : Object.freeze([...(quaternion as number[])]) as unknown as readonly [number, number, number, number],
        mathemeProofModeEnabled: raw.mathemeProofModeEnabled,
        timeAxisMode: nullableEnum(raw.timeAxisMode, 'timeAxisMode', ['natal', 'real-time', 'kairotic']),
        senseOverride: nullableEnum(raw.senseOverride, 'senseOverride', ['prospective', 'retrospective', 'auto']),
        qComposedSnapshotId: qHandle,
        recognitionLayerView: nullableEnum(
            raw.recognitionLayerView,
            'recognitionLayerView',
            ['codon', 'resonance72', 'wisdom-delta']
        ),
        anuttaraGroundingExpanded: raw.anuttaraGroundingExpanded,
        miniInspectorActiveIds: Object.freeze(inspectorIds)
    });
}

export async function persistCompositionState(
    state: IntegratedCompositionPersistedState,
    port: CompositionStatePort = TAURI_PORT
): Promise<void> {
    const validated = parseCompositionState(state);
    await port.save(validated.compositionId, JSON.stringify(validated));
}

export async function readCompositionState(
    compositionId: IntegratedCompositionId,
    port: CompositionStatePort = TAURI_PORT
): Promise<IntegratedCompositionPersistedState | null> {
    const raw = await port.load(compositionId);
    if (raw === null) return null;
    const state = parseCompositionState(JSON.parse(raw) as unknown);
    if (state.compositionId !== compositionId) {
        throw new Error(`compositionId mismatch: requested ${compositionId}, found ${state.compositionId}`);
    }
    return state;
}

type StateById = Partial<Record<IntegratedCompositionId, IntegratedCompositionPersistedState>>;

export interface CompositionStateContextValue {
    readonly stateById: StateById;
    readonly save: (state: IntegratedCompositionPersistedState) => Promise<void>;
    readonly load: (compositionId: IntegratedCompositionId) => Promise<IntegratedCompositionPersistedState | null>;
}

const CompositionStateContext = createContext<CompositionStateContextValue | null>(null);

export function CompositionStateProvider({
    children,
    port = TAURI_PORT
}: PropsWithChildren<{ readonly port?: CompositionStatePort }>) {
    const [stateById, setStateById] = useState<StateById>({});
    const save = useCallback(async (state: IntegratedCompositionPersistedState) => {
        const validated = parseCompositionState(state);
        await persistCompositionState(validated, port);
        setStateById(current => ({ ...current, [validated.compositionId]: validated }));
    }, [port]);
    const load = useCallback(async (compositionId: IntegratedCompositionId) => {
        const state = await readCompositionState(compositionId, port);
        setStateById(current => {
            if (state) return { ...current, [compositionId]: state };
            const next = { ...current };
            delete next[compositionId];
            return next;
        });
        return state;
    }, [port]);
    const value = useMemo(() => ({ stateById, save, load }), [stateById, save, load]);
    return <CompositionStateContext.Provider value={value}>{children}</CompositionStateContext.Provider>;
}

export function useCompositionState(): CompositionStateContextValue {
    const value = useContext(CompositionStateContext);
    if (!value) throw new Error('useCompositionState must be used inside CompositionStateProvider');
    return value;
}
