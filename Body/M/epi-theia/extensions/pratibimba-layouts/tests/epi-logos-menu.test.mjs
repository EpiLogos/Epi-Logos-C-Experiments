import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourceRoot = resolve(__dirname, '../src/browser');

async function readBrowserSource(fileName) {
    return readFile(resolve(sourceRoot, fileName), 'utf8');
}

test('Epi-Logos menu contribution declares top-level order and four menu groups', async () => {
    const source = await readBrowserSource('epi-logos-menu.ts');

    assert.match(source, /export const EPI_LOGOS_MENU = \[\.\.\.MAIN_MENU_BAR, '3_epi_logos'\];/);
    assert.match(source, /export const EPI_LOGOS_COSMIC_GROUP = \[\.\.\.EPI_LOGOS_MENU, '1_cosmic'\];/);
    assert.match(source, /export const EPI_LOGOS_PERSONAL_GROUP = \[\.\.\.EPI_LOGOS_MENU, '2_personal'\];/);
    assert.match(source, /export const EPI_LOGOS_COMPOSE_GROUP = \[\.\.\.EPI_LOGOS_MENU, '3_compose'\];/);
    assert.match(source, /export const EPI_LOGOS_DIAGNOSTICS_GROUP = \[\.\.\.EPI_LOGOS_MENU, '4_diagnostics'\];/);
    assert.match(source, /menus\.registerSubmenu\(EPI_LOGOS_MENU, 'Epi-Logos'\);/);
});

test('Epi-Logos menu contribution registers every canonical quick-access command', async () => {
    const source = await readBrowserSource('epi-logos-menu.ts');
    const expectedCommands = [
        'm0-anuttara.openCoordinate',
        'm1-paramasiva.openCoordinate',
        'm2-parashakti.openCoordinate',
        'm3-mahamaya.openCoordinate',
        'm4-nara.openArtifact',
        'm5-epii.openReview',
        'm4-nara.day-calendar.focus',
        'm4-nara.pasu-identity.open',
        'plugin-integrated-1-2-3.open',
        'plugin-integrated-4-5-0.open',
        'omnipanel.tab.activate.6',
        'omnipanel.tab.activate.7',
        'pratibimba.state-thread.jump-to-coordinate'
    ];

    for (const commandId of expectedCommands) {
        assert.match(source, new RegExp(`commandId: '${commandId.replaceAll('.', '\\.')}'`));
    }
});

test('chrome catalog records the Epi-Logos menu commands from tranche 31.5', async () => {
    const catalogPath = resolve(__dirname, '../../contracts/chrome-contributions-catalog.json');
    const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
    const trancheMenuCommandIds = catalog.menuItems
        .filter(item => item.owningExtension === 'pratibimba-layouts')
        .filter(item => item.declaringTranche === '31.5')
        .map(item => item.commandId);

    assert.deepEqual(trancheMenuCommandIds, [
        'm0-anuttara.openCoordinate',
        'm1-paramasiva.openCoordinate',
        'm2-parashakti.openCoordinate',
        'm3-mahamaya.openCoordinate',
        'm4-nara.openArtifact',
        'm5-epii.openReview',
        'm4-nara.day-calendar.focus',
        'm4-nara.pasu-identity.open',
        'plugin-integrated-1-2-3.open',
        'plugin-integrated-4-5-0.open',
        'omnipanel.tab.activate.6',
        'omnipanel.tab.activate.7',
        'pratibimba.state-thread.jump-to-coordinate'
    ]);
});

test('frontend module binds Epi-Logos and Pratibimba menu contributions side by side', async () => {
    const source = await readBrowserSource('frontend-module.ts');

    assert.match(source, /import \{ EpiLogosMenuContribution \} from '\.\/epi-logos-menu';/);
    assert.match(source, /bind\(EpiLogosMenuContribution\)\.toSelf\(\)\.inSingletonScope\(\);/);
    assert.match(source, /bind\(MenuContribution\)\.toService\(EpiLogosMenuContribution\);/);
    assert.match(source, /bind\(MenuContribution\)\.toService\(PratibimbaLayoutCommandContribution\);/);
});

test('Epi-Logos menubar position remains left of Pratibimba', async () => {
    const epiLogosSource = await readBrowserSource('epi-logos-menu.ts');
    const pratibimbaSource = await readBrowserSource('layout-commands.ts');

    assert.match(epiLogosSource, /'3_epi_logos'/);
    assert.match(pratibimbaSource, /'5_pratibimba'/);
});
