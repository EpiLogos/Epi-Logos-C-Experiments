#!/usr/bin/env node
/**
 * Coordinate: S0/#5 (cycle-3 release-gate runner — Track 14.T14.1)
 * Actualises: the Track-14 closing-gate law as a REPORT stage — mechanises
 *   G1 (ledger re-index parses), G2 (wave matrix files present), G4 (DR row
 *   count), G6 (anti-greenfield smell-test with the M' product-surface
 *   allow-list), and reports G3/G5/G7-G12 as honest OPEN/CLOSED rows with
 *   their owning tracks looked up from the live ledger. NEVER wired into the
 *   per-tranche verify gate (it is the cycle-CLOSE checklist); never runs
 *   `--reset` (the original's own CAUTION).
 * Does NOT own: the gates' closures (their tracks), the ledger (assess script).
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const RERUN = join(
    repoRoot, 'Idea', 'Bimba', 'Seeds', 'M', 'Legacy', 'plans',
    '2026-07-03-m-prime-cycle-3-full-rerun'
);
const RECON = join(
    repoRoot, 'Idea', 'Bimba', 'Seeds', 'M', 'Legacy', 'plans',
    '2026-06-02-m-prime-cycle-3-design-reconciliation'
);

/** G6 allow-list: the explicitly sanctioned M' product surfaces (original §G6)
 *  + the one sanctioned greenfield (2.10 CPT trainer per the recapture register). */
const G6_ALLOW = [
    'logos atelier', 'canon studio', 'backend studio', 'psychoid',
    'f_routing', 'played-torus', 'played-k', 'k² torus', 'k2 torus',
    'omnipanel runtime', 'daily-layer widgets', 'cpt trainer', 'anti-greenfield',
    'no greenfield', 'not greenfield', 'greenfield smell', 'greenfield posture',
    'greenfield rule', 'no-greenfield', 'sanctioned greenfield', 'first-build allowed',
    'first-build (allowed', 'anti-greenfield:', 'first-build surface'
];

const results = [];
function gate(id, status, detail) {
    results.push({ id, status, detail });
}

// ── G1: the rerun ledger re-index parses (plain --write; NEVER --reset) ──
try {
    execFileSync('node', ['.codex/scripts/m-dev-plan-assess.mjs', '--write', RERUN], {
        cwd: repoRoot,
        stdio: 'pipe',
        maxBuffer: 64 * 1024 * 1024
    });
    const index = JSON.parse(readFileSync(join(RERUN, 'plan.index.json'), 'utf8'));
    const count = index.tasks.length;
    gate('G1', count > 500 ? 'CLOSED' : 'OPEN', `ledger re-index parsed ${count} tasks (plain --write)`);
} catch (error) {
    gate('G1', 'OPEN', `assess re-index failed: ${String(error).slice(0, 120)}`);
}

// ── G2: every wave matrix file present ──
{
    const files = [
        ...['0', '1', '2', '3', '4', '5'].map(n => `wave-a-m${n}-reconciliation-matrix.md`),
        ...['kernel-bridge', 'theia-shell', 'agentic-layer', 'integrated-bimba'].map(
            n => `wave-b-${n}-matrix.md`
        )
    ];
    const missing = files.filter(f => !existsSync(join(RECON, 'plan.runs', f)));
    gate('G2', missing.length === 0 ? 'CLOSED' : 'OPEN',
        missing.length === 0 ? `all ${files.length} matrix files present` : `MISSING: ${missing.join(', ')}`);
}

// ── G4: decision-register row count ──
{
    const register = readFileSync(join(RECON, '13-decision-register.md'), 'utf8');
    const rows = (register.match(/^## DR-/gm) ?? []).length;
    gate('G4', rows >= 20 ? 'CLOSED' : 'OPEN', `${rows} DR rows (law: 20+)`);
}

// ── G6: anti-greenfield smell-test with the allow-list ──
{
    let violations = [];
    try {
        const out = execFileSync('grep', [
            '-rni', 'greenfield\\|first-build',
            ...['0', '1'].map(p => `${RECON}`)
        ], { stdio: 'pipe' }).toString();
        violations = out.split('\n').filter(line => {
            if (!line.trim()) return false;
            const lower = line.toLowerCase();
            if (!/greenfield|first-build/.test(lower)) return false;
            return !G6_ALLOW.some(allow => lower.includes(allow));
        });
    } catch {
        violations = [];
    }
    gate('G6', violations.length === 0 ? 'CLOSED' : 'OPEN',
        violations.length === 0
            ? 'no first-build phrasing outside the M′ product-surface allow-list'
            : `${violations.length} hit(s) outside the allow-list (first 3):\n      ${violations.slice(0, 3).join('\n      ')}`);
}

// ── G3/G5/G7-G12: honest track-status lookups from the live ledger ──
{
    const state = JSON.parse(readFileSync(join(RERUN, 'plan.state.json'), 'utf8')).tasks;
    const statusOf = id => state[id]?.status ?? 'pending';
    const lookups = [
        ['G3', 'every load-bearing UX claim classified', 'wave-a matrices (G2) + per-track T0 absorbs', null],
        ['G5', 'every CODE-PENDING has a closing tranche', 'tracks 10/36 complete this session; per-domain tracked', null],
        ['G7', 'UI foundation principles registered', '15.T15.1', statusOf('15.T15.1')],
        ['G8', 'visual-regression baselines committed', '15.T15.12', statusOf('15.T15.12')],
        ['G9', 'total-shape architecture docs landed + harmonised', 'phase-b verification report', existsSync(join(RECON, 'plan.runs', 'phase-b-verification-report.md')) ? 'done' : 'pending'],
        ['G10', 'cross-cutting closures complete', 'track 16 (CCTs)', statusOf('16.T16.1')],
        ['G11', 'Phase-B DRs consumed only after validation/downgrade', '14.T14.2 audits this', statusOf('14.T14.2')],
        ['G12', 'repo-hygiene & navigability audit passes', 'track 43', statusOf('43.T43.1')]
    ];
    for (const [id, law, owner, status] of lookups) {
        const closed = status === 'done';
        gate(id, closed ? 'CLOSED' : 'OPEN', `${law} — owner: ${owner}${status ? ` (${status})` : ''}`);
    }
}

// ── report ──
let mechanisedOpen = 0;
for (const { id, status, detail } of results) {
    const mechanised = ['G1', 'G2', 'G4', 'G6'].includes(id);
    if (mechanised && status === 'OPEN') mechanisedOpen++;
    console.log(`[release-gates] ${status.padEnd(6)} ${id.padEnd(4)} ${detail}`);
}
const open = results.filter(r => r.status === 'OPEN').length;
console.log(`[release-gates] ${results.length - open}/${results.length} gates CLOSED — ${open} OPEN (cycle closes at 0 open; this is the honest checklist, not a failure)`);
process.exit(mechanisedOpen > 0 ? 1 : 0);
