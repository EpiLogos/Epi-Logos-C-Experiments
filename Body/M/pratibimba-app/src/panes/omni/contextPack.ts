/**
 * Coordinate: M' `/` membrane (M5-4' ACR — context-pack projection — 51.T51.1)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Position (#n): the strict parse of the `s4'.context.assemble` envelope.
 * Actualises: the user-facing half of 51.T51.1. The S4' spine compositor
 *   assembles the session-context pack ONCE, injects `pack.injection` as the
 *   agent's system prompt, and publishes that same object; the gateway serves
 *   it. This module turns that envelope into a typed snapshot so the ACR can
 *   render what the agent was actually given, per carrier. A malformed
 *   envelope THROWS — an operator shown a plausible-looking empty context is
 *   worse than an operator shown an error.
 * Public surface: S4_CONTEXT_ASSEMBLE_METHOD, ContextPackSnapshot,
 *   ContextPackBlock, parseContextPackEnvelope, loadContextPackSnapshot,
 *   contextPackTotals.
 * Does NOT own: assembly (Body/S/S4/ta-onta/spine/compositor.ts), publication,
 *   the gateway adapter, or the rendering (ContextPackSection.tsx).
 */

import type { GatewayClient } from '../../bridge/gatewayClient';

export const S4_CONTEXT_ASSEMBLE_METHOD = "s4'.context.assemble";

export type ContextPackBlockStatus = 'included' | 'overflowed' | 'excluded-cold' | 'failed';

const BLOCK_STATUSES: readonly ContextPackBlockStatus[] = [
    'included',
    'overflowed',
    'excluded-cold',
    'failed'
];

export interface ContextPackBlock {
    readonly coordinate: string;
    readonly cost: 'hot' | 'warm' | 'cold';
    readonly status: ContextPackBlockStatus;
    readonly bytes: number;
    readonly charEstimate: number;
    readonly producedAtMs: number;
    readonly rendered: string | null;
    readonly vakToken: string | null;
    readonly error: string | null;
}

export interface ContextPack {
    readonly version: number;
    readonly sessionKey: string;
    readonly assembledAtMs: number;
    readonly budget: { readonly limitChars: number; readonly usedChars: number };
    readonly blocks: readonly ContextPackBlock[];
    readonly injection: string;
}

/**
 * `present: false` is a first-class answer, not an error: a session that has
 * not yet assembled a pack must not read like a session with empty context.
 */
export interface ContextPackSnapshot {
    readonly sessionKey: string;
    readonly present: boolean;
    readonly reason: string | null;
    readonly assembler: string;
    readonly packPath: string;
    readonly pack: ContextPack | null;
}

function record(value: unknown, what: string): Record<string, unknown> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new Error(`${what} must be an object`);
    }
    return value as Record<string, unknown>;
}

function str(source: Record<string, unknown>, key: string, what: string): string {
    const value = source[key];
    if (typeof value !== 'string') {
        throw new Error(`${what}.${key} must be a string`);
    }
    return value;
}

function num(source: Record<string, unknown>, key: string, what: string): number {
    const value = source[key];
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error(`${what}.${key} must be a finite number`);
    }
    return value;
}

function nullableStr(source: Record<string, unknown>, key: string, what: string): string | null {
    const value = source[key];
    if (value === null || value === undefined) return null;
    if (typeof value !== 'string') {
        throw new Error(`${what}.${key} must be a string or null`);
    }
    return value;
}

function parseBlock(raw: unknown, position: number): ContextPackBlock {
    const what = `pack.blocks[${position}]`;
    const source = record(raw, what);
    const cost = str(source, 'cost', what);
    if (cost !== 'hot' && cost !== 'warm' && cost !== 'cold') {
        throw new Error(`${what}.cost must be hot | warm | cold, got ${cost}`);
    }
    const status = str(source, 'status', what) as ContextPackBlockStatus;
    if (!BLOCK_STATUSES.includes(status)) {
        throw new Error(`${what}.status must be one of ${BLOCK_STATUSES.join(' | ')}, got ${status}`);
    }
    const block: ContextPackBlock = {
        coordinate: str(source, 'coordinate', what),
        cost,
        status,
        bytes: num(source, 'bytes', what),
        charEstimate: num(source, 'charEstimate', what),
        producedAtMs: num(source, 'producedAtMs', what),
        rendered: nullableStr(source, 'rendered', what),
        vakToken: nullableStr(source, 'vakToken', what),
        error: nullableStr(source, 'error', what)
    };
    if (block.status === 'included' && block.rendered === null) {
        throw new Error(`${what} claims to be included but carries no rendered text`);
    }
    if (block.status === 'failed' && block.error === null) {
        throw new Error(`${what} claims to have failed but names no error`);
    }
    return Object.freeze(block);
}

function parsePack(raw: unknown): ContextPack {
    const source = record(raw, 'pack');
    const budget = record(source.budget, 'pack.budget');
    const blocksRaw = source.blocks;
    if (!Array.isArray(blocksRaw)) {
        throw new Error('pack.blocks must be an array');
    }
    const blocks = blocksRaw.map(parseBlock);
    const injection = str(source, 'injection', 'pack');

    // Every included block's rendered text must actually be in the injection it
    // claims to belong to. This is the drift alarm: if the served pack were a
    // re-assembly rather than the published one, this is where it shows.
    for (const block of blocks) {
        if (block.status === 'included' && !injection.includes(block.rendered as string)) {
            throw new Error(
                `pack block ${block.coordinate} is marked included but its rendered text is absent from the injection`
            );
        }
    }

    return Object.freeze({
        version: num(source, 'version', 'pack'),
        sessionKey: str(source, 'sessionKey', 'pack'),
        assembledAtMs: num(source, 'assembledAtMs', 'pack'),
        budget: Object.freeze({
            limitChars: num(budget, 'limitChars', 'pack.budget'),
            usedChars: num(budget, 'usedChars', 'pack.budget')
        }),
        blocks: Object.freeze(blocks),
        injection
    });
}

export function parseContextPackEnvelope(raw: unknown): ContextPackSnapshot {
    const source = record(raw, "s4'.context.assemble response");
    const present = source.present;
    if (typeof present !== 'boolean') {
        throw new Error("s4'.context.assemble response.present must be a boolean");
    }
    const owner = str(source, 'owner', 'response');
    if (owner !== "S4'") {
        throw new Error(`s4'.context.assemble must be owned by S4', got ${owner}`);
    }
    return Object.freeze({
        sessionKey: str(source, 'sessionKey', 'response'),
        present,
        reason: nullableStr(source, 'reason', 'response'),
        assembler: str(source, 'assembler', 'response'),
        packPath: str(source, 'packPath', 'response'),
        pack: present ? parsePack(source.pack) : null
    });
}

/** Invoke the one live context-pack authority through the carrier's gateway client. */
export async function loadContextPackSnapshot(
    gateway: Pick<GatewayClient, 'invoke'>,
    sessionKey?: string
): Promise<ContextPackSnapshot> {
    const receipt = await gateway.invoke(
        S4_CONTEXT_ASSEMBLE_METHOD,
        sessionKey ? { sessionKey } : {}
    );
    return parseContextPackEnvelope(receipt.artifact);
}

export interface ContextPackTotals {
    readonly carriers: number;
    readonly included: number;
    readonly overflowed: number;
    readonly failed: number;
    readonly injectedBytes: number;
}

export function contextPackTotals(pack: ContextPack): ContextPackTotals {
    const by = (status: ContextPackBlockStatus) =>
        pack.blocks.filter(block => block.status === status).length;
    return Object.freeze({
        carriers: pack.blocks.length,
        included: by('included'),
        overflowed: by('overflowed'),
        failed: by('failed'),
        injectedBytes: new TextEncoder().encode(pack.injection).length
    });
}
