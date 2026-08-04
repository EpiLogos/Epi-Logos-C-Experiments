#!/usr/bin/env node
/**
 * Coordinate: M' (native carrier boot gate)
 * Residency: Body/M/pratibimba-app/scripts
 * Position (#n): shell verification boundary
 * Actualises: a real macOS Tauri/WKWebView cold-start receipt. The gate waits
 *   until the mounted face reports a non-zero FlexLayout after two frames.
 * Public surface: `node scripts/tauri-boot-smoke.mjs` via `pnpm smoke`.
 * Does NOT own: renderer interaction coverage or gateway wire semantics.
 * Contract: [[CHROME-CONTRACT]] / root [[AGENTS]] verification law.
 */

import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sweepPort, waitForPortToClose } from '../tests/e2e/port-sweep.mjs';

const DEV_PORT = 14620;
const GATEWAY_PORT = 18794;
const READY = '[tauri-boot-smoke] READY ';
const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = resolve(APP_ROOT, '../../..');
const VAULT_ROOT = join(REPO_ROOT, 'Idea');
const PROCESS_RECORD = join(REPO_ROOT, '.epi/gate/up/gateway-process.json');
const FATAL_PATTERNS = [
    /Maximum update depth exceeded/,
    /\[vite\] \(client\) \[Unhandled error\]/,
    /tauri-boot-smoke: shell did not commit/
];
const TIMEOUT_MS = Number(process.env.EPI_TAURI_BOOT_TIMEOUT_MS ?? 180_000);

let child;
let settled = false;
let failed = false;
let output = '';
let readyReceipt = null;
let configDir = null;

function stopChild(signal = 'SIGTERM') {
    if (!child?.pid) return;
    try {
        process.kill(-child.pid, signal);
    } catch {
        // The process group may already have exited after reporting a failure.
    }
}

function fail(message) {
    if (failed) return;
    failed = true;
    settled = true;
    console.error(`[tauri-boot-smoke] FAIL ${message}`);
    stopChild();
    setTimeout(() => stopChild('SIGKILL'), 2_000).unref();
    process.exitCode = 1;
}

function inspect(chunk) {
    if (failed || readyReceipt) return;
    const text = String(chunk);
    output = (output + text).slice(-16_384);
    process.stdout.write(text);
    if (FATAL_PATTERNS.some(pattern => pattern.test(output))) {
        fail('the WKWebView reported an unhandled render failure');
        return;
    }
    const readyAt = output.lastIndexOf(READY);
    if (readyAt !== -1 && !readyReceipt) {
        const raw = output.slice(readyAt + READY.length).split('\n', 1)[0].trim();
        try {
            readyReceipt = JSON.parse(raw);
            settled = true;
        } catch (error) {
            fail(`native readiness receipt is not JSON: ${error.message}`);
        }
    }
}

function assertReceipt(receipt) {
    if (receipt.supervisorState !== 'supervised') {
        throw new Error(`carrier did not supervise its gateway (${receipt.supervisorState ?? 'missing'})`);
    }
    if (receipt.binarySource !== 'repo-shared-target') {
        throw new Error(`stale config did not repair through the shared target (${receipt.binarySource ?? 'missing'})`);
    }
    if (!String(receipt.binaryPath ?? '').endsWith('/target/debug/epi')) {
        throw new Error(`unexpected supervised binary path (${receipt.binaryPath ?? 'missing'})`);
    }
    if (!String(receipt.binaryIdentity ?? '').startsWith('Usage: epi ')) {
        throw new Error('supervisor did not prove an epi-compatible command surface');
    }
    if (!Number.isInteger(receipt.profileGeneration) || receipt.profileGeneration < 0) {
        throw new Error('native renderer did not observe a valid profile generation');
    }
    if (receipt.vaultRoot !== VAULT_ROOT) {
        throw new Error(`native vault root mismatch (${receipt.vaultRoot ?? 'missing'})`);
    }
    if (!(receipt.width > 0 && receipt.height > 0)) {
        throw new Error('native workbench did not commit non-zero dimensions');
    }
}

async function main() {
    sweepPort(DEV_PORT, { label: 'tauri-boot-smoke' });
    sweepPort(GATEWAY_PORT, { label: 'tauri-boot-smoke' });
    await waitForPortToClose(DEV_PORT, 5_000);
    await waitForPortToClose(GATEWAY_PORT, 5_000);

    configDir = await mkdtemp(join(tmpdir(), 'pratibimba-native-smoke-'));
    await writeFile(
        join(configDir, 'config.json'),
        JSON.stringify({ vaultRoot: VAULT_ROOT, epiBin: join(REPO_ROOT, 'Body/S/S0/epi-cli/target/debug/epi') }),
        'utf8'
    );

    const env = {
        ...process.env,
        EPI_APP_CONFIG_DIR: configDir,
        EPILOGOS_VAULT: VAULT_ROOT,
        VITE_TAURI_BOOT_SMOKE: '1'
    };
    delete env.EPI_BIN;

    child = spawn('pnpm', ['tauri', 'dev'], {
        detached: true,
        env,
        stdio: ['ignore', 'pipe', 'pipe']
    });
    child.stdout.on('data', inspect);
    child.stderr.on('data', inspect);
    child.on('error', error => fail(`could not launch Tauri: ${error.message}`));
    child.on('exit', code => {
        if (!settled) fail(`Tauri exited before the shell receipt (code ${code ?? 'signal'})`);
    });

    const deadline = setTimeout(() => {
        fail(`no native shell receipt within ${TIMEOUT_MS}ms`);
    }, TIMEOUT_MS);

    while (!settled) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    clearTimeout(deadline);
    if (!readyReceipt) {
        throw new Error('native process ended without a readiness receipt');
    }
    assertReceipt(readyReceipt);
    const processRecord = JSON.parse(await readFile(PROCESS_RECORD, 'utf8'));
    if (processRecord.pid !== readyReceipt.gatewayPid || processRecord.supervisor !== 'pratibimba-app') {
        throw new Error('native supervisor process record does not match the readiness receipt');
    }
    console.log(`[tauri-boot-smoke] PASS native organism ready ${JSON.stringify(readyReceipt)}`);
    stopChild();
    await waitForPortToClose(DEV_PORT, 5_000).catch(() => stopChild('SIGKILL'));
    await waitForPortToClose(GATEWAY_PORT, 8_000).catch(() => stopChild('SIGKILL'));
}

try {
    await main();
} catch (error) {
    fail(error instanceof Error ? error.message : String(error));
} finally {
    if (configDir) {
        await rm(configDir, { recursive: true, force: true });
    }
}
