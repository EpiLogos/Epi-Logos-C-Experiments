/**
 * Coordinate: M' M3' (decan-tarot chain breadcrumb, 24.T24.7)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#n): M3' medicine-chain read surface (presentational).
 * Actualises: the eight-link decan-tarot chain breadcrumb —
 *   card → suit → codon → decan → sign → planet → element → chakra → body zones —
 *   from the resolved {@link TarotDecanChain} (or honest-pending marker).
 * Public surface: M3DecanChainBreadcrumb, M3_DECAN_CHAIN_BREADCRUMB_WIDGET_ID,
 *   DecanChainStep.
 * Does NOT own: the bridge call, correspondence LUTs, or body data. The chain is
 *   resolved by {@link TarotDecanService.resolveChain}; the renderer only displays
 *   it. Card + suit are the locally-knowable head (parsed from the card key via the
 *   service helpers); every other link is protected S2 authority — honest-pending
 *   until the bridge supplies it.
 * Contract: [[M3'-SPEC]] + rerun [[24-m3-mahamaya-frontend-deep]] 24.7.
 */

import { alchemicalElementName } from '../engine/elementRegisters';
import {
    cardLabelFromCardKey,
    isResolvedChain,
    suitFromCardKey,
    type TarotCardKey,
    type TarotDecanChain,
    type TarotDecanChainPending
} from '../services/m3/TarotDecanService';

export const M3_DECAN_CHAIN_BREADCRUMB_WIDGET_ID = 'pratibimba.m3-mahamaya:decan-chain-breadcrumb';

/** The nine ordered links of the decan-tarot chain, in breadcrumb order. */
export type DecanChainStep =
    | 'card'
    | 'suit'
    | 'codon'
    | 'decan'
    | 'sign'
    | 'planet'
    | 'element'
    | 'chakra'
    | 'body-zones';

const STEP_LABELS: Readonly<Record<DecanChainStep, string>> = Object.freeze({
    card: 'Card',
    suit: 'Suit',
    codon: 'Codon',
    decan: 'Decan',
    sign: 'Sign',
    planet: 'Planet',
    element: 'Element',
    chakra: 'Chakra',
    'body-zones': 'Body Zones'
});

const STEP_ORDER: readonly DecanChainStep[] = Object.freeze([
    'card', 'suit', 'codon', 'decan', 'sign', 'planet', 'element', 'chakra', 'body-zones'
]);

export interface M3DecanChainBreadcrumbProps {
    /** Card key to walk. Drives the locally-knowable head when the chain is pending. */
    readonly card: TarotCardKey;
    /** Resolved chain, honest-pending marker, or null (not yet resolved). */
    readonly chain: TarotDecanChain | TarotDecanChainPending | null;
    /** Notified when a chip is clicked (surfaces the corresponding sub-panel). */
    readonly onChipClick?: (step: DecanChainStep) => void;
}

interface ChipModel {
    readonly step: DecanChainStep;
    readonly label: string;
    readonly value: string | null;
    readonly resolved: boolean;
}

export function M3DecanChainBreadcrumb({ card, chain, onChipClick }: M3DecanChainBreadcrumbProps) {
    const resolved = chain !== null && isResolvedChain(chain);
    const chips = resolved
        ? chipsFromChain(chain)
        : chipsFromCardKeyHead(card);
    const resolvedCount = chips.filter(chip => chip.resolved).length;
    const chainState = resolvedCount === STEP_ORDER.length ? 'ready' : 'pending';

    return (
        <section
            className="m3-decan-chain-breadcrumb"
            aria-label="Decan-tarot chain, card to body zones"
            data-testid="decan-chain-breadcrumb"
            data-widget-id={M3_DECAN_CHAIN_BREADCRUMB_WIDGET_ID}
            data-rpc-method="s2.codon.scalar_ref.read"
            data-card-key={card}
            data-chain-state={chainState}
            data-resolved-count={resolvedCount}
            data-step-count={STEP_ORDER.length}
        >
            <header className="m3-decan-chain-breadcrumb-header">
                <h4>Decan chain</h4>
                <span className="m3-decan-chain-breadcrumb-count" data-testid="decan-chain-count">
                    {resolvedCount}/{STEP_ORDER.length}
                </span>
            </header>
            <ol className="m3-decan-chain-breadcrumb-chain">
                {chips.map((chip, index) => (
                    <li
                        key={chip.step}
                        className="m3-decan-chain-breadcrumb-item"
                        data-decan-chain-chip={chip.step}
                        data-state={chip.resolved ? 'resolved' : 'pending'}
                    >
                        <button
                            type="button"
                            className="m3-decan-chain-breadcrumb-chip"
                            data-testid={`decan-chain-chip-${chip.step}`}
                            onClick={() => onChipClick?.(chip.step)}
                        >
                            <span className="m3-decan-chain-breadcrumb-chip-label">{chip.label}</span>
                            {chip.resolved ? (
                                <span className="m3-decan-chain-breadcrumb-chip-value">{chip.value}</span>
                            ) : (
                                <span
                                    className="m3-decan-chain-breadcrumb-chip-pending"
                                    data-testid={`pending-${chip.step}`}
                                >
                                    —
                                </span>
                            )}
                        </button>
                        {index < chips.length - 1 && (
                            <span aria-hidden="true" className="m3-decan-chain-breadcrumb-arrow">
                                →
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </section>
    );
}

export default M3DecanChainBreadcrumb;

// ============================================================================
// Chip models — resolved from the full chain, or the locally-knowable head only.
// ============================================================================

function chipsFromChain(chain: TarotDecanChain): ChipModel[] {
    return [
        chip('card', cardLabelFromCardKey(chain.card)),
        chip('suit', capitalise(chain.suit)),
        chip('codon', `0x${chain.codonId.toString(16).toUpperCase().padStart(2, '0')}`),
        chip('decan', `#${String(chain.decanIndex).padStart(2, '0')}`),
        chip('sign', String(chain.zodiacSign)),
        chip('planet', String(chain.rulingPlanet)),
        // Render the element's NAME. A bare integer is unreadable AND
        // register-ambiguous — "2" is Water in the alchemical register and Agni
        // (fire) in [[M2-2]]'s Mahābhūta register, and the chip gave the reader
        // no way to tell which one it was looking at.
        chip('element', alchemicalElementName(chain.elementId) ?? String(chain.elementId)),
        chip('chakra', String(chain.chakraId)),
        chip('body-zones', chain.bodyZones.join(', '))
    ];
}

/**
 * When the chain is pending, only `card` (and its `suit` for a minor card) is
 * locally knowable from the card key; every downstream link stays honest-pending.
 */
function chipsFromCardKeyHead(card: TarotCardKey): ChipModel[] {
    const suit = suitFromCardKey(card);
    return STEP_ORDER.map(step => {
        if (step === 'card') {
            return chip('card', cardLabelFromCardKey(card));
        }
        if (step === 'suit') {
            return suit ? chip('suit', capitalise(suit)) : pendingChip('suit');
        }
        return pendingChip(step);
    });
}

function chip(step: DecanChainStep, value: string): ChipModel {
    const trimmed = value.trim();
    return { step, label: STEP_LABELS[step], value: trimmed.length > 0 ? trimmed : null, resolved: trimmed.length > 0 };
}

function pendingChip(step: DecanChainStep): ChipModel {
    return { step, label: STEP_LABELS[step], value: null, resolved: false };
}

function capitalise(value: string): string {
    return value.length > 0 ? value[0].toUpperCase() + value.slice(1) : value;
}
