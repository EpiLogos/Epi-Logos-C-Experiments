/**
 * Coordinate: M' M4' (R-factor fretboard read — Track 25.T25.23)
 * Residency: Body/M/pratibimba-app/src/panes/naraRFactorFretboard.ts
 * Actualises: the fail-closed read of `profile.rfactorRouteTable` (the
 *   compiled Archetype-7 distribution + virtue lamps, landed on the wire by
 *   25.T25.23's portal-core projection) joined with the emit-only
 *   `anuttaraWitness` (10.AW / 18.11). The fretboard is a PURE CONSUMER:
 *   nothing here recomputes the route table, advances the path, or gates on
 *   the witness — this module only decides what the wire really said.
 * Public surface: RFACTOR_EMIT_QUERY_METHOD, FretMarker, FretboardRead,
 *   readRFactorFretboard, courseOf, litFrets, unreturnedComplements,
 *   virtueLampsLit.
 * Does NOT own: the route table (m0.c / portal-core rfactor.rs), the witness
 *   (10.AW emit-only), or the `?`-object contemplation flow (19.6 verifier).
 */

import type {
    AnuttaraWitnessProjection,
    RFactorPathStep,
    RFactorRouteTableProjection
} from '../bridge/types';

/** The live `?`-object seam. The 25.23 brief writes `emit_question`; the
 *  dispatched method family (gate/server/dispatch.rs) serves `emit_query` —
 *  the chip routes there, and the drift is recorded rather than papered. */
export const RFACTOR_EMIT_QUERY_METHOD = "s0'.verifier.emit_query";

/** The double-course a fret marker belongs to: R1/R4 (sustenance–grace) and
 *  R2/R3 (dissolution–veiling) pair since each pair sums to 5; R0 is the
 *  upper-triad drone; R5 the fretless open string. */
export type FretCourse = 'r0-drone' | 'r1r4-course' | 'r2r3-course' | 'r5-fretless';

export function courseOf(rFactor: number): FretCourse {
    if (rFactor === 0) return 'r0-drone';
    if (rFactor === 5) return 'r5-fretless';
    return rFactor === 1 || rFactor === 4 ? 'r1r4-course' : 'r2r3-course';
}

export interface FretMarker {
    readonly routeIndex: number;
    readonly baseRoute: string;
    readonly rFactor: number;
    readonly position: number;
    readonly course: FretCourse;
}

export type FretboardRead =
    | {
          readonly kind: 'read';
          readonly table: RFactorRouteTableProjection;
          readonly witness: AnuttaraWitnessProjection | null;
      }
    | { readonly kind: 'pending'; readonly reason: string };

function isRouteTable(value: unknown): value is RFactorRouteTableProjection {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }
    const table = value as RFactorRouteTableProjection;
    return (
        Array.isArray(table.routes) &&
        table.routes.length === 7 &&
        table.routes.every(
            route =>
                typeof route.baseRoute === 'string' &&
                Array.isArray(route.positions) &&
                route.positions.length === 6 &&
                route.positions.every((p: unknown) => Number.isInteger(p) && (p as number) >= 0 && (p as number) <= 7)
        ) &&
        table.positionless === 7 &&
        typeof table.bandTurnSymbol === 'string' &&
        Array.isArray(table.virtues) &&
        table.virtues.length === 9 &&
        table.virtues.every(v => typeof v.symbol === 'string' && v.symbol.length > 0)
    );
}

function witnessOf(profile: Record<string, unknown>): AnuttaraWitnessProjection | null {
    const witness = profile.anuttaraWitness ?? profile.anuttara_witness;
    if (!witness || typeof witness !== 'object' || Array.isArray(witness)) {
        return null;
    }
    const record = witness as AnuttaraWitnessProjection;
    return Array.isArray(record.rfactorPath) && record.bandBalance ? record : null;
}

/** Fail-closed read: a profile without the compiled table renders pending —
 *  the fretboard NEVER draws an instrument from renderer-local constants. */
export function readRFactorFretboard(profile: unknown): FretboardRead {
    if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
        return { kind: 'pending', reason: 'no profile tick yet' };
    }
    // The bussed payload nests the matheme profile under `harmonicProfile`
    // (the same dual home `m0VirtueWitness` reads); a bare profile is the
    // test/fixture shape.
    const outer = profile as Record<string, unknown>;
    const nested = outer.harmonicProfile;
    const record =
        nested && typeof nested === 'object' && !Array.isArray(nested)
            ? (nested as Record<string, unknown>)
            : outer;
    const table = record.rfactorRouteTable ?? record.rfactor_route_table;
    if (table === undefined || table === null) {
        return { kind: 'pending', reason: 'rfactorRouteTable absent from the profile wire' };
    }
    if (!isRouteTable(table)) {
        return { kind: 'pending', reason: 'rfactorRouteTable is mis-shaped — refusing to draw' };
    }
    return { kind: 'read', table, witness: witnessOf(record) };
}

/** Every distributed fret marker of the table (positionless entries skipped). */
export function fretMarkers(table: RFactorRouteTableProjection): readonly FretMarker[] {
    const markers: FretMarker[] = [];
    table.routes.forEach((route, routeIndex) => {
        route.positions.forEach((position, rFactor) => {
            if (position !== table.positionless && rFactor !== 5) {
                markers.push({
                    routeIndex,
                    baseRoute: route.baseRoute,
                    rFactor,
                    position,
                    course: courseOf(rFactor)
                });
            }
        });
    });
    return markers;
}

/** The frets the recorded path actually lit: `route:position` keys. The path
 *  is the kernel's stamp — steps whose route/position miss the table are
 *  DROPPED (never invented into a fret). */
export function litFrets(
    table: RFactorRouteTableProjection,
    path: readonly RFactorPathStep[]
): ReadonlyMap<string, RFactorPathStep> {
    const lit = new Map<string, RFactorPathStep>();
    for (const step of path) {
        const routeIndex = table.routes.findIndex(route => route.baseRoute === step.baseRoute);
        if (routeIndex < 0) {
            continue;
        }
        const expected = table.routes[routeIndex].positions[step.rFactor];
        if (expected === step.position && expected !== table.positionless) {
            lit.set(`${routeIndex}:${step.position}`, step);
        }
    }
    return lit;
}

/** 25.19's question made visible: with `returned === false`, each pravritti
 *  act taken glows its UNTOUCHED nivritti complement (`5 - r`). Display law
 *  from the brief over real path data — nothing is gated on it. */
export function unreturnedComplements(
    witness: AnuttaraWitnessProjection
): readonly number[] {
    if (witness.bandBalance.returned) {
        return [];
    }
    const taken = new Set(witness.rfactorPath.map(step => step.rFactor));
    const glow = new Set<number>();
    for (const step of witness.rfactorPath) {
        if (step.band === 'pravritti') {
            const complement = 5 - step.rFactor;
            if (complement >= 0 && complement <= 5 && !taken.has(complement)) {
                glow.add(complement);
            }
        }
    }
    return [...glow].sort((a, b) => a - b);
}

/** Lamp i lit ⇔ bit i of the emit-only witness vector (LSB-first, the same
 *  reading `m0VirtueWitness` uses) — the carrier never re-scores a virtue. */
export function virtueLampsLit(vector: number): readonly boolean[] {
    return Array.from({ length: 9 }, (_, index) => (vector & (1 << index)) !== 0);
}
