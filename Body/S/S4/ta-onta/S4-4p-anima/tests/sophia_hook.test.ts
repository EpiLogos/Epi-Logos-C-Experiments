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
    });

    assert.equal(disclosure.kind, "sophia_session_end_disclosure");
    assert.equal(disclosure.session_id, "agent:test:main");
    assert.equal(disclosure.day_id, "22-05-2026");
    assert.equal(disclosure.final_vak.cf, "(5/0)");
    assert.equal(disclosure.artifacts.length, 1);
    assert.equal(disclosure.improvement_vectors.length, 1);
    assert.equal(disclosure.handoff_target, "aletheia_ingest");
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
    });
    assert.deepEqual(disclosure.improvement_vectors, []);
    assert.equal(disclosure.final_vak.cs.direction, "Night'");
  });
});
