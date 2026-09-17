import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    Disposable,
    MExtensionMiniMode,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import { EXTENSION_ID, PRIVACY_CLASS } from '../../common';
import { buildPublicProfilePayload } from '../../common';
import { privacyChromeClass, SURFACE_PRIVACY_TOOLTIP } from '../privacy-chrome';
import {
    PasuWizardLaunchContext,
    PasuWizardMode,
    setPasuWizardLauncher
} from '../onboarding/identity-wizard';

// ============================================================================
// Tranche 25.4 — PASU identity setup wizard (spec-ahead-integration; DR-WC-M4-3)
//
// A 6-step stepper `ReactWidget` (view id `m4.nara.pasuWizard`) that captures the
// user's PASU identity profile. Each step maps 1:1 onto a `PasuRecord` frontmatter
// key (Body/S/S0/epi-cli/src/vault/pasu.rs::PasuRecord):
//
//   (1) Birth date          → c_0_birth_date          (ISO date)
//   (2) Birth location      → c_0_birth_location      (lat/lon + place name)
//   (3) Natal chart path    → c_0_natal_chart_path    (upload OR Kerykeion fetch)
//   (4) Jungian typology    → c_2_jungian             (`epi nara identity set --jungian`)
//   (5) Gene Keys           → c_3_gene_keys
//   (6) Human Design        → c_4_human_design
//
// Every write goes through the canonical gateway RPC `nara.pasu.set` (routed via
// the S4S5DomainAdapter per DR-WC-M4-3) — the widget MUST NOT shell out to
// `epi vault pasu set`. The read path `nara.pasu.show` returns a handle-only PASU
// record: the natal-chart raw body never leaves the local machine, only its path
// string. `c_5_quintessence_hash` / `c_5_quintessence_clock` are derived (oracle
// charges → unit quaternion → clock position → BLAKE3) and surfaced read-only by
// 25.5 — they are NOT editable here.
//
// Privacy chrome: `mext-privacy-protected-local`. Composes as the
// `M4PasuWizardBadge` TRACK_08 export (badge = completion %; compact-card =
// current-step summary; inspector = full stepper).
// ============================================================================

export const PASU_WIZARD_VIEW_ID = 'm4.nara.pasuWizard';
export const PASU_WIZARD_LABEL = 'PASU Identity Setup';
export const M4_PASU_WIZARD_BADGE_EXPORT = 'M4PasuWizardBadge' as const;
export const PASU_WIZARD_OPEN_COMMAND_ID = 'm4.nara.pasuWizard.open';

/** Canonical PASU write path (DR-WC-M4-3). One `{ key, value }` call per field. */
export const PASU_SET_METHOD = 'nara.pasu.set';
/** Handle-only PASU read; the natal-chart body never returns, only its path. */
export const PASU_SHOW_METHOD = 'nara.pasu.show';
/**
 * Mercurius kairos populator (Tranche 19.12) — resolves natal positions from the
 * birth ref and yields the natal-chart artifact path. Gated by FR-3: only
 * reachable when `KAIROS_ENABLED=true`. Mirrors the runtime's `MERCURIUS_REFRESH_RPC`.
 */
export const KERYKEION_FETCH_METHOD = 'nara.kairos.refresh';

/** FR-3 privacy gate. Kairos (live Kerykeion fetch) is OFF until explicit opt-in. */
export const KAIROS_ENABLED_PREFERENCE = 'epi-logos.privacy.kairos-enabled';
export const KAIROS_ENABLED_DEFAULT = false as const;

/** Editable PASU frontmatter keys, in step order. */
export type PasuEditableKey =
    | 'c_0_birth_date'
    | 'c_0_birth_location'
    | 'c_0_natal_chart_path'
    | 'c_2_jungian'
    | 'c_3_gene_keys'
    | 'c_4_human_design';

export type PasuWizardStepId =
    | 'birth-date'
    | 'birth-location'
    | 'natal-chart'
    | 'jungian'
    | 'gene-keys'
    | 'human-design';

export type PasuStepInputKind = 'date' | 'location' | 'natal-chart' | 'text';

export interface PasuWizardStep {
    readonly id: PasuWizardStepId;
    readonly index: number;
    readonly title: string;
    /** Full PASU frontmatter key written via `nara.pasu.set`. */
    readonly key: PasuEditableKey;
    /** Kebab field slug accepted by the `epi vault pasu set` operator alias. */
    readonly slug: string;
    readonly inputKind: PasuStepInputKind;
    readonly hint: string;
}

/** The six wizard steps, matching `PasuRecord` field order. */
export const PASU_WIZARD_STEPS: readonly PasuWizardStep[] = Object.freeze([
    Object.freeze({
        id: 'birth-date',
        index: 0,
        title: 'Birth date',
        key: 'c_0_birth_date',
        slug: 'birth-date',
        inputKind: 'date',
        hint: 'ISO date (YYYY-MM-DD) of birth.'
    }),
    Object.freeze({
        id: 'birth-location',
        index: 1,
        title: 'Birth location',
        key: 'c_0_birth_location',
        slug: 'birth-location',
        inputKind: 'location',
        hint: 'Latitude, longitude and place name of birth.'
    }),
    Object.freeze({
        id: 'natal-chart',
        index: 2,
        title: 'Natal chart',
        key: 'c_0_natal_chart_path',
        slug: 'natal-chart-path',
        inputKind: 'natal-chart',
        hint: 'Upload an existing chart, or fetch from Kerykeion (kairos opt-in).'
    }),
    Object.freeze({
        id: 'jungian',
        index: 3,
        title: 'Jungian typology',
        key: 'c_2_jungian',
        slug: 'jungian',
        inputKind: 'text',
        hint: 'Typology (e.g. INFJ) plus functional stack notes.'
    }),
    Object.freeze({
        id: 'gene-keys',
        index: 4,
        title: 'Gene Keys',
        key: 'c_3_gene_keys',
        slug: 'gene-keys',
        inputKind: 'text',
        hint: 'Gene Keys profile (activation / venus / pearl sequence).'
    }),
    Object.freeze({
        id: 'human-design',
        index: 5,
        title: 'Human Design',
        key: 'c_4_human_design',
        slug: 'human-design',
        inputKind: 'text',
        hint: 'Human Design chart (type, authority, profile, centres).'
    })
]);

export const PASU_WIZARD_STEP_COUNT = PASU_WIZARD_STEPS.length;

/** Editable PASU draft — the six wizard-writable fields. */
export interface PasuDraft {
    readonly c_0_birth_date: string;
    readonly c_0_birth_location: string;
    readonly c_0_natal_chart_path: string;
    readonly c_2_jungian: string;
    readonly c_3_gene_keys: string;
    readonly c_4_human_design: string;
}

/** Derived, read-only PASU fields (surfaced by 25.5; never wizard-editable). */
export interface PasuDerived {
    readonly c_5_quintessence_hash: string;
    readonly c_5_quintessence_clock: string;
}

export type PasuWizardStatus = 'loading' | 'ready' | 'writing' | 'fetching' | 'error';

/**
 * Wizard state. `localOnlyNatalChartBody` holds an uploaded chart's raw JSON
 * *in memory only*: it is written nowhere through the gateway (only the path is)
 * and is deliberately excluded from every public payload — see
 * {@link buildPublicPasuProfilePayload}.
 */
export interface PasuWizardState {
    readonly draft: PasuDraft;
    readonly derived: PasuDerived;
    readonly currentStepIndex: number;
    readonly status: PasuWizardStatus;
    readonly errorMessage: string | null;
    readonly kairosEnabled: boolean;
    /** Protected-local: raw uploaded natal-chart body, never transmitted. */
    readonly localOnlyNatalChartBody: string | null;
}

export function emptyPasuDraft(): PasuDraft {
    return Object.freeze({
        c_0_birth_date: '',
        c_0_birth_location: '',
        c_0_natal_chart_path: '',
        c_2_jungian: '',
        c_3_gene_keys: '',
        c_4_human_design: ''
    });
}

export function emptyPasuDerived(): PasuDerived {
    return Object.freeze({ c_5_quintessence_hash: '', c_5_quintessence_clock: '' });
}

export function initialPasuWizardState(kairosEnabled: boolean = KAIROS_ENABLED_DEFAULT): PasuWizardState {
    return Object.freeze({
        draft: emptyPasuDraft(),
        derived: emptyPasuDerived(),
        currentStepIndex: 0,
        status: 'loading',
        errorMessage: null,
        kairosEnabled,
        localOnlyNatalChartBody: null
    });
}

// ============================================================================
// Pure helpers (testable without a DI container or React)
// ============================================================================

function stringField(record: Record<string, unknown>, ...keys: readonly string[]): string {
    for (const key of keys) {
        const value = record[key];
        if (typeof value === 'string' && value.trim().length > 0) {
            return value;
        }
    }
    return '';
}

/**
 * Coerce a `nara.pasu.show` response into a {@link PasuDraft}. Tolerant of a bare
 * record, a `{ pasu }`/`{ profile }` envelope, snake/kebab aliases, and a
 * not-found sentinel (yields an empty draft). The natal-chart field is read as a
 * **path string only**.
 */
export function pasuDraftFromShow(raw: unknown): PasuDraft {
    const record = unwrapPasuRecord(raw);
    if (!record) {
        return emptyPasuDraft();
    }
    return Object.freeze({
        c_0_birth_date: stringField(record, 'c_0_birth_date', 'birth_date', 'birthDate'),
        c_0_birth_location: stringField(record, 'c_0_birth_location', 'birth_location', 'birthLocation'),
        c_0_natal_chart_path: stringField(record, 'c_0_natal_chart_path', 'natal_chart_path', 'natalChartPath'),
        c_2_jungian: stringField(record, 'c_2_jungian', 'jungian'),
        c_3_gene_keys: stringField(record, 'c_3_gene_keys', 'gene_keys', 'geneKeys'),
        c_4_human_design: stringField(record, 'c_4_human_design', 'human_design', 'humanDesign')
    });
}

/** Read the derived (read-only) quintessence fields from a `nara.pasu.show` response. */
export function pasuDerivedFromShow(raw: unknown): PasuDerived {
    const record = unwrapPasuRecord(raw);
    if (!record) {
        return emptyPasuDerived();
    }
    return Object.freeze({
        c_5_quintessence_hash: stringField(record, 'c_5_quintessence_hash', 'quintessence_hash', 'quintessenceHash'),
        c_5_quintessence_clock: stringField(record, 'c_5_quintessence_clock', 'quintessence_clock', 'quintessenceClock')
    });
}

function unwrapPasuRecord(raw: unknown): Record<string, unknown> | null {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        return null;
    }
    const record = raw as Record<string, unknown>;
    if (record.found === false) {
        return null;
    }
    if (record.pasu && typeof record.pasu === 'object') {
        return record.pasu as Record<string, unknown>;
    }
    if (record.profile && typeof record.profile === 'object') {
        return record.profile as Record<string, unknown>;
    }
    return record;
}

/** The `{ key, value }` payload a step writes through `nara.pasu.set`. */
export function stepWrite(step: PasuWizardStep, draft: PasuDraft): { readonly key: PasuEditableKey; readonly value: string } {
    return Object.freeze({ key: step.key, value: draft[step.key] });
}

export function isStepComplete(step: PasuWizardStep, draft: PasuDraft): boolean {
    return draft[step.key].trim().length > 0;
}

/** Completion percentage (0–100) over the six editable fields. */
export function completionPercent(draft: PasuDraft): number {
    const filled = PASU_WIZARD_STEPS.filter(step => isStepComplete(step, draft)).length;
    return Math.round((filled / PASU_WIZARD_STEP_COUNT) * 100);
}

export function clampStepIndex(index: number): number {
    if (!Number.isFinite(index)) {
        return 0;
    }
    return Math.min(PASU_WIZARD_STEP_COUNT - 1, Math.max(0, Math.trunc(index)));
}

export function stepAt(index: number): PasuWizardStep {
    return PASU_WIZARD_STEPS[clampStepIndex(index)];
}

/**
 * Whether the live Kerykeion fetch option (step 3b) is reachable. FR-3 default
 * is OFF: anything other than a literal `true` disables it and the wizard falls
 * back to the upload path with a graceful stub notice.
 */
export function kerykeionFetchEnabled(kairosEnabled: unknown): boolean {
    return kairosEnabled === true;
}

export interface KerykeionFetchOutcome {
    readonly fetched: boolean;
    readonly natalChartPath: string | null;
    /** Present only on the FR-3 stub branch (kairos disabled). */
    readonly stubReason?: string;
}

/** FR-3 graceful stub returned when kairos is disabled — no fetch is attempted. */
export function fr3KerykeionStub(): KerykeionFetchOutcome {
    return Object.freeze({
        fetched: false,
        natalChartPath: null,
        stubReason: 'kairos-disabled'
    });
}

/** Extract the natal-chart artifact path from a `nara.kairos.refresh` response. */
export function readKerykeionNatalChartPath(raw: unknown): string | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    const record = raw as Record<string, unknown>;
    const path =
        record.natal_chart_path ??
        record.natalChartPath ??
        record.c_0_natal_chart_path ??
        (record.natal && typeof record.natal === 'object'
            ? (record.natal as Record<string, unknown>).chart_path
            : undefined);
    return typeof path === 'string' && path.trim().length > 0 ? path : null;
}

/**
 * Protected-local public projection of the PASU profile. Mirrors the canonical
 * {@link buildPublicProfilePayload} (nara-surface) discipline: the natal-chart
 * **body never enters** — only its path string is exposed, alongside the derived
 * (already non-sensitive) quintessence handles. The `localOnlyNatalChartBody`
 * the wizard may hold in memory is intentionally absent from this signature.
 */
export function buildPublicPasuProfilePayload(
    draft: PasuDraft,
    derived: PasuDerived
): Readonly<Record<string, unknown>> {
    return Object.freeze({
        privacyClass: PRIVACY_CLASS,
        surfaceId: EXTENSION_ID,
        completionPercent: completionPercent(draft),
        natalChartPath: draft.c_0_natal_chart_path,
        // Explicitly NOT included: the raw natal-chart body. Path string only.
        natalChartBodyIncluded: false,
        quintessenceHash: derived.c_5_quintessence_hash,
        quintessenceClock: derived.c_5_quintessence_clock,
        fields: Object.freeze({
            birthDateSet: draft.c_0_birth_date.trim().length > 0,
            birthLocationSet: draft.c_0_birth_location.trim().length > 0,
            natalChartSet: draft.c_0_natal_chart_path.trim().length > 0,
            jungianSet: draft.c_2_jungian.trim().length > 0,
            geneKeysSet: draft.c_3_gene_keys.trim().length > 0,
            humanDesignSet: draft.c_4_human_design.trim().length > 0
        })
    });
}

// ============================================================================
// Reducer — back/next navigation persists draft state on session scope
// ============================================================================

export type PasuWizardAction =
    | { readonly type: 'next' }
    | { readonly type: 'back' }
    | { readonly type: 'go-to'; readonly index: number }
    | { readonly type: 'set-field'; readonly key: PasuEditableKey; readonly value: string }
    | { readonly type: 'set-natal-chart'; readonly path: string; readonly localBody: string | null }
    | { readonly type: 'set-status'; readonly status: PasuWizardStatus; readonly errorMessage?: string | null }
    | { readonly type: 'set-kairos-enabled'; readonly enabled: boolean }
    | { readonly type: 'load'; readonly draft: PasuDraft; readonly derived: PasuDerived };

/**
 * Pure reducer. Crucially, `next`/`back` only move `currentStepIndex` — the
 * `draft` (and the in-memory natal-chart body) are carried untouched, so
 * navigating between steps never loses entered data within the session.
 */
export function pasuWizardReducer(state: PasuWizardState, action: PasuWizardAction): PasuWizardState {
    switch (action.type) {
        case 'next':
            return Object.freeze({ ...state, currentStepIndex: clampStepIndex(state.currentStepIndex + 1) });
        case 'back':
            return Object.freeze({ ...state, currentStepIndex: clampStepIndex(state.currentStepIndex - 1) });
        case 'go-to':
            return Object.freeze({ ...state, currentStepIndex: clampStepIndex(action.index) });
        case 'set-field':
            return Object.freeze({
                ...state,
                draft: Object.freeze({ ...state.draft, [action.key]: action.value })
            });
        case 'set-natal-chart':
            return Object.freeze({
                ...state,
                draft: Object.freeze({ ...state.draft, c_0_natal_chart_path: action.path }),
                localOnlyNatalChartBody: action.localBody
            });
        case 'set-status':
            return Object.freeze({
                ...state,
                status: action.status,
                errorMessage: action.errorMessage ?? (action.status === 'error' ? state.errorMessage : null)
            });
        case 'set-kairos-enabled':
            return Object.freeze({ ...state, kairosEnabled: action.enabled });
        case 'load':
            return Object.freeze({
                ...state,
                draft: action.draft,
                derived: action.derived,
                status: 'ready',
                errorMessage: null
            });
        default:
            return state;
    }
}

// ============================================================================
// M4PasuWizardBadge — TRACK_08 presentational export
// ============================================================================

export interface M4PasuWizardBadgeProps {
    /** Mini-mode: badge → completion %; compact-card → current step; inspector → full stepper. */
    readonly mode: MExtensionMiniMode;
    readonly state: PasuWizardState;
    readonly onSetField: (key: PasuEditableKey, value: string) => void;
    readonly onBack: () => void;
    readonly onNext: () => void;
    readonly onGoTo: (index: number) => void;
    readonly onUploadNatalChart: (path: string, localBody: string | null) => void;
    readonly onFetchKerykeion: () => void;
    readonly onCommit: () => void;
    readonly onSkip?: () => void;
}

/**
 * `M4PasuWizardBadge` — TRACK_08 compact/inspector export for `m4.nara.pasuWizard`.
 * Pure: receives the wizard state plus action callbacks; never touches the bridge.
 */
export const M4PasuWizardBadge: React.FC<M4PasuWizardBadgeProps> = props => {
    const { mode, state } = props;
    const percent = completionPercent(state.draft);
    return (
        <section
            className={`m4-pasu-wizard ${privacyChromeClass('protected_local')}`}
            data-test="M4PasuWizardBadge"
            data-track="TRACK_08"
            data-export={M4_PASU_WIZARD_BADGE_EXPORT}
            data-view-id={PASU_WIZARD_VIEW_ID}
            data-mode={mode}
            data-status={state.status}
            data-completion={percent}
            aria-label={PASU_WIZARD_LABEL}
        >
            {mode === 'badge'
                ? renderBadge(percent)
                : mode === 'inspector'
                  ? renderInspector(props, percent)
                  : renderCompactCard(state, percent)}
        </section>
    );
};

function renderBadge(percent: number): React.ReactElement {
    return (
        <span className="m4-pasu-wizard-badge" data-test="m4-pasu-wizard-badge" title={`PASU identity ${percent}% complete`}>
            <span className="m4-pasu-wizard-glyph" aria-hidden="true">
                ☉
            </span>
            <span className="m4-pasu-wizard-percent" data-test="m4-pasu-wizard-percent">
                {percent}%
            </span>
        </span>
    );
}

function renderCompactCard(state: PasuWizardState, percent: number): React.ReactElement {
    const step = stepAt(state.currentStepIndex);
    return (
        <div className="m4-pasu-wizard-compact" data-test="m4-pasu-wizard-compact">
            <header className="m4-pasu-wizard-compact-header">
                <span data-test="m4-pasu-wizard-compact-step">
                    Step {step.index + 1} of {PASU_WIZARD_STEP_COUNT}: {step.title}
                </span>
                <span className="m4-pasu-wizard-percent">{percent}%</span>
            </header>
            <p className="m4-pasu-wizard-compact-hint">{step.hint}</p>
            <span className="m4-pasu-wizard-privacy mext-privacy-protected-local">protected-local</span>
        </div>
    );
}

function renderInspector(props: M4PasuWizardBadgeProps, percent: number): React.ReactElement {
    const { state, onSetField, onBack, onNext, onGoTo, onUploadNatalChart, onFetchKerykeion, onCommit, onSkip } = props;
    const step = stepAt(state.currentStepIndex);
    const busy = state.status === 'writing' || state.status === 'fetching';
    const kerykeionEnabled = kerykeionFetchEnabled(state.kairosEnabled);
    return (
        <div className="m4-pasu-wizard-inspector" data-test="m4-pasu-wizard-inspector">
            <header className="m4-pasu-wizard-header">
                <h3>{PASU_WIZARD_LABEL}</h3>
                <span className="m4-pasu-wizard-privacy mext-privacy-protected-local">protected-local</span>
            </header>

            <ol className="m4-pasu-wizard-rail" aria-label="PASU setup steps">
                {PASU_WIZARD_STEPS.map(railStep => (
                    <li key={railStep.id}>
                        <button
                            type="button"
                            className={`m4-pasu-wizard-rail-step${
                                railStep.index === step.index ? ' is-current' : ''
                            }${isStepComplete(railStep, state.draft) ? ' is-complete' : ''}`}
                            data-test="m4-pasu-wizard-rail-step"
                            data-step-id={railStep.id}
                            data-current={railStep.index === step.index}
                            data-complete={isStepComplete(railStep, state.draft)}
                            aria-current={railStep.index === step.index ? 'step' : undefined}
                            disabled={busy}
                            onClick={() => onGoTo(railStep.index)}
                        >
                            <span className="m4-pasu-wizard-rail-num">{railStep.index + 1}</span>
                            <span className="m4-pasu-wizard-rail-title">{railStep.title}</span>
                        </button>
                    </li>
                ))}
            </ol>

            <section className="m4-pasu-wizard-panel" aria-label={step.title} data-step-id={step.id}>
                <h4>{step.title}</h4>
                <p className="m4-pasu-wizard-hint">{step.hint}</p>
                {step.inputKind === 'natal-chart' ? (
                    <NatalChartStep
                        path={state.draft.c_0_natal_chart_path}
                        busy={busy}
                        kerykeionEnabled={kerykeionEnabled}
                        onUpload={onUploadNatalChart}
                        onFetch={onFetchKerykeion}
                        onPathChange={value => onUploadNatalChart(value, state.localOnlyNatalChartBody)}
                    />
                ) : (
                    <FieldStep step={step} value={state.draft[step.key]} busy={busy} onChange={onSetField} />
                )}
            </section>

            {state.errorMessage ? (
                <p className="m4-pasu-wizard-error" data-test="m4-pasu-wizard-error">
                    {state.errorMessage}
                </p>
            ) : null}

            <footer className="m4-pasu-wizard-footer">
                <button
                    type="button"
                    className="m4-pasu-wizard-back"
                    data-test="m4-pasu-wizard-back"
                    disabled={busy || step.index === 0}
                    onClick={onBack}
                >
                    Back
                </button>
                <span className="m4-pasu-wizard-percent" data-test="m4-pasu-wizard-inspector-percent">
                    {percent}%
                </span>
                {step.index < PASU_WIZARD_STEP_COUNT - 1 ? (
                    <button
                        type="button"
                        className="m4-pasu-wizard-next"
                        data-test="m4-pasu-wizard-next"
                        disabled={busy}
                        onClick={onNext}
                    >
                        Next
                    </button>
                ) : (
                    <button
                        type="button"
                        className="m4-pasu-wizard-commit"
                        data-test="m4-pasu-wizard-commit"
                        disabled={busy}
                        onClick={onCommit}
                    >
                        Finish
                    </button>
                )}
                {onSkip ? (
                    <button
                        type="button"
                        className="m4-pasu-wizard-skip"
                        data-test="m4-pasu-wizard-skip"
                        disabled={busy}
                        onClick={onSkip}
                    >
                        Skip for now
                    </button>
                ) : null}
            </footer>
        </div>
    );
}

interface FieldStepProps {
    readonly step: PasuWizardStep;
    readonly value: string;
    readonly busy: boolean;
    readonly onChange: (key: PasuEditableKey, value: string) => void;
}

const FieldStep: React.FC<FieldStepProps> = ({ step, value, busy, onChange }) => {
    if (step.inputKind === 'date') {
        return (
            <input
                type="date"
                className="m4-pasu-wizard-input"
                data-test="m4-pasu-wizard-field"
                data-key={step.key}
                value={value}
                disabled={busy}
                onChange={event => onChange(step.key, event.target.value)}
            />
        );
    }
    if (step.inputKind === 'location') {
        return (
            <input
                type="text"
                className="m4-pasu-wizard-input"
                data-test="m4-pasu-wizard-field"
                data-key={step.key}
                placeholder="lat, lon — Place name"
                value={value}
                disabled={busy}
                onChange={event => onChange(step.key, event.target.value)}
            />
        );
    }
    return (
        <textarea
            className="m4-pasu-wizard-textarea"
            data-test="m4-pasu-wizard-field"
            data-key={step.key}
            value={value}
            disabled={busy}
            rows={4}
            onChange={event => onChange(step.key, event.target.value)}
        />
    );
};

interface NatalChartStepProps {
    readonly path: string;
    readonly busy: boolean;
    readonly kerykeionEnabled: boolean;
    readonly onUpload: (path: string, localBody: string | null) => void;
    readonly onFetch: () => void;
    readonly onPathChange: (value: string) => void;
}

const NatalChartStep: React.FC<NatalChartStepProps> = ({ path, busy, kerykeionEnabled, onUpload, onFetch, onPathChange }) => (
    <div className="m4-pasu-wizard-natal" data-test="m4-pasu-wizard-natal">
        <label className="m4-pasu-wizard-natal-upload">
            <span>Existing chart JSON path</span>
            <input
                type="text"
                className="m4-pasu-wizard-input"
                data-test="m4-pasu-wizard-natal-path"
                placeholder="Pratibimba/Self/natal-chart.json"
                value={path}
                disabled={busy}
                onChange={event => onPathChange(event.target.value)}
            />
        </label>
        <input
            type="file"
            accept="application/json"
            className="m4-pasu-wizard-natal-file"
            data-test="m4-pasu-wizard-natal-file"
            disabled={busy}
            onChange={event => {
                const file = event.target.files?.[0];
                if (file) {
                    // Read the raw body locally; only the path is ever persisted.
                    void file.text().then(body => onUpload(file.name, body));
                }
            }}
        />
        <button
            type="button"
            className="m4-pasu-wizard-natal-fetch"
            data-test="m4-pasu-wizard-natal-fetch"
            data-kairos-enabled={kerykeionEnabled}
            disabled={busy || !kerykeionEnabled}
            title={
                kerykeionEnabled
                    ? 'Fetch natal chart from Kerykeion'
                    : 'Kairos is disabled (FR-3) — enable kairos to fetch from Kerykeion'
            }
            onClick={onFetch}
        >
            Fetch from Kerykeion
        </button>
        {!kerykeionEnabled ? (
            <p className="m4-pasu-wizard-natal-stub" data-test="m4-pasu-wizard-natal-stub">
                Kerykeion fetch is unavailable while kairos is disabled. Upload a chart instead.
            </p>
        ) : null}
    </div>
);

// ============================================================================
// PasuWizardWidget — the stepper ReactWidget
// ============================================================================

@injectable()
export class PasuWizardWidget extends ReactWidget {
    static readonly ID = PASU_WIZARD_VIEW_ID;
    static readonly LABEL = PASU_WIZARD_LABEL;

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    /** Session-scoped wizard state — survives re-render so back/next never loses input. */
    protected state: PasuWizardState = initialPasuWizardState();
    protected mode: MExtensionMiniMode = 'inspector';
    protected launchContext: PasuWizardLaunchContext | null = null;
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = PasuWizardWidget.ID;
        this.title.label = PasuWizardWidget.LABEL;
        this.title.caption = SURFACE_PRIVACY_TOOLTIP;
        this.title.iconClass = 'codicon-account';
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.addClass('m4-nara-pasu-wizard');
        this.addClass(privacyChromeClass('protected_local'));
        void this.refresh();
    }

    override dispose(): void {
        for (const sub of this.subscriptions) {
            try {
                sub.dispose();
            } catch {
                // best-effort
            }
        }
        super.dispose();
    }

    /** Receive the 32.2 launch context (mode + skip/complete resume hooks). */
    applyLaunchContext(context: PasuWizardLaunchContext): void {
        this.launchContext = context;
        if (context.mode === 'natal-chart-only') {
            this.dispatch({ type: 'go-to', index: stepIndexForId('natal-chart') });
        }
    }

    protected dispatch(action: PasuWizardAction): void {
        this.state = pasuWizardReducer(this.state, action);
        this.update();
    }

    protected override render(): React.ReactNode {
        return (
            <div
                className={`mext-widget-root ${privacyChromeClass('protected_local')}`}
                data-test="m4-pasu-wizard-root"
                data-mode={this.mode}
            >
                <M4PasuWizardBadge
                    mode={this.mode}
                    state={this.state}
                    onSetField={(key, value) => this.dispatch({ type: 'set-field', key, value })}
                    onBack={() => this.dispatch({ type: 'back' })}
                    onNext={() => this.dispatch({ type: 'next' })}
                    onGoTo={index => this.dispatch({ type: 'go-to', index })}
                    onUploadNatalChart={(path, localBody) =>
                        this.dispatch({ type: 'set-natal-chart', path, localBody })
                    }
                    onFetchKerykeion={() => void this.fetchKerykeion()}
                    onCommit={() => void this.commit()}
                    onSkip={this.launchContext ? () => void this.skip() : undefined}
                />
            </div>
        );
    }

    /** Load the current PASU profile via the handle-only `nara.pasu.show` RPC. */
    protected async refresh(): Promise<void> {
        this.dispatch({ type: 'set-status', status: 'loading' });
        try {
            const raw = await this.bridge.invokeGatewayRpc(PASU_SHOW_METHOD, { reason: 'pasu-wizard-open' });
            this.dispatch({ type: 'load', draft: pasuDraftFromShow(raw), derived: pasuDerivedFromShow(raw) });
        } catch (error) {
            this.dispatch({
                type: 'set-status',
                status: 'error',
                errorMessage: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /** Persist the current step's field via the canonical `nara.pasu.set` RPC. */
    protected async persistStep(step: PasuWizardStep): Promise<void> {
        const { key, value } = stepWrite(step, this.state.draft);
        if (value.trim().length === 0) {
            return;
        }
        await this.bridge.invokeGatewayRpc(PASU_SET_METHOD, { key, value });
    }

    /** Write every filled field through `nara.pasu.set`, then resolve the launch. */
    protected async commit(): Promise<void> {
        this.dispatch({ type: 'set-status', status: 'writing' });
        try {
            for (const step of PASU_WIZARD_STEPS) {
                await this.persistStep(step);
            }
            this.dispatch({ type: 'set-status', status: 'ready' });
            await this.launchContext?.complete();
        } catch (error) {
            this.dispatch({
                type: 'set-status',
                status: 'error',
                errorMessage: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * Step 3b — fetch the natal chart from Kerykeion via Mercurius (19.12). FR-3:
     * if kairos is disabled this is a graceful no-op stub; otherwise the resolved
     * chart path is written via `nara.pasu.set` (path string only).
     */
    protected async fetchKerykeion(): Promise<KerykeionFetchOutcome> {
        if (!kerykeionFetchEnabled(this.state.kairosEnabled)) {
            const stub = fr3KerykeionStub();
            this.dispatch({
                type: 'set-status',
                status: 'ready',
                errorMessage: 'Kairos is disabled (FR-3) — upload a chart instead.'
            });
            return stub;
        }
        this.dispatch({ type: 'set-status', status: 'fetching' });
        try {
            const raw = await this.bridge.invokeGatewayRpc(KERYKEION_FETCH_METHOD, {
                birth_date: this.state.draft.c_0_birth_date,
                birth_location: this.state.draft.c_0_birth_location,
                reason: 'pasu-wizard-natal-fetch'
            });
            const path = readKerykeionNatalChartPath(raw);
            if (!path) {
                throw new Error('Kerykeion returned no natal-chart path');
            }
            this.dispatch({ type: 'set-natal-chart', path, localBody: null });
            await this.bridge.invokeGatewayRpc(PASU_SET_METHOD, { key: 'c_0_natal_chart_path', value: path });
            this.dispatch({ type: 'set-status', status: 'ready' });
            return Object.freeze({ fetched: true, natalChartPath: path });
        } catch (error) {
            this.dispatch({
                type: 'set-status',
                status: 'error',
                errorMessage: error instanceof Error ? error.message : String(error)
            });
            return Object.freeze({ fetched: false, natalChartPath: null });
        }
    }

    protected async skip(): Promise<void> {
        await this.launchContext?.skip();
    }
}

/** Resolve a step's index by id (used for the natal-chart-only launch mode). */
export function stepIndexForId(id: PasuWizardStepId): number {
    const found = PASU_WIZARD_STEPS.find(step => step.id === id);
    return found ? found.index : 0;
}

/**
 * Register the Tranche 25.4 wizard with the 32.2 launcher seam. When the
 * cold-start identity gate fires `m4.openPasuWizard`, the orchestration calls
 * {@link launchPasuWizard}, which hands the {@link PasuWizardLaunchContext} to
 * `mount` — the host opens the {@link PasuWizardWidget} and applies the context.
 * Returns a disposer that unregisters the launcher.
 */
export function registerPasuWizardLauncher(mount: (context: PasuWizardLaunchContext) => void): { dispose(): void } {
    return setPasuWizardLauncher(mount);
}

// Keep the canonical public-projection helper load-bearing: the wizard's
// `buildPublicPasuProfilePayload` parallels it, and the protected-local invariant
// test asserts the natal-chart body never reaches either.
void buildPublicProfilePayload;
// Keep the wizard-mode type referenced for downstream launch typing.
export type { PasuWizardMode };
