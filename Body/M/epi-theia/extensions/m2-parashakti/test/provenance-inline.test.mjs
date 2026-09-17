import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const ts = require('typescript');

const extensionRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const workspaceRoot = dirname(dirname(extensionRoot));
const transpiledRoot = join(tmpdir(), 'm2-parashakti-provenance-inline-test');
const baselineProfile = JSON.parse(
    readFileSync(
        '/Users/admin/Documents/Epi-Logos C Experiments/Body/S/S0/portal-core/contract-inventory/baseline-profile.json',
        'utf8'
    )
);

function compiledModulePath(sourcePath) {
    const relative = sourcePath.slice(extensionRoot.length + 1).replace(/\.(ts|tsx)$/, '.js');
    return join(transpiledRoot, relative);
}

function ensureTranspiledNodeModules() {
    const linkPath = join(transpiledRoot, 'node_modules');
    if (existsSync(linkPath)) {
        rmSync(linkPath, { force: true, recursive: true });
    }
    mkdirSync(transpiledRoot, { recursive: true });
    symlinkSync(join(workspaceRoot, 'node_modules'), linkPath, 'dir');
}

function compileSourceModule(sourcePath) {
    ensureTranspiledNodeModules();
    const outputPath = compiledModulePath(sourcePath);
    const source = readFileSync(sourcePath, 'utf8');
    const output = ts.transpileModule(source, {
        fileName: sourcePath,
        compilerOptions: {
            esModuleInterop: true,
            jsx: ts.JsxEmit.React,
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2020
        }
    });
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, output.outputText);
    return outputPath;
}

function loadSourceModule(relativePath) {
    const sourcePath = join(extensionRoot, relativePath);
    assert.ok(existsSync(sourcePath), `missing source module ${relativePath}`);
    const outputPath = compileSourceModule(sourcePath);
    return require(outputPath);
}

[
    'src/common/planetary-lut.ts',
    'src/common/decan-lut.ts',
    'src/common/meaning-packet.ts',
    'src/browser/components/ProvenanceBadge.tsx',
    'src/browser/components/planetary-correspondence.tsx',
    'src/browser/components/ShadowDecanSurface.tsx'
].forEach(loadSourceModule);

const {
    buildM2PrimeMeaningPacket,
    meaningPacketProvenanceFor
} = require(compiledModulePath(join(extensionRoot, 'src/common/meaning-packet.ts')));
const {
    LAYER_B_CARD_PROVENANCE_FIELDS,
    LayerBCardProvenanceBadges,
    M2_BREADCRUMB_PROVENANCE_FIELDS,
    M2_CHI_SURFACE_PLANET_HALO_PROVENANCE_FIELD,
    M2_GRID_CELL_TOOLTIP_PROVENANCE_FIELD,
    M2_TREE_LEAF_PROVENANCE_FIELD,
    PROVENANCE_READINESS_VARIANTS,
    ProvenanceBadge
} = require(compiledModulePath(join(extensionRoot, 'src/browser/components/ProvenanceBadge.tsx')));
const {
    CorrespondenceTreePlanetaryKeyingPanel,
    PlanetaryChakralCard,
    SeventyTwoFoldBreadcrumb
} = require(compiledModulePath(join(extensionRoot, 'src/browser/components/planetary-correspondence.tsx')));
const {
    ShadowDecanSurface
} = require(compiledModulePath(join(extensionRoot, 'src/browser/components/ShadowDecanSurface.tsx')));

function markup(node) {
    return renderToStaticMarkup(node);
}

function readiness(state = 'ready_public_current', extra = {}) {
    return Object.freeze({
        fetchedAt: 1_771_000_000_000,
        state,
        reason: state,
        profileGeneration: 17,
        bridgeReachable: state !== 'bridge_unavailable',
        blockerIds: Object.freeze([]),
        ...extra
    });
}

function packet(overrides = {}) {
    return buildM2PrimeMeaningPacket({
        profile: Object.freeze({
            generation: 17,
            pointerAnchor: 'profile:pointer:baseline',
            capabilities: Object.freeze(['profile.public-current']),
            payload: baselineProfile
        }),
        readiness: readiness(),
        context: Object.freeze({
            canonicalMCoordinate: "M2'",
            pointerAnchor: 'pointer://s0-baseline',
            profileGeneration: 17
        }),
        subject: 'tick',
        emittedAt: 1_771_000_000_000,
        s2: Object.freeze({
            provenanceHandle: Object.freeze({
                source: 's2',
                handle: 's2://contract/m2-correspondence/baseline',
                bodyAllowed: false,
                note: 'captured S2 provenance handle'
            }),
            decanFace: Object.freeze({ faceHandle: 's2://decan/00' }),
            sacredSonic: Object.freeze({ shemHandle: 's2://shem/00', asmaHandle: 's2://asma/00' }),
            planetaryChakral: Object.freeze({ body: 'Earth' }),
            earthObserverHandle: 's2://observer/earth-baseline'
        }),
        kerykeion: Object.freeze({
            provenanceHandle: Object.freeze({
                source: 'kerykeion',
                handle: 's3://world-clock/kerykeion/baseline',
                bodyAllowed: false
            }),
            worldClockHandle: 's3://world-clock/2026-06-01T00:00:00Z'
        }),
        ...overrides
    });
}

test('each requested readiness-taxonomy variant renders a distinct provenance badge', () => {
    const model = packet();
    const provenance = model.meaningPacketProvenanceFor('planetaryChakralFrame');
    assert.equal(PROVENANCE_READINESS_VARIANTS.length, 9);

    const seen = new Set();
    for (const variant of PROVENANCE_READINESS_VARIANTS) {
        const html = markup(React.createElement(ProvenanceBadge, { provenance, readiness: variant, field: variant }));
        assert.match(html, new RegExp(`data-readiness-variant="${variant}"`));
        const signature = html.match(/data-readiness-tone="([^"]+)".*data-readiness-fill="([^"]+)"/);
        assert.ok(signature, `missing tone/fill signature for ${variant}`);
        seen.add(`${variant}:${signature[1]}:${signature[2]}`);
    }
    assert.equal(seen.size, 9);

    const runtimeAlias = markup(React.createElement(ProvenanceBadge, {
        provenance,
        readiness: readiness('degraded_but_readable'),
        field: 'readonly'
    }));
    assert.match(runtimeAlias, /data-readiness-variant="degraded_public_readonly"/);

    const m4Privacy = markup(React.createElement(ProvenanceBadge, {
        provenance,
        readiness: readiness('privacy_blocked', { privacyClass: 'protected_local' }),
        field: 'protected-m4'
    }));
    assert.match(m4Privacy, /data-readiness-variant="m4_privacy_blocked"/);
});

test('Layer B card bindings render one badge per source provenance handle', () => {
    const model = packet();
    const html = markup(React.createElement(LayerBCardProvenanceBadges, {
        packet: model,
        readiness: readiness('ready_public_current')
    }));

    assert.equal(LAYER_B_CARD_PROVENANCE_FIELDS.length, 7);
    assert.equal((html.match(/data-provenance-badge=/g) ?? []).length, 7);
    for (const field of LAYER_B_CARD_PROVENANCE_FIELDS) {
        const handle = meaningPacketProvenanceFor(model, field);
        assert.match(html, new RegExp(`data-provenance-field="${escapeRegExp(field)}"`));
        assert.match(html, new RegExp(`data-provenance-handle="${escapeRegExp(handle.handle)}"`));
    }

    const cardHtml = markup(React.createElement(PlanetaryChakralCard, {
        planetIndex: 0,
        packet: model,
        readiness: readiness('ready_public_current')
    }));
    assert.match(cardHtml, /data-provenance-field="planetaryChakralFrame"/);
    assert.match(cardHtml, /data-provenance-handle="s2:\/\/contract\/m2-correspondence\/baseline"/);
});

test('breadcrumb steps, grid-cell tooltip, tree leaves, and chi-surface halo carry inline provenance', () => {
    const model = packet();
    const breadcrumbHtml = markup(React.createElement(SeventyTwoFoldBreadcrumb, {
        planetIndex: 0,
        packet: model,
        readiness: readiness('s2_graph_blocked')
    }));
    assert.equal((breadcrumbHtml.match(/data-breadcrumb-step=/g) ?? []).length, 6);
    assert.equal((breadcrumbHtml.match(/data-provenance-badge=/g) ?? []).length, 7);
    for (const field of M2_BREADCRUMB_PROVENANCE_FIELDS) {
        assert.match(breadcrumbHtml, new RegExp(`data-provenance-field="${escapeRegExp(field)}"`));
    }
    assert.match(breadcrumbHtml, new RegExp(`data-provenance-field="${escapeRegExp(M2_CHI_SURFACE_PLANET_HALO_PROVENANCE_FIELD)}"`));

    const gridTooltip = markup(React.createElement(ProvenanceBadge, {
        provenance: model.meaningPacketProvenanceFor(M2_GRID_CELL_TOOLTIP_PROVENANCE_FIELD),
        readiness: readiness('profile_missing_field'),
        field: M2_GRID_CELL_TOOLTIP_PROVENANCE_FIELD
    }));
    assert.match(gridTooltip, /data-readiness-variant="profile_missing_field"/);

    const treeHtml = markup(React.createElement(CorrespondenceTreePlanetaryKeyingPanel, {
        selectedPlanetIndex: 0,
        packet: model,
        readiness: readiness('s2_graph_blocked')
    }));
    assert.equal((treeHtml.match(new RegExp(`data-provenance-field="${escapeRegExp(M2_TREE_LEAF_PROVENANCE_FIELD)}"`, 'g')) ?? []).length, 10);

    const shadowHtml = markup(React.createElement(ShadowDecanSurface, {
        selectedAddress72: 0,
        expanded: true,
        graphPayload: null,
        packet: model,
        readiness: readiness('s2_graph_blocked')
    }));
    assert.ok((shadowHtml.match(/data-provenance-badge=/g) ?? []).length >= 72);
});

test('badge variant updates when the readiness snapshot changes', () => {
    const model = packet();
    const provenance = model.meaningPacketProvenanceFor('profile.resonance72');
    const blocked = markup(React.createElement(ProvenanceBadge, {
        provenance,
        readiness: readiness('bridge_unavailable'),
        field: 'profile.resonance72'
    }));
    const ready = markup(React.createElement(ProvenanceBadge, {
        provenance,
        readiness: readiness('ready_public_current'),
        field: 'profile.resonance72'
    }));

    assert.match(blocked, /data-readiness-variant="bridge_unavailable"/);
    assert.match(blocked, /data-readiness-tone="red"/);
    assert.match(ready, /data-readiness-variant="ready_public_current"/);
    assert.match(ready, /data-readiness-tone="green"/);
    assert.notEqual(blocked, ready);
});

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
