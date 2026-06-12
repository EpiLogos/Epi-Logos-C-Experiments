import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

if (!globalThis.Element) {
    globalThis.Element = class Element {
        style = {};
        setAttribute() {
            return undefined;
        }
        removeAttribute() {
            return undefined;
        }
        matches() {
            return false;
        }
    };
}
if (!globalThis.document) {
    globalThis.document = {
        documentElement: new globalThis.Element(),
        createElement: () => new globalThis.Element(),
        querySelectorAll: () => [],
        queryCommandSupported: () => false
    };
}
if (!globalThis.window) {
    globalThis.window = {
        WebAssembly: globalThis.WebAssembly,
        navigator: { userAgent: 'node-test' },
        document: globalThis.document,
        localStorage: {
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined
        }
    };
}

const require = createRequire(import.meta.url);
require.extensions['.css'] = () => undefined;
try {
    const { FrontendApplicationConfigProvider } = require('@theia/core/lib/browser/frontend-application-config-provider');
    FrontendApplicationConfigProvider.set({ applicationName: 'M3 Mahamaya I-Ching cast ribbon test' });
} catch (err) {
    if (!String(err?.message ?? err).includes('already set')) {
        throw err;
    }
}

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const {
    M3IChingCastRibbon,
    M3_NUCLEOTIDE_I_CHING_CASTS,
    m3IChingCastModelFromSurface
} = require('../m3-mahamaya/lib/browser/components/M3IChingCastRibbon.js');

const SOURCE_FILE =
    '/Users/admin/Documents/Epi-Logos C Experiments/Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3IChingCastRibbon.tsx';

test('nucleotide 3-coin correspondence asserts A=6, T=9, C=7, G=8 suit and element law', () => {
    assert.deepEqual(mappingFor('A'), {
        lineValue: 6,
        lineName: 'Old Yin',
        tarotSuit: 'Cups',
        element: 'Water',
        coins: [2, 2, 2]
    });
    assert.deepEqual(mappingFor('T'), {
        lineValue: 9,
        lineName: 'Old Yang',
        tarotSuit: 'Wands',
        element: 'Fire',
        coins: [3, 3, 3]
    });
    assert.deepEqual(mappingFor('C'), {
        lineValue: 7,
        lineName: 'Young Yin',
        tarotSuit: 'Pentacles',
        element: 'Earth',
        coins: [2, 2, 3]
    });
    assert.deepEqual(mappingFor('G'), {
        lineValue: 8,
        lineName: 'Young Yang',
        tarotSuit: 'Swords',
        element: 'Air',
        coins: [2, 3, 3]
    });
});

test('cast ribbon derives bottom-to-top 3-coin line views from active M3 codon state', () => {
    const model = m3IChingCastModelFromSurface(surfaceForCodon('ATG'));

    assert.equal(model.ready, true);
    assert.equal(model.castMethod, 'three-coin');
    assert.deepEqual(model.lines.map(line => line.nucleotide), ['A', 'T', 'G']);
    assert.deepEqual(model.lines.map(line => line.lineValue), [6, 9, 8]);
    assert.deepEqual(model.lines.map(line => line.coinSum), [6, 9, 8]);
    assert.deepEqual(model.changingLineIndices, [0, 1]);
});

test('cast ribbon renders six cast-result lines, hexagram propagation, and RPC dispatch metadata', () => {
    const castResult = Object.freeze({
        castMethod: 'three-coin',
        lines: Object.freeze([6, 7, 8, 9, 6, 9]),
        primaryHexagramId: 1,
        derivedHexagramId: 2,
        changingLineIndices: Object.freeze([0, 3, 4, 5])
    });
    const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M3IChingCastRibbon, {
            surface: surfaceForCodon('ATC'),
            castResult,
            onCast: () => undefined
        })
    );

    assert.match(html, /data-widget-id="pratibimba\.m3-mahamaya:iching-cast-ribbon"/);
    assert.match(html, /data-rpc-method="s5\.oracle\.iching\.cast"/);
    assert.match(html, /data-cast-method="three-coin"/);
    assert.match(html, /data-line-count="6"/);
    assert.equal((html.match(/data-cast-line="/g) ?? []).length, 6);
    assert.match(html, /data-hexagram-role="primary" data-hexagram-id="1"/);
    assert.match(html, /data-hexagram-role="derived" data-hexagram-id="2"/);
    assert.match(html, /data-changing-lines="0,3,4,5"/);
});

test('cast ribbon source does not randomize locally', () => {
    const source = readFileSync(SOURCE_FILE, 'utf8');
    assert.doesNotMatch(source, /Math\.random|crypto\.getRandomValues|setInterval|requestAnimationFrame/);
    assert.match(source, /s5\.oracle\.iching\.cast/);
});

function mappingFor(nucleotide) {
    const entry = M3_NUCLEOTIDE_I_CHING_CASTS[nucleotide];
    return {
        lineValue: entry.lineValue,
        lineName: entry.lineName,
        tarotSuit: entry.tarotSuit,
        element: entry.element,
        coins: entry.coins.map(coin => coin.value)
    };
}

function surfaceForCodon(codon) {
    return Object.freeze({
        activeProjection: Object.freeze({
            codon,
            hexagramId: 1
        })
    });
}
