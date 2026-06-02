import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  nousRouteStop,
  nousClearingOnly,
  mayCloseClearing,
  NOUS_CF,
} from "../modules/nous-clearing.ts";
import { agentForCf } from "../modules/dispatch-validate.ts";

// Verification obligation (track 10.T7): "route-stop tests for clearing mode."
// Nous owns the epistemic-clearing / dispatch-halt condition. All assertions
// exercise the real module against the live constitutional roster — no mocks.

describe("Nous route-stop — clearing mode", () => {
  it("CF ground (00/00) halts dispatch into Nous clearing", () => {
    const d = nousRouteStop({ cf: NOUS_CF });
    assert.equal(d.action, "halt");
    assert.equal(d.agent, "nous");
    assert.equal(d.clearing, true);
    assert.equal(d.requiresReevaluation, true);
  });

  it("accepts the slashless (0000) notation from AGENTS.md as the same ground", () => {
    const d = nousRouteStop({ cf: "(0000)" });
    assert.equal(d.action, "halt");
    assert.equal(d.clearing, true);
  });

  it("CPF (00/00) halts for dialogical brainstorming before autonomous dispatch", () => {
    const d = nousRouteStop({ cpf: "(00/00)" });
    assert.equal(d.action, "halt");
    assert.equal(d.agent, "nous");
    assert.match(d.reason, /dialogical|brainstorm/i);
  });

  it("an un-evaluated route (no CPF) halts rather than dispatching blind", () => {
    const d = nousRouteStop({});
    assert.equal(d.action, "halt");
    assert.match(d.reason, /no CPF evaluated/i);
  });

  it("a mechanistic CPF proceeds — clearing is not triggered", () => {
    const d = nousRouteStop({ cpf: "(4.0/1-4.4/5)", cf: "(4.0/1-4.4/5)" });
    assert.equal(d.action, "proceed");
    assert.equal(d.clearing, false);
    assert.equal(d.requiresReevaluation, false);
  });

  it("every non-Nous constitutional CF proceeds (only ground halts)", () => {
    for (const cf of ["(0/1)", "(0/1/2)", "(0/1/2/3)", "(4.5/0)", "(5/0)", "(4.0/1-4.4/5)"]) {
      const d = nousRouteStop({ cpf: cf, cf });
      assert.equal(d.action, "proceed", `CF ${cf} should proceed`);
    }
  });
});

describe("Nous clearing-only invariant", () => {
  it("refuses an execution payload routed to Nous (does not assign tasks to execute)", () => {
    const r = nousClearingOnly("execute");
    assert.equal(r.ok, false);
    assert.match(r.error!, /clearing-only|does not execute/i);
  });

  it("permits an opening question (P0'/P1' clearing)", () => {
    assert.equal(nousClearingOnly("open").ok, true);
  });
});

describe("Nous inflation pathology guard", () => {
  it("refuses to close a clearing that is still on ground (inflation)", () => {
    assert.equal(mayCloseClearing({ reevaluatedCpf: "(00/00)" }).ok, false);
    assert.equal(mayCloseClearing({}).ok, false);
  });

  it("closes the clearing only after re-evaluation to a non-ground CPF", () => {
    assert.equal(mayCloseClearing({ reevaluatedCpf: "(4.0/1-4.4/5)" }).ok, true);
  });
});

describe("Nous is grounded in the live constitutional roster", () => {
  it("NOUS_CF resolves back to the nous agent via the shared roster", () => {
    assert.equal(agentForCf(NOUS_CF), "nous");
  });
});
