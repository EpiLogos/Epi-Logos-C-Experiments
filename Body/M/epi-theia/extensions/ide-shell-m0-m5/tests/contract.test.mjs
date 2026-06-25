// T4 contract verification — exercises the load-bearing contract surface of
// the ide-shell-m0-m5 extension WITHOUT requiring the Theia DI runtime (those
// are exercised via the smoke-build chunk presence test + headless Theia
// assertions in T9). What this file proves:
//
//  - Capability matrix parser ingests the real
//    Body/S/S4/plugins/pleroma/capability-matrix.json file (NOT a fixture).
//  - Privacy gate refuses every entry of FORBIDDEN_PRIVACY_CLASSES.
//  - Canon Studio save routing rejects with "no vault-bridge registered"
//    when no vault-bridge command is in the registry (the T4.5 gate).
//  - Wikilink / coordinate decorator detects the canonical QL / M / S /
//    context-frame patterns.
//  - The subgraph reader tolerates the real S2 payload shapes the gateway
//    emits.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require.extensions['.css'] = () => undefined;
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const {
    parseCapabilityMatrix,
    dispatchToolNames,
    skillNames,
    isPrivacySafe,
    FORBIDDEN_PRIVACY_CLASSES,
    ALLOWED_PRIVACY_CLASSES,
    asSubgraph,
    buildBimbaLibrarySurface,
    EMPTY_SUBGRAPH,
    IDE_SHELL_WIDGET_IDS,
    IDE_SHELL_INTENT_TARGETS,
    EXTENSION_ID,
    decorateCoordinates
} = require('../lib/common/index.js');
const {
    GraphCanvas
} = require('../lib/browser/bimba-graph-viewer/graph-canvas.js');
const {
    RunTree
} = require('../lib/browser/acr/run-tree.js');
const {
    ToolStream
} = require('../lib/browser/acr/tool-stream.js');

// __dirname here is .../Body/M/epi-theia/extensions/ide-shell-m0-m5/tests
// — six levels up to reach the repo root (where Body/ lives).
const CAPABILITY_MATRIX_PATH = resolve(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    '..',
    '..',
    'Body',
    'S',
    'S4',
    'plugins',
    'pleroma',
    'capability-matrix.json'
);

const SOURCE_ROOT = resolve(__dirname, '..', 'src', 'browser');
const STYLE_ROOT = resolve(__dirname, '..', 'style');

const INLINE_READINESS_BINDINGS = Object.freeze({
    'bimba-graph-viewer-widget.tsx': ['s2.graph.node'],
    'coordinate-tree-widget.tsx': ["s2'.coordinate.resolve"],
    'evidence-pane-widget.tsx': ["s5'.review.history"],
    'review-pane-widget.tsx': ["s5'.review.inbox"],
    'autoresearch-pane-widget.tsx': ["s5'.improve.history"],
    'logos-atelier-widget.tsx': ['aletheia_gnosis_query', 'aletheia_crystallise'],
    'canon-studio-widget.tsx': ['vault-bridge.s1prime.vault.write_file', "s1'.semantic.suggest"],
    'agentic-control-room-widget.tsx': ['capability-matrix', 'agentic-control-room.route']
});

const DR_IG_1_SUBGRAPH = Object.freeze({
    node: Object.freeze({
        coordinate: 'M0',
        namespace: 'bimba',
        label: 'Anuttara'
    }),
    neighbors: Object.freeze([
        { coordinate: 'M0-0', namespace: 'bimba', label: 'Ground', c_1_relation_family: 'structural', type: 'CONTAINS' },
        { coordinate: 'M0-1', namespace: 'bimba', label: 'Emergence', c_1_relation_family: 'structural', type: 'CONTAINS' },
        { coordinate: 'M0-2', namespace: 'bimba', label: 'Relations', c_1_relation_family: 'structural', type: 'CONTAINS' },
        { coordinate: 'M0-3', namespace: 'bimba', label: 'Community', c_1_relation_family: 'structural', type: 'FAMILY_CONTAINS' },
        { coordinate: 'M0-4', namespace: 'bimba', label: 'Profile', c_1_relation_family: 'correspondential', type: 'ANCHORED_TO' },
        { coordinate: 'M0-5', namespace: 'bimba', label: 'Recognition', c_1_relation_family: 'correspondential', type: 'REFLECTS_AS' },
        { coordinate: 'M1', namespace: 'bimba', label: 'Paramasiva', c_1_relation_family: 'correspondential', type: 'HAS_KERNEL_RESONANCE' },
        { coordinate: 'Empty-Day', namespace: 'Empty', label: 'Day note', c_1_relation_family: 'structural', type: 'DERIVES_FROM' }
    ]),
    privacyClass: 'safe-public-current-kernel-tick',
    profileGeneration: 28,
    source: 's2.graph.node'
});

function renderGraphCanvas(overrides = {}) {
    return ReactDOMServer.renderToStaticMarkup(
        React.createElement(GraphCanvas, {
            subgraph: DR_IG_1_SUBGRAPH,
            renderingMode: 'full-lattice',
            activeCoordinate: 'M0',
            relationFamilyFilter: 'all',
            onNodeClick: () => undefined,
            onEdgeHover: () => undefined,
            ...overrides
        })
    );
}

function countMatches(text, pattern) {
    return (text.match(pattern) ?? []).length;
}

test('parses the real capability-matrix.json from Body/S/S4/plugins/pleroma', () => {
    const raw = JSON.parse(readFileSync(CAPABILITY_MATRIX_PATH, 'utf8'));
    const matrix = parseCapabilityMatrix(raw);
    assert.equal(matrix.coordinate, "S4/S4'");
    assert.equal(matrix.owner_agent, 'anima');
    assert.deepEqual(matrix.constitutional_agents, [], 'constitutional_agents is deprecated as a live roster');
    assert.match(
        matrix._constitutional_agents_status,
        /DEPRECATED per DR-M5-1/,
        'constitutional_agents deprecation is documented'
    );
    assert.ok(matrix.dispatch_tools.length >= 1, 'has dispatch tools');
    assert.ok(matrix.skills.length >= 1, 'has skills');
});

test('dispatch tool + skill names from the real matrix are non-empty', () => {
    const raw = JSON.parse(readFileSync(CAPABILITY_MATRIX_PATH, 'utf8'));
    const matrix = parseCapabilityMatrix(raw);
    const tools = dispatchToolNames(matrix);
    const skills = skillNames(matrix);
    assert.ok(tools.includes('dispatch_agent'), 'dispatch_agent listed');
    assert.ok(tools.includes('dispatch_parallel_agents'), 'dispatch_parallel_agents listed');
    assert.ok(tools.includes('run_chain'), 'run_chain listed');
    assert.ok(skills.includes('vak-evaluate'), 'vak-evaluate skill listed');
});

test('parseCapabilityMatrix rejects malformed input', () => {
    assert.throws(() => parseCapabilityMatrix(null), /must be an object/);
    assert.throws(() => parseCapabilityMatrix({}), /missing required field/);
    assert.throws(
        () => parseCapabilityMatrix({
            coordinate: 'x',
            owner_agent: 'x',
            package_role: 'x',
            body_residency: 'x',
            plugin_manifest: 'x',
            constitutional_agents: 'not-an-array',
            dispatch_tools: [],
            skills: []
        }),
        /constitutional_agents must be an array/
    );
});

test('privacy gate refuses every forbidden privacy class', () => {
    for (const klass of FORBIDDEN_PRIVACY_CLASSES) {
        assert.equal(
            isPrivacySafe(klass),
            false,
            `${klass} must be refused by the IDE shell privacy gate`
        );
    }
});

test('privacy gate accepts allowed and unset privacy classes', () => {
    assert.equal(isPrivacySafe(null), true);
    assert.equal(isPrivacySafe(undefined), true);
    for (const klass of ALLOWED_PRIVACY_CLASSES) {
        assert.equal(isPrivacySafe(klass), true, `${klass} must pass the privacy gate`);
    }
});

test('asSubgraph tolerates a bare gateway artifact', () => {
    const bare = {
        coordinate: 'M0.anuttara',
        namespace: 'bimba',
        label: 'Prior ground',
        sourceAnchor: 'Body/S/S0/foo.rs',
        specAnchor: 'docs/spec.md',
        codeAnchor: 'src/lib.rs#L12',
        testAnchor: 'tests/lib_test.rs'
    };
    const result = asSubgraph(bare, 'safe-public-current-kernel-tick', 12, 's2.graph.node');
    assert.equal(result.node?.coordinate, 'M0.anuttara');
    assert.equal(result.node?.namespace, 'bimba');
    assert.equal(result.privacyClass, 'safe-public-current-kernel-tick');
    assert.equal(result.profileGeneration, 12);
    assert.equal(result.neighbors.length, 0);
});

test('asSubgraph tolerates an enveloped { node, neighbors[] } artifact', () => {
    const env = {
        node: { coordinate: 'M5.epii', namespace: 'bimba', label: 'Pratibimba' },
        neighbors: [
            { coordinate: 'M5.review' },
            { coordinate: 'M5.evidence' }
        ]
    };
    const result = asSubgraph(env, 'safe-public-current-kernel-tick', 13, 's2.graph.query');
    assert.equal(result.node?.coordinate, 'M5.epii');
    assert.equal(result.neighbors.length, 2);
    assert.equal(result.source, 's2.graph.query');
});

test('map traversal surfaces the M5 library through bimba_coordinate and bimba_resonances tags', () => {
    const walked = asSubgraph(
        {
            node: {
                coordinate: 'M5-0',
                namespace: 'bimba',
                label: 'Library / Gnostic Namespace',
                bimba_coordinate: 'M5-0',
                bimba_resonances: ['M0', 'M5', 'S5/S5\''],
                sourceAnchor: 'Body/S/S5/epi-gnostic/schema-context.md'
            },
            neighbors: [
                { coordinate: 'M0', label: 'Graph chrome', bimba_resonances: ['M5-0'] },
                { coordinate: 'S5/S5\'', label: 'Gnostic runtime' }
            ]
        },
        'safe-public-current-kernel-tick',
        99,
        's2.graph.traverse'
    );

    const surface = buildBimbaLibrarySurface(walked, 'M5-0');

    assert.equal(surface.bimba_coordinate, 'M5-0');
    assert.deepEqual(surface.bimba_resonances, ['M0', 'M5', "S5/S5'"]);
    assert.equal(surface.gatewayMethod, "s5'.gnostic.library_surface");
    assert.equal(surface.source, 'map-traversal');
    assert.equal(surface.mutatesGraphCanon, false);
    assert.equal(Object.hasOwn(surface, 'viewMode'), false);
});

test('asSubgraph returns EMPTY_SUBGRAPH-equivalent on a non-object artifact', () => {
    const r1 = asSubgraph(null, 'safe-public-current-kernel-tick', null, 's2.graph.node');
    const r2 = asSubgraph(42, 'safe-public-current-kernel-tick', null, 's2.graph.node');
    assert.equal(r1.node, null);
    assert.equal(r2.node, null);
    assert.equal(r1.neighbors.length, 0);
    assert.equal(EMPTY_SUBGRAPH.neighbors.length, 0);
});

test('GraphCanvas renders solar-anchor as active sun plus at most six Bimba-side neighbors', () => {
    const html = renderGraphCanvas({ renderingMode: 'solar-anchor' });
    assert.match(html, /data-rendering-mode="solar-anchor"/);
    assert.equal(countMatches(html, /data-test="bimba-graph-active-node"/g), 1);
    assert.equal(countMatches(html, /data-test="bimba-graph-neighbor-node"/g), 6);
    assert.doesNotMatch(html, /Empty-Day/);
});

test('GraphCanvas renders full-lattice with every neighbor from the S2 payload', () => {
    const html = renderGraphCanvas({ renderingMode: 'full-lattice' });
    assert.match(html, /data-rendering-mode="full-lattice"/);
    assert.equal(countMatches(html, /data-test="bimba-graph-neighbor-node"/g), DR_IG_1_SUBGRAPH.neighbors.length);
    assert.match(html, /Empty-Day/);
});

test('GraphCanvas partitions edges by c_1_relation_family for DR-IG-1 filtering', () => {
    const structural = renderGraphCanvas({ relationFamilyFilter: 'structural' });
    const correspondential = renderGraphCanvas({ relationFamilyFilter: 'correspondential' });
    assert.equal(countMatches(structural, /data-relation-family="structural"/g), 5);
    assert.equal(countMatches(structural, /data-relation-family="correspondential"/g), 0);
    assert.equal(countMatches(correspondential, /data-relation-family="correspondential"/g), 3);
    assert.equal(countMatches(correspondential, /data-relation-family="structural"/g), 0);
});

test('Coordinate Tree ships C-family, namespace, active, authoring, and privacy classes', () => {
    const source = readFileSync(resolve(SOURCE_ROOT, 'coordinate-tree-widget.tsx'), 'utf8');
    const css = readFileSync(resolve(STYLE_ROOT, 'coordinate-tree.css'), 'utf8');
    const combined = `${source}\n${css}`;
    for (const family of ['P', 'S', 'T', 'M', 'L', 'C']) {
        assert.match(combined, new RegExp(`coordinate-family-${family}`));
    }
    assert.match(combined, /coordinate-namespace-empty/);
    assert.match(combined, /coordinate-namespace-pratibimba/);
    assert.match(combined, /coordinate-privacy-public/);
    assert.match(combined, /coordinate-privacy-safe-public-current-kernel-tick/);
    assert.match(combined, /active-coordinate/);
    assert.match(source, /Propose canonical edit/);
    assert.match(combined, /privacy_blocked/);
    assert.match(combined, /coordinate-privacy-blocked/);
});

test('Coordinate Tree source subscribes and publishes active coordinate via SharedBridgeAdapter', () => {
    const source = readFileSync(resolve(SOURCE_ROOT, 'coordinate-tree-widget.tsx'), 'utf8');
    assert.match(source, /@inject\(SharedBridgeAdapter\)/);
    assert.match(source, /protected activeCoordinate:\s*string\s*\|\s*null\s*=\s*null/);
    assert.match(source, /protected readonly disposers/);
    assert.match(source, /onCoordinateContext/);
    assert.match(source, /publishCoordinateContext\(coordinate/);
    assert.match(source, /updateCoordinateContext\(next\)/);
    assert.match(source, /selectedCoordinate:\s*coordinate/);
    assert.match(source, /source:\s*'coordinate-tree'/);
});

test('Coordinate Tree authoring mode routes to Canon Studio and keeps graph canon immutable', () => {
    const source = readFileSync(resolve(SOURCE_ROOT, 'coordinate-tree-widget.tsx'), 'utf8');
    assert.match(source, /protected surfaceMode:\s*'reading'\s*\|\s*'authoring'\s*=\s*'reading'/);
    assert.match(source, /mutatesGraphCanon\s*=\s*false/);
    assert.match(source, /CROSS_LAYOUT_INTENT_DISPATCH_COMMAND/);
    assert.match(source, /requestedExtensionId:\s*EXTENSION_ID/);
    assert.match(source, /requestedContributionId:\s*IDE_SHELL_INTENT_TARGETS\.CANON_STUDIO/);
    assert.doesNotMatch(source, /requestCanonMutation|mutateGraphCanon|vaultBridgeWrite\(/);
});

test('Coordinate Tree expand state is Set-backed and family expand commands are registered', () => {
    const widgetSource = readFileSync(resolve(SOURCE_ROOT, 'coordinate-tree-widget.tsx'), 'utf8');
    const moduleSource = readFileSync(resolve(SOURCE_ROOT, 'frontend-module.ts'), 'utf8');
    assert.match(widgetSource, /protected expanded:\s*Set<string>\s*=\s*new Set<string>\(\)/);
    assert.match(widgetSource, /data-expanded=\{String\(isExpanded\)\}/);
    assert.match(widgetSource, /expandFamily\(family/);
    for (const family of ['P', 'S', 'T', 'M', 'L', 'C']) {
        assert.match(
            moduleSource,
            new RegExp(`pratibimba\\.coordinate-tree\\.expand-family\\.${family}`)
        );
    }
});

test('Bimba graph widget publishes coordinate context through SharedBridgeAdapter on node click', () => {
    const source = readFileSync(resolve(SOURCE_ROOT, 'bimba-graph-viewer-widget.tsx'), 'utf8');
    assert.match(source, /publishCoordinateContext\(coordinate\)/);
    assert.match(source, /this\.sharedBridge\.updateCoordinateContext\(next\)/);
    assert.match(source, /source:\s*'bimba-graph-viewer'/);
    assert.match(source, /selectedCoordinate:\s*coordinate/);
});

test('IDE_SHELL_WIDGET_IDS match the deep-IDE layout descriptor expectations', () => {
    // The pratibimba-layouts IDE_DEEP_DESCRIPTOR.expectedWidgets uses the
    // shorter "pratibimba.ide-shell.*" prefix. Verify all the chrome widget
    // ids surface the same prefix so a layout-restore can find them.
    for (const id of Object.values(IDE_SHELL_WIDGET_IDS)) {
        assert.ok(
            id.startsWith('pratibimba.ide-shell.'),
            `widget id ${id} must start with the pratibimba.ide-shell. namespace`
        );
    }
});

test('IDE_SHELL_INTENT_TARGETS match the dispatcher contribution ids', () => {
    // CrossLayoutIntentDispatcher routes `open-canon-studio-file` to
    // requestedExtensionId='ide-shell-m0-m5' + requestedContributionId='canon-studio'.
    // The intent target IDs we export must match.
    assert.equal(IDE_SHELL_INTENT_TARGETS.CANON_STUDIO, 'canon-studio');
    assert.equal(IDE_SHELL_INTENT_TARGETS.BIMBA_GRAPH, 'bimba-graph');
    assert.equal(IDE_SHELL_INTENT_TARGETS.AGENTIC_CONTROL_ROOM, 'agentic-control-room');
    assert.equal(IDE_SHELL_INTENT_TARGETS.EVIDENCE_PANEL, 'evidence-panel');
    assert.equal(IDE_SHELL_INTENT_TARGETS.COORDINATE_TREE, 'coordinate-tree');
    assert.equal(IDE_SHELL_INTENT_TARGETS.LOGOS_ATELIER, 'logos-atelier');
    assert.equal(IDE_SHELL_INTENT_TARGETS.REVIEW_PANE, 'review-pane');
    assert.equal(IDE_SHELL_INTENT_TARGETS.AUTORESEARCH_PANE, 'autoresearch-pane');
    assert.equal(IDE_SHELL_INTENT_TARGETS.PI_AXIOM_TRANSLATION, 'pi-axiom-translation');
    assert.equal(Object.keys(IDE_SHELL_INTENT_TARGETS).length, 9);
    assert.equal(EXTENSION_ID, 'ide-shell-m0-m5');
});

test('decorateCoordinates detects QL archetypes, M/S coordinates, wikilinks, and context frames', () => {
    const md = [
        '# A note',
        '',
        'This connects #0 to #5.0 via the M0 anuttara and M5.epii surfaces.',
        '',
        'See also S2.graph and S3 gateway.',
        '',
        'Wikilink: [[M0/anuttara]] and [[review-record|named]].',
        '',
        'Context frame (4.0/1-4.4/5) is the lemniscate doubling; (5/0) closes.'
    ].join('\n');
    const decorations = decorateCoordinates(md);
    const kinds = decorations.map(d => d.kind);
    assert.ok(kinds.includes('ql-archetype'), 'detects #0/#5 archetype refs');
    assert.ok(kinds.includes('m-coordinate'), 'detects M0/M5 coordinates');
    assert.ok(kinds.includes('s-coordinate'), 'detects S2/S3 coordinates');
    assert.ok(kinds.includes('wikilink'), 'detects [[wikilinks]]');
    assert.ok(kinds.includes('context-frame'), 'detects (4.0/1-4.4/5) and (5/0)');
});

test('every IDE shell bridge-bound widget renders an inline BridgeReadinessBadge for its binding keys', () => {
    for (const [fileName, bindingKeys] of Object.entries(INLINE_READINESS_BINDINGS)) {
        const source = readFileSync(resolve(SOURCE_ROOT, fileName), 'utf8');
        assert.match(source, /BridgeReadinessBadge/, `${fileName} must consume the shared badge`);
        for (const bindingKey of bindingKeys) {
            assert.ok(
                source.includes(`bindingKey="${bindingKey}"`) ||
                source.includes(`bindingKey={'${bindingKey}'}`) ||
                source.includes(`bindingKey={\"${bindingKey}\"}`),
                `${fileName} must render an inline badge for ${bindingKey}`
            );
        }
    }
});

test('RunTree renders psyche-facet badge next to dispatch actor', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(RunTree, {
            dispatchTrace: {
                id: 'root',
                label: 'Pi dispatch',
                actor: 'pi',
                children: [
                    {
                        id: 'logos-scope',
                        label: 'Scope the route',
                        actor: 'anima',
                        methodOrSkill: 'dispatch_agent',
                        psycheFacet: 'logos'
                    }
                ]
            }
        })
    );

    assert.match(html, /data-test="acr-run-tree-node-psyche-facet-logos-scope"/);
    assert.match(html, /class="ide-shell-psyche-facet-badge ide-shell-psyche-facet-logos"/);
    assert.match(html, /data-psyche-facet="logos"/);
    assert.match(html, /data-colour-token="epilogos\.colour\.psyche-facet\.logos"/);
    assert.match(html, /title="[^"]*Law in service of the household/);
    assert.match(html, /— anima<\/span><span[^>]+data-test="acr-run-tree-node-psyche-facet-logos-scope"/);
});

test('ToolStream renders psyche-facet badge next to dispatch actor', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(ToolStream, {
            tools: [
                {
                    id: 'tool-1',
                    invokedAt: Date.UTC(2026, 5, 25, 8, 0, 0),
                    toolName: 'dispatch_agent',
                    actor: 'anima',
                    psycheFacet: 'sophia'
                }
            ]
        })
    );

    assert.match(html, /data-test="acr-tool-psyche-facet-tool-1"/);
    assert.match(html, /class="ide-shell-psyche-facet-badge ide-shell-psyche-facet-sophia"/);
    assert.match(html, /data-psyche-facet="sophia"/);
    assert.match(html, /title="[^"]*P5&#x27; and P0&#x27; at the fold/);
    assert.match(html, /— anima<\/span><span[^>]+data-test="acr-tool-psyche-facet-tool-1"/);
});

test('ACR psyche-facet legend uses Sattva-source tooltips in the canonical order', () => {
    const {
        PSYCHE_FACET_LEGEND_ORDER,
        PsycheFacetLegend,
        PSYCHE_FACET_PROFILES
    } = require('../lib/browser/acr/psyche-facets.js');
    assert.deepEqual(
        PSYCHE_FACET_LEGEND_ORDER,
        ['sophia', 'anima', 'logos', 'eros', 'mythos', 'psyche', 'nous']
    );

    const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(PsycheFacetLegend)
    );
    const labels = [...html.matchAll(/data-test="acr-psyche-facet-legend-([a-z]+)"/g)].map(match => match[1]);
    assert.deepEqual(labels, PSYCHE_FACET_LEGEND_ORDER);
    assert.match(html, /data-test="acr-psyche-facet-legend"/);
    assert.match(html, /data-sattva-source="Body\/S\/S4\/pi-agent\/agents\/sophia\.md#6-sattva"/);
    assert.match(html, /title="[^"]*P5&#x27; and P0&#x27; at the fold/);

    for (const facet of PSYCHE_FACET_LEGEND_ORDER) {
        const profile = PSYCHE_FACET_PROFILES[facet];
        assert.ok(profile.tooltip.length > 20, `${facet} has tooltip text`);
        assert.equal(
            profile.sattvaSource,
            `Body/S/S4/pi-agent/agents/${facet}.md#6-sattva`
        );
    }
});

test('Sophia surfaces as a psyche facet only, never as an ACR actor row', () => {
    const widgetSource = readFileSync(resolve(SOURCE_ROOT, 'agentic-control-room-widget.tsx'), 'utf8');
    assert.doesNotMatch(widgetSource, /actor:\s*['"]sophia['"]/);
    assert.doesNotMatch(widgetSource, /psycheFacet:\s*['"]dispatcher['"]/);
    assert.match(widgetSource, /zeithoven:\s*'sophia'/);
});

test('IdeShellBridgeGate uses the shared readiness primitive and only wraps bridge_unavailable', () => {
    const source = readFileSync(resolve(SOURCE_ROOT, 'bridge-gate.tsx'), 'utf8');
    assert.match(source, /classifyReadiness/);
    assert.match(source, /BridgeReadinessBadge/);
    assert.match(source, /subscribeObservability|onEvent/);
    assert.match(source, /readinessId === 'bridge_unavailable'/);
    assert.doesNotMatch(source, /profile_missing_field[^?;{}]*ide-shell-bridge-pending/s);
});

test('Smart Connections sidebar stub is registered as a Track 03 T6.5 code-pending surface', () => {
    const stubSource = readFileSync(
        resolve(SOURCE_ROOT, 'smart-connections', 'smart-connections-sidebar-stub.tsx'),
        'utf8'
    );
    assert.match(stubSource, /SmartConnectionsSidebarStub/);
    assert.match(stubSource, /pratibimba\.smart-connections-sidebar/);
    assert.match(stubSource, /ReadinessBanner/);
    assert.match(stubSource, /code-pending/);
    assert.match(stubSource, /Track 03 T6\.5/);
    assert.match(stubSource, /Track 17\/18/);
    assert.match(stubSource, /MIGRATION-SOURCES\.md/);
    assert.match(stubSource, /pending-extension/);
    assert.match(stubSource, /Awaiting Track 03 T6\.5/);
    assert.match(stubSource, /codePendingMarker:\s*'track_03_t6_5'/);

    const frontendSource = readFileSync(resolve(SOURCE_ROOT, 'frontend-module.ts'), 'utf8');
    assert.match(frontendSource, /SmartConnectionsSidebarStub/);
    assert.match(frontendSource, /SmartConnectionsSidebarStubContribution/);
    assert.match(frontendSource, /bindViewContribution\(bind, SmartConnectionsSidebarStubContribution\)/);
});

test('decorateCoordinates returns empty for plain prose', () => {
    const decorations = decorateCoordinates('Just some plain text, nothing structural here.');
    assert.equal(decorations.length, 0);
});
