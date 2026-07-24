/**
 * Coordinate: M' `/` membrane (Evidence tail — deposition anchor, 27.T27.5)
 * Residency: Body/M/pratibimba-app/src/panes/omni/evidence
 * Position (#n): the `<DepositionAnchorDisplay />` sub-fold of EvidencePacketView.
 * Actualises: the DR-KB-2 deposition anchor (Hen-side write-through reference)
 *   with a click-through to the canon path in `Idea/` when present. The
 *   MediatedRunEvidencePacket schema (26.10) does not yet carry a deposition
 *   anchor field, so absent this renders the honest ReadinessBanner; when a
 *   real anchor is supplied it renders the anchor + canon path — never faked.
 * Public surface: DepositionAnchorDisplay.
 * Does NOT own: the packet schema (evidenceShapes), the Hen write path (S1').
 */

import { ReadinessBanner } from '../../../ui/ReadinessBanner';

export function DepositionAnchorDisplay({
    anchor,
    canonPath
}: {
    /** DR-KB-2 write-through reference; absent until 26.10 carries it. */
    readonly anchor?: string;
    /** Canon path in Idea/, when the anchor resolves to one. */
    readonly canonPath?: string;
}) {
    if (!anchor) {
        return (
            <section className="evidence-deposition-anchor" data-testid="evidence-deposition-anchor">
                <span className="evidence-list-label">deposition anchor</span>
                <ReadinessBanner
                    state="degraded_but_readable"
                    reason="DR-KB-2 deposition anchor is not carried on this packet yet (26.10 schema fold)"
                />
            </section>
        );
    }
    return (
        <section className="evidence-deposition-anchor" data-testid="evidence-deposition-anchor" data-anchor={anchor}>
            <span className="evidence-list-label">deposition anchor</span>
            <code className="evidence-deposition-anchor-ref">{anchor}</code>
            {canonPath ? (
                <span className="evidence-deposition-anchor-path" data-testid="evidence-deposition-anchor-path">
                    → {canonPath}
                </span>
            ) : null}
        </section>
    );
}
