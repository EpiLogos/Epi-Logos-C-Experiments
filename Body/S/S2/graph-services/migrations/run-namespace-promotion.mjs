#!/usr/bin/env node
/**
 * Coordinate: S2/#5 (namespace-promotion migration runner — Tranche 09.T9.14)
 * Residency: Body/S/S2/graph-services/migrations/run-namespace-promotion.mjs
 * Position (#n): #5 — governed, reviewable mutation of the live S2 baseline graph.
 * Actualises: [[09-integrated-bimba-graph-reconciliation]] Tranche 9.14 as something the
 *   Architect can READ, DRY-RUN and only then apply. It executes the statements in
 *   `2026-08-01-world-gnostic-namespace-promotion.cypher` and nothing else — the runner
 *   carries no Cypher of its own, so reviewing the migration means reviewing that one file.
 * Public surface: parseMigration; CLI: node run-namespace-promotion.mjs [--file <path>] [--apply]
 * Does NOT own: the statements (the .cypher file), the schema constants (graph-schema), the
 *   decision to run (the Architect), or vault-side promotion (Hen).
 * Contract: DRY RUN IS THE DEFAULT. Without `--apply` this process sends only the `@probe` and
 *   `@report` reads; an `@apply` block is never transmitted. With `--apply` each step runs
 *   probe → apply → probe, and the run FAILS if the second probe does not settle at 0 — which is
 *   the migration's idempotency asserted rather than claimed.
 */

import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_MIGRATION = join(HERE, '2026-08-01-world-gnostic-namespace-promotion.cypher');

/**
 * Parse the annotated migration into ordered steps.
 *
 * The format is plain Cypher with `//` marker comments, so the file stays runnable by eye and by
 * cypher-shell: `// @step: <name>`, `// @why: <prose>`, then `// @probe`, `// @apply` or
 * `// @report` before each statement. Statements end at `;`.
 */
export function parseMigration(text) {
    const steps = [];
    let step = null;
    let kind = null;
    let buffer = [];

    const flush = () => {
        if (!step || !kind) return;
        const statement = buffer.join('\n').trim().replace(/;\s*$/, '');
        if (statement) step[kind] = statement;
        buffer = [];
        kind = null;
    };

    for (const raw of text.split('\n')) {
        const line = raw.trim();
        const stepMatch = /^\/\/\s*@step:\s*(.+)$/.exec(line);
        if (stepMatch) {
            flush();
            step = { name: stepMatch[1].trim(), why: [], probe: null, apply: null, report: null };
            steps.push(step);
            continue;
        }
        const whyMatch = /^\/\/\s*@why:\s*(.+)$/.exec(line);
        if (whyMatch && step) { step.why.push(whyMatch[1].trim()); continue; }
        const kindMatch = /^\/\/\s*@(probe|apply|report)\s*$/.exec(line);
        if (kindMatch) { flush(); kind = kindMatch[1]; continue; }
        if (line.startsWith('//')) {
            // A `// @why:` continuation line inside a step header, or file prose. Neither is a
            // statement, so it never reaches the buffer.
            if (step && step.why.length > 0 && !kind) step.why.push(line.replace(/^\/\/\s?/, ''));
            continue;
        }
        if (!kind) continue;
        buffer.push(raw);
        if (line.endsWith(';')) flush();
    }
    flush();
    return steps;
}

function endpoint() {
    if (process.env.NEO4J_HTTP_URL) return process.env.NEO4J_HTTP_URL;
    const bolt = process.env.EPILOGOS_NEO4J_URI ?? process.env.NEO4J_URI ?? 'bolt://localhost:7687';
    const host = /\/\/([^:/]+)/.exec(bolt)?.[1] ?? 'localhost';
    const database = process.env.EPILOGOS_NEO4J_DATABASE ?? process.env.NEO4J_DATABASE ?? 'neo4j';
    return `http://${host}:7474/db/${database}/tx/commit`;
}

async function run(statement) {
    const user = process.env.EPILOGOS_NEO4J_USER ?? process.env.NEO4J_USER ?? 'neo4j';
    const password = process.env.EPILOGOS_NEO4J_PASSWORD ?? process.env.NEO4J_PASSWORD;
    if (!password) {
        throw new Error(
            'No Neo4j password in the environment. `source .env.graph-dev` first (EPILOGOS_NEO4J_PASSWORD).'
        );
    }
    const response = await fetch(endpoint(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`
        },
        body: JSON.stringify({ statements: [{ statement }] })
    });
    if (!response.ok) throw new Error(`Neo4j HTTP ${response.status} ${response.statusText}`);
    const body = await response.json();
    if (body.errors?.length) throw new Error(body.errors.map((e) => `${e.code}: ${e.message}`).join('; '));
    const result = body.results?.[0] ?? { columns: [], data: [] };
    return { columns: result.columns, rows: result.data.map((entry) => entry.row) };
}

/** A probe's single scalar. Any probe that does not return one row of one column is a bug in the
 *  migration, not something to paper over with a default. */
function pendingCount({ columns, rows }, step) {
    if (columns.length !== 1 || rows.length !== 1 || typeof rows[0][0] !== 'number') {
        throw new Error(`probe for step "${step}" must return exactly one numeric column; got ${JSON.stringify(columns)}`);
    }
    return rows[0][0];
}

function printReport(step, { columns, rows }) {
    if (rows.length === 0) {
        console.log(`    (no rows)`);
        return;
    }
    for (const row of rows.slice(0, 50)) {
        console.log(`    ${columns.map((column, index) => `${column}=${JSON.stringify(row[index])}`).join('  ')}`);
    }
    if (rows.length > 50) console.log(`    … ${rows.length - 50} more`);
}

async function main(argv) {
    const apply = argv.includes('--apply');
    const fileArg = argv[argv.indexOf('--file') + 1];
    const file = argv.includes('--file') && fileArg
        ? (isAbsolute(fileArg) ? fileArg : resolve(process.cwd(), fileArg))
        : DEFAULT_MIGRATION;

    const steps = parseMigration(readFileSync(file, 'utf8'));
    console.log(`[namespace-promotion] ${file}`);
    console.log(`[namespace-promotion] ${apply ? 'APPLY — this WILL write to the live graph' : 'DRY RUN — no statement that writes will be sent'}`);
    console.log(`[namespace-promotion] endpoint ${endpoint()}`);
    console.log('');

    let failures = 0;
    for (const step of steps) {
        console.log(`  ${step.name}`);
        if (step.report) {
            printReport(step.name, await run(step.report));
            console.log('');
            continue;
        }
        if (!step.probe) {
            console.log('    no probe — skipped');
            continue;
        }
        const before = pendingCount(await run(step.probe), step.name);
        console.log(`    pending: ${before}`);
        if (!apply) { console.log(''); continue; }
        if (!step.apply) { console.log('    no apply block — nothing to run'); console.log(''); continue; }
        if (before === 0) { console.log('    already settled — apply skipped'); console.log(''); continue; }
        await run(step.apply);
        const after = pendingCount(await run(step.probe), step.name);
        console.log(`    applied; pending now: ${after}`);
        if (after !== 0) {
            console.log(`    FAILED — the step did not settle, so it is not idempotent as written`);
            failures += 1;
        }
        console.log('');
    }

    if (!apply) {
        console.log('[namespace-promotion] dry run complete. Nothing was written.');
        console.log('[namespace-promotion] re-run with --apply to execute, after reading the .cypher file.');
    }
    return failures === 0 ? 0 : 1;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
    main(process.argv.slice(2))
        .then((code) => process.exit(code))
        .catch((error) => {
            console.error(`[namespace-promotion] ${error.message}`);
            process.exit(1);
        });
}
