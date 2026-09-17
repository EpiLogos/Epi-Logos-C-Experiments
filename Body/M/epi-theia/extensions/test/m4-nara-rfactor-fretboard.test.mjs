import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire, Module } from 'node:module';

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
const originalLoad = Module._load;
Module._load = function loadRFactorTestDependency(request, parent, isMain) {
    if (request === '@theia/core/shared/inversify') {
        return {
            injectable: () => target => target,
            inject: () => () => undefined,
            postConstruct: () => () => undefined
        };
    }
    if (request === '@theia/core/lib/browser/widgets/react-widget') {
        return {
            ReactWidget: class ReactWidget {
                title = {};
                addClass() {
                    return undefined;
                }
                update() {
                    return undefined;
                }
                dispose() {
                    return undefined;
                }
            }
        };
    }
    if (request === '@pratibimba/m-extension-runtime') {
        return {
            SHARED_BRIDGE_ADAPTER: Symbol.for('SHARED_BRIDGE_ADAPTER'),
            CROSS_EXTENSION_ROUTE_CONTRACTS: [],
            REQUIRED_OBSERVABILITY_PAYLOAD_FIELDS: []
        };
    }
    return originalLoad.call(this, request, parent, isMain);
};

const React = require('react');
const ReactDOMServer = require('react-dom/server');

const {
    M4RFactorFretboardCard,
    RFACTOR_FRETBOARD_VIEW_ID,
    RFACTOR_QUESTION_METHOD,
    buildRFactorFretboardModel,
    matchedVirtueSignatures
} = require('../m4-nara/lib/browser/widgets/rfactor-fretboard.js');

function surface(witness) {
    return {
        profileGeneration: 77,
        pointerAnchor: 'pointer://m4-nara/rfactor-test',
        payload: witness ? { anuttaraWitness: witness } : {}
    };
}

function r2SignaturePath() {
    return [
        { rFactor: 2, baseRoute: 'X#', band: 'pravritti', position: 0, isTurn: false },
        { rFactor: 2, baseRoute: 'N#', band: 'pravritti', position: 1, isTurn: false },
        { rFactor: 2, baseRoute: 'M#', band: 'pravritti', position: 2, isTurn: false },
        { rFactor: 2, baseRoute: 'Nara', band: 'pravritti', position: 3, isTurn: false },
        { rFactor: 2, baseRoute: 'Siva', band: 'pravritti', position: 4, isTurn: false },
        { rFactor: 2, baseRoute: 'Shakti', band: 'pravritti', position: 5, isTurn: true }
    ];
}

function witness(overrides = {}) {
    return {
        virtueWitnessVector: 0,
        syntaxWitnessVector: 0,
        rfactorPath: r2SignaturePath(),
        bandBalance: {
            pravrittiDepth: 6,
            nivrittiDepth: 0,
            reachedTurn: true,
            returned: false
        },
        palindromeState: {
            normalFormSymmetric: false,
            mirrorNormalForm: 'R2@X#/0|(@#)'
        },
        openQuestions: ['Law-6:R2@Shakti:turn?'],
        coherenceScore: 0.625,
        ...overrides
    };
}

test('renders 7 strings x 6 frets with paired double-courses and R0 confined to upper triad', () => {
    const model = buildRFactorFretboardModel(surface(null));
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M4RFactorFretboardCard, { surface: surface(null) })
    );

    assert.equal(RFACTOR_FRETBOARD_VIEW_ID, 'm4.nara.rfactorFretboard');
    assert.equal(model.strings.length, 7);
    assert.equal(model.frets.length, 6);
    assert.equal(model.cells.length, 42);
    assert.equal((markup.match(/data-test="m4-rfactor-string"/g) ?? []).length, 7);
    assert.equal((markup.match(/data-test="m4-rfactor-fret-cell"/g) ?? []).length, 42);
    assert.equal((markup.match(/data-pair-key="R1-R4"/g) ?? []).length, 12);
    assert.equal((markup.match(/data-pair-key="R2-R3"/g) ?? []).length, 12);

    const r0Cells = model.cells.filter(cell => cell.r0Drone);
    assert.deepEqual(
        r0Cells.map(cell => `${cell.route}@${cell.position}`),
        ['O#@1', 'X#@2', 'N#@3']
    );
    assert.equal(model.cells.some(cell => cell.r0Drone && !['O#', 'X#', 'N#'].includes(cell.route)), false);
    assert.equal((markup.match(/data-test="m4-rfactor-open-harmonic"/g) ?? []).length, 7);
    assert.match(markup, /data-positionless="true"/);
});

test('playback lights fixture path and turns a matched 2R signature into a virtue lamp', () => {
    const model = buildRFactorFretboardModel(surface(witness()), undefined, 5);
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M4RFactorFretboardCard, {
            surface: surface(witness()),
            playbackIndex: 5
        })
    );

    assert.deepEqual([...matchedVirtueSignatures(r2SignaturePath())].sort(), ['2R', 'R#/##']);
    assert.equal(model.playedPath.filter(step => step.active).length, 6);
    assert.equal(model.virtueLamps.find(lamp => lamp.signature === '2R')?.lit, true);
    assert.equal(model.virtueLamps.find(lamp => lamp.signature === '2R')?.source, 'path-signature');
    assert.match(markup, /data-signature="2R" data-witness-state="lit" data-lamp-source="path-signature"/);
    assert.equal((markup.match(/data-test="m4-rfactor-played-step"/g) ?? []).length, 6);
});

test('the (@#) isTurn step flares at the bridge and at the Shakti turn cell', () => {
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M4RFactorFretboardCard, {
            surface: surface(witness()),
            playbackIndex: 5
        })
    );

    assert.match(markup, /data-test="m4-rfactor-bridge" data-turn-marker="\(@#\)" data-turn-cell="Shakti@5" data-turn-flare="true"/);
    assert.match(markup, /data-route="Shakti" data-fret-position="5"[^>]*data-is-turn="true"/);
});

test('unreturned pravritti-heavy balance glows untouched nivritti complements', () => {
    const model = buildRFactorFretboardModel(surface(witness()), undefined, 5);
    const glowing = model.cells
        .filter(cell => cell.complementGlow)
        .map(cell => `${cell.route}@${cell.position}`)
        .sort();

    assert.equal(model.unreturnedPravritti, true);
    assert.deepEqual(glowing, ['M#@3', 'N#@4', 'Nara@2', 'Shakti@0', 'Siva@1', 'X#@5']);
});

test('missing witness never gates rendering or widget actions', () => {
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M4RFactorFretboardCard, { surface: surface(null) })
    );
    const model = buildRFactorFretboardModel(surface(null));

    assert.equal(model.playedPath.length, 0);
    assert.equal(model.openQuestions.length, 0);
    assert.match(markup, /data-test="m4-rfactor-fretboard"/);
    assert.doesNotMatch(markup, /disabled=/);
    assert.doesNotMatch(markup, /data-gated="true"/);
});

test('Law-6 question chips expose only the verifier emit_question method', () => {
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M4RFactorFretboardCard, {
            surface: surface(witness()),
            playbackIndex: 5,
            onEmitQuestion: () => undefined
        })
    );

    assert.equal(RFACTOR_QUESTION_METHOD, "s0'.verifier.emit_question");
    assert.match(markup, /data-test="m4-rfactor-open-question"/);
    assert.match(markup, /data-action-method="s0&#x27;.verifier.emit_question"/);
    assert.doesNotMatch(markup, /data-action-method="(?!s0&#x27;\.verifier\.emit_question)/);
});
