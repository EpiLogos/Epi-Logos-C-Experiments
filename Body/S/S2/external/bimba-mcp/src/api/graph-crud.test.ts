import { describe, expect, it } from 'vitest';
import neo4j from 'neo4j-driver';

import { sanitizeIdentifier, screenReadOnly, serializeValue, buildLocator } from './graph-crud.js';

describe('sanitizeIdentifier', () => {
  it('returns valid identifiers unchanged', () => {
    expect(sanitizeIdentifier('c_1_name')).toBe('c_1_name');
    expect(sanitizeIdentifier('Bimba')).toBe('Bimba');
    expect(sanitizeIdentifier('MANIFESTS')).toBe('MANIFESTS');
    expect(sanitizeIdentifier('_underscore')).toBe('_underscore');
    expect(sanitizeIdentifier('coordinate')).toBe('coordinate');
  });

  it('throws on identifiers containing spaces or punctuation', () => {
    expect(() => sanitizeIdentifier('bad name')).toThrow();
    expect(() => sanitizeIdentifier('a;b')).toThrow();
    expect(() => sanitizeIdentifier('a`b')).toThrow();
    expect(() => sanitizeIdentifier('has-hyphen')).toThrow();
    expect(() => sanitizeIdentifier('drop`) MATCH (x) DETACH DELETE x //')).toThrow();
  });

  it('throws on identifiers starting with a digit, and on empty', () => {
    expect(() => sanitizeIdentifier('1abc')).toThrow();
    expect(() => sanitizeIdentifier('')).toThrow();
  });
});

describe('screenReadOnly', () => {
  it('allows read-only queries', () => {
    expect(() => screenReadOnly('MATCH (n:Bimba) RETURN n LIMIT 5')).not.toThrow();
    expect(() => screenReadOnly('MATCH (n) WHERE n.coordinate = $c RETURN n')).not.toThrow();
    expect(() => screenReadOnly('MATCH (n) RETURN n;')).not.toThrow(); // trailing semicolon ok
  });

  it('rejects mutating clauses when write is false', () => {
    expect(() => screenReadOnly('CREATE (n:Bimba) RETURN n')).toThrow();
    expect(() => screenReadOnly('MATCH (n) SET n.x = 1')).toThrow();
    expect(() => screenReadOnly('MATCH (n) DETACH DELETE n')).toThrow();
    expect(() => screenReadOnly('MERGE (n:Bimba {coordinate:$c}) RETURN n')).toThrow();
    expect(() => screenReadOnly('MATCH (n) REMOVE n.x RETURN n')).toThrow();
    expect(() => screenReadOnly('CALL apoc.create.node(["X"], {}) YIELD node RETURN node')).toThrow();
  });

  it('does not flag mutating keywords inside string literals', () => {
    expect(() => screenReadOnly("MATCH (n) WHERE n.c_1_name = 'CREATE' RETURN n")).not.toThrow();
    expect(() => screenReadOnly('MATCH (n) WHERE n.c_1_description = "we DELETE nothing" RETURN n')).not.toThrow();
  });

  it('does not flag substrings of property names', () => {
    expect(() => screenReadOnly('MATCH (n) WHERE n.created_at > $t RETURN n')).not.toThrow();
  });

  it('rejects multiple statements', () => {
    expect(() => screenReadOnly('MATCH (n) RETURN n; MATCH (m) RETURN m')).toThrow();
  });
});

describe('serializeValue', () => {
  it('passes plain scalars through', () => {
    expect(serializeValue('x')).toBe('x');
    expect(serializeValue(42)).toBe(42);
    expect(serializeValue(true)).toBe(true);
    expect(serializeValue(null)).toBe(null);
  });

  it('converts a neo4j Integer to a JS number when in safe range', () => {
    expect(serializeValue(neo4j.int(7))).toBe(7);
  });

  it('recurses into arrays and maps', () => {
    expect(serializeValue([neo4j.int(1), neo4j.int(2)])).toEqual([1, 2]);
    expect(serializeValue({ a: neo4j.int(3), b: 'x' })).toEqual({ a: 3, b: 'x' });
  });

  it('serializes a Node into a tagged plain object', () => {
    const node = new neo4j.types.Node(neo4j.int(1), ['Bimba'], { coordinate: 'M1-0' });
    expect(serializeValue(node)).toEqual({
      _type: 'node',
      identity: 1,
      labels: ['Bimba'],
      properties: { coordinate: 'M1-0' },
    });
  });

  it('serializes a Relationship into a tagged plain object', () => {
    const rel = new neo4j.types.Relationship(neo4j.int(5), neo4j.int(1), neo4j.int(2), 'MANIFESTS', {});
    const out = serializeValue(rel) as Record<string, unknown>;
    expect(out._type).toBe('relationship');
    expect(out.rel_type).toBe('MANIFESTS');
    expect(out.start).toBe(1);
    expect(out.end).toBe(2);
  });
});

describe('buildLocator', () => {
  it('locates by coordinate', () => {
    const { match, params } = buildLocator({ coordinate: 'M1-0' }, 'n');
    expect(match).toContain('n.coordinate = $coord');
    expect(params).toEqual({ coord: 'M1-0' });
  });

  it('locates by uuid against both c_2_uuid and legacy uuid', () => {
    const { match, params } = buildLocator({ uuid: 'abc' }, 'n');
    expect(match).toContain('n.c_2_uuid = $uuid');
    expect(match).toContain('n.uuid = $uuid');
    expect(params).toEqual({ uuid: 'abc' });
  });

  it('locates by arbitrary match_key/value with a sanitized, backticked key', () => {
    const { match, params } = buildLocator({ match_key: 'c_1_name', match_value: 'X' }, 'n');
    expect(match).toContain('n.`c_1_name` = $mk');
    expect(params).toEqual({ mk: 'X' });
  });

  it('applies an optional label constraint', () => {
    const { match } = buildLocator({ coordinate: 'M1-0', label: 'Bimba' }, 'n');
    expect(match).toContain('(n:Bimba)');
  });

  it('suffixes params so two locators do not collide', () => {
    const a = buildLocator({ coordinate: 'M1-0' }, 'a', '_a');
    const b = buildLocator({ coordinate: 'M2-0' }, 'b', '_b');
    expect(a.params).toEqual({ coord_a: 'M1-0' });
    expect(b.params).toEqual({ coord_b: 'M2-0' });
  });

  it('throws when an illegal label is supplied (injection guard)', () => {
    expect(() => buildLocator({ coordinate: 'M1-0', label: 'bad label' }, 'n')).toThrow();
  });

  it('throws when an illegal match_key is supplied (injection guard)', () => {
    expect(() => buildLocator({ match_key: 'a`b', match_value: 1 }, 'n')).toThrow();
  });
});
