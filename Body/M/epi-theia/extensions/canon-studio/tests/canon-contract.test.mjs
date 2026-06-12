import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
    S1_SEMANTIC_AUTOCOMPLETE_METHOD,
    S1_VAULT_WRITE_METHOD,
    buildSemanticAutocompleteRequest,
    buildVaultWriteRequest,
    scanCanonDecorations
} from '../lib/common/index.js';

test('canon decorations find QL, Bimba, and wikilink references', () => {
    const decorations = scanCanonDecorations('CP 4.2 maps #5.0 into [[Bimba]]');
    assert.deepEqual(
        decorations.map(item => item.kind),
        ['ql-coordinate', 'bimba-coordinate', 'wikilink']
    );
});

test('Smart Connections and Hen vault gateway requests are S1 routed', () => {
    assert.equal(S1_SEMANTIC_AUTOCOMPLETE_METHOD, "s1'.semantic.autocomplete");
    assert.equal(S1_VAULT_WRITE_METHOD, "s1'.vault.writeMarkdown");

    const semantic = buildSemanticAutocompleteRequest('vault://NOW.md', '#5', 3, 9);
    assert.equal(semantic.gatewayMethod, "s1'.semantic.autocomplete");
    assert.deepEqual(semantic.semanticScopes, ['ql', 'bimba', 'wikilink']);

    const write = buildVaultWriteRequest('vault://NOW.md', 'body', ['h1']);
    assert.equal(write.gatewayMethod, "s1'.vault.writeMarkdown");
    assert.deepEqual(write.provenanceHandles, ['h1']);
});
