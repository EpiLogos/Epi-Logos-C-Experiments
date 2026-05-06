import type { ConfigUiHint, ConfigUiHints } from '../controllers/epi-claw/types';

type ParsedConfig = Record<string, unknown>;

type JsonSchema = {
  type?: string | string[];
  title?: string;
  description?: string;
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema | JsonSchema[];
  additionalProperties?: JsonSchema | boolean;
  enum?: unknown[];
  const?: unknown;
  default?: unknown;
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  allOf?: JsonSchema[];
  nullable?: boolean;
};

export type ConfigPanelMode = 'form' | 'raw';

export type ConfigEntryKind = 'string' | 'number' | 'boolean' | 'json';

export type ConfigEntry = {
  path: string;
  segments: Array<string | number>;
  value: unknown;
  kind: ConfigEntryKind;
  label: string;
  help?: string;
  placeholder?: string;
  sensitive?: boolean;
  advanced?: boolean;
  enumOptions?: unknown[];
};

export type ConfigSection = {
  key: string;
  label: string;
  description?: string;
  order: number;
};

export type ConfigSubsection = {
  key: string;
  label: string;
};

const SECTION_META: Record<string, { label: string; description?: string }> = {
  env: { label: 'Environment Variables', description: 'Environment variables passed to gateway process' },
  update: { label: 'Updates', description: 'Auto-update settings and release channel' },
  agents: { label: 'Agents', description: 'Agent configurations, models, and identities' },
  auth: { label: 'Authentication', description: 'API keys and authentication profiles' },
  channels: { label: 'Channels', description: 'Messaging channel settings' },
  messages: { label: 'Messages', description: 'Message handling and routing' },
  commands: { label: 'Commands', description: 'Custom slash commands' },
  hooks: { label: 'Hooks', description: 'Webhooks and event hooks' },
  skills: { label: 'Skills', description: 'Skill packs and capabilities' },
  tools: { label: 'Tools', description: 'Tool configurations (browser/search/etc)' },
  gateway: { label: 'Gateway', description: 'Gateway server settings' },
  wizard: { label: 'Setup Wizard', description: 'Setup wizard state and history' },
  meta: { label: 'Metadata', description: 'Gateway metadata and version information' },
  logging: { label: 'Logging', description: 'Log levels and output configuration' },
  browser: { label: 'Browser', description: 'Browser automation settings' },
  ui: { label: 'UI', description: 'User interface preferences' },
  models: { label: 'Models', description: 'AI model configurations and providers' },
  bindings: { label: 'Bindings', description: 'Key bindings and shortcuts' },
  broadcast: { label: 'Broadcast', description: 'Broadcast and notification settings' },
  audio: { label: 'Audio', description: 'Audio input/output settings' },
  session: { label: 'Session', description: 'Session management and persistence' },
  cron: { label: 'Cron', description: 'Scheduled tasks and automation' },
  web: { label: 'Web', description: 'Web server and API settings' },
  discovery: { label: 'Discovery', description: 'Service discovery and networking' },
  canvasHost: { label: 'Canvas Host', description: 'Canvas rendering and display' },
  talk: { label: 'Talk', description: 'Voice and speech settings' },
  plugins: { label: 'Plugins', description: 'Plugin management and extensions' },
};

const META_KEYS = new Set(['title', 'description', 'default', 'nullable']);

export function parseConfigRaw(raw: string): ParsedConfig | null {
  try {
    const parsed = JSON.parse(raw) as ParsedConfig;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function schemaType(schema: JsonSchema | null | undefined): string | undefined {
  if (!schema) return undefined;
  if (Array.isArray(schema.type)) {
    const filtered = schema.type.filter((t) => t !== 'null');
    return filtered[0] ?? schema.type[0];
  }
  return schema.type;
}

function pathKey(path: Array<string | number>): string {
  return path.filter((segment) => typeof segment === 'string').join('.');
}

function parsePath(path: string): Array<string | number> {
  if (!path) return [];
  return path.split('.').map((segment) => {
    if (/^\d+$/.test(segment)) {
      return Number(segment);
    }
    return segment;
  });
}

function humanizeKey(key: string): string {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function isAnySchema(schema: JsonSchema): boolean {
  const keys = Object.keys(schema ?? {}).filter((key) => !META_KEYS.has(key));
  return keys.length === 0;
}

function hintForPath(path: Array<string | number>, hints: ConfigUiHints): ConfigUiHint | undefined {
  const key = pathKey(path);
  const direct = hints[key];
  if (direct) {
    return direct;
  }
  const segments = key.split('.');
  for (const [hintKey, hint] of Object.entries(hints)) {
    if (!hintKey.includes('*')) {
      continue;
    }
    const hintSegments = hintKey.split('.');
    if (hintSegments.length !== segments.length) {
      continue;
    }
    let match = true;
    for (let i = 0; i < segments.length; i += 1) {
      if (hintSegments[i] !== '*' && hintSegments[i] !== segments[i]) {
        match = false;
        break;
      }
    }
    if (match) {
      return hint;
    }
  }
  return undefined;
}

function schemaTopLevelProperties(schema: unknown): Record<string, JsonSchema> {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    return {};
  }
  const candidate = (schema as { properties?: unknown }).properties;
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    return {};
  }
  return candidate as Record<string, JsonSchema>;
}

function getSchemaNodeBySegments(schema: unknown, path: Array<string | number>): JsonSchema | null {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    return null;
  }
  let node: JsonSchema | null = schema as JsonSchema;
  for (const segment of path) {
    if (!node || typeof node !== 'object') {
      return null;
    }
    const type = schemaType(node);
    if (typeof segment === 'number') {
      if (type !== 'array') {
        return null;
      }
      node = (Array.isArray(node.items) ? node.items[0] : node.items) ?? null;
      continue;
    }
    const props = node.properties;
    if (props && typeof props === 'object' && props[segment]) {
      node = props[segment];
      continue;
    }
    if (node.additionalProperties && typeof node.additionalProperties === 'object') {
      node = node.additionalProperties;
      continue;
    }
    return null;
  }
  return node;
}

function inferSectionLabel(
  section: string,
  uiHints: ConfigUiHints,
  schemaProperties: Record<string, JsonSchema>,
): string {
  const uiHintLabel = uiHints[section]?.label?.trim();
  if (uiHintLabel) return uiHintLabel;

  const meta = SECTION_META[section];
  if (meta?.label) return meta.label;

  const schemaNode = schemaProperties[section];
  if (schemaNode && typeof schemaNode === 'object') {
    if (typeof schemaNode.title === 'string' && schemaNode.title.trim()) return schemaNode.title.trim();
  }
  return humanizeKey(section);
}

function inferSectionDescription(
  section: string,
  uiHints: ConfigUiHints,
  schemaProperties: Record<string, JsonSchema>,
): string | undefined {
  const uiHintHelp = uiHints[section]?.help?.trim();
  if (uiHintHelp) return uiHintHelp;

  const meta = SECTION_META[section];
  if (meta?.description) return meta.description;

  const schemaNode = schemaProperties[section];
  if (schemaNode && typeof schemaNode === 'object') {
    if (typeof schemaNode.description === 'string' && schemaNode.description.trim()) {
      return schemaNode.description.trim();
    }
  }
  return undefined;
}

export function resolveSections(params: {
  parsedConfig: ParsedConfig | null;
  schema: unknown;
  uiHints: ConfigUiHints;
}): ConfigSection[] {
  const { parsedConfig, schema, uiHints } = params;
  const schemaProperties = schemaTopLevelProperties(schema);
  const hintTopLevelKeys = Object.keys(uiHints).map((key) => key.split('.')[0]).filter(Boolean);
  const keySet = new Set<string>([
    ...Object.keys(schemaProperties),
    ...Object.keys(parsedConfig ?? {}),
    ...hintTopLevelKeys,
  ]);

  const sections: ConfigSection[] = Array.from(keySet)
    .filter(Boolean)
    .map((key, index) => {
      const hint = uiHints[key];
      const order = typeof hint?.order === 'number' ? hint.order : index + 1000;
      return {
        key,
        label: inferSectionLabel(key, uiHints, schemaProperties),
        description: inferSectionDescription(key, uiHints, schemaProperties),
        order,
      };
    });

  return sections.sort((a, b) => (a.order === b.order ? a.key.localeCompare(b.key) : a.order - b.order));
}

export function resolveActiveSection(preferred: string | null | undefined, sections: ConfigSection[]): string | null {
  if (sections.length === 0) return null;
  if (preferred === null) return null;
  if (preferred && sections.some((section) => section.key === preferred)) return preferred;
  return null;
}

export function resolveSubsections(
  parsedConfig: ParsedConfig | null,
  schema: unknown,
  uiHints: ConfigUiHints,
  activeSection: string | null,
): ConfigSubsection[] {
  if (!activeSection) return [];

  const sectionSchema = getSchemaNodeBySegments(schema, [activeSection]);
  const sectionSchemaProps = sectionSchema?.properties ?? {};

  const sectionValue = parsedConfig?.[activeSection];
  const valueKeys =
    sectionValue && typeof sectionValue === 'object' && !Array.isArray(sectionValue)
      ? Object.keys(sectionValue as Record<string, unknown>)
      : [];

  const hintKeys = Object.keys(uiHints)
    .filter((key) => key.startsWith(`${activeSection}.`))
    .map((key) => key.split('.')[1])
    .filter(Boolean);

  const keys = new Set<string>([
    ...Object.keys(sectionSchemaProps),
    ...valueKeys,
    ...hintKeys,
  ]);

  return Array.from(keys)
    .map((key) => {
      const hint = hintForPath([activeSection, key], uiHints);
      const schemaNode = sectionSchemaProps[key];
      const label = hint?.label?.trim() || schemaNode?.title?.trim() || humanizeKey(key);
      const order = typeof hint?.order === 'number' ? hint.order : 100;
      return {
        key,
        label,
        order,
      };
    })
    .sort((a, b) => (a.order === b.order ? a.key.localeCompare(b.key) : a.order - b.order))
    .map(({ key, label }) => ({ key, label }));
}

function classifyValue(value: unknown): ConfigEntryKind {
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  return 'json';
}

function schemaEnumOptions(node: JsonSchema | null): unknown[] | null {
  if (!node || !Array.isArray(node.enum)) return null;
  const unique: unknown[] = [];
  for (const value of node.enum) {
    if (!unique.some((existing) => Object.is(existing, value))) {
      unique.push(value);
    }
  }
  return unique.length > 0 ? unique : null;
}

function classifyKind(value: unknown, schemaNode: JsonSchema | null): ConfigEntryKind {
  const nodeType = schemaType(schemaNode);
  if (nodeType === 'string') return 'string';
  if (nodeType === 'number' || nodeType === 'integer') return 'number';
  if (nodeType === 'boolean') return 'boolean';
  if (nodeType === 'object' || nodeType === 'array') return 'json';
  return classifyValue(value);
}

function defaultValueForSchema(schema: JsonSchema | null | undefined): unknown {
  if (!schema) return undefined;
  if (schema.default !== undefined) return schema.default;
  const type = schemaType(schema);
  if (type === 'object') return {};
  if (type === 'array') return [];
  if (type === 'boolean') return false;
  if (type === 'number' || type === 'integer') return 0;
  if (type === 'string') return '';
  return undefined;
}

function describeEntry(path: Array<string | number>, schemaNode: JsonSchema | null, uiHints: ConfigUiHints) {
  const hint = hintForPath(path, uiHints);
  const nodeLabel = typeof schemaNode?.title === 'string' ? schemaNode.title : undefined;
  const nodeDescription = typeof schemaNode?.description === 'string' ? schemaNode.description : undefined;

  return {
    label: hint?.label?.trim() || nodeLabel?.trim() || humanizeKey(String(path[path.length - 1] ?? pathKey(path))),
    help: hint?.help?.trim() || nodeDescription?.trim() || undefined,
    placeholder: hint?.placeholder?.trim() || undefined,
    sensitive: hint?.sensitive === true,
    advanced: hint?.advanced === true,
  };
}

function shouldIncludeForSearch(entry: ConfigEntry, query: string): boolean {
  if (!query) return true;
  const haystack = `${entry.path} ${entry.label} ${entry.help ?? ''}`.toLowerCase();
  return haystack.includes(query);
}

export function collectEntries(params: {
  parsedConfig: ParsedConfig | null;
  schema: unknown;
  uiHints: ConfigUiHints;
  activeSection: string | null;
  activeSubsection: string | null;
  searchQuery: string;
}): ConfigEntry[] {
  const { parsedConfig, schema, uiHints, activeSection, activeSubsection, searchQuery } = params;
  const query = searchQuery.trim().toLowerCase();
  const rows: ConfigEntry[] = [];

  const pushEntry = (path: Array<string | number>, value: unknown, schemaNode: JsonSchema | null) => {
    const meta = describeEntry(path, schemaNode, uiHints);
    const enumOptions = schemaEnumOptions(schemaNode);
    const fallbackValue = value === undefined ? defaultValueForSchema(schemaNode) : value;
    const entry: ConfigEntry = {
      path: path.map((segment) => String(segment)).join('.'),
      segments: path,
      value: fallbackValue,
      kind: classifyKind(fallbackValue, schemaNode),
      enumOptions: enumOptions ?? undefined,
      ...meta,
    };
    if (shouldIncludeForSearch(entry, query)) {
      rows.push(entry);
    }
  };

  const walk = (value: unknown, schemaNode: JsonSchema | null, path: Array<string | number>) => {
    const nodeType = schemaType(schemaNode);

    if (schemaNode?.enum && schemaNode.enum.length > 0) {
      pushEntry(path, value, schemaNode);
      return;
    }

    if (nodeType === 'object') {
      const obj = value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};
      const properties = schemaNode?.properties ?? {};
      const keys = new Set<string>([
        ...Object.keys(properties),
        ...Object.keys(obj),
      ]);
      if (keys.size === 0) {
        pushEntry(path, value, schemaNode);
        return;
      }
      for (const key of keys) {
        const childSchema = properties[key]
          ?? (schemaNode?.additionalProperties && typeof schemaNode.additionalProperties === 'object'
            ? schemaNode.additionalProperties
            : null);
        walk(obj[key], childSchema, [...path, key]);
      }
      return;
    }

    if (nodeType === 'array') {
      const arr = Array.isArray(value) ? value : [];
      const itemSchema = (Array.isArray(schemaNode?.items) ? schemaNode?.items[0] : schemaNode?.items) ?? null;
      if (arr.length === 0) {
        pushEntry(path, value, schemaNode);
        return;
      }
      for (let index = 0; index < arr.length; index += 1) {
        walk(arr[index], itemSchema, [...path, index]);
      }
      return;
    }

    if (schemaNode?.anyOf || schemaNode?.oneOf) {
      pushEntry(path, value, schemaNode);
      return;
    }

    pushEntry(path, value, schemaNode);
  };

  const rootSchema = schema as JsonSchema | null;

  if (activeSection) {
    const sectionPath: Array<string | number> = [activeSection];
    let value = parsedConfig?.[activeSection];
    let schemaNode = getSchemaNodeBySegments(rootSchema, sectionPath);

    if (activeSubsection) {
      sectionPath.push(activeSubsection);
      value =
        value && typeof value === 'object' && !Array.isArray(value)
          ? (value as Record<string, unknown>)[activeSubsection]
          : undefined;
      schemaNode = getSchemaNodeBySegments(rootSchema, sectionPath);
    }

    walk(value, schemaNode, sectionPath);
    return rows;
  }

  const schemaProperties = schemaTopLevelProperties(rootSchema);
  const keys = new Set<string>([
    ...Object.keys(schemaProperties),
    ...Object.keys(parsedConfig ?? {}),
  ]);

  for (const key of keys) {
    walk(parsedConfig?.[key], schemaProperties[key] ?? null, [key]);
  }

  return rows;
}

export function setValueAtPath(source: ParsedConfig, path: string | Array<string | number>, value: unknown): ParsedConfig {
  const clone =
    typeof structuredClone === 'function'
      ? structuredClone(source)
      : (JSON.parse(JSON.stringify(source)) as ParsedConfig);

  const parts = Array.isArray(path) ? path : parsePath(path);
  if (parts.length === 0) return clone;

  let cursor: unknown = clone;

  for (let index = 0; index < parts.length - 1; index += 1) {
    const segment = parts[index];
    const nextSegment = parts[index + 1];

    if (typeof segment === 'number') {
      if (!Array.isArray(cursor)) {
        return clone;
      }
      if (cursor[segment] == null || typeof cursor[segment] !== 'object') {
        cursor[segment] = typeof nextSegment === 'number' ? [] : {};
      }
      cursor = cursor[segment];
      continue;
    }

    if (!cursor || typeof cursor !== 'object') {
      return clone;
    }

    const record = cursor as Record<string, unknown>;
    if (record[segment] == null || typeof record[segment] !== 'object') {
      record[segment] = typeof nextSegment === 'number' ? [] : {};
    }
    cursor = record[segment];
  }

  const last = parts[parts.length - 1];
  if (typeof last === 'number') {
    if (!Array.isArray(cursor)) {
      return clone;
    }
    cursor[last] = value;
  } else {
    if (!cursor || typeof cursor !== 'object') {
      return clone;
    }
    (cursor as Record<string, unknown>)[last] = value;
  }

  return clone;
}

export type ConfigDiffEntry = {
  path: string;
  from: unknown;
  to: unknown;
};

export function computeConfigDiff(original: unknown, current: unknown): ConfigDiffEntry[] {
  const changes: ConfigDiffEntry[] = [];

  const compare = (orig: unknown, curr: unknown, path: string) => {
    if (orig === curr) return;

    const isOrigArray = Array.isArray(orig);
    const isCurrArray = Array.isArray(curr);
    if (isOrigArray || isCurrArray) {
      if (JSON.stringify(orig) !== JSON.stringify(curr)) {
        changes.push({ path, from: orig, to: curr });
      }
      return;
    }

    const isOrigObj = orig && typeof orig === 'object';
    const isCurrObj = curr && typeof curr === 'object';
    if (!isOrigObj || !isCurrObj) {
      changes.push({ path, from: orig, to: curr });
      return;
    }

    const origObj = orig as Record<string, unknown>;
    const currObj = curr as Record<string, unknown>;
    const keys = new Set([...Object.keys(origObj), ...Object.keys(currObj)]);
    for (const key of keys) {
      compare(origObj[key], currObj[key], path ? `${path}.${key}` : key);
    }
  };

  compare(original, current, '');
  return changes;
}
