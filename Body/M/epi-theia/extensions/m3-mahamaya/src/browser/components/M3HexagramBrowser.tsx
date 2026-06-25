import * as React from 'react';
import type { M3ProjectionSurface } from '../../common';
import { useM3ProfileTick } from '../context/M3ProfileTickContext';
import { useM3Readiness } from '../context/M3ReadinessContext';
import { ReadinessChip } from './ReadinessChip';

// M3 Mahāmāyā — 64-hexagram King Wen browser.
//
// Renders the full I-Ching field as an 8×8 grid in King Wen ordering. Each
// hexagram is six horizontal lines (yang = solid bar, yin = broken bar) drawn
// top line down to bottom line, with the traditional bottom-first line numbering
// (line 1 is the bottom line). The hexagram matching the active projection is
// rendered luminous.
//
// The line grid IS the 384-graph: 64 hexagrams × 6 lines = 384 line-change
// transitions. Clicking a single line toggles its polarity (yang↔yin),
// producing a derived hexagram, and reports the transition through onLineChange.
// Clicking a cell's body (not a line) selects that hexagram.

export const M3_HEXAGRAM_BROWSER_WIDGET_ID = 'pratibimba.m3-mahamaya:hexagram-browser';
export const M3_HEXAGRAM_LINE_CHANGE_RPC = 's3.world_clock.hexagram.line_change';
export const M3_HEXAGRAM_COUNT = 64;
export const M3_HEXAGRAM_LINES = 6;
/** 64 hexagrams × 6 lines — the canonical 384 line-change transition graph. */
export const M3_LINE_CHANGE_GRAPH_SIZE = M3_HEXAGRAM_COUNT * M3_HEXAGRAM_LINES;
export const M3_HEXAGRAM_GRID_COLUMNS = 8;

export type M3LinePolarity = 'yang' | 'yin';

export interface M3LineChange {
    /** Source hexagram, King Wen 1..64. */
    readonly hexagramId: number;
    /** Toggled line position, 1..6 counted from the bottom (traditional). */
    readonly linePosition: number;
    readonly fromLine: M3LinePolarity;
    readonly toLine: M3LinePolarity;
    /** Hexagram after toggling the line, King Wen 1..64. */
    readonly derivedHexagramId: number;
}

export interface M3HexagramBrowserProps {
    readonly surface: M3ProjectionSurface;
    /** Active/luminous hexagram (King Wen 1..64). Falls back to the projection. */
    readonly activeHexagramId?: number | null;
    readonly onSelectHexagram?: (hexagramId: number) => void;
    readonly onLineChange?: (change: M3LineChange) => void;
}

// ============================================================================
// King Wen lookup — each entry is the six lines bottom→top (index 0 = line 1,
// the bottom line). '1' = yang (solid), '0' = yin (broken). Index = id - 1.
// ============================================================================
const KING_WEN_LINES: readonly string[] = Object.freeze([
    '111111', '000000', '100010', '010001', '111010', '010111', '010000', '000010',
    '111011', '110111', '111000', '000111', '101111', '111101', '001000', '000100',
    '100110', '011001', '110000', '000011', '100101', '101001', '000001', '100000',
    '100111', '111001', '100001', '011110', '010010', '101101', '001110', '011100',
    '001111', '111100', '000101', '101000', '101011', '110101', '001010', '010100',
    '110001', '100011', '111110', '011111', '000110', '011000', '010110', '011010',
    '101110', '011101', '100100', '001001', '001011', '110100', '101100', '001101',
    '011011', '110110', '010011', '110010', '110011', '001100', '101010', '010101'
]);

const KING_WEN_BY_LINES: ReadonlyMap<string, number> = new Map(
    KING_WEN_LINES.map((lines, index) => [lines, index + 1])
);

export const M3HexagramBrowser: React.FC<M3HexagramBrowserProps> = ({
    surface,
    activeHexagramId,
    onSelectHexagram,
    onLineChange
}) => {
    const profileTick = useM3ProfileTick();
    const inheritedReadiness = useM3Readiness();

    const activeId = React.useMemo(
        () => boundedHexagramId(
            activeHexagramId ?? numberValue(surface.activeProjection.hexagramId)
        ),
        [activeHexagramId, surface.activeProjection.hexagramId]
    );

    const hexagrams = React.useMemo(
        () => Array.from({ length: M3_HEXAGRAM_COUNT }, (_, index) => index + 1),
        []
    );

    return (
        <article
            className="m3-hexagram-browser"
            data-widget-id={M3_HEXAGRAM_BROWSER_WIDGET_ID}
            data-rpc-method={M3_HEXAGRAM_LINE_CHANGE_RPC}
            data-hexagram-count={M3_HEXAGRAM_COUNT}
            data-line-change-graph-size={M3_LINE_CHANGE_GRAPH_SIZE}
            data-active-hexagram-id={activeId ?? 'pending'}
            data-profile-generation={surface.profileGeneration}
            data-profile-tick={profileTick.tick ?? 'pending'}
            data-context-readiness={inheritedReadiness.snapshot.state}
            style={rootStyle}
        >
            <header style={headerStyle}>
                <div>
                    <h3 style={titleStyle}>Hexagram browser (8×8 · King Wen)</h3>
                    <p style={subtitleStyle}>
                        64 hexagrams × 6 lines = {M3_LINE_CHANGE_GRAPH_SIZE} line-change
                        transitions. Click a line to toggle yang↔yin into the derived hexagram.
                    </p>
                </div>
                <ReadinessChip
                    bindingKey="surface.activeProjection.hexagramId"
                    state={activeId === null ? 'pending' : 'ready'}
                    style={chipStyle}
                >
                    {activeId === null ? 'no active hexagram' : `#${activeId}`}
                </ReadinessChip>
            </header>

            <div
                role="grid"
                aria-label="64 hexagrams in King Wen order"
                style={{
                    ...gridStyle,
                    gridTemplateColumns: `repeat(${M3_HEXAGRAM_GRID_COLUMNS}, 1fr)`
                }}
            >
                {hexagrams.map(id => (
                    <HexagramCell
                        key={id}
                        id={id}
                        active={id === activeId}
                        onSelectHexagram={onSelectHexagram}
                        onLineChange={onLineChange}
                    />
                ))}
            </div>
        </article>
    );
};

export default M3HexagramBrowser;

const HexagramCell: React.FC<{
    readonly id: number;
    readonly active: boolean;
    readonly onSelectHexagram: M3HexagramBrowserProps['onSelectHexagram'];
    readonly onLineChange: M3HexagramBrowserProps['onLineChange'];
}> = ({ id, active, onSelectHexagram, onLineChange }) => {
    const lines = KING_WEN_LINES[id - 1];
    const glyph = hexagramGlyph(id);

    const dispatchLineChange = React.useCallback(
        (linePosition: number) => {
            if (!onLineChange) {
                return;
            }
            const change = lineChangeFor(id, linePosition);
            if (change) {
                onLineChange(change);
            }
        },
        [id, onLineChange]
    );

    // Render top line (position 6) down to the bottom line (position 1).
    const linePositions = [6, 5, 4, 3, 2, 1];

    return (
        <section
            role="gridcell"
            className="m3-hexagram-browser-cell"
            data-test="m3-hexagram-browser-cell"
            data-hexagram-id={id}
            data-hexagram-lines={lines}
            data-active={active ? 'true' : 'false'}
            style={active ? activeCellStyle : cellStyle}
        >
            <button
                type="button"
                aria-label={`Select hexagram ${id}`}
                aria-pressed={active}
                data-hexagram-select={id}
                onClick={onSelectHexagram ? () => onSelectHexagram(id) : undefined}
                style={cellHeaderStyle}
            >
                <span style={glyphStyle} aria-hidden="true">{glyph ?? '—'}</span>
                <span style={cellIdStyle}>{id}</span>
            </button>

            <div
                role="group"
                aria-label={`Hexagram ${id} lines`}
                style={linesStackStyle}
            >
                {linePositions.map(position => {
                    const polarity = lineAt(lines, position);
                    return (
                        <button
                            key={position}
                            type="button"
                            aria-label={
                                `Toggle hexagram ${id} line ${position} (${polarity})`
                            }
                            data-line-position={position}
                            data-line-polarity={polarity}
                            data-rpc-method={M3_HEXAGRAM_LINE_CHANGE_RPC}
                            onClick={
                                onLineChange ? () => dispatchLineChange(position) : undefined
                            }
                            style={lineButtonStyle}
                            title={`Line ${position}: ${polarity} → toggle`}
                        >
                            {polarity === 'yang' ? (
                                <span style={yangLineStyle} aria-hidden="true" />
                            ) : (
                                <span style={yinLineStyle} aria-hidden="true">
                                    <span style={yinSegmentStyle} />
                                    <span style={yinSegmentStyle} />
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </section>
    );
};

// ============================================================================
// Domain helpers
// ============================================================================

/** Polarity of a King Wen line, position counted 1..6 from the bottom. */
function lineAt(lines: string, position: number): M3LinePolarity {
    return lines.charAt(position - 1) === '1' ? 'yang' : 'yin';
}

/** Build the line-change transition for toggling one line of a hexagram. */
function lineChangeFor(hexagramId: number, linePosition: number): M3LineChange | null {
    const lines = KING_WEN_LINES[hexagramId - 1];
    if (!lines || linePosition < 1 || linePosition > M3_HEXAGRAM_LINES) {
        return null;
    }
    const index = linePosition - 1;
    const fromBit = lines.charAt(index);
    const toBit = fromBit === '1' ? '0' : '1';
    const toggled = lines.slice(0, index) + toBit + lines.slice(index + 1);
    const derivedHexagramId = KING_WEN_BY_LINES.get(toggled);
    if (!derivedHexagramId) {
        return null;
    }
    return Object.freeze({
        hexagramId,
        linePosition,
        fromLine: fromBit === '1' ? 'yang' : 'yin',
        toLine: toBit === '1' ? 'yang' : 'yin',
        derivedHexagramId
    });
}

function boundedHexagramId(value: number | null): number | null {
    if (value === null || !Number.isFinite(value)) {
        return null;
    }
    const id = Math.floor(value);
    return id >= 1 && id <= M3_HEXAGRAM_COUNT ? id : null;
}

// Unicode Yijing Hexagram Symbols block runs in King Wen order from U+4DC0.
function hexagramGlyph(id: number): string | null {
    if (id < 1 || id > M3_HEXAGRAM_COUNT) {
        return null;
    }
    return String.fromCodePoint(0x4dc0 + id - 1);
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

// ============================================================================
// Styles
// ============================================================================

const rootStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 8,
    padding: 12,
    background: 'var(--theia-editorWidget-background)',
    color: 'var(--theia-foreground)',
    minWidth: 320
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10
};

const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 'var(--theia-ui-font-size2)',
    fontWeight: 600
};

const subtitleStyle: React.CSSProperties = {
    margin: '4px 0 0',
    color: 'var(--theia-descriptionForeground)',
    fontSize: 'var(--theia-ui-font-size1)'
};

const chipStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 999,
    padding: '2px 8px',
    fontSize: 'var(--theia-ui-font-size0)',
    whiteSpace: 'nowrap'
};

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gap: 4
};

const cellStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 6,
    padding: 6,
    background: 'var(--theia-editor-background)',
    minWidth: 0
};

const activeCellStyle: React.CSSProperties = {
    ...cellStyle,
    borderColor: 'var(--theia-focusBorder)',
    background: 'var(--theia-editorWidget-background)',
    boxShadow: '0 0 0 1px var(--theia-focusBorder) inset, 0 0 8px var(--theia-focusBorder)'
};

const cellHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    border: 'none',
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    padding: 0
};

const glyphStyle: React.CSSProperties = {
    fontSize: 'var(--theia-ui-font-size3, 16px)',
    lineHeight: 1
};

const cellIdStyle: React.CSSProperties = {
    color: 'var(--theia-descriptionForeground)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 'var(--theia-ui-font-size0)'
};

const linesStackStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 2
};

const lineButtonStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: '1px 0'
};

const yangLineStyle: React.CSSProperties = {
    display: 'block',
    height: 3,
    width: '100%',
    borderRadius: 1,
    background: 'currentColor'
};

const yinLineStyle: React.CSSProperties = {
    display: 'flex',
    height: 3,
    width: '100%',
    gap: '22%'
};

const yinSegmentStyle: React.CSSProperties = {
    flex: 1,
    height: 3,
    borderRadius: 1,
    background: 'currentColor'
};
