import * as React from 'react';
import {
    CoordinateContext,
    MathemeHarmonicProfileBoundary,
    MExtensionReadinessSnapshot,
    SharedBridgeAdapter
} from '@pratibimba/m-extension-runtime';
import {
    buildM1ProfileClockModel,
    M1ProfileClockModel
} from '../common/clock-instrument';

export interface M1Cl42SignatureInspectorProps {
    readonly profile: MathemeHarmonicProfileBoundary | null;
    readonly readiness: MExtensionReadinessSnapshot;
    readonly context: CoordinateContext;
    readonly layoutMode?: string;
    readonly developerMode?: boolean;
    readonly MersenneProofOverlay?: React.ComponentType;
}

export interface M1Cl42SignatureInspectorBridgeProps
    extends Omit<M1Cl42SignatureInspectorProps, 'profile'> {
    readonly bridge: Pick<SharedBridgeAdapter, 'onProfile'>;
}

interface Cl42TrigRow {
    readonly position: number;
    readonly name: string;
    readonly formula: string | null;
    readonly numeratorPos: number | null;
    readonly denominatorPos: number | null;
    readonly signature: number | null;
}

export function M1Cl42SignatureInspectorFromBridge(
    props: M1Cl42SignatureInspectorBridgeProps
): React.ReactNode {
    const [profile, setProfile] = React.useState<MathemeHarmonicProfileBoundary | null>(null);

    React.useEffect(() => {
        const subscription = props.bridge.onProfile(nextProfile => setProfile(nextProfile));
        return () => {
            subscription.dispose();
        };
    }, [props.bridge]);

    return (
        <M1Cl42SignatureInspector
            profile={profile}
            readiness={props.readiness}
            context={props.context}
            layoutMode={props.layoutMode}
            developerMode={props.developerMode}
            MersenneProofOverlay={props.MersenneProofOverlay}
        />
    );
}

export function M1Cl42SignatureInspector(
    props: M1Cl42SignatureInspectorProps
): React.ReactNode {
    if (!props.profile) {
        return (
            <section className="mext-widget-detail" data-test="m1-cl42-signature-inspector">
                <h3>Cl(4,2) signature inspector</h3>
                <p className="mext-widget-empty">
                    No MathemeHarmonicProfile available yet. The signature matrix populates
                    only from the shared profile bridge.
                </p>
            </section>
        );
    }

    const model = buildM1ProfileClockModel({
        profile: props.profile,
        readiness: props.readiness,
        context: props.context
    });
    const vortex = recordValue(
        props.profile.payload.ananda_vortex ?? props.profile.payload.anandaVortex
    );
    const rows = readTrigRows(vortex);
    const activePosition = normalizedPosition(model.position6);
    const activeSignature = numberValue(
        vortex?.cl42_signature_at_position ?? vortex?.cl42SignatureAtPosition
    );
    const Overlay = props.MersenneProofOverlay;
    const showOverlay =
        props.layoutMode === 'ide-deep' && props.developerMode === true && Overlay !== undefined;

    return (
        <section className="mext-widget-detail" data-test="m1-cl42-signature-inspector">
            <h3>Cl(4,2) signature inspector</h3>
            <p data-test="m1-cl42-profile-source">
                source=bridge.payload.ananda_vortex.cl42_signature_at_position ·
                current={displayNumber(activeSignature)}
            </p>

            {rows.length === 6 ? (
                <div className="m1-cl42-position-matrix" role="grid">
                    {rows.map(row => (
                        <Cl42PositionCell
                            key={row.position}
                            row={row}
                            active={activePosition === row.position}
                        />
                    ))}
                </div>
            ) : (
                <p className="mext-widget-empty" data-test="m1-cl42-table-blocked">
                    blocked: profile ananda_vortex does not expose the canonical trig
                    matrix read-through.
                </p>
            )}

            <EpogdoonDerivationPanel model={model} />

            {showOverlay ? <Overlay /> : null}
        </section>
    );
}

function Cl42PositionCell(props: {
    readonly row: Cl42TrigRow;
    readonly active: boolean;
}): React.ReactElement {
    const tone = props.row.signature !== null && props.row.signature < 0 ? 'indigo' : 'warm';
    return (
        <article
            data-test={`m1-cl42-position-${props.row.position}`}
            className={`m1-cl42-position${props.active ? ' m1-cl42-position-active' : ''}`}
            role="gridcell"
            aria-current={props.active ? 'true' : undefined}
        >
            <header>
                <span>P{props.row.position}</span>
                <strong>{props.row.name}</strong>
            </header>
            <dl>
                <dt>Signature</dt>
                <dd>signature-{displayNumber(props.row.signature)}</dd>
                <dt>QL pair</dt>
                <dd>{positionPair(props.row)}</dd>
                <dt>Formula</dt>
                <dd>{props.row.formula ?? 'blocked'}</dd>
            </dl>
            <span
                data-test={`m1-cl42-halo-${props.row.position}`}
                className={`m1-cl42-halo m1-cl42-halo-${tone}`}
                aria-label={`${tone} halo for signature ${displayNumber(props.row.signature)}`}
            />
        </article>
    );
}

function EpogdoonDerivationPanel(props: {
    readonly model: M1ProfileClockModel;
}): React.ReactElement {
    const activeTick = normalizedTick(props.model.tick12);
    return (
        <section className="m1-cl42-epogdoon" data-test="m1-cl42-epogdoon">
            <h4>9/8 self-derivation</h4>
            <p>(4/3) × (3/2) = 2/1 (octave)</p>
            <p>(3/2) ÷ (4/3) = 9/8 (epogdoon-tick)</p>
            <ol aria-label="tick12 epogdoon clock">
                {Array.from({ length: 12 }, (_, tick) => (
                    <li
                        key={tick}
                        data-test={`m1-cl42-tick-${tick}`}
                        className={activeTick === tick ? 'm1-cl42-tick-active' : undefined}
                        aria-current={activeTick === tick ? 'true' : undefined}
                    >
                        {tick}
                    </li>
                ))}
            </ol>
        </section>
    );
}

function readTrigRows(vortex: Readonly<Record<string, unknown>> | undefined): readonly Cl42TrigRow[] {
    const rawRows = arrayValue(
        vortex?.ql_trig_table ??
            vortex?.qlTrigTable ??
            vortex?.trigTable ??
            vortex?.cl42TrigTable
    );
    const rows = rawRows
        .map((row, index) => readTrigRow(row, index))
        .filter((row): row is Cl42TrigRow => row !== null)
        .sort((a, b) => a.position - b.position);
    return rows.length === 6 && rows.every((row, index) => row.position === index)
        ? Object.freeze(rows)
        : Object.freeze([]);
}

function readTrigRow(value: unknown, index: number): Cl42TrigRow | null {
    const row = recordValue(value);
    if (!row) return null;
    const position = numberValue(row.position) ?? index;
    const name = stringValue(row.name ?? row.trig_fn ?? row.trigFn ?? row.trigFunction);
    if (!Number.isInteger(position) || position < 0 || position > 5 || !name) {
        return null;
    }
    return Object.freeze({
        position,
        name,
        formula: stringValue(row.formula),
        numeratorPos: numberValue(row.numerator_pos ?? row.numeratorPos),
        denominatorPos: numberValue(row.denominator_pos ?? row.denominatorPos),
        signature: numberValue(row.cl42_signature ?? row.cl42Signature ?? row.signature)
    });
}

function positionPair(row: Cl42TrigRow): string {
    return `${positionToken(row.numeratorPos)}/${positionToken(row.denominatorPos)}`;
}

function positionToken(value: number | null): string {
    if (value === null) return 'blocked';
    return value === 6 ? '1' : `[${value}]`;
}

function normalizedPosition(value: number | null): number | null {
    return value !== null && Number.isInteger(value) && value >= 0 && value < 6 ? value : null;
}

function normalizedTick(value: number | null): number | null {
    return value !== null && Number.isInteger(value) && value >= 0 && value < 12 ? value : null;
}

function displayNumber(value: number | null): string {
    return value === null ? 'blocked' : String(value);
}

function recordValue(value: unknown): Readonly<Record<string, unknown>> | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Readonly<Record<string, unknown>>)
        : undefined;
}

function arrayValue(value: unknown): readonly unknown[] {
    return Array.isArray(value) ? value : [];
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}
