import sys
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from hen_compile_plan import plan_compile  # noqa: E402


class HenCompilePlanTest(unittest.TestCase):
    def test_dry_run_compile_uses_canonical_day_source_and_thought_artifact(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            vault = root / "Idea"
            source = vault / "Empty" / "Present" / "25-04-2026" / "daily-note.md"
            source.parent.mkdir(parents=True)
            source.write_text("# Daily Note\n\nReal session material.\n", encoding="utf-8")

            response = plan_compile(
                vault_root=vault,
                compiler_root=root / "Body" / "S" / "S1" / "hen-compiler",
                now=datetime(2026, 4, 25, 10, 30, 5, tzinfo=timezone.utc),
                channel="ql",
                thought_lane="T4",
                artifact_slug="spine-smoke",
                dry_run=True,
            )

            self.assertEqual(response.compiled, 0)
            self.assertEqual(response.errors, [])
            self.assertEqual(
                response.source_paths,
                [str(source)],
            )
            self.assertEqual(
                response.artifacts,
                [str(vault / "Pratibimba/Self/Thought/T/T4/spine-smoke.md")],
            )
            self.assertEqual(response.ledger_entries, ["ql.ledger"])
            self.assertEqual(response.invocation.executor_kind, "pi_agent")
            self.assertEqual(response.invocation.target_agent, "anima")
            self.assertEqual(response.invocation.review_policy, "epii_inbox")
            self.assertEqual(response.invocation.mutation_mode, "dry_run")
            self.assertEqual(response.invocation.required_plugin, "pleroma")
            self.assertEqual(response.invocation.required_skill, "anima-orchestration")

    def test_epii_compile_invocation_uses_epi_logos_plugin_body(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            vault = root / "Idea"
            source = vault / "Empty" / "Present" / "25-04-2026" / "daily-note.md"
            source.parent.mkdir(parents=True)
            source.write_text("# Daily Note\n\nReviewable improvement material.\n", encoding="utf-8")

            response = plan_compile(
                vault_root=vault,
                compiler_root=root / "Body/S/S1/hen-compiler",
                now=datetime(2026, 4, 25, 10, 30, 5, tzinfo=timezone.utc),
                channel="improvement",
                thought_lane="T5",
                artifact_slug="improvement-hypothesis",
                target_agent="epii",
                required_skill="autoresearch",
                dry_run=True,
            )

            self.assertEqual(response.errors, [])
            self.assertEqual(response.ledger_entries, ["improvement.ledger"])
            self.assertEqual(response.invocation.executor_kind, "pi_agent")
            self.assertEqual(response.invocation.target_agent, "epii")
            self.assertEqual(response.invocation.required_plugin, "epi-logos")
            self.assertEqual(response.invocation.required_skill, "autoresearch")
            self.assertEqual(response.invocation.review_policy, "epii_inbox")

    def test_vendor_claude_sdk_is_compatibility_executor_only(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            vault = root / "Idea"
            source = vault / "Empty" / "Present" / "25-04-2026" / "daily-note.md"
            source.parent.mkdir(parents=True)
            source.write_text("# Daily Note\n\nVendor compatibility material.\n", encoding="utf-8")

            response = plan_compile(
                vault_root=vault,
                compiler_root=root / "Body/S/S1/hen-compiler",
                now=datetime(2026, 4, 25, tzinfo=timezone.utc),
                channel="ql",
                thought_lane="T4",
                artifact_slug="vendor-compat",
                executor_kind="vendor_claude_sdk",
                dry_run=True,
            )

            self.assertEqual(response.errors, [])
            self.assertTrue(response.invocation.compatibility_backend)
            self.assertEqual(response.invocation.executor_kind, "vendor_claude_sdk")
            self.assertEqual(response.invocation.tool_boundary, "vendor_compat_read_write")

    def test_non_dry_run_requires_pi_agent_executor(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)

            response = plan_compile(
                vault_root=root / "Idea",
                compiler_root=root / "Body/S/S1/hen-compiler",
                now=datetime(2026, 4, 25, tzinfo=timezone.utc),
                channel="ql",
                thought_lane="T4",
                artifact_slug="unsafe-service",
                executor_kind="service",
                dry_run=False,
            )

            self.assertEqual(response.compiled, 0)
            self.assertIn("non-dry-run compile requires pi_agent executor", response.errors)

    def test_plan_compile_rejects_unknown_channel(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)

            response = plan_compile(
                vault_root=root / "Idea",
                compiler_root=root / "Body/S/S1/hen-compiler",
                now=datetime(2026, 4, 25, tzinfo=timezone.utc),
                channel="vendor",
                thought_lane="T4",
                artifact_slug="bad-channel",
                dry_run=True,
            )

            self.assertEqual(response.compiled, 0)
            self.assertEqual(response.artifacts, [])
            self.assertIn("unknown ledger channel: vendor", response.errors)

    def test_plan_compile_reports_missing_canonical_day_source(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)

            response = plan_compile(
                vault_root=root / "Idea",
                compiler_root=root / "Body/S/S1/hen-compiler",
                now=datetime(2026, 4, 25, tzinfo=timezone.utc),
                channel="ql",
                thought_lane="T4",
                artifact_slug="missing-source",
                dry_run=True,
            )

            self.assertEqual(response.compiled, 0)
            self.assertEqual(response.artifacts, [])
            self.assertIn("source path does not exist", response.errors[0])


if __name__ == "__main__":
    unittest.main()
