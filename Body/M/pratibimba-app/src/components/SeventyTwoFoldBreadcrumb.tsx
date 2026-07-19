/**
 * Coordinate: M' M2' (72-fold bridge inspector, rerun 23.T23.7)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#n): M2-to-M3 bridge reader for a conserved 72-address.
 * Actualises: the kernel/Nara-projected hexagram -> half-decan -> decan ->
 *   planet -> chakra -> body-zone chain and its 9:8 epogdoon marker.
 * Public surface: SeventyTwoFoldBreadcrumb, SeventyTwoFoldBridgeProjection.
 * Does NOT own: epogdoon compression, decan/planet/chakra lookup, body-zone
 *   lookup, routing state, or signature computation.
 * Contract: [[M2'-SPEC]] + [[M2-ARCHITECTURE]] + rerun [[23.T23.7]].
 */

export interface SeventyTwoFoldBridgeProjection {
    readonly address72: number;
    readonly hexagramId: number;
    readonly halfDecan: number;
    readonly decan: { readonly index: number; readonly label: string; readonly provenance: string };
    readonly planet: { readonly id: number; readonly name: string; readonly provenance: string };
    readonly chakra: { readonly id: number; readonly name: string; readonly provenance: string };
    readonly bodyZone: { readonly zones: readonly string[]; readonly provenance: string };
    readonly epogdoon: { readonly ratio: string; readonly provenance: string };
}

function signatureForPosition(position6: number | null): 'negative' | 'positive' | 'pending' {
    if (position6 === null || !Number.isInteger(position6) || position6 < 0 || position6 > 5) {
        return 'pending';
    }
    return position6 === 0 || position6 === 5 ? 'negative' : 'positive';
}

export function SeventyTwoFoldBreadcrumb({
    bridge,
    position6
}: {
    readonly bridge: SeventyTwoFoldBridgeProjection;
    readonly position6: number | null;
}) {
    const signature = signatureForPosition(position6);
    const steps = [
        { label: 'Hexagram', value: String(bridge.hexagramId), source: bridge.epogdoon.provenance },
        { label: 'Half-decan', value: String(bridge.halfDecan), source: bridge.decan.provenance },
        { label: 'Decan', value: bridge.decan.label, source: bridge.decan.provenance },
        { label: 'Planet', value: bridge.planet.name, source: bridge.planet.provenance },
        { label: 'Chakra', value: bridge.chakra.name, source: bridge.chakra.provenance },
        { label: 'Body zone', value: bridge.bodyZone.zones.join(', '), source: bridge.bodyZone.provenance }
    ] as const;

    return (
        <section
            className="seventy-two-fold-breadcrumb"
            data-testid="seventy-two-fold-breadcrumb"
            data-address72={bridge.address72}
        >
            <header>
                <strong>72-fold bridge</strong>
                <span data-testid="seventy-two-fold-epogdoon">{bridge.epogdoon.ratio} epogdoon</span>
            </header>
            <ol aria-label="hexagram to body-zone bridge">
                {steps.map((step, index) => (
                    <li key={step.label} data-testid={`bridge-step-${index}`}>
                        {index > 0 ? (
                            <span
                                className="seventy-two-fold-arrow"
                                data-testid={`bridge-arrow-${index}`}
                                data-signature={signature}
                            >
                                {index === 1 ? bridge.epogdoon.ratio : '->'}
                            </span>
                        ) : null}
                        <span className="seventy-two-fold-step">
                            <span>{step.label}</span>
                            <strong>{step.value}</strong>
                            <small>{step.source}</small>
                        </span>
                    </li>
                ))}
            </ol>
        </section>
    );
}
