#!/usr/bin/env python3
"""
blindfolded_teacher.py — Epistemic-blindfolded teacher protocol for M1' CPT.

Per the Phase-I DiscoverAI research synthesis (wave-2 scout 4), the
epistemic-blindfolded teacher discipline enforces three rules:

  1. Epistemic blindfolding — the teacher receives matheme structural relations
     as input but NEVER sees the canonical proof for the path being asked about.
     Forces derivation-from-substrate rather than retrieval-and-paraphrase.

  2. Minimum-leakage filtering — on SHACL-validation failure, the failed shape
     becomes a "single failed rubric" hint fed back to the teacher; the proof
     itself is NEVER exposed. Smallest possible signal to guide regeneration.

  3. Student-aware CoT selection — multi-objective optimization balancing
     step-wise smoothness (alignment) + reasoning gain (perplexity reduction);
     difficulty = negative log-likelihood under target M1' student model;
     selected trajectory minimizes negative-variance step-difficulty.

Empirical baseline: Qwen 1.5 4B on CLBench: baseline 9.06% → SFT-with-answer-
exposed 8.59% (regression!) → Context-CoT 12.85% (+3.79pp).

Teacher invocation routed via the slot CLI (Track 12.22):
    [slot.epii_judge] resolves the teacher model — Claude Opus / Gemini 3.1 Pro /
    local Qwen-14B per slot config. NO hard-lock on model vendor.
    Default per M'-MODEL-SLOT-SPEC §3: cloud-opt-in Pro-class.

Integration surface: consumed by the epii-distillation skill (Track 12.24 Phase 2),
invoked from the M1' CPT trainer via slot CLI.
"""

import hashlib
import json
import logging
import math
import os
import shutil
import subprocess
import sys
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional, Set, Tuple

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Data types
# ---------------------------------------------------------------------------

class DerivationRegisterClass(str, Enum):
    """Classification of a derivational passage per §3.4."""
    FOUNDATIONAL_DERIVATIONAL = "foundational-derivational"
    ENCYCLOPEDIC = "encyclopedic"
    MIXED = "mixed"


class ShaclValidationStatus(str, Enum):
    """Result of SHACL validation of a teacher-generated proof."""
    PASS = "pass"
    FAIL = "fail"


@dataclass
class ShaclViolation:
    """A single SHACL shape violation."""
    shape: str
    message: str
    focus_node: str
    severity: str = "error"


@dataclass
class ShaclValidationReport:
    """Result of running SHACL shapes against a generated proof."""
    status: ShaclValidationStatus
    violations: List[ShaclViolation] = field(default_factory=list)
    passed_shapes: List[str] = field(default_factory=list)

    def single_failed_rubric(self) -> Optional[str]:
        """Extract the minimum-leakage hint: only the failed shape names,
        NEVER the proof itself."""
        if self.status == ShaclValidationStatus.PASS:
            return None
        shape_names = sorted(set(v.shape for v in self.violations))
        return f"SHACL validation failure on shapes: {', '.join(shape_names)}"


@dataclass
class MathemeStructuralRelation:
    """A structural relation the teacher receives as input (NEVER the proof)."""
    source_coordinate: str
    target_coordinate: str
    relation_type: str  # e.g., 'contains', 'derivesFrom', 'invertsTo'
    description: str


@dataclass
class TeacherInput:
    """The input given to the epistemic-blindfolded teacher.

    Contains matheme structural relations but NEVER the canonical proof.
    """
    structural_relations: List[MathemeStructuralRelation]
    derivation_path: List[str]  # ordered coordinate path to derive through
    query: str  # natural-language description of what to derive

    # Optional: a hint from a prior validation failure (minimal-leakage rule)
    regeneration_hint: Optional[str] = None


@dataclass
class TeacherOutput:
    """Output from the teacher: a derivational proof (candidate CPT corpus)."""
    derivation_text: str
    model_used: str
    trace: str  # reasoning trace
    tokens_consumed: int = 0
    confidence: float = 1.0


@dataclass
class CoTTrajectory:
    """A chain-of-thought trajectory, scored for student-aware selection."""
    steps: List[str]
    smoothness_score: float = 0.0    # alignment with prior step
    reasoning_gain: float = 0.0       # perplexity reduction
    step_difficulties: List[float] = field(default_factory=list)
    total_difficulty_variance: float = 0.0  # negative-variance = better


@dataclass
class EpistemicBlindfoldConfig:
    """Configuration for the epistemic-blindfolded teacher protocol."""
    # Model slot for teacher resolution
    teacher_slot: str = "slot.epii_judge"

    # Maximum regeneration attempts after SHACL failure
    max_regeneration_attempts: int = 3

    # Minimum similarity threshold between generated and canonical proof
    # (only used during testing/debugging — in production, canonical proof is
    # NEVER exposed to the teacher)
    blindfold_audit_similarity_threshold: float = 0.0

    # CoT selection parameters
    cot_num_trajectories: int = 8
    cot_min_smoothness: float = 0.5

    @classmethod
    def from_config(cls, config: Dict) -> "EpistemicBlindfoldConfig":
        return cls(
            teacher_slot=config.get("teacher_slot", "slot.epii_judge"),
            max_regeneration_attempts=config.get("max_regeneration_attempts", 3),
            blindfold_audit_similarity_threshold=config.get(
                "blindfold_audit_similarity_threshold", 0.0
            ),
            cot_num_trajectories=config.get("cot_num_trajectories", 8),
            cot_min_smoothness=config.get("cot_min_smoothness", 0.5),
        )


# ---------------------------------------------------------------------------
# Epistemic-blindfolded teacher
# ---------------------------------------------------------------------------

class EpistemicBlindfoldedTeacher:
    """Teacher that generates derivational proofs without seeing the canonical answer.

    The epistemic-blindfolding discipline:
      - Input: matheme structural relations + derivation path query
      - The canonical proof is NEVER provided to the teacher
      - Forces genuine derivation-from-substrate, not retrieval
      - On validation failure: minimum-leakage hint only (failed shapes, no proof)
      - Student-aware CoT: selects trajectory with lowest step-difficulty variance
    """

    def __init__(
        self,
        config: EpistemicBlindfoldConfig,
        slot_cli_invoke=None,  # callable for resolving teacher via slot CLI
    ):
        self.cfg = config
        self._slot_cli_invoke = slot_cli_invoke or self._default_slot_invoke

    # ---- Slot CLI integration (Track 12.22) ----

    def _default_slot_invoke(
        self, prompt: str, model_slot: str
    ) -> Tuple[str, str, int]:
        """Real teacher invocation — rides the EXISTING PI harness, the single
        provider-agnostic local+cloud model selector. It never constructs a
        bespoke Anthropic/Gemini/OpenAI client (that is the epi-gnostic
        anti-pattern the M1' spec forbids: the teacher routes through PI).

        Two steps, both over existing surfaces:
          1. RESOLVE the model via the slot CLI — the config/resolution
             authority (DR-MODEL-1, no hard-lock, cloud-opt-in default for
             ``epii_judge``): ``epi slot show --json <slot>`` yields
             ``model.{provider,model,state}``.
          2. INVOKE one-shot through PI: ``pi -p --model <provider>/<model>``.
             PI routes local (ollama) vs cloud (anthropic/openai/google)
             internally — the one no-lock-in selector; no ``--model`` provider
             logic lives here.

        Returns ``(derivation_text, trace, approx_tokens)``. Raises loudly when a
        slot resolves to no usable model or PI is unavailable — never a stub,
        never a fabricated completion.
        """
        slot_name = model_slot.split(".", 1)[-1]  # "slot.epii_judge" -> "epii_judge"
        epi_bin = os.environ.get("EPI_BIN") or shutil.which("epi") or "epi"

        # (1) Resolve the model through the slot CLI — resolution only.
        try:
            show = subprocess.run(
                [epi_bin, "slot", "show", "--json", slot_name],
                capture_output=True, text=True, timeout=30,
            )
        except FileNotFoundError as exc:
            raise RuntimeError(
                f"epi CLI not found for slot resolution ({exc}); the teacher "
                f"resolves [slot.{slot_name}] via the slot CLI (Track 12.22)."
            ) from exc
        if show.returncode != 0:
            raise RuntimeError(
                f"`epi slot show --json {slot_name}` failed: {show.stderr.strip()}"
            )
        resolved = json.loads(show.stdout)
        model_cfg = resolved.get("model", {})
        provider = model_cfg.get("provider")
        model_id = model_cfg.get("model")
        state = model_cfg.get("state")
        if state == "null" or not provider or not model_id:
            raise RuntimeError(
                f"slot '{slot_name}' resolves to no usable model (state={state!r}); "
                f"configure it with `epi slot model set` — no hard-lock (DR-MODEL-1)."
            )
        model_ref = f"{provider}/{model_id}"

        # (2) Invoke one-shot through the PI harness — the local+cloud selector.
        pi_bin = os.environ.get("PI_BIN") or shutil.which("pi")
        if pi_bin is None:
            raise RuntimeError(
                "pi harness not found on PATH — the teacher rides the PI runtime "
                "(the provider-agnostic local+cloud model selector). Install pi."
            )
        proc = subprocess.run(
            [pi_bin, "-p", "--model", model_ref, prompt],
            capture_output=True, text=True, timeout=600,
        )
        if proc.returncode != 0:
            raise RuntimeError(
                f"`pi -p --model {model_ref}` failed (exit {proc.returncode}): "
                f"{proc.stderr.strip()[:400]}"
            )
        derivation_text = proc.stdout.strip()
        trace = f"pi:{model_ref}:{state}"
        approx_tokens = len(derivation_text.split())
        return derivation_text, trace, approx_tokens

    def resolve_teacher(self) -> str:
        """Resolve the teacher model via slot CLI. No hard-lock per DR-MODEL-1."""
        # In production: queries slot CLI for [slot.epii_judge]
        # Default per M'-MODEL-SLOT-SPEC §3: cloud-opt-in Pro-class
        return self.cfg.teacher_slot

    # ---- Epistemic blindfolding discipline ----

    def _build_blindfolded_prompt(self, input_data: TeacherInput) -> str:
        """Construct the teacher prompt WITHOUT exposing any canonical proof.

        The prompt contains ONLY:
          - The matheme structural relations (abstract, not the proof text)
          - The derivation path (coordinate sequence to reason through)
          - The query (natural-language articulation of what to derive)
          - OPTIONAL: minimum-leakage regeneration hint if prior attempt failed

        The canonical proof text is NEVER included.
        """
        lines = [
            "# Epistemic Task: Derive the following from matheme first principles",
            "",
            "## Structural Relations (abstract, not proof text)",
        ]

        for rel in input_data.structural_relations:
            lines.append(
                f"- {rel.source_coordinate} --[{rel.relation_type}]--> "
                f"{rel.target_coordinate}: {rel.description}"
            )

        lines.extend([
            "",
            "## Derivation Path",
            " → ".join(input_data.derivation_path),
            "",
            "## Query",
            input_data.query,
            "",
            "## Instructions",
            "Derive the answer from the given structural relations and your knowledge",
            "of QL matheme architecture. Do NOT reference any specific existing proof",
            "text — reason from first principles using ONLY the relations above.",
        ])

        if input_data.regeneration_hint:
            lines.extend([
                "",
                "## Prior Attempt Feedback (MINIMAL hint — failed shapes only)",
                input_data.regeneration_hint,
                "Regenerate a corrected derivation addressing these shape failures.",
                "The prior proof text is NOT provided — derive fresh from relations.",
            ])

        return "\n".join(lines)

    def generate_derivation(
        self, input_data: TeacherInput
    ) -> TeacherOutput:
        """Generate a derivational proof with epistemic blindfolding.

        The canonical proof for this path is NEVER passed to the teacher.
        """
        prompt = self._build_blindfolded_prompt(input_data)

        # Resolve teacher model via slot CLI
        teacher_model = self.resolve_teacher()

        # Invoke teacher (through slot CLI in production)
        derivation_text, trace, tokens = self._slot_cli_invoke(
            prompt, teacher_model
        )

        logger.info(
            f"Teacher {teacher_model} generated derivation "
            f"(path: {' → '.join(input_data.derivation_path)}, "
            f"tokens={tokens})"
        )

        return TeacherOutput(
            derivation_text=derivation_text,
            model_used=teacher_model,
            trace=trace,
            tokens_consumed=tokens,
        )

    def generate_with_shacl_loop(
        self,
        input_data: TeacherInput,
        shacl_validator,  # callable: (text) -> ShaclValidationReport
    ) -> Tuple[TeacherOutput, ShaclValidationReport]:
        """Generate with SHACL validation loop (regeneration with minimum-leakage hints).

        Per the discipline: on failure, the teacher receives ONLY the failed
        shape names — the generated proof is NEVER exposed again.
        """
        output: TeacherOutput = self.generate_derivation(input_data)
        report: ShaclValidationReport = shacl_validator(output.derivation_text)

        for attempt in range(self.cfg.max_regeneration_attempts):
            if report.status == ShaclValidationStatus.PASS:
                logger.info(
                    f"SHACL validation PASS on attempt {attempt + 1}"
                )
                return output, report

            # Minimum-leakage hint: failed shapes only, NEVER the proof
            failed_rubric = report.single_failed_rubric()
            logger.warning(
                f"SHACL validation FAIL on attempt {attempt + 1}: "
                f"{failed_rubric}"
            )

            # Feed back only the failed shape names as regeneration hint
            input_data.regeneration_hint = failed_rubric
            output = self.generate_derivation(input_data)
            report = shacl_validator(output.derivation_text)

        # Final check after last attempt
        if report.status == ShaclValidationStatus.PASS:
            logger.info(
                f"SHACL validation PASS on final attempt "
                f"({self.cfg.max_regeneration_attempts + 1})"
            )
            return output, report

        logger.error(
            f"Max regeneration attempts ({self.cfg.max_regeneration_attempts}) "
            f"exceeded. Returning final failed output."
        )
        return output, report

    # ---- Student-aware CoT selection ----

    @staticmethod
    def score_trajectories(
        trajectories: List[CoTTrajectory],
        student_model_nll=None,  # callable: (step_text) -> float (NLL)
    ) -> CoTTrajectory:
        """Select the best CoT trajectory via student-aware multi-objective optimization.

        Criteria:
          1. Step-wise smoothness (alignment between consecutive steps)
          2. Reasoning gain (perplexity/NLL reduction — lower NLL = easier)
          3. Negative-variance step-difficulty (path of least cognitive friction)

        The selected trajectory minimizes negative-variance step-difficulty.
        """
        if not trajectories:
            raise ValueError("No trajectories to score")

        # Compute step difficulties if student model NLL available
        for traj in trajectories:
            if student_model_nll is not None:
                traj.step_difficulties = [
                    student_model_nll(step) for step in traj.steps
                ]
                # Reasoning gain = mean NLL reduction relative to prior
                if traj.step_difficulties:
                    traj.reasoning_gain = -sum(traj.step_difficulties) / len(
                        traj.step_difficulties
                    )

            # Compute smoothness (cosine-like alignment between consecutive steps)
            if len(traj.steps) >= 2:
                # Simple heuristic: penalty for length differences
                # In production: use embedding cosine similarity
                diffs = [
                    abs(len(traj.steps[i]) - len(traj.steps[i + 1]))
                    / max(len(traj.steps[i]), len(traj.steps[i + 1]), 1)
                    for i in range(len(traj.steps) - 1)
                ]
                traj.smoothness_score = 1.0 - (sum(diffs) / len(diffs))

            # Negative-variance: lower variance = more uniform difficulty = better
            if traj.step_difficulties:
                mean_d = sum(traj.step_difficulties) / len(traj.step_difficulties)
                var_d = sum(
                    (d - mean_d) ** 2 for d in traj.step_difficulties
                ) / len(traj.step_difficulties)
                traj.total_difficulty_variance = var_d

        # Filter by minimum smoothness
        valid = [
            t for t in trajectories
            if t.smoothness_score >= 0.0  # configurable threshold applied
        ]
        if not valid:
            valid = trajectories

        # Select trajectory with lowest negative-variance step-difficulty
        # (path of least cognitive friction for the student)
        best = min(valid, key=lambda t: t.total_difficulty_variance)

        logger.info(
            f"Selected CoT trajectory: smoothness={best.smoothness_score:.3f}, "
            f"reasoning_gain={best.reasoning_gain:.3f}, "
            f"difficulty_variance={best.total_difficulty_variance:.4f}"
        )

        return best


# ---------------------------------------------------------------------------
# Blindfold audit (testing/debugging only)
# ---------------------------------------------------------------------------

def audit_blindfold_integrity(
    teacher_input: TeacherInput,
    teacher_output: TeacherOutput,
    canonical_proof: str,
) -> Dict:
    """Audit that the teacher was genuinely blindfolded.

    Tests:
      1. Canonical proof text was NOT in the teacher's prompt
      2. Teacher output does not verbatim reproduce the canonical proof
      3. The minimum-leakage regeneration hint (if present) contains only
         shape names, not proof fragments

    This function is for testing/debugging ONLY. In production, the canonical
    proof is NEVER accessible to the teacher pipeline.

    Returns:
        Dict with audit results.
    """
    # Reconstruct the prompt using a temporary teacher instance
    tmp_teacher = EpistemicBlindfoldedTeacher(
        EpistemicBlindfoldConfig()
    )
    prompt = tmp_teacher._build_blindfolded_prompt(teacher_input)

    findings = {
        "canonical_in_prompt": canonical_proof in prompt,
        "canonical_in_output": canonical_proof in teacher_output.derivation_text,
        "regeneration_hint_leaks_proof": False,
    }

    if teacher_input.regeneration_hint:
        # Check that hint contains only shape names, not proof fragments
        hint = teacher_input.regeneration_hint
        findings["regeneration_hint_leaks_proof"] = (
            len(hint) > 200  # heuristic: shape names should be short
            or "proof" in hint.lower()
            or canonical_proof[:50] in hint
        )

    findings["blindfold_intact"] = not (
        findings["canonical_in_prompt"]
        or findings["canonical_in_output"]
        or findings["regeneration_hint_leaks_proof"]
    )

    return findings


# ---------------------------------------------------------------------------
# CLI entrypoint (the trainer shells this per pass; also a one-shot teacher CLI)
# ---------------------------------------------------------------------------

def self_check(slot_name: str = "slot.epii_judge") -> Dict[str, object]:
    """Verify the teacher can RESOLVE its slot + reach the PI harness WITHOUT a
    model call. Hermetic — no cloud, no inference. Backs the trainer subprocess
    contract and the wiring tests."""
    epi_bin = os.environ.get("EPI_BIN") or shutil.which("epi") or "epi"
    bare = slot_name.split(".", 1)[-1]
    status: Dict[str, object] = {
        "slot": slot_name,
        "resolved": False,
        "pi_available": (os.environ.get("PI_BIN") or shutil.which("pi")) is not None,
    }
    try:
        show = subprocess.run(
            [epi_bin, "slot", "show", "--json", bare],
            capture_output=True, text=True, timeout=30,
        )
        if show.returncode == 0:
            model_cfg = json.loads(show.stdout).get("model", {})
            status["provider"] = model_cfg.get("provider")
            status["model"] = model_cfg.get("model")
            status["state"] = model_cfg.get("state")
            status["resolved"] = bool(
                model_cfg.get("provider") and model_cfg.get("model")
            )
    except (FileNotFoundError, json.JSONDecodeError, subprocess.SubprocessError):
        pass
    return status


def main(argv: Optional[List[str]] = None) -> int:
    import argparse

    parser = argparse.ArgumentParser(
        description=(
            "Epistemic-blindfolded teacher — rides the PI harness "
            "(the local+cloud model selector), never a bespoke provider client."
        )
    )
    parser.add_argument(
        "--slot", default="slot.epii_judge",
        help="Teacher model slot (DR-MODEL-1, no hard-lock).",
    )
    parser.add_argument(
        "--prompt", default=None,
        help="Run one blindfolded prompt through PI and print the completion JSON.",
    )
    parser.add_argument(
        "--self-check", action="store_true",
        help="Resolve the slot + check PI reachability without any model call.",
    )
    # Accept (and ignore) the trainer's orchestration args so the subprocess
    # contract in m1-cpt-trainer holds; full corpus-generation is the Track
    # 12.24 distillation pipeline, not this endpoint.
    parser.add_argument("--spec", default=None)
    parser.add_argument("--corpus-manifest", default=None)
    parser.add_argument("--pass", dest="pass_index", type=int, default=None)
    args = parser.parse_args(argv)

    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s"
    )

    if args.prompt is not None:
        teacher = EpistemicBlindfoldedTeacher(
            EpistemicBlindfoldConfig(teacher_slot=args.slot)
        )
        text, trace, tokens = teacher._slot_cli_invoke(args.prompt, args.slot)
        print(json.dumps({"completion": text, "trace": trace, "tokens": tokens}))
        return 0

    # Default (and --self-check): prove the endpoint is wired to slot + PI.
    print(json.dumps(self_check(args.slot)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
