/**
 * Coordinate: M' M3' (codon-tarot wheel, Phase-2 opener)
 * Actualises: the 64-cell Mahāmāyā wheel — current codon lit from the
 *   profile's codon-rotation projection, Klein-flip folding the ring when
 *   the profile carries a flip event. Conversational default: the wheel and
 *   its current cell; deeper matrices remain summonable later. Redraw is
 *   generation-gated; all state comes from the kernel projection.
 */

import { useEffect, useRef } from 'react';
import { useTickStore } from '../state/stores';
import { inkBright, inkDim, ringLit, wheelUnlit } from '../ui/tokens';

function hp(profile: unknown): Record<string, unknown> | null {
    return (
        ((profile as { harmonicProfile?: Record<string, unknown> } | null)?.harmonicProfile ??
            (profile as Record<string, unknown> | null)) || null
    );
}

function num(obj: unknown, ...keys: string[]): number | undefined {
    for (const key of keys) {
        const v = (obj as Record<string, unknown> | null)?.[key];
        if (typeof v === 'number') {
            return v;
        }
    }
    return undefined;
}

export function CodonWheel({ size = 300 }: { size?: number }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const generation = useTickStore(s => s.generation);
    const cached = useTickStore(s => s.profile);

    const profile = hp(cached?.profile ?? null);
    const projection = (profile?.codonRotationProjection ?? {}) as Record<string, unknown>;
    const codonId =
        num(projection, 'codonId', 'codon_id') ??
        num(profile?.lensMode, 'codonId') ??
        num(profile?.mahamaya, 'mahamayaAddress64');
    const rotation = num(projection, 'rotation') ?? num(profile?.lensMode, 'rotation');
    const flip = (profile?.kleinFlip ?? null) !== null;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) {
            return;
        }
        const c = size / 2;
        const r = c - 12;
        ctx.clearRect(0, 0, size, size);
        for (let i = 0; i < 64; i++) {
            const angle = -Math.PI / 2 + (i / 64) * Math.PI * 2;
            const x = c + Math.cos(angle) * r;
            const y = c + Math.sin(angle) * r;
            const active = codonId !== undefined && i === codonId;
            ctx.beginPath();
            ctx.fillStyle = active ? ringLit : wheelUnlit;
            ctx.arc(x, y, active ? 6 : 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = inkBright;
        ctx.font = `${Math.round(size / 9)}px ui-monospace, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(codonId !== undefined ? String(codonId) : '—', c, c - 8);
        ctx.fillStyle = inkDim;
        ctx.font = `${Math.round(size / 20)}px ui-monospace, monospace`;
        ctx.fillText(rotation !== undefined ? `rot ${rotation}` : 'rotation pending', c, c + Math.round(size / 9));
    }, [generation, cached, size, codonId, rotation]);

    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
            className={flip ? 'codon-wheel klein-flip' : 'codon-wheel'}
            data-testid="codon-wheel"
            data-codon={codonId ?? ''}
            data-flip={flip ? 'true' : 'false'}
        />
    );
}
