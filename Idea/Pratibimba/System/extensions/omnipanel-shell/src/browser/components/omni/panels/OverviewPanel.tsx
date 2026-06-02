import type { GatewayHelloOk } from '../../../controllers/epi-claw/gateway-client';
import { formatTs } from './panelUtils';

type OverviewPanelProps = {
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'error';
  connectionError: string | null;
  hello: GatewayHelloOk | null;
  gatewayUrl: string;
  gatewayToken: string | null;
  gatewayPassword: string;
  sessionKey: string;
  sessionsCount: number;
  channelsCount: number;
  channelsLastSuccess: number | null;
  logsCursor: number | null;
  onSetGatewayUrl: (value: string) => void;
  onSetGatewayToken: (value: string | null) => void;
  onSetGatewayPassword: (value: string) => void;
  onSetSessionKey: (value: string) => void;
  onConnect: () => void;
  onRefresh: () => void;
};

export function OverviewPanel({
  connectionState,
  connectionError,
  hello,
  gatewayUrl,
  gatewayToken,
  gatewayPassword,
  sessionKey,
  sessionsCount,
  channelsCount,
  channelsLastSuccess,
  logsCursor,
  onSetGatewayUrl,
  onSetGatewayToken,
  onSetGatewayPassword,
  onSetSessionKey,
  onConnect,
  onRefresh,
}: OverviewPanelProps) {
  const authFailed = connectionError
    ? /unauthorized|connect failed|forbidden|auth/i.test(connectionError)
    : false;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Gateway Overview</h3>
        <div className="flex gap-2">
          <button
            onClick={onConnect}
            className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)] hover:bg-white/10"
          >
            Connect
          </button>
          <button
            onClick={onRefresh}
            className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)] hover:bg-white/10"
            disabled={connectionState !== 'connected'}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs text-[var(--text-tertiary)] space-y-1">
          <span>WebSocket URL</span>
          <input
            value={gatewayUrl}
            onChange={(e) => onSetGatewayUrl(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-black/30 border border-[var(--border-subtle)] rounded"
            placeholder="ws://localhost:18794"
          />
        </label>
        <label className="text-xs text-[var(--text-tertiary)] space-y-1">
          <span>Gateway Token</span>
          <input
            value={gatewayToken ?? ''}
            onChange={(e) => onSetGatewayToken(e.target.value || null)}
            className="w-full px-3 py-2 text-xs bg-black/30 border border-[var(--border-subtle)] rounded"
            placeholder="OPENCLAW_GATEWAY_TOKEN"
          />
        </label>
        <label className="text-xs text-[var(--text-tertiary)] space-y-1">
          <span>Password (not stored)</span>
          <input
            type="password"
            value={gatewayPassword}
            onChange={(e) => onSetGatewayPassword(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-black/30 border border-[var(--border-subtle)] rounded"
            placeholder="system/shared gateway password"
          />
        </label>
        <label className="text-xs text-[var(--text-tertiary)] space-y-1">
          <span>Default Session Key</span>
          <input
            value={sessionKey}
            onChange={(e) => onSetSessionKey(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-black/30 border border-[var(--border-subtle)] rounded"
          />
        </label>
      </div>

      {connectionError && (
        <div className="text-xs p-2 rounded border border-red-500/40 bg-red-500/10 text-red-300">
          <div>{connectionError}</div>
          {authFailed && (
            <div className="mt-1 text-red-200">
              Auth likely failed. Provide token or password, then click Connect.
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded border border-[var(--border-subtle)] bg-white/5">
          <div className="text-[10px] uppercase text-[var(--text-tertiary)]">Protocol</div>
          <div className="text-sm text-[var(--text-primary)]">{hello?.protocol ?? 'n/a'}</div>
        </div>
        <div className="p-3 rounded border border-[var(--border-subtle)] bg-white/5">
          <div className="text-[10px] uppercase text-[var(--text-tertiary)]">Role</div>
          <div className="text-sm text-[var(--text-primary)]">{hello?.auth?.role ?? 'operator'}</div>
        </div>
        <div className="p-3 rounded border border-[var(--border-subtle)] bg-white/5">
          <div className="text-[10px] uppercase text-[var(--text-tertiary)]">Sessions</div>
          <div className="text-sm text-[var(--text-primary)]">{sessionsCount}</div>
        </div>
        <div className="p-3 rounded border border-[var(--border-subtle)] bg-white/5">
          <div className="text-[10px] uppercase text-[var(--text-tertiary)]">Channels</div>
          <div className="text-sm text-[var(--text-primary)]">{channelsCount}</div>
        </div>
      </div>

      <div className="text-xs text-[var(--text-tertiary)] space-y-1">
        <div>Connected scopes: {(hello?.auth?.scopes ?? []).join(', ') || 'n/a'}</div>
        <div>Last channels refresh: {channelsLastSuccess ? formatTs(channelsLastSuccess) : 'n/a'}</div>
        <div>Last logs cursor: {logsCursor ?? 'n/a'}</div>
      </div>
    </div>
  );
}
