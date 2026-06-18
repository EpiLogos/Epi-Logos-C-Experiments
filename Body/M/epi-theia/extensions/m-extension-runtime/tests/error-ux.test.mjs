import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const repoRoot = '/Users/admin/Documents/Epi-Logos C Experiments';
const extensionsRoot = join(repoRoot, 'Body/M/epi-theia/extensions');
const runtimeRoot = join(extensionsRoot, 'm-extension-runtime');
const m4NaraRoot = join(extensionsRoot, 'm4-nara');

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
}

class FakeDocument {
    constructor() {
        this.body = new FakeElement('body', this);
    }

    createElement(tagName) {
        return new FakeElement(tagName, this);
    }

    querySelector() {
        return null;
    }
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

test('ReadinessBanner retry and diagnostics affordances call the real handlers', () => {
    const {
        ReadinessBanner,
        invokeReadinessRetry,
        openReadinessDiagnostics
    } = require('../lib/browser/readiness-banner.js');

    let retryCount = 0;
    const commandCalls = [];
    const commands = {
        executeCommand: (...args) => {
            commandCalls.push(args);
            return 'opened';
        }
    };

    invokeReadinessRetry(() => {
        retryCount += 1;
    });
    const result = openReadinessDiagnostics(commands);

    assert.equal(retryCount, 1);
    assert.equal(result, 'opened');
    assert.deepEqual(commandCalls, [['omnipanel.openTab', 'diagnostics']]);

    const html = renderToStaticMarkup(
        React.createElement(ReadinessBanner, {
            extensionId: 'm-test',
            extensionLabel: 'M Test',
            snapshot: {
                fetchedAt: Date.UTC(2026, 5, 17, 12, 0, 0),
                state: 'bridge_unavailable',
                reason: 'fixture bridge failure',
                profileGeneration: null,
                bridgeReachable: false,
                blockerIds: []
            },
            declaredBlockers: [],
            commands,
            onRetry: () => undefined
        })
    );

    assert.match(html, />Retry</);
    assert.match(html, />Open Diagnostics</);
    assert.match(html, /data-command="omnipanel.openTab"/);
    assert.match(html, /data-target-tab="diagnostics"/);
});

test('showInlineError mounts an inline, dismissible surface with retry and Diagnostics deep-link', () => {
    const {
        showInlineError
    } = require('../lib/browser/inline-error-surface.js');

    const document = new FakeDocument();
    let retryCount = 0;
    const commandCalls = [];
    const handle = showInlineError({
        extensionId: 'm4-nara',
        error: new Error('gateway timed out'),
        retry: () => {
            retryCount += 1;
        },
        commands: {
            executeCommand: (...args) => commandCalls.push(args)
        },
        document
    });

    assert.equal(document.body.children.length, 1);
    const surface = document.body.children[0];
    assert.equal(surface.getAttribute('data-extension'), 'm4-nara');
    assert.equal(surface.getAttribute('data-error-surface'), 'runtime-kernel-bridge');
    assert.match(surface.textContent, /gateway timed out/);

    findByText(surface, 'Retry').click();
    findByText(surface, 'Open Diagnostics').click();
    assert.equal(retryCount, 1);
    assert.deepEqual(commandCalls, [['omnipanel.openTab', 'diagnostics']]);

    findByText(surface, 'Dismiss').click();
    assert.equal(document.body.children.length, 0);

    handle.dispose();
    assert.equal(document.body.children.length, 0);
});

test('InlineErrorSurface renders the non-modal grammar without a dialog role', () => {
    const {
        InlineErrorSurface
    } = require('../lib/browser/inline-error-surface.js');

    const html = renderToStaticMarkup(
        React.createElement(InlineErrorSurface, {
            extensionId: 'm2-parashakti',
            message: 'authority payload missing',
            retry: () => undefined,
            commands: { executeCommand: () => undefined },
            onDismiss: () => undefined
        })
    );

    assert.match(html, /runtime-kernel-bridge/);
    assert.match(html, /authority payload missing/);
    assert.match(html, />Retry</);
    assert.match(html, />Open Diagnostics</);
    assert.match(html, />Dismiss</);
    assert.doesNotMatch(html, /role="dialog"/);
});

test('M4 Nara renders PASU-absent kairos warning against a synthetic readiness state', () => {
    const build = spawnSync('pnpm', ['--dir', m4NaraRoot, 'build'], {
        cwd: repoRoot,
        encoding: 'utf8'
    });
    assert.equal(
        build.status,
        0,
        `m4-nara build failed\nSTDOUT:\n${build.stdout}\nSTDERR:\n${build.stderr}`
    );

    const previousDocument = globalThis.document;
    const previousElement = globalThis.Element;
    const previousHTMLElement = globalThis.HTMLElement;
    const previousWindow = globalThis.window;
    const previousNavigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');

    class BrowserElement {
        constructor() {
            this.ownerDocument = globalThis.document;
            this.style = {};
        }

        matches() {
            return false;
        }
    }

    globalThis.Element = BrowserElement;
    globalThis.HTMLElement = BrowserElement;
    globalThis.document = {
        documentElement: new BrowserElement(),
        createElement: () => new BrowserElement(),
        querySelectorAll: () => []
    };
    globalThis.window = {
        document: globalThis.document,
        navigator: { maxTouchPoints: 0 },
        localStorage: {
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined
        }
    };
    Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        value: globalThis.window.navigator
    });

    try {
        const { M4NaraEmptyState } = require(join(m4NaraRoot, 'lib/browser/empty-state.js'));
        const html = renderToStaticMarkup(
            React.createElement(M4NaraEmptyState, {
                snapshot: {
                    fetchedAt: Date.UTC(2026, 5, 17, 12, 0, 0),
                    state: 'privacy_blocked',
                    reason: 'PASU identity gate blocked',
                    profileGeneration: null,
                    bridgeReachable: true,
                    blockerIds: ['pasu.identity.missing']
                },
                missingContributors: ['pasu.identity.missing']
            })
        );

        assert.match(html, /PASU not configured — kairos defaulting to neutral/);
    } finally {
        globalThis.document = previousDocument;
        globalThis.Element = previousElement;
        globalThis.HTMLElement = previousHTMLElement;
        globalThis.window = previousWindow;
        if (previousNavigatorDescriptor) {
            Object.defineProperty(globalThis, 'navigator', previousNavigatorDescriptor);
        } else {
            delete globalThis.navigator;
        }
    }
});

test('OmniPanel Diagnostics tab is present as the target for 15.2 deep-links', () => {
    const { OMNIPANEL_TABS } = require('../../omnipanel-shell/lib/common/omnipanel-types.js');
    assert.ok(OMNIPANEL_TABS.some(tab => tab.id === 'diagnostics' && tab.label === 'Diagnostics'));
});
