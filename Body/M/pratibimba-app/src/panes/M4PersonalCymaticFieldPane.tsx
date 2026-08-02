/**
 * Coordinate: M' M4-5' (personal cymatic field widget — Track 25.T25.6)
 * Actualises: the `m4.nara.personalField` view body (DR-WC-M4-2: ONE React
 *   component, standalone-capable and composed into the 4-5-0 personal
 *   center slot) — mounts the OPAQUE renderer handle from `nara.field.handle`
 *   and draws the DR-IG-6 scene: all 12 P/P' dipyramid vertices from the
 *   carrier fixture plus two Hopf-linked tori winding the apex axis. The
 *   25.17 time-axis mode propagates as `foregroundedHandle` on every call.
 *   DR-M4-3: the widget never reads renderer state and no `q_*` body field
 *   crosses — the handle is mounted, not decoded.
 */

import { useEffect, useRef, useState } from 'react';
import './m4PersonalCymaticField.css';
import { gateway, gatewayReady } from '../bridge/gatewayHolder';
import { PERSONAL_COMPOSITION_ID, TIME_AXIS_HANDLE, currentTimeAxisMode } from '../composition/timeAxis';
import { useOptionalCompositionState } from '../composition/compositionState';
import { useTickStore } from '../state/stores';
import { privacyChrome } from '../ui/privacyChrome';
import { accent as accentToken, inkBright, inkDim as inkDimToken, ringLit } from '../ui/tokens';
import {
    FIELD_HANDLE_METHOD,
    buildCymaticScene,
    parseFieldHandle,
    projectVertex,
    type FieldHandleRead
} from './m4PersonalCymaticField';

type FieldState =
    | { readonly kind: 'pending'; readonly reason: string }
    | { readonly kind: 'refused'; readonly reason: string }
    | { readonly kind: 'read'; readonly read: Extract<FieldHandleRead, { kind: 'read' }> };

function artifactOf(receipt: unknown): unknown {
    if (receipt && typeof receipt === 'object' && 'artifact' in (receipt as object)) {
        return (receipt as { artifact?: unknown }).artifact;
    }
    return receipt;
}

const CANVAS_W = 340;
const CANVAS_H = 300;
const SCALE = 92;

export function M4PersonalCymaticField() {
    const cached = useTickStore(state => state.profile);
    const compositionState = useOptionalCompositionState();
    const mode = currentTimeAxisMode(compositionState?.stateById[PERSONAL_COMPOSITION_ID]);
    const foregrounded = TIME_AXIS_HANDLE[mode];
    const [field, setField] = useState<FieldState>({
        kind: 'pending',
        reason: 'awaiting the renderer handle'
    });
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Whole-tick12 key: the handle digest can only change when the kernel
    // phase does, and a per-generation dep would refire (and supersede) the
    // in-flight call every second — the 25.7 cancel-livelock, avoided here
    // the same way. Latest-wins; a superseded reply is one phase stale.
    const generation = cached?.generation ?? null;
    const tickKey = generation === null ? null : Math.floor(generation / 5);

    useEffect(() => {
        let superseded = false;
        if (!gatewayReady()) {
            setField({ kind: 'pending', reason: `${FIELD_HANDLE_METHOD}: gateway not connected` });
            return;
        }
        gateway()
            .invoke(FIELD_HANDLE_METHOD, {
                sessionKey: 'agent:main:main',
                foregroundedHandle: foregrounded
            })
            .then(receipt => {
                if (superseded) {
                    return;
                }
                const read = parseFieldHandle(artifactOf(receipt));
                setField(
                    read.kind === 'read'
                        ? { kind: 'read', read }
                        : { kind: 'refused', reason: read.reason }
                );
            })
            .catch((error: unknown) => {
                if (!superseded) {
                    setField({
                        kind: 'pending',
                        reason: error instanceof Error ? error.message : String(error)
                    });
                }
            });
        return () => {
            superseded = true;
        };
    }, [foregrounded, tickKey]);

    const scene = field.kind === 'read' ? buildCymaticScene(field.read.handle) : null;

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (!canvas || !context || !scene) {
            return;
        }
        // Canvas cannot consume CSS custom properties directly; the JS-side
        // token module is the sanctioned source for canvas consumers (Track 30).
        const styles = getComputedStyle(canvas);
        const ink = styles.getPropertyValue('--ink').trim() || inkBright;
        const inkDim = styles.getPropertyValue('--ink-dim').trim() || inkDimToken;
        const accent = styles.getPropertyValue('--accent').trim() || accentToken;
        const ring = styles.getPropertyValue('--ring').trim() || ringLit;
        const cx = CANVAS_W / 2;
        const cy = CANVAS_H / 2;
        context.clearRect(0, 0, CANVAS_W, CANVAS_H);
        for (const torus of scene.tori) {
            context.beginPath();
            torus.points.forEach(([x, y], index) => {
                const px = cx + x * SCALE;
                const py = cy + y * SCALE;
                if (index === 0) context.moveTo(px, py);
                else context.lineTo(px, py);
            });
            context.strokeStyle = torus.id === 'day' ? ring : accent;
            context.lineWidth = 1.1;
            context.stroke();
        }
        for (const node of scene.nodes) {
            const [x, y] = projectVertex(node.position);
            const px = cx + x * SCALE;
            const py = cy + y * SCALE;
            context.beginPath();
            context.arc(px, py, node.role === 'apex' ? 5 : node.role === 'axis-point' ? 2.5 : 3.5, 0, Math.PI * 2);
            context.fillStyle = node.series === 'P' ? ink : inkDim;
            context.fill();
        }
    }, [scene]);

    const chrome = privacyChrome('protected_local_handle_only');
    return (
        <div
            className={`m4-personal-cymatic-field ${chrome.className}`}
            title={chrome.title}
            data-testid="m4-personal-cymatic-field"
            data-view-id="m4.nara.personalField"
            data-state={field.kind}
            data-foregrounded={foregrounded}
            data-renderer-handle={field.kind === 'read' ? field.read.handle.rendererHandle : ''}
            data-node-count={scene?.nodes.length ?? 0}
            data-tori-count={scene?.tori.length ?? 0}
            data-phase={scene?.phase ?? ''}
        >
            {field.kind === 'read' && scene ? (
                <canvas
                    ref={canvasRef}
                    width={CANVAS_W}
                    height={CANVAS_H}
                    data-testid="m4-cymatic-canvas"
                    aria-label="DR-IG-6 personal cymatic field: 12-vertex dipyramid with two Hopf-linked tori"
                />
            ) : (
                <div className="pane-message" data-testid="m4-cymatic-pending">
                    {field.kind === 'read' ? 'preparing the field' : `${field.kind === 'refused' ? 'field refused: ' : ''}${field.reason}`}
                </div>
            )}
        </div>
    );
}
