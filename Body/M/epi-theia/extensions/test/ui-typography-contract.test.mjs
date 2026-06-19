import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const typographyContractPath = resolve(
    repoRoot,
    'Body/M/epi-theia/extensions/contracts/ui-typography.ts'
);
const typographySpecPath = resolve(
    repoRoot,
    'Body/M/epi-theia/extensions/contracts/ui-typography.md'
);
const iconographyContractPath = resolve(
    repoRoot,
    'Body/M/epi-theia/extensions/contracts/ui-iconography.ts'
);
const iconographySpecPath = resolve(
    repoRoot,
    'Body/M/epi-theia/extensions/contracts/ui-iconography.md'
);
const iconographyAssetsPath = resolve(
    repoRoot,
    'Body/M/epi-theia/extensions/contracts/icons'
);
const designPrimitivesPath = resolve(
    repoRoot,
    'Body/M/epi-theia/extensions/integrated-composition/src/browser/design-primitives'
);
const browserIconContributionPath = resolve(
    repoRoot,
    'Body/M/epi-theia/extensions/integrated-composition/src/browser/icons-contribution.ts'
);
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const EXPECTED_LEVELS = Object.freeze([
    'heading.1',
    'heading.2',
    'heading.3',
    'heading.4',
    'body.base',
    'body.small',
    'caption',
    'mono.default',
    'mono.coordinate',
    'mono.codon',
    'mono.hexagram',
    'matheme.block',
    'matheme.inline'
]);

test('typography contract source and human-readable spec exist', () => {
    assert.equal(existsSync(typographyContractPath), true);
    assert.equal(existsSync(typographySpecPath), true);
});

test('typed typography export covers every level with token name, size, weight, and family', () => {
    const contract = loadTypescriptModule(typographyContractPath);
    assert.deepEqual(Array.from(contract.UI_TYPOGRAPHY_LEVEL_NAMES), EXPECTED_LEVELS);

    for (const levelName of EXPECTED_LEVELS) {
        const level = contract.UI_TYPOGRAPHY_SCALE[levelName];
        assert.equal(level.name, levelName);
        assert.equal(level.tokenName, `epilogos.typography.${levelName}`);
        assert.equal(typeof level.size, 'string');
        assert.match(level.size, /var\(--theia-/);
        assert.equal(typeof level.weight, 'number');
        assert.equal(typeof level.family, 'string');
        assert.match(level.family, /var\(--theia-/);
        assert.equal(typeof level.useCase, 'string');
    }
});

test('Matheme primitive renders KaTeX at heading-2 scale with screen-reader label', () => {
    const designPrimitive = require('../integrated-composition/lib/browser/design-primitives/matheme.js');
    const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(designPrimitive.MathemeToken, {
            tex: '0/1 = 4+2 = 5\\to 0 = 0/1',
            ariaLabel: 'zero over one equals four plus two equals five to zero equals zero over one',
            level: 'heading.2',
            displayMode: true
        })
    );

    assert.match(html, /aria-label="zero over one equals four plus two equals five to zero equals zero over one"/);
    assert.match(html, /class="[^"]*katex/);
    assert.match(html, /data-typography-token="epilogos\.typography\.heading\.2"/);
    assert.match(html, /font-size:var\(--theia-ui-font-size2\)/);
    assert.match(html, /font-weight:600/);
});

test('CoordinateString resolves family-letter tint from the wikilink target', () => {
    const designPrimitive = require('../integrated-composition/lib/browser/design-primitives/index.js');
    const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(designPrimitive.CoordinateString, {
            wikilinkTarget: '[[M3/mahamaya/codon-wheel]]',
            label: 'M3 codon wheel'
        })
    );

    assert.equal(
        designPrimitive.resolveCoordinateFamilyTint('[[M3/mahamaya/codon-wheel]]'),
        'epilogos.colour.family.m.3'
    );
    assert.match(html, /data-family-letter="m"/);
    assert.match(html, /data-family-letter-token="epilogos\.family-letter\.m"/);
    assert.match(html, /data-archetype="3"/);
    assert.match(html, /data-colour-token="epilogos\.colour\.family\.m\.3"/);
    assert.match(html, /color:var\(--epilogos-colour-family-m-3\)/);
    assert.match(html, /class="epilogos-coordinate-family-glyph"/);
    assert.match(html, /data-family-letter-glyph="m"/);
    assert.match(html, /data-icon-name="family-m"/);
});

test('iconography contract source, spec, and SVG assets resolve at supported sizes', () => {
    assert.equal(existsSync(iconographyContractPath), true);
    assert.equal(existsSync(iconographySpecPath), true);

    const contract = loadTypescriptModule(iconographyContractPath);
    assert.equal(contract.UI_ICON_SET.length, 19);
    assert.deepEqual(Array.from(contract.UI_ICON_SUPPORTED_SIZES), [16, 24, 32]);

    for (const icon of contract.UI_ICON_SET) {
        const assetPath = join(iconographyAssetsPath, `${icon.name}.svg`);
        assert.equal(existsSync(assetPath), true, `${icon.name}.svg exists`);
        const svg = readFileSync(assetPath, 'utf8');
        assert.match(svg, /<svg[^>]+viewBox="0 0 32 32"/, `${icon.name}.svg has canonical viewBox`);
        assert.match(svg, /currentColor|cross-binding/, `${icon.name}.svg derives colour from currentColor`);

        for (const size of contract.UI_ICON_SUPPORTED_SIZES) {
            assert.equal(
                contract.resolveUiIconHref(icon.name, size),
                `icons/${icon.name}.svg?size=${size}`,
                `${icon.name} resolves at ${size}px`
            );
        }
    }
});

test('Theia icon-theme contribution registers every icon under the expected id', () => {
    const contract = loadTypescriptModule(iconographyContractPath);
    const browserContribution = require('../integrated-composition/lib/browser/icons-contribution.js');
    const expectedIds = contract.UI_ICON_SET.map(icon => icon.id).sort();
    const actualIds = browserContribution.PRATIBIMBA_ICON_THEME_REGISTRATIONS.map(icon => icon.id).sort();
    const registeredThemes = [];

    assert.equal(JSON.stringify(actualIds), JSON.stringify(expectedIds));
    const contribution = new browserContribution.PratibimbaIconThemeContribution();
    contribution.registerIconThemes({
        register: theme => {
            registeredThemes.push(theme);
            return { dispose: () => undefined };
        }
    });

    assert.equal(registeredThemes.length, 1);
    assert.equal(registeredThemes[0].id, browserContribution.PRATIBIMBA_ICON_THEME_ID);
    assert.equal(registeredThemes[0].label, 'Pratibimba Iconography');
});

test('activity-bar icon bindings map each mode to its custom icon and left-shell slot', () => {
    const contract = loadTypescriptModule(iconographyContractPath);
    const browserContribution = require('../integrated-composition/lib/browser/icons-contribution.js');

    assert.equal(contract.ACTIVITY_BAR_ICON_BINDINGS.length, 5);
    assert.equal(
        JSON.stringify(browserContribution.PRATIBIMBA_ACTIVITY_BAR_ICON_BINDINGS.map(binding => binding.modeId)),
        JSON.stringify(contract.ACTIVITY_BAR_ICON_BINDINGS.map(binding => binding.modeId))
    );

    for (const binding of contract.ACTIVITY_BAR_ICON_BINDINGS) {
        assert.equal(binding.slot, 'widget.application-shell-left');
        assert.match(binding.iconId, /^pratibimba\.icon\./);
        assert.equal(binding.iconRef, `$(${binding.iconId})`);
        assert.match(binding.codiconFallback, /^\$\([^)]+\)$/);
    }
});

test('design primitive shelf has every canonical file and public export', () => {
    const expectedFiles = [
        'README.md',
        'matheme.tsx',
        'coordinate-string.tsx',
        'codon-string.tsx',
        'hexagram-string.tsx',
        'symbolic-coordinate-string.tsx',
        'provenance-border.tsx',
        'pending-badge.tsx',
        'blocked-overlay.tsx',
        'readiness-indicator.tsx',
        'empty-state.tsx',
        'loading-pulse.tsx',
        'lemniscate-transition.tsx',
        'slerp-choreography-clock.tsx',
        'highlight-category-registry.ts',
        'icons-contribution.ts',
        'index.ts'
    ];
    const indexSource = readFileSync(join(designPrimitivesPath, 'index.ts'), 'utf8');

    for (const fileName of expectedFiles) {
        assert.equal(existsSync(join(designPrimitivesPath, fileName)), true, `${fileName} exists`);
        if (fileName !== 'README.md' && fileName !== 'index.ts') {
            const stem = fileName.replace(/\.(tsx|ts)$/, '');
            assert.match(indexSource, new RegExp(`from './${escapeRegExp(stem)}'`));
        }
    }

    const publicSurface = require('../integrated-composition/lib/browser/design-primitives/index.js');
    for (const exportName of [
        'MathemeToken',
        'CoordinateString',
        'CodonString',
        'HexagramString',
        'SymbolicCoordinateString',
        'ProvenanceBorder',
        'PendingBadge',
        'BlockedOverlay',
        'ReadinessIndicator',
        'EmptyState',
        'LoadingPulse',
        'LemniscateTransition',
        'SlerpChoreographyClock',
        'HIGHLIGHT_CATEGORY_REGISTRY',
        'DESIGN_PRIMITIVE_ICON_CONTRIBUTIONS',
        'PRATIBIMBA_ICON_THEME_REGISTRATIONS'
    ]) {
        assert.notEqual(publicSurface[exportName], undefined, `${exportName} is exported`);
    }

    assert.equal(existsSync(browserIconContributionPath), true);
    assert.match(
        readFileSync(browserIconContributionPath, 'utf8'),
        /class PratibimbaIconThemeContribution implements IconThemeContribution/
    );
});

test('M-extension source uses canonical design primitive import and no local state variants', () => {
    const extensionNames = ['m0-anuttara', 'm1-paramasiva', 'm2-parashakti', 'm3-mahamaya', 'm4-nara', 'm5-epii'];
    const forbiddenLocalVariant = /border-left.*solid.*#[0-9a-fA-F]{3,6}|pending-badge|blocked-overlay|readiness-chip/;

    for (const extensionName of extensionNames) {
        const sourceRoot = resolve(repoRoot, 'Body/M/epi-theia/extensions', extensionName, 'src');
        const sources = readSourceTree(sourceRoot);
        const combined = sources.map(source => source.content).join('\n');
        assert.match(
            combined,
            /@pratibimba\/integrated-composition\/design-primitives/,
            `${extensionName} imports canonical design primitives`
        );
        for (const source of sources) {
            assert.doesNotMatch(source.content, forbiddenLocalVariant, `${source.path} has no local state variant`);
        }
    }
});

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

function readSourceTree(root) {
    const entries = require('node:fs').readdirSync(root, { withFileTypes: true });
    return entries.flatMap(entry => {
        const entryPath = join(root, entry.name);
        if (entry.isDirectory()) {
            return readSourceTree(entryPath);
        }
        if (!/\.(ts|tsx)$/.test(entry.name)) {
            return [];
        }
        return [{ path: entryPath, content: readFileSync(entryPath, 'utf8') }];
    });
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
