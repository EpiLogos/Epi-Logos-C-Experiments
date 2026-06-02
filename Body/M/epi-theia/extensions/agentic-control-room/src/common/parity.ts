/**
 * Three-way parity assertions — IOD-17 governance.
 *
 * The IOD-17 register specifies that the capability set exposed by the UI
 * MUST match what the gateway enforces. This module provides the pure-
 * function assertion used by both contract tests and the live Agentic
 * Control Room to confirm parity. (The gateway-side set is read from a
 * gateway capability — `s4'.mediation.capabilities.list`, IF exposed; the
 * Agentic Control Room reads the matrix file directly. When both sets are
 * available, the assertion enforces the bijection.)
 */

export interface ParityAssertResult {
    readonly equal: boolean;
    readonly missingFromUi: string[];
    readonly missingFromGateway: string[];
}

export function assertCapabilityParity(
    matrixToolNames: readonly string[],
    gatewayToolNames: readonly string[]
): ParityAssertResult {
    const matrixSet = new Set(matrixToolNames);
    const gatewaySet = new Set(gatewayToolNames);
    const missingFromUi: string[] = [];
    const missingFromGateway: string[] = [];
    for (const name of gatewaySet) {
        if (!matrixSet.has(name)) {
            missingFromUi.push(name);
        }
    }
    for (const name of matrixSet) {
        if (!gatewaySet.has(name)) {
            missingFromGateway.push(name);
        }
    }
    return {
        equal: missingFromUi.length === 0 && missingFromGateway.length === 0,
        missingFromUi,
        missingFromGateway
    };
}
