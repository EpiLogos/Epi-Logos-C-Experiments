/**
 * Coordinate: M' (command system, plan T2.4)
 * Actualises: the single command registry — every keybinding, palette entry,
 *   and cross-pane intent routes through it. Enablement keys off live
 *   provenance state so gateway-dependent commands grey out honestly.
 * Does NOT own: what commands do (owners register them).
 */

import { create } from 'zustand';

export interface AppCommand {
    id: string;
    title: string;
    run: (arg?: unknown) => void | Promise<void>;
    enabled?: () => boolean;
}

class CommandRegistry {
    private readonly map = new Map<string, AppCommand>();

    register(command: AppCommand): () => void {
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
