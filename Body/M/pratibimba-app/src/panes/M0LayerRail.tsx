/**
 * Coordinate: M' M0' (six-layer rail, rerun 01.T1.1)
 * Actualises: the M0-X' layer discriminator as a visible surface on the M0'
 *   graph pane — local layers select the active read register; bridged layers
 *   (M0-4' personal, M0-5' pedagogy) carry live deep-links scoped to the
 *   shared selected coordinate. Read-only affordance; no canon mutation.
 * Does NOT own: per-layer rendering (T1.5/T1.9 land those), the bridged
 *   M4'/M5' surfaces the links route into.
 */

import { useState } from 'react';
import { useCoordinateStore } from '../state/stores';
import { bridgedLayerRoute, M0LayerKey, M0_LAYER_VIEWS } from './m0Layers';

export function M0LayerRail() {
    const selected = useCoordinateStore(s => s.selected);
    const [active, setActive] = useState<M0LayerKey>('language');

    return (
        <div className="pane-toolbar m0-layer-rail" data-testid="m0-layer-rail">
            {M0_LAYER_VIEWS.map(layer =>
                layer.placement === 'local' ? (
                    <button
                        key={layer.key}
                        data-testid={`m0-layer-${layer.key}`}
                        data-active={active === layer.key ? 'true' : 'false'}
                        title={`${layer.label} — ${layer.summary}`}
                        onClick={() => setActive(layer.key)}
                    >
                        {layer.id}
                    </button>
                ) : (
                    <a
                        key={layer.key}
                        data-testid={`m0-layer-${layer.key}`}
                        href={bridgedLayerRoute(layer, selected) ?? undefined}
                        title={`${layer.label} — ${layer.summary}`}
                    >
                        {layer.id} ↗
                    </a>
                )
            )}
        </div>
    );
}
