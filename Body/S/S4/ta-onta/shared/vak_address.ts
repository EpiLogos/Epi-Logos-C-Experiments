// Thin local mirror of the canonical TS VakAddress that lives at:
//   /Users/admin/Documents/Epi-Logos/.pi/extensions/s_i/modules/ql_types/index.ts
//   (commit d38b32ca on main)
//
// ta-onta extensions in this repo cannot do cross-repo relative imports cleanly,
// so we maintain a structural mirror that:
//   - keeps identical field names and string-literal unions
//   - serialises with the same JSON shape (nested cs: { code, direction })
//   - validates against the same canonical sets
//
// If a future canonical change lands in the source-of-truth ql_types module,
// update this mirror in lock-step. The contract test in vak_address.test.ts
// pins the JSON shape to catch silent drift.

export type CtLiteral = "CT0" | "CT1" | "CT2" | "CT3" | "CT4" | "CT4a" | "CT4b" | "CT5";
export type CfLiteral =
  | "(00/00)"
  | "(0/1)"
  | "(0/1/2)"
  | "(0/1/2/3)"
  | "(4/5/0)"
  | "(5/0)"
  | "(4.0/1-4.4/5)"
  | "(4.5/0)";
export type CfpLiteral = "CFP0" | "CFP1" | "CFP2" | "CFP3" | "CFP4" | "CFP5" | "Z";
export type CsLiteral = "CS0" | "CS1" | "CS2" | "CS3" | "CS4" | "CS5";
export type CpLiteral = "CP4.0" | "CP4.1" | "CP4.2" | "CP4.3" | "CP4.4" | "CP4.5";
export type CpfPolarity = "(00/00)" | "(4.0/1-4.4/5)";
export type CsDirection = "Day" | "Night'";

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

const CT_SET = new Set<string>([
  "CT0", "CT1", "CT2", "CT3", "CT4", "CT4a", "CT4b", "CT5",
]);
const CF_SET = new Set<string>(Object.keys(CANONICAL_CF_POSITIONS));
const CFP_SET = new Set<string>(["CFP0", "CFP1", "CFP2", "CFP3", "CFP4", "CFP5", "Z"]);
const CS_SET = new Set<string>(["CS0", "CS1", "CS2", "CS3", "CS4", "CS5"]);
const CP_SET = new Set<string>(["CP4.0", "CP4.1", "CP4.2", "CP4.3", "CP4.4", "CP4.5"]);
const CPF_SET = new Set<string>(["(00/00)", "(4.0/1-4.4/5)"]);
const CS_DIR_SET = new Set<string>(["Day", "Night'"]);

export function isValidVakAddress(value: unknown): value is VakAddress {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<VakAddress>;
  if (typeof v.cpf !== "string" || !CPF_SET.has(v.cpf)) return false;
  if (!Array.isArray(v.ct) || v.ct.length === 0) return false;
  for (const c of v.ct) {
    if (typeof c !== "string" || !CT_SET.has(c)) return false;
  }
  if (typeof v.cp !== "string" || !CP_SET.has(v.cp)) return false;
  if (typeof v.cf !== "string" || !CF_SET.has(v.cf)) return false;
  if (typeof v.cfp !== "string" || !CFP_SET.has(v.cfp)) return false;
  if (!v.cs || typeof v.cs !== "object") return false;
  const cs = v.cs as Partial<CsField>;
  if (typeof cs.code !== "string" || !CS_SET.has(cs.code)) return false;
  if (typeof cs.direction !== "string" || !CS_DIR_SET.has(cs.direction)) return false;
  return true;
}

export function vakAddressFromObject(obj: unknown): VakAddress | null {
  if (isValidVakAddress(obj)) return obj as VakAddress;
  return null;
}
