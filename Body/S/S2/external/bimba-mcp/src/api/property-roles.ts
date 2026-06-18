/**
 * Prefix-agnostic property access for Bimba graph nodes.
 *
 * Node properties use `{family}_{n}_{semantic}` keys (e.g. c_1_name, c_0_essence,
 * c_4_ql_position). The prefix is load-bearing for structured use, but it must
 * never *gate* retrieval. This module resolves canonical roles (name, description,
 * uuid, …) by exact key first, then by semantic suffix regardless of prefix, and
 * surfaces the full property set grouped by family so rich data is not buried.
 *
 * See bimba-mcp/AGENTS.md — Open-Schema Doctrine.
 */

export type SemanticRole = 'name' | 'description' | 'uuid' | 'coordinate' | 'content' | 'updated_at';

export interface RoleRule {
  /** Exact keys tried first, in priority order. */
  exact: readonly string[];
  /** Fallback suffix patterns (matched against key, prefix-agnostic). */
  suffixes: readonly RegExp[];
  /** If true and the value is a string, callers may truncate it. */
  truncatable?: boolean;
}

/**
 * Resolution rule per canonical role. Precedence within a role:
 *   1. an `exact` key that exists (first listed match wins)
 *   2. else the suffix-matching key with the LOWEST family/position rank
 *      (deterministic tie-break — see rankPrefixedKey)
 */
export const ROLE_RULES: Record<SemanticRole, RoleRule> = {
  uuid: { exact: ['c_2_uuid', 'uuid'], suffixes: [/_uuid$/] },
  coordinate: { exact: ['coordinate'], suffixes: [] }, // special: flat key only
  name: { exact: ['c_1_name', 'title', 'name'], suffixes: [/_name$/, /_designation$/, /_title$/] },
  description: {
    exact: ['c_1_description', 'description'],
    suffixes: [/_description$/, /_essence$/],
    truncatable: true,
  },
  content: { exact: ['c_5_content', 'content', 'raw_content'], suffixes: [/_content$/, /_body$/], truncatable: true },
  updated_at: {
    exact: ['c_3_updated_at', 't_3_last_updated', 't_3_updated_at'],
    suffixes: [/_updated_at$/, /_last_updated$/],
  },
};

export interface FamilyGroupedView {
  c: Record<string, unknown>;
  p: Record<string, unknown>;
  s: Record<string, unknown>;
  t: Record<string, unknown>;
  m: Record<string, unknown>;
  l: Record<string, unknown>;
  unprefixed: Record<string, unknown>;
}

export interface RoleEntry {
  key: string;
  value: unknown;
}

export type RoleView = Partial<Record<SemanticRole, RoleEntry>>;

export interface SuffixMatch {
  key: string;
  value: unknown;
}

const FAMILY_RANK: Record<string, number> = { c: 0, p: 1, s: 2, t: 3, m: 4, l: 5 };
const PREFIXED_KEY_RE = /^([cpstml])_(\d)_/;

/**
 * Deterministic rank for a {family}_{n}_{semantic} key (lower = preferred).
 * C-family is the ontological default (rank 0), then P,S,T,M,L; within a family,
 * lower position number ranks first. Unprefixed keys rank last. This turns the
 * prefix law into a stable tie-break so retrieval is prefix-aware, not prefix-blind.
 */
export function rankPrefixedKey(key: string): number {
  const m = PREFIXED_KEY_RE.exec(key);
  if (!m) return 9999;
  return (FAMILY_RANK[m[1]!] ?? 8) * 10 + Number(m[2]);
}

function present(value: unknown): boolean {
  return value !== undefined && value !== null;
}

/**
 * Resolve a canonical role to { key, value }: exact known key first (in listed
 * priority), else the suffix-matching key with the lowest family/position rank.
 * The matched key is retained so callers can see which prefix supplied the value.
 */
export function resolveRole(props: Record<string, unknown>, role: SemanticRole): RoleEntry | undefined {
  const rule = ROLE_RULES[role];

  for (const k of rule.exact) {
    if (present(props[k])) return { key: k, value: props[k] };
  }

  if (rule.suffixes.length === 0) return undefined;

  const matches = Object.keys(props).filter(
    (k) => present(props[k]) && rule.suffixes.some((rx) => rx.test(k))
  );
  if (matches.length === 0) return undefined;

  matches.sort((a, b) => rankPrefixedKey(a) - rankPrefixedKey(b) || a.localeCompare(b));
  const key = matches[0]!;
  return { key, value: props[key] };
}

/** Group all properties by family bucket (c/p/s/t/m/l/unprefixed), full keys preserved. */
export function groupByFamily(props: Record<string, unknown>): FamilyGroupedView {
  const view: FamilyGroupedView = { c: {}, p: {}, s: {}, t: {}, m: {}, l: {}, unprefixed: {} };
  for (const [k, value] of Object.entries(props)) {
    const m = PREFIXED_KEY_RE.exec(k);
    if (m) {
      const bucket = view[m[1] as keyof FamilyGroupedView] as Record<string, unknown>;
      bucket[k] = value;
    } else {
      view.unprefixed[k] = value;
    }
  }
  return view;
}

const ALL_ROLES: SemanticRole[] = ['name', 'description', 'uuid', 'coordinate', 'content', 'updated_at'];

/** Resolve every canonical role present on a node, each as {key, value}. */
export function buildRoleView(props: Record<string, unknown>): RoleView {
  const out: RoleView = {};
  for (const role of ALL_ROLES) {
    const resolved = resolveRole(props, role);
    if (resolved) out[role] = resolved;
  }
  return out;
}

/**
 * Pull every property whose key ends with `suffix` (case-insensitive), ranked by
 * family/position. Returns all matches because suffixes are not guaranteed unique.
 */
export function getBySuffix(props: Record<string, unknown>, suffix: string): SuffixMatch[] {
  const s = suffix.toLowerCase();
  return Object.keys(props)
    .filter((k) => present(props[k]) && k.toLowerCase().endsWith(s))
    .sort((a, b) => rankPrefixedKey(a) - rankPrefixedKey(b) || a.localeCompare(b))
    .map((k) => ({ key: k, value: props[k] }));
}

/** The single best-ranked match for a suffix. */
export function getOneBySuffix(props: Record<string, unknown>, suffix: string): SuffixMatch | undefined {
  return getBySuffix(props, suffix)[0];
}
