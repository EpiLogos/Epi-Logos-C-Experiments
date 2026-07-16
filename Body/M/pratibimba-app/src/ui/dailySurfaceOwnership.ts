/**
 * Coordinate: M' M5-3' (daily surface ownership ledger — rerun 11.T11.3)
 * Residency: Body/M/pratibimba-app/src/ui
 * Position (#n): 0/1 daily shell carrier ownership
 * Actualises: an exhaustive disposition for every legacy daily widget claim:
 *   active receiver, superseding receiver, or explicit retirement.
 * Public surface: DAILY_SURFACE_OWNERSHIP, requireDailyReceiver,
 *   assertDailyReceiverBindings, activeDailyClaimsForReceiver.
 * Does NOT own: pane behavior, gateway methods, vault IO, or graph law.
 * Contract: [[M'-SYSTEM-SPEC]] + [[M'-PORTAL-SPEC]] + rerun 11.T11.3.
 */

export type DailySurfaceClaimId =
    | 'pratibimba.daily.journal'
    | 'pratibimba.daily.agent-checkin'
    | 'pratibimba.daily.cymatic-placeholder'
    | 'pratibimba.daily.status-display'
    | 'pratibimba.daily.library-projection'
    | 'pratibimba.daily.atelier-cluster-lens';

export type DailySurfaceReceiver =
    | 'journalTimeline'
    | 'cosmic'
    | 'statusStrip'
    | 'fileTree'
    | 'bimbaGraph';

export interface DailySurfaceOwnership {
    readonly claimId: DailySurfaceClaimId;
    readonly disposition: 'active' | 'superseded' | 'retired';
    readonly receiver: DailySurfaceReceiver | null;
    readonly owner: string | null;
    readonly canonicalClaimId: string | null;
    readonly successorReceivers: readonly string[];
    readonly evidence: string;
}

export const DAILY_SURFACE_OWNERSHIP: Readonly<Record<DailySurfaceClaimId, DailySurfaceOwnership>> =
    Object.freeze({
        'pratibimba.daily.journal': Object.freeze({
            claimId: 'pratibimba.daily.journal',
            disposition: 'active',
            receiver: 'journalTimeline',
            owner: "M4' Nara",
            canonicalClaimId: 'pratibimba.daily.journal',
            successorReceivers: Object.freeze([]),
            evidence: 'JournalTimelinePane reads Empty/Present through vault_list and opens real files through vault.open.'
        }),
        'pratibimba.daily.agent-checkin': Object.freeze({
            claimId: 'pratibimba.daily.agent-checkin',
            disposition: 'retired',
            receiver: null,
            owner: null,
            canonicalClaimId: null,
            successorReceivers: Object.freeze(['omniChat', 'omniLogs']),
            evidence: 'The frozen widget promised an active-run snapshot and inspect control. The active carrier has real Pi dispatch chips and gateway event logs, but no equivalent active-run snapshot receiver; the stronger widget claim is therefore retired rather than faked.'
        }),
        'pratibimba.daily.cymatic-placeholder': Object.freeze({
            claimId: 'pratibimba.daily.cymatic-placeholder',
            disposition: 'superseded',
            receiver: 'cosmic',
            owner: "M1'/M2'/M3' integrated cosmic engine",
            canonicalClaimId: 'pratibimba.daily.cymatic-engine',
            successorReceivers: Object.freeze([]),
            evidence: 'CosmicEngine consumes the live profile and renders the real torus-pinned cymatic carrier; a placeholder claim would understate the receiver.'
        }),
        'pratibimba.daily.status-display': Object.freeze({
            claimId: 'pratibimba.daily.status-display',
            disposition: 'active',
            receiver: 'statusStrip',
            owner: "M' / membrane chrome",
            canonicalClaimId: 'pratibimba.daily.status-display',
            successorReceivers: Object.freeze([]),
            evidence: 'StatusStrip reads the six live state threads once and remains mounted across both faces.'
        }),
        'pratibimba.daily.library-projection': Object.freeze({
            claimId: 'pratibimba.daily.library-projection',
            disposition: 'active',
            receiver: 'fileTree',
            owner: "M5-0' Library lens",
            canonicalClaimId: 'pratibimba.daily.library-projection',
            successorReceivers: Object.freeze([]),
            evidence: 'FileTreePane overlays each loaded vault file with a coordinate-ancestry shelf parsed from its real YAML frontmatter.'
        }),
        'pratibimba.daily.atelier-cluster-lens': Object.freeze({
            claimId: 'pratibimba.daily.atelier-cluster-lens',
            disposition: 'active',
            receiver: 'bimbaGraph',
            owner: "M5-5' Logos Atelier lens over M0'",
            canonicalClaimId: 'pratibimba.daily.atelier-cluster-lens',
            successorReceivers: Object.freeze([]),
            evidence: 'GraphExplorerPane derives connected etymological/cognate components from real S2 relations and applies their cluster colours inside the existing graph host.'
        })
    });

export function requireDailyReceiver(claimId: DailySurfaceClaimId): DailySurfaceReceiver {
    const ownership = DAILY_SURFACE_OWNERSHIP[claimId];
    if (!ownership.receiver) {
        throw new Error(`daily surface claim '${claimId}' is ${ownership.disposition} and has no active receiver`);
    }
    return ownership.receiver;
}

export function assertDailyReceiverBindings(
    bindings: Readonly<Partial<Record<DailySurfaceClaimId, DailySurfaceReceiver>>>
): void {
    for (const [claimId, receiver] of Object.entries(bindings) as [
        DailySurfaceClaimId,
        DailySurfaceReceiver
    ][]) {
        const expected = requireDailyReceiver(claimId);
        if (receiver !== expected) {
            throw new Error(
                `daily surface claim '${claimId}' is bound to '${receiver}', expected '${expected}'`
            );
        }
    }
}

export function activeDailyClaimsForReceiver(receiver: DailySurfaceReceiver): readonly DailySurfaceClaimId[] {
    return Object.values(DAILY_SURFACE_OWNERSHIP)
        .filter(ownership => ownership.receiver === receiver && ownership.disposition !== 'retired')
        .map(ownership => ownership.claimId);
}
