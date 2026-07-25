/**
 * Coordinate: M' shell-0 (appearance commands — 30.T30.4)
 * Residency: Body/M/pratibimba-app/src/commands/theme.ts
 * Position (#n): #4 — Context/Type
 * Actualises: the theme picker as palette commands — one per selection the
 *   30.4 contract admits (the seven canonical themes plus `system`). The
 *   palette executes commands with NO argument (CommandPalette.tsx), so a
 *   single parameterised `theme.set` could never be picked from it; one
 *   explicit command per selection IS the picker here, and each is a static
 *   `{ id, title, run }` literal so the AST catalog gate (catalog.test.ts)
 *   can see it.
 * Public surface: registerThemeCommands.
 * Does NOT own: the selection state (state/themeStore.ts), the resolution law
 *   (ui/themeMapping.ts), or the palette itself (panes/CommandPalette.tsx).
 * Contract: [[CHROME-CONTRACT]] section 10 (every registered command is
 *   catalogued); rerun tranche [[30.T30.4]].
 */

import { useThemeStore } from '../state/themeStore';
import type { ThemeSelection } from '../ui/themeMapping';
import { commands } from './registry';

function select(selection: ThemeSelection): void {
    useThemeStore.getState().setSelection(selection);
}

/**
 * Register the appearance picker. Returns a disposer that unregisters all of
 * them (the registry hands one back per command).
 */
export function registerThemeCommands(): () => void {
    const disposers = [
        commands.register({
            id: 'theme.dark',
            title: 'Appearance: Dark',
            run: () => select('dark')
        }),
        commands.register({
            id: 'theme.light',
            title: 'Appearance: Light',
            run: () => select('light')
        }),
        commands.register({
            id: 'theme.glass',
            title: 'Appearance: Glass',
            run: () => select('glass')
        }),
        commands.register({
            id: 'theme.discause',
            title: 'Appearance: Discause',
            run: () => select('discause')
        }),
        commands.register({
            id: 'theme.naraDark',
            title: 'Appearance: Nara Dark (M4)',
            run: () => select('nara-dark')
        }),
        commands.register({
            id: 'theme.naraLight',
            title: 'Appearance: Nara Light (M4)',
            run: () => select('nara-light')
        }),
        commands.register({
            id: 'theme.naraGlass',
            title: 'Appearance: Nara Glass (M4)',
            run: () => select('nara-glass')
        }),
        commands.register({
            id: 'theme.system',
            title: 'Appearance: Follow system',
            run: () => select('system')
        })
    ];
    return () => disposers.forEach(dispose => dispose());
}
