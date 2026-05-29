import unittest
from pathlib import Path
import yaml
import re

ROOT = Path(__file__).resolve().parent.parent

class AnimaRegistrationTest(unittest.TestCase):
    def test_anima_md_exists_with_required_frontmatter(self):
        anima_md = ROOT / "agents" / "anima.md"
        self.assertTrue(anima_md.exists(), "pi-agent agents/anima.md missing")
        text = anima_md.read_text()
        m = re.match(r"^---\n(.*?)\n---", text, re.DOTALL)
        self.assertIsNotNone(m, "anima.md missing frontmatter")
        fm = yaml.safe_load(m.group(1))
        self.assertEqual(fm["name"], "anima")
        self.assertEqual(fm["cf"], "(4.0/1-4.4/5)")
        self.assertIn("vak_evaluate", fm["tools"])
        self.assertIn("anima_orchestrate", fm["tools"])

    def test_anima_in_constitutional_team(self):
        teams = yaml.safe_load((ROOT / "agents" / "teams.yaml").read_text())
        self.assertIn("constitutional", teams)
        members = teams["constitutional"].get("members", [])
        self.assertIn("anima", members)

    def test_six_section_structure_present(self):
        text = (ROOT / "agents" / "anima.md").read_text()
        for header in ["## 1. Rupa", "## 2. Ontology", "## 3. Frame Contract", "## 4. Temporal", "## 5. Capability", "## 6. Sattva"]:
            self.assertIn(header, text, f"missing section {header}")
