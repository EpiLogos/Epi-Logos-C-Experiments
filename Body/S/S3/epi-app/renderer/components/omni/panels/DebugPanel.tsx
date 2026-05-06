import type { DebugState } from '../../../controllers/epi-claw/controllers';
import { shortJson } from './panelUtils';

type DebugPanelProps = {
  debug: DebugState;
  debugMethod: string;
  debugParams: string;
  onSetDebugMethod: (v: string) => void;
  onSetDebugParams: (v: string) => void;
  onLoadStatus: () => void;
  onLoadHealth: () => void;
  onCallMethod: () => void;
};

export function DebugPanel({
  debug,
  debugMethod,
  debugParams,
  onSetDebugMethod,
  onSetDebugParams,
  onLoadStatus,
  onLoadHealth,
  onCallMethod,
}: DebugPanelProps) {
  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Debug</h3>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)]" onClick={onLoadStatus}>Status</button>
          <button className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)]" onClick={onLoadHealth}>Health</button>
        </div>
      </div>
      {debug.debugError && <div className="text-xs text-red-300">{debug.debugError}</div>}
      <div className="grid grid-cols-2 gap-2">
        <input
          value={debugMethod}
          onChange={(e) => onSetDebugMethod(e.target.value)}
          placeholder="Method"
          className="px-3 py-2 text-xs bg-black/30 border border-[var(--border-subtle)] rounded"
        />
        <button className="px-3 py-2 text-xs rounded border border-[var(--border-subtle)]" onClick={onCallMethod}>Call RPC</button>
      </div>
      <textarea
        value={debugParams}
        onChange={(e) => onSetDebugParams(e.target.value)}
        rows={4}
        className="w-full px-3 py-2 text-xs font-mono bg-black/30 border border-[var(--border-subtle)] rounded"
      />
      {debug.debugCallResult && <pre className="text-[10px] p-3 rounded border border-[var(--border-subtle)] bg-black/30 overflow-x-auto">{debug.debugCallResult}</pre>}
      <pre className="text-[10px] p-3 rounded border border-[var(--border-subtle)] bg-black/30 overflow-x-auto">{shortJson(debug.debugStatus)}</pre>
      <pre className="text-[10px] p-3 rounded border border-[var(--border-subtle)] bg-black/30 overflow-x-auto">{shortJson(debug.debugHealth)}</pre>
    </div>
  );
}
