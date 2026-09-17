import { describe, expect, it } from 'vitest';

import {
  rankPrefixedKey,
  resolveRole,
  groupByFamily,
  buildRoleView,
  getBySuffix,
  getOneBySuffix,
} from './property-roles.js';

describe('rankPrefixedKey', () => {
  it('ranks C family below T family (C is the ontological default)', () => {
    expect(rankPrefixedKey('c_3_updated_at')).toBeLessThan(rankPrefixedKey('t_3_updated_at'));
  });

  it('ranks lower positions first within a family', () => {
    expect(rankPrefixedKey('c_0_x')).toBeLessThan(rankPrefixedKey('c_1_x'));
  });

  it('ranks unprefixed keys last', () => {
    expect(rankPrefixedKey('coordinate')).toBeGreaterThan(rankPrefixedKey('l_5_x'));
  });
});

describe('resolveRole', () => {
  it('resolves a role via its exact key', () => {
    expect(resolveRole({ c_1_name: 'Paramasiva' }, 'name')).toEqual({ key: 'c_1_name', value: 'Paramasiva' });
    expect(resolveRole({ c_2_uuid: 'abc' }, 'uuid')).toEqual({ key: 'c_2_uuid', value: 'abc' });
    expect(resolveRole({ coordinate: 'M1-0' }, 'coordinate')).toEqual({ key: 'coordinate', value: 'M1-0' });
  });

  it('falls back to a suffix match when no exact key is present', () => {
    expect(resolveRole({ c_1_primary_designation: 'The Ground' }, 'name')).toEqual({
      key: 'c_1_primary_designation',
      value: 'The Ground',
    });
    expect(resolveRole({ c_0_essence: 'voidness' }, 'description')).toEqual({
      key: 'c_0_essence',
      value: 'voidness',
    });
  });

  it('prefers the exact key over a suffix candidate', () => {
    const props = { c_1_name: 'real', c_2_display_name: 'other' };
    expect(resolveRole(props, 'name')).toEqual({ key: 'c_1_name', value: 'real' });
  });

  it('breaks suffix ties by family/position rank (C beats T)', () => {
    const props = { t_2_display_name: 'from T', c_2_display_name: 'from C' };
    expect(resolveRole(props, 'name')).toEqual({ key: 'c_2_display_name', value: 'from C' });
  });

  it('returns undefined when nothing matches', () => {
    expect(resolveRole({ c_4_ql_position: 1 }, 'description')).toBeUndefined();
  });

  it('ignores null/undefined values', () => {
    expect(resolveRole({ c_1_name: null, c_1_primary_designation: 'fallback' }, 'name')).toEqual({
      key: 'c_1_primary_designation',
      value: 'fallback',
    });
  });
});

describe('groupByFamily', () => {
  it('groups properties by family bucket, preserving full keys', () => {
    const out = groupByFamily({
      c_1_name: 'X',
      c_0_essence: 'E',
      t_3_last_updated: '2026',
      l_4_lens: 'L',
      coordinate: 'M1-0',
    });
    expect(out.c).toEqual({ c_1_name: 'X', c_0_essence: 'E' });
    expect(out.t).toEqual({ t_3_last_updated: '2026' });
    expect(out.l).toEqual({ l_4_lens: 'L' });
    expect(out.unprefixed).toEqual({ coordinate: 'M1-0' });
    expect(out.p).toEqual({});
  });
});

describe('buildRoleView', () => {
  it('resolves the canonical roles present on a node', () => {
    const view = buildRoleView({ c_1_name: 'Paramasiva', c_2_uuid: 'u1', coordinate: 'M1-0' });
    expect(view.name).toEqual({ key: 'c_1_name', value: 'Paramasiva' });
    expect(view.uuid).toEqual({ key: 'c_2_uuid', value: 'u1' });
    expect(view.coordinate).toEqual({ key: 'coordinate', value: 'M1-0' });
    expect(view.content).toBeUndefined();
  });
});

describe('getBySuffix', () => {
  it('returns all keys ending with the suffix, ranked', () => {
    const props = { t_3_last_updated: 'b', c_3_last_updated: 'a' };
    const matches = getBySuffix(props, '_last_updated');
    expect(matches.map((m) => m.key)).toEqual(['c_3_last_updated', 't_3_last_updated']);
  });

  it('matches case-insensitively and skips null values', () => {
    const props = { c_1_SYMBOL: 'glyph', c_2_symbol: null };
    expect(getBySuffix(props, 'symbol').map((m) => m.value)).toEqual(['glyph']);
  });

  it('getOneBySuffix returns the best-ranked match', () => {
    const props = { t_1_x_essence: 'T', c_0_x_essence: 'C' };
    expect(getOneBySuffix(props, '_essence')).toEqual({ key: 'c_0_x_essence', value: 'C' });
  });
});
