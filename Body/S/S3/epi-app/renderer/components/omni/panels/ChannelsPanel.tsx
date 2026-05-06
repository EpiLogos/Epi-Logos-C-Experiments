import { useEffect, useMemo, useState } from 'react';
import type { ChannelAccountSnapshot } from '../../../controllers/epi-claw/types';
import type { ChannelsState, ConfigState } from '../../../controllers/epi-claw/controllers';
import { OmniButton } from '../ui/button';
import { OmniCard } from '../ui/card';

const PRIORITY_CHANNELS = ['whatsapp', 'telegram', 'discord', 'signal', 'imessage', 'slack', 'nostr'];

function boolLabel(label: string, value: boolean | null | undefined) {
  if (value == null) return `${label}: n/a`;
  return `${label}: ${value ? 'yes' : 'no'}`;
}

function sourceLabel(account: ChannelAccountSnapshot): string {
  const source =
    account.tokenSource ??
    account.botTokenSource ??
    account.appTokenSource ??
    account.credentialSource ??
    null;
  return source ? `source: ${source}` : 'source: unknown';
}

function formatTimestamp(value: unknown): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'n/a';
  return new Date(value).toLocaleString();
}

function boolChip(label: string, value: unknown): string {
  if (typeof value !== 'boolean') return `${label}: n/a`;
  return `${label}: ${value ? 'yes' : 'no'}`;
}

function channelSort(order: string[]) {
  return [...order].sort((a, b) => {
    const ai = PRIORITY_CHANNELS.indexOf(a);
    const bi = PRIORITY_CHANNELS.indexOf(b);
    const pa = ai === -1 ? 999 : ai;
    const pb = bi === -1 ? 999 : bi;
    if (pa !== pb) return pa - pb;
    return a.localeCompare(b);
  });
}

function parseConfig(configRaw: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(configRaw);
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

function isChannelActive(
  channelId: string,
  channels: ChannelsState,
  configChannels: Record<string, unknown> | null,
): boolean {
  const status = (channels.channelsSnapshot?.channels?.[channelId] ?? null) as Record<string, unknown> | null;
  const accounts = channels.channelsSnapshot?.channelAccounts?.[channelId] ?? [];

  const configuredInConfig = Boolean(configChannels?.[channelId]);
  const configured = typeof status?.configured === 'boolean' && status.configured;
  const accountConfigured = accounts.some((account) => account.configured);

  return configuredInConfig || configured || accountConfigured;
}

type ChannelsPanelProps = {
  channels: ChannelsState;
  config: ConfigState;
  onRefresh: (probe: boolean) => void;
  onStartWhatsAppLogin: () => void;
  onWaitWhatsAppLogin: () => void;
  onLogoutWhatsApp: () => void;
  onLoadConfig: () => void;
  onSaveConfig: () => void;
  onApplyConfig: () => void;
  onSetRawConfig: (raw: string) => void;
};

export function ChannelsPanel({
  channels,
  config,
  onRefresh,
  onStartWhatsAppLogin,
  onWaitWhatsAppLogin,
  onLogoutWhatsApp,
  onLoadConfig,
  onSaveConfig,
  onApplyConfig,
  onSetRawConfig,
}: ChannelsPanelProps) {
  const [showAllChannels, setShowAllChannels] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [channelDraft, setChannelDraft] = useState('{}');
  const [channelDraftError, setChannelDraftError] = useState<string | null>(null);

  const sortedOrder = channelSort(channels.channelsSnapshot?.channelOrder ?? []);
  const labels = channels.channelsSnapshot?.channelLabels ?? {};
  const details = channels.channelsSnapshot?.channelDetailLabels ?? {};
  const accounts = channels.channelsSnapshot?.channelAccounts ?? {};
  const defaultAccount = channels.channelsSnapshot?.channelDefaultAccountId ?? {};
  const meta = channels.channelsSnapshot?.channelMeta ?? [];
  const parsedConfig = parseConfig(config.configRaw);
  const channelConfigRoot = parsedConfig?.channels && typeof parsedConfig.channels === 'object'
    ? (parsedConfig.channels as Record<string, unknown>)
    : null;

  const visibleOrder = useMemo(() => {
    if (showAllChannels) return sortedOrder;
    return sortedOrder.filter((id) => isChannelActive(id, channels, channelConfigRoot));
  }, [channelConfigRoot, channels, showAllChannels, sortedOrder]);
  const showWhatsAppControls = showAllChannels || isChannelActive('whatsapp', channels, channelConfigRoot);

  const activeChannel = selectedChannelId ?? visibleOrder[0] ?? null;
  const configActionButtonClass = (action: 'save' | 'apply') => {
    const isLatest = config.configLastAction === action;
    const status = isLatest ? config.configLastActionStatus : null;
    if (status === 'success') {
      return 'border-emerald-400/60 shadow-[0_0_0_1px_rgba(52,211,153,0.25)] text-emerald-100';
    }
    if (status === 'error') {
      return 'border-red-400/60 shadow-[0_0_0_1px_rgba(248,113,113,0.25)] text-red-100';
    }
    return '';
  };
  const currentChannelConfig = activeChannel && channelConfigRoot
    ? channelConfigRoot[activeChannel]
    : undefined;

  useEffect(() => {
    const nextDraft =
      activeChannel
        ? JSON.stringify(currentChannelConfig ?? {}, null, 2)
        : '{}';
    setChannelDraft(nextDraft);
    setChannelDraftError(null);
  }, [activeChannel, currentChannelConfig, config.configRaw]);

  const commitChannelDraft = (nextDraft: string) => {
    if (!activeChannel) return;
    const root = parseConfig(config.configRaw);
    if (!root) {
      setChannelDraftError('Global config JSON is invalid. Load/fix it before channel edits.');
      return;
    }

    let parsedNext: unknown;
    try {
      parsedNext = nextDraft.trim().length === 0 ? {} : JSON.parse(nextDraft);
    } catch {
      setChannelDraftError('Channel JSON draft is invalid. Fix syntax and try again.');
      return;
    }

    const channelsNode = root.channels && typeof root.channels === 'object'
      ? { ...(root.channels as Record<string, unknown>) }
      : {};

    channelsNode[activeChannel] = parsedNext;
    const nextRoot = { ...root, channels: channelsNode };
    onSetRawConfig(`${JSON.stringify(nextRoot, null, 2)}\n`);
    setChannelDraftError(null);
  };

  return (
    <div className="p-6 space-y-3 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_55%)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Channels</h3>
          <div className="text-[11px] text-[var(--text-tertiary)]">Configured channels with probe health and per-channel config controls</div>
        </div>
        <div className="flex gap-2">
          <OmniButton onClick={() => onRefresh(false)} disabled={channels.channelsLoading}>Refresh</OmniButton>
          <OmniButton onClick={() => onRefresh(true)} disabled={channels.channelsLoading}>Probe All</OmniButton>
          <OmniButton onClick={() => setShowAllChannels((prev) => !prev)} variant="ghost">
            {showAllChannels ? 'Configured Only' : 'Show All'}
          </OmniButton>
        </div>
      </div>

      {channels.channelsError && <OmniCard className="p-2.5 text-xs border-red-500/40 text-red-300">{channels.channelsError}</OmniCard>}

      {showWhatsAppControls && (
        <OmniCard className="p-3 bg-white/[0.04] space-y-2">
          <div className="text-xs font-semibold">WhatsApp Login</div>
          <div className="flex gap-2">
            <OmniButton className="text-[10px] px-2 py-1" onClick={onStartWhatsAppLogin} disabled={channels.whatsappBusy}>Start</OmniButton>
            <OmniButton className="text-[10px] px-2 py-1" onClick={onWaitWhatsAppLogin} disabled={channels.whatsappBusy}>Wait</OmniButton>
            <OmniButton className="text-[10px] px-2 py-1" onClick={onLogoutWhatsApp} disabled={channels.whatsappBusy}>Logout</OmniButton>
          </div>
          {channels.whatsappLoginMessage && <div className="text-xs text-[var(--text-tertiary)]">{channels.whatsappLoginMessage}</div>}
          {channels.whatsappLoginQrDataUrl && <img src={channels.whatsappLoginQrDataUrl} alt="WhatsApp QR" className="w-40 h-40 bg-white p-2 rounded" />}
        </OmniCard>
      )}

      {meta.length > 0 && (
        <div className="text-[10px] text-[var(--text-tertiary)] flex flex-wrap gap-1.5">
          {meta.map((entry) => (
            <span key={entry.id} className="px-2 py-0.5 rounded border border-[var(--border-subtle)] bg-black/20">
              {entry.label}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
        {visibleOrder.length === 0 && (
          <div className="text-xs text-[var(--text-tertiary)] italic">No configured channels detected yet. Toggle “Show All” to inspect discovered channels.</div>
        )}

        {visibleOrder.map((id) => {
          const channelAccounts = accounts[id] ?? [];
          const online = channelAccounts.filter((account) => account.connected || account.running).length;
          const status = (channels.channelsSnapshot?.channels?.[id] ?? null) as Record<string, unknown> | null;
          const statusProbe = status?.probe;
          const statusLastError = typeof status?.lastError === 'string' ? status.lastError : null;
          const statusMode = typeof status?.mode === 'string' ? status.mode : null;
          const statusLastProbeAt = status?.lastProbeAt;
          const statusLastStartAt = status?.lastStartAt;
          const statusLastConnectedAt = status?.lastConnectedAt;

          return (
            <OmniCard key={id} className="p-3 bg-white/[0.03] space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold">{labels[id] ?? id}</div>
                  {details[id] && <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{details[id]}</div>}
                </div>
                <div className="text-[10px] text-[var(--text-tertiary)]">
                  accounts: {channelAccounts.length} · online: {online}
                </div>
              </div>

              <div className="text-[10px] text-[var(--text-tertiary)]">
                default account: {defaultAccount[id] ?? 'none'}
              </div>

              <div className="flex flex-wrap gap-1 text-[10px] text-[var(--text-secondary)]">
                <span className="px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">{boolChip('configured', status?.configured)}</span>
                <span className="px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">{boolChip('running', status?.running)}</span>
                <span className="px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">{boolChip('connected', status?.connected)}</span>
                <span className="px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">mode: {statusMode ?? 'n/a'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-[10px] text-[var(--text-tertiary)]">
                <div>last probe: {formatTimestamp(statusLastProbeAt)}</div>
                <div>last start: {formatTimestamp(statusLastStartAt)}</div>
                <div>last connect: {formatTimestamp(statusLastConnectedAt)}</div>
              </div>

              {statusLastError && (
                <div className="text-[10px] text-red-300 border border-red-500/30 bg-red-500/10 rounded px-2 py-1">
                  {statusLastError}
                </div>
              )}

              {statusProbe && (
                <details className="text-[10px] rounded border border-[var(--border-subtle)] bg-black/30 p-1.5">
                  <summary className="cursor-pointer text-[var(--text-secondary)]">Channel probe</summary>
                  <pre className="mt-1 whitespace-pre-wrap break-words text-[var(--text-tertiary)]">
                    {JSON.stringify(statusProbe, null, 2)}
                  </pre>
                </details>
              )}

              <div className="flex gap-2">
                <OmniButton className="text-[10px] px-2 py-1" onClick={() => onRefresh(true)}>
                  Probe (global)
                </OmniButton>
                <OmniButton className="text-[10px] px-2 py-1" onClick={() => setSelectedChannelId(id)} variant="ghost">
                  Configure
                </OmniButton>
              </div>

              <div className="space-y-2">
                {channelAccounts.length === 0 && (
                  <div className="text-[10px] text-[var(--text-tertiary)] italic">No accounts configured.</div>
                )}

                {channelAccounts.map((account) => (
                  <div
                    key={`${id}-${account.accountId}`}
                    className="rounded border border-[var(--border-subtle)] bg-black/20 px-2 py-2 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[11px] font-medium text-[var(--text-primary)]">
                        {account.name || account.accountId}
                      </div>
                      <div className="text-[10px] text-[var(--text-tertiary)]">id: {account.accountId}</div>
                    </div>

                    <div className="flex flex-wrap gap-1 text-[10px] text-[var(--text-secondary)]">
                      <span className="px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">{boolLabel('enabled', account.enabled)}</span>
                      <span className="px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">{boolLabel('configured', account.configured)}</span>
                      <span className="px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">{boolLabel('linked', account.linked)}</span>
                      <span className="px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">{boolLabel('running', account.running)}</span>
                      <span className="px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">{boolLabel('connected', account.connected)}</span>
                    </div>

                    <div className="text-[10px] text-[var(--text-tertiary)]">{sourceLabel(account)}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] text-[var(--text-tertiary)]">
                      <div>last probe: {formatTimestamp(account.lastProbeAt)}</div>
                      <div>last start: {formatTimestamp(account.lastStartAt)}</div>
                      <div>last connect: {formatTimestamp(account.lastConnectedAt)}</div>
                      <div>last inbound: {formatTimestamp(account.lastInboundAt)}</div>
                      <div>last outbound: {formatTimestamp(account.lastOutboundAt)}</div>
                      <div>reconnect attempts: {account.reconnectAttempts ?? 'n/a'}</div>
                    </div>

                    {account.probe && (
                      <details className="text-[10px] rounded border border-[var(--border-subtle)] bg-black/30 p-1.5">
                        <summary className="cursor-pointer text-[var(--text-secondary)]">Probe result</summary>
                        <pre className="mt-1 whitespace-pre-wrap break-words text-[var(--text-tertiary)]">
                          {JSON.stringify(account.probe, null, 2)}
                        </pre>
                      </details>
                    )}

                    {account.lastError && (
                      <div className="text-[10px] text-red-300 border border-red-500/30 bg-red-500/10 rounded px-2 py-1">
                        {account.lastError}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </OmniCard>
          );
        })}
      </div>

      <OmniCard className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold">Channel Configuration</div>
            <div className="text-[10px] text-[var(--text-tertiary)]">Selected channel: {activeChannel ?? 'none'}</div>
          </div>
          <div className="flex gap-2">
            <OmniButton className="text-[10px] px-2 py-1" onClick={onLoadConfig} disabled={config.configLoading}>Load Config</OmniButton>
            <OmniButton className={`text-[10px] px-2 py-1 ${configActionButtonClass('save')}`} onClick={onSaveConfig} disabled={config.configSaving || !config.configValid}>Save</OmniButton>
            <OmniButton className={`text-[10px] px-2 py-1 ${configActionButtonClass('apply')}`} onClick={onApplyConfig} disabled={config.configSaving || !config.configValid}>Apply</OmniButton>
          </div>
        </div>
        {config.configLastAction && config.configLastActionStatus ? (
          <div className={`text-[10px] ${config.configLastActionStatus === 'success' ? 'text-emerald-200' : 'text-red-200'}`}>
            {config.configLastAction} {config.configLastActionStatus}
          </div>
        ) : null}

        {!parsedConfig && (
          <div className="text-[10px] text-amber-300 border border-amber-400/30 bg-amber-500/10 rounded px-2 py-1">
            Config JSON is not parseable. Load config first or fix JSON before channel-level edits.
          </div>
        )}

        <textarea
          value={channelDraft}
          onChange={(event) => {
            setChannelDraft(event.target.value);
            if (channelDraftError) setChannelDraftError(null);
          }}
          onBlur={(event) => {
            commitChannelDraft(event.target.value);
          }}
          disabled={!activeChannel || !parsedConfig}
          rows={12}
          className="w-full px-3 py-2 text-xs font-mono bg-black/30 border border-[var(--border-subtle)] rounded resize-y"
        />
        <div className="text-[10px] text-[var(--text-tertiary)]">Channel JSON is committed back to full config when the field loses focus.</div>
        {channelDraftError && (
          <div className="text-[10px] text-red-300 border border-red-500/30 bg-red-500/10 rounded px-2 py-1">
            {channelDraftError}
          </div>
        )}
      </OmniCard>
    </div>
  );
}
