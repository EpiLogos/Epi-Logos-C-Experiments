import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

export const require = createRequire(import.meta.url);

const __dirname = dirname(fileURLToPath(import.meta.url));
export const HARNESS_ROOT = resolve(__dirname, '..');
export const ONBOARDING_FIXTURE_ROOT = join(HARNESS_ROOT, 'fixtures', 'onboarding');
export const ONBOARDING_VISUAL_ROOT = join(HARNESS_ROOT, 'fixtures', 'visual-regression', 'onboarding');

const {
    SharedBridgeAdapter
} = require('../../m-extension-runtime/lib/common/shared-bridge.js');
const {
    ColdStartOrchestrator
} = require('../../m-extension-runtime/lib/browser/cold-start-orchestrator.js');

export function readJsonFixture(...segments) {
    return JSON.parse(readFileSync(join(ONBOARDING_FIXTURE_ROOT, ...segments), 'utf8'));
}

export function readVisualFixture(...segments) {
    return JSON.parse(readFileSync(join(ONBOARDING_VISUAL_ROOT, ...segments), 'utf8'));
}

export function readVisualText(...segments) {
    return readFileSync(join(ONBOARDING_VISUAL_ROOT, ...segments), 'utf8');
}

export function createPreferenceStore(initial = {}) {
    const values = new Map(Object.entries(initial));
    return {
        get(key, fallback) {
            return values.has(key) ? values.get(key) : fallback;
        },
        async set(key, value) {
            values.set(key, value);
        },
        snapshot() {
            return Object.fromEntries(values.entries());
        }
    };
}

export function createGatewayFixture(options = {}) {
    const statusListeners = new Set();
    const profileListeners = new Set();
    const observabilityListeners = new Set();
    const rpcCalls = [];
    let status = options.initialStatus ?? { connected: false, mode: 'detached', reason: 'bridge_unavailable' };
    let readiness = options.initialReadiness;
    let profile = options.initialProfile ?? null;

    const gateway = {
        rpcCalls,
        kerykeionProbeCount: 0,
        onMathemeHarmonicProfile(listener) {
            profileListeners.add(listener);
            return { dispose: () => profileListeners.delete(listener) };
        },
        onConnectionStatusChange(listener) {
            statusListeners.add(listener);
            return { dispose: () => statusListeners.delete(listener) };
        },
        onObservabilityEvent(listener) {
            observabilityListeners.add(listener);
            return { dispose: () => observabilityListeners.delete(listener) };
        },
        async readReadiness() {
            return readiness;
        },
        async readCurrentProfile() {
            return profile;
        },
        async readPointerAnchor() {
            return null;
        },
        async parashaktiCorrespondences(address72) {
            return { address72, correspondences: [] };
        },
        async depositKernelObservation(event) {
            for (const listener of observabilityListeners) {
                listener(event);
            }
        },
        async requestReviewEvidence(request) {
            return { request, evidence: [] };
        },
        async invokeGatewayRpc(method, params) {
            rpcCalls.push({ method, params });
            if (method === 'nara.pasu.show') {
                return options.pasuRecord ?? null;
            }
            if (method === 'nara.kairos.refresh') {
                gateway.kerykeionProbeCount += 1;
                if (options.mercuriusError) {
                    throw new Error(options.mercuriusError);
                }
                return options.mercuriusResponse ?? { refreshedAt: '2026-06-11T00:00:00.000Z' };
            }
            return null;
        },
        emitStatus(next) {
            status = next;
            for (const listener of statusListeners) {
                listener(next);
            }
        },
        emitProfile(next) {
            profile = next;
            for (const listener of profileListeners) {
                listener(next);
            }
        },
        current() {
            return { status, readiness, profile };
        }
    };

    gateway.setReadiness = next => {
        readiness = next;
    };

    return gateway;
}

export async function settle() {
    await new Promise(resolve => setImmediate(resolve));
}

export async function createColdStartFixture({ preferences = {}, gatewayOptions = {}, initialReadiness }) {
    const adapter = new SharedBridgeAdapter();
    const prefs = createPreferenceStore(preferences);
    const gateway = createGatewayFixture({
        ...gatewayOptions,
        initialReadiness
    });
    const orchestrator = new ColdStartOrchestrator();
    orchestrator.adapter = adapter;
    orchestrator.preferences = prefs;

    const stages = [];
    const subscription = orchestrator.onStateChange(stage => {
        if (stages[stages.length - 1] !== stage) {
            stages.push(stage);
        }
    });

    adapter.attachBridge(gateway);
    orchestrator.start();
    await settle();

    return {
        adapter,
        gateway,
        orchestrator,
        preferences: prefs,
        stages,
        subscription,
        async emitReadiness(snapshot) {
            gateway.setReadiness(snapshot);
            assert.equal(typeof adapter.handleReadiness, 'function', 'SharedBridgeAdapter readiness hook must exist in compiled runtime');
            adapter.handleReadiness(snapshot);
            await settle();
        },
        async emitStatus(status) {
            gateway.emitStatus(status);
            await settle();
        },
        async emitProfile(profile) {
            gateway.emitProfile(profile);
            await settle();
        }
    };
}

export function assertFixturePrivacy(fixture) {
    assert.equal(fixture.privacyClass, 'protected-local-synthetic-fixture');
}

export function buildProfile(generation = 1) {
    return {
        generation,
        position6: 0,
        tick12: 0,
        stale: false
    };
}

