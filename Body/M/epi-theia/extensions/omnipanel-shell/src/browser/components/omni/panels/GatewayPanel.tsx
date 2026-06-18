import { useCallback, useEffect, useState, type ComponentProps } from 'react';
import {
  PENDING_M_READINESS,
  type MExtensionReadinessSnapshot
} from '@pratibimba/m-extension-runtime/lib/common/readiness';
import type { ConnectionState } from '../../../stores/epiClawGatewayStore';
import { ConfigPanel } from './ConfigPanel';
import { CronPanel } from './CronPanel';
import { ModelsPanel } from './ModelsPanel';
import { NodesPanel } from './NodesPanel';
import { SettingsPanel } from './SettingsPanel';
import { SkillsPanel } from './SkillsPanel';
import { CapabilityListView } from '../gateway/CapabilityListView';
import { GatewayHeader } from '../gateway/GatewayHeader';
import { GatewaySubViewSwitcher } from '../gateway/GatewaySubViewSwitcher';
import {
  ConfigFacetView,
  CronFacetView,
  ModelFacetView,
  NodeFacetView,
  SettingsFacetView,
  SkillFacetView
} from '../gateway/GatewayFacetViews';
import {
  normalizeCapabilitiesPayload,
  normalizeGatewaySubView,
  type GatewayCapability,
  type GatewaySubView
} from '../gateway/gatewayModel';

export interface GatewayPanelProps {
  readonly connectionState: ConnectionState;
  readonly gatewayUrl: string;
  readonly readinessSnapshot?: MExtensionReadinessSnapshot;
  readonly initialSubView?: GatewaySubView;
  readonly initialSelectedCapabilityName?: string | null;
  readonly initialTryItDraft?: Record<string, unknown>;
  readonly onSessionStateChange?: (state: {
    readonly activeSubView: GatewaySubView;
    readonly selectedCapabilityName: string | null;
    readonly tryItDraft?: Record<string, unknown>;
  }) => void;
  readonly onReconnect: () => void;
  readonly onActivateDiagnostics: () => void;
  readonly onInvokeGatewayRpc: (method: string, params: Record<string, unknown>) => Promise<unknown>;
  readonly onOpenSource?: (coordinate: string, sourceAnchor: string) => Promise<unknown> | unknown;
  readonly nodesProps: ComponentProps<typeof NodesPanel>;
  readonly modelsProps: ComponentProps<typeof ModelsPanel>;
  readonly skillsProps: ComponentProps<typeof SkillsPanel>;
  readonly cronProps: ComponentProps<typeof CronPanel>;
  readonly configProps: ComponentProps<typeof ConfigPanel>;
  readonly settingsProps: ComponentProps<typeof SettingsPanel>;
}

export function GatewayPanel({
  connectionState,
  gatewayUrl,
  readinessSnapshot = PENDING_M_READINESS,
  initialSubView = 'capabilities',
  initialSelectedCapabilityName = null,
  initialTryItDraft,
  onSessionStateChange,
  onReconnect,
  onActivateDiagnostics,
  onInvokeGatewayRpc,
  onOpenSource,
  nodesProps,
  modelsProps,
  skillsProps,
  cronProps,
  configProps,
  settingsProps
}: GatewayPanelProps) {
  const [activeSubView, setActiveSubView] = useState<GatewaySubView>(normalizeGatewaySubView(initialSubView));
  const [selectedCapabilityName, setSelectedCapabilityName] = useState<string | null>(initialSelectedCapabilityName);
  const [capabilities, setCapabilities] = useState<readonly GatewayCapability[]>([]);
  const [capabilitiesLoading, setCapabilitiesLoading] = useState(false);
  const [capabilitiesError, setCapabilitiesError] = useState<string | null>(null);
  const [tryItDrafts, setTryItDrafts] = useState<Record<string, string>>(() => normalizeTryItDrafts(initialTryItDraft));

  const refreshCapabilities = useCallback(async () => {
    setCapabilitiesLoading(true);
    setCapabilitiesError(null);
    try {
      const payload = await onInvokeGatewayRpc("s4'.mediation.capabilities.list", {});
      const normalized = normalizeCapabilitiesPayload(payload, readinessSnapshot);
      setCapabilities(normalized);
      if (normalized.length === 0) {
        setCapabilitiesError("s4'.mediation.capabilities.list returned no registered capabilities.");
      }
    } catch (err) {
      setCapabilities([]);
      setCapabilitiesError(err instanceof Error ? err.message : String(err));
    } finally {
      setCapabilitiesLoading(false);
    }
  }, [onInvokeGatewayRpc, readinessSnapshot]);

  useEffect(() => {
    if (activeSubView !== 'capabilities') {
      return;
    }
    void refreshCapabilities();
  }, [activeSubView, refreshCapabilities]);

  useEffect(() => {
    setActiveSubView(normalizeGatewaySubView(initialSubView));
  }, [initialSubView]);

  useEffect(() => {
    setSelectedCapabilityName(initialSelectedCapabilityName);
  }, [initialSelectedCapabilityName]);

  useEffect(() => {
    setTryItDrafts(normalizeTryItDrafts(initialTryItDraft));
  }, [initialTryItDraft]);

  useEffect(() => {
    onSessionStateChange?.({
      activeSubView,
      selectedCapabilityName,
      tryItDraft: Object.keys(tryItDrafts).length > 0 ? { ...tryItDrafts } : undefined
    });
  }, [activeSubView, onSessionStateChange, selectedCapabilityName, tryItDrafts]);

  const handleTryItDraftChange = (capabilityName: string, draft: string) => {
    setTryItDrafts(current => ({ ...current, [capabilityName]: draft }));
  };

  const openPiAgentSkills = () => {
    void onOpenSource?.('[[S4]]', 'Body/S/S4/pi-agent/skills');
  };

  const openChronosCarrier = () => {
    void onOpenSource?.('[[Chronos]]', 'Body/S/S4/ta-onta/chronos');
  };

  return (
    <div className="p-6 space-y-4" data-test="gateway-panel">
      <GatewayHeader
        connectionState={connectionState}
        gatewayUrl={gatewayUrl}
        readinessSnapshot={readinessSnapshot}
        capabilitiesLoading={capabilitiesLoading}
        onReconnect={onReconnect}
        onRefreshCapabilities={() => {
          void refreshCapabilities();
        }}
        onActivateDiagnostics={onActivateDiagnostics}
      />
      <GatewaySubViewSwitcher activeSubView={activeSubView} onChange={setActiveSubView} />
      {activeSubView === 'capabilities' ? (
        <CapabilityListView
          capabilities={capabilities}
          loading={capabilitiesLoading}
          error={capabilitiesError}
          readinessSnapshot={readinessSnapshot}
          selectedCapabilityName={selectedCapabilityName}
          tryItDrafts={tryItDrafts}
          onSelectCapability={setSelectedCapabilityName}
          onRefresh={() => {
            void refreshCapabilities();
          }}
          onTryItDraftChange={handleTryItDraftChange}
          onInvokeGatewayRpc={onInvokeGatewayRpc}
        />
      ) : null}
      {activeSubView === 'nodes' ? <NodeFacetView {...nodesProps} /> : null}
      {activeSubView === 'models' ? <ModelFacetView {...modelsProps} /> : null}
      {activeSubView === 'skills' ? <SkillFacetView {...skillsProps} onOpenPiAgentSkills={openPiAgentSkills} /> : null}
      {activeSubView === 'cron' ? <CronFacetView {...cronProps} onOpenChronosCarrier={openChronosCarrier} /> : null}
      {activeSubView === 'config' ? <ConfigFacetView {...configProps} /> : null}
      {activeSubView === 'settings' ? <SettingsFacetView {...settingsProps} /> : null}
    </div>
  );
}

function normalizeTryItDrafts(value: Record<string, unknown> | undefined): Record<string, string> {
  if (!value) {
    return {};
  }
  return Object.fromEntries(Object.entries(value).map(([key, draft]) => [
    key,
    typeof draft === 'string' ? draft : `${JSON.stringify(draft ?? {}, null, 2)}\n`
  ]));
}
