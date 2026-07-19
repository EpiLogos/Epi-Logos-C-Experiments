/**
 * Coordinate: M' M1' (Kaprekar 6174 pedagogy inspector -- Track 22.T22.7)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): #3 -- Pattern, as a compact reading of the current Ananda
 *   vortex position or its bussed skeleton-event marker.
 * Actualises: the read-only Kaprekar 6174 pedagogy link. It projects only the
 *   cached profile's `position6` and `anandaVortex.activeCellValue.skeletonEvent`;
 *   the frozen Theia contract is ported onto the active Pratibimba carrier.
 * Public surface: KAPREKAR_PEDAGOGY_SEED_PATH, KAPREKAR_POSITION6_TRIGGER,
 *   isKaprekarPedagogyHit, readKaprekarInspectorInput, M1KaprekarInspector.
 * Does NOT own: Ananda-vortex event generation, the 7-row law, the pedagogy
 *   source text, Canon Studio state, gateway I/O, or a local profile/event store.
 * Contract: [[M1-ARCHITECTURE]] + [[m1-prime-kaprekar-pedagogy]] + 22.T22.7.
 */

import { commands } from '../commands/registry';
import type { KernelBridgeCachedProfile } from '../bridge/types';
import { useTickStore } from '../state/stores';

export const KAPREKAR_PEDAGOGY_SEED_PATH =
    "Idea/Bimba/Seeds/M/M1'/m1-prime-kaprekar-pedagogy.md" as const;
export const KAPREKAR_POSITION6_TRIGGER = 4;

export interface KaprekarInspectorInput {
    readonly position6: number | null;
    readonly skeletonEvent: unknown;
}

function recordOf(value: unknown): Record<string, unknown> | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

/** The bridge may carry the profile directly or under `harmonicProfile`.
 * This is a narrow projection: the widget neither validates nor rebuilds the
 * vortex's own structural payload. */
export function readKaprekarInspectorInput(
    cached: KernelBridgeCachedProfile | null
): KaprekarInspectorInput {
    const payload = recordOf(cached?.profile ?? null);
    const root = recordOf(payload?.harmonicProfile) ?? payload;
    const vortex = recordOf(root?.anandaVortex);
    const cell = recordOf(vortex?.activeCellValue);
    return Object.freeze({
        position6:
            typeof root?.position6 === 'number' && Number.isFinite(root.position6)
                ? root.position6
                : null,
        skeletonEvent: cell?.skeletonEvent ?? null
    });
}

/** Accept both the declared enum name and its wire ordinal. The current bridge
 * may not have emitted this future event yet; unknown values stay non-events. */
export function isKaprekarPedagogyHit(value: unknown): boolean {
    if (value === 6) {
        return true;
    }
    if (typeof value !== 'string' || value.length === 0) {
        return false;
    }
    const name = value.includes('.') ? value.slice(value.lastIndexOf('.') + 1) : value;
    return name === 'KaprekarPedagogyHit' || name === '6';
}

export function M1KaprekarInspector(props: {
    readonly layoutId: 'daily-0-1' | 'ide-deep';
}) {
    const cached = useTickStore(state => state.profile);
    const input = readKaprekarInspectorInput(cached);
    const visible =
        input.position6 === KAPREKAR_POSITION6_TRIGGER || isKaprekarPedagogyHit(input.skeletonEvent);

    if (!visible) {
        return null;
    }

    const ideDeep = props.layoutId === 'ide-deep';
    return (
        <details open className="m1-kaprekar-inspector" data-testid="m1-kaprekar-inspector">
            <summary>Kaprekar 6174</summary>
            <ol aria-label="Kaprekar 6174 inspector">
                <li data-testid="m1-kaprekar-line-1">6174 = 7² × 9 × 14 = 18 × 7³</li>
                <li data-testid="m1-kaprekar-line-2">
                    {'{1, 4, 6, 7}'}: 1 = DIFF_B axiom; 4 = DIFF_A matrix idx; 6 = six matrix
                    families; 7 = 7-row producing 16/9.
                </li>
                <li data-testid="m1-kaprekar-line-3">
                    archetype-7 binding via QL_DIVINE_ACT_RATIO 16/9 at m1.h:417-422; substrate
                    read through the bridge.
                </li>
                <li data-testid="m1-kaprekar-line-4">
                    {ideDeep ? (
                        <button
                            type="button"
                            data-testid="m1-kaprekar-seed-button"
                            onClick={() => void commands.execute('vault.open', KAPREKAR_PEDAGOGY_SEED_PATH)}
                        >
                            Read the pedagogy seed
                        </button>
                    ) : (
                        <span
                            data-testid="m1-kaprekar-seed-reference"
                            title={KAPREKAR_PEDAGOGY_SEED_PATH}
                        >
                            Read the pedagogy seed
                        </span>
                    )}
                </li>
            </ol>
        </details>
    );
}
