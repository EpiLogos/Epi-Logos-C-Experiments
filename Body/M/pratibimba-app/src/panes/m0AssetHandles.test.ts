import { describe, expect, it } from 'vitest';
import {
    buildM0AssetHandles,
    M0_ASSET_URI_FIELD,
    M0_ASSET_KIND_FIELD,
    M0_ASSET_DR_GATE
} from './m0AssetHandles';

describe('m0AssetHandles — M0-0\' image-asset handles (rerun 01.T1.6, candidate DR-M0-4)', () => {
    it('reads the canonical schema slot fields and names the DR gate', () => {
        expect(M0_ASSET_URI_FIELD).toBe('c_1_asset_uri');
        expect(M0_ASSET_KIND_FIELD).toBe('c_1_asset_kind');
        expect(M0_ASSET_DR_GATE).toBe('candidate-DR-M0-4');
    });

    it('is canonical-absent (NO infer / generate / backfill) when the S2 payload is absent', () => {
        expect(buildM0AssetHandles(null).handles).toEqual([]);
        expect(buildM0AssetHandles(null).state).toBe('canonical_absent');
        expect(buildM0AssetHandles({ payload: {} }).handles).toEqual([]);
        expect(buildM0AssetHandles({ payload: {} }).state).toBe('canonical_absent');
        // an empty asset list is still canonical-absence, never a placeholder handle
        expect(buildM0AssetHandles({ payload: { c_1_asset_uri: [] } }).handles).toEqual([]);
    });

    it('surfaces the S2 handles as review_pending until DR-M0-4 is user-validated', () => {
        const projection = buildM0AssetHandles({
            payload: {
                c_1_asset_uri: ['vault://seals/decan-01.png', 'vault://sigils/angel-01.svg'],
                c_1_asset_kind: 'decan-seal'
            }
        });
        expect(projection.state).toBe('review_pending');
        expect(projection.kind).toBe('decan-seal');
        expect(projection.handles.map(h => h.uri)).toEqual([
            'vault://seals/decan-01.png',
            'vault://sigils/angel-01.svg'
        ]);
        // every handle carries review_pending — NEVER canonical pre-ratification
        expect(projection.handles.every(h => h.state === 'review_pending')).toBe(true);
        expect(projection.handles.some(h => h.state === 'canonical')).toBe(false);
    });

    it('returns a frozen, read-only projection (no canon mutation)', () => {
        const projection = buildM0AssetHandles({
            payload: { c_1_asset_uri: ['vault://x.png'], c_1_asset_kind: 'glyph' }
        });
        expect(Object.isFrozen(projection)).toBe(true);
        expect(Object.isFrozen(projection.handles)).toBe(true);
    });
});
