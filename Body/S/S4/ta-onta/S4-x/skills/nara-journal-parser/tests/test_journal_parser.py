import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SKILL = Path(__file__).resolve().parents[1]
PARSE = SKILL / "scripts" / "parse_journal.py"


class NaraJournalParserTest(unittest.TestCase):
    def test_parses_local_journal_to_handle_only_summary(self):
        with tempfile.TemporaryDirectory() as raw:
            tmp = Path(raw)
            entry = tmp / "journal.md"
            entry.write_text(
                "# Morning\nDream residue, oracle question, and a steady mood.",
                encoding="utf-8",
            )

            result = subprocess.run(
                [sys.executable, str(PARSE), "--input", str(entry), "--privacy-class", "local-only"],
                text=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=True,
            )

            payload = json.loads(result.stdout)
            self.assertEqual(payload["privacy_class"], "local-only")
            self.assertEqual(payload["body_rendered"], False)
            self.assertEqual(payload["source"]["path"], str(entry))
            self.assertIn("dream", payload["signals"])
            self.assertIn("oracle", payload["signals"])
            self.assertRegex(payload["body_sha256"], r"^sha256:")

    def test_refuses_remote_input_and_cloud_privacy(self):
        result = subprocess.run(
            [
                sys.executable,
                str(PARSE),
                "--input",
                "https://example.com/journal.md",
                "--privacy-class",
                "cloud-opt-in",
            ],
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("local-only", result.stderr)
        self.assertIn("[[M'-MODEL-SLOT-SPEC]]", result.stderr)


if __name__ == "__main__":
    unittest.main()
