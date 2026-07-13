/**
 * Coordinate: M' M5' (energy-decomposition read-out law — Track 33.T33.3)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the pure view-model of the kernel's `EnergyDecomposition`
 *   as it reaches the carrier over the profile bus — the mental pole's
 *   three-channel score (E₄ personal-resonance / E₅ harmonic-substrate /
 *   E₆ verifier), the canonical 4:5:6 `total_energy`, and the
 *   `bimba_pratibimba_energy` diagnostic (retained, NEVER summed). Every
 *   value is READ VERBATIM from `KernelTemporalProjection.energy`
 *   (portal-core `KernelTemporalEnergy`, serialised as `{:.6}` strings);
 *   the only local arithmetic is `Number(str)` deserialisation of the
 *   transport encoding — NO renderer-local energy math (the 4:5:6 total is
 *   the bussed value, never recomputed here). Absence is honest: no `energy`
 *   object on the bus → `pending-energy`; a channel the kernel serialises as
 *   0 renders zero-with-provenance (the kernel's current stub-zero for
 *   E₅/E₆ per 33.T33.1), never a fabricated value.
 * Does NOT own: energy law / the 4:5:6 weighting computation (portal-core
 *   `kernel_energy_evaluate` / `canonical_total_energy`), the E₄/E₅/E₆
 *   channel content (kernel + S4/S5 substrate), the pane body
 *   (EnergyDecompositionPane.tsx), the profile cache (state/stores.ts).
 */

export type EnergyChannelKey = 'e4' | 'e5' | 'e6';

export interface EnergyChannelReading {
    readonly key: EnergyChannelKey;
    /** Human label — the channel identity, not a value. */
    readonly label: string;
    /** Canonical just-triad weight: E₄→4, E₅→5, E₆→6. Structural, not tunable. */
    readonly weight: number;
    /** The camelCase field this channel reads on `KernelTemporalProjection.energy`. */
    readonly field: string;
    /** Parsed verbatim from the kernel serialisation; null when unparseable/absent. */
    readonly value: number | null;
    /** The verbatim serialised string (`{:.6}`), preserved for honest display. */
    readonly raw: string | null;
    /** True when the kernel serialises this channel as exactly 0 —
     *  zero-with-provenance (E₅/E₆ are stub-zero until 33.T33.1 lands). */
    readonly zero: boolean;
}

export interface EnergyDecompositionSurface {
    readonly state: 'ready' | 'pending-energy';
    /** Ordered [E₄, E₅, E₆] — always three, even while pending (value null). */
    readonly channels: readonly EnergyChannelReading[];
    /** `total_energy` read VERBATIM from the bus — never recomputed locally. */
    readonly totalEnergy: number | null;
    readonly totalEnergyRaw: string | null;
    /** `bimba_pratibimba_energy` diagnostic — retained, NOT part of the total. */
    readonly bimbaPratibimbaDiagnostic: number | null;
    readonly bimbaPratibimbaDiagnosticRaw: string | null;
    /** The canonical weighting, as a display label (`4:5:6`) — not a computation. */
    readonly weightingLabel: string;
    /** Stated provenance of every rendered value. */
    readonly provenance: string;
    readonly generation: number;
}

const CHANNELS: ReadonlyArray<{
    readonly key: EnergyChannelKey;
    readonly field: string;
    readonly label: string;
    readonly weight: number;
}> = [
    { key: 'e4', field: 'e4PersonalEnergy', label: 'E₄ personal-resonance', weight: 4 },
    { key: 'e5', field: 'e5HarmonicEnergy', label: 'E₅ harmonic-substrate', weight: 5 },
    { key: 'e6', field: 'e6VerifierEnergy', label: 'E₆ verifier', weight: 6 }
];

export const ENERGY_WEIGHTING_LABEL = '4:5:6';

export const ENERGY_PROVENANCE =
    'portal-core KernelTemporalEnergy (KernelTemporalProjection.energy) — read verbatim; ' +
    'no renderer-local energy math; canonical 4:5:6 weighting; ' +
    'bimba_pratibimba_energy is diagnostic, never summed';

function objectValue(value: unknown): Record<string, unknown> | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

/**
 * Deserialise a single serialised scalar. The kernel serialises energies as
 * `format!("{:.6}")` STRINGS; parsing that string back to a number is transport
 * decoding, not energy computation. A numeric transport is tolerated defensively
 * (some fixtures/paths bus f64 directly), never synthesised.
 */
function readSerializedScalar(value: unknown): { value: number | null; raw: string | null } {
    if (typeof value === 'string' && value.length > 0) {
        const parsed = Number(value);
        return { value: Number.isFinite(parsed) ? parsed : null, raw: value };
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
        return { value, raw: value.toString() };
    }
    return { value: null, raw: null };
}

/**
 * Project the bussed `KernelTemporalProjection.energy` object into the read-out
 * surface. `payload` is the profile payload (`cached.profile.profile`), whose
 * `energy` field is a sibling of `harmonicProfile`. Read-only: no channel value,
 * total, or diagnostic is computed here — each is the kernel's verbatim scalar.
 */
export function buildEnergyDecompositionSurface(input: {
    readonly payload: Readonly<Record<string, unknown>>;
    readonly generation: number;
}): EnergyDecompositionSurface {
    const energy = objectValue(input.payload.energy);

    if (!energy) {
        return Object.freeze({
            state: 'pending-energy' as const,
            channels: Object.freeze(
                CHANNELS.map(channel =>
                    Object.freeze({
                        key: channel.key,
                        label: channel.label,
                        weight: channel.weight,
                        field: channel.field,
                        value: null,
                        raw: null,
                        zero: false
                    })
                )
            ),
            totalEnergy: null,
            totalEnergyRaw: null,
            bimbaPratibimbaDiagnostic: null,
            bimbaPratibimbaDiagnosticRaw: null,
            weightingLabel: ENERGY_WEIGHTING_LABEL,
            provenance: ENERGY_PROVENANCE,
            generation: input.generation
        });
    }

    const channels = CHANNELS.map(channel => {
        const scalar = readSerializedScalar(energy[channel.field]);
        return Object.freeze({
            key: channel.key,
            label: channel.label,
            weight: channel.weight,
            field: channel.field,
            value: scalar.value,
            raw: scalar.raw,
            zero: scalar.value === 0
        });
    });

    const total = readSerializedScalar(energy.totalEnergy);
    const bimba = readSerializedScalar(energy.bimbaPratibimbaEnergy);

    return Object.freeze({
        state: 'ready' as const,
        channels: Object.freeze(channels),
        totalEnergy: total.value,
        totalEnergyRaw: total.raw,
        bimbaPratibimbaDiagnostic: bimba.value,
        bimbaPratibimbaDiagnosticRaw: bimba.raw,
        weightingLabel: ENERGY_WEIGHTING_LABEL,
        provenance: ENERGY_PROVENANCE,
        generation: input.generation
    });
}
