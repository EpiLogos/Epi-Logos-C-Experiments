import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const contractsRoot = resolve(repoRoot, 'Body/M/epi-theia/extensions/contracts');
const tokensJsonPath = resolve(contractsRoot, 'ui-colour-tokens.json');
const tokensTsPath = resolve(contractsRoot, 'ui-colour-tokens.ts');
const tokensMdPath = resolve(contractsRoot, 'ui-colour-tokens.md');

const EXPECTED_GROUPS = Object.freeze([
    'family',
    'signature',
    'flow',
    'highlight-category',
    'element',
    'psyche-facet',
    'privacy',
    'mode-chip',
    'readiness',
    'status-bar',
    'provenance-pill'
]);

const EXPECTED_TOKEN_PATHS = Object.freeze([
    ...['p', 's', 't', 'm', 'l', 'c'].flatMap(family =>
        ['0', '1', '2', '3', '4', '5'].map(grade => `epilogos.colour.family.${family}.${grade}`)
    ),
    ...['cool', 'warm'].map(name => `epilogos.colour.signature.${name}`),
    ...['mahamaya_gold', 'parashakti_emerald'].map(name => `epilogos.colour.flow.${name}`),
    ...[
        'daily-note',
        'oracle',
        'dream',
        'expand',
        'recognition',
        'prospective-surfacing',
        'retrospective-surfacing',
        'kairos-touch',
        'somatic-mark',
        'live-spread'
    ].map(name => `epilogos.colour.highlight-category.${name}`),
    ...['aether', 'earth', 'water', 'air', 'fire', 'salt'].map(name => `epilogos.colour.element.${name}`),
    ...['anima', 'eros', 'logos', 'mythos', 'nous', 'psyche', 'sophia'].map(
        name => `epilogos.colour.psyche-facet.${name}`
    ),
    ...['protected_local', 'handle_only', 'opt_in'].map(name => `epilogos.colour.privacy.${name}`),
    ...['tranche-mode', 'response-orbit', 'sense-override'].map(name => `epilogos.colour.mode-chip.${name}`),
    ...['ready', 'degraded', 'blocked'].map(name => `epilogos.colour.readiness.severity.${name}`),
    ...[
        'bridge_unavailable',
        'profile_missing_field',
        's2_graph_blocked',
        's3_subscription_blocked',
        's5_review_blocked',
        'authority_payload_missing',
        'privacy_blocked',
        'degraded_but_readable',
        'ready_public_current'
    ].map(name => `epilogos.colour.readiness.id.${name}`),
    ...['profile-tick', 'day-now', 'session-id', 'gateway-readiness', 'profile-generation', 'active-coordinate'].map(
        name => `epilogos.colour.status-bar.${name}`
    ),
    ...[
        'canonical',
        'canonical_absent',
        'derived',
        'inferred',
        'review_pending',
        'blocked',
        'bridged_local',
        'bridged_public'
    ].map(name => `epilogos.colour.provenance-pill.${name}`)
]);

const EXACT_LIGHT_VALUES = Object.freeze({
    'epilogos.colour.family.p.0': '#f8fafc',
    'epilogos.colour.family.p.5': '#3f3a34',
    'epilogos.colour.signature.cool': '#5a73a8',
    'epilogos.colour.signature.warm': '#d4a14a',
    'epilogos.colour.flow.mahamaya_gold': '#d4a574',
    'epilogos.colour.flow.parashakti_emerald': '#4a8b6f',
    'epilogos.colour.highlight-category.daily-note': '#fbbf24',
    'epilogos.colour.highlight-category.oracle': '#a78bfa',
    'epilogos.colour.highlight-category.dream': '#60a5fa',
    'epilogos.colour.highlight-category.expand': '#34d399',
    'epilogos.colour.highlight-category.recognition': '#d4a574',
    'epilogos.colour.highlight-category.prospective-surfacing': '#e8a3a3',
    'epilogos.colour.highlight-category.retrospective-surfacing': '#8090a3',
    'epilogos.colour.highlight-category.kairos-touch': '#b8c0cc',
    'epilogos.colour.highlight-category.somatic-mark': '#8a7355',
    'epilogos.colour.highlight-category.live-spread': '#5b3a7e',
    'epilogos.colour.element.aether': '#7d4f9e',
    'epilogos.colour.element.earth': '#8a7355',
    'epilogos.colour.element.water': '#5fa9b8',
    'epilogos.colour.element.air': '#6ec1c8',
    'epilogos.colour.element.fire': '#c5564b',
    'epilogos.colour.element.salt': '#7d4f9e',
    'epilogos.colour.psyche-facet.anima': '#a89c8e',
    'epilogos.colour.psyche-facet.eros': '#e8a3a3',
    'epilogos.colour.psyche-facet.logos': '#6b7588',
    'epilogos.colour.psyche-facet.mythos': '#d4a14a',
    'epilogos.colour.psyche-facet.nous': '#5a73a8',
    'epilogos.colour.psyche-facet.psyche': '#8a7355',
    'epilogos.colour.psyche-facet.sophia': '#d4a574',
    'epilogos.colour.privacy.protected_local': '#8a7355',
    'epilogos.colour.privacy.handle_only': '#6b7588',
    'epilogos.colour.privacy.opt_in': '#d4a574',
    'epilogos.colour.readiness.severity.ready': '#59c75a',
    'epilogos.colour.readiness.severity.degraded': '#d4a14a',
    'epilogos.colour.readiness.severity.blocked': '#f48771'
});

test('canonical UI colour token contract files exist', () => {
    assert.equal(existsSync(tokensJsonPath), true);
    assert.equal(existsSync(tokensTsPath), true);
    assert.equal(existsSync(tokensMdPath), true);
});

test('JSON colour token bundle has exactly the eleven coordinate-derived namespaces', () => {
    const tokens = readJson();
    assert.deepEqual(Object.keys(tokens.epilogos.colour), EXPECTED_GROUPS);

    const flattened = flattenTokens(tokens);
    assert.deepEqual(Object.keys(flattened).sort(), [...EXPECTED_TOKEN_PATHS].sort());

    for (const [path, token] of Object.entries(flattened)) {
        assert.equal(token.$type, 'color', `${path} is a DTCG colour token`);
        assert.equal(typeof token.$description, 'string', `${path} carries description`);
        assert.match(token.$description, /Derivation: /, `${path} description cites derivation`);
        assert.match(token.$value.light, /^#[0-9a-fA-F]{6}$/, `${path} has light hex`);
        assert.match(token.$value.dark, /^#[0-9a-fA-F]{6}$/, `${path} has dark hex`);
        assert.match(token.$value.foreground.light, /^#[0-9a-fA-F]{6}$/, `${path} has light foreground`);
        assert.match(token.$value.foreground.dark, /^#[0-9a-fA-F]{6}$/, `${path} has dark foreground`);
    }

    for (const [path, expected] of Object.entries(EXACT_LIGHT_VALUES)) {
        assert.equal(flattened[path].$value.light.toLowerCase(), expected, `${path} light value is canon-locked`);
    }
    assert.equal(flattened['epilogos.colour.signature.cool'].$value.dark.toLowerCase(), '#8a9bbd');
    assert.equal(flattened['epilogos.colour.signature.warm'].$value.dark.toLowerCase(), '#e0b366');
    assert.equal(flattened['epilogos.colour.flow.mahamaya_gold'].$value.dark.toLowerCase(), '#e0b67e');
    assert.equal(flattened['epilogos.colour.flow.parashakti_emerald'].$value.dark.toLowerCase(), '#5fa886');
});

test('typed TypeScript export mirrors JSON and exposes lookup helpers', () => {
    const json = readJson();
    const typed = loadTypescriptModule(tokensTsPath);

    assert.equal(JSON.stringify(typed.UI_COLOUR_TOKENS), JSON.stringify(json));
    assert.deepEqual(Array.from(typed.UI_COLOUR_TOKEN_GROUP_NAMES), EXPECTED_GROUPS);
    assert.deepEqual(Array.from(typed.UI_COLOUR_TOKEN_PATHS).sort(), [...EXPECTED_TOKEN_PATHS].sort());
    assert.equal(
        typed.getUiColourToken('epilogos.colour.psyche-facet.nous').$value.light,
        json.epilogos.colour['psyche-facet'].nous.$value.light
    );
    assert.equal(
        typed.getUiColourHex('epilogos.colour.signature.warm', 'dark'),
        '#e0b366'
    );
});

test('light and dark variants preserve Cl(4,2) cool/warm polarity', () => {
    const flattened = flattenTokens(readJson());
    const cool = flattened['epilogos.colour.signature.cool'].$value;
    const warm = flattened['epilogos.colour.signature.warm'].$value;

    assert.equal(hueBand(cool.light), 'cool');
    assert.equal(hueBand(cool.dark), 'cool');
    assert.equal(hueBand(warm.light), 'warm');
    assert.equal(hueBand(warm.dark), 'warm');
});

test('foreground variants meet WCAG AA contrast against their token backgrounds', () => {
    for (const [path, token] of Object.entries(flattenTokens(readJson()))) {
        for (const mode of ['light', 'dark']) {
            const contrast = contrastRatio(token.$value[mode], token.$value.foreground[mode]);
            assert.ok(
                contrast >= 4.5,
                `${path} ${mode} foreground contrast ${contrast.toFixed(2)} is at least 4.5:1`
            );
        }
    }
});

test('mode-chip tokens carry active and inactive variants for light and dark themes', () => {
    const modeChip = readJson().epilogos.colour['mode-chip'];
    for (const [name, token] of Object.entries(modeChip)) {
        for (const state of ['active', 'inactive']) {
            assert.match(token.$value[state].light, /^#[0-9a-fA-F]{6}$/, `${name} ${state} light`);
            assert.match(token.$value[state].dark, /^#[0-9a-fA-F]{6}$/, `${name} ${state} dark`);
        }
    }
});

test('nara theme variants are limited to M-tier family and privacy chrome tokens', () => {
    for (const [path, token] of Object.entries(flattenTokens(readJson()))) {
        const hasNaraVariant = ['nara-light', 'nara-dark', 'nara-glass'].some(key => key in token.$value);
        if (!hasNaraVariant) {
            continue;
        }
        assert.match(
            path,
            /^epilogos\.colour\.(family\.m\.[0-5]|privacy\.(protected_local|handle_only|opt_in))$/,
            `${path} is allowed to tune nara variants`
        );
    }
});

test('human-readable spec cites every token derivation source', () => {
    const spec = readFileSync(tokensMdPath, 'utf8');
    assert.match(spec, /W3C Design Tokens Community Group draft/);
    assert.match(spec, /Coordinate-Derived Chromatic System/);

    for (const path of EXPECTED_TOKEN_PATHS) {
        assert.match(spec, new RegExp(`### \`${escapeRegExp(path)}\``), `${path} has an MD entry`);
        const entry = entryForToken(spec, path);
        assert.match(entry, /Source:/, `${path} entry cites source`);
        assert.match(entry, /Derivation:/, `${path} entry cites derivation`);
    }
});

function readJson() {
    return JSON.parse(readFileSync(tokensJsonPath, 'utf8'));
}

function flattenTokens(node, prefix = '') {
    if (!node || typeof node !== 'object') {
        return {};
    }
    if (Object.hasOwn(node, '$value')) {
        return { [prefix]: node };
    }
    return Object.freeze(Object.fromEntries(
        Object.entries(node).flatMap(([key, value]) =>
            Object.entries(flattenTokens(value, prefix ? `${prefix}.${key}` : key))
        )
    ));
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

function hueBand(hex) {
    const [r, g, b] = rgb(hex).map(value => value / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    if (delta === 0) {
        return 'neutral';
    }
    let hue = 0;
    if (max === r) {
        hue = 60 * (((g - b) / delta) % 6);
    } else if (max === g) {
        hue = 60 * ((b - r) / delta + 2);
    } else {
        hue = 60 * ((r - g) / delta + 4);
    }
    const normalized = hue < 0 ? hue + 360 : hue;
    return normalized >= 25 && normalized <= 95 ? 'warm' : 'cool';
}

function contrastRatio(background, foreground) {
    const [backgroundLum, foregroundLum] = [background, foreground]
        .map(hex => relativeLuminance(rgb(hex)));
    const lighter = Math.max(backgroundLum, foregroundLum);
    const darker = Math.min(backgroundLum, foregroundLum);
    return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(values) {
    const [r, g, b] = values.map(channel => {
        const normalized = channel / 255;
        return normalized <= 0.03928
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function rgb(hex) {
    const value = hex.replace('#', '');
    return [
        Number.parseInt(value.slice(0, 2), 16),
        Number.parseInt(value.slice(2, 4), 16),
        Number.parseInt(value.slice(4, 6), 16)
    ];
}

function entryForToken(spec, path) {
    const start = spec.indexOf(`### \`${path}\``);
    assert.notEqual(start, -1, `${path} entry exists`);
    const next = spec.indexOf('\n### `', start + 1);
    return next === -1 ? spec.slice(start) : spec.slice(start, next);
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
