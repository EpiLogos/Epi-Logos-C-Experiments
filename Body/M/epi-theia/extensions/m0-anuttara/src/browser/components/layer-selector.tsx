import * as React from 'react';
import { M0_LAYER_VIEWS } from '../../common/m0-layers';
import type { M0LayerKey, M0LayerView } from '../../common/m0-layers';
import type { M0ProvenanceState } from '../../common/m0-inspector';

export interface LayerSelectorProps {
    readonly initialLayer?: number;
    readonly layerReadiness?: Partial<Record<M0LayerKey, M0ProvenanceState>>;
    readonly onLayerChange?: (index: number) => void;
    readonly className?: string;
}

type LayerTabGrammar = Readonly<{
    readonly glyph: string;
    readonly label: string;
}>;

const LAYER_TAB_GRAMMAR: readonly LayerTabGrammar[] = Object.freeze([
    { glyph: '(-)', label: 'Mirror' },
    { glyph: '0/1', label: 'Binary' },
    { glyph: '0', label: 'Sat' },
    { glyph: '1', label: 'Magician' },
    { glyph: '2', label: 'Sunyata' },
    { glyph: '[]', label: 'Palette' }
]);

const DEFAULT_LAYER_INDEX = 0;

function normalizeLayerIndex(index: number | undefined): number {
    if (typeof index !== 'number' || !Number.isInteger(index)) {
        return DEFAULT_LAYER_INDEX;
    }
    return Math.min(Math.max(index, 0), M0_LAYER_VIEWS.length - 1);
}

function tabIdForLayer(index: number): string {
    return `m0-layer-selector-tab-${index}`;
}

function panelIdForLayer(index: number): string {
    return `m0-layer-selector-panel-${index}`;
}

function layerTabLabel(layer: M0LayerView, index: number): LayerTabGrammar {
    return LAYER_TAB_GRAMMAR[index] ?? { glyph: layer.id, label: layer.label };
}

export function LayerSelector(props: LayerSelectorProps): React.ReactElement {
    const { className: classNameProp, initialLayer, layerReadiness, onLayerChange } = props;
    const [activeLayer, setActiveLayer] = React.useState(() =>
        normalizeLayerIndex(initialLayer)
    );

    const selectLayer = React.useCallback(
        (index: number) => {
            if (index === activeLayer) {
                return;
            }
            setActiveLayer(index);
            onLayerChange?.(index);
        },
        [activeLayer, onLayerChange]
    );

    const className = ['m0-layer-tabs', classNameProp].filter(Boolean).join(' ');
    const activeView = M0_LAYER_VIEWS[activeLayer];

    return (
        <div className="m0-layer-selector">
            <div role="tablist" aria-label="M0 Anuttara layer selector" className={className}>
                {M0_LAYER_VIEWS.map((layer, index) => {
                    const grammar = layerTabLabel(layer, index);
                    const selected = index === activeLayer;
                    const readiness = layerReadiness?.[layer.key] ?? 'canonical_absent';

                    return (
                        <button
                            key={layer.id}
                            id={tabIdForLayer(index)}
                            type="button"
                            role="tab"
                            aria-selected={selected}
                            aria-controls={panelIdForLayer(index)}
                            data-layer-index={index}
                            data-layer-id={layer.id}
                            data-layer-key={layer.key}
                            title={layer.label}
                            onClick={() => selectLayer(index)}
                        >
                            <span aria-hidden="true" className="m0-layer-tab-glyph">
                                {grammar.glyph}
                            </span>
                            <span className="m0-layer-tab-label">{grammar.label}</span>
                            <span
                                aria-label={`${layer.label} provenance ${readiness}`}
                                className="m0-layer-tab-provenance-pill"
                                data-provenance-state={readiness}
                            >
                                {readiness.replace(/_/g, ' ')}
                            </span>
                        </button>
                    );
                })}
            </div>
            <div
                id={panelIdForLayer(activeLayer)}
                role="tabpanel"
                aria-labelledby={tabIdForLayer(activeLayer)}
                data-active-layer={activeLayer}
                data-layer-id={activeView.id}
                data-layer-key={activeView.key}
                hidden
            >
                {activeView.label}
            </div>
        </div>
    );
}

export default LayerSelector;
