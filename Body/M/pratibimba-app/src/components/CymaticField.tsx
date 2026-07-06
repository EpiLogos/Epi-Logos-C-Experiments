/**
 * Coordinate: M' M2' (cymatic surface, Phase-2 opener)
 * Actualises: the Chladni field rendered from the profile's nodal_quartet
 *   boundaries + audio_octet drivers. Redraws ONLY on generation advance —
 *   the kernel tick is the clock. Contemplative pacing: one figure per tick,
 *   no animation between.
 */

import { useEffect, useRef } from 'react';
import { chladniField, NodalConstraint } from '../audio/chladni';
import { useTickStore } from '../state/stores';

const RES = 128;

export function CymaticField({ size = 320 }: { size?: number }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const generation = useTickStore(s => s.generation);
    const cached = useTickStore(s => s.profile);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) {
            return;
        }
        const hp = (cached?.profile as { harmonicProfile?: Record<string, unknown> } | null)?.harmonicProfile;
        const flip = (hp?.kleinFlip ?? null) !== null;
        canvas.classList.toggle('klein-flip', flip);
        const quartet = (hp?.nodalQuartet as NodalConstraint[] | undefined) ?? [];
        const octet = (hp?.audioOctet as number[] | undefined) ?? [];
        if (quartet.length === 0 || octet.length === 0) {
            ctx.clearRect(0, 0, RES, RES);
            return;
        }
        const field = chladniField(RES, quartet, octet);
        const image = ctx.createImageData(RES, RES);
        for (let p = 0; p < field.length; p++) {
            const v = field[p];
            // sand gathers on the nodal lines: low intensity → bright gold
            const sand = Math.max(0, 1 - v * 6);
            image.data[p * 4] = 24 + sand * 211;
            image.data[p * 4 + 1] = 16 + sand * 204;
            image.data[p * 4 + 2] = 38 + sand * 122;
            image.data[p * 4 + 3] = 255;
        }
        ctx.putImageData(image, 0, 0);
    }, [generation, cached]);

    return (
        <canvas
            ref={canvasRef}
            width={RES}
            height={RES}
            style={{ width: size, height: size, imageRendering: 'pixelated' }}
            className="cymatic-field"
            data-testid="cymatic-field"
            data-generation={generation ?? ''}
        />
    );
}
