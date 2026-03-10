import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Editor } from '@tiptap/core';
import type { FloatingMenuState } from '../extensions/floatingMenu';
import { Bookmark, Maximize2, MessageSquarePlus, Moon, Sparkles } from 'lucide-react';

type HighlightCategory = 'daily-note' | 'oracle' | 'dream' | 'expand' | string;
type AgentAction = 'chat' | 'oracle' | 'dream' | 'expand';

interface FloatingMenuProps {
  editor: Editor | null;
  state: FloatingMenuState;
  onClose: () => void;
  onHighlight: (category: HighlightCategory) => void;
  onSendToAgent: (action: AgentAction) => void;
}

const categoryConfig: Record<HighlightCategory, { icon: React.ElementType; color: string; label: string }> = {
  'daily-note': { icon: Bookmark, color: '#fbbf24', label: 'Daily Note' },
  oracle: { icon: Sparkles, color: '#a78bfa', label: 'Oracle' },
  dream: { icon: Moon, color: '#60a5fa', label: 'Dream' },
  expand: { icon: Maximize2, color: '#34d399', label: 'Expand' },
};

const agentActions: Array<{ action: AgentAction; label: string; icon: React.ElementType }> = [
  { action: 'chat', label: 'A2UI', icon: MessageSquarePlus },
  { action: 'oracle', label: 'Oracle', icon: Sparkles },
  { action: 'dream', label: 'Dream', icon: Moon },
  { action: 'expand', label: 'Expand', icon: Maximize2 },
];

export function FloatingMenu({ editor, state, onClose, onHighlight, onSendToAgent }: FloatingMenuProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!state.isOpen || !state.rect) return;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const estimatedWidth = menuRef.current?.offsetWidth ?? 320;
    const estimatedHeight = menuRef.current?.offsetHeight ?? 98;

    const centerX = state.rect.left + state.rect.width / 2;
    const left = Math.min(
      Math.max(12, centerX - estimatedWidth + 16),
      Math.max(12, viewportWidth - estimatedWidth - 12)
    );

    const preferBelow = state.rect.bottom + 12 + estimatedHeight < viewportHeight;
    const top = preferBelow
      ? state.rect.bottom + 10
      : Math.max(12, state.rect.top - estimatedHeight - 10);

    setPosition({ top, left });
  }, [state]);

  const applyHighlight = (category: HighlightCategory, options?: { label?: string; color?: string }) => {
    if (!editor) return;

    const id = `hl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const selectionEnd = editor.state.selection.to;
    editor.chain().focus().setHighlight({
      id,
      category,
      timestamp: Date.now(),
      originalText: state.selectedText,
      label: options?.label,
      color: options?.color,
    }).setTextSelection(selectionEnd).unsetHighlight().run();

    onHighlight(category);
    onClose();
  };

  const applyCustomHighlight = () => {
    const label = window.prompt('Custom highlight label (e.g. Research, Thread, Action):', 'Custom');
    if (!label) return;
    const colorInput = window.prompt('Optional color hex (#RRGGBB). Leave blank for theme default:', '');
    const color = colorInput?.trim() || undefined;
    const slug = label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'custom';
    applyHighlight(`custom:${slug}`, { label: label.trim(), color });
  };

  if (!state.isOpen) {
    return null;
  }

  const menu = (
    <div
      ref={menuRef}
      className="fixed z-[2000] w-[min(92vw,320px)] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-panel)]/94 p-1.5 shadow-[0_10px_24px_rgba(0,0,0,0.16)] backdrop-blur-md"
      style={{
        top: position.top,
        left: position.left,
      }}
      data-testid="floating-action-menu"
    >
      <div className="grid gap-1.5">
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
          {agentActions.map(({ action, label }) => (
            <button
              key={action}
              type="button"
              onClick={() => {
                onSendToAgent(action);
                onClose();
              }}
              className="flex items-center justify-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-panel)]/65 px-2 py-1.5 text-[10px] font-medium text-[var(--text-primary)] transition hover:border-[var(--text-primary)]/20 hover:bg-[var(--text-primary)]/8"
              aria-label={`Send to ${label}`}
              title={`Send to ${label}`}
            >
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
            {(Object.keys(categoryConfig) as HighlightCategory[]).map((category) => {
              const config = categoryConfig[category];
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => applyHighlight(category)}
                  className="flex items-center gap-1 rounded-md border border-[var(--border-subtle)]/70 px-2 py-1.5 text-[10px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                  onMouseEnter={(event) => {
                    event.currentTarget.style.backgroundColor = `${config.color}14`;
                    event.currentTarget.style.color = config.color;
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.backgroundColor = '';
                    event.currentTarget.style.color = '';
                  }}
                  title={config.label}
                  aria-label={`Highlight as ${config.label}`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: config.color }} />
                  <span className="truncate">{config.label}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={applyCustomHighlight}
              className="flex items-center gap-1 rounded-md border border-dashed border-[var(--border-subtle)] px-2 py-1.5 text-[10px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] hover:border-[var(--text-primary)]/20"
              aria-label="Custom highlight type"
              title="Custom highlight type"
            >
              <span className="h-2 w-2 rounded-full bg-[var(--text-secondary)]/60" />
              <span>Custom…</span>
            </button>
          </div>
      </div>
    </div>
  );

  if (!mounted || !document.body) return menu;
  return createPortal(menu, document.body);
}
