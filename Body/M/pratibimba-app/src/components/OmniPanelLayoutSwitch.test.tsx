/**
 * The OmniPanel layout control (52.T3) as a control: it STATES the active
 * layout and addresses the other one, and every click leaves through a
 * registered command rather than touching layout state itself. The real-browser
 * proof that it is mounted in the membrane and moves the shell is
 * `tests/e2e/layout-switch.spec.ts`.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OmniPanelLayoutSwitch } from './OmniPanelLayoutSwitch';
import { LAYOUT_SWITCH_DAILY_COMMAND, LAYOUT_SWITCH_DEEP_COMMAND } from '../commands/layout';
import { LAYOUT_IDS } from '../ui/layoutId';

afterEach(cleanup);

describe('52.T3 OmniPanelLayoutSwitch', () => {
    it('offers one option per layout and presses the active one', () => {
        render(<OmniPanelLayoutSwitch activeLayout="daily-0-1" />);
        const control = screen.getByTestId('omnipanel-layout-switch');
        expect(control.getAttribute('data-active-layout')).toBe('daily-0-1');
        expect(control.querySelectorAll('button')).toHaveLength(LAYOUT_IDS.length);
        expect(
            screen.getByTestId('omnipanel-layout-option-daily-0-1').getAttribute('aria-pressed')
        ).toBe('true');
        expect(
            screen.getByTestId('omnipanel-layout-option-ide-deep').getAttribute('aria-pressed')
        ).toBe('false');
    });

    it('states the OTHER layout as pressed when the shell is deep', () => {
        render(<OmniPanelLayoutSwitch activeLayout="ide-deep" />);
        expect(
            screen.getByTestId('omnipanel-layout-option-ide-deep').getAttribute('aria-pressed')
        ).toBe('true');
    });

    it('fires the addressed switch command — it owns no layout state', () => {
        const execute = vi.fn();
        render(<OmniPanelLayoutSwitch activeLayout="daily-0-1" execute={execute} />);
        fireEvent.click(screen.getByTestId('omnipanel-layout-option-ide-deep'));
        expect(execute).toHaveBeenCalledWith(LAYOUT_SWITCH_DEEP_COMMAND);
        // clicking the ALREADY-active option addresses it too; the shell's
        // transition seam is what decides a same-layout switch is a no-op, so
        // this control never has to know.
        fireEvent.click(screen.getByTestId('omnipanel-layout-option-daily-0-1'));
        expect(execute).toHaveBeenLastCalledWith(LAYOUT_SWITCH_DAILY_COMMAND);
    });

    it('carries a text equivalent for every option (no icon-font dependency)', () => {
        render(<OmniPanelLayoutSwitch activeLayout="daily-0-1" />);
        for (const layout of LAYOUT_IDS) {
            const option = screen.getByTestId(`omnipanel-layout-option-${layout}`);
            expect(option.textContent?.length).toBeGreaterThan(0);
            expect(option.getAttribute('aria-label')?.length).toBeGreaterThan(0);
            expect(option.getAttribute('title')?.length).toBeGreaterThan(0);
        }
    });
});
