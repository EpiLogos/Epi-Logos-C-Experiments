/**
 * ct-artifact-binding-live.mjs — LIVE proof for 50.T50.08 (not part of the shared gate).
 *
 * The tranche's claim: "a script with CT-declared artifact templates produces the
 * correct Hen artifact/candidate." This proves exactly that, end to end, with no
 * mocks and no fabricated artifacts:
 *
 *   1. an orchestration script declares its outputs by CONTENT-TYPE only
 *      (`ct: ["CT2"]`) — it never names a template by hand;
 *   2. the CT declarations resolve through Hen's real registry;
 *   3. each resolved template is rendered by Hen's REAL render path
 *      (`renderTemplateWithVak`, the same function `hen_template_invoke` calls)
 *      and written into a throwaway vault;
 *   4. the artifact on disk carries the right `template_id` and the declaring
 *      step's full VAK address;
 *   5. a step declaring bare `CT4` is REFUSED and produces no artifact;
 *   6. the REAL `epi` binary renders the CT4a template and stamps `ctx_type: CT4a`
 *      — proving the Rust half of the mapping, which previously stamped CT0.
 *
 * Deliberately NOT `*.test.ts`: step 6 shells out to a built binary.
 *
 * Usage: node Body/S/S4/ta-onta/S4-4p-anima/tests/ct-artifact-binding-live.mjs
 */

import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import { resolvedArtifactTemplates } from "../lib/vak-orchestration-surface.ts";
import { validateDispatchParams } from "../modules/dispatch-validate.ts";
import { renderTemplateWithVak } from "../../S4-1p-hen/modules/template-vak.ts";
import { ctForTemplate } from "../../S4-1p-hen/modules/ct-template-registry.ts";

const failures = [];
function check(label, condition, detail = "") {
  if (condition) {
    console.log(`  PASS  ${label}`);
  } else {
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
    failures.push(label);
  }
}

const REPO_ROOT = join(import.meta.dirname, "..", "..", "..", "..", "..", "..");

/** A canonical mechanistic address, CT supplied per step. */
const address = (ct) => ({
  cpf: "(4.0/1-4.4/5)",
  ct,
  cp: "CP4.2",
  cf: "(0/1)",
  cfp: "CFP2",
  cs: { code: "CS2", direction: "Day" },
});

/**
 * The script under test. Note what is NOT here: no template names. Every step
 * declares only its CT content-type; the templates are resolved, not authored.
 */
const SCRIPT = [
  { step: "spec the work", address: address(["CT2"]) },
  { step: "open the day", address: address(["CT4b"]) },
  { step: "preview the integration", address: address(["CT4a"]) },
];

const vault = mkdtempSync(join(tmpdir(), "ct-artifact-live-"));
console.log(`\nCT → Hen artifact binding, live (vault: ${vault})\n`);

try {
  // ── 1-4. CT-declared steps materialise the correct artifacts ──────────────
  console.log("Declared by content-type, resolved to Hen templates, rendered:");

  const produced = [];
  for (const { step, address: addr } of SCRIPT) {
    const validation = validateDispatchParams({
      agent_name: "logos",
      task: step,
      vak_address: addr,
    });
    check(`"${step}" validates`, validation.ok === true, validation.error);

    const resolution = resolvedArtifactTemplates(addr);
    check(
      `"${step}" (${addr.ct.join(",")}) resolves to ≥1 template`,
      resolution.templates.length > 0,
      JSON.stringify(resolution),
    );
    check(
      `"${step}" leaves nothing unresolved`,
      resolution.unresolved.length === 0,
      JSON.stringify(resolution.unresolved),
    );

    for (const template of resolution.templates) {
      // Hen's REAL render path — the same function hen_template_invoke calls.
      const text = renderTemplateWithVak({
        template_id: template,
        day_id: "25-07-2026",
        vak_address: addr,
        body: `Produced for: ${step}`,
      });
      const path = join(vault, `${template}.md`);
      writeFileSync(path, text);
      produced.push({ template, path, declaredCt: addr.ct });
    }
  }

  // The artifacts exist on disk and say what they are.
  console.log("\nArtifacts on disk carry the right identity:");
  for (const { template, path, declaredCt } of produced) {
    check(`${template}.md was written`, existsSync(path));
    const text = readFileSync(path, "utf8");
    check(
      `${template}.md declares template_id: ${template}`,
      new RegExp(`^template_id: ${template}$`, "m").test(text),
    );
    // The artifact carries the FULL declaring address, not just the CT.
    check(
      `${template}.md carries the declaring CT (${declaredCt.join(",")})`,
      declaredCt.every((ct) => new RegExp(`^  - ${ct}$`, "m").test(text)),
    );
    check(
      `${template}.md carries the full six-field envelope`,
      ["cpf:", "ct:", "cp:", "cf:", "cfp:", "cs_code:"].every((k) => text.includes(k)),
    );
    // And the template it rendered really belongs to the CT that asked for it.
    check(
      `${template} belongs to ${ctForTemplate(template)}`,
      declaredCt.includes(ctForTemplate(template)),
    );
  }

  // Every archetype in the script actually materialised, by name.
  const names = produced.map((p) => p.template).sort();
  check(
    "the three CT declarations produced exactly their four artifacts",
    JSON.stringify(names) ===
      JSON.stringify(["daily-note", "integration-preview", "now", "task-spec"]),
    JSON.stringify(names),
  );

  // ── 5. bare CT4 is refused and produces nothing ───────────────────────────
  console.log("\nAn under-declared CT is refused, not guessed:");
  const refused = validateDispatchParams({
    agent_name: "logos",
    task: "produce something, unspecified",
    vak_address: address(["CT4"]),
  });
  check("bare CT4 is REFUSED", refused.ok === false);
  check(
    "the refusal names the phases to fix it",
    /CT4a/.test(refused.error ?? "") && /CT4b/.test(refused.error ?? ""),
    refused.error,
  );
  check(
    "no artifact was produced for the refused step",
    !existsSync(join(vault, "CT4.md")),
  );

  // ── 6. the REAL epi binary stamps CT4a for integration-preview ────────────
  console.log("\nThe Rust render path agrees (real binary):");
  const epi = join(REPO_ROOT, "target", "debug", "epi");
  if (!existsSync(epi)) {
    check("epi binary present", false, `not built at ${epi} — run cargo build -p epi-logos`);
  } else {
    const run = spawnSync(
      epi,
      ["vault", "template-invoke", "integration-preview", "--coordinate", "S4-1"],
      { encoding: "utf8", env: { ...process.env, EPILOGOS_VAULT: vault } },
    );
    const output = `${run.stdout ?? ""}${run.stderr ?? ""}`;
    check("epi vault template-invoke integration-preview ran", run.status === 0, output.slice(0, 400));
    if (run.status === 0) {
      // The CT4a stamp is the Rust half of the mapping. It used to read CT0.
      const stamped =
        /ctx_type:\s*"?CT4a"?/.test(output) ||
        // when the CLI writes rather than prints, find the artifact it wrote
        (() => {
          const written = /(\/[^\s"']+Integration-Preview[^\s"']*\.md)/.exec(output);
          if (written && existsSync(written[1])) {
            return /ctx_type:\s*"?CT4a"?/.test(readFileSync(written[1], "utf8"));
          }
          return false;
        })();
      check("the rendered CT4a artifact is stamped ctx_type CT4a (was CT0)", stamped, output.slice(0, 600));
    }
  }
} finally {
  rmSync(vault, { recursive: true, force: true });
}

console.log(
  failures.length === 0
    ? "\nALL LIVE CHECKS PASSED — CT declarations materialise real Hen artifacts.\n"
    : `\n${failures.length} LIVE CHECK(S) FAILED:\n  - ${failures.join("\n  - ")}\n`,
);
process.exit(failures.length === 0 ? 0 : 1);
