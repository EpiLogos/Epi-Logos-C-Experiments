/**
 * Centralized coordinate parsing module for Bimba coordinate system
 *
 * Handles all valid coordinate syntax patterns:
 * - Type letter prefix: C, P, M, S, T, L (required)
 * - Primary number: single or multi-digit
 * - Separators: both '-' (hyphen) and '.' (dot) accepted
 * - Repeatable path segments: M1-3-4, S2-3-4-5
 * - Context frames in parentheses: M1-3-4.(0000), S2.(session-id)
 * - Prime marker: trailing ' for Pratibimba aspect
 *
 * @see coordinate-syntax.md for syntax rules
 */

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
 * - (?:[-.](\d+))* - Optional separator + numbers (repeatable)
 * - (?:\.\([^)]+\))? - Optional context frame in ()
 * - (')? - Optional prime marker
 */
const COORDINATE_REGEX_FLEXIBLE = /^([CPMSLT])(\d+)(?:[-.]\d+)*(?:\.\([^)]+\))?(')?$/;

/**
 * Parse a coordinate string into a structured object
 *
 * Returns null if the coordinate is invalid or uses deprecated '#' syntax.
 * Supports:
 * - Simple: P2, M3
 * - Ranges: M2-5, S3.4
 * - Paths: M1-3-4, S2-3-4-5
 * - Context frames: M1-3-4.(0000), S2.(session-123)
 * - Prime: M2', S3'
 * - Combined: C3-P2-M2'.(ref:uuid)
 *
 * @param input - Coordinate string to parse
 * @returns ParsedCoordinate object or null if invalid
 */
export function parseCoordinate(input: string): ParsedCoordinate | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  // Reject deprecated '#' prefix syntax
  if (input.startsWith('#')) {
    console.warn(`[Coordinate] Deprecated hash syntax '#' used: ${input}. Use letter prefix instead (e.g., 'P2' not '#2').`);
    return null;
  }

  // Check basic structure
  if (!COORDINATE_REGEX_FLEXIBLE.test(input)) {
    return null;
  }

  // Extract type letter
  const typeMatch = input.match(/^([CPMSLT])/);
  if (!typeMatch) {
    return null;
  }
  const type = typeMatch[1] as 'C' | 'P' | 'M' | 'S' | 'T' | 'L';

  // Extract segments (all numbers after type letter, separated by - or .)
  const segmentsMatch = input.match(/^[CPMSLT]([\d.\-]+)/);
  let segments: number[] = [];
  if (segmentsMatch && segmentsMatch[1]) {
    const segmentStr = segmentsMatch[1];
    // Replace dots and hyphens with a delimiter and split
    const parts = segmentStr.split(/[-.]/);
    segments = parts.map(p => parseInt(p, 10)).filter(n => !isNaN(n));
  }

  // Extract context frame
  const contextMatch = input.match(/\.\(([^)]+)\)/);
  const contextFrame = contextMatch ? contextMatch[1] : undefined;

  // Check for prime marker
  const isPrime = input.endsWith("'");

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

  // Reject deprecated '#' syntax
  if (input.startsWith('#')) {
    return false;
  }

  return COORDINATE_REGEX_FLEXIBLE.test(input);
}

/**
 * Normalize a coordinate to canonical form
 *
 * Canonical form:
 * - Uses hyphen '-' as separator
 * - Segments sorted and deduplicated
 * - Context frame preserved with leading dot
 * - Prime marker at the end
 *
 * Example: P2.1-3.(ctx)' → P1-2-3.(ctx)'
 *
 * @param input - Coordinate string to normalize
 * @returns Canonical coordinate string, or original if invalid
 */
export function normalizeCoordinate(input: string): string {
  const parsed = parseCoordinate(input);
  if (!parsed) {
    return input;
  }

  // Build normalized form
  let normalized = parsed.type;

  // Add unique segments sorted numerically
  const uniqueSegments = Array.from(new Set(parsed.segments)).sort((a, b) => a - b);
  normalized += uniqueSegments.map(s => s.toString()).join('-');

  // Add context frame if present
  if (parsed.contextFrame) {
    normalized += `.(${parsed.contextFrame})`;
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

  const match = input.match(/\.\(([^)]+)\)/);
  return match && match[1] ? match[1] : null;
}
