/**
 * Coordinate: M' native startup gate
 * Residency: Body/M/pratibimba-app/src/startup
 * Position (#n): #0 - minimum organism readiness proof
 * Actualises: state-machine tests for the native reveal boundary.
 * Public surface: behavioral tests for deriveNativeStartupState.
 * Does NOT own: gateway supervision or profile production.
 */

import { describe, expect, it } from 'vitest';

import { deriveNativeStartupState, type NativeStartupInputs } from './nativeStartup';

const READY_INPUTS: NativeStartupInputs = {
    supervisor: {
        state: 'supervised',
        port: 18794,
        pid: 42,
        detail: 'gateway healthy under supervision',
        binaryPath: '/repo/target/debug/epi',
        binarySource: 'repo-shared-target',
        binaryIdentity: 'Usage: epi [OPTIONS] <COMMAND>'
    },
    connected: true,
    profileGeneration: 7,
    vaultRoot: '/repo/Idea'
};

describe('deriveNativeStartupState', () => {
    it('does not reveal the workbench for a mounted shell without an organism', () => {
        expect(
            deriveNativeStartupState({
                ...READY_INPUTS,
                supervisor: {
                    ...READY_INPUTS.supervisor,
                    state: 'down',
                    pid: null,
                    detail: 'configured binary is missing'
                },
                connected: false,
                profileGeneration: null
            })
        ).toMatchObject({ phase: 'blocked', ready: false });
    });

    it('requires protocol connection and the first valid profile after supervision', () => {
        expect(
            deriveNativeStartupState({ ...READY_INPUTS, connected: false, profileGeneration: null })
        ).toMatchObject({ phase: 'protocol-handshake', ready: false });

        expect(
            deriveNativeStartupState({ ...READY_INPUTS, profileGeneration: null })
        ).toMatchObject({ phase: 'awaiting-profile', ready: false });
    });

    it('requires a resolved vault before declaring the native workbench ready', () => {
        expect(deriveNativeStartupState({ ...READY_INPUTS, vaultRoot: null })).toMatchObject({
            phase: 'awaiting-vault',
            ready: false
        });
    });

    it('returns an auditable ready receipt only when every minimum condition is real', () => {
        expect(deriveNativeStartupState(READY_INPUTS)).toEqual({
            phase: 'ready',
            ready: true,
            detail: 'Native organism ready',
            receipt: {
                supervisorState: 'supervised',
                gatewayPort: 18794,
                gatewayPid: 42,
                binaryPath: '/repo/target/debug/epi',
                binarySource: 'repo-shared-target',
                binaryIdentity: 'Usage: epi [OPTIONS] <COMMAND>',
                profileGeneration: 7,
                vaultRoot: '/repo/Idea'
            }
        });
    });
});
