/**
 * Boundary shape of the MathemeHarmonicProfile observed at the bridge.
 *
 * The authoritative profile lives in `Body/S/S0/epi-cli` (Rust) and the typed
 * mirror lives in `Body/S/S0/epi-cli/schemas`. M-extensions consume only
 * payload-shaped fields through this boundary — they never derive harmonic
 * law locally.
 *
 * Fields are intentionally typed as `unknown` payload pockets at this level so
 * the runtime does not encode S2/S3 schema details. Each M-extension narrows
 * its slice through bridge method families declared in 07.T0.
 */
export interface MathemeHarmonicProfileBoundary {
    readonly generation: number;
    readonly pointerAnchor: string | null;
    readonly capabilities: readonly string[];
    readonly payload: Readonly<Record<string, unknown>>;
}

export interface ConnectionStatus {
    readonly connected: boolean;
    readonly mode: 'lite' | 'full' | 'detached';
    readonly reason: string;
}

export const DISCONNECTED_STATUS: ConnectionStatus = Object.freeze({
    connected: false,
    mode: 'detached',
    reason: 'bridge_unavailable'
});
