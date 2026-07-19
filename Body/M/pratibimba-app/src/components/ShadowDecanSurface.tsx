/**
 * Coordinate: M' M2' (Shadow Decan 108-cell reveal)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#n): M2' correspondence face sub-surface.
 * Actualises: [[M2-ARCHITECTURE]] §2.2's 36 primary + 36 light + 36 shadow
 *   decan decomposition from the typed `s2.parashaktiCorrespondences` projection.
 * Public surface: ShadowDecanSurface, ShadowDecanSurfaceProjection.
 * Does NOT own: decan LUTs, S2 graph descriptors, M3 reversed tarot meanings,
 *   gateway invocation, or active address selection.
 * Contract: [[M2'-SPEC]] / [[S0-SPEC]]; the aggregate is an opt-in extension of
 *   `s2.parashaktiCorrespondences` and reports absent S2/M3 authorities visibly.
 */

export interface DecanSurfaceDescriptor {
    readonly decanIndex: number;
    readonly coordinate: string;
    readonly label: string;
    readonly tarotCard?: string | null;
    readonly sourceHandle: string;
    readonly provenance: 'kernel-lut' | 'live-graph';
}

export interface TarotReversedMeaningReference {
    readonly decanIndex: number;
    readonly coordinate: string;
    readonly reversedMeaning: string;
    readonly sourceHandle: string;
}

export interface ShadowDecanSurfaceProjection {
    readonly coordinate: string;
    readonly primaryDecans: readonly DecanSurfaceDescriptor[];
    readonly lightDecans: readonly DecanSurfaceDescriptor[];
    readonly primaryDescriptors: readonly DecanSurfaceDescriptor[];
    readonly shadowProperDescriptors: readonly DecanSurfaceDescriptor[];
    readonly tarotReversedMeanings: readonly TarotReversedMeaningReference[];
    readonly tarotReversedMeaning: {
        readonly coordinate: string;
        readonly requiredGatewayMethod: string;
        readonly state: string;
        readonly reason: string;
    };
    readonly pending: {
        readonly shadowDecanGraph: boolean;
        readonly tarotReversedMeaning: boolean;
    };
    readonly visibleCellCount: number;
}

export interface ShadowDecanSurfaceProps {
    readonly selectedAddress72: number;
    readonly projection: ShadowDecanSurfaceProjection | null | undefined;
}

type DecanKind = 'primary' | 'light' | 'shadow-proper';

const EMPTY_REVERSED_MEANINGS: ReadonlyMap<number, TarotReversedMeaningReference> = new Map();

export function ShadowDecanSurface({ selectedAddress72, projection }: ShadowDecanSurfaceProps) {
    if (!projection) {
        return (
            <section className="m2-shadow-decan-surface" data-testid="shadow-decan-surface" data-visible-cell-count="0">
                <span data-testid="pending-shadow-decan-projection">pending-shadow-decan-projection</span>
            </section>
        );
    }

    const selectedDecanIndex = Math.floor((((selectedAddress72 % 72) + 72) % 72) / 2);
    const primaryDescriptorByIndex = byDecanIndex(projection.primaryDescriptors);
    const reversedMeaningByIndex = byDecanIndex(projection.tarotReversedMeanings);
    const shadowComplete = projection.shadowProperDescriptors.length === 36;
    const reversedMeaningComplete = projection.tarotReversedMeanings.length === 36;
    const shadowPending = projection.pending.shadowDecanGraph || !shadowComplete;
    const reversedMeaningPending = projection.pending.tarotReversedMeaning || !reversedMeaningComplete;
    const visibleCellCount = 72 + (shadowComplete ? 36 : 0);

    return (
        <section
            className="m2-shadow-decan-surface"
            aria-label="Shadow decan surface"
            data-testid="shadow-decan-surface"
            data-visible-cell-count={visibleCellCount}
            data-selected-decan={selectedDecanIndex}
        >
            <header className="m2-shadow-decan-header">
                <h4>Shadow Decans</h4>
                <span>108 = 36 x 3</span>
            </header>
            {(shadowPending || reversedMeaningPending) && (
                <div className="m2-shadow-decan-pending" aria-label="Pending authorities">
                    {shadowPending && (
                        <span data-testid="pending-shadow-decan-graph">pending-shadow-decan-graph</span>
                    )}
                    {reversedMeaningPending && (
                        <span data-testid="pending-tarot-reversed-meaning">
                            pending-tarot-reversed-meaning
                        </span>
                    )}
                </div>
            )}
            <div className="m2-shadow-decan-columns">
                <DecanColumn
                    title="Primary"
                    kind="primary"
                    cells={projection.primaryDecans}
                    selectedDecanIndex={selectedDecanIndex}
                    graphDescriptors={primaryDescriptorByIndex}
                    reversedMeanings={EMPTY_REVERSED_MEANINGS}
                />
                <DecanColumn
                    title="Light"
                    kind="light"
                    cells={projection.lightDecans}
                    selectedDecanIndex={selectedDecanIndex}
                    reversedMeanings={EMPTY_REVERSED_MEANINGS}
                />
                {shadowComplete && (
                    <DecanColumn
                        title="Shadow"
                        kind="shadow-proper"
                        cells={projection.shadowProperDescriptors}
                        selectedDecanIndex={selectedDecanIndex}
                        reversedMeanings={reversedMeaningByIndex}
                    />
                )}
            </div>
        </section>
    );
}

function DecanColumn({
    title,
    kind,
    cells,
    selectedDecanIndex,
    graphDescriptors = new Map(),
    reversedMeanings
}: {
    readonly title: string;
    readonly kind: DecanKind;
    readonly cells: readonly DecanSurfaceDescriptor[];
    readonly selectedDecanIndex: number;
    readonly graphDescriptors?: ReadonlyMap<number, DecanSurfaceDescriptor>;
    readonly reversedMeanings: ReadonlyMap<number, TarotReversedMeaningReference>;
}) {
    return (
        <section className="m2-shadow-decan-column" data-shadow-decan-column={kind}>
            <h5>{title}</h5>
            <ol>
                {cells.map(cell => {
                    const graphDescriptor = graphDescriptors.get(cell.decanIndex);
                    const reversedMeaning = reversedMeanings.get(cell.decanIndex);
                    return (
                        <li
                            key={`${kind}:${cell.decanIndex}`}
                            data-shadow-decan-cell={kind}
                            data-decan-index={cell.decanIndex}
                            data-selected={cell.decanIndex === selectedDecanIndex}
                        >
                            <span>{graphDescriptor?.label ?? cell.label}</span>
                            <code>{cell.coordinate}</code>
                            {reversedMeaning && (
                                <span data-tarot-reversed-meaning={reversedMeaning.coordinate}>
                                    {reversedMeaning.reversedMeaning}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}

function byDecanIndex<T extends { readonly decanIndex: number }>(entries: readonly T[]): ReadonlyMap<number, T> {
    return new Map(entries.map(entry => [entry.decanIndex, entry]));
}
