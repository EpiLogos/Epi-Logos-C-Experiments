import { ParsedLink, MPRIME_DOMAINS } from '../../shared/types';
import {
  extractCoordinatePosition as extractPositionFromCoordinate,
  isCoordinateReference as isCoordinateRef,
  parseCoordinateReference,
} from '../../shared/capabilities/coordinate';

// Regex patterns for different link types
const WIKI_LINK_PATTERN = /^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]$/;
const EXTERNAL_URL_PATTERN = /^https?:\/\//i;
const FILE_PATH_PATTERN = /^\/|^\.\//;

/**
 * Parse a link and determine its type and target
 */
export function parseLink(linkText: string): ParsedLink {
  const text = linkText.trim();

  // Check for wiki-link syntax [[target]] or [[target|display]]
  const wikiMatch = text.match(WIKI_LINK_PATTERN);
  if (wikiMatch) {
    const target = wikiMatch[1].trim();
    const display = wikiMatch[2]?.trim();

    // Check if wiki-link target is a coordinate
    if (isCoordinateRef(target)) {
      return parseCoordinateLink(target, display || target);
    }

    return {
      type: 'wiki',
      raw: text,
      target,
      display: display || target,
    };
  }

  // Check for external URL
  if (EXTERNAL_URL_PATTERN.test(text)) {
    return {
      type: 'external',
      raw: text,
      target: text,
    };
  }

  // Check for coordinate format (M0, M0', #M3, M4-2, etc.)
  if (isCoordinateRef(text)) {
    return parseCoordinateLink(text, text);
  }

  // Check for file path
  if (FILE_PATH_PATTERN.test(text)) {
    return {
      type: 'file',
      raw: text,
      target: text,
      filePath: text,
    };
  }

  // Default to wiki-link for plain text (assumes it's a note name)
  return {
    type: 'wiki',
    raw: text,
    target: text,
    display: text,
  };
}

/**
 * Parse a coordinate link and extract domain info
 */
function parseCoordinateLink(coord: string, display: string): ParsedLink {
  const parsed = parseCoordinateReference(coord);
  if (parsed) {
    const domainNum = parsed.position;
    if (domainNum >= 0 && domainNum <= 5) {
      const domain = MPRIME_DOMAINS.find(d => d.id === `m${domainNum}`);
      return {
        type: 'coordinate',
        raw: coord,
        target: parsed.canonical,
        display,
        domainId: domain?.id,
      };
    }
  }

  // Invalid coordinate - treat as wiki-link
  return {
    type: 'wiki',
    raw: coord,
    target: coord,
    display,
  };
}

/**
 * Check if a string looks like a coordinate reference
 * Handles inline coordinate references like #M0, #2, M3', etc.
 */
export function isCoordinateReference(text: string): boolean {
  return isCoordinateRef(text);
}

/**
 * Extract coordinate number from a reference
 * Returns the position number (0-5) or null if invalid
 */
export function extractCoordinatePosition(text: string): number | null {
  return extractPositionFromCoordinate(text);
}

/**
 * Get domain by position number
 */
export function getDomainByPosition(position: number): typeof MPRIME_DOMAINS[number] | null {
  if (position < 0 || position > 5) return null;
  return MPRIME_DOMAINS.find(d => d.id === `m${position}`) || null;
}

/**
 * Check if a URL is external (http/https)
 */
export function isExternalUrl(url: string): boolean {
  return EXTERNAL_URL_PATTERN.test(url);
}

/**
 * Normalize a wiki-link target for comparison
 * Removes [[]], handles aliases, lowercases
 */
export function normalizeWikiTarget(target: string): string {
  return target
    .replace(/^\[\[|\]\]$/g, '')
    .split('|')[0]
    .trim()
    .toLowerCase();
}
