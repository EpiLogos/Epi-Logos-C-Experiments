// Tranche 25.4 — PASU identity setup wizard suite. Proves:
//
//   (1) View id / TRACK_08 export / RPC wiring is load-bearing and matches the
//       `m4.nara.pasuWizard` + `M4PasuWizardBadge` contract.
//   (2) Round-trip: the widget sets each PASU key via `nara.pasu.set` and reads
//       it back via `nara.pasu.show`.
//   (3) Protected-local invariant: the natal-chart raw body never enters
//       `buildPublicPasuProfilePayload` / `buildPublicProfilePayload` — only the
//       path string is exposed.
//   (4) Kerykeion-fetch path: FR-3 graceful stub when KAIROS_ENABLED=false.
//   (5) Stepper UX: back/next navigation persists draft state (session scope).

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire, Module } from 'node:module';

const require = createRequire(import.meta.url);
require.extensions['.css'] = () => undefined;

const originalLoad = Module._load;
Module._load = function loadPasuWizardTestDependency(request, parent, isMain) {
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
    if (request === '@pratibimba/integrated-composition/design-primitives') {
        return {};
    }
    return originalLoad.call(this, request, parent, isMain);
};

const React = require('react');
const ReactDOMServer = require('react-dom/server');

const wizard = require('../m4-nara/lib/browser/widgets/pasu-wizard.js');
const common = require('../m4-nara/lib/common/index.js');
const surface = require('../m4-nara/lib/common/nara-surface.js');

const {
    PASU_WIZARD_VIEW_ID,
    PASU_WIZARD_LABEL,
    M4_PASU_WIZARD_BADGE_EXPORT,
    PASU_SET_METHOD,
    PASU_SHOW_METHOD,
    KERYKEION_FETCH_METHOD,
    KAIROS_ENABLED_DEFAULT,
    PASU_WIZARD_STEPS,
    PASU_WIZARD_STEP_COUNT,
    emptyPasuDraft,
    emptyPasuDerived,
    initialPasuWizardState,
    pasuDraftFromShow,
    pasuDerivedFromShow,
    stepWrite,
    isStepComplete,
    completionPercent,
    clampStepIndex,
    stepIndexForId,
    kerykeionFetchEnabled,
    fr3KerykeionStub,
    readKerykeionNatalChartPath,
    buildPublicPasuProfilePayload,
    pasuWizardReducer,
    M4PasuWizardBadge,
    PasuWizardWidget
} = wizard;

const FILLED_DRAFT = Object.freeze({
    c_0_birth_date: '1990-06-15',
    c_0_birth_location: '51.5,-0.12 — London',
    c_0_natal_chart_path: 'Pratibimba/Self/natal-chart.json',
    c_2_jungian: 'INFJ',
    c_3_gene_keys: '25.2 / 51.5 / 17.1',
    c_4_human_design: 'Projector 5/1 splenic'
});

test('view id, TRACK_08 export, and RPC wiring are load-bearing', () => {
    assert.equal(PASU_WIZARD_VIEW_ID, 'm4.nara.pasuWizard');
    assert.equal(M4_PASU_WIZARD_BADGE_EXPORT, 'M4PasuWizardBadge');
    assert.equal(PASU_SET_METHOD, 'nara.pasu.set');
    assert.equal(PASU_SHOW_METHOD, 'nara.pasu.show');
    assert.equal(KERYKEION_FETCH_METHOD, 'nara.kairos.refresh');
    assert.equal(KAIROS_ENABLED_DEFAULT, false);
    assert.equal(PASU_WIZARD_STEP_COUNT, 6);
    // common/index.ts contract wiring (grep targets).
    assert.ok(common.ALL_VIEW_IDS.includes('m4.nara.pasuWizard'));
    assert.ok(common.TRACK_08_EXPORTS.includes('M4PasuWizardBadge'));
});

test('the six steps map 1:1 onto the PasuRecord editable keys, in order', () => {
    assert.deepEqual(
        PASU_WIZARD_STEPS.map(step => step.key),
        [
            'c_0_birth_date',
            'c_0_birth_location',
            'c_0_natal_chart_path',
            'c_2_jungian',
            'c_3_gene_keys',
            'c_4_human_design'
        ]
    );
    assert.equal(stepIndexForId('natal-chart'), 2);
    assert.equal(clampStepIndex(99), 5);
    assert.equal(clampStepIndex(-3), 0);
});

test('completion percentage tracks filled editable fields', () => {
    assert.equal(completionPercent(emptyPasuDraft()), 0);
    assert.equal(completionPercent(FILLED_DRAFT), 100);
    const half = { ...emptyPasuDraft(), c_0_birth_date: '1990-06-15', c_2_jungian: 'INFJ', c_3_gene_keys: 'x' };
    assert.equal(completionPercent(half), 50);
});

test('pasuDraftFromShow / pasuDerivedFromShow read the handle-only record', () => {
    const raw = {
        found: true,
        c_0_birth_date: '1990-06-15',
        natal_chart_path: 'Pratibimba/Self/natal.json',
        c_2_jungian: 'INFJ',
        c_5_quintessence_hash: 'deadbeef',
        c_5_quintessence_clock: '12:30'
    };
    const draft = pasuDraftFromShow(raw);
    assert.equal(draft.c_0_birth_date, '1990-06-15');
    assert.equal(draft.c_0_natal_chart_path, 'Pratibimba/Self/natal.json');
    assert.equal(draft.c_2_jungian, 'INFJ');
    const derived = pasuDerivedFromShow(raw);
    assert.equal(derived.c_5_quintessence_hash, 'deadbeef');
    assert.equal(derived.c_5_quintessence_clock, '12:30');
    // not-found / envelope tolerance
    assert.deepEqual(pasuDraftFromShow({ found: false }), emptyPasuDraft());
    assert.equal(pasuDraftFromShow({ pasu: { c_0_birth_date: '2000-01-01' } }).c_0_birth_date, '2000-01-01');
});

test('round-trip: widget sets each PASU key via nara.pasu.set and reads back via show', async () => {
    const store = {};
    const calls = [];
    const fakeBridge = {
        invokeGatewayRpc: async (method, params) => {
            calls.push({ method, params });
            if (method === PASU_SET_METHOD) {
                store[params.key] = params.value;
                return { ok: true };
            }
            if (method === PASU_SHOW_METHOD) {
                return { found: true, ...store };
            }
            return null;
        }
    };

    const widget = new PasuWizardWidget();
    widget.bridge = fakeBridge;
    widget.state = { ...initialPasuWizardState(), draft: FILLED_DRAFT, status: 'ready' };

    await widget.commit();

    // Every editable key was written through the canonical set RPC.
    for (const step of PASU_WIZARD_STEPS) {
        assert.equal(store[step.key], FILLED_DRAFT[step.key], `set ${step.key}`);
    }
    assert.ok(calls.some(c => c.method === PASU_SET_METHOD));

    // Read back via show reconstructs the same draft.
    await widget.refresh();
    assert.deepEqual({ ...widget.state.draft }, { ...FILLED_DRAFT });
});

test('protected-local invariant: natal-chart body never enters the public payload', () => {
    const sentinel = '"SENSITIVE_NATAL_BODY_DO_NOT_LEAK"';
    // The wizard public projection takes only draft + derived — there is no
    // parameter through which the raw body could enter.
    const payload = buildPublicPasuProfilePayload(FILLED_DRAFT, {
        c_5_quintessence_hash: 'abc',
        c_5_quintessence_clock: '01:23'
    });
    assert.equal(payload.natalChartPath, 'Pratibimba/Self/natal-chart.json');
    assert.equal(payload.natalChartBodyIncluded, false);
    assert.equal(payload.fields.natalChartSet, true);
    assert.ok(!JSON.stringify(payload).includes(sentinel));

    // The canonical nara-surface helper likewise carries no body field.
    const day = {
        dayId: '2026-06-19',
        artifactTree: [{ artifactHandle: 'nara://day/2026-06-19/artifact/x' }]
    };
    const canonical = surface.buildPublicProfilePayload(day);
    assert.deepEqual([...canonical.bodyFields], []);
    assert.ok(!JSON.stringify(canonical).includes(sentinel));
});

test('Kerykeion fetch: FR-3 graceful stub when KAIROS_ENABLED=false', async () => {
    assert.equal(kerykeionFetchEnabled(false), false);
    assert.equal(kerykeionFetchEnabled('true'), false);
    assert.equal(kerykeionFetchEnabled(true), true);

    const stub = fr3KerykeionStub();
    assert.equal(stub.fetched, false);
    assert.equal(stub.natalChartPath, null);
    assert.equal(stub.stubReason, 'kairos-disabled');

    // The widget must NOT call the fetch RPC while kairos is disabled.
    const calls = [];
    const widget = new PasuWizardWidget();
    widget.bridge = {
        invokeGatewayRpc: async method => {
            calls.push(method);
            return {};
        }
    };
    widget.state = { ...initialPasuWizardState(false), draft: FILLED_DRAFT, status: 'ready' };
    const outcome = await widget.fetchKerykeion();
    assert.equal(outcome.fetched, false);
    assert.ok(!calls.includes(KERYKEION_FETCH_METHOD));

    // With kairos enabled, the resolved path is read from the refresh response.
    assert.equal(
        readKerykeionNatalChartPath({ natal_chart_path: 'Pratibimba/Self/k.json' }),
        'Pratibimba/Self/k.json'
    );
    assert.equal(readKerykeionNatalChartPath({}), null);
});

test('stepper UX: back/next navigation persists draft state on session scope', () => {
    let state = initialPasuWizardState();
    // Enter step 1 (birth date) and advance to step 4 (jungian), entering data.
    state = pasuWizardReducer(state, { type: 'set-field', key: 'c_0_birth_date', value: '1990-06-15' });
    state = pasuWizardReducer(state, { type: 'next' });
    state = pasuWizardReducer(state, { type: 'next' });
    state = pasuWizardReducer(state, { type: 'next' });
    assert.equal(state.currentStepIndex, 3);
    state = pasuWizardReducer(state, { type: 'set-field', key: 'c_2_jungian', value: 'INFJ' });

    // Navigate all the way back — entered data must survive.
    state = pasuWizardReducer(state, { type: 'back' });
    state = pasuWizardReducer(state, { type: 'back' });
    state = pasuWizardReducer(state, { type: 'back' });
    assert.equal(state.currentStepIndex, 0);
    assert.equal(state.draft.c_0_birth_date, '1990-06-15');
    assert.equal(state.draft.c_2_jungian, 'INFJ');

    // Clamp at both ends.
    state = pasuWizardReducer(state, { type: 'back' });
    assert.equal(state.currentStepIndex, 0);

    // The in-memory natal-chart body is held local-only and survives navigation.
    state = pasuWizardReducer(state, { type: 'set-natal-chart', path: 'a.json', localBody: '{"raw":1}' });
    state = pasuWizardReducer(state, { type: 'next' });
    state = pasuWizardReducer(state, { type: 'back' });
    assert.equal(state.draft.c_0_natal_chart_path, 'a.json');
    assert.equal(state.localOnlyNatalChartBody, '{"raw":1}');
});

test('M4PasuWizardBadge renders badge / compact-card / inspector modes', () => {
    const noop = () => undefined;
    const state = { ...initialPasuWizardState(), draft: FILLED_DRAFT, status: 'ready' };
    const props = {
        state,
        onSetField: noop,
        onBack: noop,
        onNext: noop,
        onGoTo: noop,
        onUploadNatalChart: noop,
        onFetchKerykeion: noop,
        onCommit: noop
    };

    const badge = ReactDOMServer.renderToStaticMarkup(React.createElement(M4PasuWizardBadge, { ...props, mode: 'badge' }));
    assert.ok(badge.includes('data-track="TRACK_08"'));
    assert.ok(badge.includes('mext-privacy-protected-local'));
    assert.ok(badge.includes('100%'));

    const card = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M4PasuWizardBadge, { ...props, mode: 'compact-card' })
    );
    assert.ok(card.includes('Step 1 of 6'));

    const inspector = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M4PasuWizardBadge, { ...props, mode: 'inspector' })
    );
    assert.ok(inspector.includes('m4-pasu-wizard-rail-step'));
    assert.ok(inspector.includes(PASU_WIZARD_LABEL));
});
