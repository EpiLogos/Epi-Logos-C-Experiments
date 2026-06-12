import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

if (!globalThis.Element) {
    globalThis.Element = class Element {
        style = {};
        setAttribute() { return undefined; }
        removeAttribute() { return undefined; }
        matches() { return false; }
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
    .set({ applicationName: 'm5-epii-node-test' });

const React = require('react');
const ReactDOMServer = require('react-dom/server');

const {
    ArchNineChargeBar,
    CodonTraceList,
    ContemplationObjectService,
    ContemplationObjectViewer,
    FourSyntaxComplianceSeeds,
    KairosWindow,
    QComposedTrajectoryView,
    SkeletonEventsFiredList,
    TarotPsycheAnchor,
    VakProfilePairsTable,
    buildArchNineChargeState,
    createContemplationObjectViewModel
} = require('../lib/browser/services/contemplation-object-service.js');

function sampleObject(overrides = {}) {
    return {
        privacyClass: 'pasu-scoped',
        session_id: 'session-26-12',
        kairos_at_open: {
            chronos_epoch: 1770487200,
            degree: 108,
            planet_degrees: [0, 37, 74, 111, 148, 185, 222, 259, 296, 333],
            planet_valid: 1023
        },
        kairos_at_close: {
            chronos_epoch: 1770490800,
            degree: 144,
            planet_degrees: [9, 46, 83, 120, 157, 194, 231, 268, 305, 342],
            planet_valid: 1023
        },
        tarot_psyche_anchor: {
            drawn: [3, 17, 42],
            draw_count: 3,
            spread_type: 5,
            cast_degree: 108
        },
        q_composed_trajectory: [
            { tick: 0, w: 1, x: 0, y: 0, z: 0 },
            { tick: 1, w: 0.8, x: 0.3, y: 0.1, z: 0.05 },
            { tick: 2, w: 0.55, x: 0.45, y: 0.22, z: 0.11 },
            { tick: 3, w: 0.25, x: 0.6, y: 0.31, z: 0.18 }
        ],
        codon_trace: [
            { codon: 9, label: 'Additive137', m3_route: 'm3-mahamaya/codon/9' },
            { codon: 45, label: 'KaprekarPedagogyHit', m3_route: 'm3-mahamaya/codon/45' }
        ],
        vak_profile_pairs: [
            {
                dispatch: 'Pi+Anima',
                profile_generation: 26,
                profile_anchor: 'profile://26.7/session-26-12',
                acr_route: 'acr://dispatch/pi-anima'
            }
        ],
        m1_charge_state: { pp: 3, nn: 3, np: 3, pn: 3, outer: 3 },
        m1_2_skeleton_events_fired: ['Additive137', 'KaprekarPedagogyHit'],
        four_syntax_compliance_seeds: [
            'speech-3: name the utterance',
            'relationship-5: bind the relation',
            'action-7: test the act',
            'completion-9: seal the invariant'
        ],
        ...overrides
    };
}

test('ContemplationObjectService rejects non PASU-scoped contemplation payloads', async () => {
    const service = new ContemplationObjectService();

    await assert.rejects(
        service.acceptRuntimeContext({
            method: "s5'.epii.runtimeContext",
            privacyClass: 'private-quaternion',
            contemplationObject: sampleObject({ privacyClass: 'private-quaternion' })
        }),
        /privacy class "private-quaternion"/
    );
});

test('ContemplationObjectViewer renders all eight sub-components from a PASU object', () => {
    const model = createContemplationObjectViewModel(sampleObject());
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(ContemplationObjectViewer, { model })
    );

    for (const marker of [
        'data-test="m5-kairos-window"',
        'data-test="m5-tarot-psyche-anchor"',
        'data-test="m5-q-composed-trajectory"',
        'data-test="m5-codon-trace"',
        'data-test="m5-vak-profile-pairs"',
        'data-test="m5-arch-nine-charge"',
        'data-test="m5-skeleton-events"',
        'data-test="m5-four-syntax-seeds"'
    ]) {
        assert.match(markup, new RegExp(marker));
    }
    assert.match(markup, /ContemplationObject from session session-26-12/);
    assert.match(markup, /ArchNineChargeState/);
});

test('ArchNineChargeBar reads ArchNineChargeState and surfaces PASS and FAIL invariants', () => {
    const pass = buildArchNineChargeState({ pp: 3, nn: 3, np: 3, pn: 3, outer: 3 });
    const fail = buildArchNineChargeState({ pp: 3, nn: 3, np: 3, pn: 2, outer: 3 });

    const passMarkup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(ArchNineChargeBar, { state: pass })
    );
    const failMarkup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(ArchNineChargeBar, { state: fail })
    );

    assert.equal(pass.invariantPass, true);
    assert.equal(fail.invariantPass, false);
    assert.match(passMarkup, /ArchNineChargeState PASS/);
    assert.match(failMarkup, /ArchNineChargeState FAIL/);
});

test('individual contemplation sub-components render real payload fields', () => {
    const model = createContemplationObjectViewModel(sampleObject());
    const components = [
        React.createElement(KairosWindow, { open: model.kairos.open, close: model.kairos.close }),
        React.createElement(TarotPsycheAnchor, { draw: model.tarotPsycheAnchor }),
        React.createElement(QComposedTrajectoryView, { trajectory: model.qComposedTrajectory }),
        React.createElement(CodonTraceList, { codons: model.codonTrace }),
        React.createElement(VakProfilePairsTable, { pairs: model.vakProfilePairs }),
        React.createElement(ArchNineChargeBar, { state: model.archNineChargeState }),
        React.createElement(SkeletonEventsFiredList, { events: model.skeletonEventsFired }),
        React.createElement(FourSyntaxComplianceSeeds, { seeds: model.fourSyntaxComplianceSeeds })
    ];

    const markup = components.map(component => ReactDOMServer.renderToStaticMarkup(component)).join('\n');

    assert.match(markup, /Sun/);
    assert.match(markup, /Card 3/);
    assert.match(markup, /geodesic-fit/);
    assert.match(markup, /m3-mahamaya\/codon\/9/);
    assert.match(markup, /profile:\/\/26\.7\/session-26-12/);
    assert.match(markup, /Additive137/);
    assert.match(markup, /completion-9/);
});
