/**
 * Coordinate: M' (command system, plan T2.4; rerun 31.T31.11)
 * Residency: Body/M/pratibimba-app/src/commands
 * Position (#n): #4 -- Context/Type
 * Actualises: the single command registry -- every keybinding, palette entry,
 *   and cross-pane intent routes through it. Enablement keys off live
 *   provenance state so gateway-dependent commands grey out honestly.
 * Public surface: AppCommand, commands, usePaletteStore.
 * Does NOT own: what commands do (owners register them), action rendering, or
 *   pane selection/artifact state.
 * Contract: [[CHROME-CONTRACT]] sections 3 and 10.
 */

import { create } from 'zustand';
import {
    ActionSurfaceContribution,
    assertActionSurfaceContribution,
    isPaletteCommand
} from './actionSurface';

export interface AppCommand {
    id: string;
    title: string;
    run: (arg?: unknown) => void | Promise<void>;
    enabled?: () => boolean;
    /** Present only when a renderer contributes this action at a concrete surface. */
    actionSurface?: ActionSurfaceContribution;
}

class CommandRegistry {
    private readonly map = new Map<string, AppCommand>();

    register(command: AppCommand): () => void {
        if (command.actionSurface) {
            assertActionSurfaceContribution(command.actionSurface);
        }
        this.map.set(command.id, command);
        return () => this.map.delete(command.id);
    }

    has(id: string): boolean {
        return this.map.has(id);
    }

    isEnabled(id: string): boolean {
        const command = this.map.get(id);
        return !!command && (command.enabled ? command.enabled() : true);
    }

    async execute(id: string, arg?: unknown): Promise<void> {
        const command = this.map.get(id);
        if (!command) {
            throw new Error(`unknown command: ${id}`);
        }
        if (command.enabled && !command.enabled()) {
            return;
        }
        await command.run(arg);
    }

    list(): AppCommand[] {
        return [...this.map.values()].sort((a, b) => a.title.localeCompare(b.title));
    }

    listPalette(): AppCommand[] {
        return this.list().filter(isPaletteCommand);
    }
}

export const commands = new CommandRegistry();

export interface PaletteState {
    open: boolean;
    setOpen(open: boolean): void;
}

export const usePaletteStore = create<PaletteState>(set => ({
    open: false,
    setOpen: open => set({ open })
}));
