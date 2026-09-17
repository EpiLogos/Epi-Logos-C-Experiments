/**
 * Coordinate: M' (write-back seam, plan T2.2)
 * Actualises: the debounced save path between editor keystrokes and
 *   `vault_write`. Pure logic, unit-tested; the pane injects the save fn.
 */

export interface DebouncedSaver {
    schedule(content: string): void;
    flush(): Promise<void>;
    dispose(): void;
    readonly dirty: boolean;
}

export function createDebouncedSaver(
    save: (content: string) => Promise<void>,
    delayMs = 1500,
    onState?: (state: 'dirty' | 'saving' | 'saved' | 'error') => void
): DebouncedSaver {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let pending: string | null = null;
    let dirty = false;

    async function write(): Promise<void> {
        if (pending === null) {
            return;
        }
        const content = pending;
        pending = null;
        onState?.('saving');
        try {
            await save(content);
            dirty = pending !== null;
            onState?.(dirty ? 'dirty' : 'saved');
        } catch {
            dirty = true;
            pending = pending ?? content;
            onState?.('error');
        }
    }

    return {
        get dirty() {
            return dirty;
        },
        schedule(content: string) {
            pending = content;
            dirty = true;
            onState?.('dirty');
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(() => {
                timer = null;
                void write();
            }, delayMs);
        },
        async flush() {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            await write();
        },
        dispose() {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
        }
    };
}
