// Tarot → decan → body chain resolver for the m3-mahamaya M-extension (24.T24.7).
//
// `TarotDecanService` resolves a single Tarot card key into the canonical
// decan-tarot chain that the [[M3']] Mahamaya medicine route walks:
//
//   card → suit → codon → decan → planet → element → chakra → body zone
//
// The service is a passive resolver. It never fabricates oracle authority: the
// suit/codon/decan/planet/element/chakra correspondences for a card live in the
// protected S2 scalar-oracle library and are read through the kernel bridge via
// `s2.codon.scalar_ref.read` (the same protected scalar ref the Tarot wheel turns
// to — the protected artifact body never enters the renderer). The ONLY body
// data the service owns locally is the canonical `CHAKRA_BODY_ZONES[8]` LUT,
// indexed by `Chakra_Id`, which is the single arrival point for every route
// (planet / decan / tarot) per the M4 medicine chain. Body zone is therefore
// always resolved locally from the chakra id the bridge supplies.
//
// Bound `inSingletonScope`, addressed through {@link M3_TAROT_DECAN_SERVICE}
// (DI symbol discipline). Direct imports of the S0 kernel crates, the M4 oracle
// and medicine modules, or the portal core are forbidden
// (compositionBoundary.forbiddenImports) — every authoritative field arrives
// over the bridge, never from a kernel crate.

import { inject, injectable } from '@theia/core/shared/inversify';
import { SharedBridgeAdapter, SHARED_BRIDGE_ADAPTER } from '@pratibimba/m-extension-runtime';

export const M3_TAROT_DECAN_SERVICE = Symbol('PratibimbaM3TarotDecanService');

/** Protected scalar-oracle read RPC — body never enters the renderer. */
export const M3_TAROT_DECAN_RPC = 's2.codon.scalar_ref.read';
export const M3_TAROT_DECAN_REF_KIND = 'tarot';

/** The eight ordered links of the decan-tarot chain. */
export type M3DecanChainStep =
    | 'card'
    | 'suit'
    | 'codon'
    | 'decan'
    | 'planet'
    | 'element'
    | 'chakra'
    | 'body-zone';

export const M3_DECAN_CHAIN_STEPS: readonly M3DecanChainStep[] = Object.freeze([
    'card', 'suit', 'codon', 'decan', 'planet', 'element', 'chakra', 'body-zone'
]);

export type M3DecanLinkState = 'resolved' | 'pending';

export interface M3DecanChainLink {
    readonly step: M3DecanChainStep;
    /** Human label for the chain position, e.g. "Decan". */
    readonly label: string;
    /** Resolved value, or `null` when the bridge has not supplied it yet. */
    readonly value: string | null;
    /** Optional secondary detail (title attribute / hover). */
    readonly detail?: string;
    readonly state: M3DecanLinkState;
}

export type M3DecanChainSource =
    | 's2-scalar-oracle-ref'
    | 'card-key-derivation'
    | 'pending';

export interface M3DecanChain {
    readonly cardKey: string;
    /** Eight links in `card → … → body-zone` order. */
    readonly links: readonly M3DecanChainLink[];
    readonly source: M3DecanChainSource;
    /** Resolved `Chakra_Id` (0..7) the body zone was looked up with, or null. */
    readonly chakraId: number | null;
    /** Final body zone, looked up from `CHAKRA_BODY_ZONES[chakraId]`. */
    readonly bodyZone: string | null;
}

/**
 * Minimal resolver surface the breadcrumb component depends on, so the
 * presentational component never has to import the concrete DI service.
 */
export interface M3DecanChainResolver {
    resolveChain(cardKey: string): Promise<M3DecanChain>;
}

// ============================================================================
// The ONE LUT — CHAKRA_BODY_ZONES[8] indexed by Chakra_Id.
//
// Every route (planet / decan / tarot) arrives here: a resolved chakra id is the
// single key into the body. Indices follow the canonical ascending order
// Muladhara(0) → Bindu(7); the eighth seat is the transpersonal soma centre.
// ============================================================================

export interface M3ChakraBodyZone {
    readonly chakra: string;
    readonly bodyZone: string;
}

export const CHAKRA_BODY_ZONES: readonly M3ChakraBodyZone[] = Object.freeze([
    Object.freeze({ chakra: 'Muladhara', bodyZone: 'base of spine, legs, skeletal frame' }), // 0
    Object.freeze({ chakra: 'Svadhisthana', bodyZone: 'sacrum, pelvis, reproductive organs' }), // 1
    Object.freeze({ chakra: 'Manipura', bodyZone: 'solar plexus, stomach, digestive organs' }), // 2
    Object.freeze({ chakra: 'Anahata', bodyZone: 'heart, lungs, circulatory system' }), // 3
    Object.freeze({ chakra: 'Vishuddha', bodyZone: 'throat, thyroid, neck, voice' }), // 4
    Object.freeze({ chakra: 'Ajna', bodyZone: 'brow, pituitary, eyes, lower brain' }), // 5
    Object.freeze({ chakra: 'Sahasrara', bodyZone: 'crown, pineal, cerebral cortex' }), // 6
    Object.freeze({ chakra: 'Bindu', bodyZone: 'transpersonal axis, soma centre' }) // 7
]);

/** The eight chakra seats this LUT addresses. */
export const M3_CHAKRA_COUNT = CHAKRA_BODY_ZONES.length;

/** Resolve a `Chakra_Id` (0..7) to its body zone, or null when out of range. */
export function bodyZoneForChakraId(chakraId: number | null): M3ChakraBodyZone | null {
    if (chakraId === null || !Number.isInteger(chakraId)) {
        return null;
    }
    return chakraId >= 0 && chakraId < CHAKRA_BODY_ZONES.length ? CHAKRA_BODY_ZONES[chakraId] : null;
}

// ============================================================================
// Card-key derivation — the locally-knowable head of the chain.
//
// `card` and `suit`/`element` can be derived from the card key alone; the
// remaining links are protected oracle authority read over the bridge.
// ============================================================================

interface SuitDescriptor {
    readonly label: string;
    readonly element: string;
}

const SUIT_BY_ID: Readonly<Record<string, SuitDescriptor>> = Object.freeze({
    wands: { label: 'Wands', element: 'Fire' },
    cups: { label: 'Cups', element: 'Water' },
    swords: { label: 'Swords', element: 'Air' },
    disks: { label: 'Disks', element: 'Earth' }
});

const RANK_LABEL: Readonly<Record<string, string>> = Object.freeze({
    ace: 'Ace', '02': 'Two', '03': 'Three', '04': 'Four', '05': 'Five',
    '06': 'Six', '07': 'Seven', '08': 'Eight', '09': 'Nine', '10': 'Ten',
    princess: 'Princess', prince: 'Prince', queen: 'Queen', knight: 'Knight'
});

interface CardKeyParts {
    readonly arcana: 'major' | 'minor';
    readonly cardLabel: string;
    readonly suit: SuitDescriptor | null;
}

function parseCardKey(cardKey: string): CardKeyParts {
    const [head, tail] = cardKey.split(':', 2);
    if (head === 'major') {
        const atu = tail !== undefined ? Number.parseInt(tail, 10) : NaN;
        return {
            arcana: 'major',
            cardLabel: Number.isFinite(atu) ? `Atu ${atu}` : cardKey,
            suit: null
        };
    }
    const suit = SUIT_BY_ID[head] ?? null;
    const rank = tail !== undefined ? RANK_LABEL[tail] ?? tail : '';
    const cardLabel = suit && rank ? `${rank} of ${suit.label}` : cardKey;
    return { arcana: 'minor', cardLabel, suit };
}

// ============================================================================
// Chain builder — pure, deterministic over (cardKey, bridge detail).
// ============================================================================

/**
 * Build the eight-link decan-tarot chain from a card key and the (optional)
 * protected scalar-oracle detail record the bridge returned. Body zone is always
 * resolved locally from the chakra id via `CHAKRA_BODY_ZONES[8]`.
 */
export function buildDecanChain(cardKey: string, detail: unknown): M3DecanChain {
    const parts = parseCardKey(cardKey);
    const record = asRecord(detail);

    // Codon / decan / planet are protected oracle authority — bridge only.
    const codon = readString(record, 'codon', 'tarotShadowCodon', 'shadowCodon');
    const decan = readString(record, 'decan', 'decanName', 'decanLabel');
    const planet = readString(record, 'planet', 'rulingPlanet', 'planetName');

    // Element: prefer bridge, else derive from the suit head of the card key.
    const element = readString(record, 'element', 'elementName') ?? parts.suit?.element ?? null;

    // Chakra id is the single key into the body LUT.
    const chakraId = readChakraId(record);
    const zone = bodyZoneForChakraId(chakraId);
    const chakraName = readString(record, 'chakra', 'chakraName') ?? zone?.chakra ?? null;
    const bodyZone = readString(record, 'bodyZone', 'bodyZones', 'bodyPart') ?? zone?.bodyZone ?? null;

    const links: M3DecanChainLink[] = [
        link('card', 'Card', parts.cardLabel, cardKey),
        parts.suit
            ? link('suit', 'Suit', parts.suit.label, `${parts.suit.label} · ${parts.suit.element}`)
            : link('suit', 'Suit', parts.arcana === 'major' ? 'Major arcana' : null, 'trump — no minor suit'),
        link('codon', 'Codon', codon),
        link('decan', 'Decan', decan),
        link('planet', 'Planet', planet),
        link('element', 'Element', element),
        link('chakra', 'Chakra', chakraName, chakraId !== null ? `Chakra_Id ${chakraId}` : undefined),
        link('body-zone', 'Body zone', bodyZone, zone ? `via ${zone.chakra}` : undefined)
    ];

    const source: M3DecanChainSource = record
        ? 's2-scalar-oracle-ref'
        : (parts.suit ? 'card-key-derivation' : 'pending');

    return Object.freeze({
        cardKey,
        links: Object.freeze(links),
        source,
        chakraId,
        bodyZone
    });
}

function link(
    step: M3DecanChainStep,
    label: string,
    value: string | null,
    detail?: string
): M3DecanChainLink {
    return Object.freeze({
        step,
        label,
        value: value && value.length > 0 ? value : null,
        detail,
        state: value && value.length > 0 ? 'resolved' : 'pending'
    });
}

// ============================================================================
// The service — reads the protected scalar ref and builds the chain.
// ============================================================================

@injectable()
export class TarotDecanService implements M3DecanChainResolver {
    constructor(
        @inject(SHARED_BRIDGE_ADAPTER)
        protected readonly bridge: Pick<SharedBridgeAdapter, 'invokeGatewayRpc'>
    ) {}

    async resolveChain(cardKey: string): Promise<M3DecanChain> {
        if (!cardKey) {
            throw new Error('TarotDecanService.resolveChain requires a tarot card key');
        }
        let detail: unknown = null;
        try {
            detail = await this.bridge.invokeGatewayRpc(M3_TAROT_DECAN_RPC, {
                refKind: M3_TAROT_DECAN_REF_KIND,
                scalarRef: cardKey
            });
        } catch {
            // The bridge could not turn to the scalar ref (gateway not ready /
            // protected ref unavailable). Fall back to card-key derivation so the
            // head of the chain (card → suit → element) still renders.
            detail = null;
        }
        return buildDecanChain(cardKey, detail);
    }
}

// ============================================================================
// Defensive readers — the protected detail body is shaped by S2, never trusted.
// ============================================================================

function asRecord(value: unknown): Readonly<Record<string, unknown>> | null {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        // The scalar-ref resolver wraps the public detail under `detail`.
        const outer = value as Record<string, unknown>;
        const inner = outer.detail;
        if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
            return inner as Record<string, unknown>;
        }
        return outer;
    }
    return null;
}

function readString(
    record: Readonly<Record<string, unknown>> | null,
    ...keys: readonly string[]
): string | null {
    if (!record) {
        return null;
    }
    for (const key of keys) {
        const raw = record[key];
        if (typeof raw === 'string' && raw.length > 0) {
            return raw;
        }
        if (typeof raw === 'number' && Number.isFinite(raw)) {
            return String(raw);
        }
        if (Array.isArray(raw)) {
            const parts = raw.filter((v): v is string => typeof v === 'string' && v.length > 0);
            if (parts.length > 0) {
                return parts.join(', ');
            }
        }
    }
    return null;
}

function readChakraId(record: Readonly<Record<string, unknown>> | null): number | null {
    if (!record) {
        return null;
    }
    for (const key of ['chakraId', 'chakra_id', 'chakraIndex']) {
        const raw = record[key];
        if (typeof raw === 'number' && Number.isInteger(raw)) {
            return raw;
        }
    }
    return null;
}
