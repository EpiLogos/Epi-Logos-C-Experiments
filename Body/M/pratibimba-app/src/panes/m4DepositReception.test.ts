/**
 * Coordinate: M' M4' (deposit reception law — Track 08.T8.2)
 * Actualises: the tranche's integration test — the M4' journal receives the
 *   handle on a SYNTHETIC F_routing trace (the named acceptance), and the
 *   privacy class is verified at handoff: wrong class refused, public-bus
 *   arrival refused (protected_local_handle_only never rides the open wire).
 */

import { describe, expect, it } from 'vitest';
import { DEPOSIT_HANDLE_PRIVACY_CLASS, receiveDepositHandle } from './m4DepositReception';

// Synthetic F_routing trace handoff — the exact emitter shape pinned by
// portal-core tests/f_routing_trace.rs:36-40.
const SYNTHETIC = {
    depositHandle: 'm4.deposit://nara-journal/m2/f-routing/index72/25/det64/0000000002000000',
    depositHandlePrivacyClass: DEPOSIT_HANDLE_PRIVACY_CLASS,
    publicBus: false
};

describe('m2 → m4 deposit-handle reception (08.T8.2)', () => {
    it('the M4 journal receives the handle on a synthetic F_routing trace', () => {
        const reception = receiveDepositHandle(SYNTHETIC);
        expect(reception.accepted).toBe(true);
        if (reception.accepted) {
            expect(reception.handle).toBe(SYNTHETIC.depositHandle);
            expect(reception.journalLine).toContain('[[m4.deposit://nara-journal/');
            expect(reception.journalLine).toContain(DEPOSIT_HANDLE_PRIVACY_CLASS);
            // the journal line carries the REFERENCE only, never a trace body
            expect(reception.journalLine).not.toContain('axisViews');
        }
    });

    it('privacy class is verified at handoff — any other class is refused', () => {
        const wrong = receiveDepositHandle({
            ...SYNTHETIC,
            depositHandlePrivacyClass: 'public-current-context'
        });
        expect(wrong.accepted).toBe(false);
        if (!wrong.accepted) {
            expect(wrong.refusal).toContain('refused at handoff');
        }
    });

    it('a protected-local handle arriving over the PUBLIC bus is refused outright', () => {
        const leaked = receiveDepositHandle({ ...SYNTHETIC, publicBus: true });
        expect(leaked.accepted).toBe(false);
        if (!leaked.accepted) {
            expect(leaked.refusal).toContain('public profile bus');
        }
    });

    it('non-m4.deposit references are refused (never journal an arbitrary string)', () => {
        const bogus = receiveDepositHandle({ ...SYNTHETIC, depositHandle: 'file:///etc/passwd' });
        expect(bogus.accepted).toBe(false);
    });
});
