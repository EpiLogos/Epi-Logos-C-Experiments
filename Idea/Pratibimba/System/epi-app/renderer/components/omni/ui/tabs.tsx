import type { ReactNode } from 'react';
import { cn } from '../../../../shared/utils';

type OmniTabItem = {
  id: string;
  label: string;
};

type OmniTabsProps = {
  items: OmniTabItem[];
  activeId: string;
  onSelect: (id: string) => void;
  tabClassName?: string;
  before?: ReactNode;
};

export function OmniTabs({ items, activeId, onSelect, tabClassName, before }: OmniTabsProps) {
  return (
    <div role="tablist" className="flex gap-2" aria-label="Omni Tabs">
      {before}
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(item.id)}
            className={cn(
              'px-3 py-1.5 text-xs rounded border transition-colors',
              active
                ? 'bg-[var(--color-m5)]/20 border-[var(--color-m5)]/50 text-[var(--text-primary)]'
                : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-white/10',
              tabClassName,
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
