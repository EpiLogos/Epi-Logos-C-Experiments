import { useEffect, useMemo, useState } from 'react';
import {
  Bot,
  ChevronRight,
  Clock3,
  FileSearch,
  HeartPulse,
  MessagesSquare,
  Orbit,
} from 'lucide-react';
import { useTemporalStore } from '@/stores/temporalStore';
import { agentExecutionClient } from '@/services/agentExecutionClient';
import { projectKernelHarmonicConsumer } from '@/services/kernelProjection';
import type {
  AgentDescriptor,
  KernelProfileObservationEvent,
  NaraActivityEvent,
  PortalRuntimeState,
} from '@/services/types';
import { EpiiAgent, type EpiiConversationStatus } from './EpiiAgent';

type EpiiPane = 'none' | 'resonance' | 'inspector' | 'handles' | 'reflection';

export interface EpiiConversationSurfaceProps {
  runtime: PortalRuntimeState | null;
  conversationStatus: EpiiConversationStatus;
  specialists: AgentDescriptor[];
  latestNaraActivity?: NaraActivityEvent | null;
  latestProfileObservation?: KernelProfileObservationEvent | null;
}

export function EpiiConversationSurface({
  runtime,
  conversationStatus,
  specialists,
  latestNaraActivity = null,
  latestProfileObservation = null,
}: EpiiConversationSurfaceProps) {
  const [activePane, setActivePane] = useState<EpiiPane>('none');
  const summary = useMemo(
    () => buildConversationSummary(runtime, latestNaraActivity),
    [runtime, latestNaraActivity],
  );
  const naraLine = useMemo(() => buildNaraLine(latestNaraActivity), [latestNaraActivity]);
  const profileLine = useMemo(
    () => buildProfileObservationLine(latestProfileObservation),
    [latestProfileObservation],
  );

  const actions: { id: EpiiPane; label: string; icon: React.ReactNode }[] = [
    { id: 'resonance', label: 'Explain this resonance', icon: <HeartPulse size={13} /> },
    { id: 'inspector', label: 'Open inspector', icon: <Orbit size={13} /> },
    { id: 'handles', label: 'Show source handles', icon: <FileSearch size={13} /> },
    { id: 'reflection', label: 'Continue reflection', icon: <MessagesSquare size={13} /> },
  ];

  return (
    <div className="flex h-full flex-col overflow-auto p-4">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-sky-500/15 px-2 py-1 text-[10px] font-mono text-sky-300">
                M5
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Epii conversational return
              </span>
            </div>
            <h2 className="mt-3 text-lg font-medium text-neutral-100">
              A conversational reading of the current matheme
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
              The default M5 surface speaks first and opens technical panes only when you ask.
              It stays inside the shared runtime contracts and never improvises a private story.
            </p>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-right">
            <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">Status</p>
            <p className="mt-1 text-sm text-neutral-200">
              {conversationStatus === 'available'
                ? 'Conversational backend live'
                : conversationStatus === 'pending'
                  ? 'Conversational backend pending'
                  : 'Conversational backend unavailable'}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <ConversationBubble
            title="Epii"
            icon={<Bot size={14} className="text-sky-300" />}
            body={summary}
          />
          <ConversationBubble
            title="Nara signal"
            icon={<Clock3 size={14} className="text-amber-300" />}
            body={naraLine}
          />
          <ConversationBubble
            title="Profile deposit"
            icon={<ChevronRight size={14} className="text-emerald-300" />}
            body={profileLine}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() =>
                setActivePane((current) => (current === action.id ? 'none' : action.id))
              }
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition-colors ${
                activePane === action.id
                  ? 'border-sky-500/40 bg-sky-500/10 text-sky-200'
                  : 'border-neutral-800 bg-neutral-900/70 text-neutral-300 hover:border-neutral-700 hover:text-white'
              }`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {activePane !== 'none' && (
        <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5">
          {activePane === 'resonance' && <ResonancePanel runtime={runtime} />}
          {activePane === 'inspector' && <InspectorPanel runtime={runtime} />}
          {activePane === 'handles' && (
            <SourceHandlesPanel
              runtime={runtime}
              latestNaraActivity={latestNaraActivity}
              latestProfileObservation={latestProfileObservation}
            />
          )}
          {activePane === 'reflection' && (
            <EpiiAgent status={conversationStatus} agents={specialists} />
          )}
        </div>
      )}
    </div>
  );
}

export function EpiiDashboard() {
  const { runtime } = useTemporalStore();
  const [conversationStatus, setConversationStatus] =
    useState<EpiiConversationStatus>('pending');
  const [specialists, setSpecialists] = useState<AgentDescriptor[]>([]);

  useEffect(() => {
    let cancelled = false;
    agentExecutionClient
      .list()
      .then((agents) => {
        if (cancelled) return;
        setSpecialists(agents);
        setConversationStatus(agents.length > 0 ? 'pending' : 'unavailable');
      })
      .catch(() => {
        if (cancelled) return;
        setSpecialists([]);
        setConversationStatus('unavailable');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <EpiiConversationSurface
      runtime={runtime}
      conversationStatus={conversationStatus}
      specialists={specialists}
      latestNaraActivity={null}
      latestProfileObservation={null}
    />
  );
}

function ConversationBubble({
  title,
  icon,
  body,
}: {
  title: string;
  icon: React.ReactNode;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-neutral-500">
        {icon}
        <span>{title}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-neutral-200">{body}</p>
    </div>
  );
}

function ResonancePanel({ runtime }: { runtime: PortalRuntimeState | null }) {
  const kernel = projectKernelHarmonicConsumer(runtime);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <HeartPulse size={16} className="text-sky-300" />
        <h3 className="text-sm font-medium text-neutral-100">Resonance reading</h3>
      </div>
      <p className="text-sm leading-6 text-neutral-300">
        {kernel.resonance == null
          ? 'No resonance score is available in the current profile.'
          : `The current resonance is ${kernel.resonance.toFixed(2)} in ${kernel.conjugateFormCharacter} form. This is the safe public reading already carried by the shared profile, not a renderer-side recalculation.`}
      </p>
      <p className="text-xs leading-5 text-neutral-500">
        The protected personal field stays behind M4 boundaries. M5 only receives the shared
        resonance score, conjugate-form character, and the current qCosmic state for inspection.
      </p>
    </div>
  );
}

function InspectorPanel({ runtime }: { runtime: PortalRuntimeState | null }) {
  const kernel = projectKernelHarmonicConsumer(runtime);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Orbit size={16} className="text-sky-300" />
        <h3 className="text-sm font-medium text-neutral-100">Technical inspector</h3>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        <InspectorRow label="tick12" value={kernel.tick12 ?? '—'} />
        <InspectorRow label="cycle" value={runtime?.kernel?.tick.cycle ?? '—'} />
        <InspectorRow
          label="lens/mode"
          value={kernel.lensMode ? `${kernel.lensMode.lens}/${kernel.lensMode.mode}` : '—'}
        />
        <InspectorRow label="privacy class" value={kernel.profilePrivacyClass ?? '—'} />
        <InspectorRow label="resonance score" value={kernel.resonance?.toFixed(2) ?? '—'} />
        <InspectorRow
          label="conjugate form"
          value={kernel.conjugateFormCharacter ?? '—'}
        />
        <InspectorRow
          label="Codon rotation"
          value={kernel.codonRotationProjection?.codon ?? '—'}
        />
        <InspectorRow
          label="qCosmic"
          value={kernel.qCosmic ? kernel.qCosmic.join(', ') : '—'}
        />
      </dl>
    </div>
  );
}

function SourceHandlesPanel({
  runtime,
  latestNaraActivity,
  latestProfileObservation,
}: {
  runtime: PortalRuntimeState | null;
  latestNaraActivity: NaraActivityEvent | null;
  latestProfileObservation: KernelProfileObservationEvent | null;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileSearch size={16} className="text-sky-300" />
        <h3 className="text-sm font-medium text-neutral-100">Source handles</h3>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        <InspectorRow label="day" value={runtime?.day_id ?? '—'} />
        <InspectorRow label="now path" value={runtime?.now_path ?? '—'} />
        <InspectorRow
          label="matheme handle"
          value={latestNaraActivity?.mathemeHandle ?? 'No safe Nara handle surfaced'}
        />
        <InspectorRow
          label="raw body handle"
          value={latestNaraActivity?.rawBodyHandle ?? 'No protected body handle surfaced'}
        />
        <InspectorRow label="source ref" value={latestNaraActivity?.sourceRef ?? '—'} />
        <InspectorRow
          label="profile observation"
          value={latestProfileObservation?.harmonicMedium ?? 'No profile deposit surfaced'}
        />
      </dl>
    </div>
  );
}

function InspectorRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-3">
      <dt className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">{label}</dt>
      <dd className="mt-2 break-words text-sm text-neutral-200">{String(value)}</dd>
    </div>
  );
}

function buildConversationSummary(
  runtime: PortalRuntimeState | null,
  latestNaraActivity: NaraActivityEvent | null,
): string {
  const kernel = projectKernelHarmonicConsumer(runtime);
  if (!kernel.available) {
    return 'I can see the M5 workbench, but the shared temporal kernel projection is not available yet, so I can only wait for the current matheme state to arrive.';
  }

  const naraAnchor = latestNaraActivity
    ? ` The latest safe Nara anchor is ${latestNaraActivity.kind.toLowerCase()} at ${latestNaraActivity.coordinate}.`
    : ' No safe Nara activity has been surfaced into Epii yet.';

  return `I'm reading the current matheme through the shared harmonic profile. The present tone is ${kernel.chromaticNote}, the active context is ${kernel.contextFrame ?? 'unspecified'}, and the field is speaking through ${kernel.contextAgent ?? 'an unnamed agent'} at tick ${kernel.tick12}. The codon surface is ${kernel.codonRotationProjection?.codon ?? 'not yet available'}, and the public resonance reading is ${kernel.resonance?.toFixed(2) ?? 'not yet available'} in ${kernel.conjugateFormCharacter ?? 'an unresolved'} form.${naraAnchor}`;
}

function buildNaraLine(activity: NaraActivityEvent | null): string {
  if (!activity || !activity.derivedSymbolicObservation) {
    return 'No reviewed Nara activity has reached this surface yet, so Epii is holding the journal side as pending rather than pretending to know what was written.';
  }

  const observation = activity.derivedSymbolicObservation;
  const markers =
    observation.mentionedOracleMarkers.length > 0
      ? `Markers noticed: ${observation.mentionedOracleMarkers.join(', ')}.`
      : 'No explicit oracle markers were surfaced.';

  return `Latest Nara signal: ${activity.kind.toLowerCase()} at ${activity.coordinate}, with ${observation.wordCount} words across ${observation.lineCount} lines and ${observation.confidence.toFixed(2)} heuristic confidence. ${markers}`;
}

function buildProfileObservationLine(
  observation: KernelProfileObservationEvent | null,
): string {
  if (!observation) {
    return 'No deposited profile observation is available yet, so M5 is still waiting for a reviewed harmonic evidence record.';
  }

  return `Latest profile deposit: ${observation.sourceCoordinate} at tick12 ${observation.tick12} / degree720 ${observation.degree720}, carried as ${observation.privacy} evidence over the ${observation.harmonicMedium} contract.`;
}
