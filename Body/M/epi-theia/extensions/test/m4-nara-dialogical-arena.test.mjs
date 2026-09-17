// Tranche 41.7 — Dialogical Arena widget suite. Proves classifier glyphs,
// TRACK_08 export wiring, protected-local handle-only privacy, and the
// non-bypassable CPF (00/00) scene-open gate.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire, Module } from 'node:module';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
require.extensions['.css'] = () => undefined;

const originalLoad = Module._load;
Module._load = function loadDialogicalArenaTestDependency(request, parent, isMain) {
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
            EMPTY_COORDINATE_CONTEXT: Object.freeze({}),
            PENDING_M_READINESS: Object.freeze({ bridgeReachable: false }),
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

const arena = require('../m4-nara/lib/browser/widgets/dialogical-arena.js');
const common = require('../m4-nara/lib/common/index.js');

const {
    DIALOGICAL_ARENA_VIEW_ID,
    M4_DIALOGICAL_ARENA_CARD_EXPORT,
    CLASSIFIER_GLYPHS,
    ARENA_PRIVACY_MANIFEST,
    ARENA_SUMMON_RPC,
    ARENA_SCENE_OPEN_RPC,
    M4DialogicalArenaCard,
    normalizeArenaScene,
    summarizeScene,
    initialSceneSetupState,
    evaluateSceneSetupGate,
    buildSceneOpenRequest,
    assertSummonGate
} = arena;

const FIXTURE_SCENE = Object.freeze({
    scene_key: 'scene-41-7',
    status: 'open',
    title: 'Three warm voices',
    pinned_coordinate: 'M4-3',
    privacy_class: 'protected_local_handle_only',
    admitted_vama_shaktis: [
        { key: 'sprite-1', name: 'Spark Reader', vama_shakti_class: 'sprite', vak_address: 'CPF(0/1) CT2' },
        { key: 'daemon-1', name: 'Process Keeper', vama_shakti_class: 'daemon', vak_address: 'CF(0/1/2)' },
        { key: 'mantra-1', name: 'Wave Phrase', vama_shakti_class: 'mantra', vak_address: 'CP4.3' }
    ],
    admitted_constitutionals: [
        { key: 'anima', name: 'Anima' },
        { key: 'logos', name: 'Logos' }
    ],
    user_trika0_present: true,
    turns: [
        { key: 't1', speaker_kind: 'user', speaker_name: 'You', vak_address: 'CPF(00/00)', kairos_delta: 0, line: 'I want to open the field carefully.' },
        { key: 't2', speaker_kind: 'vama_shakti', speaker_name: 'Spark Reader', vama_shakti_class: 'sprite', vak_address: 'CT2', kairos_delta: '+1', line: 'A spark enters as a bounded voice.' },
        { key: 't3', speaker_kind: 'vama_shakti', speaker_name: 'Process Keeper', vama_shakti_class: 'daemon', vak_address: 'CF4.2', kairos_delta: '-1', line: 'The process remains gated.' },
        { key: 't4', speaker_kind: 'vama_shakti', speaker_name: 'Wave Phrase', vama_shakti_class: 'mantra', vak_address: 'CP4.3', kairos_delta: '+2', line: 'A phrase repeats without leaking body content.' },
        { key: 't5', speaker_kind: 'constitutional', speaker_name: 'Anima', vak_address: 'CPF(00/00)', kairos_delta: '+0', line: 'The scene opens only after brainstorming.' }
    ]
});

test('view id, TRACK_08 export, and RPC constants are load-bearing', () => {
    assert.equal(DIALOGICAL_ARENA_VIEW_ID, 'm4.nara.dialogicalArena');
    assert.equal(M4_DIALOGICAL_ARENA_CARD_EXPORT, 'M4DialogicalArenaCard');
    assert.equal(ARENA_SCENE_OPEN_RPC, 'm4.arena.scene_open');
    assert.equal(ARENA_SUMMON_RPC, 'm4.arena.summon');
    assert.ok(common.ALL_VIEW_IDS.includes('m4.nara.dialogicalArena'));
    assert.ok(common.TRACK_08_EXPORTS.includes('M4DialogicalArenaCard'));
});

test('widget render carries one non-egregore glyph per admitted Vama Shakti and five turns', () => {
    const scene = normalizeArenaScene(FIXTURE_SCENE);
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M4DialogicalArenaCard, {
            mode: 'inspector',
            scenes: [summarizeScene(scene)],
            activeScene: scene,
            warmInventory: [],
            onWarmFilterChange: () => undefined,
            relay: {
                kairosEnabled: true,
                lastRefreshIso: '2026-06-12T10:00:00.000Z',
                deltaCount: 3,
                pulseToken: 3,
                connected: true
            }
        })
    );

    assert.match(markup, /data-view-id="m4\.nara\.dialogicalArena"/);
    assert.match(markup, /data-export="M4DialogicalArenaCard"/);
    assert.match(markup, /data-coordinate="M4-3"/);
    assert.match(markup, /data-test="m4-arena-trika0"/);
    assert.match(markup, /data-test="m4-arena-kairos-ring"/);
    assert.equal((markup.match(/data-test="m4-arena-turn"/g) ?? []).length, 5);

    for (const cls of ['sprite', 'daemon', 'mantra']) {
        assert.match(markup, new RegExp(`data-vama-shakti-class="${cls}"`));
        assert.match(markup, new RegExp(`data-glyph="${CLASSIFIER_GLYPHS[cls]}"`));
    }
});

test('privacy invariant stays protected-local handle-only with no body projection', () => {
    const scene = normalizeArenaScene(FIXTURE_SCENE);
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M4DialogicalArenaCard, {
            mode: 'compact-card',
            scenes: [summarizeScene(scene)],
            activeScene: scene
        })
    );

    assert.equal(ARENA_PRIVACY_MANIFEST.privacyClass, 'protected_local_handle_only');
    assert.equal(ARENA_PRIVACY_MANIFEST.protectedBodiesProjected, false);
    assert.match(markup, /data-protected-bodies-projected="false"/);
});

test('CPF gate refuses scene open and summon before brainstorm confirmation', () => {
    const inactive = initialSceneSetupState();
    assert.deepEqual(evaluateSceneSetupGate(inactive), {
        canOpen: false,
        reason: 'wizard-inactive'
    });

    const missingBrainstorm = {
        ...inactive,
        active: true,
        pinnedCoordinate: 'M4-3'
    };
    assert.deepEqual(evaluateSceneSetupGate(missingBrainstorm), {
        canOpen: false,
        reason: 'cpf-brainstorm-required'
    });
    assert.throws(() => buildSceneOpenRequest(missingBrainstorm), /cpf-brainstorm-required/);
    assert.throws(() => assertSummonGate(missingBrainstorm), /CPF \(00\/00\) brainstorm gate/);

    const ready = {
        ...missingBrainstorm,
        brainstormConfirmed: true
    };
    const request = buildSceneOpenRequest(ready);
    assert.equal(request.brainstormConfirmed, true);
    assert.equal(request.pinnedCoordinate, 'M4-3');
});

test('widget source does not invoke the summon RPC directly', () => {
    const source = readFileSync(join(process.cwd(), 'src/browser/widgets/dialogical-arena.tsx'), 'utf8');
    assert.doesNotMatch(source, /invokeGatewayRpc\s*\(\s*ARENA_SUMMON_RPC/);
    assert.doesNotMatch(source, /invokeGatewayRpc\s*\(\s*['"]m4\.arena\.summon['"]/);
});
