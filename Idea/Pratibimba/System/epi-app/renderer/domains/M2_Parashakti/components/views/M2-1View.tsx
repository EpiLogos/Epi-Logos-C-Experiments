import React from 'react';
import { BookOpen, Scroll, Sparkles, Eye, Triangle, Flower2, Circle, Infinity, Divide, Star, Network, Music, Disc, Activity, Waves, Heart, Lightbulb, PenLine, Boxes, Workflow, GitFork, Loader, GitBranch, Clock, Layers, FileText, CircleDashed, Mountain, Settings, Settings2 } from 'lucide-react';
export function M21View() {
  const lenses = ['Archetypal', 'Numerical', 'Causal', 'Logical', 'Processual', 'Meta-Epistemic'];
  return (
    <>
      <div className="p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center border-2 border-white/20">
            <Eye size={48} className="text-white" strokeWidth={1} />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">6-Lens Kaleidoscope</h2>
          <p className="text-sm text-[var(--text-secondary)]">Meta-Epistemic Framework investigation</p>
        </div>
        <div className="bg-[var(--bg-app)]/50 rounded-lg p-4 border border-[var(--border-subtle)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Multi-Perspective Analysis</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">View reality through 6 distinct epistemic lenses. Each reveals different aspects of truth.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {lenses.map((lens, i) => (
            <div key={lens} className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-[10px] text-[var(--text-tertiary)] mb-1">LENS {i + 1}</div>
              <div className="text-xs text-[var(--text-secondary)]">{lens}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default M21View;