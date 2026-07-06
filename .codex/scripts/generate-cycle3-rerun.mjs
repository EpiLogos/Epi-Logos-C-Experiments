#!/usr/bin/env node
// Coordinate: M' | Residency: .codex/scripts | Position: #3 (Process)
// Actualises: cycle-3 full-rerun plan-set generation (every original tranche → retargeted task stub)
// Public surface: CLI (node generate-cycle3-rerun.mjs [--dry]) | Does NOT own: plan state, routing, verification
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { parseTrackTasks } from "./m-dev-plan-assess.mjs";

const CWD = process.cwd();
const ORIG = join(CWD, "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation");
const DEST = join(CWD, "Idea/Bimba/Seeds/M/Legacy/plans/2026-07-03-m-prime-cycle-3-full-rerun");
const EXCLUDE = new Set([
  "00-KICKOFF-PROMPT.md", // repudiated historical prompt (charter reading rail)
  "00-overview-and-design-reconciliation.md", // method doc (charter reading rail)
  "13-decision-register.md", // DR law, not tranche work (charter reading rail)
]);
const dry = process.argv.includes("--dry");

const origState = JSON.parse(readFileSync(join(ORIG, "plan.state.json"), "utf8"));
const statusOf = (id) => origState.tasks?.[id]?.status ?? "not-in-ledger";

const files = readdirSync(ORIG)
  .filter((f) => /^\d{2}-.+\.md$/.test(f) && !EXCLUDE.has(f))
  .sort();
const generatedTrackIds = new Set(files.map((f) => f.slice(0, 2)));
generatedTrackIds.add("00"); // the hand-authored verification harness

let totalTasks = 0;
const report = [];

for (const file of files) {
  const content = readFileSync(join(ORIG, file), "utf8");
  const trackId = file.slice(0, 2);
  const origRel = relative(CWD, join(ORIG, file));
  const track = { id: trackId, file, path: origRel };
  const tasks = parseTrackTasks(track, content);
  const title = (content.match(/^#\s+(.+)$/m) || [, file.replace(/\.md$/, "")])[1].trim();

  const lines = [];
  lines.push(`# ${title} (RERUN — target: pratibimba-app + substrate)`);
  lines.push("");
  lines.push(
    `Source of truth for every tranche below: \`${origRel}\` — read the tranche's section IN FULL there before executing; this file carries only retarget + audit posture. Retarget law, resolved decisions, and verification law: \`CHARTER.md\`. Audit map: [[2026-07-03-cycle-3-recapture-register]] §2 (track ${trackId}). Original ledger statuses are CLAIMS about the dead Theia carrier, never truth about this one. Track 00 (verification harness) gates all closure here.`,
  );
  lines.push("");

  if (tasks.length === 0) {
    lines.push(`1. **T0 — Absorb and retarget: ${file} (law-only source)**`);
    lines.push("");
    lines.push(
      `   Brief: read \`${origRel}\` IN FULL. It carries binding law/design with no tranche list. Enumerate its unbuilt commitments against the current carrier (register §2 track ${trackId} lists known gaps) as new numbered tranches appended to THIS file, then close this task with the enumeration as evidence.`,
    );
    lines.push(
      "   Verify: new tranches parse into the ledger (re-run the assess script and show the new task ids); each cites its original section.",
    );
    lines.push("");
    totalTasks += 1;
  } else {
    tasks.forEach((t, i) => {
      lines.push(`${i + 1}. **T${t.tranche.replace(/^T/, "")} — ${t.title}**`);
      lines.push("");
      lines.push(
        `   Brief: \`${origRel}\` — Tranche ${t.tranche.replace(/^T/, "")} in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per \`CHARTER.md\` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).`,
      );
      lines.push(`   Original ledger status: ${statusOf(t.id)} — verify or rebuild; never build on it unverified.`);
      for (const dep of t.dependsOn ?? []) {
        const m = dep.match(/^(\d{2})\.T(.+)$/);
        if (!m) continue;
        if (generatedTrackIds.has(m[1])) {
          lines.push(`   Depends on Track ${m[1]} Tranche ${m[2]}.`);
        } else {
          lines.push(`   (Original cross-reference outside this ledger: Track ${m[1]} T${m[2]} — see source file.)`);
        }
      }
      lines.push(
        "   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.",
      );
      lines.push("");
      totalTasks += 1;
    });
  }

  const out = lines.join("\n");
  if (!dry) writeFileSync(join(DEST, file), out);
  report.push(`${file}: ${tasks.length === 0 ? "law-only (1 absorb task)" : tasks.length + " tranches"}`);
}

console.log(report.join("\n"));
console.log(`\n${files.length} track files generated → ${DEST}`);
console.log(`${totalTasks} tasks (+ Track 00 harness tranches authored by hand)`);
if (!existsSync(join(DEST, "00-verification-harness.md"))) {
  console.warn("WARN: 00-verification-harness.md missing in destination");
}
