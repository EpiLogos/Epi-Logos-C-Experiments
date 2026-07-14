import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export const CONSTITUTIONAL_AGENT_ROLES = [
  "anima",
  "nous",
  "logos",
  "eros",
  "mythos",
  "psyche",
  "sophia",
] as const;

export type UserContextPolicy = "auto" | "fire" | "skip";
export type FireReasonCode =
  | "policy_fire"
  | "ct_synthesis"
  | "cf_non_ground"
  | "target_nara"
  | "constitutional_agent"
  | "explicit_required";

export interface VakFrame {
  cpf?: string;
  ct?: string | string[] | number | number[];
  cp?: string;
  cf?: string;
  cfp?: string;
  cs?: unknown;
  target?: string;
  agent_role?: string;
  require_user_context?: boolean;
  user_context_policy?: UserContextPolicy;
  [key: string]: unknown;
}

export interface PasuChannel {
  birth_date: string;
  birth_location: string;
  natal_chart_path: string;
  jungian: Record<string, unknown>;
  gene_keys: Record<string, unknown>;
  human_design: Record<string, unknown>;
  quintessence_hash: string;
  quintessence_clock: Record<string, unknown>;
  last_wound: Record<string, unknown> | null;
}

export interface KairosChannel {
  planet_degrees: [
    number, number, number, number, number,
    number, number, number, number, number,
  ];
  transits_active: Array<Record<string, unknown>>;
  decan_window: string;
  moon_phase: number;
  epoch_marker: string;
}

export interface IdentityChannel {
  q_identity: [number, number, number, number];
  q_personal: [number, number, number, number];
  tick12: number;
  exact_degree_720: number;
  phase: 0 | 1;
}

export interface UserContextFrame {
  pasu: PasuChannel;
  kairos: KairosChannel;
  identity: IdentityChannel;
  recent_sessions: Array<Record<string, unknown>>;
  active_dev_goals: Array<Record<string, unknown>>;
  recognized: boolean;
  recognition_provenance: string | null;
  fired_at: string;
  fired_for: VakFrame;
  fire_reason: FireReasonCode;
}

export interface RoutingDecision {
  shouldFire: boolean;
  reason: FireReasonCode | "policy_skip" | "no_fire_condition";
  matched: FireReasonCode[];
}

export interface ComplianceResult {
  ok: boolean;
  violation?: "missing-user-context";
  detail?: string;
  routing: RoutingDecision;
}

export interface BuildUserContextOptions {
  repoRoot?: string;
  pasuPath?: string;
  vakFrame: VakFrame;
  /** Birth-chart frame → sources q_identity (DR-ENV-1 invariant). Distinct from the transit sky. */
  natal?: KairosChannel;
  /** Transit sky → feeds the environment transform, never q_identity. Today a natal snapshot until a live source lands (P6). */
  kairos?: KairosChannel;
  /** Ambient transform factor (canonically `derive_env_quaternion`); defaults to the identity rotation (no ambient influence). */
  environment?: readonly number[];
  identity?: IdentityChannel;
  recent_sessions?: Array<Record<string, unknown>>;
  active_dev_goals?: Array<Record<string, unknown>>;
  recognized?: boolean;
  recognition_provenance?: string | null;
  now?: Date;
}

export interface DualInjection {
  articulation_context: {
    "[[UserContext]]": UserContextFrame;
  };
  ebm_position_5_prime: {
    lens_resonance_72: number[];
    user_temporal_N: number[];
    compatibility_note: string;
  };
}

export const USER_CONTEXT_ROUTING_COMPLIANCE_CYPHER = `// Constraint: dispatches matching user-context fire conditions must have a UserContextFrame attached
MATCH (d:Dispatch)
WHERE
  (d.vak_ct IN [2, 4, 5])
  OR (d.vak_ct IN ['CT2', 'CT4', 'CT4a', 'CT4b', 'CT5'])
  OR (d.vak_cf <> '(00/00)')
  OR (d.target_coord STARTS WITH '#4')
  OR (d.target_coord STARTS WITH 'M4')
  OR (toLower(d.agent_role) IN ['anima', 'nous', 'logos', 'eros', 'mythos', 'psyche', 'sophia'])
  OR (d.require_user_context = true)
WITH d
WHERE d.user_context_frame_ref IS NULL
  AND d.user_context_frame IS NULL
  AND coalesce(d.user_context_policy, 'auto') <> 'skip'
RETURN d.id, 'missing-user-context' AS violation,
       'Dispatch matched fire conditions but no UserContextFrame attached' AS detail`;

const FIRE_CT = new Set(["2", "4", "5", "CT2", "CT4", "CT4a", "CT4b", "CT5"]);
const frameCache = new Map<string, UserContextFrame>();

export function determineUserContextRouting(frame: VakFrame): RoutingDecision {
  if (frame.user_context_policy === "skip") {
    return { shouldFire: false, reason: "policy_skip", matched: [] };
  }
  if (frame.user_context_policy === "fire") {
    return { shouldFire: true, reason: "policy_fire", matched: ["policy_fire"] };
  }

  const matched: FireReasonCode[] = [];
  if (normalizeCt(frame.ct).some((ct) => FIRE_CT.has(ct))) matched.push("ct_synthesis");
  if (typeof frame.cf === "string" && frame.cf !== "(00/00)") matched.push("cf_non_ground");
  if (isNaraTarget(frame.target)) matched.push("target_nara");
  if (isConstitutionalAgent(frame.agent_role)) matched.push("constitutional_agent");
  if (frame.require_user_context === true) matched.push("explicit_required");

  return {
    shouldFire: matched.length > 0,
    reason: matched[0] ?? "no_fire_condition",
    matched,
  };
}

export function assertUserContextRoutingCompliance(dispatch: {
  vak_address?: VakFrame;
  user_context_frame?: UserContextFrame | null;
  user_context_frame_ref?: string | null;
  [key: string]: unknown;
}): ComplianceResult {
  const routing = determineUserContextRouting({
    ...(dispatch.vak_address ?? {}),
    target: stringValue(dispatch.target ?? dispatch.target_coord ?? dispatch.vak_address?.target),
    agent_role: stringValue(dispatch.agent_role ?? dispatch.agent ?? dispatch.vak_address?.agent_role),
    require_user_context: Boolean(dispatch.require_user_context ?? dispatch.vak_address?.require_user_context),
    user_context_policy: policyValue(dispatch.user_context_policy ?? dispatch.vak_address?.user_context_policy),
  });
  const attached = Boolean(dispatch.user_context_frame || dispatch.user_context_frame_ref);
  if (routing.shouldFire && !attached) {
    return {
      ok: false,
      violation: "missing-user-context",
      detail: "Dispatch matched user-context fire conditions but no UserContextFrame was attached.",
      routing,
    };
  }
  return { ok: true, routing };
}

export async function buildUserContextFrame(options: BuildUserContextOptions): Promise<UserContextFrame> {
  const routing = determineUserContextRouting(options.vakFrame);
  if (!routing.shouldFire) {
    throw new Error(`user-context skipped: ${routing.reason}`);
  }

  const repoRoot = options.repoRoot ?? process.cwd();
  const pasuPath = options.pasuPath ?? resolve(repoRoot, "Idea/Pratibimba/Self/PASU.md");
  const cacheKey = JSON.stringify({
    pasuPath,
    epoch: options.kairos?.epoch_marker,
    goals: options.active_dev_goals?.length ?? 0,
    frame: options.vakFrame,
  });
  const cached = frameCache.get(cacheKey);
  if (cached) return cached;

  const pasu = parsePasuMarkdown(await readFile(pasuPath, "utf8"));
  // DR-ENV-1: identity is anchored to the birth chart, NEVER the live sky. The
  // `natal` frame sources q_identity; the `kairos` channel is the transit sky that
  // feeds the environment transform. Today both fall back to the birth-chart fetch
  // (no live transit source until P6), but q_identity derives from `natalFrame`, so
  // a future live sky moves the environment/q_personal and leaves q_identity fixed.
  const natalFrame = options.natal ?? options.kairos ?? await fetchKairosFromChronos(repoRoot, pasu);
  const kairos = options.kairos ?? natalFrame;
  const identity = options.identity ?? identityFromNatal(natalFrame.planet_degrees, options.environment);
  const frame: UserContextFrame = {
    pasu,
    kairos,
    identity,
    recent_sessions: options.recent_sessions ?? await currentSessionTrace(repoRoot),
    active_dev_goals: options.active_dev_goals ?? [],
    recognized: options.recognized ?? false,
    recognition_provenance: options.recognition_provenance ?? null,
    fired_at: (options.now ?? new Date()).toISOString(),
    fired_for: options.vakFrame,
    fire_reason: routing.reason as FireReasonCode,
  };
  validateUserContextFrame(frame);
  frameCache.set(cacheKey, frame);
  return frame;
}

export function validateUserContextFrame(frame: UserContextFrame): void {
  if (frame.kairos.planet_degrees.length !== 10) {
    throw new Error("UserContextFrame.kairos.planet_degrees must contain 10 values");
  }
  for (const degree of frame.kairos.planet_degrees) {
    if (!Number.isFinite(degree) || degree < 0 || degree >= 720) {
      throw new Error(`kairos planet degree out of 0..720 range: ${degree}`);
    }
  }
  if (!frame.pasu.quintessence_hash) {
    throw new Error("UserContextFrame.pasu.quintessence_hash is required");
  }
  if (!Number.isInteger(frame.identity.tick12) || frame.identity.tick12 < 0 || frame.identity.tick12 > 11) {
    throw new Error("UserContextFrame.identity.tick12 must be an integer in 0..11");
  }
}

export function createUserTemporalProjection(frame: UserContextFrame, dimensions = 28): number[] {
  if (dimensions < 25 || dimensions > 30) {
    throw new Error("user_temporal_N dimensions must stay in the 25..30 task budget");
  }
  validateUserContextFrame(frame);

  const features = [
    ...frame.kairos.planet_degrees.map((degree) => degree / 720),
    frame.kairos.moon_phase,
    ...frame.identity.q_identity,
    ...frame.identity.q_personal,
    frame.identity.tick12 / 11,
    frame.identity.exact_degree_720 / 720,
    frame.identity.phase,
    frame.recognized ? 1 : 0,
    boundedCount(frame.recent_sessions.length),
    boundedCount(frame.active_dev_goals.length),
  ];

  const hashBytes = createHash("sha256")
    .update(JSON.stringify({
      hash: frame.pasu.quintessence_hash,
      fired_at: frame.fired_at,
      decan: frame.kairos.decan_window,
      epoch: frame.kairos.epoch_marker,
    }))
    .digest();
  while (features.length < dimensions) {
    const i = features.length % hashBytes.length;
    features.push(hashBytes[i] / 255);
  }
  return features.slice(0, dimensions).map(clamp01);
}

export function createDualInjection(frame: UserContextFrame, lens_resonance_72: number[]): DualInjection {
  if (lens_resonance_72.length !== 72) {
    throw new Error("lens_resonance_72 must contain exactly 72 values");
  }
  return {
    articulation_context: {
      "[[UserContext]]": frame,
    },
    ebm_position_5_prime: {
      lens_resonance_72,
      user_temporal_N: createUserTemporalProjection(frame),
      compatibility_note: "Track 12.21 second-channel shape; current canon routes personal energy through E_4.",
    },
  };
}

export async function appendPasuSessionHistory(pasuPath: string, entry: Record<string, unknown>): Promise<void> {
  const content = await readFile(pasuPath, "utf8");
  const parsed = splitFrontmatter(content);
  if (!parsed) throw new Error(`PASU file has no YAML frontmatter: ${pasuPath}`);
  const history = parseYamlArray(parsed.frontmatter["c_3_session_history"]);
  history.push(entry);
  parsed.frontmatter["c_3_session_history"] = history;
  await writeFile(pasuPath, joinFrontmatter(parsed.frontmatter, parsed.body), "utf8");
}

export function parsePasuMarkdown(content: string): PasuChannel {
  const parsed = splitFrontmatter(content);
  if (!parsed) throw new Error("PASU markdown must include YAML frontmatter");
  const fm = parsed.frontmatter;
  const birth_date = stringValue(fm.c_0_birth_date);
  const birth_location = stringValue(fm.c_0_birth_location);
  const natal_chart_path = stringValue(fm.c_0_natal_chart_path);
  const suppliedHash = stringValue(fm.c_0_quintessence_hash);
  return {
    birth_date,
    birth_location,
    natal_chart_path,
    jungian: objectValue(fm.c_3_jungian),
    gene_keys: objectValue(fm.c_3_gene_keys),
    human_design: objectValue(fm.c_3_human_design),
    quintessence_hash: suppliedHash || structuralHash({
      birth_date,
      birth_location,
      natal_chart_path,
      coordinate: fm.coordinate,
    }),
    quintessence_clock: objectValue(fm.c_3_quintessence_clock),
    last_wound: objectOrNull(fm.c_3_last_wound),
  };
}

async function fetchKairosFromChronos(repoRoot: string, pasu: PasuChannel): Promise<KairosChannel> {
  if (!pasu.birth_date || !pasu.birth_location) {
    throw new Error("kairos fetch requires PASU c_0_birth_date and c_0_birth_location or an explicit kairos frame");
  }
  const adapterPath = resolve(
    repoRoot,
    "Body/S/S4/ta-onta/S4-3p-chronos/S3'/kairos-python-adapter.ts",
  );
  const adapter = await import(adapterPath);
  const result = await adapter.fetchKairosData({
    birth_date: pasu.birth_date,
    birth_location: pasu.birth_location,
    vault_root: resolve(repoRoot, "Idea"),
    chart_output_path: pasu.natal_chart_path || "Pratibimba/Self/chart.json",
  });
  return {
    planet_degrees: result.planet_degrees,
    transits_active: [],
    decan_window: decanWindow(result.sun_degree),
    moon_phase: normalizeMoonPhase(result.moon_degree),
    epoch_marker: String(Math.floor(Date.now() / 1000)),
  };
}

export type Quaternion = [number, number, number, number];

const IDENTITY_ROTATION: Quaternion = [1, 0, 0, 0];

/** Hamilton product a ⊗ b (both [w, x, y, z]). a ⊗ [1,0,0,0] === a exactly. */
export function quatMul(a: readonly number[], b: readonly number[]): Quaternion {
  const [aw, ax, ay, az] = a;
  const [bw, bx, by, bz] = b;
  return [
    aw * bw - ax * bx - ay * by - az * bz,
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
  ];
}

/** Unit-normalize; a near-zero quaternion returns the identity rotation (honest, never NaN). */
export function quatNormalize(q: readonly number[]): Quaternion {
  const mag = Math.hypot(q[0], q[1], q[2], q[3]);
  if (mag <= 1e-12) return [...IDENTITY_ROTATION];
  return [q[0] / mag, q[1] / mag, q[2] / mag, q[3] / mag];
}

/**
 * Derive the identity channel from the NATAL invariant (DR-ENV-1 — no collapse).
 * See [[M'-AMBIENT-EPIGENETIC-TRANSFORM-SPEC]].
 *
 * `q_identity` is the birth-anchored quaternion; it is byte-stable regardless of
 * the live sky. `q_personal` is the PASU base TRANSFORMED by the ambient
 * `environment` quaternion (the composed factor) — it moves with the transiting
 * sky but never *becomes* it. With no ambient influence (`environment` = the
 * identity rotation) the transform is an honest pass-through: q_personal === q_identity.
 *
 * The environment quaternion is derived upstream from live conditions aspected
 * against the natal invariant — canonically `portal-core::environment::derive_env_quaternion`
 * (DR-ENV-7/8). This layer never re-derives it; it only composes it onto the base.
 */
export function identityFromNatal(
  natalDegrees: readonly number[],
  environment: readonly number[] = IDENTITY_ROTATION,
): IdentityChannel {
  const q_identity = natalDegrees
    .slice(0, 4)
    .map((degree) => Number((degree / 720).toFixed(6))) as Quaternion;
  const q_personal = quatMul(q_identity, environment);
  const exact = natalDegrees[0];
  return {
    q_identity,
    q_personal,
    tick12: Math.min(11, Math.floor(exact / 60)),
    exact_degree_720: exact,
    phase: exact >= 360 ? 1 : 0,
  };
}

async function currentSessionTrace(repoRoot: string): Promise<Array<Record<string, unknown>>> {
  try {
    const raw = await readFile(resolve(repoRoot, ".epi/session.json"), "utf8");
    const parsed = JSON.parse(raw);
    return [{
      session_id: parsed?.context?.session_id,
      day_id: parsed?.context?.day_id,
      now_path: parsed?.context?.now_path,
      started_at: parsed?.context?.started_at,
    }].filter((entry) => entry.session_id);
  } catch {
    return [];
  }
}

function normalizeCt(ct: VakFrame["ct"]): string[] {
  const values = Array.isArray(ct) ? ct : ct === undefined ? [] : [ct];
  return values.map((value) => String(value));
}

function isNaraTarget(target: unknown): boolean {
  if (typeof target !== "string") return false;
  return /^(#4|M4'?)([.\-/]|$)/.test(target);
}

function isConstitutionalAgent(agentRole: unknown): boolean {
  if (typeof agentRole !== "string") return false;
  return CONSTITUTIONAL_AGENT_ROLES.includes(agentRole.trim().toLowerCase() as typeof CONSTITUTIONAL_AGENT_ROLES[number]);
}

function policyValue(value: unknown): UserContextPolicy | undefined {
  return value === "auto" || value === "fire" || value === "skip" ? value : undefined;
}

function boundedCount(count: number): number {
  return Math.min(1, Math.max(0, count / 12));
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function normalizeMoonPhase(moonDegree: number): number {
  return clamp01((moonDegree % 720) / 720);
}

function decanWindow(sunDegree: number): string {
  return `decan-${Math.floor((sunDegree % 720) / 20)}`;
}

function structuralHash(value: unknown): string {
  return `sha256-local:${createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
}

function splitFrontmatter(content: string): { frontmatter: Record<string, unknown>; body: string } | null {
  if (!content.startsWith("---\n")) return null;
  const end = content.indexOf("\n---", 4);
  if (end < 0) return null;
  const raw = content.slice(4, end).trimEnd();
  const body = content.slice(end + 4).replace(/^\n/, "");
  return { frontmatter: parseSimpleYaml(raw), body };
}

function parseSimpleYaml(raw: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const lines = raw.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim() || line.startsWith(" ")) continue;
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (value === "" && lines[i + 1]?.startsWith("  - ")) {
      const items: unknown[] = [];
      while (lines[i + 1]?.startsWith("  - ")) {
        i += 1;
        items.push(parseYamlScalar(lines[i].slice(4).trim()));
      }
      out[key] = items;
    } else {
      out[key] = parseYamlScalar(value);
    }
  }
  return out;
}

function parseYamlScalar(value: string): unknown {
  if (value === "") return "";
  if (value === "[]") return [];
  if (value === "null") return null;
  if (value === "true") return true;
  if (value === "false") return false;
  if (value.startsWith("[") || value.startsWith("{")) {
    try { return JSON.parse(value); } catch { return value; }
  }
  return value.replace(/^"(.*)"$/, "$1");
}

function joinFrontmatter(frontmatter: Record<string, unknown>, body: string): string {
  const lines = ["---"];
  for (const [key, value] of Object.entries(frontmatter)) {
    if (Array.isArray(value) && value.some((item) => item && typeof item === "object")) {
      lines.push(`${key}:`);
      for (const item of value) {
        lines.push(`  - ${JSON.stringify(item)}`);
      }
    } else {
      lines.push(`${key}: ${yamlScalar(value)}`);
    }
  }
  lines.push("---", "", body.replace(/^\n/, ""));
  return lines.join("\n");
}

function yamlScalar(value: unknown): string {
  if (Array.isArray(value)) return value.length === 0 ? "[]" : JSON.stringify(value);
  if (value === null) return "null";
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "string") return value === "" ? '""' : JSON.stringify(value);
  return String(value);
}

function parseYamlArray(value: unknown): unknown[] {
  return Array.isArray(value) ? [...value] : [];
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}
