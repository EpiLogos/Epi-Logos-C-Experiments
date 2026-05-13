import { useState } from 'react';
import { BookOpen, Pen, Cpu } from 'lucide-react';
import { LibraryFolio } from './LibraryFolio';
import { AtelierExcavator } from './AtelierExcavator';
import { EpiiAgent } from './EpiiAgent';

type EpiiTab = 'library' | 'atelier' | 'epii';

export function EpiiDashboard() {
  const [activeTab, setActiveTab] = useState<EpiiTab>('library');

  const tabs: { id: EpiiTab; label: string; icon: React.ReactNode }[] = [
    { id: 'library', label: 'Library', icon: <BookOpen size={13} /> },
    { id: 'atelier', label: 'Atelier', icon: <Pen size={13} /> },
    { id: 'epii', label: 'Epii Agent', icon: <Cpu size={13} /> },
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
        {activeTab === 'library' && <LibraryFolio />}
        {activeTab === 'atelier' && <AtelierExcavator />}
        {activeTab === 'epii' && <EpiiAgent />}
      </div>
    </div>
  );
}
