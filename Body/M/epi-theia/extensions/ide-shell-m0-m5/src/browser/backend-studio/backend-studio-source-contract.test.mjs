import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function source(name) {
    const path = resolve(__dirname, name);
    assert.equal(existsSync(path), true, `${name} must exist`);
    return readFileSync(path, 'utf8');
}

test('Backend Studio activity-bar contribution is ide-deep only and clears first-build marker', () => {
    const contribution = source('backend-studio-contribution.ts');
    assert.match(contribution, /BackendStudioContribution/);
    assert.match(contribution, /Backend Studio/);
    assert.match(contribution, /pratibimba\.ide-shell\.backend-studio/);
    assert.match(contribution, /epi-logos\.layout\.active/);
    assert.match(contribution, /availableInLayouts:\s*Object\.freeze\(\['ide-deep'\]\)/);
    assert.match(contribution, /viewContainerId:\s*BACKEND_STUDIO_ACTIVITY_BAR_SLOT/);
    assert.doesNotMatch(contribution, /codePendingMarker:\s*'first-build'/);
});

test('Backend Studio service registers the required language-server slots and source navigation', () => {
    const service = source('backend-studio-service.ts');
    assert.match(service, /registerLanguageServers/);
    for (const text of [
        'rust-analyzer',
        'clangd',
        'pylsp',
        'typescript-language-server',
        'Body/S/S0/epi-lib',
        'Body/S/S0/portal-core',
        'Body/S/S1/hen-compiler-core',
        'Body/S/S2/graph-schema',
        'Body/S/S2/graph-services',
        'Body/S/S5/epi-gnostic',
        'Body/S/S5/epi-kbase',
        'Body/M/epi-theia/extensions'
    ]) {
        assert.ok(service.includes(text), `service must include ${text}`);
    }
    assert.match(service, /openSource\(coordinate:\s*string,\s*sourceAnchor:\s*string/);
    assert.match(service, /s2\.graph\.node/);
    assert.match(service, /isPrivacySafe/);
    assert.match(service, /editorManager\.open/);
});

test('Backend Studio widget performs coordinate search, line decorations, and Canon Studio proof links', () => {
    const widget = source('backend-studio-widget.tsx');
    assert.match(widget, /BackendStudioWidget/);
    assert.match(widget, /s1'\.semantic\.find_by_coordinate/);
    assert.match(widget, /coordinate-aware-line/);
    assert.match(widget, /proof-navigation/);
    assert.match(widget, /open-canon-studio-file/);
    assert.match(widget, /Monaco editor/);
});
