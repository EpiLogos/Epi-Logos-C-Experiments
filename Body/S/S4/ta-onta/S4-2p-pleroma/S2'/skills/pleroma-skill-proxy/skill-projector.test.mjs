import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  CENTRAL_SKILL_ROOTS,
  enumerateCentralSkills,
  findRepoRoot,
  projectSkills,
} from "./skill-projector.mjs";
import {
  computeAgentEntitlement,
  enumerateSkillUniverse,
} from "../../../../../pi-agent/lib/entitlement.ts";
import {
  createSkillLookupService,
  parseSkillLookupConfigToml,
} from "../../../../../pi-agent/skills/custom/skill-lookup/index.ts";

const CONFIG_TOML = `
[pi.skill_lookup]
max_results_default = 200
semantic_similarity_score_cutoff = 0
cache_ttl_ms = 60000
fallback_trigger_threshold = 1
local_embedding_model = "TaylorAI/bge-micro-v2"
embedding_dimensions = 384
`;

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = findRepoRoot(here);

function tempDir(prefix) {
  return mkdtempSync(join(tmpdir(), prefix));
}

function writeSkill(root, relRoot, name, body) {
  const dir = join(root, relRoot, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "SKILL.md"),
    [
      "---",
      `name: ${name}`,
      `description: ${body}`,
      "vak_coordinate: \"CPF:(4.0/1-4.4/5);CT:CT2;CP:4.2;CF:(0/1/2);CFP:test;CS:S4\"",
      `quintessential_form: "q_${name}"`,
      "bimba_coordinate: \"M5-1\"",
      "---",
      "",
      `# ${name}`,
      "",
      body,
      "",
    ].join("\n"),
    "utf8",
  );
  return dir;
}

function projectedSkillNames(targetDir) {
  return enumerateSkillUniverse([targetDir]).sort();
}

describe("pleroma skill projector", () => {
  it("projects the central union into each harness as live symlinks with CF identity", () => {
    const root = tempDir("epi-skill-projector-fixture-");
    writeFileSync(join(root, "AGENTS.md"), "# fixture\n", "utf8");
    const pleromaSkill = writeSkill(root, CENTRAL_SKILL_ROOTS[0], "techne-spawn", "spawn bounded tools");
    const animaSkill = writeSkill(root, CENTRAL_SKILL_ROOTS[1], "anima-orchestration", "dispatch by CF");
    writeSkill(root, CENTRAL_SKILL_ROOTS[2], "gnosis-retrieve", "retrieve gnostic evidence");
    writeSkill(root, CENTRAL_SKILL_ROOTS[3], "using-epi-logos", "route through epi-logos");

    const targetRoot = tempDir("epi-skill-projector-targets-");
    const targets = {
      "claude-native": join(targetRoot, "claude", "skills"),
      "codex-native": join(targetRoot, "codex", "skills"),
      "hermes-acp": join(targetRoot, "hermes", "skills"),
    };

    const result = projectSkills({
      repoRoot: root,
      harnesses: ["claude-native", "codex-native", "hermes-acp"],
      cfIdentity: "(0/1/2)",
      targetOverrides: targets,
    });

    assert.equal(result.skillCount, 4);
    for (const [harness, targetDir] of Object.entries(targets)) {
      assert.equal(result.projections.find((p) => p.harness === harness)?.linked.length, 4);
      for (const name of ["techne-spawn", "anima-orchestration", "gnosis-retrieve", "using-epi-logos"]) {
        const linkPath = join(targetDir, name);
        assert.equal(lstatSync(linkPath).isSymbolicLink(), true);
      }
      const manifest = JSON.parse(readFileSync(join(targetDir, ".epi-skill-projection.json"), "utf8"));
      assert.equal(manifest.cf_identity, "(0/1/2)");
      assert.ok(readFileSync(join(targetDir, ".epi-skill-projection.env"), "utf8").includes("CF_IDENTITY='(0/1/2)'"));
    }

    writeFileSync(join(pleromaSkill, "SKILL.md"), "central edit visible through symlink\n", "utf8");
    for (const targetDir of Object.values(targets)) {
      assert.equal(
        readFileSync(join(targetDir, "techne-spawn", "SKILL.md"), "utf8"),
        "central edit visible through symlink\n",
      );
    }
    assert.equal(realpathSync(join(targets["claude-native"], "anima-orchestration")), realpathSync(animaSkill));
  });

  it("keeps non-symlink local skills and reports projection skips", () => {
    const root = tempDir("epi-skill-projector-conflict-");
    writeFileSync(join(root, "AGENTS.md"), "# fixture\n", "utf8");
    writeSkill(root, CENTRAL_SKILL_ROOTS[0], "cmux", "cmux central");

    const targetDir = join(tempDir("epi-skill-projector-conflict-target-"), "skills");
    mkdirSync(join(targetDir, "cmux"), { recursive: true });
    writeFileSync(join(targetDir, "cmux", "SKILL.md"), "local cmux\n", "utf8");

    const result = projectSkills({
      repoRoot: root,
      harnesses: ["claude-native"],
      cfIdentity: "(0/1/2)",
      targetOverrides: { "claude-native": targetDir },
    });

    assert.equal(result.projections[0].linked.length, 0);
    assert.deepEqual(result.projections[0].skipped.map((s) => s.name), ["cmux"]);
    assert.equal(readFileSync(join(targetDir, "cmux", "SKILL.md"), "utf8"), "local cmux\n");
  });

  it("projects the live carrier store and exposes the same skill_lookup universe per harness", async () => {
    const targetRoot = tempDir("epi-skill-projector-live-");
    const targets = {
      "claude-native": join(targetRoot, "claude", "skills"),
      "codex-native": join(targetRoot, "codex", "skills"),
      "hermes-acp": join(targetRoot, "hermes", "skills"),
    };

    const { skills } = enumerateCentralSkills(repoRoot);
    assert.ok(skills.length >= 60);
    for (const name of ["pleroma-skill-proxy", "anima-orchestration", "gnosis-retrieve", "using-epi-logos"]) {
      assert.ok(skills.some((skill) => skill.name === name), `${name} missing from central store`);
    }

    projectSkills({
      repoRoot,
      harnesses: ["claude-native", "codex-native", "hermes-acp"],
      cfIdentity: "(4.5/0)",
      targetOverrides: targets,
    });

    const expectedNames = projectedSkillNames(targets["claude-native"]);
    assert.deepEqual(projectedSkillNames(targets["codex-native"]), expectedNames);
    assert.deepEqual(projectedSkillNames(targets["hermes-acp"]), expectedNames);

    const config = parseSkillLookupConfigToml(CONFIG_TOML);
    let lookupBaseline = null;
    for (const targetDir of Object.values(targets)) {
      const universe = enumerateSkillUniverse([targetDir]);
      const effective = computeAgentEntitlement(
        { skills: universe, tools: [] },
        undefined,
        { skills: { allow: [] }, tools: { allow: [] } },
      );
      const service = await createSkillLookupService({
        repoRoot,
        skillUniverseRoots: [targetDir],
        effective,
        config,
        homeDir: tempDir("epi-skill-projector-cache-"),
      });
      const names = service.lookup("constitutional skill projection gnostic dispatch", 200).map((entry) => entry.name).sort();
      assert.ok(names.includes("pleroma-skill-proxy"));
      assert.ok(names.includes("using-epi-logos"));
      if (lookupBaseline === null) lookupBaseline = names;
      assert.deepEqual(names, lookupBaseline);
    }

    assert.equal(existsSync(join(targets["hermes-acp"], "using-epi-logos", "SKILL.md")), true);
  });

  it("projects an Aeon to a sub-session like any skill and skill_lookup surfaces it with the aeon kind (46.3)", async () => {
    const root = tempDir("epi-skill-projector-aeon-");
    writeFileSync(join(root, "AGENTS.md"), "# fixture\n", "utf8");
    writeSkill(root, CENTRAL_SKILL_ROOTS[0], "techne-spawn", "spawn bounded tools");
    const aeonDir = join(root, CENTRAL_SKILL_ROOTS[1], "assess-improve-aeon");
    mkdirSync(aeonDir, { recursive: true });
    writeFileSync(
      join(aeonDir, "SKILL.md"),
      [
        "---",
        "name: assess-improve-aeon",
        "description: Reusable Aeon loop for scheduled assess-and-improve passes.",
        "kind: aeon",
        "vak_coordinate: \"CPF:(4.0/1-4.4/5);CT:CT4b;CP:4.2;CF:(0/1/2);CFP:Z;CS:S4\"",
        "quintessential_form: \"q_assess_improve\"",
        "bimba_coordinate: \"M5-1\"",
        "entitlement_class: \"constitutional\"",
        "---",
        "",
        "# assess-improve-aeon",
        "",
        "Reusable Aeon loop form.",
        "",
      ].join("\n"),
      "utf8",
    );

    const targetRoot = tempDir("epi-skill-projector-aeon-targets-");
    const targets = { "claude-native": join(targetRoot, "claude", "skills") };
    const result = projectSkills({
      repoRoot: root,
      harnesses: ["claude-native"],
      cfIdentity: "(0/1/2)",
      targetOverrides: targets,
    });

    // the Aeon rides the same projection path as any skill: a live symlink
    assert.equal(result.skillCount, 2);
    const linkPath = join(targets["claude-native"], "assess-improve-aeon");
    assert.equal(lstatSync(linkPath).isSymbolicLink(), true);
    assert.equal(realpathSync(linkPath), realpathSync(aeonDir));

    // and the projected universe surfaces it through skill_lookup with kind "aeon"
    const config = parseSkillLookupConfigToml(CONFIG_TOML);
    const universe = enumerateSkillUniverse([targets["claude-native"]]);
    const effective = computeAgentEntitlement(
      { skills: universe, tools: [] },
      undefined,
      { skills: { allow: [] }, tools: { allow: [] } },
    );
    const service = await createSkillLookupService({
      repoRoot: root,
      skillUniverseRoots: [targets["claude-native"]],
      effective,
      config,
      homeDir: tempDir("epi-skill-projector-aeon-cache-"),
    });
    const entries = service.lookup("reusable assess and improve loop", 50);
    const aeon = entries.find((entry) => entry.name === "assess-improve-aeon");
    assert.ok(aeon, "projected Aeon must be discoverable via skill_lookup");
    assert.equal(aeon.kind, "aeon");
  });
});
