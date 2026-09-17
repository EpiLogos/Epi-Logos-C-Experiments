/**
 * LIVE Neo4j integration for the map-index reflection source.
 *
 * The sibling `map-index.test.ts` suite exercises the projection/write/idempotency machinery against a
 * hand-authored in-memory FIXTURE — it never runs the real `Neo4jMapIndexSource`. This suite closes
 * that gap: it constructs the ACTUAL `Neo4jMapIndexSource` (the default live-graph read source,
 * `map-index.ts:425+`), connects through `getNeo4jConnectionManager` (env `NEO4J_URI`/`NEO4J_USER`/
 * `NEO4J_PASSWORD`, see `db/neo4j.ts`), and pulls a real snapshot from the running Bimba graph.
 *
 * ARCHITECT LAW: the live Neo4j Bimba graph is the baseline ontology; alignment with it is what
 * testing exists to prove. This test asserts against LIVE properties — including the distinctive
 * `q_3_four_three_three_two_nesting` register key that only the real graph carries and no fixture can
 * fake — so it CANNOT pass with Neo4j absent or against the in-memory fixture. It is read-only:
 * it never writes to the graph.
 *
 * GATING: when `NEO4J_URI` is unset the live case is SKIPPED loudly (a visible warning + a skipped,
 * never-green test), so an absent database can never masquerade as passing live coverage. When the
 * env IS set but Neo4j is unreachable/misconfigured, `connect()` throws and the suite FAILS loudly.
 *
 * Run (Neo4j must be up): from `Body/S/S2/external/bimba-mcp`:
 *   NEO4J_URI=bolt://127.0.0.1:7687 NEO4J_USER=neo4j NEO4J_PASSWORD=<pw> \
 *     npx vitest run src/api/map-index.live.test.ts src/api/map-index.test.ts
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  getNeo4jConnectionManager,
  resetNeo4jConnectionManager,
} from '../db/neo4j.js';
import { Neo4jMapIndexSource, type MapNodeSnapshot } from './map-index.js';

// A stable, controller-verified live node: the M2-3 "Decans System" branch. It carries the
// distinctive quaternal register key `q_3_four_three_three_two_nesting` plus the C-family ontological
// keys `c_0_operational_essence` / `c_2_key_principles` — none of which exist on any in-memory fixture.
const LIVE_COORD = 'M2-3';

const LIVE = Boolean(process.env['NEO4J_URI']);

if (!LIVE) {
  // Loud, visible skip banner — never a silent green.
  // eslint-disable-next-line no-console
  console.warn(
    '\n[LIVE-NEO4J TEST SKIPPED: set NEO4J_URI] ' +
      'Neo4jMapIndexSource live integration did not run. ' +
      'Export NEO4J_URI (+ NEO4J_USER, NEO4J_PASSWORD) with Neo4j running to exercise the real Bimba graph.\n'
  );
}

describe('Neo4jMapIndexSource — LIVE Neo4j integration (the real default source)', () => {
  beforeAll(async () => {
    if (!LIVE) return;
    // Fresh singleton with the discovered live config, mirroring db/neo4j.ts DEFAULT_CONFIG fallbacks.
    resetNeo4jConnectionManager();
    const manager = getNeo4jConnectionManager({
      uri: process.env['NEO4J_URI'] as string,
      user: process.env['NEO4J_USER'] ?? 'neo4j',
      password: process.env['NEO4J_PASSWORD'] ?? 'neo4j',
    });
    // Throws loudly (failing the suite) if the env is set but Neo4j is unreachable/misconfigured.
    await manager.connect();
  }, 60_000);

  afterAll(async () => {
    if (!LIVE) return;
    // Close the driver so no live connection leaks past the test run.
    await getNeo4jConnectionManager().shutdown();
    resetNeo4jConnectionManager();
  });

  it.skipIf(!LIVE)(
    'constructs the REAL Neo4jMapIndexSource and pulls a live M2-3 snapshot with real props + relations',
    async () => {
      // The ACTUAL default source — not the in-memory fixture. It reads live :Bimba nodes.
      const source = new Neo4jMapIndexSource();
      const snapshots: MapNodeSnapshot[] = await source.fetchSnapshots(LIVE_COORD);

      expect(snapshots.length).toBeGreaterThan(0);

      const m23 = snapshots.find((s) => s.coordinate === LIVE_COORD);
      expect(
        m23,
        `live Bimba graph must contain the ${LIVE_COORD} node (probe it if this fails)`
      ).toBeDefined();
      const node = m23 as MapNodeSnapshot;

      // Real properties came back, non-empty.
      const props = node.properties;
      expect(Object.keys(props).length).toBeGreaterThan(0);

      // Known LIVE keys — these exist ONLY on the real graph node, never on the in-memory fixture,
      // so this assertion proves the fetch hit Neo4j and not a fake.
      expect(props).toHaveProperty('q_3_four_three_three_two_nesting');
      expect(props).toHaveProperty('c_0_operational_essence');
      expect(props).toHaveProperty('c_2_key_principles');
      expect(props['c_1_name']).toBe('Decans System');

      // Real relations came back, non-empty, carrying live containment edges.
      expect(node.relations.length).toBeGreaterThan(0);
      const relTypes = new Set(node.relations.map((r) => r.relType));
      expect(relTypes.has('HAS_ELEMENT')).toBe(true);

      // Containment children materialise from the live HAS_ELEMENT edges under M2-3.
      expect(node.children.length).toBeGreaterThan(0);
      expect(node.children.some((c) => c.startsWith('M2-3-'))).toBe(true);
    },
    60_000
  );
});
