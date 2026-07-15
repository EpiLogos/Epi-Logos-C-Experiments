/**
 * Coordinate: M' `/` membrane (ACR capability migration - Track 27.T27.10)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Position: #0' (S0' command return over S4/S4' dispatch authority)
 * Actualises: the production OmniPanel consumer for
 *   `s4'.mediation.capabilities.list`: strict response parsing, entitlement
 *   class preservation, dispatch/stream capacity bindings, and the validated
 *   Pi -> Anima -> Aletheia guardian roster. This replaces the retired ACR
 *   package's local capability/parity ownership with one gateway-derived view.
 * Public surface: S4_MEDIATION_CAPABILITIES_LIST_METHOD,
 *   S4_MEDIATION_ROUTE_METHOD, ALETHEIA_TECHNE_GUARDIANS,
 *   PSYCHE_ASPECT_REGISTERS, ANIMA_DISPATCH_TARGETS,
 *   MediationCapabilitySnapshot, MediationCapacityBinding,
 *   parseMediationCapabilitySnapshot, loadMediationCapabilitySnapshot,
 *   mediationCapacityBindings, isSnapshotCapabilityAllowed.
 * Does NOT own: the S4 capability matrix, entitlement decisions, dispatch
 *   execution, Aletheia mode activation, gateway transport, or Omni tab bodies.
 * Contract: [[M'-PORTAL-SPEC]] `/` surface; DR-M5-1; Track 27.T27.10.
 */

import type { KernelBridgeCapabilityReceipt } from '../../bridge/types';
import type { ActorIdentity, OmniPanelTabId } from './omnipanelRuntime';

export const S4_MEDIATION_CAPABILITIES_LIST_METHOD = "s4'.mediation.capabilities.list";
export const S4_MEDIATION_ROUTE_METHOD = "s4'.mediation.route";

export const ALETHEIA_TECHNE_GUARDIANS = Object.freeze([
    'anansi',
    'moirai',
    'janus',
    'mercurius',
    'agora',
    'zeithoven'
] as const);

export type AletheiaTechneGuardian = (typeof ALETHEIA_TECHNE_GUARDIANS)[number];

/** Authorial/Psyche facets composed by Anima. They are not peer dispatch
 * targets (DR-M5-1); keeping this list separate prevents the retired
 * `constitutional_agents` array from becoming an executable roster again. */
export const PSYCHE_ASPECT_REGISTERS = Object.freeze([
    'nous',
    'logos',
    'eros',
    'mythos',
    'psyche',
    'sophia'
] as const);

export interface AnimaDispatchTarget extends ActorIdentity {
    readonly techneClass: AletheiaTechneGuardian | null;
}

export const ANIMA_DISPATCH_TARGETS: readonly AnimaDispatchTarget[] = Object.freeze([
    Object.freeze({ actor: 'pi', role: 'pi' as const, techneClass: null }),
    Object.freeze({ actor: 'anima', role: 'anima' as const, techneClass: null }),
    ...ALETHEIA_TECHNE_GUARDIANS.map(techneClass =>
        Object.freeze({ actor: 'aletheia', role: 'subagent' as const, techneClass })
    )
]);

export type MediationEntitlementClass = 'standard' | 'aletheia-mode-internal';

export interface GatewayMediationCapability {
    readonly name: string;
    readonly entitlementClass: MediationEntitlementClass;
}

export interface MediationCapabilitySnapshot {
    readonly owner: "S4'";
    readonly method: typeof S4_MEDIATION_CAPABILITIES_LIST_METHOD;
    readonly routesThrough: typeof S4_MEDIATION_ROUTE_METHOD;
    readonly dispatchTools: readonly string[];
    readonly aletheiaModeInternalTools: readonly string[];
    readonly capabilities: readonly GatewayMediationCapability[];
}

export interface MediationCapacityBinding {
    readonly capability: string;
    readonly entitlementClass: MediationEntitlementClass;
    readonly route: typeof S4_MEDIATION_ROUTE_METHOD;
    readonly dispatchTab: Extract<OmniPanelTabId, 'dispatch-trace'>;
    readonly streamTab: Extract<OmniPanelTabId, 'tool-stream'>;
}

interface CapabilityGateway {
    invoke(
        method: string,
        params?: Record<string, unknown>
    ): Promise<KernelBridgeCapabilityReceipt>;
}

function record(value: unknown, field: string): Record<string, unknown> {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`${field} must be an object`);
    }
    return value as Record<string, unknown>;
}

function exactString(value: unknown, field: string): string {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`${field} must be a non-blank string`);
    }
    return value;
}

function uniqueStrings(value: unknown, field: string): readonly string[] {
    if (!Array.isArray(value)) {
        throw new Error(`${field} must be an array`);
    }
    const names = value.map((item, index) => exactString(item, `${field}[${index}]`));
    if (new Set(names).size !== names.length) {
        throw new Error(`${field} must not contain duplicates`);
    }
    return Object.freeze(names);
}

/** Strictly validate the real S4 gateway projection. Membership and
 * entitlement class are both checked; malformed or internally inconsistent
 * responses never become an OmniPanel allow-list. */
export function parseMediationCapabilitySnapshot(value: unknown): MediationCapabilitySnapshot {
    const source = record(value, 'capability snapshot');
    if (source.owner !== "S4'") {
        throw new Error("capability snapshot owner must be S4'");
    }
    if (source.method !== S4_MEDIATION_CAPABILITIES_LIST_METHOD) {
        throw new Error(`capability snapshot method must be ${S4_MEDIATION_CAPABILITIES_LIST_METHOD}`);
    }
    if (source.routesThrough !== S4_MEDIATION_ROUTE_METHOD) {
        throw new Error(`capability snapshot routesThrough must be ${S4_MEDIATION_ROUTE_METHOD}`);
    }

    const dispatchTools = uniqueStrings(source.dispatchTools, 'dispatchTools');
    const aletheiaModeInternalTools = uniqueStrings(
        source.aletheiaModeInternalTools,
        'aletheiaModeInternalTools'
    );
    if (!Array.isArray(source.capabilities)) {
        throw new Error('capabilities must be an array');
    }
    const capabilities = source.capabilities.map((item, index) => {
        const entry = record(item, `capabilities[${index}]`);
        const name = exactString(entry.name, `capabilities[${index}].name`);
        if (entry.entitlementClass !== 'standard' && entry.entitlementClass !== 'aletheia-mode-internal') {
            throw new Error(`capabilities[${index}].entitlementClass is invalid`);
        }
        return Object.freeze({ name, entitlementClass: entry.entitlementClass });
    });
    if (new Set(capabilities.map(item => item.name)).size !== capabilities.length) {
        throw new Error('capabilities must not contain duplicate names');
    }

    const internal = new Set(aletheiaModeInternalTools);
    const expected = new Set([...dispatchTools, ...aletheiaModeInternalTools]);
    const actual = new Map(capabilities.map(item => [item.name, item.entitlementClass]));
    const missing = [...expected].filter(name => !actual.has(name));
    const extra = [...actual.keys()].filter(name => !expected.has(name));
    if (missing.length > 0 || extra.length > 0) {
        throw new Error(
            `capability membership mismatch: missing=[${missing.sort().join(',')}], extra=[${extra.sort().join(',')}]`
        );
    }
    for (const name of expected) {
        const expectedClass: MediationEntitlementClass = internal.has(name)
            ? 'aletheia-mode-internal'
            : 'standard';
        if (actual.get(name) !== expectedClass) {
            throw new Error(
                `capability entitlement mismatch for ${name}: expected ${expectedClass}, got ${actual.get(name)}`
            );
        }
    }

    return Object.freeze({
        owner: "S4'",
        method: S4_MEDIATION_CAPABILITIES_LIST_METHOD,
        routesThrough: S4_MEDIATION_ROUTE_METHOD,
        dispatchTools,
        aletheiaModeInternalTools,
        capabilities: Object.freeze(capabilities)
    });
}

/** Invoke the one live capability authority through the carrier's existing
 * gateway client. Dependency injection is only the transport seam; production
 * callers pass the app's singleton GatewayClient. */
export async function loadMediationCapabilitySnapshot(
    gateway: CapabilityGateway
): Promise<MediationCapabilitySnapshot> {
    const receipt = await gateway.invoke(S4_MEDIATION_CAPABILITIES_LIST_METHOD, {});
    return parseMediationCapabilitySnapshot(receipt.artifact);
}

export function mediationCapacityBindings(
    snapshot: MediationCapabilitySnapshot
): readonly MediationCapacityBinding[] {
    return Object.freeze(
        snapshot.capabilities.map(capability =>
            Object.freeze({
                capability: capability.name,
                entitlementClass: capability.entitlementClass,
                route: S4_MEDIATION_ROUTE_METHOD,
                dispatchTab: 'dispatch-trace' as const,
                streamTab: 'tool-stream' as const
            })
        )
    );
}

/** UI affordance check only. S4 still performs the authoritative entitlement
 * decision at dispatch time, including Aletheia-mode session requirements. */
export function isSnapshotCapabilityAllowed(
    capability: string,
    snapshot: MediationCapabilitySnapshot
): boolean {
    return snapshot.capabilities.some(entry => entry.name === capability.trim());
}
