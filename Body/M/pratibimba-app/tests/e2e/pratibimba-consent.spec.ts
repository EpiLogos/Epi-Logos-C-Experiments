/**
 * Coordinate: M' M4' (Pratibimba personal-coordinate live-wire proof — 25.T25.14)
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Position (#n): real Chromium + spawned-gateway (:18933) lifecycle boundary
 * Actualises: the UF/live-wire proof for the personal-coordinate surface —
 *   (b) a consent write driven through the pane PERSISTS to a real
 *   `Pratibimba/Self/PASU.md` `c_4_atlas_sync_consents` array (asserted over the
 *   wire via `nara.pasu.show` AND by reading the vault bytes), and (c) a proposal
 *   submitted over the wire via `nara.identity.proposals.submit` surfaces in the
 *   pane's pending list, is accepted through the M5' gate, and transitions to a
 *   terminal 'accepted' state (NEVER 'applied' — Q_identity untouched), proven by
 *   reading the persisted review-ledger bytes. A second test proves panel (c)
 *   goes LIVE via the REAL producer: `nara.identity.proposals.detect` measures a
 *   drifted accumulated Q_activity against the seeded natal identity and submits
 *   a real Proposed proposal, which then surfaces in the pane and accepts to
 *   terminal 'accepted' (never 'applied').
 * Public surface: Playwright personal-coordinate flow.
 * Does NOT own: the PASU write law (S0 pasu.rs), the proposal state machine
 *   (portal-core), the gateway dispatch (S3).
 * Contract: root [[AGENTS]] verification law; [[M4'-SPEC]] / Track [[25.T25.14]].
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';
import { RUN_STATE_FILE, type E2eRunState } from './e2e-env';

interface PasuShowResult {
    c_4_atlas_sync_consents?: Array<{ subjectHandle?: string }>;
}

interface ProposalView {
    proposalHandle?: string;
    state?: string;
}

interface PersistedProposal {
    proposal_handle: string;
    state: string;
    applied_at: string | null;
}

function runState(): E2eRunState {
    return JSON.parse(readFileSync(RUN_STATE_FILE, 'utf8')) as E2eRunState;
}

test('personal-coordinate pane persists a consent to PASU and round-trips an identity proposal', async ({
    page
}) => {
    const state = runState();
    const proposalHandle = `augment-e2e-${Date.now().toString(36)}`;
    const consentSubject = `nara://voice/e2e-${Date.now().toString(36)}`;

    // ── Producer seam (over the wire) ────────────────────────────────────────
    // Submit a NEW identity-augment proposal BEFORE the pane mounts. The upstream
    // producer that DECIDES to propose is separate/future — here the e2e drives
    // the submission seam so the consumer pane has a real pending proposal to
    // surface. Submit creates a Proposed proposal only (never applies).
    const submitted = (await gatewayRpc('nara.identity.proposals.submit', {
        proposal_handle: proposalHandle,
        summary: 'Birthdate encoding layer ready for M5 review.',
        source_adapter_handle: 'adapter://m4/identity-augment'
    })) as ProposalView;
    expect(submitted?.proposalHandle, 'submit returned no proposalHandle').toBe(proposalHandle);
    expect(submitted?.state, 'submit must create a Proposed proposal only').toBe('proposed');

    // ── Mount the pane ───────────────────────────────────────────────────────
    await page.goto('/');
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    const activeFace = page.locator('.face-active');
    await activeFace.locator('.flexlayout__tab_button', { hasText: 'Coordinate' }).click();

    const pane = activeFace.getByTestId('pratibimba-coordinate-pane');
    await expect(pane).toBeVisible();
    await expect(pane).toHaveAttribute('data-privacy', 'protected-local');

    // ── Panel (b): consent write persists to PASU c_4_atlas_sync_consents ─────
    const consentEditor = pane.getByTestId('consent-editor');
    // Initially the seeded PASU.md carries an empty consent ledger.
    await expect(consentEditor.getByTestId('consent-ledger-empty')).toBeVisible();

    await consentEditor.getByTestId('consent-subject').fill(consentSubject);
    // Defaults (voice-corpus.include / adapter-corpus / consented / pressure-free
    // / inspectable) already form a well-formed record; append it.
    await consentEditor.getByTestId('consent-append').click();

    // The pane reflects the authoritative array-append (1 record).
    await expect(consentEditor.getByTestId('consent-row-0')).toBeVisible();
    await expect(consentEditor.getByTestId('consent-notice')).toContainText('c_4_atlas_sync_consents');

    // Proof 1 — over the wire: nara.pasu.show now carries the appended consent.
    const pasu = (await gatewayRpc('nara.pasu.show', {})) as PasuShowResult;
    const consents = pasu.c_4_atlas_sync_consents ?? [];
    expect(consents.map(c => c.subjectHandle)).toContain(consentSubject);

    // Proof 2 — real bytes: the temp vault's PASU.md file contains the consent.
    const pasuPath = join(state.vaultRoot, 'Pratibimba', 'Self', 'PASU.md');
    expect(readFileSync(pasuPath, 'utf8')).toContain(consentSubject);

    // ── Panel (c): the submitted proposal surfaces, then accept transitions it ─
    const proposalsPanel = pane.getByTestId('identity-proposals-panel');
    const row = proposalsPanel.getByTestId(`proposal-row-${proposalHandle}`);
    await expect(row, 'submitted proposal did not surface in the pending list').toBeVisible({
        timeout: 15_000
    });
    await expect(row).toHaveAttribute('data-state', 'proposed');

    await row.getByTestId(`proposal-accept-${proposalHandle}`).click();

    // The accepted proposal is terminal → it drops out of the pending list.
    await expect(row).toBeHidden({ timeout: 15_000 });
    await expect(proposalsPanel.getByTestId('proposals-notice')).toContainText(`accepted ${proposalHandle}`);

    // Round-trip over the wire: list no longer returns the terminal proposal.
    const listAfter = (await gatewayRpc('nara.identity.proposals.list', {})) as {
        proposals?: ProposalView[];
    };
    expect((listAfter.proposals ?? []).map(p => p.proposalHandle)).not.toContain(proposalHandle);

    // Q_identity untouched — the persisted review-ledger bytes show the proposal
    // moved to 'accepted', NEVER 'applied' (apply is a separate governed path).
    const storePath = join(state.gatewayStateRoot, 'nara', 'identity-proposals.json');
    const persisted = JSON.parse(readFileSync(storePath, 'utf8')) as PersistedProposal[];
    const record = persisted.find(p => p.proposal_handle === proposalHandle);
    expect(record?.state, 'accepted proposal must be terminal-accepted').toBe('accepted');
    expect(record?.applied_at, 'accept must NEVER apply — applied_at stays null').toBeNull();
    expect(persisted.some(p => p.state === 'applied')).toBe(false);
});

test('detect PRODUCER surfaces a real drift proposal in panel (c) over the live wire', async ({
    page
}) => {
    const state = runState();
    const proposalHandle = `augment-detect-e2e-${Date.now().toString(36)}`;

    // ── The REAL producer seam (over the wire) ───────────────────────────────
    // Drive `nara.identity.proposals.detect` with an accumulated Q_activity that
    // has DRIFTED from the natal identity: [0,1,0,0] has a zero scalar component,
    // so the activity-composed candidate resonates ≈ 0 with the natal q_identity
    // — well below the drift floor. The gateway loads the SEEDED natal baseline
    // (global-setup's natal.json), measures the drift via PersonalResonance, and
    // SUBMITS a real Proposed proposal. THIS is the producer that makes panel (c)
    // live in a live system (before this, the adapter had zero callers). Submit
    // creates a Proposed proposal only — it never mutates Q_identity.
    const detected = (await gatewayRpc('nara.identity.proposals.detect', {
        q_activity: [0, 1, 0, 0],
        proposal_handle: proposalHandle,
        source_adapter_handle: 'adapter://m4/activity-drift-detector'
    })) as { produced?: boolean; proposal?: ProposalView };
    expect(detected?.produced, 'detect must produce a proposal on real drift').toBe(true);
    expect(detected?.proposal?.proposalHandle, 'detect returned no proposalHandle').toBe(
        proposalHandle
    );
    expect(detected?.proposal?.state, 'the produced proposal must be Proposed only').toBe('proposed');

    // ── Mount the pane; panel (c) surfaces the PRODUCED proposal ─────────────
    await page.goto('/');
    await expect(page.getByTestId('status-gateway')).toContainText('connected', { timeout: 20_000 });

    const activeFace = page.locator('.face-active');
    await activeFace.locator('.flexlayout__tab_button', { hasText: 'Coordinate' }).click();

    const pane = activeFace.getByTestId('pratibimba-coordinate-pane');
    await expect(pane).toBeVisible();

    const proposalsPanel = pane.getByTestId('identity-proposals-panel');
    const row = proposalsPanel.getByTestId(`proposal-row-${proposalHandle}`);
    await expect(row, 'the produced proposal did not surface in panel (c)').toBeVisible({
        timeout: 15_000
    });
    await expect(row).toHaveAttribute('data-state', 'proposed');

    // ── Accept through the M5' gate → terminal 'accepted', NEVER 'applied' ────
    await row.getByTestId(`proposal-accept-${proposalHandle}`).click();
    await expect(row).toBeHidden({ timeout: 15_000 });
    await expect(proposalsPanel.getByTestId('proposals-notice')).toContainText(
        `accepted ${proposalHandle}`
    );

    // Q_identity untouched: the produced proposal moved to 'accepted' (terminal
    // review), NEVER 'applied' — apply is a separate governed path.
    const storePath = join(state.gatewayStateRoot, 'nara', 'identity-proposals.json');
    const persisted = JSON.parse(readFileSync(storePath, 'utf8')) as PersistedProposal[];
    const record = persisted.find(p => p.proposal_handle === proposalHandle);
    expect(record?.state, 'accepted produced proposal must be terminal-accepted').toBe('accepted');
    expect(record?.applied_at, 'accept must NEVER apply — applied_at stays null').toBeNull();
    expect(persisted.some(p => p.state === 'applied')).toBe(false);
});
