#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer');

const EXTENSIONS = [
    ['m0-anuttara', 'm0.openCoordinate', 'm0.anuttara.languageMap'],
    ['m1-paramasiva', 'm1.startWalk', 'm1.paramasiva.clockInstrument'],
    ['m2-parashakti', 'm2.openMeaningPacket', 'm2.parashakti.meaningPacket'],
    ['m3-mahamaya', 'm3.openCodon', 'm3.mahamaya.cosmicWheel'],
    ['m4-nara', 'm4.openArtifact', 'm4.nara.dayContainer'],
    ['m5-epii', 'm5.openReview', 'm5.epii.reviewQueue']
];

const chromePath =
    process.env.CHROME_PATH ||
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage']
});

try {
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.stack || error.message));

    await page.goto('http://127.0.0.1:3000/?verify=07T1-commands', {
        waitUntil: 'networkidle2',
        timeout: 30000
    });
    await page.waitForFunction(
        () => !!document.querySelector('.theia-ApplicationShell'),
        { timeout: 40000 }
    );

    for (const [, commandId, viewId] of EXTENSIONS) {
        await page.evaluate(async id => {
            const container = window.theia.container;
            let commandRegistryId;
            for (const [key] of container._bindingDictionary._map.entries()) {
                const description =
                    typeof key === 'symbol'
                        ? key.toString()
                        : key && key.name
                          ? key.name
                          : String(key);
                if (description === 'CommandRegistry') {
                    commandRegistryId = key;
                    break;
                }
            }
            if (!commandRegistryId) {
                throw new Error('CommandRegistry binding not found');
            }
            await container.get(commandRegistryId).executeCommand(id);
        }, commandId);
        await page.waitForFunction(
            candidate => !!document.getElementById(candidate),
            { timeout: 20000 },
            viewId
        );
    }

    const result = await page.evaluate(ids => {
        const widgets = {};
        for (const [id, , viewId] of ids) {
            const widget = document.getElementById(viewId);
            widgets[id] = {
                hasWidget: !!widget,
                hasBlockedReadiness: !!widget?.innerText.includes('bridge_unavailable'),
                hasNoProfile: !!widget?.innerText.includes('No MathemeHarmonicProfile available yet'),
                text: widget?.innerText || ''
            };
        }
        return {
            title: document.title,
            hasShell: !!document.querySelector('.theia-ApplicationShell'),
            widgets
        };
    }, EXTENSIONS);

    assert.deepEqual(pageErrors, []);
    assert.match(result.title, /Pratibimba System|M[0-5] — /);
    assert.equal(result.hasShell, true);
    for (const [id] of EXTENSIONS) {
        assert.equal(result.widgets[id].hasWidget, true, `${id} widget should mount`);
        assert.equal(
            result.widgets[id].hasBlockedReadiness,
            true,
            `${id} should show blocked bridge readiness`
        );
        assert.equal(
            result.widgets[id].hasNoProfile,
            true,
            `${id} should not fabricate profile data`
        );
    }

    console.log(JSON.stringify(result, null, 2));
} finally {
    await browser.close();
}
