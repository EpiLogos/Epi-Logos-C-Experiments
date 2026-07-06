#!/usr/bin/env node
/**
 * Coordinate: M' (e2e vault sidecar — Track-00 hardening)
 * Residency: Body/M/pratibimba-app/scripts
 * Actualises: the Tauri vault commands over a REAL temp filesystem for
 *   browser-mode e2e. In the browser there is no Rust host, so the
 *   `@tauri-apps/api/mocks` shim (src/bridge/e2eShim.ts) forwards every
 *   invoke() here; this process mirrors src-tauri/src/vault.rs semantics
 *   (write scope, traversal containment, begin_today template) against a
 *   mkdtemp vault root — real bytes, never an in-memory fake.
 * Public surface: POST /invoke {cmd,args} · GET /raw?path= (test-facing raw
 *   file bytes) · GET /health.
 * Does NOT own: vault law (src-tauri/src/vault.rs is the mirrored source of
 *   truth — change that first, then this).
 *   GET /nara-history serves the raw S0 cast-ledger bytes; oracle_cast spawns
 *   the REAL epi binary (--epi-bin) under an isolated $HOME (--nara-home),
 *   mirroring src-tauri/src/oracle.rs — never a simulated draw.
 * Run: node scripts/e2e-vault-sidecar.mjs --port 18934 --vault <root> --gateway-port 18933 \
 *        [--epi-bin <path> --nara-home <dir>]
 */

import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';

function arg(name, fallback = null) {
    const index = process.argv.indexOf(`--${name}`);
    return index !== -1 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const PORT = Number(arg('port', '18934'));
const VAULT_ROOT = arg('vault');
const GATEWAY_PORT = Number(arg('gateway-port', '18933'));
// oracle seam: the REAL epi binary + an ISOLATED nara home ($HOME override) so
// the cast ledger/hygiene state never touches the developer's ~/.epi-logos
const EPI_BIN = arg('epi-bin');
const NARA_HOME = arg('nara-home');
if (!VAULT_ROOT || !existsSync(VAULT_ROOT)) {
    console.error('[e2e-vault-sidecar] --vault <existing dir> is required');
    process.exit(2);
}

/** Mirrors vault.rs WRITE_SCOPE_PREFIX. */
const WRITE_SCOPE_PREFIX = 'Empty/Present/';
const inWriteScope = rel => rel.startsWith(WRITE_SCOPE_PREFIX);

/** Mirrors vault.rs resolve_within: reject `..` segments + containment. */
function resolveWithin(rel) {
    if (String(rel).split('/').some(part => part === '..')) {
        throw new Error(`path escapes the vault: ${rel}`);
    }
    const joined = resolve(VAULT_ROOT, rel);
    if (joined !== resolve(VAULT_ROOT) && !joined.startsWith(resolve(VAULT_ROOT) + sep)) {
        throw new Error(`path escapes the vault: ${rel}`);
    }
    return joined;
}

/** Mirrors vault.rs daily_note_template — canonical C-family frontmatter. */
function dailyNoteTemplate(dayId, createdAt) {
    return `---
coordinate: ""
c_4_artifact_role: "daily-note"
c_1_ct_type: "CT4b"
c_3_ctx_frame: "4.0/1-4.4/5"
c_4_invocation_profile: "day_parent"
c_4_invocation_kind: "app"
c_3_day_id: "${dayId}"
c_3_created_at: "${createdAt}"
c_0_source_coordinates: []
c_5_reflection_complete: false
p0_grounds:
p0_adjacencies:
p1_tasks_defined:
p1_intentions:
p2_sessions: []
p2_operations:
p2_manual_activity:
p3_patterns:
p3_observations:
p3_connections:
p4_temporals:
p4_files_touched: []
p4_people_mentioned:
p4_concepts_engaged:
p5_learnings:
p5_synthesis:
p5_tomorrow_focus:
---

# ${dayId}

`;
}

/** Month-first day id — mirrors vault.rs begin_today (%m-%d-%Y). */
function todayId() {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    return `${mm}-${dd}-${now.getFullYear()}`;
}

const commands = {
    vault_root: () => VAULT_ROOT,
    vault_list: args => {
        const rel = args?.path ?? '';
        const dir = rel ? resolveWithin(rel) : VAULT_ROOT;
        const entries = [];
        for (const name of readdirSync(dir)) {
            if (name.startsWith('.')) {
                continue;
            }
            const isDir = statSync(join(dir, name)).isDirectory();
            entries.push({ name, path: rel ? `${rel}/${name}` : name, isDir });
        }
        // dirs first, then case-insensitive name — mirrors vault.rs sort
        entries.sort((a, b) =>
            a.isDir === b.isDir
                ? a.name.toLowerCase().localeCompare(b.name.toLowerCase())
                : a.isDir
                  ? -1
                  : 1
        );
        return entries;
    },
    vault_read: args => {
        const path = String(args?.path ?? '');
        const content = readFileSync(resolveWithin(path), 'utf8');
        return { path, content, readOnly: !inWriteScope(path) };
    },
    vault_write: args => {
        const path = String(args?.path ?? '');
        if (!inWriteScope(path)) {
            throw new Error(`S1 scope: this surface writes only under ${WRITE_SCOPE_PREFIX} (got ${path})`);
        }
        const full = resolveWithin(path);
        mkdirSync(dirname(full), { recursive: true });
        writeFileSync(full, String(args?.content ?? ''));
        return null;
    },
    begin_today: () => {
        const dayId = todayId();
        const rel = `${WRITE_SCOPE_PREFIX}${dayId}/daily-note.md`;
        const full = resolveWithin(rel);
        let created = false;
        if (!existsSync(full)) {
            mkdirSync(dirname(full), { recursive: true });
            writeFileSync(full, dailyNoteTemplate(dayId, new Date().toISOString()));
            created = true;
        }
        return { dayId, dailyNotePath: rel, created };
    },
    // supervisor surface: the e2e gateway is spawned by global-setup, so the
    // honest state is "external" (adopted, not supervised by a Tauri host)
    gateway_status: () => ({
        state: 'external',
        port: GATEWAY_PORT,
        pid: null,
        detail: 'e2e: real gateway spawned by playwright global-setup (adopted as external)'
    }),
    gateway_restart: () => {
        throw new Error('e2e shim: gateway_restart is owned by the Tauri supervisor, not the browser harness');
    },
    ui_state_load: () => null, // deterministic boots: every page load starts from defaults
    ui_state_save: () => null,
    natal_sky: () => null, // no natal chart configured in the e2e vault
    // Mirrors src-tauri/src/oracle.rs oracle_cast: runs the REAL consent-gated
    // `epi nara oracle cast` (real entropy, real hygiene ledger — under the
    // isolated NARA_HOME), then composes + deposits the day artifact with
    // compose_oracle_artifact's exact template. Never simulates a draw.
    oracle_cast: args => {
        if (!EPI_BIN || !NARA_HOME) {
            throw new Error('e2e sidecar: oracle_cast needs --epi-bin and --nara-home (see global-setup)');
        }
        const system = String(args?.system ?? '');
        const question = String(args?.question ?? '');
        const dayId = String(args?.dayId ?? '');
        let stdout = '';
        let stderr = '';
        try {
            stdout = execFileSync(
                EPI_BIN,
                ['nara', 'oracle', 'cast', '--system', system, '--question', question, '--yes'],
                { env: { ...process.env, HOME: NARA_HOME }, encoding: 'utf8' }
            ).trim();
        } catch (err) {
            stdout = String(err?.stdout ?? '').trim();
            stderr = String(err?.stderr ?? '').trim();
            throw new Error(stderr || stdout || String(err?.message ?? err));
        }
        const output = stdout || stderr;

        // compose_oracle_artifact mirror (oracle.rs) — same rel path, same
        // typed C-family frontmatter, same fenced output block
        const now = new Date();
        const stamp = [now.getHours(), now.getMinutes(), now.getSeconds()]
            .map(n => String(n).padStart(2, '0'))
            .join('');
        const rel = `${WRITE_SCOPE_PREFIX}${dayId}/oracle-${stamp}-${system}.md`;
        const questionEscaped = question.replace(/"/g, '\\"');
        const content = `---
coordinate: ""
c_4_artifact_role: "oracle-cast"
c_1_ct_type: "CT3"
c_3_day_id: "${dayId}"
c_3_created_at: "${now.toISOString()}"
c_2_oracle_system: "${system}"
c_2_oracle_question: "${questionEscaped}"
c_4_invocation_kind: "app"
c_0_source_coordinates: []
---

# Oracle — ${system}

> ${question}

\`\`\`text
${output}
\`\`\`
`;
        commands.vault_write({ path: rel, content });
        return { artifactPath: rel, output, system };
    }
};

function respond(res, status, body) {
    res.writeHead(status, {
        'content-type': 'application/json',
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET,POST,OPTIONS',
        'access-control-allow-headers': 'content-type'
    });
    res.end(JSON.stringify(body));
}

const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${PORT}`);
    if (req.method === 'OPTIONS') {
        respond(res, 204, {});
        return;
    }
    if (req.method === 'GET' && url.pathname === '/health') {
        respond(res, 200, { ok: true, vaultRoot: VAULT_ROOT });
        return;
    }
    // test-facing endpoint: the REAL file bytes, straight off the disk
    if (req.method === 'GET' && url.pathname === '/raw') {
        try {
            const bytes = readFileSync(resolveWithin(url.searchParams.get('path') ?? ''));
            res.writeHead(200, {
                'content-type': 'text/plain; charset=utf-8',
                'access-control-allow-origin': '*'
            });
            res.end(bytes);
        } catch (err) {
            respond(res, 404, { ok: false, error: String(err?.message ?? err) });
        }
        return;
    }
    // test-facing endpoint: the REAL S0 cast-ledger bytes (epi-cli's own
    // oracle history under the isolated nara home) — proves the CLI layer
    // actually ran; the browser cannot reach into this file any other way
    if (req.method === 'GET' && url.pathname === '/nara-history') {
        if (!NARA_HOME) {
            respond(res, 404, { ok: false, error: 'no --nara-home configured' });
            return;
        }
        const ledger = join(NARA_HOME, '.epi-logos', 'nara', 'oracle', 'history.jsonl');
        if (!existsSync(ledger)) {
            respond(res, 404, { ok: false, error: `no cast ledger yet at ${ledger}` });
            return;
        }
        res.writeHead(200, {
            'content-type': 'text/plain; charset=utf-8',
            'access-control-allow-origin': '*'
        });
        res.end(readFileSync(ledger));
        return;
    }
    if (req.method === 'POST' && url.pathname === '/invoke') {
        let raw = '';
        req.on('data', chunk => {
            raw += chunk;
        });
        req.on('end', () => {
            try {
                const { cmd, args } = JSON.parse(raw || '{}');
                const handler = commands[cmd];
                if (!handler) {
                    respond(res, 200, { ok: false, error: `e2e sidecar: unknown command '${cmd}'` });
                    return;
                }
                respond(res, 200, { ok: true, result: handler(args ?? {}) });
            } catch (err) {
                respond(res, 200, { ok: false, error: String(err?.message ?? err) });
            }
        });
        return;
    }
    respond(res, 404, { ok: false, error: `no route: ${req.method} ${url.pathname}` });
});

server.listen(PORT, '127.0.0.1', () => {
    console.error(`[e2e-vault-sidecar] listening on 127.0.0.1:${PORT}, vault ${VAULT_ROOT}`);
});
