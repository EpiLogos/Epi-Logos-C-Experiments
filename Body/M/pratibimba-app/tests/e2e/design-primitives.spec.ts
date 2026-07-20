/**
 * Coordinate: M' Track 30 symbolic design primitives.
 * Residency: Body/M/pratibimba-app/tests/e2e
 * Actualises: the real gateway dependency behind CodonString.
 * Public surface: Playwright proof for s2.codon.aa_lookup.
 * Does NOT own: codon law or browser-side lookup tables.
 */

import { expect, test } from '@playwright/test';
import { gatewayRpc } from './gateway-rpc';

test('S2 resolves start and stop codons through the real portal-core authority', async () => {
    const start = await gatewayRpc('s2.codon.aa_lookup', { codon: 'AUG' }) as {
        aminoAcid: string;
        isStart: boolean;
        authority: string;
    };
    const stop = await gatewayRpc('s2.codon.aa_lookup', { codon: 'UAA' }) as {
        aminoAcid: string;
        isStop: boolean;
    };

    expect(start).toMatchObject({
        aminoAcid: 'Cys',
        isStart: true,
        authority: 'portal-core::transcription'
    });
    expect(stop).toMatchObject({ aminoAcid: 'STOP', isStop: true });
});
