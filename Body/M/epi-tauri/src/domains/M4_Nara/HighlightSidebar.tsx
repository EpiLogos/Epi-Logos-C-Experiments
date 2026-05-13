import { useState } from 'react';
import { Bookmark, Tag, ChevronDown, ChevronRight } from 'lucide-react';

const HIGHLIGHT_CATEGORIES = [
  { id: 'daily-note', label: 'Daily Note', color: '#f59e0b' },
  { id: 'oracle', label: 'Oracle', color: '#a78bfa' },
  { id: 'dream', label: 'Dream', color: '#818cf8' },
  { id: 'expand', label: 'Expand', color: '#34d399' },
  { id: 'pattern', label: 'Pattern', color: '#f472b6' },
  { id: 'question', label: 'Question', color: '#60a5fa' },
  { id: 'insight', label: 'Insight', color: '#fbbf24' },
  { id: 'task', label: 'Task', color: '#94a3b8' },
] as const;

export function HighlightSidebar() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['daily-note', 'insight']));

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 px-1 mb-2">
        <Bookmark size={14} className="text-amber-500" />
        <span className="text-xs font-medium text-neutral-300">Highlight Registry</span>
      </div>

      {HIGHLIGHT_CATEGORIES.map((cat) => {
        const isOpen = expanded.has(cat.id);
        return (
          <div key={cat.id}>
            <button
              onClick={() => toggle(cat.id)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-neutral-900 transition-colors"
            >
              {isOpen ? (
                <ChevronDown size={12} className="text-neutral-600" />
              ) : (
                <ChevronRight size={12} className="text-neutral-600" />
              )}
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-neutral-400">{cat.label}</span>
            </button>
            {isOpen && (
              <div className="pl-7 py-1 text-[10px] text-neutral-600">
                No highlights recorded yet
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
