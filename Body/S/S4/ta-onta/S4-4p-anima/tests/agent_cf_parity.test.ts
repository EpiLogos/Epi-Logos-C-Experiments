/**
 * agent_cf_parity.test.ts — one CF->agent binding, three places (50.T50.11).
 *
 * `AGENT_CF` (TS) and `cf_to_agent` (Rust, `Body/S/S0/epi-cli/src/agent/vak.rs`)
 * are independent tables of the same law, and the skills state it a third time
 * in prose. They agreed by luck; nothing caught a one-sided edit.
 *
 * This side reads `shared/agent_cf.parity.json` and so does the Rust side
 * (`Body/S/S0/epi-cli/tests/agent_cf_parity.rs`) — neither greps the other's
 * source, the discipline `vak_address.parity.json` established in 50.T50.03.
 *
 * The skill checks are the other half of "decide and land": the two divergences
 * this tranche ratified are asserted against the actual markdown, so a corrected
 * notation cannot quietly drift back.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { AGENT_CF, agentForCf, MOIRAI_HOST_CF } from "../modules/dispatch-validate.ts";
import { planMoiraiNightPass } from "../modules/moirai-dispatch.ts";

const REPO_ROOT = join(import.meta.dirname, "..", "..", "..", "..", "..", "..");
const FIXTURE = JSON.parse(
	readFileSync(join(import.meta.dirname, "..", "..", "shared", "agent_cf.parity.json"), "utf8"),
) as {
	constitutional: Record<string, string>;
	moiraiHost: Record<string, { cf: string; hostAgent: string; nightPosition: string }>;
	skillNotation: {
		nous: { canonical: string; forbidden: string[] };
		lachesis: { canonical: string; canonicalHostAgent: string; forbidden: string[] };
		files: string[];
	};
	rustUnknownCfFallback: { rust: string; typescript: null };
};

/** The fixture carries `$comment` keys for humans; they are not bindings. */
function bindings(record: Record<string, unknown>): [string, unknown][] {
	return Object.entries(record).filter(([key]) => !key.startsWith("$"));
}

test("AGENT_CF is exactly the fixture's constitutional roster", () => {
	const expected = Object.fromEntries(bindings(FIXTURE.constitutional));
	assert.deepEqual({ ...AGENT_CF }, expected);
});

test("every constitutional CF resolves back to the agent that owns it", () => {
	// Forward and inverse must agree, or `anima_orchestrate` could route a CF to
	// an agent whose own binding names a different CF.
	for (const [agent, cf] of bindings(FIXTURE.constitutional)) {
		assert.equal(agentForCf(cf as string), agent, `cf ${cf} should resolve to ${agent}`);
	}
});

test("no two constitutional agents share a CF", () => {
	const cfs = bindings(FIXTURE.constitutional).map(([, cf]) => cf);
	assert.equal(new Set(cfs).size, cfs.length, `duplicate CF in ${JSON.stringify(cfs)}`);
});

test("Nous is (00/00) — the tranche's ratified spelling", () => {
	assert.equal(AGENT_CF.nous, FIXTURE.skillNotation.nous.canonical);
	assert.equal(AGENT_CF.nous, "(00/00)");
});

test("MOIRAI_HOST_CF matches the ratified host bindings", () => {
	for (const [agent, entry] of bindings(FIXTURE.moiraiHost) as [
		string,
		{ cf: string; hostAgent: string },
	][]) {
		assert.equal(
			MOIRAI_HOST_CF[agent as keyof typeof MOIRAI_HOST_CF],
			entry.cf,
			`${agent} host CF`,
		);
		// The host CF must be a REAL constitutional CF, and the one belonging to
		// the agent the fixture names — otherwise "inherits its host's CF" is a
		// story rather than a binding.
		assert.equal(agentForCf(entry.cf), entry.hostAgent, `${agent} inherits ${entry.hostAgent}`);
	}
});

test("Lachesis hosts on Anima's frame, not Psyche's", () => {
	// The live divergence this tranche decided. Canon (S4-ARCHITECTURE.md:178)
	// reads "lachesis->Anima"; the anima-orchestration skill said (4.5/0) Psyche.
	assert.equal(MOIRAI_HOST_CF.lachesis, "(4.0/1-4.4/5)");
	assert.equal(agentForCf(MOIRAI_HOST_CF.lachesis), "anima");
	assert.notEqual(MOIRAI_HOST_CF.lachesis, AGENT_CF.psyche);
});

test("each Moirai's night position matches the dispatch plan it is planned into", () => {
	const plan = planMoiraiNightPass({
		session_id: "agent:anima:main",
		disclosure_path: "/tmp/disclosure.jsonl",
	});
	for (const [agent, entry] of bindings(FIXTURE.moiraiHost) as [
		string,
		{ nightPosition: string },
	][]) {
		const dispatched = plan.dispatches.find((d) => d.agent === agent);
		assert.ok(dispatched, `${agent} should be in the night pass`);
		assert.equal(dispatched.night_position, entry.nightPosition, `${agent} night position`);
	}
});

test("agentForCf says it does not know an off-roster CF", () => {
	// Pinned, not fixed: Rust answers the same question with "psyche". The
	// fixture records both so the divergence is visible rather than tolerated.
	assert.equal(agentForCf("(9/9)"), FIXTURE.rustUnknownCfFallback.typescript ?? undefined);
	assert.equal(FIXTURE.rustUnknownCfFallback.rust, "psyche");
});

// ── the skills state the same law in prose ────────────────────────────────

test("no skill carries a superseded CF spelling", () => {
	const failures: string[] = [];
	for (const relative of FIXTURE.skillNotation.files) {
		const text = readFileSync(join(REPO_ROOT, relative), "utf8");
		for (const forbidden of FIXTURE.skillNotation.nous.forbidden) {
			if (text.includes(forbidden)) {
				failures.push(`${relative} still writes Nous' frame as ${forbidden}`);
			}
		}
		// Psyche's own CF is legitimately named in these files; only a LACHESIS
		// line carrying it is the regression.
		for (const line of text.split("\n")) {
			if (!/lachesis/i.test(line)) continue;
			for (const forbidden of FIXTURE.skillNotation.lachesis.forbidden) {
				if (line.includes(forbidden)) {
					failures.push(`${relative}: a Lachesis line still carries ${forbidden} — ${line.trim()}`);
				}
			}
		}
	}
	assert.deepEqual(failures, [], failures.join("\n"));
});

test("every Lachesis line naming a frame names Anima's", () => {
	const failures: string[] = [];
	for (const relative of FIXTURE.skillNotation.files) {
		const text = readFileSync(join(REPO_ROOT, relative), "utf8");
		for (const line of text.split("\n")) {
			if (!/lachesis/i.test(line)) continue;
			// Only lines that actually state a frame are in scope.
			if (!/\([0-9./-]+\)/.test(line)) continue;
			if (!line.includes(FIXTURE.skillNotation.lachesis.canonical)) {
				failures.push(`${relative}: ${line.trim()}`);
			}
			if (/psyche/i.test(line)) {
				failures.push(`${relative}: Lachesis line still labels its host Psyche — ${line.trim()}`);
			}
		}
	}
	assert.deepEqual(failures, [], failures.join("\n"));
});
