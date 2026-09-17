import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire, Module } from 'node:module';

const require = createRequire(import.meta.url);
require.extensions['.css'] = () => undefined;

const originalLoad = Module._load;
Module._load = function loadOracleCastTestDependency(request, parent, isMain) {
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
                classes = [];
                updates = 0;
                addClass(className) {
                    this.classes.push(className);
                }
                update() {
                    this.updates += 1;
                }
                dispose() {}
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
    if (request === '@pratibimba/integrated-composition/design-primitives') {
        return {};
    }
    return originalLoad.call(this, request, parent, isMain);
};

const React = require('react');
const ReactDOMServer = require('react-dom/server');

const common = require('../lib/common/index.js');
const oracleCast = require('../lib/browser/widgets/oracle-cast.js');
const iching = require('../lib/browser/widgets/oracle/iching.js');
const tarot = require('../lib/browser/widgets/oracle/tarot.js');

const {
    ORACLE_CAST_VIEW_ID,
    M4_ORACLE_CAST_BADGE_EXPORT,
    COMPOSITE_ORACLE_READING_METHOD,
    M4OracleCastBadge,
    OracleCastWidget,
    compositeOracleReading,
    pushIChingHistory,
    pushTarotHistory
} = oracleCast;

const {
    QUERY_ICHING_READING_METHOD,
    castIChingWithThreeCoins,
    buildIChingCastResult,
    movingLineTexts
} = iching;

const {
    DRAW_TAROT_CARD_METHOD,
    Q_FRAMESTORE_POSITION_SEMANTICS_METHOD,
    normalizeTarotDrawResult
} = tarot;

function randomSequence(values) {
    let index = 0;
    return () => values[index++ % values.length];
}

function fakeBridge() {
    const calls = [];
    return {
        calls,
        async invokeGatewayRpc(method, params) {
            calls.push({ method, params });
            if (method === QUERY_ICHING_READING_METHOD) {
                return {
                    judgement: `Judgement for ${params.hexagramNumber}`,
                    image: `Image for ${params.hexagramNumber}`,
                    lines: ['bottom line', 'second line', 'third line', 'fourth line', 'fifth line', 'top line']
                };
            }
            if (method === DRAW_TAROT_CARD_METHOD) {
                return {
                    cardName: 'The Star',
                    position: 'P3',
                    positionLabel: 'Pattern',
                    reversed: true
                };
            }
            if (method === Q_FRAMESTORE_POSITION_SEMANTICS_METHOD) {
                return {
                    label: 'Pattern',
                    semantics: 'P3 receives the visible pattern of the draw.'
                };
            }
            if (method === COMPOSITE_ORACLE_READING_METHOD) {
                assert.equal(typeof params.iChing.hexagramNumber, 'number');
                assert.equal(params.tarot.cardName, 'The Star');
                return {
                    compositeResonance: 0.875,
                    compositeText: 'The hexagram and card reinforce one another.'
                };
            }
            throw new Error(`Unexpected method ${method}`);
        }
    };
}

test('view id, TRACK_08 export, and gateway constants match the composite oracle contract', () => {
    assert.equal(ORACLE_CAST_VIEW_ID, 'm4.nara.oracleCast');
    assert.equal(M4_ORACLE_CAST_BADGE_EXPORT, 'M4OracleCastBadge');
    assert.equal(QUERY_ICHING_READING_METHOD, 'query_iching_reading');
    assert.equal(DRAW_TAROT_CARD_METHOD, 'draw_tarot_card');
    assert.equal(COMPOSITE_ORACLE_READING_METHOD, 'composite_oracle_reading');
    assert.ok(common.ALL_VIEW_IDS.includes(ORACLE_CAST_VIEW_ID));
    assert.ok(common.TRACK_08_EXPORTS.includes(M4_ORACLE_CAST_BADGE_EXPORT));
});

test('I-Ching cast produces six lines, a hexagram number, transformed hexagram, and moving-line texts', () => {
    const cast = castIChingWithThreeCoins(randomSequence([
        0.1, 0.1, 0.1,
        0.9, 0.9, 0.9,
        0.1, 0.1, 0.9,
        0.1, 0.9, 0.9,
        0.1, 0.9, 0.9,
        0.1, 0.1, 0.9
    ]));
    assert.equal(cast.lines.length, 6);
    assert.deepEqual(cast.lines.map(line => line.value), [6, 9, 7, 8, 8, 7]);
    assert.deepEqual(cast.lines.map(line => line.nucleotide), ['A', 'T', 'C', 'G', 'G', 'C']);
    assert.deepEqual(cast.movingLines, [1, 2]);
    assert.equal(typeof cast.hexagramNumber, 'number');
    assert.ok(cast.hexagramNumber >= 1 && cast.hexagramNumber <= 64);
    assert.equal(typeof cast.transformedHexagramNumber, 'number');

    const read = buildIChingCastResult(cast.lines, {
        judgement: 'primary judgement',
        image: 'primary image',
        lines: ['line one text', 'line two text', 'line three text', '', '', '']
    });
    assert.deepEqual(movingLineTexts(read), ['line one text', 'line two text']);
});

test('Tarot draw normalization preserves card name, quaternal position, and reversal flag', () => {
    const draw = normalizeTarotDrawResult({
        card: { name: 'Princess of Disks' },
        quaternalPosition: 'P5',
        positionLabel: 'Integration',
        reversalFlag: true
    });
    assert.equal(draw.cardName, 'Princess of Disks');
    assert.equal(draw.position, 'P5');
    assert.equal(draw.positionLabel, 'Integration');
    assert.equal(draw.reversed, true);
});

test('widget bridge flow sends I-Ching, Tarot, position, and composite gateway calls', async () => {
    const bridge = fakeBridge();
    const widget = new OracleCastWidget();
    widget.bridge = bridge;
    widget.init();

    await widget.castIChing();
    assert.equal(widget.iChing.lines.length, 6);
    assert.equal(bridge.calls[0].method, QUERY_ICHING_READING_METHOD);
    assert.equal(typeof bridge.calls[0].params.hexagramNumber, 'number');

    await widget.drawTarot();
    assert.equal(widget.tarot.cardName, 'The Star');
    assert.equal(widget.tarot.position, 'P3');
    assert.equal(widget.tarot.reversed, true);
    assert.equal(bridge.calls[1].method, DRAW_TAROT_CARD_METHOD);

    await widget.readTarotPosition();
    assert.equal(bridge.calls[2].method, Q_FRAMESTORE_POSITION_SEMANTICS_METHOD);
    assert.equal(bridge.calls[2].params.position, 'P3');
    assert.match(widget.tarot.semantics.semantics, /visible pattern/);

    await widget.castComposite();
    assert.equal(bridge.calls[3].method, COMPOSITE_ORACLE_READING_METHOD);
    assert.equal(typeof widget.composite.compositeResonance, 'number');
    assert.equal(widget.composite.iChing.hexagramNumber, widget.iChing.hexagramNumber);
    assert.equal(widget.composite.tarot.cardName, widget.tarot.cardName);
});

test('composite helper returns both sub-mode results and numeric composite resonance', async () => {
    const iChingResult = castIChingWithThreeCoins(randomSequence(Array.from({ length: 18 }, () => 0.9)));
    const tarotResult = normalizeTarotDrawResult({
        cardName: 'The Star',
        position: 'P3',
        reversed: false
    });
    const reading = await compositeOracleReading(fakeBridge(), iChingResult, tarotResult);

    assert.equal(reading.iChing.hexagramNumber, iChingResult.hexagramNumber);
    assert.equal(reading.tarot.cardName, 'The Star');
    assert.equal(typeof reading.compositeResonance, 'number');
    assert.match(reading.compositeText, /reinforce/);
});

test('cast histories cap at six entries for both I-Ching and Tarot', () => {
    const iChingResult = castIChingWithThreeCoins(randomSequence(Array.from({ length: 18 }, () => 0.9)));
    const tarotResult = normalizeTarotDrawResult({
        cardName: 'The Star',
        position: 'P3',
        reversed: true
    });

    let iChingHistory = [];
    let tarotHistory = [];
    for (let index = 0; index < 8; index += 1) {
        iChingHistory = pushIChingHistory(iChingResult, iChingHistory, `2026-06-19T00:00:0${index}.000Z`);
        tarotHistory = pushTarotHistory(tarotResult, tarotHistory, `2026-06-19T00:00:0${index}.000Z`);
    }

    assert.equal(iChingHistory.length, 6);
    assert.equal(tarotHistory.length, 6);
    assert.equal(iChingHistory[0].timestamp, '2026-06-19T00:00:07.000Z');
    assert.equal(tarotHistory[0].cardName, 'The Star');
});

test('rendered composite badge preserves protected-local privacy chrome', () => {
    const model = {
        activeMode: 'iching',
        iChing: null,
        tarot: null,
        composite: null,
        iChingHistory: [],
        tarotHistory: [],
        status: 'idle',
        errorMessage: null,
        tarotPositionExpanded: false,
        privacyClass: 'protected_local'
    };
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M4OracleCastBadge, {
            model,
            onModeChange: () => undefined,
            onCastIChing: () => undefined,
            onDrawTarot: () => undefined,
            onReadTarotPosition: () => undefined,
            onCastComposite: () => undefined
        })
    );

    assert.match(markup, /data-view-id="m4\.nara\.oracleCast"/);
    assert.match(markup, /data-export="M4OracleCastBadge"/);
    assert.match(markup, /mext-privacy-protected-local/);
    assert.match(markup, /data-privacy-class="protected_local"/);
});
