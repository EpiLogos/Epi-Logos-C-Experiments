import * as React from 'react';
import type { M0AssetHandle, M0InspectorModel } from '../../common';

function assetHandleKey(handle: M0AssetHandle, index: number): string {
    return `${handle.kind}:${handle.uri || 'canonical-absent'}:${index}`;
}

function assetLabel(handle: M0AssetHandle): string {
    return handle.uri || `${handle.kind} handle absent`;
}

export function LanguageLayerPanel(props: {
    readonly model: Pick<M0InspectorModel, 'languageFields' | 'assetHandles'>;
}): React.ReactElement {
    const firstPresentAsset =
        props.model.assetHandles.find(handle => handle.state !== 'canonical_absent') ?? null;
    const [expandedAsset, setExpandedAsset] = React.useState<M0AssetHandle | null>(
        firstPresentAsset
    );
    const activeAsset =
        expandedAsset && props.model.assetHandles.includes(expandedAsset) ? expandedAsset : null;

    return (
        <section className="mext-widget-detail m0-language-layer-panel">
            <h3>Anuttara syntax fields</h3>
            <dl className="m0-language-layer-fields">
                {props.model.languageFields.map(field => (
                    <React.Fragment key={field.key}>
                        <dt>{field.label}</dt>
                        <dd
                            data-language-field-key={field.key}
                            data-provenance-state={field.state}
                        >
                            {field.value ?? field.provenance}
                        </dd>
                    </React.Fragment>
                ))}
            </dl>
            <div className="m0-language-layer-assets" data-testid="m0-language-layer-assets">
                {props.model.assetHandles.map((handle, index) => {
                    const selected = activeAsset === handle;
                    return (
                        <button
                            key={assetHandleKey(handle, index)}
                            type="button"
                            className="m0-language-layer-asset-thumb"
                            data-asset-kind={handle.kind}
                            data-provenance-state={handle.state}
                            aria-pressed={selected}
                            onClick={() =>
                                setExpandedAsset(selected || handle.state === 'canonical_absent' ? null : handle)
                            }
                        >
                            <span className="m0-language-layer-asset-kind">{handle.kind}</span>
                            <span className="m0-language-layer-asset-uri">{assetLabel(handle)}</span>
                        </button>
                    );
                })}
            </div>
            {activeAsset ? (
                <div
                    className="m0-language-layer-asset-expanded"
                    data-asset-kind={activeAsset.kind}
                    data-provenance-state={activeAsset.state}
                >
                    <dl>
                        <dt>Kind</dt>
                        <dd>{activeAsset.kind}</dd>
                        <dt>URI</dt>
                        <dd>
                            <a href={activeAsset.uri}>{activeAsset.uri}</a>
                        </dd>
                        <dt>State</dt>
                        <dd data-provenance-state={activeAsset.state}>{activeAsset.state}</dd>
                    </dl>
                </div>
            ) : null}
        </section>
    );
}
