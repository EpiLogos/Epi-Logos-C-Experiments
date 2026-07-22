/**
 * Coordinate: M' M3' (9-walk kernel-constant mirror — Track 24.T24.4)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): active-carrier fixed-kernel-constant table for the 9 walks.
 * Actualises: the provenance-stated TS mirror of the authoritative kernel
 *   enumeration `enum WalkType` in `Body/S/S0/portal-core/src/types.rs`
 *   (`step_count()` / `label()`). These are the 9 SEQUENTIAL traversal-path
 *   walks — distinct from the 16 SIMULTANEOUS lens apertures (24.3). The
 *   labels and step counts are FIXED KERNEL CONSTANTS, not carrier opinion:
 *   `m3WalkTypes.test.ts` reads types.rs and asserts this mirror matches the
 *   kernel `label()` arms + `STEPS` array VERBATIM, so it can never silently
 *   drift. No local production of walk names or step counts — only the mirror.
 * Public surface: M3WalkType, M3_WALK_TYPES, M3_WALK_TYPE_COUNT,
 *   parseCosmicClockWalkSteps.
 * Does NOT own: live walk position (Wave-B `cosmicClock.walks`), the advance
 *   command (services/m3/M3WalkNavigationService), or the kernel enum itself.
 * Contract: [[M3'-SPEC]] + rerun [[24-m3-mahamaya-frontend-deep]] 24.4;
 *   kernel authority `Body/S/S0/portal-core/src/types.rs#WalkType`.
 */

/** One walk lane, mirrored VERBATIM from the kernel `WalkType`. */
export interface M3WalkType {
    /** Kernel discriminant 0..8 (== `WalkType as u8`). */
    readonly id: number;
    /** Kernel `WalkType::label()` string, verbatim. */
    readonly label: string;
    /** Kernel `WalkType::step_count()`, verbatim. */
    readonly stepCount: number;
}

/**
 * The 9 walks, ordered by kernel discriminant 0..8.
 *
 * MIRROR of `Body/S/S0/portal-core/src/types.rs`:
 *   - labels  ← `WalkType::label()`  match arms
 *   - stepCount ← `const STEPS: [u16; 9] = [360, 24, 12, 12, 36, 64, 9, 4, 384]`
 *
 * `m3WalkTypes.test.ts` cross-checks every value against that file so this
 * table is a fixed kernel constant, never a fabricated local guess.
 */
export const M3_WALK_TYPES: readonly M3WalkType[] = Object.freeze([
    Object.freeze({ id: 0, label: 'degree', stepCount: 360 }),
    Object.freeze({ id: 1, label: 'amino', stepCount: 24 }),
    Object.freeze({ id: 2, label: 'zodiac', stepCount: 12 }),
    Object.freeze({ id: 3, label: 'spanda', stepCount: 12 }),
    Object.freeze({ id: 4, label: 'decan', stepCount: 36 }),
    Object.freeze({ id: 5, label: 'hexagram', stepCount: 64 }),
    Object.freeze({ id: 6, label: 'enneadic', stepCount: 9 }),
    Object.freeze({ id: 7, label: 'seasonal', stepCount: 4 }),
    Object.freeze({ id: 8, label: 'line-change', stepCount: 384 })
]);

export const M3_WALK_TYPE_COUNT = M3_WALK_TYPES.length;

/**
 * Honest parser for the Wave-B `cosmicClock.walks` profile field.
 *
 * Returns:
 *   - `null` when the field is absent/not-an-array — the WHOLE live-state is
 *     honest-pending (the substrate has not landed `cosmicClock.walks`).
 *   - a length-9 array of per-lane `currentStep` where each entry is either a
 *     real integer bussed for that walk id, or `null` (that lane is pending).
 *
 * It NEVER fabricates a step: an absent/invalid `currentStep` stays `null`.
 */
export function parseCosmicClockWalkSteps(
    payload: Readonly<Record<string, unknown>> | null | undefined
): readonly (number | null)[] | null {
    if (payload === null || payload === undefined || typeof payload !== 'object') {
        return null;
    }
    const cosmicClock = (payload as Record<string, unknown>).cosmicClock;
    if (cosmicClock === null || typeof cosmicClock !== 'object') {
        return null;
    }
    const walks = (cosmicClock as Record<string, unknown>).walks;
    if (!Array.isArray(walks)) {
        return null;
    }
    const steps: (number | null)[] = M3_WALK_TYPES.map(() => null);
    for (const entry of walks) {
        if (entry === null || typeof entry !== 'object') {
            continue;
        }
        const record = entry as Record<string, unknown>;
        const id = record.id;
        const currentStep = record.currentStep;
        if (
            Number.isInteger(id) &&
            (id as number) >= 0 &&
            (id as number) < steps.length &&
            Number.isInteger(currentStep) &&
            (currentStep as number) >= 0
        ) {
            steps[id as number] = currentStep as number;
        }
    }
    return steps;
}
