/**
 * Coordinate: M' shell (shared primitives law — Track 16.T16.10 / CCT-10)
 * Actualises: the CCT-10 acceptance — one shared home: the 7-member DR-UI-3
 *   taxonomy re-exports, the DR-UI-4 timings exactly as ratified, the CCT-6
 *   tooltip carries the kernel chain verbatim, and the Cl(4,2) palette is
 *   single-source (the played-torus consumes it, no local fork).
 */

// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { act } from 'react';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { CL42_INDIGO, CL42_WARM } from '../panes/playedTorusScene';
import {
    BedrockLinkTooltip,
    BlockedOverlay,
    CL42_PALETTE,
    CodonString,
    CoordinateString,
    EmptyState,
    HexagramString,
    LEMNISCATE_MASK_LAW,
    LoadingPulse,
    PendingBadge,
    ProvenanceBorder,
    ReadinessIndicator,
    SymbolicCoordinateString,
    TRANSITIONS
} from './primitives';
import {
    BRIDGE_READINESS_IDS,
    readinessMeaning,
    readinessOwnerTrack,
    readinessRecovery,
    type BridgeReadinessId
} from './bridgeReadiness';
import {
    loadingPulseOpacity,
    loadingPulsePhase,
    readinessIdCssVar,
    readinessTooltip
} from './stateGrammar';
import { MOTION_KIND, meetsContrast, reducedMotionDurationMs } from './accessibility';
import { LOADING_PULSE } from './motionTokens';
import { READINESS_ID_COLOURS } from './tokens';
import { resolveToken } from './themeMapping';
import { commands } from '../commands/registry';
import { COMMAND_CATALOG } from '../commands/catalog';
import { useTickStore } from '../state/stores';

describe('shared ui primitives (CCT-10)', () => {
    it('DR-UI-4: exactly the three ratified transition configs — 400 cubic-out / 240 linear / 320 smoothstep', () => {
        expect(TRANSITIONS.lemniscate01).toEqual({ ms: 400, easing: 'cubic-out' });
        expect(TRANSITIONS.kleinFlip).toEqual({ ms: 240, easing: 'linear' });
        expect(TRANSITIONS.mobiusReturn).toEqual({ ms: 320, easing: 'smoothstep' });
        expect(Object.keys(TRANSITIONS)).toHaveLength(3);
        expect(LEMNISCATE_MASK_LAW).toContain('cos(2θ)');
    });

    it('Cl(4,2) palette is SINGLE-SOURCE: the played-torus consumes the shared values', () => {
        expect(CL42_INDIGO).toBe(CL42_PALETTE.implicateIndigo);
        expect(CL42_WARM).toBe(CL42_PALETTE.explicateWarm);
    });

    it('CCT-6: the bedrock tooltip carries the kernel chain verbatim', () => {
        const chain =
            'Body/S/S0/portal-core/src/kernel.rs:878 -> .rodata -> MathemeHarmonicProfile.bedrock -> readinessLedger.bedrock_link';
        render(<BedrockLinkTooltip chain={chain}>bedrock</BedrockLinkTooltip>);
        expect(screen.getByTestId('bedrock-link-tooltip').getAttribute('title')).toBe(chain);
    });

    it('Track 30 shelf renders shared coordinate, provenance, pending, and readiness states', () => {
        render(
            <ProvenanceBorder state="derived">
                <CoordinateString value="M4-3" />
                <PendingBadge
                    id="pending-dataset"
                    readinessId="profile_missing_field"
                    reason="awaiting producer"
                />
                <ReadinessIndicator readinessId="profile_missing_field" reason="awaiting producer" />
            </ProvenanceBorder>
        );

        expect(screen.getByTestId('provenance-border').getAttribute('data-provenance')).toBe(
            'derived'
        );
        expect(screen.getByTestId('coordinate-string').getAttribute('data-family')).toBe('M');
        expect(screen.getByTestId('coordinate-string').textContent).toBe('M4-3');
        expect(screen.getByTestId('pending-badge').textContent).toContain('pending-dataset');
        expect(screen.getByTestId('readiness-indicator').getAttribute('data-readiness')).toBe(
            'profile_missing_field'
        );
    });

    it('Track 30 coordinate primitives preserve authority strings and expose accessible structure', () => {
        const view = render(
            <>
                <CoordinateString value="[[S2-3]]" />
                <HexagramString value={1} changingLines={[0, 5]} />
                <SymbolicCoordinateString value="[[#R0-0/1:A-T7?]]" />
            </>
        );
        expect(within(view.container).getByTestId('coordinate-string').textContent).toBe('S2-3');
        // 30.T30.5 screen-reader contract: the text equivalent names the family
        // TIER and the archetype it manifests, not the bare letter — and speaks
        // the separators a reader would otherwise run together.
        expect(within(view.container).getByTestId('coordinate-string').getAttribute('aria-label')).toBe(
            'S2 dash 3, stack family, graphdb'
        );
        expect(within(view.container).getByTestId('hexagram-string').getAttribute('aria-label')).toContain(
            'changing lines 1, 6'
        );
        expect(within(view.container).getByTestId('symbolic-coordinate-string').textContent).toBe('#R0-0/1:A-T7?');
    });

    it('Track 30 codon primitive renders the real adapter shape without a browser codon table', async () => {
        render(
            <CodonString
                value="AUG"
                resolve={async () => ({
                    codon: 'AUG',
                    encoded: 14,
                    aminoAcidIndex: 12,
                    aminoAcid: 'Cys',
                    isStart: true,
                    isStop: false,
                    authority: 'portal-core::transcription'
                })}
            />
        );
        expect(await screen.findByText('Cys')).toBeTruthy();
        expect(screen.getByTestId('codon-string').getAttribute('aria-label')).toContain(
            'amino acid Cys, start'
        );
        expect(screen.getByText('START')).toBeTruthy();
    });

    it('Track 30 blocked overlay exposes and executes its recovery action', () => {
        let recovered = 0;
        render(
            <BlockedOverlay
                readinessId="privacy_blocked"
                reason="protected-local consent required"
                actionLabel="Open consent"
                onAction={() => {
                    recovered += 1;
                }}
            />
        );

        expect(screen.getByTestId('blocked-overlay').textContent).toContain(
            'protected-local consent required'
        );
        fireEvent.click(screen.getByRole('button', { name: 'Open consent' }));
        expect(recovered).toBe(1);
    });
});

// ── 30.T30.6 — the state grammar ───────────────────────────────────────────
// The brief's acceptance is "9 readiness ids × 5 primitives = 45 test cases"
// against synthetic readiness packets, plus reason-routing (ownerTrack in the
// tooltip), a deep-link proof, and a consume-not-fork check.

/** vitest runs from the package root; the carrier source lives under it. */
const SRC_ROOT = join(process.cwd(), 'src');

const STATE_GRAMMAR = [
    {
        name: 'EmptyState',
        testId: 'empty-state',
        render: (id: BridgeReadinessId) => <EmptyState family="M" hint={`nothing for ${id} yet`} />
    },
    {
        name: 'LoadingPulse',
        testId: 'loading-pulse',
        render: (id: BridgeReadinessId) => <LoadingPulse family="M" readinessId={id} label="Loading" />
    },
    {
        name: 'PendingBadge',
        testId: 'pending-badge',
        render: (id: BridgeReadinessId) => (
            <PendingBadge id="klein_flip_state" readinessId={id} reason={`live reason for ${id}`} />
        )
    },
    {
        name: 'BlockedOverlay',
        testId: 'blocked-overlay',
        render: (id: BridgeReadinessId) => (
            <BlockedOverlay readinessId={id} reason={`live reason for ${id}`} />
        )
    },
    {
        name: 'ReadinessIndicator',
        testId: 'readiness-indicator',
        render: (id: BridgeReadinessId) => (
            <ReadinessIndicator readinessId={id} reason={`live reason for ${id}`} />
        )
    }
] as const;

describe('30.T30.6 state grammar — 9 readiness ids × 5 primitives', () => {
    afterEach(cleanup);

    for (const primitive of STATE_GRAMMAR) {
        for (const id of BRIDGE_READINESS_IDS) {
            it(`${primitive.name} renders for ${id} with a text equivalent`, () => {
                const { unmount } = render(primitive.render(id));
                const node = screen.getByTestId(primitive.testId);
                expect(node).toBeTruthy();
                // 30.T30.5: every primitive carries a screen-reader equivalent.
                // Colour is an aid to the reading, never the reading itself.
                const label = node.getAttribute('aria-label');
                expect(label).toBeTruthy();
                expect((label ?? '').length).toBeGreaterThan(0);
                unmount();
            });
        }
    }

    it('every readiness-typed primitive surfaces ownerTrack in its tooltip (reason routing)', () => {
        for (const id of BRIDGE_READINESS_IDS) {
            for (const primitive of STATE_GRAMMAR) {
                if (primitive.name === 'EmptyState' || primitive.name === 'LoadingPulse') {
                    continue; // neither is a readiness report; neither claims an owner
                }
                const { unmount } = render(primitive.render(id));
                const node = screen.getByTestId(primitive.testId);
                expect(node.getAttribute('data-owner-track')).toBe(readinessOwnerTrack(id));
                // the LIVE reason wins over the canonical meaning when present
                const spoken = `${node.getAttribute('title') ?? ''}${node.getAttribute('aria-label') ?? ''}`;
                expect(spoken).toContain(`live reason for ${id}`);
                expect(spoken).toContain(`owner: track ${readinessOwnerTrack(id)}`);
                unmount();
            }
        }
    });

    it('with no live reason the tooltip falls back to the id’s canonical meaning, never blank', () => {
        for (const id of BRIDGE_READINESS_IDS) {
            expect(readinessTooltip(id)).toContain(readinessMeaning(id));
            expect(readinessTooltip(id, '   ')).toContain(readinessMeaning(id));
            expect(readinessTooltip(id, 'real')).toContain('real');
        }
    });

    it('per-id colour is per ID, not one generic amber', () => {
        const seen = new Set<string>();
        for (const id of BRIDGE_READINESS_IDS) {
            const { unmount } = render(<ReadinessIndicator readinessId={id} />);
            const style = screen.getByTestId('readiness-indicator').getAttribute('style') ?? '';
            expect(style).toContain(`var(${readinessIdCssVar(id)})`);
            seen.add(readinessIdCssVar(id));
            unmount();
        }
        expect(seen.size).toBe(BRIDGE_READINESS_IDS.length);
    });

    it('BlockedOverlay deep-links: s5_review_blocked really opens the OmniPanel review fold', () => {
        const opened: string[] = [];
        const dispose = commands.register({
            id: 'omnipanel.openReview',
            title: 'Review: Open OmniPanel review fold',
            run: () => {
                opened.push('omnipanel.openReview');
            }
        });

        render(<BlockedOverlay readinessId="s5_review_blocked" />);
        const overlay = screen.getByTestId('blocked-overlay');
        expect(overlay.getAttribute('data-command')).toBe('omnipanel.openReview');
        fireEvent.click(screen.getByRole('button', { name: 'Open Review tab' }));
        expect(opened).toEqual(['omnipanel.openReview']);
        dispose();
    });

    it('every derived recovery command is a REAL registered command id, never a dead button', () => {
        const catalogIds = new Set(COMMAND_CATALOG.map(entry => entry.id));
        for (const id of BRIDGE_READINESS_IDS) {
            const recovery = readinessRecovery(id);
            if (recovery.commandId !== null) {
                expect(catalogIds.has(recovery.commandId)).toBe(true);
            }
        }
    });

    it('ids with no honest recovery render NO button (privacy is not one-click consent)', () => {
        for (const id of ['privacy_blocked', 'degraded_but_readable', 'ready_public_current'] as const) {
            const { unmount } = render(<BlockedOverlay readinessId={id} />);
            expect(readinessRecovery(id).commandId).toBeNull();
            expect(screen.queryByRole('button')).toBeNull();
            unmount();
        }
    });

    it('LoadingPulse takes its phase from the profile tick — no local clock when the bridge is up', () => {
        act(() => {
            useTickStore.setState({
                generation: 1,
                profile: { generation: 1, profile: { tick12: 6, degree720: 360 }, graphRevision: 0 } as never
            });
        });
        render(<LoadingPulse family="M" readinessId="s2_graph_blocked" label="Loading graph" />);
        const pulse = screen.getByTestId('loading-pulse');
        expect(pulse.getAttribute('data-clock')).toBe('profile-tick');
        expect(pulse.getAttribute('data-tick')).toBe('6');
        // tick 6 of 12 is the trough of the cosine fade: the dimmest point
        const mark = pulse.querySelector('.loading-pulse-mark') as HTMLElement;
        expect(mark.style.opacity).toBe(String(LOADING_PULSE.minOpacity));
        act(() => {
            useTickStore.setState({ generation: null, profile: null });
        });
    });

    it('LoadingPulse falls back to the local CSS cycle ONLY under bridge_unavailable', () => {
        const { unmount } = render(<LoadingPulse readinessId="bridge_unavailable" />);
        const pulse = screen.getByTestId('loading-pulse');
        expect(pulse.getAttribute('data-clock')).toBe('local');
        expect(pulse.className).toContain('loading-pulse-local');
        // the fallback is CSS, so the component sets NO inline opacity
        expect((pulse.querySelector('.loading-pulse-mark') as HTMLElement).style.opacity).toBe('');
        unmount();

        render(<LoadingPulse readinessId="s3_subscription_blocked" />);
        expect(screen.getByTestId('loading-pulse').className).toContain('loading-pulse-tick');
    });

    it('the pulse law is a closed cosine fade between the token bounds', () => {
        expect(loadingPulsePhase(null)).toBe(0);
        expect(loadingPulsePhase(0)).toBe(0);
        expect(loadingPulsePhase(6)).toBeCloseTo(0.5, 10);
        expect(loadingPulsePhase(12)).toBe(0); // wraps
        expect(loadingPulsePhase(-1)).toBeCloseTo(11 / 12, 10); // and wraps backwards
        for (let tick = 0; tick < 24; tick += 1) {
            const opacity = loadingPulseOpacity(loadingPulsePhase(tick));
            expect(opacity).toBeGreaterThanOrEqual(LOADING_PULSE.minOpacity - 1e-9);
            expect(opacity).toBeLessThanOrEqual(LOADING_PULSE.maxOpacity + 1e-9);
        }
        expect(loadingPulseOpacity(0)).toBeCloseTo(LOADING_PULSE.maxOpacity, 10);
        expect(loadingPulseOpacity(0.5)).toBeCloseTo(LOADING_PULSE.minOpacity, 10);
    });

    it('loadingPulse is CONTINUOUS motion, so reduced motion stops it entirely', () => {
        expect(MOTION_KIND.loadingPulse).toBe('continuous');
        expect(reducedMotionDurationMs('loadingPulse', LOADING_PULSE.periodMs, true)).toBe(0);
        expect(reducedMotionDurationMs('loadingPulse', LOADING_PULSE.periodMs, false)).toBe(
            LOADING_PULSE.periodMs
        );
    });
});

describe('30.T30.6 per-id readiness tokens', () => {
    it('every id resolves through the 30.2 token seam under both polarities', () => {
        for (const id of BRIDGE_READINESS_IDS) {
            expect(resolveToken(`readiness.id.${id}`, 'dark', 'shell')).toBe(
                READINESS_ID_COLOURS[id].dark
            );
            expect(resolveToken(`readiness.id.${id}`, 'light', 'shell')).toBe(
                READINESS_ID_COLOURS[id].light
            );
        }
        expect(() => resolveToken('readiness.id.not_a_state', 'dark', 'shell')).toThrow();
    });

    it('readiness is NOT nara-remapped — a domain must not tint how broken the bridge looks', () => {
        for (const id of BRIDGE_READINESS_IDS) {
            expect(resolveToken(`readiness.id.${id}`, 'nara-dark', 'm4')).toBe(
                READINESS_ID_COLOURS[id].dark
            );
        }
    });

    it('every per-id colour meets WCAG AA body text against its own ground (30.T30.5)', () => {
        const GROUND = { dark: '#181026', light: '#f5f2fb' };
        for (const id of BRIDGE_READINESS_IDS) {
            expect(meetsContrast(READINESS_ID_COLOURS[id].dark, GROUND.dark, 'bodyText')).toBe(true);
            expect(meetsContrast(READINESS_ID_COLOURS[id].light, GROUND.light, 'bodyText')).toBe(true);
        }
    });

    it('styles.css and tokens.ts carry the SAME nine hues — CSS and JS cannot drift', () => {
        const css = readFileSync(join(SRC_ROOT, 'styles.css'), 'utf8');
        // the dark set lives in `:root {`, the light set in the light-theme block
        const darkBlock = css.slice(css.indexOf(':root {'), css.indexOf(":root[data-theme='light']"));
        const lightBlock = css.slice(css.indexOf(":root[data-theme='light']"));
        for (const id of BRIDGE_READINESS_IDS) {
            const variable = readinessIdCssVar(id);
            expect(darkBlock).toContain(`${variable}: ${READINESS_ID_COLOURS[id].dark};`);
            expect(lightBlock).toContain(`${variable}: ${READINESS_ID_COLOURS[id].light};`);
        }
    });
});

describe('30.T30.6 consume-not-fork', () => {
    it('no surface reimplements the state grammar locally — the shelf is the only home', () => {
        const srcRoot = SRC_ROOT;
        const owners = new Set(
            ['ui/primitives.tsx', 'ui/stateGrammar.ts'].map(p => join(srcRoot, p))
        );
        const offenders: string[] = [];

        const walk = (dir: string): void => {
            for (const entry of readdirSync(dir, { withFileTypes: true })) {
                const full = join(dir, entry.name);
                if (entry.isDirectory()) {
                    walk(full);
                    continue;
                }
                if (!/\.tsx?$/.test(entry.name) || /\.test\.tsx?$/.test(entry.name)) continue;
                if (owners.has(full)) continue;
                const body = readFileSync(full, 'utf8');
                // a local fork declares its own badge/overlay/chip component or
                // its own copy of the per-id class names
                if (
                    /(?:function|const)\s+(?:Local)?(?:Pending(?:Badge)?|BlockedOverlay|ReadinessIndicator|EmptyState|LoadingPulse)\b/.test(
                        body
                    )
                ) {
                    offenders.push(relative(srcRoot, full));
                }
            }
        };
        walk(srcRoot);
        expect(offenders).toEqual([]);
    });
});
