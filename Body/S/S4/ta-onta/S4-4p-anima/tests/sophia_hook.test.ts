import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  buildSophiaDisclosure,
  routeQProposalByVak,
} from "../modules/sophia-hook.ts";
import { isValidVakAddress } from "../../shared/vak_address.ts";

describe("Sophia post-execution hook", () => {
  it("builds a disclosure from session end state", () => {
    // Aligned with what rehearPhaseVakAddress() actually produces in the wire path
    // (CS0/Night' — analytic synthesis at Möbius return). The previous CS5/Day
    // fixture was canonically valid but did not match the system's output.
    const final_vak = {
      cpf: "(4.0/1-4.4/5)" as const,
      ct: ["CT5" as const],
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
      ct: ["CT5" as const],
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
      ct: ["CT2" as const],
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

  it("buildSophiaDisclosure q_proposals preserves witness provenance and opening questions", () => {
    const final_vak = {
      cpf: "(4.0/1-4.4/5)" as const,
      ct: ["CT5" as const],
      cp: "CP4.5" as const,
      cf: "(5/0)" as const,
      cfp: "CFP3" as const,
      cs: { code: "CS0" as const, direction: "Night'" as const },
    };

    const disclosure = buildSophiaDisclosure({
      session_id: "agent:q-proposal:main",
      day_id: "22-05-2026",
      final_vak,
      artifacts: ["/vault/session/now.md"],
      improvement_vectors: ["S3 integration template surfaced a refinement"],
      closure_kind: "rehear",
      q_proposals: [{
        target_coordinate: "S3",
        q_key: "q_5_integration_template",
        q_value_candidate: "Like a lock finding its river, S3 gathers crossings into one governed current.",
        qm_witness_session: "agent:q-proposal:main",
        qm_witness_vak: final_vak,
        qm_witness_agent: "sophia",
        rationale: "The session exposed integration as governed convergence rather than generic mediation.",
        opens_questions: ["Which S3 crossings still lack a governed return path?"],
        source_artifacts: ["/vault/session/now.md", "VAK:CP4.5"],
      }],
    });

    assert.equal(disclosure.q_proposals.length, 1);
    assert.equal(disclosure.q_proposals[0].target_coordinate, "S3");
    assert.equal(disclosure.q_proposals[0].q_key, "q_5_integration_template");
    assert.equal(disclosure.q_proposals[0].qm_witness_session, "agent:q-proposal:main");
    assert.equal(disclosure.q_proposals[0].qm_witness_vak.cf, "(5/0)");
    assert.deepEqual(disclosure.q_proposals[0].opens_questions, [
      "Which S3 crossings still lack a governed return path?",
    ]);
  });

  it("refuses malformed q_proposal keys and private q_personal mentions", () => {
    const final_vak = {
      cpf: "(4.0/1-4.4/5)" as const,
      ct: ["CT5" as const],
      cp: "CP4.5" as const,
      cf: "(5/0)" as const,
      cfp: "CFP3" as const,
      cs: { code: "CS0" as const, direction: "Night'" as const },
    };
    const base = {
      target_coordinate: "S3",
      q_key: "q_5_integration_template",
      q_value_candidate: "Like a hinge of light, S3 turns crossings into governed return.",
      qm_witness_session: "agent:q-proposal:main",
      qm_witness_vak: final_vak,
      qm_witness_agent: "sophia",
      rationale: "The session exposed a refinement.",
      opens_questions: ["What remains ungoverned?"],
      source_artifacts: ["/vault/session/now.md"],
    };

    assert.throws(() => buildSophiaDisclosure({
      session_id: "agent:q-proposal:main",
      day_id: "22-05-2026",
      final_vak,
      artifacts: [],
      improvement_vectors: [],
      closure_kind: "rehear",
      q_proposals: [{ ...base, q_key: "q_personal_secret" }],
    }), /q_proposal.*q_key|private q_personal/i);

    assert.throws(() => buildSophiaDisclosure({
      session_id: "agent:q-proposal:main",
      day_id: "22-05-2026",
      final_vak,
      artifacts: [],
      improvement_vectors: [],
      closure_kind: "rehear",
      q_proposals: [{ ...base, rationale: "private q_personal detail leaked" }],
    }), /private q_personal/i);
  });

  it("q_proposal routes through Janus/Anansi by VAK position", () => {
    const anansiVak = {
      cpf: "(4.0/1-4.4/5)" as const,
      ct: ["CT0" as const],
      cp: "CP4.0" as const,
      cf: "(00/00)" as const,
      cfp: "CFP0" as const,
      cs: { code: "CS0" as const, direction: "Night'" as const },
    };
    const janusVak = {
      ...anansiVak,
      ct: ["CT1" as const],
      cp: "CP4.1" as const,
      cf: "(0/1)" as const,
    };

    assert.equal(routeQProposalByVak(anansiVak).guardian, "anansi");
    assert.equal(routeQProposalByVak(janusVak).guardian, "janus");
    assert.equal(routeQProposalByVak(janusVak).coordinator, "psyche");
    assert.equal(routeQProposalByVak(janusVak).mode, "aletheia");
    assert.equal(routeQProposalByVak(janusVak).review_surface, "tui_portal_pane");
  });
});
