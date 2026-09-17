import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SYSTEM_ROOT = resolve(__dirname, '..', '..');

test('electron target carries every browser Pratibimba package unless explicitly excepted', async () => {
  const browser = await readPackage('theia-app/package.json');
  const electron = await readPackage('electron-app/package.json');
  const exceptions = await readBrowserOnlyExceptions();

  const browserPackages = pratibimbaDependencyNames(browser);
  const electronPackages = new Set(pratibimbaDependencyNames(electron));
  const browserOnlyPackages = browserPackages.filter(packageName => !electronPackages.has(packageName));
  const exceptedPackages = new Set(exceptions.map(entry => entry.packageName));
  const missingWithoutException = browserOnlyPackages.filter(packageName => !exceptedPackages.has(packageName));
  const staleExceptions = exceptions
    .map(entry => entry.packageName)
    .filter(packageName => !browserOnlyPackages.includes(packageName));

  assert.deepEqual(
    missingWithoutException,
    [],
    [
      'electron-app is missing Pratibimba packages carried by theia-app without browser-only exceptions:',
      ...missingWithoutException.map(packageName => `  - ${packageName}`),
      'Add the dependency to electron-app/package.json or document the browser-only reason in extensions/test/browser-only-exceptions.json.'
    ].join('\n')
  );
  assert.deepEqual(
    staleExceptions,
    [],
    [
      'browser-only exception ledger contains packages that are not currently browser-only:',
      ...staleExceptions.map(packageName => `  - ${packageName}`)
    ].join('\n')
  );
});

test('smoke build runs electron target parity gate before building Electron', async () => {
  const smokeBuild = await readFile(resolve(SYSTEM_ROOT, 'scripts/smoke-build.sh'), 'utf8');
  const parityGate = 'node --test extensions/test/electron-target-parity.test.mjs';
  const electronBuild = 'pnpm --filter @pratibimba/electron-app build';

  assert.match(smokeBuild, /node --test extensions\/test\/electron-target-parity\.test\.mjs/);
  assert.ok(
    smokeBuild.indexOf(parityGate) < smokeBuild.indexOf(electronBuild),
    'smoke-build.sh must run electron target parity before the Electron build'
  );
});

async function readPackage(relativePath) {
  return JSON.parse(await readFile(resolve(SYSTEM_ROOT, relativePath), 'utf8'));
}

async function readBrowserOnlyExceptions() {
  const ledger = JSON.parse(
    await readFile(resolve(SYSTEM_ROOT, 'extensions/test/browser-only-exceptions.json'), 'utf8')
  );

  assert.ok(Array.isArray(ledger.exceptions), 'browser-only-exceptions.json must contain an exceptions array');

  for (const entry of ledger.exceptions) {
    assert.equal(typeof entry.packageName, 'string', 'browser-only exception packageName must be a string');
    assert.match(entry.packageName, /^@pratibimba\//, 'browser-only exception packageName must be a Pratibimba package');
    assert.equal(typeof entry.reason, 'string', `browser-only exception ${entry.packageName} must include a reason`);
    assert.ok(entry.reason.trim().length > 0, `browser-only exception ${entry.packageName} reason must not be empty`);
  }

  return ledger.exceptions;
}

function pratibimbaDependencyNames(packageJson) {
  return Object.keys(packageJson.dependencies ?? {})
    .filter(packageName => packageName.startsWith('@pratibimba/'))
    .sort();
}
