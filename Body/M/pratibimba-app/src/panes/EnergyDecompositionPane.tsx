/**
 * Coordinate: M' M5' (energy-decomposition read-out pane — Track 33.T33.3)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the carrier read-out of the kernel's `EnergyDecomposition` on
 *   the 4-5-0 recognition engine — the mental pole's three-channel score
 *   (E₄ personal-resonance, E₅ harmonic-substrate, E₆ verifier) with the
 *   canonical 4:5:6 weighting, the bussed `total_energy`, and the
 *   `bimba_pratibimba_energy` diagnostic (labelled "not summed"). Every value
 *   is read from the tick store's bussed profile via the m5Ebm-pattern view
 *   model (energyDecomposition.ts) — no local energy math. No `energy` object
 *   on the bus → the honest pending banner; a kernel-serialised 0 (E₅/E₆ are
 *   stub-zero until 33.T33.1) renders zero-with-provenance, never fabricated.
 * Does NOT own: energy law / the view model (energyDecomposition.ts +
 *   portal-core kernel), the profile cache (state/stores.ts), the pane's mount
 *   into the shell factory (App.tsx — controller-owned, chrome-contract locked).
 */

import { useMemo } from 'react';
import { useTickStore } from '../state/stores';
import { ProvenanceBadge } from '../ui/primitives';
import { buildEnergyDecompositionSurface } from './energyDecomposition';

export function EnergyDecompositionPane() {
    const cached = useTickStore(s => s.profile);

    const surface = useMemo(
        () =>
            buildEnergyDecompositionSurface({
                payload: (cached?.profile as Record<string, unknown> | null) ?? {},
                generation: cached?.generation ?? 0
            }),
        [cached]
    );

    return (
        <section
            className="mext-widget-detail"
            data-testid="energy-decomposition"
            data-state={surface.state}
            data-generation={surface.generation}
        >
            <h3>Energy decomposition — E₄ : E₅ : E₆</h3>
            <p data-testid="energy-decomposition-narrative">
                The mental pole scores each pratibimba by three energies — E₄
                personal-resonance, E₅ harmonic-substrate, E₆ verifier — combined at the
                canonical 4:5:6 weighting. Every value here is read verbatim from the
                kernel serialization; the surface computes no energy.
            </p>

            {surface.state === 'pending-energy' ? (
                <p
                    className="mext-widget-empty"
                    data-testid="energy-decomposition-pending"
                    data-reason="pending-energy"
                >
                    <ProvenanceBadge state="pending" reason="pending-energy" />
                    pending: the kernel serialization carries no energy decomposition yet.
                    The three channels and the 4:5:6 total render when the bus carries
                    KernelTemporalProjection.energy (e4PersonalEnergy / e5HarmonicEnergy /
                    e6VerifierEnergy); nothing is synthesised here.
                </p>
            ) : (
                <>
                    <dl data-testid="energy-decomposition-channels">
                        {surface.channels.map(channel => (
                            <div
                                key={channel.key}
                                className="energy-decomposition-channel"
                                data-testid={`energy-channel-${channel.key}`}
                                data-weight={channel.weight}
                                data-zero={channel.zero}
                            >
                                <dt>
                                    <span data-testid={`energy-channel-${channel.key}-label`}>
                                        {channel.label}
                                    </span>{' '}
                                    <span data-testid={`energy-channel-${channel.key}-weight`}>
                                        · weight {channel.weight}
                                    </span>
                                    {channel.zero ? (
                                        <ProvenanceBadge
                                            state="derived"
                                            reason={`kernel reports ${channel.raw} — verbatim from serialization, not fabricated (E₅/E₆ stub-zero until 33.T33.1)`}
                                        />
                                    ) : null}
                                </dt>
                                <dd data-testid={`energy-channel-${channel.key}-value`}>
                                    {channel.value !== null
                                        ? channel.value.toFixed(6)
                                        : '— (pending)'}
                                </dd>
                            </div>
                        ))}
                    </dl>
                    <dl>
                        <dt>Total ({surface.weightingLabel} weighted)</dt>
                        <dd data-testid="energy-decomposition-total">
                            E_total = (4·E₄ + 5·E₅ + 6·E₆) / 15 ={' '}
                            {surface.totalEnergy !== null
                                ? surface.totalEnergy.toFixed(6)
                                : '— (pending)'}
                        </dd>
                        <dt>bimba–pratibimba (diagnostic — not summed)</dt>
                        <dd data-testid="energy-decomposition-diagnostic">
                            {surface.bimbaPratibimbaDiagnostic !== null
                                ? surface.bimbaPratibimbaDiagnostic.toFixed(6)
                                : '— (pending)'}
                        </dd>
                    </dl>
                    <p data-testid="energy-decomposition-provenance">
                        <ProvenanceBadge state="derived" reason={surface.provenance} />
                        {surface.provenance}
                    </p>
                </>
            )}
        </section>
    );
}
