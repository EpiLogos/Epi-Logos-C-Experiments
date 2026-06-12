import {
    CoordinateContext,
    MathemeHarmonicProfileBoundary,
    MExtensionReadinessSnapshot
} from '@pratibimba/m-extension-runtime';
import {
    buildM2PrimeMeaningPacket,
    M2PrimeMeaningPacket,
    M2PacketSubject,
    M2ProvenanceHandle,
    M2S2CorrespondencePayload
} from '@pratibimba/m2-parashakti';

export interface ParashaktiCorrespondenceBridge {
    parashaktiCorrespondences(address72: number): Promise<unknown>;
}

export interface BuildRoutedM2PacketInput {
    readonly bridge: ParashaktiCorrespondenceBridge;
    readonly profile: MathemeHarmonicProfileBoundary;
    readonly readiness: MExtensionReadinessSnapshot;
    readonly context: CoordinateContext;
    readonly subject: M2PacketSubject;
    readonly emittedAt: number;
}

export async function buildRoutedM2PacketFromBridge(
    input: BuildRoutedM2PacketInput
): Promise<M2PrimeMeaningPacket> {
    const address72 = address72FromProfile(input.profile);
    const artifact = await input.bridge.parashaktiCorrespondences(address72);
    return buildM2PrimeMeaningPacket({
        profile: input.profile,
        readiness: input.readiness,
        context: input.context,
        subject: input.subject,
        emittedAt: input.emittedAt,
        s2: s2PayloadFromParashaktiCorrespondences(artifact)
    });
}

export function s2PayloadFromParashaktiCorrespondences(
    artifact: unknown
): M2S2CorrespondencePayload {
    const payload = recordValue(artifact, 'parashakti correspondence artifact');
    const provenanceHandle = recordValue(payload.provenanceHandle, 's2.provenanceHandle');
    const handle = stringValue(provenanceHandle.handle, 's2.provenanceHandle.handle');
    const earthObserverHandle = stringValue(payload.earthObserverHandle, 's2.earthObserverHandle');
    return Object.freeze({
        provenanceHandle: Object.freeze({
            source: 's2',
            handle,
            bodyAllowed: booleanValue(provenanceHandle.bodyAllowed, false),
            note: optionalString(provenanceHandle.note)
        }) as M2ProvenanceHandle,
        tree72Handle: optionalString(payload.tree72Handle),
        decanFace: freezeRecord(recordValue(payload.decanFace, 's2.decanFace')),
        sacredSonic: freezeRecord(recordValue(payload.sacredSonic, 's2.sacredSonic')),
        planetaryChakral: freezeRecord(recordValue(payload.planetaryChakral, 's2.planetaryChakral')),
        earthObserverHandle
    });
}

export function address72FromProfile(profile: MathemeHarmonicProfileBoundary): number {
    const payload = profile.payload as Readonly<Record<string, unknown>>;
    const resonance72 = objectValue(payload.resonance72);
    const primary = numberValue(resonance72?.lensAnchorIndex);
    const evidence = objectValue(payload.mahamaya ?? payload.binary);
    const det = numberValue(evidence?.m2VibrationIndex);
    const address = primary ?? det;
    if (address === null) {
        throw new Error('parashakti correspondence routing requires resonance72.lensAnchorIndex or m2VibrationIndex');
    }
    return normalizeAddress72(address);
}

function normalizeAddress72(value: number): number {
    const rounded = Math.trunc(value);
    return ((rounded % 72) + 72) % 72;
}

function recordValue(value: unknown, label: string): Readonly<Record<string, unknown>> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`${label} must be an object`);
    }
    return value as Readonly<Record<string, unknown>>;
}

function objectValue(value: unknown): Readonly<Record<string, unknown>> | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Readonly<Record<string, unknown>>)
        : undefined;
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function stringValue(value: unknown, label: string): string {
    if (typeof value !== 'string' || value.length === 0) {
        throw new Error(`${label} must be a non-empty string`);
    }
    return value;
}

function optionalString(value: unknown): string | undefined {
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function booleanValue(value: unknown, fallback: boolean): boolean {
    return typeof value === 'boolean' ? value : fallback;
}

function freezeRecord(value: Readonly<Record<string, unknown>>): Readonly<Record<string, unknown>> {
    return Object.freeze({ ...value });
}
