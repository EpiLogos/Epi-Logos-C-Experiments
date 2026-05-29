// Thin local mirror of the canonical TS VakAddress that lives at:
//   /Users/admin/Documents/Epi-Logos/.pi/extensions/s_i/modules/ql_types/index.ts (lines 115-207)
//   /Users/admin/Documents/Epi-Logos/.pi/extensions/s_i/modules/ql_types/modules/type_definitions.ts (CTLevel/CPCode/CFPCode/CSCode/CSDirection)
//   (canonical commit: d38b32ca on main of /Users/admin/Documents/Epi-Logos/)
//
// ta-onta extensions in this repo cannot do cross-repo relative imports cleanly,
// so we maintain a structural mirror that:
//   - keeps identical field names and string-literal unions
//   - serialises with the same JSON shape (nested cs: { code, direction })
//   - validates against the same canonical sets
//
// Drift prevention strategy:
//   1. The CANONICAL_CF_POSITIONS map and CF_SET derive structurally from each other.
//   2. All other literal unions use the `const arr as const` -> `type = arr[number]` ->
//      `Set(arr)` pattern, so type-vs-set drift is compile-time impossible.
//   3. The JSON-shape contract test pins the wire-format invariant (nested cs, primed Night').
//   4. A frozen-fixture comparison test pins the exact stringify output (key order + values).
//
// If the canonical source-of-truth ql_types module changes any literal set, update the
// corresponding arrays here in lock-step. The contract tests in vak_address.test.ts
// catch silent drift before downstream consumers (A3 Hen, C1 Khora, A5/A6 Anima,
// D3 self-invoke, D4 gate-trigger) ship against a stale mirror.
//
// Intentional improvement over canonical: vakAddressFromObject takes `unknown` (not
// `Partial<VakAddress>`) because real callers at cross-extension boundaries always
// have arbitrary input.

const CT_LITERALS = ["CT0", "CT1", "CT2", "CT3", "CT4a", "CT4b", "CT5"] as const;
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

export type CfLiteral =
  | "(00/00)"
  | "(0/1)"
  | "(0/1/2)"
  | "(0/1/2/3)"
  | "(4/5/0)"
  | "(5/0)"
  | "(4.0/1-4.4/5)"
  | "(4.5/0)";

export interface CsField {
  code: CsLiteral;
  direction: CsDirection;
}

export interface VakAddress {
  cpf: CpfPolarity;
  ct: CtLiteral[];
  cp: CpLiteral;
  cf: CfLiteral;
  cfp: CfpLiteral;
  cs: CsField;
}

export const CANONICAL_CF_POSITIONS = {
  "(00/00)": "inner_0",
  "(0/1)": "inner_1",
  "(0/1/2)": "inner_2",
  "(0/1/2/3)": "inner_3",
  "(4/5/0)": "inner_4",
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
  return true;
}

export function vakAddressFromObject(obj: unknown): VakAddress | null {
  if (isValidVakAddress(obj)) return obj as VakAddress;
  return null;
}
