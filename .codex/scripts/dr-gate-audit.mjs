#!/usr/bin/env node
/**
 * Coordinate: S0/#5 (decision-register gate audit — Track 14.T14.2)
 * Actualises: the Track-14 Decision-Register Gate as a machine audit — every
 *   DR row named by the gate (core list + Phase-B rows) must carry Status
 *   VALIDATED or an explicit DOWNGRADED marker in 13-decision-register.md.
 *   Emits the full row-by-row report to plan.runs/14-dr-gate-audit.md;
 *   silently-missing rows are exceptions, never skipped.
 * Does NOT own: the decisions (the Architect), the register file.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const REGISTER = join(
    repoRoot, 'Idea', 'Bimba', 'Seeds', 'M', 'Legacy', 'plans',
    '2026-06-02-m-prime-cycle-3-design-reconciliation', '13-decision-register.md'
);
const OUT = join(
    repoRoot, 'Idea', 'Bimba', 'Seeds', 'M', 'Legacy', 'plans',
    '2026-07-03-m-prime-cycle-3-full-rerun', 'plan.runs', '14-dr-gate-audit.md'
);

/** The gate's named rows (original §Decision-Register Gate) + Phase-B rows. */
const GATE_ROWS = [
    'DR-M0-1', 'DR-M0-2', 'DR-M0-3',
    'DR-M1-1', 'DR-M1-2',
    'DR-M2-1', 'DR-M2-2',
    'DR-M3-1', 'DR-M3-2', 'DR-M3-3',
    'DR-M4-1', 'DR-M4-2',
    'DR-M5-1', 'DR-M5-2',
    'DR-B-2', 'DR-B-3',
    'DR-KB-1', 'DR-KB-2',
    'DR-TS-1',
    'DR-IG-1',
    'DR-S1-4', 'DR-S1-5',
    // Phase-B rows (G11)
    'DR-IG-2', 'DR-IG-3', 'DR-IG-4', 'DR-IG-5', 'DR-IG-6',
    'DR-M1-3', 'DR-M1-4', 'DR-M2-3', 'DR-M4-3', 'DR-M5-3'
];

const register = readFileSync(REGISTER, 'utf8');
const sections = register.split(/^## /m);

function auditRow(id) {
    const section = sections.find(s => s.startsWith(`${id} `) || s.startsWith(`${id} —`) || s.startsWith(`${id}—`) || s.startsWith(`${id}\n`));
    if (!section) {
        return { id, status: 'MISSING', detail: 'no register section found' };
    }
    const statusLine = section.split('\n').find(l => l.includes('**Status:**')) ?? '';
    if (/VALIDATED/i.test(statusLine)) return { id, status: 'VALIDATED', detail: statusLine.trim().slice(0, 110) };
    if (/DOWNGRADED/i.test(statusLine)) return { id, status: 'DOWNGRADED', detail: statusLine.trim().slice(0, 110) };
    return { id, status: 'EXCEPTION', detail: statusLine.trim().slice(0, 110) || 'no Status line' };
}

const rows = GATE_ROWS.map(auditRow);
const exceptions = rows.filter(r => r.status === 'MISSING' || r.status === 'EXCEPTION');

const report = [
    '# 14.T14.2 — Decision-Register Gate Audit',
    '',
    `Audited: ${GATE_ROWS.length} named rows against \`13-decision-register.md\` (machine audit, dr-gate-audit.mjs).`,
    `Gate law: every row VALIDATED or explicitly DOWNGRADED. Exceptions: ${exceptions.length}.`,
    '',
    '| DR row | Status | Register line |',
    '|---|---|---|',
    ...rows.map(r => `| ${r.id} | ${r.status} | ${r.detail.replace(/\|/g, '·')} |`),
    ''
].join('\n');
writeFileSync(OUT, report);

for (const r of rows) {
    console.log(`[dr-gate] ${r.status.padEnd(11)} ${r.id}`);
}
console.log(`[dr-gate] ${rows.length - exceptions.length}/${rows.length} rows pass the gate — report at plan.runs/14-dr-gate-audit.md`);
process.exit(exceptions.length > 0 ? 1 : 0);
