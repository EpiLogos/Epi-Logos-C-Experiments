import {
    PreferenceContribution,
    PreferenceSchema
} from '@theia/core/lib/browser/preferences';
import { injectable } from '@theia/core/shared/inversify';

export const EPI_LOGOS_PREFERENCES: PreferenceSchema = {
    type: 'object',
    properties: {
        'epi-logos.layout.active': {
            type: 'string',
            enum: ['daily-0-1', 'ide-deep'],
            default: 'daily-0-1',
            description: 'Active workspace layout (consumed by 11.2 cross-layout intent + 25.3 daily-0-1 gating)'
        },
        'epi-logos.profile.tick.visible': {
            type: 'boolean',
            default: true,
            description: 'Whether profile-tick state appears in the status bar'
        },
        'epi-logos.privacy.default-class': {
            type: 'string',
            enum: [
                'protected_local',
                'protected_local_handle_only',
                'public_pedagogy',
                'public_current_with_graph_provenance'
            ],
            default: 'protected_local',
            description: 'Default privacy class for new artifacts (PASU residency at protected_local per MEMORY)'
        },
        'epi-logos.kairos.enabled': {
            type: 'boolean',
            default: false,
            description: 'Whether the kerykeion kairos populator is active (FR-3 stub gate per 19.12)'
        },
        'epi-logos.motion.reduced': {
            type: 'boolean',
            default: false,
            description: 'Reduce motion in lemniscate transitions + tick choreography (30.5 a11y)'
        },
        'epi-logos.ui.developerMode': {
            type: 'boolean',
            default: false,
            description: 'Developer-mode gating for matheme proof overlays (22.6) + dev panels'
        },
        'epi-logos.keymap.preserveTheiaDefaults': {
            type: 'boolean',
            default: false,
            description: 'Preserve Theia default chord bindings (overrides cmd-period to cmd-shift-zero for 0/1 toggle per DR-WC-CC-2)'
        },
        'epi-logos.m1.vortex.faceMode': {
            type: 'string',
            enum: ['digit-root', 'raw'],
            default: 'digit-root',
            description: 'Vortex face-mode toggle (22 face-mode shared preference)'
        },
        'epi-logos.m2.devMode': {
            type: 'boolean',
            default: false,
            description: 'M2 parashakti proof-identity panel toggle (23.4; normalised from epiLogos.m2Parashakti.devMode per CCT-9)'
        }
    }
};

@injectable()
export class EpiLogosPreferenceContribution implements PreferenceContribution {
    readonly schema = EPI_LOGOS_PREFERENCES;
}
