/**
 * Coordinate: M' M2' (cymatic surface, Phase-2 opener)
 * Actualises: the canonical M2' Chladni seed field rendered from the profile's
 *   nodal_quartet boundaries + audio_octet drivers, with a 72-cell plate grid.
 *   Redraws ONLY on generation advance — the kernel tick is the clock.
 * Position (#n): M2' cymatic surface renderer.
 * Public surface: CymaticField.
 * Does NOT own: profile retention, transport controls, audio output, or the
 *   kernel's octet/quartet/address law.
 * Contract: [[M2'-SPEC]].
 */

import { useEffect, useRef } from 'react';
import type { KernelBridgeCachedProfile } from '../bridge/types';
import { rasterizeCymaticField, sandIntensity } from '../engine/cymaticField';
import { useTickStore } from '../state/stores';
import { cymaticActiveCell, cymaticActiveCellFlip } from '../ui/tokens';

const RES = 128;

const ELEMENT_COLOURS: Readonly<Record<string, readonly [number, number, number]>> = {
    Akasha: [137, 92, 196],
    Vayu: [47, 199, 216],
    Agni: [220, 78, 52],
    Apas: [58, 188, 177],
    Prithvi: [125, 83, 50]
};

export type CymaticMonoPolyBehaviourState = 'mono' | 'actually-many' | 'actualising-one' | 'monopoly';

export function CymaticField({
    size = 320,
    profile: heldProfile,
    behaviourState = null,
    address72 = null,
    element = null
}: {
    size?: number;
    /** When the M2 transport is paused or scrubbed, render its exact received
     * profile frame instead of following the live tick store. */
    profile?: KernelBridgeCachedProfile | null;
    /** Kernel-returned C-backed state; this component never derives it. */
    behaviourState?: CymaticMonoPolyBehaviourState | null;
    /** Conserved M2 address supplied by the shared pentadic trace. */
    address72?: number | null;
    /** Kernel-returned tattvic element for the colour-binary palette. */
    element?: string | null;
}) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const liveProfile = useTickStore(s => s.profile);
    const cached = heldProfile === undefined ? liveProfile : heldProfile;
    const generation = cached?.generation ?? null;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) {
            return;
        }
        const hp = (cached?.profile as { harmonicProfile?: Record<string, unknown> } | null)?.harmonicProfile;
        const flip = (hp?.kleinFlip ?? null) !== null;
        canvas.classList.toggle('klein-flip', flip);
        const quartet = (hp?.nodalQuartet as { m: number; n: number }[] | undefined) ?? [];
        const octet = (hp?.audioOctet as number[] | undefined) ?? [];
        const resolvedAddress72 =
            address72 ?? (typeof hp?.resonance72Index === 'number' ? hp.resonance72Index % 72 : null);
        if (quartet.length !== 4 || octet.length !== 8 || resolvedAddress72 === null) {
            ctx.clearRect(0, 0, RES, RES);
            return;
        }
        const field = rasterizeCymaticField(RES, octet, quartet, ((resolvedAddress72 + 1) * Math.PI) / 36);
        const valence = flip ? -1 : 1;
        const [red, green, blue] = ELEMENT_COLOURS[element ?? ''] ?? [95, 113, 130];
        const image = ctx.createImageData(RES, RES);
        for (let p = 0; p < field.length; p++) {
            const sand = sandIntensity(field[p], valence);
            image.data[p * 4] = red + (255 - red) * sand;
            image.data[p * 4 + 1] = green + (255 - green) * sand;
            image.data[p * 4 + 2] = blue + (255 - blue) * sand;
            image.data[p * 4 + 3] = 255;
        }
        ctx.putImageData(image, 0, 0);
        ctx.strokeStyle = flip ? 'rgba(20, 220, 225, 0.42)' : 'rgba(255, 255, 255, 0.24)';
        ctx.lineWidth = 0.5;
        for (let column = 1; column < 12; column++) {
            const x = (column * RES) / 12;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, RES);
            ctx.stroke();
        }
        for (let row = 1; row < 6; row++) {
            const y = (row * RES) / 6;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(RES, y);
            ctx.stroke();
        }
        const activeColumn = Math.floor(resolvedAddress72 / 6);
        const activeRow = resolvedAddress72 % 6;
        ctx.strokeStyle = flip ? cymaticActiveCellFlip : cymaticActiveCell;
        ctx.lineWidth = 1.5;
        ctx.strokeRect((activeColumn * RES) / 12, (activeRow * RES) / 6, RES / 12, RES / 6);
    }, [address72, cached, element, generation]);

    return (
        <canvas
            ref={canvasRef}
            width={RES}
            height={RES}
            style={{ width: size, height: size, imageRendering: 'pixelated' }}
            className="cymatic-field"
            data-testid="cymatic-field"
            data-generation={generation ?? ''}
            data-behaviour-state={behaviourState ?? 'pending'}
            data-surface-variant="plate"
            data-address72={address72 ?? ''}
            data-element={element ?? 'pending'}
        />
    );
}
