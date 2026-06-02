/**
 * @pratibimba/agentic-control-room — common barrel.
 *
 * Track 05 T8: full Agentic Run/Review/Autoresearch E2E flow.
 *
 * Common-only exports so the barrel is safe to import from Node test
 * context without pulling in Theia browser deps.
 */

export * from './run-model';
export * from './parity';

export const EXTENSION_ID = 'agentic-control-room' as const;

/** Widget IDs surfaced by this extension. */
export const ACR_WIDGET_IDS = {
    RUN_TREE: 'pratibimba.acr.run-tree',
    TOOL_STREAM: 'pratibimba.acr.tool-stream',
    DIAGNOSTICS: 'pratibimba.acr.diagnostics',
    EVIDENCE_DEPOSITION: 'pratibimba.acr.evidence-deposition',
    REVIEW_DECISION: 'pratibimba.acr.review-decision'
} as const;
