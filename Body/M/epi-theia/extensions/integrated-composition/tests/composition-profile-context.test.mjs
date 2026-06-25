import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const testDir = path.dirname(fileURLToPath(import.meta.url));
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const {
    openCompositionProfileSubscription
} = require('../lib/common/profile-tick-subscription.js');
const {
    CompositionProfileProvider,
    useCompositionProfile
} = require('../lib/browser/composition-profile-context.js');
const {
    ProfileTickInlineBinding
} = require('../lib/browser/design-primitives/index.js');

function profile(generation, tick12 = generation % 12) {
    return Object.freeze({
        generation,
        pointerAnchor: `profile:${generation}`,
        capabilities: Object.freeze([]),
        payload: Object.freeze({ generation, tick12 })
    });
}

function createBridge(initialProfile = null) {
    const listeners = new Set();
    let cached = initialProfile;
    let openCount = 0;
    let disposeCount = 0;
    return {
        onProfile(listener) {
            openCount += 1;
            listeners.add(listener);
            listener(cached);
            return {
                dispose() {
                    disposeCount += 1;
                    listeners.delete(listener);
                }
            };
        },
        emit(nextProfile) {
            cached = nextProfile;
            for (const listener of listeners) {
                listener(nextProfile);
            }
        },
        openCount() {
            return openCount;
        },
        disposeCount() {
            return disposeCount;
        }
    };
}

const SnapshotConsumer = ({ id }) => {
    const { profile: currentProfile, generation } = useCompositionProfile();
    return React.createElement('span', {
        'data-test': id,
        'data-generation': generation ?? 'none',
        'data-pointer': currentProfile?.pointerAnchor ?? 'none'
    });
};

test('composition provider opens one profile subscription for two hook consumers', () => {
    const bridge = createBridge(profile(42));

    const html = renderToStaticMarkup(
        React.createElement(
            CompositionProfileProvider,
            { bridge },
            React.createElement(SnapshotConsumer, { id: 'first' }),
            React.createElement(SnapshotConsumer, { id: 'second' })
        )
    );

    assert.equal(bridge.openCount(), 1);
    assert.match(html, /data-test="first" data-generation="42" data-pointer="profile:42"/);
    assert.match(html, /data-test="second" data-generation="42" data-pointer="profile:42"/);
});

test('shared profile subscription fans out one profile object and disposes upstream', () => {
    const bridge = createBridge();
    const subscription = openCompositionProfileSubscription(bridge);
    const seen = [];

    const first = subscription.subscribe(next => seen.push(['first', next]));
    const second = subscription.subscribe(next => seen.push(['second', next]));
    const nextProfile = profile(84);

    bridge.emit(nextProfile);

    assert.equal(bridge.openCount(), 1);
    assert.equal(subscription.currentProfile, nextProfile);
    assert.equal(subscription.currentGeneration, 84);
    assert.deepEqual(seen, [
        ['first', nextProfile],
        ['second', nextProfile]
    ]);

    first.dispose();
    second.dispose();
    subscription.dispose();
    assert.equal(bridge.disposeCount(), 1);
});

test('profile-tick-driven inline binding render advances tick while data input stays stable', () => {
    const bridge = createBridge(profile(12, 0));
    const subscription = openCompositionProfileSubscription(bridge);
    const stableDatum = Object.freeze({
        key: 'm2.audio.primary-frequency',
        label: 'Primary frequency',
        value: '432Hz'
    });
    const readiness = Object.freeze({
        fetchedAt: 6006,
        state: 'ready_public_current',
        reason: 'bridge current',
        profileGeneration: 12,
        bridgeReachable: true,
        blockerIds: Object.freeze([])
    });
    const rendered = [];
    const disposable = subscription.subscribeToProfileTick(profileTick => {
        rendered.push(renderToStaticMarkup(
            React.createElement(
                ProfileTickInlineBinding,
                {
                    bindingKey: stableDatum.key,
                    label: stableDatum.label,
                    value: stableDatum.value,
                    readiness,
                    profileTick
                },
                stableDatum.value
            )
        ));
    });

    bridge.emit(profile(13, 1));
    disposable.dispose();
    subscription.dispose();

    assert.equal(rendered.length, 2);
    assert.match(rendered[0], /data-binding-key="m2\.audio\.primary-frequency"/);
    assert.match(rendered[0], /data-binding-value="432Hz"/);
    assert.match(rendered[0], /data-profile-generation="12"/);
    assert.match(rendered[0], /data-profile-tick12="0"/);
    assert.match(rendered[1], /data-binding-value="432Hz"/);
    assert.match(rendered[1], /data-profile-generation="13"/);
    assert.match(rendered[1], /data-profile-tick12="1"/);
});

test('integrated plugin browser sources do not open direct profile subscriptions', () => {
    const pluginBrowserRoots = [
        '../../plugin-integrated-1-2-3/src/browser',
        '../../plugin-integrated-4-5-0/src/browser'
    ].map(root => path.resolve(testDir, root));
    const offenders = [];

    for (const root of pluginBrowserRoots) {
        for (const file of walkSourceFiles(root)) {
            const content = fs.readFileSync(file, 'utf8');
            if (/\bbridge\.onProfile\b|\bonProfileAdvance\b/.test(content)) {
                offenders.push(path.relative(process.cwd(), file));
            }
        }
    }

    assert.deepEqual(offenders, []);
});

function walkSourceFiles(root) {
    const files = [];
    for (const entry of fs.readdirSync(root)) {
        const full = path.join(root, entry);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            files.push(...walkSourceFiles(full));
        } else if (/\.(?:ts|tsx|js|mjs)$/.test(entry)) {
            files.push(full);
        }
    }
    return files;
}
