/**
 * Coordinate: M' M2' (9:8 epogdoon proof reader, rerun 23.T23.8)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#n): profile-tick proof and bloom reader on the planetary evidence card.
 * Actualises: the cited 9:8 identity and the live address's nine-fold position.
 * Public surface: EpogdoonProofOverlay, isM2ProofDebugSearch.
 * Does NOT own: compression, address production, a renderer clock, or profile state.
 * Contract: [[M2'-SPEC]] + [[M2-ARCHITECTURE]] + rerun [[23.T23.8]].
 */

import { useRef } from 'react';

const FOLD_POINT_COUNT = 9;
const ADDRESS_COUNT = 72;

export function isM2ProofDebugSearch(search: string | null | undefined): boolean {
    if (!search) {
        return false;
    }
    const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
    return params
        .getAll('epi-debug')
        .flatMap(value => value.split(','))
        .some(value => value.trim() === 'm2-proof');
}

function activeAddress(value: number | null | undefined): number | null {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < ADDRESS_COUNT
        ? value
        : null;
}

function ambientSearch(): string {
    return typeof window === 'undefined' ? '' : window.location.search;
}

export function EpogdoonProofOverlay({
    address72,
    generation,
    developerMode = false,
    locationSearch
}: {
    readonly address72: number | null | undefined;
    readonly generation: number | null | undefined;
    /** Persisted M2 surface preference; the debug query remains independently active. */
    readonly developerMode?: boolean;
    readonly locationSearch?: string;
}) {
    const firstObservedGeneration = useRef<number | null>(null);
    const address = activeAddress(address72);
    const currentGeneration = typeof generation === 'number' && Number.isInteger(generation) ? generation : null;

    if (
        currentGeneration !== null &&
        (firstObservedGeneration.current === null || currentGeneration < firstObservedGeneration.current)
    ) {
        firstObservedGeneration.current = currentGeneration;
    }

    const tickCounter =
        currentGeneration !== null && firstObservedGeneration.current !== null
            ? currentGeneration - firstObservedGeneration.current
            : 0;
    const bloomFiring = tickCounter % FOLD_POINT_COUNT === 0;
    const bloomEpoch = Math.floor(tickCounter / FOLD_POINT_COUNT);
    const proofEnabled = developerMode || isM2ProofDebugSearch(locationSearch ?? ambientSearch());
    const quotient = address === null ? null : Math.floor(address / FOLD_POINT_COUNT);
    const remainder = address === null ? null : address % FOLD_POINT_COUNT;

    return (
        <section
            className="m2-epogdoon-proof-overlay"
            data-testid="epogdoon-proof-overlay"
            data-tick-counter={tickCounter}
            data-bloom-epoch={bloomEpoch}
        >
            <span
                key={bloomEpoch}
                className="m2-epogdoon-compression-bloom"
                data-testid="epogdoon-compression-bloom"
                data-firing={bloomFiring ? 'true' : 'false'}
                data-epoch={bloomEpoch}
                aria-hidden="true"
            />
            {proofEnabled && address !== null && quotient !== null && remainder !== null ? (
                <section className="m2-epogdoon-proof-panel" data-testid="epogdoon-proof-panel">
                    <code data-testid="epogdoon-proof-identity">7/4 = (72 - 9) / 36</code>
                    <span
                        data-testid="epogdoon-address-decomposition"
                        data-address72={address}
                        data-q={quotient}
                        data-r={remainder}
                    >
                        {address} = 9 x {quotient} + {remainder}
                    </span>
                    <small>m2.h: m2_epogdoon_compress(val) = val * 8 / 9</small>
                </section>
            ) : null}
        </section>
    );
}
