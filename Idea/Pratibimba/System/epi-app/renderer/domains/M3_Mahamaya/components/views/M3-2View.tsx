import React from 'react';
import { BookOpen, Scroll, Sparkles, Eye, Triangle, Flower2, Circle, Infinity, Divide, Star, Network, Music, Disc, Activity, Waves, Heart, Lightbulb, PenLine, Boxes, Workflow, GitFork, Loader, GitBranch, Clock, Layers, FileText, CircleDashed, Mountain, Settings, Settings2 } from 'lucide-react';
export function M32View() {
  return (
    <>
      <div className="p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto flex items-center justify-center">
            <div className="relative">
              <GitBranch size={64} className="text-[var(--color-m3)]" strokeWidth={2} />
              <GitBranch size={64} className="text-purple-400 absolute top-0 left-0 -rotate-45" strokeWidth={2} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">64-Fold Biological System</h2>
          <p className="text-sm text-[var(--text-secondary)]">Codon library • DNA-symbolic link</p>
        </div>
        <div className="bg-[var(--bg-app)]/50 rounded-lg p-4 border border-[var(--border-subtle)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">The Code of Life</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">64 codons mirror 64 hexagrams. Isomorphism visualization between I-Ching and genetic code.</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {['A', 'C', 'G', 'T'].map((base) => (
            <div key={base} className="bg-white/5 rounded p-2 border border-white/10 text-center">
              <div className="text-lg font-mono text-[var(--color-m3)]">{base}</div>
              <div className="text-[10px] text-[var(--text-tertiary)]">Nucleotide</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default M32View;