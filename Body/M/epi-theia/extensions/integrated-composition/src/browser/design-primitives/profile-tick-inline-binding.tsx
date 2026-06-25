import * as React from 'react';
import type { CompositionProfileTickEvent } from '../../common/profile-tick-subscription';
import { useCompositionProfileTick } from '../composition-profile-context';
import { BlockedOverlay } from './blocked-overlay';
import { PendingBadge } from './pending-badge';
import { ProvenanceBorder, type ProvenanceBorderState } from './provenance-border';
import {
    ReadinessSnapshotLike,
    ReadinessSubscriptionSource,
    readinessCssVar,
    readinessIdOf,
    readinessIdTokenPath,
    readinessSeverityOf,
    useReadinessSnapshot
} from './readiness-state-grammar';

export interface ProfileTickInlineBindingProps {
    readonly bindingKey: string;
    readonly label: string;
    readonly value?: string | number | boolean | null;
    readonly children: React.ReactNode;
    readonly className?: string;
    readonly readiness?: ReadinessSnapshotLike;
    readonly bridge?: ReadinessSubscriptionSource | null;
    readonly profileTick?: CompositionProfileTickEvent | null;
}

export const ProfileTickInlineBinding: React.FC<ProfileTickInlineBindingProps> = ({
    bindingKey,
    label,
    value,
    children,
    className,
    readiness,
    bridge,
    profileTick
}) => {
    const contextTick = useCompositionProfileTick();
    const tick = profileTick ?? contextTick;
    const snapshot = useReadinessSnapshot(readiness, bridge);
    const readinessId = readinessIdOf(snapshot);
    const severity = readinessSeverityOf(snapshot);
    const provenanceState = provenanceStateFromSeverity(severity);
    const readinessColour = readinessCssVar(readinessId);
    const rootClassName = className
        ? `epilogos-profile-tick-inline-binding ${className}`
        : 'epilogos-profile-tick-inline-binding';
    const bindingValue = value === undefined ? textValue(children) : String(value ?? '');

    return (
        <ProvenanceBorder
            state={provenanceState}
            label={`${label}: ${readinessId}`}
            className={rootClassName}
            borderColour={readinessColour}
        >
            <div
                className="epilogos-profile-tick-inline-binding__datum"
                data-binding-key={bindingKey}
                data-binding-value={bindingValue}
                data-profile-generation={tick?.generation ?? 'pending'}
                data-profile-tick12={tick?.tick12 ?? 'pending'}
                data-profile-position6={tick?.position6 ?? 'pending'}
                data-readiness-id={readinessId}
                data-readiness-severity={severity}
                data-readiness-token={readinessIdTokenPath(readinessId)}
                data-provenance-state={provenanceState}
                style={{
                    position: 'relative',
                    display: 'inline-grid',
                    gap: '0.35rem',
                    minWidth: 0,
                    color: 'inherit'
                }}
            >
                <span>{children}</span>
                {severity === 'ready' ? null : (
                    <PendingBadge readiness={snapshot} pendingId={readinessId} />
                )}
                {severity === 'blocked' ? (
                    <BlockedOverlay readiness={snapshot} />
                ) : null}
            </div>
        </ProvenanceBorder>
    );
};

function provenanceStateFromSeverity(severity: ReturnType<typeof readinessSeverityOf>): ProvenanceBorderState {
    switch (severity) {
        case 'ready':
            return 'ready';
        case 'blocked':
            return 'blocked';
        case 'degraded':
            return 'pending';
    }
}

function textValue(node: React.ReactNode): string {
    if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
        return String(node);
    }
    return '';
}
