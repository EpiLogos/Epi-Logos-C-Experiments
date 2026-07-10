/**
 * Coordinate: M' M4' (deposit-handle reception — Track 08.T8.2)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the M2 → M4 deposit-handle handoff verifier — receives an
 *   F_routing trace (Tranche 03.2/03.8 emitter: `deposit_handle` =
 *   `m4.deposit://nara-journal/…` with `deposit_handle_privacy_class`) and
 *   produces the Nara-journal deposit intent. PRIVACY IS THE LAW AT HANDOFF:
 *   the handle's class is `protected_local_handle_only`, so reception REFUSES
 *   (a) any handle whose privacy class is not exactly that value, (b) any
 *   handle arriving over the PUBLIC profile bus (`publicBus: true` origin) —
 *   which is why the live wire correctly carries no depositHandle today; the
 *   protected transport (M4 personal session path, Track 10.M4/12) delivers
 *   the trace, and this verifier is what it must pass through.
 * Does NOT own: the emitter (portal-core f_routing.rs), the protected
 *   transport, the vault write (journal store owns persistence).
 */

export const DEPOSIT_HANDLE_PRIVACY_CLASS = 'protected_local_handle_only' as const;
const DEPOSIT_HANDLE_PREFIX = 'm4.deposit://nara-journal/';

export interface DepositHandoff {
    /** The F_routing trace fields relevant to the handoff (synthetic or live). */
    readonly depositHandle: unknown;
    readonly depositHandlePrivacyClass: unknown;
    /** True when the trace arrived over the public profile bus. */
    readonly publicBus: boolean;
}

export type DepositReception =
    | { readonly accepted: true; readonly handle: string; readonly journalLine: string }
    | { readonly accepted: false; readonly refusal: string };

/** Verify one M2 → M4 handoff and produce the journal deposit intent. */
export function receiveDepositHandle(handoff: DepositHandoff): DepositReception {
    if (handoff.publicBus) {
        return {
            accepted: false,
            refusal:
                'protected_local_handle_only must never arrive over the public profile bus — refused at handoff'
        };
    }
    if (handoff.depositHandlePrivacyClass !== DEPOSIT_HANDLE_PRIVACY_CLASS) {
        return {
            accepted: false,
            refusal: `privacy class '${String(handoff.depositHandlePrivacyClass)}' is not ${DEPOSIT_HANDLE_PRIVACY_CLASS} — refused at handoff`
        };
    }
    const handle = handoff.depositHandle;
    if (typeof handle !== 'string' || !handle.startsWith(DEPOSIT_HANDLE_PREFIX)) {
        return {
            accepted: false,
            refusal: 'deposit handle is not an m4.deposit://nara-journal/ reference — refused'
        };
    }
    return {
        accepted: true,
        handle,
        // the journal line is a REFERENCE record — the handle only, never a
        // routing-trace body (the trace stays kernel/M2-side)
        journalLine: `- deposit:: [[${handle}]] (M2 F_routing handoff, privacy ${DEPOSIT_HANDLE_PRIVACY_CLASS})`
    };
}
