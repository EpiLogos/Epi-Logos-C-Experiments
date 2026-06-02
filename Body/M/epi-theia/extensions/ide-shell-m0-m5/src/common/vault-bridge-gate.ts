/**
 * Vault-bridge gate — Track 05 T4 / IOD-19 enforcement.
 *
 * Canon Studio MUST route every save through the vault-bridge command. Until
 * T4.5 lands the vault-bridge extension, saves are rejected with the
 * canonical reason "no vault-bridge registered" — NEVER silently falling
 * through to Theia's filesystem write.
 *
 * The gate is a pure function pair so it can be exercised from Node test
 * context: pass in a minimal `{ getCommand(id): unknown | undefined }`
 * registry stub and assert the behavior.
 */

/**
 * Vault-bridge write command id. Mirrors ADR 05-010 hen-vault-bridge: the
 * gateway-side method is `s1'.vault.write_file`; the Theia command id
 * uses the `vault-bridge.s1prime.vault.write_file` shape so it doesn't
 * collide with namespace separators in the command registry.
 */
export const VAULT_BRIDGE_WRITE_COMMAND = 'vault-bridge.s1prime.vault.write_file';
export const VAULT_BRIDGE_MOVE_COMMAND = 'vault-bridge.s1prime.vault.move_file';
export const VAULT_BRIDGE_RENAME_COMMAND = 'vault-bridge.s1prime.vault.rename_file';

export interface MinimalCommandRegistry {
    getCommand(id: string): unknown | undefined;
    executeCommand?(id: string, ...args: unknown[]): Promise<unknown> | unknown;
}

/** True iff the vault-bridge write command is registered. */
export function isVaultBridgeAvailable(commands: MinimalCommandRegistry): boolean {
    return commands.getCommand(VAULT_BRIDGE_WRITE_COMMAND) !== undefined;
}

/**
 * Invoke the vault-bridge write command. Throws "no vault-bridge registered"
 * if the command isn't present (the T4.5 gate).
 */
export async function invokeVaultBridgeWrite(
    commands: MinimalCommandRegistry,
    uri: string,
    content: string
): Promise<void> {
    if (!isVaultBridgeAvailable(commands)) {
        throw new Error('no vault-bridge registered');
    }
    if (typeof commands.executeCommand !== 'function') {
        throw new Error('no vault-bridge registered');
    }
    await commands.executeCommand(VAULT_BRIDGE_WRITE_COMMAND, { uri, content });
}
