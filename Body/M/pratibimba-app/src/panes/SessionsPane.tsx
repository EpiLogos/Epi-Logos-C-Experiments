/**
 * Coordinate: M' `/` membrane (Sessions fold — SessionManager continuity fold,
 *   Track 27.T27.2, cycle-3 full-rerun; carrier Body/M/pratibimba-app)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): the `/` membrane's Sessions fold, mapped to agent:epii:main
 * Actualises: the reframe of the T3.3 lister into the continuity fold — a
 *   SessionManagerHeader (day-now anchor + real khora session-start + switch),
 *   the pure continuity ordering (active → main → kairos-desc siblings), and a
 *   SessionDetailPane (kairos-at-open / tarot-psyche anchors that degrade to a
 *   ReadinessBanner when their producer is absent, active-coordinate
 *   click-through, dispatch/evidence/review summaries, resume/switch/archive).
 *   The live gateway SessionStore stays truth; this fold lists, binds, starts,
 *   and reflects — it never fabricates a session key or a count.
 * Public surface: SessionsPane, orderSessionsForContinuity, MAIN_SESSION_KEY.
 * Does NOT own: session records (S3 SessionStore is live truth), the khora
 *   session-start law (S0 gate::day_start), the OmniPanel state contract
 *   (omnipanelSessionState.ts), the kairos/tarot producers.
 * Contract: [[M'-SYSTEM-SPEC]] + [[27-omnipanel-tabs-deep]] 27.2.
 */

import { useEffect, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import { SessionClient, SessionRecord } from '../bridge/sessionClient';
import { KHORA_SESSION_START_RPC } from '../onboarding/firstSessionOrchestration';
import { useCoordinateStore, useProvenanceStore, useSessionStore } from '../state/stores';
import { CoordinateString } from '../ui/primitives';
import { PrivacyClassBadge } from '../ui/PrivacyClassBadge';
import { ReadinessBanner } from '../ui/ReadinessBanner';
import type { OmniPanelTabId } from './omni/omnipanelRuntime';
import type { SessionsTabState } from './omni/omnipanelSessionState';
import { useOmniPanelSessionStore, useOmniPanelTabState } from './omni/omnipanelSessionState';

/** The main-session anchor this fold continues from (`agent:epii:main`). */
export const MAIN_SESSION_KEY = 'agent:epii:main';

const SESSION_RESUME_RPC = 'sessions.resume';

type FilterPredicate = SessionsTabState['filterPredicate'];
const FILTER_PREDICATES: readonly FilterPredicate[] = ['today', 'this-week', 'all'];

// ---------------------------------------------------------------------------
// Pure helpers (unit-tested in isolation)
// ---------------------------------------------------------------------------

function field(record: SessionRecord, key: string): unknown {
    return (record as Record<string, unknown>)[key];
}

/** kairos-at-open sort key; number or non-blank string, else null (sorts last). */
function kairosSortValue(record: SessionRecord): number | string | null {
    const raw = field(record, 'kairos_at_open') ?? field(record, 'kairosAtOpen');
    if (typeof raw === 'number' && Number.isFinite(raw)) {
        return raw;
    }
    if (typeof raw === 'string' && raw.trim() !== '') {
        return raw;
    }
    return null;
}

/**
 * Continuity ordering (pure): the active session FIRST, the main session
 * (`agent:epii:main`) SECOND, then siblings by `kairos_at_open` DESCENDING.
 * Records lacking `kairos_at_open` sort last, stably (input order preserved).
 * When the active session IS the main session it appears once, at the front.
 */
export function orderSessionsForContinuity(
    records: readonly SessionRecord[],
    activeSessionKey: string | null,
    mainSessionKey: string = MAIN_SESSION_KEY
): SessionRecord[] {
    const decorated = records.map((record, index) => ({ record, index }));
    const active = activeSessionKey
        ? decorated.filter(d => d.record.sessionKey === activeSessionKey)
        : [];
    const claimed = new Set(active.map(d => d.record.sessionKey));
    const main = decorated.filter(
        d => d.record.sessionKey === mainSessionKey && !claimed.has(d.record.sessionKey)
    );
    main.forEach(d => claimed.add(d.record.sessionKey));
    const siblings = decorated.filter(d => !claimed.has(d.record.sessionKey));
    siblings.sort((a, b) => {
        const av = kairosSortValue(a.record);
        const bv = kairosSortValue(b.record);
        if (av === null && bv === null) {
            return a.index - b.index;
        }
        if (av === null) {
            return 1;
        }
        if (bv === null) {
            return -1;
        }
        if (av < bv) {
            return 1;
        }
        if (av > bv) {
            return -1;
        }
        return a.index - b.index;
    });
    return [...active, ...main, ...siblings].map(d => d.record);
}

function recordDayId(record: SessionRecord): string | null {
    const raw = field(record, 'c_3_day_id') ?? field(record, 'dayId') ?? field(record, 'day_id');
    return typeof raw === 'string' && raw.trim() !== '' ? raw : null;
}

/**
 * Filter predicate applied to the list. A record is only ever EXCLUDED when it
 * carries a day id that disagrees — a record with no determinable day is always
 * included (we cannot honestly exclude it). `this-week` has no reliable week
 * index on the record yet, so it degrades to "include" (flagged for Architect).
 */
function passesFilter(record: SessionRecord, predicate: FilterPredicate, dayNow: string | null): boolean {
    if (predicate === 'all') {
        return true;
    }
    const day = recordDayId(record);
    if (day === null) {
        return true;
    }
    if (predicate === 'today') {
        return dayNow === null || day === dayNow;
    }
    return true; // this-week: no record-level week index yet — honest include
}

function recordCoordinate(record: SessionRecord): string | null {
    const raw =
        field(record, 'coordinate')
        ?? field(record, 'subject_coordinate')
        ?? field(record, 'subjectCoordinate');
    return typeof raw === 'string' && raw.trim() !== '' ? raw : null;
}

function kairosPlanetDegrees(record: SessionRecord): number[] | null {
    const kairos = field(record, 'kairos');
    const source = kairos && typeof kairos === 'object' && !Array.isArray(kairos)
        ? (kairos as Record<string, unknown>)
        : (record as Record<string, unknown>);
    const raw = source.planet_degrees ?? source.planetDegrees;
    if (Array.isArray(raw) && raw.length > 0 && raw.every(v => typeof v === 'number' && Number.isFinite(v))) {
        return raw as number[];
    }
    return null;
}

function tarotPsycheAnchor(record: SessionRecord): Record<string, unknown> | null {
    const raw =
        field(record, 'tarot_psyche_anchor')
        ?? field(record, 'psyche_anchor')
        ?? field(record, 'tarot');
    return raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : null;
}

// ---------------------------------------------------------------------------
// Detail sub-components
// ---------------------------------------------------------------------------

/** Planet degrees at session open, or a pending ReadinessBanner. The kairos
 *  snapshot rides the session record (s5'.epii.runtimeContext is not a wired
 *  producer); absent/KAIROS_ENABLED=false (FR-3 default) degrades to pending. */
function KairosAtOpenStrip({ record }: { readonly record: SessionRecord | null }) {
    const degrees = record ? kairosPlanetDegrees(record) : null;
    return (
        <div className="kairos-at-open-strip" data-testid="kairos-at-open-strip">
            {degrees ? (
                <ol className="kairos-planet-degrees" data-testid="kairos-planet-degrees">
                    {degrees.map((deg, index) => (
                        <li key={index}>{deg.toFixed(2)}&deg;</li>
                    ))}
                </ol>
            ) : (
                <ReadinessBanner
                    state="pending-kairos"
                    reason="kairos-at-open absent — no kairos snapshot on this session record (s5'.epii.runtimeContext is not a wired producer; KAIROS_ENABLED defaults off, FR-3)"
                />
            )}
        </div>
    );
}

/** Tarot/psyche anchor, or a pending ReadinessBanner. Producer 19.6
 *  `contemplate.fetch_object` is not landed — spec-designed degrade. */
function TarotPsycheAnchorStrip({ record }: { readonly record: SessionRecord | null }) {
    const anchor = record ? tarotPsycheAnchor(record) : null;
    return (
        <div className="tarot-psyche-anchor-strip" data-testid="tarot-psyche-anchor-strip">
            {anchor ? (
                <dl className="tarot-psyche-anchor" data-testid="tarot-psyche-anchor">
                    {Object.entries(anchor).map(([key, val]) => (
                        <div key={key}>
                            <dt>{key}</dt>
                            <dd>{typeof val === 'string' || typeof val === 'number' ? String(val) : JSON.stringify(val)}</dd>
                        </div>
                    ))}
                </dl>
            ) : (
                <ReadinessBanner
                    state="pending-tarot-psyche"
                    reason="tarot/psyche anchor absent — producer 19.6 contemplate.fetch_object is not landed (spec-designed degrade)"
                />
            )}
        </div>
    );
}

/** The active coordinate; clicking re-selects this session's coordinate in the
 *  shared coordinate store (best-effort: no-op when the record names none). */
function ActiveCoordinateDisplay({ record }: { readonly record: SessionRecord | null }) {
    const selected = useCoordinateStore(s => s.selected);
    const target = record ? recordCoordinate(record) : null;
    const shown = selected ?? target;
    return (
        <button
            type="button"
            className="active-coordinate-display"
            data-testid="active-coordinate-display"
            disabled={target === null && shown === null}
            onClick={() => {
                if (target) {
                    useCoordinateStore.getState().setSelected(target);
                }
            }}
        >
            {shown ? <CoordinateString value={shown} /> : <span className="pane-message">no coordinate selected</span>}
        </button>
    );
}

// ---------------------------------------------------------------------------
// Pane
// ---------------------------------------------------------------------------

export function SessionsPane() {
    const bound = useSessionStore(s => s.sessionKey);
    const dayNow = useSessionStore(s => s.dayNow);
    const connected = useProvenanceStore(s => s.connection.connected);
    const sessionTab = useOmniPanelTabState('sessions');
    const patchTab = useOmniPanelSessionStore(s => s.patchTab);
    const selectTab = useOmniPanelSessionStore(s => s.selectTab);
    const [sessions, setSessions] = useState<SessionRecord[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const refresh = () => {
        if (!connected) {
            return;
        }
        new SessionClient(gateway())
            .list()
            .then(setSessions)
            .catch(err => setError(err instanceof Error ? err.message : String(err)));
    };

    useEffect(refresh, [connected]);

    const bindSession = (sessionKey: string) => {
        useSessionStore.getState().setSession({ sessionKey });
        patchTab('sessions', { selectedSessionId: sessionKey });
    };

    // Replaces the T3.3 local-key fabrication: the New-session button now calls
    // the real khora session-start gateway method and binds the RETURNED session
    // id. `dayId` is the real S0 gate::day_start param; `parent` anchors the new
    // session to agent:epii:main per the continuity-fold design.
    const startSession = () => {
        setNotice(null);
        if (!dayNow) {
            setNotice('day anchor required — begin today before starting a session');
            return;
        }
        gateway()
            .invoke(KHORA_SESSION_START_RPC, { dayId: dayNow, topic: '', parent: MAIN_SESSION_KEY })
            .then(receipt => {
                const artifact = receipt.artifact as Record<string, unknown> | null;
                const sessionKey = typeof artifact?.sessionId === 'string' ? artifact.sessionId : null;
                if (!sessionKey) {
                    setNotice('khora.session_start returned no sessionId');
                    return;
                }
                useSessionStore.getState().setSession({ sessionKey, dayNow, privacyClass: 'protected-local' });
                patchTab('sessions', { selectedSessionId: sessionKey });
                refresh();
            })
            .catch(err => setNotice(`session start failed: ${err instanceof Error ? err.message : String(err)}`));
    };

    // Switch: return focus to the full list to pick a different session.
    const switchSession = () => {
        patchTab('sessions', { selectedSessionId: null, filterPredicate: 'all' });
    };

    // Resume: real gateway method (sessions.resume). Honest dispatch — a refusal
    // surfaces inline (ReviewBlocksPane pattern), never a fabricated success.
    const resumeSession = (sessionKey: string) => {
        setNotice(null);
        gateway()
            .invoke(SESSION_RESUME_RPC, { session: sessionKey })
            .then(() => bindSession(sessionKey))
            .catch(err => setNotice(`resume unavailable: ${err instanceof Error ? err.message : String(err)}`));
    };

    // Summary click-through: navigate the OmniPanel to the fold. The bound
    // session is the implicit filter — dispatch/evidence/review folds already
    // key off useSessionStore().sessionKey, so binding + selectTab is the whole
    // filter. (No per-tab `sessionKey` filter field exists in the typed
    // OmniPanelPerTabState; widening it is the Architect's call — flagged.)
    const jumpToFold = (tab: OmniPanelTabId) => {
        selectTab(tab);
    };

    if (!connected) {
        return <div className="pane-message">Gateway disconnected.</div>;
    }
    if (error) {
        return <div className="pane-message">sessions unavailable: {error}</div>;
    }

    const filtered = (sessions ?? []).filter(record => passesFilter(record, sessionTab.filterPredicate, dayNow));
    const ordered = orderSessionsForContinuity(filtered, bound, MAIN_SESSION_KEY);
    const selectedId = sessionTab.selectedSessionId;
    const selectedRecord: SessionRecord | null = selectedId
        ? (sessions ?? []).find(r => r.sessionKey === selectedId) ?? { sessionKey: selectedId }
        : null;

    return (
        <div className="sessions-pane" data-testid="sessions-pane">
            <header className="session-manager-header" data-testid="session-manager-header">
                <span className="session-day-now" data-testid="session-day-now" data-day-now={dayNow ?? 'none'}>
                    day-now: {dayNow ?? 'no day anchored'}
                </span>
                <PrivacyClassBadge />
                <div className="pane-toolbar">
                    <button type="button" onClick={refresh}>
                        refresh
                    </button>
                    <button type="button" data-testid="session-new" disabled={!dayNow} onClick={startSession}>
                        new session
                    </button>
                    <button type="button" data-testid="session-switch" onClick={switchSession}>
                        switch
                    </button>
                    <label className="sessions-filter">
                        filter
                        <select
                            data-testid="sessions-filter-control"
                            value={sessionTab.filterPredicate}
                            onChange={event =>
                                patchTab('sessions', { filterPredicate: event.target.value as FilterPredicate })
                            }
                        >
                            {FILTER_PREDICATES.map(predicate => (
                                <option key={predicate} value={predicate}>
                                    {predicate}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                {notice ? (
                    <p className="pane-message" data-testid="session-notice">
                        {notice}
                    </p>
                ) : null}
            </header>
            <ul className="session-list">
                {ordered.map(record => (
                    <li key={record.sessionKey}>
                        <button
                            type="button"
                            data-testid={`session-${record.sessionKey}`}
                            className={record.sessionKey === bound ? 'session-item session-bound' : 'session-item'}
                            onClick={() => bindSession(record.sessionKey)}
                        >
                            {record.sessionKey === bound ? '◈ ' : ''}
                            {record.sessionKey === MAIN_SESSION_KEY ? '★ ' : ''}
                            {record.label ?? record.sessionKey}
                        </button>
                    </li>
                ))}
                {sessions && ordered.length === 0 ? (
                    <li className="pane-message">no sessions yet — the first chat message creates one</li>
                ) : null}
            </ul>
            {selectedId && selectedId !== bound ? (
                <p className="pane-message" data-testid="sessions-persisted-selection">
                    Restored session selection: {selectedId}
                </p>
            ) : null}
            {selectedRecord ? (
                <section
                    className="session-detail-pane"
                    data-testid="session-detail-pane"
                    data-session={selectedRecord.sessionKey}
                >
                    <KairosAtOpenStrip record={selectedRecord} />
                    <TarotPsycheAnchorStrip record={selectedRecord} />
                    <ActiveCoordinateDisplay record={selectedRecord} />
                    <div className="session-summaries">
                        <button
                            type="button"
                            className="session-summary"
                            data-testid="session-dispatch-summary"
                            onClick={() => jumpToFold('dispatch-trace')}
                        >
                            Dispatch: &mdash;
                        </button>
                        <button
                            type="button"
                            className="session-summary"
                            data-testid="session-evidence-summary"
                            onClick={() => jumpToFold('evidence')}
                        >
                            Evidence: &mdash;
                        </button>
                        <button
                            type="button"
                            className="session-summary"
                            data-testid="session-review-summary"
                            onClick={() => jumpToFold('review')}
                        >
                            Review: &mdash;
                        </button>
                    </div>
                    <div className="session-lifecycle">
                        <button
                            type="button"
                            data-testid="session-resume"
                            onClick={() => resumeSession(selectedRecord.sessionKey)}
                        >
                            resume
                        </button>
                        <button
                            type="button"
                            data-testid="session-archive"
                            disabled
                            title="sessions.archive is not a gateway method — unavailable"
                        >
                            archive (unavailable)
                        </button>
                    </div>
                </section>
            ) : null}
        </div>
    );
}
