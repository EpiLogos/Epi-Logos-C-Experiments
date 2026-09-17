import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

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
    .set({ applicationName: 'm4-nara-logos-cycle-node-test' });

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const {
    LOGOS_STAGES,
    M4_LOGOS_STAGE_RING_EXPORT,
    M4LogosStageRing,
    briefingQlWalkLogosLine,
    logosStagePath,
    nextLogosTransition,
    readLogosStageFiles,
    writeLogosTransitionArtifact
} = require('../m4-nara/lib/browser/widgets/logos-cycle.js');

async function withVault(fn) {
    const vaultRoot = await mkdtemp(join(tmpdir(), 'm4-nara-logos-'));
    try {
        return await fn(vaultRoot);
    } finally {
        await rm(vaultRoot, { recursive: true, force: true });
    }
}

test('6-stage render shows every Logos position and read-only stage content', () => {
    const stageContents = Object.fromEntries(
        LOGOS_STAGES.map(stage => [stage.id, `${stage.label} protected local fixture`])
    );
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(M4LogosStageRing, {
            stages: LOGOS_STAGES,
            currentStageId: 'dia-logos',
            stageContents,
            status: 'ready',
            lastTransition: null,
            onAdvance() {},
            onRegress() {}
        })
    );

    const cards = markup.match(/data-test="m4-logos-stage-card"/g) ?? [];
    assert.equal(cards.length, 6);
    for (const stage of LOGOS_STAGES) {
        assert.match(markup, new RegExp(stage.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
        assert.match(markup, new RegExp(`${stage.label} protected local fixture`));
    }
    assert.match(markup, /aria-readonly="true"/);
    assert.match(markup, /data-export="M4LogosStageRing"/);
    assert.equal(M4_LOGOS_STAGE_RING_EXPORT, 'M4LogosStageRing');
});

test('advance and regress cycle the Logos state machine through 6 positions deterministically', () => {
    let stageId = 'a-logos';
    const advanced = [];
    for (let index = 0; index < 6; index += 1) {
        const transition = nextLogosTransition(stageId, 'advance');
        advanced.push(transition.to.id);
        stageId = transition.to.id;
    }
    assert.deepEqual(advanced, ['pro-logos', 'dia-logos', 'logos', 'epi-logos', 'an-a-logos', 'a-logos']);

    const regress = nextLogosTransition('a-logos', 'regress');
    assert.equal(regress.from.id, 'a-logos');
    assert.equal(regress.to.id, 'an-a-logos');
    assert.equal(regress.c_4_regression, true);
});

test('stage file reader loads present-day logos markdown from each stage file', async () => {
    await withVault(async vaultRoot => {
        for (const stage of LOGOS_STAGES) {
            const path = logosStagePath(vaultRoot, '2026-06-11', stage);
            await mkdir(dirname(path), { recursive: true });
            await writeFile(path, `# ${stage.label}\n\ncontent for ${stage.id}\n`, 'utf8');
        }
        const files = await readLogosStageFiles(vaultRoot, '2026-06-11');

        assert.equal(Object.keys(files).length, 6);
        assert.match(files['a-logos'], /content for a-logos/);
        assert.match(files['an-a-logos'], /content for an-a-logos/);
    });
});

test('artifact write emits contemplative artifact with stage-from and stage-to fields', async () => {
    await withVault(async vaultRoot => {
        const transition = nextLogosTransition('dia-logos', 'advance');
        const artifact = await writeLogosTransitionArtifact(
            {
                vaultRoot,
                dayId: '2026-06-11',
                nowPath: 'Idea/Empty/Present/11-06-2026/20260611-170000-test/now.md',
                sessionKey: 'session://m4-nara/logos-cycle/test'
            },
            transition
        );
        const markdown = await readFile(artifact.artifactPath, 'utf8');

        assert.equal(artifact.kind, 'contemplative');
        assert.equal(artifact.payload['stage-from'], 'Dia-Logos');
        assert.equal(artifact.payload['stage-to'], 'Logos');
        assert.equal(artifact.payload.c_4_regression, undefined);
        assert.match(markdown, /Stage from: Dia-Logos/);
        assert.match(markdown, /Stage to: Logos/);
    });
});

test('regression flag appears only on regress writes', async () => {
    await withVault(async vaultRoot => {
        const context = {
            vaultRoot,
            dayId: '2026-06-11',
            nowPath: 'Idea/Empty/Present/11-06-2026/20260611-170000-test/now.md',
            sessionKey: 'session://m4-nara/logos-cycle/regression-test'
        };
        const advanceArtifact = await writeLogosTransitionArtifact(
            context,
            nextLogosTransition('logos', 'advance')
        );
        const regressArtifact = await writeLogosTransitionArtifact(
            context,
            nextLogosTransition('logos', 'regress')
        );

        assert.equal(advanceArtifact.payload.c_4_regression, undefined);
        assert.equal(regressArtifact.payload.c_4_regression, true);
    });
});

test('logos stage surfaces in the 5.18 briefing QL Walk section', () => {
    const line = briefingQlWalkLogosLine(nextLogosTransition('epi-logos', 'advance'));

    assert.match(line, /^QL Walk:/);
    assert.match(line, /Epi-Logos/);
    assert.match(line, /An-a-Logos/);
});

test('source wires the two Logos RPC methods and protected-local privacy chrome', () => {
    const source = readFileSync(
        new URL('../m4-nara/src/browser/widgets/logos-cycle.tsx', import.meta.url),
        'utf8'
    );

    assert.match(source, /const LOGOS_ADVANCE_METHOD = 'nara\.logos\.advance'/);
    assert.match(source, /const LOGOS_REGRESS_METHOD = 'nara\.logos\.regress'/);
    assert.match(source, /invokeGatewayRpc\(LOGOS_ADVANCE_METHOD/);
    assert.match(source, /invokeGatewayRpc\(LOGOS_REGRESS_METHOD/);
    assert.match(source, /mext-privacy-protected-local/);
});
