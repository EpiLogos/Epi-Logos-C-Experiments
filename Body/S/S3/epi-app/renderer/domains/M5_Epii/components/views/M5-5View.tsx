import React from 'react';
import { BookOpen, Scroll, Sparkles, Eye, Triangle, Flower2, Circle, Infinity, Divide, Star, Network, Music, Disc, Activity, Waves, Heart, Lightbulb, PenLine, Boxes, Workflow, GitFork, Loader, GitBranch, Clock, Layers, FileText, CircleDashed, Mountain, Settings, Settings2 } from 'lucide-react';
export function M55View() {
  const communities = ['Word Origins', 'Symbol Roots', 'Aphorisms', 'Etymological Patterns', 'Concept Excavation', 'Language Archaeology'];

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto relative">
            <PenLine size={64} className="text-pink-400" strokeWidth={1} />
            <div className="absolute inset-0 bg-pink-400/20 rounded-full blur-xl animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Creative Workshop</h2>
          <p className="text-sm text-[var(--text-secondary)]">Etymological Archaeology • Logos Cycle</p>
        </div>

        <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <PenLine size={16} className="text-pink-400" />
            <span className="text-xs font-semibold text-pink-400">PRIMARY • MÖBIUS START</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Dig for roots and create new forms - Möbius Loop starting point
          </p>
        </div>

        <div className="bg-[var(--bg-app)]/50 rounded-lg p-4 border border-[var(--border-subtle)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            Root Excavation Workspace
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Community crystallization, aphorism extraction. The "Word-as-Reality"
            engine. Digging the etymological archaeology of concepts.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Word Communities
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {communities.map((community) => (
              <div
                key={community}
                className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-pink-500/30 transition-all"
              >
                <div className="text-xs text-[var(--text-secondary)]">{community}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-black/40 rounded-lg p-4 border border-pink-500/30">
          <div className="text-xs text-[var(--text-tertiary)] mb-3 text-center">
            MÖBIUS LOOP FLOW
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center mb-1">
                <PenLine size={20} className="text-pink-400" />
              </div>
              <div className="text-[10px] text-[var(--text-tertiary)]">Atelier</div>
              <div className="text-[10px] text-pink-400">M5-5'</div>
            </div>

            <div className="flex-1 flex items-center justify-center px-4">
              <span className="text-pink-400 text-xl">→ Sediment →</span>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-1">
                <BookOpen size={20} className="text-cyan-400" />
              </div>
              <div className="text-[10px] text-[var(--text-tertiary)]">Library</div>
              <div className="text-[10px] text-cyan-400">M5-0'</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg p-3 border border-pink-500/20">
          <div className="text-[10px] text-[var(--text-tertiary)] mb-1">
            BIDIRECTIONAL FLOW
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Active creation (Atelier) flows into stable storage (Library) ↔
            Reading prompts inquiry
          </p>
        </div>
      </div>
    </>
  );
}

export default M55View;