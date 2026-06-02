/**
 * Browser-runtime stub for the Electron-only globals the wholesale-ported
 * OmniPanel React tree expects.
 *
 * The OmniPanel calls `window.sPrime.{epiClaw,s0,s1,s2,s3,s4,s5}` and
 * `window.electronAPI.*` during render and on connection-attempt callbacks.
 * In the Theia browser bundle these are not provided by a preload script;
 * this stub installs a typed-but-non-functional implementation so:
 *
 * 1. The React tree compiles + renders.
 * 2. Connection attempts resolve to "disconnected" without crashing.
 * 3. Event subscriptions return no-op unsubscribers.
 *
 * Real wiring lands at Track 05 T3 (kernel-bridge extension) which will
 * publish typed Theia DI services consumed via React context — at that
 * point the `window.sPrime` shim is replaced with DI access.
 */

const NOOP_UNSUB = () => {
    /* no-op */
};

function installSPrimeStub(): void {
    if (typeof window === 'undefined') {
        return;
    }
    const w = window as unknown as Record<string, unknown>;
    if (w.sPrime) {
        return;
    }

    // Per `shared-types.ts` — the SPrimeAPI shape. Methods return safe defaults.
    const journal = {
        loadTodayEntry: async () => null,
        saveEntry: async () => ({ success: false, error: 'Theia: sPrime stub' }),
        loadEntryByDate: async () => null,
        deleteEntry: async () => ({ success: false, error: 'Theia: sPrime stub' }),
        listEntries: async () => []
    };
    const files = {
        readFile: async () => null,
        writeFile: async () => ({ success: false, error: 'Theia: sPrime stub' }),
        listFiles: async () => [],
        getFileTree: async () => null
    };
    const backlinks = {
        getBacklinks: async () => null,
        resolveWikiLink: async () => null
    };
    const shell = {
        openExternal: async () => {
            /* no-op */
        }
    };
    const graph = {
        query: async () => null,
        getNode: async () => null
    };
    const websocket = {
        isConnected: async () => false,
        send: async () => {
            /* no-op */
        },
        configure: async () => ({ success: false }),
        onMessage: () => NOOP_UNSUB,
        onConnected: () => NOOP_UNSUB,
        onDisconnected: () => NOOP_UNSUB,
        onError: () => NOOP_UNSUB
    };
    const epiClaw = {
        isConnected: async () => false,
        getConnectionState: async () => 'disconnected' as const,
        request: async () => ({ success: false, error: 'Theia: sPrime stub' }),
        subscribe: async () => 'stub-sub-id',
        unsubscribe: async () => {
            /* no-op */
        },
        onEvent: () => NOOP_UNSUB,
        onConnected: () => NOOP_UNSUB,
        onDisconnected: () => NOOP_UNSUB,
        onMessage: () => NOOP_UNSUB,
        onError: () => NOOP_UNSUB,
        configure: async () => ({ success: false }),
        connect: async () => ({ success: false, error: 'Theia: sPrime stub' }),
        disconnect: async () => {
            /* no-op */
        },
        send: async () => {
            /* no-op */
        }
    };

    w.sPrime = {
        s0: { shell },
        s1: { journal, files, backlinks },
        s2: { graph },
        s3: { websocket },
        s4: {},
        s5: {},
        epiClaw
    } as unknown as Window['sPrime'];

    if (!w.electronAPI) {
        w.electronAPI = {} as unknown as Window['electronAPI'];
    }
}

installSPrimeStub();
