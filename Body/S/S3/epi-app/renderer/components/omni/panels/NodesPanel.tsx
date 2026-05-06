import type { DevicesState, NodesState } from '../../../controllers/epi-claw/controllers';
import { shortJson } from './panelUtils';

type NodesPanelProps = {
  nodes: NodesState;
  devices: DevicesState;
  onRefreshNodes: () => void;
  onRefreshDevices: () => void;
  onApprovePairing: (requestId: string) => void;
  onRejectPairing: (requestId: string) => void;
  onRotateToken: (params: { deviceId: string; role: string; scopes?: string[] }) => void;
  onRevokeToken: (params: { deviceId: string; role: string }) => void;
};

export function NodesPanel({
  nodes,
  devices,
  onRefreshNodes,
  onRefreshDevices,
  onApprovePairing,
  onRejectPairing,
  onRotateToken,
  onRevokeToken,
}: NodesPanelProps) {
  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Nodes</h3>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)]" onClick={onRefreshNodes} disabled={nodes.nodesLoading}>Refresh nodes</button>
          <button className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)]" onClick={onRefreshDevices} disabled={devices.devicesLoading}>Refresh devices</button>
        </div>
      </div>
      {nodes.nodesError && <div className="text-xs text-red-300">{nodes.nodesError}</div>}
      {devices.devicesError && <div className="text-xs text-red-300">{devices.devicesError}</div>}

      <div className="p-3 rounded border border-[var(--border-subtle)] bg-white/5 space-y-2">
        <div className="text-xs font-semibold">Device Pairing</div>
        <div className="text-[10px] text-[var(--text-tertiary)]">
          pending {(devices.devicesList?.pending ?? []).length} · paired {(devices.devicesList?.paired ?? []).length}
        </div>
        {(devices.devicesList?.pending ?? []).length === 0 && <div className="text-[10px] text-[var(--text-tertiary)] italic">No pending requests.</div>}
        {(devices.devicesList?.pending ?? []).map((req) => (
          <div key={req.requestId} className="p-2 rounded border border-[var(--border-subtle)] bg-black/20 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] font-semibold truncate">{req.displayName || req.deviceId}</div>
              <div className="text-[10px] text-[var(--text-tertiary)] truncate">{req.deviceId} · role {req.role || 'n/a'} · {req.remoteIp || 'n/a'}</div>
            </div>
            <div className="flex gap-1">
              <button className="text-[10px] px-2 py-1 rounded border border-[var(--border-subtle)]" onClick={() => onApprovePairing(req.requestId)} disabled={devices.devicesLoading}>Approve</button>
              <button className="text-[10px] px-2 py-1 rounded border border-red-500/40 text-red-300" onClick={() => onRejectPairing(req.requestId)} disabled={devices.devicesLoading}>Reject</button>
            </div>
          </div>
        ))}
        {(devices.devicesList?.paired ?? []).map((dev) => (
          <div key={dev.deviceId} className="p-2 rounded border border-[var(--border-subtle)] bg-black/20 space-y-1">
            <div className="text-[10px] font-semibold">{dev.displayName || dev.deviceId}</div>
            <div className="text-[10px] text-[var(--text-tertiary)]">{dev.deviceId} · roles {(dev.roles ?? []).join(', ') || 'n/a'} · scopes {(dev.scopes ?? []).join(', ') || 'n/a'}</div>
            {(dev.tokens ?? []).map((token, idx) => (
              <div key={`${dev.deviceId}-${token.role}-${idx}`} className="text-[10px] flex items-center justify-between gap-2">
                <span>{token.role} · {(token.scopes ?? []).join(', ') || 'n/a'} · {token.revokedAtMs ? 'revoked' : 'active'}</span>
                <span className="flex gap-1">
                  <button className="px-2 py-0.5 rounded border border-[var(--border-subtle)]" onClick={() => onRotateToken({ deviceId: dev.deviceId, role: token.role, scopes: token.scopes })}>Rotate</button>
                  {!token.revokedAtMs && <button className="px-2 py-0.5 rounded border border-red-500/40 text-red-300" onClick={() => onRevokeToken({ deviceId: dev.deviceId, role: token.role })}>Revoke</button>}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {nodes.nodes.length === 0 && <div className="text-xs text-[var(--text-tertiary)] italic">No nodes found.</div>}
        {nodes.nodes.map((node, idx) => (
          <pre key={idx} className="text-[10px] p-3 rounded border border-[var(--border-subtle)] bg-black/30 overflow-x-auto custom-scrollbar">{shortJson(node)}</pre>
        ))}
      </div>
    </div>
  );
}
