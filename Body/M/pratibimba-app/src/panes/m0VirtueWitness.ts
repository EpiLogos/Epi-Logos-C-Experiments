/**
 * Coordinate: M' M0' (Virtue Witness projection, rerun 21.T21.10)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M0-0' verifier witness reader
 * Actualises: the bussed Anuttara 9-bit virtue witness as an LSB-first,
 *   labelled carrier view with strict coherence and question validation.
 * Public surface: M0_VIRTUE_LABELS, M0VirtueWitnessRead,
 *   readM0VirtueWitness, m0VirtueCoherenceBand.
 * Does NOT own: witness computation (portal-core), profile transport
 *   (GatewayClient), or the Symbolic-Coordinate Question Console (21.T21.11).
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.10.
 */

import { KernelBridgeCachedProfile } from '../bridge/types';

export const M0_VIRTUE_LABELS = [
    'Love/Peace',
    'Truth',
    'Openness/Creativity',
    'Joy/Play',
    'Goodness',
    'Beauty',
    'Life/Nature',
    'Wisdom',
    'Reality'
] as const;

export type M0VirtueLabels = typeof M0_VIRTUE_LABELS;
export type M0VirtueWitnessBits = readonly [
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean
];
export type M0VirtueCoherenceBand = 'green' | 'amber' | 'red';

export type M0VirtueWitnessRead =
    | {
          readonly state: 'ready';
          readonly generation: number;
          readonly witnessBits: M0VirtueWitnessBits;
          readonly virtueLabels: M0VirtueLabels;
          readonly coherenceScore: number;
          readonly unsatisfiedConstraints: readonly string[];
      }
    | {
          readonly state: 'pending' | 'blocked';
          readonly generation: number | null;
          readonly reason: string;
      };

function objectValue(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function unpackWitnessBits(vector: number): M0VirtueWitnessBits {
    return Array.from({ length: 9 }, (_, index) => (vector & (1 << index)) !== 0) as unknown as M0VirtueWitnessBits;
}

export function m0VirtueCoherenceBand(score: number): M0VirtueCoherenceBand {
    if (score >= 0.85) {
        return 'green';
    }
    return score >= 0.6 ? 'amber' : 'red';
}

export function readM0VirtueWitness(
    cached: KernelBridgeCachedProfile | null
): M0VirtueWitnessRead {
    const payload = objectValue(cached?.profile ?? null);
    const harmonicProfile = objectValue(payload?.harmonicProfile);
    const candidate = harmonicProfile?.anuttaraWitness ?? payload?.anuttaraWitness;

    if (candidate === undefined || candidate === null) {
        return {
            state: 'pending',
            generation: cached?.generation ?? null,
            reason: 'anuttaraWitness is declared but not emitted on this profile generation'
        };
    }

    const witness = objectValue(candidate);
    if (!witness) {
        return {
            state: 'blocked',
            generation: cached?.generation ?? null,
            reason: 'anuttaraWitness is not an object'
        };
    }

    const vector = witness.virtueWitnessVector;
    const coherence = witness.coherenceScore;
    const questions = witness.openQuestions;
    if (!Number.isInteger(vector) || (vector as number) < 0 || (vector as number) > 0x1ff) {
        return {
            state: 'blocked',
            generation: cached?.generation ?? null,
            reason: 'virtueWitnessVector must be a 9-bit unsigned integer'
        };
    }
    if (
        typeof coherence !== 'number' ||
        !Number.isFinite(coherence) ||
        coherence < 0 ||
        coherence > 1
    ) {
        return {
            state: 'blocked',
            generation: cached?.generation ?? null,
            reason: 'coherenceScore must be a finite value from 0 to 1'
        };
    }
    if (!Array.isArray(questions) || !questions.every(question => typeof question === 'string')) {
        return {
            state: 'blocked',
            generation: cached?.generation ?? null,
            reason: 'openQuestions must be a string array'
        };
    }

    return {
        state: 'ready',
        generation: cached?.generation ?? 0,
        witnessBits: unpackWitnessBits(vector as number),
        virtueLabels: M0_VIRTUE_LABELS,
        coherenceScore: coherence,
        unsatisfiedConstraints: questions
    };
}
