import { injectable } from '@theia/core/shared/inversify';
import {
    MenuContribution,
    MenuModelRegistry,
    MAIN_MENU_BAR
} from '@theia/core/lib/common';

export const EPI_LOGOS_MENU = [...MAIN_MENU_BAR, '3_epi_logos'];
export const EPI_LOGOS_COSMIC_GROUP = [...EPI_LOGOS_MENU, '1_cosmic'];
export const EPI_LOGOS_PERSONAL_GROUP = [...EPI_LOGOS_MENU, '2_personal'];
export const EPI_LOGOS_COMPOSE_GROUP = [...EPI_LOGOS_MENU, '3_compose'];
export const EPI_LOGOS_DIAGNOSTICS_GROUP = [...EPI_LOGOS_MENU, '4_diagnostics'];

@injectable()
export class EpiLogosMenuContribution implements MenuContribution {
    registerMenus(menus: MenuModelRegistry): void {
        menus.registerSubmenu(EPI_LOGOS_MENU, 'Epi-Logos');

        // M0-M3 quick access.
        menus.registerMenuAction(EPI_LOGOS_COSMIC_GROUP, {
            commandId: 'm0-anuttara.openCoordinate',
            label: 'M0 Anuttara — Open Reader',
            order: '1'
        });
        menus.registerMenuAction(EPI_LOGOS_COSMIC_GROUP, {
            commandId: 'm1-paramasiva.openCoordinate',
            label: 'M1 Paramasiva — Open Instrument',
            order: '2'
        });
        menus.registerMenuAction(EPI_LOGOS_COSMIC_GROUP, {
            commandId: 'm2-parashakti.openCoordinate',
            label: 'M2 Paraśakti — Open Cymatic Engine',
            order: '3'
        });
        menus.registerMenuAction(EPI_LOGOS_COSMIC_GROUP, {
            commandId: 'm3-mahamaya.openCoordinate',
            label: 'M3 Mahāmāyā — Open Wheel',
            order: '4'
        });

        // M4-M5 plus personal-day tools.
        menus.registerMenuAction(EPI_LOGOS_PERSONAL_GROUP, {
            commandId: 'm4-nara.openArtifact',
            label: 'M4 Nara — Open Journal',
            order: '1'
        });
        menus.registerMenuAction(EPI_LOGOS_PERSONAL_GROUP, {
            commandId: 'm5-epii.openReview',
            label: 'M5 Epii — Open Atelier',
            order: '2'
        });
        menus.registerMenuAction(EPI_LOGOS_PERSONAL_GROUP, {
            commandId: 'm4-nara.day-calendar.focus',
            label: 'Day Calendar',
            order: '3'
        });
        menus.registerMenuAction(EPI_LOGOS_PERSONAL_GROUP, {
            commandId: 'm4-nara.pasu-identity.open',
            label: 'PASU Identity Wizard',
            order: '4'
        });

        // Integrated composition entries.
        menus.registerMenuAction(EPI_LOGOS_COMPOSE_GROUP, {
            commandId: 'plugin-integrated-1-2-3.open',
            label: 'Cosmic Engine (1-2-3)',
            order: '1'
        });
        menus.registerMenuAction(EPI_LOGOS_COMPOSE_GROUP, {
            commandId: 'plugin-integrated-4-5-0.open',
            label: 'Personal Recognition (4-5-0)',
            order: '2'
        });

        // Diagnostics and active-state quick jumps.
        menus.registerMenuAction(EPI_LOGOS_DIAGNOSTICS_GROUP, {
            commandId: 'omnipanel.tab.activate.6',
            label: 'Open Gateway Diagnostics',
            order: '1'
        });
        menus.registerMenuAction(EPI_LOGOS_DIAGNOSTICS_GROUP, {
            commandId: 'omnipanel.tab.activate.7',
            label: 'Open Bridge Diagnostics',
            order: '2'
        });
        menus.registerMenuAction(EPI_LOGOS_DIAGNOSTICS_GROUP, {
            commandId: 'pratibimba.state-thread.jump-to-coordinate',
            label: 'Jump to Active Coordinate',
            order: '3'
        });
    }
}
