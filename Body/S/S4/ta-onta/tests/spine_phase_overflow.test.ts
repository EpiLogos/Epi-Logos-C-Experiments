import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { SpineCompositor } from "../spine/compositor.ts";
import type { SpineContribution, SessionContext } from "../spine/types.ts";

function contribution(coordinate: string, content: string): SpineContribution {
  return {
    coordinate,
    async injectionSlot() {
      return {
        coordinate,
        cost: "warm",
        content,
        charEstimate: content.length,
        vakReference: {
          coord: coordinate,
          dereference: "s5'.gnostic.resolve",
        },
      };
    },
    ledgerChannel() {
      return {
        coordinate,
        ledgerDir: "test",
        async extract(_ctx: SessionContext) {
          return null;
        },
      };
    },
    compilerPass() {
      return {
        coordinate,
        schedule: "cold",
        async compile() {},
        async readCompiled() {
          return "";
        },
      };
    },
    queryHandler() {
      return {
        coordinate,
        async query() {
          return "";
        },
      };
    },
  };
}

describe("SpineCompositor phase-qualified overflow tokens", () => {
  it("retains prime coordinate phase when warm slots overflow", async () => {
    const compositor = new SpineCompositor();
    compositor.register(contribution("S4", "hot".repeat(100)));
    compositor.register(contribution("C3'", "x".repeat(20_000)));

    const assembled = await compositor.assembleInjection();
    assert.match(assembled, /<vak:/);
    assert.match(assembled, /coord="C3'"/);
    assert.match(assembled, /phase="prime"/);
    assert.match(assembled, /s5'\.gnostic\.resolve\(C3'\)/);
  });
});
