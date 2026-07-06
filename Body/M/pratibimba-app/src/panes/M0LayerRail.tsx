/**
 * Coordinate: M' M0' (six-layer rail, rerun 01.T1.1 + routing model 09.T9.1)
 * Actualises: the M0-X' layer discriminator as a visible surface on the M0'
 *   graph pane — local layers select the active read register (tab routes per
 *   the frozen m0-inspector law, cross-pane switching via `m0.layer.*`
 *   commands); bridged layers (M0-4' personal, M0-5' pedagogy) carry live
 *   deep-links scoped to the shared selected coordinate. Read-only affordance;
 *   no canon mutation.
 * Does NOT own: per-layer rendering (T1.5/T1.9 land those), the bridged
 *   M4'/M5' surfaces the links route into, any state store (four-store law —
 *   layer selection is pane-local, cross-pane intent is the command registry).
 */

import { useEffect, useState } from 'react';
import { commands } from '../commands/registry';
import { useCoordinateStore } from '../state/stores';
import { bridgedLayerRoute, M0InspectorLayer, M0_LAYER_ROUTES } from './m0Layers';

export interface M0LayerRailProps {
    onLayerChange?: (layer: M0InspectorLayer) => void;
}

export function M0LayerRail({ onLayerChange }: M0LayerRailProps = {}) {
    const selected = useCoordinateStore(s => s.selected);
    const [active, setActive] = useState<M0InspectorLayer>('lang');

    useEffect(() => {
        const disposers = M0_LAYER_ROUTES.filter(
            route => route.view.placement === 'local'
        ).map(route =>
            commands.register({
                id: route.commandId,
                title: `M0': ${route.view.label} layer`,
                run: () => {
                    setActive(route.layer);
                    onLayerChange?.(route.layer);
                }
            })
        );
        return () => disposers.forEach(dispose => dispose());
    }, [onLayerChange]);

    return (
        <div className="pane-toolbar m0-layer-rail" data-testid="m0-layer-rail">
            {M0_LAYER_ROUTES.map(route =>
                route.view.placement === 'local' ? (
                    <button
                        key={route.layer}
                        data-testid={`m0-layer-${route.layerKey}`}
                        data-active={active === route.layer ? 'true' : 'false'}
                        data-route={route.routePath}
                        title={`${route.view.label} — ${route.view.summary}`}
                        onClick={() => {
                            setActive(route.layer);
                            onLayerChange?.(route.layer);
                        }}
                    >
                        {route.view.id}
                    </button>
                ) : (
                    <a
                        key={route.layer}
                        data-testid={`m0-layer-${route.layerKey}`}
                        data-route={route.routePath}
                        href={bridgedLayerRoute(route.view, selected) ?? undefined}
                        title={`${route.view.label} — ${route.view.summary}`}
                    >
                        {route.view.id} ↗
                    </a>
                )
            )}
        </div>
    );
}
