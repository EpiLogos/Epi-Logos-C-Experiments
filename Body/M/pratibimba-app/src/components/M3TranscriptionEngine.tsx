/**
 * Coordinate: M' M3' (lens-to-codon transcription engine)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#n): #3 process / transcription.
 * Actualises: the active functional lens's authority-provided degree, binary,
 *   charge, quaternion, element, class, line-hop, and RNA-capability rows.
 * Public surface: M3TranscriptionEngine, M3TranscriptionEngineCard.
 * Does NOT own: lens selection, profile cadence, codon decomposition, charge
 *   algebra, quaternion/element law, line-change law, or RNA classification.
 * Contract: [[M3'-SPEC]]; active carrier for rerun tranche 24.T24.20.
 */

import type {
    LensCodonBinaryCharges,
    LensCodonBinaryProjection
} from '../bridge/types';
import { ProvenanceBadge } from '../ui/primitives';

export interface M3TranscriptionEngineProps {
    readonly activeLensId: number;
    readonly profileTick12: number | null;
    readonly projection: LensCodonBinaryProjection | null;
    readonly devModeXLogicLamps?: boolean;
}

const CHARGE_ORDER = ['pp', 'nn', 'np', 'pn'] as const;

export function M3TranscriptionEngine({
    activeLensId,
    profileTick12,
    projection,
    devModeXLogicLamps = false
}: M3TranscriptionEngineProps) {
    if (!Number.isInteger(activeLensId) || activeLensId < 0 || activeLensId > 16) {
        const reason = `functional-lens-id-out-of-range:${activeLensId}`;
        return (
            <section
                className="m3-transcription-engine"
                data-testid="m3-transcription-engine"
                data-state="blocked"
                data-active-lens-id={activeLensId}
            >
                <div data-testid="m3-transcription-invalid-lens">
                    <ProvenanceBadge state="blocked" reason={reason} />
                    {reason}
                </div>
            </section>
        );
    }

    if (projection === null) {
        return (
            <section
                className="m3-transcription-engine"
                data-testid="m3-transcription-engine"
                data-state="pending"
                data-active-lens-id={activeLensId}
                data-profile-tick={profileTick12 ?? 'pending'}
            >
                <header className="m3-transcription-header">
                    <h4>M3 transcription</h4>
                    <span>lens {activeLensId}</span>
                </header>
                <div data-testid="m3-transcription-projection-pending">
                    <ProvenanceBadge
                        state="pending"
                        reason="pending-profile-field:lensCodonBinary"
                    />
                </div>
            </section>
        );
    }

    if (projection.lensId !== activeLensId) {
        const reason = `lens-projection-mismatch:${activeLensId}:${projection.lensId}`;
        return (
            <section
                className="m3-transcription-engine"
                data-testid="m3-transcription-engine"
                data-state="blocked"
                data-active-lens-id={activeLensId}
                data-projection-lens-id={projection.lensId}
            >
                <ProvenanceBadge state="blocked" reason={reason} />
            </section>
        );
    }

    return (
        <section
            className="m3-transcription-engine"
            data-testid="m3-transcription-engine"
            data-state="ready"
            data-active-lens-id={activeLensId}
            data-projection-lens-id={projection.lensId}
            data-profile-tick={profileTick12 ?? 'pending'}
            data-degree-count={projection.perDegree.length}
        >
            <header className="m3-transcription-header">
                <h4>M3 transcription</h4>
                <div className="m3-transcription-meta">
                    <span>{projection.lensRole}</span>
                    <span>Ground {projection.groundingLensId}</span>
                    <span>{projection.perDegree.length} degrees</span>
                    <span>tick {profileTick12 ?? 'pending'}</span>
                </div>
            </header>

            <div className="m3-transcription-pending">
                <span data-testid="m3-transcription-rna-family-pending">
                    <ProvenanceBadge state="pending" reason="pending-rna-codon-family" />
                </span>
                <span data-testid="m3-transcription-chromosome-pending">
                    <ProvenanceBadge state="pending" reason="pending-chromosome-graph" />
                </span>
            </div>

            <div className="m3-transcription-table-wrap">
                <table className="m3-transcription-table">
                    <thead>
                        <tr>
                            <th scope="col">Degree</th>
                            <th scope="col">Binary</th>
                            <th scope="col">Address</th>
                            <th scope="col">Charges</th>
                            <th scope="col">Quaternion</th>
                            <th scope="col">Element</th>
                            <th scope="col">Class</th>
                            <th scope="col">Line hops</th>
                            <th scope="col">RNA</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projection.perDegree.map((degree, index) => {
                            const active =
                                profileTick12 !== null && degree.tick12 === profileTick12;
                            return (
                                <tr
                                    key={`${degree.degree360}:${degree.codon6Bit}`}
                                    data-testid={`m3-transcription-row-${index}`}
                                    data-active={active ? 'true' : 'false'}
                                    data-degree360={degree.degree360}
                                    data-tick12={degree.tick12}
                                >
                                    <td>
                                        {degree.degree360}° / {degree.exactDegree720}
                                    </td>
                                    <td
                                        className="m3-transcription-bits"
                                        data-testid={`m3-transcription-bits-${index}`}
                                    >
                                        {degree.codonPairBits.join(' ')}
                                    </td>
                                    <td>
                                        {degree.codon6Bit} / H{degree.hexagramId}
                                    </td>
                                    <td
                                        className="m3-transcription-charges"
                                        data-testid={`m3-transcription-charges-${index}`}
                                    >
                                        {CHARGE_ORDER.map((charge, chargeIndex) => (
                                            <span key={charge}>
                                                {charge}={degree.charges[charge]}
                                                {devModeXLogicLamps
                                                    ? ` ${degree.chargeIdentity[chargeIndex].xPermutation}`
                                                    : ''}
                                            </span>
                                        ))}
                                        <span
                                            data-testid={`m3-transcription-x-invariant-${index}`}
                                            data-four-x={degree.fourX}
                                            data-invariant={
                                                degree.xLogicInvariant ? 'true' : 'false'
                                            }
                                        >
                                            4X={degree.fourX}
                                        </span>
                                    </td>
                                    <td data-testid={`m3-transcription-quaternion-${index}`}>
                                        [{degree.quaternion.join(', ')}]
                                    </td>
                                    <td>alchemical:{degree.elementCanonical}</td>
                                    <td data-testid={`m3-transcription-class-${index}`}>
                                        {degree.codonClassLabel}
                                    </td>
                                    <td
                                        className="m3-transcription-hops"
                                        data-testid={`m3-transcription-hops-${index}`}
                                    >
                                        {degree.lineChangeHops.map(hop => (
                                            <span
                                                key={hop.line}
                                                data-line-hop={hop.line}
                                                title={`operator ${hop.operatorAddress}`}
                                            >
                                                L{hop.line}:H{hop.toHexagramId}
                                            </span>
                                        ))}
                                    </td>
                                    <td data-testid={`m3-transcription-rna-${index}`}>
                                        {degree.rnaCapable ? 'RNA-ready' : 'DNA-only'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export function M3TranscriptionEngineCard(props: M3TranscriptionEngineProps) {
    return <M3TranscriptionEngine {...props} />;
}

export type M3TranscriptionChargeKey = keyof LensCodonBinaryCharges;
