import { useVaultStore } from '@/stores/vaultStore';
import { Clock, Hash, FileText } from 'lucide-react';
import type { FlowEntry } from '@/services/types';

interface FlowTimelineProps {
  onSelectDate?: (date: string) => void;
}

export function FlowTimeline({ onSelectDate }: FlowTimelineProps) {
  const { currentFlow, entries } = useVaultStore();

  const recentDates = [...new Set(entries.map((e) => e.path.match(/\d{4}-\d{2}-\d{2}/)?.[0]).filter(Boolean))]
    .sort()
    .reverse()
    .slice(0, 14) as string[];

  return (
    <div className="space-y-3">
      {/* Current Flow */}
      {currentFlow && (
        <div className="rounded-lg border border-neutral-800 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-amber-500" />
            <span className="text-xs font-medium text-neutral-300">Current Flow</span>
            <span className="text-[10px] text-neutral-600">{currentFlow.date}</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-neutral-500">
            <span>
              <Hash size={10} className="inline mr-0.5" />
              {currentFlow.metadata.word_count} words
            </span>
            <span>{currentFlow.metadata.highlight_count} highlights</span>
            <span>v{currentFlow.version}</span>
          </div>
          <div className="mt-2 text-xs text-neutral-400 line-clamp-3 font-mono">
            {currentFlow.content.slice(0, 200)}
          </div>
        </div>
      )}

      {/* Date Timeline */}
      <div className="space-y-1">
        <span className="text-[10px] uppercase tracking-wider text-neutral-600 px-1">Timeline</span>
        {recentDates.map((date) => (
          <button
            key={date}
            onClick={() => onSelectDate?.(date)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left hover:bg-neutral-900 transition-colors"
          >
            <FileText size={12} className="text-neutral-600" />
            <span className="font-mono text-neutral-400">{date}</span>
          </button>
        ))}
        {recentDates.length === 0 && (
          <p className="text-xs text-neutral-700 px-1">No entries yet</p>
        )}
      </div>
    </div>
  );
}
