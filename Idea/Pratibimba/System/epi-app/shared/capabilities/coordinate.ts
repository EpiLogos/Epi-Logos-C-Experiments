export interface ParsedCoordinateReference {
  raw: string;
  normalized: string;
  canonical: string;
  position: number;
  stratum: number | null;
  legacy: boolean;
}

const LEGACY_POSITION_PATTERN = /^#([0-5])(?:\.\d+)?$/i;
const DOMAIN_COORDINATE_PATTERN = /^#?M([0-5])(?:-([0-5]))?'?$/i;
const POSITION_ALIAS_PATTERN = /^p([0-5])$/i;

export function parseCoordinateReference(input: string): ParsedCoordinateReference | null {
  const raw = input.trim();
  if (!raw) return null;

  const legacyPos = raw.match(LEGACY_POSITION_PATTERN);
  if (legacyPos) {
    const position = Number(legacyPos[1]);
    return {
      raw,
      normalized: raw.toUpperCase(),
      canonical: `M${position}'`,
      position,
      stratum: null,
      legacy: true,
    };
  }

  const domain = raw.match(DOMAIN_COORDINATE_PATTERN);
  if (domain) {
    const position = Number(domain[1]);
    const stratum = domain[2] ? Number(domain[2]) : null;
    const canonical = stratum === null ? `M${position}'` : `M${position}-${stratum}'`;
    return {
      raw,
      normalized: raw.replace(/^#/, '').toUpperCase(),
      canonical,
      position,
      stratum,
      legacy: raw.startsWith('#'),
    };
  }

  const alias = raw.match(POSITION_ALIAS_PATTERN);
  if (alias) {
    const position = Number(alias[1]);
    return {
      raw,
      normalized: raw.toLowerCase(),
      canonical: `M${position}'`,
      position,
      stratum: null,
      legacy: false,
    };
  }

  return null;
}

export function normalizeCoordinateReference(input: string): string | null {
  const parsed = parseCoordinateReference(input);
  return parsed ? parsed.canonical : null;
}

export function isCoordinateReference(input: string): boolean {
  return parseCoordinateReference(input) !== null;
}

export function extractCoordinatePosition(input: string): number | null {
  const parsed = parseCoordinateReference(input);
  return parsed ? parsed.position : null;
}
