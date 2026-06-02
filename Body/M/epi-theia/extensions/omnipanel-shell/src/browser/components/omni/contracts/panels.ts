import type { GatewayPanel } from '../../../stores/epiClawGatewayStore';

export type OmniPanelDefinition = {
  id: GatewayPanel;
  label: string;
};

export const PRIMARY_PANELS: OmniPanelDefinition[] = [
  { id: 'chat', label: 'Chat' },
  { id: 'workspace', label: 'Workspace' },
  { id: 'overview', label: 'Overview' },
  { id: 'channels', label: 'Channels' },
  { id: 'sessions', label: 'Sessions' },
];

export const ADVANCED_PANELS: OmniPanelDefinition[] = [
  { id: 'config', label: 'Config' },
  { id: 'instances', label: 'Instances' },
  { id: 'nodes', label: 'Nodes' },
  { id: 'debug', label: 'Debug' },
  { id: 'logs', label: 'Logs' },
];

export const ALL_PANELS: OmniPanelDefinition[] = [...PRIMARY_PANELS, ...ADVANCED_PANELS];
const GATEWAY_PANEL_IDS = new Set<GatewayPanel>([
  'chat',
  'workspace',
  'models',
  'overview',
  'channels',
  'instances',
  'sessions',
  'cron',
  'skills',
  'nodes',
  'config',
  'debug',
  'logs',
  'settings',
]);

export function isGatewayPanel(panel: string): panel is GatewayPanel {
  return GATEWAY_PANEL_IDS.has(panel as GatewayPanel);
}

export function isAdvancedPanel(panel: GatewayPanel): boolean {
  return ADVANCED_PANELS.some((p) => p.id === panel);
}

export function panelLabel(panel: GatewayPanel): string {
  return ALL_PANELS.find((p) => p.id === panel)?.label ?? panel;
}
