import * as React from 'react';
import {
    blockersForBinding,
    readinessStateForBinding,
    useM3Readiness
} from '../context/M3ReadinessContext';
import type { M3InlineReadinessState } from '../context/M3ReadinessContext';

export interface ReadinessChipProps {
    readonly bindingKey: string;
    readonly label?: string;
    readonly state?: M3InlineReadinessState;
    readonly className?: string;
    readonly style?: React.CSSProperties;
    readonly children?: React.ReactNode;
}

const STATE_STYLE: Readonly<Record<M3InlineReadinessState, React.CSSProperties>> = {
    ready: {
        borderColor: 'var(--theia-charts-green)',
        color: 'var(--theia-charts-green)'
    },
    pending: {
        borderColor: 'var(--theia-charts-yellow)',
        color: 'var(--theia-charts-yellow)'
    },
    blocked: {
        borderColor: 'var(--theia-errorForeground)',
        color: 'var(--theia-errorForeground)'
    }
};

export const ReadinessChip: React.FC<ReadinessChipProps> = ({
    bindingKey,
    label,
    state,
    className,
    style,
    children
}) => {
    const readiness = useM3Readiness();
    const resolvedState = state ?? readinessStateForBinding(readiness, bindingKey);
    const blockers = blockersForBinding(readiness, bindingKey);
    const tooltip = blockers.join(' | ') || `${bindingKey}: ${resolvedState}`;
    return (
        <span
            className={['m3-readiness-chip', `m3-readiness-chip-${resolvedState}`, className]
                .filter(Boolean)
                .join(' ')}
            data-readiness-binding={bindingKey}
            data-readiness-state={resolvedState}
            title={tooltip}
            style={{
                ...chipStyle,
                ...STATE_STYLE[resolvedState],
                ...style
            }}
        >
            {label && <span data-readiness-label>{label}</span>}
            {children}
            <span data-pending-badge="true">{resolvedState}</span>
            {resolvedState === 'blocked' && (
                <span data-blocked-overlay="true" aria-label={tooltip} style={blockedOverlayStyle}>
                    blocked
                </span>
            )}
        </span>
    );
};

export default ReadinessChip;

const chipStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    border: '1px solid',
    borderRadius: 999,
    padding: '2px 8px',
    fontSize: 'var(--theia-ui-font-size0)',
    lineHeight: 1.4,
    background: 'var(--theia-editorWidget-background)',
    whiteSpace: 'nowrap'
};

const blockedOverlayStyle: React.CSSProperties = {
    borderLeft: '1px solid currentColor',
    paddingLeft: 6,
    fontWeight: 600
};
