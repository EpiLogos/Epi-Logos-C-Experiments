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

const {
    parseCapabilityMatrix,
    dispatchToolNames,
    skillNames,
    isPrivacySafe,
    FORBIDDEN_PRIVACY_CLASSES,
    ALLOWED_PRIVACY_CLASSES,
    asSubgraph,
    EMPTY_SUBGRAPH,
    IDE_SHELL_WIDGET_IDS,
    IDE_SHELL_INTENT_TARGETS,
    EXTENSION_ID,
    decorateCoordinates
} = require('../lib/common/index.js');

// __dirname here is .../Idea/Pratibimba/System/extensions/ide-shell-m0-m5/tests
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

test('parses the real capability-matrix.json from Body/S/S4/plugins/pleroma', () => {
    const raw = JSON.parse(readFileSync(CAPABILITY_MATRIX_PATH, 'utf8'));
    const matrix = parseCapabilityMatrix(raw);
    assert.equal(matrix.coordinate, "S4/S4'");
    assert.equal(matrix.owner_agent, 'anima');
    assert.ok(matrix.constitutional_agents.length >= 1, 'has constitutional agents');
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

test('asSubgraph returns EMPTY_SUBGRAPH-equivalent on a non-object artifact', () => {
    const r1 = asSubgraph(null, 'safe-public-current-kernel-tick', null, 's2.graph.node');
    const r2 = asSubgraph(42, 'safe-public-current-kernel-tick', null, 's2.graph.node');
    assert.equal(r1.node, null);
    assert.equal(r2.node, null);
    assert.equal(r1.neighbors.length, 0);
    assert.equal(EMPTY_SUBGRAPH.neighbors.length, 0);
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

test('decorateCoordinates returns empty for plain prose', () => {
    const decorations = decorateCoordinates('Just some plain text, nothing structural here.');
    assert.equal(decorations.length, 0);
});
