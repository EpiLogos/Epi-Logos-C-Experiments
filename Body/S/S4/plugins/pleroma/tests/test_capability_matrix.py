import json
import unittest
from pathlib import Path


PLUGIN_ROOT = Path(__file__).resolve().parents[1]


class PleromaCapabilityMatrixTest(unittest.TestCase):
    PLEROMA_ROOT = PLUGIN_ROOT
    CANONICAL_CT = {"CT0", "CT1", "CT2", "CT3", "CT4a", "CT4b", "CT5"}
    CANONICAL_CP = {
        "CP0", "CP1", "CP2", "CP3",
        "CP4.0", "CP4.1", "CP4.2", "CP4.3", "CP4.4", "CP4.5",
        "CP5",
    }
    CANONICAL_CF_KEYS = {
        "(00/00)", "(0/1)", "(0/1/2)", "(0/1/2/3)",
        "(4/5/0)", "(5/0)", "(4.0/1-4.4/5)", "(4.5/0)",
    }

    def test_matrix_maps_real_agents_skills_and_hooks(self):
        matrix_path = PLUGIN_ROOT / "capability-matrix.json"
        matrix = json.loads(matrix_path.read_text(encoding="utf-8"))

        self.assertEqual(matrix["coordinate"], "S4/S4'")
        self.assertEqual(matrix["package_role"], "anima_executive_capability_membrane")
        self.assertEqual(matrix["owner_agent"], "anima")

        for agent in matrix["constitutional_agents"]:
            self.assertTrue((PLUGIN_ROOT / "agents" / agent / "ANIMA.md").is_file(), agent)

        for skill in matrix["skills"]:
            self.assertTrue((PLUGIN_ROOT / "skills" / skill["name"] / "SKILL.md").is_file(), skill)

        for command in matrix["commands"]:
            self.assertTrue((PLUGIN_ROOT / command["path"]).is_file(), command)

        skill_names = {skill["name"] for skill in matrix["skills"]}
        for required in [
            "anima-orchestration",
            "vak-evaluate",
            "vak-coordinate-frame",
            "day-night-pass",
            "goal-prelude",
        ]:
            self.assertIn(required, skill_names)

        self.assertTrue((PLUGIN_ROOT / "hooks" / matrix["hooks"]["manifest"]).is_file())
        self.assertNotIn("epii", matrix["constitutional_agents"])

    def test_matrix_declares_anima_execution_backbone_and_agent_gates(self):
        matrix = json.loads((PLUGIN_ROOT / "capability-matrix.json").read_text(encoding="utf-8"))

        backbone = matrix["execution_backbone"]
        self.assertEqual(backbone["name"], "tilldone")
        self.assertEqual(backbone["scope"], "anima_execution_runs")
        self.assertIn("anima", backbone["enabled_for"])
        self.assertEqual(
            backbone["body_path"],
            "Body/S/S4/ta-onta/S4-2p-pleroma/S2/tilldone.ts",
        )

        gates = matrix["agent_capability_gates"]
        self.assertEqual(set(gates), set(matrix["constitutional_agents"]))

        anima_tools = set(gates["anima"]["tools"])
        self.assertIn("orchestrator", gates["anima"]["role_restrictions"])
        self.assertIn("summary_only_subagent_returns", gates["anima"]["role_restrictions"])
        for required in [
            "dispatch_agent",
            "goal_prelude",
            "run_chain",
            "subagent_create",
            "subagent_continue",
            "subagent_list",
            "subagent_remove",
            "tilldone",
        ]:
            self.assertIn(required, anima_tools)

        anima_skills = set(gates["anima"]["skills"])
        for required in [
            "vak-coordinate-frame",
            "vak-evaluate",
            "anima-orchestration",
            "goal-prelude",
            "day-night-pass",
        ]:
            self.assertIn(required, anima_skills)

        for agent in ["nous", "logos", "eros", "mythos", "psyche", "sophia"]:
            self.assertIn("leaf", gates[agent]["role_restrictions"])

    def test_matrix_declares_vak_psyche_day_now_lifecycle_contracts(self):
        matrix = json.loads((PLUGIN_ROOT / "capability-matrix.json").read_text(encoding="utf-8"))
        hooks = json.loads((PLUGIN_ROOT / "hooks" / "hooks.json").read_text(encoding="utf-8"))

        lifecycle = matrix["hooks"]["lifecycle_contract"]
        self.assertEqual(
            lifecycle["pre_tool_call"]["role"],
            "VAK and permission gate before action",
        )
        self.assertIn("DAY/NOW", lifecycle["pre_tool_call"]["inputs"])
        self.assertIn("portal.vak_eval", lifecycle["pre_tool_call"]["must_emit"])
        self.assertIn("Psyche", lifecycle["post_tool_call"]["role"])
        self.assertIn("portal.tool_call", lifecycle["post_tool_call"]["must_emit"])
        self.assertIn("day_id", lifecycle["transform_tool_result"]["inputs"])
        self.assertIn("portal.review_deposit", lifecycle["transform_tool_result"]["must_emit"])

        for hook_name in ["PreToolCall", "PostToolCall", "TransformToolResult"]:
            self.assertIn(hook_name, hooks["hooks"])

    def test_matrix_declares_typed_delegation_and_provider_profile_target(self):
        matrix = json.loads((PLUGIN_ROOT / "capability-matrix.json").read_text(encoding="utf-8"))

        delegation = matrix["typed_delegation"]
        self.assertEqual(delegation["delegate_lens"]["method"], "s4'.pleroma.delegate_lens")
        self.assertIn("lens_id", delegation["delegate_lens"]["arguments"])
        self.assertEqual(delegation["delegate_square"]["method"], "s4'.pleroma.delegate_square")
        self.assertEqual(
            delegation["gate_observability"]["method"],
            "s4'.pleroma.gate.evaluate",
        )
        self.assertIn("vak", delegation["gate_observability"]["returns"])

        provider = matrix["provider_profile_contract"]
        self.assertEqual(provider["coordinate_owner"], "S4")
        for attribute in [
            "fixed_temperature",
            "default_aux_model",
            "prepare_messages",
            "build_extra_body",
            "build_api_kwargs_extras",
            "fetch_models",
            "auth_type",
            "env_vars",
            "base_url",
        ]:
            self.assertIn(attribute, provider["attributes"])

    def test_matrix_separates_anima_actions_from_epii_review_authority(self):
        matrix = json.loads((PLUGIN_ROOT / "capability-matrix.json").read_text(encoding="utf-8"))

        self.assertIn("dispatch_to_constitutional_agent", matrix["anima_authority"])
        self.assertIn("deposit_epii_inbox_item", matrix["anima_authority"])
        self.assertIn("request_epii_validation", matrix["anima_authority"])
        self.assertNotIn("resolve_epii_review_gate", matrix["anima_authority"])

        self.assertEqual(matrix["epii_relation"]["relation"], "peer_pi_agent")
        self.assertIn("review_item", matrix["epii_relation"]["deposits_to_epii"])
        self.assertIn("validation_request", matrix["epii_relation"]["requests_to_epii"])

    def test_dispatch_tools_declare_vak_evaluate_as_upstream(self):
        """Every dispatch-class tool must declare vak-evaluate as upstream gate.

        Per Task A7 of the VAK-as-operational-substrate plan, the Pleroma
        capability matrix is the single source of truth for which tools are
        VAK-gated. Each dispatch tool's `upstream_required` list must include
        `vak-evaluate` so callers know to fire it before any dispatch.
        """
        matrix = json.loads((PLUGIN_ROOT / "capability-matrix.json").read_text(encoding="utf-8"))
        dispatch_tools = [t for t in matrix.get("dispatch_tools", []) if t.get("kind") == "vak-dispatch"]
        self.assertTrue(
            dispatch_tools,
            "dispatch_tools section missing or has no vak-dispatch entries",
        )
        for t in dispatch_tools:
            with self.subTest(tool=t.get("name")):
                self.assertIn(
                    "upstream_required",
                    t,
                    f"{t.get('name')} missing upstream_required",
                )
                self.assertIsInstance(
                    t["upstream_required"],
                    list,
                    f"{t.get('name')} upstream_required must be a list",
                )
                self.assertIn(
                    "vak-evaluate",
                    t["upstream_required"],
                    f"{t.get('name')} does not declare vak-evaluate upstream",
                )

    def test_dispatch_tools_cover_anima_dispatch_surface(self):
        """The dispatch_tools list must include the four Anima dispatch entry points.

        dispatch_agent, dispatch_parallel_agents, dispatch_fusion_agents, run_chain
        all need to be declared so prompts know they're VAK-gated. New dispatch
        tools added later must register here too.
        """
        matrix = json.loads((PLUGIN_ROOT / "capability-matrix.json").read_text(encoding="utf-8"))
        names = {t.get("name") for t in matrix.get("dispatch_tools", [])}
        expected = {"dispatch_agent", "dispatch_parallel_agents", "dispatch_fusion_agents", "run_chain"}
        missing = expected - names
        self.assertFalse(missing, f"dispatch_tools missing entries: {missing}")


    def test_every_skill_declares_vak_profile(self):
        """Each skill must carry operates_at_cf / serves_ct / ranges_cp profile fields."""
        matrix = json.loads((self.PLEROMA_ROOT / "capability-matrix.json").read_text())
        for skill in matrix["skills"]:
            with self.subTest(skill=skill["name"]):
                self.assertIn(
                    "vak_profile",
                    skill,
                    f"skill {skill['name']} missing vak_profile",
                )
                vp = skill["vak_profile"]
                self.assertIn("operates_at_cf", vp)
                self.assertIn("serves_ct", vp)
                self.assertIn("ranges_cp", vp)
                self.assertTrue(isinstance(vp["operates_at_cf"], list))
                self.assertTrue(isinstance(vp["serves_ct"], list))
                self.assertTrue(isinstance(vp["ranges_cp"], list))
                # canonical value sanity: at least one CF, CT, CP must be present
                self.assertTrue(
                    len(vp["operates_at_cf"]) > 0,
                    f"{skill['name']}: operates_at_cf must be non-empty",
                )
                self.assertTrue(
                    len(vp["serves_ct"]) > 0,
                    f"{skill['name']}: serves_ct must be non-empty",
                )
                self.assertTrue(
                    len(vp["ranges_cp"]) > 0,
                    f"{skill['name']}: ranges_cp must be non-empty",
                )

    def test_vak_profile_values_are_canonical(self):
        """Every vak_profile value must come from the canonical literal sets."""
        matrix = json.loads((self.PLEROMA_ROOT / "capability-matrix.json").read_text())
        for skill in matrix["skills"]:
            with self.subTest(skill=skill["name"]):
                for cf in skill["vak_profile"]["operates_at_cf"]:
                    self.assertIn(
                        cf,
                        self.CANONICAL_CF_KEYS,
                        f"{skill['name']}: unknown cf {cf}",
                    )
                for ct in skill["vak_profile"]["serves_ct"]:
                    self.assertIn(
                        ct,
                        self.CANONICAL_CT,
                        f"{skill['name']}: unknown ct {ct}",
                    )
                for cp in skill["vak_profile"]["ranges_cp"]:
                    self.assertIn(
                        cp,
                        self.CANONICAL_CP,
                        f"{skill['name']}: unknown cp {cp}",
                    )

    def test_no_skill_uses_bare_CT4_after_harmonization(self):
        """E1↔E2 harmonization (CT4 → CT4a/CT4b): bare 'CT4' is not a canonical literal."""
        matrix = json.loads((self.PLEROMA_ROOT / "capability-matrix.json").read_text())
        for skill in matrix["skills"]:
            with self.subTest(skill=skill["name"]):
                self.assertNotIn(
                    "CT4",
                    skill["vak_profile"]["serves_ct"],
                    f"{skill['name']}: bare 'CT4' is not canonical — use CT4a and/or CT4b",
                )


if __name__ == "__main__":
    unittest.main()
