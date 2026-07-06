#!/usr/bin/env node
/**
 * Coordinate: M'/S3 (gateway method existence probe — Track 00.T5, cycle-3 full rerun)
 * Residency: Body/M/pratibimba-app/scripts/gateway-method-audit.mjs
 * Position (#n): #5 — Integration; recon-before-build made mechanical
 * Actualises: [[00-verification-harness]] T5 — sweeps the cycle-3 plan corpus
 *   for every gateway method it names, probes each against a REAL spawned
 *   gateway, and writes the machine-readable existence table to
 *   plan.runs/gateway-method-audit.json. Rerun tranches consult this table
 *   instead of trusting any plan's claims about what the gateway has.
 * Public surface: extractMethodNames, classifyResponse, CYCLE3_FAMILY_PREFIXES,
 *   probeMethods, main; CLI: node scripts/gateway-method-audit.mjs [--port N] [--out F]
 * Does NOT own: the method inventory law (gateway-contract METHOD_NAMES);
 *   dispatch behavior (epi-cli gate/ + S3 gateway crate).
 * Contract: re-runs are idempotent — same corpus + same gateway ⇒ same table
 *   (modulo generatedAt).
 */

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { connect } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import WebSocket from 'ws';

const appRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const repoRoot = resolve(appRoot, '..', '..', '..');
const EPI_BIN =
    process.env.EPI_BIN ?? join(repoRoot, 'Body', 'S', 'S0', 'epi-cli', 'target', 'debug', 'epi');
const PLAN_FOLDERS = [
    join(repoRoot, 'Idea', 'Bimba', 'Seeds', 'M', 'Legacy', 'plans', '2026-07-03-m-prime-cycle-3-full-rerun'),
    join(repoRoot, 'Idea', 'Bimba', 'Seeds', 'M', 'Legacy', 'plans', '2026-06-02-m-prime-cycle-3-design-reconciliation'),
];
const DEFAULT_OUT = join(PLAN_FOLDERS[0], 'plan.runs', 'gateway-method-audit.json');
const DEFAULT_PORT = 18923;

/**
 * The method families named across cycle-3 (tranche T5 inventory) plus the
 * gateway's own base families — a scanned token must start with one of these
 * to count as a method name.
 */
export const CYCLE3_FAMILY_PREFIXES = [
    "s0'.", "s0.", "s1'.", "s1.", "s2'.", "s2.", "s3'.", "s3.", "s4'.", "s4.",
    "s5'.", "s5.", 'm4.arena.', 'm2.', 'm3.', 'contemplate_',
    'sessions.', 'session.', 'cron.', 'chat.', 'channels.', 'config.',
    'skills.', 'models.', 'nara.', 'graph.', 'wizard.', 'tts.', 'voicewake.',
    'exec.', 'device.', 'node.', 'usage.',
];

const METHOD_TOKEN_RE = /[a-zA-Z0-9_'.*-]+/g;

/** Extract cycle-3 method-name tokens from one plan document (quoted or bare). */
export function extractMethodNames(text) {
    const names = new Set();
    for (const match of text.matchAll(METHOD_TOKEN_RE)) {
        let token = match[0].replace(/^\.+|\.+$/g, '');
        if (/^\d/.test(token)) continue;
        if (token.includes('*') || token.includes('-') || token.includes('..')) continue;
        if (!token.includes('.') && !token.startsWith('contemplate_')) continue;
        if (/\.(md|rs|ts|tsx|mjs|js|json|c|h|py|csv|yaml|toml|canvas|lock|sh)$/.test(token)) continue;
        if (!CYCLE3_FAMILY_PREFIXES.some(prefix => token.startsWith(prefix))) continue;
        // require at least method-like depth: family.name (dot after the prefix)
        if (!token.startsWith('contemplate_') && token.split('.').length < 2) continue;
        names.add(token);
    }
    return [...names].sort();
}

/** Classify one gateway response frame (null = timed out). */
export function classifyResponse(frame) {
    if (!frame) return { exists: null, responds: false, errorClass: 'timeout' };
    if (frame.error) {
        const message = String(frame.error.message ?? frame.error.code ?? frame.error);
        if (frame.error.code === 'unimplemented' || /is not implemented/i.test(message)) {
            return { exists: false, responds: true, errorClass: 'unimplemented' };
        }
        if (/unknown method|method not found|unsupported method|no such method/i.test(message)) {
            return { exists: false, responds: true, errorClass: 'unknown-method' };
        }
        return {
            exists: true,
            responds: true,
            errorClass: `domain-error: ${message.slice(0, 120)}`,
        };
    }
    return { exists: true, responds: true, errorClass: null };
}

function scanCorpus(folders = PLAN_FOLDERS) {
    const names = new Set();
    for (const folder of folders) {
        if (!existsSync(folder)) continue;
        for (const entry of readdirSync(folder)) {
            if (!entry.endsWith('.md')) continue;
            const text = readFileSync(join(folder, entry), 'utf8');
            for (const name of extractMethodNames(text)) names.add(name);
        }
    }
    return [...names].sort();
}

function waitForPort(port, timeoutMs) {
    const deadline = Date.now() + timeoutMs;
    return new Promise((resolvePort, rejectPort) => {
        const attempt = () => {
            const socket = connect({ port, host: '127.0.0.1' }, () => {
                socket.destroy();
                resolvePort();
            });
            socket.on('error', () => {
                socket.destroy();
                if (Date.now() > deadline) rejectPort(new Error(`port ${port} did not open`));
                else setTimeout(attempt, 400);
            });
        };
        attempt();
    });
}

/** Probe each method against a live gateway websocket; returns table rows. */
export async function probeMethods(methods, { port = DEFAULT_PORT, epiBin = EPI_BIN, perCallTimeoutMs = 4000 } = {}) {
    const stateRoot = mkdtempSync(join(tmpdir(), 'gateway-audit-'));
    const gateway = spawn(epiBin, ['gate', 'start', '--port', String(port)], {
        env: { ...process.env, EPI_GATE_STATE_ROOT: stateRoot },
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    const rows = [];
    try {
        await waitForPort(port, 20000);
        const ws = new WebSocket(`ws://127.0.0.1:${port}`);
        const pending = new Map();
        let nextId = 1;

        ws.on('message', data => {
            let frame;
            try {
                frame = JSON.parse(String(data));
            } catch {
                return;
            }
            if (frame.type === 'res' && pending.has(frame.id)) {
                pending.get(frame.id)(frame);
                pending.delete(frame.id);
            }
        });

        const request = (method, params = {}) =>
            new Promise(resolveReq => {
                const id = nextId++;
                const timer = setTimeout(() => {
                    pending.delete(id);
                    resolveReq(null);
                }, perCallTimeoutMs);
                pending.set(id, frame => {
                    clearTimeout(timer);
                    resolveReq(frame);
                });
                ws.send(JSON.stringify({ type: 'req', id, method, params }));
            });

        await new Promise((resolveOpen, rejectOpen) => {
            ws.on('open', resolveOpen);
            ws.on('error', rejectOpen);
        });
        const hello = await request('connect');
        if (!hello || hello.error) {
            throw new Error(`connect handshake failed: ${JSON.stringify(hello?.error ?? 'timeout')}`);
        }
        const advertised = new Set(hello.result?.features?.methods ?? []);

        for (const method of methods) {
            const frame = await request(method);
            rows.push({ method, advertised: advertised.has(method), ...classifyResponse(frame) });
        }
        ws.close();
    } finally {
        if (gateway.exitCode === null) gateway.kill();
        rmSync(stateRoot, { recursive: true, force: true });
    }
    return rows;
}

function parseArgs(argv) {
    const opts = { port: DEFAULT_PORT, out: DEFAULT_OUT };
    for (let i = 0; i < argv.length; i += 1) {
        if (argv[i] === '--port') opts.port = Number(argv[(i += 1)]);
        else if (argv[i] === '--out') opts.out = argv[(i += 1)];
        else throw new Error(`unknown argument '${argv[i]}'`);
    }
    return opts;
}

async function main() {
    const opts = parseArgs(process.argv.slice(2));
    const methods = scanCorpus();
    console.log(`[gateway-method-audit] ${methods.length} methods named across the cycle-3 corpus`);
    const rows = await probeMethods(methods, { port: opts.port });
    const present = rows.filter(r => r.exists === true).length;
    const absent = rows.filter(r => r.exists === false).length;
    const unknown = rows.filter(r => r.exists === null).length;
    const table = {
        generatedAt: new Date().toISOString(),
        gatewayBin: EPI_BIN,
        port: opts.port,
        corpus: PLAN_FOLDERS.map(f => f.replace(`${repoRoot}/`, '')),
        summary: { probed: rows.length, present, absent, unknown },
        methods: rows,
    };
    mkdirSync(join(opts.out, '..'), { recursive: true });
    writeFileSync(opts.out, JSON.stringify(table, null, 1));
    console.log(`[gateway-method-audit] present=${present} absent=${absent} timeout=${unknown}`);
    console.log(`[gateway-method-audit] table written: ${opts.out}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main().catch(err => {
        console.error(`[gateway-method-audit] FAIL — ${err.message}`);
        process.exit(1);
    });
}
