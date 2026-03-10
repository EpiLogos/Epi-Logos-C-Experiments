import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import type { NaraActions, NaraState, NaraMode } from '../core/useNara';
import { useEpiClawGatewayStore } from '../../../stores/epiClawGatewayStore';
import { useLayoutStore } from '../../../stores/layoutStore';
import { NaraEditor } from './NaraEditor';
import { NaraBackground } from './NaraBackground';
import { NaraPencilButton } from './NaraPencilButton';
import { NaraSearchBar } from './NaraSearchBar';
import { useFlowStore } from '../../../stores/flowStore';
import { Book, Calendar, Moon, Sparkles, GitMerge, Brain } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useHighlightsStore } from '../../../stores/highlightsStore';
import type { ExtractedHighlight } from '../editor/extensions/highlightMark';

interface NaraDashboardProps {
  state: NaraState;
  actions: NaraActions;
}

export function NaraDashboard({ state, actions }: NaraDashboardProps) {
  const LEFT_COLLAPSED_WIDTH = 56;
  const LEFT_MIN_WIDTH = 240;
  const LEFT_MAX_WIDTH = 520;
  const RIGHT_MIN_WIDTH = 280;
  const RIGHT_MAX_WIDTH = 520;
  const MAIN_MIN_WIDTH = 420;
  const RESIZE_HANDLE_WIDTH = 6;

  const {
    content: quickNote,
    setContent: setQuickNote,
    metadata: flowMetadata,
    isSaving,
    lastSaved,
    saveEntry,
    loadEntry,
    setHighlights: setFlowHighlights,
  } = useFlowStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const lastAutoSavedSnapshotRef = useRef<string>('');

  const [searchOpen, setSearchOpen] = useState(false);
  const [formattingToolbarVisible, setFormattingToolbarVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [leftHoverExpanded, setLeftHoverExpanded] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(300);
  const [rightPanelWidth, setRightPanelWidth] = useState(340);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Meditate on "Blank Book"', completed: false },
    { id: 2, text: 'Refine Oracle Prompt', completed: false },
  ]);
  const dragStateRef = useRef<{
    pane: 'left' | 'right';
    startX: number;
    startWidth: number;
  } | null>(null);

  // Gateway state
  const gateway = useEpiClawGatewayStore();
  const { panels } = useLayoutStore();

  const todayDate = state.todayNote?.frontmatter?.date || new Date().toISOString().split('T')[0];
  const leftExpanded = panels.left || leftHoverExpanded;
  const highlights = useHighlightsStore();

  useEffect(() => {
    void loadEntry(todayDate);
  }, [loadEntry, todayDate]);

  useEffect(() => {
    if (!flowMetadata) return;
    if (isTyping) return;
    const snapshot = JSON.stringify({
      content: quickNote,
      highlights: flowMetadata.highlights.map(({ id, category, text, timestamp }) => ({ id, category, text, timestamp })),
    });
    if (snapshot === lastAutoSavedSnapshotRef.current) return;

    const timeout = window.setTimeout(() => {
      void saveEntry(todayDate, quickNote, flowMetadata.highlights);
      lastAutoSavedSnapshotRef.current = snapshot;
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [flowMetadata, isTyping, quickNote, saveEntry, todayDate]);

  useEffect(() => {
    const updateContainerWidth = () => {
      const width = containerRef.current?.getBoundingClientRect().width || window.innerWidth || 1200;
      setContainerWidth(width);
    };

    updateContainerWidth();

    const observer =
      typeof ResizeObserver !== 'undefined' && containerRef.current
        ? new ResizeObserver(updateContainerWidth)
        : null;

    if (observer && containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener('resize', updateContainerWidth);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateContainerWidth);
    };
  }, []);

  useEffect(() => {
    if (panels.left) {
      setLeftHoverExpanded(false);
    }
  }, [panels.left]);

  useEffect(() => {
    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

    const availableForMain =
      containerWidth -
      (leftExpanded ? leftPanelWidth : LEFT_COLLAPSED_WIDTH) -
      (panels.right ? rightPanelWidth : 0) -
      (leftExpanded ? RESIZE_HANDLE_WIDTH : 0) -
      (panels.right ? RESIZE_HANDLE_WIDTH : 0);

    if (availableForMain >= MAIN_MIN_WIDTH) return;

    let leftTarget = leftPanelWidth;
    let rightTarget = rightPanelWidth;
    let shortage = MAIN_MIN_WIDTH - availableForMain;

    if (panels.right) {
      const possibleRightShrink = rightPanelWidth - RIGHT_MIN_WIDTH;
      const rightShrink = Math.min(possibleRightShrink, shortage);
      rightTarget = rightPanelWidth - rightShrink;
      shortage -= rightShrink;
    }

    if (shortage > 0 && leftExpanded) {
      const possibleLeftShrink = leftPanelWidth - LEFT_MIN_WIDTH;
      const leftShrink = Math.min(possibleLeftShrink, shortage);
      leftTarget = leftPanelWidth - leftShrink;
    }

    const nextLeft = clamp(leftTarget, LEFT_MIN_WIDTH, LEFT_MAX_WIDTH);
    const nextRight = clamp(rightTarget, RIGHT_MIN_WIDTH, RIGHT_MAX_WIDTH);

    if (nextLeft !== leftPanelWidth) setLeftPanelWidth(nextLeft);
    if (nextRight !== rightPanelWidth) setRightPanelWidth(nextRight);
  }, [containerWidth, leftExpanded, leftPanelWidth, panels.right, rightPanelWidth]);

  useEffect(() => {
    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

    const onMouseMove = (event: MouseEvent) => {
      const drag = dragStateRef.current;
      if (!drag) return;

      const delta = event.clientX - drag.startX;

      if (drag.pane === 'left') {
        const maxLeft = Math.min(
          LEFT_MAX_WIDTH,
          containerWidth -
            (panels.right ? rightPanelWidth : 0) -
            MAIN_MIN_WIDTH -
            RESIZE_HANDLE_WIDTH * (panels.right ? 2 : 1)
        );
        setLeftPanelWidth(clamp(drag.startWidth + delta, LEFT_MIN_WIDTH, Math.max(LEFT_MIN_WIDTH, maxLeft)));
        return;
      }

      const maxRight = Math.min(
        RIGHT_MAX_WIDTH,
        containerWidth - (leftExpanded ? leftPanelWidth : LEFT_COLLAPSED_WIDTH) - MAIN_MIN_WIDTH - RESIZE_HANDLE_WIDTH * (leftExpanded ? 2 : 1)
      );
      setRightPanelWidth(clamp(drag.startWidth - delta, RIGHT_MIN_WIDTH, Math.max(RIGHT_MIN_WIDTH, maxRight)));
    };

    const onMouseUp = () => {
      dragStateRef.current = null;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [containerWidth, leftExpanded, leftPanelWidth, panels.right, rightPanelWidth]);

  // Keyboard shortcut: '/' to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      const isTypingInInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Only trigger '/' shortcut when not in an input
      if (e.key === '/' && !isTypingInInput && !searchOpen) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  const handleSendToAgent = useCallback((actionType: 'chat' | 'oracle' | 'dream' | 'expand', selectedText: string) => {
    if (!selectedText?.trim()) return;
    let prefix = '';
    if (actionType === 'oracle') prefix = '/oracle ';
    if (actionType === 'dream') prefix = '/analyze_dream ';
    if (actionType === 'expand') prefix = '/expand ';

    const payload = `${prefix}"${selectedText}"`;
    gateway.sendMessage(payload);
  }, [gateway]);

  const handleHighlightsChange = useCallback((nextHighlights: ExtractedHighlight[]) => {
    const mapped = nextHighlights.map((highlight) => ({
        id: highlight.id,
        text: highlight.text || highlight.originalText || '',
        category: highlight.category,
        timestamp: highlight.timestamp,
        from: highlight.from,
        to: highlight.to,
      }));
    setFlowHighlights(mapped);
    highlights.setHighlights(
      mapped.map(({ id, text, category, timestamp, label, color }) => ({ id, text, category, timestamp, label, color }))
    );
  }, [highlights, setFlowHighlights]);

  const navTab = (modeKey: NaraMode, label: string, Icon: React.ElementType) => {
    const isActive = state.activeMode === modeKey;
    return (
      <button
        type="button"
        key={modeKey}
        onClick={() => actions.setMode(modeKey)}
        className={`flex items-center gap-1.5 px-3 py-2 font-medium text-[11px] border-b-2 transition-all ${isActive
          ? 'text-[var(--text-primary)] border-[var(--text-primary)]'
          : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'
          }`}
      >
        <Icon size={13} className={isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'} />
        {label}
      </button>
    );
  };

  const days = useMemo(() => Array.from({ length: 28 }, (_, i) => i + 1), []);

  return (
    <div className="relative h-full w-full flex bg-[var(--bg-panel)] font-sans overflow-hidden" ref={containerRef}>
      {/* LEFT SIDEBAR (Temporal & Flow) */}
      <aside
        data-testid="nara-left-popout"
        data-expanded={leftExpanded ? 'true' : 'false'}
        className="z-30 flex h-full shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-panel)] shadow-[4px_0_24px_rgba(0,0,0,0.08)] transition-[width] duration-300 ease-out"
        style={{ width: leftExpanded ? `${leftPanelWidth}px` : `${LEFT_COLLAPSED_WIDTH}px` }}
        onMouseEnter={() => {
          if (!panels.left) setLeftHoverExpanded(true);
        }}
        onMouseLeave={() => {
          if (!panels.left) setLeftHoverExpanded(false);
        }}
      >
        <div className="flex h-full w-full flex-col overflow-hidden">
          {!leftExpanded && (
            <div className="flex h-full flex-col items-center gap-5 py-6">
              <div className="flex h-10 w-10 flex-col items-center justify-center rounded border border-[var(--border-subtle)] bg-[var(--bg-app)] shadow-sm">
                <span className="text-[8px] font-bold uppercase text-[var(--text-secondary)]">Oct</span>
                <span className="font-mono text-[13px] text-[var(--text-primary)]">24</span>
              </div>
              <div className="relative flex-1">
                <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[var(--border-subtle)]/70" />
                <div className="relative z-10 flex h-full flex-col items-center justify-between py-2">
                  <div className="h-2 w-2 rounded-full border border-[var(--bg-panel)] bg-[var(--text-secondary)]/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/25" />
                  <div className="h-2 w-2 rounded-full border border-[var(--bg-panel)] bg-[var(--text-secondary)]/60" />
                </div>
              </div>
            </div>
          )}

          {leftExpanded && (
            <>
              <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] p-6">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)]">Temporal Cycle</span>
                  <span className="font-mono text-[10px] text-[var(--text-secondary)]">OCT 2026</span>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <div key={`${day}-${idx}`} className="mb-1 text-center text-[9px] font-bold text-[var(--text-secondary)]">{day}</div>
                  ))}
                  {Array.from({ length: 3 }).map((_, i) => <div key={`blank-${i}`} />)}
                  {days.map((num) => (
                    <div
                      key={num}
                      className={`flex h-6 cursor-pointer items-center justify-center rounded-sm font-mono text-[10px] transition-colors ${num === 12
                        ? 'border border-emerald-500/30 bg-emerald-500/20 font-bold text-emerald-500'
                        : num === 20 || num === 29
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-panel)]'
                        }`}
                    >
                      {num}
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex flex-col gap-1.5 rounded border border-[var(--border-subtle)] bg-[var(--text-primary)]/5 p-3">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="uppercase text-[var(--text-secondary)]">Lunar Phase</span>
                    <span className="font-bold tracking-wider text-emerald-500">WAXING GIBBOUS</span>
                  </div>
                  <div className="relative h-1 w-full overflow-hidden rounded-full bg-[var(--bg-panel)]">
                    <div className="absolute left-0 top-0 h-full w-[65%] bg-emerald-500" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 p-6">
                <span className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)]">Flow Histories</span>
                {[
                  { tag: 'M4-A', label: 'Divination Logs' },
                  { tag: 'M4-B', label: 'Alchemy Recipes' },
                  { tag: 'M4-C', label: 'Dream Vault' },
                  { tag: 'ARCHIVE', label: 'October Rituals' },
                ].map((item) => (
                  <button key={item.tag} type="button" className="-mx-2 flex items-center justify-between rounded px-2 py-1.5 text-left text-[12px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--text-primary)]/5 hover:text-[var(--text-primary)]">
                    <span>{item.label}</span>
                    <span className="font-mono text-[9px] opacity-50">{item.tag}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </aside>

      {leftExpanded && (
        <div
          data-testid="nara-left-resize-handle"
          className="z-30 h-full cursor-col-resize bg-transparent transition-colors hover:bg-[var(--text-primary)]/15"
          style={{ width: `${RESIZE_HANDLE_WIDTH}px` }}
          onMouseDown={(event) => {
            dragStateRef.current = { pane: 'left', startX: event.clientX, startWidth: leftPanelWidth };
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'col-resize';
          }}
        />
      )}

      {/* MAIN MODALITY CANVAS */}
      <section className="relative flex min-w-0 flex-1 flex-col bg-[var(--chat-canvas-bg)]">
        {/* Navigation Header */}
        <div className="relative z-10 flex h-[42px] w-full shrink-0 items-end justify-start border-b border-[var(--border-subtle)] bg-[var(--bg-panel)] px-4">
          {/* Tabs */}
          <div className="flex h-full gap-1">
            {navTab('journal', 'Journal', Book)}
            {navTab('daily_note', 'Daily Note', Calendar)}
            {navTab('dream', 'Dream Journal', Moon)}
            {navTab('oracle', 'Oracle', Sparkles)}
          </div>
        </div>

        {/* Modality Content Area */}
        <div className="relative flex-1 overflow-auto custom-scrollbar scroll-smooth">
          {/* Full-bleed background - fills entire section */}
          <NaraBackground />

          {state.activeMode === 'journal' && (
            <div
              className="relative z-10 mx-auto flex w-full flex-col gap-10 px-8 py-16"
              style={{
                maxWidth: `${Math.max(420, containerWidth - (leftExpanded ? leftPanelWidth : LEFT_COLLAPSED_WIDTH) - (panels.right ? rightPanelWidth : 0) - 64)}px`
              }}
            >
              {/* Search Bar */}
              <NaraSearchBar
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
                onSearch={(query) => actions.search(query)}
              />

              <div className="relative z-10 w-full">
                <NaraEditor
                  content={quickNote}
                  onChange={setQuickNote}
                  onHighlightsChange={handleHighlightsChange}
                  onTypingChange={setIsTyping}
                  onSendToAgent={handleSendToAgent}
                  placeholder="Type stream, highlight text for Context Menu..."
                  focusMode={true}
                  formattingToolbarVisible={formattingToolbarVisible}
                  onToggleFormattingToolbar={() => setFormattingToolbarVisible((prev) => !prev)}
                />
              </div>
            </div>
          )}

          {['daily_note', 'dream', 'oracle'].includes(state.activeMode) && (
            <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center py-20 text-center opacity-60">
              {state.activeMode === 'daily_note' && <Calendar size={48} className="mb-6 stroke-[1px] text-[var(--text-secondary)]" />}
              {state.activeMode === 'dream' && <Moon size={48} className="mb-6 stroke-[1px] text-[var(--text-secondary)]" />}
              {state.activeMode === 'oracle' && <Sparkles size={48} className="mb-6 stroke-[1px] text-[var(--text-secondary)]" />}

              <p className="mb-3 font-playfair text-[32px] italic text-[var(--text-primary)]">
                {state.activeMode.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </p>
              <p className="font-sans text-[14px] text-[var(--text-secondary)]">
                This modality is currently isolated. Awaiting active stream data.
              </p>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence initial={false}>
        {panels.right && (
          <motion.div
            className="flex h-full shrink-0 overflow-hidden"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: rightPanelWidth + RESIZE_HANDLE_WIDTH, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div
              data-testid="nara-right-resize-handle"
              className="z-30 h-full cursor-col-resize bg-transparent transition-colors hover:bg-[var(--text-primary)]/15"
              style={{ width: `${RESIZE_HANDLE_WIDTH}px` }}
              onMouseDown={(event) => {
                dragStateRef.current = { pane: 'right', startX: event.clientX, startWidth: rightPanelWidth };
                document.body.style.userSelect = 'none';
                document.body.style.cursor = 'col-resize';
              }}
            />
            <section
              className="z-20 flex h-full shrink-0 flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-panel)] shadow-[-4px_0_24px_rgba(0,0,0,0.02)] transition-[width] duration-300 ease-out"
              style={{ width: `${rightPanelWidth}px` }}
              data-expanded="true"
              data-testid="nara-right-pane"
            >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--text-primary)]/5 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--text-primary)] text-[var(--bg-panel)] shadow-sm">
                  <span className="font-cinzel text-[20px] font-bold leading-none">A</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold tracking-wide text-[var(--text-primary)]">Admin Primary</span>
                  <span className="flex items-center gap-1 font-mono text-[10px] tracking-wider text-[var(--text-secondary)]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
                    Connected
                  </span>
                </div>
              </div>

              <button className="p-1 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
                <GitMerge size={16} />
              </button>
            </div>

            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-panel)] px-5 py-3 font-mono text-[10px]">
              <span className="text-[var(--text-secondary)]">PERSONAL DATA VAULT</span>
              <span className="rounded bg-[var(--text-primary)]/10 px-1.5 py-0.5 text-[var(--text-primary)]">SYNCED</span>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-4 custom-scrollbar">
              <div>
                <h3 className="mb-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                  Highlights
                  <span className="text-[9px] normal-case normal-tracking opacity-50">
                    {highlights.highlights.length} saved
                  </span>
                </h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {highlights.highlights.length === 0 ? (
                    <p className="text-[11px] text-[var(--text-secondary)] italic">
                      Select text and click a category button to save highlights.
                    </p>
                  ) : (
                    highlights.highlights.map((highlight) => {
                      // Category colors
                      const categoryColors: Record<string, string> = {
                        'daily-note': '#fbbf24',
                        'oracle': '#a78bfa',
                        'dream': '#60a5fa',
                        'expand': '#34d399'
                      };
                      const categoryNames: Record<string, string> = {
                        'daily-note': 'Daily Note',
                        'oracle': 'Oracle',
                        'dream': 'Dream',
                        'expand': 'Expand'
                      };
                      const color = highlight.color || categoryColors[highlight.category] || '#888';
                      const displayName = highlight.label || categoryNames[highlight.category] || highlight.category;

                      return (
                        <div
                          key={highlight.id}
                          className="group cursor-pointer rounded border border-[var(--border-subtle)] bg-[var(--bg-app)] p-3 shadow-sm transition-colors hover:border-[var(--border-subtle)]"
                          style={{ borderLeftColor: color, borderLeftWidth: '3px' }}
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                              <span className="font-mono text-[10px] uppercase text-[var(--text-secondary)]">
                                {displayName}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => highlights.removeHighlight(highlight.id)}
                              className="opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-red-500 transition-opacity"
                              aria-label="Remove highlight"
                            >
                              ×
                            </button>
                          </div>
                          <p className="text-xs leading-snug text-[var(--text-primary)]">
                            {highlight.text}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">Pending Actions</h3>
                <div className="space-y-1" data-testid="nara-pending-actions">
                  {tasks.map((task) => (
                    <label key={task.id} className="group flex cursor-pointer items-start gap-2 rounded p-1 hover:bg-[var(--bg-app)]">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(event) => {
                          const checked = event.target.checked;
                          setTasks((prev) => prev.map((item) => (item.id === task.id ? { ...item, completed: checked } : item)));
                        }}
                        className="mt-0.5 h-3 w-3 rounded-sm border border-[var(--text-secondary)]/40 accent-emerald-500"
                      />
                      <span className={`text-xs transition-colors ${task.completed ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)]/80 group-hover:text-[var(--text-primary)]'}`}>
                        {task.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded border border-[var(--border-subtle)] bg-[var(--text-primary)]/5 p-3">
                <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                  <Brain size={12} />
                  Insight Logic
                </div>
                <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                  Insights are structured as pattern recognition + a concrete next-action so journaling signals can become executable habits.
                </p>
              </div>
            </div>
            <div className="pointer-events-none absolute bottom-3 right-4 z-10 text-[11px] text-[var(--text-secondary)]/80">
              {isSaving && <span className="animate-pulse">Saving…</span>}
              {!isSaving && lastSaved && <span>Saved {lastSaved.toLocaleTimeString()}</span>}
            </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
