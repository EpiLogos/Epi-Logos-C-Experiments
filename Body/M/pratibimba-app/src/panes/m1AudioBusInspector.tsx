/**
 * Coordinate: M' M1' (audio-bus inspector — Track 22.T22.9 per DR-FACE-7)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the `m1.paramasiva.audioBusInspector` view body — the companion
 *   view over the Vimarśa M2-1' windows: the `audioOctet[8]` cymatic Hz partials
 *   and the `nodalQuartet[4]` m/n boundary constraints, both read verbatim off the
 *   profile bus (the SAME `harmonicSnapshot` parser the modulation graph uses; no
 *   local pitch synthesis). Every row carries the M2-1' authority badge
 *   (`vimarsha_reading.rs:17-93`) making explicit that M1' is the consumer and
 *   M2-1' is the writer; a reads-only contract banner names the M1↔M2 boundary.
 *   Absence of either window is an honest pending state, never a fabricated table.
 * Does NOT own: the octet/quartet genesis (parashakti vimarsha_reading.rs — the
 *   single source), pitch derivation, the snapshot parser (modulators.ts).
 */

import { useState } from 'react';
import { useM1FaceState } from './m1DeepFaceData';

/** UX §10 reads-only boundary wording — verbatim. */
const READS_ONLY_BANNER = "M1' is the consumer; M2-1' is the writer. To change a value, route through M2.";
/** M2-1' authority citation carried on every row (provenance, not data). */
const VIMARSHA_AUTHORITY = 'vimarsha_reading.rs:17-93';

type AudioSortKey = 'position' | 'hz' | 'ratioRole';

interface AudioOctetRow {
    readonly position: number;
    readonly hz: number;
    readonly ratioRole: string;
}

function VimarshaBadge() {
    return (
        <span className="pending-badge" data-testid="m1-audio-vimarsha-badge" title="Vimarśa M2-1' authority">
            {VIMARSHA_AUTHORITY}
        </span>
    );
}

export function M1AudioBusInspector() {
    const face = useM1FaceState();
    const [audioSort, setAudioSort] = useState<AudioSortKey>('position');
    const octet = face.audioOctet;
    const quartet = face.nodalQuartet;

    const octetReady = Array.isArray(octet) && octet.length === 8;
    const quartetReady = Array.isArray(quartet) && quartet.length === 4;
    const audioRows = octetReady
        ? sortAudioRows(
              octet.map((hz, position) => ({
                  position,
                  hz,
                  ratioRole:
                      face.audioRatioRoles?.[position] ??
                      face.audioRatioRole ??
                      'profile ratio role pending'
              })),
              audioSort
          )
        : [];

    return (
        <section className="mext-widget-detail" data-testid="m1-audio-bus-inspector">
            <h3>Audio-bus inspector</h3>
            <p className="pane-toolbar" data-testid="m1-audio-reads-only-banner">
                {READS_ONLY_BANNER}
            </p>

            <div className="pane-toolbar" aria-label="Sort audio octet rows">
                <h4>audio_octet[8]</h4>
                <button
                    type="button"
                    className="pending-badge"
                    aria-pressed={audioSort === 'position'}
                    data-testid="m1-audio-sort-position"
                    onClick={() => setAudioSort('position')}
                >
                    position
                </button>
                <button
                    type="button"
                    className="pending-badge"
                    aria-pressed={audioSort === 'hz'}
                    data-testid="m1-audio-sort-hz"
                    onClick={() => setAudioSort('hz')}
                >
                    Hz
                </button>
                <button
                    type="button"
                    className="pending-badge"
                    aria-pressed={audioSort === 'ratioRole'}
                    data-testid="m1-audio-sort-ratio-role"
                    onClick={() => setAudioSort('ratioRole')}
                >
                    ratio role
                </button>
            </div>
            {octetReady ? (
                <table className="m1-audio-octet" data-testid="m1-audio-octet-table">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Hz</th>
                            <th scope="col">ratio role</th>
                            <th scope="col">authority</th>
                        </tr>
                    </thead>
                    <tbody>
                        {audioRows.map(row => (
                            <tr
                                key={row.position}
                                data-testid="m1-audio-octet-row"
                                data-index={row.position}
                                data-position={row.position}
                            >
                                <td>{row.position}</td>
                                <td data-testid={`m1-audio-octet-hz-${row.position}`}>{row.hz}</td>
                                <td data-testid={`m1-audio-octet-ratio-${row.position}`}>{row.ratioRole}</td>
                                <td>
                                    <VimarshaBadge />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="mext-widget-empty" data-testid="m1-audio-octet-pending">
                    pending-audio-octet — the eight cymatic partials populate when M2-1' Vimarśa
                    writes them onto the profile bus.
                </p>
            )}

            <h4>nodal_quartet[4]</h4>
            {quartetReady ? (
                <table className="m1-nodal-quartet" data-testid="m1-nodal-quartet-table">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">m/n</th>
                            <th scope="col">constraint kind</th>
                            <th scope="col">boundary condition role</th>
                            <th scope="col">authority</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quartet.map((node, index) => (
                            <tr key={index} data-testid="m1-nodal-quartet-row" data-index={index}>
                                <td>{index}</td>
                                <td data-testid={`m1-nodal-quartet-mn-${index}`}>
                                    {node.m}/{node.n}
                                </td>
                                <td data-testid={`m1-nodal-quartet-constraint-${index}`}>
                                    {node.constraintKind ?? 'cymatic_boundary'}
                                </td>
                                <td data-testid={`m1-nodal-quartet-boundary-${index}`}>
                                    {node.qlPosition !== null
                                        ? `${node.helix ?? 'unassigned-helix'} QL position ${node.qlPosition} cymatic boundary condition`
                                        : `${node.helix ?? 'unassigned-helix'} cymatic boundary condition`}
                                </td>
                                <td>
                                    <VimarshaBadge />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="mext-widget-empty" data-testid="m1-nodal-quartet-pending">
                    pending-nodal-quartet — the four boundary constraints populate when M2-1'
                    Vimarśa writes them onto the profile bus.
                </p>
            )}
        </section>
    );
}

function sortAudioRows(rows: readonly AudioOctetRow[], sort: AudioSortKey): readonly AudioOctetRow[] {
    const sorted = [...rows];
    if (sort === 'hz') {
        sorted.sort((left, right) => left.hz - right.hz || left.position - right.position);
    } else if (sort === 'ratioRole') {
        sorted.sort(
            (left, right) => left.ratioRole.localeCompare(right.ratioRole) || left.position - right.position
        );
    }
    return sorted;
}
