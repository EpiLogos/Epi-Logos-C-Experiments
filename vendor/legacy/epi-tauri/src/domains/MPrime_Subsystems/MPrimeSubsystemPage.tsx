import { projectKernelHarmonicConsumer } from '@/services/kernelProjection';
import type { PortalRuntimeState } from '@/services/types';

interface MPrimeSubsystemPageProps {
  runtime: PortalRuntimeState | null;
}

export function MPrimeSubsystemPage({ runtime }: MPrimeSubsystemPageProps) {
  const consumer = projectKernelHarmonicConsumer(runtime);
  const profile = runtime?.kernel?.harmonicProfile ?? null;

  if (!runtime?.kernel || !profile || !consumer.available) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-xl rounded-3xl border border-neutral-800 bg-neutral-950/90 p-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">M' 4+2</p>
          <h2 className="mt-3 text-2xl font-semibold text-neutral-100">Subsystem page unavailable</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-400">
            The shared temporal kernel projection is unavailable or blocked, so this deep subsystem
            surface cannot render canonical runtime state honestly yet.
          </p>
        </div>
      </div>
    );
  }

  const activeRibbon = [
    `Tick ${profile.tick12}`,
    `Lens ${profile.codonRotationProjection.lensLabel}`,
    `Mode ${profile.codonRotationProjection.modeName}`,
    profile.phase,
  ];

  return (
    <div className="h-full overflow-auto bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.12),_transparent_30%),#030712]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-6">
        <header className="rounded-[28px] border border-neutral-800 bg-neutral-950/80 p-5 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-300">MPrime</p>
              <h1 className="mt-2 text-3xl font-semibold text-neutral-100 md:text-4xl">
                M' 4+2 Subsystem map
              </h1>
              <p className="mt-3 text-sm leading-6 text-neutral-400 md:text-base">
                The deep 4+2 layer opens the four operational subsystems through the two
                integrative poles. Every panel below reads the same canonical runtime profile
                rather than inventing local matheme logic.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeRibbon.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </header>

        <section aria-label="Integrative poles" className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-800" />
            <p className="text-[11px] uppercase tracking-[0.26em] text-neutral-500">
              Integrative poles
            </p>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SubsystemPanel
              accent="from-violet-500/30 via-violet-400/10 to-transparent"
              code="M0'"
              title="Anuttara"
              subtitle="Source-language / grounding pole"
              detailLines={[
                `Ground owner ${runtime.kernel.coordinateOwner}`,
                `Bedrock ${profile.bedrock.psychoidNumber}`,
                `Pointer source ${profile.pointerAnchor.sourceCoordinate}`,
                `Anchor ${profile.pointerAnchor.lensAnchor}`,
              ]}
              footer="Grounds the field before articulation and keeps the subsystem map tied to canonical pointer law."
            />

            <SubsystemPanel
              accent="from-sky-500/30 via-sky-400/10 to-transparent"
              code="M5'"
              title="Epii"
              subtitle="Conversational-agentic integration pole"
              detailLines={[
                `Ask Epii from ${profile.contextFrames.activeAgent ?? 'the active context frame'}`,
                `Teach from ${profile.contextFrames.activeFrame ?? 'the current frame'}`,
                `Review with generation ${runtime.kernel.generation}`,
                `Trace from ${runtime.day_id}`,
              ]}
              footer="Agent-led entry stays primary here: teach, review, trace, or execute from the live runtime instead of dropping into an inspector wall."
            />
          </div>
        </section>

        <section aria-label="Operational field" className="space-y-3 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-800" />
            <p className="text-[11px] uppercase tracking-[0.26em] text-neutral-500">
              Operational field
            </p>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SubsystemPanel
              accent="from-fuchsia-500/30 via-fuchsia-400/10 to-transparent"
              code="M1'"
              title="QL musical derivation"
              subtitle="Harmonic pointer web / relational movement"
              detailLines={[
                `Lens ${profile.codonRotationProjection.lensLabel}`,
                `Mode ${profile.codonRotationProjection.modeName}`,
                profile.ratioRole,
                `CF ${profile.diatonic?.contextFrame ?? 'unavailable'}`,
              ]}
              footer="The active lens-mode pair is carried in the shared profile and becomes the movement grammar for the field."
              active
            />

            <SubsystemPanel
              accent="from-amber-400/30 via-amber-300/10 to-transparent"
              code="M2'"
              title="Vimarsha"
              subtitle="Lensing / audio-genesis reading"
              detailLines={[
                `110 Hz · 123.47 Hz · 138.59 Hz · 146.83 Hz`,
                `164.81 Hz · 185 Hz · 207.65 Hz · 220 Hz`,
                `bimba 7:8 · bimba 4:2`,
                `pratibimba 8:4 · pratibimba 5:6`,
              ]}
              footer="Audio octet and nodal quartet are read directly from the canonical profile fixture, not recomputed in the renderer."
              active
            />

            <SubsystemPanel
              accent="from-emerald-500/30 via-emerald-300/10 to-transparent"
              code="M3'"
              title="Mahamaya"
              subtitle="Codon-rotation / symbolic transcription"
              detailLines={[
                `Binary codon ${profile.binary.codon ?? 'unavailable'} · ${profile.binary.hexagram ?? '—'}`,
                `Rotation ${profile.codonRotationProjection.codon} · surface ${profile.codonRotationProjection.surfaceIndex}`,
                `${profile.codonRotationProjection.rotationDegrees} deg · ${profile.codonRotationProjection.codonClass}`,
                profile.binary.transcriptionState,
              ]}
              footer="This surface reads the codon-rotation projection already carried by the profile instead of running local LUT derivations."
              active
            />

            <SubsystemPanel
              accent="from-rose-500/30 via-rose-300/10 to-transparent"
              code="M4'"
              title="Nara"
              subtitle="Personal resonance / protected activity"
              detailLines={[
                `${consumer.resonance?.toFixed(2) ?? 'no'} resonance`,
                consumer.conjugateFormCharacter ?? 'no conjugate form',
                `DAY ${runtime.day_id}`,
                'Protected-local field summary only',
              ]}
              footer="Only safe resonance and conjugate-form context surface here. Identity handles, natal sources, and raw journal bodies remain closed."
              active
            />
          </div>
        </section>
      </div>
    </div>
  );
}

interface SubsystemPanelProps {
  accent: string;
  code: string;
  title: string;
  subtitle: string;
  detailLines: string[];
  footer: string;
  active?: boolean;
}

function SubsystemPanel({
  accent,
  code,
  title,
  subtitle,
  detailLines,
  footer,
  active = false,
}: SubsystemPanelProps) {
  return (
    <article className="relative overflow-hidden rounded-[28px] border border-neutral-800 bg-neutral-950/85 p-5">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent}`} />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">{code}</p>
            <h2 className="mt-2 text-xl font-semibold text-neutral-100">{title}</h2>
            <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>
          </div>
          {active && (
            <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-neutral-300">
              Active
            </span>
          )}
        </div>

        <div className="mt-5 space-y-2">
          {detailLines.map((line) => (
            <p key={line} className="text-sm leading-6 text-neutral-200">
              {line}
            </p>
          ))}
        </div>

        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="text-xs leading-5 text-neutral-400">{footer}</p>
        </div>
      </div>
    </article>
  );
}
