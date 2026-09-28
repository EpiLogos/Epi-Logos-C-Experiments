import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

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

const SOURCE_FILE = fileURLToPath(
    new URL('../m3-mahamaya/src/browser/components/M3IChingCastRibbon.tsx', import.meta.url)
);

test('nucleotide 3-coin correspondence asserts A=6, T=9, C=8, G=7 suit and element law', () => {
    assert.deepEqual(mappingFor('A'), {
        lineValue: 6,
        lineName: 'Old Yin',
        tarotSuit: 'Cups',
        element: 'Water',
        lineShape: 'broken',
        coins: [2, 2, 2]
    });
    assert.deepEqual(mappingFor('T'), {
        lineValue: 9,
        lineName: 'Old Yang',
        tarotSuit: 'Wands',
        element: 'Fire',
        lineShape: 'solid',
        coins: [3, 3, 3]
    });
    assert.deepEqual(mappingFor('C'), {
        lineValue: 8,
        lineName: 'Young Yin',
        tarotSuit: 'Pentacles',
        element: 'Earth',
        lineShape: 'broken',
        coins: [3, 3, 2]
    });
    assert.deepEqual(mappingFor('G'), {
        lineValue: 7,
        lineName: 'Young Yang',
        tarotSuit: 'Swords',
        element: 'Air',
        lineShape: 'solid',
        coins: [2, 2, 3]
    });
});

test('cast ribbon derives bottom-to-top 3-coin line views from active M3 codon state', () => {
    const model = m3IChingCastModelFromSurface(surfaceForCodon('ATG'));

    assert.equal(model.ready, true);
    assert.equal(model.castMethod, 'three-coin');
    assert.deepEqual(model.lines.map(line => line.nucleotide), ['A', 'T', 'G']);
    assert.deepEqual(model.lines.map(line => line.lineValue), [6, 9, 7]);
    assert.deepEqual(model.lines.map(line => line.coinSum), [6, 9, 7]);
    assert.deepEqual(model.lines.map(line => line.lineShape), ['broken', 'solid', 'solid']);
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
    assert.match(html, /aria-label="A=6 T=9 C=8 G=7 correspondence"/);
    assert.match(html, /data-cast-line="1" data-line-value="7" data-line-name="Young Yang" data-line-shape="solid"/);
    assert.match(html, /data-cast-line="2" data-line-value="8" data-line-name="Young Yin" data-line-shape="broken"/);
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
        lineShape: entry.lineShape,
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
