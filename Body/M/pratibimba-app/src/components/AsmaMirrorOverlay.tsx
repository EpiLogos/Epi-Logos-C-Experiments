/**
 * Coordinate: M' M2' (Asma 99+1 sonic/domain overlay — Tranche 03.T3.10)
 * Actualises: WC-M2.09 / WC-M2.23.5 retargeted to the pratibimba-app
 *   carrier: the Asma overlay strip beside the cymatic surface — mirror
 *   pair, Jalal/Kamal/Jamal group, and active phase — riding the kernel
 *   phase-flip law. Double-cover discipline: when a Klein flip is active
 *   the overlay shows the CONJUGATE reading of the SAME address; the
 *   address is conserved, only phase changes. The Asma corpus stays an
 *   overlay — never promoted into a seventh 72-axis.
 * Does NOT own: mirror computation (M2_ASMA_LUT via the gate adapter
 *   s2.parashaktiCorrespondences), the flip law (kernel), pane composition.
 */

import { useTickStore } from '../state/stores';

const ASMA_GROUPS = ['Jalal', 'Kamal', 'Jamal'] as const;
const ASMA_MIRROR_ABSENT = 0xff;

/** The gate adapter's overlay record (s2.parashaktiCorrespondences → sacredSonic.asma). */
export interface AsmaOverlayRecord {
    readonly nameIdx: number;
    readonly group: number;
    readonly indexInGroup: number;
    readonly mirrorIdx: number;
    readonly mirrorName: string | null;
    readonly mirrorRelation: string;
    readonly phaseLaw: string;
}

function groupLabel(group: number): string {
    return ASMA_GROUPS[group] ?? 'Hidden';
}

export function AsmaMirrorOverlay({ record }: { record?: AsmaOverlayRecord | null }) {
    const cached = useTickStore(s => s.profile);
    const hp = (cached?.profile as { harmonicProfile?: Record<string, unknown> } | null)
        ?.harmonicProfile;

    const resonance72 = hp?.resonance72 as { lensAnchorIndex?: number } | undefined;
    const address72 = resonance72?.lensAnchorIndex ?? null;
    const kleinFlip = (hp?.kleinFlip ?? null) as { kind?: string } | null;
    // The M2 face of `#`: same address, flipped interpretive phase.
    const phase = kleinFlip?.kind === 'm2CymaticValenceInvert' ? 'inverted' : 'primary';

    const hasMirror =
        record != null && record.mirrorIdx !== ASMA_MIRROR_ABSENT && record.mirrorIdx != null;

    return (
        <div
            className={`asma-mirror-overlay phase-${phase}`}
            data-testid="asma-mirror-overlay"
            data-address72={address72 ?? ''}
            data-phase={phase}
        >
            <span className="asma-address" data-testid="asma-address">
                {address72 === null ? '—' : `72:${address72}`}
            </span>
            <span className="asma-phase" data-testid="asma-phase">
                {phase}
            </span>
            {record ? (
                <span className="asma-name" data-testid="asma-name">
                    {`asma ${record.nameIdx} · ${groupLabel(record.group)} ${record.indexInGroup}`}
                </span>
            ) : null}
            {record ? (
                hasMirror ? (
                    <span className="asma-mirror" data-testid="asma-mirror">
                        {/* On an active flip the conjugate reading leads — the
                            mirror pair of the SAME conserved address. */}
                        {phase === 'inverted'
                            ? `↔ ${record.mirrorName ?? record.mirrorIdx} (conjugate active)`
                            : `↔ ${record.mirrorName ?? record.mirrorIdx}`}
                    </span>
                ) : (
                    <span className="asma-mirror asma-mirror-absent" data-testid="asma-mirror">
                        no domain mirror
                    </span>
                )
            ) : null}
            {record ? (
                <span className="asma-phase-law" data-testid="asma-phase-law">
                    {record.phaseLaw}
                </span>
            ) : null}
        </div>
    );
}
