import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  isValidVakAddress,
  vakAddressFromObject,
  CANONICAL_CF_POSITIONS,
  type VakAddress,
} from "./vak_address.ts";

describe("ta-onta shared VakAddress mirror", () => {
  it("CF position table covers all 7 canonical literals", () => {
    assert.equal(CANONICAL_CF_POSITIONS["(00/00)"], "inner_0");
    assert.equal(CANONICAL_CF_POSITIONS["(0/1)"], "inner_1");
    assert.equal(CANONICAL_CF_POSITIONS["(0/1/2)"], "inner_2");
    assert.equal(CANONICAL_CF_POSITIONS["(0/1/2/3)"], "inner_3");
    assert.equal(CANONICAL_CF_POSITIONS["(5/0)"], "inner_5");
    assert.equal(CANONICAL_CF_POSITIONS["(4.0/1-4.4/5)"], "outer_4_parent");
    assert.equal(CANONICAL_CF_POSITIONS["(4.5/0)"], "lemniscate_stage_5");
  });

  it("validates a complete VakAddress with nested cs", () => {
    const addr: VakAddress = {
      cpf: "(4.0/1-4.4/5)",
      ct: ["CT2"],
      cp: "CP4.2",
      cf: "(0/1)",
      cfp: "CFP0",
      cs: { code: "CS1", direction: "Day" },
    };
    assert.equal(isValidVakAddress(addr), true);
  });

  it("rejects incomplete address", () => {
    assert.equal(vakAddressFromObject({ cpf: "(00/00)" }), null);
    assert.equal(isValidVakAddress(null), false);
    assert.equal(isValidVakAddress(undefined), false);
    assert.equal(isValidVakAddress({}), false);
  });

  it("rejects unprimed Night direction (canonical form is Night')", () => {
    assert.equal(isValidVakAddress({
      cpf: "(4.0/1-4.4/5)",
      ct: ["CT2"],
      cp: "CP4.2",
      cf: "(0/1)",
      cfp: "CFP0",
      cs: { code: "CS1", direction: "Night" }, // unprimed — must fail
    }), false);
  });

  it("accepts primed Night' direction", () => {
    assert.equal(isValidVakAddress({
      cpf: "(4.0/1-4.4/5)",
      ct: ["CT5"],
      cp: "CP4.5",
      cf: "(5/0)",
      cfp: "CFP0",
      cs: { code: "CS5", direction: "Night'" },
    }), true);
  });

  it("rejects non-canonical cpf polarity", () => {
    assert.equal(isValidVakAddress({
      cpf: "(0/1)" as any, // not one of the two CPF polarities
      ct: ["CT2"],
      cp: "CP4.2",
      cf: "(0/1)",
      cfp: "CFP0",
      cs: { code: "CS1", direction: "Day" },
    }), false);
  });

  it("rejects empty ct array", () => {
    assert.equal(isValidVakAddress({
      cpf: "(4.0/1-4.4/5)",
      ct: [],
      cp: "CP4.2",
      cf: "(0/1)",
      cfp: "CFP0",
      cs: { code: "CS1", direction: "Day" },
    }), false);
  });

  it("emits JSON shape matching the cross-repo TS canonical form (nested cs)", () => {
    const addr: VakAddress = {
      cpf: "(00/00)",
      ct: ["CT0"],
      cp: "CP4.0",
      cf: "(00/00)",
      cfp: "CFP0",
      cs: { code: "CS1", direction: "Night'" },
    };
    const json = JSON.stringify(addr);
    const parsed = JSON.parse(json);
    // Top-level keys: no flat cs_code / cs_direction.
    assert.equal(parsed.cs_code, undefined);
    assert.equal(parsed.cs_direction, undefined);
    // cs is a nested object with code + direction.
    assert.equal(typeof parsed.cs, "object");
    assert.equal(parsed.cs.code, "CS1");
    assert.equal(parsed.cs.direction, "Night'"); // with prime
    // Other top-level keys present.
    for (const key of ["cpf", "ct", "cp", "cf", "cfp"]) {
      assert.notEqual(parsed[key], undefined);
    }
  });

  it("accepts CT4 parent", () => {
    assert.equal(isValidVakAddress({
      cpf: "(4.0/1-4.4/5)",
      ct: ["CT4"],
      cp: "CP4.4",
      cf: "(4.0/1-4.4/5)",
      cfp: "CFP0",
      cs: { code: "CS0", direction: "Day" },
    }), true);
  });

  it("accepts CT4a", () => {
    assert.equal(isValidVakAddress({
      cpf: "(4.0/1-4.4/5)",
      ct: ["CT4a"],
      cp: "CP4.4",
      cf: "(4.0/1-4.4/5)",
      cfp: "CFP0",
      cs: { code: "CS0", direction: "Day" },
    }), true);
  });

  it("accepts CT4b (the Psyche fractal meta-frame)", () => {
    assert.equal(isValidVakAddress({
      cpf: "(4.0/1-4.4/5)",
      ct: ["CT4b"],
      cp: "CP4.4",
      cf: "(4.0/1-4.4/5)",
      cfp: "CFP0",
      cs: { code: "CS0", direction: "Day" },
    }), true);
  });

  it("accepts CT4 parent, canonical synthesis spelling, and optional recognition closure", () => {
    assert.equal(isValidVakAddress({
      cpf: "(4.0/1-4.4/5)",
      ct: ["CT4"],
      cp: "CP4.5",
      cf: "(4.5/0)",
      cfp: "CFP5",
      cs: { code: "CS5", direction: "Night'", recognized: true },
    }), true);
  });

  it("accepts the Klein sense binary alongside the legacy direction alias (05.T5.15)", () => {
    assert.equal(isValidVakAddress({
      cpf: "(00/00)",
      ct: ["CT0"],
      cp: "CP4.0",
      cf: "(00/00)",
      cfp: "CFP0",
      cs: { code: "CS1", direction: "Day", sense: "prospective" },
    }), true);
    assert.equal(isValidVakAddress({
      cpf: "(4.0/1-4.4/5)",
      ct: ["CT5"],
      cp: "CP4.5",
      cf: "(5/0)",
      cfp: "CFP3",
      cs: { code: "CS0", direction: "Night'", sense: "retrospective" },
    }), true);
  });

  it("rejects a non-canonical cs.sense value", () => {
    assert.equal(isValidVakAddress({
      cpf: "(00/00)",
      ct: ["CT0"],
      cp: "CP4.0",
      cf: "(00/00)",
      cfp: "CFP0",
      cs: { code: "CS1", direction: "Day", sense: "forward" }, // not prospective|retrospective
    }), false);
  });

  it("still validates sense-less addresses (legacy readers, one-release alias window)", () => {
    assert.equal(isValidVakAddress({
      cpf: "(00/00)",
      ct: ["CT0"],
      cp: "CP4.0",
      cf: "(00/00)",
      cfp: "CFP0",
      cs: { code: "CS1", direction: "Day" },
    }), true);
  });

  it("rejects the legacy no-dot synthesis spelling", () => {
    assert.equal(isValidVakAddress({
      cpf: "(4.0/1-4.4/5)",
      ct: ["CT4"],
      cp: "CP4.5",
      cf: "(4/5/0)",
      cfp: "CFP5",
      cs: { code: "CS5", direction: "Night'" },
    }), false);
  });

  it("JSON.stringify output matches the canonical frozen fixture (catches key-order drift)", () => {
    const addr: VakAddress = {
      cpf: "(00/00)",
      ct: ["CT0"],
      cp: "CP4.0",
      cf: "(00/00)",
      cfp: "CFP0",
      cs: { code: "CS1", direction: "Night'" },
    };
    // Frozen fixture — modern V8 stringify follows declaration order.
    // If anyone reorders VakAddress fields, downstream string-keyed consumers
    // (audit logs, cache keys, wire snapshots) silently diverge unless this fails.
    const CANONICAL_FIXTURE =
      '{"cpf":"(00/00)","ct":["CT0"],"cp":"CP4.0","cf":"(00/00)","cfp":"CFP0","cs":{"code":"CS1","direction":"Night\\u0027"}}';
    // Note: JSON.stringify will emit the literal apostrophe in Night', not the ' escape.
    // Compare against the actual stringify output, not the escape form:
    assert.equal(JSON.stringify(addr),
      '{"cpf":"(00/00)","ct":["CT0"],"cp":"CP4.0","cf":"(00/00)","cfp":"CFP0","cs":{"code":"CS1","direction":"Night\'"}}');
    // Silence the unused-CANONICAL_FIXTURE-warning by also showing the escape-form is documentation:
    void CANONICAL_FIXTURE;
  });

  it("vakAddressFromObject returns input by reference (no copy)", () => {
    const input = {
      cpf: "(00/00)" as const,
      ct: ["CT0" as const],
      cp: "CP4.0" as const,
      cf: "(00/00)" as const,
      cfp: "CFP0" as const,
      cs: { code: "CS1" as const, direction: "Day" as const },
    };
    const result = vakAddressFromObject(input);
    assert.equal(result, input); // same reference, not a copy
  });
});
