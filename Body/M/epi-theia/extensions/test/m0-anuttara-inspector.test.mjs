// 07.T3 verification suite. Uses a captured-real-shaped S2 graph payload:
// node identity and family are properties, not labels; OWL/SHACL/GDS facts are
// payload facts with provenance states; M5 hooks are gateway envelopes only.

import test from 'node:test';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';

if (!globalThis.Element) {
    globalThis.Element = class Element {
        style = {};

        setAttribute() {
            return undefined;
        }

        removeAttribute() {
            return undefined;
        }

        addEventListener() {
            return undefined;
        }

        removeEventListener() {
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
        queryCommandSupported: () => false,
        querySelectorAll: () => []
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
const {
    buildM0InspectorModel,
    normalizeM0CoordinateInput
} = require('../m0-anuttara/lib/common/m0-inspector.js');
const { LayerSelector } = require('../m0-anuttara/lib/browser/components/layer-selector.js');
const COMMUNITY_CLOCK_OVERLAY_VIEW_ID = 'm0.anuttara.communityClockOverlay';
const ALL_VIEW_IDS = [
    'm0.anuttara.languageMap',
    'm0.anuttara.owlShaclInspector',
    'm0.anuttara.rVirtuePanel',
    COMMUNITY_CLOCK_OVERLAY_VIEW_ID
];

const {
    VIRTUE_WITNESS_LUT,
    VIRTUE_WITNESS_VECTOR_SIZE,
    VirtueWitnessPanel,
    activeWitnessCount,
    createWitnessVector,
    toggleWitnessBit
} = require('../m0-anuttara/lib/browser/panels/virtue-witness-panel.js');
const {
    Arch9CompletionPanel
} = require('../m0-anuttara/lib/browser/panels/syntax-layers/arch9-completion-panel.js');

const React = require('react');
const ReactDOMServer = require('react-dom/server');

const readiness = Object.freeze({
    fetchedAt: 1,
    state: 'ready_public_current',
    reason: 'captured S2 graph payload available',
    profileGeneration: 12,
    bridgeReachable: true,
    blockerIds: []
});

const context = Object.freeze({
    selectedCoordinate: '#0',
    hashInput: '#0',
    canonicalMCoordinate: 'M0',
    profileGeneration: 12,
    pointerAnchor: 'pointer://m0/anuttara',
    dayNowSessionHandle: '2026-06-01/session',
    privacyClass: 'public_current',
    provenance: {
        source: 'captured-s2-graph',
        generation: 12,
        notes: []
    }
});

const capturedS2GraphNode = Object.freeze({
    coordinate: 'M0',
    canonicalCoordinate: 'M0',
    label: 'Anuttara prior ground',
    labels: ['BimbaCoordinate', 'MCoordinate'],
    namespace: 'bimba',
    properties: {
        canonical_coordinate: 'M0',
        symbol: '0/1',
        formulation_type: 'prior-ground-boundary',
        complete_formulation: 'Anuttara as the prior 0/1 ground received by M1.',
        c_0_family: 'anuttara',
        graph_namespace: 'bimba',
        anchors: {
            source: 'Idea/Bimba/Seeds/M/M0/M0-SPEC.md',
            spec: 'Idea/Bimba/Seeds/M/M0/M0-SPEC.md',
            code: 'Body/M/epi-theia/extensions/m0-anuttara',
            test: 'Body/M/epi-theia/extensions/test/m0-anuttara-inspector.test.mjs'
        },
        pointer_web: {
            summary: 'M0 anchors the prior field before M1 receives the +1 parent.'
        }
    },
    relations: [
        {
            type: 'RECEIVED_BY',
            properties: {
                family: 'm0-to-m1-prior-ground'
            }
        }
    ],
    readiness: {
        owl: {
            state: 'inferred',
            summary: 'n10s import available as inferred readiness.',
            provenance: 'S2 ontology_bridge_contract'
        },
        shacl: {
            state: 'review_pending',
            summary: 'SHACL report captured; not promoted to canon.',
            provenance: 'S2 SHACL validation report'
        },
        gds: {
            state: 'blocked',
            summary: 'GDS overlay handle unavailable in current runtime.',
            provenance: 'S2 GDS overlay contract'
        },
        kernel_core: {
            state: 'canonical',
            summary: 'Kernel-core relation audit passed.',
            provenance: 'S2 kernel relation audit'
        }
    }
});

const profile = Object.freeze({
    generation: 12,
    pointerAnchor: 'pointer://m0/anuttara',
    capabilities: ['s2.graph.node', 's5.review.submit'],
    payload: {
        m0_graph_node: capturedS2GraphNode
    }
});

test('legacy # input and M-family input resolve to the same canonical branch', () => {
    assert.deepEqual(normalizeM0CoordinateInput('#0'), {
        input: '#0',
        canonicalMCoordinate: 'M0',
        hashCompatible: true
    });
    assert.equal(normalizeM0CoordinateInput('M0').canonicalMCoordinate, 'M0');
    assert.equal(normalizeM0CoordinateInput("M0'").canonicalMCoordinate, 'M0');
});

test('captured S2 payload renders within budget and keeps family identity in properties', () => {
    const started = performance.now();
    const model = buildM0InspectorModel({
        selectedInput: '#0',
        graphNode: capturedS2GraphNode,
        profile,
        readiness,
        context
    });
    const elapsed = performance.now() - started;

    assert.ok(elapsed < model.renderBudgetMs, `model build took ${elapsed}ms`);
    assert.equal(model.query.canonicalMCoordinate, 'M0');
    assert.equal(model.node.label, 'Anuttara prior ground');
    assert.deepEqual(model.node.badges, ['namespace:bimba', 'BimbaCoordinate', 'MCoordinate']);
    assert.equal(
        model.relationFamilies.find(field => field.key === 'c_0_family')?.value,
        'anuttara'
    );
    assert.equal(
        model.relationFamilies.find(field => field.key === 'relation:RECEIVED_BY')?.value,
        'm0-to-m1-prior-ground'
    );
});

test('per-layer readiness distinguishes canonical fields from bridged routes', () => {
    const model = buildM0InspectorModel({
        selectedInput: '#0',
        graphNode: {
            ...capturedS2GraphNode,
            properties: {
                ...capturedS2GraphNode.properties,
                c_1_symbol: '0/1',
                c_1_ql_variant: 'prior-ground'
            }
        },
        profile: {
            ...profile,
            payload: {
                ...profile.payload,
                gds_community: 'louvain:M0:0'
            }
        },
        readiness,
        context
    });

    assert.equal(model.layerReadiness.language, 'canonical');
    assert.equal(model.layerReadiness['ql-structure'], 'canonical');
    assert.equal(model.layerReadiness.relations, 'canonical');
    assert.equal(model.layerReadiness['time-community'], 'derived');
    assert.equal(model.layerReadiness.personal, 'bridged_local');
    assert.equal(model.layerReadiness.pedagogy, 'bridged_public');
});

test('layer readiness treats aliases and missing payloads as canonical absence or blockers', () => {
    const aliasOnly = buildM0InspectorModel({
        selectedInput: '#0',
        graphNode: capturedS2GraphNode,
        profile,
        readiness,
        context
    });
    const noPayload = buildM0InspectorModel({
        selectedInput: '#0',
        graphNode: null,
        profile: null,
        readiness,
        context
    });

    assert.equal(aliasOnly.languageFields.find(field => field.key === 'symbol')?.state, 'canonical');
    assert.equal(aliasOnly.layerReadiness.language, 'canonical_absent');
    assert.equal(aliasOnly.layerReadiness['time-community'], 'blocked');
    assert.equal(noPayload.layerReadiness.language, 'canonical_absent');
    assert.equal(noPayload.layerReadiness.personal, 'bridged_local');
    assert.equal(noPayload.layerReadiness.pedagogy, 'bridged_public');
});

test('layer selector renders per-layer provenance pills from layerReadiness', () => {
    const model = buildM0InspectorModel({
        selectedInput: '#0',
        graphNode: {
            ...capturedS2GraphNode,
            properties: {
                ...capturedS2GraphNode.properties,
                c_1_symbol: '0/1'
            }
        },
        profile,
        readiness,
        context
    });
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(LayerSelector, { layerReadiness: model.layerReadiness })
    );

    assert.match(markup, /class="m0-layer-tab-provenance-pill"/);
    assert.match(markup, /data-layer-key="language"[^>]*>[\s\S]*data-provenance-state="canonical"/);
    assert.match(markup, /data-layer-key="personal"[^>]*>[\s\S]*data-provenance-state="bridged_local"/);
    assert.match(markup, /data-layer-key="pedagogy"[^>]*>[\s\S]*data-provenance-state="bridged_public"/);
});

test('cross-layout intent with relations target opens M0 widget and activates relations layer', async () => {
    require('@theia/core/lib/browser/frontend-application-config-provider')
        .FrontendApplicationConfigProvider
        .set({ applicationName: 'm0-anuttara-intent-node-test' });
    const { M0AnuttaraContribution } = require('../m0-anuttara/lib/browser/frontend-module.js');
    const { EMPTY_COORDINATE_CONTEXT } = require('../m-extension-runtime/lib/common/index.js');
    const commands = recordingCommands();
    const contexts = [];
    const widget = {
        activeLayer: 'language',
        phase: 'implicate',
        mode: 'reading',
        context: EMPTY_COORDINATE_CONTEXT,
        bridge: {
            updateCoordinateContext(next) {
                contexts.push(next);
                widget.context = next;
            }
        },
        update() {
            return undefined;
        }
    };
    const contribution = new M0AnuttaraContribution();
    let opened = 0;
    contribution.openView = async () => {
        opened += 1;
        return widget;
    };

    contribution.registerCommands(commands);
    await commands.executeCommand('pratibimba.m0-anuttara.relations.open', {
        requestedExtensionId: 'm0-anuttara',
        requestedContributionId: 'relations',
        coordinate: '#0.2',
        implicateExplicate: 'explicate',
        mode: 'authoring',
        source: 'test'
    });

    assert.equal(opened, 1);
    assert.equal(widget.activeLayer, 'relations');
    assert.equal(widget.phase, 'explicate');
    assert.equal(widget.mode, 'authoring');
    assert.equal(contexts[0].selectedCoordinate, '#0.2');
});

test('missing Anuttara syntax fields render as canonical absence, not placeholders', () => {
    const sparse = buildM0InspectorModel({
        selectedInput: '#0',
        graphNode: { coordinate: 'M0', properties: { c_0_family: 'anuttara' } },
        profile: null,
        readiness,
        context
    });

    for (const field of sparse.languageFields) {
        assert.equal(field.value, null);
        assert.equal(field.state, 'canonical_absent');
        assert.match(field.provenance, /Canonical absence/);
        assert.doesNotMatch(field.provenance, /placeholder/i);
    }
});

function recordingCommands() {
    const entries = new Map();
    return {
        registerCommand(command, handler) {
            entries.set(command.id, { command, handler });
            return { dispose() {} };
        },
        getCommand(id) {
            return entries.get(id)?.command;
        },
        async executeCommand(id, ...args) {
            const entry = entries.get(id);
            if (!entry) {
                throw new Error(`Missing command ${id}`);
            }
            return entry.handler.execute(...args);
        }
    };
}

test('Anuttara asset handles render with explicit DR-M0-4 provenance state', () => {
    const assetNode = {
        ...capturedS2GraphNode,
        properties: {
            ...capturedS2GraphNode.properties,
            c_1_asset_uri: [
                'vault://Idea/Bimba/Map/assets/decan-seals/aries-01.png',
                'ipfs://bafybeigdyrztdecanseal'
            ],
            c_1_asset_kind: 'decan-seal'
        }
    };
    const model = buildM0InspectorModel({
        selectedInput: '#0',
        graphNode: assetNode,
        profile,
        readiness,
        context
    });
    const assetField = model.languageFields.find(field => field.key === 'c_1_asset_uri');

    assert.ok(assetField);
    assert.equal(assetField.state, 'review_pending');
    assert.match(assetField.value, /decan-seal/);
    assert.match(assetField.value, /vault:\/\/Idea\/Bimba\/Map\/assets\/decan-seals\/aries-01\.png/);
    assert.match(assetField.value, /ipfs:\/\/bafybeigdyrztdecanseal/);
    assert.match(assetField.provenance, /DR-M0-4/);
    assert.match(assetField.provenance, /c_1_asset_uri/);
});

test('OWL SHACL GDS facts preserve inferred/review-pending/blocked status', () => {
    const model = buildM0InspectorModel({
        selectedInput: '#0',
        graphNode: capturedS2GraphNode,
        profile,
        readiness,
        context
    });

    assert.equal(model.readinessFacts.find(fact => fact.id === 'owl')?.state, 'inferred');
    assert.equal(model.readinessFacts.find(fact => fact.id === 'shacl')?.state, 'review_pending');
    assert.equal(model.readinessFacts.find(fact => fact.id === 'gds')?.state, 'blocked');
    assert.equal(model.readinessFacts.find(fact => fact.id === 'kernel-core')?.canonical, true);
});

test('communityClockOverlay view is declared and remains blocked until S2 GDS payload is wired', () => {
    const model = buildM0InspectorModel({
        selectedInput: '#0',
        graphNode: capturedS2GraphNode,
        profile,
        readiness,
        context
    });

    assert.ok(ALL_VIEW_IDS.includes(COMMUNITY_CLOCK_OVERLAY_VIEW_ID));
    assert.equal(COMMUNITY_CLOCK_OVERLAY_VIEW_ID, 'm0.anuttara.communityClockOverlay');
    assert.equal(model.communityClockOverlay.viewId, COMMUNITY_CLOCK_OVERLAY_VIEW_ID);
    assert.equal(model.communityClockOverlay.state, 'blocked');
    assert.equal(model.communityClockOverlay.gdsCommunity.state, 'blocked');
    assert.equal(model.communityClockOverlay.readOnly, true);
    assert.equal(model.communityClockOverlay.mutatesGraphCanon, false);
    assert.equal(model.communityClockOverlay.usesLocalClock, false);
    assert.equal(model.communityClockOverlay.canonicalWritePerformed, false);
    assert.match(model.communityClockOverlay.provenance, /blocked until S2 GDS payload wired/);
    assert.doesNotMatch(model.communityClockOverlay.provenance, /placeholder/i);
});

test('Atelier daily claim is an etymological-cluster projection lens on the existing graph viewer', () => {
    const model = buildM0InspectorModel({
        selectedInput: '#0',
        graphNode: capturedS2GraphNode,
        profile,
        readiness,
        context
    });
    const lens = model.projectionLenses.find(
        entry => entry.id === 'pratibimba.daily.atelier-cluster-lens'
    );

    assert.ok(lens);
    assert.equal(lens.lensKind, 'etymological-cluster');
    assert.equal(lens.targetViewId, COMMUNITY_CLOCK_OVERLAY_VIEW_ID);
    assert.equal(lens.ownerExtension, 'm0-anuttara');
    assert.equal(lens.standaloneExtension, false);
    assert.match(lens.provenance, /atelier-projection-lens/);
    assert.match(lens.provenance, /no logos-atelier extension/);
});

test('communityClockOverlay renders supplied S2 GDS community and S3 active-now projections', () => {
    const graphNode = {
        ...capturedS2GraphNode,
        gdsOverlay: {
            status: 'ready_public_current',
            gdsReady: true,
            projectionName: 's2_public_bimba_option1_v1',
            projectionVersion: '2026-06-01-option1-public-coordinate-overlay',
            privacyBoundaryStatus: 'public-coordinate-topology-only-excludes-protected-local-labels',
            communityId: 'louvain:M0:0',
            canonicalWritePerformed: false
        }
    };
    const wiredProfile = {
        ...profile,
        payload: {
            ...profile.payload,
            m0_graph_node: graphNode,
            s3_active_now: {
                handle: 's3://day-now/2026-06-01/session'
            }
        }
    };
    const model = buildM0InspectorModel({
        selectedInput: '#0',
        graphNode,
        profile: wiredProfile,
        readiness,
        context
    });

    assert.equal(model.communityClockOverlay.state, 'canonical');
    assert.equal(model.communityClockOverlay.gdsCommunity.value, 'louvain:M0:0');
    assert.equal(model.communityClockOverlay.activeNow.value, 's3://day-now/2026-06-01/session');
    assert.equal(
        model.communityClockOverlay.projection.value,
        's2_public_bimba_option1_v1@2026-06-01-option1-public-coordinate-overlay'
    );
    assert.equal(
        model.communityClockOverlay.privacyBoundary.value,
        'public-coordinate-topology-only-excludes-protected-local-labels'
    );
    assert.equal(model.communityClockOverlay.usesLocalClock, false);
});

test('M5 action hooks are gateway-shaped requests and cannot write graph canon', () => {
    const model = buildM0InspectorModel({
        selectedInput: '#0',
        graphNode: capturedS2GraphNode,
        profile,
        readiness,
        context
    });

    assert.deepEqual(
        model.actions.map(action => action.method),
        ["s5'.improve.propose", 's5.episodic.deposit', "s5'.review.submit"]
    );
    for (const action of model.actions) {
        assert.equal(action.mutatesGraphCanon, false);
        assert.equal(action.params.mutatesGraphCanon, false);
        assert.equal(action.params.coordinate, 'M0');
        assert.equal(action.params.privacyClass, 'public_current_with_graph_provenance');
    }
});

test('M0 pedagogy keeps prior-ground boundary and routes +1 parent away from M0', () => {
    const model = buildM0InspectorModel({
        selectedInput: '#0',
        graphNode: capturedS2GraphNode,
        profile,
        readiness,
        context
    });

    assert.match(model.pedagogy.priorGroundBoundary, /prior 0\/1 ground/);
    assert.match(model.pedagogy.parentAttribution, /M1\/M2\/M3/);
    assert.match(model.pedagogy.contradiction, /DCC-01/);
});

test('six-layer surface routes share one S2 graph query path', () => {
    const model = buildM0InspectorModel({
        selectedInput: '#0',
        graphNode: capturedS2GraphNode,
        profile,
        readiness,
        context
    });

    assert.deepEqual(
        model.layerRoutes.map(route => route.layer),
        ['lang', 'ql', 'rel', 'time', 'pers', 'pedag']
    );
    assert.deepEqual(
        [...new Set(model.layerRoutes.map(route => route.query.method))],
        ['s2.graph.query']
    );
    for (const route of model.layerRoutes) {
        assert.equal(route.query.params.coordinate, 'M0');
        assert.equal(route.query.params.layer, route.layer);
        assert.equal(route.mutatesGraphCanon, false);
        assert.match(route.tabId, /^m0-layer-/);
    }
});

test('widget renders the model layer routes as six tab buttons', async () => {
    const source = await import('node:fs/promises').then(fs =>
        fs.readFile(new URL('../m0-anuttara/src/browser/m0-anuttara-widget.tsx', import.meta.url), 'utf8')
    );

    assert.match(source, /role="tablist"/);
    assert.match(source, /role="tab"/);
    assert.match(source, /model\.layerRoutes\.map/);
});

test('widget renders the community clock overlay without a renderer-local clock', async () => {
    const source = await import('node:fs/promises').then(fs =>
        fs.readFile(new URL('../m0-anuttara/src/browser/m0-anuttara-widget.tsx', import.meta.url), 'utf8')
    );

    assert.match(source, /m0-community-clock-overlay/);
    assert.match(source, /model\.communityClockOverlay\.viewId/);
    assert.match(source, /data-provenance-state=\{model\.communityClockOverlay\.state\}/);
    assert.doesNotMatch(source, /new Date|Date\.now|performance\.now/);
});

test('Virtue Witness LUT mirrors the nine epi-lib VIRTUE_LUT names', async () => {
    const source = await readFile(
        new URL('../../../../S/S0/epi-lib/src/m0.c', import.meta.url),
        'utf8'
    );
    const cNames = [...source.matchAll(/\.name = "([^"]+)"/g)]
        .slice(0, VIRTUE_WITNESS_VECTOR_SIZE)
        .map(match => match[1]);

    assert.equal(VIRTUE_WITNESS_VECTOR_SIZE, 9);
    assert.equal(VIRTUE_WITNESS_LUT.length, 9);
    assert.deepEqual(
        VIRTUE_WITNESS_LUT.map(entry => entry.name),
        cNames
    );
});

test('Virtue Witness vector helpers toggle real positions and count active bits', () => {
    const initial = createWitnessVector([0, 3, 8]);
    assert.equal(activeWitnessCount(initial), 3);
    assert.equal(initial[0], true);
    assert.equal(initial[1], false);

    const toggled = toggleWitnessBit(initial, 3);
    assert.equal(activeWitnessCount(toggled), 2);
    assert.equal(toggled[3], false);
    assert.equal(initial[3], true);

    const retoggled = toggleWitnessBit(toggled, 1);
    assert.equal(activeWitnessCount(retoggled), 3);
    assert.equal(retoggled[1], true);
    assert.throws(() => toggleWitnessBit(retoggled, 9), /outside the 9-bit witness vector/);
});

test('Virtue Witness panel renders nine toggleable positions and the active count', () => {
    const profileWithWitness = Object.freeze({
        ...profile,
        payload: Object.freeze({
            ...profile.payload,
            virtueWitnessVector: [true, false, true, false, true, false, true, false, true]
        })
    });
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(VirtueWitnessPanel, { profile: profileWithWitness })
    );

    assert.match(markup, /data-widget-id="pratibimba\.m0-anuttara:virtue-witness-panel"/);
    assert.match(markup, /data-active-witness-count="5"/);
    assert.equal((markup.match(/data-virtue-position=/g) ?? []).length, 9);
    assert.equal((markup.match(/aria-pressed="/g) ?? []).length, 9);
    for (const entry of VIRTUE_WITNESS_LUT) {
        assert.match(markup, new RegExp(`data-virtue-position="${entry.position}"`));
        assert.match(markup, new RegExp(entry.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
});

test('Arch 9 completion syntax panel renders VIRTUE rows in canonical order and cross-links witness', () => {
    const virtueRows = VIRTUE_WITNESS_LUT.map(entry =>
        Object.freeze({
            id: entry.position,
            label: entry.name.split(' - ')[0],
            symbol: entry.symbol,
            provenance: 'VIRTUE_LUT projected through m0_routing_lut_snapshot'
        })
    );
    const virtueWitness = Object.freeze({
        witnessBits: Object.freeze([true, true, false, true, false, true, false, true, true]),
        virtueLabels: Object.freeze(
            VIRTUE_WITNESS_LUT.map(entry => entry.name.split(' - ')[0])
        ),
        coherenceScore: 0.72,
        unsatisfiedConstraints: Object.freeze(['#R0-0/1/A-T9-unwitnessed?']),
        state: 'canonical'
    });
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(Arch9CompletionPanel, {
            subTableRows: virtueRows,
            contemplationPrompt: 'What completion is asking to be witnessed now?',
            virtueWitness,
            onSeekContemplation: () => undefined
        })
    );

    assert.match(markup, /data-syntax-layer="completion"/);
    assert.match(markup, /data-cross-link="21\.10"/);
    assert.match(markup, /Why this question right now\?/);
    assert.match(markup, /What completion is asking to be witnessed now\?/);
    assert.equal((markup.match(/data-syntax-row-id=/g) ?? []).length, 9);
    assert.equal((markup.match(/data-witness-row=/g) ?? []).length, 9);
    assert.ok(markup.indexOf('Love/Peace') < markup.indexOf('Reality'));
    assert.match(markup, /data-syntax-row-id="0"[^>]*>[\s\S]*Love\/Peace/);
    assert.match(markup, /data-syntax-row-id="8"[^>]*>[\s\S]*Reality/);
    assert.match(markup, /data-witness-state="witnessed"[\s\S]*Love\/Peace/);
    assert.match(markup, /data-witness-state="unwitnessed"[\s\S]*Openness\/Creativity/);
});
