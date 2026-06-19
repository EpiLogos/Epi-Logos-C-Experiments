import { IconThemeContribution } from '@theia/core/lib/browser/icon-theme-contribution';
import { IconTheme, IconThemeService } from '@theia/core/lib/browser/icon-theme-service';
import { Disposable } from '@theia/core/lib/common/disposable';

export type PratibimbaIconName =
    | 'coordinate-tree'
    | 'bimba-graph-viewer'
    | 'canon-studio'
    | 'backend-studio'
    | 'smart-connections'
    | 'coin-flip'
    | 'lemniscate'
    | 'family-m0-anuttara'
    | 'family-m1-paramasiva'
    | 'family-m2-parashakti'
    | 'family-m3-mahamaya'
    | 'family-m4-nara'
    | 'family-m5-epii'
    | 'family-p'
    | 'family-s'
    | 'family-t'
    | 'family-m'
    | 'family-l'
    | 'family-c';

export interface PratibimbaIconThemeRegistration {
    readonly id: `pratibimba.icon.${PratibimbaIconName}`;
    readonly name: PratibimbaIconName;
    readonly assetPath: `contracts/icons/${PratibimbaIconName}.svg`;
    readonly codiconFallback: string;
}

export interface PratibimbaActivityBarIconBinding {
    readonly modeId: string;
    readonly widgetId: string;
    readonly iconId: PratibimbaIconThemeRegistration['id'];
    readonly iconRef: string;
    readonly codiconFallback: string;
    readonly slot: 'widget.application-shell-left';
}

export const PRATIBIMBA_ICON_THEME_ID = 'pratibimba-iconography';
export const PRATIBIMBA_ICON_THEME_LABEL = 'Pratibimba Iconography';

export const PRATIBIMBA_ICON_THEME_REGISTRATIONS: readonly PratibimbaIconThemeRegistration[] = Object.freeze([
    registration('coordinate-tree', 'list-tree'),
    registration('bimba-graph-viewer', 'graph'),
    registration('canon-studio', 'book'),
    registration('backend-studio', 'server-process'),
    registration('smart-connections', 'circuit-board'),
    registration('coin-flip', 'sync'),
    registration('lemniscate', 'symbol-operator'),
    registration('family-m0-anuttara', 'circle-large-outline'),
    registration('family-m1-paramasiva', 'pulse'),
    registration('family-m2-parashakti', 'radio-tower'),
    registration('family-m3-mahamaya', 'symbol-enum'),
    registration('family-m4-nara', 'person'),
    registration('family-m5-epii', 'references'),
    registration('family-p', 'primitive-square'),
    registration('family-s', 'layers'),
    registration('family-t', 'edit'),
    registration('family-m', 'symbol-namespace'),
    registration('family-l', 'eye'),
    registration('family-c', 'symbol-class')
]);

export const PRATIBIMBA_ACTIVITY_BAR_ICON_BINDINGS: readonly PratibimbaActivityBarIconBinding[] = Object.freeze([
    activityBinding('pratibimba.activity-bar.coordinate-tree', 'pratibimba.coordinate-tree', 'coordinate-tree'),
    activityBinding('pratibimba.activity-bar.bimba-graph-viewer', 'pratibimba.bimba-graph-viewer', 'bimba-graph-viewer'),
    activityBinding('pratibimba.activity-bar.canon-studio', 'pratibimba.canon-studio', 'canon-studio'),
    activityBinding('pratibimba.activity-bar.backend-studio', 'pratibimba.backend-studio', 'backend-studio'),
    activityBinding('pratibimba.activity-bar.smart-connections', 'pratibimba.smart-connections-sidebar', 'smart-connections')
]);

export class PratibimbaIconTheme implements IconTheme {
    readonly id = PRATIBIMBA_ICON_THEME_ID;
    readonly label = PRATIBIMBA_ICON_THEME_LABEL;
    readonly description = 'Custom Epi-Logos/Pratibimba product icon set with Theia Codicons fallback.';
    readonly hasFileIcons = false;
    readonly hasFolderIcons = false;
    readonly showLanguageModeIcons = false;

    activate(): Disposable {
        return Disposable.NULL;
    }
}

export class PratibimbaIconThemeContribution implements IconThemeContribution {
    registerIconThemes(iconThemes: IconThemeService): void {
        iconThemes.register(new PratibimbaIconTheme());
    }
}

export function resolvePratibimbaIconRegistration(id: string): PratibimbaIconThemeRegistration | undefined {
    return PRATIBIMBA_ICON_THEME_REGISTRATIONS.find(registrationEntry => registrationEntry.id === id);
}

function registration(name: PratibimbaIconName, codiconFallback: string): PratibimbaIconThemeRegistration {
    return Object.freeze({
        id: `pratibimba.icon.${name}`,
        name,
        assetPath: `contracts/icons/${name}.svg`,
        codiconFallback
    });
}

function activityBinding(
    modeId: string,
    widgetId: string,
    iconName: Extract<
        PratibimbaIconName,
        'coordinate-tree' | 'bimba-graph-viewer' | 'canon-studio' | 'backend-studio' | 'smart-connections'
    >
): PratibimbaActivityBarIconBinding {
    const iconId = `pratibimba.icon.${iconName}` as const;
    const iconRegistration = resolvePratibimbaIconRegistration(iconId);
    return Object.freeze({
        modeId,
        widgetId,
        iconId,
        iconRef: `$(${iconId})`,
        codiconFallback: `$(${iconRegistration?.codiconFallback ?? 'gear'})`,
        slot: 'widget.application-shell-left'
    });
}
