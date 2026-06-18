import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { mkdtempSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
	computeAgentEntitlement,
	enumerateSkillUniverse,
} from "../../../lib/entitlement.ts";
import {
	rewriteInjectedSkillsManifest,
} from "../../../extensions/epii-entitlement-activation.ts";
import {
	createSkillLookupService,
	parseSkillLookupConfigToml,
	skillManifestEmbeddingCachePath,
} from "./index.ts";

const CONFIG_TOML = `
[pi.skill_lookup]
max_results_default = 3
semantic_similarity_score_cutoff = 0
cache_ttl_ms = 60000
fallback_trigger_threshold = 1
local_embedding_model = "TaylorAI/bge-micro-v2"
embedding_dimensions = 384
`;

function writeSkill(root: string, name: string, description: string, body: string) {
	const dir = join(root, name);
	mkdirp(dir);
	writeFileSync(
		join(dir, "SKILL.md"),
		[
			"---",
			`name: ${name}`,
			`description: "${description}"`,
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
}

function mkdirp(path: string) {
	mkdirSync(path, { recursive: true });
}

function fixture() {
	const root = mkdtempSync(join(tmpdir(), "skill-lookup-"));
	const skillsRoot = join(root, "skills");
	const homeDir = join(root, "home");
	mkdirp(skillsRoot);
	mkdirp(homeDir);
	writeSkill(
		skillsRoot,
		"gnosis_ingest",
		"Ingest markdown files into the gnostic namespace.",
		"Use this skill when a task needs to ingest a markdown document into Gnosis or the gnostic notebook namespace.",
	);
	writeSkill(
		skillsRoot,
		"style_editor",
		"Revise prose style and voice.",
		"Use this skill when a task needs sentence-level editorial polish, tone work, or voice alignment.",
	);
	writeSkill(
		skillsRoot,
		"forbidden_research",
		"Privileged external research skill.",
		"Use this skill for restricted web investigation requiring elevation.",
	);
	const universe = enumerateSkillUniverse([skillsRoot]);
	const effective = computeAgentEntitlement(
		{ skills: universe, tools: [] },
		undefined,
		{
			skills: { allow: ["gnosis_ingest", "style_editor"] },
			tools: { allow: [] },
		},
	);
	return { root, skillsRoot, homeDir, effective };
}

describe("skill_lookup ranks by semantic relevance", () => {
	it("ranks gnosis_ingest first for ingest markdown gnostic", async () => {
		const f = fixture();
		const config = parseSkillLookupConfigToml(CONFIG_TOML);
		const service = await createSkillLookupService({
			skillUniverseRoots: [f.skillsRoot],
			effective: f.effective,
			config,
			homeDir: f.homeDir,
		});
		const results = await service.lookup("ingest markdown gnostic");
		assert.equal(results[0]?.name, "gnosis_ingest");
		assert.equal(results[0]?.entitlement_class, "allowed-for-current-agent");
		assert.ok(results[0]?.score !== undefined);
	});
});

describe("skill_lookup respects entitlement filter", () => {
	it("pre-filters forbidden skills before ranking", async () => {
		const f = fixture();
		const config = parseSkillLookupConfigToml(CONFIG_TOML);
		const service = await createSkillLookupService({
			skillUniverseRoots: [f.skillsRoot],
			effective: f.effective,
			config,
			homeDir: f.homeDir,
		});
		const results = await service.lookup("restricted privileged external research");
		assert.deepEqual(
			results.map((entry) => entry.name).includes("forbidden_research"),
			false,
		);
		assert.ok(results.every((entry) => entry.entitlement_class === "allowed-for-current-agent"));
	});
});

describe("eager XML manifest fallback fires when skill_lookup unavailable", () => {
	it("keeps the fail-soft XML manifest path entitlement-filtered", () => {
		const f = fixture();
		const manifest = [
			"alpha",
			"<available_skills>",
			"  <skill><name>gnosis_ingest</name></skill>",
			"  <skill><name>forbidden_research</name></skill>",
			"</available_skills>",
			"omega",
		].join("\n");
		const fallback = rewriteInjectedSkillsManifest(manifest, f.effective, {
			skillLookupAvailable: false,
		});
		assert.equal(fallback.mode, "xml_fallback");
		assert.deepEqual(fallback.removed, ["forbidden_research"]);
		assert.ok(fallback.prompt.includes("<available_skills>"));
		assert.ok(!fallback.prompt.includes("forbidden_research"));

		const primary = rewriteInjectedSkillsManifest(manifest, f.effective, {
			skillLookupAvailable: true,
		});
		assert.equal(primary.mode, "skill_lookup");
		assert.ok(primary.prompt.includes("Use `skill_lookup(query)`"));
		assert.ok(!primary.prompt.includes("<available_skills>"));
	});
});

describe("skill_lookup config and cache discipline", () => {
	it("requires pi.skill_lookup thresholds instead of hardcoded defaults", () => {
		assert.throws(
			() => parseSkillLookupConfigToml("[pi.skill_lookup]\nmax_results_default = 3\n"),
			/Missing \[pi\.skill_lookup\]\.semantic_similarity_score_cutoff/,
		);
	});

	it("writes manifest embeddings under ~/.epi-logos/cache/skill-manifest-embeddings", async () => {
		const f = fixture();
		const config = parseSkillLookupConfigToml(CONFIG_TOML);
		await createSkillLookupService({
			skillUniverseRoots: [f.skillsRoot],
			effective: f.effective,
			config,
			homeDir: f.homeDir,
		});
		const cacheDir = join(f.homeDir, ".epi-logos", "cache", "skill-manifest-embeddings");
		assert.ok(existsSync(cacheDir));
		assert.match(skillManifestEmbeddingCachePath(f.homeDir, "abc123"), /abc123\.bin$/);
	});
});
