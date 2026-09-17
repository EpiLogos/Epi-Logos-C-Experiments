/**
 * Coordinate: S2' Bimba Map projection — M2-1 sigil asset runner (48.3)
 * Residency: Body/S/S2/external/bimba-mcp/scripts
 * Actualises: writes the own-generated M2-1 MEF-lens sigils into
 *   `Idea/Bimba/Map/assets/` and stamps `c_1_symbol_image` into the already-
 *   projected M2-1 node files — byte-identical to what map-index.ts emits, so
 *   the next live re-projection is a zero-diff no-op. Idempotent.
 * Does NOT own: the sigil geometry (map-symbol-svg.ts), the projection law
 *   (map-index.ts), canon promotion (Hen).
 *
 * Run: node scripts/generate-map-symbols.ts   (from bimba-mcp; Node ≥ 23)
 */

import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { renderMapSymbolSvg, M2_1_FAMILY_COORDINATES } from '../src/api/map-symbol-svg.ts';

const repoRoot = resolve(import.meta.dirname, '..', '..', '..', '..', '..', '..');
const mapRoot = join(repoRoot, 'Idea', 'Bimba', 'Map');
const assetsDir = join(mapRoot, 'assets');
const m21Root = join(mapRoot, 'M2', 'M2-1');

mkdirSync(assetsDir, { recursive: true });

let assetsWritten = 0;
let assetsFresh = 0;
for (const coordinate of M2_1_FAMILY_COORDINATES) {
  const svg = renderMapSymbolSvg(coordinate);
  if (!svg) throw new Error(`family coordinate ${coordinate} rendered null`);
  const path = join(assetsDir, `${coordinate}.svg`);
  if (existsSync(path) && readFileSync(path, 'utf-8') === svg) {
    assetsFresh += 1;
    continue;
  }
  writeFileSync(path, svg, 'utf-8');
  assetsWritten += 1;
}

/** Insert or refresh the key exactly where map-index.ts emits it —
 *  immediately above `c_4_graph_node:`. */
function stampSymbolImage(content: string, asset: string): string {
  const line = `c_1_symbol_image: "[[${asset}]]"`;
  if (content.includes(line)) return content;
  if (/^c_1_symbol_image: .*$/m.test(content)) {
    return content.replace(/^c_1_symbol_image: .*$/m, line);
  }
  return content.replace(/^c_4_graph_node: /m, `${line}\nc_4_graph_node: `);
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : entry.name.endsWith('.md') ? [join(dir, entry.name)] : []
  );
}

let stamped = 0;
let alreadyStamped = 0;
for (const file of walk(m21Root)) {
  const content = readFileSync(file, 'utf-8');
  const coordMatch = /^coordinate: "([^"]+)"/m.exec(content);
  if (!coordMatch || !M2_1_FAMILY_COORDINATES.includes(coordMatch[1])) continue;
  const next = stampSymbolImage(content, `${coordMatch[1]}.svg`);
  if (next === content) {
    alreadyStamped += 1;
    continue;
  }
  writeFileSync(file, next, 'utf-8');
  stamped += 1;
}

console.log(
  `[generate-map-symbols] assets: ${assetsWritten} written, ${assetsFresh} fresh · ` +
    `nodes: ${stamped} stamped, ${alreadyStamped} already carried the key`
);
