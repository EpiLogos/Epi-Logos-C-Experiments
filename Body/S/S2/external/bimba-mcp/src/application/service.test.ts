import { describe, expect, it, vi } from 'vitest';
import { BimbaAuthorizationError, type BimbaAuthority, type BimbaBackend } from './contracts.js';
import { BimbaApplicationService } from './service.js';

function authority(...permissions: Array<'bimba:read' | 'bimba:write' | 'bimba:admin'>): BimbaAuthority {
  return {
    runtimePrincipal: 'test-principal',
    permissions: new Set(permissions),
    agentIdentity: 'agent/anuttara',
  };
}

function fixture(): { service: BimbaApplicationService; backend: BimbaBackend } {
  const backend: BimbaBackend = {
    queryByCoordinate: vi.fn(async coordinate => ({ coordinate })),
    search: vi.fn(async query => ({ query, results: [] })),
    embed: vi.fn(async (_text, _taskType, _dimensions, storeFor) => ({ stored: true, storeFor })),
  };
  return { service: new BimbaApplicationService(backend), backend };
}

describe('BimbaApplicationService', () => {
  it('reads through a transport-neutral BimbaRef and records non-promoting provenance', async () => {
    const { service } = fixture();
    const result = await service.get(
      { kind: 'coordinate', value: 'M0' },
      { includeNested: false, limit: 5 },
      authority('bimba:read')
    );

    expect(result.data).toEqual({ coordinate: 'M0' });
    expect(result.provenance).toMatchObject({
      source: 'bimba',
      operation: 'bimba.get',
      runtimePrincipal: 'test-principal',
      agentIdentity: 'agent/anuttara',
      promotion: 'none',
    });
  });

  it('denies mutation before invoking the backend', async () => {
    const { service, backend } = fixture();

    await expect(service.storeEmbedding(
      { ref: { kind: 'uuid', value: 'node-1' }, text: 'content' },
      authority('bimba:read')
    )).rejects.toBeInstanceOf(BimbaAuthorizationError);

    expect(backend.embed).not.toHaveBeenCalled();
  });

  it('does not treat agent identity as runtime authority', async () => {
    const { service } = fixture();
    const claimedAgent: BimbaAuthority = {
      runtimePrincipal: 'unprivileged-runtime',
      permissions: new Set(['bimba:read']),
      agentIdentity: 'agent/admin-looking-name',
    };

    await expect(service.storeEmbedding(
      { ref: { kind: 'uuid', value: 'node-1' }, text: 'content' },
      claimedAgent
    )).rejects.toMatchObject({ required: 'bimba:write' });
  });

  it('authorises every request from its explicit authority, not hidden prior state', async () => {
    const { service, backend } = fixture();

    await service.storeEmbedding(
      { ref: { kind: 'uuid', value: 'node-1' }, text: 'first' },
      authority('bimba:write')
    );

    await expect(service.storeEmbedding(
      { ref: { kind: 'uuid', value: 'node-1' }, text: 'second' },
      authority('bimba:read')
    )).rejects.toBeInstanceOf(BimbaAuthorizationError);

    expect(backend.embed).toHaveBeenCalledTimes(1);
  });
});
