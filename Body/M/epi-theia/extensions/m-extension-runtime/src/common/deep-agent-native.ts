import {
    DEEP_FOCUS_ACTION,
    DEEP_OPEN_ACTION,
    DEEP_RETURN_ACTION,
    DeepActionRef,
    DeepParentAnchor,
    DeepProductId
} from './deep-products';

/**
 * Human and Agent projections share these semantic invariants.
 * Presentation mechanics may differ; subject identity and native Actions may not.
 */
export interface DeepAgentNativeProtocol {
    readonly canonicalActions: readonly DeepActionRef[];
    readonly semanticAnchor: 'parent-event-or-subject-plus-MCoordinateRef';
    readonly humanProjection: 'native-surface';
    readonly agentProjection: 'structured-native-action';
    readonly domScrapingRequired: false;
    readonly selectionConfersDisclosure: false;
    readonly hostMayMintSemanticSubject: false;
    readonly readinessAndProvenanceShared: true;
    readonly returnPreservesParentRelation: true;
}

export const DEEP_AGENT_NATIVE_PROTOCOL: DeepAgentNativeProtocol = Object.freeze({
    canonicalActions: Object.freeze([
        DEEP_OPEN_ACTION,
        DEEP_FOCUS_ACTION,
        DEEP_RETURN_ACTION
    ]),
    semanticAnchor: 'parent-event-or-subject-plus-MCoordinateRef',
    humanProjection: 'native-surface',
    agentProjection: 'structured-native-action',
    domScrapingRequired: false,
    selectionConfersDisclosure: false,
    hostMayMintSemanticSubject: false,
    readinessAndProvenanceShared: true,
    returnPreservesParentRelation: true
});

export interface DeepAgentAddress {
    readonly productId: DeepProductId;
    readonly anchor: DeepParentAnchor;
    readonly actionRef: DeepActionRef;
}

export function addressDeepProductForAgent(
    productId: DeepProductId,
    anchor: DeepParentAnchor,
    actionRef: DeepActionRef
): DeepAgentAddress {
    return { productId, anchor, actionRef };
}
