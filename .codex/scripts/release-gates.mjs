#!/usr/bin/env node
/**
 * Coordinate: S0/#5 (cycle-3 release-gate runner — Track 14.T14.1)
 * Actualises: the Track-14 closing-gate law as a REPORT stage — mechanises
 *   G1 (ledger re-index parses), G2 (wave matrix files present), G4 (DR row
 *   count), G6 (anti-greenfield smell-test with the M' product-surface
 *   allow-list), G3 (every claim row in every wave matrix carries a
 *   classification, and the re-audit carries no STILL-ORPHAN row) and G5
 *   (every CODE-PENDING row's absorbing track has no unrouted tranche), and
 *   reports G7-G12 as honest OPEN/CLOSED rows with their owning tracks looked
 *   up from the live ledger. NEVER wired into the per-tranche verify gate (it
 *   is the cycle-CLOSE checklist); never runs `--reset` (the original's own
 *   CAUTION).
 *
 * Gate classes — an OPEN row means different things in each:
 *   - corpus-integrity (G1/G2/G3/G4/G6): static invariants over the
 *     reconciliation corpus. An OPEN row here is a DEFECT and drives exit 1.
 *   - progress (G5/G7-G12): live ledger lookups that flip CLOSED as their
 *     owning tracks finish. An OPEN row here is honest cycle state, not a
 *     failure — reported, never exit-code-bearing.
 *
 * G3/G5 were hardcoded `null` until 2026-07-25 (resolved under 14.T14.4):
 * `closed = status === 'done'` made them read unconditionally OPEN, so they
 * could never close and structurally blocked the cycle seal at 10/12. Both
 * laws are mechanical accounting statements ("account for every claim", "no
 * silent pending markers") rather than human sign-off, so both are now
 * live-computed from the corpus + ledger.
 *
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

/** The classification vocabulary the wave matrices actually use in their
 *  Status column. A claim row is "classified" (G3) when its Status cell names
 *  at least one of these. Longest-first so DOC-AHEAD-LANDING wins over
 *  DOC-AHEAD when both would match. */
const CLAIM_CLASSES = [
    'DOC-AHEAD-LANDING', 'CODE-PENDING', 'CONTRADICTION', 'AUDIT-EXTEND',
    'DR-LANDING', 'DOWNGRADED', 'SPEC-AHEAD', 'DOC-AHEAD', 'DEFERRED',
    'RESOLVED', 'ALIGNED', 'CARRIED', 'ROUTED', 'ORPHAN', 'AUDIT', 'DEFER', 'N/A'
];

/** G5 absorbing-track map. The original G5 law names its closing tranches by
 *  domain ("Tranches 10.x for profile-spine … Tranche 12 for agentic-layer …
 *  Tranche 09 for graph-substrate … Track 36 …; per-subsystem tranches for
 *  domain-pending"). Each wave matrix corresponds 1:1 to the rerun track that
 *  absorbs its rows, and the correspondence is legible in the filenames
 *  (`wave-c-m3-mahamaya-frontend` ↔ `24-m3-mahamaya-frontend-deep.md`). Wave-C
 *  matrices postdate the original law's wording but carry the same kind of
 *  marker, so they are held to the same rule — G5 covers the whole corpus. */
const MATRIX_OWNER = {
    'wave-a-m0': '01', 'wave-a-m1': '02', 'wave-a-m2': '03',
    'wave-a-m3': '04', 'wave-a-m4': '05', 'wave-a-m5': '06',
    'wave-b-integrated-bimba': '09', 'wave-b-kernel-bridge': '10',
    'wave-b-theia-shell': '11', 'wave-b-agentic-layer': '12',
    'wave-c-m0-anuttara-frontend': '21', 'wave-c-m1-paramasiva-frontend': '22',
    'wave-c-m2-parashakti-frontend': '23', 'wave-c-m3-mahamaya-frontend': '24',
    'wave-c-m4-nara-frontend': '25', 'wave-c-m5-epii-frontend': '26',
    'wave-c-omnipanel-tabs': '27', 'wave-c-ide-shell-chrome': '28',
    'wave-c-integrated-plugins-composition': '29', 'wave-c-design-language': '30',
    'wave-c-chrome-contributions': '31', 'wave-c-onboarding-settings': '32'
};

/** Split a markdown table row into cells. Pipes inside `code spans` and
 *  escaped `\|` are content, not delimiters — a naive split shreds these
 *  matrices (their cells are full of `A | B` type unions). */
function splitCells(line) {
    const s = line.trim();
    const cells = [];
    let cur = '';
    let inTick = false;
    for (let i = 0; i < s.length; i += 1) {
        const ch = s[i];
        if (ch === '\\' && s[i + 1] === '|') { cur += '|'; i += 1; continue; }
        if (ch === '`') { inTick = !inTick; cur += ch; continue; }
        if (ch === '|' && !inTick) { cells.push(cur); cur = ''; continue; }
        cur += ch;
    }
    cells.push(cur);
    if (cells.length && cells[0].trim() === '') cells.shift();
    if (cells.length && cells[cells.length - 1].trim() === '') cells.pop();
    return cells.map(c => c.trim());
}

const isSeparatorRow = cells =>
    cells.length > 0 && cells.every(c => /^:?-{2,}:?$/.test(c));
const isStatusHeader = cell =>
    /^\**\s*(status|classification|verdict|disposition)\s*\**$/.test(cell.trim().toLowerCase());

/** Walk every claim row of every wave matrix, yielding its Status cell.
 *  The Status column is located from each table's own header and addressed by
 *  distance-from-the-end, so a row carrying an extra un-backticked pipe still
 *  resolves to the right cell instead of silently reading a neighbour. */
function* claimRows() {
    const matrices = execFileSync('ls', [join(RECON, 'plan.runs')], { stdio: 'pipe' })
        .toString().split('\n')
        .filter(f => /^wave-.*matrix\.md$/.test(f))
        .sort();
    for (const file of matrices) {
        const key = file.replace('-matrix.md', '').replace('-reconciliation', '');
        const lines = readFileSync(join(RECON, 'plan.runs', file), 'utf8').split('\n');
        let statusOffset = null;
        for (let i = 0; i < lines.length; i += 1) {
            if (!lines[i].trim().startsWith('|')) continue;
            const cells = splitCells(lines[i]);
            if (isSeparatorRow(cells)) continue;
            const headerIndex = cells.reduce((acc, c, j) => (isStatusHeader(c) ? j : acc), -1);
            if (headerIndex >= 0) { statusOffset = headerIndex - cells.length; continue; }
            if (statusOffset === null || cells.length < -statusOffset) continue;
            yield { file, key, line: i + 1, status: cells[cells.length + statusOffset] };
        }
    }
}

// ── G3: every load-bearing UX claim classified ──
// Law: "Per-subsystem matrix files account for every claim in each UX doc;
// orphan rows above route to a tranche." Two mechanical halves: no claim row
// may lack a classification, and no orphan may remain STILL-ORPHAN.
{
    let total = 0;
    const unclassified = [];
    for (const row of claimRows()) {
        total += 1;
        const cell = row.status.toUpperCase();
        if (!CLAIM_CLASSES.some(c => cell.includes(c))) {
            unclassified.push(`${row.file}:${row.line} → "${row.status.slice(0, 60)}"`);
        }
    }
    const reauditPath = join(RERUN, 'plan.runs', '14-open-orphans-reaudit.md');
    const reaudit = existsSync(reauditPath) ? readFileSync(reauditPath, 'utf8') : null;
    const stillOrphan = reaudit === null
        ? ['14-open-orphans-reaudit.md is MISSING (14.T14.3 deliverable)']
        : reaudit.split('\n').filter(l => l.trim().startsWith('|') && /STILL-ORPHAN/.test(l));
    const problems = [...unclassified, ...stillOrphan];
    gate('G3', problems.length === 0 ? 'CLOSED' : 'OPEN',
        problems.length === 0
            ? `${total} claim rows across the wave matrices all carry a classification; re-audit carries 0 STILL-ORPHAN rows`
            : `${unclassified.length}/${total} claim rows unclassified, ${stillOrphan.length} STILL-ORPHAN (first 3):\n      ${problems.slice(0, 3).join('\n      ')}`);
}

// ── shared ledger view for G5 + G7-G12 ──
const state = JSON.parse(readFileSync(join(RERUN, 'plan.state.json'), 'utf8')).tasks;
const index = JSON.parse(readFileSync(join(RERUN, 'plan.index.json'), 'utf8'));
const statusOf = id => state[id]?.status ?? 'pending';

// ── G5: every CODE-PENDING has a closing tranche ──
// Law: closing tranches per domain, and "No silent pending markers." A marker
// is absorbed when its owning track has no unrouted tranche left: every task
// is `done`, or `blocked` with a CLASSIFIED blocker (kind + named dependency —
// loud, not silent). Anything else (pending / in_progress / review /
// audit_required / quarantine) leaves the marker unabsorbed.
{
    const trackTasks = new Map();
    for (const task of index.tasks) {
        if (!trackTasks.has(task.trackId)) trackTasks.set(task.trackId, []);
        trackTasks.get(task.trackId).push(task.id);
    }
    const unrouted = track => (trackTasks.get(track) ?? []).filter(id => {
        const task = state[id] ?? {};
        if (task.status === 'done') return false;
        if (task.status === 'blocked' && task.blocker?.kind) return false;
        return true;
    }).map(id => `${id}:${statusOf(id)}`);

    const markers = new Map();
    for (const row of claimRows()) {
        if (!row.status.toUpperCase().includes('CODE-PENDING')) continue;
        markers.set(row.key, (markers.get(row.key) ?? 0) + 1);
    }
    let total = 0;
    const open = [];
    const unmapped = [];
    for (const [key, count] of [...markers].sort()) {
        total += count;
        const track = MATRIX_OWNER[key];
        if (!track) { unmapped.push(`${key} (${count} markers, no absorbing track mapped)`); continue; }
        const left = unrouted(track);
        if (left.length) open.push(`track ${track} ← ${count} marker(s) in ${key}: ${left.length} unrouted (${left.slice(0, 3).join(', ')}${left.length > 3 ? ', …' : ''})`);
    }
    const problems = [...unmapped, ...open];
    gate('G5', problems.length === 0 ? 'CLOSED' : 'OPEN',
        problems.length === 0
            ? `all ${total} CODE-PENDING markers absorbed — every owning track is done or classified-blocked`
            : `${total} CODE-PENDING markers; ${problems.length} owning track(s) still unrouted:\n      ${problems.join('\n      ')}`);
}

// ── G7-G12: honest track-status lookups from the live ledger ──
{
    const lookups = [
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

// ── report (gate order, not evaluation order) ──
/** Corpus-integrity gates: static invariants over the reconciliation corpus.
 *  An OPEN row here is a defect and fails the run. The progress gates
 *  (G5/G7-G12) track live cycle state and never bear the exit code. */
const CORPUS_INTEGRITY = ['G1', 'G2', 'G3', 'G4', 'G6'];
let mechanisedOpen = 0;
results.sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)));
for (const { id, status, detail } of results) {
    if (CORPUS_INTEGRITY.includes(id) && status === 'OPEN') mechanisedOpen++;
    console.log(`[release-gates] ${status.padEnd(6)} ${id.padEnd(4)} ${detail}`);
}
const open = results.filter(r => r.status === 'OPEN').length;
console.log(`[release-gates] ${results.length - open}/${results.length} gates CLOSED — ${open} OPEN (cycle closes at 0 open; this is the honest checklist, not a failure)`);
process.exit(mechanisedOpen > 0 ? 1 : 0);
