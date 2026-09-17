import * as React from 'react';
import type {
    MExtensionReadinessSnapshot,
    MExtensionReadinessState
} from '@pratibimba/m-extension-runtime';
import type { M2PrimeMeaningPacket, M2ProvenanceHandle } from '../../common/meaning-packet';

export type ProvenanceReadinessVariant =
    | 'ready_public_current'
    | 'degraded_public_readonly'
    | 'profile_missing_field'
    | 's2_graph_blocked'
    | 's3_subscription_blocked'
    | 'bridge_unavailable'
    | 's5_review_blocked'
    | 'm4_privacy_blocked'
    | 'privacy_blocked';

export type ProvenanceTone = 'green' | 'amber' | 'red' | 'blue';
export type ProvenanceFill = 'solid' | 'outline' | 'soft';

export interface ProvenanceBadgeDescriptor {
    readonly variant: ProvenanceReadinessVariant;
    readonly tone: ProvenanceTone;
    readonly fill: ProvenanceFill;
    readonly label: string;
}

export interface ProvenanceBadgeProps {
    readonly provenance: M2ProvenanceHandle;
    readonly readiness: ProvenanceReadinessVariant | MExtensionReadinessState | MExtensionReadinessSnapshot;
    readonly field?: string;
    readonly label?: string;
    readonly compact?: boolean;
    readonly className?: string;
}

export const PROVENANCE_READINESS_VARIANTS: readonly ProvenanceReadinessVariant[] = Object.freeze([
    'ready_public_current',
    'degraded_public_readonly',
    'profile_missing_field',
    's2_graph_blocked',
    's3_subscription_blocked',
    'bridge_unavailable',
    's5_review_blocked',
    'm4_privacy_blocked',
    'privacy_blocked'
]);

export const LAYER_B_CARD_PROVENANCE_FIELDS: readonly string[] = Object.freeze([
    'decanFaceFrame',
    'sacredSonicFrame.shemPair',
    'sacredSonicFrame.maqamMode',
    'sacredSonicFrame.mantra',
    'sacredSonicFrame.asma',
    'planetaryChakralFrame',
    'elementalFrame.alchemicalTattvicRow'
]);

export const M2_BREADCRUMB_PROVENANCE_FIELDS: readonly string[] = Object.freeze([
    'profile.resonance72',
    'addressViews.halfDecan',
    's2.decanFace',
    'planetaryChakralFrame.rulingPlanet',
    'planetaryChakralFrame.chakra',
    's3.kerykeion.body-zone'
]);

export const M2_GRID_CELL_TOOLTIP_PROVENANCE_FIELD = 'addressViews.mef.gridCellTooltip';
export const M2_TREE_LEAF_PROVENANCE_FIELD = 's2.correspondenceTree.treeLeaf';
export const M2_CHI_SURFACE_PLANET_HALO_PROVENANCE_FIELD = 'planetaryChakralFrame.chiSurface.rulingPlanetHalo';

export function ProvenanceBadge(props: ProvenanceBadgeProps): React.ReactElement {
    const descriptor = provenanceBadgeDescriptor(props.readiness);
    const className = [
        'm2-provenance-badge',
        `m2-provenance-badge--${descriptor.variant}`,
        `m2-provenance-badge--${descriptor.tone}`,
        `m2-provenance-badge--${descriptor.fill}`,
        props.compact ? 'm2-provenance-badge--compact' : null,
        props.className
    ].filter(Boolean).join(' ');
    const text = props.label ?? descriptor.label;
    const field = props.field ?? '';

    return (
        <span
            className={className}
            title={`${field || 'provenance'}: ${props.provenance.handle}`}
            data-provenance-badge
            data-provenance-field={field}
            data-provenance-handle={props.provenance.handle}
            data-provenance-source={props.provenance.source}
            data-provenance-body-allowed={props.provenance.bodyAllowed ? 'true' : 'false'}
            data-readiness-variant={descriptor.variant}
            data-readiness-tone={descriptor.tone}
            data-readiness-fill={descriptor.fill}
            aria-label={`${text} provenance ${props.provenance.handle}`}
        >
            <span className="m2-provenance-badge__dot" aria-hidden="true" />
            <span className="m2-provenance-badge__label">{text}</span>
        </span>
    );
}

export function LayerBCardProvenanceBadges(props: {
    readonly packet: Pick<M2PrimeMeaningPacket, 'meaningPacketProvenanceFor'>;
    readonly readiness: ProvenanceBadgeProps['readiness'];
}): React.ReactElement {
    return (
        <span className="m2-layer-b-provenance-badges" data-layer-b-provenance-badges>
            {LAYER_B_CARD_PROVENANCE_FIELDS.map(field => (
                <ProvenanceBadge
                    key={field}
                    field={field}
                    label={fieldLabel(field)}
                    readiness={props.readiness}
                    provenance={props.packet.meaningPacketProvenanceFor(field)}
                    compact
                />
            ))}
        </span>
    );
}

export function readinessVariantFrom(
    readiness: ProvenanceBadgeProps['readiness']
): ProvenanceReadinessVariant {
    if (typeof readiness === 'string') {
        return readinessStateToVariant(readiness);
    }
    if (readiness.state === 'privacy_blocked' && readiness.privacyClass === 'protected_local') {
        return 'm4_privacy_blocked';
    }
    return readinessStateToVariant(readiness.state);
}

export function provenanceBadgeDescriptor(
    readiness: ProvenanceBadgeProps['readiness']
): ProvenanceBadgeDescriptor {
    const variant = readinessVariantFrom(readiness);
    switch (variant) {
        case 'ready_public_current':
            return Object.freeze({ variant, tone: 'green', fill: 'solid', label: 'ready' });
        case 'degraded_public_readonly':
            return Object.freeze({ variant, tone: 'green', fill: 'outline', label: 'read-only' });
        case 'profile_missing_field':
            return Object.freeze({ variant, tone: 'amber', fill: 'soft', label: 'profile gap' });
        case 's2_graph_blocked':
            return Object.freeze({ variant, tone: 'amber', fill: 'soft', label: 'S2 pending' });
        case 's3_subscription_blocked':
            return Object.freeze({ variant, tone: 'amber', fill: 'soft', label: 'S3 pending' });
        case 'bridge_unavailable':
            return Object.freeze({ variant, tone: 'red', fill: 'solid', label: 'bridge down' });
        case 's5_review_blocked':
            return Object.freeze({ variant, tone: 'red', fill: 'soft', label: 'S5 review' });
        case 'm4_privacy_blocked':
            return Object.freeze({ variant, tone: 'blue', fill: 'solid', label: 'M4 protected' });
        case 'privacy_blocked':
            return Object.freeze({ variant, tone: 'blue', fill: 'soft', label: 'privacy' });
    }
}

function readinessStateToVariant(
    state: ProvenanceReadinessVariant | MExtensionReadinessState
): ProvenanceReadinessVariant {
    switch (state) {
        case 'degraded_but_readable':
            return 'degraded_public_readonly';
        case 'authority_payload_missing':
            return 's2_graph_blocked';
        default:
            return state;
    }
}

function fieldLabel(field: string): string {
    const last = field.split('.').filter(Boolean).pop() ?? field;
    return last.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/-/g, ' ');
}

export default ProvenanceBadge;
