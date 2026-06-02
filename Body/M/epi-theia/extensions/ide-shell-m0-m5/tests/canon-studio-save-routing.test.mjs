// Canon Studio save routing — verifies the T4.5 gate.
//
// Per IOD-19 (ADR 05-010 hen-vault-bridge) the Canon Studio editor MUST
// route every save through the vault-bridge command. Until T4.5 lands the
// vault-bridge extension, saves are rejected with the canonical reason
// "no vault-bridge registered" — NEVER silently falling through to Theia
// FS write.
//
// We test the pure vault-bridge gate helpers directly because the widget
// itself depends on Theia DI / ReactWidget which is not present in this Node
// test context. The widget delegates to the same helpers, so the assertions
// here cover the load-bearing decision point. The widget's React rendering
// is exercised in the T9 headless Theia run.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    VAULT_BRIDGE_WRITE_COMMAND,
    VAULT_BRIDGE_MOVE_COMMAND,
    VAULT_BRIDGE_RENAME_COMMAND,
    isVaultBridgeAvailable,
    invokeVaultBridgeWrite
} = require('../lib/common/vault-bridge-gate.js');

// Minimal CommandRegistry stub matching the surface the gate touches.
function commandRegistryStub(commands = []) {
    return {
        commands: new Map(commands.map(c => [c.id, c])),
        getCommand(id) { return this.commands.get(id); },
        executeCommand(id, ...args) {
            const cmd = this.commands.get(id);
            if (!cmd) {
                throw new Error(`command not found: ${id}`);
            }
            return cmd.execute(...args);
        }
    };
}

test('vault-bridge unavailable when no command is registered', () => {
    const commands = commandRegistryStub([]);
    assert.equal(isVaultBridgeAvailable(commands), false);
});

test('vault-bridge write throws "no vault-bridge registered" before T4.5', async () => {
    const commands = commandRegistryStub([]);
    await assert.rejects(
        () => invokeVaultBridgeWrite(commands, 'file:///tmp/x.md', 'content'),
        /no vault-bridge registered/
    );
});

test('vault-bridge becomes available when the command is registered (T4.5 simulation)', async () => {
    let writeArgs = null;
    const commands = commandRegistryStub([
        {
            id: VAULT_BRIDGE_WRITE_COMMAND,
            execute: (args) => { writeArgs = args; }
        }
    ]);
    assert.equal(isVaultBridgeAvailable(commands), true);
    await invokeVaultBridgeWrite(commands, 'file:///tmp/y.md', 'payload');
    assert.deepEqual(writeArgs, { uri: 'file:///tmp/y.md', content: 'payload' });
});

test('vault-bridge command ids match ADR 05-010 hen-vault-bridge contract', () => {
    // ADR 05-010 specifies the gateway-side method `s1'.vault.write_file`.
    // The Theia command id mirrors that with the vault-bridge namespace.
    assert.equal(VAULT_BRIDGE_WRITE_COMMAND, 'vault-bridge.s1prime.vault.write_file');
    assert.equal(VAULT_BRIDGE_MOVE_COMMAND, 'vault-bridge.s1prime.vault.move_file');
    assert.equal(VAULT_BRIDGE_RENAME_COMMAND, 'vault-bridge.s1prime.vault.rename_file');
});

test('invokeVaultBridgeWrite refuses a registry stub missing executeCommand', async () => {
    // Defensive: if a command is somehow registered but executeCommand is
    // missing (e.g. fixture mistake), the gate still rejects rather than
    // silently no-oping.
    const commands = { getCommand: () => ({ id: 'x' }) };
    await assert.rejects(
        () => invokeVaultBridgeWrite(commands, 'file:///tmp/z.md', 'c'),
        /no vault-bridge registered/
    );
});
