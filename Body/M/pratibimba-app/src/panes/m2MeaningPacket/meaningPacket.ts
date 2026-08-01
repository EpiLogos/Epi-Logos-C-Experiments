/**
 * Coordinate: M2' meaning-packet reading (rerun 51.T51.4)
 * Residency: Body/M/pratibimba-app/src/panes/m2MeaningPacket/meaningPacket.ts
 * Position (#n): #2 — Entity: the packet AS AN OBJECT, made inspectable.
 * Actualises: [[M2'-SPEC]] §2's "Meaning-packet inspector exposing the active
 *   [[M2PrimeMeaningPacket]]: 72-address views, [[MEF]] semantic frame,
 *   elemental-medium frame, sacred-sonic frame, maqam/mode frame, cymatic
 *   signature, [[M3]] projection evidence, provenance, and pending fields."
 *   `M2CorrespondencePane` renders correspondence; the PACKET — the typed
 *   object the rest of the stack passes around — was inspectable nowhere. This
 *   is the M2' instance of 51.T51.1's problem: a load-bearing structure that
 *   everything consumes and nothing can see.
 *
 *   THE FIELD LIST IS CANON'S, AND ABSENCE IS AN ERROR. [[M2'-SPEC]] :118
 *   fixes the accepted field set and says it outright — "missing fields are
 *   errors, not locally filled defaults". So this module NEVER fills: it
 *   probes each declared field on the live payload and reports it `present`
 *   with its value or `pending` with its path. That is why §2 asks the
 *   inspector for "pending fields" as a first-class panel — the gap is part
 *   of the reading, not a rendering failure to hide.
 *
 *   THE ELEMENTAL FRAME ROUTES THROUGH THE L2' LAW, NEVER AN AD-HOC MAP.
 *   Elements come through `engine/elementRegisters.ts` — the DR-L2-ELEM-2
 *   module whose BRANDED types make an ad-hoc map a compile error, carrying
 *   `m_canonical.h`'s alchemical ordering (0=Aether, 1=Earth, 2=Water, 3=Air,
 *   4=Fire, 5=Salt) as the wire register. A raw wire number is admitted only
 *   through `asAlchemical`, and a value outside the register reads as
 *   unnameable rather than as element 0.
 *
 *   THE 72-ADDRESS VIEWS ARE THE SIX AXES, NOT SIX COPIES OF ONE. Each axis
 *   decodes through `engine/axisViews.ts::decodeAxisAt` (the verbatim port of
 *   portal-core's `*AxisView::from_index72`), and each names the fields that
 *   are LUT-owned and must come from the kernel rather than be derived here.
 * Public surface: M2_MEANING_PACKET_FIELDS, MeaningPacketFieldId,
 *   MeaningPacketField, MeaningPacketFieldReading, M2MeaningPacketReading,
 *   Address72View, ElementalMediumFrame, readMeaningPacket, address72Views,
 *   elementalMediumFrame, meaningPacketProvenance.
 * Does NOT own: the element registers (`engine/elementRegisters.ts`), the axis
 *   decoders (`engine/axisViews.ts`), the M1 harmonic window
 *   (`panes/m1DeepFaceData.ts` — reused verbatim for the 8+4 bus), the profile
 *   stream, or the rendering.
 * Contract: [[M2'-SPEC]] §2 / :118 · [[DR-L2-ELEM-2]] · rerun tranche
 *   [[51.T51.4]].
 */

import {
    AXIS_ORDER,
    AXIS_SOURCE_FIELDS,
    decodeAxisAt,
    type Axis72,
    type AxisDecode
} from '../../engine/axisViews';
import {
    ALCHEMICAL_ELEMENT_NAMES,
    alchemicalElementName,
    asAlchemical,
    isOperativeElement,
    type Alchemical
} from '../../engine/elementRegisters';
import { readM1FaceState } from '../m1DeepFaceData';
import type { KernelBridgeCachedProfile } from '../../bridge/types';

/** The accepted field set, verbatim from [[M2'-SPEC]] :118. */
export type MeaningPacketFieldId =
    | 'profileId'
    | 'resonance72'
    | 'elements'
    | 'planetaryChakral'
    | 'diatonic'
    | 'harmonic.audio_octet'
    | 'harmonic.nodal_quartet'
    | 'lensMode'
    | 'kleinFlipState'
    | 'sacredSonic'
    | 'maqamMode'
    | 'm3Projection';

export interface MeaningPacketField {
    readonly id: MeaningPacketFieldId;
    /** Where the field is read from on the live profile root. */
    readonly path: string;
    /** Which §2 frame of the inspector this field feeds. */
    readonly frame:
        | 'identity'
        | 'address72'
        | 'elemental-medium'
        | 'sacred-sonic'
        | 'maqam-mode'
        | 'cymatic-signature'
        | 'm3-projection';
}

/**
 * The twelve declared fields. Order is the spec's own. `harmonic.*` reads
 * through the existing M1 harmonic window rather than a second parser — the
 * 8+4 bus has one reader in this carrier and this is not going to be a
 * thirteenth.
 */
export const M2_MEANING_PACKET_FIELDS: readonly MeaningPacketField[] = Object.freeze([
    Object.freeze({ id: 'profileId' as const, path: 'profileId', frame: 'identity' as const }),
    Object.freeze({ id: 'resonance72' as const, path: 'resonance72', frame: 'address72' as const }),
    Object.freeze({ id: 'elements' as const, path: 'elements', frame: 'elemental-medium' as const }),
    Object.freeze({
        id: 'planetaryChakral' as const,
        path: 'planetaryChakral',
        frame: 'elemental-medium' as const
    }),
    Object.freeze({ id: 'diatonic' as const, path: 'diatonic', frame: 'maqam-mode' as const }),
    Object.freeze({
        id: 'harmonic.audio_octet' as const,
        path: 'performance.harmonic.audioOctet',
        frame: 'cymatic-signature' as const
    }),
    Object.freeze({
        id: 'harmonic.nodal_quartet' as const,
        path: 'performance.harmonic.nodalQuartet',
        frame: 'cymatic-signature' as const
    }),
    Object.freeze({ id: 'lensMode' as const, path: 'lensMode', frame: 'maqam-mode' as const }),
    Object.freeze({
        id: 'kleinFlipState' as const,
        path: 'kleinFlipState',
        frame: 'identity' as const
    }),
    Object.freeze({
        id: 'sacredSonic' as const,
        path: 'sacredSonic',
        frame: 'sacred-sonic' as const
    }),
    Object.freeze({ id: 'maqamMode' as const, path: 'maqamMode', frame: 'maqam-mode' as const }),
    Object.freeze({
        id: 'm3Projection' as const,
        path: 'm3Projection',
        frame: 'm3-projection' as const
    })
]);

export interface MeaningPacketFieldReading {
    readonly id: MeaningPacketFieldId;
    readonly path: string;
    readonly frame: MeaningPacketField['frame'];
    readonly present: boolean;
    /** The live value, or null when pending. NEVER a default. */
    readonly value: unknown;
}

/** One axis's reading of the SAME 72 address. */
export interface Address72View {
    readonly axis: Axis72;
    /** The wire field this axis must be sourced from (anti-stub law). */
    readonly sourceField: string;
    readonly decode: AxisDecode | null;
}

export interface ElementalMediumFrame {
    /** The L2' alchemical register, in `m_canonical.h` order. */
    readonly register: readonly string[];
    /** Wire values admitted through `asAlchemical`, in payload order. */
    readonly elements: readonly Readonly<{
        readonly raw: unknown;
        readonly element: Alchemical | null;
        readonly name: string | null;
        readonly operative: boolean | null;
    }>[];
    /** True when the payload carried an `elements` field at all. */
    readonly present: boolean;
}

export interface M2MeaningPacketReading {
    readonly generation: number | null;
    /** The active 72 address (`resonance72.lensAnchorIndex`), or null. */
    readonly address72: number | null;
    readonly fields: readonly MeaningPacketFieldReading[];
    readonly pending: readonly MeaningPacketFieldId[];
    readonly address72Views: readonly Address72View[];
    /** The MEF semantic frame — the `mef` axis decode of the active address. */
    readonly mefSemanticFrame: AxisDecode | null;
    readonly elementalMedium: ElementalMediumFrame;
    /** The 8+4 cymatic signature, through the ONE existing harmonic window. */
    readonly cymaticSignature: Readonly<{
        readonly audioOctet: readonly number[] | null;
        readonly nodalQuartet: readonly unknown[] | null;
    }>;
    readonly provenance: readonly string[];
}

function objectValue(value: unknown): Record<string, unknown> | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

/** The `harmonicProfile ?? payload` unwrap the sibling windows apply. */
function profileRoot(payload: Record<string, unknown> | null): Record<string, unknown> | null {
    if (!payload) {
        return null;
    }
    return objectValue(payload.harmonicProfile) ?? payload;
}

/** Follow a dotted path. Returns `undefined` for absent — distinct from a
 *  real `null` on the wire, which is a present field carrying null. */
function at(root: Record<string, unknown> | null, path: string): unknown {
    if (!root) {
        return undefined;
    }
    let node: unknown = root;
    for (const key of path.split('.')) {
        const record = objectValue(node);
        if (!record || !(key in record)) {
            return undefined;
        }
        node = record[key];
    }
    return node;
}

/** The six axis readings of the active address — one per axis, never six
 *  copies of the MEF decode. A null address yields six null decodes rather
 *  than a fabricated address 0. */
export function address72Views(address72: number | null): readonly Address72View[] {
    return Object.freeze(
        AXIS_ORDER.map(axis =>
            Object.freeze({
                axis,
                sourceField: AXIS_SOURCE_FIELDS[axis],
                decode: address72 === null ? null : decodeAxisAt(address72, axis)
            })
        )
    );
}

/**
 * The elemental-medium frame, routed through the L2' register. A wire value is
 * admitted only via `asAlchemical`; anything outside 0..5 is reported
 * unnameable rather than coerced. Aether and Salt are correctly NOT operative.
 */
export function elementalMediumFrame(raw: unknown): ElementalMediumFrame {
    const list = Array.isArray(raw) ? raw : raw === undefined ? [] : [raw];
    return Object.freeze({
        register: ALCHEMICAL_ELEMENT_NAMES,
        present: raw !== undefined,
        elements: Object.freeze(
            list.map(entry => {
                // A wire entry may be a bare id or an object carrying one.
                const candidate =
                    typeof entry === 'number' ? entry : objectValue(entry)?.elementId ?? entry;
                const element = asAlchemical(candidate);
                return Object.freeze({
                    raw: entry,
                    element,
                    name: alchemicalElementName(element),
                    operative: element === null ? null : isOperativeElement(element)
                });
            })
        )
    });
}

/** The provenance list [[M2'-SPEC]] :118 requires the panel to name. */
export function meaningPacketProvenance(
    cached: KernelBridgeCachedProfile | null
): readonly string[] {
    return Object.freeze([
        cached
            ? `live profile/runtime payload — generation ${cached.generation}`
            : 'live profile/runtime payload — no frame received yet',
        'S2 graph-law authority (planetary/chakral/musical correspondences)',
        'Kerykeion/Kairos context (temporal sky)'
    ]);
}

/**
 * Read the ACTIVE packet off the live profile. Nothing is reconstructed and
 * nothing is defaulted: every declared field is either present with its live
 * value, or listed as pending with the path it would have come from.
 */
export function readMeaningPacket(
    cached: KernelBridgeCachedProfile | null
): M2MeaningPacketReading {
    const payload = objectValue(cached?.profile ?? null);
    const root = profileRoot(payload);
    const face = readM1FaceState(
        cached ? { generation: cached.generation, profile: cached.profile } : null
    );

    const fields = M2_MEANING_PACKET_FIELDS.map(field => {
        const value = at(root, field.path);
        return Object.freeze({
            id: field.id,
            path: field.path,
            frame: field.frame,
            present: value !== undefined,
            value: value === undefined ? null : value
        });
    });

    const resonance = objectValue(at(root, 'resonance72'));
    const rawAddress = resonance?.lensAnchorIndex;
    const address72 =
        typeof rawAddress === 'number' && Number.isInteger(rawAddress) && rawAddress >= 0 && rawAddress < 72
            ? rawAddress
            : null;

    return Object.freeze({
        generation: cached?.generation ?? null,
        address72,
        fields: Object.freeze(fields),
        pending: Object.freeze(fields.filter(f => !f.present).map(f => f.id)),
        address72Views: address72Views(address72),
        mefSemanticFrame: address72 === null ? null : decodeAxisAt(address72, 'mef'),
        elementalMedium: elementalMediumFrame(at(root, 'elements')),
        cymaticSignature: Object.freeze({
            audioOctet: face.audioOctet,
            nodalQuartet: face.nodalQuartet
        }),
        provenance: meaningPacketProvenance(cached)
    });
}
