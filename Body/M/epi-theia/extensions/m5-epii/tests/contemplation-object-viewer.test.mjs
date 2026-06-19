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
    ACR_OPEN_COMMAND_ID,
    ACR_WIDGET_ID,
    CapacityPaneShell,
    CapacityTab,
    OPERATIONAL_CAPACITIES,
    buildPiMonitorIntent,
    extractCapacityHistoryRecords,
    extractCapacityRuntimeRecords,
    filterCapacityRecords,
    normalizeCapacityId,
    readCapacityProfileBoundary,
    S5_IMPROVE_HISTORY_METHOD
} = require('../lib/browser/m5-epii-widget.js');

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

const {
    CONTEMPLATE_FETCH_WISDOM_DELTA_METHOD,
    JointCompositionPanel,
    SpineReading789,
    SymbolicCoordinateQuestionsPanel,
    WisdomDeltaInspector,
    WisdomDeltaService,
    XorFoldAnimation,
    createWisdomDeltaViewModel,
    xorFoldWisdomDelta
} = require('../lib/browser/services/wisdom-delta-service.js');

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

function sampleWisdomDeltaTrace(overrides = {}) {
    return {
        privacyClass: 'pasu-scoped',
        sessionId: 'session-26-13',
        contemplationObjectRef: 'contemplation://session-26-13/object',
        llmComposition: {
            actor: 'pi-llm-position-4',
            reasoningText: 'recognition reasoned through the session-close field',
            synthesizedRecognition: 'the return is coherent enough to reseed identity'
        },
        ebmEvaluation: {
            actor: 'epii-ebm-position-5',
            energyScore: 0.8125,
            gradient: new Float32Array([0.125, -0.25, 0.375]),
            lensWeightings: { clarity: 0.7, resonance: 0.3 },
            tritoneSquareCoherences: [0.91, 0.82, 0.73]
        },
        verifierReport: {
            actor: 'anuttara-verifier-position-0',
            axiomChecks: [
                { id: 'AX-1', label: 'identity closure', status: 'pass' },
                { id: 'AX-2', label: 'symbolic coordinate answer', status: 'pending' }
            ],
            symbolicCoordinateQuestions: [
                '#R0-0/1/A-T7-pending?',
                '#R0-0/1/A-T9-answered?'
            ]
        },
        wisdomDeltaBytes: new Uint8Array([0xff, 0x0f, 0xf0, 0xaa, 0x55, 0x01, 0x10, 0x80]),
        preXorQuintessenceHash: new Uint8Array([0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88]),
        postXorQuintessenceHash: new Uint8Array([0xff, 0x1e, 0xd2, 0x99, 0x11, 0x54, 0x76, 0xf7, 0x88]),
        spineReading789: {
            action7: { register: 'action-generator', virtueBits: 0b101010101 },
            octave8: { register: 'octave-return', virtueBits: 0b11110000 },
            wholeness9: { register: 'wholeness-witness', virtueBits: 0b111111111 },
            virtueLut9Witness: new Uint8Array([1, 0, 1, 0, 1, 0, 1, 0, 1])
        },
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

test('WisdomDeltaService fetches contemplate.fetch_wisdom_delta and verifies deterministic XOR post-hash', async () => {
    const service = new WisdomDeltaService();
    const calls = [];

    const model = await service.fetchWisdomDelta(async (method, request) => {
        calls.push({ method, request });
        return {
            method,
            privacyClass: 'pasu-scoped',
            wisdomDeltaTrace: sampleWisdomDeltaTrace()
        };
    }, {
        sessionId: 'session-26-13',
        contemplationObjectRef: 'contemplation://session-26-13/object',
        profileGeneration: 26
    });

    assert.equal(calls.length, 1);
    assert.equal(calls[0].method, CONTEMPLATE_FETCH_WISDOM_DELTA_METHOD);
    assert.equal(model.sessionId, 'session-26-13');
    assert.deepEqual(model.postXorHex, ['ff', '1e', 'd2', '99', '11', '54', '76', 'f7', '88']);

    const folded = xorFoldWisdomDelta(
        sampleWisdomDeltaTrace().preXorQuintessenceHash,
        sampleWisdomDeltaTrace().wisdomDeltaBytes
    );
    assert.deepEqual(Array.from(folded.postHash), [0xff, 0x1e, 0xd2, 0x99, 0x11, 0x54, 0x76, 0xf7, 0x88]);
    assert.equal(folded.steps.length, 8);
    assert.equal(folded.steps[0].profileTick, 1);
    assert.equal(folded.steps[7].hashIndex, 7);
});

test('WisdomDeltaInspector renders joint composition, XOR fold, 7-8-9 spine, and verifier links', () => {
    const model = createWisdomDeltaViewModel(sampleWisdomDeltaTrace());
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(WisdomDeltaInspector, { model })
    );

    assert.match(markup, /data-test="m5-wisdom-delta-inspector"/);
    assert.match(markup, /WisdomDelta is the 8-byte XOR seed/);
    assert.match(markup, /data-test="m5-joint-composition-panel"/);
    assert.match(markup, /data-actor="pi-llm-position-4"/);
    assert.match(markup, /data-actor="epii-ebm-position-5"/);
    assert.match(markup, /data-actor="anuttara-verifier-position-0"/);
    assert.match(markup, /data-test="m5-xor-fold-animation"/);
    assert.match(markup, /delta\[0\] ff -&gt; hash\[0\]/);
    assert.match(markup, /data-test="m5-spine-reading-789"/);
    assert.match(markup, /data-register-label="action-7"/);
    assert.match(markup, /data-register-label="octave-8"/);
    assert.match(markup, /data-register-label="wholeness-9"/);
    assert.match(markup, /data-test="m5-symbolic-coordinate-questions-panel"/);
    assert.match(markup, /data-question-status="pending"/);
    assert.match(markup, /data-question-status="answered"/);
    assert.match(markup, /PiAxiomTranslationInspector/);
    assert.match(markup, /data-skill-route="anuttara-symbolic-parse"/);
});

test('WisdomDelta sub-components preserve three-column composition and VIRTUE_LUT[9] witness labels', () => {
    const model = createWisdomDeltaViewModel(sampleWisdomDeltaTrace());
    const markup = [
        React.createElement(JointCompositionPanel, { model }),
        React.createElement(XorFoldAnimation, { model }),
        React.createElement(SpineReading789, { model: model.spineReading789 }),
        React.createElement(SymbolicCoordinateQuestionsPanel, { model })
    ].map(component => ReactDOMServer.renderToStaticMarkup(component)).join('\n');

    assert.equal((markup.match(/data-actor="/g) ?? []).length, 3);
    assert.equal((markup.match(/data-hash-column="/g) ?? []).length, 2);
    assert.equal((markup.match(/data-virtue-index="/g) ?? []).length, 9);
    assert.match(markup, /data-virtue-label="Love\/Peace"/);
    assert.match(markup, /data-virtue-label="Reality"/);
    assert.equal((markup.match(/data-witness-state="lit"/g) ?? []).length, 5);
    assert.match(markup, /epi-logos:\/\/ide\/m0-anuttara\/pi-axiom-translation\?question=%23R0-0%2F1%2FA-T7-pending%3F/);
});

test('CapacityTab renders six spec-facing operational capacity tabs', () => {
    assert.equal(OPERATIONAL_CAPACITIES.length, 6);
    assert.equal(OPERATIONAL_CAPACITIES[0].id, 'anuttara-construction');
    assert.equal(OPERATIONAL_CAPACITIES[5].id, 'epii-self-referential');

    const markup = OPERATIONAL_CAPACITIES.map((capacity, index) => ReactDOMServer.renderToStaticMarkup(
        React.createElement(CapacityTab, {
            capacity,
            selected: index === 0,
            dispatchCount: index,
            onSelect: () => undefined
        })
    )).join('\n');

    assert.equal((markup.match(/role="tab"/g) ?? []).length, 6);
    assert.match(markup, /data-test="CapacityTab-anuttara-construction"/);
    assert.match(markup, /data-test="CapacityTab-epii-self-referential"/);
    assert.match(markup, /Anuttara Construction/);
    assert.match(markup, /Epii Self-Referential/);
});

test('CapacityTab navigation invokes selection with the clicked capacity', () => {
    const clicked = [];
    const element = CapacityTab({
        capacity: OPERATIONAL_CAPACITIES[5],
        selected: false,
        dispatchCount: 2,
        onSelect: capacity => clicked.push(capacity.id)
    });

    element.props.onClick();

    assert.deepEqual(clicked, ['epii-self-referential']);
    assert.equal(element.props.role, 'tab');
    assert.equal(element.props['aria-selected'], false);
});

test('CapacityPaneShell filters runtimeContext and improve.history records per capacity', () => {
    const capacity = OPERATIONAL_CAPACITIES.find(c => c.id === 'nara-anima-dialogic');
    const profile = {
        generation: 26,
        pointerAnchor: 'profile://m5/26',
        capabilities: [S5_IMPROVE_HISTORY_METHOD],
        payload: {
            operational_capacities: {
                nara: {
                    capacity_id: 'nara',
                    last_tick_dispatch_count: 4,
                    gate_landings: 2,
                    status: 'governance-gate-landed'
                }
            }
        }
    };
    const history = extractCapacityHistoryRecords({
        candidates: [
            {
                id: 'nara-1',
                title: 'Dialogic voice safety gate',
                capacity_id: 'nara',
                status: 'requires_human',
                profile_generation: 26
            },
            {
                id: 'epii-1',
                title: 'Recursive spine audit',
                capacity: 'epii_on_epii',
                profile_generation: 26
            }
        ]
    });
    const runtimeRecords = extractCapacityRuntimeRecords({
        method: "s5'.epii.runtimeContext",
        payload: {
            capacity_workflows: [
                { id: 'nara-runtime', capacity: 'nara-anima-dialogic', status: 'landed' },
                { id: 'paramasiva-runtime', capacity_id: 'paramasiva' }
            ]
        }
    });

    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(CapacityPaneShell, {
            capacity,
            profile,
            history,
            runtimeRecords,
            onOpenPiMonitor: () => undefined
        })
    );

    assert.equal(filterCapacityRecords(history, capacity).length, 1);
    assert.equal(filterCapacityRecords(runtimeRecords, capacity).length, 1);
    assert.match(markup, /data-test="CapacityPaneShell-nara-anima-dialogic"/);
    assert.match(markup, /data-test="m5-capacity-dispatch-count-nara-anima-dialogic">4/);
    assert.match(markup, /Dialogic voice safety gate/);
    assert.doesNotMatch(markup, /Recursive spine audit/);
    assert.match(markup, /open in Pi-monitor/);
});

test('per-capacity profile-tick reader normalizes legacy capacity ids and reads last tick counts', () => {
    const anuttara = OPERATIONAL_CAPACITIES[0];
    const epii = OPERATIONAL_CAPACITIES[5];
    const profile = {
        generation: 31,
        pointerAnchor: 'profile://m5/31',
        capabilities: [S5_IMPROVE_HISTORY_METHOD],
        payload: {
            capacityProfiles: [
                {
                    capacityId: 'anuttara',
                    lastTickDispatchCount: 3,
                    axiomProposals: 7
                },
                {
                    capacity: 'epii-self-referential',
                    recursionDepth: 5,
                    dispatchCount: 2
                }
            ]
        }
    };

    assert.equal(normalizeCapacityId('epii_on_epii'), 'epii-self-referential');
    assert.equal(normalizeCapacityId('anuttara-construction'), 'anuttara-construction');

    const anuttaraReading = readCapacityProfileBoundary(profile, anuttara);
    const epiiReading = readCapacityProfileBoundary(profile, epii);

    assert.equal(anuttaraReading.generation, 31);
    assert.equal(anuttaraReading.lastTickDispatchCount, 3);
    assert.equal(anuttaraReading.metricValue, '7');
    assert.equal(epiiReading.lastTickDispatchCount, 2);
    assert.equal(epiiReading.metricValue, '5');
});

test('capacity click-through route targets ACR Pi-monitor widget with VAK address', () => {
    const capacity = OPERATIONAL_CAPACITIES.find(c => c.id === 'epii-self-referential');
    const intent = buildPiMonitorIntent(
        capacity,
        {
            generation: 44,
            pointerAnchor: 'profile://m5/44',
            capabilities: [],
            payload: {}
        },
        {
            selectedCoordinate: null,
            hashInput: null,
            canonicalMCoordinate: null,
            profileGeneration: 43,
            pointerAnchor: null,
            dayNowSessionHandle: 'now://session-44',
            privacyClass: 'public_current',
            provenance: { source: 'test', generation: 44, notes: [] }
        }
    );

    assert.equal(ACR_OPEN_COMMAND_ID, 'pratibimba.ide-shell-m0-m5.agentic-control-room.open');
    assert.equal(intent.targetWidgetId, ACR_WIDGET_ID);
    assert.equal(intent.vakAddress, 'M5-4/epii-self-referential');
    assert.equal(intent.coordinate, intent.vakAddress);
    assert.equal(intent.requestedContributionId, 'agentic-control-room.select-run');
    assert.equal(intent.profileGeneration, 44);
});
