#!/usr/bin/env node
/**
 * Bimba graph data normalisation — two Architect-directed passes.
 *
 *   PASS A  collision key -> majority type   (c_4_subsystem only; see NOTES)
 *   PASS B  retire migration-artefact alias keys in favour of the canonical name
 *
 * Canonical-name authority: the target keys declared in
 *   Body/S/S2/graph-services/src/dataset_import/property_mapping.rs
 *
 * SAFETY: every alias removal re-asserts value identity inside its own WHERE
 * clause, so the statement cannot drop a property that is not a proven duplicate
 * of its retained canonical twin — even if the pre-measurement went stale.
 *
 * Reversal: for each alias key we snapshot the coordinate list. Values need no
 * snapshot because they are provably identical to the retained canonical twin;
 * restoring is `SET n.<alias> = n.<canon>` over the snapshotted coordinates.
 *
 * Usage:  node normalise-bimba.mjs [--execute]     (default: dry run)
 */

import neo4j from '/Users/admin/Documents/Epi-Logos C Experiments/Body/S/S2/external/bimba-mcp/node_modules/neo4j-driver/lib/index.js';
import { readFileSync, writeFileSync } from 'node:fs';

const EXECUTE = process.argv.includes('--execute');
const SNAPSHOT_PATH = new URL('./reversal-snapshot.json', import.meta.url).pathname;

// ---------------------------------------------------------------------------
// Connection (from .env.graph-dev; never printed)
// ---------------------------------------------------------------------------
const envText = readFileSync(
  '/Users/admin/Documents/Epi-Logos C Experiments/.env.graph-dev',
  'utf8',
);
const envVal = (name) => {
  // value may be quoted, unquoted, or an empty quoted string (auth-disabled dev instance)
  const m = new RegExp(`^export ${name}=['"]?([^'"\\n]*)['"]?$`, 'm').exec(envText);
  if (!m) throw new Error(`missing ${name} in .env.graph-dev`);
  return m[1];
};
const URI = envVal('EPILOGOS_NEO4J_URI');
const USER = envVal('EPILOGOS_NEO4J_USER');
const PASSWORD = envVal('EPILOGOS_NEO4J_PASSWORD');

const KEY_RE = /^[a-z]_[0-9]_[a-z0-9_]+$/;
const checkKey = (k) => {
  if (!KEY_RE.test(k)) throw new Error(`refusing to interpolate unsafe key: ${k}`);
  return k;
};

/**
 * PASS B work list: [canonical, alias, comparison]
 * comparison 'raw'  -> n.canon = n.alias
 * comparison 'text' -> toString(n.canon) = toString(n.alias)   (mixed-type canon)
 *
 * Measured 2026-07-25 against the live graph: every row below is 100% identical
 * where co-present, with 0 conflicting and 0 canonical-absent.
 *
 * DELIBERATELY EXCLUDED (measured NOT aliases — would have destroyed real data):
 *   c_3_updated_at <- t_3_updated_at   397 co-present, only 19 identical, 378 CONFLICT
 *   c_1_description <- s_4_description  22 co-present, 0 identical, 16 CONFLICT, 6 canon-absent
 */
const ALIASES = [
  ['c_3_updated_at', 't_3_last_updated', 'text'],
  ['c_3_context_frame', 'c_1_context_frame', 'raw'],
  ['c_1_key_principles', 'c_2_key_principles', 'raw'],
  ['c_3_practical_applications', 'c_2_practical_applications', 'raw'],
  ['p_3_sequence', 't_3_sequence', 'raw'],
  ['c_3_related_coordinates', 'c_2_related_coordinates', 'raw'],
  ['t_3_developmental_stage', 't_2_developmental_stage', 'raw'],
  ['c_1_key_principles', 'c_4_key_principles', 'raw'],
  ['c_3_practical_applications', 'c_4_practical_applications', 'raw'],
  ['c_3_related_coordinates', 'c_4_related_coordinates', 'raw'],
  ['c_1_key_principles', 'c_3_key_principles', 'raw'],
  ['l_2_chakra_correspondence', 'l_3_chakra_correspondence', 'raw'],
  ['c_1_key_principles', 'c_0_key_principles', 'raw'],
  ['c_3_related_coordinates', 'c_1_related_coordinates', 'raw'],
  ['c_3_practical_applications', 'c_1_practical_applications', 'raw'],
  ['l_4_modality', 'c_0_modality', 'raw'],
  ['l_3_seasonal_position', 't_0_seasonal_position', 'raw'],
  ['c_3_practical_applications', 'c_0_practical_applications', 'raw'],
  ['c_3_related_coordinates', 'c_0_related_coordinates', 'raw'],
  ['l_4_mef_condition', 'c_4_mef_condition', 'raw'],
  ['l_4_reflection_table', 'c_4_reflection_table', 'raw'],
  ['l_4_interpretive_role', 'c_4_interpretive_role', 'raw'],
  ['p_1_position_id', 'p_5_position_id', 'raw'],
  ['p_1_stage_id', 't_5_stage_id', 'raw'],
  ['m_4_kashmir_shaivism_alignment', 'p_4_kashmir_shaivism_alignment', 'raw'],
  ['m_4_practical_manifestations', 'c_4_practical_manifestations', 'raw'],
  ['c_1_key_principles', 'c_5_key_principles', 'raw'],
  ['c_3_practical_applications', 'c_5_practical_applications', 'raw'],
  ['t_1_epistemic_function', 'c_1_epistemic_function', 'raw'],
  ['t_1_epistemic_function', 'c_2_epistemic_function', 'raw'],
  ['s_4_safety_class', 'c_4_safety_class', 'raw'],
  ['m_4_preferred_timing', 'c_4_preferred_timing', 'raw'],
  ['s_4_eligible_formats', 'c_1_eligible_formats', 'raw'],
  ['m_4_capability_signals', 'c_4_capability_signals', 'raw'],
  ['s_5_system_prompt', 's_4_system_prompt', 'raw'],
  ['c_3_related_coordinates', 'c_5_related_coordinates', 'raw'],
  ['m_4_temporal_intelligence_layer', 't_4_temporal_intelligence_layer', 'raw'],
  ['m_4_two_stroke_doctrine', 'c_4_two_stroke_doctrine', 'raw'],
  ['m_4_temporal_structure', 't_4_temporal_structure', 'raw'],
  ['s_5_capabilities', 's_4_capabilities', 'raw'],
];

const eq = (canon, alias, mode) =>
  mode === 'text'
    ? `toString(n.${canon}) = toString(n.${alias})`
    : `n.${canon} = n.${alias}`;

const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
const num = (v) => (neo4j.isInt(v) ? v.toNumber() : v);

async function main() {
  const session = driver.session();
  const report = { mode: EXECUTE ? 'execute' : 'dry-run', passA: {}, passB: [], totals: {} };

  try {
    // -----------------------------------------------------------------------
    // SNAPSHOT (always taken, both modes)
    // -----------------------------------------------------------------------
    const snapshot = { takenAtGraphTime: null, aliasCoordinates: {}, subsystemOriginals: [] };

    const t = await session.run('RETURN toString(datetime()) AS now');
    snapshot.takenAtGraphTime = t.records[0].get('now');

    for (const [canon, alias] of ALIASES) {
      checkKey(canon);
      checkKey(alias);
      const r = await session.run(
        `MATCH (n:Bimba) WHERE n.${alias} IS NOT NULL
         RETURN collect(n.coordinate) AS coords`,
      );
      snapshot.aliasCoordinates[`${alias}<-${canon}`] = r.records[0].get('coords');
    }

    const subRaw = await session.run(
      `MATCH (n:Bimba) WHERE n.c_4_subsystem IS NOT NULL
         AND NOT valueType(n.c_4_subsystem) STARTS WITH 'INTEGER'
       RETURN n.coordinate AS coordinate, n.c_4_subsystem AS value,
              valueType(n.c_4_subsystem) AS type`,
    );
    snapshot.subsystemOriginals = subRaw.records.map((rec) => ({
      coordinate: rec.get('coordinate'),
      value: rec.get('value'),
      type: rec.get('type'),
    }));

    writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 1)}\n`);
    report.snapshotPath = SNAPSHOT_PATH;
    report.snapshotAliasKeys = Object.keys(snapshot.aliasCoordinates).length;
    report.snapshotSubsystemNodes = snapshot.subsystemOriginals.length;

    // -----------------------------------------------------------------------
    // PASS A — c_4_subsystem to majority INTEGER (lossless: "4" -> 4, ["4","4"] -> 4)
    // -----------------------------------------------------------------------
    const passAStmt = `
      MATCH (n:Bimba) WHERE n.c_4_subsystem IS NOT NULL
        AND NOT valueType(n.c_4_subsystem) STARTS WITH 'INTEGER'
        AND (
          (valueType(n.c_4_subsystem) STARTS WITH 'STRING' AND n.c_4_subsystem =~ '^[0-9]+$')
          OR (valueType(n.c_4_subsystem) STARTS WITH 'LIST<STRING'
              AND size(n.c_4_subsystem) > 0
              AND size([x IN n.c_4_subsystem WHERE x <> n.c_4_subsystem[0]]) = 0
              AND n.c_4_subsystem[0] =~ '^[0-9]+$')
        )
      ${EXECUTE
        ? `SET n.c_4_subsystem = CASE
             WHEN valueType(n.c_4_subsystem) STARTS WITH 'LIST<STRING'
               THEN toInteger(n.c_4_subsystem[0])
             ELSE toInteger(n.c_4_subsystem) END`
        : ''}
      RETURN count(*) AS affected`;

    const aRes = await session.run(passAStmt);
    report.passA = { key: 'c_4_subsystem', affected: num(aRes.records[0].get('affected')) };

    // -----------------------------------------------------------------------
    // PASS B — retire alias keys (self-guarding: identity re-asserted per row)
    // -----------------------------------------------------------------------
    let removedTotal = 0;
    for (const [canon, alias, mode] of ALIASES) {
      const stmt = `
        MATCH (n:Bimba)
        WHERE n.${alias} IS NOT NULL AND n.${canon} IS NOT NULL
          AND ${eq(canon, alias, mode)}
        ${EXECUTE ? `REMOVE n.${alias}` : ''}
        RETURN count(*) AS affected`;
      const r = await session.run(stmt);
      const affected = num(r.records[0].get('affected'));
      removedTotal += affected;
      report.passB.push({ canon, alias, affected });
    }
    report.totals.aliasInstances = removedTotal;
    report.totals.aliasKeys = ALIASES.length;

    // -----------------------------------------------------------------------
    // POST-VERIFY (execute mode only)
    // -----------------------------------------------------------------------
    if (EXECUTE) {
      const v1 = await session.run(
        `MATCH (n:Bimba) WHERE n.c_4_subsystem IS NOT NULL
         RETURN valueType(n.c_4_subsystem) AS t, count(*) AS c ORDER BY c DESC`,
      );
      report.verify = {
        subsystemTypes: v1.records.map((r) => ({ type: r.get('t'), count: num(r.get('c')) })),
      };

      const stillPresent = [];
      for (const [canon, alias] of ALIASES) {
        const r = await session.run(
          `MATCH (n:Bimba) WHERE n.${alias} IS NOT NULL RETURN count(*) AS c`,
        );
        const c = num(r.records[0].get('c'));
        if (c > 0) stillPresent.push({ alias, canon, remaining: c });
      }
      report.verify.aliasesStillPresent = stillPresent;

      const nodeCount = await session.run('MATCH (n:Bimba) RETURN count(n) AS c');
      report.verify.bimbaNodeCount = num(nodeCount.records[0].get('c'));

      const edgeCount = await session.run(
        'MATCH (:Bimba)-[r]->(:Bimba) RETURN count(r) AS c',
      );
      report.verify.bimbaEdgeCount = num(edgeCount.records[0].get('c'));
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
