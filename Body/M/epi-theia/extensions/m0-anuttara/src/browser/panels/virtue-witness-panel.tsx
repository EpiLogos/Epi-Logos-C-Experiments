import * as React from 'react';
import type {
    MathemeHarmonicProfileBoundary,
    SharedBridgeAdapter
} from '@pratibimba/m-extension-runtime';

export const VIRTUE_WITNESS_VECTOR_SIZE = 9 as const;

export interface VirtueWitnessEntry {
    readonly position: number;
    readonly rFactor: number | null;
    readonly divineAct: number | null;
    readonly crossBranchRefs: string;
    readonly name: string;
    readonly symbol: string;
}

export const VIRTUE_WITNESS_LUT: readonly VirtueWitnessEntry[] = Object.freeze([
    Object.freeze({
        position: 0,
        rFactor: null,
        divineAct: null,
        crossBranchRefs: '0x0000',
        name: 'Love/Peace - Foundational Essence',
        symbol: '(inf*inf)*(R#/##) = 00/00, (0/1), 9'
    }),
    Object.freeze({
        position: 1,
        rFactor: null,
        divineAct: null,
        crossBranchRefs: '0x0001',
        name: 'Truth - Structural Foundation',
        symbol: '## = @ = (0/1)-(00)-00'
    }),
    Object.freeze({
        position: 2,
        rFactor: null,
        divineAct: null,
        crossBranchRefs: '0x0002',
        name: 'Openness/Creativity - Structural Fusion',
        symbol: '#R = @ = (7-8-9-(0/1)/O#-X#-N#)'
    }),
    Object.freeze({
        position: 3,
        rFactor: 0,
        divineAct: 0,
        crossBranchRefs: '0x0103',
        name: 'Joy/Play - Creation Virtue',
        symbol: '0R = @ = (9-O#-X#-N#)'
    }),
    Object.freeze({
        position: 4,
        rFactor: 1,
        divineAct: 1,
        crossBranchRefs: '0x0104',
        name: 'Goodness - Sustenance Virtue',
        symbol: '1R = @ = (O#-X#-N#-M#-#-(#))'
    }),
    Object.freeze({
        position: 5,
        rFactor: 2,
        divineAct: 2,
        crossBranchRefs: '0x0105',
        name: 'Beauty - Dissolution Virtue',
        symbol: '2R = @ = (X#-N#-M#-#-(#)-(@#))'
    }),
    Object.freeze({
        position: 6,
        rFactor: 3,
        divineAct: 3,
        crossBranchRefs: '0x0106',
        name: 'Life/Nature - Veiling Virtue',
        symbol: '3R = @ = ((@#)-(#)-#-M#-N#-X#)'
    }),
    Object.freeze({
        position: 7,
        rFactor: 4,
        divineAct: 4,
        crossBranchRefs: '0x0107',
        name: 'Wisdom - Grace Virtue',
        symbol: '4R = @ = ((#)-#-M#-N#-X#-O#)'
    }),
    Object.freeze({
        position: 8,
        rFactor: 5,
        divineAct: 5,
        crossBranchRefs: '0x0108',
        name: 'Reality - Completion Virtue',
        symbol: '5R = @ = (##)'
    })
]);

export type VirtueWitnessVector = readonly boolean[];

export interface VirtueWitnessPanelProps {
    readonly profile: MathemeHarmonicProfileBoundary | null;
    readonly onActiveWitnessCountChange?: (activeWitnessCount: number) => void;
}

export function createWitnessVector(seed?: unknown): VirtueWitnessVector {
    const bits = new Array<boolean>(VIRTUE_WITNESS_VECTOR_SIZE).fill(false);
    const source = normalizeWitnessSeed(seed);
    for (let position = 0; position < VIRTUE_WITNESS_VECTOR_SIZE; position++) {
        bits[position] = source[position] ?? false;
    }
    return Object.freeze(bits);
}

export function toggleWitnessBit(
    vector: VirtueWitnessVector,
    position: number
): VirtueWitnessVector {
    assertVirtuePosition(position);
    const next = createWitnessVector(vector);
    const mutable = [...next];
    mutable[position] = !mutable[position];
    return Object.freeze(mutable);
}

export function activeWitnessCount(vector: VirtueWitnessVector): number {
    return createWitnessVector(vector).filter(Boolean).length;
}

export function witnessVectorFromProfile(
    profile: MathemeHarmonicProfileBoundary | null
): VirtueWitnessVector {
    if (!profile) {
        return createWitnessVector();
    }
    const payload = profile.payload;
    return createWitnessVector(
        payload.virtueWitnessVector ??
            payload.virtue_witness_vector ??
            payload.m0VirtueWitnessVector ??
            payload.m0_virtue_witness_vector
    );
}

export function useVirtueWitnessProfile(
    bridge: SharedBridgeAdapter | null | undefined
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

export const VirtueWitnessPanel: React.FC<VirtueWitnessPanelProps> = ({
    profile,
    onActiveWitnessCountChange
}) => {
    const profileSeedKey = `${profile?.generation ?? 'none'}:${profile?.pointerAnchor ?? 'none'}`;
    const profileVector = React.useMemo(() => witnessVectorFromProfile(profile), [profileSeedKey]);
    const [witnessVector, setWitnessVector] = React.useState<VirtueWitnessVector>(profileVector);
    const count = activeWitnessCount(witnessVector);

    React.useEffect(() => {
        setWitnessVector(profileVector);
    }, [profileVector]);

    React.useEffect(() => {
        onActiveWitnessCountChange?.(count);
    }, [count, onActiveWitnessCountChange]);

    return (
        <section
            className="m0-virtue-witness-panel"
            data-widget-id="pratibimba.m0-anuttara:virtue-witness-panel"
            data-archetype="9"
            data-active-witness-count={count}
            aria-label="Virtue Witness vector"
            style={panelStyle}
        >
            <header style={headerStyle}>
                <div>
                    <h3 style={titleStyle}>Virtue Witness vector</h3>
                    <p style={subtitleStyle}>archetype 9 / Paramesvara</p>
                </div>
                <output
                    aria-label="Active witness count"
                    data-test="activeWitnessCount"
                    style={countStyle}
                >
                    {count}/{VIRTUE_WITNESS_VECTOR_SIZE}
                </output>
            </header>
            <div
                className="m0-virtue-witness-grid"
                role="group"
                aria-label="Nine virtue witness bits"
                style={gridStyle}
            >
                {VIRTUE_WITNESS_LUT.map(entry => {
                    const witnessed = witnessVector[entry.position] ?? false;
                    return (
                        <button
                            key={entry.position}
                            type="button"
                            aria-pressed={witnessed}
                            data-virtue-position={entry.position}
                            data-witness-state={witnessed ? 'witnessed' : 'not-witnessed'}
                            onClick={() =>
                                setWitnessVector(current =>
                                    toggleWitnessBit(current, entry.position)
                                )
                            }
                            style={{
                                ...bitStyle,
                                ...(witnessed ? witnessedBitStyle : unwitnessedBitStyle)
                            }}
                        >
                            <span style={positionStyle}>{entry.position}</span>
                            <span style={nameStyle}>{entry.name}</span>
                            <span style={stateStyle}>
                                {witnessed ? 'witnessed' : 'not witnessed'}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
};

function normalizeWitnessSeed(seed: unknown): readonly boolean[] {
    if (typeof seed === 'string') {
        return seed
            .trim()
            .slice(0, VIRTUE_WITNESS_VECTOR_SIZE)
            .split('')
            .map(bit => bit === '1');
    }
    if (!Array.isArray(seed)) {
        return Object.freeze([]);
    }
    if (seed.length === VIRTUE_WITNESS_VECTOR_SIZE) {
        return seed.map(value => Boolean(value));
    }
    const bits = new Array<boolean>(VIRTUE_WITNESS_VECTOR_SIZE).fill(false);
    for (const value of seed) {
        if (typeof value === 'number' && Number.isInteger(value)) {
            assertVirtuePosition(value);
            bits[value] = true;
        }
    }
    return bits;
}

function assertVirtuePosition(position: number): void {
    if (
        !Number.isInteger(position) ||
        position < 0 ||
        position >= VIRTUE_WITNESS_VECTOR_SIZE
    ) {
        throw new RangeError(`Virtue position ${position} is outside the 9-bit witness vector`);
    }
}

const panelStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    color: 'var(--theia-foreground)'
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
};

const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 'var(--theia-ui-font-size1)',
    fontWeight: 600
};

const subtitleStyle: React.CSSProperties = {
    margin: '2px 0 0',
    color: 'var(--theia-descriptionForeground)',
    fontSize: 'var(--theia-ui-font-size0)'
};

const countStyle: React.CSSProperties = {
    minWidth: 44,
    textAlign: 'center',
    padding: '3px 6px',
    border: '1px solid var(--theia-input-border)',
    borderRadius: 3,
    fontVariantNumeric: 'tabular-nums'
};

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 8
};

const bitStyle: React.CSSProperties = {
    minHeight: 88,
    display: 'grid',
    gridTemplateRows: 'auto 1fr auto',
    gap: 4,
    border: '1px solid var(--theia-input-border)',
    borderRadius: 4,
    padding: 8,
    color: 'var(--theia-foreground)',
    font: 'inherit',
    textAlign: 'left',
    cursor: 'pointer'
};

const witnessedBitStyle: React.CSSProperties = {
    background: 'var(--theia-button-background)',
    color: 'var(--theia-button-foreground)'
};

const unwitnessedBitStyle: React.CSSProperties = {
    background: 'var(--theia-button-secondaryBackground)'
};

const positionStyle: React.CSSProperties = {
    fontSize: 'var(--theia-ui-font-size0)',
    color: 'var(--theia-descriptionForeground)'
};

const nameStyle: React.CSSProperties = {
    lineHeight: 1.25,
    overflowWrap: 'anywhere'
};

const stateStyle: React.CSSProperties = {
    fontSize: 'var(--theia-ui-font-size0)',
    textTransform: 'uppercase'
};

export default VirtueWitnessPanel;
