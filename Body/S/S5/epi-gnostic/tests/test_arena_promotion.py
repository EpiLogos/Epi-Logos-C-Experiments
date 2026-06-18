from epi_gnostic.arena_promotion import (
    DEFAULT_PROMOTION_CONFIG,
    apply_augmentation_patch,
    build_promotion_proposal,
)


def warm_row(
    vama_shakti_class,
    turns,
    scenes,
    q_tail,
    *,
    user_response_quality_witnessed=True,
):
    return {
        "identity_handle": f"warm-{vama_shakti_class}",
        "coordinate_label": f"M4.{vama_shakti_class}",
        "essential_identity": {
            "vama_shakti_coordinate": {
                "cpf": "mechanistic",
                "ct": ["CT4"],
                "cp": f"M4.{vama_shakti_class}",
                "cf": "(4.5/0)",
                "cfp": "m4.arena.vama",
                "cs": {"code": f"vama:{vama_shakti_class}", "direction": "day"},
            },
            "vama_shakti_class": vama_shakti_class,
            "psyche_template_revision": f"psyche-rev-{vama_shakti_class}",
        },
        "q_activity_accumulator": {
            "q_activity_accumulator": [1.0, q_tail, 0.0, 0.0],
            "turn_count": turns,
        },
        "scene_count": scenes,
        "citation_coordinates": ["M4.a", "M4.a", "S1"],
        "pairwise_resonance_events": [
            {"with": "Sophia", "score": 0.72},
            {"with": "Psyche", "score": 0.61},
        ],
        "distilled_vak_address_signature": {
            "cpf": "mechanistic",
            "ct": ["CT4", "CT5"],
            "cp": "M4",
            "cf": "(4.5/0)",
            "cfp": "arena-promotion",
            "cs": {"code": "warm-crossing", "direction": "day"},
        },
        "user_response_quality_witnessed": user_response_quality_witnessed,
    }


def test_classifier_specific_thresholds_emit_proposals_per_profile():
    examples = [
        ("egregore", 60, 6, 0.40),
        ("sprite", 15, 2, 0.25),
        ("daemon", 30, 4, 0.40),
        ("mantra", 30, 8, 0.50),
    ]

    for vama_class, turns, scenes, q_tail in examples:
        proposal = build_promotion_proposal(
            warm_row(vama_class, turns, scenes, q_tail),
            config=DEFAULT_PROMOTION_CONFIG,
        )

        assert proposal is not None
        assert proposal["event"] == "promotion_proposal_emitted"
        assert proposal["vama_shakti_class"] == vama_class
        assert proposal["threshold_profile"]["turns_threshold"] == turns
        assert proposal["threshold_profile"]["scenes_threshold"] == scenes

    assert (
        build_promotion_proposal(
            warm_row("daemon", 30, 4, 0.40, user_response_quality_witnessed=False),
            config=DEFAULT_PROMOTION_CONFIG,
        )
        is None
    )


def test_mantra_augmentation_targets_element_signature_not_form_text():
    proposal = build_promotion_proposal(
        warm_row("mantra", 30, 8, 0.50),
        config=DEFAULT_PROMOTION_CONFIG,
    )

    assert proposal is not None
    patch = proposal["augmentation_patch"]
    assert patch["target"] == "element_signature"
    assert patch["operation"] == "merge_element_signature"
    assert "element_axis_delta" in patch
    assert "form_text" not in patch


def test_non_overwriting_augmentation_preserves_content_and_class_provenance():
    proposal = build_promotion_proposal(
        warm_row("sprite", 15, 2, 0.25),
        config=DEFAULT_PROMOTION_CONFIG,
    )
    existing = "---\ntitle: Sprite Form\n---\n\n# Sprite Form\n\nPrior canon stays here.\n"

    updated = apply_augmentation_patch(existing, proposal["augmentation_patch"])

    assert "# Sprite Form" in updated
    assert "Prior canon stays here." in updated
    assert "<!-- augmented from arena lifecycle T15_S2_M0.25_classsprite -->" in updated
    assert "## Arena Promotion Augmentation" in updated
