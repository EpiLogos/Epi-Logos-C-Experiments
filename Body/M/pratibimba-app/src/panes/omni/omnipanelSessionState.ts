/**
 * Coordinate: M' `/` membrane (OmniPanel session state — Track 27.T27.11)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Position (#n): `/` state-persistence boundary
 * Actualises: one typed, serialisable OmniPanel state record shared by both
 *   FlexLayout faces: active tab, ten fold-local state records, and the
 *   membrane presentation state.
 * Public surface: OmniPanelSessionState, tab-state types,
 *   createOmniPanelSessionState, readOmniPanelSessionState,
 *   hydrateOmniPanelSessionState, useOmniPanelSessionStore,
 *   useOmniPanelTabState.
 * Does NOT own: FlexLayout model persistence, gateway transport, or the
 *   semantics/rendering of the ten fold bodies.
 * Contract: [[M'-SYSTEM-SPEC]] + [[27-omnipanel-tabs-deep]] 27.11.
 */

import { create } from 'zustand';
import type { OmniPanelTabId } from './omnipanelRuntime';
import { SETTINGS_SECTIONS, type SettingsSectionId } from '../../ui/settingsSections';

export type OmniPanelVisibility = 'hidden' | 'minimal' | 'fullscreen';

export interface PiChatTabState {
    readonly conversationId: string | null;
    readonly draftMessage: string;
    readonly scrollOffset: number;
    readonly capabilityPaletteOpen: boolean;
}

export interface SessionsTabState {
    readonly selectedSessionId: string | null;
    readonly filterPredicate: 'today' | 'this-week' | 'all';
}

export interface DispatchTraceTabState {
    readonly expandedNodeIds: readonly string[];
    readonly selectedNodeId: string | null;
    readonly actorFilter: readonly string[];
    readonly timeRangeFilter: 'last-5m' | 'last-hour' | 'full-session';
}

export interface ToolStreamTabState {
    readonly filters: Readonly<{
        readonly actor?: string;
        readonly toolName?: string;
        readonly timeRange?: 'last-5m' | 'last-hour' | 'full-session' | 'custom';
        readonly eventKind?: readonly string[];
        readonly privacyClass?: 'public' | 'protected' | 'private' | 'all';
    }>;
    readonly selectedEventId: string | null;
    readonly scrollOffset: number;
    readonly live: boolean;
}

export interface EvidenceTabState {
    readonly selectedPacketId: string | null;
    readonly filters: Readonly<{ readonly mediator?: string; readonly timeRange?: string; readonly privacyClass?: string }>;
    readonly scrollOffset: number;
    readonly depositFormOpen: boolean;
    readonly depositFormDraft?: unknown;
}

export interface ReviewTabState {
    readonly selectedReviewId: string | null;
    readonly filters: Readonly<{ readonly mediator?: string; readonly humanRequiredOnly?: boolean }>;
    readonly scrollOffset: number;
    readonly reviseFormOpen: boolean;
    readonly reviseFormDraft?: string;
    readonly annotateFormOpen: boolean;
    readonly annotateFormDraft?: string;
}

export interface GatewayTabState {
    readonly activeSubView: 'capabilities' | 'nodes' | 'models' | 'skills' | 'cron' | 'config' | 'settings';
    readonly selectedCapabilityName: string | null;
    readonly tryItDraft?: Readonly<Record<string, unknown>>;
}

export interface DiagnosticsTabState {
    readonly activeSubSection:
        | 'overview'
        | 'kernel-bridge'
        | 'profile'
        | 's2-graph'
        | 'gateway-ws'
        | 'intent-log'
        | null;
    readonly intentLogScrollOffset: number;
}

export interface TuningTabState {
    readonly selectedKnobKey: string | null;
    readonly subsystemFilter: string | null;
}

/** 32.T32.4 — which of the six settings sections is being read alone. `null`
 *  is the default view (all six), the same "null persists as default"
 *  convention `DiagnosticsTabState.activeSubSection` uses. */
export interface SettingsTabState {
    readonly activeSection: SettingsSectionId | null;
}

export interface OmniPanelPerTabState {
    readonly 'pi-chat': PiChatTabState;
    readonly sessions: SessionsTabState;
    readonly 'dispatch-trace': DispatchTraceTabState;
    readonly 'tool-stream': ToolStreamTabState;
    readonly evidence: EvidenceTabState;
    readonly review: ReviewTabState;
    readonly gateway: GatewayTabState;
    readonly diagnostics: DiagnosticsTabState;
    readonly tuning: TuningTabState;
    readonly settings: SettingsTabState;
}

export interface OmniPanelSessionState {
    readonly activeTab: OmniPanelTabId;
    readonly perTabState: OmniPanelPerTabState;
    readonly omniState: OmniPanelVisibility;
}

const TAB_IDS: readonly OmniPanelTabId[] = Object.freeze([
    'pi-chat',
    'sessions',
    'dispatch-trace',
    'tool-stream',
    'evidence',
    'review',
    'gateway',
    'diagnostics',
    'tuning',
    'settings'
]);

function record(value: unknown): Readonly<Record<string, unknown>> {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? (value as Readonly<Record<string, unknown>>)
        : {};
}

function stringOrNull(value: unknown): string | null {
    return typeof value === 'string' ? value : null;
}

function finite(value: unknown, fallback = 0): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function boolean(value: unknown, fallback = false): boolean {
    return typeof value === 'boolean' ? value : fallback;
}

function stringList(value: unknown): readonly string[] {
    return Object.freeze(Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : []);
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
    return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function optionalString(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
}

function createPerTabState(candidate: unknown): OmniPanelPerTabState {
    const source = record(candidate);
    const pi = record(source['pi-chat']);
    const sessions = record(source.sessions);
    const dispatch = record(source['dispatch-trace']);
    const tools = record(source['tool-stream']);
    const evidence = record(source.evidence);
    const review = record(source.review);
    const gateway = record(source.gateway);
    const diagnostics = record(source.diagnostics);
    const tuning = record(source.tuning);
    const settings = record(source.settings);
    const toolFilters = record(tools.filters);
    const evidenceFilters = record(evidence.filters);
    const reviewFilters = record(review.filters);

    return Object.freeze({
        'pi-chat': Object.freeze({
            conversationId: stringOrNull(pi.conversationId),
            draftMessage: typeof pi.draftMessage === 'string' ? pi.draftMessage : '',
            scrollOffset: finite(pi.scrollOffset),
            capabilityPaletteOpen: boolean(pi.capabilityPaletteOpen)
        }),
        sessions: Object.freeze({
            selectedSessionId: stringOrNull(sessions.selectedSessionId),
            filterPredicate: oneOf(sessions.filterPredicate, ['today', 'this-week', 'all'] as const, 'today')
        }),
        'dispatch-trace': Object.freeze({
            expandedNodeIds: stringList(dispatch.expandedNodeIds),
            selectedNodeId: stringOrNull(dispatch.selectedNodeId),
            actorFilter: stringList(dispatch.actorFilter),
            timeRangeFilter: oneOf(dispatch.timeRangeFilter, ['last-5m', 'last-hour', 'full-session'] as const, 'full-session')
        }),
        'tool-stream': Object.freeze({
            filters: Object.freeze({
                ...(optionalString(toolFilters.actor) ? { actor: optionalString(toolFilters.actor) } : {}),
                ...(optionalString(toolFilters.toolName) ? { toolName: optionalString(toolFilters.toolName) } : {}),
                ...(toolFilters.timeRange
                    ? { timeRange: oneOf(toolFilters.timeRange, ['last-5m', 'last-hour', 'full-session', 'custom'] as const, 'full-session') }
                    : {}),
                ...(toolFilters.eventKind ? { eventKind: stringList(toolFilters.eventKind) } : {}),
                ...(toolFilters.privacyClass
                    ? { privacyClass: oneOf(toolFilters.privacyClass, ['public', 'protected', 'private', 'all'] as const, 'all') }
                    : {})
            }),
            selectedEventId: stringOrNull(tools.selectedEventId),
            scrollOffset: finite(tools.scrollOffset),
            live: boolean(tools.live, true)
        }),
        evidence: Object.freeze({
            selectedPacketId: stringOrNull(evidence.selectedPacketId),
            filters: Object.freeze({
                ...(optionalString(evidenceFilters.mediator) ? { mediator: optionalString(evidenceFilters.mediator) } : {}),
                ...(optionalString(evidenceFilters.timeRange) ? { timeRange: optionalString(evidenceFilters.timeRange) } : {}),
                ...(optionalString(evidenceFilters.privacyClass) ? { privacyClass: optionalString(evidenceFilters.privacyClass) } : {})
            }),
            scrollOffset: finite(evidence.scrollOffset),
            depositFormOpen: boolean(evidence.depositFormOpen),
            ...(evidence.depositFormDraft !== undefined ? { depositFormDraft: evidence.depositFormDraft } : {})
        }),
        review: Object.freeze({
            selectedReviewId: stringOrNull(review.selectedReviewId),
            filters: Object.freeze({
                ...(optionalString(reviewFilters.mediator) ? { mediator: optionalString(reviewFilters.mediator) } : {}),
                ...(typeof reviewFilters.humanRequiredOnly === 'boolean' ? { humanRequiredOnly: reviewFilters.humanRequiredOnly } : {})
            }),
            scrollOffset: finite(review.scrollOffset),
            reviseFormOpen: boolean(review.reviseFormOpen),
            ...(optionalString(review.reviseFormDraft) ? { reviseFormDraft: optionalString(review.reviseFormDraft) } : {}),
            annotateFormOpen: boolean(review.annotateFormOpen),
            ...(optionalString(review.annotateFormDraft) ? { annotateFormDraft: optionalString(review.annotateFormDraft) } : {})
        }),
        gateway: Object.freeze({
            activeSubView: oneOf(gateway.activeSubView, ['capabilities', 'nodes', 'models', 'skills', 'cron', 'config', 'settings'] as const, 'capabilities'),
            selectedCapabilityName: stringOrNull(gateway.selectedCapabilityName),
            ...(gateway.tryItDraft !== undefined ? { tryItDraft: record(gateway.tryItDraft) } : {})
        }),
        diagnostics: Object.freeze({
            activeSubSection: diagnostics.activeSubSection === null
                ? null
                : oneOf(diagnostics.activeSubSection, ['overview', 'kernel-bridge', 'profile', 's2-graph', 'gateway-ws', 'intent-log'] as const, 'overview'),
            intentLogScrollOffset: finite(diagnostics.intentLogScrollOffset)
        }),
        tuning: Object.freeze({
            selectedKnobKey: stringOrNull(tuning.selectedKnobKey),
            subsystemFilter: stringOrNull(tuning.subsystemFilter)
        }),
        settings: Object.freeze({
            activeSection:
                typeof settings.activeSection === 'string'
                && SETTINGS_SECTIONS.some(section => section.id === settings.activeSection)
                    ? (settings.activeSection as SettingsSectionId)
                    : null
        })
    });
}

/** Normalize persisted content before it reaches a live fold. Unknown fields
 * are intentionally ignored, so an old or corrupt saved layout cannot invent
 * a tab state that the current contract does not understand. */
export function createOmniPanelSessionState(candidate: unknown = null): OmniPanelSessionState {
    const source = record(candidate);
    return Object.freeze({
        activeTab: oneOf(source.activeTab, TAB_IDS, 'pi-chat'),
        perTabState: createPerTabState(source.perTabState),
        omniState: oneOf(source.omniState, ['hidden', 'minimal', 'fullscreen'] as const, 'minimal')
    });
}

export interface OmniPanelSessionStore {
    readonly session: OmniPanelSessionState;
    selectTab(tab: OmniPanelTabId): void;
    setOmniState(state: OmniPanelVisibility): void;
    patchTab<T extends OmniPanelTabId>(tab: T, patch: Partial<OmniPanelPerTabState[T]>): void;
    hydrate(candidate: unknown): void;
}

export const useOmniPanelSessionStore = create<OmniPanelSessionStore>(set => ({
    session: createOmniPanelSessionState(),
    selectTab: activeTab => set(state => ({ session: Object.freeze({ ...state.session, activeTab }) })),
    setOmniState: omniState => set(state => ({ session: Object.freeze({ ...state.session, omniState }) })),
    patchTab: (tab, patch) => set(state => ({
        session: Object.freeze({
            ...state.session,
            perTabState: Object.freeze({
                ...state.session.perTabState,
                [tab]: Object.freeze({ ...state.session.perTabState[tab], ...patch })
            }) as OmniPanelPerTabState
        })
    })),
    hydrate: candidate => set({ session: createOmniPanelSessionState(candidate) })
}));

export function readOmniPanelSessionState(): OmniPanelSessionState {
    return useOmniPanelSessionStore.getState().session;
}

export function hydrateOmniPanelSessionState(candidate: unknown): void {
    useOmniPanelSessionStore.getState().hydrate(candidate);
}

export function useOmniPanelTabState<T extends OmniPanelTabId>(tab: T): OmniPanelPerTabState[T] {
    return useOmniPanelSessionStore(state => state.session.perTabState[tab]);
}
