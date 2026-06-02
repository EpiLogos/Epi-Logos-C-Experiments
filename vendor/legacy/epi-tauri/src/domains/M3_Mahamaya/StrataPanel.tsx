import { useState } from 'react';
import { useClockStore } from '@/stores/clockStore';
import type { PortalClockState, ActiveCodon, PlanetaryAspect, KairosState } from '@/services/types';
import { Dna, Hexagon, Star, Circle, Layers } from 'lucide-react';

type Stratum = 'su2' | 'iching' | 'codon' | 'tarot' | 'planetary';

const STRATA: { id: Stratum; label: string; icon: React.ReactNode }[] = [
  { id: 'su2', label: 'SU(2)', icon: <Circle size={13} /> },
  { id: 'iching', label: 'I-Ching', icon: <Hexagon size={13} /> },
  { id: 'codon', label: 'Codon', icon: <Dna size={13} /> },
  { id: 'tarot', label: 'Tarot', icon: <Star size={13} /> },
  { id: 'planetary', label: 'Planets', icon: <Layers size={13} /> },
];

function SU2View({ state }: { state: PortalClockState }) {
  const q = state.live_quaternion;
  const composed = state.composed_quaternion;
  const quint = state.quintessence_quaternion;

  const renderQ = (label: string, quat: [number, number, number, number]) => (
    <div className="rounded border border-neutral-800 p-2">
      <span className="text-[10px] text-neutral-500">{label}</span>
      <div className="font-mono text-xs text-neutral-300 mt-1">
        w={quat[0].toFixed(3)} x={quat[1].toFixed(3)} y={quat[2].toFixed(3)} z={quat[3].toFixed(3)}
      </div>
      <div className="text-[10px] text-neutral-600 mt-0.5">
        |q| = {Math.sqrt(quat.reduce((s, v) => s + v * v, 0)).toFixed(4)}
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      {renderQ('Live (transit ⊗ quintessence)', q)}
      {renderQ('Composed', composed)}
      {renderQ('Quintessence', quint)}
      <div className="rounded border border-neutral-800 p-2">
        <span className="text-[10px] text-neutral-500">Transform Stage</span>
        <span className="font-mono text-xs text-neutral-300 ml-2">{state.transform_stage}</span>
        <span className="text-neutral-600 mx-1">·</span>
        <span className="text-[10px] text-neutral-500">Logos</span>
        <span className="font-mono text-xs text-neutral-300 ml-2">{state.logos_stage}</span>
      </div>
    </div>
  );
}

function IChingView({ state }: { state: PortalClockState }) {
  const kairos = state.kairos;

  const renderHexagram = (label: string, idx: number) => {
    const lines = [];
    for (let i = 5; i >= 0; i--) {
      const bit = (idx >> i) & 1;
      lines.push(
        <div key={i} className="flex gap-1 justify-center my-0.5">
          {bit ? (
            <div className="w-8 h-1 bg-neutral-300 rounded" />
          ) : (
            <>
              <div className="w-3 h-1 bg-neutral-300 rounded" />
              <div className="w-3 h-1 bg-neutral-300 rounded" />
            </>
          )}
        </div>,
      );
    }

    return (
      <div className="rounded border border-neutral-800 p-3 text-center">
        <span className="text-[10px] text-neutral-500 block mb-2">{label}</span>
        {lines}
        <span className="text-xs font-mono text-neutral-400 mt-2 block">#{idx}</span>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {kairos.planets.length > 0 && renderHexagram('Primary', kairos.planets[0]?.transiting_hex ?? 0)}
        {kairos.planets.length > 1 && renderHexagram('Temporal', kairos.planets[1]?.transiting_hex ?? 0)}
      </div>
      <div className="rounded border border-neutral-800 p-2 text-xs">
        <span className="text-neutral-500">Hour Planet:</span>
        <span className="font-mono text-neutral-300 ml-2">{kairos.hour_planet}</span>
        <span className="text-neutral-600 mx-2">·</span>
        <span className="text-neutral-500">Hour:</span>
        <span className="font-mono text-neutral-300 ml-2">{kairos.current_hour}</span>
      </div>
    </div>
  );
}

function CodonView({ codon }: { codon: ActiveCodon }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded border border-neutral-800 p-3">
          <span className="text-[10px] text-neutral-500 block">Codon A</span>
          <span className="font-mono text-lg text-amber-400">{codon.codon_a}</span>
          <span className="text-xs text-neutral-500 ml-2">{codon.class_a}</span>
          <div className="text-[10px] text-neutral-600 mt-1">
            seq: [{codon.sequence_a.join(', ')}]
          </div>
        </div>
        <div className="rounded border border-neutral-800 p-3">
          <span className="text-[10px] text-neutral-500 block">Codon B</span>
          <span className="font-mono text-lg text-amber-400">{codon.codon_b}</span>
          <span className="text-xs text-neutral-500 ml-2">{codon.class_b}</span>
        </div>
      </div>
      <div className="rounded border border-neutral-800 p-2 flex items-center gap-3 text-xs">
        <div>
          <span className="text-neutral-500">Amino Acid:</span>
          <span className="font-mono text-neutral-300 ml-1">{codon.amino_acid}</span>
        </div>
        <div>
          <span className="text-neutral-500">Anticodon:</span>
          <span className="font-mono text-neutral-300 ml-1">{codon.anticodon}</span>
        </div>
        <div>
          <span className="text-neutral-500">Rotations:</span>
          <span className="font-mono text-neutral-300 ml-1">{codon.rotation_count_a}</span>
        </div>
      </div>
    </div>
  );
}

function TarotView({ state }: { state: PortalClockState }) {
  const kairos = state.kairos;

  return (
    <div className="space-y-2">
      {kairos.planets.slice(0, 7).map((planet, i) => (
        <div key={i} className="rounded border border-neutral-800 p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-mono text-neutral-400">
              {i}
            </span>
            <div>
              <span className="text-xs text-neutral-300">{planet.degree.toFixed(1)}°</span>
              {planet.is_retrograde && <span className="text-[10px] text-red-400 ml-1">Rx</span>}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-neutral-500">Tarot:</span>
            <span className="font-mono text-xs text-neutral-300 ml-1">{planet.transiting_tarot}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PlanetaryView({ aspects }: { aspects: PlanetaryAspect[] }) {
  const ASPECT_NAMES: Record<number, string> = {
    0: 'Conjunction',
    60: 'Sextile',
    90: 'Square',
    120: 'Trine',
    180: 'Opposition',
  };

  return (
    <div className="space-y-2">
      {aspects.length === 0 ? (
        <p className="text-xs text-neutral-600">No active aspects</p>
      ) : (
        aspects.map((a, i) => (
          <div key={i} className="rounded border border-neutral-800 p-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-neutral-400">{a.planet_a}</span>
              <span className="text-neutral-600">↔</span>
              <span className="font-mono text-neutral-400">{a.planet_b}</span>
            </div>
            <div className="text-right text-xs">
              <span className="text-neutral-300">
                {ASPECT_NAMES[a.aspect_type] ?? `type ${a.aspect_type}`}
              </span>
              <span className="text-neutral-600 ml-2">{a.angle.toFixed(1)}° orb {a.orb.toFixed(1)}°</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export function StrataPanel() {
  const { state: clockState } = useClockStore();
  const [activeStratum, setActiveStratum] = useState<Stratum>('su2');

  if (!clockState) {
    return (
      <div className="p-4 text-center text-neutral-600 text-sm">
        Clock state unavailable
      </div>
    );
  }

  const renderContent = () => {
    switch (activeStratum) {
      case 'su2':
        return <SU2View state={clockState} />;
      case 'iching':
        return <IChingView state={clockState} />;
      case 'codon':
        return <CodonView codon={clockState.active_codon} />;
      case 'tarot':
        return <TarotView state={clockState} />;
      case 'planetary':
        return <PlanetaryView aspects={clockState.aspects} />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Stratum Tabs */}
      <div className="flex gap-1">
        {STRATA.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveStratum(s.id)}
            className={`flex items-center gap-1 px-2 py-1.5 rounded text-[11px] transition-colors ${
              activeStratum === s.id
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-600 hover:text-neutral-400 hover:bg-neutral-900'
            }`}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}
