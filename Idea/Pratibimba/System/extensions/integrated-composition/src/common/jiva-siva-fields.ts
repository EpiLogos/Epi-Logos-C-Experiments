import { MathemeHarmonicProfileBoundary } from '@pratibimba/m-extension-runtime';

/**
 * Jiva-Siva pane availability — 08.T5 deliverable 2 + verification 1.
 *
 * The 4/5/0 plugin's default rendering MUST contain only handles, summaries,
 * readiness, and visual state — never raw bodies. Every field name in this
 * module names what is public-safe under that constraint. Raw bodies require
 * a ConsentGate.require() flow that lives outside this default checker.
 */
export type JivaSivaFieldName =
    | 'bedrock_link'
    | 'selected_coordinate'
    | 'activity_resonance_dots'
    | 'field_state_summary'
    | 'gds_clusters'
    | 'm0_coordinate_provenance'
    | 'review_queue_count'
    | 'continuity_handle'
    | 'last_canon_recognition_event';

export interface JivaSivaFieldAvailability {
    readonly field: JivaSivaFieldName;
    readonly present: boolean;
    readonly ownerTrack: string;
}

export interface JivaSivaPaneAvailability {
    readonly paneId: 'm4-field-foreground' | 'm0-graph-backdrop' | 'm5-review-side';
    readonly extensionId: 'm4-nara' | 'm0-anuttara' | 'm5-epii';
    readonly profileGeneration: number | null;
    readonly fields: readonly JivaSivaFieldAvailability[];
    readonly allFieldsPresent: boolean;
    readonly missingFields: readonly JivaSivaFieldName[];
}

const OWNER_TRACKS: Record<JivaSivaFieldName, string> = {
    // M4 public-safe surface — handles only.
    bedrock_link: 'Track 02 S2 graph (M4 bedrock anchor)',
    selected_coordinate: 'Track 01 profile (M4 selection)',
    activity_resonance_dots: 'Track 04 + Track 03 (safe presence handles)',
    field_state_summary: 'Track 04 (privacy-filtered summary)',
    // M0 backdrop.
    gds_clusters: 'Track 02 S2 GDS overlay (gated by IOD-07)',
    m0_coordinate_provenance: 'Track 02 S2 graph (M0 prior ground)',
    // M5 side.
    review_queue_count: 'Track 04 S5 review (count only — no DTO bodies)',
    continuity_handle: 'Track 04 S5 continuity service',
    last_canon_recognition_event: 'Track 04 + Track 09 (Jiva-is-Siva governance)'
};

const M4_FOREGROUND_FIELDS: readonly JivaSivaFieldName[] = Object.freeze([
    'bedrock_link',
    'selected_coordinate',
    'activity_resonance_dots',
    'field_state_summary'
]);
const M0_BACKDROP_FIELDS: readonly JivaSivaFieldName[] = Object.freeze([
    'gds_clusters',
    'm0_coordinate_provenance'
]);
const M5_SIDE_FIELDS: readonly JivaSivaFieldName[] = Object.freeze([
    'review_queue_count',
    'continuity_handle',
    'last_canon_recognition_event'
]);

function checkField(
    field: JivaSivaFieldName,
    payload: Readonly<Record<string, unknown>>
): JivaSivaFieldAvailability {
    const present =
        field in payload && payload[field] !== null && payload[field] !== undefined;
    return Object.freeze({
        field,
        present,
        ownerTrack: OWNER_TRACKS[field]
    });
}

function checkPane(
    paneId: JivaSivaPaneAvailability['paneId'],
    extensionId: JivaSivaPaneAvailability['extensionId'],
    profile: MathemeHarmonicProfileBoundary | null,
    fields: readonly JivaSivaFieldName[]
): JivaSivaPaneAvailability {
    const profileGeneration = profile ? profile.generation : null;
    const payload = profile ? profile.payload : {};
    const fieldsAvailability = fields.map(f => checkField(f, payload));
    const missingFields = fieldsAvailability
        .filter(f => !f.present)
        .map(f => f.field);
    return Object.freeze({
        paneId,
        extensionId,
        profileGeneration,
        fields: Object.freeze(fieldsAvailability),
        allFieldsPresent: missingFields.length === 0,
        missingFields: Object.freeze(missingFields)
    });
}

export function checkJivaSivaPanes(
    profile: MathemeHarmonicProfileBoundary | null
): {
    readonly m4Foreground: JivaSivaPaneAvailability;
    readonly m0Backdrop: JivaSivaPaneAvailability;
    readonly m5Side: JivaSivaPaneAvailability;
} {
    return Object.freeze({
        m4Foreground: checkPane('m4-field-foreground', 'm4-nara', profile, M4_FOREGROUND_FIELDS),
        m0Backdrop: checkPane('m0-graph-backdrop', 'm0-anuttara', profile, M0_BACKDROP_FIELDS),
        m5Side: checkPane('m5-review-side', 'm5-epii', profile, M5_SIDE_FIELDS)
    });
}

export const JIVA_SIVA_PANE_FIELD_GROUPS = Object.freeze({
    'm4-field-foreground': M4_FOREGROUND_FIELDS,
    'm0-graph-backdrop': M0_BACKDROP_FIELDS,
    'm5-review-side': M5_SIDE_FIELDS
});

/**
 * Deep-open actions that the public default view DOES NOT support. Each one
 * routes through the ConsentGate before any read attempt. Names match the
 * ConsentAction enum so the plugin can map button → consent action 1:1.
 */
export const JIVA_SIVA_DEEP_ACTIONS = Object.freeze([
    'open-graphiti-body',
    'open-identity-quaternion',
    'open-nara-dialogue',
    'open-m4-field-deep',
    'publish-shared-archetype'
] as const);
