#!/usr/bin/env node
import assert from 'node:assert/strict';
import http from 'node:http';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { GatewayReadinessSource } = require('../extensions/kernel-bridge-readiness/lib/browser/gateway-readiness-source.js');

function listen(server) {
    return new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', () => {
            const address = server.address();
            if (!address || typeof address === 'string') {
                reject(new Error('server did not expose a TCP address'));
                return;
            }
            resolve(address.port);
        });
    });
}

function close(server) {
    return new Promise((resolve, reject) => {
        server.close(err => (err ? reject(err) : resolve()));
    });
}

const server = http.createServer((request, response) => {
    assert.equal(request.method, 'GET');
    assert.equal(request.url, '/health');
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({
        readiness: 'ready_public_current',
        reason: 'test gateway reports ready',
        profileGeneration: 42,
        blockerIds: ['s2.graph']
    }));
});

const port = await listen(server);
try {
    const source = new GatewayReadinessSource(`http://127.0.0.1:${port}`);
    const snapshot = await source.fetch();
    assert.equal(snapshot.state, 'ready_public_current');
    assert.equal(snapshot.reason, 'test gateway reports ready');
    assert.equal(snapshot.profileGeneration, 42);
    assert.deepEqual(snapshot.blockerIds, ['s2.graph']);
    assert.equal(snapshot.gatewayReachable, true);
} finally {
    await close(server);
}

const unavailable = await new GatewayReadinessSource(`http://127.0.0.1:${port}`).fetch();
assert.equal(unavailable.state, 'bridge_unavailable');
assert.equal(unavailable.gatewayReachable, false);
assert.match(unavailable.reason, /gateway unreachable:/);

console.log('kernel bridge readiness source verified');
