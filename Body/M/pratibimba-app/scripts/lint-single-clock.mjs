#!/usr/bin/env node
/**
 * Coordinate: M' composition (single-clock discipline — 29.T29.4, DR-WC-IP-4)
 * Residency: Body/M/pratibimba-app/scripts
 * Position (#n): #4 — Context/Type; mechanical enforcement of the one-clock law
 * Actualises: 29.4's companion audit lint — one subscription per composition,
 *   one way in. A profile frame reaches the clock only through
 *   `publishProfileTick`; the socket is constructed only where App owns it.
 *   Applies carrier-wide, tests included.
 * Public surface: SOCKET_OWNERS, CLOCK_WRITER_OWNERS, FORBIDDEN_CALLS,
 *   calleeName, scanSource, scanTree, main;
 *   CLI: node scripts/lint-single-clock.mjs [--src <dir>] [--json]
 * Does NOT own: the seam (src/composition/profileTickSubscription.ts), the
 *   store (src/state/stores.ts), the timer law (30.11), or suite orchestration.
 * Contract: findings exit 1 with the exact file:line list. Reads the TypeScript
 *   AST, never a regex — comments and string bodies are not calls.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_SRC_ROOT = resolve(SCRIPT_DIR, '..', 'src');

/** Files allowed to construct the socket: App owns the one client, and the
 *  client's own tests must be able to build one to test it. */
export const SOCKET_OWNERS = Object.freeze([
    'App.tsx',
    'bridge/gatewayClient.ts',
    'bridge/gatewayClient.test.ts',
    'bridge/gatewayClient.live.test.ts'
]);

/** Files allowed to write the clock: the store declares the mutator, the seam
 *  is the one caller. Everything else — App, panes, tests — goes through
 *  `publishProfileTick` / `resetProfileTicks`. */
export const CLOCK_WRITER_OWNERS = Object.freeze([
    'state/stores.ts',
    'state/stores.test.ts',
    'composition/profileTickSubscription.ts'
]);

/** Bare callee names that write the clock, and the store they belong to. */
export const FORBIDDEN_CALLS = Object.freeze({
    setProfile: 'the clock mutator',
    'useTickStore.setState': 'a direct store write'
});

const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs']);

/** `{ bare, qualified }` for a call's callee, or null when unnameable. */
export function calleeName(expression) {
    if (ts.isIdentifier(expression)) {
        return { bare: expression.text, qualified: expression.text };
    }
    if (ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.name)) {
        const receiver = expression.expression.getText();
        return { bare: expression.name.text, qualified: `${receiver}.${expression.name.text}` };
    }
    return null;
}

export function scanSource(text, relPath) {
    const findings = [];
    const mayOpenSocket = SOCKET_OWNERS.includes(relPath);
    const mayWriteClock = CLOCK_WRITER_OWNERS.includes(relPath);
    const source = ts.createSourceFile(
        relPath,
        text,
        ts.ScriptTarget.Latest,
        true,
        relPath.endsWith('.tsx') || relPath.endsWith('.jsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );

    const record = (node, kind, detail) =>
        findings.push({
            file: relPath,
            line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
            kind,
            detail
        });

    const visit = node => {
        if (
            ts.isNewExpression(node) &&
            ts.isIdentifier(node.expression) &&
            node.expression.text === 'GatewayClient' &&
            !mayOpenSocket
        ) {
            record(node, 'second-gateway-client', 'new GatewayClient(…)');
        }
        if (ts.isCallExpression(node) && !mayWriteClock) {
            const name = calleeName(node.expression);
            if (name) {
                // `setProfile` is judged by its RECEIVER, not its name: a test
                // may define a local helper called `setProfile` that already
                // delegates to the seam, and that is not a second clock. Only
                // the store's own mutator — reached through `useTickStore` or a
                // `getState()` handle on it — is a finding.
                const receiver =
                    ts.isPropertyAccessExpression(node.expression) &&
                    node.expression.name.text === 'setProfile'
                        ? node.expression.expression.getText()
                        : null;
                if (receiver !== null && /useTickStore|getState\s*\(\s*\)/.test(receiver)) {
                    record(node, 'second-clock-writer', `${receiver}.setProfile(…)`);
                } else if (name.qualified === 'useTickStore.setState') {
                    record(node, 'second-clock-writer', 'useTickStore.setState(…)');
                }
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
    return findings;
}

export function scanTree(srcRoot = DEFAULT_SRC_ROOT) {
    const findings = [];
    let scannedFiles = 0;
    const walk = dir => {
        for (const entry of readdirSync(dir).sort()) {
            if (entry === 'node_modules' || entry === 'dist' || entry === '__fixtures__') continue;
            const full = join(dir, entry);
            if (statSync(full).isDirectory()) {
                walk(full);
                continue;
            }
            const dot = entry.lastIndexOf('.');
            if (dot < 0 || !SCAN_EXTENSIONS.has(entry.slice(dot))) continue;
            scannedFiles += 1;
            const relPath = relative(srcRoot, full).split(sep).join('/');
            findings.push(...scanSource(readFileSync(full, 'utf8'), relPath));
        }
    };
    walk(srcRoot);
    return { srcRoot, scannedFiles, findings };
}

function parseArgs(argv) {
    const options = { srcRoot: DEFAULT_SRC_ROOT, json: false };
    for (let i = 0; i < argv.length; i += 1) {
        if (argv[i] === '--src') options.srcRoot = resolve(argv[(i += 1)]);
        else if (argv[i] === '--json') options.json = true;
        else throw new Error(`unknown argument: ${argv[i]}`);
    }
    return options;
}

export function main(argv = process.argv.slice(2)) {
    let options;
    try {
        options = parseArgs(argv);
    } catch (cause) {
        console.error(`[lint-single-clock] ${cause instanceof Error ? cause.message : cause}`);
        return 2;
    }
    const report = scanTree(options.srcRoot);
    if (options.json) {
        console.log(JSON.stringify(report, null, 2));
    } else {
        for (const finding of report.findings) {
            console.error(
                `[lint-single-clock] ${finding.file}:${finding.line} ${finding.kind} ` +
                `'${finding.detail}' — frames reach the clock through publishProfileTick() ` +
                `(29.4 / DR-WC-IP-4)`
            );
        }
    }
    if (report.findings.length > 0) {
        console.error(
            `[lint-single-clock] RED — ${report.findings.length} second-clock site(s) ` +
            `across ${report.scannedFiles} carrier source files`
        );
        return 1;
    }
    console.log(
        `[lint-single-clock] GREEN — ${report.scannedFiles} source files; ` +
        `one socket, one way in (29.4 / DR-WC-IP-4)`
    );
    return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    process.exitCode = main();
}
