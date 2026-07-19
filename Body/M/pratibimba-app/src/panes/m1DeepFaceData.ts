/**
 * Coordinate: M' M1' (deep-face reader seam — Track 22.T22.3/22.4/22.8/22.9)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the ONE subscription seam the four M1' inspector faces (Cl(4,2)
 *   signature 22.3, Klein-flip event-strip 22.4, vortex matrices browser 22.8,
 *   audio-bus inspector 22.9) read the already-bridged profile through. Every
 *   member is a verbatim window onto a kernel/Vimarśa write via the EXISTING
 *   parsers (`vortexFromPayload` T2.6, `harmonicSnapshot` E3) — never a second
 *   parser ontology, never a locally-computed fallback; absence is null (the
 *   face renders its honest pending state, never a fabricated body).
 * Does NOT own: the vortex parser (m1PlayedTorus.ts), the snapshot parser
 *   (engine/modulation/modulators.ts), the store law (state/stores.ts), the
 *   Cl(4,2) palette (ui/primitives.tsx CL42_PALETTE).
 */

import { useMemo } from 'react';
import { AnandaVortexProjectionBoundary } from '../bridge/types';
import { NodalMN } from '../engine/cosmicMath';
import { harmonicSnapshot } from '../engine/modulation/modulators';
import { useTickStore } from '../state/stores';
import { vortexFromPayload } from './m1PlayedTorus';
import { CL42_PALETTE } from '../ui/primitives';

/** The window the four deep faces render from — every field a verbatim bus
 *  read; null = pending. */
export interface M1FaceState {
    readonly generation: number | null;
    readonly tick12: number | null;
    readonly position6: number | null;
    /** The strict T2.6 vortex projection, or null (pending-ananda-vortex). */
    readonly vortex: AnandaVortexProjectionBoundary | null;
    /** The shared kernel Klein-flip event union, or null when this tick has no event. */
    readonly kleinFlip: M1KleinFlipEvent | null;
    /** Vimarśa M2-1' window: the eight cymatic Hz partials, or null (pending). */
    readonly audioOctet: readonly number[] | null;
    /** Profile-supplied per-position ratio roles, if the writer emitted them. */
    readonly audioRatioRoles: readonly (string | null)[] | null;
    /** Profile-supplied shared ratio role for legacy/current scalar profiles. */
    readonly audioRatioRole: string | null;
    /** Vimarśa M2-1' window: the four nodal m/n constraints, or null (pending). */
    readonly nodalQuartet: readonly M1NodalBoundary[] | null;
}

/** The optional writer metadata carried alongside the canonical M2-1' m/n pair. */
export interface M1NodalBoundary extends NodalMN {
    readonly helix: string | null;
    readonly qlPosition: number | null;
    readonly constraintKind: string | null;
}

export type M1KleinFlipEvent =
    | Readonly<{ kind: 'm1TritoneCrossing'; tick12: number; lensPair: readonly [number, number] }>
    | Readonly<{ kind: 'm2CymaticValenceInvert'; valenceBefore: string; valenceAfter: string }>
    | Readonly<{ kind: 'm3CodonRotationCross'; codonBefore: number; codonAfter: number }>;

function objectValue(value: unknown): Record<string, unknown> | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function num(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function text(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

function textArray(value: unknown): readonly (string | null)[] | null {
    return Array.isArray(value) ? Object.freeze(value.map(text)) : null;
}

/** The bus may nest the profile under `harmonicProfile` (wire shape) or hand it
 *  directly — the same unwrap the sibling readers apply. */
function profileRoot(payload: Record<string, unknown>): Record<string, unknown> {
    return objectValue(payload.harmonicProfile) ?? payload;
}

function pair(value: unknown): readonly [number, number] | null {
    if (!Array.isArray(value) || value.length !== 2) return null;
    const first = num(value[0]);
    const second = num(value[1]);
    return first !== null && second !== null ? [first, second] : null;
}

/** Strict read of portal-core's tagged KleinFlipEvent union from the profile bus. */
function kleinFlipFromProfile(root: Record<string, unknown> | null): M1KleinFlipEvent | null {
    const value = objectValue(root?.kleinFlip ?? root?.klein_flip ?? null);
    if (!value) return null;

    if (value.kind === 'm1TritoneCrossing') {
        const tick12 = num(value.tick12);
        const lensPair = pair(value.lensPair ?? value.lens_pair);
        return tick12 !== null && lensPair !== null
            ? Object.freeze({ kind: 'm1TritoneCrossing', tick12, lensPair })
            : null;
    }
    if (value.kind === 'm2CymaticValenceInvert') {
        const valenceBefore = text(value.valenceBefore ?? value.valence_before);
        const valenceAfter = text(value.valenceAfter ?? value.valence_after);
        return valenceBefore && valenceAfter
            ? Object.freeze({ kind: 'm2CymaticValenceInvert', valenceBefore, valenceAfter })
            : null;
    }
    if (value.kind === 'm3CodonRotationCross') {
        const codonBefore = num(value.codonBefore ?? value.codon_before);
        const codonAfter = num(value.codonAfter ?? value.codon_after);
        return codonBefore !== null && codonAfter !== null
            ? Object.freeze({ kind: 'm3CodonRotationCross', codonBefore, codonAfter })
            : null;
    }
    return null;
}

/** Keeps M2-1' node provenance beside the already-validated m/n snapshot. */
function nodalBoundaries(snapshot: readonly NodalMN[] | null): readonly M1NodalBoundary[] | null {
    if (!snapshot) return null;
    return Object.freeze(
        snapshot.map(node => {
            const source = objectValue(node);
            return Object.freeze({
                m: node.m,
                n: node.n,
                helix: text(source?.helix),
                qlPosition: num(source?.qlPosition ?? source?.ql_position),
                constraintKind: text(source?.constraintKind ?? source?.constraint_kind)
            });
        })
    );
}

/** Pure reader — testable off a raw cached-profile payload without React. */
export function readM1FaceState(cached: { generation: number; profile: unknown } | null): M1FaceState {
    const payload = objectValue(cached?.profile ?? null);
    const root = payload ? profileRoot(payload) : null;
    const vortex = payload ? vortexFromPayload(payload) : null;
    const snapshot = payload ? harmonicSnapshot(payload) : null;
    return Object.freeze({
        generation: cached?.generation ?? null,
        tick12: num(root?.tick12),
        position6: num(root?.position6),
        vortex,
        kleinFlip: kleinFlipFromProfile(root),
        audioOctet: snapshot?.audioOctet ?? null,
        audioRatioRoles: textArray(root?.ratioRoles ?? root?.ratio_roles),
        audioRatioRole: text(root?.ratioRole ?? root?.ratio_role),
        nodalQuartet: nodalBoundaries(snapshot?.nodalQuartet ?? null)
    });
}

/** The subscription hook every deep face consumes — a pure view over the
 *  tick-store singleton (which outlives every mounted face). */
export function useM1FaceState(): M1FaceState {
    const cached = useTickStore(s => s.profile);
    return useMemo(
        () => readM1FaceState(cached ? { generation: cached.generation, profile: cached.profile } : null),
        [cached]
    );
}

/** The canonical Cl(4,2) colour-binary token as a CSS colour string — implicate
 *  (−1) indigo, explicate (+1) warm — sourced from the single CL42_PALETTE token
 *  (ui/primitives.tsx), never a local hex literal (Track-30 law). */
export function cl42SignatureColour(signature: number): string {
    const value = signature < 0 ? CL42_PALETTE.implicateIndigo : CL42_PALETTE.explicateWarm;
    return `#${value.toString(16).padStart(6, '0')}`;
}
