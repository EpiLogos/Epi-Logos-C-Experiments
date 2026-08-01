/**
 * Coordinate: M2' meaning-packet inspector surface (rerun 51.T51.4)
 * Residency: Body/M/pratibimba-app/src/panes/m2MeaningPacket/M2MeaningPacketInspectorPane.tsx
 * Position (#n): #2 — Entity: the packet shown as the object it is.
 * Actualises: [[M2'-SPEC]] §2's meaning-packet inspector. It renders the
 *   reading and derives nothing: the 72-address views, the MEF semantic frame,
 *   the elemental-medium frame (L2' register), the sacred-sonic and maqam/mode
 *   frames, the cymatic signature, the M3 projection evidence, the provenance,
 *   and — first-class, because canon asks for it — the PENDING fields.
 * Public surface: M2MeaningPacketInspectorPane.
 * Does NOT own: the reading (`meaningPacket.ts`), the element registers, the
 *   axis decoders, the profile stream.
 * Contract: [[M2'-SPEC]] §2 / :118 · [[DR-L2-ELEM-2]] · rerun tranche
 *   [[51.T51.4]].
 */

import { useMemo } from 'react';
import { useTickStore } from '../../state/stores';
import { readMeaningPacket, type MeaningPacketFieldReading } from './meaningPacket';
import './m2MeaningPacket.css';

function preview(value: unknown): string {
    if (value === null || value === undefined) {
        return '—';
    }
    if (typeof value === 'object') {
        const json = JSON.stringify(value);
        return json.length > 160 ? `${json.slice(0, 157)}…` : json;
    }
    return String(value);
}

function FieldRows({ fields }: { readonly fields: readonly MeaningPacketFieldReading[] }) {
    return (
        <>
            {fields.map(field => (
                <tr
                    key={field.id}
                    data-testid={`m2-packet-field-${field.id}`}
                    data-present={String(field.present)}
                >
                    <td>
                        <code>{field.id}</code>
                    </td>
                    <td className="m2-packet-path">
                        <code>{field.path}</code>
                    </td>
                    <td className="m2-packet-value">
                        {field.present ? preview(field.value) : <em>pending</em>}
                    </td>
                </tr>
            ))}
        </>
    );
}

export function M2MeaningPacketInspectorPane() {
    const cached = useTickStore(s => s.profile);
    const packet = useMemo(() => readMeaningPacket(cached), [cached]);

    return (
        <div
            className="m2-meaning-packet"
            data-testid="m2-meaning-packet"
            data-generation={packet.generation ?? ''}
            data-address72={packet.address72 ?? ''}
            data-pending-fields={packet.pending.join(' ')}
            data-present-field-count={packet.fields.filter(field => field.present).length}
        >
            <header className="m2-packet-header">
                <span className="m2-packet-coordinate">M2′</span>
                <h2>Meaning-packet inspector</h2>
                <p className="m2-packet-essence">
                    The active <code>M2PrimeMeaningPacket</code> — the typed object the rest of the
                    stack passes around — read off the live profile. Absent fields are named as
                    pending, never filled: canon makes a missing field an error, not a default.
                </p>
            </header>

            <section className="m2-packet-section" data-testid="m2-packet-address72">
                <h3>72-address views</h3>
                {packet.address72 === null ? (
                    <p className="m2-packet-empty" data-testid="m2-packet-address-pending">
                        no active address — <code>resonance72.lensAnchorIndex</code> is pending, so
                        the six axes have nothing to decode. An address is not invented.
                    </p>
                ) : (
                    <ul>
                        {packet.address72Views.map(view => (
                            <li key={view.axis} data-testid={`m2-packet-axis-${view.axis}`}>
                                <code className="m2-packet-axis-name">{view.axis}</code>
                                <span className="m2-packet-note">{view.sourceField}</span>
                                <span className="m2-packet-parts">
                                    {view.decode
                                        ? Object.entries(view.decode.parts)
                                            .map(([key, value]) => `${key}=${value}`)
                                            .join(' · ')
                                        : '—'}
                                </span>
                                {view.decode && view.decode.kernelSourced.length > 0 ? (
                                    <span className="m2-packet-kernel">
                                        kernel-owned: {view.decode.kernelSourced.join(', ')}
                                    </span>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="m2-packet-section" data-testid="m2-packet-mef">
                <h3>MEF semantic frame</h3>
                {packet.mefSemanticFrame ? (
                    <p className="m2-packet-parts" data-testid="m2-packet-mef-parts">
                        {Object.entries(packet.mefSemanticFrame.parts)
                            .map(([key, value]) => `${key}=${value}`)
                            .join(' · ')}
                    </p>
                ) : (
                    <p className="m2-packet-empty">pending — no active address to frame.</p>
                )}
            </section>

            <section className="m2-packet-section" data-testid="m2-packet-elemental">
                <h3>Elemental-medium frame</h3>
                <p className="m2-packet-note" data-testid="m2-packet-element-register">
                    L2′ alchemical register:{' '}
                    {packet.elementalMedium.register
                        .map((name, index) => `${index}=${name}`)
                        .join(' · ')}
                </p>
                {packet.elementalMedium.present ? (
                    <ul>
                        {packet.elementalMedium.elements.map((entry, index) => (
                            <li
                                key={index}
                                data-testid={`m2-packet-element-${index}`}
                                data-element-id={entry.element ?? ''}
                                data-element-name={entry.name ?? ''}
                                data-element-operative={
                                    entry.operative === null ? '' : String(entry.operative)
                                }
                            >
                                {entry.name ?? (
                                    <em>
                                        outside the L2′ register — {preview(entry.raw)}
                                    </em>
                                )}
                                {entry.operative === null ? null : (
                                    <span className="m2-packet-note">
                                        {entry.operative ? 'operative quartet' : 'non-operative'}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="m2-packet-empty" data-testid="m2-packet-elements-pending">
                        pending — the payload carries no <code>elements</code> field.
                    </p>
                )}
            </section>

            <section className="m2-packet-section" data-testid="m2-packet-cymatic">
                <h3>Cymatic signature (the 8+4 bus)</h3>
                <p className="m2-packet-parts">
                    audio_octet:{' '}
                    <b data-testid="m2-packet-audio-octet">
                        {packet.cymaticSignature.audioOctet
                            ? packet.cymaticSignature.audioOctet.join(' · ')
                            : 'pending'}
                    </b>
                </p>
                <p className="m2-packet-parts">
                    nodal_quartet:{' '}
                    <b data-testid="m2-packet-nodal-quartet">
                        {packet.cymaticSignature.nodalQuartet
                            ? `${packet.cymaticSignature.nodalQuartet.length} constraints`
                            : 'pending'}
                    </b>
                </p>
            </section>

            <section className="m2-packet-section" data-testid="m2-packet-fields">
                <h3>Declared fields</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Field</th>
                            <th>Path</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <FieldRows fields={packet.fields} />
                    </tbody>
                </table>
            </section>

            <section className="m2-packet-section" data-testid="m2-packet-pending">
                <h3>Pending fields</h3>
                {packet.pending.length === 0 ? (
                    <p className="m2-packet-note">none — the packet is complete.</p>
                ) : (
                    <p className="m2-packet-note">
                        {packet.pending.length} of {packet.fields.length} declared fields are absent
                        from the live payload: <code>{packet.pending.join(', ')}</code>. Canon makes
                        these errors, not defaults — they are named here rather than filled.
                    </p>
                )}
            </section>

            <section className="m2-packet-section" data-testid="m2-packet-provenance">
                <h3>Provenance</h3>
                <ul>
                    {packet.provenance.map(line => (
                        <li key={line}>{line}</li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
