/**
 * Coordinate: M' M3' (Quintessence / Akasha indicator, rerun 24.T24.11)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#n): M3' cosmic-wheel centre
 * Actualises: the authority-provided charge quaternion as four proportional
 *   elemental petals and a low-variance Akasha core.
 * Public surface: ChargeQuaternionBoundary, QuintessenceIndicatorProps,
 *   QuintessenceIndicator.
 * Does NOT own: charge-quaternion computation, the 4X invariant decision,
 *   profile transport, or a local clock.
 * Contract: [[M3'-SPEC]] §8.4/§9 + rerun
 *   [[24-m3-mahamaya-frontend-deep]] 24.11.
 */

import type { M3WheelSurface } from './M3CosmicWheelRenderService';
import {
    accent,
    inkBright,
    inkDim,
    ringLit,
    tritoneSquareB,
    tritoneSquareC
} from '../ui/tokens';

export interface ChargeQuaternionBoundary {
    readonly pp: number;
    readonly mm: number;
    readonly mp: number;
    readonly pm: number;
    readonly chargeQuaternionInvariant: boolean;
    readonly fourX: number;
}

export interface QuintessenceIndicatorProps {
    readonly surface: M3WheelSurface;
    readonly chargeQuaternion?: ChargeQuaternionBoundary;
    readonly cx: number;
    readonly cy: number;
    readonly radius: number;
}

const PETAL_COLOURS = [tritoneSquareC, tritoneSquareB, accent, ringLit] as const;

export function QuintessenceIndicator({
    surface,
    chargeQuaternion,
    cx,
    cy,
    radius
}: QuintessenceIndicatorProps) {
    const charge = chargeQuaternion ?? surface.chargeQuaternion ?? undefined;
    if (!charge) {
        const missingAuthority = surface.quintessenceState === 'authority_payload_missing';
        return (
            <g
                data-testid="m3-wheel-quintessence"
                data-state={
                    missingAuthority ? 'authority_payload_missing' : 'pending-charge-quaternion'
                }
            >
                {missingAuthority ? <title>authority_payload_missing</title> : null}
                <circle
                    cx={cx}
                    cy={cy}
                    r={radius * 0.34}
                    fill="none"
                    stroke={missingAuthority ? inkBright : inkDim}
                    strokeDasharray={
                        missingAuthority ? undefined : `${radius * 0.12} ${radius * 0.1}`
                    }
                    opacity={0.7}
                />
            </g>
        );
    }

    const values = [charge.pp, charge.mm, charge.mp, charge.pm] as const;
    const maximum = Math.max(...values, 1);
    const mean = values.reduce((total, value) => total + value, 0) / values.length;
    const variance =
        values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length;
    const balance = 1 / (1 + variance);
    const petalTransforms = [
        `translate(${cx} ${cy - radius * 0.38})`,
        `translate(${cx + radius * 0.38} ${cy}) rotate(90)`,
        `translate(${cx} ${cy + radius * 0.38}) rotate(180)`,
        `translate(${cx - radius * 0.38} ${cy}) rotate(270)`
    ];

    return (
        <g
            data-testid="m3-wheel-quintessence"
            data-state={surface.quintessenceState}
            data-four-x={charge.fourX}
        >
            {values.map((value, index) => {
                const strength = value / maximum;
                return (
                    <ellipse
                        key={index}
                        data-testid="m3-quintessence-petal"
                        data-value={value}
                        data-strength={Number(strength.toFixed(4))}
                        transform={petalTransforms[index]}
                        cx={0}
                        cy={0}
                        rx={radius * 0.2}
                        ry={radius * 0.55 * strength}
                        fill={PETAL_COLOURS[index]}
                        opacity={0.78}
                    />
                );
            })}
            <circle
                data-testid="m3-quintessence-core"
                data-balance={Number(balance.toFixed(4))}
                cx={cx}
                cy={cy}
                r={radius * (0.14 + balance * 0.08)}
                fill={inkBright}
                opacity={0.35 + balance * 0.65}
            />
            {surface.quintessenceState === 'authority_payload_invariant_violation' ? (
                <g data-testid="m3-quintessence-violation-mark">
                    <title>authority_payload_invariant_violation</title>
                    <circle
                        cx={cx}
                        cy={cy}
                        r={radius * 0.32}
                        fill="none"
                        stroke={inkBright}
                        strokeWidth={Math.max(1, radius * 0.08)}
                    />
                    <text
                        x={cx}
                        y={cy + radius * 0.13}
                        textAnchor="middle"
                        fill={inkBright}
                        fontSize={radius * 0.42}
                    >
                        !
                    </text>
                </g>
            ) : null}
        </g>
    );
}
