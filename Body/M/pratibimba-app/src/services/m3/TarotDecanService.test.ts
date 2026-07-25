import { describe, expect, it } from 'vitest';
import type { KernelBridgeCapabilityReceipt } from '../../bridge/types';
import type { M3GatewayPort } from './m3GatewayPort';
import {
    cardLabelFromCardKey,
    isResolvedChain,
    suitFromCardKey,
    TarotDecanService,
    type TarotDecanChain
} from './TarotDecanService';

function receiptWith(artifact: unknown): KernelBridgeCapabilityReceipt {
    return {
        method: 's2.codon.scalar_ref.read',
        gatewayMethod: 's2.codon.scalar_ref.read',
        sessionKey: 'test-session',
        profileGeneration: 1,
        privacyClass: 'public-current-context',
        provenanceHandles: [],
        vak: {
            vakAddress: { cpf: '', ct: '', cp: '', cf: '', cfp: '', cs: '' },
            routeLineage: []
        },
        artifact
    };
}

/** Bridge that returns a fixed artifact for every invoke. */
function bridgeReturning(artifact: unknown): M3GatewayPort {
    return { invoke: async () => receiptWith(artifact) };
}

/** Bridge that rejects (gateway not live / protected ref unavailable). */
function bridgeThrowing(): M3GatewayPort {
    return {
        invoke: async () => {
            throw new Error('gateway offline');
        }
    };
}

const COMPLETE_ARTIFACT = {
    suit: 'wands',
    codonId: 31,
    decanIndex: 12,
    zodiacSign: 9,
    rulingPlanet: 3,
    elementId: 2,
    chakraId: 4,
    bodyZones: ['throat', 'thyroid, neck'],
    decanBodyPart: 'neck',
    decanHerbs: ['sage', 'mint']
} as const;

describe('TarotDecanService.resolveChain', () => {
    it('resolves the full decan chain when the bridge returns a complete artifact', async () => {
        const service = new TarotDecanService(bridgeReturning(COMPLETE_ARTIFACT));
        const chain = await service.resolveChain('wands:ace');
        expect(isResolvedChain(chain)).toBe(true);
        const resolved = chain as TarotDecanChain;
        expect(resolved.card).toBe('wands:ace');
        expect(resolved.suit).toBe('wands');
        expect(resolved.codonId).toBe(31);
        expect(resolved.decanIndex).toBe(12);
        expect(resolved.zodiacSign).toBe(9);
        expect(resolved.rulingPlanet).toBe(3);
        expect(resolved.elementId).toBe(2);
        expect(resolved.chakraId).toBe(4);
        expect(resolved.bodyZones).toEqual(['throat', 'thyroid, neck']);
        expect(resolved.decanBodyPart).toBe('neck');
        expect(resolved.decanHerbs).toEqual(['sage', 'mint']);
    });

    it('unwraps an artifact nested under `detail`', async () => {
        const service = new TarotDecanService(bridgeReturning({ detail: COMPLETE_ARTIFACT }));
        const chain = await service.resolveChain('cups:07');
        expect(isResolvedChain(chain)).toBe(true);
    });

    it('yields the honest-pending marker when the bridge is not live', async () => {
        const service = new TarotDecanService(bridgeThrowing());
        const chain = await service.resolveChain('swords:queen');
        expect(chain).toEqual({ pending: 's2-decan-chain' });
        expect(isResolvedChain(chain)).toBe(false);
    });

    it('yields honest-pending when the protected artifact is incomplete or out of range', async () => {
        const partial = { ...COMPLETE_ARTIFACT, chakraId: 99 };
        const service = new TarotDecanService(bridgeReturning(partial));
        expect(await service.resolveChain('wands:ace')).toEqual({ pending: 's2-decan-chain' });

        const missing = { suit: 'wands', codonId: 1 };
        const service2 = new TarotDecanService(bridgeReturning(missing));
        expect(await service2.resolveChain('wands:ace')).toEqual({ pending: 's2-decan-chain' });
    });

    it('rejects an empty card key', async () => {
        const service = new TarotDecanService(bridgeReturning(COMPLETE_ARTIFACT));
        await expect(service.resolveChain('  ')).rejects.toThrow('card key');
    });
});

describe('TarotDecanService.elementForAspect', () => {
    const service = new TarotDecanService(bridgeThrowing());

    it('maps every aspect kind to a valid m2.h Element_Id (0..4)', () => {
        for (const aspect of ['aspect', 'opposition', 'trine', 'square'] as const) {
            const element = service.elementForAspect(aspect);
            expect(Number.isInteger(element)).toBe(true);
            expect(element).toBeGreaterThanOrEqual(0);
            expect(element).toBeLessThanOrEqual(4);
        }
    });

    it('follows the standard aspect→element correspondence (trine=fire, square=earth, opposition=air, aspect=water)', () => {
        expect(service.elementForAspect('trine')).toBe(2); // AGNI / Fire
        expect(service.elementForAspect('square')).toBe(4); // PRITHVI / Earth
        expect(service.elementForAspect('opposition')).toBe(1); // VAYU / Air
        expect(service.elementForAspect('aspect')).toBe(3); // APAS / Water
    });
});

describe('card-key helpers', () => {
    it('derives the suit head of a minor card key, null for a trump', () => {
        expect(suitFromCardKey('wands:ace')).toBe('wands');
        expect(suitFromCardKey('pentacles:10')).toBe('pentacles');
        expect(suitFromCardKey('disks:knight')).toBe('pentacles'); // Thoth alias
        expect(suitFromCardKey('major:0')).toBeNull();
    });

    it('labels a card key for display', () => {
        expect(cardLabelFromCardKey('wands:ace')).toBe('Ace of Wands');
        expect(cardLabelFromCardKey('cups:07')).toBe('Seven of Cups');
        expect(cardLabelFromCardKey('major:0')).toBe('Atu 0');
    });
});

describe('TarotDecanService.resolve (24.16 adapter, preserved)', () => {
    it('still reads the raw scalar ref receipt', async () => {
        const service = new TarotDecanService(bridgeReturning(COMPLETE_ARTIFACT));
        const receipt = await service.resolve('wands:ace');
        expect(receipt.method).toBe('s2.codon.scalar_ref.read');
    });

    it('still rejects an empty key', async () => {
        const service = new TarotDecanService(bridgeReturning(COMPLETE_ARTIFACT));
        await expect(service.resolve('  ')).rejects.toThrow('card key');
    });
});
