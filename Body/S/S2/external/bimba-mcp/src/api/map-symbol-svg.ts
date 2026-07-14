/**
 * Coordinate: S2' Bimba Map projection — M2-1 MEF lens sigils (Tranche 48.3 worked example)
 * Residency: Body/S/S2/external/bimba-mcp/src/api
 * Actualises: the own-generated cover-imagery law (DR-M0-4 companion ruling,
 *   2026-07-14): every Map card image is a deterministic sigil rendered from
 *   the coordinate's own structure — never a fetched external asset. The
 *   M2-1 family (root + 6 groups + 36 lenses) is the worked example: group
 *   digit X → hue station on a six-step jewel wheel; position digit Y → the
 *   Y-fold inner motif (void / axis / dyad / triad / quaternity / pentad).
 * Public surface: renderMapSymbolSvg, M2_1_FAMILY_COORDINATES
 * Does NOT own: which nodes carry imagery in the projection (map-index.ts
 *   emits `c_1_symbol_image` only when the asset exists), asset file I/O
 *   (scripts/generate-map-symbols.mjs), the graph-side c_1_asset_uri slot.
 */

const SIZE = 240;
const CX = SIZE / 2;
const CY = SIZE / 2;

/** Six hue stations, violet → amber: the M2-1-X group identities. */
const GROUP_HUES = [265, 218, 171, 124, 77, 30] as const;

/** Root + six groups + thirty-six lenses = the 43-node M2-1 family. */
export const M2_1_FAMILY_COORDINATES: readonly string[] = Object.freeze(
  (() => {
    const coords: string[] = ['M2-1'];
    for (let x = 0; x < 6; x += 1) {
      coords.push(`M2-1-${x}`);
      for (let y = 0; y < 6; y += 1) coords.push(`M2-1-${x}-${y}`);
    }
    return coords;
  })()
);

function polar(r: number, deg: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
}

function pt([x, y]: [number, number]): string {
  return `${x.toFixed(2)},${y.toFixed(2)}`;
}

/** An arc segment of the ring at radius r, spanning [fromDeg, toDeg]. */
function arc(r: number, fromDeg: number, toDeg: number): string {
  const [x1, y1] = polar(r, fromDeg);
  const [x2, y2] = polar(r, toDeg);
  const large = toDeg - fromDeg > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

/** Regular polygon (or star for pentad) inscribed at radius r. */
function polygonPoints(sides: number, r: number, star = false): string {
  const points: string[] = [];
  const step = 360 / sides;
  const order = star ? [0, 2, 4, 1, 3] : [...Array(sides).keys()];
  for (const i of order) points.push(pt(polar(r, i * step)));
  return points.join(' ');
}

/** The Y-fold inner motif: void / axis / dyad / triad / quaternity / pentad. */
function innerMotif(y: number, stroke: string): string {
  const r = 46;
  switch (y) {
    case 0:
      return (
        `<circle cx="${CX}" cy="${CY}" r="${r * 0.5}" fill="none" stroke="${stroke}" stroke-width="1.5"/>` +
        `<circle cx="${CX}" cy="${CY}" r="4.5" fill="${stroke}"/>`
      );
    case 1: {
      const [, y1] = polar(r, 0);
      const [, y2] = polar(r, 180);
      return (
        `<line x1="${CX}" y1="${y1.toFixed(2)}" x2="${CX}" y2="${y2.toFixed(2)}" stroke="${stroke}" stroke-width="2"/>` +
        `<circle cx="${CX}" cy="${CY}" r="4.5" fill="${stroke}"/>`
      );
    }
    case 2: {
      const off = r * 0.42;
      return (
        `<circle cx="${(CX - off).toFixed(2)}" cy="${CY}" r="${(r * 0.62).toFixed(2)}" fill="none" stroke="${stroke}" stroke-width="1.8"/>` +
        `<circle cx="${(CX + off).toFixed(2)}" cy="${CY}" r="${(r * 0.62).toFixed(2)}" fill="none" stroke="${stroke}" stroke-width="1.8"/>`
      );
    }
    case 3:
      return `<polygon points="${polygonPoints(3, r)}" fill="none" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>`;
    case 4:
      return `<polygon points="${polygonPoints(4, r)}" fill="none" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>`;
    default:
      return `<polygon points="${polygonPoints(5, r, true)}" fill="none" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>`;
  }
}

/** Six aperture blades; the active group's blade is full-strength. */
function apertureBlades(activeGroup: number | null, hueOf: (x: number) => number): string {
  const blades: string[] = [];
  for (let x = 0; x < 6; x += 1) {
    const start = x * 60 + 4;
    const end = (x + 1) * 60 - 4;
    const active = activeGroup === null || activeGroup === x;
    const color = `hsl(${hueOf(x)} 72% ${active ? 62 : 40}%)`;
    blades.push(
      `<path d="${arc(88, start, end)}" fill="none" stroke="${color}" ` +
        `stroke-width="${active ? 7 : 2.5}" stroke-linecap="round" opacity="${active ? 0.95 : 0.3}"/>`
    );
  }
  return blades.join('');
}

function svgShell(hue: number, body: string): string {
  const glowId = `g${hue}`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}">` +
    `<defs><radialGradient id="${glowId}"><stop offset="0%" stop-color="hsl(${hue} 80% 60%)" stop-opacity="0.28"/>` +
    `<stop offset="72%" stop-color="hsl(${hue} 80% 45%)" stop-opacity="0.10"/>` +
    `<stop offset="100%" stop-color="hsl(${hue} 80% 40%)" stop-opacity="0"/></radialGradient></defs>` +
    `<circle cx="${CX}" cy="${CY}" r="112" fill="url(#${glowId})"/>` +
    `<circle cx="${CX}" cy="${CY}" r="104" fill="none" stroke="hsl(${hue} 45% 55%)" stroke-width="1.2" opacity="0.55"/>` +
    body +
    `</svg>`
  );
}

const GOLD = 'hsl(45 65% 78%)';

/**
 * Render the deterministic sigil for one M2-1 family coordinate.
 * Returns null for anything outside the family — no invented imagery.
 */
export function renderMapSymbolSvg(coordinate: string): string | null {
  const match = /^M2-1(?:-([0-5]))?(?:-([0-5]))?$/.exec(coordinate);
  if (!match) return null;
  const [, xRaw, yRaw] = match;

  if (xRaw === undefined) {
    // Root: the full spectrum aperture around a golden vesica lens.
    const vesica =
      `<circle cx="${CX - 19}" cy="${CY}" r="34" fill="none" stroke="${GOLD}" stroke-width="2"/>` +
      `<circle cx="${CX + 19}" cy="${CY}" r="34" fill="none" stroke="${GOLD}" stroke-width="2"/>` +
      `<circle cx="${CX}" cy="${CY}" r="4.5" fill="${GOLD}"/>`;
    return svgShell(265, apertureBlades(null, (x) => GROUP_HUES[x]) + vesica);
  }

  const x = Number(xRaw);
  const hue = GROUP_HUES[x];
  if (yRaw === undefined) {
    // Group node: the group-hued aperture with its six positions in orbit.
    const orbit: string[] = [];
    for (let y = 0; y < 6; y += 1) {
      const [ox, oy] = polar(64, y * 60);
      orbit.push(
        `<circle cx="${ox.toFixed(2)}" cy="${oy.toFixed(2)}" r="${3 + y * 1.4}" ` +
          `fill="none" stroke="hsl(${hue} 60% 66%)" stroke-width="1.4" opacity="0.75"/>`
      );
    }
    const core = `<circle cx="${CX}" cy="${CY}" r="30" fill="none" stroke="${GOLD}" stroke-width="2"/>`;
    return svgShell(hue, apertureBlades(x, () => hue) + orbit.join('') + core);
  }

  // Lens node: group aperture station + the Y-fold motif in gold.
  const y = Number(yRaw);
  return svgShell(hue, apertureBlades(x, () => hue) + innerMotif(y, GOLD));
}
