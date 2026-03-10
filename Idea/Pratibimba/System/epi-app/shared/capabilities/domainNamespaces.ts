const KNOWN_DOMAINS = new Set(['anuttara', 'paramasiva', 'parashakti', 'mahamaya', 'nara', 'epii']);

export interface ParsedNamespacedCapability {
  domain: string;
  group: string;
  action: string;
}

export function parseNamespacedCapability(value: string): ParsedNamespacedCapability | null {
  const parts = value.trim().split('.');
  if (parts.length !== 3) return null;

  const [domain, group, action] = parts;
  if (!domain || !group || !action) return null;

  return { domain, group, action };
}

export function buildNamespacedCapability(domain: string, group: string, action: string): string {
  return `${domain.trim().toLowerCase()}.${group.trim().toLowerCase()}.${action.trim().toLowerCase()}`;
}

export function isKnownDomainNamespace(value: string): boolean {
  const parsed = parseNamespacedCapability(value);
  if (!parsed) return false;
  return KNOWN_DOMAINS.has(parsed.domain.toLowerCase());
}
