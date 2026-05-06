import json
import unittest
from pathlib import Path


PLUGIN_ROOT = Path(__file__).resolve().parents[1]


class PleromaCapabilityMatrixTest(unittest.TestCase):
    def test_matrix_maps_real_agents_skills_and_hooks(self):
        matrix_path = PLUGIN_ROOT / "capability-matrix.json"
        matrix = json.loads(matrix_path.read_text(encoding="utf-8"))

        self.assertEqual(matrix["coordinate"], "S4/S4'")
        self.assertEqual(matrix["package_role"], "anima_executive_capability_membrane")
        self.assertEqual(matrix["owner_agent"], "anima")

        for agent in matrix["constitutional_agents"]:
            self.assertTrue((PLUGIN_ROOT / "agents" / agent / "ANIMA.md").is_file(), agent)

        for skill in matrix["skills"]:
            self.assertTrue((PLUGIN_ROOT / "skills" / skill["name"] / "SKILL.md").is_file(), skill)

        skill_names = {skill["name"] for skill in matrix["skills"]}
        for required in [
            "anima-orchestration",
            "vak-evaluate",
            "vak-coordinate-frame",
            "day-night-pass",
        ]:
            self.assertIn(required, skill_names)

        self.assertTrue((PLUGIN_ROOT / "hooks" / matrix["hooks"]["manifest"]).is_file())
        self.assertNotIn("epii", matrix["constitutional_agents"])

    def test_matrix_declares_anima_execution_backbone_and_agent_gates(self):
        matrix = json.loads((PLUGIN_ROOT / "capability-matrix.json").read_text(encoding="utf-8"))

        backbone = matrix["execution_backbone"]
        self.assertEqual(backbone["name"], "tilldone")
        self.assertEqual(backbone["scope"], "anima_execution_runs")
        self.assertIn("anima", backbone["enabled_for"])
        self.assertEqual(
            backbone["body_path"],
            "Body/S/S4/ta-onta/S4-2p-pleroma/S2/tilldone.ts",
        )

        gates = matrix["agent_capability_gates"]
        self.assertEqual(set(gates), set(matrix["constitutional_agents"]))

        anima_tools = set(gates["anima"]["tools"])
        for required in [
            "dispatch_agent",
            "run_chain",
            "subagent_create",
            "subagent_continue",
            "subagent_list",
            "subagent_remove",
            "tilldone",
        ]:
            self.assertIn(required, anima_tools)

        anima_skills = set(gates["anima"]["skills"])
        for required in [
            "vak-coordinate-frame",
            "vak-evaluate",
            "anima-orchestration",
            "day-night-pass",
        ]:
            self.assertIn(required, anima_skills)

    def test_matrix_separates_anima_actions_from_epii_review_authority(self):
        matrix = json.loads((PLUGIN_ROOT / "capability-matrix.json").read_text(encoding="utf-8"))

        self.assertIn("dispatch_to_constitutional_agent", matrix["anima_authority"])
        self.assertIn("deposit_epii_inbox_item", matrix["anima_authority"])
        self.assertIn("request_epii_validation", matrix["anima_authority"])
        self.assertNotIn("resolve_epii_review_gate", matrix["anima_authority"])

        self.assertEqual(matrix["epii_relation"]["relation"], "peer_pi_agent")
        self.assertIn("review_item", matrix["epii_relation"]["deposits_to_epii"])
        self.assertIn("validation_request", matrix["epii_relation"]["requests_to_epii"])


if __name__ == "__main__":
    unittest.main()
