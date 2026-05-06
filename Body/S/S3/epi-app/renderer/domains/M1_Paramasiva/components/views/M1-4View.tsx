import React from 'react';
import { BookOpen, Scroll, Sparkles, Eye, Triangle, Flower2, Circle, Infinity, Divide, Star, Network, Music, Disc, Activity, Waves, Heart, Lightbulb, PenLine, Boxes, Workflow, GitFork, Loader, GitBranch, Clock, Layers, FileText, CircleDashed, Mountain, Settings, Settings2 } from 'lucide-react';

/**
 * M1-4' QL Flowering Panel
 * Six-Position Framework (Mod6): #0-#5 with extensibility
 */
export function M14View() {
  const positions = [
    { num: 0, name: 'Implicit', color: 'bg-red-500', desc: 'Ground/Source' },
    { num: 1, name: 'Material', color: 'bg-amber-500', desc: 'Definition/Form' },
    { num: 2, name: 'Processual', color: 'bg-emerald-500', desc: 'Operation/Process' },
    { num: 3, name: 'Mediation', color: 'bg-cyan-500', desc: 'Pattern/Symbol' },
    { num: 4, name: 'Context', color: 'bg-violet-500', desc: 'Embodiment/Field' },
    { num: 5, name: 'Quintessence', color: 'bg-pink-500', desc: 'Integration/Synthesis' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="w-24 h-24 mx-auto">
          <Flower2 size={96} className="text-violet-400" strokeWidth={1} />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Six-Position Framework
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Mod6 Logic System - Extensible for logical augmentation
        </p>
      </div>

      {/* Description */}
      <div className="bg-[var(--bg-app)]/50 rounded-lg p-4 border border-[var(--border-subtle)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
          The Blooming Logic
        </h3>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Systematic quaternal development through 6 positions.
          Nested structure generation with Mod6 extensibility for
          logical augmentation. The formal logic system of Paramasiva.
        </p>
      </div>

      {/* Flower Visualization */}
      <div className="bg-black/40 rounded-lg p-6 border border-violet-500/30">
        <div className="text-xs text-[var(--text-tertiary)] mb-4 text-center">
          SIX-POSITION FLOWER
        </div>

        <div className="relative w-48 h-48 mx-auto">
          {/* Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center border-2 border-white/20">
              <span className="text-sm font-bold text-white">QL</span>
            </div>
          </div>

          {/* Petals */}
          {positions.map((pos, i) => {
            const angle = (i * 60 - 90) * (Math.PI / 180);
            const radius = 80;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <div
                key={pos.num}
                className="absolute w-14 h-14 rounded-lg flex flex-col items-center justify-center border-2 border-white/20"
                style={{
                  left: `calc(50% + ${x}px - 28px)`,
                  top: `calc(50% + ${y}px - 28px)`,
                  backgroundColor: `${pos.color.replace('bg-', '')}`,
                }}
              >

                <span className="text-lg font-bold text-white">#{pos.num}</span>
                <span className="text-[8px] text-white/80">{pos.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Position Details */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          Position Details
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {positions.map((pos) => (
            <div
              key={pos.num}
              className="bg-white/5 rounded-lg p-3 border border-white/10"
            >

              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded ${pos.color}`} />
                <div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    #{pos.num} {pos.name}
                  </div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">
                    {pos.desc}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div >

      {/* Mod6 Property */}
      < div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-lg p-3 border border-violet-500/20" >
        <div className="text-[10px] text-[var(--text-tertiary)] mb-1">
          MOD6 EXTENSIBILITY
        </div>
        <p className="text-xs text-[var(--text-secondary)]">
          Framework supports infinite logical augmentation through modular extension
        </p>
      </div >
    </div >
  );
}

export default M14View;