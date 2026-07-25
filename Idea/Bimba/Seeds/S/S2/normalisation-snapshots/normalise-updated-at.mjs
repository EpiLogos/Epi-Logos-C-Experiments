#!/usr/bin/env node
/**
 * PASS C — c_3_updated_at: STRING -> ZONED DATETIME.
 *
 * DIRECTION: toward the minority type, deliberately. The only live writer is
 * Body/S/S2/graph-services/src/sync/coordinator.rs:350 (`n.c_3_updated_at =
 * datetime()`), which emits ZONED DATETIME. Normalising to the STRING majority
 * would normalise away from the producer and the next vault sync would re-split
 * the column. Architect decision 2026-07-25.
 *
 * LOSSLESS: all 1108 string values are strict ISO-8601 with an explicit Z
 * (verified: 1108/1108 match ^\d{4}-..T..:..:..(\.\d+)?Z$). The instant is
 * preserved exactly; only redundant zero-padding in the fractional part is
 * dropped (".979000000Z" -> ".979Z", epochMillis and nanosecond identical).
 *
 * Reversal: the raw strings are snapshotted per coordinate in
 * updated-at-snapshot.json.
 *
 * Usage:  node normalise-updated-at.mjs [--execute]
 */

import neo4j from '/Users/admin/Documents/Epi-Logos C Experiments/Body/S/S2/external/bimba-mcp/node_modules/neo4j-driver/lib/index.js';
import { readFileSync, writeFileSync } from 'node:fs';

const EXECUTE = process.argv.includes('--execute');
const SNAPSHOT_PATH = new URL('./updated-at-snapshot.json', import.meta.url).pathname;

const envText = readFileSync(
  '/Users/admin/Documents/Epi-Logos C Experiments/.env.graph-dev',
  'utf8',
);
const envVal = (name) => {
  const m = new RegExp(`^export ${name}=['"]?([^'"\\n]*)['"]?$`, 'm').exec(envText);
  if (!m) throw new Error(`missing ${name} in .env.graph-dev`);
  return m[1];
};

const driver = neo4j.driver(
  envVal('EPILOGOS_NEO4J_URI'),
  neo4j.auth.basic(envVal('EPILOGOS_NEO4J_USER'), envVal('EPILOGOS_NEO4J_PASSWORD')),
);
const num = (v) => (neo4j.isInt(v) ? v.toNumber() : v);

// Only these are eligible. Anything not strictly ISO-8601-with-Z is left alone.
const ELIGIBLE = `n.c_3_updated_at IS NOT NULL
  AND valueType(n.c_3_updated_at) STARTS WITH 'STRING'
  AND n.c_3_updated_at =~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}([.][0-9]+)?Z$'`;

async function main() {
  const session = driver.session();
  const report = { mode: EXECUTE ? 'execute' : 'dry-run' };
  try {
    // ---- snapshot the raw strings (reversal needs the exact original text) ----
    const snap = await session.run(
      `MATCH (n:Bimba) WHERE ${ELIGIBLE}
       RETURN n.coordinate AS coordinate, n.c_3_updated_at AS original`,
    );
    const originals = snap.records.map((r) => ({
      coordinate: r.get('coordinate'),
      original: r.get('original'),
    }));
    writeFileSync(
      SNAPSHOT_PATH,
      `${JSON.stringify({ key: 'c_3_updated_at', count: originals.length, originals }, null, 1)}\n`,
    );
    report.snapshotPath = SNAPSHOT_PATH;
    report.snapshotCount = originals.length;

    // ---- pre-flight: every eligible value must parse AND keep its instant ----
    const pre = await session.run(
      `MATCH (n:Bimba) WHERE ${ELIGIBLE}
       WITH n.c_3_updated_at AS s, datetime(n.c_3_updated_at) AS d
       RETURN count(*) AS eligible,
              sum(CASE WHEN substring(toString(d),0,19) = substring(s,0,19) THEN 1 ELSE 0 END) AS secondsPreserved,
              sum(CASE WHEN d.nanosecond =
                    CASE WHEN size(s) = 20 THEN 0
                         ELSE toInteger(substring(s,20,size(s)-21) +
                              substring('000000000',0,9-(size(s)-21))) END
                  THEN 1 ELSE 0 END) AS nanosPreserved`,
    );
    const p = pre.records[0];
    report.preflight = {
      eligible: num(p.get('eligible')),
      secondsPreserved: num(p.get('secondsPreserved')),
      nanosPreserved: num(p.get('nanosPreserved')),
    };
    if (
      report.preflight.eligible !== report.preflight.secondsPreserved ||
      report.preflight.eligible !== report.preflight.nanosPreserved
    ) {
      throw new Error(
        `pre-flight fidelity check FAILED: ${JSON.stringify(report.preflight)} — refusing to write`,
      );
    }

    // ---- convert ----
    const res = await session.run(
      `MATCH (n:Bimba) WHERE ${ELIGIBLE}
       ${EXECUTE ? 'SET n.c_3_updated_at = datetime(n.c_3_updated_at)' : ''}
       RETURN count(*) AS affected`,
    );
    report.affected = num(res.records[0].get('affected'));

    // ---- post-verify ----
    const post = await session.run(
      `MATCH (n:Bimba) WHERE n.c_3_updated_at IS NOT NULL
       RETURN valueType(n.c_3_updated_at) AS t, count(*) AS c ORDER BY c DESC`,
    );
    report.typesNow = post.records.map((r) => ({ type: r.get('t'), count: num(r.get('c')) }));

    if (EXECUTE) {
      // instant-level fidelity vs the snapshot, checked back out of the graph
      const check = await session.run(
        `UNWIND $rows AS row
         MATCH (n:Bimba {coordinate: row.coordinate})
         WITH row, n WHERE n.c_3_updated_at IS NOT NULL
         RETURN count(*) AS checked,
           sum(CASE WHEN n.c_3_updated_at = datetime(row.original) THEN 1 ELSE 0 END) AS instantsMatch`,
        { rows: originals },
      );
      report.postVerify = {
        checked: num(check.records[0].get('checked')),
        instantsMatch: num(check.records[0].get('instantsMatch')),
      };
    }

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
