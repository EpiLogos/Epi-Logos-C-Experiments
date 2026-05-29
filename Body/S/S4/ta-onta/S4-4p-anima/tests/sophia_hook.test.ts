import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { buildSophiaDisclosure } from "../modules/sophia-hook.ts";
import { isValidVakAddress } from "../../shared/vak_address.ts";

describe("Sophia post-execution hook", () => {
  it("builds a disclosure from session end state", () => {
    // Aligned with what rehearPhaseVakAddress() actually produces in the wire path
    // (CS0/Night' — analytic synthesis at Möbius return). The previous CS5/Day
    // fixture was canonically valid but did not match the system's output.
    const final_vak = {
      cpf: "(4.0/1-4.4/5)" as const,
      ct: ["CT5"] as const,
      cp: "CP4.5" as const,
      cf: "(5/0)" as const,
      cfp: "CFP3" as const,
      cs: { code: "CS0" as const, direction: "Night'" as const },
    };
    assert.ok(isValidVakAddress(final_vak), "fixture final VAK is canonical");

    const disclosure = buildSophiaDisclosure({
      session_id: "agent:test:main",
      day_id: "22-05-2026",
      final_vak,
      artifacts: ["/path/to/note.md"],
      improvement_vectors: ["consider auto-loading CT4 templates earlier"],
      closure_kind: "rehear",
    });

    assert.equal(disclosure.kind, "sophia_session_end_disclosure");
    assert.equal(disclosure.session_id, "agent:test:main");
    assert.equal(disclosure.day_id, "22-05-2026");
    assert.equal(disclosure.final_vak.cf, "(5/0)");
    assert.equal(disclosure.artifacts.length, 1);
    assert.equal(disclosure.improvement_vectors.length, 1);
    assert.equal(disclosure.handoff_target, "aletheia_ingest");
    assert.equal(disclosure.closure_kind, "rehear");
  });

  it("preserves an empty improvement_vectors array (sessions can end clean)", () => {
    const final_vak = {
      cpf: "(4.0/1-4.4/5)" as const,
      ct: ["CT5"] as const,
      cp: "CP4.5" as const,
      cf: "(5/0)" as const,
      cfp: "CFP0" as const,
      cs: { code: "CS0" as const, direction: "Night'" as const },
    };
    const disclosure = buildSophiaDisclosure({
      session_id: "agent:clean:main",
      day_id: "22-05-2026",
      final_vak,
      artifacts: [],
      improvement_vectors: [],
      closure_kind: "rehear",
    });
    assert.deepEqual(disclosure.improvement_vectors, []);
    assert.equal(disclosure.final_vak.cs.direction, "Night'");
  });

  it("builds a force_closed disclosure (process killed before deliberate close)", () => {
    // Mid-perform VAK shape — what the gateway record would report if the
    // session was killed while still executing (cf=(0/1/2) Trika, not Möbius).
    const mid_perform_vak = {
      cpf: "(4.0/1-4.4/5)" as const,
      ct: ["CT2"] as const,
      cp: "CP4.3" as const,
      cf: "(0/1/2)" as const,
      cfp: "CFP1" as const,
      cs: { code: "CS3" as const, direction: "Day" as const },
    };
    assert.ok(isValidVakAddress(mid_perform_vak), "fixture mid-perform VAK is canonical");

    const disclosure = buildSophiaDisclosure({
      session_id: "agent:test:forced",
      day_id: "22-05-2026",
      final_vak: mid_perform_vak,
      artifacts: [],
      improvement_vectors: [],
      closure_kind: "force_closed",
    });
    assert.equal(disclosure.closure_kind, "force_closed");
    assert.equal(disclosure.final_vak.cf, "(0/1/2)", "mid-perform VAK shape preserved");
  });
});
