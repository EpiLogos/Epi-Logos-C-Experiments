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
const transpiledRoot = join(tmpdir(), 'm2-parashakti-audio-bus-visual-test');

function compiledModulePath(sourcePath) {
    const relative = sourcePath.slice(extensionRoot.length + 1).replace(/\.(ts|tsx)$/, '.js');
    return join(transpiledRoot, relative);
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

function ensureTranspiledNodeModules() {
    const linkPath = join(transpiledRoot, 'node_modules');
    if (existsSync(linkPath)) {
        rmSync(linkPath, { force: true, recursive: true });
    }
    mkdirSync(transpiledRoot, { recursive: true });
    symlinkSync(join(workspaceRoot, 'node_modules'), linkPath, 'dir');
}

function loadSourceModule(relativePath) {
    const sourcePath = join(extensionRoot, relativePath);
    assert.ok(existsSync(sourcePath), `missing source module ${relativePath}`);
    const outputPath = compileSourceModule(sourcePath);
    return require(outputPath);
}

const sourceRelativePath = 'src/browser/components/AudioBusVisualiser.tsx';
const sourcePath = join(extensionRoot, sourceRelativePath);
const {
    AUDIO_BUS_MANTRA_MAX_HZ,
    AUDIO_BUS_MANTRA_MIN_HZ,
    AudioBusVisualiser,
    buildAudioBusVisualModel
} = loadSourceModule(sourceRelativePath);

function markup(node) {
    return renderToStaticMarkup(node);
}

const audioOctet = Object.freeze([144, 180, 216, 252, 288, 324, 360, 432]);

test('renders eight audio-octet channels with Hz numbers band glyphs and element badges', () => {
    const html = markup(
        React.createElement(AudioBusVisualiser, {
            audioOctet,
            activePlanet: { name: 'Mars', elem_sig: 'AGNI:MANIPURA:DESCENT' },
            parashaktiMeaning: { routing_trace: { mantra_index: 12 } }
        })
    );

    assert.equal((html.match(/data-audio-channel-row=/g) ?? []).length, 8);
    for (const hz of audioOctet) {
        assert.match(html, new RegExp(`${hz.toFixed(2)} Hz`));
    }
    assert.match(html, /data-band-glyph="B1"/);
    assert.match(html, /data-band-glyph="B8"/);
    assert.match(html, /data-element-badge="AGNI"/);
});

test('aligns channel bars to the 144 to 432 Hz mantra band', () => {
    const model = buildAudioBusVisualModel({
        audioOctet,
        activePlanet: { elemSig: 'APAS:ANAHATA:ASCENT' },
        parashaktiMeaning: { routingTrace: { mantraIndex: 50 } }
    });

    assert.equal(AUDIO_BUS_MANTRA_MIN_HZ, 144);
    assert.equal(AUDIO_BUS_MANTRA_MAX_HZ, 432);
    assert.equal(model.scale.minHz, 144);
    assert.equal(model.scale.maxHz, 432);
    assert.equal(model.channels.length, 8);
    assert.equal(model.channels[0].alignment, 0);
    assert.equal(model.channels[7].alignment, 1);
    assert.equal(model.channels[0].barPercent, 0);
    assert.equal(model.channels[7].barPercent, 100);

    const html = markup(
        React.createElement(AudioBusVisualiser, {
            audioOctet,
            activePlanet: { elemSig: 'APAS:ANAHATA:ASCENT' },
            parashaktiMeaning: { routingTrace: { mantraIndex: 50 } }
        })
    );
    assert.match(html, /data-scale-min-hz="144"/);
    assert.match(html, /data-scale-max-hz="432"/);
    assert.match(html, /data-scale-role="mantra-band"/);
    assert.match(html, /data-bar-percent="100"/);
});

test('binds Matrika and Malini phase indicator to routing trace mantra index', () => {
    const descent = buildAudioBusVisualModel({
        audioOctet,
        parashaktiMeaning: { routing_trace: { mantra_index: 49 } }
    });
    const ascent = buildAudioBusVisualModel({
        audioOctet,
        parashaktiMeaning: { routingTrace: { mantraIndex: 50 } }
    });

    assert.equal(descent.phase.kind, 'matrika');
    assert.equal(descent.phase.arc, 'descent');
    assert.equal(descent.phase.mantraIndex, 49);
    assert.equal(ascent.phase.kind, 'malini');
    assert.equal(ascent.phase.arc, 'ascent');
    assert.equal(ascent.phase.mantraIndex, 50);

    const html = markup(
        React.createElement(AudioBusVisualiser, {
            audioOctet,
            parashaktiMeaning: { routing_trace: { mantra_index: 49 } }
        })
    );
    assert.match(html, /data-phase="matrika"/);
    assert.match(html, /data-phase-arc="descent"/);
    assert.match(html, /data-mantra-index="49"/);
});

test('keeps the M2 visual representation free of sound-producing browser APIs', () => {
    const source = readFileSync(sourcePath, 'utf8');
    assert.doesNotMatch(source, /new AudioContext|<audio|new Audio\(|new Oscillator|OscillatorNode|getUserMedia/);

    const html = markup(
        React.createElement(AudioBusVisualiser, {
            audioOctet,
            parashaktiMeaning: { routing_trace: { mantra_index: 51 } }
        })
    );
    assert.doesNotMatch(html, /<audio|new AudioContext|new Oscillator|OscillatorNode|getUserMedia/);
    assert.match(html, /data-audio-output="none"/);
    assert.match(html, /portal-core\/src\/music_tech\.rs/);
    assert.match(html, /MPE \/ MTS-ESP/);
});
