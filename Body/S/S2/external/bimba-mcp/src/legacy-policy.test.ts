import { describe, expect, it } from 'vitest';
import {
  advertisedProtocolRevision,
  isModernProtocolRequest,
  requiredPermissionForLegacyRequest,
  requiredPermissionForLegacyTool,
} from './legacy-policy.js';

describe('legacy MCP policy', () => {
  it('detects 2026-era traffic by discovery or required request metadata', () => {
    expect(isModernProtocolRequest({ method: 'server/discover' })).toBe(true);
    const request = {
      method: 'tools/list',
      params: {
        _meta: {
          'io.modelcontextprotocol/protocolVersion': '2026-07-28',
          'io.modelcontextprotocol/clientCapabilities': {},
        },
      },
    };
    expect(advertisedProtocolRevision(request)).toBe('2026-07-28');
    expect(isModernProtocolRequest(request)).toBe(true);
  });

  it('does not reinterpret legacy initialize traffic as modern', () => {
    expect(isModernProtocolRequest({
      method: 'initialize',
      params: { protocolVersion: '2025-11-25', capabilities: {} },
    })).toBe(false);
  });

  it('classifies mutation authority from tool plus arguments, preventing method substitution', () => {
    expect(requiredPermissionForLegacyTool('graph_embed', {})).toBe('bimba:read');
    expect(requiredPermissionForLegacyTool('graph_embed', { store_for: 'uuid' })).toBe('bimba:write');
    expect(requiredPermissionForLegacyTool('graph_sync')).toBe('bimba:write');
    expect(requiredPermissionForLegacyTool('graph_chunk')).toBe('bimba:write');
    expect(requiredPermissionForLegacyTool('graph_admin')).toBe('bimba:admin');
    expect(requiredPermissionForLegacyTool('graph_query')).toBe('bimba:read');
  });

  it('only grants tool-derived authority on the tools/call method', () => {
    expect(requiredPermissionForLegacyRequest({
      method: 'resources/read',
      params: { name: 'graph_admin', arguments: {} },
    })).toBeUndefined();

    expect(requiredPermissionForLegacyRequest({
      method: 'tools/call',
      params: { name: 'graph_admin', arguments: {} },
    })).toBe('bimba:admin');
  });
});
