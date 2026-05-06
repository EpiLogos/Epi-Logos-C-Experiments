import { describe, it, expect } from "vitest";
import {
  CANONICAL_KEYS, isCanonicalKey, isDeprecatedKey,
  validateFrontmatterKeys, FrontmatterKeySchema,
} from "../src/frontmatter.js";
import { RELATION_TYPES, RelationType } from "../src/relations.js";

describe("Frontmatter canonical keys", () => {
  it("has all P-family keys", () => {
    expect(CANONICAL_KEYS).toContain("p_0_grounds");
    expect(CANONICAL_KEYS).toContain("p_5_crystallizations");
    expect(CANONICAL_KEYS).toContain("p_5_prime_crystallizations");
  });

  it("has all S-family keys", () => {
    expect(CANONICAL_KEYS).toContain("s_0_source");
    expect(CANONICAL_KEYS).toContain("s_4_session");
    expect(CANONICAL_KEYS).toContain("s_5_reflects");
  });

  it("has agent-semantic keys", () => {
    expect(CANONICAL_KEYS).toContain("aletheia_verifies");
    expect(CANONICAL_KEYS).toContain("artifact_role");
    expect(CANONICAL_KEYS).toContain("session_id");
  });

  it("isCanonicalKey validates known keys", () => {
    expect(isCanonicalKey("p_0_grounds")).toBe(true);
    expect(isCanonicalKey("c_4_classifies")).toBe(true);
    expect(isCanonicalKey("random_key")).toBe(false);
  });

  it("isDeprecatedKey catches old patterns", () => {
    expect(isDeprecatedKey("coordinate")).toBe(true);
    expect(isDeprecatedKey("ql_position")).toBe(true);
    expect(isDeprecatedKey("pos_ground")).toBe(true);
    expect(isDeprecatedKey("bimba_coordinate")).toBe(true);
    expect(isDeprecatedKey("ctx_frame")).toBe(true);
    // ctx_type is NOT deprecated
    expect(isDeprecatedKey("ctx_type")).toBe(false);
    // normal keys are not deprecated
    expect(isDeprecatedKey("p_0_grounds")).toBe(false);
  });

  it("validates frontmatter key set", () => {
    const result = validateFrontmatterKeys(["p_0_grounds", "c_1_type", "name"]);
    expect(result.valid).toEqual(["p_0_grounds", "c_1_type"]);
    expect(result.unknown).toEqual(["name"]);
    expect(result.deprecated).toEqual([]);
  });

  it("catches deprecated keys", () => {
    const result = validateFrontmatterKeys(["coordinate", "p_0_grounds", "bimba_coordinate"]);
    expect(result.deprecated).toEqual(["coordinate", "bimba_coordinate"]);
  });

  it("FrontmatterKeySchema validates", () => {
    expect(FrontmatterKeySchema.parse("p_0_grounds")).toBe("p_0_grounds");
    expect(() => FrontmatterKeySchema.parse("coordinate")).toThrow();
  });
});

describe("Relation types", () => {
  it("has P-family relations", () => {
    expect(RELATION_TYPES).toContain("P_0_LINKS_TO");
    expect(RELATION_TYPES).toContain("P_5_INTEGRATES_INTO");
  });

  it("has all 34 types", () => {
    expect(RELATION_TYPES.length).toBe(34);
  });

  it("RelationType schema validates", () => {
    expect(RelationType.parse("P_0_LINKS_TO")).toBe("P_0_LINKS_TO");
    expect(() => RelationType.parse("INVALID_REL")).toThrow();
  });
});
