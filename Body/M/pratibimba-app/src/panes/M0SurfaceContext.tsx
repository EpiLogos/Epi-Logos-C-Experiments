/**
 * Coordinate: M' M0' surface continuity
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M0' App-to-pane UI state boundary
 * Actualises: one App-owned M0 surface record across remounted daily/deep
 *   graph panes, without introducing a fifth gateway store.
 * Public surface: M0SurfaceProvider, useM0Surface.
 * Does NOT own: persistence, graph reads, M0 controls, or cross-layout intent.
 * Contract: [[M0'-SPEC]] and rerun tranche [[21.T21.20]].
 */

import { createContext, useContext } from 'react';
import type { M0SurfaceState } from './m0SurfaceState';

interface M0SurfaceContextValue {
    readonly state: M0SurfaceState;
    readonly update: (patch: Partial<M0SurfaceState>) => void;
}

const M0SurfaceContext = createContext<M0SurfaceContextValue | null>(null);

export function M0SurfaceProvider({
    state,
    update,
    children
}: M0SurfaceContextValue & { readonly children: React.ReactNode }) {
    return <M0SurfaceContext.Provider value={{ state, update }}>{children}</M0SurfaceContext.Provider>;
}

export function useM0Surface(): M0SurfaceContextValue {
    const context = useContext(M0SurfaceContext);
    if (!context) {
        throw new Error('M0 surface controls require the App-owned M0SurfaceProvider');
    }
    return context;
}
