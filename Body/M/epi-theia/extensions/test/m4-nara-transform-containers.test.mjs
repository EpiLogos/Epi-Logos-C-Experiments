import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

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
require('@theia/core/lib/browser/frontend-application-config-provider')
    .FrontendApplicationConfigProvider
    .set({ applicationName: 'm4-nara-transform-containers-node-test' });

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const {
    M4TransformContainersCard,
    TRANSFORM_CONTAINER_DEFINITIONS,
    nextTransformTransition,
    writeTransformTransitionArtifact
} = require('../m4-nara/lib/browser/widgets/transform-containers.js');

async function withVault(fn) {
    const vaultRoot = await mkdtemp(join(tmpdir(), 'm4-nara-transform-'));
    try {
        return await fn(vaultRoot);
    } finally {
        await rm(vaultRoot, { recursive: true, force: true });
    }
}

test('transform container mode strip exposes three selectable modes', () => {
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M4TransformContainersCard, {
            state: { mode: 'bohm-dialogue', stageIndex: 0 },
            status: 'ready',
            lastTransition: null,
            onSelectMode() {},
            onAdvance() {},
            onRegress() {}
        })
    );

    const modeButtons = markup.match(/data-test="m4-transform-container-mode"/g) ?? [];
    assert.equal(modeButtons.length, 3);
    assert.match(markup, /Bohm Dialogue/);
    assert.match(markup, /Talking Circle/);
    assert.match(markup, /Diamond/);
    assert.deepEqual(
        TRANSFORM_CONTAINER_DEFINITIONS.map(definition => definition.mode),
        ['bohm-dialogue', 'talking-circle', 'diamond']
    );
});

test('stage advance writes contemplative artifact with L2 prime alchemical op payload', async () => {
    await withVault(async vaultRoot => {
        const transition = nextTransformTransition(
            { mode: 'bohm-dialogue', stageIndex: 0 },
            'advance'
        );
        assert.ok(transition);
        assert.deepEqual(transition.payload, {
            container: 'bohm-dialogue',
            fromStage: 'bohm-suspension',
            toStage: 'bohm-proprioception',
            alchemical_op: 'separatio'
        });

        const artifact = await writeTransformTransitionArtifact(
            {
                vaultRoot,
                dayId: '2026-06-11',
                nowPath: 'Idea/Empty/Present/11-06-2026/20260611-170000-test/now.md',
                sessionKey: 'session://m4-nara/transform-containers/test'
            },
            transition.payload
        );
        const markdown = await readFile(artifact.artifactPath, 'utf8');

        assert.equal(artifact.kind, 'contemplative');
        assert.deepEqual(artifact.payload, transition.payload);
        assert.equal(artifact.payload.alchemical_op, 'separatio');
        assert.match(markdown, /L2' alchemical operator: separatio/);
    });
});

test('each transform stage carries a canvas-spec alchemical operator tag', () => {
    const expected = new Set([
        'nigredo',
        'solutio',
        'sublimatio',
        'calcinatio',
        'coagulatio',
        'fixatio',
        'separatio',
        'conjunctio'
    ]);
    const operations = new Set();

    for (const definition of TRANSFORM_CONTAINER_DEFINITIONS) {
        assert.ok(
            definition.stages.length === 4 || definition.stages.length === 5,
            `${definition.mode} has a 4-or-5-stage progression`
        );
        for (const stage of definition.stages) {
            assert.ok(expected.has(stage.alchemical_op), `${stage.id} has a valid L2' operation`);
            operations.add(stage.alchemical_op);
        }
    }

    for (const op of expected) {
        assert.ok(operations.has(op), `${op} appears in the transform container overlay`);
    }
});
