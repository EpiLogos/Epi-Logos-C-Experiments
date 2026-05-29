// C4: Aletheia ingest receives Sophia disclosure → routes to Epii inbox.
//
// Pure-factory tests for `routeToEpiiInbox`. The factory composes the
// canonical `epii_autoresearch_inbox_entry` payload from a Sophia disclosure
// plus optional Moirai outputs — the Möbius seam TS handoff that
// Epii-autoresearch-core (C5/C6) will consume from
// ${EPILOGOS_VAULT}/Pratibimba/Epii/inbox/${session_id}.jsonl.

import { describe, it, beforeEach, afterEach } from "node:test";
import { strict as assert } from "node:assert";
import { mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { routeToEpiiInbox, aletheiaIngestSophia } from "../modules/sophia-ingest.ts";

describe("Aletheia routes Sophia disclosure to Epii inbox", () => {
  it("produces an Epii inbox payload with sophia source", () => {
    const payload = routeToEpiiInbox({
      session_id: "agent:test:main",
      day_id: "22-05-2026",
      sophia_disclosure: {
        kind: "sophia_session_end_disclosure",
        session_id: "agent:test:main",
        day_id: "22-05-2026",
        final_vak: {
          cpf: "(4.0/1-4.4/5)",
          ct: ["CT5"],
          cp: "CP4.5",
          cf: "(5/0)",
          cfp: "CFP0",
          cs: { code: "CS0", direction: "Night'" },
        },
        artifacts: ["/path/to/note.md"],
        improvement_vectors: ["v1"],
        handoff_target: "aletheia_ingest",
        closure_kind: "rehear",
      },
      moirai_outputs: { klotho: "traces summary", lachesis: "sources", atropos: "insight" },
    });
    assert.equal(payload.kind, "epii_autoresearch_inbox_entry");
    assert.equal(payload.source, "aletheia_sophia_ingest");
    assert.equal(payload.session_id, "agent:test:main");
    assert.equal(payload.day_id, "22-05-2026");
    assert.equal(payload.final_vak.cf, "(5/0)");
    assert.equal(payload.improvement_vectors.length, 1);
    assert.equal(payload.artifacts.length, 1);
    assert.equal(payload.moirai_summary.klotho, "traces summary");
    assert.equal(payload.moirai_summary.atropos, "insight");
    assert.equal(payload.closure_kind, "rehear", "closure_kind propagates through to Epii routing");
  });

  it("propagates closure_kind=force_closed through routing", () => {
    const payload = routeToEpiiInbox({
      session_id: "agent:forced:1",
      day_id: "22-05-2026",
      sophia_disclosure: {
        kind: "sophia_session_end_disclosure",
        session_id: "agent:forced:1",
        day_id: "22-05-2026",
        final_vak: {
          cpf: "(4.0/1-4.4/5)",
          ct: ["CT2"],
          cp: "CP4.3",
          cf: "(0/1/2)",
          cfp: "CFP1",
          cs: { code: "CS3", direction: "Day" },
        },
        artifacts: [],
        improvement_vectors: [],
        handoff_target: "aletheia_ingest",
        closure_kind: "force_closed",
      },
      moirai_outputs: {},
    });
    assert.equal(payload.closure_kind, "force_closed");
    assert.equal(payload.final_vak.cf, "(0/1/2)", "mid-perform VAK survives routing too");
  });

  it("defaults closure_kind=rehear for legacy Sophia disclosures missing the field", () => {
    // Older Sophia disclosures pre-date the closure_kind discriminator. The
    // routing factory treats them as rehear (the historical assumption) so
    // existing entries flowing through C4 don't regress to force_closed.
    const legacy = {
      kind: "sophia_session_end_disclosure" as const,
      session_id: "agent:legacy:1",
      day_id: "22-05-2026",
      final_vak: {
        cpf: "(4.0/1-4.4/5)" as const,
        ct: ["CT5"] as const,
        cp: "CP4.5" as const,
        cf: "(5/0)" as const,
        cfp: "CFP0" as const,
        cs: { code: "CS0" as const, direction: "Night'" as const },
      },
      artifacts: [],
      improvement_vectors: [],
      handoff_target: "aletheia_ingest" as const,
    };
    // Cast: legacy literal lacks closure_kind — that's the point of this test.
    const payload = routeToEpiiInbox({
      session_id: "agent:legacy:1",
      day_id: "22-05-2026",
      sophia_disclosure: legacy as unknown as Parameters<typeof routeToEpiiInbox>[0]["sophia_disclosure"],
      moirai_outputs: {},
    });
    assert.equal(payload.closure_kind, "rehear", "legacy disclosures default to rehear");
  });

  it("accepts empty moirai_outputs (Aletheia ingests Sophia-only)", () => {
    const payload = routeToEpiiInbox({
      session_id: "agent:solo:1",
      day_id: "22-05-2026",
      sophia_disclosure: {
        kind: "sophia_session_end_disclosure",
        session_id: "agent:solo:1",
        day_id: "22-05-2026",
        final_vak: {
          cpf: "(4.0/1-4.4/5)",
          ct: ["CT5"],
          cp: "CP4.5",
          cf: "(5/0)",
          cfp: "CFP0",
          cs: { code: "CS0", direction: "Night'" },
        },
        artifacts: [],
        improvement_vectors: [],
        handoff_target: "aletheia_ingest",
        closure_kind: "rehear",
      },
      moirai_outputs: {},
    });
    assert.equal(payload.kind, "epii_autoresearch_inbox_entry");
    assert.deepEqual(payload.moirai_summary, {});
    assert.deepEqual(payload.improvement_vectors, []);
    assert.deepEqual(payload.artifacts, []);
  });

  it("preserves the Night' direction marker through routing", () => {
    const payload = routeToEpiiInbox({
      session_id: "agent:night:42",
      day_id: "22-05-2026",
      sophia_disclosure: {
        kind: "sophia_session_end_disclosure",
        session_id: "agent:night:42",
        day_id: "22-05-2026",
        final_vak: {
          cpf: "(4.0/1-4.4/5)",
          ct: ["CT5"],
          cp: "CP4.5",
          cf: "(5/0)",
          cfp: "CFP0",
          cs: { code: "CS0", direction: "Night'" },
        },
        artifacts: [],
        improvement_vectors: [],
        handoff_target: "aletheia_ingest",
        closure_kind: "rehear",
      },
      moirai_outputs: {},
    });
    assert.equal(payload.final_vak.cs.direction, "Night'");
  });
});

describe("aletheiaIngestSophia (end-to-end file I/O)", () => {
  let workDir: string;
  let savedVault: string | undefined;

  beforeEach(() => {
    workDir = mkdtempSync(join(tmpdir(), "aletheia-ingest-"));
    savedVault = process.env.EPILOGOS_VAULT;
    process.env.EPILOGOS_VAULT = workDir;
  });

  afterEach(() => {
    if (savedVault === undefined) delete process.env.EPILOGOS_VAULT;
    else process.env.EPILOGOS_VAULT = savedVault;
    rmSync(workDir, { recursive: true, force: true });
  });

  function seedSophia(session_id: string, day_id: string, extra?: { artifacts?: string[]; improvement_vectors?: string[] }): void {
    const inboxDir = join(workDir, "Pratibimba", "Sophia", "inbox");
    mkdirSync(inboxDir, { recursive: true });
    const disclosure = {
      kind: "sophia_session_end_disclosure",
      session_id,
      day_id,
      final_vak: {
        cpf: "(4.0/1-4.4/5)",
        ct: ["CT5"],
        cp: "CP4.5",
        cf: "(5/0)",
        cfp: "CFP0",
        cs: { code: "CS0", direction: "Night'" },
      },
      artifacts: extra?.artifacts ?? ["/vault/Idea/seed.md"],
      improvement_vectors: extra?.improvement_vectors ?? ["v-alpha"],
      handoff_target: "aletheia_ingest",
    };
    writeFileSync(
      join(inboxDir, `${session_id}.jsonl`),
      JSON.stringify(disclosure) + "\n",
      "utf8",
    );
  }

  it("reads Sophia jsonl, routes, and writes one Epii jsonl line", () => {
    const session_id = "agent:wire:1";
    const day_id = "29-05-2026";
    seedSophia(session_id, day_id);

    const result = aletheiaIngestSophia({
      session_id,
      day_id,
      moirai_outputs: { klotho: "K", lachesis: "L", atropos: "A" },
    });

    assert.equal(result.ok, true, `ingest should succeed: ${JSON.stringify(result)}`);
    if (!result.ok) return;
    assert.ok(existsSync(result.path), "Epii JSONL file should exist on disk");

    const raw = readFileSync(result.path, "utf8");
    const lines = raw.trim().split("\n");
    // The function uses appendFileSync — its contract permits repeated
    // invocations to grow the Epii inbox jsonl. The earlier "exactly one
    // line" assertion only held because the test uses a fresh tmpdir.
    // See the dedicated append-grows test below for the multi-invocation pin.
    assert.ok(lines.length >= 1, "at least one JSONL line written");

    const parsed = JSON.parse(lines[0]);
    assert.equal(parsed.kind, "epii_autoresearch_inbox_entry");
    assert.equal(parsed.source, "aletheia_sophia_ingest");
    assert.equal(parsed.session_id, session_id);
    assert.equal(parsed.day_id, day_id);
    assert.equal(parsed.final_vak.cs.direction, "Night'");
    assert.deepEqual(parsed.artifacts, ["/vault/Idea/seed.md"]);
    assert.deepEqual(parsed.improvement_vectors, ["v-alpha"]);
    assert.deepEqual(parsed.moirai_summary, { klotho: "K", lachesis: "L", atropos: "A" });
  });

  it("returns ok:false when EPILOGOS_VAULT is unset", () => {
    delete process.env.EPILOGOS_VAULT;
    const result = aletheiaIngestSophia({
      session_id: "agent:no-vault:1",
      day_id: "29-05-2026",
      moirai_outputs: {},
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.reason, /EPILOGOS_VAULT/);
  });

  it("returns ok:false when no Sophia disclosure exists for the session", () => {
    const result = aletheiaIngestSophia({
      session_id: "agent:no-sophia:1",
      day_id: "29-05-2026",
      moirai_outputs: {},
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.reason, /no Sophia disclosure/i);
  });

  it("picks the LAST non-empty JSONL line if multiple disclosures landed", () => {
    const session_id = "agent:multi:1";
    const day_id = "29-05-2026";
    const inboxDir = join(workDir, "Pratibimba", "Sophia", "inbox");
    mkdirSync(inboxDir, { recursive: true });

    const earlier = {
      kind: "sophia_session_end_disclosure",
      session_id,
      day_id,
      final_vak: {
        cpf: "(4.0/1-4.4/5)",
        ct: ["CT5"],
        cp: "CP4.5",
        cf: "(5/0)",
        cfp: "CFP0",
        cs: { code: "CS0", direction: "Night'" },
      },
      artifacts: ["/earlier.md"],
      improvement_vectors: ["v-earlier"],
      handoff_target: "aletheia_ingest",
    };
    const latest = {
      ...earlier,
      artifacts: ["/latest.md"],
      improvement_vectors: ["v-latest"],
    };
    writeFileSync(
      join(inboxDir, `${session_id}.jsonl`),
      JSON.stringify(earlier) + "\n" + JSON.stringify(latest) + "\n\n",
      "utf8",
    );

    const result = aletheiaIngestSophia({
      session_id,
      day_id,
      moirai_outputs: {},
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const parsed = JSON.parse(readFileSync(result.path, "utf8").trim());
    assert.deepEqual(parsed.artifacts, ["/latest.md"]);
    assert.deepEqual(parsed.improvement_vectors, ["v-latest"]);
  });

  it("repeated invocations grow the Epii inbox (append semantics)", () => {
    // Pins the append-grows contract that the C5 Rust-side InboxStore
    // consumes: each invocation against the same session_id appends a
    // distinct JSONL line rather than overwriting. The Sophia file is
    // read once and identical across calls; differentiation between
    // entries comes from the orchestrator's moirai_outputs parameter.
    const session_id = "agent:append:1";
    const day_id = "29-05-2026";
    seedSophia(session_id, day_id);

    const first = aletheiaIngestSophia({
      session_id,
      day_id,
      moirai_outputs: { klotho: "first-K", lachesis: "first-L", atropos: "first-A" },
    });
    assert.equal(first.ok, true, `first ingest should succeed: ${JSON.stringify(first)}`);
    if (!first.ok) return;

    const second = aletheiaIngestSophia({
      session_id,
      day_id,
      moirai_outputs: { klotho: "second-K", lachesis: "second-L", atropos: "second-A" },
    });
    assert.equal(second.ok, true, `second ingest should succeed: ${JSON.stringify(second)}`);
    if (!second.ok) return;

    // Both invocations write to the same per-session Epii inbox file.
    assert.equal(first.path, second.path, "same session_id → same Epii inbox path");

    const raw = readFileSync(second.path, "utf8");
    const lines = raw.trim().split("\n");
    assert.equal(lines.length, 2, "two invocations → two appended JSONL lines");

    const firstParsed = JSON.parse(lines[0]);
    const secondParsed = JSON.parse(lines[1]);
    assert.equal(firstParsed.kind, "epii_autoresearch_inbox_entry");
    assert.equal(secondParsed.kind, "epii_autoresearch_inbox_entry");
    assert.deepEqual(firstParsed.moirai_summary, { klotho: "first-K", lachesis: "first-L", atropos: "first-A" });
    assert.deepEqual(secondParsed.moirai_summary, { klotho: "second-K", lachesis: "second-L", atropos: "second-A" });
    assert.notDeepEqual(
      firstParsed.moirai_summary,
      secondParsed.moirai_summary,
      "second invocation's moirai_summary differs from the first",
    );
  });

  it("returns ok:false with an 'empty' reason when the Sophia file exists but has no content", () => {
    // Distinguishes a present-but-empty Sophia file from a missing one.
    // The orchestrator must surface this cleanly so the C5 InboxStore
    // consumer can tell a degenerate disclosure write apart from the
    // common "no Sophia at all" case (no synthesis was attempted).
    const session_id = "agent:empty-sophia:1";
    const day_id = "29-05-2026";
    const inboxDir = join(workDir, "Pratibimba", "Sophia", "inbox");
    mkdirSync(inboxDir, { recursive: true });
    writeFileSync(join(inboxDir, `${session_id}.jsonl`), "\n   \n\n", "utf8");

    const result = aletheiaIngestSophia({
      session_id,
      day_id,
      moirai_outputs: {},
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.reason, /empty/i, "reason mentions emptiness");
  });

  it("returns ok:false with a parse-failed reason when the last Sophia line is malformed", () => {
    // The orchestrator parses the LAST non-empty line. If that line is
    // malformed JSON the failure must be classified — not crash the
    // lifecycle handler — so tool surfaces can surface the reason.
    const session_id = "agent:bad-tail:1";
    const day_id = "29-05-2026";
    const inboxDir = join(workDir, "Pratibimba", "Sophia", "inbox");
    mkdirSync(inboxDir, { recursive: true });
    const validDisclosure = {
      kind: "sophia_session_end_disclosure",
      session_id,
      day_id,
      final_vak: {
        cpf: "(4.0/1-4.4/5)",
        ct: ["CT5"],
        cp: "CP4.5",
        cf: "(5/0)",
        cfp: "CFP0",
        cs: { code: "CS0", direction: "Night'" },
      },
      artifacts: [],
      improvement_vectors: [],
      handoff_target: "aletheia_ingest",
    };
    writeFileSync(
      join(inboxDir, `${session_id}.jsonl`),
      JSON.stringify(validDisclosure) + "\n" + "{ invalid json" + "\n",
      "utf8",
    );

    const result = aletheiaIngestSophia({
      session_id,
      day_id,
      moirai_outputs: {},
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.reason, /parse failed|JSON parse/i, "reason mentions parse failure");
  });
});
