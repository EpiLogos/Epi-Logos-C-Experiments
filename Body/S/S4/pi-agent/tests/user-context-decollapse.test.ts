import { describe, it } from "node:test";
import { strict as assert } from "node:assert";

import {
  identityFromNatal,
  quatMul,
  quatNormalize,
} from "../skills/user-context/index.ts";

// DR-ENV-1 (no collapse) — see [[M'-AMBIENT-EPIGENETIC-TRANSFORM-SPEC]].
// The transiting sky TRANSFORMS the personal quaternion; it never becomes
// q_identity. q_identity is anchored to the natal invariant and is byte-stable
// under any changing environment; q_personal (the composed factor) moves with
// the environment. This is the gate every later phase re-runs.

describe("identityFromNatal — the q_identity / q_personal de-collapse (DR-ENV-1)", () => {
  // a fixed PASU / natal chart (10 planet degrees, 0..720)
  const natal = [10, 95, 200, 275, 40, 130, 310, 15, 88, 220];

  it("q_identity derives from the natal invariant only — byte-stable under a changing sky", () => {
    const calmSky = identityFromNatal(natal, [1, 0, 0, 0]);
    const stormSky = identityFromNatal(natal, quatNormalize([0.3, 0.7, 0.2, 0.6]));
    // fixed PASU, DIFFERENT transit sky → q_identity is identical bytes
    assert.deepEqual(stormSky.q_identity, calmSky.q_identity);
  });

  it("q_personal (Q_composed) moves when the transit sky moves", () => {
    const calmSky = identityFromNatal(natal, [1, 0, 0, 0]);
    const stormSky = identityFromNatal(natal, quatNormalize([0.3, 0.7, 0.2, 0.6]));
    assert.notDeepEqual(stormSky.q_personal, calmSky.q_personal);
  });

  it("no ambient influence is an honest pass-through: q_personal === q_identity", () => {
    const id = identityFromNatal(natal, [1, 0, 0, 0]);
    assert.deepEqual(id.q_personal, id.q_identity);
  });

  it("under a live sky the two quaternions genuinely differ (the collapse is gone)", () => {
    const id = identityFromNatal(natal, quatNormalize([0.1, 0.9, 0.2, 0.3]));
    assert.notDeepEqual(id.q_identity, id.q_personal);
  });

  it("the natal temporal anchor (tick12 / exact / phase) is environment-independent", () => {
    const a = identityFromNatal(natal, [1, 0, 0, 0]);
    const b = identityFromNatal(natal, quatNormalize([0.4, 0.4, 0.4, 0.4]));
    assert.equal(a.tick12, b.tick12);
    assert.equal(a.exact_degree_720, b.exact_degree_720);
    assert.equal(a.phase, b.phase);
  });

  it("derivation is deterministic for the same natal + environment", () => {
    const env = quatNormalize([0.2, 0.5, 0.5, 0.1]);
    assert.deepEqual(identityFromNatal(natal, env), identityFromNatal(natal, env));
  });

  it("environment defaults to the identity rotation (no ambient) when omitted", () => {
    const id = identityFromNatal(natal);
    assert.deepEqual(id.q_personal, id.q_identity);
  });
});

describe("quaternion helpers", () => {
  it("quatMul by the identity rotation returns the operand exactly", () => {
    const q = [0.11, 0.22, 0.33, 0.44];
    assert.deepEqual(quatMul(q, [1, 0, 0, 0]), q);
  });

  it("quatNormalize yields a unit quaternion", () => {
    const n = quatNormalize([1, 2, 3, 4]);
    assert.ok(Math.abs(Math.hypot(n[0], n[1], n[2], n[3]) - 1) < 1e-9);
  });

  it("quatNormalize of a near-zero quaternion is the identity rotation (no NaN)", () => {
    assert.deepEqual(quatNormalize([0, 0, 0, 0]), [1, 0, 0, 0]);
  });
});
