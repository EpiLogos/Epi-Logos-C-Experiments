import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtemp, readFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

import { convertHashToMFamily, wrapContextFrames } from '../coordinates/syntax.js';
import { sync } from './sync.js';
import {
  canonicalMapCoordinate,
  mapIndexFileId,
  mapIndexRelPath,
  projectMapNode,
  syncMapIndex,
  type MapIndexGraphSource,
  type MapNodeSnapshot,
} from './map-index.js';

// A real in-memory live-graph source. Node data is real (not a mock of the projection); the
// projection + file write + freshness/idempotency are exercised end-to-end against a temp filesystem.
class InMemorySource implements MapIndexGraphSource {
  constructor(private snapshots: MapNodeSnapshot[]) {}
  setSnapshots(snapshots: MapNodeSnapshot[]): void {
    this.snapshots = snapshots;
  }
  async fetchSnapshots(coordinateFilter?: string): Promise<MapNodeSnapshot[]> {
    if (!coordinateFilter) return this.snapshots;
    return this.snapshots.filter((s) => s.coordinate.startsWith(coordinateFilter));
  }
}

function m25(essence: string, updatedAt = '2026-07-10T00:00:00Z'): MapNodeSnapshot {
  return {
    coordinate: 'M2-5',
    properties: {
      name: 'Planetary Harmonic Integration',
      essence,
      architecturalFunction: 'Bridges celestial harmonics into ternary quantum phase-space',
      qlPosition: '2.5',
      updated_at: updatedAt,
    },
    relations: [
      { source: 'M2-5', relType: 'HAS_INTERNAL_COMPONENT', target: 'M2-5-2', props: { nature: 'SU(3) λ₃ Diagonal Beauty' } },
      { source: 'M2-5', relType: 'QUANTUM_TRANSLATION_BRIDGE', target: 'M3', props: { significance: 'cross-branch reflection' } },
    ],
    children: ['M2-5-2'],
    ancestors: [],
    childrenBeyondDepth: 0,
  };
}

describe('map-index canonical rendering (reuses the shared normaliser, not a 6th impl)', () => {
  it('renders # and context-frame coordinates via wrapContextFrames/convertHashToMFamily', () => {
    // Parity: the module delegates to the sanctioned shared normaliser rather than a local copy.
    for (const raw of ['#2-5', '#0-4.0/1', '#0-3-0/1', 'M2-5-0', "M2-5-0'"]) {
      expect(canonicalMapCoordinate(raw)).toBe(wrapContextFrames(convertHashToMFamily(raw)));
    }
    expect(canonicalMapCoordinate('#0-4.0/1')).toBe('M0-4.(0/1)');
    expect(canonicalMapCoordinate('#2-5')).toBe('M2-5');
  });

  it('renders / as ∕ (U+2215) in filesystem/wikilink ids while the true / survives in the coordinate', () => {
    expect(mapIndexFileId('M0-4.(0/1)')).toBe('M0-4.(0∕1)');
    const projected = projectMapNode({
      coordinate: '#0-4.0/1',
      properties: { name: 'Position-4 Frame' },
      relations: [],
      children: [],
      ancestors: ['M0-4'],
    });
    expect(projected.coordinate).toBe('M0-4.(0/1)');
    expect(projected.relPath).toBe(join('M0', 'M0-4', 'M0-4.(0∕1).md'));
    // the true `/` is preserved in frontmatter + the graph pointer
    expect(projected.markdown).toContain('coordinate: "M0-4.(0/1)"');
    expect(projected.markdown).toContain('c_4_graph_node: "neo4j://Bimba/M0-4.(0/1)"');
  });
});

describe('map-index path mirrors the containment hierarchy', () => {
  it('a node with children is a folder-note; a leaf is a flat file; ancestors become folders', () => {
    expect(mapIndexRelPath('M2-5', [], true)).toBe(join('M2', 'M2-5', 'M2-5.md'));
    expect(mapIndexRelPath('M2-5-2', ['M2-5'], false)).toBe(join('M2', 'M2-5', 'M2-5-2.md'));
    expect(mapIndexRelPath('M0-4.(0/1)', ['M0-4'], false)).toBe(join('M0', 'M0-4', 'M0-4.(0∕1).md'));
  });
});

describe('projectMapNode is a pure, deterministic reflection', () => {
  it('emits map-index frontmatter, Detail, Contains and the Relations index', () => {
    const md = projectMapNode(m25('The sacred heptarchy of living quantum operators')).markdown;
    expect(md).toContain('c_4_artifact_role: "map-index"');
    expect(md).toContain('c_3_projected_from: "neo4j://Bimba"');
    expect(md).toContain('# M2-5 · Planetary Harmonic Integration');
    expect(md).toContain('> The sacred heptarchy of living quantum operators');
    expect(md).toContain('## Detail');
    expect(md).toContain('## Contains');
    expect(md).toContain('[[M2-5-2]]');
    expect(md).toContain('## Relations (2)');
    expect(md).toContain('- [[M2-5]] - [[HAS_INTERNAL_COMPONENT]] - [[M2-5-2]]');
    expect(md).toContain('- [[M2-5]] - [[QUANTUM_TRANSLATION_BRIDGE]] - [[M3]]');
    // projection stamp is sourced from the node's own updated_at, never a wall clock
    expect(md).toContain('c_3_projected_at: "2026-07-10T00:00:00Z"');
  });

  it('is byte-identical across repeated projections of the same snapshot', () => {
    const a = projectMapNode(m25('same')).markdown;
    const b = projectMapNode(m25('same')).markdown;
    expect(a).toBe(b);
  });
});

describe('syncMapIndex — the maintained Neo4j->repo reflection direction', () => {
  let mapRoot: string;

  beforeEach(async () => {
    mapRoot = await mkdtemp(join(tmpdir(), 'bimba-map-'));
  });
  afterEach(async () => {
    await rm(mapRoot, { recursive: true, force: true });
  });

  it('projects a changed graph node into its /map file, then re-projects freshly when it changes', async () => {
    const source = new InMemorySource([m25('original heptarchy essence')]);

    const first = await syncMapIndex({ direction: 'neo4j_to_obsidian', mapRoot, source });
    expect(first.success).toBe(true);
    expect(first.graph_to_vault).toMatchObject({ processed: 1, created: 1, updated: 0, skipped: 0 });

    const filePath = join(mapRoot, 'M2', 'M2-5', 'M2-5.md');
    const original = await readFile(filePath, 'utf-8');
    expect(original).toContain('> original heptarchy essence');

    // The graph node changes → re-projection refreshes the file with the new content.
    source.setSnapshots([m25('revised heptarchy essence', '2026-07-11T00:00:00Z')]);
    const second = await syncMapIndex({ direction: 'neo4j_to_obsidian', mapRoot, source });
    expect(second.graph_to_vault).toMatchObject({ processed: 1, created: 0, updated: 1, skipped: 0 });

    const refreshed = await readFile(filePath, 'utf-8');
    expect(refreshed).toContain('> revised heptarchy essence');
    expect(refreshed).not.toContain('> original heptarchy essence');
    expect(refreshed).not.toBe(original);
  });

  it('is idempotent: re-projecting an unchanged graph node writes nothing (byte-identical on disk)', async () => {
    const source = new InMemorySource([m25('stable essence')]);

    const first = await syncMapIndex({ direction: 'neo4j_to_obsidian', mapRoot, source });
    expect(first.graph_to_vault).toMatchObject({ created: 1, updated: 0, skipped: 0 });
    const afterFirst = await readFile(join(mapRoot, 'M2', 'M2-5', 'M2-5.md'), 'utf-8');

    const second = await syncMapIndex({ direction: 'neo4j_to_obsidian', mapRoot, source });
    // no write occurred — the on-disk bytes were already fresh
    expect(second.graph_to_vault).toMatchObject({ processed: 1, created: 0, updated: 0, skipped: 1 });
    expect(second.files_processed ?? []).toEqual([]);
    const afterSecond = await readFile(join(mapRoot, 'M2', 'M2-5', 'M2-5.md'), 'utf-8');
    expect(afterSecond).toBe(afterFirst);
  });

  it('honours a coordinate filter and mirrors the containment hierarchy on disk', async () => {
    const child: MapNodeSnapshot = {
      coordinate: 'M2-5-2',
      properties: { name: 'Diagonal Beauty Component', description: 'SU(3) aesthetic phase coherence', updated_at: '2026-07-10T00:00:00Z' },
      relations: [{ source: 'M2-5', relType: 'HAS_INTERNAL_COMPONENT', target: 'M2-5-2', props: {} }],
      children: [],
      ancestors: ['M2-5'],
    };
    const source = new InMemorySource([m25('essence'), child]);
    const res = await syncMapIndex({ direction: 'neo4j_to_obsidian', mapRoot, source, coordinateFilter: 'M2-5-2' });
    expect(res.graph_to_vault).toMatchObject({ processed: 1, created: 1 });
    await expect(readFile(join(mapRoot, 'M2', 'M2-5', 'M2-5-2.md'), 'utf-8')).resolves.toContain('# M2-5-2 · Diagonal Beauty Component');
  });

  it('dry_run reports what would change without writing files', async () => {
    const source = new InMemorySource([m25('essence')]);
    const res = await syncMapIndex({ direction: 'neo4j_to_obsidian', mapRoot, source, dryRun: true });
    expect(res.graph_to_vault).toMatchObject({ processed: 1, created: 1 });
    await expect(readFile(join(mapRoot, 'M2', 'M2-5', 'M2-5.md'), 'utf-8')).rejects.toThrow();
  });

  it('REFUSES to re-promote map-index upward (obsidian_to_neo4j / bidirectional)', async () => {
    const source = new InMemorySource([m25('essence')]);
    for (const direction of ['obsidian_to_neo4j', 'bidirectional'] as const) {
      const res = await syncMapIndex({ direction, mapRoot, source });
      expect(res.success).toBe(false);
      expect(res.error_message).toMatch(/never re-promoted|reflection/i);
      // nothing written
      await expect(readFile(join(mapRoot, 'M2', 'M2-5', 'M2-5.md'), 'utf-8')).rejects.toThrow();
    }
  });
});

describe('sync() dispatch to the map-index scope', () => {
  it('routes scope="map-index" upward direction to the refusal without touching Neo4j', async () => {
    // Refusal returns before any live-graph fetch, so this exercises the real dispatch end-to-end.
    const res = await sync('all', 'obsidian_to_neo4j', undefined, false, 'map-index');
    expect(res.success).toBe(false);
    expect(res.error_message).toMatch(/never re-promoted|reflection/i);
  });
});
