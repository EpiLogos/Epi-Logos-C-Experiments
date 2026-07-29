/**
 * Coordinate: M' shell (shared UI primitives barrel — Track 16.T16.10 / CCT-10)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: the `epi-ui-primitives` shared package retargeted to the
 *   carrier — ONE home for the cross-widget primitives so no surface forks
 *   its own: the DR-UI-3 <ProvenanceBadge> (7-member taxonomy, re-exported),
 *   the DR-UI-4 ratified transition configs (lemniscate-of-Bernoulli mask,
 *   r² = a²·cos 2θ; the three configs are LAW — 0/1 toggle 400ms cubic-out,
 *   Klein flip 240ms linear, Möbius return 320ms smoothstep; the 600/420ms
 *   texts are superseded per CHARTER), the CCT-6 <BedrockLinkTooltip>, the
 *   Track-30 coordinate/provenance/readiness shelf, and the canonical Cl(4,2)
 *   colour-binary palette (single source; the played-torus consumes it,
 *   never a local copy).
 *   Carries the 30.T30.6 state grammar — <EmptyState> · <LoadingPulse> ·
 *   <PendingBadge> · <BlockedOverlay> · <ReadinessIndicator> — all five typed
 *   on the nine-id taxonomy, all five surfacing ownerTrack, coloured per id
 *   (never a generic amber).
 * Does NOT own: the taxonomy law (DR-UI-3), the nine-id readiness law
 *   (ui/bridgeReadiness), the state-grammar pure law (ui/stateGrammar), the
 *   per-id colour values (ui/tokens READINESS_ID_COLOURS + styles.css), the
 *   shader implementation (Track 15 baselines), bedrock chain genesis
 *   (portal-core CCT-6).
 */

import { useEffect, useState, type ReactNode } from 'react';
import { gateway, gatewayReady } from '../bridge/gatewayHolder';
import { commands } from '../commands/registry';
import { useProfileTick } from '../state/useProfileTick';
import { FAMILY_HUES } from './tokens';
import { familyLetterIcon, iconMaskStyle } from './iconography';
import { coordinateAriaLabel } from './accessibility';
import {
    readinessMeaning,
    readinessOwnerTrack,
    readinessRecovery,
    readinessSeverity,
    type BridgeReadinessId
} from './bridgeReadiness';
import {
    emptyStateAriaLabel,
    loadingPulseOpacity,
    loadingPulsePhase,
    readinessAriaLabel,
    readinessIdColour,
    readinessTooltip
} from './stateGrammar';

export { ProvenanceBadge } from './ProvenanceBadge';
export type { ProvenanceState } from './ProvenanceBadge';

/** DR-UI-4 ratified transition configs — the three, exactly. */
// DR-UI-4's transition tier is a MOTION TOKEN, so it is defined in the motion-
// token source and re-exported here for the components that consume it. It used
// to be defined here and re-exported by `motionTokens.ts`, which made a pure
// token module import this React module — and through it the icon asset glob.
// Every consumer of a motion token then dragged in Vite-only build APIs.
export { TRANSITIONS } from './motionTokens';

/** The lemniscate mask law the shader implements (DR-UI-4). */
export const LEMNISCATE_MASK_LAW = 'r² = a² · cos(2θ)' as const;

/** Canonical Cl(4,2) colour-binary — implicate (−1, P0/P5) indigo; explicate
 *  (+1, P1–P4) warm. THE single palette source for every Cl(4,2)-keyed
 *  surface (played-torus halo, inspector legends). */
export const CL42_PALETTE = Object.freeze({
    implicateIndigo: 0x4b0082,
    explicateWarm: 0xff7f2a
});

/** CCT-6: renders the bedrock provenance chain (file:line → .rodata →
 *  profile field → readiness ledger) as a hover tooltip — the chain string
 *  is the KERNEL's write (BedrockProvenanceHandle), never composed locally. */
export function BedrockLinkTooltip(props: {
    readonly chain: string;
    readonly children: ReactNode;
}) {
    return (
        <span data-testid="bedrock-link-tooltip" title={props.chain}>
            {props.children}
        </span>
    );
}

function unwrapWikilink(value: string): string {
    const trimmed = value.trim();
    return trimmed.startsWith('[[') && trimmed.endsWith(']]')
        ? trimmed.slice(2, -2)
        : trimmed;
}

/** Renders a coordinate with the shared family-tier tint, never a local hue.
 *  The 30.9 family glyph precedes the text as a decorative mask that inherits
 *  the same tint — one hue, two carriers. An unrecognised family letter renders
 *  no glyph rather than borrowing another family's mark. */
export function CoordinateString({ value }: { readonly value: string }) {
    const coordinate = unwrapWikilink(value);
    const family = coordinate.charAt(0).toUpperCase();
    const colour = FAMILY_HUES[family] ?? 'var(--ink-dim)';
    const glyph = familyLetterIcon(family);
    return (
        <span
            className="coordinate-string"
            data-family={family || 'unknown'}
            data-testid="coordinate-string"
            aria-label={coordinateAriaLabel(coordinate)}
            style={{ color: colour }}
        >
            {glyph ? (
                <span
                    className="coordinate-family-glyph"
                    data-testid="coordinate-family-glyph"
                    data-icon={glyph}
                    aria-hidden="true"
                    style={iconMaskStyle(glyph)}
                />
            ) : null}
            <span className="coordinate-family" aria-hidden="true">{family || '?'}</span>
            {coordinate.slice(family ? 1 : 0)}
        </span>
    );
}

export interface CodonLookup {
    readonly codon: string;
    readonly encoded: number;
    readonly aminoAcidIndex: number;
    readonly aminoAcid: string;
    readonly isStart: boolean;
    readonly isStop: boolean;
    readonly authority: 'portal-core::transcription';
}

export function parseCodonLookup(value: unknown): CodonLookup {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('codon lookup must be an object');
    }
    const root = value as Record<string, unknown>;
    if (
        typeof root.codon !== 'string'
        || !/^[AUCG]{3}$/.test(root.codon)
        || !Number.isInteger(root.encoded)
        || (root.encoded as number) < 0
        || (root.encoded as number) > 63
        || !Number.isInteger(root.aminoAcidIndex)
        || typeof root.aminoAcid !== 'string'
        || typeof root.isStart !== 'boolean'
        || typeof root.isStop !== 'boolean'
        || root.authority !== 'portal-core::transcription'
    ) {
        throw new Error('codon lookup response is malformed');
    }
    return root as unknown as CodonLookup;
}

async function lookupCodon(codon: string): Promise<CodonLookup> {
    const receipt = await gateway().invoke('s2.codon.aa_lookup', { codon });
    return parseCodonLookup(receipt.artifact);
}

/** Resolves amino-acid identity through the S2 gateway adapter, never a browser LUT. */
export function CodonString(props: {
    readonly value: string;
    readonly resolve?: (codon: string) => Promise<CodonLookup>;
}) {
    const [lookup, setLookup] = useState<CodonLookup | null>(null);
    const [failure, setFailure] = useState<string | null>(null);
    const canResolve = props.resolve !== undefined || gatewayReady();

    useEffect(() => {
        if (!canResolve) return;
        let current = true;
        setLookup(null);
        setFailure(null);
        void (props.resolve ?? lookupCodon)(props.value)
            .then(result => {
                if (current) setLookup(result);
            })
            .catch(error => {
                if (current) setFailure(error instanceof Error ? error.message : String(error));
            });
        return () => {
            current = false;
        };
    }, [canResolve, props.resolve, props.value]);

    const state = failure ? 'blocked' : lookup ? 'ready' : 'pending';
    const label = lookup
        ? `Codon ${lookup.codon}, amino acid ${lookup.aminoAcid}${lookup.isStart ? ', start' : ''}${lookup.isStop ? ', stop' : ''}`
        : `Codon ${props.value}, amino acid ${state}`;
    return (
        <span
            className="codon-string"
            data-state={state}
            data-testid="codon-string"
            aria-label={label}
            title={failure ?? undefined}
        >
            <span className="codon-bases">{lookup?.codon ?? props.value}</span>
            <span className="amino-acid-badge">{lookup?.aminoAcid ?? state}</span>
            {lookup?.isStart ? <span className="codon-signal codon-start">START</span> : null}
            {lookup?.isStop ? <span className="codon-signal codon-stop">STOP</span> : null}
        </span>
    );
}

/** Unicode I-Ching face with a six-line changing-line witness. */
export function HexagramString(props: {
    readonly value: number;
    readonly changingLines?: readonly number[];
}) {
    if (!Number.isInteger(props.value) || props.value < 1 || props.value > 64) {
        throw new Error('hexagram value must be an integer from 1 to 64');
    }
    const changing = new Set(props.changingLines ?? []);
    const glyph = String.fromCodePoint(0x4dc0 + props.value - 1);
    const lineDescription = [...changing].map(line => line + 1).join(', ');
    return (
        <span
            className="hexagram-string"
            data-testid="hexagram-string"
            aria-label={`Hexagram ${props.value}${lineDescription ? `, changing lines ${lineDescription}` : ''}`}
        >
            <span className="hexagram-glyph" aria-hidden="true">{glyph}</span>
            <span className="hexagram-lines" aria-hidden="true">
                {[0, 1, 2, 3, 4, 5].map(line => (
                    <span key={line} data-changing={changing.has(line)} />
                ))}
            </span>
            <span className="hexagram-number">{props.value}</span>
        </span>
    );
}

/** Preserves a verifier-authored symbolic address while exposing its structural parts. */
export function SymbolicCoordinateString({ value }: { readonly value: string }) {
    const coordinate = unwrapWikilink(value);
    const parts = coordinate.split(/([:/-])/);
    const family = coordinate.charAt(0).toUpperCase();
    return (
        <span
            className="symbolic-coordinate-string"
            data-family={family || 'unknown'}
            data-testid="symbolic-coordinate-string"
            aria-label={`Symbolic coordinate ${coordinate}`}
        >
            {parts.map((part, index) => (
                <span
                    key={`${index}:${part}`}
                    data-symbolic-part={/^[A-Za-z0-9#'.?]+$/.test(part) ? 'term' : 'operator'}
                >
                    {part}
                </span>
            ))}
        </span>
    );
}

/** Carries the shared provenance state on a surface boundary. */
export function ProvenanceBorder(props: {
    readonly state: import('./ProvenanceBadge').ProvenanceState;
    readonly children: ReactNode;
}) {
    return (
        <div
            className={`provenance-border provenance-border-${props.state}`}
            data-provenance={props.state}
            data-testid="provenance-border"
        >
            {props.children}
        </div>
    );
}

// ── The 30.6 state grammar: empty · loading · pending · blocked ─────────────
// Four states a binding can be in when it has no datum to show, plus the chip
// that annotates one that does. All five are typed on the nine-id taxonomy and
// all five surface `ownerTrack`, so a reader can always tell WHICH axis is down
// and WHO owns it. Per-id colour comes from `readiness.id.<id>` — never a
// generic amber — and every one of them keeps a text equivalent, because the
// colour is an aid to the reading and not the reading itself.

/**
 * A binding with no data and NO readiness blocker — the bridge is fine, there
 * is simply nothing here yet. Distinct from pending (waiting) and from blocked
 * (refused): conflating them is what makes an interface feel broken when it is
 * merely empty.
 */
export function EmptyState(props: {
    /** The consumer's coordinate-family letter; tints the mark to its tier. */
    readonly family?: string;
    /** Onboarding hint — the consumer's words, never invented here. */
    readonly hint: string;
    readonly actionLabel?: string;
    /** Test id for the affordance, so a consumer that already had a named
     *  button (32.11's `start-first-session`) keeps ONE button when it adopts
     *  this primitive rather than growing a second beside it. */
    readonly actionTestId?: string;
    readonly onAction?: () => void;
}) {
    const family = (props.family ?? '').charAt(0).toUpperCase();
    const tint = FAMILY_HUES[family] ?? 'var(--ink-dim)';
    return (
        <div
            className="empty-state"
            data-testid="empty-state"
            data-family={family || 'unknown'}
            aria-label={emptyStateAriaLabel(props.hint)}
            style={{ ['--empty-state-tint' as string]: tint }}
        >
            <span className="empty-state-mark" aria-hidden="true" style={{ color: tint }}>
                ○
            </span>
            <p className="empty-state-hint">{props.hint}</p>
            {props.actionLabel && props.onAction ? (
                <button
                    type="button"
                    className="empty-state-action"
                    data-testid={props.actionTestId}
                    onClick={props.onAction}
                >
                    {props.actionLabel}
                </button>
            ) : null}
        </div>
    );
}

/**
 * A binding awaiting data. Foundation principle 2: when the bridge is available
 * the pulse advances with the profile tick and NO local clock runs — the
 * opacity is a pure function of `tick12`. Only `bridge_unavailable` (no tick is
 * coming) falls back to a local 200ms cycle, and that fallback is a CSS
 * animation rather than a JS timer, so the "no setInterval/rAF in src" law of
 * 30.11 holds without exception.
 *
 * `loadingPulse` is CONTINUOUS motion (30.T30.5): under
 * `prefers-reduced-motion: reduce` styles.css stops it dead and pins opacity —
 * the wait stays legible through the text equivalent, which never animates.
 */
export function LoadingPulse(props: {
    readonly family?: string;
    /** Which axis we are waiting on; `bridge_unavailable` takes the fallback. */
    readonly readinessId?: BridgeReadinessId;
    /** What is being awaited, in the consumer's words. */
    readonly label?: string;
}) {
    const readinessId = props.readinessId ?? 'ready_public_current';
    const bridgeless = readinessId === 'bridge_unavailable';
    const tick = useProfileTick();
    const family = (props.family ?? '').charAt(0).toUpperCase();
    const tint = FAMILY_HUES[family] ?? 'var(--ink-dim)';
    const label = props.label ?? 'Loading';
    // Tick-driven: opacity IS the tick, so the pulse cannot drift from the
    // clock the rest of the shell renders on. Bridgeless: leave opacity to CSS.
    const opacity = bridgeless ? undefined : loadingPulseOpacity(loadingPulsePhase(tick.tick12));

    return (
        <span
            className={`loading-pulse ${bridgeless ? 'loading-pulse-local' : 'loading-pulse-tick'}`}
            data-testid="loading-pulse"
            data-family={family || 'unknown'}
            data-readiness={readinessId}
            data-clock={bridgeless ? 'local' : 'profile-tick'}
            data-tick={tick.tick12 ?? 'none'}
            role="status"
            aria-live="polite"
            aria-label={`${label}, waiting`}
        >
            <span className="loading-pulse-mark" aria-hidden="true" style={{ color: tint, opacity }} />
            <span className="loading-pulse-label">{label}</span>
        </span>
    );
}

/**
 * Inline pending identifier for an absent but named producer or dataset.
 *
 * `id` is the SUBJECT — the binding key or missing field the user is waiting on
 * (`pending: klein_flip_state`). `readinessId` is the taxonomy axis that says
 * why, and it drives the colour and the tooltip. They are different things: one
 * names the datum, the other names the failure.
 */
export function PendingBadge(props: {
    readonly id: string;
    readonly readinessId: BridgeReadinessId;
    readonly reason?: string;
}) {
    return (
        <span
            className="pending-badge"
            data-testid="pending-badge"
            data-readiness={props.readinessId}
            data-owner-track={readinessOwnerTrack(props.readinessId)}
            style={{ ['--readiness-id-colour' as string]: readinessIdColour(props.readinessId) }}
            title={readinessTooltip(props.readinessId, props.reason)}
            aria-label={readinessAriaLabel(props.readinessId, props.reason)}
        >
            pending: {props.id}
        </span>
    );
}

/** The coarse three-state axis kept for surfaces that resolve readiness before
 *  the nine-id taxonomy reaches them. It is a VIEW of the taxonomy, never a
 *  second one — CHROME-CONTRACT §6 forbids a parallel readiness enum. */
export type ReadinessState = 'ready' | 'pending' | 'blocked';

/**
 * Small status chip alongside or within a binding — a dot by default, an icon
 * where the consumer has room. Carries per-id colour and the id + reason +
 * ownerTrack tooltip, so a binding can surface its state without a full badge.
 */
export function ReadinessIndicator(props: {
    readonly readinessId: BridgeReadinessId;
    readonly reason?: string;
    readonly mode?: 'dot' | 'icon';
}) {
    const mode = props.mode ?? 'dot';
    const severity = readinessSeverity(props.readinessId);
    return (
        <span
            className={`readiness-indicator readiness-indicator-${mode} readiness-${severity}`}
            data-testid="readiness-indicator"
            data-readiness={props.readinessId}
            data-severity={severity}
            data-mode={mode}
            data-owner-track={readinessOwnerTrack(props.readinessId)}
            style={{ ['--readiness-id-colour' as string]: readinessIdColour(props.readinessId) }}
            title={readinessTooltip(props.readinessId, props.reason)}
            aria-label={readinessAriaLabel(props.readinessId, props.reason)}
            role="img"
        >
            {mode === 'icon' ? <span className="readiness-indicator-glyph" aria-hidden="true">◑</span> : null}
        </span>
    );
}

/**
 * Full-surface refusal, covering the consumer surface with the reason and a
 * concrete way out. The call-to-action is derived from the id
 * (`readinessRecovery`) and routes through the ONE command registry — so
 * `s5_review_blocked` really opens the OmniPanel Review fold rather than
 * describing it. Ids with no honest recovery render no button at all.
 */
export function BlockedOverlay(props: {
    readonly readinessId: BridgeReadinessId;
    readonly reason?: string;
    /** Override the derived action — used where a consumer owns a better one. */
    readonly actionLabel?: string;
    readonly onAction?: () => void;
}) {
    const recovery = readinessRecovery(props.readinessId);
    const reason = props.reason ?? readinessMeaning(props.readinessId);
    const ownerTrack = readinessOwnerTrack(props.readinessId);
    const overridden = props.actionLabel !== undefined && props.onAction !== undefined;
    const actionLabel = overridden ? props.actionLabel : recovery.commandId ? recovery.label : null;
    const runAction = overridden
        ? props.onAction
        : recovery.commandId
          ? () => {
                void commands.execute(recovery.commandId as string);
            }
          : undefined;

    return (
        <div
            className="blocked-overlay"
            data-testid="blocked-overlay"
            data-readiness={props.readinessId}
            data-owner-track={ownerTrack}
            data-command={recovery.commandId ?? 'none'}
            style={{ ['--readiness-id-colour' as string]: readinessIdColour(props.readinessId) }}
            role="alert"
            aria-label={readinessAriaLabel(props.readinessId, props.reason)}
        >
            <p className="blocked-overlay-reason">{reason}</p>
            <p className="blocked-overlay-owner">owner: track {ownerTrack}</p>
            {actionLabel && runAction ? (
                <button type="button" className="blocked-overlay-action" onClick={runAction}>
                    {actionLabel}
                </button>
            ) : null}
        </div>
    );
}
