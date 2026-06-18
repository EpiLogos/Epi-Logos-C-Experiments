import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const privacy = require('../lib/browser/privacy-opt-in-dialog.js');

class FakeElement {
    constructor(tagName, ownerDocument) {
        this.tagName = tagName.toUpperCase();
        this.ownerDocument = ownerDocument;
        this.children = [];
        this.parentElement = null;
        this.attributes = new Map();
        this.listeners = new Map();
        this.className = '';
        this._textContent = '';
        this.checked = false;
        this.disabled = false;
        this.type = '';
    }

    get textContent() {
        return [
            this._textContent,
            ...this.children.map(child => child.textContent)
        ].join('');
    }

    set textContent(value) {
        this._textContent = value ?? '';
    }

    appendChild(child) {
        child.parentElement = this;
        this.children.push(child);
        return child;
    }

    remove() {
        if (!this.parentElement) {
            return;
        }
        this.parentElement.children = this.parentElement.children.filter(child => child !== this);
        this.parentElement = null;
    }

    setAttribute(name, value) {
        this.attributes.set(name, String(value));
    }

    getAttribute(name) {
        return this.attributes.get(name) ?? null;
    }

    addEventListener(type, listener) {
        const listeners = this.listeners.get(type) ?? [];
        listeners.push(listener);
        this.listeners.set(type, listeners);
    }

    click() {
        for (const listener of this.listeners.get('click') ?? []) {
            listener({ preventDefault() {} });
        }
    }

    change() {
        for (const listener of this.listeners.get('change') ?? []) {
            listener({ preventDefault() {} });
        }
    }
}

class FakeDocument {
    constructor() {
        this.body = new FakeElement('body', this);
        this.selectors = new Map();
    }

    createElement(tagName) {
        return new FakeElement(tagName, this);
    }

    querySelector(selector) {
        return this.selectors.get(selector) ?? null;
    }
}

function request(overrides = {}) {
    return {
        artifactHandle: 'nara://day/2026-06-18/artifact/atlas-sync-resonance',
        artifactSummary: 'atlas-sync resonance handle summary',
        description: 'This will publish atlas-sync resonance to the public bridge',
        action: 'nara.voice-corpus.include',
        scope: 'single-artifact',
        fromPrivacyClass: 'protected_local',
        toPrivacyClass: 'public_current',
        pressureFree: true,
        inspectable: true,
        ...overrides
    };
}

function findByText(node, text) {
    if (node.textContent === text) {
        return node;
    }
    for (const child of node.children ?? []) {
        const found = findByText(child, text);
        if (found) {
            return found;
        }
    }
    return null;
}

function findFirst(node, predicate) {
    if (predicate(node)) {
        return node;
    }
    for (const child of node.children ?? []) {
        const found = findFirst(child, predicate);
        if (found) {
            return found;
        }
    }
    return null;
}

test('PrivacyOptInDialog renders non-modal public crossing consent without artifact body', () => {
    const html = renderToStaticMarkup(
        React.createElement(privacy.PrivacyOptInDialog, {
            request: request(),
            consentChecked: false,
            onConsentCheckedChange: () => undefined,
            onConfirmPublicCrossing: () => undefined,
            onStayProtectedLocal: () => undefined
        })
    );

    assert.match(html, /role="dialog"/);
    assert.match(html, /aria-modal="false"/);
    assert.match(html, /nara:\/\/day\/2026-06-18\/artifact\/atlas-sync-resonance/);
    assert.match(html, /This will publish atlas-sync resonance to the public bridge/);
    assert.match(html, /pressureFree=true/);
    assert.match(html, /inspectable=true/);
    assert.match(html, />Stay protected-local</);
    assert.match(html, />Confirm public crossing</);
    assert.doesNotMatch(html, /raw journal body|q_personal|plaintext/);
});

test('privacy class selection stays within per-extension ceiling', () => {
    assert.equal(
        privacy.selectedPrivacyClassWithinCeiling('public_current', 'protected_local'),
        'protected_local'
    );
    assert.equal(
        privacy.selectedPrivacyClassWithinCeiling('protected_local', 'public_current'),
        'protected_local'
    );
    assert.equal(privacy.isProtectedToPublicCrossing('protected_local', 'public_current'), true);
});

test('per-artifact public crossing is blocked until consent exists for the same handle', () => {
    const draft = request();

    assert.throws(
        () => privacy.assertPublicCrossingAllowed(draft, []),
        /explicit opt-in consent/
    );

    const record = privacy.buildPublicBridgeConsentRecord(draft, '2026-06-18T10:00:00.000Z');
    privacy.assertPublicCrossingAllowed(draft, [record]);

    assert.throws(
        () => privacy.assertPublicCrossingAllowed(
            draft,
            [privacy.buildPublicBridgeConsentRecord(request({ artifactHandle: 'nara://other' }))]
        ),
        /explicit opt-in consent/
    );
});

test('confirm persists consent to PASU c_4_atlas_sync_consents with array-append semantics', async () => {
    const calls = [];
    const record = privacy.buildPublicBridgeConsentRecord(request(), '2026-06-18T10:01:00.000Z');
    const bridge = {
        async invokeGatewayRpc(method, payload) {
            calls.push({ method, payload });
            return {
                key: payload.key,
                value: [
                    {
                        action: 'nara.graphiti.body.inspect',
                        scope: 'single-artifact',
                        pressureFree: true,
                        inspectable: true,
                        artifactHandle: 'nara://existing',
                        timestamp: '2026-06-18T09:00:00.000Z',
                        subjectHandle: 'nara://existing',
                        consented: true,
                        consentedAt: '2026-06-18T09:00:00.000Z'
                    },
                    payload.value
                ]
            };
        }
    };

    const result = await privacy.persistPublicBridgeConsent(bridge, record);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].method, 'nara.pasu.set');
    assert.deepEqual(calls[0].payload, {
        key: 'c_4_atlas_sync_consents',
        value: record,
        mode: 'append'
    });
    assert.equal(result.length, 2);
    assert.deepEqual(result[1], record);
    assert.equal(result[1].artifactHandle, result[1].subjectHandle);
    assert.equal(result[1].timestamp, result[1].consentedAt);
});

test('showPrivacyOptInDialog mounts inline on the triggering OmniPanel anchor and confirms once checked', async () => {
    const document = new FakeDocument();
    const anchor = new FakeElement('div', document);
    document.selectors.set('[data-triggering-widget="m4-nara"]', anchor);

    const calls = [];
    const confirmed = [];
    const bridge = {
        async invokeGatewayRpc(method, payload) {
            calls.push({ method, payload });
            return { value: [payload.value] };
        }
    };

    const handle = privacy.showPrivacyOptInDialog({
        request: request(),
        bridge,
        document,
        mount: '[data-triggering-widget="m4-nara"]',
        now: () => '2026-06-18T10:02:00.000Z',
        onConfirm: record => confirmed.push(record)
    });

    assert.equal(anchor.children.length, 1);
    const surface = anchor.children[0];
    assert.equal(surface.getAttribute('aria-modal'), 'false');
    assert.equal(surface.getAttribute('data-artifact-handle'), request().artifactHandle);
    assert.match(surface.textContent, /atlas-sync resonance handle summary/);

    const confirm = findByText(surface, 'Confirm public crossing');
    assert.equal(confirm.disabled, true);

    const checkbox = findFirst(surface, node => node.tagName === 'INPUT' && node.type === 'checkbox');
    checkbox.checked = true;
    checkbox.change();
    assert.equal(confirm.disabled, false);

    confirm.click();
    await new Promise(resolve => setImmediate(resolve));

    assert.equal(calls.length, 1);
    assert.equal(calls[0].payload.key, 'c_4_atlas_sync_consents');
    assert.equal(calls[0].payload.value.artifactHandle, request().artifactHandle);
    assert.equal(calls[0].payload.value.timestamp, '2026-06-18T10:02:00.000Z');
    assert.equal(confirmed.length, 1);
    assert.equal(anchor.children.length, 0);

    handle.dispose();
});
