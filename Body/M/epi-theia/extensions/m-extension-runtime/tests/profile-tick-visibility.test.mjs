import test from 'node:test';
import assert from 'node:assert/strict';
import Module, { createRequire } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const originalLoad = Module._load;
Module._load = function loadProfileTickVisibilityDependency(request, parent, isMain) {
    if (request === '@theia/core/lib/browser') {
        return {
            FrontendApplicationContribution: class {},
            StatusBar: class {},
            StatusBarAlignment: { LEFT: 'LEFT', RIGHT: 'RIGHT' },
            StatusBarEntry: class {}
        };
    }
    if (request === '@theia/core/lib/browser/preferences') {
        return { PreferenceService: class {} };
    }
    if (request === '@theia/core/lib/common') {
        return { CommandRegistry: class {} };
    }
    if (request === '@theia/core/shared/inversify') {
        const decorator = () => () => undefined;
        return {
            inject: decorator,
            injectable: decorator,
            postConstruct: decorator
        };
    }
    return originalLoad.call(this, request, parent, isMain);
};
const {
    ColdStartOrchestrator,
    COLD_START_STAGE_ORDER
} = require('../lib/browser/cold-start-orchestrator.js');
const { ColdStartSplash } = require('../lib/browser/cold-start-splash.js');
const {
    OPEN_PROFILE_TICK_DIAGNOSTICS_COMMAND,
    PROFILE_TICK_VISIBLE_PREFERENCE,
    ProfileTickStatusEntry
} = require('../lib/browser/status-bar/profile-tick-status-entry.js');
const walkthrough = require('../lib/browser/onboarding/walkthrough-overlay.js');

function makeProfile(tick, generation, lastTickTimestamp = '2026-06-19T11:42:00.000Z') {
    return {
        generation,
        pointerAnchor: null,
        capabilities: [],
        payload: {
            tick,
            lastTickTimestamp
        }
    };
}

function makeBridge(profile = makeProfile(42, 7)) {
    const listeners = [];
    return {
        onProfile(listener) {
            listeners.push(listener);
            return { dispose() {} };
        },
        emitProfile(next) {
            this.profile = next;
            for (const listener of listeners) {
                listener(next);
            }
        },
        profile,
        currentSnapshot() {
            return {
                profile: this.profile,
                status: { connected: true, mode: 'full', reason: 'ok' },
                readiness: { state: 'ready_public_current', bridgeReachable: true },
                context: {},
                currentStateSelectors: {}
            };
        }
    };
}

function makePreferences(initialValue = true) {
    const listeners = [];
    return {
        value: initialValue,
        get(preferenceName, fallback) {
            return preferenceName === PROFILE_TICK_VISIBLE_PREFERENCE ? this.value : fallback;
        },
        onPreferenceChanged(listener) {
            listeners.push(listener);
            return { dispose() {} };
        },
        setVisible(next) {
            this.value = next;
            for (const listener of listeners) {
                listener({ preferenceName: PROFILE_TICK_VISIBLE_PREFERENCE, newValue: next });
            }
        }
    };
}

function makeStatusBar() {
    return {
        setCalls: [],
        removeCalls: [],
        async setElement(id, entry) {
            this.setCalls.push({ id, entry });
        },
        async removeElement(id) {
            this.removeCalls.push(id);
        }
    };
}

function makeProfileTickEntry({ visible = true, profile = makeProfile(42, 7) } = {}) {
    const entry = new ProfileTickStatusEntry();
    entry.bridge = makeBridge(profile);
    entry.preferences = makePreferences(visible);
    entry.statusBar = makeStatusBar();
    entry.commands = {
        registered: [],
        executed: [],
        registerCommand(command, handler) {
            this.registered.push({ command, handler });
        },
        executeCommand(command, ...args) {
            this.executed.push([command, ...args]);
        }
    };
    return entry;
}

function readySnapshot(profile = null) {
    return {
        profile,
        status: { connected: true },
        readiness: {
            state: 'ready_public_current',
            reason: 'ready',
            profileGeneration: profile?.generation ?? null,
            bridgeReachable: true,
            blockerIds: []
        }
    };
}

function makeColdStartAdapter(snapshot) {
    return {
        snapshot,
        onReadiness() { return { dispose() {} }; },
        onConnectionStatus() { return { dispose() {} }; },
        onProfile() { return { dispose() {} }; },
        currentSnapshot() { return this.snapshot; },
        invokeGatewayRpc() { return Promise.resolve(); }
    };
}

test('profile-tick status entry renders tick, generation, last fired timestamp, and diagnostics command', async () => {
    const entry = makeProfileTickEntry();

    await entry.onStart();

    const rendered = entry.statusBar.setCalls.at(-1);
    assert.equal(rendered.id, 'pratibimba.state-thread.profile-tick');
    assert.equal(rendered.entry.text, 'tick:42 gen:7');
    assert.match(rendered.entry.tooltip, /Last tick fired: 2026-06-19T11:42:00\.000Z/);
    assert.equal(rendered.entry.command, OPEN_PROFILE_TICK_DIAGNOSTICS_COMMAND);
});

test('profile-tick visible preference hides and restores the status entry without removing its declaration', async () => {
    const entry = makeProfileTickEntry({ visible: true });

    await entry.onStart();
    assert.equal(entry.statusBar.setCalls.length, 1);
    assert.equal(entry.statusBar.removeCalls.length, 0);

    entry.preferences.setVisible(false);
    assert.deepEqual(entry.statusBar.removeCalls, ['pratibimba.state-thread.profile-tick']);
    assert.equal(entry.statusBar.setCalls.length, 1);

    entry.preferences.setVisible(true);
    assert.equal(entry.statusBar.setCalls.length, 2);
});

test('profile-tick click command opens OmniPanel Diagnostics focused on profile-tick history', () => {
    const entry = makeProfileTickEntry();

    entry.registerCommands(entry.commands);
    const registered = entry.commands.registered.find(
        item => item.command.id === OPEN_PROFILE_TICK_DIAGNOSTICS_COMMAND
    );
    assert.ok(registered);

    registered.handler.execute();
    assert.deepEqual(entry.commands.executed, [
        ['omnipanel.openTab', 'diagnostics', { focus: 'profile-tick-history' }]
    ]);
});

test('m-extension-runtime keeps exactly six canonical state-thread status entries declared', () => {
    const runtimeRoot = join(process.cwd(), 'src');
    const statusBarRoot = join(runtimeRoot, 'browser', 'status-bar');
    const frontendModule = readFileSync(join(runtimeRoot, 'browser', 'frontend-module.ts'), 'utf8');

    const entryFiles = readdirSync(statusBarRoot)
        .filter(file => file.endsWith('-status-entry.ts'))
        .sort();
    assert.deepEqual(entryFiles, [
        'active-coordinate-status-entry.ts',
        'day-now-status-entry.ts',
        'gateway-readiness-status-entry.ts',
        'profile-generation-status-entry.ts',
        'profile-tick-status-entry.ts',
        'session-id-status-entry.ts'
    ]);

    const ids = entryFiles.flatMap(file => {
        const source = readFileSync(join(statusBarRoot, file), 'utf8');
        return Array.from(
            source.matchAll(/id:\s*'(pratibimba\.state-thread\.[^']+)'/g),
            match => match[1]
        );
    });

    assert.equal(ids.length, 6);
    assert.equal(new Set(ids).size, 6);
    assert.match(frontendModule, /bind\(FrontendApplicationContribution\)\.toService\(ProfileTickStatusEntry\)/);
});

test('cold-start splash visibly differentiates pending first tick from profile-tick birth', () => {
    const orch = new ColdStartOrchestrator();
    orch.adapter = makeColdStartAdapter(readySnapshot(null));
    orch.preferences = { get: (_key, fallback) => fallback };
    orch.kairosResolved = true;

    orch.start();
    assert.equal(orch.currentStage(), 'splash-visible');

    const pendingHtml = renderToStaticMarkup(
        React.createElement(ColdStartSplash, { stage: orch.currentStage(), onDismiss: () => undefined })
    );
    assert.match(pendingHtml, /Awaiting first profile-tick…/);
    assert.match(pendingHtml, /data-contract-state="bridge_unavailable"/);
    assert.match(pendingHtml, /data-contract-flavour="pending_first_tick"/);

    orch.adapter.snapshot = readySnapshot(makeProfile(1, 7));
    orch.reconcile();
    assert.equal(orch.currentStage(), 'profile-tick-alive');
    assert.ok(COLD_START_STAGE_ORDER.includes('profile-tick-alive'));

    const aliveHtml = renderToStaticMarkup(
        React.createElement(ColdStartSplash, { stage: orch.currentStage(), onDismiss: () => undefined })
    );
    assert.match(aliveHtml, /Profile-tick 1 — system alive\./);
    assert.match(aliveHtml, /data-contract-state="ready_public_current"/);
});

test('onboarding walkthrough step 1 explains profile-tick autonomous motion', () => {
    assert.equal(
        walkthrough.WALKTHROUGH_STEPS[0].body.includes(
            "Everything advances on its own — that’s the profile-tick. The system is alive whether you touch it or not."
        ),
        true
    );
});
