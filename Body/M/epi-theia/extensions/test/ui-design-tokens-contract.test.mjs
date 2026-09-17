import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const contractsRoot = resolve(repoRoot, 'Body/M/epi-theia/extensions/contracts');
const tokensJsonPath = resolve(contractsRoot, 'ui-design-tokens.json');
const tokensTsPath = resolve(contractsRoot, 'ui-design-tokens.ts');
const tokensMdPath = resolve(contractsRoot, 'ui-design-tokens.md');
const lintRulePath = resolve(
    repoRoot,
    'Body/M/epi-theia/extensions/scripts/eslint-rules/consume-not-fork-design-tokens.mjs'
);

const EXPECTED_TOP_LEVEL = Object.freeze(['colour', 'typography', 'motion', 'spacing', 'depth']);
const EXPECTED_COLOUR_GROUPS = Object.freeze([
    'family',
    'element',
    'flow',
    'psyche-facet',
    'signal',
    'readiness',
    'privacy',
    'chroma-depth',
    'capacity',
    'bridge',
    'surface',
    'layout',
    'insight',
    'skeleton',
    'signature'
]);
const EXPECTED_TYPOGRAPHY_TOKENS = Object.freeze([
    'mono.coordinate',
    'mono.label',
    'prose.body',
    'prose.canon',
    'prose.legal',
    'ui.micro',
    'ui.chip',
    'ui.tooltip',
    'ui.status-bar'
]);
const EXPECTED_MOTION_TOKENS = Object.freeze([
    'tick',
    'toggle',
    'reveal',
    'slerp',
    'bloom',
    'settle',
    'lemniscate'
]);
const EXPECTED_SPACING_TOKENS = Object.freeze(['tight', 'compact', 'standard', 'generous', 'section']);
const EXPECTED_DEPTH_TOKENS = Object.freeze(['surface', 'overlay', 'tooltip', 'modal', 'notification']);
const ALLOWED_DTCG_TYPES = new Set(['color', 'dimension', 'duration', 'cubicBezier']);

test('canonical UI design token contract files exist', () => {
    assert.equal(existsSync(tokensJsonPath), true);
    assert.equal(existsSync(tokensTsPath), true);
    assert.equal(existsSync(tokensMdPath), true);
});

test('JSON token bundle follows the DTCG token object shape for every token', () => {
    const tokens = JSON.parse(readFileSync(tokensJsonPath, 'utf8'));
    assert.deepEqual(Object.keys(tokens.epilogos), EXPECTED_TOP_LEVEL);
    assert.deepEqual(Object.keys(tokens.epilogos.colour), EXPECTED_COLOUR_GROUPS);
    assertTokenPaths(tokens.epilogos.typography, EXPECTED_TYPOGRAPHY_TOKENS);
    assertTokenPaths(tokens.epilogos.motion, EXPECTED_MOTION_TOKENS);
    assertTokenPaths(tokens.epilogos.spacing, EXPECTED_SPACING_TOKENS);
    assertTokenPaths(tokens.epilogos.depth, EXPECTED_DEPTH_TOKENS);

    const tokenEntries = collectTokens(tokens);
    assert.ok(tokenEntries.length >= 80, `expected a complete token bundle, got ${tokenEntries.length}`);
    for (const [path, token] of tokenEntries) {
        assert.ok(Object.hasOwn(token, '$value'), `${path} carries $value`);
        assert.ok(ALLOWED_DTCG_TYPES.has(token.$type), `${path} has a DTCG-compatible $type`);
        assert.equal(typeof token.$description, 'string', `${path} carries $description`);
        assert.match(
            token.$description,
            /Derivation: /,
            `${path} description cites the coordinate-system derivation`
        );
    }
});

test('typed TypeScript export mirrors the JSON bundle and exposes lookup helpers', () => {
    const json = JSON.parse(readFileSync(tokensJsonPath, 'utf8'));
    const typed = loadTypescriptModule(tokensTsPath);

    assert.equal(JSON.stringify(typed.UI_DESIGN_TOKENS), JSON.stringify(json));
    assert.deepEqual(Array.from(typed.UI_DESIGN_TOKEN_TOP_LEVEL_NAMES), EXPECTED_TOP_LEVEL);
    assert.equal(
        typed.getUiDesignToken('epilogos.typography.mono.coordinate').$value,
        json.epilogos.typography.mono.coordinate.$value
    );
    assert.equal(
        typed.getUiDesignToken('epilogos.colour.signature.cool').$type,
        'color'
    );
});

test('human-readable token spec documents the consume-not-fork contract', () => {
    const spec = readFileSync(tokensMdPath, 'utf8');
    assert.match(spec, /W3C Design Tokens Community Group draft/);
    assert.match(spec, /Consume-not-fork/);
    assert.match(spec, /epilogos\.colour\.family/);
    assert.match(spec, /epilogos\.motion\.lemniscate/);
});

test('consume-not-fork ESLint rule catches a design-primitive consumer that forks token values', async () => {
    const { lintDesignTokenConsumptionSource } = await import(pathToFileURL(lintRulePath).href);
    const source = `
        import { CoordinateString } from '@pratibimba/integrated-composition/design-primitives';
        export const PendingBadge = () => null;
        export const style = {
            color: '#6EA8FE',
            gap: '8px',
            transitionDuration: '180ms'
        };
    `;
    const messages = lintDesignTokenConsumptionSource(source, {
        filename: 'Body/M/epi-theia/extensions/m1-paramasiva/src/browser/forked.tsx'
    });

    assert.deepEqual(
        messages.map(message => message.messageId),
        ['localPrimitiveFork', 'tokenLiteralFork', 'tokenLiteralFork', 'tokenLiteralFork']
    );

    const reexportMessages = lintDesignTokenConsumptionSource(
        "export { CoordinateString } from '@pratibimba/integrated-composition/design-primitives';",
        { filename: 'Body/M/epi-theia/extensions/m2-parashakti/src/browser/reexport.ts' }
    );
    assert.deepEqual(reexportMessages.map(message => message.messageId), ['localPrimitiveFork']);
});

function assertTokenPaths(group, dottedPaths) {
    for (const dottedPath of dottedPaths) {
        const token = dottedPath.split('.').reduce((cursor, segment) => cursor?.[segment], group);
        assert.ok(token, `${dottedPath} exists`);
        assert.ok(Object.hasOwn(token, '$value'), `${dottedPath} is a token`);
    }
}

function collectTokens(node, prefix = '') {
    if (!node || typeof node !== 'object') {
        return [];
    }
    if (Object.hasOwn(node, '$value')) {
        return [[prefix, node]];
    }
    return Object.entries(node).flatMap(([key, value]) =>
        collectTokens(value, prefix ? `${prefix}.${key}` : key)
    );
}

function loadTypescriptModule(filePath) {
    const source = readFileSync(filePath, 'utf8');
    const transpiled = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2022,
            esModuleInterop: true
        },
        fileName: filePath,
        reportDiagnostics: true
    });
    assert.deepEqual(transpiled.diagnostics ?? [], []);

    const module = { exports: {} };
    vm.runInNewContext(transpiled.outputText, {
        exports: module.exports,
        module,
        require,
        console
    });
    return module.exports;
}
