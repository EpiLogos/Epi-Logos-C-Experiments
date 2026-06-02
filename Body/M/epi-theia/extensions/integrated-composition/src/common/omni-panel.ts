import {
    IntegratedDeepLink,
    IntegratedDeepLinkPluginId,
    deepLinkForPlugin,
    formatIntegratedDeepLink
} from './integrated-deep-links';

/**
 * Omni panel cross-surface targeting — 08.T7 deliverable 1.
 *
 * The omni panel is the unified summon surface. A request comes in from
 * either a shell (the lightweight 0/1 Tauri app) or an internal alert
 * (M4/M5 notifications), and the panel resolves it to one of the two
 * integrated plugins.
 *
 * Rules:
 *   - Shell 0 (cosmic-facing) → cosmic-engine (1-2-3)
 *   - Shell 1 (personal-facing) → jiva-siva (4-5-0)
 *   - M1 / M2 / M3 alerts → cosmic-engine
 *   - M0 / M4 / M5 alerts → jiva-siva
 *   - Cross-cutting Epii canon alerts → jiva-siva (M5-owned)
 *
 * The mapping is intentionally simple and deterministic so deep links
 * built from omni-panel triggers are predictable.
 */
export type OmniPanelShellId = 'shell-0' | 'shell-1';

export type OmniPanelAlertKind =
    | 'm0.graph.provenance'
    | 'm0.review.requested'
    | 'm1.walk.step'
    | 'm1.klein_flip.source'
    | 'm2.meaning_packet'
    | 'm2.routing_trace'
    | 'm2.klein_flip'
    | 'm3.codon_projection'
    | 'm3.kernel_trace_view'
    | 'm4.artifact.created'
    | 'm4.privacy.blocked'
    | 'm5.review.transition'
    | 'm5.spine.event';

export type OmniPanelTrigger =
    | { readonly kind: 'shell'; readonly shellId: OmniPanelShellId }
    | { readonly kind: 'alert'; readonly alertKind: OmniPanelAlertKind };

export interface OmniPanelTarget {
    readonly pluginId: IntegratedDeepLinkPluginId;
    readonly deepLink: IntegratedDeepLink;
    readonly deepLinkUrl: string;
    readonly reason: string;
}

const ALERT_TO_PLUGIN: Record<OmniPanelAlertKind, IntegratedDeepLinkPluginId> = {
    'm0.graph.provenance': 'plugin-integrated-4-5-0',
    'm0.review.requested': 'plugin-integrated-4-5-0',
    'm1.walk.step': 'plugin-integrated-1-2-3',
    'm1.klein_flip.source': 'plugin-integrated-1-2-3',
    'm2.meaning_packet': 'plugin-integrated-1-2-3',
    'm2.routing_trace': 'plugin-integrated-1-2-3',
    'm2.klein_flip': 'plugin-integrated-1-2-3',
    'm3.codon_projection': 'plugin-integrated-1-2-3',
    'm3.kernel_trace_view': 'plugin-integrated-1-2-3',
    'm4.artifact.created': 'plugin-integrated-4-5-0',
    'm4.privacy.blocked': 'plugin-integrated-4-5-0',
    'm5.review.transition': 'plugin-integrated-4-5-0',
    'm5.spine.event': 'plugin-integrated-4-5-0'
};

export interface OmniPanelTargetOptions {
    readonly selectedCoordinate?: string | null;
    readonly profileGeneration?: number | null;
    readonly s3SessionHandle?: string | null;
    readonly s3DayNowHandle?: string | null;
}

export function omniPanelTargetFor(
    trigger: OmniPanelTrigger,
    options: OmniPanelTargetOptions = {}
): OmniPanelTarget {
    let pluginId: IntegratedDeepLinkPluginId;
    let reason: string;
    if (trigger.kind === 'shell') {
        if (trigger.shellId === 'shell-0') {
            pluginId = 'plugin-integrated-1-2-3';
            reason = 'shell-0 (cosmic-facing) maps to plugin-integrated-1-2-3';
        } else {
            pluginId = 'plugin-integrated-4-5-0';
            reason = 'shell-1 (personal-facing) maps to plugin-integrated-4-5-0';
        }
    } else {
        pluginId = ALERT_TO_PLUGIN[trigger.alertKind];
        reason = `alert ${trigger.alertKind} maps to ${pluginId}`;
    }
    const deepLink = deepLinkForPlugin(pluginId, {
        selectedCoordinate: options.selectedCoordinate ?? null,
        profileGeneration: options.profileGeneration ?? null,
        s3SessionHandle: options.s3SessionHandle ?? null,
        s3DayNowHandle: options.s3DayNowHandle ?? null,
        privacyScope: null,
        intendedInspector: null
    });
    return Object.freeze({
        pluginId,
        deepLink,
        deepLinkUrl: formatIntegratedDeepLink(deepLink),
        reason
    });
}
