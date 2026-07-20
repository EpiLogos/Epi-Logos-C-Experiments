/**
 * Coordinate: M' M4' (transform-container carrier tests - 25.T25.11)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): protected-local interaction verification
 * Actualises: mode start, forward movement, and confirmed-only back-step UX.
 * Public surface: Vitest suite for TransformContainersPane.
 * Does NOT own: lifecycle persistence or stage vocabulary.
 * Contract: [[M4'-SPEC]] / [[CHROME-CONTRACT]].
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TransformContainersPane } from './TransformContainersPane';
import type { TransformLifecycleReceipt } from './transformContainers';

const stage = (id: string, label: string, alchemicalOp: 'nigredo' | 'separatio') => ({
    id,
    label,
    description: `${label} description`,
    alchemicalOp,
    l2PrimeRegister: "L2' test"
});

const started: TransformLifecycleReceipt = {
    container: 'bohm-dialogue',
    stageIndex: 0,
    stageCount: 2,
    stages: [
        stage('bohm-suspension', 'Suspension', 'nigredo'),
        stage('bohm-proprioception', 'Proprioception of thought', 'separatio')
    ],
    stage: stage('bohm-suspension', 'Suspension', 'nigredo'),
    transition: {
        kind: 'contemplative',
        payload: {
            container: 'bohm-dialogue',
            fromStage: 'unstarted',
            toStage: 'bohm-suspension',
            alchemical_op: 'nigredo'
        }
    },
    direction: 'advance',
    artifactPath: '/vault/start.md'
};

const advanced: TransformLifecycleReceipt = {
    ...started,
    stageIndex: 1,
    stage: started.stages[1],
    transition: {
        kind: 'contemplative',
        payload: {
            container: 'bohm-dialogue',
            fromStage: 'bohm-suspension',
            toStage: 'bohm-proprioception',
            alchemical_op: 'separatio'
        }
    },
    artifactPath: '/vault/advance.md'
};

describe('TransformContainersPane', () => {
    it('starts a mode, advances, and never regresses without explicit confirmation', async () => {
        const startTransform = vi.fn(async () => started);
        const advanceTransform = vi
            .fn()
            .mockResolvedValueOnce(advanced)
            .mockResolvedValueOnce({ ...started, direction: 'regress' });
        const confirmBackstep = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);

        render(
            <TransformContainersPane
                startTransform={startTransform}
                advanceTransform={advanceTransform}
                confirmBackstep={confirmBackstep}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Start Bohm Dialogue' }));
        await screen.findByText('Proprioception of thought');
        expect(screen.getByTestId('transform-position').textContent).toBe('1 / 2');

        fireEvent.click(screen.getByRole('button', { name: 'Advance' }));
        await waitFor(() => expect(screen.getByTestId('transform-position').textContent).toBe('2 / 2'));
        expect(screen.getByTestId('m4-transform-badge').textContent).toBe('separatio');

        fireEvent.click(screen.getByRole('button', { name: 'Back' }));
        expect(confirmBackstep).toHaveBeenCalledTimes(1);
        expect(advanceTransform).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole('button', { name: 'Back' }));
        await waitFor(() => expect(advanceTransform).toHaveBeenCalledTimes(2));
        expect(advanceTransform).toHaveBeenLastCalledWith({
            container: 'bohm-dialogue',
            expectedStage: 'bohm-proprioception',
            direction: 'regress',
            confirmedBackstep: true
        });
    });
});
