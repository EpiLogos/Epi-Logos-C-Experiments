/**
 * Coordinate: M4-3 (Nara process — Daily Briefing skill artifact test)
 * Residency: Body/S/S5/plugins/epi-logos/skills/nara-daily-briefing/skill.test.mjs
 * Position (#n): #5 — Integration; the VOICE-LAW proof the 05.18 Verify line names.
 * Runner: node --test Body/S/S5/plugins/epi-logos/skills/nara-daily-briefing/skill.test.mjs
 *
 * This is a BEHAVIORAL test on the deliverable, not a source grep:
 *   - it PARSES SKILL.md into its structural sections and asserts order;
 *   - it exercises a real VOICE-LAW predicate (voice-law.mjs) against crafted
 *     positive/negative fixtures — proving the predicate is not vacuous —
 *     then runs it over the real inscribable band of SKILL.md.
 *
 * The design-recon 05.18 line names TWO tests. The second (this one) is the
 * VOICE-LAW unit test. The first — "integration test against a fixed Kairos
 * state producing a deterministic briefing inscribed via Khora" — is N/A by
 * construction: the briefing is LLM-composed ("voiced not templated / no new
 * compute layer", SKILL.md), so it has no deterministic Rust/JS output to
 * assert. A fabricated deterministic assembler would contradict the design.
 */

import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  EXPECTED_SECTION_TITLES,
  parseSections,
  stripVoiceLawSection,
  extractVoiceLawSection,
  templatedClaimViolations,
  registerAdjacencyViolations,
  hasSymbolCitation,
} from "./voice-law.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const SKILL_PATH = join(here, "SKILL.md");
const skill = readFileSync(SKILL_PATH, "utf8");

/** Slice a `### Section N — ...` subsection body up to the next `### `/`## `. */
function subsectionBody(md, n) {
  const lines = md.split("\n");
  const start = lines.findIndex((l) =>
    new RegExp(`^###\\s+Section\\s+${n}\\s+—`).test(l),
  );
  if (start === -1) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^###?\s/.test(lines[i])) { end = i; break; }
  }
  return lines.slice(start + 1, end).join("\n");
}

describe("nara-daily-briefing SKILL.md — structure", () => {
  it("declares the five structural sections in inscription order", () => {
    const sections = parseSections(skill);
    assert.equal(sections.length, 5, "expected exactly five ### Section headers");
    assert.deepEqual(
      sections.map((s) => s.n),
      [1, 2, 3, 4, 5],
      "sections must be numbered 1..5 in file order",
    );
    assert.deepEqual(
      sections.map((s) => s.title),
      EXPECTED_SECTION_TITLES,
      "section titles must match Klein state -> Cross-system bridge -> Somatic register -> Live spreads -> QL Walk",
    );
  });
});

describe("nara-daily-briefing — VOICE LAW predicate (fixtures prove it is live)", () => {
  it("FLAGS a bare templated 'today is X phase' claim with no adjacent symbol", () => {
    const bad = "Today is the calcinatio phase.";
    const v = templatedClaimViolations(bad);
    assert.equal(v.length, 1, "the forbidden bare templated claim must be flagged");
    assert.match(v[0].line, /calcinatio/);
  });

  it("FLAGS 'today is a X day' just the same", () => {
    assert.equal(templatedClaimViolations("So today is a nigredo day.").length, 1);
  });

  it("PASSES the same construction once a symbol earns it (adjacent citation)", () => {
    // A planet + sign citation on the line licenses the register naming.
    const ok = "Under a Capricorn Moon, today is the coagulatio phase.";
    assert.ok(hasSymbolCitation(ok), "fixture must carry a real symbol citation");
    assert.equal(
      templatedClaimViolations(ok).length,
      0,
      "a templated claim beside its symbol is NOT a violation",
    );
  });

  it("is same-line strict by default, but 'adjacent' (window:1) accepts a neighbour-line citation", () => {
    const windowed = "[[Mercurius]] window opening.\nTherefore today is a solutio day.";
    // strict (the skill's canonical "same line" law): citation is one line away -> flagged
    assert.equal(templatedClaimViolations(windowed).length, 1);
    // relaxed adjacency: the neighbouring citation earns it -> clean
    assert.equal(templatedClaimViolations(windowed, { window: 1 }).length, 0);
  });
});

describe("nara-daily-briefing — VOICE LAW over the real deliverable", () => {
  it("the inscribable band (skill minus the Voice-law rule) carries no bare templated claim", () => {
    const band = stripVoiceLawSection(skill);
    assert.ok(band.length < skill.length, "the Voice-law section must actually be excised");
    const v = templatedClaimViolations(band);
    assert.deepEqual(
      v,
      [],
      `templated voice-law violations in the inscribable band: ${JSON.stringify(v)}`,
    );
  });

  it("the predicate is genuinely live against this file: it FIRES on the prohibition the skill quotes", () => {
    // The Voice-law section quotes "today is the calcinatio phase" as what NOT
    // to do; extract that exact quoted construction from the real file and
    // prove the predicate detects it in isolation — so the clean band above is
    // a real pass, not a pattern that never matches.
    const voiceLaw = extractVoiceLawSection(skill);
    assert.match(voiceLaw, /today is X phase/i, "Voice-law section must state the rule");
    const quoted = voiceLaw.match(/"(today is [^"]+)"/i);
    assert.ok(quoted, "Voice-law section must quote a concrete forbidden example");
    assert.equal(
      templatedClaimViolations(quoted[1]).length,
      1,
      `predicate must fire on the file's own quoted-forbidden example: "${quoted?.[1]}"`,
    );
  });

  it("the worked composition examples obey 'register word beside its symbol'", () => {
    const anchor = skill
      .split("\n")
      .find((l) => l.startsWith("Which register voices a given day"));
    assert.ok(anchor, "the worked-examples paragraph must be present");
    // e.g. 'Saturn stationing under a Capricorn Moon: L2' coagulatio ...'
    assert.deepEqual(
      registerAdjacencyViolations(anchor),
      [],
      "every register word in the worked examples must sit beside a symbol",
    );
  });
});

describe("nara-daily-briefing — symbol-citation discipline in the cross-system bridge", () => {
  it("Section 2 cites real substrate: decan, ruling planet, tarot/pip, element, chakra", () => {
    const bridge = subsectionBody(skill, 2);
    assert.ok(bridge, "Section 2 (Cross-system bridge) must be present");
    for (const term of [/\bdecan\b/i, /\bplanet\b/i, /\b(?:tarot|pip)\b/i, /\belement\b/i, /\bchakra\b/i]) {
      assert.match(bridge, term, `cross-system bridge must reference ${term}`);
    }
  });

  it("Section 2 names the real substrate accessors, not invented data", () => {
    const bridge = subsectionBody(skill, 2);
    // The decan/pip join must point at the live tables, not fabricated values.
    assert.match(bridge, /ZODIAC_DECAN_TABLE/, "must cite the real decan table");
    assert.match(bridge, /PIP_DECAN_MAP/, "must cite the real Golden-Dawn pip map");
    assert.match(bridge, /balance\(\)/, "dominant/deficient element must come from balance()");
  });
});
