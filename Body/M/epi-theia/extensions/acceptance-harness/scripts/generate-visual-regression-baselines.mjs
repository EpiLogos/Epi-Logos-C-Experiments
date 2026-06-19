#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderVisualBaselinePng, sha256 } from './visual-regression-renderer.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HARNESS_ROOT = resolve(__dirname, '..');
const FIXTURE_ROOT = join(HARNESS_ROOT, 'fixtures', 'visual-regression');
const DIFF_THRESHOLD = { pixelRatio: 0.02 };
const PRIVACY_CLASS = 'protected-local-synthetic-fixture';
const TRANCHE = '15.T15.12';
const PLAN = 'track-15-t15.12-visual-regression';

function readJson(path) {
    return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function maxChangedPixels(width, height) {
    return Math.floor(width * height * DIFF_THRESHOLD.pixelRatio);
}

function frameTolerance(width, height) {
    return {
        ...DIFF_THRESHOLD,
        maxChangedPixels: maxChangedPixels(width, height)
    };
}

function writeFramePng(fixtureDir, manifest, frame) {
    const png = renderVisualBaselinePng(manifest, frame);
    const screenshotPath = join(FIXTURE_ROOT, fixtureDir, 'screenshots', frame.screenshot);
    mkdirSync(dirname(screenshotPath), { recursive: true });
    writeFileSync(screenshotPath, png);
    return sha256(png);
}

function commitIntegratedFixture(fixtureDir, coverage) {
    const manifestPath = join(FIXTURE_ROOT, fixtureDir, 'manifest.json');
    const screenshotsPath = join(FIXTURE_ROOT, fixtureDir, 'screenshots', 'baseline.manifest.json');
    const previousManifest = readJson(manifestPath);
    const previousScreenshots = readJson(screenshotsPath);

    const manifest = {
        ...previousManifest,
        plan: PLAN,
        tranche: TRANCHE,
        status: 'baseline-committed',
        privacyClass: PRIVACY_CLASS,
        coverage,
        diffThreshold: DIFF_THRESHOLD,
        baselines: previousManifest.baselines.map(baseline => {
            const viewport = previousManifest.viewports.find(candidate => candidate.id === baseline.viewport);
            return {
                ...baseline,
                captured: true,
                tolerance: frameTolerance(viewport.width, viewport.height)
            };
        })
    };

    const screenshots = previousScreenshots.screenshots.map(shot => {
        const frame = {
            id: shot.viewport,
            screenshot: shot.file,
            viewport: shot.viewport,
            width: shot.width,
            height: shot.height,
            deviceScaleFactor: shot.deviceScaleFactor,
            captured: true,
            tolerance: frameTolerance(shot.width, shot.height)
        };
        const digest = writeFramePng(fixtureDir, manifest, frame);
        return {
            ...shot,
            frameId: frame.id,
            captured: true,
            tolerance: frame.tolerance,
            sha256: digest
        };
    });

    const screenshotManifest = {
        ...previousScreenshots,
        plan: PLAN,
        tranche: TRANCHE,
        status: 'baseline-committed',
        privacyClass: PRIVACY_CLASS,
        diffThreshold: DIFF_THRESHOLD,
        note: 'Committed PNG baselines are deterministic harness captures. Regenerate with scripts/generate-visual-regression-baselines.mjs after approved visual review.',
        screenshots
    };

    writeJson(manifestPath, manifest);
    writeJson(screenshotsPath, screenshotManifest);
}

function commitFrameFixture({ dir, fixtureId, coverage, frameSpecs, extraManifest }) {
    const manifest = {
        schemaVersion: '1.0.0',
        fixtureId,
        plan: PLAN,
        tranche: TRANCHE,
        status: 'baseline-committed',
        privacyClass: PRIVACY_CLASS,
        coverage,
        diffThreshold: DIFF_THRESHOLD,
        ...extraManifest
    };

    const frames = frameSpecs.map(spec => {
        const frame = {
            id: spec.id,
            screenshot: `${spec.id}.png`,
            width: spec.width,
            height: spec.height,
            deviceScaleFactor: spec.deviceScaleFactor ?? 1,
            captured: true,
            phase: spec.phase,
            tickIndex: spec.tickIndex,
            matrixIndex: spec.matrixIndex,
            matrixId: spec.matrixId,
            tolerance: frameTolerance(spec.width, spec.height)
        };
        const digest = writeFramePng(dir, manifest, frame);
        return {
            ...frame,
            sha256: digest
        };
    });

    const screenshotManifest = {
        schemaVersion: '1.0.0',
        fixtureId,
        plan: PLAN,
        tranche: TRANCHE,
        status: 'baseline-committed',
        privacyClass: PRIVACY_CLASS,
        diffThreshold: DIFF_THRESHOLD,
        captureRecipe: {
            command: 'pnpm --filter @pratibimba/acceptance-harness test:visual',
            renderer: 'scripts/visual-regression-renderer.mjs',
            reviewGate: 'visual review required when any frame exceeds 0.02 pixelRatio'
        },
        frames
    };

    writeJson(join(FIXTURE_ROOT, dir, 'manifest.json'), manifest);
    writeJson(join(FIXTURE_ROOT, dir, 'screenshots', 'baseline.manifest.json'), screenshotManifest);
}

function main() {
    if (!existsSync(FIXTURE_ROOT)) {
        throw new Error(`Missing fixture root: ${FIXTURE_ROOT}`);
    }

    commitIntegratedFixture('integrated-1-2-3', [
        '15.4 editor-area composition pattern',
        'Track 07 integrated 1-2-3 composition'
    ]);
    commitIntegratedFixture('integrated-4-5-0', [
        '15.4 editor-area composition pattern',
        'Track 08 integrated 4-5-0 composition'
    ]);

    commitFrameFixture({
        dir: 'lemniscate-transition',
        fixtureId: 'visual-regression/lemniscate-transition',
        coverage: ['15.5 lemniscate transition', '0/1 toggle choreography'],
        extraManifest: {
            framePhases: [0, 0.25, 0.5, 0.75, 1],
            transition: {
                from: 'daily-0-1',
                to: 'ide-deep',
                reducedMotionEquivalent: 'snap-to-settled-frame'
            }
        },
        frameSpecs: [0, 0.25, 0.5, 0.75, 1].map(phase => ({
            id: `phase-${String(Math.round(phase * 100)).padStart(3, '0')}`,
            width: 640,
            height: 360,
            deviceScaleFactor: 1,
            phase
        }))
    });

    const matrices = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5'];
    commitFrameFixture({
        dir: 'six-matrix-tick-choreography',
        fixtureId: 'visual-regression/six-matrix-tick-choreography',
        coverage: ['15.9 six-matrix tick choreography', 'profile-tick visual grammar'],
        extraManifest: {
            tickCount: 12,
            matrices,
            clock: {
                source: 'kernel-bridge profile tick',
                localAnimationTimers: false
            }
        },
        frameSpecs: Array.from({ length: 12 }, (_, tick) => ({
            id: `tick-${String(tick).padStart(2, '0')}`,
            width: 720,
            height: 300,
            deviceScaleFactor: 1,
            tickIndex: tick,
            matrixIndex: tick % matrices.length,
            matrixId: matrices[tick % matrices.length]
        }))
    });
}

main();
