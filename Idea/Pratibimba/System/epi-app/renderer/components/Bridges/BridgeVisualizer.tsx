import React from 'react';
import { BRIDGES } from './CrossDomainBridges';
import { ArrowRight, ArrowLeft, GitBranch } from 'lucide-react';

export function BridgeVisualizer() {
  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Cross-Domain Bridges</h2>
        <p className="text-sm text-[var(--text-secondary)]">5 integration bridges connecting M' domains</p>
      </div>

      <div className="space-y-4">
        {BRIDGES.map((bridge) => (
          <div
            key={bridge.id}
            className="bg-white/5 rounded-lg p-4 border border-white/10"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <GitBranch size={16} className="text-cyan-400" />
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {bridge.name}
                  </span>
                </div>
                <div className="text-[10px] text-[var(--text-tertiary)] font-mono">
                  {bridge.id}
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400">
                  {bridge.source.split(' ')[0]}
                </span>
                {bridge.id.includes('Mobius') ? (
                  <>
                    <ArrowLeft size={16} className="text-purple-400" />
                    <ArrowRight size={16} className="text-purple-400" />
                  </>
                ) : (
                  <ArrowRight size={16} className="text-[var(--text-tertiary)]" />
                )}
                <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded text-purple-400">
                  {bridge.target.split(' ')[0].replace(' &', '')}
                </span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              {bridge.description}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg p-4 border border-cyan-500/20">
        <div className="text-[10px] text-[var(--text-tertiary)] mb-2">BRIDGE STATUS</div>
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          <div>
            <div className="text-green-400 mb-1">●</div>
            <div className="text-[var(--text-tertiary)]">M2→M3</div>
          </div>
          <div>
            <div className="text-green-400 mb-1">●</div>
            <div className="text-[var(--text-tertiary)]">M4→M3</div>
          </div>
          <div>
            <div className="text-green-400 mb-1">●</div>
            <div className="text-[var(--text-tertiary)]">M4→M5</div>
          </div>
          <div>
            <div className="text-purple-400 mb-1">↔</div>
            <div className="text-[var(--text-tertiary)]">Möbius</div>
          </div>
          <div>
            <div className="text-green-400 mb-1">●</div>
            <div className="text-[var(--text-tertiary)]">M2→M5</div>
          </div>
        </div>
      </div>
    </div>
  );
}
