import { useTemporalStore } from '@/stores/temporalStore';
import { Users, Wifi, WifiOff } from 'lucide-react';

export function CollabWorkspace() {
  const { runtime } = useTemporalStore();

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      <div className="px-4 py-2 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-400">M2</span>
          <span className="text-sm font-medium text-neutral-300">Parashakti — Collaboration</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* SpaceTimeDB Presence */}
        <div className="rounded-lg border border-neutral-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            {runtime ? (
              <Wifi size={14} className="text-pink-400" />
            ) : (
              <WifiOff size={14} className="text-neutral-600" />
            )}
            <h3 className="text-sm font-medium text-neutral-300">Multiplayer Presence</h3>
          </div>

          {runtime ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-500">Day:</span>
                <span className="font-mono text-neutral-300">{runtime.day_id}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-500">Path:</span>
                <span className="font-mono text-neutral-300">{runtime.now_path}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-600">SpaceTimeDB not connected</p>
          )}
        </div>

        {/* Active Users placeholder */}
        <div className="rounded-lg border border-neutral-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-pink-400" />
            <h3 className="text-sm font-medium text-neutral-300">Active Users</h3>
          </div>
          <p className="text-xs text-neutral-600">
            Real-time cursor sharing and co-editing — requires SpaceTimeDB WebSocket connection
          </p>
        </div>
      </div>
    </div>
  );
}
