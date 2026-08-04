/**
 * Coordinate: M' native startup gate
 * Residency: Body/M/pratibimba-app/src/startup
 * Position (#n): #0 - minimum organism readiness boundary
 * Actualises: the typed reveal state for the native carrier. The normal
 *   workbench becomes visible only after supervisor, protocol, profile, and
 *   vault truths are all present.
 * Public surface: NativeStartupInputs, NativeStartupState,
 *   deriveNativeStartupState.
 * Does NOT own: supervision, gateway protocol, profile production, or vault
 *   resolution; it only composes their receipts.
 */

import type { SupervisorStatus } from '../state/stores';

export interface NativeStartupInputs {
    readonly supervisor: SupervisorStatus;
    readonly connected: boolean;
    readonly profileGeneration: number | null;
    readonly vaultRoot: string | null;
}

export interface NativeStartupReceipt {
    readonly supervisorState: 'external' | 'supervised';
    readonly gatewayPort: number;
    readonly gatewayPid: number | null;
    readonly binaryPath: string | null;
    readonly binarySource: string | null;
    readonly binaryIdentity: string | null;
    readonly profileGeneration: number;
    readonly vaultRoot: string;
}

export type NativeStartupPhase =
    | 'resolving-runtime'
    | 'starting-gateway'
    | 'protocol-handshake'
    | 'awaiting-profile'
    | 'awaiting-vault'
    | 'blocked'
    | 'ready';

export type NativeStartupState =
    | {
          readonly phase: Exclude<NativeStartupPhase, 'ready'>;
          readonly ready: false;
          readonly detail: string;
          readonly receipt: null;
      }
    | {
          readonly phase: 'ready';
          readonly ready: true;
          readonly detail: 'Native organism ready';
          readonly receipt: NativeStartupReceipt;
      };

function waiting(phase: Exclude<NativeStartupPhase, 'ready'>, detail: string): NativeStartupState {
    return { phase, ready: false, detail, receipt: null };
}

export function deriveNativeStartupState(inputs: NativeStartupInputs): NativeStartupState {
    const { supervisor, connected, profileGeneration, vaultRoot } = inputs;
    if (supervisor.state === 'down') {
        return waiting('blocked', supervisor.detail);
    }
    if (supervisor.state === 'probing') {
        return waiting('resolving-runtime', 'Resolving the desktop runtime');
    }
    if (supervisor.state === 'starting') {
        return waiting('starting-gateway', 'Starting the gateway');
    }
    if (!connected) {
        return waiting('protocol-handshake', 'Connecting to the gateway');
    }
    if (profileGeneration === null) {
        return waiting('awaiting-profile', 'Waiting for the first profile');
    }
    if (vaultRoot === null) {
        return waiting('awaiting-vault', 'Waiting for the vault');
    }
    return {
        phase: 'ready',
        ready: true,
        detail: 'Native organism ready',
        receipt: {
            supervisorState: supervisor.state,
            gatewayPort: supervisor.port,
            gatewayPid: supervisor.pid,
            binaryPath: supervisor.binaryPath,
            binarySource: supervisor.binarySource,
            binaryIdentity: supervisor.binaryIdentity,
            profileGeneration,
            vaultRoot
        }
    };
}
