import { describe, expect, it } from 'vitest';

import { CoordinateSchema } from '../schemas.js';
import { isCanonicalCoordinateSyntax, wrapContextFrames } from './syntax.js';
import { parseCoordinate } from './parser.js';

describe('canonical coordinate syntax', () => {
  it('accepts hyphen branches, dotted 4 branches, prime suffixes, and canonical context frames', () => {
    const valid = [
      'S2-3',
      "S5-5'",
      'S4.0',
      'M4.0',
      'M1-3-4.(00/00)',
      'M0-(4.0/1-4.4/5)',
      'M0-(4.5/0)',
      'M0-4.(0/1)',
      'M0-4.(0/1/2/3)',
      'M0-4.(5/0)',
      'M0-4.(4.0/1-4.4/5)',
      "L2-3'",
    ];

    for (const coordinate of valid) {
      expect(isCanonicalCoordinateSyntax(coordinate), coordinate).toBe(true);
      expect(CoordinateSchema.safeParse(coordinate).success, coordinate).toBe(true);
    }
  });

  it('rejects old dotted non-4 branches and arbitrary parenthesized context strings', () => {
    const invalid = [
      'S2.3',
      "S5.5'",
      'L2.3',
      "L2'.3",
      'M2-(0/360)',
      'S2.(session-id)',
      '#2',
    ];

    for (const coordinate of invalid) {
      expect(isCanonicalCoordinateSyntax(coordinate), coordinate).toBe(false);
      expect(CoordinateSchema.safeParse(coordinate).success, coordinate).toBe(false);
    }
  });

  it('parses canonical context frames without losing prime-at-end semantics', () => {
    expect(parseCoordinate("L2-3'")).toMatchObject({
      type: 'L',
      segments: [2, 3],
      contextFrame: undefined,
      isPrime: true,
    });
    expect(parseCoordinate('M1-3-4.(00/00)')).toMatchObject({
      type: 'M',
      segments: [1, 3, 4],
      contextFrame: '00/00',
      isPrime: false,
    });
    expect(parseCoordinate('S2-(0/1)')).toMatchObject({
      type: 'S',
      segments: [2],
      contextFrame: '0/1',
      isPrime: false,
    });
  });

  it('normalises bare/legacy context frames to canonical dot-notation (parity with Rust/projector)', () => {
    expect(wrapContextFrames('M0-4.0/1')).toBe('M0-4.(0/1)');
    expect(wrapContextFrames('M0-4.0/1/2/3-5')).toBe('M0-4.(0/1/2/3)-5');
    expect(wrapContextFrames('M1-3-4.5/0')).toBe('M1-3-4.(5/0)');
    expect(wrapContextFrames('M0-4.4.0-4.4/5')).toBe('M0-4.(4.0/1-4.4/5)');
    expect(wrapContextFrames('M0-3-0/1')).toBe('M0-3-(0/1)');
    // idempotent on canonical (incl. the doubling whose dash is inside the parens)
    expect(wrapContextFrames('M0-4.(0/1)')).toBe('M0-4.(0/1)');
    expect(wrapContextFrames('M0-4.(4.0/1-4.4/5)')).toBe('M0-4.(4.0/1-4.4/5)');
    // legacy '#' frame input round-trips to a valid canonical coordinate
    expect(parseCoordinate('#0-4.0/1')).toMatchObject({ type: 'M', contextFrame: '0/1' });
  });
});
