import { useEffect, useState, Suspense, lazy } from 'react';
import { useClockStore } from '@/stores/clockStore';
import { useGraphStore } from '@/stores/graphStore';
import { useTemporalStore } from '@/stores/temporalStore';
import { useUiStore } from '@/stores/uiStore';
import { projectKernelHarmonicConsumer } from '@/services/kernelProjection';
import { Activity, Eye, Layers, Clock, Compass, ChevronDown, ChevronUp } from 'lucide-react';
import { StrataPanel } from '@/domains/M3_Mahamaya/StrataPanel';

const HopfClock = lazy(() =>
  import('@/domains/M3_Mahamaya/HopfClock').then((m) => ({ default: m.HopfClock })),
);

const LENS_NAMES = ['Literal', 'Functional', 'Structural', 'Archetypal', 'Paradigmatic', 'Integral'];
const LENS_COLORS = ['#94a3b8', '#a78bfa', '#f472b6', '#fb923c', '#4ade80', '#38bdf8'];

function QuaternionRing({ q }: { q: [number, number, number, number] }) {
  const [w, x, y, z] = q;
  const angle = 2 * Math.acos(Math.min(1, Math.abs(w)));
  const deg = (angle * 180) / Math.PI;

  return (
    <div className="relative w-20 h-20">
      <svg viewBox="0 0 80 80" className="w-full h-full">
        <circle cx="40" cy="40" r="35" fill="none" stroke="#262626" strokeWidth="3" />
        <circle
          cx="40"
          cy="40"
          r="35"
          fill="none"
          stroke="#a78bfa"
          strokeWidth="3"
          strokeDasharray={`${(deg / 360) * 220} 220`}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
        />
        <circle cx={40 + x * 30} cy={40 - y * 30} r="3" fill="#f472b6" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-mono text-neutral-500">{deg.toFixed(0)}°</span>
      </div>
    </div>
  );
}

function PhaseWheel({ degree }: { degree: number }) {
  const angleDeg = degree;
  const rad = (angleDeg * Math.PI) / 180;
  const px = 40 + 28 * Math.cos(rad - Math.PI / 2);
  const py = 40 + 28 * Math.sin(rad - Math.PI / 2);

  return (
    <div className="relative w-24 h-24">
      <svg viewBox="0 0 80 80" className="w-full h-full">
        <circle cx="40" cy="40" r="34" fill="none" stroke="#1a1a1a" strokeWidth="1" />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i * Math.PI * 2) / 6 - Math.PI / 2;
          return (
            <circle
              key={i}
              cx={40 + 34 * Math.cos(a)}
              cy={40 + 34 * Math.sin(a)}
              r="2"
              fill={LENS_COLORS[i]}
              opacity={0.5}
            />
          );
        })}
        <line x1="40" y1="40" x2={px} y2={py} stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx={px} cy={py} r="3" fill="#e2e8f0" />
        <circle cx="40" cy="40" r="2" fill="#525252" />
      </svg>
    </div>
  );
}

function BranchLensBar() {
  const { activeBranchLens, setBranchLens } = useUiStore();

  return (
    <div className="flex gap-0.5 px-3">
      {LENS_NAMES.map((name, i) => (
        <button
          key={i}
          onClick={() => setBranchLens(i)}
          className={`flex-1 py-1 text-[9px] rounded transition-colors ${
            activeBranchLens === i
              ? 'text-white'
              : 'text-neutral-600 hover:text-neutral-400'
          }`}
          style={activeBranchLens === i ? { backgroundColor: `${LENS_COLORS[i]}20`, color: LENS_COLORS[i] } : undefined}
          title={`L${i} ${name} (⌘${i + 1})`}
        >
          {name.slice(0, 3)}
        </button>
      ))}
    </div>
  );
}

function ClockReadout() {
  const { state: clockState, walkMode, bifurcation } = useClockStore();

  if (!clockState) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-700">
        <div className="text-center">
          <Clock size={24} className="mx-auto mb-2 opacity-40" />
          <p className="text-xs">Clock offline</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-3">
      {/* Phase Wheel + Quaternion */}
      <div className="flex items-center justify-around">
        <PhaseWheel degree={clockState.current_degree} />
        <QuaternionRing q={clockState.live_quaternion} />
      </div>

      {/* Walk Mode */}
      <div className="flex items-center gap-2 text-xs">
        <Compass size={12} className="text-neutral-500" />
        <span className="text-neutral-400">Walk:</span>
        <span className="font-mono text-neutral-300">{walkMode ?? '—'}</span>
        {bifurcation && (
          <>
            <span className="text-neutral-600">|</span>
            <span className="text-neutral-400">Bifurc:</span>
            <span className="font-mono text-neutral-300">
              {bifurcation[0].toFixed(2)} ({bifurcation[1]})
            </span>
          </>
        )}
      </div>

      {/* Active Codon */}
      {clockState.active_codon && (
        <div className="rounded border border-neutral-800 p-2">
          <div className="flex items-center gap-2 mb-1">
            <Layers size={12} className="text-neutral-500" />
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">Active Codon</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-amber-400">
              {clockState.active_codon.class_a}
            </span>
            <span className="text-[10px] text-neutral-600">
              codon {clockState.active_codon.codon_a}
            </span>
          </div>
        </div>
      )}

      {/* Planetary Aspects */}
      {clockState.aspects.length > 0 && (
        <div className="rounded border border-neutral-800 p-2">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={12} className="text-neutral-500" />
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">Aspects</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {clockState.aspects.slice(0, 6).map((a: { planet_a: number; planet_b: number; angle: number }, i: number) => (
              <span
                key={i}
                className="text-[10px] font-mono bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-400"
              >
                {a.planet_a}↔{a.planet_b} {a.angle.toFixed(0)}°
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TemporalStrip() {
  const { runtime } = useTemporalStore();
  const kernel = projectKernelHarmonicConsumer(runtime);

  return (
    <div className="px-3 py-2 border-t border-neutral-800">
      <div className="flex items-center gap-2 text-[10px] text-neutral-500">
        <Eye size={10} />
        <span>{runtime?.day_id ?? 'No day'}</span>
        <span className="text-neutral-700">|</span>
        <span className="font-mono">{runtime?.now_path ?? '—'}</span>
        <span className="text-neutral-700">|</span>
        <span className="font-mono">
          {kernel.available ? `${kernel.element} ${kernel.pulseRatio}` : 'kernel —'}
        </span>
      </div>
    </div>
  );
}

export function ClockCosmos() {
  const { fetch: fetchClock, subscribe: subscribeClock } = useClockStore();
  const { subscribe: subscribeTemporal, fetch: fetchTemporal } = useTemporalStore();
  const [showHopf, setShowHopf] = useState(false);
  const [showStrata, setShowStrata] = useState(false);

  useEffect(() => {
    fetchClock();
    fetchTemporal();
    const unsubs = [subscribeClock(), subscribeTemporal()];
    return () => unsubs.forEach((u) => u());
  }, [fetchClock, fetchTemporal, subscribeClock, subscribeTemporal]);

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Header */}
      <div className="px-3 py-2 border-b border-neutral-800 flex items-center justify-between">
        <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
          Clock Cosmos
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => setShowHopf(!showHopf)}
            className={`px-1.5 py-0.5 rounded text-[9px] transition-colors ${
              showHopf ? 'bg-violet-500/20 text-violet-400' : 'text-neutral-600 hover:text-neutral-400'
            }`}
            title="Toggle Hopf fibration view"
          >
            S³
          </button>
          <button
            onClick={() => setShowStrata(!showStrata)}
            className={`px-1.5 py-0.5 rounded text-[9px] transition-colors ${
              showStrata ? 'bg-violet-500/20 text-violet-400' : 'text-neutral-600 hover:text-neutral-400'
            }`}
            title="Toggle M3 strata panel"
          >
            {showStrata ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>
        </div>
      </div>

      {/* Branch Lens Selector */}
      <div className="py-2 border-b border-neutral-800">
        <BranchLensBar />
      </div>

      {/* Hopf 3D View */}
      {showHopf && (
        <div className="h-48 border-b border-neutral-800">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full text-neutral-700 text-xs">
                Loading Hopf...
              </div>
            }
          >
            <HopfClock />
          </Suspense>
        </div>
      )}

      {/* Clock Readout — scrollable body */}
      <div className="flex-1 min-h-0 overflow-auto py-3">
        <ClockReadout />

        {/* M3 Strata */}
        {showStrata && (
          <div className="px-3 pt-3 border-t border-neutral-800 mt-3">
            <StrataPanel />
          </div>
        )}
      </div>

      {/* Temporal footer */}
      <TemporalStrip />
    </div>
  );
}
