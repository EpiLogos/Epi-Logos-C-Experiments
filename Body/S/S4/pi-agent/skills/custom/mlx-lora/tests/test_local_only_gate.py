import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SKILL = Path(__file__).resolve().parents[1]
TRAIN = SKILL / "scripts" / "train.py"


class MlxLoraLocalOnlyGateTest(unittest.TestCase):
    def write_config(self, tmp: Path, **overrides) -> Path:
        config = {
            "privacy_class": "local-only",
            "base_model": "gemma4-12b-q4",
            "adapter_rank": 8,
            "learning_rate": 0.0002,
            "corpus_manifest": str(tmp / "corpus.jsonl"),
            "checkpoint_dir": str(tmp / "checkpoints"),
            "checkpoint_version": "voice-v1",
        }
        config.update(overrides)
        path = tmp / "config.json"
        path.write_text(json.dumps(config), encoding="utf-8")
        return path

    def test_dry_run_writes_local_checkpoint_manifest(self):
        with tempfile.TemporaryDirectory() as raw:
            tmp = Path(raw)
            (tmp / "corpus.jsonl").write_text('{"text":"local only"}\n', encoding="utf-8")
            config = self.write_config(tmp)

            result = subprocess.run(
                [sys.executable, str(TRAIN), "--config", str(config), "--dry-run"],
                text=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=True,
            )

            payload = json.loads(result.stdout)
            self.assertEqual(payload["privacy_class"], "local-only")
            self.assertEqual(payload["runtime"], "mlx-lora")
            self.assertTrue((tmp / "checkpoints" / "voice-v1" / "checkpoint.json").exists())

    def test_cloud_route_is_refused_unconditionally(self):
        with tempfile.TemporaryDirectory() as raw:
            tmp = Path(raw)
            (tmp / "corpus.jsonl").write_text('{"text":"local only"}\n', encoding="utf-8")
            config = self.write_config(
                tmp,
                privacy_class="cloud-opt-in",
                checkpoint_dir="s3://bucket/nara",
            )

            result = subprocess.run(
                [sys.executable, str(TRAIN), "--config", str(config), "--dry-run"],
                text=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("local-only", result.stderr)
            self.assertIn("[[M'-MODEL-SLOT-SPEC]]", result.stderr)


if __name__ == "__main__":
    unittest.main()
