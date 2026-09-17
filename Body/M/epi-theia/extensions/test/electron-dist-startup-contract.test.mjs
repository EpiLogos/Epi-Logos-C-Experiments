import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const systemRoot = resolve(__dirname, '..', '..');
const systemManifestPath = resolve(systemRoot, 'package.json');
const electronAppManifestPath = resolve(systemRoot, 'electron-app', 'package.json');
const ensureElectronDistScript = '../scripts/ensure-electron-dist.mjs';
const ensureElectronNativeModulesScript = '../scripts/ensure-electron-native-modules.mjs';
const systemManifest = JSON.parse(readFileSync(systemManifestPath, 'utf8'));
const electronAppManifest = JSON.parse(readFileSync(electronAppManifestPath, 'utf8'));

assert.ok(
  existsSync(resolve(systemRoot, 'scripts', 'ensure-electron-dist.mjs')),
  'the Electron dist verifier must remain available to startup scripts'
);
assert.ok(
  existsSync(resolve(systemRoot, 'scripts', 'ensure-electron-native-modules.mjs')),
  'the Electron native-module verifier must remain available to startup scripts'
);

test('Electron startup repairs a missing binary dist before Theia loads Electron', () => {
  const { scripts } = electronAppManifest;

  for (const scriptName of ['start', 'start:debug']) {
    assert.match(
      scripts[scriptName],
      new RegExp(
        `^node ${escapeRegExp(ensureElectronDistScript)} && node ${escapeRegExp(ensureElectronNativeModulesScript)} && `
      ),
      `${scriptName} must run Electron dist and native-module verifiers before theia start`
    );
  }

  assert.match(scripts.start, /theia start$/);
  assert.match(scripts['start:debug'], /theia start --inspect$/);
  assert.match(
    scripts.dev,
    /pnpm run build && pnpm run start$/,
    'dev mode must route through start so the Electron dist guard runs before launch'
  );
});

test('Electron backend native dependencies load inside the Electron Node ABI', () => {
  assert.ok(
    !systemManifest.pnpm?.onlyBuiltDependencies?.includes('drivelist'),
    'drivelist must not build during pnpm install; ensure-electron-native-modules owns the Electron ABI build'
  );

  const electronBinary = resolve(
    systemRoot,
    'node_modules',
    'electron',
    'dist',
    process.platform === 'darwin'
      ? 'Electron.app/Contents/MacOS/Electron'
      : process.platform === 'win32'
        ? 'electron.exe'
        : 'electron'
  );
  assert.ok(existsSync(electronBinary), 'Electron binary must exist before checking native backend modules');

  const result = spawnSync(
    electronBinary,
    ['-e', "require('drivelist'); console.log('electron drivelist ok')"],
    {
      cwd: systemRoot,
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
      encoding: 'utf8'
    }
  );

  assert.equal(
    result.status,
    0,
    `drivelist must load inside Electron's Node runtime\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
  );
  assert.match(result.stdout, /electron drivelist ok/);
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
