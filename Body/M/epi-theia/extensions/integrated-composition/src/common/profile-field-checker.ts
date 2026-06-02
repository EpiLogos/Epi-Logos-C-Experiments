import { MathemeHarmonicProfileBoundary } from '@pratibimba/m-extension-runtime';

/**
 * Field availability checker — 08.T3 deliverable 3.
 *
 * Each pane in the cosmic engine declares the profile fields it needs to
 * render. When a field is absent the pane renders an honest readiness
 * blocker instead of a fake placeholder. The check operates on the
 * MathemeHarmonicProfileBoundary payload pocket; field shape is owned by
 * Track 01 T5 (kernel-bridge contract package) so we treat all values as
 * `unknown` here.
 */
export type ProfileFieldName =
    | 'lens'
    | 'mode'
    | 'audio_octet'
    | 'nodal_quartet'
    | 'planetaryChakral'
    | 'resonance72'
    | 'kleinFlipState'
    | 'codon_rotation_projection'
    | 'mahamaya'
    | 'codec_lut'
    | 's2_provenance';

export interface FieldAvailability {
    readonly field: ProfileFieldName;
    readonly present: boolean;
    readonly blockerOwnerTrack: string;
}

export interface PaneAvailability {
    readonly paneId: 'm1-right-inspector' | 'm2-left-stage' | 'm3-center-stage';
    readonly extensionId: 'm1-paramasiva' | 'm2-parashakti' | 'm3-mahamaya';
    readonly profileGeneration: number | null;
    readonly fields: readonly FieldAvailability[];
    readonly allFieldsPresent: boolean;
    readonly missingFields: readonly ProfileFieldName[];
}

const FIELD_OWNER_TRACKS: Record<ProfileFieldName, string> = {
    lens: 'Track 01 profile',
    mode: 'Track 01 profile',
    audio_octet: 'Track 01 profile + Track 03 audio bus',
    nodal_quartet: 'Track 01 profile',
    planetaryChakral: 'Track 01 profile (M2 authority)',
    resonance72: 'Track 01 profile (M2 authority)',
    kleinFlipState: 'Track 01 profile (M2 authority)',
    codon_rotation_projection: 'Track 01 profile (M3 authority)',
    mahamaya: 'Track 01 profile (M3 authority)',
    codec_lut: 'Track 02 S2 graph (M3 library)',
    s2_provenance: 'Track 02 S2 graph'
};

const M3_CENTER_FIELDS: readonly ProfileFieldName[] = Object.freeze([
    'codon_rotation_projection',
    'mahamaya',
    'codec_lut'
]);
const M2_LEFT_FIELDS: readonly ProfileFieldName[] = Object.freeze([
    'resonance72',
    'planetaryChakral',
    'kleinFlipState'
]);
const M1_RIGHT_FIELDS: readonly ProfileFieldName[] = Object.freeze([
    'lens',
    'mode',
    'audio_octet',
    'nodal_quartet'
]);

function checkField(
    field: ProfileFieldName,
    payload: Readonly<Record<string, unknown>>
): FieldAvailability {
    const present =
        field in payload && payload[field] !== null && payload[field] !== undefined;
    return Object.freeze({
        field,
        present,
        blockerOwnerTrack: FIELD_OWNER_TRACKS[field]
    });
}

function checkPane(
    paneId: PaneAvailability['paneId'],
    extensionId: PaneAvailability['extensionId'],
    profile: MathemeHarmonicProfileBoundary | null,
    fields: readonly ProfileFieldName[]
): PaneAvailability {
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

export function checkCosmicEnginePanes(
    profile: MathemeHarmonicProfileBoundary | null
): {
    readonly m3CenterStage: PaneAvailability;
    readonly m2LeftStage: PaneAvailability;
    readonly m1RightInspector: PaneAvailability;
} {
    return Object.freeze({
        m3CenterStage: checkPane('m3-center-stage', 'm3-mahamaya', profile, M3_CENTER_FIELDS),
        m2LeftStage: checkPane('m2-left-stage', 'm2-parashakti', profile, M2_LEFT_FIELDS),
        m1RightInspector: checkPane(
            'm1-right-inspector',
            'm1-paramasiva',
            profile,
            M1_RIGHT_FIELDS
        )
    });
}

export const COSMIC_ENGINE_PANE_FIELD_GROUPS = Object.freeze({
    'm3-center-stage': M3_CENTER_FIELDS,
    'm2-left-stage': M2_LEFT_FIELDS,
    'm1-right-inspector': M1_RIGHT_FIELDS
});
