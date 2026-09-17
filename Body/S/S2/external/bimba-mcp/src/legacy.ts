#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';
import { authorityFromEnvironment } from './application/service.js';
import {
  LEGACY_PROTOCOL_REVISIONS,
  isModernProtocolRequest,
  requiredPermissionForLegacyRequest,
  type JsonRpcRequestLike,
} from './legacy-policy.js';

const legacyImplementation = fileURLToPath(new URL('./index.js', import.meta.url));
const child = spawn(process.execPath, [legacyImplementation], {
  env: process.env,
  stdio: ['pipe', 'pipe', 'pipe'],
});

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

function send(message: unknown): void {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function requestId(request: JsonRpcRequestLike): string | number | null {
  const id = request.id;
  if (typeof id === 'string' || typeof id === 'number' || id === null) return id;
  return null;
}

function denyModern(request: JsonRpcRequestLike): void {
  send({
    jsonrpc: '2.0',
    id: requestId(request),
    error: {
      code: -32022,
      message: 'Unsupported protocol version for the explicit Bimba legacy adapter',
      data: {
        supported: [...LEGACY_PROTOCOL_REVISIONS],
        requested: '2026-07-28',
      },
    },
  });
}

function denyAuthority(request: JsonRpcRequestLike, required: string): void {
  send({
    jsonrpc: '2.0',
    id: requestId(request),
    result: {
      content: [{
        type: 'text',
        text: `Bimba authority '${required}' is required for this legacy tool call`,
      }],
      isError: true,
    },
  });
}

const input = createInterface({ input: process.stdin, crlfDelay: Infinity });
input.on('line', line => {
  if (!line.trim()) return;

  let parsed: unknown;
  try {
    parsed = JSON.parse(line);
  } catch {
    // Preserve the old implementation's parse/error behavior for malformed
    // legacy traffic rather than inventing a second parser contract here.
    child.stdin.write(`${line}\n`);
    return;
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    child.stdin.write(`${line}\n`);
    return;
  }

  const request = parsed as JsonRpcRequestLike;

  // Never let one transport era be reinterpreted as the other.
  if (isModernProtocolRequest(request)) {
    denyModern(request);
    return;
  }

  const required = requiredPermissionForLegacyRequest(request);
  if (required) {
    const authority = authorityFromEnvironment();
    if (!authority.permissions.has(required)) {
      denyAuthority(request, required);
      return;
    }
  }

  child.stdin.write(`${line}\n`);
});

input.on('close', () => child.stdin.end());

child.on('exit', code => {
  process.exitCode = code ?? 1;
});

child.on('error', error => {
  console.error('Failed to start Bimba legacy implementation:', error.message);
  process.exitCode = 1;
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    if (!child.killed) child.kill(signal);
  });
}
