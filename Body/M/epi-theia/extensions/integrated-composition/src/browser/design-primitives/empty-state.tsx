import * as React from 'react';
import {
    FamilyArchetype,
    FamilyLetter,
    ReadinessSnapshotLike,
    ReadinessSubscriptionSource,
    familyCssVar,
    familyTokenPath,
    readinessIdOf,
    readinessIdTokenPath,
    useReadinessSnapshot
} from './readiness-state-grammar';

export interface EmptyStateProps {
    readonly title: string;
    readonly detail?: string;
    readonly hint?: string;
    readonly action?: React.ReactNode;
    readonly className?: string;
    readonly readiness?: ReadinessSnapshotLike;
    readonly bridge?: ReadinessSubscriptionSource | null;
    readonly familyLetter?: FamilyLetter;
    readonly archetype?: FamilyArchetype;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    detail,
    hint,
    action,
    className,
    readiness,
    bridge,
    familyLetter = 'm',
    archetype = 0
}) => {
    const snapshot = useReadinessSnapshot(readiness, bridge);
    const readinessId = readinessIdOf(snapshot);
    const familyToken = familyTokenPath(familyLetter, archetype);
    const tint = familyCssVar(familyLetter, archetype);
    const body = hint ?? detail;

    return (
        <section
            className={className ? `epilogos-empty-state ${className}` : 'epilogos-empty-state'}
            aria-label={title}
            data-readiness-id={readinessId}
            data-readiness-token={readinessIdTokenPath(readinessId)}
            data-family-token={familyToken}
            data-typography-token="epilogos.typography.body.base"
            data-spacing-token="epilogos.spacing.composition.surface.margin"
            style={{
                display: 'grid',
                gridTemplateColumns: 'auto minmax(0, 1fr)',
                gap: '0.75rem',
                alignItems: 'center',
                alignContent: 'center',
                minHeight: '8rem',
                padding: 'var(--epilogos-spacing-composition-surface-margin, 1rem)',
                color: 'var(--theia-descriptionForeground)'
            }}
        >
            <span
                aria-hidden="true"
                className="epilogos-empty-state-illustration"
                style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '50%',
                    border: `1px solid ${tint}`,
                    background: `color-mix(in srgb, ${tint} 18%, transparent)`,
                    boxShadow: `inset 0 0 0 0.35rem color-mix(in srgb, ${tint} 10%, transparent)`
                }}
            />
            <span style={{ display: 'grid', gap: '0.35rem' }}>
                <strong style={{ color: 'var(--theia-foreground)', fontSize: 'var(--theia-ui-font-size1)' }}>
                    {title}
                </strong>
                {body && (
                    <span
                        style={{
                            fontSize: 'var(--epilogos-typography-body-base-size, var(--theia-ui-font-size1))',
                            fontFamily: 'var(--theia-ui-font-family)'
                        }}
                    >
                        {body}
                    </span>
                )}
                {action}
            </span>
        </section>
    );
};
