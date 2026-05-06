import type { ConnectionState } from '../../../stores/epiClawGatewayStore';
import { useDomainStore } from '../../../stores/domainStore';

type SettingsPanelProps = {
  gatewayUrl: string;
  gatewayToken: string | null;
  gatewayPassword: string;
  connectionState: ConnectionState;
  onSetGatewayUrl: (value: string) => void;
  onSetGatewayToken: (value: string | null) => void;
  onSetGatewayPassword: (value: string) => void;
  uiSettings: {
    theme:
      | 'light'
      | 'dark'
      | 'glass'
      | 'discause'
      | 'nara-dark'
      | 'nara-light'
      | 'nara-glass'
      | 'nara-forest'
      | 'nara-mist'
      | 'nara-grove'
      | 'system';
    chatFocusMode: boolean;
    chatShowThinking: boolean;
    chatSplitRatio: number;
    navCollapsed: boolean;
  };
  onSetUiTheme: (value: 'light' | 'dark' | 'glass' | 'discause' | 'nara-dark' | 'nara-light' | 'nara-glass' | 'nara-forest' | 'nara-mist' | 'nara-grove' | 'system') => void;
  onSetChatFocusMode: (value: boolean) => void;
  onSetChatShowThinking: (value: boolean) => void;
  onSetChatSplitRatio: (value: number) => void;
  onSetNavCollapsed: (value: boolean) => void;
  onConnect: () => void;
  onDisconnect: () => void;
};

export function SettingsPanel({
  gatewayUrl,
  gatewayToken,
  gatewayPassword,
  connectionState,
  onSetGatewayUrl,
  onSetGatewayToken,
  onSetGatewayPassword,
  uiSettings,
  onSetUiTheme,
  onSetChatFocusMode,
  onSetChatShowThinking,
  onSetChatSplitRatio,
  onSetNavCollapsed,
  onConnect,
  onDisconnect,
}: SettingsPanelProps) {
  const { currentDomain } = useDomainStore();
  const isNara = currentDomain.id === 'm4';

  return (
    <div className="p-6 space-y-3">
      <h3 className="text-lg font-bold">Gateway Settings</h3>
      <div className="space-y-2">
        <label className="text-xs text-[var(--text-tertiary)]">Gateway URL</label>
        <input
          value={gatewayUrl}
          onChange={(e) => onSetGatewayUrl(e.target.value)}
          className="w-full px-3 py-2 text-xs bg-transparent border border-[var(--border-subtle)] rounded"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs text-[var(--text-tertiary)]">Gateway Token</label>
        <input
          value={gatewayToken ?? ''}
          onChange={(e) => onSetGatewayToken(e.target.value || null)}
          className="w-full px-3 py-2 text-xs bg-transparent border border-[var(--border-subtle)] rounded"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs text-[var(--text-tertiary)]">Theme</label>
        <select
          value={uiSettings.theme}
          onChange={(e) => onSetUiTheme(e.target.value as 'light' | 'dark' | 'glass' | 'discause' | 'nara-dark' | 'nara-light' | 'nara-glass' | 'nara-forest' | 'nara-mist' | 'nara-grove' | 'system')}
          className="w-full px-3 py-2 text-xs bg-transparent border border-[var(--border-subtle)] rounded"
        >
          <option value="system">System</option>
          {isNara ? <option value="nara-dark">Nara Dark</option> : null}
          {isNara ? <option value="nara-light">Nara Light</option> : null}
          {isNara ? <option value="nara-glass">Nara Glass</option> : null}
          <option value="discause">Discause</option>
          <option value="glass">Glass</option>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-xs text-[var(--text-tertiary)]">Chat Split Ratio ({uiSettings.chatSplitRatio.toFixed(2)})</label>
        <input
          type="range"
          min="0.4"
          max="0.7"
          step="0.01"
          value={uiSettings.chatSplitRatio}
          onChange={(e) => onSetChatSplitRatio(Number.parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <input
            type="checkbox"
            checked={uiSettings.chatFocusMode}
            onChange={(e) => onSetChatFocusMode(e.target.checked)}
          />
          Chat focus mode
        </label>
        <label className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <input
            type="checkbox"
            checked={uiSettings.chatShowThinking}
            onChange={(e) => onSetChatShowThinking(e.target.checked)}
          />
          Show assistant reasoning
        </label>
        <label className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <input
            type="checkbox"
            checked={uiSettings.navCollapsed}
            onChange={(e) => onSetNavCollapsed(e.target.checked)}
          />
          Collapse navigation
        </label>
      </div>
      <div className="space-y-2">
        <label className="text-xs text-[var(--text-tertiary)]">Gateway Password (not stored)</label>
        <input
          type="password"
          value={gatewayPassword}
          onChange={(e) => onSetGatewayPassword(e.target.value)}
          className="w-full px-3 py-2 text-xs bg-transparent border border-[var(--border-subtle)] rounded"
        />
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)]" onClick={onConnect}>Connect</button>
        <button className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)]" onClick={onDisconnect}>Disconnect</button>
      </div>
      <div className="text-xs text-[var(--text-tertiary)]">Current state: {connectionState}</div>
    </div>
  );
}
