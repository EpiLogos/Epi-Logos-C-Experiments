import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const repoRoot = resolve(__dirname, '../../../../..');
const contractsPath = join(repoRoot, 'Body/M/epi-theia/extensions/contracts');
const primitivesPath = join(
    repoRoot,
    'Body/M/epi-theia/extensions/integrated-composition/src/browser/design-primitives'
);

test('motion tokens expose the profile-tick, lemniscate, slerp, flow, klein-flip, and flow-watcher grammar', () => {
    const jsonPath = join(contractsPath, 'ui-motion-tokens.json');
    const tsPath = join(contractsPath, 'ui-motion-tokens.ts');
    const mdPath = join(contractsPath, 'ui-motion-tokens.md');

    assert.equal(existsSync(jsonPath), true, 'ui-motion-tokens.json exists');
    assert.equal(existsSync(tsPath), true, 'ui-motion-tokens.ts exists');
    assert.equal(existsSync(mdPath), true, 'ui-motion-tokens.md exists');

    const tokens = JSON.parse(readFileSync(jsonPath, 'utf8'));
    const motion = tokens.epilogos.motion;

    assert.equal(motion['profile-tick'].duration.$value, 'kernel-bridge:subscribeToProfileTick.intervalMs');
    assert.equal(motion['profile-tick'].duration.$fallback, '500ms');
    assert.equal(motion['profile-tick'].easing.$value, 'linear');
    assert.equal(motion.transition.lemniscate.duration.$value, '600ms');
    assert.equal(motion.transition.lemniscate.easing.$value, 'cubic-bezier(0.4, 0.0, 0.2, 1)');
    assert.match(motion.transition.lemniscate.path.$value, /^M /);
    assert.equal(motion.tick.slerp.angularStep.$value, '30deg');
    assert.equal(motion.tick.slerp.choreography.$value, 'RING_QUATERNION_LUT[12]');
    assert.equal(motion.tick.slerp.kleinBoundaryTick.$value, 5);
    assert.deepEqual(motion.flow.streamline.advance.$value, {
        positionsPerTick: 1,
        ringSize: 6,
        duration: '200ms',
        easing: 'ease-out'
    });
    assert.equal(motion['klein-flip'].flagDuration.$value, '300ms');
    assert.equal(motion['klein-flip'].crossfadeMs.$value, '500ms');
    assert.equal(motion['flow-watcher'].debounceMs.$value, '2000ms');

    const typed = loadTypescriptModule(tsPath);
    assert.equal(typed.UI_MOTION_PROFILE_TICK_FALLBACK_MS, 500);
    assert.equal(typed.UI_MOTION_TOKENS.epilogos.motion.tick.slerp.kleinBoundaryTick.$value, 5);
    assert.ok(typed.UI_MOTION_TOKEN_PATHS.includes('epilogos.motion.tick.slerp.choreography'));

    const md = readFileSync(mdPath, 'utf8');
    for (const citation of ['15.5', '15.6', '15.9', '19.11', 'bridge_unavailable']) {
        assert.match(md, new RegExp(escapeRegExp(citation)));
    }
});

test('motion primitives publish the single profile-tick clock and reduced-motion lemniscate behavior', () => {
    const indexSource = readFileSync(join(primitivesPath, 'index.ts'), 'utf8');
    assert.match(indexSource, /from '\.\/lemniscate-transition'/);
    assert.match(indexSource, /from '\.\/slerp-choreography-clock'/);

    const lemniscateSource = readFileSync(join(primitivesPath, 'lemniscate-transition.tsx'), 'utf8');
    assert.match(lemniscateSource, /LemniscateTransition/);
    assert.match(lemniscateSource, /prefers-reduced-motion:\s*reduce/);
    assert.match(lemniscateSource, /resolveLemniscateTransitionDurationMs/);
    assert.doesNotMatch(lemniscateSource, /requestAnimationFrame|setInterval|setTimeout/);

    const slerpSource = readFileSync(join(primitivesPath, 'slerp-choreography-clock.tsx'), 'utf8');
    assert.match(slerpSource, /useSlerpClock/);
    assert.match(slerpSource, /subscribeToProfileTick/);
    assert.match(slerpSource, /RING_QUATERNION_LUT/);
    assert.doesNotMatch(slerpSource, /requestAnimationFrame|setInterval|setTimeout/);
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
        Object,
        console
    });
    return module.exports;
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
