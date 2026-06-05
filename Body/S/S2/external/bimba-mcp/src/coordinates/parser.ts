/**
 * Centralized coordinate parsing module for Bimba coordinate system
 *
 * Handles all valid coordinate syntax patterns:
 * - Type letter prefix: C, P, M, S, T, L (required)
 * - Primary number: single or multi-digit
 * - Separators: '-' for ordinary branch descent; '.' only after a 4 segment
 * - Repeatable path segments: M1-3-4, S2-3-4-5
 * - Canonical context frames in parentheses: M1-3-4.(00/00), S2-(0/1)
 * - Prime marker: trailing ' for Pratibimba aspect
 *
 * @see coordinate-syntax.md for syntax rules
 */

import { isCanonicalCoordinateSyntax, convertHashToMFamily } from './syntax.js';

/**
 * Parsed coordinate representation
 */
export interface ParsedCoordinate {
  type: 'C' | 'P' | 'M' | 'S' | 'T' | 'L';
  segments: number[];
  contextFrame: string | undefined;
  isPrime: boolean;
}

/**
 * Canonical regex pattern for coordinate validation
 *
 * Pattern breakdown:
 * - ([CPMSLT]) - Coordinate type letter (required)
 * - (\d+) - Primary number (can be multi-digit)
 * - branch segments are scanner-validated so '.' is only valid after a 4 segment
 * - parenthesized context frames must be canonical CF literals
 * - (')? - Optional prime marker
 */

/**
 * Parse a coordinate string into a structured object
 *
 * Returns null if the coordinate is invalid.
 * Converts legacy '#' syntax to 'M' family.
 * Supports:
 * - Simple: P2, M3
 * - Ranges: M2-5, S3-4
 * - Paths: M1-3-4, S2-3-4-5
 * - Context frames: M1-3-4.(00/00), S2-(0/1)
 * - Prime: M2', S3'
 *
 * @param input - Coordinate string to parse
 * @returns ParsedCoordinate object or null if invalid
 */
export function parseCoordinate(input: string): ParsedCoordinate | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  // Convert legacy '#' syntax to canonical M family
  const normalizedInput = convertHashToMFamily(input);

  if (!isCanonicalCoordinateSyntax(normalizedInput)) {
    return null;
  }

  // Extract type letter
  const typeMatch = normalizedInput.match(/^([CPMSLT])/);
  if (!typeMatch) {
    return null;
  }
  const type = typeMatch[1] as 'C' | 'P' | 'M' | 'S' | 'T' | 'L';

  // Extract segments (all numbers after type letter, separated by - or .)
  // For bare family root, there are no segments
  const segmentsMatch = normalizedInput.match(/^[CPMSLT]([\d.\-]+)/);
  let segments: number[] = [];
  if (segmentsMatch && segmentsMatch[1]) {
    const segmentStr = segmentsMatch[1];
    // Replace dots and hyphens with a delimiter and split
    const parts = segmentStr.split(/[-.]/);
    segments = parts.map(p => parseInt(p, 10)).filter(n => !isNaN(n));
  }

  // Extract first canonical context frame, whether branch-separated by '-' or '.'
  const contextMatch = normalizedInput.match(/[-.]\(([^)]+)\)/);
  const contextFrame = contextMatch ? contextMatch[1] : undefined;

  // Check for prime marker
  const isPrime = normalizedInput.endsWith("'");

  return {
    type,
    segments,
    contextFrame,
    isPrime,
  };
}

/**
 * Validate if a coordinate string is valid
 *
 * @param input - Coordinate string to validate
 * @returns true if the coordinate is valid, false otherwise
 */
export function isValidCoordinate(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const normalizedInput = convertHashToMFamily(input);
  return isCanonicalCoordinateSyntax(normalizedInput);
}

/**
 * Normalize a coordinate to canonical form
 *
 * Canonical form:
 * - Uses hyphen '-' as separator
 * - Segments sorted and deduplicated
 * - Context frame preserved with '-' unless it follows a 4 segment
 * - Prime marker at the end
 *
 * Example: P2-1-3-(0/1)' → P1-2-3-(0/1)'
 *
 * @param input - Coordinate string to normalize
 * @returns Canonical coordinate string, or original if invalid
 */
export function normalizeCoordinate(input: string): string {
  const normalizedInput = convertHashToMFamily(input);
  const parsed = parseCoordinate(normalizedInput);
  if (!parsed) {
    return input;
  }

  // Build normalized form
  let normalized = parsed.type;

  // Add unique segments sorted numerically
  const uniqueSegments = Array.from(new Set(parsed.segments)).sort((a, b) => a - b);
  if (uniqueSegments.length > 0) {
    normalized += uniqueSegments.map(s => s.toString()).join('-');
  }

  // Add context frame if present
  if (parsed.contextFrame) {
    const lastSegment = uniqueSegments[uniqueSegments.length - 1];
    normalized += `${lastSegment === 4 ? '.' : '-'}(${parsed.contextFrame})`;
  }

  // Add prime marker if present
  if (parsed.isPrime) {
    normalized += "'";
  }

  return normalized;
}

/**
 * Extract context frame from a coordinate string
 *
 * Returns the content within parentheses, or null if not present.
 *
 * @param input - Coordinate string
 * @returns Context frame content or null
 */
export function extractContextFrame(input: string): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const normalizedInput = convertHashToMFamily(input);
  const match = normalizedInput.match(/[-.]\(([^)]+)\)/);
  return match && match[1] ? match[1] : null;
}

