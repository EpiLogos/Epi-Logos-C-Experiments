/**
 * Coordinate: M' M2' to M3' (epogdoon descent reader - Tranche 23.18)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#18): M2 vibrational address read into the M3 codon lattice.
 * Actualises: the 72-to-64-to-56 epogdoon bridge as a profile-tick-driven,
 *   read-only carrier surface.
 * Public surface: EpogdoonBridgeEngine.
 * Does NOT own: epogdoon compression, round-trip-gap classification, M3
 *   resonance data, or tarot law. The C-backed kernel bridge is the authority.
 * Contract: kernelBridge.m2.epogdoonProjection(address72).
 */

import { useEffect, useMemo, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';

const PROJECTION_SOURCE = 'kernelBridge.m2.epogdoonProjection(address72)';
const ADDRESS_COUNT = 72;
const CODON_COUNT = 64;
const TAROT_SLOTS_PER_SUIT = 16;
const TAROT_LIVE_SLOTS_PER_SUIT = 14;
const RESONANCE_GAP_CODONS = new Set([5, 21, 26, 34, 42, 53, 58, 61]);
const TAROT_SUITS = [
    { id: 'cups', label: 'Cups', integral: 84 },
    { id: 'wands', label: 'Wands', integral: 96 },
    { id: 'pentacles', label: 'Pentacles', integral: 88 },
    { id: 'swords', label: 'Swords', integral: 92 }
] as const;

interface EpogdoonCell {
    readonly address72: number;
    readonly compressedCodon: number;
    readonly isEvolutionaryGap: boolean;
    readonly expandedBack: number;
}

interface CodonCell {
    readonly codon: number;
    readonly isSentinel: boolean;
    readonly sourceAddresses: readonly number[];
}

function boundedInteger(value: unknown, label: string, maximum: number): number {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > maximum) {
        throw new Error(`${label} must be an integer in 0..${maximum}`);
    }
    return value;
}

function readProjection(address72: number, artifact: unknown): EpogdoonCell {
    if (!artifact || typeof artifact !== 'object') {
        throw new Error(`address ${address72}: projection artifact is not an object`);
    }
    const record = artifact as Record<string, unknown>;
    if (typeof record.isEvolutionaryGap !== 'boolean') {
        throw new Error(`address ${address72}: isEvolutionaryGap must be boolean`);
    }
    return Object.freeze({
        address72,
        compressedCodon: boundedInteger(record.compressedCodon, 'compressedCodon', CODON_COUNT - 1),
        isEvolutionaryGap: record.isEvolutionaryGap,
        expandedBack: boundedInteger(record.expandedBack, 'expandedBack', ADDRESS_COUNT - 1)
    });
}

async function readLattice(): Promise<readonly EpogdoonCell[]> {
    const client = gateway();
    const cells = await Promise.all(
        Array.from({ length: ADDRESS_COUNT }, async (_, address72) => {
            const receipt = await client.invoke(PROJECTION_SOURCE, { address72 });
            return readProjection(address72, receipt.artifact);
        })
    );
    const distinctCodons = new Set(cells.map(cell => cell.compressedCodon));
    if (distinctCodons.size !== CODON_COUNT) {
        throw new Error(`kernel epogdoon lattice reaches ${distinctCodons.size} codons, expected ${CODON_COUNT}`);
    }
    return Object.freeze(cells);
}

function buildCodonBand(cells: readonly EpogdoonCell[]): readonly CodonCell[] {
    return Object.freeze(
        Array.from({ length: CODON_COUNT }, (_, codon) =>
            Object.freeze({
                codon,
                isSentinel: RESONANCE_GAP_CODONS.has(codon),
                sourceAddresses: Object.freeze(
                    cells.filter(cell => cell.compressedCodon === codon).map(cell => cell.address72)
                )
            })
        )
    );
}

export function EpogdoonBridgeEngine({
    activeAddress72,
    generation,
    connected
}: {
    readonly activeAddress72: number;
    readonly generation: number | null;
    readonly connected: boolean;
}) {
    const [cells, setCells] = useState<readonly EpogdoonCell[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!connected) {
            setCells(null);
            setError(null);
            return;
        }
        let disposed = false;
        setError(null);
        void readLattice()
            .then(nextCells => {
                if (!disposed) {
                    setCells(nextCells);
                }
            })
            .catch(reason => {
                if (!disposed) {
                    setCells(null);
                    setError(reason instanceof Error ? reason.message : String(reason));
                }
            });
        return () => {
            disposed = true;
        };
    }, [connected]);

    const codonBand = useMemo(() => (cells ? buildCodonBand(cells) : []), [cells]);
    const activeCell = cells?.find(cell => cell.address72 === activeAddress72) ?? null;
    const roundTripGaps = cells?.filter(cell => cell.isEvolutionaryGap).length ?? 0;
    const anchors = cells?.filter(cell => !cell.isEvolutionaryGap).length ?? 0;
    const state = error ? 'error' : !connected ? 'pending-connection' : cells ? 'ready' : 'loading';

    return (
        <section
            className="m2-epogdoon-bridge"
            data-testid="m2-epogdoon-bridge"
            data-bridge-state={state}
            data-source={PROJECTION_SOURCE}
            data-generation={generation ?? ''}
        >
            <header className="m2-epogdoon-header">
                <strong>Epogdoon descent</strong>
                <span>72 to 64 to 56</span>
                <span data-testid="m2-epogdoon-tally">
                    {cells ? `${roundTripGaps} round-trip gaps, ${anchors} anchors` : 'reading kernel lattice'}
                </span>
            </header>
            {error ? <p className="chat-error">epogdoon projection unavailable: {error}</p> : null}
            {!error && !cells ? <p className="pane-message">reading the C-backed epogdoon lattice...</p> : null}
            {cells && activeCell ? (
                <>
                    <div className="m2-epogdoon-bands" data-testid="m2-epogdoon-bands">
                        <ol className="m2-epogdoon-address-band" aria-label="72 address descent">
                            {cells.map(cell => (
                                <li
                                    key={cell.address72}
                                    data-epogdoon-cell
                                    data-active={cell.address72 === activeAddress72 ? 'true' : 'false'}
                                    data-gap={cell.isEvolutionaryGap ? 'true' : 'false'}
                                    data-compressed-codon={cell.compressedCodon}
                                    title={`M2 ${cell.address72} to M3 ${cell.compressedCodon}`}
                                >
                                    {cell.address72}
                                </li>
                            ))}
                        </ol>
                        <ol className="m2-epogdoon-codon-band" aria-label="64 codon band">
                            {codonBand.map(cell => (
                                <li
                                    key={cell.codon}
                                    data-epogdoon-codon
                                    data-epogdoon-sentinel={cell.isSentinel ? 'true' : 'false'}
                                    data-active={cell.codon === activeCell.compressedCodon ? 'true' : 'false'}
                                    title={`M3 ${cell.codon}; M2 sources ${cell.sourceAddresses.join(', ')}`}
                                >
                                    {cell.isSentinel ? 'FF' : cell.codon}
                                </li>
                            ))}
                        </ol>
                        <div className="m2-epogdoon-tarot-floor" aria-label="56 tarot codon floor">
                            {TAROT_SUITS.map(suit =>
                                Array.from({ length: TAROT_SLOTS_PER_SUIT }, (_, slot) => {
                                    const padding = slot >= TAROT_LIVE_SLOTS_PER_SUIT;
                                    return (
                                        <span
                                            key={`${suit.id}-${slot}`}
                                            data-epogdoon-tarot-cell
                                            data-padding={padding ? 'true' : 'false'}
                                            data-suit={suit.id}
                                            title={`${suit.label} ${suit.integral}${padding ? ' padding' : ''}`}
                                        >
                                            {padding ? '-' : slot + 1}
                                        </span>
                                    );
                                })
                            )}
                        </div>
                    </div>
                    <dl className="m2-epogdoon-inspector" data-testid="m2-epogdoon-inspector">
                        <dt>Active M2 address</dt>
                        <dd>{activeCell.address72}</dd>
                        <dt>Kernel M3 codon</dt>
                        <dd>{activeCell.compressedCodon}</dd>
                        <dt>Round trip</dt>
                        <dd>{activeCell.expandedBack}</dd>
                        <dt>Projection source</dt>
                        <dd>{PROJECTION_SOURCE}</dd>
                    </dl>
                </>
            ) : null}
        </section>
    );
}
