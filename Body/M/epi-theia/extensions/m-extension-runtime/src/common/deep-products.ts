import { PrivacyClass } from './coordinate-context';

/**
 * E / Eightfold deep-product application contract.
 *
 * This file is intentionally renderer- and host-neutral even though it currently
 * lives in the shared M-extension runtime package. O:I owns generic application
 * placement; the historical Theia packages are native-body/migration evidence,
 * not the owner of tabs, SessionSpace, AgentSession, Search, or workbench state.
 *
 * The decisive invariant is semantic co-reference: opening depth never creates a
 * second event, subject, coordinate, or provenance world. A caller supplies the
 * already-authoritative parent anchor and receives the same anchor back with a
 * deeper product/body relation attached.
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

export const DEEP_OPEN_ACTION: DeepActionRef = 'epi.action.deep.open';
export const DEEP_FOCUS_ACTION: DeepActionRef = 'epi.action.deep.focus';
export const DEEP_RETURN_ACTION: DeepActionRef = 'epi.action.deep.return';

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
    /** Exact parent semantic anchor; never generated or rewritten here. */
    readonly anchor: DeepParentAnchor;
    readonly availableBodyRefs: readonly string[];
    readonly requestedBodyRef?: string;
    readonly readiness: DeepProductStatus;
}

export interface DeepSurfaceBinding {
    /** Presentation identity supplied by the native application host. */
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

function body(
    bodyRef: string,
    kind: DeepBodyKind,
    owner: string,
    role: string,
    disposition: DeepNativeBody['disposition']
): DeepNativeBody {
    return { bodyRef, kind, owner, role, disposition };
}

function boundary(
    coordinate: string,
    capability: string,
    reason: string
): DeepCapabilityBoundary {
    return { coordinate, capability, reason };
}

const SHARED_SOURCE_REFS = [
    'Idea/Bimba/Seeds/M/EPI-EIGHTFOLD-EXPERIENTIAL-VISION.md',
    'Idea/Bimba/Seeds/M/EPI-EIGHTFOLD-APPLICATION-ARCHITECTURE.md'
] as const;

export const DEEP_PRODUCT_DESCRIPTORS: Readonly<Record<DeepProductId, DeepProductDescriptor>> = {
    'epi.deep.m0': {
        productId: 'epi.deep.m0',
        parentProductId: 'epi.personal.450',
        coordinate: "M0'",
        agent: 'Anuttara',
        title: 'Anuttara — Bimba language, relation and cartography world',
        boundaryGround: {
            coordinate: "M0-0'",
            meaning: 'pre-mathematical Bimba language and source ground',
            parentExpression: 'the Personal parent may reveal the canonical coordinate/source ground without opening the full graph world'
        },
        boundaryReturn: {
            coordinate: "M0-5'",
            meaning: 'pedagogy, cartography and Möbius return',
            parentExpression: 'return a source/provenance/pedagogical reading to the same Personal subject; do not create a second Bimba identity'
        },
        parentSummonable: [
            boundary("M0-1'", 'QL structure and coordinate-family inspection', 'Personal Source/Bimba reveal can explain the selected coordinate in place.'),
            boundary("M0-2'", 'typed relation and provenance inspection', 'Parent explain/source affordances may traverse bounded relations without becoming the full cartography workspace.'),
            boundary("M0-3'", 'current community/time overlay reading', 'A current DAY/NOW or event may request the relevant community/time context as a reading.'),
            boundary("M0-4'", 'protected Personal bridge', 'M0 owns the bridge to the already-current Personal subject; M4 owns protected personal depth.')
        ],
        deepOnly: [
            boundary("M0-1'..M0-3'", 'full six-layer graph/cartography composition', 'The complete language/QL/relation/community workspace is the deep M0 product, not a Personal detail panel.'),
            boundary("M0-2'", 'governed graph mutation and canon promotion', 'Current M0 source keeps mutation behind an explicit governed route/readiness decision.'),
            boundary("M0-3'", 'GDS/community-clock exploration at full graph scale', 'The parent may read the current relation; the exploratory graph body remains deep.')
        ],
        actions: [DEEP_OPEN_ACTION, DEEP_FOCUS_ACTION, DEEP_RETURN_ACTION],
        bodyKinds: ['graph', 'declarative'],
        nativeBodies: [
            body('Body/M/epi-theia/extensions/m0-anuttara', 'graph', 'epi', 'existing coordinate graph/inspector body; extract or host as a native Surface, not as a shell owner', 'adapt'),
            body('Body/S/S2/graph-services', 'graph', 'epi', 'canonical graph retrieval/traversal provider', 'provider'),
            body('Body/S/S2/graph-schema', 'declarative', 'epi', 'canonical graph schema/provenance provider', 'provider')
        ],
        privacyClass: 'public_current_with_graph_provenance',
        requiredCapability: 'epi.capability.deep.m0.read',
        currentStatus: 'PARTIAL',
        readinessNotes: [
            'cycle-2 graph/inspector body and shared bridge are implemented',
            'six-layer deep composition and governed mutation path remain incomplete',
            'parent identity binding awaits the returned epi.personal.450 contract'
        ],
        sourceRefs: [...SHARED_SOURCE_REFS, "Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md", "Idea/Bimba/Seeds/M/M0'/M0-ARCHITECTURE.md"],
        implementationRefs: [
            'Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts',
            'Body/M/epi-theia/extensions/m0-anuttara/ARCHITECTURE.md',
            'Body/S/S2/graph-services',
            'Body/S/S2/graph-schema'
        ]
    },
    'epi.deep.m1': {
        productId: 'epi.deep.m1',
        parentProductId: 'epi.cosmic.123',
        coordinate: "M1'",
        agent: 'Paramaśiva',
        title: 'Paramaśiva — played K² / Ananda / Hopf / SU(2) instrument',
        boundaryGround: {
            coordinate: "M1-0'",
            meaning: 'immutable canonical harmonic and QL source',
            parentExpression: 'Cosmic may expose the current harmonic/source basis and provenance without loading the full played topology'
        },
        boundaryReturn: {
            coordinate: "M1-5'",
            meaning: 'played topology, Hopf/SU(2), 4π recognition',
            parentExpression: 'return a bounded topology/recognition reading to the same Cosmic event while the complete K²/Hopf body remains deep'
        },
        parentSummonable: [
            boundary("M1-1'", 'current walk / lens-mode instance state', 'Cosmic needs the present traversal state as part of its current act.'),
            boundary("M1-2'", 'selected harmonic/Ananda relation reading', 'A current interval or relation may be explained without opening the full vortex field.'),
            boundary("M1-3'", 'current Spanda/tick relation', 'The parent current-event contract already depends on the shared harmonic clock.'),
            boundary("M1-4'", 'current QL flowering / lens-scale relation', 'The parent may reveal how the active coordinate is being played through the current lens/mode.')
        ],
        deepOnly: [
            boundary("M1-2'", 'full six-family Ananda vortex field and streamline exploration', 'The whole harmonic field changes scale and composition beyond the Cosmic current reading.'),
            boundary("M1-5'", 'full K² played torus, quaternionic TDA, Hopf/SU(2), 720°/4π world', 'This is the deep native instrument body rather than a parent panel.'),
            boundary("M1-1'..M1-5'", 'long-lived editable/composable performance workspace', 'The parent owns one current act; deep M1 owns sustained instrumental exploration.')
        ],
        actions: [DEEP_OPEN_ACTION, DEEP_FOCUS_ACTION, DEEP_RETURN_ACTION],
        bodyKinds: ['gpu-world', 'audio-cymatic', 'declarative'],
        nativeBodies: [
            body('Body/M/epi-theia/extensions/m1-paramasiva', 'declarative', 'epi', 'existing clock/walk/topology presentation contract', 'adapt'),
            body('Body/M/epi-theia/extensions/m1-paramasiva-played-torus', 'gpu-world', 'epi', 'existing played-torus native body', 'alternate-native'),
            body('Body/S/S0/portal-core/src/hopf.rs', 'gpu-world', 'epi', 'Hopf/topology computational provider', 'provider'),
            body('Body/S/S0/portal-core/src/harmonic_profile.rs', 'declarative', 'epi', 'shared harmonic-profile authority', 'provider')
        ],
        privacyClass: 'public_current_audio_metadata_only',
        requiredCapability: 'epi.capability.deep.m1.play',
        currentStatus: 'PARTIAL',
        readinessNotes: [
            'clock/walk and played-torus bodies exist',
            'M1/M2 audio-genesis authority split must remain explicit and material audio readiness may degrade',
            'parent identity binding awaits the returned epi.cosmic.123 event contract'
        ],
        sourceRefs: [...SHARED_SOURCE_REFS, "Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md", "Idea/Bimba/Seeds/M/M1'/M1-ARCHITECTURE.md"],
        implementationRefs: [
            'Body/M/epi-theia/extensions/m1-paramasiva/src/common/clock-instrument.ts',
            'Body/M/epi-theia/extensions/m1-paramasiva-played-torus',
            'Body/S/S0/portal-core/src/hopf.rs',
            'Body/S/S0/portal-core/src/kernel.rs'
        ]
    },
    'epi.deep.m2': {
        productId: 'epi.deep.m2',
        parentProductId: 'epi.cosmic.123',
        coordinate: "M2'",
        agent: 'Paraśakti',
        title: 'Paraśakti — 72-space harmonic, sacred-sonic and cymatic instrument',
        boundaryGround: {
            coordinate: "M2-0'",
            meaning: '72-invariant vibrational profile source',
            parentExpression: 'Cosmic may show the active 72-address and correspondential provenance as the ground of its current harmonic condition'
        },
        boundaryReturn: {
            coordinate: "M2-5'",
            meaning: 'solar-chakral runtime and 72→64 DET projection gate',
            parentExpression: 'return the live solar/chakral and symbolic-projection evidence to the same Cosmic event without classifying M3 codons locally'
        },
        parentSummonable: [
            boundary("M2-1'", 'current Vimarśā/lens resonance and audio-bus readiness', 'Cosmic needs the present resonance, not the complete 72-space lab.'),
            boundary("M2-2'", 'current elemental-medium reading', 'The active element can be inspected as a bounded current condition.'),
            boundary("M2-3'", 'current decanic face/body-zone reading', 'Current cosmic context may expose the active face with provenance.'),
            boundary("M2-4'", 'current sacred-sonic / mode / name correspondence', 'A selected current relation can be sounded or explained without opening the entire correspondence arena.')
        ],
        deepOnly: [
            boundary("M2-1'..M2-4'", 'full 72-cell six-axis correspondence field', 'The whole correspondential field is the deep M2 composition.'),
            boundary("M2-1'", 'material cymatic/standing-wave solver and full visual field', 'Cymatics is a deep renderer over the shared 8+4 bus, not a parent dashboard effect.'),
            boundary("M2-4'", 'tuning-aware sacred-sonic / maqam / mantra performance lab', 'Full microtonal and sacred-sonic performance requires a specialised audio/MPE/MIDI/OSC body.')
        ],
        actions: [DEEP_OPEN_ACTION, DEEP_FOCUS_ACTION, DEEP_RETURN_ACTION],
        bodyKinds: ['audio-cymatic', 'gpu-world', 'declarative'],
        nativeBodies: [
            body('Body/M/epi-theia/extensions/m2-parashakti', 'audio-cymatic', 'epi', 'existing meaning-packet/cymatic/correspondence presentation body', 'adapt'),
            body('Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs', 'audio-cymatic', 'epi', 'Vimarśā audio-genesis provider writing the shared 8+4 bus', 'provider'),
            body('Body/S/S0/epi-lib/src/m2.c', 'declarative', 'epi', '72-space canonical LUT/invariant provider', 'provider')
        ],
        privacyClass: 'public_current_with_pending_private_projection_blocks',
        requiredCapability: 'epi.capability.deep.m2.resonate',
        currentStatus: 'PARTIAL',
        readinessNotes: [
            'meaning-packet/cymatic body and 72-space substrate exist',
            'material audio/cymatic, correspondence provenance and world-clock provider readiness remain explicit blockers',
            'parent identity binding awaits the returned epi.cosmic.123 event contract'
        ],
        sourceRefs: [...SHARED_SOURCE_REFS, "Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md", "Idea/Bimba/Seeds/M/M2'/M2-ARCHITECTURE.md"],
        implementationRefs: [
            'Body/M/epi-theia/extensions/m2-parashakti/src/common/meaning-packet.ts',
            'Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs',
            'Body/S/S0/epi-lib/include/m2.h',
            'Body/S/S0/epi-lib/src/m2.c'
        ]
    },
    'epi.deep.m3': {
        productId: 'epi.deep.m3',
        parentProductId: 'epi.cosmic.123',
        coordinate: "M3'",
        agent: 'Mahāmāyā',
        title: 'Mahāmāyā — 360/720 symbolic-genetic clock and transcription instrument',
        boundaryGround: {
            coordinate: "M3-0'",
            meaning: '72→64 reception/transduction and matter address',
            parentExpression: 'Cosmic may show the active transduction provenance/gap as the ground of the current inscription'
        },
        boundaryReturn: {
            coordinate: "M3-5'",
            meaning: 'K² × T²_Mahāmāyā world-clock and totalised inscription',
            parentExpression: 'return a bounded world-clock/measurement reading to the same Cosmic event while the full double-torus remains deep'
        },
        parentSummonable: [
            boundary("M3-1'", 'current codon rotational state', 'Cosmic may inspect the rotation currently attached to its event.'),
            boundary("M3-2'", 'current lens-mode → codon-rotation projection', 'The current event may reveal the projection that produced its symbolic address.'),
            boundary("M3-3'", 'current harmonic clock inscription', 'The parent current world directly depends on the active 360/720 clock state.'),
            boundary("M3-4'", 'selected Tarot/I-Ching/transcription reference', 'A bounded symbolic reference is parent-summonable; private Nara interpretation is not.')
        ],
        deepOnly: [
            boundary("M3-1'", 'full 472-state rotational landscape', 'The complete state field changes product scale.'),
            boundary("M3-3'", 'full 360°/720° clock-field with 384 line-change and hop/traversal graph', 'The current parent inscription is one state; deep M3 is the navigable field.'),
            boundary("M3-5'", 'double-torus / Hopf identity / coupling-flow and measurement-face depth views', 'These are deep explanatory/instrumental bodies, not required for the parent clock.')
        ],
        actions: [DEEP_OPEN_ACTION, DEEP_FOCUS_ACTION, DEEP_RETURN_ACTION],
        bodyKinds: ['clock-symbolic', 'gpu-world', 'declarative'],
        nativeBodies: [
            body('Body/M/epi-theia/extensions/m3-mahamaya', 'clock-symbolic', 'epi', 'existing codon-wheel/current symbolic surface', 'adapt'),
            body('Body/S/S0/portal-core/src/codon_rotation_projection.rs', 'clock-symbolic', 'epi', '84→472 projection provider', 'provider'),
            body('Body/S/S0/epi-lib/src/m3_clock_lut.c', 'clock-symbolic', 'epi', '360° clock and line-change canonical data provider', 'provider'),
            body('Body/S/S0/portal-core/src/mahamaya.rs', 'declarative', 'epi', 'Mahāmāyā state provider', 'provider')
        ],
        privacyClass: 'public_current_with_scalar_oracle_refs_only',
        requiredCapability: 'epi.capability.deep.m3.transcribe',
        currentStatus: 'PARTIAL',
        readinessNotes: [
            '64/472 and clock substrate are substantially implemented and a codon-wheel body exists',
            'authoritative projection/library payload, native subscription and selected deep renderers remain incomplete',
            'parent identity binding awaits the returned epi.cosmic.123 event contract'
        ],
        sourceRefs: [...SHARED_SOURCE_REFS, "Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md", "Idea/Bimba/Seeds/M/M3'/M3-ARCHITECTURE.md"],
        implementationRefs: [
            'Body/M/epi-theia/extensions/m3-mahamaya/src/common/codon-wheel.ts',
            'Body/S/S0/portal-core/src/codon_rotation_projection.rs',
            'Body/S/S0/portal-core/src/mahamaya.rs',
            'Body/S/S0/epi-lib/src/m3_clock_lut.c'
        ]
    },
    'epi.deep.m4': {
        productId: 'epi.deep.m4',
        parentProductId: 'epi.personal.450',
        coordinate: "M4'",
        agent: 'Nara',
        title: 'Nara — protected identity, body, transit, activity and psychoid trajectory instrument',
        boundaryGround: {
            coordinate: "M4-0'",
            meaning: 'stable protected identity and source evidence',
            parentExpression: 'Personal may use stable identity/source handles and safe elemental balance without disclosing raw identity internals'
        },
        boundaryReturn: {
            coordinate: "M4-5'",
            meaning: 'personal integration and Epii/Sophia review relay',
            parentExpression: 'return reviewed trajectory/insight/proposal handles to the same Personal subject; no automatic identity promotion'
        },
        parentSummonable: [
            boundary("M4-1'", 'safe somatic/medicinal/resonance readout', 'The lived Personal world may ask for a bounded body/resonance reading.'),
            boundary("M4-2'", 'oracle service and scalar symbolic refs', 'Oracle is an ordinary Personal capability while its protected interpretation remains local.'),
            boundary("M4-3'", 'activity/flow/trajectory and transformation summary', 'Writing/flow/kanban/activity can use bounded Q_activity and trajectory evidence.'),
            boundary("M4-4'", 'protected journal/Graphiti/lens context handles', 'The Personal parent is M4-heavy and directly owns the lived journal surface, but not raw deep identity disclosure.')
        ],
        deepOnly: [
            boundary("M4-0'..M4-4'", 'raw Q_identity × Q_transit × Q_activity → Q_composed interior', 'The composed personal quaternion is load-bearing computation, not ordinary parent presentation.'),
            boundary('M4-4-4-4', 'personal Pratibimba / sushumna-chakra / elemental / Hopf-linked psychoid-cymatic field', 'This is the protected deep organism explicitly separated from everyday Personal.'),
            boundary("M4-4'", 'full protected Graphiti episode/body traversal and identity internals', 'Deep M4 may access these only under local protected authority; parent selection is not disclosure.')
        ],
        actions: [DEEP_OPEN_ACTION, DEEP_FOCUS_ACTION, DEEP_RETURN_ACTION],
        bodyKinds: ['protected-local', 'gpu-world', 'declarative'],
        nativeBodies: [
            body('Body/M/epi-theia/extensions/m4-nara', 'protected-local', 'epi', 'existing protected day/artifact/personal-field deep body', 'adapt'),
            body('Body/S/S0/portal-core/src/personal_identity.rs', 'protected-local', 'epi', 'protected identity/Q-composition provider', 'provider'),
            body('Body/S/S0/portal-core/src/nara_journal.rs', 'protected-local', 'epi', 'Nara day/artifact provider', 'provider'),
            body('Body/S/S3/graphiti-runtime/src/lib.rs', 'protected-local', 'epi', 'protected episodic-memory provider', 'provider')
        ],
        privacyClass: 'protected_local_handle_only',
        requiredCapability: 'epi.capability.deep.m4.protected',
        currentStatus: 'PARTIAL',
        readinessNotes: [
            'protected Nara/day/personal-field body and core identity/journal providers exist',
            'consent/review and full deep psychoid trajectory/cymatic composition remain incomplete',
            'selection is never disclosure; deep open must remain protected-local',
            'parent identity binding awaits the returned epi.personal.450 subject contract'
        ],
        sourceRefs: [...SHARED_SOURCE_REFS, "Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md", "Idea/Bimba/Seeds/M/M4'/M4-ARCHITECTURE.md"],
        implementationRefs: [
            'Body/M/epi-theia/extensions/m4-nara/src/common/nara-surface.ts',
            'Body/S/S0/portal-core/src/personal_identity.rs',
            'Body/S/S0/portal-core/src/nara_journal.rs',
            'Body/S/S3/graphiti-runtime/src/lib.rs'
        ]
    },
    'epi.deep.m5': {
        productId: 'epi.deep.m5',
        parentProductId: 'epi.personal.450',
        coordinate: "M5'",
        agent: 'Epii',
        title: 'Epii — gnostic, canon, developer, pedagogical and Logos self-articulation instrument',
        boundaryGround: {
            coordinate: "M5-0'",
            meaning: 'gnostic/canon/library/Bimba pedagogy ground',
            parentExpression: 'Personal may retrieve source/gnostic/canon context for the current subject without entering the complete self-development IDE'
        },
        boundaryReturn: {
            coordinate: "M5-5'",
            meaning: 'Logos Atelier, recognition and Möbius return',
            parentExpression: 'return reviewed pedagogical/Logos/canon proposals to the same Personal subject and owner review path; never self-promote canon'
        },
        parentSummonable: [
            boundary("M5-1'", 'canon/philosophy/source reading and bounded authored edit route', 'Personal source reveal and review may summon the relevant canon around its current subject.'),
            boundary("M5-2'", 'bounded backend/source explain and evidence reading', 'The parent may ask how operative software bears on the subject without becoming a developer workspace.'),
            boundary("M5-3'", 'bounded frontend/Surface explain and provenance reading', 'The parent may inspect how the current relation is presented without acquiring shell ownership.'),
            boundary("M5-4'", 'canonical Epii dialogue, review and pedagogical action', 'Canonical Epii conversation/review is an ordinary Personal capability through native Agent/Agency machinery.')
        ],
        deepOnly: [
            boundary("M5-2'", 'full backend/kernel/S-family developer studio and mutation workflow', 'Deep M5 owns system self-development; Personal only summons bounded explanation/review.'),
            boundary("M5-3'", 'full frontend/product studio', 'The historical Theia surface is migration/body evidence; current generic application hosting remains O:I-owned.'),
            boundary("M5-4'", 'full agentic control room, autoresearch and self-improvement workbench', 'Consumes Actuation/AIKit/Factory primitives and governed review; it must not duplicate them or self-promote.'),
            boundary("M5-5'", 'full Logos Atelier / etymological archaeology', 'Parent may receive the return; sustained Logos archaeology is the deep instrument.')
        ],
        actions: [DEEP_OPEN_ACTION, DEEP_FOCUS_ACTION, DEEP_RETURN_ACTION],
        bodyKinds: ['agentic-editor', 'graph', 'declarative'],
        nativeBodies: [
            body('Body/M/epi-theia/extensions/m5-epii', 'agentic-editor', 'epi', 'existing review/self-articulation presentation body; migrate/compose, do not make it the generic shell', 'adapt'),
            body('Body/S/S5/epi-gnostic', 'graph', 'epi', 'gnostic/RAG library provider', 'provider'),
            body('Body/S/S5/epii-review-core', 'agentic-editor', 'epi', 'governed review provider', 'provider'),
            body('Body/S/S5/epii-agent-core', 'agentic-editor', 'epi', 'Epii-specific agent application semantics; generic Agency remains Actuation/AIKit-owned', 'provider')
        ],
        privacyClass: 'governed_review_metadata_only',
        requiredCapability: 'epi.capability.deep.m5.review',
        currentStatus: 'PARTIAL',
        readinessNotes: [
            'review/self-articulation body and substantial S5 providers exist',
            'full sixfold developer/pedagogical composition and persisted improvement/review state remain incomplete',
            'canonical AgentSession/model/harness/session machinery must be consumed from Actuation/AIKit rather than duplicated',
            'parent identity binding awaits the returned epi.personal.450 subject contract'
        ],
        sourceRefs: [...SHARED_SOURCE_REFS, "Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md", "Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE.md"],
        implementationRefs: [
            'Body/M/epi-theia/extensions/m5-epii/src/common/epii-surface.ts',
            'Body/S/S5/epi-gnostic',
            'Body/S/S5/epii-review-core/src/lib.rs',
            'Body/S/S5/epii-agent-core/src/lib.rs'
        ]
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
        throw new Error(
            `${descriptor.productId} belongs to ${descriptor.parentProductId}, not ${anchor.parentProductId}`
        );
    }
    if (anchor.coordinate !== descriptor.coordinate) {
        throw new Error(
            `${descriptor.productId} requires coordinate ${descriptor.coordinate}, not ${anchor.coordinate}`
        );
    }
    if (anchor.provenanceRefs.length === 0) {
        throw new Error('deep open requires parent provenance; depth cannot mint provenance retroactively');
    }
    if (descriptor.productId === 'epi.deep.m4' && anchor.privacyClass !== 'protected_local_handle_only') {
        throw new Error('deep M4 requires protected-local handle authority; selection is not disclosure');
    }

    const availableBodyRefs = descriptor.nativeBodies.map(item => item.bodyRef);
    if (request.requestedBodyRef && !availableBodyRefs.includes(request.requestedBodyRef)) {
        throw new Error(
            `${request.requestedBodyRef} is not a declared native body for ${descriptor.productId}`
        );
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
