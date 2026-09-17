import * as React from 'react';
import {
    FamilyArchetype,
    FamilyLetter,
    ReadinessSnapshotLike,
    ReadinessSubscriptionSource,
    familyCssVar,
    familyTokenPath,
    normalizedTick12,
    readinessCssVar,
    readinessIdOf,
    readinessIdTokenPath,
    tick12FromProfile,
    useReadinessSnapshot
} from './readiness-state-grammar';

export interface LoadingPulseProps {
    readonly label: string;
    readonly className?: string;
    readonly readiness?: ReadinessSnapshotLike;
    readonly bridge?: ReadinessSubscriptionSource | null;
    readonly tick12?: number | null;
    readonly familyLetter?: FamilyLetter;
    readonly archetype?: FamilyArchetype;
}

export const LoadingPulse: React.FC<LoadingPulseProps> = ({
    label,
    className,
    readiness,
    bridge,
    tick12,
    familyLetter = 'm',
    archetype = 0
}) => {
    const snapshot = useReadinessSnapshot(readiness, bridge);
    const readinessId = readinessIdOf(snapshot);
    const bridgeAvailable = readinessId !== 'bridge_unavailable' && snapshot.bridgeReachable;
    const profileTick = normalizedTick12(tick12 ?? null) ??
        tick12FromProfile(bridge?.currentSnapshot?.().profile ?? null);
    const pulseSource = bridgeAvailable ? 'profile_tick' : 'local_timer';
    const opacity = bridgeAvailable && profileTick !== null && profileTick % 2 === 1 ? 1 : 0.5;
    const tint = familyCssVar(familyLetter, archetype);

    return (
        <span
            className={className ? `epilogos-loading-pulse ${className}` : 'epilogos-loading-pulse'}
            role="status"
            aria-label={label}
            data-loading-state="loading"
            data-readiness-id={readinessId}
            data-readiness-token={readinessIdTokenPath(readinessId)}
            data-family-token={familyTokenPath(familyLetter, archetype)}
            data-pulse-source={pulseSource}
            data-tick12={profileTick ?? 'pending'}
            {...(pulseSource === 'local_timer' ? { 'data-local-period-ms': 200 } : {})}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--theia-descriptionForeground)'
            }}
        >
            <span
                aria-hidden="true"
                style={{
                    width: '0.65rem',
                    height: '0.65rem',
                    borderRadius: '50%',
                    background: readinessCssVar(readinessId),
                    boxShadow: `0 0 0 0.2rem color-mix(in srgb, ${tint} 14%, transparent)`,
                    opacity,
                    animation: pulseSource === 'local_timer'
                        ? 'epilogos-loading-pulse-local 200ms ease-in-out infinite alternate'
                        : undefined
                }}
            />
            {label}
        </span>
    );
};
