import type {
    CoordinateContext,
    MathemeHarmonicProfileBoundary,
    MExtensionReadinessSnapshot,
    MExtensionReadinessState,
    MObservabilityEvent
} from '@pratibimba/m-extension-runtime';

export const M2_MEANING_PACKET_CONTRACT_VERSION = '2026-06-01.07-T5';
export const PROTECTED_PERSONAL_CYMATIC_SCOPE = 'protected-m4';
const M2_MEANING_PACKET_EXTENSION_ID = 'm2-parashakti' as const;
const M2_MEANING_PACKET_PRIVACY_CLASS =
    'public_current_with_pending_private_projection_blocks' as const;

export type M2PacketSubject = 'tick' | 'note' | 'routing-event' | 'cymatic-frame';
export type M2CymaticScope = 'cosmic-public' | 'protected-m4' | 'personal-pratibimba';

export interface M2ProvenanceHandle {
    readonly source: 'profile' | 's2' | 'kerykeion' | 'm1' | 'm3' | 'pending';
    readonly handle: string;
    readonly bodyAllowed: boolean;
    readonly note?: string;
}

export interface M2S2CorrespondencePayload {
    readonly provenanceHandle: M2ProvenanceHandle;
    readonly tree72Handle?: string;
    readonly decanFace?: Readonly<Record<string, unknown>>;
    readonly sacredSonic?: Readonly<Record<string, unknown>>;
    readonly planetaryChakral?: Readonly<Record<string, unknown>>;
    readonly earthObserverHandle?: string;
}

export interface M2KerykeionRuntimePayload {
    readonly provenanceHandle: M2ProvenanceHandle;
    readonly worldClockHandle?: string;
    readonly planetaryHourRuler?: string;
    readonly transitHandle?: string;
}

export interface M2PrimeMeaningPacketInput {
    readonly profile: MathemeHarmonicProfileBoundary;
    readonly readiness: MExtensionReadinessSnapshot;
    readonly context: CoordinateContext;
    readonly subject: M2PacketSubject;
    readonly emittedAt: number;
    readonly s2?: M2S2CorrespondencePayload;
    readonly kerykeion?: M2KerykeionRuntimePayload;
    readonly cymaticScope?: M2CymaticScope;
}

export interface M2AddressView {
    readonly name: 'mef' | 'tattva-phase' | 'decan-face' | 'shem' | 'asma' | 'maqam' | 'det-projection';
    readonly address72: number;
    readonly sourceField: string;
}

type M2AddressViewName = M2AddressView['name'];

interface M2AddressViewDecoder {
    readonly name: M2AddressViewName;
    readonly sourceField: string;
}

const M2_ADDRESS_VIEW_DECODERS: readonly M2AddressViewDecoder[] = Object.freeze([
    Object.freeze({
        name: 'mef',
        sourceField: 'profile.resonance72.lensAnchorIndex'
    }),
    Object.freeze({
        name: 'tattva-phase',
        sourceField: 'kernel-bridge.m2.decodeAxisAt(address72, "tattva-phase").tattvaPhase'
    }),
    Object.freeze({
        name: 'decan-face',
        sourceField: 'kernel-bridge.m2.decodeAxisAt(address72, "decan-face").decanFace'
    }),
    Object.freeze({
        name: 'shem',
        sourceField: 'kernel-bridge.m2.decodeAxisAt(address72, "shem").shem'
    }),
    Object.freeze({
        name: 'asma',
        sourceField: 'kernel-bridge.m2.routeOverlayAt(address72, "asma").asma'
    }),
    Object.freeze({
        name: 'maqam',
        sourceField: 'kernel-bridge.m2.decodeAxisAt(address72, "maqam").maqam'
    }),
    Object.freeze({
        name: 'det-projection',
        sourceField: 'kernel-bridge.m2.decodeAxisAt(address72, "det-projection").detProjection'
    })
]);

export interface M2CymaticFrame {
    readonly mode: 'profile-bus-standing-wave';
    readonly fidelity: 'deterministic-stylised';
    readonly address72: number;
    readonly audioOctetHz: readonly number[];
    readonly nodalQuartet: readonly Readonly<Record<string, unknown>>[];
    readonly sampleCount: number;
    readonly wavePoints: readonly number[];
    readonly exactProfileBus: true;
    readonly personalScopeBlocked: boolean;
    readonly blockReason: string | null;
}

export interface M2PrimeMeaningPacket {
    readonly contractVersion: typeof M2_MEANING_PACKET_CONTRACT_VERSION;
    readonly extensionId: typeof M2_MEANING_PACKET_EXTENSION_ID;
    readonly subject: M2PacketSubject;
    readonly profileGeneration: number;
    readonly privacyClass: typeof M2_MEANING_PACKET_PRIVACY_CLASS;
    readonly address72: number;
    readonly addressViews: readonly M2AddressView[];
    readonly lensModeFrame: Readonly<Record<string, unknown>>;
    readonly elementalFrame: Readonly<Record<string, unknown>>;
    readonly decanFaceFrame: Readonly<Record<string, unknown>>;
    readonly sacredSonicFrame: Readonly<Record<string, unknown>>;
    readonly planetaryChakralFrame: Readonly<Record<string, unknown>>;
    readonly detEvidence: Readonly<Record<string, unknown>>;
    readonly cymaticSignature: M2CymaticFrame;
    readonly kleinFlip: Readonly<Record<string, unknown>>;
    readonly provenance: readonly M2ProvenanceHandle[];
    readonly meaningPacketProvenanceFor: (field: string) => M2ProvenanceHandle;
    readonly pendingFields: readonly string[];
    readonly readiness: {
        readonly state: MExtensionReadinessState;
        readonly packetReady: boolean;
        readonly blockers: readonly string[];
    };
    readonly observabilityEvents: readonly MObservabilityEvent[];
}

export function buildM2PrimeMeaningPacket(input: M2PrimeMeaningPacketInput): M2PrimeMeaningPacket {
    const payload = input.profile.payload;
    const address72 = profileAddress72(payload);
    const audioOctet = audioOctetFromPayload(payload);
    const nodalQuartet = nodalQuartetFromPayload(payload);
    const pendingFields = pendingPacketFields(input, audioOctet, nodalQuartet);
    const cymaticSignature = renderM2CymaticFrame({
        profile: input.profile,
        address72,
        scope: input.cymaticScope ?? 'cosmic-public'
    });
    const provenance = provenanceHandles(input);
    const provenanceFor = meaningPacketProvenanceSelector(provenance);
    const blockers = packetBlockers(input, pendingFields, cymaticSignature);

    const packetPayload = Object.freeze({
        contractVersion: M2_MEANING_PACKET_CONTRACT_VERSION,
        profileGeneration: input.profile.generation,
        address72,
        subject: input.subject,
        privacyClass: M2_MEANING_PACKET_PRIVACY_CLASS,
        provenanceHandles: provenance.map(handle => handle.handle),
        pendingFields,
        detEvidenceOnly: true,
        finalCodonAuthority: 'M3/M3-prime',
        personalCymaticBlocked: cymaticSignature.personalScopeBlocked
    });

    return Object.freeze({
        contractVersion: M2_MEANING_PACKET_CONTRACT_VERSION,
        extensionId: M2_MEANING_PACKET_EXTENSION_ID,
        subject: input.subject,
        profileGeneration: input.profile.generation,
        privacyClass: M2_MEANING_PACKET_PRIVACY_CLASS,
        address72,
        addressViews: Object.freeze(buildAddressViews(address72)),
        lensModeFrame: freezeRecord({
            source: 'profile.lensMode + profile.codonRotationProjection',
            lensMode: cloneRecord(objectValue(payload.lensMode)),
            projection: cloneRecord(objectValue(payload.codonRotationProjection))
        }),
        elementalFrame: freezeRecord({
            source: 'profile.elements',
            values: cloneRecord(objectValue(payload.elements))
        }),
        decanFaceFrame: frameOrPending('s2.decanFace', input.s2?.decanFace),
        sacredSonicFrame: frameOrPending('s2.sacredSonic', input.s2?.sacredSonic),
        planetaryChakralFrame: freezeRecord({
            source: input.s2?.planetaryChakral ? 's2.planetaryChakral' : 'profile.planetaryChakral',
            values: cloneRecord(input.s2?.planetaryChakral ?? objectValue(payload.planetaryChakral)),
            earthObserverHandle: input.s2?.earthObserverHandle ?? null
        }),
        detEvidence: freezeRecord({
            source: 'profile.mahamaya/profile.binary evidence only',
            evidence: cloneRecord(objectValue(payload.mahamaya ?? payload.binary)),
            finalClassificationAuthority: 'M3/M3-prime'
        }),
        cymaticSignature,
        kleinFlip: kleinFlipFrame(payload),
        provenance: Object.freeze(provenance),
        meaningPacketProvenanceFor: provenanceFor,
        pendingFields: Object.freeze(pendingFields),
        readiness: Object.freeze({
            state: blockers.length === 0 ? input.readiness.state : 'authority_payload_missing',
            packetReady: blockers.length === 0,
            blockers: Object.freeze(blockers)
        }),
        observabilityEvents: Object.freeze([
            Object.freeze({
                type: 'm2.meaning_packet',
                extensionId: M2_MEANING_PACKET_EXTENSION_ID,
                emittedAt: input.emittedAt,
                payload: packetPayload
            }),
            Object.freeze({
                type: 'm2.routing_trace',
                extensionId: M2_MEANING_PACKET_EXTENSION_ID,
                emittedAt: input.emittedAt,
                payload: Object.freeze({
                    ...packetPayload,
                    routeEdges: Object.freeze([
                        'm2.address72',
                        'm2.lens-mode',
                        'm2.elemental-frame',
                        'm2.s2-correspondence-provenance',
                        'm2.det-evidence-to-m3'
                    ])
                })
            })
        ])
    });
}

export function meaningPacketProvenanceFor(
    packet: Pick<M2PrimeMeaningPacket, 'meaningPacketProvenanceFor'>,
    field: string
): M2ProvenanceHandle {
    return packet.meaningPacketProvenanceFor(field);
}

export function renderM2CymaticFrame(input: {
    readonly profile: MathemeHarmonicProfileBoundary;
    readonly address72?: number;
    readonly scope?: M2CymaticScope;
}): M2CymaticFrame {
    const payload = input.profile.payload;
    const audioOctet = audioOctetFromPayload(payload);
    const nodalQuartet = nodalQuartetFromPayload(payload);
    if (!audioOctet || !nodalQuartet) {
        throw new Error('m2 cymatic renderer requires exact profile audioOctet[8] and nodalQuartet[4]');
    }

    const address72 = input.address72 ?? profileAddress72(payload);
    const scope = input.scope ?? 'cosmic-public';
    const personalScopeBlocked = scope === 'personal-pratibimba';
    const wavePoints = buildStandingWavePoints(audioOctet, nodalQuartet, address72);

    return Object.freeze({
        mode: 'profile-bus-standing-wave',
        fidelity: 'deterministic-stylised',
        address72,
        audioOctetHz: Object.freeze([...audioOctet]),
        nodalQuartet: Object.freeze(nodalQuartet.map(node => freezeRecord(node))),
        sampleCount: wavePoints.length,
        wavePoints: Object.freeze(wavePoints),
        exactProfileBus: true,
        personalScopeBlocked,
        blockReason: personalScopeBlocked
            ? `personal-Pratibimba cymatic rendering requires ${PROTECTED_PERSONAL_CYMATIC_SCOPE}`
            : null
    });
}

function buildAddressViews(address72: number): M2AddressView[] {
    return M2_ADDRESS_VIEW_DECODERS.map(decoder =>
        addressView(decoder.name, decodeAxisAddressAt(address72, decoder.name), decoder.sourceField)
    );
}

function decodeAxisAddressAt(address72: number, axis: M2AddressViewName): number {
    switch (axis) {
        case 'mef':
        case 'tattva-phase':
        case 'decan-face':
        case 'shem':
        case 'asma':
        case 'maqam':
        case 'det-projection':
            return normalizeAddress72(address72);
    }
}

function addressView(name: M2AddressViewName, address72: number, sourceField: string): M2AddressView {
    return Object.freeze({ name, address72, sourceField });
}

function profileAddress72(payload: Readonly<Record<string, unknown>>): number {
    const resonance72 = objectValue(payload.resonance72);
    const primary = numberValue(resonance72?.lensAnchorIndex);
    const det = numberValue(objectValue(payload.mahamaya ?? payload.binary)?.m2VibrationIndex);
    const address = primary ?? det;
    if (address === null) {
        throw new Error('M2PrimeMeaningPacket requires profile resonance72.lensAnchorIndex or M3 evidence m2VibrationIndex');
    }
    return normalizeAddress72(address);
}

function normalizeAddress72(value: number): number {
    const rounded = Math.trunc(value);
    return ((rounded % 72) + 72) % 72;
}

function buildStandingWavePoints(
    audioOctet: readonly number[],
    nodalQuartet: readonly Readonly<Record<string, unknown>>[],
    address72: number
): number[] {
    const points: number[] = [];
    for (let sample = 0; sample < 72; sample += 1) {
        const theta = (Math.PI * 2 * sample) / 72;
        let amplitude = 0;
        for (let index = 0; index < audioOctet.length; index += 1) {
            const node = nodalQuartet[index % nodalQuartet.length];
            const m = numberValue(node.m) ?? 1;
            const n = numberValue(node.n) ?? 1;
            const hz = audioOctet[index];
            const phase = ((address72 + index + 1) * Math.PI) / 36;
            amplitude += Math.sin(theta * m + phase) * Math.cos(theta * n) * (hz / audioOctet[0]);
        }
        points.push(Number((amplitude / audioOctet.length).toFixed(6)));
    }
    return points;
}

function pendingPacketFields(
    input: M2PrimeMeaningPacketInput,
    audioOctet: readonly number[] | null,
    nodalQuartet: readonly Readonly<Record<string, unknown>>[] | null
): string[] {
    const pending = [];
    if (!audioOctet) pending.push('profile.audioOctet[8]');
    if (!nodalQuartet) pending.push('profile.nodalQuartet[4]');
    if (!input.s2?.decanFace) pending.push('s2.decanFace');
    if (!input.s2?.sacredSonic) pending.push('s2.sacredSonic');
    if (!input.s2?.earthObserverHandle) pending.push('s2.earthObserverHandle');
    if (!input.kerykeion?.worldClockHandle) pending.push('s3.kerykeion.worldClockHandle');
    return pending;
}

function packetBlockers(
    input: M2PrimeMeaningPacketInput,
    pendingFields: readonly string[],
    cymaticSignature: M2CymaticFrame
): string[] {
    const blockers = [];
    if (!input.s2?.provenanceHandle) blockers.push('Track 02 S2 correspondence provenance missing');
    if (!input.kerykeion?.provenanceHandle) blockers.push('Track 03 Kerykeion/world_clock provenance missing');
    if (cymaticSignature.personalScopeBlocked) blockers.push(cymaticSignature.blockReason ?? 'personal cymatic scope blocked');
    if (pendingFields.includes('profile.audioOctet[8]') || pendingFields.includes('profile.nodalQuartet[4]')) {
        blockers.push('Track 01 profile audio bus incomplete');
    }
    return blockers;
}

function provenanceHandles(input: M2PrimeMeaningPacketInput): M2ProvenanceHandle[] {
    const handles: M2ProvenanceHandle[] = [
        Object.freeze({
            source: 'profile',
            handle: `profile:generation:${input.profile.generation}`,
            bodyAllowed: true,
            note: 'MathemeHarmonicProfile public-current payload'
        })
    ];
    if (input.s2?.provenanceHandle) handles.push(input.s2.provenanceHandle);
    if (input.kerykeion?.provenanceHandle) handles.push(input.kerykeion.provenanceHandle);
    return handles;
}

function meaningPacketProvenanceSelector(
    provenance: readonly M2ProvenanceHandle[]
): (field: string) => M2ProvenanceHandle {
    const handles = new Map(provenance.map(handle => [handle.source, handle] as const));
    return (field: string): M2ProvenanceHandle => {
        const source = provenanceSourceForField(field);
        return handles.get(source) ?? pendingProvenanceHandle(field, source);
    };
}

function provenanceSourceForField(field: string): M2ProvenanceHandle['source'] {
    const normalized = field.trim();
    if (
        normalized.startsWith('s2.') ||
        normalized.includes('decan') ||
        normalized.includes('sacred') ||
        normalized.includes('shem') ||
        normalized.includes('asma') ||
        normalized.includes('maqam') ||
        normalized.includes('tree') ||
        normalized.includes('planetaryChakral')
    ) {
        return 's2';
    }
    if (
        normalized.startsWith('s3.') ||
        normalized.includes('kerykeion') ||
        normalized.includes('worldClock') ||
        normalized.includes('body-zone')
    ) {
        return 'kerykeion';
    }
    if (normalized.includes('m1') || normalized.includes('lensMode')) {
        return 'm1';
    }
    if (normalized.includes('m3') || normalized.includes('det') || normalized.includes('tarot')) {
        return 'm3';
    }
    return 'profile';
}

function pendingProvenanceHandle(field: string, source: M2ProvenanceHandle['source']): M2ProvenanceHandle {
    return Object.freeze({
        source: 'pending',
        handle: `pending:${source}:${field.trim() || 'unknown-field'}`,
        bodyAllowed: false,
        note: `No ${source} provenance handle is available for ${field.trim() || 'unknown-field'}`
    });
}

function frameOrPending(source: string, value: Readonly<Record<string, unknown>> | undefined): Readonly<Record<string, unknown>> {
    return freezeRecord({
        source,
        values: cloneRecord(value),
        pending: value ? false : true
    });
}

function kleinFlipFrame(payload: Readonly<Record<string, unknown>>): Readonly<Record<string, unknown>> {
    const raw = objectValue(payload.kleinFlip);
    const kind = typeof raw?.kind === 'string' ? raw.kind : null;
    return freezeRecord({
        source: raw ? 'profile.kleinFlip' : 'pending-kleinFlip',
        kind,
        event: raw ?? null,
        surfaceValence: kind === 'm2CymaticValenceInvert' ? 'inverted' : 'primary'
    });
}

function audioOctetFromPayload(payload: Readonly<Record<string, unknown>>): readonly number[] | null {
    const raw = arrayValue(payload.audioOctet ?? payload.audio_octet);
    if (raw.length !== 8) return null;
    const values = raw.map(numberValue);
    return values.every((value): value is number => value !== null && Number.isFinite(value))
        ? Object.freeze(values)
        : null;
}

function nodalQuartetFromPayload(
    payload: Readonly<Record<string, unknown>>
): readonly Readonly<Record<string, unknown>>[] | null {
    const raw = arrayValue(payload.nodalQuartet ?? payload.nodal_quartet);
    if (raw.length !== 4) return null;
    const nodes = raw.map(objectValue);
    return nodes.every((node): node is Readonly<Record<string, unknown>> => node !== undefined)
        ? Object.freeze(nodes.map(node => freezeRecord(node)))
        : null;
}

function objectValue(value: unknown): Readonly<Record<string, unknown>> | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Readonly<Record<string, unknown>>)
        : undefined;
}

function arrayValue(value: unknown): readonly unknown[] {
    return Array.isArray(value) ? value : [];
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function cloneRecord(value: Readonly<Record<string, unknown>> | undefined): Readonly<Record<string, unknown>> | null {
    return value ? freezeRecord({ ...value }) : null;
}

function freezeRecord(value: Readonly<Record<string, unknown>>): Readonly<Record<string, unknown>> {
    return Object.freeze(value);
}
