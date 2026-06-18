import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SKILL = Path(__file__).resolve().parents[1]
TRAIN = SKILL / "scripts" / "train_lora.py"


class NaraVoiceTrainingPipelineTest(unittest.TestCase):
    def test_local_corpus_builds_manifest_and_checkpoint_ref(self):
        with tempfile.TemporaryDirectory() as raw:
            tmp = Path(raw)
            journal = tmp / "journal.md"
            dream = tmp / "dream.md"
            phone = tmp / "phone.txt"
            journal.write_text("# Journal\nA local entry.", encoding="utf-8")
            dream.write_text("# Dream\nA local dream.", encoding="utf-8")
            phone.write_text("Phone writing fragment.", encoding="utf-8")
            config = tmp / "config.json"
            config.write_text(
                json.dumps(
                    {
                        "privacy_class": "local-only",
                        "model_version_key": "gemma4-12b-q4",
                        "checkpoint_version": "voice-v2",
                        "checkpoint_dir": str(tmp / "checkpoints"),
                        "corpus": {
                            "journal": [str(journal)],
                            "dream": [str(dream)],
                            "phone_writings": [str(phone)],
                        },
                    }
                ),
                encoding="utf-8",
            )

            result = subprocess.run(
                [sys.executable, str(TRAIN), "--config", str(config), "--dry-run"],
                text=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=True,
            )

            payload = json.loads(result.stdout)
            self.assertEqual(payload["privacy_class"], "local-only")
            self.assertEqual(payload["checkpoint"]["version"], "voice-v2")
            self.assertEqual(len(payload["corpus"]["journal_hashes"]), 1)
            self.assertEqual(len(payload["corpus"]["dream_hashes"]), 1)
            self.assertEqual(len(payload["corpus"]["phone_writing_hashes"]), 1)
            self.assertTrue((tmp / "checkpoints" / "voice-v2" / "corpus-manifest.json").exists())

    def test_refuses_cloud_training(self):
        with tempfile.TemporaryDirectory() as raw:
            tmp = Path(raw)
            config = tmp / "config.json"
            config.write_text(
                json.dumps(
                    {
                        "privacy_class": "cloud-opt-in",
                        "model_version_key": "gemma4-12b-q4",
                        "checkpoint_version": "voice-v2",
                        "checkpoint_dir": str(tmp / "checkpoints"),
                        "corpus": {"journal": [], "dream": [], "phone_writings": []},
                    }
                ),
                encoding="utf-8",
            )

            result = subprocess.run(
                [sys.executable, str(TRAIN), "--config", str(config), "--dry-run"],
                text=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("local-only", result.stderr)


if __name__ == "__main__":
    unittest.main()
