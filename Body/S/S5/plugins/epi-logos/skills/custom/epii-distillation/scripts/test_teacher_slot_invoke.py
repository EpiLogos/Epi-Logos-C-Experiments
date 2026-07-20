"""Endpoint test for the blindfolded teacher's real _default_slot_invoke.

The teacher must RIDE the existing PI harness — resolve the model via
`epi slot show --json` and invoke via `pi -p --model <provider>/<model>` — and
NEVER construct a bespoke provider client. These tests install fake `epi` + `pi`
executables on PATH (test doubles for the external binaries) so the endpoint's
wiring is verified without a real cloud model call.

Run:
    Body/S/S5/epi-gnostic/.venv/bin/python -m pytest \
        Body/S/S5/plugins/epi-logos/skills/custom/epii-distillation/scripts/test_teacher_slot_invoke.py -q
(any python works — no torch needed here.)
"""

import inspect
import os
import stat
import sys
import textwrap

import pytest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import blindfolded_teacher as bt  # noqa: E402


def _make_exe(path, script):
    path.write_text(script)
    path.chmod(path.stat().st_mode | stat.S_IEXEC | stat.S_IXGRP | stat.S_IXOTH)


def test_default_slot_invoke_rides_pi_via_slot_resolution(tmp_path, monkeypatch):
    bin_dir = tmp_path / "bin"
    bin_dir.mkdir()
    # Fake `epi slot show --json epii_judge` -> a resolved cloud-opt-in model.
    _make_exe(
        bin_dir / "epi",
        textwrap.dedent(
            """\
            #!/usr/bin/env bash
            echo '{"slotName":"epii_judge","model":{"state":"cloud-opt-in","provider":"anthropic","model":"claude-opus-4-7"}}'
            """
        ),
    )
    # Fake `pi -p --model anthropic/claude-opus-4-7 <prompt>` -> records argv + emits a completion.
    argv_log = bin_dir / "pi_argv.txt"
    _make_exe(
        bin_dir / "pi",
        textwrap.dedent(
            f"""\
            #!/usr/bin/env bash
            printf '%s\\n' "$@" > "{argv_log}"
            echo "DERIVATION: blindfolded proof"
            """
        ),
    )
    monkeypatch.setenv("PATH", f"{bin_dir}:{os.environ['PATH']}")
    monkeypatch.delenv("EPI_BIN", raising=False)
    monkeypatch.delenv("PI_BIN", raising=False)

    teacher = bt.EpistemicBlindfoldedTeacher(
        bt.EpistemicBlindfoldConfig(teacher_slot="slot.epii_judge")
    )
    text, trace, tokens = teacher._default_slot_invoke(
        "derive M1-2 inversion", "slot.epii_judge"
    )

    assert "DERIVATION: blindfolded proof" in text
    assert trace == "pi:anthropic/claude-opus-4-7:cloud-opt-in"
    assert tokens == len(text.split())

    # It rode `pi -p --model anthropic/claude-opus-4-7 <prompt>` — the resolved
    # slot's model, no lock-in, no bespoke client.
    argv = argv_log.read_text()
    assert "-p" in argv
    assert "--model" in argv
    assert "anthropic/claude-opus-4-7" in argv
    assert "derive M1-2 inversion" in argv


def test_default_slot_invoke_fails_loud_on_null_slot(tmp_path, monkeypatch):
    bin_dir = tmp_path / "bin"
    bin_dir.mkdir()
    _make_exe(
        bin_dir / "epi",
        textwrap.dedent(
            """\
            #!/usr/bin/env bash
            echo '{"slotName":"x","model":{"state":"null","provider":null,"model":null}}'
            """
        ),
    )
    _make_exe(bin_dir / "pi", "#!/usr/bin/env bash\necho should-not-run\n")
    monkeypatch.setenv("PATH", f"{bin_dir}:{os.environ['PATH']}")
    monkeypatch.delenv("EPI_BIN", raising=False)
    monkeypatch.delenv("PI_BIN", raising=False)

    teacher = bt.EpistemicBlindfoldedTeacher(bt.EpistemicBlindfoldConfig())
    with pytest.raises(RuntimeError, match="no usable model"):
        teacher._default_slot_invoke("p", "slot.epii_judge")


def test_self_check_reports_resolution_without_model_call(tmp_path, monkeypatch):
    bin_dir = tmp_path / "bin"
    bin_dir.mkdir()
    _make_exe(
        bin_dir / "epi",
        textwrap.dedent(
            """\
            #!/usr/bin/env bash
            echo '{"slotName":"epii_judge","model":{"state":"cloud-opt-in","provider":"anthropic","model":"claude-opus-4-7"}}'
            """
        ),
    )
    _make_exe(bin_dir / "pi", "#!/usr/bin/env bash\necho should-not-run\n")
    monkeypatch.setenv("PATH", f"{bin_dir}:{os.environ['PATH']}")
    monkeypatch.delenv("EPI_BIN", raising=False)
    monkeypatch.delenv("PI_BIN", raising=False)

    status = bt.self_check("slot.epii_judge")
    assert status["resolved"] is True
    assert status["provider"] == "anthropic"
    assert status["model"] == "claude-opus-4-7"
    assert status["pi_available"] is True


def test_no_bespoke_provider_client():
    """The teacher must ride pi — never import a provider SDK directly."""
    src = inspect.getsource(bt)
    for forbidden in (
        "import anthropic",
        "from anthropic",
        "import openai",
        "from openai",
        "google.generativeai",
        "import genai",
    ):
        assert forbidden not in src, f"teacher must ride pi, not a bespoke {forbidden!r} client"
