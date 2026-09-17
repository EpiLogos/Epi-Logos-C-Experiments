import { describe, expect, it } from 'vitest';
import { renderMapSymbolSvg, M2_1_FAMILY_COORDINATES } from './map-symbol-svg.js';

describe('map symbol SVG generator (48.3 M2-1 worked example, DR-M0-4 own-generated law)', () => {
  it('enumerates the full M2-1 MEF lens family: root + 6 groups + 36 lenses', () => {
    expect(M2_1_FAMILY_COORDINATES).toHaveLength(43);
    expect(M2_1_FAMILY_COORDINATES).toContain('M2-1');
    expect(M2_1_FAMILY_COORDINATES).toContain('M2-1-0');
    expect(M2_1_FAMILY_COORDINATES).toContain('M2-1-5-5');
  });

  it('renders a well-formed standalone SVG for every family coordinate', () => {
    for (const coordinate of M2_1_FAMILY_COORDINATES) {
      const svg = renderMapSymbolSvg(coordinate);
      expect(svg, coordinate).toBeTruthy();
      expect(svg!).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
      expect(svg!).toContain('viewBox="0 0 240 240"');
      expect(svg!.trim()).toMatch(/<\/svg>$/);
    }
  });

  it('is deterministic and distinct: same coordinate → identical bytes; different coordinates → different sigils', () => {
    const outputs = new Map<string, string>();
    for (const coordinate of M2_1_FAMILY_COORDINATES) {
      const first = renderMapSymbolSvg(coordinate)!;
      expect(renderMapSymbolSvg(coordinate)).toBe(first);
      outputs.set(coordinate, first);
    }
    expect(new Set(outputs.values()).size).toBe(M2_1_FAMILY_COORDINATES.length);
  });

  it('refuses coordinates outside the family instead of inventing imagery', () => {
    expect(renderMapSymbolSvg('M2-2')).toBeNull();
    expect(renderMapSymbolSvg('M0-1')).toBeNull();
    expect(renderMapSymbolSvg('M2-1-6')).toBeNull();
    expect(renderMapSymbolSvg('M2-1-0-7')).toBeNull();
    expect(renderMapSymbolSvg('')).toBeNull();
  });
});
