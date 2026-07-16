/**
 * Coordinate: M' M1' (vortex matrices browser — Track 22.T22.8 per DR-FACE-7)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the `m1.paramasiva.vortexMatricesBrowser` view body — the 2D
 *   selector that pairs with the played-torus 3D perspex cross-fade. Six-family
 *   tab strip (bimba / pratibimba / sum / diff-a / diff-b / quintessence) with the
 *   active tab following the profile-tick-driven `activeMatrixOp`; a user tab
 *   click PINS a family (view-local selection, small pin marker). A 12×12 cell
 *   grid (rows = tick12, cols = positionP incl. shadow 10-11) lights the vortex's
 *   `activeCell` with its real values and highlights the profile cell
 *   (tick12, position6) with the Cl(4,2) signature halo. A face-mode toggle
 *   (digit-root / raw) switches which face of the active cell the detail panel
 *   reads. Only the active cell rides the bus, so only it is populated — the rest
 *   of the grid is honestly empty, never back-filled from a local substrate LUT.
 * Does NOT own: the vortex genesis (portal-core ananda_vortex.rs), any
 *   ANANDA_BIMBA / DR_RING fork (the cell values are kernel writes read verbatim),
 *   the played-torus visual (15.4 mount-point), the palette (ui/primitives.tsx).
 */

import { useState } from 'react';
import { useM1FaceState, cl42SignatureColour } from './m1DeepFaceData';

/** The six AnandaMatrixOp families in serde order (kebab-case on the wire). */
const MATRIX_FAMILIES = [
    { op: 'bimba', label: 'Bimba' },
    { op: 'pratibimba', label: 'Pratibimba' },
    { op: 'sum', label: 'Sum' },
    { op: 'diff-a', label: 'DiffA' },
    { op: 'diff-b', label: 'DiffB' },
    { op: 'quintessence', label: 'Quintessence' }
] as const;

const GRID_ROWS = 12; // tick12
const GRID_COLS = 12; // positionP 0-9 + shadow 10-11

type FaceMode = 'digit-root' | 'raw';

export function M1VortexMatricesBrowser() {
    const face = useM1FaceState();
    const [pinned, setPinned] = useState<string | null>(null);
    const [faceMode, setFaceMode] = useState<FaceMode>('digit-root');

    const vortex = face.vortex;
    const activeOp = vortex?.activeMatrixOp ?? null;
    // The displayed family follows the profile-tick op unless the user pinned one.
    const displayedOp = pinned ?? activeOp;

    if (!vortex) {
        return (
            <section className="mext-widget-detail" data-testid="m1-vortex-browser">
                <h3>Vortex matrices browser</h3>
                <p className="mext-widget-empty" data-testid="m1-vortex-browser-pending">
                    pending-ananda-vortex — the matrix families and the active cell populate
                    when the kernel bridge delivers a MathemeHarmonicProfile carrying the vortex.
                </p>
            </section>
        );
    }

    const cell = vortex.activeCellValue;
    const [activeRowK, activePositionP] = vortex.activeCell;
    const haloColour = cl42SignatureColour(vortex.cl42SignatureAtPosition);
    // The detail panel reads the chosen face of the active cell (verbatim).
    const showRaw = faceMode === 'raw';

    return (
        <section className="mext-widget-detail" data-testid="m1-vortex-browser">
            <h3>Vortex matrices browser</h3>
            <div className="pane-toolbar" data-testid="m1-vortex-facemode">
                <button
                    type="button"
                    className="vault-node"
                    data-testid="m1-vortex-facemode-dr"
                    data-active={faceMode === 'digit-root' ? 'true' : 'false'}
                    onClick={() => setFaceMode('digit-root')}
                >
                    Digit-root face
                </button>
                <button
                    type="button"
                    className="vault-node"
                    data-testid="m1-vortex-facemode-raw"
                    data-active={faceMode === 'raw' ? 'true' : 'false'}
                    onClick={() => setFaceMode('raw')}
                >
                    Raw / no-DR face
                </button>
            </div>
            <div className="spanda-stops" data-testid="m1-vortex-tabs" role="tablist">
                {MATRIX_FAMILIES.map(family => {
                    const isActive = family.op === activeOp;
                    const isDisplayed = family.op === displayedOp;
                    const isPinned = family.op === pinned;
                    return (
                        <button
                            type="button"
                            key={family.op}
                            role="tab"
                            data-testid={`m1-vortex-tab-${family.op}`}
                            data-active={isActive ? 'true' : 'false'}
                            data-displayed={isDisplayed ? 'true' : 'false'}
                            data-pinned={isPinned ? 'true' : 'false'}
                            aria-selected={isDisplayed}
                            title={
                                isActive
                                    ? `${family.label} — profile-active family`
                                    : `pin ${family.label}`
                            }
                            onClick={() => setPinned(prev => (prev === family.op ? null : family.op))}
                        >
                            {family.label}
                            {isActive ? ' ●' : ''}
                            {isPinned ? ' 📌' : ''}
                        </button>
                    );
                })}
            </div>
            <div
                className="pane-toolbar"
                data-testid="m1-vortex-displayed"
                data-displayed-op={displayedOp ?? ''}
                data-active-op={activeOp ?? ''}
                data-pinned={pinned ?? ''}
            >
                showing {displayedOp ?? 'pending'} · profile-active {activeOp ?? 'pending'}
                {pinned ? ' · pinned (user-selection)' : ' · auto-following'}
            </div>
            {pinned && pinned !== activeOp ? (
                <p className="mext-widget-empty" data-testid="m1-vortex-pinned-no-cell">
                    no live cell for the pinned family — the bus carries only the active family's
                    cell; the pinned tab holds the selection until a flip crosses to it.
                </p>
            ) : null}
            {/* 12×12 grid: only the vortex activeCell is populated (bus truth);
                the profile cell (tick12, position6) carries the Cl(4,2) halo. */}
            <div
                className="m1-vortex-grid"
                data-testid="m1-vortex-grid"
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                    gap: '1px'
                }}
            >
                {Array.from({ length: GRID_ROWS * GRID_COLS }, (_, index) => {
                    const rowK = Math.floor(index / GRID_COLS);
                    const positionP = index % GRID_COLS;
                    const isActiveCell = rowK === activeRowK && positionP === activePositionP;
                    const isProfileCell = rowK === face.tick12 && positionP === face.position6;
                    const value = isActiveCell
                        ? showRaw
                            ? cell.rawValue ?? cell.rawSum
                            : cell.drValue ?? cell.drSum
                        : null;
                    return (
                        <span
                            key={index}
                            className="m1-vortex-cell"
                            data-testid={`m1-vortex-cell-${rowK}-${positionP}`}
                            data-active-cell={isActiveCell ? 'true' : 'false'}
                            data-profile-cell={isProfileCell ? 'true' : 'false'}
                            data-shadow={positionP >= 10 ? 'true' : 'false'}
                            style={
                                isProfileCell
                                    ? { outline: `2px solid ${haloColour}` }
                                    : undefined
                            }
                            title={`row ${rowK} · position ${positionP}`}
                        >
                            {value ?? ''}
                        </span>
                    );
                })}
            </div>
            {/* The active-cell detail — raw and DR faces read verbatim off the bus. */}
            <dl className="m1-vortex-cell-detail" data-testid="m1-vortex-cell-detail">
                <dt>active cell</dt>
                <dd data-testid="m1-vortex-cell-addr">
                    {cell.family} · row {activeRowK} · position {activePositionP}
                </dd>
                <dt>face-mode</dt>
                <dd data-testid="m1-vortex-cell-facemode">{faceMode}</dd>
                <dt>raw face (bimba / pratibimba / sum / delta)</dt>
                <dd data-testid="m1-vortex-cell-raw">
                    {cell.rawBimba} / {cell.rawPratibimba} / {cell.rawSum} / {cell.rawDelta}
                </dd>
                <dt>digit-root face (bimba / pratibimba / sum)</dt>
                <dd data-testid="m1-vortex-cell-dr">
                    {cell.drBimba} / {cell.drPratibimba} / {cell.drSum}
                </dd>
                {cell.ruleValue !== null ? (
                    <>
                        <dt>rule (quintessence)</dt>
                        <dd data-testid="m1-vortex-cell-rule">{cell.ruleValue}</dd>
                    </>
                ) : null}
            </dl>
        </section>
    );
}
