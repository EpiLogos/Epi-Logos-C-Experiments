import type { GatewaySessionRow, SessionsListResult } from '../../../controllers/epi-claw/types';

export const MAIN_EPII_SESSION_KEY = 'agent:epii:main';

export type SessionManagerRow = GatewaySessionRow & {
  activeNow: boolean;
  isMainSession: boolean;
  nowWikilink: string;
  openedAt: number | null;
  kairosAtOpen: Record<string, unknown> | null;
  tarotPsycheAnchor: Record<string, unknown> | string | null;
  activeCoordinate: string | null;
  dispatchCount: number | null;
  evidenceCount: number | null;
  reviewCount: number | null;
  privacyClass: string | null;
};

export type SessionManagerModel = {
  dayNowAnchor: string;
  dayId: string | null;
  sourceMethod: 's4.khora.session_list';
  activeSessionKey: string | null;
  mainSessionKey: typeof MAIN_EPII_SESSION_KEY;
  sessions: SessionManagerRow[];
};

type LooseRecord = Record<string, unknown>;

export function buildSessionManagerModel(input: {
  result: SessionsListResult | null | undefined;
  activeSessionKey?: string | null;
  now?: Date;
}): SessionManagerModel {
  const rows = input.result?.sessions ?? [];
  const activeKey = nonBlank(input.activeSessionKey) ?? findActiveSessionKey(rows);
  const dayId = firstString(input.result as LooseRecord | null | undefined, ['day_id', 'dayId', 'c_3_day_id']);
  const modelRows = rows.map((session) => toSessionManagerRow(session, activeKey));

  return {
    dayNowAnchor: dayNowAnchor(input.result, dayId, input.now ?? new Date()),
    dayId,
    sourceMethod: 's4.khora.session_list',
    activeSessionKey: activeKey,
    mainSessionKey: MAIN_EPII_SESSION_KEY,
    sessions: sortSessionRows(modelRows),
  };
}

export function sortSessionRows(rows: readonly SessionManagerRow[]): SessionManagerRow[] {
  return [...rows].sort((a, b) => {
    const aRank = sessionRank(a);
    const bRank = sessionRank(b);
    if (aRank !== bRank) {
      return aRank - bRank;
    }
    return (b.openedAt ?? b.updatedAt ?? 0) - (a.openedAt ?? a.updatedAt ?? 0);
  });
}

export function extractSessionKey(response: unknown): string | null {
  if (!response || typeof response !== 'object') {
    return null;
  }
  const record = response as LooseRecord;
  return firstString(record, ['sessionKey', 'session_key', 'key', 'sessionId', 'session_id']);
}

function toSessionManagerRow(session: GatewaySessionRow, activeKey: string | null): SessionManagerRow {
  const record = session as GatewaySessionRow & LooseRecord;
  const sessionKey = session.key || session.sessionKey || session.canonicalKey || session.sessionId || '';
  const activeNow = booleanField(record, ['active_now', 'activeNow', 'isActive'])
    || (Boolean(activeKey) && sessionKey === activeKey);
  const openedAt = timeField(record, [
    'kairos_at_open',
    'kairosAtOpen',
    'opened_at',
    'openedAt',
    'created_at',
    'createdAt',
  ]);
  const sessionId = nonBlank(session.sessionId) ?? nonBlank(session.recordSessionId) ?? nonBlank(sessionKey) ?? 'unknown';

  return {
    ...session,
    activeNow,
    isMainSession: sessionKey === MAIN_EPII_SESSION_KEY,
    nowWikilink: `[[NOW-${sessionId}]]`,
    openedAt: openedAt ?? session.updatedAt ?? null,
    kairosAtOpen: objectField(record, ['kairos_at_open', 'kairosAtOpen']),
    tarotPsycheAnchor: objectOrStringField(record, ['tarot_psyche_anchor', 'tarotPsycheAnchor', 'psycheAnchor']),
    activeCoordinate: firstString(record, ['active_coordinate', 'activeCoordinate', 'coordinate', 'activeAgentId']),
    dispatchCount: numberField(record, ['dispatch_count', 'dispatchCount', 'dispatches']),
    evidenceCount: numberField(record, ['evidence_count', 'evidenceCount', 'evidenceHandles']),
    reviewCount: numberField(record, ['review_count', 'reviewCount', 'reviews']),
    privacyClass: firstString(record, ['privacy_class', 'privacyClass', 'm4PrivacyClass']),
  };
}

function sessionRank(row: SessionManagerRow): number {
  if (row.activeNow) {
    return 0;
  }
  if (row.isMainSession) {
    return 1;
  }
  return 2;
}

function findActiveSessionKey(rows: readonly GatewaySessionRow[]): string | null {
  for (const row of rows) {
    const record = row as GatewaySessionRow & LooseRecord;
    if (booleanField(record, ['active_now', 'activeNow', 'isActive'])) {
      return row.key || row.sessionKey || row.canonicalKey || null;
    }
  }
  return null;
}

function dayNowAnchor(result: SessionsListResult | null | undefined, dayId: string | null, now: Date): string {
  const resultPath = nonBlank(result?.path);
  if (resultPath) {
    return resultPath;
  }
  if (dayId) {
    return `Idea/Empty/Present/${dayId}`;
  }
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `Idea/Empty/Present/${yyyy}/${mm}/W${isoWeek(now)}/${dd}`;
}

function isoWeek(date: Date): string {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utc.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return String(week).padStart(2, '0');
}

function firstString(record: LooseRecord | null | undefined, keys: readonly string[]): string | null {
  if (!record) {
    return null;
  }
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function nonBlank(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function booleanField(record: LooseRecord, keys: readonly string[]): boolean {
  return keys.some((key) => record[key] === true);
}

function numberField(record: LooseRecord, keys: readonly string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (Array.isArray(value)) {
      return value.length;
    }
  }
  return null;
}

function objectField(record: LooseRecord, keys: readonly string[]): Record<string, unknown> | null {
  for (const key of keys) {
    const value = record[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
  }
  return null;
}

function objectOrStringField(record: LooseRecord, keys: readonly string[]): Record<string, unknown> | string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
  }
  return null;
}

function timeField(record: LooseRecord, keys: readonly string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Date.parse(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const nested = timeField(value as LooseRecord, ['ts', 'timestamp', 'opened_at', 'openedAt']);
      if (nested !== null) {
        return nested;
      }
    }
  }
  return null;
}
