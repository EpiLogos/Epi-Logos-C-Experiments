/**
 * Coordinate: M' (session foundation, plan T2.3)
 * Actualises: S3 session authority for the face — list/resolve via the real
 *   gateway methods (`sessions.list`, `sessions.resolve`, recon'd from
 *   dispatch.rs 2026-07-02). Params standardise on `session` (the gateway's
 *   session_identifier accepts it) — the `{key}` drift dies here.
 * Does NOT own: session records (S3 SessionStore is live truth), creation
 *   (sessions materialise via chat/agent paths, Sprint 3).
 */

import { GatewayClient } from './gatewayClient';

export interface SessionRecord {
    sessionKey: string;
    label?: string;
    [extra: string]: unknown;
}

function coerceRecord(raw: unknown): SessionRecord | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    const value = raw as Record<string, unknown>;
    const sessionKey =
        (typeof value.canonicalKey === 'string' && value.canonicalKey) ||
        (typeof value.sessionKey === 'string' && value.sessionKey) ||
        (typeof value.key === 'string' && value.key) ||
        (typeof value.session === 'string' && value.session) ||
        null;
    if (!sessionKey) {
        return null;
    }
    return { ...value, sessionKey, label: typeof value.label === 'string' ? value.label : undefined };
}

export class SessionClient {
    constructor(private readonly gateway: Pick<GatewayClient, 'invoke'>) {}

    async list(): Promise<SessionRecord[]> {
        const receipt = await this.gateway.invoke('sessions.list', {});
        const items = Array.isArray(receipt.artifact)
            ? receipt.artifact
            : ((receipt.artifact as { items?: unknown[] } | null)?.items ?? []);
        return (items as unknown[]).map(coerceRecord).filter((r): r is SessionRecord => r !== null);
    }

    async resolve(session: string): Promise<SessionRecord | null> {
        const receipt = await this.gateway.invoke('sessions.resolve', { session });
        return coerceRecord(receipt.artifact);
    }

    /** Bind order: previously-persisted key if it still resolves → most recent
     *  listed session → null (honest "no session yet"; chat creates one). */
    async bind(preferredKey: string | null): Promise<SessionRecord | null> {
        if (preferredKey) {
            try {
                const record = await this.resolve(preferredKey);
                if (record) {
                    return record;
                }
            } catch {
                /* fall through to list */
            }
        }
        const sessions = await this.list();
        return sessions[0] ?? null;
    }
}
