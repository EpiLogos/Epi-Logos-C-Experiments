/**
 * 25.T25.24 — the cast is a GATEWAY act. These tests assert the two-step
 * flow the tranche installed: `nara.oracle.cast` on the wire, then the S1
 * `oracle_deposit`. The old single-step `oracle_cast` spawn was the Track-00
 * hardening-T17 bypass, and a test that still asserted it would keep the
 * bypass green.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ORACLE_CAST_METHOD, ORACLE_DEPOSIT_COMMAND, OraclePane, castTextOf } from './OraclePane';
import { commands } from '../commands/registry';
import { setGateway } from '../bridge/gatewayHolder';
import { useSessionStore } from '../state/stores';
import { publishProfileTick, resetProfileTicks } from '../composition/profileTickSubscription';

const invokeCommand = vi.fn();
vi.mock('../bridge/tauri', () => ({
    invokeCommand: (...args: unknown[]) => invokeCommand(...args),
    listenEvent: vi.fn(async () => () => undefined)
}));

const gatewayInvoke = vi.fn();

/** The one socket, answering the cast with the CLI text `cli_to_rpc` wraps. */
function gatewayCasting(text = 'The Star'): void {
    gatewayInvoke.mockResolvedValue({ artifact: { result: text } });
    setGateway({ connected: true, invoke: gatewayInvoke } as never);
}

describe('OraclePane', () => {
    beforeEach(() => {
        invokeCommand.mockReset();
        gatewayInvoke.mockReset();
        gatewayCasting();
        useSessionStore.setState({ sessionKey: null, dayNow: null, privacyClass: null });
        resetProfileTicks();
    });
    afterEach(() => {
        cleanup();
        setGateway(null);
    });

    it('refuses to cast without an anchored day', () => {
        render(<OraclePane />);
        expect(screen.getByTestId('oracle-no-day')).toBeTruthy();
        expect(screen.queryByTestId('oracle-cast')).toBeNull();
    });

    it('casts through the typed command and links the deposited day artifact', async () => {
        useSessionStore.setState({ dayNow: '02-07-2026' });
        invokeCommand.mockResolvedValue({
            artifactPath: 'Empty/Present/02-07-2026/oracle-120000-tarot.md',
            output: 'The Star',
            system: 'tarot'
        });
        const opened: unknown[] = [];
        const dispose = commands.register({ id: 'vault.open', title: 'open', run: a => void opened.push(a) });

        render(<OraclePane />);
        fireEvent.change(screen.getByTestId('oracle-question'), { target: { value: 'what now?' } });
        fireEvent.click(screen.getByTestId('oracle-cast'));

        const result = await screen.findByTestId('oracle-result');
        expect(result.textContent).toContain('The Star');
        // the CAST went to the gateway…
        expect(gatewayInvoke).toHaveBeenCalledWith(ORACLE_CAST_METHOD, {
            system: 'rws',
            question: 'what now?',
            yes: true
        });
        // …and only the DEPOSIT went to the host, carrying the gateway's text
        expect(invokeCommand).toHaveBeenCalledWith(ORACLE_DEPOSIT_COMMAND, {
            system: 'rws',
            question: 'what now?',
            dayId: '02-07-2026',
            output: 'The Star'
        });
        // the retired bypass is never reached
        expect(invokeCommand).not.toHaveBeenCalledWith('oracle_cast', expect.anything());
        fireEvent.click(screen.getByTestId('oracle-artifact-link'));
        expect(opened).toEqual(['Empty/Present/02-07-2026/oracle-120000-tarot.md']);
        expect(screen.getByTestId('provenance-derived')).toBeTruthy();
        dispose();
    });

    it('renders a stamped envelope resonance as numeric + conjugate-form-character (05.T5.1)', async () => {
        useSessionStore.setState({ dayNow: '02-07-2026' });
        invokeCommand.mockResolvedValue({
            artifactPath: 'Empty/Present/02-07-2026/oracle-120000-tarot.md',
            output: 'The Star',
            system: 'tarot',
            resonance: { numeric: 0.62, conjugateFormCharacter: 'Minor' }
        });
        render(<OraclePane />);
        fireEvent.change(screen.getByTestId('oracle-question'), { target: { value: 'what now?' } });
        fireEvent.click(screen.getByTestId('oracle-cast'));

        await screen.findByTestId('oracle-result');
        const chip = screen.getByTestId('oracle-artifact-resonance');
        expect(chip.textContent).toBe('0.620 Minor');
        expect(chip.dataset.state).toBe('resolved');
    });

    it('renders the pending-resonance fallback on an unstamped deposit with no live profile (05.T5.1)', async () => {
        useSessionStore.setState({ dayNow: '02-07-2026' });
        invokeCommand.mockResolvedValue({
            artifactPath: 'Empty/Present/02-07-2026/oracle-120000-tarot.md',
            output: 'The Star',
            system: 'tarot'
        });
        render(<OraclePane />);
        fireEvent.change(screen.getByTestId('oracle-question'), { target: { value: 'what now?' } });
        fireEvent.click(screen.getByTestId('oracle-cast'));

        await screen.findByTestId('oracle-result');
        const chip = screen.getByTestId('oracle-artifact-resonance');
        expect(chip.textContent).toBe('pending-resonance');
        expect(chip.dataset.state).toBe('pending-resonance');
    });

    it('falls back to the at-now kernel resonance for an unstamped deposit when the profile carries one (05.T5.1)', async () => {
        useSessionStore.setState({ dayNow: '02-07-2026' });
        publishProfileTick({
                generation: 2,
                cachedAtMs: 0,
                stale: false,
                stalenessMs: 0,
                privacyClass: 'safe-public-current-kernel-tick',
                profile: {
                    harmonicProfile: {
                        personalPole: {
                            resonance: { score: 0.931, conjugateFormCharacter: 'ShadowInversion' }
                        }
                    }
                }
            } as never);
        invokeCommand.mockResolvedValue({
            artifactPath: 'Empty/Present/02-07-2026/oracle-120000-tarot.md',
            output: 'The Star',
            system: 'tarot'
        });
        render(<OraclePane />);
        fireEvent.change(screen.getByTestId('oracle-question'), { target: { value: 'what now?' } });
        fireEvent.click(screen.getByTestId('oracle-cast'));

        await screen.findByTestId('oracle-result');
        // kernel wire spelling ShadowInversion renders as §6.5 Shadow
        expect(screen.getByTestId('oracle-artifact-resonance').textContent).toBe('0.931 Shadow');
    });

    it('renders the §5.11 envelope strip from a stamped deposit (05.T5.11)', async () => {
        useSessionStore.setState({ dayNow: '12-07-2026' });
        invokeCommand.mockResolvedValue({
            artifactPath: 'Empty/Present/12-07-2026/oracle-120000-tarot.md',
            output: 'The Magician',
            system: 'tarot',
            envelope: {
                system: 'tarot',
                cp_position_refs: ['CP4.4', 'CP4.5'],
                vak_address: { cp: 'CP4.4,CP4.5', cs: { code: 'CS0', direction: "Night'" } },
                spread_label: 'sixfold-ql-traverse',
                oracle_frame_ref: 'oracle-frame-four-five',
                deck_context: {
                    macro_deck_ref: 'protected://nara/deck/macro-inhabited-rws',
                    deck_order_hash: 'blake3:deck-order-fixture',
                    entropy_mode: 'seeded_replay'
                },
                review_state: 'live-only',
                scalar_refs: [
                    { ref_kind: 'm3-codon', scalar_ref: 'codon://ATG', source_handle: 'm3://bridge' }
                ]
            }
        });
        render(<OraclePane />);
        fireEvent.change(screen.getByTestId('oracle-question'), { target: { value: 'depth?' } });
        fireEvent.click(screen.getByTestId('oracle-cast'));

        await screen.findByTestId('oracle-result');
        const strip = screen.getByTestId('oracle-envelope');
        expect(strip.dataset.state).toBe('resolved');
        // DR-VAK-1: positions authority (2), never the sixfold label.
        expect(screen.getByTestId('oracle-envelope-cardinality').textContent).toContain('2 positions');
        expect(screen.getByTestId('oracle-envelope-cardinality').textContent).toContain('CP4.4 CP4.5');
        expect(screen.getByTestId('oracle-envelope-direction').textContent).toBe("Night'");
        expect(screen.getByTestId('oracle-envelope-deck').textContent).toContain('blake3:deck-order-fixture');
        expect(screen.getByTestId('oracle-envelope-frame').textContent).toBe('oracle-frame-four-five');
        expect(screen.getByTestId('oracle-envelope-review').textContent).toBe('live-only');
        // M3 provenance present → mutual projectability affordance.
        expect(screen.getByTestId('oracle-envelope-projectable').textContent).toContain('tarot');
        expect(screen.getByTestId('oracle-envelope-projectable').textContent).toContain('i-ching');
    });

    it('renders the pending-envelope fallback on an unstamped deposit (05.T5.11)', async () => {
        useSessionStore.setState({ dayNow: '12-07-2026' });
        invokeCommand.mockResolvedValue({
            artifactPath: 'Empty/Present/12-07-2026/oracle-120000-tarot.md',
            output: 'The Star',
            system: 'tarot'
        });
        render(<OraclePane />);
        fireEvent.change(screen.getByTestId('oracle-question'), { target: { value: 'what now?' } });
        fireEvent.click(screen.getByTestId('oracle-cast'));

        await screen.findByTestId('oracle-result');
        const strip = screen.getByTestId('oracle-envelope');
        expect(strip.dataset.state).toBe('pending-envelope');
        expect(strip.textContent).toBe('pending-envelope');
        expect(screen.queryByTestId('oracle-envelope-projectable')).toBeNull();
    });

    it('surfaces cast errors honestly (hygiene refusals included)', async () => {
        useSessionStore.setState({ dayNow: '02-07-2026' });
        // the hygiene ledger lives under the CLI, so the refusal arrives on the
        // wire — the pane must show it verbatim, not translate it
        gatewayInvoke.mockRejectedValue(new Error('Excessive frequency: 6 casts today (max 6)'));
        render(<OraclePane />);
        fireEvent.change(screen.getByTestId('oracle-question'), { target: { value: 'again?' } });
        fireEvent.click(screen.getByTestId('oracle-cast'));
        expect((await screen.findByTestId('oracle-error')).textContent).toContain('Excessive frequency');
        // a refused cast deposits NOTHING
        expect(invokeCommand).not.toHaveBeenCalled();
    });

    it('25.T25.24: a disconnected gateway REFUSES — it never falls back to the Tauri spawn', async () => {
        useSessionStore.setState({ dayNow: '02-07-2026' });
        setGateway(null);
        render(<OraclePane />);
        fireEvent.change(screen.getByTestId('oracle-question'), { target: { value: 'offline?' } });
        fireEvent.click(screen.getByTestId('oracle-cast'));
        const error = await screen.findByTestId('oracle-error');
        expect(error.textContent).toContain(ORACLE_CAST_METHOD);
        // the whole point: no spawn, no deposit, no artifact
        expect(invokeCommand).not.toHaveBeenCalled();
        expect(screen.queryByTestId('oracle-result')).toBeNull();
    });

    it('25.T25.24: a cast with no text is a refusal, never an empty artifact', async () => {
        useSessionStore.setState({ dayNow: '02-07-2026' });
        gatewayInvoke.mockResolvedValue({ artifact: { result: '   ' } });
        render(<OraclePane />);
        fireEvent.change(screen.getByTestId('oracle-question'), { target: { value: 'empty?' } });
        fireEvent.click(screen.getByTestId('oracle-cast'));
        expect((await screen.findByTestId('oracle-error')).textContent).toContain('no cast text');
        expect(invokeCommand).not.toHaveBeenCalled();
    });

    it('25.T25.24: castTextOf narrows the cli_to_rpc envelope and refuses everything else', () => {
        // `cli_to_rpc` parses JSON when it can and wraps plain text as {result}
        expect(castTextOf({ result: 'Tarot Draw #4' })).toBe('Tarot Draw #4');
        expect(castTextOf('Tarot Draw #4')).toBe('Tarot Draw #4');
        expect(castTextOf({ result: '  padded  ' })).toBe('padded');
        expect(castTextOf({ result: '' })).toBeNull();
        expect(castTextOf({ primary_hex: 12 })).toBeNull();
        expect(castTextOf(null)).toBeNull();
        expect(castTextOf(undefined)).toBeNull();
    });
});
