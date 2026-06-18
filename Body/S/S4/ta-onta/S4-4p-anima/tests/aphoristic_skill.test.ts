import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  composeAphoristic,
  countAphoristicTokens,
  validateAphoristicCandidate,
} from "../modules/aphoristic-skill.ts";

const SOURCE_VAK = {
  cpf: "(4.0/1-4.4/5)" as const,
  ct: ["CT5"] as const,
  cp: "CP4.5" as const,
  cf: "(5/0)" as const,
  cfp: "CFP3" as const,
  cs: { code: "CS0" as const, direction: "Night'" as const },
};

describe("aphoristic-skill composition", () => {
  it("composeAphoristic enforces token budget", async () => {
    const candidate = await composeAphoristic(
      "The session showed that S3 integration is not a generic pass-through; it is a governed return path where crossings are gathered, tested, and released only when the route still opens questions.",
      SOURCE_VAK,
      "q_5_integration_template",
      "pithy",
    );

    assert.ok(countAphoristicTokens(candidate) <= 80, candidate);
    assert.equal(validateAphoristicCandidate(candidate, "q_5_integration_template", "pithy").ok, true);
    assert.doesNotMatch(candidate, /\b(currently|for now|this means that)\b/i);
  });

  it("requires structured locality cues for q_4 locality signatures", () => {
    const bad = validateAphoristicCandidate(
      "Like a window, this coordinate sits somewhere interesting.",
      "q_4_locality_signature",
      "pithy",
    );
    assert.equal(bad.ok, false);
    assert.match(bad.error!, /locality.*parent.*lateral.*inversion.*resonance/i);

    const good = validateAphoristicCandidate(
      "Like a courtyard with four gates, parent S, lateral S2/S4, inversion S3', and M resonance hold this place open.",
      "q_4_locality_signature",
      "pithy",
    );
    assert.equal(good.ok, true);
  });
});
