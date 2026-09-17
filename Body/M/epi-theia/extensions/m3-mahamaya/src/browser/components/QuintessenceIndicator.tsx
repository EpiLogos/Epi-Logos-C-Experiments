import * as React from 'react';
import { M3ProjectionSurface } from '../../common';
import { useM3ProfileTick } from '../context/M3ProfileTickContext';
import { useM3Readiness } from '../context/M3ReadinessContext';
import { ReadinessChip } from './ReadinessChip';

export type QuintessenceElementKey = 'fire' | 'air' | 'water' | 'earth';

export interface QuintessenceElementContribution {
    readonly key: QuintessenceElementKey;
    readonly label: string;
    readonly value: number;
    readonly share: number;
}

export interface QuintessenceIndicatorModel {
    readonly ready: boolean;
    readonly pendingFields: readonly string[];
    readonly elements: readonly QuintessenceElementContribution[];
    readonly akashaSum: number;
    readonly rotationIndex: number | null;
    readonly rotationalStateCount: number | null;
    readonly tctRotationalState: string;
}

export interface QuintessenceIndicatorProps {
    readonly surface: M3ProjectionSurface;
    readonly className?: string;
}

const TOOLTIP = 'Emergent balance — Akasha/Quintessence is the sum, not a fifth measure';

const ELEMENTS: readonly {
    readonly key: QuintessenceElementKey;
    readonly label: string;
    readonly color: string;
}[] = Object.freeze([
    Object.freeze({ key: 'fire', label: 'Fire', color: 'var(--theia-charts-red)' }),
    Object.freeze({ key: 'air', label: 'Air', color: 'var(--theia-charts-blue)' }),
    Object.freeze({ key: 'water', label: 'Water', color: 'var(--theia-charts-cyan)' }),
    Object.freeze({ key: 'earth', label: 'Earth', color: 'var(--theia-charts-orange)' })
]);

export function quintessenceIndicatorModelFromSurface(
    surface: M3ProjectionSurface
): QuintessenceIndicatorModel {
    const active = surface.activeProjection;
    const raw = objectValue(active.elementalQuintessence);
    const pendingFields: string[] = [];

    if (!raw) {
        pendingFields.push('surface.activeProjection.elementalQuintessence');
    }

    const elements = ELEMENTS.map(element => {
        const value = contributionValue(raw?.[element.key]);
        if (raw && value === null) {
            pendingFields.push(`surface.activeProjection.elementalQuintessence.${element.key}`);
        }
        return Object.freeze({
            key: element.key,
            label: element.label,
            value: value ?? 0,
            share: 0
        });
    });

    const akashaSum = elements.reduce((sum, element) => sum + element.value, 0);
    const withShares = elements.map(element =>
        Object.freeze({
            ...element,
            share: akashaSum > 0 ? element.value / akashaSum : 0
        })
    );
    const rotationIndex = numberValue(active.rotation);
    const rotationalStateCount = numberValue(active.rotationalStateCount);
    if (rotationIndex === null) {
        pendingFields.push('surface.activeProjection.rotation');
    }
    if (rotationalStateCount === null) {
        pendingFields.push('surface.activeProjection.rotationalStateCount');
    }

    return Object.freeze({
        ready: pendingFields.length === 0,
        pendingFields: Object.freeze(pendingFields),
        elements: Object.freeze(withShares),
        akashaSum,
        rotationIndex,
        rotationalStateCount,
        tctRotationalState:
            rotationIndex !== null && rotationalStateCount !== null
                ? `${rotationIndex}/${rotationalStateCount}`
                : 'pending'
    });
}

export const QuintessenceIndicator: React.FC<QuintessenceIndicatorProps> = ({
    surface,
    className
}) => {
    const profileTick = useM3ProfileTick();
    const inheritedReadiness = useM3Readiness();
    const model = React.useMemo(() => quintessenceIndicatorModelFromSurface(surface), [surface]);
    const classes = ['m3-quintessence-indicator', className].filter(Boolean).join(' ');

    return (
        <article
            className={classes}
            data-widget-id="pratibimba.m3-mahamaya:quintessence-indicator"
            data-ready={model.ready ? 'true' : 'false'}
            data-akasha-sum={fmt(model.akashaSum)}
            data-tct-rotational-state={model.tctRotationalState}
            data-profile-tick={profileTick.tick ?? 'pending'}
            data-context-readiness={inheritedReadiness.snapshot.state}
            title={TOOLTIP}
            aria-label={TOOLTIP}
            style={rootStyle}
        >
            <div style={akashaTrackStyle} aria-hidden="true">
                <div
                    data-akasha-overlay="emergent-sum"
                    style={{
                        ...akashaOverlayStyle,
                        opacity: model.akashaSum > 0 ? 0.32 : 0.12
                    }}
                />
            </div>
            <header style={headerStyle}>
                <div>
                    <h3 style={titleStyle}>Quintessence / Akasha</h3>
                    <p style={subtitleStyle}>{TOOLTIP}</p>
                </div>
                <ReadinessChip
                    bindingKey="surface.activeProjection.rotation"
                    state={model.ready ? 'ready' : 'pending'}
                    style={tctPillStyle}
                >
                    TCT {model.tctRotationalState}
                </ReadinessChip>
            </header>
            <div style={barsStyle}>
                {model.elements.map(element => (
                    <ElementBar key={element.key} element={element} />
                ))}
            </div>
            {!model.ready && (
                <ReadinessChip
                    bindingKey={model.pendingFields[0] ?? 'surface.activeProjection.elementalQuintessence'}
                    state="pending"
                    style={pendingStyle}
                >
                    {model.pendingFields.join('; ')}
                </ReadinessChip>
            )}
        </article>
    );
};

export default QuintessenceIndicator;

const ElementBar: React.FC<{
    readonly element: QuintessenceElementContribution;
}> = ({ element }) => {
    const color = ELEMENTS.find(candidate => candidate.key === element.key)?.color ?? 'currentColor';
    return (
        <div
            data-element-bar={element.key}
            data-element-value={fmt(element.value)}
            data-element-share={fmt(element.share)}
            style={barRowStyle}
        >
            <span style={barLabelStyle}>{element.label}</span>
            <span style={barTrackStyle}>
                <span
                    style={{
                        ...barFillStyle,
                        width: `${Math.round(element.share * 100)}%`,
                        background: color
                    }}
                />
            </span>
            <span style={barValueStyle}>{fmt(element.value)}</span>
        </div>
    );
};

function objectValue(value: unknown): Readonly<Record<string, unknown>> | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? (value as Readonly<Record<string, unknown>>)
        : null;
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function contributionValue(value: unknown): number | null {
    const parsed = numberValue(value);
    if (parsed === null) {
        return null;
    }
    return Math.max(0, parsed);
}

function fmt(value: number): string {
    if (Number.isInteger(value)) {
        return String(value);
    }
    return value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}

const rootStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 8,
    padding: '14px 12px 12px',
    background: 'var(--theia-editor-background)',
    color: 'var(--theia-foreground)'
};

const akashaTrackStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    background: 'var(--theia-editorWidget-background)'
};

const akashaOverlayStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    background: 'var(--theia-foreground)'
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 10
};

const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 'var(--theia-ui-font-size1)',
    fontWeight: 600
};

const subtitleStyle: React.CSSProperties = {
    margin: '3px 0 0',
    color: 'var(--theia-descriptionForeground)',
    fontSize: 'var(--theia-ui-font-size0)'
};

const tctPillStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 6,
    padding: '2px 6px',
    fontSize: 'var(--theia-ui-font-size0)',
    whiteSpace: 'nowrap'
};

const barsStyle: React.CSSProperties = {
    display: 'grid',
    gap: 6
};

const barRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '44px minmax(72px, 1fr) 40px',
    alignItems: 'center',
    gap: 8,
    minHeight: 18
};

const barLabelStyle: React.CSSProperties = {
    fontSize: 'var(--theia-ui-font-size0)'
};

const barTrackStyle: React.CSSProperties = {
    height: 8,
    borderRadius: 4,
    background: 'var(--theia-editorWidget-background)',
    overflow: 'hidden'
};

const barFillStyle: React.CSSProperties = {
    display: 'block',
    height: '100%',
    minWidth: 0
};

const barValueStyle: React.CSSProperties = {
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 'var(--theia-ui-font-size0)'
};

const pendingStyle: React.CSSProperties = {
    marginTop: 8,
    color: 'var(--theia-errorForeground)',
    fontSize: 'var(--theia-ui-font-size0)'
};
