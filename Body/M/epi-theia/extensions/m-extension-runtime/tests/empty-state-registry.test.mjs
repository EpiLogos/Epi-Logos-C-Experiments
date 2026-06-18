import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

test('EmptyStateRegistryImpl resolves registrations and removes them on dispose', () => {
    const {
        EmptyStateRegistryImpl
    } = require('../lib/common/empty-state-registry.js');

    const registry = new EmptyStateRegistryImpl();
    const component = () => null;
    const blockedSnapshot = Object.freeze({
        fetchedAt: 7,
        state: 'bridge_unavailable',
        reason: 'profile tick has not reached the extension yet',
        profileGeneration: null,
        bridgeReachable: false,
        blockerIds: Object.freeze(['profile_tick.pending'])
    });
    const registration = Object.freeze({
        extensionId: 'm-test',
        viewId: 'm-test.primary',
        activationCondition: snapshot => snapshot.state !== 'ready_public_current',
        component
    });

    const disposable = registry.register(registration);

    assert.equal(registry.resolve('m-test', 'm-test.primary'), registration);
    assert.deepEqual(registry.all(), [registration]);
    assert.equal(registry.resolve('m-test', 'm-test.primary')?.activationCondition(blockedSnapshot), true);

    disposable.dispose();

    assert.equal(registry.resolve('m-test', 'm-test.primary'), undefined);
    assert.deepEqual(registry.all(), []);
});

test('EmptyStateRegistryImpl replaces duplicate extension/view registrations without orphaning dispose', () => {
    const {
        EmptyStateRegistryImpl
    } = require('../lib/common/empty-state-registry.js');

    const registry = new EmptyStateRegistryImpl();
    const first = Object.freeze({
        extensionId: 'm-test',
        viewId: 'm-test.primary',
        activationCondition: () => true,
        component: () => null
    });
    const second = Object.freeze({
        extensionId: 'm-test',
        viewId: 'm-test.primary',
        activationCondition: () => false,
        component: () => null
    });

    const firstDisposable = registry.register(first);
    const secondDisposable = registry.register(second);

    assert.equal(registry.resolve('m-test', 'm-test.primary'), second);
    assert.deepEqual(registry.all(), [second]);

    firstDisposable.dispose();
    assert.equal(registry.resolve('m-test', 'm-test.primary'), second);

    secondDisposable.dispose();
    assert.equal(registry.resolve('m-test', 'm-test.primary'), undefined);
});
