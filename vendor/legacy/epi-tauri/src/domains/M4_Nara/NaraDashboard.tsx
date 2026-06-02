import { useState, useEffect } from 'react';
import { useVaultStore } from '@/stores/vaultStore';
import { NaraEditor } from './NaraEditor';
import { FlowTimeline } from './FlowTimeline';
import { HighlightSidebar } from './HighlightSidebar';
import { FileText, Layers, Bookmark, Clock } from 'lucide-react';

type NaraTab = 'journal' | 'flow' | 'highlights';

export function NaraDashboard() {
  const { todayNote, fetchTodayNote, fetchEntries, fetchFlow } = useVaultStore();
  const [activeTab, setActiveTab] = useState<NaraTab>('journal');

  useEffect(() => {
    fetchTodayNote();
    fetchEntries();
  }, [fetchTodayNote, fetchEntries]);

  const tabs: { id: NaraTab; label: string; icon: React.ReactNode }[] = [
    { id: 'journal', label: 'Journal', icon: <FileText size={13} /> },
    { id: 'flow', label: 'Flow', icon: <Clock size={13} /> },
    { id: 'highlights', label: 'Highlights', icon: <Bookmark size={13} /> },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-neutral-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
              activeTab === tab.id
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto p-4">
        {activeTab === 'journal' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-amber-500" />
              <h3 className="text-sm font-medium text-neutral-300">
                {todayNote ? `Daily Note — ${todayNote.date}` : 'Daily Note'}
              </h3>
            </div>
            <NaraEditor
              content={todayNote?.content ?? '<p>Start writing...</p>'}
              onChange={(html) => {
                // Will save via vault_save_daily_note
              }}
            />
          </div>
        )}

        {activeTab === 'flow' && (
          <FlowTimeline
            onSelectDate={(date) => {
              fetchFlow(date);
            }}
          />
        )}

        {activeTab === 'highlights' && <HighlightSidebar />}
      </div>
    </div>
  );
}
