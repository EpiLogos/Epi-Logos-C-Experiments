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
        self.assertEqual(contract["pi_runtime_agent_id"], "epii")
        self.assertEqual(contract["pi_gateway_session_key"], "agent:epii:main")
        self.assertEqual(contract["plugin_registry"], "Body/S/S5/plugins/registry.jsonl")
        self.assertEqual(contract["resource_package"], "epi-logos")
        self.assertEqual(contract["resource_package_target"], "Body/S/S5/plugins/epi-logos")
        self.assertEqual(contract["resource_package_status"], "vendor_promoted_canonical_body")
        self.assertEqual(contract["resource_package_vendor_source"], "vendors/epi-logos")
        self.assertTrue((resource_package / ".pi-agent" / "plugin.json").is_file())
        self.assertTrue((resource_package / ".codex").is_dir())
        self.assertTrue((resource_package / ".claude-plugin" / "plugin.json").is_file())
        self.assertTrue((resource_package / "skills" / "epi-knowing" / "SKILL.md").is_file())
        self.assertTrue((resource_package / "hooks" / "hooks.json").is_file())
        self.assertTrue((resource_package / "resources" / "qv" / "overlay.json").is_file())
        self.assertTrue((resource_package / "resources" / "qv" / "schema.json").is_file())
        self.assertNotIn("constitutional_subagent", contract["agent_kind"])

    def test_epi_logos_package_names_epii_spine_resources(self):
        manifest_path = S5_ROOT / "plugins" / "epi-logos" / ".claude-plugin" / "plugin.json"
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        registry_path = S5_ROOT / "plugins" / "registry.jsonl"
        registry = [
            json.loads(line)
            for line in registry_path.read_text(encoding="utf-8").splitlines()
            if line.strip()
        ]

        self.assertEqual(manifest["name"], "epi-logos")
        self.assertIn("Quaternal Logic", manifest["description"])
        self.assertEqual(
            registry,
            [
                {
                    "name": "epi-logos",
                    "version": "0.1.0",
                    "source": "local",
                    "root": "Body/S/S5/plugins/epi-logos",
                    "agents": ["epii"],
                }
            ],
        )

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

    def test_epii_inbox_is_day_scoped_and_session_linked(self):
        contract = json.loads((S5_ROOT / "epii-agent" / "agent-contract.json").read_text(encoding="utf-8"))
        inbox = contract["inbox_contract"]

        self.assertEqual(inbox["inbox_path_template"], "Idea/Empty/Present/{day-date}/")
        self.assertIn("day-scoped", inbox["path_rule"])
        self.assertIn("NOW/session lineage", inbox["path_rule"])
        self.assertEqual(
            inbox["access_pattern"]["anima_access"],
            "Anima and Aletheia may deposit and request validation, but cannot resolve Epii review gates.",
        )
        for field in ["day_id", "now_path", "session_key"]:
            self.assertIn(field, inbox["required_fields"])


if __name__ == "__main__":
    unittest.main()
