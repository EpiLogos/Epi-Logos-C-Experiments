// Per-hexagram chakra-ID + body-zone resolver for the m3-mahamaya M-extension
// (24.T24.8).
//
// `HexagramBodyDynamicsService` resolves a King Wen hexagram number (1..64) into
// its canonical body-dynamics entry: the two chakra seats the hexagram couples
// (primary / secondary), the named body zones it activates, and a one-line
// dynamics gloss. This is the I-Ching arm of the [[M3']] Mahamaya medicine route
// — the hexagram→body half-step that meets the decan-tarot chain at the body.
//
// The body map IS local canonical data. `HEXAGRAM_BODY_DYNAMICS[64]` is the
// 1:1 mirror of the kernel's `HEXAGRAM_BODY_DYNAMICS` LUT
// (`Body/S/S0/epi-cli/src/nara/oracle_identity.rs`), itself derived from the M3
// Mahamaya dataset `bodyDynamics` field at coordinates `#3-1-X-Y`. Index `i`
// corresponds to hexagram `i + 1`. Because this is symbolic LUT data (not
// protected per-user oracle authority), the service owns it locally rather than
// reading it over the bridge — the renderer never reaches into a kernel crate.
//
// The optional bridge handle is used ONLY to enrich a *live* world-clock body
// resonance for the active hexagram (`s3.world_clock.hexagram.body_resonance`);
// it never supplies the body map itself, and the service degrades to the local
// LUT when the bridge is absent or not ready.
//
// Chakra-ID encoding (matches the kernel LUT, NOT the 0-indexed
// `CHAKRA_BODY_ZONES[8]` used by the decan-tarot chain):
//   0 = Earth / ground, 1 = Muladhara, 2 = Svadhisthana, 3 = Manipura,
//   4 = Anahata, 5 = Vishuddha, 6 = Ajna, 7 = Sahasrara.
//
// Bound `inSingletonScope`, addressed through {@link M3_HEXAGRAM_BODY_DYNAMICS_SERVICE}
// (DI symbol discipline). Direct imports of the S0 kernel crates, the S2/S3
// substrate, or the portal core are forbidden (compositionBoundary.forbiddenImports).

import { inject, injectable, optional } from '@theia/core/shared/inversify';
import { SharedBridgeAdapter, SHARED_BRIDGE_ADAPTER } from '@pratibimba/m-extension-runtime';

export const M3_HEXAGRAM_BODY_DYNAMICS_SERVICE = Symbol('PratibimbaM3HexagramBodyDynamicsService');

/** Optional live world-clock body-resonance enrichment for the active hexagram. */
export const M3_HEXAGRAM_BODY_RPC = 's3.world_clock.hexagram.body_resonance';

export const M3_HEXAGRAM_BODY_COUNT = 64;

/**
 * Chakra names indexed by the kernel hexagram chakra-ID encoding (0..7).
 * Index 0 is the Earth / ground seat used when a hexagram does not couple a
 * named subtle-body centre.
 */
export const M3_HEXAGRAM_CHAKRA_NAMES: readonly string[] = Object.freeze([
    'Earth',        // 0 — ground / none
    'Muladhara',    // 1
    'Svadhisthana', // 2
    'Manipura',     // 3
    'Anahata',      // 4
    'Vishuddha',    // 5
    'Ajna',         // 6
    'Sahasrara'     // 7
]);

/** Resolve a hexagram chakra-ID (0..7) to its chakra name, or null when out of range. */
export function chakraNameForId(chakraId: number | null | undefined): string | null {
    if (chakraId === null || chakraId === undefined || !Number.isInteger(chakraId)) {
        return null;
    }
    return chakraId >= 0 && chakraId < M3_HEXAGRAM_CHAKRA_NAMES.length
        ? M3_HEXAGRAM_CHAKRA_NAMES[chakraId]
        : null;
}

export interface M3HexagramBodyEntry {
    /** King Wen hexagram number, 1..64. */
    readonly hexagramNumber: number;
    /** Hexagram name + trigram pairing, e.g. "Qian — The Creative (Heaven/Heaven)". */
    readonly name: string;
    /** Primary chakra ID (kernel encoding 0..7). */
    readonly primaryChakraId: number;
    /** Secondary chakra ID (kernel encoding 0..7). */
    readonly secondaryChakraId: number;
    /** Primary chakra name resolved from {@link M3_HEXAGRAM_CHAKRA_NAMES}. */
    readonly primaryChakra: string;
    /** Secondary chakra name resolved from {@link M3_HEXAGRAM_CHAKRA_NAMES}. */
    readonly secondaryChakra: string;
    /** Named body zones the hexagram activates (lowercase). */
    readonly bodyZones: readonly string[];
    /** One-line body-dynamics gloss (≤80 chars, from the M3 dataset). */
    readonly dynamics: string;
    /**
     * Optional live world-clock body-resonance score (0..1) for the active
     * hexagram, supplied by the bridge. Absent for plain LUT lookups.
     */
    readonly resonance?: number;
}

/**
 * Minimal resolver surface the viewer component depends on, so the
 * presentational component never has to import the concrete DI service.
 */
export interface M3HexagramBodyResolver {
    /** Local LUT lookup — synchronous, never fails for a valid 1..64 number. */
    lookup(hexagramNumber: number | null | undefined): M3HexagramBodyEntry | null;
    /** Lookup augmented with an optional live body-resonance from the bridge. */
    resolveBody(hexagramNumber: number | null | undefined): Promise<M3HexagramBodyEntry | null>;
}

// ============================================================================
// Internal LUT shape — the raw 64-row table (chakra IDs + zones + gloss). Chakra
// *names* are derived once at module load from M3_HEXAGRAM_CHAKRA_NAMES so the
// encoding lives in exactly one place.
// ============================================================================

interface RawHexagramBodyRow {
    readonly name: string;
    readonly primaryChakraId: number;
    readonly secondaryChakraId: number;
    readonly bodyZones: readonly string[];
    readonly dynamics: string;
}

const RAW_HEXAGRAM_BODY_DYNAMICS: readonly RawHexagramBodyRow[] = Object.freeze([
    { name: 'Qian — The Creative (Heaven/Heaven)', primaryChakraId: 6, secondaryChakraId: 6, bodyZones: ['head', 'lungs'], dynamics: 'Head/Lungs governing Head/Lungs' },
    { name: 'Kun — The Receptive (Earth/Earth)', primaryChakraId: 3, secondaryChakraId: 3, bodyZones: ['abdomen', 'spleen'], dynamics: 'Abdomen/Spleen nurturing Abdomen/Spleen' },
    { name: 'Zhun — Difficulty at the Beginning (Water/Thunder)', primaryChakraId: 1, secondaryChakraId: 2, bodyZones: ['feet', 'liver', 'kidneys', 'ears'], dynamics: 'Feet/Liver struggling with Kidneys/Ears' },
    { name: 'Meng — Youthful Folly (Mountain/Water)', primaryChakraId: 2, secondaryChakraId: 1, bodyZones: ['kidneys', 'ears', 'back', 'hands', 'joints'], dynamics: 'Kidneys/Ears contained by Back/Hands/Joints' },
    { name: 'Xu — Waiting / Nourishment (Water/Heaven)', primaryChakraId: 6, secondaryChakraId: 2, bodyZones: ['head', 'lungs', 'kidneys', 'ears'], dynamics: 'Head/Lungs waiting beneath Kidneys/Ears' },
    { name: 'Song — Conflict (Heaven/Water)', primaryChakraId: 2, secondaryChakraId: 6, bodyZones: ['kidneys', 'ears', 'head', 'lungs'], dynamics: 'Kidneys/Ears confronting Head/Lungs' },
    { name: 'Shi — The Army (Earth/Water)', primaryChakraId: 2, secondaryChakraId: 3, bodyZones: ['kidneys', 'ears', 'abdomen', 'spleen'], dynamics: 'Kidneys/Ears organized by Abdomen/Spleen' },
    { name: 'Bi — Holding Together (Water/Earth)', primaryChakraId: 3, secondaryChakraId: 2, bodyZones: ['abdomen', 'spleen', 'kidneys', 'ears'], dynamics: 'Abdomen/Spleen supporting Kidneys/Ears' },
    { name: 'Xiao Chu — Taming Power of the Small (Wind/Heaven)', primaryChakraId: 6, secondaryChakraId: 2, bodyZones: ['head', 'lungs', 'thighs', 'hips'], dynamics: 'Head/Lungs moderated by Thighs/Hips/Respiratory' },
    { name: 'Lu — Treading (Heaven/Lake)', primaryChakraId: 5, secondaryChakraId: 6, bodyZones: ['mouth', 'chest', 'head', 'lungs'], dynamics: 'Mouth/Chest supporting Head/Lungs' },
    { name: 'Tai — Peace (Earth/Heaven)', primaryChakraId: 6, secondaryChakraId: 3, bodyZones: ['head', 'lungs', 'abdomen', 'spleen'], dynamics: 'Head/Lungs rising to meet Abdomen/Spleen' },
    { name: 'Pi — Standstill (Heaven/Earth)', primaryChakraId: 3, secondaryChakraId: 6, bodyZones: ['abdomen', 'spleen', 'head', 'lungs'], dynamics: 'Abdomen/Spleen separated from Head/Lungs' },
    { name: 'Tong Ren — Fellowship (Heaven/Fire)', primaryChakraId: 4, secondaryChakraId: 6, bodyZones: ['eyes', 'heart', 'head', 'lungs'], dynamics: 'Eyes/Heart illuminating Head/Lungs' },
    { name: 'Da You — Great Possession (Fire/Heaven)', primaryChakraId: 6, secondaryChakraId: 4, bodyZones: ['head', 'lungs', 'eyes', 'heart'], dynamics: 'Head/Lungs crowned by Eyes/Heart' },
    { name: 'Qian — Modesty (Earth/Mountain)', primaryChakraId: 1, secondaryChakraId: 3, bodyZones: ['back', 'hands', 'joints', 'abdomen', 'spleen'], dynamics: 'Back/Hands/Joints hidden by Abdomen/Spleen' },
    { name: 'Yu — Enthusiasm (Thunder/Earth)', primaryChakraId: 3, secondaryChakraId: 1, bodyZones: ['abdomen', 'spleen', 'feet', 'liver'], dynamics: 'Abdomen/Spleen mobilized by Feet/Liver' },
    { name: 'Sui — Following (Lake/Thunder)', primaryChakraId: 1, secondaryChakraId: 5, bodyZones: ['feet', 'liver', 'mouth', 'chest'], dynamics: 'Feet/Liver followed by Mouth/Chest' },
    { name: 'Gu — Work on Spoiled (Mountain/Wind)', primaryChakraId: 2, secondaryChakraId: 1, bodyZones: ['thighs', 'hips', 'back', 'hands', 'joints'], dynamics: 'Thighs/Hips/Respiratory blocked by Back/Hands/Joints' },
    { name: 'Lin — Approach (Earth/Lake)', primaryChakraId: 5, secondaryChakraId: 3, bodyZones: ['mouth', 'chest', 'abdomen', 'spleen'], dynamics: 'Mouth/Chest nurtured by Abdomen/Spleen' },
    { name: 'Guan — Contemplation (Wind/Earth)', primaryChakraId: 3, secondaryChakraId: 2, bodyZones: ['abdomen', 'spleen', 'thighs', 'hips'], dynamics: 'Abdomen/Spleen observed by Thighs/Hips/Respiratory' },
    { name: 'Shi Ke — Biting Through (Fire/Thunder)', primaryChakraId: 1, secondaryChakraId: 4, bodyZones: ['feet', 'liver', 'eyes', 'heart'], dynamics: 'Feet/Liver illuminated by Eyes/Heart' },
    { name: 'Bi — Grace (Mountain/Fire)', primaryChakraId: 4, secondaryChakraId: 1, bodyZones: ['eyes', 'heart', 'back', 'hands', 'joints'], dynamics: 'Eyes/Heart adorning Back/Hands/Joints' },
    { name: 'Bo — Splitting Apart (Mountain/Earth)', primaryChakraId: 3, secondaryChakraId: 1, bodyZones: ['abdomen', 'spleen', 'back', 'hands', 'joints'], dynamics: 'Abdomen/Spleen withdrawing from Back/Hands/Joints' },
    { name: 'Fu — Return (Earth/Thunder)', primaryChakraId: 3, secondaryChakraId: 1, bodyZones: ['abdomen', 'spleen', 'feet', 'liver'], dynamics: 'Abdomen/Spleen receiving Feet/Liver' },
    { name: 'Wu Wang — Innocence (Heaven/Thunder)', primaryChakraId: 1, secondaryChakraId: 6, bodyZones: ['feet', 'liver', 'head', 'lungs'], dynamics: 'Feet/Liver aligned with Head/Lungs' },
    { name: 'Da Chu — Great Taming (Mountain/Heaven)', primaryChakraId: 6, secondaryChakraId: 1, bodyZones: ['head', 'lungs', 'back', 'hands', 'joints'], dynamics: 'Head/Lungs restrained by Back/Hands/Joints' },
    { name: 'Yi — Nourishment (Mountain/Thunder)', primaryChakraId: 1, secondaryChakraId: 1, bodyZones: ['feet', 'liver', 'back', 'hands', 'joints'], dynamics: 'Feet/Liver stabilized by Back/Hands/Joints' },
    { name: 'Da Guo — Great Exceeding (Lake/Wind)', primaryChakraId: 2, secondaryChakraId: 5, bodyZones: ['thighs', 'hips', 'mouth', 'chest'], dynamics: 'Thighs/Hips/Respiratory overwhelmed by Mouth/Chest' },
    { name: 'Kan — The Abysmal Water (Water/Water)', primaryChakraId: 2, secondaryChakraId: 2, bodyZones: ['kidneys', 'ears'], dynamics: 'Kidneys/Ears deepening Kidneys/Ears' },
    { name: 'Li — The Clinging Fire (Fire/Fire)', primaryChakraId: 4, secondaryChakraId: 4, bodyZones: ['eyes', 'heart'], dynamics: 'Eyes/Heart illuminating Eyes/Heart' },
    { name: 'Xian — Influence (Lake/Mountain)', primaryChakraId: 1, secondaryChakraId: 5, bodyZones: ['back', 'hands', 'joints', 'mouth', 'chest'], dynamics: 'Back/Hands/Joints attracting Mouth/Chest' },
    { name: 'Heng — Duration (Thunder/Wind)', primaryChakraId: 2, secondaryChakraId: 1, bodyZones: ['thighs', 'hips', 'feet', 'liver'], dynamics: 'Thighs/Hips/Respiratory sustaining Feet/Liver' },
    { name: 'Dun — Retreat (Heaven/Mountain)', primaryChakraId: 1, secondaryChakraId: 6, bodyZones: ['back', 'hands', 'joints', 'head', 'lungs'], dynamics: 'Back/Hands/Joints withdrawing from Head/Lungs' },
    { name: 'Da Zhuang — Power of the Great (Thunder/Heaven)', primaryChakraId: 6, secondaryChakraId: 1, bodyZones: ['head', 'lungs', 'feet', 'liver'], dynamics: 'Head/Lungs empowered by Feet/Liver' },
    { name: 'Jin — Progress (Fire/Earth)', primaryChakraId: 3, secondaryChakraId: 4, bodyZones: ['abdomen', 'spleen', 'eyes', 'heart'], dynamics: 'Abdomen/Spleen illuminated by Eyes/Heart' },
    { name: 'Ming Yi — Darkening of the Light (Earth/Fire)', primaryChakraId: 4, secondaryChakraId: 3, bodyZones: ['eyes', 'heart', 'abdomen', 'spleen'], dynamics: 'Eyes/Heart concealed by Abdomen/Spleen' },
    { name: 'Jia Ren — The Family (Wind/Fire)', primaryChakraId: 4, secondaryChakraId: 2, bodyZones: ['eyes', 'heart', 'thighs', 'hips'], dynamics: 'Eyes/Heart guided by Thighs/Hips/Respiratory' },
    { name: 'Kui — Opposition (Fire/Lake)', primaryChakraId: 5, secondaryChakraId: 4, bodyZones: ['mouth', 'chest', 'eyes', 'heart'], dynamics: 'Mouth/Chest opposing Eyes/Heart' },
    { name: 'Jian — Obstruction (Water/Mountain)', primaryChakraId: 1, secondaryChakraId: 2, bodyZones: ['back', 'hands', 'joints', 'kidneys', 'ears'], dynamics: 'Back/Hands/Joints blocked by Kidneys/Ears' },
    { name: 'Xie — Deliverance (Thunder/Water)', primaryChakraId: 2, secondaryChakraId: 1, bodyZones: ['kidneys', 'ears', 'feet', 'liver'], dynamics: 'Kidneys/Ears liberated by Feet/Liver' },
    { name: 'Sun — Decrease (Mountain/Lake)', primaryChakraId: 5, secondaryChakraId: 1, bodyZones: ['mouth', 'chest', 'back', 'hands', 'joints'], dynamics: 'Mouth/Chest refined by Back/Hands/Joints' },
    { name: 'Yi — Increase (Wind/Thunder)', primaryChakraId: 1, secondaryChakraId: 2, bodyZones: ['feet', 'liver', 'thighs', 'hips'], dynamics: 'Feet/Liver enhanced by Thighs/Hips/Respiratory' },
    { name: 'Guai — Breakthrough (Lake/Heaven)', primaryChakraId: 6, secondaryChakraId: 5, bodyZones: ['head', 'lungs', 'mouth', 'chest'], dynamics: 'Head/Lungs overwhelmed by Mouth/Chest' },
    { name: 'Gou — Coming to Meet (Heaven/Wind)', primaryChakraId: 2, secondaryChakraId: 6, bodyZones: ['thighs', 'hips', 'head', 'lungs'], dynamics: 'Thighs/Hips/Respiratory infiltrating Head/Lungs' },
    { name: 'Cui — Gathering (Lake/Earth)', primaryChakraId: 3, secondaryChakraId: 5, bodyZones: ['abdomen', 'spleen', 'mouth', 'chest'], dynamics: 'Abdomen/Spleen gathering Mouth/Chest' },
    { name: 'Sheng — Pushing Upward (Earth/Wind)', primaryChakraId: 2, secondaryChakraId: 3, bodyZones: ['thighs', 'hips', 'abdomen', 'spleen'], dynamics: 'Thighs/Hips/Respiratory rising through Abdomen/Spleen' },
    { name: 'Kun — Oppression / Exhaustion (Lake/Water)', primaryChakraId: 2, secondaryChakraId: 5, bodyZones: ['kidneys', 'ears', 'mouth', 'chest'], dynamics: 'Kidneys/Ears exhausted by Mouth/Chest' },
    { name: 'Jing — The Well (Water/Wind)', primaryChakraId: 2, secondaryChakraId: 2, bodyZones: ['thighs', 'hips', 'kidneys', 'ears'], dynamics: 'Thighs/Hips/Respiratory drawing from Kidneys/Ears' },
    { name: 'Ge — Revolution (Lake/Fire)', primaryChakraId: 4, secondaryChakraId: 5, bodyZones: ['eyes', 'heart', 'mouth', 'chest'], dynamics: 'Eyes/Heart transforming Mouth/Chest' },
    { name: 'Ding — The Cauldron (Fire/Wind)', primaryChakraId: 2, secondaryChakraId: 4, bodyZones: ['thighs', 'hips', 'eyes', 'heart'], dynamics: 'Thighs/Hips/Respiratory nourishing Eyes/Heart' },
    { name: 'Zhen — The Arousing Thunder (Thunder/Thunder)', primaryChakraId: 1, secondaryChakraId: 1, bodyZones: ['feet', 'liver'], dynamics: 'Feet/Liver doubled' },
    { name: 'Gen — Keeping Still Mountain (Mountain/Mountain)', primaryChakraId: 1, secondaryChakraId: 1, bodyZones: ['back', 'hands', 'joints'], dynamics: 'Back/Hands/Joints doubled' },
    { name: 'Jian — Development / Gradual Progress (Wind/Mountain)', primaryChakraId: 1, secondaryChakraId: 2, bodyZones: ['back', 'hands', 'joints', 'thighs', 'hips'], dynamics: 'Back/Hands/Joints supporting Thighs/Hips/Respiratory' },
    { name: 'Gui Mei — The Marrying Maiden (Thunder/Lake)', primaryChakraId: 5, secondaryChakraId: 1, bodyZones: ['mouth', 'chest', 'feet', 'liver'], dynamics: 'Mouth/Chest subordinated to Feet/Liver' },
    { name: 'Feng — Abundance (Thunder/Fire)', primaryChakraId: 4, secondaryChakraId: 1, bodyZones: ['eyes', 'heart', 'feet', 'liver'], dynamics: 'Eyes/Heart amplified by Feet/Liver' },
    { name: 'Lu — The Wanderer (Fire/Mountain)', primaryChakraId: 1, secondaryChakraId: 4, bodyZones: ['back', 'hands', 'joints', 'eyes', 'heart'], dynamics: 'Back/Hands/Joints illuminated by Eyes/Heart' },
    { name: 'Xun — The Gentle Wind (Wind/Wind)', primaryChakraId: 2, secondaryChakraId: 2, bodyZones: ['thighs', 'hips'], dynamics: 'Thighs/Hips/Respiratory doubled' },
    { name: 'Dui — The Joyous Lake (Lake/Lake)', primaryChakraId: 5, secondaryChakraId: 5, bodyZones: ['mouth', 'chest'], dynamics: 'Mouth/Chest doubled' },
    { name: 'Huan — Dispersion (Wind/Water)', primaryChakraId: 2, secondaryChakraId: 2, bodyZones: ['kidneys', 'ears', 'thighs', 'hips'], dynamics: 'Kidneys/Ears dispersed by Thighs/Hips/Respiratory' },
    { name: 'Jie — Limitation (Water/Lake)', primaryChakraId: 5, secondaryChakraId: 2, bodyZones: ['mouth', 'chest', 'kidneys', 'ears'], dynamics: 'Mouth/Chest limited by Kidneys/Ears' },
    { name: 'Zhong Fu — Inner Truth (Wind/Lake)', primaryChakraId: 5, secondaryChakraId: 2, bodyZones: ['mouth', 'chest', 'thighs', 'hips'], dynamics: 'Mouth/Chest penetrated by Thighs/Hips/Respiratory' },
    { name: 'Xiao Guo — Small Exceeding (Thunder/Mountain)', primaryChakraId: 1, secondaryChakraId: 1, bodyZones: ['back', 'hands', 'joints', 'feet', 'liver'], dynamics: 'Back/Hands/Joints shaken by Feet/Liver' },
    { name: 'Ji Ji — After Completion (Water/Fire)', primaryChakraId: 4, secondaryChakraId: 2, bodyZones: ['eyes', 'heart', 'kidneys', 'ears'], dynamics: 'Eyes/Heart balanced by Kidneys/Ears' },
    { name: 'Wei Ji — Before Completion (Fire/Water)', primaryChakraId: 2, secondaryChakraId: 4, bodyZones: ['kidneys', 'ears', 'eyes', 'heart'], dynamics: 'Kidneys/Ears seeking Eyes/Heart' }
]);

/**
 * HEXAGRAM_BODY_DYNAMICS[i] corresponds to King Wen hexagram number `i + 1`.
 * The complete 64-row canonical body map, with chakra names resolved from the
 * single {@link M3_HEXAGRAM_CHAKRA_NAMES} encoding.
 */
export const HEXAGRAM_BODY_DYNAMICS: readonly M3HexagramBodyEntry[] = Object.freeze(
    RAW_HEXAGRAM_BODY_DYNAMICS.map((row, index) => Object.freeze({
        hexagramNumber: index + 1,
        name: row.name,
        primaryChakraId: row.primaryChakraId,
        secondaryChakraId: row.secondaryChakraId,
        primaryChakra: chakraNameForId(row.primaryChakraId) ?? 'Earth',
        secondaryChakra: chakraNameForId(row.secondaryChakraId) ?? 'Earth',
        bodyZones: Object.freeze([...row.bodyZones]),
        dynamics: row.dynamics
    } as M3HexagramBodyEntry))
);

/** Resolve a King Wen hexagram number (1..64) to its body entry, or null. */
export function hexagramBodyLookup(
    hexagramNumber: number | null | undefined
): M3HexagramBodyEntry | null {
    if (hexagramNumber === null || hexagramNumber === undefined || !Number.isFinite(hexagramNumber)) {
        return null;
    }
    const id = Math.floor(hexagramNumber);
    return id >= 1 && id <= M3_HEXAGRAM_BODY_COUNT ? HEXAGRAM_BODY_DYNAMICS[id - 1] : null;
}

// ============================================================================
// The service — owns the local LUT, optionally enriches with live resonance.
// ============================================================================

@injectable()
export class HexagramBodyDynamicsService implements M3HexagramBodyResolver {
    constructor(
        @inject(SHARED_BRIDGE_ADAPTER)
        @optional()
        protected readonly bridge?: Pick<SharedBridgeAdapter, 'invokeGatewayRpc'>
    ) {}

    lookup(hexagramNumber: number | null | undefined): M3HexagramBodyEntry | null {
        return hexagramBodyLookup(hexagramNumber);
    }

    async resolveBody(hexagramNumber: number | null | undefined): Promise<M3HexagramBodyEntry | null> {
        const entry = this.lookup(hexagramNumber);
        if (!entry || !this.bridge) {
            return entry;
        }
        let resonance: number | undefined;
        try {
            const detail = await this.bridge.invokeGatewayRpc(M3_HEXAGRAM_BODY_RPC, {
                hexagramNumber: entry.hexagramNumber
            });
            resonance = readResonance(detail);
        } catch {
            // Bridge not ready / world-clock body resonance unavailable. The local
            // LUT entry is always sufficient on its own.
            resonance = undefined;
        }
        return resonance === undefined ? entry : Object.freeze({ ...entry, resonance });
    }
}

// ============================================================================
// Defensive reader — the bridge detail body is shaped by S3, never trusted.
// ============================================================================

function readResonance(detail: unknown): number | undefined {
    if (!detail || typeof detail !== 'object') {
        return undefined;
    }
    const outer = detail as Record<string, unknown>;
    const inner = outer.detail && typeof outer.detail === 'object'
        ? (outer.detail as Record<string, unknown>)
        : outer;
    for (const key of ['resonance', 'bodyResonance', 'score']) {
        const raw = inner[key];
        if (typeof raw === 'number' && Number.isFinite(raw)) {
            return raw;
        }
    }
    return undefined;
}
