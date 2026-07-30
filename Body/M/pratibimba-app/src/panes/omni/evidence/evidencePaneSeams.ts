/**
 * Coordinate: M' M5' chrome (Evidence-pane substrate seams — rerun 28.T28.8)
 * Residency: Body/M/pratibimba-app/src/panes/omni/evidence
 * Position (#n): #1 — Definition: what the 28.8 spec NAMES, held against what
 *   the substrate really registers, so the surface can never claim a seam it
 *   does not have.
 * Actualises: the bindings map for tranche 28.8. Every gateway method, intent
 *   route, and cross-layout target the spec's six deliverables name is declared
 *   here with `available` decided by the real tree — the same discipline
 *   `panes/atelier/atelierSeams.ts` (28.7) and `panes/acr/acrGovernance.ts`
 *   (28.5) established. An unavailable seam renders its affordance DISABLED
 *   with the method/target name and the reason ON the surface; the sibling
 *   suite probes `Body/S` and the live target ledger, so every claim here goes
 *   RED the day the missing arm or row lands.
 *
 *   THE ONE REAL ABSENCE this tranche found: 28.8 (e) asks the axiom-translation
 *   link to emit `CrossLayoutIntent { requestedExtensionId: 'ide-shell-m0-m5',
 *   requestedContributionId: 'axiom-translation-inspector' }`. The inspector IS
 *   mounted (CHROME-CONTRACT §2 `piAxiomTranslation`, cosmic deep model) but NO
 *   row of `CROSS_LAYOUT_INTENT_TARGETS` resolves to that component — the exact
 *   gap 28.T28.7 already recorded from the Atelier side. Minting a target id is
 *   a public-surface change owned by the Architect and by 28.T28.14, so this
 *   surface names the missing target rather than inventing one.
 *
 *   THE ONE CORRECTION: 28.8 (f) names `m5-epii` /
 *   `contemplation-object-viewer`. The carrier registers
 *   `m5-epii/contemplationObject` and mounts `ContemplationObjectViewer` inside
 *   the Review fold (`panes/omni/ReviewBlocksPane.tsx`), and the inbound route
 *   `m5-epii/contemplation-object-viewer.open` already lands on the Evidence
 *   fold. So the close-path exists under the carrier's own names; only the
 *   contribution id differs, and the register says so instead of silently
 *   substituting.
 * Public surface: EvidencePaneSeamKind, EvidencePaneSeam, EVIDENCE_PANE_SEAMS,
 *   evidencePaneSeam, EVIDENCE_AXIOM_INSPECTOR_TARGET,
 *   EVIDENCE_DEEP_RENDER_SURFACE.
 * Does NOT own: the intent ledger (`commands/crossLayoutIntent.ts`), the fold
 *   routing table (`panes/omni/omnipanelIntentRouter.ts`), the deposit contract
 *   (S5' `epii-agent-core`), the packet schema (`panes/omni/evidenceShapes.ts`).
 * Contract: [[CHROME-CONTRACT]] §2 (`omniEvidence`, `agenticControlRoom`) + §5
 *   ([[DR-WC-IS-1]] / [[DR-WC-IS-2]]) · rerun tranche [[28.T28.8]].
 */

/** 28.8 (e) — the contribution id the spec names for the axiom inspector. */
export const EVIDENCE_AXIOM_INSPECTOR_TARGET = Object.freeze({
    requestedExtensionId: 'ide-shell-m0-m5',
    requestedContributionId: 'axiom-translation-inspector'
});

/**
 * DR-WC-IS-2's deep half in this carrier. The frozen tree had two evidence
 * widgets (an ide-shell pane and an OmniPanel tab); the carrier has ONE evidence
 * fold plus the governance-primary deep pane §5 names, so the FULL render lands
 * inside `agenticControlRoom` (`ide-deep`, personal face) and the `/` fold keeps
 * the abbreviated one.
 */
export const EVIDENCE_DEEP_RENDER_SURFACE = 'agenticControlRoom';

export type EvidencePaneSeamKind = 'gateway-method' | 'intent-route' | 'intent-target';

export interface EvidencePaneSeam {
    /** Which 28.8 deliverable named it. */
    readonly deliverable: string;
    readonly kind: EvidencePaneSeamKind;
    /** The name the spec used — method, route key, or `extension/contribution`. */
    readonly name: string;
    /** The name the CARRIER really registers, when it differs. */
    readonly carrierName: string | null;
    /** True only when the substrate really dispatches/resolves it. */
    readonly available: boolean;
    /** What the spec expected it to do. */
    readonly expected: string;
    /** What it really is, and why a gap is disclosed rather than filled here. */
    readonly reason: string;
}

export const EVIDENCE_PANE_SEAMS: readonly EvidencePaneSeam[] = Object.freeze([
    Object.freeze({
        deliverable: '28.8 (a) — MediatedRunEvidencePacket feed',
        kind: 'gateway-method' as const,
        name: "s5'.epii.deposit.list",
        carrierName: null,
        available: true,
        expected: 'the anchored deposits a packet is composed from',
        reason:
            "registered at S5' (`Body/S/S5/epii-agent-core/src/s5_handlers/mod.rs`) and read by the "
            + 'fold; a deposit WITHOUT `evidenceAnchors` yields no packet, because a packet with '
            + 'blank anchors would assert a claim nobody made.'
    }),
    Object.freeze({
        deliverable: '28.8 (a) — deposition write path',
        kind: 'gateway-method' as const,
        name: "s5'.epii.deposit",
        carrierName: null,
        available: true,
        expected: 'file a MediatedRunEvidencePacket claim against a review item',
        reason:
            "registered at S5' and already ridden by `EvidenceDepositForm`; the deep render composes "
            + 'that ONE form rather than growing a second writer of the same contract.'
    }),
    Object.freeze({
        deliverable: '28.8 (b/c) — IOD-17 three-face readout on the packet',
        kind: 'gateway-method' as const,
        name: "s4'.mediation.capabilities.list",
        carrierName: null,
        available: true,
        expected: 'the capability-matrix face of the IOD-17 parity gate',
        reason:
            'the live S4 projection is the FIRST of the three faces (DR-WC-IS-1 makes the ACR its '
            + 'source of truth, so this pane consumes `acrGovernance.computeIod17Parity` rather than '
            + 'restating the law). Until it answers, NO parity landing is emitted at all — a readout '
            + 'built from an unloaded matrix would render a red violation that is really a spinner.'
    }),
    Object.freeze({
        deliverable: '28.8 (d) — tool-stream cross-link',
        kind: 'intent-route' as const,
        name: 'omnipanel-shell/tool-stream.open-evidence',
        carrierName: null,
        available: true,
        expected: 'activate the Tool Stream fold carrying THIS record id',
        reason:
            'the 27.9 routing table carries both directions (`tool-stream.open-evidence` and the '
            + 'Evidence fold’s own activation of `tool-stream`), so the same record identity '
            + 'survives the hop in either direction (15.11).'
    }),
    Object.freeze({
        deliverable: '28.8 (e) — axiom-translation link (26.14)',
        kind: 'intent-target' as const,
        name: 'ide-shell-m0-m5/axiom-translation-inspector',
        carrierName: null,
        available: false,
        expected:
            'a cross-layout route from the packet’s axiom-translation steps into the '
            + 'PiAxiomTranslationInspector',
        reason:
            'the inspector is mounted (CHROME-CONTRACT §2 `piAxiomTranslation`, cosmic deep model) '
            + 'but NO row of CROSS_LAYOUT_INTENT_TARGETS resolves to that component — `intentTarget` '
            + 'answers null for this pair — so there is no envelope to dispatch. 28.T28.7 recorded '
            + 'the identical gap from the Atelier side. Minting a target id is a public-surface '
            + 'change owned by the Architect and by 28.T28.14 (the intent-completion ledger), so the '
            + 'affordance renders DISABLED and names the missing target instead of inventing one. '
            + 'Compounding it: no producer emits DR-B-2 translation steps onto any wire, so '
            + '`axiomTranslationSteps` is empty for every real packet today.'
    }),
    Object.freeze({
        deliverable: '28.8 (f) — contemplation-object link (19.7)',
        kind: 'intent-target' as const,
        name: 'm5-epii/contemplation-object-viewer',
        carrierName: 'm5-epii/contemplationObject',
        available: true,
        expected: 'open the ContemplationObjectViewer on this run’s contemplation object',
        reason:
            'the carrier registers the target as `m5-epii/contemplationObject` and mounts '
            + '`ContemplationObjectViewer` INSIDE the Review fold (`ReviewBlocksPane`), which is '
            + 'therefore where the close-path lands (15.2 — the fold IS the surface, no modal). The '
            + 'inbound sibling route `m5-epii/contemplation-object-viewer.open` already resolves to '
            + 'the Evidence fold, so the pair is bidirectional under the carrier’s own names.'
    }),
    Object.freeze({
        deliverable: '28.8 DR-WC-IS-2 — click-through to the deep render',
        kind: 'intent-target' as const,
        name: `ide-shell-m0-m5/evidence-panel → ${EVIDENCE_DEEP_RENDER_SURFACE}`,
        carrierName: 'ide-shell-m0-m5/evidence-panel → omniEvidence',
        available: false,
        expected:
            'a cross-layout route that crosses INTO `ide-deep` and lands on the full governance '
            + 'render of the selected record',
        reason:
            'the `evidence-panel` target exists but resolves to `omniEvidence` with '
            + '`preferredLayout: null`, and `DEPTH_DIFFERENTIATED_COMPONENTS` licenses only four '
            + 'components to promote an intent into `ide-deep` — `agenticControlRoom` is not among '
            + 'them (52.T3). Promoting it is a public-surface change owned by 28.T28.14, so the '
            + 'click-through button is DISABLED with the reason. The RECORD IDENTITY still crosses: '
            + 'both folds read `perTabState.evidence.selectedPacketId`, so a packet selected in '
            + 'either surface is the one the other renders — DR-WC-IS-2’s bidirectional '
            + 'highlight, on the seam this carrier actually has.'
    })
]);

/** The seam covering a spec name, if the register discloses one. */
export function evidencePaneSeam(name: string): EvidencePaneSeam | null {
    return (
        EVIDENCE_PANE_SEAMS.find(seam => seam.name === name || seam.carrierName === name) ?? null
    );
}
