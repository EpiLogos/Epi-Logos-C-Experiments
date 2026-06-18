import type { ComponentProps, ReactNode } from 'react';
import { ConfigPanel } from '../panels/ConfigPanel';
import { CronPanel } from '../panels/CronPanel';
import { ModelsPanel } from '../panels/ModelsPanel';
import { NodesPanel } from '../panels/NodesPanel';
import { SettingsPanel } from '../panels/SettingsPanel';
import { SkillsPanel } from '../panels/SkillsPanel';

function FacetFrame({
  title,
  description,
  sourceLabel,
  onOpenSource,
  children
}: {
  readonly title: string;
  readonly description: string;
  readonly sourceLabel?: string;
  readonly onOpenSource?: () => void;
  readonly children: ReactNode;
}) {
  return (
    <section className="space-y-3" data-test={`gateway-facet-${title.toLowerCase()}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-[var(--border-subtle)] bg-white/5 p-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold">{title}</div>
          <div className="text-[10px] text-[var(--text-tertiary)]">{description}</div>
        </div>
        {sourceLabel && onOpenSource ? (
          <button
            type="button"
            className="px-2 py-1 text-[10px] rounded border border-[var(--border-subtle)]"
            onClick={onOpenSource}
            data-test={`gateway-facet-source-${title.toLowerCase()}`}
          >
            {sourceLabel}
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function NodeFacetView(props: ComponentProps<typeof NodesPanel>) {
  return (
    <FacetFrame title="Nodes" description="Paired gateway devices and node capabilities framed by the capability list.">
      <NodesPanel {...props} />
    </FacetFrame>
  );
}

export function ModelFacetView(props: ComponentProps<typeof ModelsPanel>) {
  return (
    <FacetFrame title="Models" description="Model defaults, fallbacks, and config-backed model map.">
      <ModelsPanel {...props} />
    </FacetFrame>
  );
}

export function SkillFacetView(props: ComponentProps<typeof SkillsPanel> & { readonly onOpenPiAgentSkills?: () => void }) {
  const { onOpenPiAgentSkills, ...panelProps } = props;
  return (
    <FacetFrame
      title="Skills"
      description="Repo-owned PI skill availability with Backend Studio source click-through."
      sourceLabel="Open PI skills"
      onOpenSource={onOpenPiAgentSkills}
    >
      <SkillsPanel {...panelProps} />
    </FacetFrame>
  );
}

export function CronFacetView(props: ComponentProps<typeof CronPanel> & { readonly onOpenChronosCarrier?: () => void }) {
  const { onOpenChronosCarrier, ...panelProps } = props;
  return (
    <FacetFrame
      title="Cron"
      description="Scheduled agent runs linked to the Chronos carrier."
      sourceLabel="Open Chronos"
      onOpenSource={onOpenChronosCarrier}
    >
      <CronPanel {...panelProps} />
    </FacetFrame>
  );
}

export function ConfigFacetView(props: ComponentProps<typeof ConfigPanel>) {
  return (
    <FacetFrame title="Config" description="Schema-aware config editing via configPanelDomain.">
      <ConfigPanel {...props} />
    </FacetFrame>
  );
}

export function SettingsFacetView(props: ComponentProps<typeof SettingsPanel>) {
  return (
    <FacetFrame title="Settings" description="Gateway endpoint, token, theme, and navigation settings.">
      <SettingsPanel {...props} />
    </FacetFrame>
  );
}
