/**
 * Coordinate: M' shell-0 (clock wheel, plan T3.4)
 * Actualises: the 2D tick wheel — 12 epogdoon positions, the current tick12
 *   lit, degree720 as the double-cover arc (outer = first 360°, inner =
 *   shadow lap). Redraws ONLY on profile generation advance — the kernel
 *   tick is the clock; no animation timers.
 */

import { useEffect, useRef } from 'react';
import { useTickStore } from '../state/stores';
import { accent, accentShadow, inkBright, ringLit, wheelUnlit } from '../ui/tokens';

function field(profile: unknown, key: string): number | undefined {
    const hp = (profile as { harmonicProfile?: Record<string, unknown> } | null)?.harmonicProfile ??
        (profile as Record<string, unknown> | null);
    const value = hp?.[key];
    return typeof value === 'number' ? value : undefined;
}

export function ClockWheel({ size = 220 }: { size?: number }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const generation = useTickStore(s => s.generation);
    const cached = useTickStore(s => s.profile);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) {
            return;
        }
        const tick12 = field(cached?.profile ?? null, 'tick12') ?? null;
        const degree720 = field(cached?.profile ?? null, 'degree720') ?? null;
        const c = size / 2;
        const rOuter = c - 6;
        const rTicks = c - 26;

        ctx.clearRect(0, 0, size, size);

        // degree720 double-cover: outer arc = 0–360, inner arc = 360–720
        if (degree720 !== null) {
            const first = Math.min(degree720, 360);
            ctx.beginPath();
            ctx.strokeStyle = accent;
            ctx.lineWidth = 3;
            ctx.arc(c, c, rOuter, -Math.PI / 2, -Math.PI / 2 + (first / 360) * Math.PI * 2);
            ctx.stroke();
            if (degree720 > 360) {
                ctx.beginPath();
                ctx.strokeStyle = accentShadow;
                ctx.arc(c, c, rOuter - 7, -Math.PI / 2, -Math.PI / 2 + ((degree720 - 360) / 360) * Math.PI * 2);
                ctx.stroke();
            }
        }

        // 12 epogdoon positions
        for (let i = 0; i < 12; i++) {
            const angle = -Math.PI / 2 + (i / 12) * Math.PI * 2;
            const x = c + Math.cos(angle) * rTicks;
            const y = c + Math.sin(angle) * rTicks;
            ctx.beginPath();
            ctx.fillStyle = i === tick12 ? ringLit : wheelUnlit;
            ctx.arc(x, y, i === tick12 ? 7 : 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // centre: tick12 numeral
        ctx.fillStyle = inkBright;
        ctx.font = `${Math.round(size / 7)}px ui-monospace, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tick12 !== null ? String(tick12) : '—', c, c);
    }, [generation, cached, size]);

    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
            className="clock-wheel"
            data-testid="clock-wheel"
            data-generation={generation ?? ''}
        />
    );
}
