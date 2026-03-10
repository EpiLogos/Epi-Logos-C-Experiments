import React from 'react';
import { BookOpen, Scroll, Sparkles, Eye, Triangle, Flower2, Circle, Infinity, Divide, Star, Network, Music, Disc, Activity, Waves, Heart, Lightbulb, PenLine, Boxes, Workflow, GitFork, Loader, GitBranch, Clock, Layers, FileText, CircleDashed, Mountain, Settings, Settings2 } from 'lucide-react';
export function M22View() {
  return (
    <>
      <div className="p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto flex items-center justify-center">
            <Mountain size={64} className="text-[var(--color-m2)]" strokeWidth={1} />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">36 Tattvas System</h2>
          <p className="text-sm text-[var(--text-secondary)]">Map of consciousness descent</p>
        </div>
        <div className="bg-[var(--bg-app)]/50 rounded-lg p-4 border border-[var(--border-subtle)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Tattva Mapping</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">36 Tattvas through Shuddha/Shuddhashuddha/Ashuddha. Pravritti/Nivritti loops of manifestation and reabsorption.</p>
        </div>
        <div className="space-y-2">
          <div className="bg-white/5 rounded p-3 border border-green-500/20">
            <div className="text-[10px] text-green-400 mb-1">SHUDDHA (Pure)</div>
            <div className="text-xs text-[var(--text-secondary)]">Tattvas 1-5</div>
          </div>
          <div className="bg-white/5 rounded p-3 border border-yellow-500/20">
            <div className="text-[10px] text-yellow-400 mb-1">SHUDDHASHUDDHA (Mixed)</div>
            <div className="text-xs text-[var(--text-secondary)]">Tattvas 6-30</div>
          </div>
          <div className="bg-white/5 rounded p-3 border border-red-500/20">
            <div className="text-[10px] text-red-400 mb-1">ASHUDDHA (Impure)</div>
            <div className="text-xs text-[var(--text-secondary)]">Tattvas 31-36</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default M22View;