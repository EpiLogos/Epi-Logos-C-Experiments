import * as React from 'react';
import type { CommandRegistry } from '@theia/core/lib/common/command';
import type {
    MathemeHarmonicProfileBoundary,
    SharedBridgeAdapter
} from '@pratibimba/m-extension-runtime';
import {
    M0AlchemicalRow,
    M0M2ZodiacalRow,
    M0ParityBridgeProjection,
    M0PsychoidRow,
    readM0ParityBridgeProjection
} from '../../common/m0-inspector';

export { readM0ParityBridgeProjection };

export type M0ParityBridgeArchetype = 3 | 5 | 7;
export type M0ParityBridgeRow = M0M2ZodiacalRow | M0PsychoidRow | M0AlchemicalRow;

export interface M0ParityBridgeIntent {
    readonly requestedExtensionId: 'm2-parashakti';
    readonly requestedContributionId: 'correspondenceTree';
    readonly coordinate: string;
    readonly source: 'm0-anuttara:parity-bridge-reader';
}

export interface M0ParityBridgeReaderProps {
    readonly profile: MathemeHarmonicProfileBoundary | null;
    readonly activeArchetype: number | null;
    readonly commands?: Pick<CommandRegistry, 'executeCommand'>;
}

const PENDING_TRACK_19_10 = 'pending: Track 19.10 - M0/M2 parity bridges';

export function useM0ParityBridgeProfile(
    bridge: Pick<SharedBridgeAdapter, 'onProfile'> | null | undefined
): MathemeHarmonicProfileBoundary | null {
    const [profile, setProfile] = React.useState<MathemeHarmonicProfileBoundary | null>(null);

    React.useEffect(() => {
        if (!bridge) {
            setProfile(null);
            return undefined;
        }
        const subscription = bridge.onProfile(nextProfile => {
            setProfile(nextProfile);
        });
        return () => subscription.dispose();
    }, [bridge]);

    return profile;
}

export const M0ParityBridgeReader: React.FC<M0ParityBridgeReaderProps> = ({
    profile,
    activeArchetype,
    commands
}) => {
    const projection = readM0ParityBridgeProjection(profile);
    const bridge = bridgeForActiveArchetype(projection, activeArchetype);

    if (!projection || projection.state === 'blocked') {
        return (
            <section
                className="m0-parity-bridge-reader"
                data-widget-id="pratibimba.m0-anuttara:parity-bridge-reader"
                data-provenance-state="blocked"
                aria-label="M0/M2 parity bridge reader"
            >
                <h3>M0/M2 parity bridge reader</h3>
                <p className="mext-widget-empty">{PENDING_TRACK_19_10}</p>
            </section>
        );
    }

    if (!bridge) {
        return null;
    }

    return (
        <section
            className="m0-parity-bridge-reader"
            data-widget-id="pratibimba.m0-anuttara:parity-bridge-reader"
            data-active-archetype={bridge.archetype}
            data-provenance-state={projection.state}
            aria-label="M0/M2 parity bridge reader"
        >
            <h3>M0/M2 parity bridge reader</h3>
            <p className="mext-widget-empty">{bridge.tableLabel}</p>
            <table>
                <caption>{bridge.caption}</caption>
                <thead>{bridge.header}</thead>
                <tbody>
                    {bridge.rows.map((row, index) => (
                        <tr
                            key={rowKey(row, index)}
                            data-row-index={index}
                            {...rowDataAttributes(row)}
                            onClick={() => dispatchM2Intent(commands, row, bridge.archetype)}
                        >
                            {bridge.cells(row)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
};

export function rowsForActiveArchetype(
    projection: M0ParityBridgeProjection | null | undefined,
    activeArchetype: number | null | undefined
): readonly M0ParityBridgeRow[] {
    const bridge = bridgeForActiveArchetype(projection, activeArchetype);
    return bridge?.rows ?? Object.freeze([]);
}

export function parityBridgeIntentForRow(
    row: M0ParityBridgeRow,
    activeArchetype: number
): M0ParityBridgeIntent {
    if (activeArchetype === 3 && isZodiacalRow(row)) {
        return intent(`M2:decan:${row.firstDecanIdx72}`);
    }
    if (activeArchetype === 5 && isPsychoidRow(row)) {
        return intent(`M2:planet:${row.planetId}`);
    }
    if (activeArchetype === 7 && isAlchemicalRow(row)) {
        return intent(`M2:element:${row.mElemId}`);
    }
    return intent('M2:correspondence');
}

function bridgeForActiveArchetype(
    projection: M0ParityBridgeProjection | null | undefined,
    activeArchetype: number | null | undefined
):
    | {
          readonly archetype: M0ParityBridgeArchetype;
          readonly tableLabel: string;
          readonly caption: string;
          readonly rows: readonly M0ParityBridgeRow[];
          readonly header: React.ReactElement;
          readonly cells: (row: M0ParityBridgeRow) => React.ReactElement[];
      }
    | null {
    if (!projection) {
        return null;
    }
    if (activeArchetype === 3 && projection.zodiacalBridge) {
        return {
            archetype: 3,
            tableLabel: 'M0_M2_ZODIACAL_BRIDGE[12]',
            caption: 'Archetype 3 zodiacal bridge rows',
            rows: projection.zodiacalBridge,
            header: (
                <tr>
                    <th>VAK</th>
                    <th>M0</th>
                    <th>M2 sign</th>
                    <th>Element</th>
                    <th>Mode</th>
                    <th>Decan planets</th>
                </tr>
            ),
            cells: row => zodiacalCells(row as M0M2ZodiacalRow)
        };
    }
    if (activeArchetype === 5 && projection.psychoidPlanetary) {
        return {
            archetype: 5,
            tableLabel: 'PSYCHOID_PLANETARY_CORRESPONDENCE[7]',
            caption: 'Archetype 5 psychoid planetary correspondence rows',
            rows: projection.psychoidPlanetary,
            header: (
                <tr>
                    <th>Lens</th>
                    <th>Coordinate</th>
                    <th>Planet</th>
                    <th>Planet ID</th>
                </tr>
            ),
            cells: row => psychoidCells(row as M0PsychoidRow)
        };
    }
    if (activeArchetype === 7 && projection.alchemicalToTattvic) {
        return {
            archetype: 7,
            tableLabel: 'ALCHEMICAL_TO_TATTVIC[6]',
            caption: 'Archetype 7 alchemical to tattvic rows',
            rows: projection.alchemicalToTattvic,
            header: (
                <tr>
                    <th>Alchemical</th>
                    <th>Tattvic</th>
                    <th>M element</th>
                    <th>Cycle point</th>
                </tr>
            ),
            cells: row => alchemicalCells(row as M0AlchemicalRow)
        };
    }
    return null;
}

function zodiacalCells(row: M0M2ZodiacalRow): React.ReactElement[] {
    return [
        <td key="vak">{row.vakSymbol}</td>,
        <td key="m0">{`${row.m0ResonanceIdx} -> ${row.m0Successor}`}</td>,
        <td key="sign">{row.m2SignIdx}</td>,
        <td key="element">{row.element}</td>,
        <td key="mode">{row.mode}</td>,
        <td key="decan">{row.decanPlanets.join(' / ')}</td>
    ];
}

function psychoidCells(row: M0PsychoidRow): React.ReactElement[] {
    return [
        <td key="lens">{row.lensName}</td>,
        <td key="coordinate">{row.lensCoordinate}</td>,
        <td key="planet">{row.planetName}</td>,
        <td key="planet-id">{row.planetId}</td>
    ];
}

function alchemicalCells(row: M0AlchemicalRow): React.ReactElement[] {
    return [
        <td key="alchemical">{row.alchemicalName}</td>,
        <td key="tattvic">{row.tattvicName}</td>,
        <td key="m-elem">{row.mElemId}</td>,
        <td key="cycle">{row.cyclePoint}</td>
    ];
}

function dispatchM2Intent(
    commands: Pick<CommandRegistry, 'executeCommand'> | undefined,
    row: M0ParityBridgeRow,
    activeArchetype: M0ParityBridgeArchetype
): void {
    commands?.executeCommand(
        'omnipanel.intent.dispatch',
        parityBridgeIntentForRow(row, activeArchetype)
    );
}

function intent(coordinate: string): M0ParityBridgeIntent {
    return Object.freeze({
        requestedExtensionId: 'm2-parashakti',
        requestedContributionId: 'correspondenceTree',
        coordinate,
        source: 'm0-anuttara:parity-bridge-reader'
    });
}

function rowKey(row: M0ParityBridgeRow, index: number): string {
    if (isZodiacalRow(row)) {
        return `zodiacal-${row.m2SignIdx}-${row.firstDecanIdx72}`;
    }
    if (isPsychoidRow(row)) {
        return `planet-${row.planetId}`;
    }
    if (isAlchemicalRow(row)) {
        return `element-${row.mElemId}`;
    }
    return `parity-${index}`;
}

function rowDataAttributes(row: M0ParityBridgeRow): Record<string, string | number> {
    if (isZodiacalRow(row)) {
        return {
            'data-m2-sign-idx': row.m2SignIdx,
            'data-first-decan-idx-72': row.firstDecanIdx72
        };
    }
    if (isPsychoidRow(row)) {
        return {
            'data-planet-id': row.planetId
        };
    }
    if (isAlchemicalRow(row)) {
        return {
            'data-m-elem-id': row.mElemId
        };
    }
    return {};
}

function isZodiacalRow(row: M0ParityBridgeRow): row is M0M2ZodiacalRow {
    return 'firstDecanIdx72' in row;
}

function isPsychoidRow(row: M0ParityBridgeRow): row is M0PsychoidRow {
    return 'planetId' in row;
}

function isAlchemicalRow(row: M0ParityBridgeRow): row is M0AlchemicalRow {
    return 'mElemId' in row;
}
