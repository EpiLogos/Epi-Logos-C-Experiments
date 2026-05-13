export interface HotkeyBinding {
  key: string;
  mod?: ('cmd' | 'ctrl' | 'shift' | 'alt')[];
  action: string;
  description: string;
}

const IS_MAC = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

export const HOTKEYS: HotkeyBinding[] = [
  { key: 'Escape', action: 'toggle_omni_panel', description: 'Toggle OmniPanel' },
  { key: '0', action: 'workspace_m0', description: 'Switch to M0 Anuttara (2D Bimba)' },
  { key: '1', action: 'workspace_m4', description: 'Switch to M4 Nara' },
  { key: '/', action: 'open_command_palette', description: 'Open command palette' },
  { key: 'g', mod: ['cmd'], action: 'goto_coordinate', description: 'Go to coordinate' },
  { key: 'i', mod: ['cmd'], action: 'toggle_info_pool', description: 'Toggle KBase info pool' },
  { key: 'd', mod: ['cmd'], action: 'toggle_dimension', description: 'Toggle 2D/3D' },
  { key: 'k', mod: ['cmd'], action: 'open_command_palette', description: 'Open command palette' },
  { key: 's', mod: ['cmd'], action: 'save_flow', description: 'Save flow entry' },
  { key: '1', mod: ['cmd'], action: 'branch_lens_0', description: 'Literal lens' },
  { key: '2', mod: ['cmd'], action: 'branch_lens_1', description: 'Functional lens' },
  { key: '3', mod: ['cmd'], action: 'branch_lens_2', description: 'Structural lens' },
  { key: '4', mod: ['cmd'], action: 'branch_lens_3', description: 'Archetypal lens' },
  { key: '5', mod: ['cmd'], action: 'branch_lens_4', description: 'Paradigmatic lens' },
  { key: '6', mod: ['cmd'], action: 'branch_lens_5', description: 'Integral lens' },
];

export function matchesHotkey(e: KeyboardEvent, binding: HotkeyBinding): boolean {
  if (e.key !== binding.key) return false;
  const mods = binding.mod ?? [];
  const cmdOrCtrl = IS_MAC ? e.metaKey : e.ctrlKey;
  if (mods.includes('cmd') || mods.includes('ctrl')) {
    if (!cmdOrCtrl) return false;
  } else if (cmdOrCtrl) return false;
  if (mods.includes('shift') !== e.shiftKey) return false;
  if (mods.includes('alt') !== e.altKey) return false;
  return true;
}

export function parseHotkeyLabel(binding: HotkeyBinding): string {
  const parts: string[] = [];
  const mods = binding.mod ?? [];
  if (mods.includes('cmd') || mods.includes('ctrl')) {
    parts.push(IS_MAC ? '⌘' : 'Ctrl');
  }
  if (mods.includes('shift')) parts.push(IS_MAC ? '⇧' : 'Shift');
  if (mods.includes('alt')) parts.push(IS_MAC ? '⌥' : 'Alt');
  parts.push(binding.key.length === 1 ? binding.key.toUpperCase() : binding.key);
  return parts.join(IS_MAC ? '' : '+');
}
