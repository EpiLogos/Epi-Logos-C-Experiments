import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(import.meta.url);

const extensionRoot = path.resolve(
    import.meta.dirname,
    '../kernel-bridge'
);

test('kernel-bridge declares a Theia frontend and backend extension boundary', async () => {
    const pkg = JSON.parse(
        await readFile(path.join(extensionRoot, 'package.json'), 'utf8')
    );
    assert.deepEqual(pkg.theiaExtensions, [
        {
            frontend: 'lib/browser/frontend-module',
            backend: 'lib/node/backend-module'
        }
    ]);

    const frontendSource = await readFile(
        path.join(extensionRoot, 'src/browser/kernel-bridge-runtime-source.ts'),
        'utf8'
    );
    assert.match(frontendSource, /KERNEL_BRIDGE_BACKEND_SERVICE/);
    assert.doesNotMatch(frontendSource, /new WebSocket\s*\(/);
    assert.doesNotMatch(frontendSource, /ws:\/\/127\.0\.0\.1/);
    assert.doesNotMatch(frontendSource, /require\(['"]ws['"]\)/);

    const backendSource = await readFile(
        path.join(extensionRoot, 'src/node/kernel-bridge-backend-service.ts'),
        'utf8'
    );
    assert.match(backendSource, /createGatewayWebSocket/);
    assert.match(backendSource, /EPI_GATEWAY_URL/);
    assert.match(backendSource, /notifyConnectionStatus/);
    assert.match(backendSource, /notifyProfile/);
});

test('backend-pushed events drive the compiled KernelBridgeAPI singleton', async () => {
    const { KernelBridgeAPIImpl } = require(
        '../kernel-bridge/lib/browser/kernel-bridge-api.js'
    );
    const { KernelBridgeRuntimeClient, KernelBridgeRuntimeSource } = require(
        '../kernel-bridge/lib/browser/kernel-bridge-runtime-source.js'
    );

    const adapter = new KernelBridgeAPIImpl();
    const client = new KernelBridgeRuntimeClient();
    client.adapter = adapter;

    const seenProfiles = [];
    const seenStatuses = [];
    adapter.onProfile(profile => seenProfiles.push(profile));
    adapter.onConnectionChange(status => seenStatuses.push(status));

    client.notifyConnectionStatus({
        connected: true,
        state: 'connected',
        mode: 'lite',
        subscriptionMode: 'lite',
        reason: 'native backend socket connected',
        profileGeneration: null
    });
    client.notifyProfile({
        generation: 77,
        cachedAtMs: 1234,
        stale: false,
        stalenessMs: 0,
        privacyClass: 'safe-public-current-kernel-tick',
        profile: {
            pointerAnchor: 'bimba://#5-3',
            capabilities: ['readCurrentProfile']
        }
    });

    await new Promise(resolve => setImmediate(resolve));

    assert.equal(adapter.snapshot.upstreamSubscriptionCount, 1);
    assert.equal(adapter.cachedProfile.generation, 77);
    assert.equal(seenProfiles.at(-1).generation, 77);
    assert.equal(seenStatuses.at(-1).reason, 'native backend socket connected');

    const serviceCalls = {
        start: [],
        modes: [],
        capabilities: []
    };
    const source = new KernelBridgeRuntimeSource();
    source.adapter = adapter;
    source.service = {
        start: async mode => {
            serviceCalls.start.push(mode);
        },
        stop: async () => undefined,
        requestSubscriptionMode: async mode => {
            serviceCalls.modes.push(mode);
        },
        invokeCapability: async request => {
            serviceCalls.capabilities.push(request.method);
            return {
                method: request.method,
                gatewayMethod: 's3.test.echo',
                sessionKey: request.sessionKey,
                profileGeneration: request.profileGeneration,
                privacyClass: 'public',
                provenanceHandles: request.provenanceHandles,
                vak: {
                    vakAddress: { cpf: '', ct: '', cp: '', cf: '', cfp: '', cs: '' },
                    routeLineage: []
                },
                artifact: { ok: true }
            };
        }
    };

    source.start();
    await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(serviceCalls.start, ['lite']);

    const receipt = await adapter.invokeCapability({
        method: 'invokeGatewayRpc',
        sessionKey: 'session-05-t3',
        params: { gatewayMethod: 's3.test.echo' },
        profileGeneration: 77,
        provenanceHandles: ['handle://profile/77'],
        vak: null
    });
    assert.equal(receipt.artifact.ok, true);
    assert.deepEqual(serviceCalls.capabilities, ['invokeGatewayRpc']);

    adapter.requestSubscriptionMode('full');
    await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(serviceCalls.modes, ['full']);
});

test('compiled KernelBridgeAPI exposes frontend-safe S3 stream subscriptions', async () => {
    const { KernelBridgeAPIImpl } = require(
        '../kernel-bridge/lib/browser/kernel-bridge-api.js'
    );

    const adapter = new KernelBridgeAPIImpl();
    const worldClock = [];
    const presence = [];
    const archetypes = [];
    adapter.subscribeWorldClock(delta => worldClock.push(delta));
    adapter.subscribePratibimbaPresence(delta => presence.push(delta));
    adapter.subscribeSharedArchetypeEvents(delta => archetypes.push(delta));

    adapter.fireEvent({
        kind: 'observability',
        emittedAtMs: 2000,
        source: 'kernel-bridge',
        profileGeneration: 88,
        privacyClass: 'safe-public-current-kernel-tick',
        payload: {
            tableName: 'world_clock',
            inserts: [{
                world_clock_id: 'gateway-main',
                tick: 42,
                cadence: '1hz'
            }],
            deletes: []
        }
    });
    adapter.fireEvent({
        kind: 'observability',
        emittedAtMs: 2001,
        source: 'kernel-bridge',
        profileGeneration: 88,
        privacyClass: 'protected-reference-only',
        payload: {
            tableName: 'pratibimba_presence',
            inserts: [{
                identity_handle: 'id-handle-blake3',
                quintessence_hash: 'quint-blake3',
                graphiti_namespace_ref: 'graphiti://namespace/day',
                privacy_class: 'protected-reference-only'
            }],
            deletes: []
        }
    });
    adapter.fireEvent({
        kind: 'observability',
        emittedAtMs: 2002,
        source: 'kernel-bridge',
        profileGeneration: 88,
        privacyClass: 'public-opt-in-archetype',
        payload: {
            tableName: 'shared_archetype_event',
            inserts: [{
                event_id: 'archetype-1',
                aspect_grid_cell: 4242,
                opt_in_consent: true
            }],
            deletes: []
        }
    });

    assert.equal(worldClock.length, 1);
    assert.equal(worldClock[0].table, 'world_clock');
    assert.equal(worldClock[0].inserts[0].row.tick, 42);
    assert.equal(worldClock[0].inserts[0].profileGeneration, 88);
    assert.equal(presence.length, 1);
    assert.equal(presence[0].inserts[0].row.identity_handle, 'id-handle-blake3');
    assert.equal(archetypes.length, 1);
    assert.equal(archetypes[0].inserts[0].row.opt_in_consent, true);

    const replayed = [];
    adapter.subscribeWorldClock(delta => replayed.push(delta));
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(replayed.length, 1);
    assert.equal(replayed[0].resync, true);
    assert.equal(replayed[0].inserts[0].row.world_clock_id, 'gateway-main');

    adapter.fireEvent({
        kind: 'observability',
        emittedAtMs: 2003,
        source: 'kernel-bridge',
        profileGeneration: 88,
        privacyClass: 'safe-public-current-kernel-tick',
        payload: {
            tableName: 'world_clock',
            protocolMismatch: 'clock_protocol_version expected v2 but received v1'
        }
    });
    assert.equal(
        worldClock.at(-1).protocolMismatch,
        'clock_protocol_version expected v2 but received v1'
    );
});

test('compiled KernelBridgeAPI drops forbidden private stream row bodies', async () => {
    const { KernelBridgeAPIImpl } = require(
        '../kernel-bridge/lib/browser/kernel-bridge-api.js'
    );

    const adapter = new KernelBridgeAPIImpl();
    const presence = [];
    const archetypes = [];
    adapter.subscribePratibimbaPresence(delta => presence.push(delta));
    adapter.subscribeSharedArchetypeEvents(delta => archetypes.push(delta));

    adapter.fireEvent({
        kind: 'observability',
        emittedAtMs: 3000,
        source: 'kernel-bridge',
        profileGeneration: 90,
        privacyClass: 'protected-reference-only',
        payload: {
            tableName: 'pratibimba_presence',
            inserts: [{
                identity_handle: 'safe-handle',
                rawBirthData: 'must never reach the renderer'
            }],
            deletes: []
        }
    });
    adapter.fireEvent({
        kind: 'observability',
        emittedAtMs: 3001,
        source: 'kernel-bridge',
        profileGeneration: 90,
        privacyClass: 'public-opt-in-archetype',
        payload: {
            tableName: 'shared_archetype_event',
            inserts: [{
                event_id: 'unsafe',
                graphitiEpisodeBody: 'protected memory body'
            }],
            deletes: []
        }
    });

    assert.deepEqual(presence, []);
    assert.deepEqual(archetypes, []);
    assert.equal(adapter.snapshot.readiness.latestRowCache.pratibimba_presence, 0);
    assert.equal(adapter.snapshot.readiness.latestRowCache.shared_archetype_event, 0);
});
