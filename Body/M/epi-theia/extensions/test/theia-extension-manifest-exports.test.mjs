import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const systemRoot = resolve(__dirname, '..', '..');
const extensionsRoot = resolve(systemRoot, 'extensions');

test('Theia extension entrypoints are loadable through package exports', () => {
  const failures = [];

  for (const manifestPath of extensionManifestPaths()) {
    const packageRoot = dirname(manifestPath);
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const entries = Array.isArray(manifest.theiaExtensions) ? manifest.theiaExtensions : [];

    for (const entry of entries) {
      for (const field of ['frontend', 'backend']) {
        if (typeof entry[field] !== 'string') {
          continue;
        }
        const entrypoint = entry[field];
        const builtPath = join(packageRoot, `${entrypoint}.js`);
        if (!existsSync(builtPath)) {
          failures.push(`${manifest.name} ${field} entry ${entrypoint} is missing built file ${builtPath}`);
        }

        const exportKey = `./${entrypoint}`;
        if (manifest.exports && !manifest.exports[exportKey]) {
          failures.push(
            `${manifest.name} ${field} entry ${entrypoint} is blocked by package exports; add ${exportKey}`
          );
        }
      }
    }
  }

  assert.deepEqual(failures, [], failures.join('\n'));
});

function extensionManifestPaths() {
  return readdirSync(extensionsRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => join(extensionsRoot, entry.name, 'package.json'))
    .filter(existsSync)
    .sort();
}
