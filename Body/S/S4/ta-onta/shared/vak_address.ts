// vak_address.ts — the VAK C'-branch coordinate envelope, canonical TS mirror.
//
// ─────────────────────────────────────────────────────────────────────────────
// THE SIX REFLECTIVE COORDINATES — read this before reasoning about any of them
// ─────────────────────────────────────────────────────────────────────────────
//
// VAK is ONE grammar of six co-equal fields. No field is a special case, and no
// field means anything on its own: per [[S4'-SPEC]], "the VAK fields CPF, CT,
// CP, CF, CFP, and CS are the vertical dispatch grammar operating through those
// carriers, not a replacement naming scheme for them."
//
// Each field is owned by one ta-onta carrier and specced in that carrier's own
// shard. This is the S4'Cx Orthogonal Projection, quoted from the World
// authority `Idea/Bimba/World/Types/Coordinates/S/S'/S4'/S4'.md`:
//
//   S4.0' | [[C0]] Bimba      | [[CPF]] | Context Packing Frame — polarity gate
//   S4.1' | [[C1]] Form       | [[CT]]  | Context Template — semantic phase-type
//   S4.2' | [[C2]] Entity     | [[CP]]  | Context Parameters — incubation coordinate
//   S4.3' | [[C3]] Process    | [[CF]]  | Context Frame — archetypal form
//   S4.4' | [[C4]] Type       | [[CFP]] | Context Frame Pattern — nesting algebra
//   S4.5' | [[C5]] Pratibimba | [[CS]]  | Context State — path operator
//
// What each field DECLARES, quoted from [[S4'-SPEC]]'s Reading-Frame Law:
//
//   CPF — whether the work is dialogical/user-engaged or autonomous/mechanistic
//   CT  — artifact/content type
//   CP  — the active QL position set; authority for cardinality (single point,
//         compressed triad, sixfold traverse, inverse pass, 4/5 depth pass)
//   CF  — the archetypal form / constitutional handling mode (which agent speaks)
//   CFP — thread/spread topology, INCLUDING nested/meta sub-readings —
//         i.e. how CF frames nest within one another
//   CS  — Context Sequence and Day/Night' traversal direction
//
// CF and CFP both mention nesting; they are NOT the same claim. VAK as a whole
// is a nesting operator system, and every context frame sits within the psychoid
// #4. CF names the frames themselves — the archetypal form a step is spoken
// through. CFP names how those frames nest WITHIN ONE ANOTHER: the pattern, the
// orchestration score. CF is what nests; CFP is the algebra of the nesting.
//
// Owning specs — go here for meaning, not to a SKILL.md:
//   umbrella          Idea/Bimba/Seeds/S/S4/S4'/S4'-SPEC.md          [[S4'-SPEC]]
//   CPF               Idea/Bimba/Seeds/S/S4/S4'/S4-0'-SPEC.md        [[S4-0'-SPEC]]
//   CT                Idea/Bimba/Seeds/S/S4/S4'/S4-1'-SPEC.md        [[S4-1'-SPEC]]
//   CP                Idea/Bimba/Seeds/S/S4/S4'/S4-2'-SPEC.md        [[S4-2'-SPEC]]
//   CF                Idea/Bimba/Seeds/S/S4/S4'/S4-3'-SPEC.md        [[S4-3'-SPEC]]
//   CFP               Idea/Bimba/Seeds/S/S4/S4'/S4-4'-SPEC.md        [[S4-4'-SPEC]]
//   CS                Idea/Bimba/Seeds/S/S4/S4'/S4-5'-SPEC.md        [[S4-5'-SPEC]]
//   World authority   Idea/Bimba/World/Types/Coordinates/S/S'/S4'/S4'.md  [[S4']]
//
// A `SKILL.md` under `S4-4p-anima/S4'/skills/` is AGENT TOOLING — text written
// to be injected into a prompt. It is not canon and it uses its own teaching
// vocabulary. Reading one as though it were the spec is how a CFP came to be
// mistaken for a tool name; see the CFP note below.
//
// ── CFP is a field, not a tool table ────────────────────────────────────────
// CFP declares thread/spread topology. It does NOT name a tool. Canon's own
// per-CFP column maps to a SKILL or PATTERN, and [[S4-4'-SPEC]] lists PI tools
// as one FLAT registered set (`vak_evaluate` … `run_chain`, `subagent_*`,
// `tilldone`) with no pairing to any coordinate. Tools are capabilities the
// agent is entitled to; topology is what the address declares. The mapping
// between them lives in `S4-4p-anima/lib/thread-shape.ts` and is advisory and
// many-to-many, never an identity.
//
// ── Why this file exists, and what it is a mirror OF ────────────────────────
// This repo's ta-onta extensions cannot cleanly cross-repo import, so this is a
// structural mirror that keeps identical field names and string-literal unions,
// serialises to the same JSON shape (nested `cs: { code, direction }`), and
// validates against the same canonical sets.
//
// The cross-language peer is `Body/S/S0/portal-core/src/vak_address.rs`, pinned
// by the shared fixture `vak_address.parity.json` — neither side greps the
// other's source; both must accept the canonical cases and refuse the rejected
// ones. Those two files and the specs above are the whole authority. Nothing
// outside this repo is.
//
// ── Drift prevention ────────────────────────────────────────────────────────
//   1. CANONICAL_CF_POSITIONS and CF_SET derive structurally from each other.
//   2. Every other literal union uses `const arr as const` -> `type = arr[number]`
//      -> `Set(arr)`, so type-vs-set drift is compile-time impossible.
//   3. The JSON-shape contract test pins the wire format (nested cs, primed Night').
//   4. A frozen-fixture comparison pins the exact stringify output (key order + values).
//
// `vakAddressFromObject` takes `unknown` (not `Partial<VakAddress>`) because
// real callers at cross-extension boundaries always have arbitrary input.

const CT_LITERALS = ["CT0", "CT1", "CT2", "CT3", "CT4", "CT4a", "CT4b", "CT5"] as const;
export type CtLiteral = (typeof CT_LITERALS)[number];

const CFP_LITERALS = ["CFP0", "CFP1", "CFP2", "CFP3", "CFP4", "CFP5", "Z"] as const;
export type CfpLiteral = (typeof CFP_LITERALS)[number];

const CS_LITERALS = ["CS0", "CS1", "CS2", "CS3", "CS4", "CS5"] as const;
export type CsLiteral = (typeof CS_LITERALS)[number];

const CP_LITERALS = ["CP4.0", "CP4.1", "CP4.2", "CP4.3", "CP4.4", "CP4.5"] as const;
export type CpLiteral = (typeof CP_LITERALS)[number];

const CPF_POLARITIES = ["(00/00)", "(4.0/1-4.4/5)"] as const;
export type CpfPolarity = (typeof CPF_POLARITIES)[number];

const CS_DIRECTIONS = ["Day", "Night'"] as const;
export type CsDirection = (typeof CS_DIRECTIONS)[number];

// Klein-topological sense of sight (05.T5.15, canvas-spec §1.2): prospective =
// forward into what is forming; retrospective = backward across what has
// gathered. The `#` inversion operator is the sense-switch on a single point.
// `sense` is the operative structural binary; `direction` (Day/Night') stays as
// the atmospheric legacy alias for one release — readers prefer `sense` when
// both are present. This-side-ahead of the cross-repo canonical ql_types mirror.
const CS_SENSES = ["prospective", "retrospective"] as const;
export type CsSense = (typeof CS_SENSES)[number];

export type CfLiteral =
  | "(00/00)"
  | "(0/1)"
  | "(0/1/2)"
  | "(0/1/2/3)"
  | "(5/0)"
  | "(4.0/1-4.4/5)"
  | "(4.5/0)";

export interface CsField {
  code: CsLiteral;
  /** Legacy alias (one release, 05.T5.15): kept alongside `sense` so wire
   * consumers (gateway sessions.patch, template/thought frontmatter renderers,
   * reading-frame evaluator) stay green. Readers prefer `sense` if both present. */
  direction: CsDirection;
  /** Operative Klein sense-of-sight binary (canvas-spec §1.2). */
  sense?: CsSense;
  recognized?: boolean;
}

export interface VakAddress {
  cpf: CpfPolarity;
  ct: CtLiteral[];
  cp: CpLiteral;
  cf: CfLiteral;
  cfp: CfpLiteral;
  cs: CsField;
}

export type CfpMoveLiteral = Exclude<CfpLiteral, "Z">;

export const Z_THREAD_STATES = [
  "queued",
  "composing",
  "performing",
  "verifying",
  "rehearing",
  "recomposing",
  "done",
  "failed",
] as const;
export type ZThreadState = (typeof Z_THREAD_STATES)[number];

export interface ZThreadMove {
  id: string;
  cfp: CfpMoveLiteral;
  task: string;
  agent?: string;
  agents?: string[];
  chain?: string;
}

export interface ZThreadShape {
  id: string;
  task?: string;
  vak_address: VakAddress & { cfp: "Z" };
  moves: ZThreadMove[];
  composes: CfpMoveLiteral[];
}

export interface ZThreadSnapshot {
  id: string;
  task?: string;
  state: ZThreadState;
  vak_address: VakAddress & { cfp: "Z" };
  composes: CfpMoveLiteral[];
  cycle: number;
  history: ZThreadState[];
  outputs: Array<{
    move_id: string;
    cfp: CfpMoveLiteral;
    /**
     * The tool the move started from, or `null` when no single tool carries it.
     *
     * Nullable because a CFP does not name a tool: a thread type is a SHAPE and
     * tools are capabilities, so a move whose shape is a duration/completion
     * property (an L-Thread) wraps whatever dispatch it was given rather than
     * being one tool. `ZThreadSnapshot` is TS-only — no Rust parity fixture
     * covers `outputs` — so this widening crosses no cross-language contract.
     */
    tool: string | null;
    output: string;
  }>;
  verify_gate?: {
    transition: string;
    reason: string;
  };
  failure_reason?: string;
}

export const CANONICAL_CF_POSITIONS = {
  "(00/00)": "inner_0",
  "(0/1)": "inner_1",
  "(0/1/2)": "inner_2",
  "(0/1/2/3)": "inner_3",
  "(5/0)": "inner_5",
  "(4.0/1-4.4/5)": "outer_4_parent",
  "(4.5/0)": "lemniscate_stage_5",
} as const;

const CT_SET: Set<CtLiteral> = new Set(CT_LITERALS);
const CFP_SET: Set<CfpLiteral> = new Set(CFP_LITERALS);
const CS_SET: Set<CsLiteral> = new Set(CS_LITERALS);
const CP_SET: Set<CpLiteral> = new Set(CP_LITERALS);
const CPF_SET: Set<CpfPolarity> = new Set(CPF_POLARITIES);
const CS_DIR_SET: Set<CsDirection> = new Set(CS_DIRECTIONS);
const CS_SENSE_SET: Set<CsSense> = new Set(CS_SENSES);
const CF_SET: Set<string> = new Set(Object.keys(CANONICAL_CF_POSITIONS));

export function isValidVakAddress(value: unknown): value is VakAddress {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.cpf !== "string" || !CPF_SET.has(v.cpf as CpfPolarity)) return false;
  if (!Array.isArray(v.ct) || v.ct.length === 0) return false;
  for (const c of v.ct) {
    if (typeof c !== "string" || !CT_SET.has(c as CtLiteral)) return false;
  }
  if (typeof v.cp !== "string" || !CP_SET.has(v.cp as CpLiteral)) return false;
  if (typeof v.cf !== "string" || !CF_SET.has(v.cf)) return false;
  if (typeof v.cfp !== "string" || !CFP_SET.has(v.cfp as CfpLiteral)) return false;
  if (!v.cs || typeof v.cs !== "object") return false;
  const cs = v.cs as Record<string, unknown>;
  if (typeof cs.code !== "string" || !CS_SET.has(cs.code as CsLiteral)) return false;
  if (typeof cs.direction !== "string" || !CS_DIR_SET.has(cs.direction as CsDirection)) return false;
  if (cs.sense !== undefined && (typeof cs.sense !== "string" || !CS_SENSE_SET.has(cs.sense as CsSense))) return false;
  if (cs.recognized !== undefined && typeof cs.recognized !== "boolean") return false;
  return true;
}

export function vakAddressFromObject(obj: unknown): VakAddress | null {
  if (isValidVakAddress(obj)) return obj as VakAddress;
  return null;
}
