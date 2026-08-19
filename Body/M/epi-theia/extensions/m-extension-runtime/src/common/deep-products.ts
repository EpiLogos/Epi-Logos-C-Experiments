import { PrivacyClass } from './coordinate-context';

/**
 * Prompt-E deep product application contract.
 *
 * Depth changes scale/composition, not semantic identity. Callers bring the
 * authoritative parent event/subject, M′ coordinate and provenance. This layer
 * selects an Epi-owned deep product/body but never mints a replacement world.
 */
export type DeepProductId =
    | 'epi.deep.m0'
    | 'epi.deep.m1'
    | 'epi.deep.m2'
    | 'epi.deep.m3'
    | 'epi.deep.m4'
    | 'epi.deep.m5';

export type ParentProductId = 'epi.personal.450' | 'epi.cosmic.123';
export type MPrimeCoordinateRef = "M0'" | "M1'" | "M2'" | "M3'" | "M4'" | "M5'";
export type DeepProductStatus =
    | 'NOT_STARTED'
    | 'CONTRACTED'
    | 'PARTIAL'
    | 'OPERATIVE'
    | 'EXPERIENTIALLY_ACCEPTED';
export type DeepBodyKind =
    | 'graph'
    | 'gpu-world'
    | 'audio-cymatic'
    | 'clock-symbolic'
    | 'protected-local'
    | 'agentic-editor'
    | 'declarative'
    | 'hybrid';
export type DeepActionRef =
    | 'epi.action.deep.open'
    | 'epi.action.deep.focus'
    | 'epi.action.deep.return';

// Keep these as literal types. Request/resolution contracts use typeof below so
// an open request cannot accidentally satisfy a focus/return slot.
export const DEEP_OPEN_ACTION = 'epi.action.deep.open' as const;
export const DEEP_FOCUS_ACTION = 'epi.action.deep.focus' as const;
export const DEEP_RETURN_ACTION = 'epi.action.deep.return' as const;

export interface DeepBoundaryPole {
    readonly coordinate: string;
    readonly meaning: string;
    readonly parentExpression: string;
}

export interface DeepCapabilityBoundary {
    readonly coordinate: string;
    readonly capability: string;
    readonly reason: string;
}

export interface DeepNativeBody {
    readonly bodyRef: string;
    readonly kind: DeepBodyKind;
    readonly owner: string;
    readonly role: string;
    readonly disposition: 'consume' | 'adapt' | 'alternate-native' | 'provider';
}

export interface DeepProductDescriptor {
    readonly productId: DeepProductId;
    readonly parentProductId: ParentProductId;
    readonly coordinate: MPrimeCoordinateRef;
    readonly agent: string;
    readonly title: string;
    readonly boundaryGround: DeepBoundaryPole;
    readonly boundaryReturn: DeepBoundaryPole;
    readonly parentSummonable: readonly DeepCapabilityBoundary[];
    readonly deepOnly: readonly DeepCapabilityBoundary[];
    readonly actions: readonly DeepActionRef[];
    readonly bodyKinds: readonly DeepBodyKind[];
    readonly nativeBodies: readonly DeepNativeBody[];
    readonly privacyClass: PrivacyClass;
    readonly requiredCapability: string;
    readonly currentStatus: DeepProductStatus;
    readonly readinessNotes: readonly string[];
    readonly sourceRefs: readonly string[];
    readonly implementationRefs: readonly string[];
}

export interface DeepParentAnchor {
    readonly parentProductId: ParentProductId;
    readonly eventRef?: string;
    readonly subjectRef?: string;
    readonly coordinate: MPrimeCoordinateRef;
    readonly selectedRef?: string;
    readonly provenanceRefs: readonly string[];
    readonly privacyClass: PrivacyClass;
}

export interface DeepOpenRequest {
    readonly actionRef: typeof DEEP_OPEN_ACTION;
    readonly requestedProductId: DeepProductId;
    readonly anchor: DeepParentAnchor;
    readonly requestedBodyRef?: string;
}

export interface DeepOpenResolution {
    readonly actionRef: typeof DEEP_OPEN_ACTION;
    readonly descriptor: DeepProductDescriptor;
    readonly anchor: DeepParentAnchor;
    readonly availableBodyRefs: readonly string[];
    readonly requestedBodyRef?: string;
    readonly readiness: DeepProductStatus;
}

export interface DeepSurfaceBinding {
    readonly surfaceRef: string;
    readonly bodyRef: string;
    readonly productId: DeepProductId;
    readonly anchor: DeepParentAnchor;
    readonly readiness: DeepProductStatus;
    readonly actions: readonly DeepActionRef[];
}

export interface DeepFocusRequest {
    readonly actionRef: typeof DEEP_FOCUS_ACTION;
    readonly binding: DeepSurfaceBinding;
}

export interface DeepReturnRequest {
    readonly actionRef: typeof DEEP_RETURN_ACTION;
    readonly binding: DeepSurfaceBinding;
}

const ACTIONS: readonly DeepActionRef[] = Object.freeze([
    DEEP_OPEN_ACTION,
    DEEP_FOCUS_ACTION,
    DEEP_RETURN_ACTION
]);
const SHARED_SOURCE_REFS = [
    'Idea/Bimba/Seeds/M/EPI-EIGHTFOLD-EXPERIENTIAL-VISION.md',
    'Idea/Bimba/Seeds/M/EPI-EIGHTFOLD-APPLICATION-ARCHITECTURE.md'
] as const;

function pole(coordinate: string, meaning: string, parentExpression: string): DeepBoundaryPole {
    return { coordinate, meaning, parentExpression };
}
function boundary(coordinate: string, capability: string, reason: string): DeepCapabilityBoundary {
    return { coordinate, capability, reason };
}
function body(
    bodyRef: string,
    kind: DeepBodyKind,
    role: string,
    disposition: DeepNativeBody['disposition'] = 'provider'
): DeepNativeBody {
    return { bodyRef, kind, owner: 'epi', role, disposition };
}
function sources(m: number): readonly string[] {
    return [
        ...SHARED_SOURCE_REFS,
        `Idea/Bimba/Seeds/M/M${m}'/M${m}'-SPEC.md`,
        `Idea/Bimba/Seeds/M/M${m}'/M${m}-ARCHITECTURE.md`
    ];
}

export const DEEP_PRODUCT_DESCRIPTORS: Readonly<Record<DeepProductId, DeepProductDescriptor>> = {
    'epi.deep.m0': {
        productId: 'epi.deep.m0', parentProductId: 'epi.personal.450', coordinate: "M0'", agent: 'Anuttara',
        title: 'Anuttara — Bimba language, relation and cartography world',
        boundaryGround: pole("M0-0'", 'pre-mathematical Bimba language and source ground', 'Personal may reveal canonical source/coordinate ground without opening the full graph world.'),
        boundaryReturn: pole("M0-5'", 'pedagogy, cartography and Möbius return', 'Return source/provenance/pedagogy to the same Personal subject; never mint a second Bimba identity.'),
        parentSummonable: [
            boundary("M0-1'", 'QL structure and coordinate-family inspection', 'Personal Source/Bimba reveal may explain the selected coordinate in place.'),
            boundary("M0-2'", 'typed relation and provenance inspection', 'Bounded traversal can explain a parent subject without becoming the graph workspace.'),
            boundary("M0-3'", 'current community/time overlay reading', 'A current DAY/NOW or event may request the relevant community/time reading.'),
            boundary("M0-4'", 'protected Personal bridge', 'M0 may expose the bridge while M4 retains protected personal depth.')
        ],
        deepOnly: [
            boundary("M0-1'..M0-3'", 'full six-layer graph/cartography composition', 'The complete language/QL/relation/community workspace is deep M0.'),
            boundary("M0-2'", 'governed graph mutation/canon promotion', 'Mutation remains an explicitly governed deep route.'),
            boundary("M0-3'", 'full GDS/community-clock exploration', 'The parent reads a relation; deep M0 explores the field.')
        ],
        actions: ACTIONS, bodyKinds: ['graph', 'declarative'],
        nativeBodies: [
            body('Body/M/epi-theia/extensions/m0-anuttara', 'graph', 'existing coordinate graph/inspector body', 'adapt'),
            body('Body/S/S2/graph-services', 'graph', 'canonical graph retrieval/traversal'),
            body('Body/S/S2/graph-schema', 'declarative', 'canonical graph schema/provenance')
        ],
        privacyClass: 'public_current_with_graph_provenance', requiredCapability: 'epi.capability.deep.m0.read', currentStatus: 'PARTIAL',
        readinessNotes: ['graph/inspector body exists', 'full six-layer composition/mutation remains incomplete', 'corrected Personal parent identity binding has not returned'],
        sourceRefs: sources(0), implementationRefs: ['Body/M/epi-theia/extensions/m0-anuttara', 'Body/S/S2/graph-services', 'Body/S/S2/graph-schema']
    },
    'epi.deep.m1': {
        productId: 'epi.deep.m1', parentProductId: 'epi.cosmic.123', coordinate: "M1'", agent: 'Paramaśiva',
        title: 'Paramaśiva — played K² / Ananda / Hopf / SU(2) instrument',
        boundaryGround: pole("M1-0'", 'immutable canonical harmonic and QL source', 'Cosmic may reveal the active harmonic/source basis without loading the played topology.'),
        boundaryReturn: pole("M1-5'", 'played topology, Hopf/SU(2), 4π recognition', 'Return bounded topology/recognition to the same Cosmic event.'),
        parentSummonable: [
            boundary("M1-1'", 'current walk/lens-mode instance state', 'Cosmic needs the present traversal state.'),
            boundary("M1-2'", 'selected harmonic/Ananda relation', 'A selected interval may be explained without opening the vortex field.'),
            boundary("M1-3'", 'current Spanda/tick relation', 'The current event depends on the shared harmonic clock.'),
            boundary("M1-4'", 'current QL flowering/lens-scale relation', 'The parent may reveal how its active coordinate is being played.')
        ],
        deepOnly: [
            boundary("M1-2'", 'full six-family Ananda vortex field', 'Whole-field exploration changes product scale.'),
            boundary("M1-5'", 'K² played torus, quaternionic TDA, Hopf/SU(2), 720°/4π world', 'This is the deep native instrument.'),
            boundary("M1-1'..M1-5'", 'long-lived performance workspace', 'Cosmic owns a current act; deep M1 owns sustained exploration.')
        ],
        actions: ACTIONS, bodyKinds: ['gpu-world', 'audio-cymatic', 'declarative'],
        nativeBodies: [
            body('Body/M/epi-theia/extensions/m1-paramasiva', 'declarative', 'existing clock/walk/topology presentation', 'adapt'),
            body('Body/M/epi-theia/extensions/m1-paramasiva-played-torus', 'gpu-world', 'existing played-torus body', 'alternate-native'),
            body('Body/S/S0/portal-core/src/hopf.rs', 'gpu-world', 'Hopf/topology computation'),
            body('Body/S/S0/portal-core/src/kernel.rs', 'declarative', 'shared harmonic/kernel authority')
        ],
        privacyClass: 'public_current_audio_metadata_only', requiredCapability: 'epi.capability.deep.m1.play', currentStatus: 'PARTIAL',
        readinessNotes: ['clock/walk and played-torus bodies exist', 'M1/M2 audio-genesis ownership remains explicit', 'corrected Cosmic parent event binding has not returned'],
        sourceRefs: sources(1), implementationRefs: ['Body/M/epi-theia/extensions/m1-paramasiva', 'Body/M/epi-theia/extensions/m1-paramasiva-played-torus', 'Body/S/S0/portal-core/src/hopf.rs']
    },
    'epi.deep.m2': {
        productId: 'epi.deep.m2', parentProductId: 'epi.cosmic.123', coordinate: "M2'", agent: 'Paraśakti',
        title: 'Paraśakti — 72-space harmonic, sacred-sonic and cymatic instrument',
        boundaryGround: pole("M2-0'", '72-invariant vibrational profile source', 'Cosmic may show its active 72-address and correspondence provenance.'),
        boundaryReturn: pole("M2-5'", 'solar-chakral runtime and 72→64 DET projection gate', 'Return solar/chakral and projection evidence without locally classifying M3 codons.'),
        parentSummonable: [
            boundary("M2-1'", 'current Vimarśā/lens resonance and audio readiness', 'Cosmic needs present resonance, not the complete lab.'),
            boundary("M2-2'", 'current elemental-medium reading', 'The active element is a bounded current condition.'),
            boundary("M2-3'", 'current decanic face/body-zone reading', 'Current cosmic context may expose the active face.'),
            boundary("M2-4'", 'selected sacred-sonic/mode/name correspondence', 'A selected relation may be sounded/explained without the full arena.')
        ],
        deepOnly: [
            boundary("M2-1'..M2-4'", 'full 72-cell six-axis correspondence field', 'Whole-field composition belongs to deep M2.'),
            boundary("M2-1'", 'material cymatic/standing-wave field', 'Cymatics is a specialised renderer over the shared bus.'),
            boundary("M2-4'", 'tuning-aware sacred-sonic/maqam/mantra performance lab', 'Microtonal performance requires specialised audio/MPE/MIDI/OSC bodies.')
        ],
        actions: ACTIONS, bodyKinds: ['audio-cymatic', 'gpu-world', 'declarative'],
        nativeBodies: [
            body('Body/M/epi-theia/extensions/m2-parashakti', 'audio-cymatic', 'existing meaning/cymatic/correspondence body', 'adapt'),
            body('Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs', 'audio-cymatic', 'Vimarśā audio-genesis provider'),
            body('Body/S/S0/epi-lib/src/m2.c', 'declarative', '72-space canonical LUT/invariants')
        ],
        privacyClass: 'public_current_with_pending_private_projection_blocks', requiredCapability: 'epi.capability.deep.m2.resonate', currentStatus: 'PARTIAL',
        readinessNotes: ['meaning/cymatic body and 72 substrate exist', 'material audio/cymatic and some provenance/provider readiness remain explicit', 'corrected Cosmic parent event binding has not returned'],
        sourceRefs: sources(2), implementationRefs: ['Body/M/epi-theia/extensions/m2-parashakti', 'Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs', 'Body/S/S0/epi-lib/src/m2.c']
    },
    'epi.deep.m3': {
        productId: 'epi.deep.m3', parentProductId: 'epi.cosmic.123', coordinate: "M3'", agent: 'Mahāmāyā',
        title: 'Mahāmāyā — 360/720 symbolic-genetic clock and transcription instrument',
        boundaryGround: pole("M3-0'", '72→64 reception/transduction and matter address', 'Cosmic may reveal transduction provenance/gap behind its current inscription.'),
        boundaryReturn: pole("M3-5'", 'K² × T² world-clock and totalised inscription', 'Return a bounded world-clock/measurement reading to the same Cosmic event.'),
        parentSummonable: [
            boundary("M3-1'", 'current codon rotational state', 'Cosmic may inspect the rotation attached to its event.'),
            boundary("M3-2'", 'current lens-mode → codon projection', 'The event may reveal the projection that produced its symbolic address.'),
            boundary("M3-3'", 'current harmonic clock inscription', 'The parent directly depends on the current 360/720 clock state.'),
            boundary("M3-4'", 'selected Tarot/I-Ching/transcription reference', 'A bounded symbolic reference is parent-summonable; private Nara interpretation is not.')
        ],
        deepOnly: [
            boundary("M3-1'", 'full 472-state rotational landscape', 'The complete state field changes product scale.'),
            boundary("M3-3'", '360°/720° clock-field + 384 line-change traversal', 'Parent current inscription is one state; deep M3 is the field.'),
            boundary("M3-5'", 'double-torus/Hopf/coupling-flow/measurement depth', 'These are deep explanatory/instrumental bodies.')
        ],
        actions: ACTIONS, bodyKinds: ['clock-symbolic', 'gpu-world', 'declarative'],
        nativeBodies: [
            body('Body/M/epi-theia/extensions/m3-mahamaya', 'clock-symbolic', 'existing codon-wheel/current symbolic surface', 'adapt'),
            body('Body/S/S0/portal-core/src/codon_rotation_projection.rs', 'clock-symbolic', '84→472 projection provider'),
            body('Body/S/S0/epi-lib/src/m3_clock_lut.c', 'clock-symbolic', '360° clock/line-change data'),
            body('Body/S/S0/portal-core/src/mahamaya.rs', 'declarative', 'Mahāmāyā state provider')
        ],
        privacyClass: 'public_current_with_scalar_oracle_refs_only', requiredCapability: 'epi.capability.deep.m3.transcribe', currentStatus: 'PARTIAL',
        readinessNotes: ['64/472/clock substrate and codon-wheel body exist', 'authoritative payload/subscription and deep renderers remain incomplete', 'corrected Cosmic parent event binding has not returned'],
        sourceRefs: sources(3), implementationRefs: ['Body/M/epi-theia/extensions/m3-mahamaya', 'Body/S/S0/portal-core/src/codon_rotation_projection.rs', 'Body/S/S0/epi-lib/src/m3_clock_lut.c']
    },
    'epi.deep.m4': {
        productId: 'epi.deep.m4', parentProductId: 'epi.personal.450', coordinate: "M4'", agent: 'Nara',
        title: 'Nara — protected identity, body, transit, activity and psychoid trajectory instrument',
        boundaryGround: pole("M4-0'", 'stable protected identity and source evidence', 'Personal may use stable identity/source handles and safe balance without disclosing raw identity internals.'),
        boundaryReturn: pole("M4-5'", 'personal integration and Epii/Sophia review relay', 'Return reviewed trajectory/insight/proposal handles to the same Personal subject; never auto-promote identity.'),
        parentSummonable: [
            boundary("M4-1'", 'safe somatic/medicinal/resonance readout', 'The lived parent may ask for a bounded body/resonance reading.'),
            boundary("M4-2'", 'oracle service and scalar symbolic refs', 'Oracle is an ordinary Personal capability; protected interpretation remains local.'),
            boundary("M4-3'", 'activity/flow/trajectory summary', 'Writing/flow/activity may use bounded Q_activity and trajectory evidence.'),
            boundary("M4-4'", 'protected journal/Graphiti/lens handles', 'Personal owns the lived journal surface, not raw identity disclosure.')
        ],
        deepOnly: [
            boundary("M4-0'..M4-4'", 'Q_identity × Q_transit × Q_activity → Q_composed interior', 'The composed quaternion is load-bearing deep computation.'),
            boundary('M4-4-4-4', 'Personal Pratibimba/sushumna/chakra/elemental/Hopf psychoid-cymatic field', 'This is the protected deep organism separated from everyday Personal.'),
            boundary("M4-4'", 'raw protected Graphiti/body/identity traversal', 'Deep access remains local and governed; selection is not disclosure.')
        ],
        actions: ACTIONS, bodyKinds: ['protected-local', 'gpu-world', 'declarative'],
        nativeBodies: [
            body('Body/M/epi-theia/extensions/m4-nara', 'protected-local', 'existing protected day/artifact/personal-field body', 'adapt'),
            body('Body/S/S0/portal-core/src/personal_identity.rs', 'protected-local', 'protected identity/Q-composition provider'),
            body('Body/S/S0/portal-core/src/nara_journal.rs', 'protected-local', 'Nara day/artifact provider'),
            body('Body/S/S3/graphiti-runtime/src/lib.rs', 'protected-local', 'protected episodic-memory provider')
        ],
        privacyClass: 'protected_local_handle_only', requiredCapability: 'epi.capability.deep.m4.protected', currentStatus: 'PARTIAL',
        readinessNotes: ['protected Nara/body providers exist', 'consent/review and full psychoid trajectory/cymatic composition remain incomplete', 'selection never grants disclosure', 'corrected Personal parent identity binding has not returned'],
        sourceRefs: sources(4), implementationRefs: ['Body/M/epi-theia/extensions/m4-nara', 'Body/S/S0/portal-core/src/personal_identity.rs', 'Body/S/S0/portal-core/src/nara_journal.rs', 'Body/S/S3/graphiti-runtime/src/lib.rs']
    },
    'epi.deep.m5': {
        productId: 'epi.deep.m5', parentProductId: 'epi.personal.450', coordinate: "M5'", agent: 'Epii',
        title: 'Epii — gnostic, canon, developer, pedagogical and Logos self-articulation instrument',
        boundaryGround: pole("M5-0'", 'gnostic/canon/library/Bimba pedagogy ground', 'Personal may retrieve source/canon context without entering the full self-development IDE.'),
        boundaryReturn: pole("M5-5'", 'Logos Atelier, recognition and Möbius return', 'Return reviewed pedagogical/Logos/canon proposals to the same Personal subject; never self-promote canon.'),
        parentSummonable: [
            boundary("M5-1'", 'canon/philosophy/source reading and bounded edit route', 'Personal source/review may summon the canon around its current subject.'),
            boundary("M5-2'", 'bounded backend/source explain and evidence', 'The parent may ask how operative software bears on its subject without becoming a developer workspace.'),
            boundary("M5-3'", 'bounded frontend/Surface explain and provenance', 'The parent may inspect presentation without acquiring shell ownership.'),
            boundary("M5-4'", 'canonical Epii dialogue/review/pedagogy', 'Canonical Epii conversation/review is an ordinary Personal capability through native Agent/Agency machinery.')
        ],
        deepOnly: [
            boundary("M5-2'", 'full backend/kernel/S-family developer studio', 'Deep M5 owns self-development; Personal summons bounded explanation/review.'),
            boundary("M5-3'", 'full frontend/product studio', 'Historical Theia is migration/body evidence; O:I owns generic hosting.'),
            boundary("M5-4'", 'full agentic control/autoresearch/self-improvement workbench', 'Consume Actuation/AIKit/Factory primitives; do not duplicate them.'),
            boundary("M5-5'", 'full Logos Atelier/etymological archaeology', 'Parent receives the return; sustained Logos archaeology is deep.')
        ],
        actions: ACTIONS, bodyKinds: ['agentic-editor', 'graph', 'declarative'],
        nativeBodies: [
            body('Body/M/epi-theia/extensions/m5-epii', 'agentic-editor', 'existing review/self-articulation body', 'adapt'),
            body('Body/S/S5/epi-gnostic', 'graph', 'gnostic/RAG library provider'),
            body('Body/S/S5/epii-review-core', 'agentic-editor', 'governed review provider'),
            body('Body/S/S5/epii-agent-core', 'agentic-editor', 'Epii-specific agent semantics; generic Agency/session remains native-owner supplied')
        ],
        privacyClass: 'governed_review_metadata_only', requiredCapability: 'epi.capability.deep.m5.review', currentStatus: 'PARTIAL',
        readinessNotes: ['review/self-articulation and S5 providers exist', 'full developer/pedagogical composition remains incomplete', 'generic AgentSession/model/harness machinery is consumed from Actuation/AIKit', 'corrected Personal parent identity binding has not returned'],
        sourceRefs: sources(5), implementationRefs: ['Body/M/epi-theia/extensions/m5-epii', 'Body/S/S5/epi-gnostic', 'Body/S/S5/epii-review-core', 'Body/S/S5/epii-agent-core']
    }
};

export function deepProductDescriptor(productId: DeepProductId): DeepProductDescriptor {
    return DEEP_PRODUCT_DESCRIPTORS[productId];
}

function assertNonEmpty(value: string | undefined, label: string): void {
    if (value !== undefined && value.trim().length === 0) {
        throw new Error(`${label} cannot be empty when supplied`);
    }
}

export function resolveDeepOpen(request: DeepOpenRequest): DeepOpenResolution {
    const descriptor = deepProductDescriptor(request.requestedProductId);
    const anchor = request.anchor;
    assertNonEmpty(anchor.eventRef, 'eventRef');
    assertNonEmpty(anchor.subjectRef, 'subjectRef');
    assertNonEmpty(anchor.selectedRef, 'selectedRef');
    if (!anchor.eventRef && !anchor.subjectRef) {
        throw new Error('deep open requires the existing parent eventRef or subjectRef');
    }
    if (anchor.parentProductId !== descriptor.parentProductId) {
        throw new Error(`${descriptor.productId} belongs to ${descriptor.parentProductId}, not ${anchor.parentProductId}`);
    }
    if (anchor.coordinate !== descriptor.coordinate) {
        throw new Error(`${descriptor.productId} requires coordinate ${descriptor.coordinate}, not ${anchor.coordinate}`);
    }
    if (anchor.provenanceRefs.length === 0) {
        throw new Error('deep open requires parent provenance; depth cannot mint provenance retroactively');
    }
    if (descriptor.productId === 'epi.deep.m4' && anchor.privacyClass !== 'protected_local_handle_only') {
        throw new Error('deep M4 requires protected-local handle authority; selection is not disclosure');
    }
    const availableBodyRefs = descriptor.nativeBodies.map(item => item.bodyRef);
    if (request.requestedBodyRef && !availableBodyRefs.includes(request.requestedBodyRef)) {
        throw new Error(`${request.requestedBodyRef} is not a declared native body for ${descriptor.productId}`);
    }
    return {
        actionRef: DEEP_OPEN_ACTION,
        descriptor,
        anchor,
        availableBodyRefs,
        requestedBodyRef: request.requestedBodyRef,
        readiness: descriptor.currentStatus
    };
}

export function bindDeepSurface(
    resolution: DeepOpenResolution,
    surfaceRef: string,
    bodyRef: string
): DeepSurfaceBinding {
    if (surfaceRef.trim().length === 0) {
        throw new Error('surfaceRef is presentation identity and must be supplied by the application host');
    }
    if (!resolution.availableBodyRefs.includes(bodyRef)) {
        throw new Error(`${bodyRef} was not resolved for ${resolution.descriptor.productId}`);
    }
    return {
        surfaceRef,
        bodyRef,
        productId: resolution.descriptor.productId,
        anchor: resolution.anchor,
        readiness: resolution.readiness,
        actions: resolution.descriptor.actions
    };
}

export function focusDeepSurface(request: DeepFocusRequest): DeepSurfaceBinding {
    if (request.binding.surfaceRef.trim().length === 0) {
        throw new Error('cannot focus an unbound deep Surface');
    }
    return request.binding;
}

export function returnFromDeepSurface(request: DeepReturnRequest): DeepParentAnchor {
    return request.binding.anchor;
}
