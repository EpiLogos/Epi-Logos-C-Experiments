import {
    CoordinateContext,
    MathemeHarmonicProfileBoundary,
    MExtensionReadinessSnapshot,
    MObservabilityEvent
} from '@pratibimba/m-extension-runtime';

export const EXTENSION_ID = 'm1-paramasiva-played-torus';
export const PRIMARY_VIEW_ID = 'pratibimba.m1.paramasiva.played-torus';
export const OPEN_COMMAND_ID = 'm1.playedTorus.open';
export const ROUTE_PATH = '/m1-paramasiva-played-torus/k2';
export const PRIVACY_CLASS = 'public_current_profile_geometry_only';
export const OBSERVABILITY_EVENT_TYPES = [
    'm1.played_torus.profile_frame',
    'm1.played_torus.readiness_block'
] as const;

export type PlayedTorusObservabilityType = (typeof OBSERVABILITY_EVENT_TYPES)[number];

export interface PlayedTorusTopology {
    readonly surface: 'K2';
    readonly doubleCoverDeg: number | null;
    readonly torusGenus: number | null;
    readonly source: 'substrate-profile';
    readonly boundary: 'single-k2-only';
}

export interface PlayedTorusFrame {
    readonly extensionId: typeof EXTENSION_ID;
    readonly topology: PlayedTorusTopology;
    readonly profileGeneration: number | null;
    readonly tick12: number | null;
    readonly position6: number | null;
    readonly degree720: number | null;
    readonly lensMode: unknown;
    readonly ananda: AnandaFrame | null;
    readonly vimarshaWindows: VimarshaWindowFrame;
    readonly readinessBadges: readonly PlayedTorusReadinessBadge[];
    readonly rendererInput: PlayedTorusRendererInput;
    readonly observabilityEvents: readonly MObservabilityEvent[];
}

export interface PlayedTorusRendererInput {
    readonly canvasMount: 'bevy-wgpu';
    readonly frameSource: 'MathemeHarmonicProfile';
    readonly orientationQuaternion: readonly number[] | null;
    readonly activeCellValueSource: 'profile.ananda_vortex.active_cell_value' | null;
}

export interface AnandaFrame {
    readonly activeMatrixOp: unknown;
    readonly activeCell: readonly [number, number] | null;
    readonly activeCellValue: Readonly<Record<string, unknown>>;
    readonly activeCellValueSource: 'profile.ananda_vortex.active_cell_value';
    readonly rawValue: number | null;
    readonly digitRootValue: number | null;
    readonly streamPhase: unknown;
    readonly cl42SignatureAtPosition: number | null;
    readonly helixSheet: number | null;
    readonly kleinFlipAtThisTick: boolean | null;
}

export interface VimarshaWindowFrame {
    readonly audioOctet: readonly unknown[];
    readonly nodalQuartet: readonly unknown[];
    readonly audioSource: 'profile.audio_octet';
    readonly nodalSource: 'profile.nodal_quartet';
    readonly particleEmitterCount: number;
    readonly satelliteGlyphCount: number;
}

export interface PlayedTorusReadinessBadge {
    readonly id: 'pending-ananda-vortex' | 'pending-audio-octet' | 'pending-nodal-quartet' | 'pending-klein-flip';
    readonly reason: string;
}

export function buildPlayedTorusFrame(input: {
    readonly profile: MathemeHarmonicProfileBoundary | null;
    readonly readiness: MExtensionReadinessSnapshot;
    readonly context: CoordinateContext;
    readonly emittedAt?: number;
}): PlayedTorusFrame {
    const payload = input.profile?.payload ?? {};
    const ananda = readAnanda(payload);
    const audioOctet = readArray(payload.audio_octet);
    const nodalQuartet = readArray(payload.nodal_quartet);
    const badges = readinessBadges(ananda, audioOctet, nodalQuartet);
    const degree720 = readNumber(payload.degree720);
    const frame: PlayedTorusFrame = {
        extensionId: EXTENSION_ID,
        topology: {
            surface: 'K2',
            doubleCoverDeg: degree720 === null ? null : 720,
            torusGenus: degree720 === null ? null : 1,
            source: 'substrate-profile',
            boundary: 'single-k2-only'
        },
        profileGeneration: input.profile?.generation ?? input.context.profileGeneration ?? null,
        tick12: readNumber(payload.tick12),
        position6: readNumber(payload.position6),
        degree720,
        lensMode: payload.lens_mode ?? payload.lensMode ?? null,
        ananda,
        vimarshaWindows: {
            audioOctet,
            nodalQuartet,
            audioSource: 'profile.audio_octet',
            nodalSource: 'profile.nodal_quartet',
            particleEmitterCount: audioOctet.length,
            satelliteGlyphCount: nodalQuartet.length
        },
        readinessBadges: badges,
        rendererInput: {
            canvasMount: 'bevy-wgpu',
            frameSource: 'MathemeHarmonicProfile',
            orientationQuaternion: ananda?.activeCellValue ? readNumberArray((payload.ananda_vortex as Record<string, unknown>)?.ring_quaternion) : null,
            activeCellValueSource: ananda?.activeCellValueSource ?? null
        },
        observabilityEvents: []
    };
    return {
        ...frame,
        observabilityEvents: buildObservability(frame, input.readiness, input.emittedAt)
    };
}

function readAnanda(payload: Readonly<Record<string, unknown>>): AnandaFrame | null {
    const vortex = readRecord(payload.ananda_vortex);
    if (!vortex) {
        return null;
    }
    const cellValue = readRecord(vortex.active_cell_value);
    if (!cellValue) {
        return null;
    }
    return {
        activeMatrixOp: vortex.active_matrix_op ?? null,
        activeCell: readPair(vortex.active_cell),
        activeCellValue: cellValue,
        activeCellValueSource: 'profile.ananda_vortex.active_cell_value',
        rawValue: readNumber(cellValue.raw_value),
        digitRootValue: readNumber(cellValue.dr_value),
        streamPhase: vortex.dr_ring_phase ?? null,
        cl42SignatureAtPosition: readNumber(vortex.cl42_signature_at_position),
        helixSheet: readNumber(vortex.helix_sheet),
        kleinFlipAtThisTick:
            typeof vortex.klein_flip_at_this_tick === 'boolean'
                ? vortex.klein_flip_at_this_tick
                : null
    };
}

function readinessBadges(
    ananda: AnandaFrame | null,
    audioOctet: readonly unknown[],
    nodalQuartet: readonly unknown[]
): readonly PlayedTorusReadinessBadge[] {
    const badges: PlayedTorusReadinessBadge[] = [];
    if (!ananda) {
        badges.push({
            id: 'pending-ananda-vortex',
            reason: 'MathemeHarmonicProfile.ananda_vortex.active_cell_value is not present.'
        });
    }
    if (audioOctet.length !== 8) {
        badges.push({
            id: 'pending-audio-octet',
            reason: 'profile.audio_octet did not carry 8 Vimarsha window emitters.'
        });
    }
    if (nodalQuartet.length !== 4) {
        badges.push({
            id: 'pending-nodal-quartet',
            reason: 'profile.nodal_quartet did not carry 4 Vimarsha window satellites.'
        });
    }
    if (ananda?.kleinFlipAtThisTick === null) {
        badges.push({
            id: 'pending-klein-flip',
            reason: 'profile.ananda_vortex.klein_flip_at_this_tick is not present.'
        });
    }
    return Object.freeze(badges);
}

function buildObservability(
    frame: PlayedTorusFrame,
    readiness: MExtensionReadinessSnapshot,
    emittedAt = Date.now()
): readonly MObservabilityEvent[] {
    const eventType: PlayedTorusObservabilityType =
        frame.readinessBadges.length === 0
            ? 'm1.played_torus.profile_frame'
            : 'm1.played_torus.readiness_block';
    return Object.freeze([
        {
            type: eventType,
            extensionId: EXTENSION_ID,
            emittedAt,
            payload: Object.freeze({
                profileGeneration: frame.profileGeneration,
                tick12: frame.tick12,
                activeCellValueSource: frame.rendererInput.activeCellValueSource,
                audioSource: frame.vimarshaWindows.audioSource,
                nodalSource: frame.vimarshaWindows.nodalSource,
                readiness: readiness.state,
                badges: frame.readinessBadges.map(badge => badge.id)
            })
        }
    ]);
}

function readRecord(value: unknown): Readonly<Record<string, unknown>> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Readonly<Record<string, unknown>>)
        : null;
}

function readArray(value: unknown): readonly unknown[] {
    return Array.isArray(value) ? Object.freeze([...value]) : Object.freeze([]);
}

function readNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readNumberArray(value: unknown): readonly number[] | null {
    if (!Array.isArray(value) || !value.every(item => typeof item === 'number' && Number.isFinite(item))) {
        return null;
    }
    return Object.freeze([...value]);
}

function readPair(value: unknown): readonly [number, number] | null {
    const pair = readNumberArray(value);
    return pair && pair.length === 2 ? [pair[0], pair[1]] : null;
}
