import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

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
        queryCommandSupported: () => false,
        body: new globalThis.Element()
    };
}
if (!globalThis.window) {
    globalThis.window = {
        WebAssembly: globalThis.WebAssembly,
        navigator: { userAgent: 'node-test' },
        document: globalThis.document,
        innerWidth: 1200,
        innerHeight: 800,
        localStorage: {
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined
        }
    };
}

const require = createRequire(import.meta.url);
require.extensions['.css'] = () => undefined;
require('@theia/core/lib/browser/frontend-application-config-provider')
    .FrontendApplicationConfigProvider
    .set({ applicationName: 'm4-nara-medicine-node-test' });

const {
    L2_CANONICAL_ELEMENT_IDS,
    buildMedicineBriefing,
    computeActiveDecan,
    readSunDegree
} = require('../m4-nara/lib/browser/widgets/medicine-view.js');

function profileWithSun(sunDegree) {
    return {
        payload: {
            M4_Temporal_Now: {
                planet_degrees: [sunDegree]
            }
        }
    };
}

function makeSnapshot() {
    const decanBodyParts = Array.from({ length: 36 }, (_, index) => `body-part-${index}`);
    const decanHerbs = Array.from({ length: 36 }, (_, index) => [
        {
            vernacular: `herb-${index}`,
            botanical: `Botanica ${index}`
        }
    ]);
    const zodiacalBridge = Array.from({ length: 12 }, (_, signIdx) => ({
        signName: `Sign ${signIdx}`,
        decanPlanets:
            signIdx === 4
                ? ['Sun', 'Mars', 'Jupiter']
                : ['Mercury', 'Venus', 'Saturn']
    }));
    return {
        chakras: [],
        decanBodyParts,
        decanHerbs,
        zodiacalBridge,
        planetChakra: { Sun: 7, Mars: 4, Jupiter: 5 },
        planetGlyphs: { Sun: 'SUN', Mars: 'MARS', Jupiter: 'JUPITER' }
    };
}

test('active decan rotates from synthetic M4_Temporal_Now.planet_degrees[Sun]', () => {
    const cases = [
        [0, { signIdx: 0, decanInSign: 0, decanIdx: 0 }],
        [9.999, { signIdx: 0, decanInSign: 0, decanIdx: 0 }],
        [10, { signIdx: 0, decanInSign: 1, decanIdx: 1 }],
        [29.999, { signIdx: 0, decanInSign: 2, decanIdx: 2 }],
        [30, { signIdx: 1, decanInSign: 0, decanIdx: 3 }],
        [123.4, { signIdx: 4, decanInSign: 0, decanIdx: 12 }],
        [359.9, { signIdx: 11, decanInSign: 2, decanIdx: 35 }],
        [360, { signIdx: 0, decanInSign: 0, decanIdx: 0 }],
        [-1, { signIdx: 11, decanInSign: 2, decanIdx: 35 }]
    ];

    for (const [sunDegree, expected] of cases) {
        const active = computeActiveDecan(readSunDegree(profileWithSun(sunDegree)));
        assert.equal(active.signIdx, expected.signIdx, `sign for ${sunDegree}`);
        assert.equal(active.decanInSign, expected.decanInSign, `decan-in-sign for ${sunDegree}`);
        assert.equal(active.decanIdx, expected.decanIdx, `wheel decan for ${sunDegree}`);
    }
});

test('briefing indexes snapshot LUTs for body part, ruler, chakra, and herbs', () => {
    const briefing = buildMedicineBriefing(makeSnapshot(), 123.4);

    assert.equal(briefing.active.decanIdx, 12);
    assert.equal(briefing.bodyPart, 'body-part-12');
    assert.equal(briefing.rulingPlanet, 'Sun');
    assert.equal(briefing.rulingPlanetGlyph, 'SUN');
    assert.equal(briefing.activeChakraId, 7);
    assert.deepEqual(briefing.herbs, [{ vernacular: 'herb-12', botanical: 'Botanica 12' }]);
});

test('medicine view honours L2 canonical element ids and no-write boundary', () => {
    assert.deepEqual(L2_CANONICAL_ELEMENT_IDS, {
        Earth: 1,
        Water: 2,
        Air: 3,
        Fire: 4
    });

    const source = readFileSync(
        new URL('../m4-nara/src/browser/widgets/medicine-view.tsx', import.meta.url),
        'utf8'
    );

    assert.match(source, /const SNAPSHOT_METHOD = 'nara\.medicine\.snapshot'/);
    assert.match(source, /const PIN_METHOD = 'nara\.medicine\.pin'/);
    assert.match(source, /invokeGatewayRpc\(SNAPSHOT_METHOD/);
    assert.match(source, /mext-privacy-protected-local/);
    assert.doesNotMatch(source, /\b(?:prescribe|balance)\s*\(/);
    assert.doesNotMatch(source, /\bQ_identity\s*=/);
    assert.doesNotMatch(source, /\bQ_activity\s*=/);
});
