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
const transpiledRoot = join(tmpdir(), 'm2-parashakti-cymatic-transport-test');
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

loadSourceModule('src/common/meaning-packet.ts');
const { buildM2PrimeMeaningPacket } = require(compiledModulePath(join(extensionRoot, 'src/common/meaning-packet.ts')));
const {
    CymaticTransport,
    buildCymaticTickSnapshot,
    resolveCymaticTransportViewModel
} = loadSourceModule('src/browser/components/CymaticTransport.tsx');

function markup(node) {
    return renderToStaticMarkup(node);
}

function profile(tick, overrides = {}) {
    const kleinFlip = overrides.kleinFlip ?? null;
    return Object.freeze({
        generation: tick + 100,
        pointerAnchor: `profile:pointer:${tick}`,
        capabilities: Object.freeze(['profile.public-current']),
        payload: Object.freeze({
            ...baselineProfile,
            tick,
            tick12: tick % 12,
            resonance72: Object.freeze({
                ...baselineProfile.resonance72,
                lensAnchorIndex: (baselineProfile.resonance72.lensAnchorIndex + tick) % 72
            }),
            kleinFlip
        })
    });
}

function packetForTick(tick, overrides = {}) {
    return buildM2PrimeMeaningPacket({
        profile: profile(tick, overrides),
        readiness: Object.freeze({
            fetchedAt: 1_771_000_000_000 + tick,
            state: 'ready_public_current',
            reason: 'ready_public_current',
            profileGeneration: tick + 100,
            bridgeReachable: true,
            blockerIds: Object.freeze([])
        }),
        context: Object.freeze({
            canonicalMCoordinate: "M2'",
            pointerAnchor: `pointer://tick/${tick}`,
            profileGeneration: tick + 100
        }),
        subject: 'tick',
        emittedAt: 1_771_000_000_000 + tick
    });
}

function snapshot(tick, overrides = {}) {
    return buildCymaticTickSnapshot({
        tick,
        packet: packetForTick(tick, overrides),
        capturedAtMs: 1_771_000_000_000 + tick,
        source: 'kernel-bridge-profile-cache'
    });
}

test('pause holds the chi field at the paused tick while live packet advances', () => {
    const history = Object.freeze([snapshot(40), snapshot(41), snapshot(42)]);
    const paused = resolveCymaticTransportViewModel({
        liveSnapshot: snapshot(43),
        tickSnapshots: history,
        paused: true,
        pausedSnapshot: history[1]
    });

    assert.equal(paused.activeSnapshot?.tick, 41);
    assert.equal(paused.liveSnapshot?.tick, 43);
    assert.notDeepEqual(
        paused.activeSnapshot?.packet.cymaticSignature.wavePoints,
        paused.liveSnapshot?.packet.cymaticSignature.wavePoints
    );

    const html = markup(
        React.createElement(CymaticTransport, {
            livePacket: packetForTick(43),
            liveTick: 43,
            tickSnapshots: history,
            initialPaused: true,
            initialPausedTick: 41
        })
    );
    assert.match(html, /data-paused-tick-badge="41"/);
    assert.match(html, /Paused tick 41/);
    assert.match(html, /data-active-tick="41"/);
});

test('scrub-to-tick replays the deterministic cached frame for the requested tick', () => {
    const history = Object.freeze([snapshot(50), snapshot(51), snapshot(52)]);
    const scrubbed = resolveCymaticTransportViewModel({
        liveSnapshot: snapshot(53),
        tickSnapshots: history,
        scrubTick: 50
    });
    const replay = resolveCymaticTransportViewModel({
        liveSnapshot: snapshot(60),
        tickSnapshots: history,
        scrubTick: 50
    });

    assert.equal(scrubbed.activeSnapshot?.tick, 50);
    assert.deepEqual(
        scrubbed.activeSnapshot?.packet.cymaticSignature.wavePoints,
        replay.activeSnapshot?.packet.cymaticSignature.wavePoints
    );
    assert.notDeepEqual(
        scrubbed.activeSnapshot?.packet.cymaticSignature.wavePoints,
        scrubbed.liveSnapshot?.packet.cymaticSignature.wavePoints
    );

    const html = markup(
        React.createElement(CymaticTransport, {
            livePacket: packetForTick(53),
            liveTick: 53,
            tickSnapshots: history,
            initialScrubTick: 50
        })
    );
    assert.match(html, /aria-label="Scrub cymatic surface to tick"/);
    assert.match(html, /data-active-tick="50"/);
    assert.match(html, /value="50"/);
});

test('Klein-flip markers are visible on the tick-snapshot bar', () => {
    const history = Object.freeze([
        snapshot(70),
        snapshot(71, {
            kleinFlip: Object.freeze({
                kind: 'm2CymaticValenceInvert',
                flip_at_this_tick: true,
                tick: 71
            })
        }),
        snapshot(72)
    ]);
    const model = resolveCymaticTransportViewModel({
        liveSnapshot: snapshot(72),
        tickSnapshots: history
    });

    assert.deepEqual(model.kleinFlipTicks, [71]);
    const html = markup(
        React.createElement(CymaticTransport, {
            livePacket: packetForTick(72),
            liveTick: 72,
            tickSnapshots: history
        })
    );
    assert.match(html, /data-klein-flip-marker="71"/);
    assert.match(html, /Scrub to Klein-flip tick 71/);
});

test('missing tick-snapshot cache falls back to live-only without crashing', () => {
    const model = resolveCymaticTransportViewModel({
        liveSnapshot: snapshot(80),
        tickSnapshots: null,
        scrubTick: 79
    });

    assert.equal(model.cacheState, 'pending-tick-snapshot-cache');
    assert.equal(model.activeSnapshot?.tick, 80);
    assert.equal(model.scrubberDisabled, true);

    const html = markup(
        React.createElement(CymaticTransport, {
            livePacket: packetForTick(80),
            liveTick: 80,
            tickSnapshots: null
        })
    );
    assert.match(html, /pending-tick-snapshot-cache/);
    assert.match(html, /data-cache-state="pending-tick-snapshot-cache"/);
    assert.match(html, /data-active-tick="80"/);
    assert.match(html, /data-audio-output="none"/);
});
