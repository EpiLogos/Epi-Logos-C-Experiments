import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { buildAnimaInvokePayload } from "../modules/anima-invoke-payload.ts";
import { isValidVakAddress } from "../../shared/vak_address.ts";

describe("Anima invoke payload builder", () => {
  it("builds a gateway payload targeting another Anima session (self-invoke)", () => {
    const payload = buildAnimaInvokePayload({
      target_user: "user-b",
      task: "evaluate VAK for X",
      vak_address: {
        cpf: "(4.0/1-4.4/5)",
        ct: ["CT4a"],
        cp: "CP4.4",
        cf: "(4.0/1-4.4/5)",
        cfp: "CFP0",
        cs: { code: "CS0", direction: "Day" },
      },
    });
    assert.equal(payload.target_session_key, "agent:anima:user-b");
    assert.equal(payload.task, "evaluate VAK for X");
    assert.equal(payload.vak_address.cf, "(4.0/1-4.4/5)");
    assert.ok(isValidVakAddress(payload.vak_address));
  });

  it("builds the same payload shape for Epii→Anima cross-invoke (Concern 2)", () => {
    // The factory is target-agnostic; same builder serves Epii's invocation.
    const payload = buildAnimaInvokePayload({
      target_user: "user-c",
      task: "epii needs anima to evaluate this for autoresearch",
      vak_address: {
        cpf: "(4.0/1-4.4/5)",
        ct: ["CT5"],
        cp: "CP4.5",
        cf: "(5/0)",
        cfp: "CFP0",
        cs: { code: "CS0", direction: "Night'" },
      },
    });
    assert.equal(payload.target_session_key, "agent:anima:user-c");
    assert.equal(payload.vak_address.cs.direction, "Night'");
    assert.ok(isValidVakAddress(payload.vak_address));
  });

  it("preserves the canonical (00/00) dialogical VAK", () => {
    const payload = buildAnimaInvokePayload({
      target_user: "user-d",
      task: "open brainstorm",
      vak_address: {
        cpf: "(00/00)",
        ct: ["CT0"],
        cp: "CP4.0",
        cf: "(00/00)",
        cfp: "CFP0",
        cs: { code: "CS1", direction: "Day" },
      },
    });
    assert.equal(payload.vak_address.cpf, "(00/00)");
    assert.equal(payload.vak_address.cf, "(00/00)");
    assert.ok(isValidVakAddress(payload.vak_address));
  });
});
