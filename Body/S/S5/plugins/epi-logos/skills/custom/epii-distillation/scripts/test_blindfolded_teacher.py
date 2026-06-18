#!/usr/bin/env python3
"""
test_blindfolded_teacher.py — Contract tests for the epistemic-blindfolded teacher.

Validates:
  1. Teacher prompt never contains the canonical proof
  2. Minimum-leakage regeneration hint contains only shape names
  3. SHACL validation loop iterates correctly
  4. Student-aware CoT trajectory selection
  5. Blindfold integrity audit function

Run: pytest Body/S/S5/plugins/epi-logos/skills/custom/epii-distillation/scripts/test_blindfolded_teacher.py -q
"""

import os
import sys

import pytest

# Ensure we can import the module under test
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from blindfolded_teacher import (
    CoTTrajectory,
    EpistemicBlindfoldConfig,
    EpistemicBlindfoldedTeacher,
    MathemeStructuralRelation,
    ShaclValidationReport,
    ShaclValidationStatus,
    ShaclViolation,
    TeacherInput,
    TeacherOutput,
    audit_blindfold_integrity,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def sample_structural_relations():
    return [
        MathemeStructuralRelation(
            source_coordinate="M1-0",
            target_coordinate="M1-2",
            relation_type="contains",
            description="M1-0 Bimba contains the Ananda matrix archetypes in .rodata",
        ),
        MathemeStructuralRelation(
            source_coordinate="M1-2",
            target_coordinate="M1-4",
            relation_type="derivesFrom",
            description="M1-4 QL Flowering derives lens-mode ratios from Ananda cells",
        ),
        MathemeStructuralRelation(
            source_coordinate="M1-4",
            target_coordinate="M1-5",
            relation_type="recognisesAs",
            description="M1-5 Toroidal Recognition recognises the 4:2/3:3 dual partition",
        ),
    ]


@pytest.fixture
def sample_teacher_input(sample_structural_relations):
    return TeacherInput(
        structural_relations=sample_structural_relations,
        derivation_path=["M1-0", "M1-2", "M1-4", "M1-5"],
        query="Derive how the 4:2 and 3:3 dual partitions generate 4/3 and 3/2 from the Ananda matrices.",
    )


@pytest.fixture
def canonical_proof():
    return """The 6-fold matheme admits two simultaneously-operative partitions.
The 4:2 partition reads the 6-fold as 4 explicate + 2 implicate boundary.
The explicate-quartet over its first three gives the ratio 4:3 = perfect fourth.
The 3:3 partition reads the 6-fold as 3 physical-pole + 3 mental-pole.
The mental-trinity stacked on the physical-trinity gives 3:2 = perfect fifth."""


@pytest.fixture
def config():
    return EpistemicBlindfoldConfig(max_regeneration_attempts=2)


# ---------------------------------------------------------------------------
# Teacher prompt construction tests
# ---------------------------------------------------------------------------

class TestBlindfoldedPrompt:
    """Verify that the teacher prompt respects epistemic blindfolding."""

    def test_prompt_excludes_canonical_proof(self, sample_teacher_input, canonical_proof, config):
        """The canonical proof text MUST NOT appear in the teacher prompt."""
        teacher = EpistemicBlindfoldedTeacher(config)
        prompt = teacher._build_blindfolded_prompt(sample_teacher_input)

        assert canonical_proof not in prompt, (
            "CANONICAL PROOF LEAKED INTO TEACHER PROMPT — blindfold violated"
        )

    def test_prompt_contains_structural_relations(self, sample_teacher_input, config):
        """The prompt should contain the structural relations given."""
        teacher = EpistemicBlindfoldedTeacher(config)
        prompt = teacher._build_blindfolded_prompt(sample_teacher_input)

        assert "M1-0" in prompt
        assert "contains" in prompt
        assert "Ananda matrix archetypes" in prompt

    def test_prompt_contains_derivation_path(self, sample_teacher_input, config):
        """The prompt should contain the derivation path."""
        teacher = EpistemicBlindfoldedTeacher(config)
        prompt = teacher._build_blindfolded_prompt(sample_teacher_input)

        assert "M1-0 → M1-2 → M1-4 → M1-5" in prompt

    def test_prompt_contains_query(self, sample_teacher_input, config):
        """The prompt should contain the natural-language query."""
        teacher = EpistemicBlindfoldedTeacher(config)
        prompt = teacher._build_blindfolded_prompt(sample_teacher_input)

        assert "4:2 and 3:3 dual partitions" in prompt

    def test_prompt_with_regeneration_hint(self, sample_teacher_input, config):
        """Regeneration hint adds only shape names, not the proof."""
        sample_teacher_input.regeneration_hint = (
            "SHACL validation failure on shapes: epi:InversionPairCompletenessShape"
        )
        teacher = EpistemicBlindfoldedTeacher(config)
        prompt = teacher._build_blindfolded_prompt(sample_teacher_input)

        assert "InversionPairCompletenessShape" in prompt
        assert "Prior Attempt Feedback" in prompt
        # The hint is a shape name, not proof text
        assert "4:2 partition" not in prompt.split("Prior Attempt Feedback")[1]


# ---------------------------------------------------------------------------
# SHACL validation loop tests
# ---------------------------------------------------------------------------

class TestShaclValidationLoop:
    """Verify the SHACL validation + regeneration loop."""

    def test_passes_on_first_attempt(self, sample_teacher_input, config):
        """When SHACL passes immediately, no regeneration occurs."""
        call_count = [0]

        def mock_slot_invoke(prompt, model):
            call_count[0] += 1
            return ("Generated derivation text", "trace", 100)

        def shacl_pass(_text):
            return ShaclValidationReport(
                status=ShaclValidationStatus.PASS,
                passed_shapes=["epi:BedrockSinglenessShape"],
            )

        teacher = EpistemicBlindfoldedTeacher(
            config, slot_cli_invoke=mock_slot_invoke
        )
        output, report = teacher.generate_with_shacl_loop(
            sample_teacher_input, shacl_pass
        )

        assert report.status == ShaclValidationStatus.PASS
        assert call_count[0] == 1  # only one invocation

    def test_regenerates_on_failure(self, sample_teacher_input, config):
        """On SHACL fail, teacher regenerates with minimal hint."""
        call_count = [0]
        hints_received = []

        def mock_slot_invoke(prompt, model):
            call_count[0] += 1
            # Record if regeneration hint is in the prompt
            if "Prior Attempt Feedback" in prompt:
                hints_received.append(prompt)
            return (f"Generated derivation attempt {call_count[0]}", "trace", 100)

        def shacl_fail_then_pass(text):
            if "attempt 1" in text:
                return ShaclValidationReport(
                    status=ShaclValidationStatus.FAIL,
                    violations=[
                        ShaclViolation(
                            shape="epi:InversionPairCompletenessShape",
                            message="Inversion pair incomplete",
                            focus_node="M1-2",
                        ),
                    ],
                )
            return ShaclValidationReport(
                status=ShaclValidationStatus.PASS,
                passed_shapes=["epi:BedrockSinglenessShape"],
            )

        teacher = EpistemicBlindfoldedTeacher(
            config, slot_cli_invoke=mock_slot_invoke
        )
        output, report = teacher.generate_with_shacl_loop(
            sample_teacher_input, shacl_fail_then_pass
        )

        assert report.status == ShaclValidationStatus.PASS
        assert call_count[0] == 2  # first attempt + one regeneration
        assert len(hints_received) == 1

    def test_exhausts_max_attempts(self, sample_teacher_input, config):
        """After max regeneration attempts, returns last failure."""
        call_count = [0]

        def mock_slot_invoke(prompt, model):
            call_count[0] += 1
            return (f"Attempt {call_count[0]}", "trace", 100)

        def always_fail(_text):
            return ShaclValidationReport(
                status=ShaclValidationStatus.FAIL,
                violations=[
                    ShaclViolation(
                        shape="epi:StructuralInvariantShape",
                        message="Invariant violated",
                        focus_node="M1",
                    ),
                ],
            )

        teacher = EpistemicBlindfoldedTeacher(
            config, slot_cli_invoke=mock_slot_invoke
        )
        output, report = teacher.generate_with_shacl_loop(
            sample_teacher_input, always_fail
        )

        assert report.status == ShaclValidationStatus.FAIL
        # 1 initial + max_regeneration_attempts retries
        assert call_count[0] == config.max_regeneration_attempts + 1


# ---------------------------------------------------------------------------
# Minimum-leakage filter tests
# ---------------------------------------------------------------------------

class TestMinimumLeakage:
    """Verify that regeneration hints respect minimum-leakage discipline."""

    def test_single_failed_rubric_contains_only_shapes(self):
        """Failed rubric describes only shape names, not proof text."""
        report = ShaclValidationReport(
            status=ShaclValidationStatus.FAIL,
            violations=[
                ShaclViolation(
                    shape="epi:BedrockSinglenessShape",
                    message="Bedrock not singular",
                    focus_node="M1-0",
                ),
                ShaclViolation(
                    shape="epi:InversionPairCompletenessShape",
                    message="Pair incomplete",
                    focus_node="M1-3",
                ),
            ],
        )

        rubric = report.single_failed_rubric()
        assert rubric is not None
        assert "BedrockSinglenessShape" in rubric
        assert "InversionPairCompletenessShape" in rubric
        # Should NOT contain the violation messages (minimum leakage)
        assert "Bedrock not singular" not in rubric
        assert "Pair incomplete" not in rubric

    def test_pass_returns_no_rubric(self):
        """Passing validation returns no rubric hint."""
        report = ShaclValidationReport(
            status=ShaclValidationStatus.PASS,
            passed_shapes=["epi:BedrockSinglenessShape"],
        )
        assert report.single_failed_rubric() is None


# ---------------------------------------------------------------------------
# Student-aware CoT selection tests
# ---------------------------------------------------------------------------

class TestCoTSelection:
    """Verify student-aware chain-of-thought trajectory selection."""

    def test_selects_lowest_variance_trajectory(self):
        """Best trajectory has lowest negative-variance step-difficulty."""
        trajectories = [
            CoTTrajectory(
                steps=["Step 1: define", "Step 2: derive", "Step 3: conclude"],
                step_difficulties=[2.0, 1.5, 1.0],
            ),
            CoTTrajectory(
                steps=["Step 1: define", "Step 2: derive", "Step 3: conclude"],
                step_difficulties=[5.0, 5.0, 5.0],  # zero variance = best
            ),
            CoTTrajectory(
                steps=["Step 1: define", "Step 2: derive", "Step 3: conclude"],
                step_difficulties=[10.0, 2.0, 6.0],  # high variance
            ),
        ]

        # Compute variances
        for t in trajectories:
            if t.step_difficulties:
                mean_d = sum(t.step_difficulties) / len(t.step_difficulties)
                var = sum(
                    (d - mean_d) ** 2 for d in t.step_difficulties
                ) / len(t.step_difficulties)
                t.total_difficulty_variance = var

        # All smoothness scores
        for t in trajectories:
            t.smoothness_score = 0.8  # above threshold

        best = EpistemicBlindfoldedTeacher.score_trajectories(trajectories)
        # Should select trajectory with zero variance (second one)
        assert best.total_difficulty_variance == 0.0

    def test_filters_by_smoothness(self):
        """Trajectories below smoothness threshold are excluded."""
        trajectories = [
            CoTTrajectory(
                steps=["Step 1", "Step 2"],
                smoothness_score=0.1,  # low
                step_difficulties=[5.0, 5.0],
                total_difficulty_variance=0.0,
            ),
            CoTTrajectory(
                steps=["Step 1", "Step 2"],
                smoothness_score=0.9,  # good
                step_difficulties=[3.0, 4.0],
                total_difficulty_variance=0.25,
            ),
        ]

        best = EpistemicBlindfoldedTeacher.score_trajectories(trajectories)
        # High-smoothness trajectory selected even though it has some variance
        assert best.smoothness_score == 0.9


# ---------------------------------------------------------------------------
# Blindfold integrity audit tests
# ---------------------------------------------------------------------------

class TestBlindfoldAudit:
    """Verify the blindfold integrity audit function."""

    def test_audit_detects_canonical_leak_in_output(self, sample_teacher_input, canonical_proof):
        """Audit should detect when canonical proof appears in teacher output."""
        output = TeacherOutput(
            derivation_text=f"Here is the derivation: {canonical_proof}",
            model_used="test-model",
            trace="test",
        )

        findings = audit_blindfold_integrity(
            sample_teacher_input, output, canonical_proof
        )
        assert findings["canonical_in_output"] is True
        assert findings["blindfold_intact"] is False

    def test_audit_passes_when_no_leak(self, sample_teacher_input, canonical_proof):
        """Audit should pass when teacher produced independent derivation."""
        output = TeacherOutput(
            derivation_text="Independent derivation from first principles.",
            model_used="test-model",
            trace="test",
        )

        findings = audit_blindfold_integrity(
            sample_teacher_input, output, canonical_proof
        )
        assert findings["blindfold_intact"] is True

    def test_audit_detects_leak_in_regeneration_hint(self, canonical_proof):
        """Audit should detect if regeneration hint exposes proof text."""
        input_with_leaky_hint = TeacherInput(
            structural_relations=[],
            derivation_path=["M1-0"],
            query="test",
            regeneration_hint=f"The proof was: {canonical_proof}",  # LEAK!
        )

        output = TeacherOutput(
            derivation_text="independent",
            model_used="test",
            trace="test",
        )

        findings = audit_blindfold_integrity(
            input_with_leaky_hint, output, canonical_proof
        )
        assert findings["regeneration_hint_leaks_proof"] is True
