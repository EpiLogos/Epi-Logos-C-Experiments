import json
import unittest
from pathlib import Path


S5_ROOT = Path(__file__).resolve().parents[1]


class EpiiAgentContractTest(unittest.TestCase):
    def test_epii_is_distinct_pi_agent_with_epi_logos_body(self):
        contract_path = S5_ROOT / "epii-agent" / "agent-contract.json"
        contract = json.loads(contract_path.read_text(encoding="utf-8"))
        resource_package = S5_ROOT / "plugins" / "epi-logos"

        self.assertEqual(contract["agent_id"], "epii")
        self.assertEqual(contract["coordinate"], "S5/S5'")
        self.assertEqual(contract["agent_kind"], "pi_agent")
        self.assertEqual(contract["relation_to_anima"], "peer_pi_agent")
        self.assertEqual(contract["resource_package"], "epi-logos")
        self.assertEqual(contract["resource_package_target"], "Body/S/S5/plugins/epi-logos")
        self.assertTrue((resource_package / ".claude-plugin" / "plugin.json").is_file())
        self.assertTrue((resource_package / "skills" / "epi-knowing" / "SKILL.md").is_file())
        self.assertTrue((resource_package / "hooks" / "hooks.json").is_file())
        self.assertTrue((resource_package / "resources" / "qv" / "overlay.json").is_file())
        self.assertTrue((resource_package / "resources" / "qv" / "schema.json").is_file())
        self.assertNotIn("constitutional_subagent", contract["agent_kind"])

    def test_epi_logos_package_names_epii_spine_resources(self):
        manifest_path = S5_ROOT / "plugins" / "epi-logos" / ".claude-plugin" / "plugin.json"
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

        self.assertEqual(manifest["name"], "epi-logos")
        self.assertIn("Epii", manifest["description"])
        self.assertIn("Nara", manifest["description"])

    def test_autoresearch_and_inbox_are_epii_spines(self):
        contract = json.loads((S5_ROOT / "epii-agent" / "agent-contract.json").read_text(encoding="utf-8"))

        self.assertIn("autoresearch", contract["spines"])
        self.assertIn("review_inbox", contract["spines"])
        self.assertIn("review_item", contract["accepted_deposits_from_anima"])
        self.assertIn("validation_gate", contract["accepted_deposits_from_anima"])
        self.assertIn("dispatch_request", contract["allowed_requests_to_anima"])
        self.assertIn("implementation_request", contract["allowed_requests_to_anima"])
        self.assertIn("resolve_review_gate", contract["epii_authority"])
        self.assertIn("observe_and_improve_system", contract["epii_authority"])

    def test_epii_access_core_names_live_gateway_methods(self):
        contract = json.loads((S5_ROOT / "epii-agent" / "agent-contract.json").read_text(encoding="utf-8"))

        self.assertEqual(contract["agent_access_core"], "Body/S/S5/epii-agent-core")
        self.assertTrue((S5_ROOT / "epii-agent-core" / "src" / "lib.rs").is_file())
        self.assertIn("s5'.epii.status", contract["gateway_methods"])
        self.assertIn("s5'.epii.deposit", contract["gateway_methods"])
        self.assertIn("s5'.review.submit", contract["gateway_methods"])
        self.assertIn("s5'.improve.propose", contract["gateway_methods"])


if __name__ == "__main__":
    unittest.main()
