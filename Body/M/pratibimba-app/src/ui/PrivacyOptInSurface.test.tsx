// @vitest-environment jsdom
/**
 * 32.T32.8 — the per-artifact opt-in as a LANDING SURFACE.
 *
 * Three things this file holds that the node suites cannot:
 *   • the surface is non-modal — it renders inline, seizes nothing, and traps
 *     no focus (`scripts/lint-no-modal-discipline.mjs` is the carrier-wide
 *     half; this is the shape half);
 *   • it renders the artifact HANDLE and a summary, never a body, and wears the
 *     25.18 privacy chrome for what it is showing AND a preview of what the
 *     artifact would become;
 *   • confirming is a real round trip: the checkbox arms the button, the button
 *     appends through `nara.pasu.consents.append`, and the crossing then hits
 *     the disclosed-absent arm instead of a fabricated success.
 *
 * The default action is "Stay protected-local". It is asserted to write nothing.
 */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PrivacyOptInSurface } from './PrivacyOptInSurface';
import { DEFAULT_PRIVACY_CLASS } from './privacyDefault';
import { PRIVACY_TINT_CLASS } from './privacyChrome';
import { CONSENT_APPEND_RPC, PASU_SHOW_RPC, PUBLIC_CROSSING_SEAM } from '../panes/privacyCrossing';
import type { ConsentRecord } from '../panes/pratibimbaConsent';

afterEach(cleanup);

const REQUEST = Object.freeze({
    artifactHandle: 'nara://artifact/2026-07-29/atlas-sync-resonance',
    artifactSummary: 'atlas-sync resonance reading',
    extensionId: 'm4-nara' as const,
    scope: 'single-artifact' as const
});

/** The artifact BODY — must never appear on the surface. */
const BODY = 'q_composed=0.41,0.22,0.87,0.13 — the raw personal quaternion';

function gatewayDouble(ledgerAfterAppend: readonly ConsentRecord[] = []) {
    const calls: { method: string; params: unknown }[] = [];
    const invokeGatewayRpc = vi.fn(async (method: string, params: Record<string, unknown>) => {
        calls.push({ method, params });
        if (method === PASU_SHOW_RPC) return { c_4_atlas_sync_consents: [] };
        if (method === CONSENT_APPEND_RPC) return { consents: [...ledgerAfterAppend] };
        throw new Error(`unexpected RPC ${method}`);
    });
    return { calls, invokeGatewayRpc };
}

function qualifyingConsent(): ConsentRecord {
    return {
        subjectHandle: REQUEST.artifactHandle,
        action: 'nara.shared-archetype.publish',
        consented: true,
        consentedAt: '2026-07-29T10:00:00.000Z',
        scope: 'single-artifact',
        pressureFree: true,
        inspectable: true
    };
}

describe('32.T32.8 — the opt-in surface is a landing surface, not a modal', () => {
    it('renders inline with no dialog role, no portal and no focus trap', () => {
        const { invokeGatewayRpc } = gatewayDouble();
        const { container } = render(
            <PrivacyOptInSurface request={REQUEST} invokeGatewayRpc={invokeGatewayRpc} onClose={() => {}} />
        );
        const surface = screen.getByTestId('privacy-opt-in-surface');
        expect(container.contains(surface), 'the surface renders in its parent tree, not a portal').toBe(
            true
        );
        expect(surface.getAttribute('role')).not.toBe('dialog');
        expect(surface.getAttribute('aria-modal')).toBeNull();
        expect(document.querySelectorAll('[aria-modal="true"]')).toHaveLength(0);
    });

    it('shows the artifact HANDLE and summary, and never a body', () => {
        const { invokeGatewayRpc } = gatewayDouble();
        render(
            <PrivacyOptInSurface
                request={{ ...REQUEST, artifactSummary: REQUEST.artifactSummary }}
                invokeGatewayRpc={invokeGatewayRpc}
                onClose={() => {}}
            />
        );
        expect(screen.getByTestId('privacy-opt-in-handle').textContent).toContain(
            REQUEST.artifactHandle
        );
        expect(screen.getByTestId('privacy-opt-in-summary').textContent).toContain(
            REQUEST.artifactSummary
        );
        expect(document.body.textContent).not.toContain(BODY);
        expect(document.body.textContent).not.toContain('q_composed');
    });

    it('wears the 25.18 chrome: handle-only for itself, the crossing class as a preview', () => {
        const { invokeGatewayRpc } = gatewayDouble();
        render(
            <PrivacyOptInSurface request={REQUEST} invokeGatewayRpc={invokeGatewayRpc} onClose={() => {}} />
        );
        const surface = screen.getByTestId('privacy-opt-in-surface');
        expect(surface.className).toContain(PRIVACY_TINT_CLASS.protected_local_handle_only);
        expect(surface.getAttribute('title')).toContain('protected_local_handle_only');

        const preview = screen.getByTestId('privacy-opt-in-target-class');
        expect(preview.className).toContain(PRIVACY_TINT_CLASS.shared_archetype_opt_in);
        expect(preview.getAttribute('title')).toContain('shared_archetype_opt_in');
    });

    it('names the class the artifact rests at today — the enforced default', () => {
        const { invokeGatewayRpc } = gatewayDouble();
        render(
            <PrivacyOptInSurface request={REQUEST} invokeGatewayRpc={invokeGatewayRpc} onClose={() => {}} />
        );
        expect(screen.getByTestId('privacy-opt-in-current-class').textContent).toContain(
            DEFAULT_PRIVACY_CLASS
        );
    });
});

describe('32.T32.8 — consent arms the crossing; nothing else does', () => {
    it('the confirm button is disabled until the consent checkbox is ticked', () => {
        const { invokeGatewayRpc } = gatewayDouble();
        render(
            <PrivacyOptInSurface request={REQUEST} invokeGatewayRpc={invokeGatewayRpc} onClose={() => {}} />
        );
        const confirm = screen.getByTestId('privacy-opt-in-confirm') as HTMLButtonElement;
        expect(confirm.disabled).toBe(true);
        fireEvent.click(screen.getByTestId('privacy-opt-in-consented'));
        expect((screen.getByTestId('privacy-opt-in-confirm') as HTMLButtonElement).disabled).toBe(false);
    });

    it('confirming persists the record through nara.pasu.consents.append', async () => {
        const { invokeGatewayRpc, calls } = gatewayDouble([qualifyingConsent()]);
        render(
            <PrivacyOptInSurface request={REQUEST} invokeGatewayRpc={invokeGatewayRpc} onClose={() => {}} />
        );
        fireEvent.click(screen.getByTestId('privacy-opt-in-consented'));
        fireEvent.click(screen.getByTestId('privacy-opt-in-confirm'));

        await waitFor(() => {
            expect(calls.some(call => call.method === CONSENT_APPEND_RPC)).toBe(true);
        });
        const append = calls.find(call => call.method === CONSENT_APPEND_RPC);
        expect((append?.params as { consent: ConsentRecord }).consent).toMatchObject({
            subjectHandle: REQUEST.artifactHandle,
            action: 'nara.shared-archetype.publish',
            consented: true,
            scope: 'single-artifact'
        });
    });

    it('"Stay protected-local" closes and writes NOTHING', () => {
        const { invokeGatewayRpc, calls } = gatewayDouble();
        const onClose = vi.fn();
        render(
            <PrivacyOptInSurface request={REQUEST} invokeGatewayRpc={invokeGatewayRpc} onClose={onClose} />
        );
        fireEvent.click(screen.getByTestId('privacy-opt-in-decline'));
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(calls.some(call => call.method === CONSENT_APPEND_RPC)).toBe(false);
    });

    it('after consent, the crossing reports the ABSENT arm rather than a fake success', async () => {
        const { invokeGatewayRpc } = gatewayDouble([qualifyingConsent()]);
        render(
            <PrivacyOptInSurface request={REQUEST} invokeGatewayRpc={invokeGatewayRpc} onClose={() => {}} />
        );
        fireEvent.click(screen.getByTestId('privacy-opt-in-consented'));
        fireEvent.click(screen.getByTestId('privacy-opt-in-confirm'));

        const notice = await screen.findByTestId('privacy-opt-in-notice');
        expect(notice.textContent).toContain(PUBLIC_CROSSING_SEAM.name);
        expect(notice.textContent?.toLowerCase()).toContain('no gateway method');
    });
});

describe('32.T32.8 — the seam is disclosed on the surface, beside the affordance', () => {
    it('names the missing arm and why the crossing cannot complete', () => {
        const { invokeGatewayRpc } = gatewayDouble();
        render(
            <PrivacyOptInSurface request={REQUEST} invokeGatewayRpc={invokeGatewayRpc} onClose={() => {}} />
        );
        const seam = screen.getByTestId('privacy-opt-in-seam');
        expect(seam.textContent).toContain(PUBLIC_CROSSING_SEAM.name);
        expect(seam.textContent?.length ?? 0).toBeGreaterThan(80);
    });
});
