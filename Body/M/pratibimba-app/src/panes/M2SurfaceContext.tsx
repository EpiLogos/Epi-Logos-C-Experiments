/**
 * Coordinate: M' M2' surface continuity
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M2' App-to-pane UI state boundary
 * Actualises: one App-owned M2 interaction record across remounted cosmic
 *   correspondence panes, without another gateway store.
 * Public surface: M2SurfaceProvider, useM2Surface.
 * Does NOT own: persistence, correspondence reads, M2 controls, or routing.
 * Contract: [[M2'-SPEC]] and rerun tranche [[23.T23.15]].
 */

import { createContext, type ReactNode, useContext } from 'react';
import type { M2SurfaceState } from './m2SurfaceState';

interface M2SurfaceContextValue {
    readonly state: M2SurfaceState;
    readonly update: (patch: Partial<M2SurfaceState>) => void;
}

const M2SurfaceContext = createContext<M2SurfaceContextValue | null>(null);

export function M2SurfaceProvider({
    state,
    update,
    children
}: M2SurfaceContextValue & { readonly children: ReactNode }) {
    return <M2SurfaceContext.Provider value={{ state, update }}>{children}</M2SurfaceContext.Provider>;
}

export function useM2Surface(): M2SurfaceContextValue {
    const context = useContext(M2SurfaceContext);
    if (!context) {
        throw new Error('M2 surface controls require the App-owned M2SurfaceProvider');
    }
    return context;
}
