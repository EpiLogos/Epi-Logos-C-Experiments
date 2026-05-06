/**
 * Navigation Configuration Types and Loader
 * Location: ~/.epi-logos/navigation-config.yaml
 */

export interface HotkeyConfig {
  domain_switch: {
    pattern: string;
    description: string;
  };
  inner_stratum_next: {
    pattern: string;
    description: string;
  };
  inner_stratum_prev: {
    pattern: string;
    description: string;
  };
  inner_stratum_direct: {
    pattern: string;
    description: string;
  };
  omnipanel_toggle: {
    pattern: string;
    description: string;
  };
}

export interface CustomCommand {
  name: string;
  hotkey: string;
  target: string;
  description?: string;
}

export interface NavigationConfig {
  hotkeys: HotkeyConfig;
  custom_commands: CustomCommand[];
}

/**
 * Default navigation configuration
 */
export const DEFAULT_NAV_CONFIG: NavigationConfig = {
  hotkeys: {
    domain_switch: {
      pattern: 'Cmd+Shift+{domain_number}',
      description: 'Switch to M0\'-M5\' domain'
    },
    inner_stratum_next: {
      pattern: 'Cmd+>',
      description: 'Navigate to next inner stratum'
    },
    inner_stratum_prev: {
      pattern: 'Cmd+<',
      description: 'Navigate to previous inner stratum'
    },
    inner_stratum_direct: {
      pattern: 'Cmd+{stratum_number}',
      description: 'Jump directly to stratum 0\'-5\''
    },
    omnipanel_toggle: {
      pattern: 'ESC',
      description: 'Toggle OmniPanel'
    }
  },
  custom_commands: [
    {
      name: 'Jump to Cymascope',
      hotkey: 'Cmd+Option+C',
      target: 'M2-5\'',
      description: 'Open Parashakti Cymascope panel'
    },
    {
      name: 'Open Library',
      hotkey: 'Cmd+Option+L',
      target: 'M5-0\'',
      description: 'Open Epii Library panel'
    }
  ]
};

/**
 * Parse custom hotkey string into keyboard event matchers
 * Example: "Cmd+Option+C" → { metaKey: true, altKey: true, key: 'c' }
 */
export interface ParsedHotkey {
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  key: string;
}

/**
 * Parse a hotkey string into its components
 */
export function parseHotkey(hotkeyString: string): ParsedHotkey {
  const parts = hotkeyString.toLowerCase().split('+');
  const result: ParsedHotkey = {
    key: parts[parts.length - 1]
  };

  for (const part of parts.slice(0, -1)) {
    switch (part.trim()) {
      case 'cmd':
      case 'command':
        result.metaKey = true;
        break;
      case 'ctrl':
      case 'control':
        result.ctrlKey = true;
        break;
      case 'option':
      case 'alt':
        result.altKey = true;
        break;
      case 'shift':
        result.shiftKey = true;
        break;
    }
  }

  return result;
}

/**
 * Check if keyboard event matches parsed hotkey
 */
export function matchesHotkey(event: KeyboardEvent, hotkey: ParsedHotkey): boolean {
  // Check modifiers
  if (hotkey.metaKey && !event.metaKey) return false;
  if (hotkey.ctrlKey && !event.ctrlKey) return false;
  if (hotkey.altKey && !event.altKey) return false;
  if (hotkey.shiftKey && !event.shiftKey) return false;

  // Check that unexpected modifiers aren't pressed
  if (!hotkey.metaKey && event.metaKey) return false;
  if (!hotkey.ctrlKey && event.ctrlKey) return false;
  if (!hotkey.altKey && event.altKey) return false;
  if (!hotkey.shiftKey && event.shiftKey) return false;

  // Check key
  return event.key.toLowerCase() === hotkey.key.toLowerCase();
}

/**
 * Custom command registry for runtime hotkey registration
 */
class CustomCommandRegistry {
  private commands: Map<string, CustomCommand> = new Map();

  register(command: CustomCommand): void {
    this.commands.set(command.hotkey, command);
  }

  unregister(hotkey: string): void {
    this.commands.delete(hotkey);
  }

  match(event: KeyboardEvent): CustomCommand | null {
    const parsed = parseHotkey(event.key);
    const hotkeyString = [
      parsed.metaKey ? 'Cmd' : '',
      parsed.ctrlKey ? 'Ctrl' : '',
      parsed.altKey ? 'Option' : '',
      parsed.shiftKey ? 'Shift' : '',
      parsed.key
    ]
      .filter(Boolean)
      .join('+');

    return this.commands.get(hotkeyString) || null;
  }

  getAll(): CustomCommand[] {
    return Array.from(this.commands.values());
  }

  loadDefaults(): void {
    DEFAULT_NAV_CONFIG.custom_commands.forEach(cmd => this.register(cmd));
  }
}

export const customCommandRegistry = new CustomCommandRegistry();
