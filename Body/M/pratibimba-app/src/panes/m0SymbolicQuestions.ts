/**
 * Coordinate: M' M0' (symbolic-coordinate console, 21.T21.11)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): active-carrier question/response model.
 * Actualises: live verifier questions and strict protected-local response receipts.
 * Public surface: readM0SymbolicQuestions, submitM0SymbolicQuestionResponse.
 * Does NOT own: symbolic parsing, verifier law, or response persistence.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.11.
 */

import type {
    KernelBridgeCachedProfile,
    KernelBridgeCapabilityReceipt
} from '../bridge/types';
import { readM0VirtueWitness } from './m0VirtueWitness';

export const M0_VERIFIER_RESPOND_QUESTION_METHOD =
    "s0'.verifier.respond_question" as const;
export const M0_SYMBOLIC_SESSION_KEY = 'm0-anuttara-symbolic' as const;
export const M0_SYMBOLIC_SOURCE_EXTENSION_ID = 'm0-anuttara' as const;

export type M0SymbolicStateMarker =
    | 'pending'
    | 'unwitnessed'
    | 'drift'
    | 'incoherent'
    | 'violated';

export interface M0SymbolicCoordinateParse {
    readonly namespace: 'R' | 'L' | 'M' | 'C';
    readonly coordinate: readonly string[];
    readonly archetypeIndex: number | null;
    readonly stateMarker: M0SymbolicStateMarker;
    readonly entryState: string;
}

export interface M0SymbolicResponseReceipt {
    readonly responseId: string;
    readonly responseStatus: 'responded' | 'reverified';
    readonly reverified: boolean;
    readonly privacyClass: 'protected_local';
    readonly profileGeneration: number | null;
    readonly persistedAt: string;
    readonly parse: M0SymbolicCoordinateParse;
}

export type M0SymbolicQuestionRead =
    | {
          readonly state: 'ready';
          readonly generation: number;
          readonly questions: readonly string[];
      }
    | {
          readonly state: 'pending' | 'blocked';
          readonly generation: number | null;
          readonly reason: string;
      };

interface GatewayInvoker {
    invoke(
        method: string,
        params: Record<string, unknown>
    ): Promise<KernelBridgeCapabilityReceipt>;
}

function record(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

export function readM0SymbolicQuestions(
    cached: KernelBridgeCachedProfile | null
): M0SymbolicQuestionRead {
    const witness = readM0VirtueWitness(cached);
    if (witness.state !== 'ready') {
        return witness;
    }
    return Object.freeze({
        state: 'ready',
        generation: witness.generation,
        questions: Object.freeze([...witness.unsatisfiedConstraints])
    });
}

export async function submitM0SymbolicQuestionResponse(
    client: GatewayInvoker,
    request: {
        readonly coordinateString: string;
        readonly responseText: string;
        readonly profileGeneration: number | null;
    }
): Promise<M0SymbolicResponseReceipt> {
    const responseText = request.responseText.trim();
    if (!responseText) {
        throw new Error('symbolic response must not be empty');
    }
    const receipt = await client.invoke(M0_VERIFIER_RESPOND_QUESTION_METHOD, {
        coordinateString: request.coordinateString,
        responseText,
        sourceExtensionId: M0_SYMBOLIC_SOURCE_EXTENSION_ID,
        sessionKey: M0_SYMBOLIC_SESSION_KEY,
        profileGeneration: request.profileGeneration
    });
    return readResponseReceipt(receipt.artifact);
}

function readResponseReceipt(value: unknown): M0SymbolicResponseReceipt {
    const receipt = record(value);
    const parse = record(receipt?.parse);
    const coordinate = parse?.coordinate;
    const namespace = parse?.namespace;
    const stateMarker = parse?.stateMarker;
    const archetypeIndex = parse?.archetypeIndex;
    if (
        receipt?.accepted !== true ||
        typeof receipt.responseId !== 'string' ||
        !receipt.responseId ||
        (receipt.responseStatus !== 'responded' &&
            receipt.responseStatus !== 'reverified') ||
        typeof receipt.reverified !== 'boolean' ||
        receipt.privacyClass !== 'protected_local' ||
        typeof receipt.persistedAt !== 'string' ||
        !parse ||
        !isNamespace(namespace) ||
        !Array.isArray(coordinate) ||
        coordinate.length === 0 ||
        !coordinate.every(item => typeof item === 'string' && item.length > 0) ||
        !isStateMarker(stateMarker) ||
        (archetypeIndex !== null &&
            (typeof archetypeIndex !== 'number' ||
                !Number.isInteger(archetypeIndex) ||
                archetypeIndex < 0 ||
                archetypeIndex > 11)) ||
        typeof parse.entryState !== 'string'
    ) {
        throw new Error('gateway returned an invalid symbolic response receipt');
    }
    const profileGeneration =
        receipt.profileGeneration === null ||
        (typeof receipt.profileGeneration === 'number' &&
            Number.isInteger(receipt.profileGeneration) &&
            receipt.profileGeneration >= 0)
            ? receipt.profileGeneration
            : null;
    return Object.freeze({
        responseId: receipt.responseId,
        responseStatus: receipt.responseStatus,
        reverified: receipt.reverified,
        privacyClass: 'protected_local',
        profileGeneration,
        persistedAt: receipt.persistedAt,
        parse: Object.freeze({
            namespace,
            coordinate: Object.freeze([...coordinate]),
            archetypeIndex,
            stateMarker,
            entryState: parse.entryState
        })
    });
}

function isNamespace(value: unknown): value is M0SymbolicCoordinateParse['namespace'] {
    return value === 'R' || value === 'L' || value === 'M' || value === 'C';
}

function isStateMarker(value: unknown): value is M0SymbolicStateMarker {
    return (
        value === 'pending' ||
        value === 'unwitnessed' ||
        value === 'drift' ||
        value === 'incoherent' ||
        value === 'violated'
    );
}
