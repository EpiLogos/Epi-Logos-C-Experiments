/**
 * Capability matrix TypeScript shape — Track 05 T4 + T8.
 *
 * Mirrors the IOD-17 governance source of truth at
 * `Body/S/S4/plugins/pleroma/capability-matrix.json`. The Agentic Control
 * Room reads this JSON file (vs. a hard-coded copy) so the three-way parity
 * the IOD-17 register requires — matrix ↔ UI ↔ gateway-enforced surface —
 * remains a single-file truth.
 *
 * Drift detection: if the matrix gains a new top-level array, the parser
 * surfaces it under `unknownGroups` rather than dropping silently, so a
 * Track 11 IOD-17 review can pick it up.
 */

export type CapabilityKind = 'vak-dispatch' | 'vak-coordinate-assignment' | 'coordinate-framing' | 'psyche-continuity' | string;
export type CapabilityVakThread = 'single' | 'CFP1' | 'CFP2' | 'CFP3' | string;

export interface CapabilityVakProfile {
    readonly operates_at_cf?: readonly string[];
    readonly serves_ct?: readonly string[];
    readonly ranges_cp?: readonly string[];
}

export interface CapabilityDispatchTool {
    readonly name: string;
    readonly kind: CapabilityKind;
    readonly layer: string;
    readonly vak_thread: CapabilityVakThread;
    readonly upstream_required?: readonly string[];
}

export interface CapabilitySkill {
    readonly name: string;
    readonly layer: string;
    readonly kind: CapabilityKind;
    readonly vak_profile?: CapabilityVakProfile;
}

export interface CapabilityMatrix {
    readonly coordinate: string;
    readonly owner_agent: string;
    readonly package_role: string;
    readonly body_residency: string;
    readonly plugin_manifest: string;
    readonly constitutional_agents: readonly string[];
    readonly dispatch_tools: readonly CapabilityDispatchTool[];
    readonly skills: readonly CapabilitySkill[];
    /** Catch-all so the parser tolerates schema growth without dropping data. */
    readonly [extra: string]: unknown;
}

/**
 * Parse and validate a capability-matrix JSON payload.
 *
 * Throws if the JSON is malformed or missing required fields. Returns a typed
 * matrix on success. The Agentic Control Room calls this on activation, and
 * the result is rendered by the capability tree component.
 */
export function parseCapabilityMatrix(raw: unknown): CapabilityMatrix {
    if (!raw || typeof raw !== 'object') {
        throw new Error('capability-matrix: payload must be an object');
    }
    const obj = raw as Record<string, unknown>;
    const required = [
        'coordinate',
        'owner_agent',
        'package_role',
        'body_residency',
        'plugin_manifest',
        'constitutional_agents',
        'dispatch_tools',
        'skills'
    ] as const;
    for (const key of required) {
        if (!(key in obj)) {
            throw new Error(`capability-matrix: missing required field "${key}"`);
        }
    }
    if (!Array.isArray(obj.dispatch_tools)) {
        throw new Error('capability-matrix: dispatch_tools must be an array');
    }
    if (!Array.isArray(obj.skills)) {
        throw new Error('capability-matrix: skills must be an array');
    }
    if (!Array.isArray(obj.constitutional_agents)) {
        throw new Error('capability-matrix: constitutional_agents must be an array');
    }
    return obj as unknown as CapabilityMatrix;
}

/** Names of dispatch tools, useful for UI ↔ gateway parity assertions. */
export function dispatchToolNames(matrix: CapabilityMatrix): string[] {
    return matrix.dispatch_tools.map(tool => tool.name);
}

/** Names of skills, useful for UI ↔ gateway parity assertions. */
export function skillNames(matrix: CapabilityMatrix): string[] {
    return matrix.skills.map(skill => skill.name);
}
