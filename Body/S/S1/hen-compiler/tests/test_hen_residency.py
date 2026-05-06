import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from hen_residency import (  # noqa: E402
    ENVELOPE_LEDGER_CHANNELS,
    ql_first_channels,
    resolve_compiler_residency,
)


class HenCompilerResidencyTest(unittest.TestCase):
    def test_vendor_daily_and_knowledge_are_compatibility_aliases(self):
        plan = resolve_compiler_residency(
            vault_root=Path("/vault"),
            compiler_root=Path("/body/S1/hen-compiler"),
            now=datetime(2026, 4, 25, 10, 30, 5, tzinfo=timezone.utc),
            thought_lane="T4",
            artifact_slug="spine-smoke",
        )

        self.assertEqual(
            plan.source_path,
            Path("/vault/Empty/Present/25-04-2026/daily-note.md"),
        )
        self.assertEqual(
            plan.compiled_path,
            Path("/vault/Pratibimba/Self/Thought/T/T4/spine-smoke.md"),
        )
        self.assertEqual(
            plan.vendor_source_alias,
            Path("/body/S1/hen-compiler/daily/2026-04-25.md"),
        )
        self.assertEqual(
            plan.vendor_knowledge_alias,
            Path("/body/S1/hen-compiler/knowledge/concepts/spine-smoke.md"),
        )

    def test_compiler_channels_cover_envelope_and_compile_ql_first(self):
        self.assertEqual(len(ENVELOPE_LEDGER_CHANNELS), 12)
        self.assertEqual(ql_first_channels()[0].name, "ql")
        self.assertEqual(
            [channel.name for channel in ENVELOPE_LEDGER_CHANNELS],
            [
                "transport",
                "runtime",
                "temporal",
                "coordinate",
                "residency",
                "context",
                "environs",
                "execution",
                "episodic",
                "crystallisation",
                "improvement",
                "ql",
            ],
        )

    def test_thought_lane_must_be_canonical_tx_lane(self):
        with self.assertRaisesRegex(ValueError, "thought_lane must be T0 through T5"):
            resolve_compiler_residency(
                vault_root=Path("/vault"),
                compiler_root=Path("/body/S1/hen-compiler"),
                now=datetime(2026, 4, 25, tzinfo=timezone.utc),
                thought_lane="knowledge",
                artifact_slug="bad-lane",
            )


if __name__ == "__main__":
    unittest.main()
