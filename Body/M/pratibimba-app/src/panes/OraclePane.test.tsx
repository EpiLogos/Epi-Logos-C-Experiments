import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OraclePane } from './OraclePane';
import { commands } from '../commands/registry';
import { useSessionStore } from '../state/stores';

const invokeCommand = vi.fn();
vi.mock('../bridge/tauri', () => ({
    invokeCommand: (...args: unknown[]) => invokeCommand(...args),
    listenEvent: vi.fn(async () => () => undefined)
}));

describe('OraclePane', () => {
    beforeEach(() => {
        invokeCommand.mockReset();
        useSessionStore.setState({ sessionKey: null, dayNow: null, privacyClass: null });
    });
    afterEach(cleanup);

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
        expect(invokeCommand).toHaveBeenCalledWith('oracle_cast', {
            system: 'rws',
            question: 'what now?',
            dayId: '02-07-2026'
        });
        fireEvent.click(screen.getByTestId('oracle-artifact-link'));
        expect(opened).toEqual(['Empty/Present/02-07-2026/oracle-120000-tarot.md']);
        expect(screen.getByTestId('provenance-derived')).toBeTruthy();
        dispose();
    });

    it('surfaces cast errors honestly (hygiene refusals included)', async () => {
        useSessionStore.setState({ dayNow: '02-07-2026' });
        invokeCommand.mockRejectedValue(new Error('Excessive frequency: 6 casts today (max 6)'));
        render(<OraclePane />);
        fireEvent.change(screen.getByTestId('oracle-question'), { target: { value: 'again?' } });
        fireEvent.click(screen.getByTestId('oracle-cast'));
        expect((await screen.findByTestId('oracle-error')).textContent).toContain('Excessive frequency');
    });
});
