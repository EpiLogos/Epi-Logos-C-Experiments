import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUiStore } from '@/stores/uiStore';
import { useGatewayStore } from '@/stores/gatewayStore';
import { useClockStore } from '@/stores/clockStore';
import { useGraphStore } from '@/stores/graphStore';
import { useVaultStore } from '@/stores/vaultStore';
import { useTemporalStore } from '@/stores/temporalStore';
import {
  MessageCircle,
  LayoutDashboard,
  Activity,
  Radio,
  Users,
  Settings,
  Server,
  Network,
  Bug,
  ScrollText,
  Sparkles,
  Timer,
  BookOpen,
  Palette,
  X,
  ChevronDown,
} from 'lucide-react';

type OmniPanelId =
  | 'chat'
  | 'workspace'
  | 'overview'
  | 'channels'
  | 'sessions'
  | 'config'
  | 'instances'
  | 'nodes'
  | 'debug'
  | 'logs'
  | 'models'
  | 'cron'
  | 'skills'
  | 'settings';

interface PanelDef {
  id: OmniPanelId;
  label: string;
  icon: React.ReactNode;
}

const PRIMARY_PANELS: PanelDef[] = [
  { id: 'chat', label: 'Chat', icon: <MessageCircle size={14} /> },
  { id: 'workspace', label: 'Workspace', icon: <LayoutDashboard size={14} /> },
  { id: 'overview', label: 'Overview', icon: <Activity size={14} /> },
  { id: 'channels', label: 'Channels', icon: <Radio size={14} /> },
  { id: 'sessions', label: 'Sessions', icon: <Users size={14} /> },
];

const ADVANCED_PANELS: PanelDef[] = [
  { id: 'config', label: 'Config', icon: <Settings size={14} /> },
  { id: 'instances', label: 'Instances', icon: <Server size={14} /> },
  { id: 'nodes', label: 'Nodes', icon: <Network size={14} /> },
  { id: 'debug', label: 'Debug', icon: <Bug size={14} /> },
  { id: 'logs', label: 'Logs', icon: <ScrollText size={14} /> },
  { id: 'models', label: 'Models', icon: <Sparkles size={14} /> },
  { id: 'cron', label: 'Cron', icon: <Timer size={14} /> },
  { id: 'skills', label: 'Skills', icon: <BookOpen size={14} /> },
  { id: 'settings', label: 'Settings', icon: <Palette size={14} /> },
];

function StatusDot({ connected }: { connected: boolean }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-neutral-600'}`}
    />
  );
}

function OverviewContent() {
  const { connected } = useGatewayStore();
  const { state: clockState } = useClockStore();
  const { connected: graphConnected } = useGraphStore();
  const { runtime } = useTemporalStore();
  const { todayNote } = useVaultStore();

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-xs uppercase tracking-wider text-neutral-500">System Status</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded border border-neutral-800 p-3">
          <div className="flex items-center gap-2 mb-1">
            <StatusDot connected={connected} />
            <span className="text-xs text-neutral-400">Gateway</span>
          </div>
          <span className="text-sm">{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <div className="rounded border border-neutral-800 p-3">
          <div className="flex items-center gap-2 mb-1">
            <StatusDot connected={graphConnected} />
            <span className="text-xs text-neutral-400">Neo4j</span>
          </div>
          <span className="text-sm">{graphConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <div className="rounded border border-neutral-800 p-3">
          <div className="flex items-center gap-2 mb-1">
            <StatusDot connected={!!clockState} />
            <span className="text-xs text-neutral-400">Clock</span>
          </div>
          <span className="text-sm font-mono">
            {clockState ? `${clockState.current_degree.toFixed(1)}°` : '—'}
          </span>
        </div>
        <div className="rounded border border-neutral-800 p-3">
          <div className="flex items-center gap-2 mb-1">
            <StatusDot connected={!!runtime} />
            <span className="text-xs text-neutral-400">Temporal</span>
          </div>
          <span className="text-sm">{runtime?.day_id ?? '—'}</span>
        </div>
      </div>
      {todayNote && (
        <div className="rounded border border-neutral-800 p-3">
          <span className="text-xs text-neutral-400">Today's Note</span>
          <p className="text-sm mt-1 text-neutral-300 line-clamp-3">
            {todayNote.content?.slice(0, 200) ?? 'Empty'}
          </p>
        </div>
      )}
    </div>
  );
}

function PlaceholderPanel({ id }: { id: OmniPanelId }) {
  const def = [...PRIMARY_PANELS, ...ADVANCED_PANELS].find((p) => p.id === id);
  return (
    <div className="flex-1 flex items-center justify-center text-neutral-600">
      <div className="text-center">
        <div className="text-3xl mb-2 opacity-40">{def?.icon}</div>
        <p className="text-sm">{def?.label ?? id}</p>
        <p className="text-xs text-neutral-700 mt-1">Coming soon</p>
      </div>
    </div>
  );
}

export function OmniPanel() {
  const { toggleOmniPanel } = useUiStore();
  const [activePanel, setActivePanel] = useState<OmniPanelId>('overview');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    toggleOmniPanel();
  }, [toggleOmniPanel]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        handleClose();
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [handleClose]);

  const renderPanel = () => {
    switch (activePanel) {
      case 'overview':
        return <OverviewContent />;
      default:
        return <PlaceholderPanel id={activePanel} />;
    }
  };

  const activeDef = [...PRIMARY_PANELS, ...ADVANCED_PANELS].find((p) => p.id === activePanel);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-40 bg-black/50"
        onClick={handleClose}
      />

      <motion.aside
        ref={panelRef}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -20, opacity: 0 }}
        transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
        className="fixed top-0 left-0 bottom-0 z-50 flex"
        style={{ width: 'min(800px, calc(100vw - 80px))' }}
      >
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-neutral-950 border-r border-neutral-800">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{activeDef?.label ?? 'OmniPanel'}</span>
              <span className="text-xs text-neutral-600">ESC to close</span>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Primary Tabs */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-neutral-800">
            {PRIMARY_PANELS.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePanel(p.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs transition-colors ${
                  activePanel === p.id
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900'
                }`}
              >
                {p.icon}
                {p.label}
              </button>
            ))}

            <div className="relative ml-auto">
              <button
                onClick={() => setAdvancedOpen(!advancedOpen)}
                className="flex items-center gap-1 px-2 py-1.5 rounded text-xs text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900 transition-colors"
              >
                More
                <ChevronDown size={12} className={advancedOpen ? 'rotate-180' : ''} />
              </button>

              {advancedOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl py-1 z-10">
                  {ADVANCED_PANELS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActivePanel(p.id);
                        setAdvancedOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors ${
                        activePanel === p.id
                          ? 'bg-neutral-800 text-white'
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      {p.icon}
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 min-h-0 overflow-auto">
            {renderPanel()}
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
