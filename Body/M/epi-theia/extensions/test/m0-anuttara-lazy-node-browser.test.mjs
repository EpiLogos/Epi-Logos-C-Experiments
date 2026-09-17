import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const {
    LazyNodeBrowserPanel,
    M0_LAZY_NODE_DEFAULT_LIMIT,
    M0_LAZY_NODE_LIST_METHOD,
    buildM0LazyNodeListParams,
    contextForLazyNodeSelection,
    createM0LazyNodeBrowserState,
    loadM0LazyNodePage,
    readM0LazyNodeListArtifact,
    selectM0LazyNodeEntry
} = require('../m0-anuttara/lib/browser/panels/lazy-node-browser-panel.js');

const context = Object.freeze({
    selectedCoordinate: '#0',
    hashInput: '#0',
    canonicalMCoordinate: 'M0',
    profileGeneration: 21,
    pointerAnchor: 'pointer://m0/anuttara',
    dayNowSessionHandle: '2026-06-01/session',
    privacyClass: 'public_current',
    provenance: {
        source: 'captured-s2-graph',
        generation: 21,
        notes: []
    }
});

test('lazy browser default state pages the residual set in twenties', () => {
    assert.deepEqual(createM0LazyNodeBrowserState(), {
        branch: 'all',
        offset: 0,
        limit: M0_LAZY_NODE_DEFAULT_LIMIT,
        results: [],
        totalCount: null
    });
    assert.deepEqual(createM0LazyNodeBrowserState({ offset: -1, limit: 0 }), {
        branch: 'all',
        offset: 0,
        limit: M0_LAZY_NODE_DEFAULT_LIMIT,
        results: [],
        totalCount: null
    });
});

test('s2.graph.list request carries coordinatePrefix plus offset and limit query params', () => {
    const allParams = buildM0LazyNodeListParams(
        { branch: 'all', offset: 40, limit: 20 },
        '#0'
    );
    assert.equal(allParams.coordinatePrefix, '#0');
    assert.equal(allParams.offset, 40);
    assert.equal(allParams.limit, 20);
    assert.equal(allParams.residualSet, 'm0-96-node');
    assert.equal(allParams.sourceExtensionId, 'm0-anuttara');

    const branchParams = buildM0LazyNodeListParams(
        { branch: '#0-3', offset: 0, limit: 12 },
        '#0'
    );
    assert.equal(branchParams.coordinatePrefix, '#0-3');
    assert.equal(branchParams.branch, '#0-3');
});

test('s2.graph.list payload parsing keeps only real M0 residual entries', () => {
    const page = readM0LazyNodeListArtifact({
        totalCount: 96,
        results: [
            {
                coordinate: '#0-0-12',
                name: 'Residual language node',
                m0SubBranch: '#0-0',
                documentLink: 'Idea/Bimba/M0/residual.md'
            },
            {
                canonical_coordinate: '#0-5-95',
                label: 'Completion residual',
                properties: {
                    m0_sub_branch: '#0-5'
                }
            },
            {
                coordinate: '#1-0-01',
                name: 'Foreign branch'
            },
            {
                name: 'Missing coordinate'
            }
        ]
    });

    assert.equal(page.totalCount, 96);
    assert.deepEqual(page.results, [
        {
            coordinate: '#0-0-12',
            name: 'Residual language node',
            m0SubBranch: '#0-0',
            documentLink: 'Idea/Bimba/M0/residual.md'
        },
        {
            coordinate: '#0-5-95',
            name: 'Completion residual',
            m0SubBranch: '#0-5'
        }
    ]);
});

test('loadM0LazyNodePage invokes the real gateway method shape', async () => {
    const calls = [];
    const bridge = {
        async invokeGatewayRpc(method, params) {
            calls.push({ method, params });
            return {
                pageInfo: { totalCount: 96 },
                nodes: [
                    {
                        coordinate: '#0-2-41',
                        properties: {
                            label: 'Relation residual',
                            document_link: 'Idea/Bimba/M0/relation.md'
                        }
                    }
                ]
            };
        }
    };

    const page = await loadM0LazyNodePage(
        bridge,
        { branch: '#0-2', offset: 20, limit: 20 },
        '#0'
    );

    assert.equal(calls.length, 1);
    assert.equal(calls[0].method, M0_LAZY_NODE_LIST_METHOD);
    assert.equal(calls[0].params.coordinatePrefix, '#0-2');
    assert.equal(calls[0].params.offset, 20);
    assert.equal(calls[0].params.limit, 20);
    assert.deepEqual(page.results, [
        {
            coordinate: '#0-2-41',
            name: 'Relation residual',
            m0SubBranch: '#0-2',
            documentLink: 'Idea/Bimba/M0/relation.md'
        }
    ]);
    assert.equal(page.totalCount, 96);
});

test('node-card selection updates SharedBridgeAdapter coordinate context shape', () => {
    const entry = {
        coordinate: '#0-4-77',
        name: 'Personal route residual',
        m0SubBranch: '#0-4'
    };
    const next = contextForLazyNodeSelection(context, entry);
    assert.equal(next.selectedCoordinate, '#0-4-77');
    assert.equal(next.hashInput, '#0-4-77');
    assert.equal(next.canonicalMCoordinate, 'M0');
    assert.equal(next.provenance.source, 'm0-anuttara:lazy-node-browser');
    assert.match(next.provenance.notes.join(' '), /s2\.graph\.list/);

    let received = null;
    const bridge = {
        updateCoordinateContext(value) {
            received = value;
        }
    };
    assert.equal(selectM0LazyNodeEntry(bridge, context, entry), received);
    assert.equal(received.selectedCoordinate, '#0-4-77');
});

test('LazyNodeBrowser panel advertises the method and coordinate prefix in markup', () => {
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(LazyNodeBrowserPanel, {
            bridge: null,
            context,
            coordinatePrefix: '#0'
        })
    );

    assert.match(markup, /pratibimba\.m0-anuttara:LazyNodeBrowser/);
    assert.match(markup, /data-method="s2\.graph\.list"/);
    assert.match(markup, /data-coordinate-prefix="#0"/);
    assert.match(markup, /coordinatePrefix=#0/);
});
