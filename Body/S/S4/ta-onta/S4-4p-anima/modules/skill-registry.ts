import type { VakAddress } from "../../shared/vak_address.ts";

export interface SkillEntry {
  name: string;
  vak_profile: {
    operates_at_cf: string[];
    serves_ct: string[];
    ranges_cp: string[];
  };
  // other fields (layer, kind, etc.) — preserved via index signature
  [key: string]: unknown;
}

export interface CapabilityMatrix {
  skills: SkillEntry[];
}

/**
 * Find all skills whose vak_profile matches the given VakAddress.
 *
 * Matching rules:
 * - CF: skill.operates_at_cf must include vak.cf
 * - CT: at least one of vak.ct must appear in skill.serves_ct
 * - CP: skill.ranges_cp must include vak.cp
 *
 * All three conditions must hold (AND); skills with empty CT intersection
 * or non-matching CF/CP are excluded.
 */
export function findSkillsForVak(matrix: CapabilityMatrix, vak: VakAddress): SkillEntry[] {
  return matrix.skills.filter((s) => {
    const cfMatch = s.vak_profile.operates_at_cf.includes(vak.cf);
    const ctMatch = vak.ct.some((t) => s.vak_profile.serves_ct.includes(t));
    const cpMatch = s.vak_profile.ranges_cp.includes(vak.cp);
    return cfMatch && ctMatch && cpMatch;
  });
}
