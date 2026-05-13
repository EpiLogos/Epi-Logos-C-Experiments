import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUiStore, type ActiveWorkspace } from '@/stores/uiStore';
import { HOTKEYS, parseHotkeyLabel } from '@/utils/hotkeys';
import { Search, ArrowRight, Clock, Command, Keyboard } from 'lucide-react';

const HISTORY_KEY = 'epi-coordinate-history';
const MAX_HISTORY = 10;

interface WorkspaceTarget {
  id: ActiveWorkspace;
  coordinate: string;
  name: string;
  description: string;
  color: string;
}

const WORKSPACES: WorkspaceTarget[] = [
  { id: 'M0', coordinate: 'M0', name: 'Anuttara', description: '2D Bimba graph — the canonical source map', color: '#a78bfa' },
  { id: 'M4', coordinate: 'M4', name: 'Nara', description: 'Journal dashboard — vault, flow, daily notes', color: '#f59e0b' },
  { id: 'M5', coordinate: 'M5', name: 'Epii', description: 'Library, Atelier, and agent execution', color: '#3b82f6' },
];

interface CommandEntry {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  action: () => void;
  category: 'navigate' | 'action' | 'history';
}

function getHistory(): string[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveHistory(coord: string) {
  try {
    const history = getHistory().filter((h) => h.toLowerCase() !== coord.toLowerCase());
    localStorage.setItem(HISTORY_KEY, JSON.stringify([coord, ...history].slice(0, MAX_HISTORY)));
  } catch {}
}

function parseCoordinate(input: string): WorkspaceTarget | null {
  const cleaned = input.trim().replace(/^#/, '').toUpperCase();
  const match = cleaned.match(/^M(\d)'?$/);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  return WORKSPACES.find((w) => w.coordinate === `M${num}`) ?? null;
}

export function CommandPalette() {
  const { setCommandPaletteOpen, setWorkspace, toggleDimension, toggleOmniPanel } = useUiStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [history] = useState(getHistory);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  const close = useCallback(() => setCommandPaletteOpen(false), [setCommandPaletteOpen]);

  const commands: CommandEntry[] = [
    ...WORKSPACES.map((ws) => ({
      id: `nav-${ws.id}`,
      label: `${ws.coordinate} — ${ws.name}`,
      description: ws.description,
      action: () => {
        setWorkspace(ws.id);
        saveHistory(ws.coordinate);
        close();
      },
      category: 'navigate' as const,
    })),
    {
      id: 'toggle-dimension',
      label: 'Toggle 2D / 3D',
      shortcut: parseHotkeyLabel(HOTKEYS.find((h) => h.action === 'toggle_dimension')!),
      action: () => {
        toggleDimension();
        close();
      },
      category: 'action',
    },
    {
      id: 'open-omni',
      label: 'Open OmniPanel',
      shortcut: 'ESC',
      action: () => {
        toggleOmniPanel();
        close();
      },
      category: 'action',
    },
    ...HOTKEYS.filter((h) => h.action.startsWith('branch_lens_')).map((h) => ({
      id: `hotkey-${h.action}`,
      label: h.description,
      shortcut: parseHotkeyLabel(h),
      action: () => close(),
      category: 'action' as const,
    })),
    ...history
      .map((coord) => {
        const ws = parseCoordinate(coord);
        if (!ws) return null;
        return {
          id: `history-${coord}`,
          label: coord,
          description: `${ws.name} — ${ws.description}`,
          action: () => {
            setWorkspace(ws.id);
            close();
          },
          category: 'history' as const,
        };
      })
      .filter(Boolean) as CommandEntry[],
  ];

  const filtered = query
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description?.toLowerCase().includes(query.toLowerCase()),
      )
    : commands;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const target = filtered[selectedIndex];
        if (target) target.action();
        else {
          const ws = parseCoordinate(query);
          if (ws) {
            setWorkspace(ws.id);
            saveHistory(ws.coordinate);
            close();
          }
        }
      }
    },
    [close, filtered, query, selectedIndex, setWorkspace],
  );

  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const grouped = {
    navigate: filtered.filter((c) => c.category === 'navigate'),
    action: filtered.filter((c) => c.category === 'action'),
    history: filtered.filter((c) => c.category === 'history'),
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
        onClick={close}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        <motion.div
          initial={{ y: -8, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -8, opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-lg bg-neutral-950 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center gap-2 px-4 border-b border-neutral-800">
            <Search size={16} className="text-neutral-500" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Navigate to coordinate, run command..."
              className="flex-1 bg-transparent text-white py-3.5 outline-none text-sm font-mono"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-neutral-500 hover:text-white text-xs">
                Clear
              </button>
            )}
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-80 overflow-auto py-1">
            {filtered.length === 0 && (
              <div className="px-4 py-6 text-center text-neutral-600 text-sm">No matches</div>
            )}

            {grouped.navigate.length > 0 && (
              <>
                <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-neutral-600">
                  Navigate
                </div>
                {grouped.navigate.map((cmd) => {
                  const globalIdx = filtered.indexOf(cmd);
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                        globalIdx === selectedIndex ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:bg-neutral-900'
                      }`}
                    >
                      <ArrowRight size={14} className="opacity-40" />
                      <span className="flex-1">{cmd.label}</span>
                      {cmd.description && (
                        <span className="text-xs text-neutral-600 truncate max-w-48">{cmd.description}</span>
                      )}
                    </button>
                  );
                })}
              </>
            )}

            {grouped.action.length > 0 && (
              <>
                <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-neutral-600 mt-1">
                  Actions
                </div>
                {grouped.action.map((cmd) => {
                  const globalIdx = filtered.indexOf(cmd);
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                        globalIdx === selectedIndex ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:bg-neutral-900'
                      }`}
                    >
                      <Command size={14} className="opacity-40" />
                      <span className="flex-1">{cmd.label}</span>
                      {cmd.shortcut && (
                        <kbd className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-500 font-mono">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </>
            )}

            {grouped.history.length > 0 && (
              <>
                <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-neutral-600 mt-1">
                  Recent
                </div>
                {grouped.history.map((cmd) => {
                  const globalIdx = filtered.indexOf(cmd);
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                        globalIdx === selectedIndex ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:bg-neutral-900'
                      }`}
                    >
                      <Clock size={14} className="opacity-40" />
                      <span className="font-mono">{cmd.label}</span>
                      {cmd.description && (
                        <span className="text-xs text-neutral-600 truncate max-w-48">{cmd.description}</span>
                      )}
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer hints */}
          <div className="px-4 py-2 border-t border-neutral-800 text-[10px] text-neutral-600 flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Keyboard size={10} />
              <kbd className="bg-neutral-800 px-1 py-0.5 rounded">↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className="bg-neutral-800 px-1 py-0.5 rounded">↵</kbd> Select
            </span>
            <span>
              <kbd className="bg-neutral-800 px-1 py-0.5 rounded">esc</kbd> Close
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
