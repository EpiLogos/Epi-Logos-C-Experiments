import { useState, useEffect } from 'react';
import { Pen, Layers, Plus, Hash } from 'lucide-react';
import { epiiClient } from '@/services/epiiClient';
import type { AtelierWord, AtelierConstellation } from '@/services/types';

export function AtelierExcavator() {
  const [words, setWords] = useState<AtelierWord[]>([]);
  const [constellations, setConstellations] = useState<AtelierConstellation[]>([]);
  const [activeTab, setActiveTab] = useState<'words' | 'constellations'>('words');

  useEffect(() => {
    epiiClient.atelier.listWords().then(setWords).catch(() => {});
    epiiClient.atelier.listConstellations().then(setConstellations).catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Pen size={16} className="text-orange-400" />
        <h3 className="text-sm font-medium text-neutral-300">Strata Excavator</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        <button
          onClick={() => setActiveTab('words')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
            activeTab === 'words'
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Hash size={12} />
          Words
        </button>
        <button
          onClick={() => setActiveTab('constellations')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
            activeTab === 'constellations'
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Layers size={12} />
          Constellations
        </button>
      </div>

      {/* Content */}
      {activeTab === 'words' && (
        <div className="space-y-2">
          {words.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-neutral-600">No words excavated yet</p>
              <button className="mt-2 flex items-center gap-1 mx-auto px-3 py-1.5 rounded border border-neutral-700 text-xs text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors">
                <Plus size={12} />
                Begin Excavation
              </button>
            </div>
          ) : (
            words.map((word) => (
              <div
                key={word.id}
                className="rounded-lg border border-neutral-800 p-3 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-orange-400">{word.word}</span>
                  {word.register && (
                    <span className="text-[10px] text-neutral-600">{word.register}</span>
                  )}
                </div>
                {word.pie_root && (
                  <div className="text-[10px] text-neutral-500 mt-1">
                    PIE: *{word.pie_root}
                  </div>
                )}
                {word.definition && (
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{word.definition}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'constellations' && (
        <div className="space-y-2">
          {constellations.length === 0 ? (
            <p className="text-xs text-neutral-600 text-center py-6">No constellations formed</p>
          ) : (
            constellations.map((c) => (
              <div
                key={c.id}
                className="rounded-lg border border-neutral-800 p-3"
              >
                <span className="text-xs text-neutral-300">{c.name}</span>
                <span className="text-[10px] text-neutral-600 ml-2">
                  {c.words.length} members
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
