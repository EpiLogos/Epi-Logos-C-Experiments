import * as React from 'react';
import type { MathemeHarmonicProfileBoundary } from '@pratibimba/m-extension-runtime';
import type { M0ProvenanceState } from '../../common';

// ---------------------------------------------------------------------------
// Spec-ahead-integration (Tranches 01.10, 01.11, 05.21). Source row WC-M0-12.
//
// This console lists Verifier-emitted symbolic-coordinate-strings (raw EBNF)
// surfaced on the MathemeHarmonicProfile payload as
// `m0_verifier_questions: readonly string[]`. It NEVER parses the EBNF locally:
// the parse summary arrives through the bridge response payload (Track 5.21's
// `anuttara-symbolic-parse` skill handles round-trip parsing). Submitting a
// free-text answer dispatches `s0'.verifier.respond_question` over the bridge.
// ---------------------------------------------------------------------------

export type M0SymbolicNamespace = 'R' | 'L' | 'M' | 'C';
export type M0SymbolicStateMarker =
    | 'pending'
    | 'unwitnessed'
    | 'drift'
    | 'incoherent'
    | 'violated';

export interface M0SymbolicCoordinateParse {
    readonly namespace: M0SymbolicNamespace;
    readonly coordinate: readonly string[];
    readonly archetypeIndex: number | null; // T7 → 7, T9 → 9
    readonly stateMarker: M0SymbolicStateMarker | null;
}

export type M0SymbolicResponseStatus = 'awaiting' | 'parsed' | 'responded' | 'reverified';

export interface M0SymbolicQuestionRow {
    readonly raw: string; // raw EBNF coordinate-string
    readonly parsed: M0SymbolicCoordinateParse | null;
    readonly responseStatus: M0SymbolicResponseStatus;
    readonly responseText: string | null;
    readonly state: M0ProvenanceState;
}

export interface M0InspectorModel {
    readonly symbolicQuestions: readonly M0SymbolicQuestionRow[];
}

/**
 * Capability request shape mirrored from the kernel-bridge boundary
 * (`KernelBridgeCapabilityRequest`). Re-declared locally so this panel does not
 * take a hard dependency on the kernel-bridge package; any adapter or test stub
 * that implements `invokeCapability` satisfies it.
 */
export interface M0SymbolicCapabilityRequest {
    readonly method: 'invokeGatewayRpc';
    readonly sessionKey: string;
    readonly params: Readonly<{
        readonly gatewayMethod: "s0'.verifier.respond_question";
        readonly coordinateString: string;
        readonly responseText: string;
        readonly sourceExtensionId: 'm0-anuttara';
    }>;
    readonly profileGeneration: number | null;
    readonly provenanceHandles: readonly string[];
    readonly vak: null;
}

export interface M0SymbolicConsoleBridge {
    invokeCapability(request: M0SymbolicCapabilityRequest): Promise<unknown>;
}

export const M0_SYMBOLIC_RESPOND_METHOD = "s0'.verifier.respond_question" as const;
export const M0_SYMBOLIC_SESSION_KEY = 'm0-anuttara-symbolic' as const;
export const M0_SYMBOLIC_SOURCE_EXTENSION_ID = 'm0-anuttara' as const;

/**
 * Read the raw Verifier-emitted symbolic-coordinate-strings from the profile
 * payload and seed one awaiting row per string. Parsing is deferred to the
 * bridge round-trip, so `parsed` always starts null here.
 */
export function buildSymbolicQuestionRows(
    profile: MathemeHarmonicProfileBoundary | null
): readonly M0SymbolicQuestionRow[] {
    const raw = profile?.payload.m0_verifier_questions;
    if (!Array.isArray(raw)) {
        return Object.freeze([] as M0SymbolicQuestionRow[]);
    }
    const rows = raw
        .filter((value): value is string => typeof value === 'string')
        .map(coordinateString =>
            Object.freeze({
                raw: coordinateString,
                parsed: null,
                responseStatus: 'awaiting' as M0SymbolicResponseStatus,
                responseText: null,
                state: 'review_pending' as M0ProvenanceState
            })
        );
    return Object.freeze(rows);
}

/**
 * Dispatch a free-text answer for one symbolic-coordinate question. The exact
 * envelope is fixed by the spec: top-level `invokeGatewayRpc` capability with
 * the `s0'.verifier.respond_question` gateway method nested in `params`.
 */
export function dispatchSymbolicResponse(
    bridge: M0SymbolicConsoleBridge,
    options: {
        readonly row: M0SymbolicQuestionRow;
        readonly draft: string;
        readonly profileGeneration: number | null;
    }
): Promise<unknown> {
    return bridge.invokeCapability({
        method: 'invokeGatewayRpc',
        sessionKey: M0_SYMBOLIC_SESSION_KEY,
        params: {
            gatewayMethod: M0_SYMBOLIC_RESPOND_METHOD,
            coordinateString: options.row.raw,
            responseText: options.draft,
            sourceExtensionId: M0_SYMBOLIC_SOURCE_EXTENSION_ID
        },
        profileGeneration: options.profileGeneration,
        provenanceHandles: [],
        vak: null
    });
}

/**
 * Apply a bridge response payload to a row. Parse summaries and reverification
 * verdicts arrive here from Track 5.21 — never computed locally. An unparseable
 * or absent payload leaves the row marked `responded` with its prior parse.
 */
export function applySymbolicBridgeResponse(
    row: M0SymbolicQuestionRow,
    payload: unknown
): M0SymbolicQuestionRow {
    const parsed = readParseFromPayload(payload) ?? row.parsed;
    const reverified = readReverifiedFlag(payload);
    return Object.freeze({
        ...row,
        parsed,
        responseStatus: reverified ? 'reverified' : 'responded'
    });
}

function readParseFromPayload(payload: unknown): M0SymbolicCoordinateParse | null {
    if (!payload || typeof payload !== 'object') {
        return null;
    }
    const record = payload as Record<string, unknown>;
    const candidate = (record.parse ?? record.parsed) as Record<string, unknown> | undefined;
    if (!candidate || typeof candidate !== 'object') {
        return null;
    }
    const namespace = candidate.namespace;
    if (namespace !== 'R' && namespace !== 'L' && namespace !== 'M' && namespace !== 'C') {
        return null;
    }
    const coordinate = Array.isArray(candidate.coordinate)
        ? candidate.coordinate.filter((value): value is string => typeof value === 'string')
        : [];
    const archetypeIndex =
        typeof candidate.archetypeIndex === 'number' ? candidate.archetypeIndex : null;
    const stateMarker = readStateMarker(candidate.stateMarker);
    return Object.freeze({
        namespace,
        coordinate: Object.freeze(coordinate),
        archetypeIndex,
        stateMarker
    });
}

function readStateMarker(value: unknown): M0SymbolicStateMarker | null {
    switch (value) {
        case 'pending':
        case 'unwitnessed':
        case 'drift':
        case 'incoherent':
        case 'violated':
            return value;
        default:
            return null;
    }
}

function readReverifiedFlag(payload: unknown): boolean {
    if (!payload || typeof payload !== 'object') {
        return false;
    }
    return (payload as Record<string, unknown>).reverified === true;
}

function describeCoordinate(parse: M0SymbolicCoordinateParse): string {
    return parse.coordinate.length ? parse.coordinate.join('/') : '—';
}

function describeArchetype(parse: M0SymbolicCoordinateParse): string {
    return parse.archetypeIndex === null ? 'T—' : `T${parse.archetypeIndex}`;
}

export interface SymbolicCoordinateQuestionConsoleProps {
    readonly profile: MathemeHarmonicProfileBoundary | null;
    readonly bridge: M0SymbolicConsoleBridge | null;
    /** Optional row override; defaults to rows derived from the profile payload. */
    readonly rows?: readonly M0SymbolicQuestionRow[];
}

interface SymbolicRowViewProps {
    readonly row: M0SymbolicQuestionRow;
    readonly index: number;
    readonly draft: string;
    readonly disabled: boolean;
    readonly onDraftChange: (index: number, draft: string) => void;
    readonly onSubmit: (index: number) => void;
}

function SymbolicRowView(props: SymbolicRowViewProps): React.ReactElement {
    const { row, index, draft, disabled } = props;
    const parsed = row.parsed;
    return (
        <li
            className="m0-symbolic-question-row"
            data-symbolic-row-index={index}
            data-response-status={row.responseStatus}
            data-provenance-state={row.state}
            style={rowStyle}
        >
            <code className="m0-symbolic-raw" data-test="m0-symbolic-raw" style={rawStyle}>
                {row.raw}
            </code>
            <div
                className="m0-symbolic-parse-summary"
                data-test="m0-symbolic-parse-summary"
                data-namespace={parsed?.namespace ?? ''}
                data-archetype-index={parsed?.archetypeIndex ?? ''}
                data-state-marker={parsed?.stateMarker ?? ''}
                style={summaryStyle}
            >
                {parsed ? (
                    <>
                        <span data-symbolic-field="namespace">{parsed.namespace}</span>
                        <span data-symbolic-field="coordinate">{describeCoordinate(parsed)}</span>
                        <span data-symbolic-field="archetype">{describeArchetype(parsed)}</span>
                        <span data-symbolic-field="state-marker">
                            {parsed.stateMarker ?? 'unmarked'}
                        </span>
                    </>
                ) : (
                    <span data-symbolic-field="unparsed">Awaiting bridge parse</span>
                )}
            </div>
            <textarea
                className="m0-symbolic-response-box"
                aria-label={`Response to ${row.raw}`}
                value={draft}
                disabled={disabled}
                onChange={event => props.onDraftChange(index, event.target.value)}
                style={responseBoxStyle}
            />
            <div className="m0-symbolic-row-footer" style={footerStyle}>
                <span
                    className="m0-symbolic-status-pill"
                    data-test="m0-symbolic-status-pill"
                    data-response-status={row.responseStatus}
                    style={pillStyle}
                >
                    {row.responseStatus}
                </span>
                <button
                    type="button"
                    className="m0-symbolic-submit"
                    disabled={disabled || draft.trim().length === 0}
                    onClick={() => props.onSubmit(index)}
                    style={submitStyle}
                >
                    Submit
                </button>
            </div>
        </li>
    );
}

export const SymbolicCoordinateQuestionConsole: React.FC<SymbolicCoordinateQuestionConsoleProps> = ({
    profile,
    bridge,
    rows
}) => {
    const profileSeedKey = `${profile?.generation ?? 'none'}:${profile?.pointerAnchor ?? 'none'}`;
    const derivedRows = React.useMemo(
        () => rows ?? buildSymbolicQuestionRows(profile),
        // rows is an explicit override; otherwise re-derive on profile identity change.
        [rows, profileSeedKey]
    );
    const [rowState, setRowState] = React.useState<readonly M0SymbolicQuestionRow[]>(derivedRows);
    const [drafts, setDrafts] = React.useState<readonly string[]>(() =>
        derivedRows.map(row => row.responseText ?? '')
    );

    React.useEffect(() => {
        setRowState(derivedRows);
        setDrafts(derivedRows.map(row => row.responseText ?? ''));
    }, [derivedRows]);

    const updateRow = React.useCallback(
        (index: number, next: M0SymbolicQuestionRow) => {
            setRowState(current => current.map((row, i) => (i === index ? next : row)));
        },
        []
    );

    const handleDraftChange = React.useCallback((index: number, value: string) => {
        setDrafts(current => current.map((draft, i) => (i === index ? value : draft)));
    }, []);

    const handleSubmit = React.useCallback(
        (index: number) => {
            const row = rowState[index];
            const draft = drafts[index] ?? '';
            if (!bridge || !row || draft.trim().length === 0) {
                return;
            }
            updateRow(index, Object.freeze({ ...row, responseStatus: 'responded', responseText: draft }));
            dispatchSymbolicResponse(bridge, {
                row,
                draft,
                profileGeneration: profile?.generation ?? null
            })
                .then(payload => updateRow(index, applySymbolicBridgeResponse({ ...row, responseText: draft }, payload)))
                .catch(() => {
                    // Bridge failure leaves the row marked responded for retry; the
                    // gateway owns the authoritative verdict.
                });
        },
        [bridge, drafts, profile, rowState, updateRow]
    );

    return (
        <section
            className="m0-symbolic-coordinate-question-console"
            data-widget-id="pratibimba.m0-anuttara:symbolic-coordinate-question-console"
            data-question-count={rowState.length}
            aria-label="Symbolic-coordinate question console"
            style={panelStyle}
        >
            <header style={headerStyle}>
                <div>
                    <h3 style={titleStyle}>Symbolic-coordinate question console</h3>
                    <p style={subtitleStyle}>Verifier-emitted coordinate questions</p>
                </div>
                <output
                    aria-label="Open question count"
                    data-test="m0-symbolic-question-count"
                    style={countStyle}
                >
                    {rowState.length}
                </output>
            </header>
            {rowState.length === 0 ? (
                <p className="mext-widget-empty" style={emptyStyle}>
                    No Verifier symbolic-coordinate questions on this profile generation.
                </p>
            ) : (
                <ol className="m0-symbolic-question-list" style={listStyle}>
                    {rowState.map((row, index) => (
                        <SymbolicRowView
                            key={`${index}:${row.raw}`}
                            row={row}
                            index={index}
                            draft={drafts[index] ?? ''}
                            disabled={!bridge}
                            onDraftChange={handleDraftChange}
                            onSubmit={handleSubmit}
                        />
                    ))}
                </ol>
            )}
        </section>
    );
};

const panelStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    color: 'var(--theia-foreground)'
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
};

const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 'var(--theia-ui-font-size1)',
    fontWeight: 600
};

const subtitleStyle: React.CSSProperties = {
    margin: '2px 0 0',
    color: 'var(--theia-descriptionForeground)',
    fontSize: 'var(--theia-ui-font-size0)'
};

const countStyle: React.CSSProperties = {
    minWidth: 32,
    textAlign: 'center',
    padding: '3px 6px',
    border: '1px solid var(--theia-input-border)',
    borderRadius: 3,
    fontVariantNumeric: 'tabular-nums'
};

const emptyStyle: React.CSSProperties = {
    color: 'var(--theia-descriptionForeground)',
    fontStyle: 'italic'
};

const listStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    listStyle: 'none',
    margin: 0,
    padding: 0,
    maxHeight: 420,
    overflowY: 'auto'
};

const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    border: '1px solid var(--theia-input-border)',
    borderRadius: 4,
    padding: 8
};

const rawStyle: React.CSSProperties = {
    fontFamily: 'var(--theia-ui-font-family-monospace, monospace)',
    overflowWrap: 'anywhere'
};

const summaryStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    fontSize: 'var(--theia-ui-font-size0)',
    color: 'var(--theia-descriptionForeground)'
};

const responseBoxStyle: React.CSSProperties = {
    minHeight: 56,
    resize: 'vertical',
    font: 'inherit',
    color: 'var(--theia-input-foreground)',
    background: 'var(--theia-input-background)',
    border: '1px solid var(--theia-input-border)',
    borderRadius: 3,
    padding: 6
};

const footerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
};

const pillStyle: React.CSSProperties = {
    padding: '2px 8px',
    borderRadius: 999,
    border: '1px solid var(--theia-input-border)',
    fontSize: 'var(--theia-ui-font-size0)',
    textTransform: 'uppercase'
};

const submitStyle: React.CSSProperties = {
    padding: '3px 10px',
    border: '1px solid var(--theia-button-border, transparent)',
    borderRadius: 3,
    background: 'var(--theia-button-background)',
    color: 'var(--theia-button-foreground)',
    font: 'inherit',
    cursor: 'pointer'
};

export default SymbolicCoordinateQuestionConsole;
