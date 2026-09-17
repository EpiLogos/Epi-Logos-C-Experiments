import * as React from 'react';
import { bridgedLayerRoute } from '../../common/m0-layers';
import type { M0LayerBridgedView } from '../../common/m0-layers';

/**
 * 21.6 — Bridged-Layer Launcher (M0-4' / M0-5' deep-link buttons).
 *
 * Source rows WC-M0-06 (personal, M0-4' → m4-nara) + WC-M0-07 (pedagogy,
 * M0-5' → m5-epii).
 *
 * The two bridged M0-X' layers are NOT rendered on the M0' surface — they are
 * owned by the M4'/M5' surfaces. This launcher renders a disclosure card per
 * bridged layer (bridge target label, summary, privacy-class disclosure) and a
 * single "Open in …" affordance that builds the canonical deep-link route via
 * {@link bridgedLayerRoute} and hands it to the host through {@link onDispatch}.
 *
 * The host wires {@link onDispatch} to Theia's CommandRegistry, dispatching the
 * intent envelope from {@link buildBridgedLayerIntent} —
 * `CommandRegistry.executeCommand('omnipanel.intent.dispatch', { requestedExtensionId,
 * requestedContributionId: 'artifact', coordinate, source: 'm0-anuttara' })`. The
 * bridge target is the canon owner: this component NEVER renders the bridged
 * payload locally, and never reads a layer's protected/personal data — it only
 * discloses the privacy class as a label and routes.
 */
export interface BridgedLayerLauncherProps {
    readonly layer: M0LayerBridgedView;
    readonly currentCoordinate: string | null;
    readonly onDispatch: (route: string) => void;
}

/**
 * Privacy class disclosed (not enforced) by the launcher card. M0-4' personal
 * context is `protected_local`; M0-5' pedagogy context is `public_pedagogy`.
 * The launcher shows this so the operator knows the disclosure boundary BEFORE
 * the bridge target opens — the launcher itself never reads the payload.
 */
export type BridgedLayerPrivacyClass = 'protected_local' | 'public_pedagogy';

/** The canonical omnipanel.intent.dispatch command id the host routes through. */
export const OMNIPANEL_INTENT_DISPATCH = 'omnipanel.intent.dispatch';

/**
 * Derive the privacy-class disclosure for a bridged layer from its key. Personal
 * (M0-4') is protected-local; pedagogy (M0-5') is public-pedagogy.
 */
export function bridgedLayerPrivacyClass(
    layer: M0LayerBridgedView
): BridgedLayerPrivacyClass {
    return layer.key === 'pedagogy' ? 'public_pedagogy' : 'protected_local';
}

/**
 * The intent envelope the host passes to
 * `CommandRegistry.executeCommand('omnipanel.intent.dispatch', …)`. Mirrors the
 * M0 authoring deep-link shape ({@link buildM0AuthoringIntent}) but routes into
 * the bridged extension that owns the layer.
 */
export function buildBridgedLayerIntent(
    layer: M0LayerBridgedView,
    coordinate: string | null
): Readonly<{
    readonly requestedExtensionId: string;
    readonly requestedContributionId: 'artifact';
    readonly coordinate: string | null;
    readonly source: 'm0-anuttara';
}> {
    return Object.freeze({
        requestedExtensionId: layer.bridgeExtensionId,
        requestedContributionId: 'artifact',
        coordinate,
        source: 'm0-anuttara'
    });
}

export const BridgedLayerLauncher: React.FC<BridgedLayerLauncherProps> = (
    props: BridgedLayerLauncherProps
) => {
    const { layer, currentCoordinate, onDispatch } = props;
    const privacyClass = bridgedLayerPrivacyClass(layer);

    const openBridge = React.useCallback(() => {
        const route = bridgedLayerRoute(layer, currentCoordinate);
        if (route === null) {
            return;
        }
        onDispatch(route);
    }, [layer, currentCoordinate, onDispatch]);

    return (
        <section
            className="mext-widget-detail m0-bridged-layer-launcher"
            data-extension-id="m0-anuttara"
            data-layer-id={layer.id}
            data-layer-key={layer.key}
            data-bridge-extension-id={layer.bridgeExtensionId}
            data-privacy-class={privacyClass}
        >
            <header className="m0-bridged-layer-launcher-header">
                <span
                    className="m0-bridged-layer-launcher-target"
                    data-test="m0-bridged-target-label"
                >
                    {layer.label}
                </span>
                <span
                    className="m0-bridged-layer-launcher-privacy"
                    data-test="m0-bridged-privacy-class"
                    data-privacy-class={privacyClass}
                    aria-label={`Privacy class ${privacyClass.replace(/_/g, ' ')}`}
                >
                    {privacyClass.replace(/_/g, ' ')}
                </span>
            </header>
            <p className="m0-bridged-layer-launcher-summary">{layer.summary}</p>
            <button
                type="button"
                className="m0-bridged-layer-launcher-open"
                data-test="m0-bridged-open-button"
                data-bridge-extension-id={layer.bridgeExtensionId}
                onClick={openBridge}
            >
                {`Open in ${layer.bridgeExtensionId}`}
            </button>
        </section>
    );
};

export default BridgedLayerLauncher;
