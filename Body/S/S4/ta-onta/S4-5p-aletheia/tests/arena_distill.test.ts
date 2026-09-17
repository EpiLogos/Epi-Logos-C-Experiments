import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../../../../../..");
const aletheiaRoot = resolve(repoRoot, "Body/S/S4/ta-onta/S4-5p-aletheia");
const gnosticRoot = resolve(repoRoot, "Body/S/S5/epi-gnostic");

describe("moirai_arena_distill registration", () => {
  it("keeps the Moirai arena closure-distillation tool in the episodic tool module", () => {
    const source = readFileSync(resolve(aletheiaRoot, "S5'/tools/episodic-tools.ts"), "utf8");
    assert.match(source, /export function registerEpisodicTools/);
    assert.match(source, /name:\s*"moirai_arena_distill"/);
    assert.match(source, /epi_gnostic\.arena_distillation/);
    assert.match(source, /Jungian amplification routed back to canon/);
  });
});

describe("moirai_arena_distill fixture", () => {
  it("runs the real Python distiller and returns the expected receipt", () => {
    const script = String.raw`
from epi_gnostic.arena_distillation import moirai_arena_distill

class Graphiti:
    def add_episode(self, **episode):
        assert episode["group_id"] == "arena:arc-ts"
        assert "compressed" in episode["episode_body"]
        return {"episode_id": "episode-ts"}

class Edges:
    def __init__(self):
        self.edges = []
    def write_edges(self, edges):
        self.edges.extend(list(edges))
        return len(self.edges)

payload = {
    "scene": {
        "scene_key": "arena:ts",
        "arc_id": "arc-ts",
        "pinned_coordinate": "C5",
        "kairos_anchor": "kairos:ts",
        "closed_at_ms": 1788000000000,
    },
    "dialogue_lines": [
        {
            "speaker": "vama:egregore",
            "vama_shakti_class": "egregore",
            "dialogue_body": "egregore body",
            "constituent_reference_coordinates": ["C5.1", "C5.2"],
            "cited_coordinates": ["C5"],
            "vak_address": {"cfp": "m4.arena.dialogue", "cp": "C5"},
        },
        {
            "speaker": "vama:sprite",
            "vama_shakti_class": "sprite",
            "dialogue_body": "sprite body",
            "cited_coordinates": ["C5.9", "C5.10"],
            "vak_address": {"cfp": "m4.arena.dialogue", "cp": "C5.9"},
        },
        {
            "speaker": "user",
            "dialogue_body": "user citation",
            "cited_coordinates": ["C5.user"],
            "vak_address": {"cfp": "m4.arena.dialogue", "cp": "C5.user"},
        },
        {
            "speaker": "vama:daemon",
            "vama_shakti_class": "daemon",
            "dialogue_body": "daemon body",
            "cited_coordinates": ["C5.daemon"],
            "vak_address": {"cfp": "m4.arena.dialogue", "cp": "C5.daemon"},
        },
        {
            "speaker": "vama:mantra",
            "vama_shakti_class": "mantra",
            "dialogue_body": "mantra body",
            "cited_coordinates": ["element:fire", "chakra:heart"],
            "vak_address": {"cfp": "m4.arena.dialogue", "cp": "M2'"},
        },
    ],
    "turns": [
        {"speaker": "vama:egregore", "vama_shakti_class": "egregore"},
        {"speaker": "vama:sprite", "vama_shakti_class": "sprite"},
        {"speaker": "vama:daemon", "vama_shakti_class": "daemon"},
        {"speaker": "vama:mantra", "vama_shakti_class": "mantra"},
        {"speaker": "vama:egregore", "vama_shakti_class": "egregore"},
        {"speaker": "vama:daemon", "vama_shakti_class": "daemon"},
        {"speaker": "vama:sprite", "vama_shakti_class": "sprite"},
        {"speaker": "vama:mantra", "vama_shakti_class": "mantra"},
        {"speaker": "vama:egregore", "vama_shakti_class": "egregore"},
    ],
}

edges = Edges()
calls = []
def compressor(scene, lines, turns):
    calls.append((scene, lines, turns))
    return "compressed through VAK"

receipt = moirai_arena_distill(
    "arena:ts",
    payload=payload,
    graphiti_service=Graphiti(),
    edge_writer=edges,
    compressor=compressor,
)
assert len(calls) == 1
assert receipt.episode_id == "episode-ts"
assert receipt.edge_count_by_class["egregore"] == 2
assert receipt.edge_count_by_class["sprite"] == 1
assert receipt.edge_count_by_class["daemon"] == 1
assert receipt.edge_count_by_class["mantra"] == 2
assert any(e["type"] == "DIALOGICAL_RESONANCE_AT" and e["properties"]["class_pair"] == "daemon<->egregore" for e in edges.edges)
print(receipt.to_json())
`;
    const result = spawnSync("python3", ["-c", script], {
      encoding: "utf8",
      env: {
        ...process.env,
        PYTHONPATH: gnosticRoot,
      },
    });

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /episode-ts/);
  });
});
