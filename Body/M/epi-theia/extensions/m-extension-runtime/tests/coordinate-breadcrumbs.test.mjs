import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const URI = require('@theia/core/lib/common/uri').default;
const breadcrumbs = require('../lib/browser/breadcrumbs/coordinate-breadcrumbs-contribution.js');

function createContribution(selectedCoordinate) {
    const contribution = new breadcrumbs.EpiLogosCoordinateBreadcrumbsContribution();
    const commandCalls = [];

    contribution.bridge = {
        currentSnapshot() {
            return {
                context: {
                    selectedCoordinate,
                    canonicalMCoordinate: null,
                    hashInput: null
                }
            };
        },
        onCoordinateContext() {
            return { dispose() {} };
        }
    };
    contribution.commands = {
        executeCommand(command, payload) {
            commandCalls.push({ command, payload });
        }
    };

    return { contribution, commandCalls };
}

test('breadcrumb render test maps synthetic M4-3 to M4 / Nara / DayContainer', async () => {
    const parsed = breadcrumbs.parseCoordinate('M4-3');
    assert.equal(parsed.family, 'M4');
    assert.equal(parsed.archetypeName, 'Nara');
    assert.equal(parsed.positionName, 'DayContainer');

    const { contribution } = createContribution('M4-3');
    const rendered = await contribution.computeBreadcrumbs(new URI('file:///tmp/now.md'));

    assert.deepEqual(rendered.map(breadcrumb => breadcrumb.label), [
        'M4',
        'Nara',
        'DayContainer'
    ]);
    assert.equal(rendered.length, 3);
});

test('clicking the M4 segment dispatches omnipanel.intent.dispatch with reduced coordinate', async () => {
    const { contribution, commandCalls } = createContribution('M4-3');
    const rendered = await contribution.computeBreadcrumbs(new URI('file:///tmp/now.md'));

    await contribution.attachPopupContent(rendered[0], { dataset: {} });

    assert.deepEqual(commandCalls, [
        {
            command: breadcrumbs.OMNIPANEL_INTENT_DISPATCH,
            payload: {
                coordinate: 'M4',
                source: 'epi-logos.coordinate-breadcrumbs'
            }
        }
    ]);
});

test('frontend module registers the Epi-Logos coordinate BreadcrumbsContribution', () => {
    const source = readFileSync(
        new URL('../src/browser/frontend-module.ts', import.meta.url),
        'utf8'
    );

    assert.match(source, /BreadcrumbsContribution/);
    assert.match(source, /EpiLogosCoordinateBreadcrumbsContribution/);
    assert.match(source, /bind\(BreadcrumbsContribution\)\.toService\(EpiLogosCoordinateBreadcrumbsContribution\)/);
});
