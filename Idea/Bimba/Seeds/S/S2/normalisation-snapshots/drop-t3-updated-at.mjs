#!/usr/bin/env node
/**
 * Drop `t_3_updated_at` — Architect: "redundant, get rid" (2026-07-26).
 *
 * NOT an alias of `c_3_updated_at`: 378 of its 397 co-present rows hold a
 * DIFFERENT timestamp, which is why the earlier alias pass deliberately excluded
 * it. It is being removed as redundant, not as a duplicate, so unlike that pass
 * the raw values ARE snapshotted — they are not recoverable from any twin.
 *
 * Usage: node drop-t3-updated-at.mjs [--execute]
 */

import neo4j from '/Users/admin/Documents/Epi-Logos C Experiments/Body/S/S2/external/bimba-mcp/node_modules/neo4j-driver/lib/index.js';
import { readFileSync, writeFileSync } from 'node:fs';

const EXECUTE = process.argv.includes('--execute');
const SNAPSHOT_PATH = new URL('./t3-updated-at-snapshot.json', import.meta.url).pathname;

const envText = readFileSync(
  '/Users/admin/Documents/Epi-Logos C Experiments/.env.graph-dev',
  'utf8',
);
const envVal = (name) => {
  const m = new RegExp(`^export ${name}=['"]?([^'"\\n]*)['"]?$`, 'm').exec(envText);
  if (!m) throw new Error(`missing ${name}`);
  return m[1];
};

const driver = neo4j.driver(
  envVal('EPILOGOS_NEO4J_URI'),
  neo4j.auth.basic(envVal('EPILOGOS_NEO4J_USER'), envVal('EPILOGOS_NEO4J_PASSWORD')),
);
const num = (v) => (neo4j.isInt(v) ? v.toNumber() : v);

async function main() {
  const session = driver.session();
  const report = { mode: EXECUTE ? 'execute' : 'dry-run' };
  try {
    const snap = await session.run(
      `MATCH (n:Bimba) WHERE n.t_3_updated_at IS NOT NULL
       RETURN n.coordinate AS coordinate,
              toString(n.t_3_updated_at) AS value,
              valueType(n.t_3_updated_at) AS type,
              toString(n.c_3_updated_at) AS canonical`,
    );
    const rows = snap.records.map((r) => ({
      coordinate: r.get('coordinate'),
      value: r.get('value'),
      type: r.get('type'),
      canonicalCounterpart: r.get('canonical'),
    }));
    writeFileSync(
      SNAPSHOT_PATH,
      `${JSON.stringify({ key: 't_3_updated_at', count: rows.length, rows }, null, 1)}\n`,
    );
    report.snapshotPath = SNAPSHOT_PATH;
    report.snapshotCount = rows.length;
    report.everyRowHasCanonicalCounterpart = rows.every((r) => r.canonicalCounterpart);

    const res = await session.run(
      `MATCH (n:Bimba) WHERE n.t_3_updated_at IS NOT NULL
       ${EXECUTE ? 'REMOVE n.t_3_updated_at' : ''}
       RETURN count(*) AS affected`,
    );
    report.affected = num(res.records[0].get('affected'));

    const post = await session.run(
      `MATCH (n:Bimba)
       RETURN count(n) AS nodes,
              count(n.t_3_updated_at) AS t3Remaining,
              count(n.c_3_updated_at) AS canonicalIntact`,
    );
    const p = post.records[0];
    report.verify = {
      bimbaNodes: num(p.get('nodes')),
      t3Remaining: num(p.get('t3Remaining')),
      canonicalIntact: num(p.get('canonicalIntact')),
    };

    console.log(JSON.stringify(report, null, 1));
  } finally {
    await session.close();
    await driver.close();
  }
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
