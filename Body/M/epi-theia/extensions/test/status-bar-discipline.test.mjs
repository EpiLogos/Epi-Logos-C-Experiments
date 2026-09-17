import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const extensionsRoot = join(process.cwd(), 'extensions');
const runtimeRoot = join(extensionsRoot, 'm-extension-runtime');
const statusBarRoot = join(runtimeRoot, 'src', 'browser', 'status-bar');
const frontendModulePath = join(runtimeRoot, 'src', 'browser', 'frontend-module.ts');
const statusSupportPath = join(statusBarRoot, 'state-thread-status-support.ts');

const expectedEntries = [
  {
    file: 'active-coordinate-status-entry.ts',
    className: 'ActiveCoordinateStatusEntry',
    id: 'pratibimba.state-thread.active-coordinate',
    priority: 190,
    alignment: 'LEFT',
    command: 'pratibimba.state-thread.jump-to-coordinate'
  },
  {
    file: 'day-now-status-entry.ts',
    className: 'DayNowStatusEntry',
    id: 'pratibimba.state-thread.day-now',
    priority: 180,
    alignment: 'LEFT'
  },
  {
    file: 'session-id-status-entry.ts',
    className: 'SessionIdStatusEntry',
    id: 'pratibimba.state-thread.session-id',
    priority: 170,
    alignment: 'LEFT'
  },
  {
    file: 'gateway-readiness-status-entry.ts',
    className: 'GatewayReadinessStatusEntry',
    id: 'pratibimba.state-thread.gateway-readiness',
    priority: 160,
    alignment: 'RIGHT'
  },
  {
    file: 'profile-generation-status-entry.ts',
    className: 'ProfileGenerationStatusEntry',
    id: 'pratibimba.state-thread.profile-generation',
    priority: 150,
    alignment: 'RIGHT'
  },
  {
    file: 'profile-tick-status-entry.ts',
    className: 'ProfileTickStatusEntry',
    id: 'pratibimba.state-thread.profile-tick',
    priority: 140,
    alignment: 'RIGHT'
  }
];

function readStatusEntry(file) {
  const path = join(statusBarRoot, file);
  assert.ok(existsSync(path), `missing status entry file: ${file}`);
  return readFileSync(path, 'utf8');
}

test('m-extension-runtime declares exactly six state-thread status entry files', () => {
  assert.ok(existsSync(statusBarRoot), 'status-bar directory must exist');

  const statusEntryFiles = readdirSync(statusBarRoot)
    .filter(file => file.endsWith('-status-entry.ts'))
    .sort();

  assert.deepEqual(statusEntryFiles, expectedEntries.map(entry => entry.file).sort());
});

test('state-thread status entries keep the exact catalog ids, priorities, and alignments', () => {
  const supportSource = readFileSync(statusSupportPath, 'utf8');
  assert.match(supportSource, /data-pratibimba-state-thread|pratibimba-state-thread/);

  for (const entry of expectedEntries) {
    const source = readStatusEntry(entry.file);

    assert.match(source, new RegExp(`id:\\s*'${entry.id.replaceAll('.', '\\.')}'`), `${entry.file} id drifted`);
    assert.match(source, new RegExp(`priority:\\s*${entry.priority}\\b`), `${entry.file} priority drifted`);
    assert.match(
      source,
      new RegExp(`alignment:\\s*StatusBarAlignment\\.${entry.alignment}\\b`),
      `${entry.file} alignment drifted`
    );
    assert.match(
      source,
      new RegExp(`marker:\\s*'${entry.id.replace('pratibimba.state-thread.', '')}'`),
      `${entry.file} must declare its state-thread inspection marker key`
    );

    if (entry.command) {
      assert.match(
        source,
        new RegExp(`command:\\s*'${entry.command.replaceAll('.', '\\.')}'`),
        `${entry.file} command drifted`
      );
    }
  }

  const allSource = expectedEntries.map(entry => readStatusEntry(entry.file)).join('\n');
  const stateThreadIds = Array.from(
    allSource.matchAll(/id:\s*'(pratibimba\.state-thread\.[^']+)'/g),
    match => match[1]
  );

  assert.equal(stateThreadIds.length, 6);
  assert.equal(new Set(stateThreadIds).size, 6);
});

test('frontend module binds each state-thread contribution into Theia', () => {
  const source = readFileSync(frontendModulePath, 'utf8');

  for (const entry of expectedEntries) {
    assert.match(source, new RegExp(`\\b${entry.className}\\b`), `${entry.className} is not imported`);
    assert.match(
      source,
      new RegExp(`bind\\(${entry.className}\\)\\.toSelf\\(\\)\\.inSingletonScope\\(\\)`),
      `${entry.className} is not singleton-bound`
    );
    assert.match(
      source,
      new RegExp(`bind\\(FrontendApplicationContribution\\)\\.toService\\(${entry.className}\\)`),
      `${entry.className} is not registered as a frontend contribution`
    );
  }
});
