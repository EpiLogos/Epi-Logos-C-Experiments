/**
 * Coordinate: M' M5' (Tuning pane render contract — 38.T38.1)
 * Actualises: the 38.T38.1 render contract over a registry payload whose rows
 *   are lifted verbatim from the live schema files
 *   (`Body/S/S0/portal-core/tunable-schema/*.tunable.toml`) plus the three
 *   fields `knob_view` adds on the wire (`current`, `is_default`, `locked`) —
 *   an `owning_subsystem`-grouped tree, per-knob residency / scope / privacy /
 *   risk / ml-trainable / authority citation, and a never-editable structural
 *   invariant. Assertions are on the rendered DOM, never on the stub.
 */

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setGateway } from '../bridge/gatewayHolder';
import { DEFAULT_CONNECTION_STATUS } from '../bridge/types';
import { useProvenanceStore } from '../state/stores';
import { TuningPane } from './TuningPane';

/** `nara.tunable.toml` row 1, verbatim, in its serialized `TunableMetadata` shape. */
const NARA_KNOB = {
    key: 'nara.weights.body_natal',
    type: 'f32',
    default: 0.5,
    residency_class: 'freeze-on-session-start',
    scope_class: 'per-pasu',
    tuning_risk_class: 'A',
    ml_trainable: true,
    privacy_class: 'local-only',
    structural_invariant: false,
    owning_subsystem: 'M4',
    authoritative_doc: 'Existing weights.rs (pre-Track 38) + DR-TUNE-1 ratification',
    current: 0.55,
    is_default: false,
    locked: false
};

/** `cross.tunable.toml` row 1, verbatim. */
const CROSS_KNOB = {
    key: 'cross.spawn_timeout_ms',
    type: 'u32',
    default: 30000,
    residency_class: 'hot-reload',
    scope_class: 'global',
    tuning_risk_class: 'C',
    ml_trainable: false,
    privacy_class: 'non-sensitive',
    structural_invariant: false,
    owning_subsystem: 'cross',
    authoritative_doc: 'Track 38 §7.3',
    description: 'Default timeout for spawnSync calls across ta-onta carrier extensions.',
    current: 30000,
    is_default: true,
    locked: false
};

/**
 * Per source §7.1 the ~15 structural invariants are deliberately NOT in the
 * schema — the verifier rejects them instead. This row exercises the render
 * contract's `structural_invariant = true` branch, which exists precisely so a
 * schema that ever does declare one cannot present it as editable.
 */
const INVARIANT_KNOB = {
    key: 'm2.epogdoon_ratio',
    type: 'string',
    default: '9:8',
    residency_class: 'restart-required',
    scope_class: 'global',
    tuning_risk_class: 'A',
    ml_trainable: false,
    privacy_class: 'non-sensitive',
    structural_invariant: true,
    owning_subsystem: 'M2',
    authoritative_doc: 'DR-M2-1 (9:8 epogdoon)',
    current: '9:8',
    is_default: true,
    locked: false
};

describe('TuningPane', () => {
    const invoke = vi.fn();

    beforeEach(() => {
        invoke.mockReset();
        invoke.mockImplementation(async (method: string, params: { key?: string }) => {
            if (method === "s5'.tune.registry.list") {
                return { artifact: { knobs: [NARA_KNOB, CROSS_KNOB, INVARIANT_KNOB] } };
            }
            if (method === "s5'.tune.registry.get") {
                const row = [NARA_KNOB, CROSS_KNOB, INVARIANT_KNOB].find(knob => knob.key === params.key);
                return { artifact: row };
            }
            if (method === "s5'.tune.audit.read") return { artifact: { entries: [] } };
            throw new Error(`unexpected method ${method}`);
        });
        setGateway({ invoke } as never);
        useProvenanceStore.setState({
            connection: { ...DEFAULT_CONNECTION_STATUS, connected: true, state: 'connected' }
        });
    });

    afterEach(() => {
        cleanup();
        setGateway(null);
    });

    it('groups the tree by owning_subsystem rather than listing knobs flat', async () => {
        render(<TuningPane />);

        const list = await screen.findByLabelText('Tunables');
        const groups = within(list).getAllByRole('region');
        expect(groups.map(group => group.getAttribute('data-subsystem'))).toEqual(['cross', 'M2', 'M4']);

        const m4 = within(list).getByLabelText('M4 tunables');
        expect(within(m4).getByRole('button', { name: /nara\.weights\.body_natal/ })).toBeTruthy();
        expect(within(m4).queryByRole('button', { name: /cross\.spawn_timeout_ms/ })).toBeNull();
    });

    it('renders the per-knob schema classes and the authority citation', async () => {
        render(<TuningPane />);

        fireEvent.click(await screen.findByRole('button', { name: /cross\.spawn_timeout_ms/ }));
        const detail = (await screen.findByRole('heading', { name: 'cross.spawn_timeout_ms' }))
            .closest('.tuning-detail') as HTMLElement;

        await waitFor(() => {
            expect(detail.textContent).toContain('hot-reload');
        });
        expect(detail.textContent).toContain('global');
        expect(detail.textContent).toContain('non-sensitive');
        expect(detail.textContent).toContain('Track 38 §7.3');
        expect(within(detail).getByText('ML-trainable').nextElementSibling?.textContent).toBe('no');
    });

    it('reports ml-trainable knobs as trainable on the ML-trainable row', async () => {
        render(<TuningPane />);

        fireEvent.click(await screen.findByRole('button', { name: /nara\.weights\.body_natal/ }));
        const detail = screen.getByRole('heading', { name: 'nara.weights.body_natal' })
            .closest('.tuning-detail') as HTMLElement;

        await waitFor(() => {
            expect(within(detail).getByText('ML-trainable').nextElementSibling?.textContent).toBe('yes');
        });
        expect(detail.textContent).toContain('freeze-on-session-start');
        expect(detail.textContent).toContain('per-pasu');
        expect(detail.textContent).toContain('local-only');
    });

    it('marks a structural invariant in the tree and refuses to edit it', async () => {
        render(<TuningPane />);

        const row = await screen.findByRole('button', { name: /m2\.epogdoon_ratio/ });
        expect(row.getAttribute('data-structural-invariant')).toBe('true');
        expect(row.textContent).toContain('structural invariant');

        fireEvent.click(row);
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'm2.epogdoon_ratio' })).toBeTruthy();
        });
        expect((screen.getByLabelText('Value') as HTMLInputElement).disabled).toBe(true);
        expect((screen.getByRole('button', { name: 'Apply' }) as HTMLButtonElement).disabled).toBe(true);
        expect((screen.getByRole('button', { name: /^(Lock|Unlock)$/ }) as HTMLButtonElement).disabled).toBe(true);
    });

    it('is a landing surface: it opens no dialog', async () => {
        render(<TuningPane />);

        await screen.findByTestId('tuning-pane');
        expect(screen.queryByRole('dialog')).toBeNull();
        fireEvent.click(await screen.findByRole('button', { name: /nara\.weights\.body_natal/ }));
        expect(screen.queryByRole('dialog')).toBeNull();
    });
});
