use std::fs;
use std::path::PathBuf;

#[test]
fn khora_and_hen_extension_scaffolds_exist() {
    let root = repo_root();
    for path in [
        "Body/S/S4/ta-onta/S4-0p-khora/extension.ts",
        "Body/S/S4/ta-onta/S4-0p-khora/CONTRACT.md",
        "Body/S/S4/ta-onta/S4-0p-khora/S0/tools.json",
        "Body/S/S4/ta-onta/S4-0p-khora/S0/cli/preferred-tools.json",
        "Body/S/S4/ta-onta/S4-0p-khora/S0/cli/README.md",
        "Body/S/S4/ta-onta/S4-0p-khora/S0/cli/resolve.sh",
        "Body/S/S4/ta-onta/S4-0p-khora/S0/cli/read.sh",
        "Body/S/S4/ta-onta/S4-0p-khora/S0/cli/search.sh",
        "Body/S/S4/ta-onta/S4-0p-khora/S0/cli/list.sh",
        "Body/S/S4/ta-onta/S4-0p-khora/S0/cli/nav.sh",
        "Body/S/S4/ta-onta/S4-0p-khora/S0/cli/json.sh",
        "Body/S/S4/ta-onta/S4-0p-khora/S0/pre-session-init.sh",
        "Body/S/S4/ta-onta/S4-0p-khora/S0/post-session-close.sh",
        "Body/S/S4/ta-onta/S4-0p-khora/S0'/ffi.md",
        "Body/S/S4/ta-onta/S4-0p-khora/S0'/cli-primitives.md",
        "Body/S/S4/ta-onta/S4-0p-khora/S0'/session-state.d.ts",
        "Body/S/S4/ta-onta/S4-1p-hen/extension.ts",
        "Body/S/S4/ta-onta/S4-1p-hen/CONTRACT.md",
        "Body/S/S4/ta-onta/S4-1p-hen/S1/tools.json",
        "Body/S/S4/ta-onta/S4-1p-hen/M/README.md",
        "Idea/Bimba/World/NOW.md",
        "Idea/Bimba/World/Daily-Note.md",
        "Idea/Bimba/World/CT4a.md",
        "Idea/Bimba/World/CT4b.md",
        "Idea/Bimba/World/Types/README.md",
        "Idea/Bimba/World/Types/Psychoids/#/#4/.gitkeep",
        "Idea/Bimba/World/Types/Coordinates/C/C0/C0'/CPF/.gitkeep",
        "Idea/Bimba/World/Types/Coordinates/C/C3/C3'/CF/CF_MOBIUS/.gitkeep",
        "Idea/Bimba/World/Types/Coordinates/M/M4/M4'/.gitkeep",
        "Idea/Bimba/World/Types/Coordinates/C/C1/C1'/CT/CT4a/Integration-Preview/.gitkeep",
        "Idea/Bimba/World/Types/Coordinates/C/C1/C1'/CT/CT4b/Daily-Note/.gitkeep",
        "Idea/Bimba/World/Types/Coordinates/C/C1/C1'/CT/CT4b/NOW/.gitkeep",
    ] {
        assert!(root.join(path).exists(), "missing {}", path);
    }

    assert!(root.join("repo-ontology.md").is_file());

    let khora_tools =
        fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-0p-khora/S0/tools.json")).unwrap();
    assert!(khora_tools.contains("epi core knowing"));
    assert!(khora_tools.contains("epi vault"));

    let khora_cli_manifest =
        fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-0p-khora/S0/cli/preferred-tools.json"))
            .unwrap();
    assert!(khora_cli_manifest.contains("\"search\""));
    assert!(khora_cli_manifest.contains("\"rg\""));
    assert!(khora_cli_manifest.contains("\"grep\""));
    assert!(khora_cli_manifest.contains("\"read\""));
    assert!(khora_cli_manifest.contains("\"bat\""));
    assert!(khora_cli_manifest.contains("\"cat\""));
    assert!(khora_cli_manifest.contains("\"navigation\""));
    assert!(khora_cli_manifest.contains("\"zoxide\""));
    assert!(khora_cli_manifest.contains("\"listing\""));
    assert!(khora_cli_manifest.contains("\"eza\""));
    assert!(khora_cli_manifest.contains("\"ls\""));
    assert!(khora_cli_manifest.contains("\"json\""));
    assert!(khora_cli_manifest.contains("\"jq\""));
    assert!(khora_cli_manifest.contains("\"select_interactive\""));
    assert!(khora_cli_manifest.contains("\"fzf\""));
    assert!(khora_cli_manifest.contains("\"git_host\""));
    assert!(khora_cli_manifest.contains("\"gh\""));
    assert!(khora_cli_manifest.contains("\"task_runner\""));
    assert!(khora_cli_manifest.contains("\"just\""));

    let khora_cli_readme =
        fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-0p-khora/S0/cli/README.md")).unwrap();
    assert!(khora_cli_readme.contains("agent-facing"));
    assert!(khora_cli_readme.contains("preferred-tools.json"));
    assert!(khora_cli_readme.contains("resolve.sh"));
    assert!(khora_cli_readme.contains("bat"));
    assert!(khora_cli_readme.contains("zoxide"));
    assert!(khora_cli_readme.contains("fzf"));
    assert!(khora_cli_readme.contains("gh"));
    assert!(khora_cli_readme.contains("just"));

    let hen_tools =
        fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-1p-hen/S1/tools.json")).unwrap();
    assert!(hen_tools.contains("epi vault template-invoke"));
    assert!(hen_tools.contains("epi vault thought-route"));

    let khora_contract =
        fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-0p-khora/CONTRACT.md")).unwrap();
    assert!(khora_contract.contains("S0/cli"));
    assert!(khora_contract.contains("agent-facing command preferences"));
    assert!(khora_contract.contains("PI-visible tool"));
    assert!(khora_contract.contains("bat"));
    assert!(khora_contract.contains("zoxide"));
    assert!(khora_contract.contains("fzf"));
    assert!(khora_contract.contains("gh"));
    assert!(khora_contract.contains("just"));

    let hen_contract =
        fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-1p-hen/CONTRACT.md")).unwrap();
    assert!(hen_contract.contains("Idea/Bimba/World"));
    assert!(hen_contract.contains("Idea/Bimba/World/Types"));
    assert!(hen_contract.contains("C0' -> CPF"));
    assert!(hen_contract.contains("C1' -> CT"));
    assert!(hen_contract.contains("C3' -> CF"));
    assert!(hen_contract.contains("derived from the core C library and schema authorities"));
    assert!(hen_contract.contains("Idea/Bimba/World/Types/Coordinates/C/C1/C1'/CT"));
    assert!(hen_contract.contains("Idea/Bimba/World/Types/Coordinates/C/C3/C3'/CF"));

    let hen_extension =
        fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-1p-hen/extension.ts")).unwrap();
    assert!(hen_extension.contains("name: \"hen_link_candidates\""));
    assert!(hen_extension.contains("\"vault\", \"link-suggest\""));

    let repo_ontology = fs::read_to_string(root.join("repo-ontology.md")).unwrap();
    assert!(repo_ontology.contains("Idea/Bimba/Seeds"));
    assert!(repo_ontology.contains("Idea/Bimba/World"));
    assert!(repo_ontology.contains("Idea/Bimba/World/Types"));
    assert!(repo_ontology.contains("Idea/Empty/Present"));
    assert!(repo_ontology.contains("Idea/Pratibimba/Self"));
}

#[test]
fn repo_pi_foundation_has_bootable_root_assets() {
    let root = repo_root();
    for path in [
        "Body/S/S4/pi-agent/composite-entry.ts",
        "Body/S/S4/pi-agent/extensions/epi-citta.ts",
        "Body/S/S4/pi-agent/prompts/epi-system.md",
        "Body/S/S4/pi-agent/prompts/epi-agent-help.md",
        "Body/S/S4/pi-agent/agents/teams.yaml",
        "Body/S/S4/pi-agent/agents/agent-chain.yaml",
        "Body/S/S4/ta-onta/plugin-runtime-bridge.ts",
    ] {
        assert!(root.join(path).exists(), "missing {}", path);
    }

    let composite = fs::read_to_string(root.join("Body/S/S4/pi-agent/composite-entry.ts")).unwrap();
    assert!(composite.contains("export default async function"));
    assert!(composite.contains("./extensions/ta-onta/composite-entry.ts"));

    let epi_citta =
        fs::read_to_string(root.join("Body/S/S4/pi-agent/extensions/epi-citta.ts")).unwrap();
    assert!(epi_citta.contains("export default async function"));
    assert!(epi_citta.contains("registerTool"));

    let bridge =
        fs::read_to_string(root.join("Body/S/S4/ta-onta/plugin-runtime-bridge.ts")).unwrap();
    assert!(bridge.contains("export default async function"));
    assert!(bridge.contains("api.on(\"session_start\""));
    assert!(bridge.contains("EPI_AGENT_PLUGIN_RUNTIME_PATH"));
}

#[test]
fn ta_onta_extensions_use_real_pi_hook_api() {
    let root = repo_root();
    for path in [
        "Body/S/S4/ta-onta/S4-4p-anima/extension.ts",
        "Body/S/S4/ta-onta/S4-0p-khora/extension.ts",
        "Body/S/S4/ta-onta/S4-1p-hen/extension.ts",
        "Body/S/S4/ta-onta/S4-3p-chronos/extension.ts",
        "Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts",
        "Body/S/S4/ta-onta/composite-entry.ts",
    ] {
        let contents = fs::read_to_string(root.join(path)).unwrap();
        assert!(
            !contents.contains("api.hooks"),
            "{path} still uses the non-existent api.hooks surface"
        );
    }

    let composite = fs::read_to_string(root.join("Body/S/S4/ta-onta/composite-entry.ts")).unwrap();
    assert!(composite.contains("export default async function"));
}

#[test]
fn anima_s4_modules_are_real_pi_vs_claude_code_ports() {
    let root = repo_root();

    let agent_team =
        fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-4p-anima/S4/agent-team.ts")).unwrap();
    assert!(
        !agent_team.contains("return \"agent-team\""),
        "agent-team.ts is still a placeholder"
    );
    assert!(agent_team.contains("pi.registerTool({"));
    assert!(agent_team.contains("name: \"dispatch_agent\""));
    assert!(agent_team.contains("pi.registerCommand(\"agents-team\""));
    assert!(agent_team.contains("childPiRuntimeArgs()"));
    assert!(agent_team.contains("\"--tools\", state.def.tools"));
    assert!(agent_team.contains("spawn(\"pi\""));

    let agent_chain =
        fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-4p-anima/S4/agent-chain.ts")).unwrap();
    assert!(
        !agent_chain.contains("return \"agent-chain\""),
        "agent-chain.ts is still a placeholder"
    );
    assert!(agent_chain.contains("pi.registerTool({"));
    assert!(agent_chain.contains("name: \"run_chain\""));
    assert!(agent_chain.contains("pi.registerCommand(\"chain\""));
    assert!(agent_chain.contains("pi.registerCommand(\"chain-list\""));
    assert!(agent_chain.contains("childPiRuntimeArgs()"));
    assert!(agent_chain.contains("\"--tools\", agentDef.tools"));
    assert!(agent_chain.contains("spawn(\"pi\""));

    let subagent_widget =
        fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-4p-anima/S4/subagent-widget.ts"))
            .unwrap();
    assert!(
        !subagent_widget.contains("return \"subagent-widget\""),
        "subagent-widget.ts is still a placeholder"
    );
    assert!(subagent_widget.contains("name: \"subagent_create\""));
    assert!(subagent_widget.contains("name: \"subagent_continue\""));
    assert!(subagent_widget.contains("name: \"subagent_remove\""));
    assert!(subagent_widget.contains("name: \"subagent_list\""));
    assert!(subagent_widget.contains("pi.registerCommand(\"sub\""));
    assert!(subagent_widget.contains("pi.sendMessage({"));
    assert!(subagent_widget.contains("\"agent\", \"subagent\", \"run\""));
    assert!(subagent_widget.contains("\"agent\", \"subagent\", \"continue\""));
    assert!(subagent_widget.contains("\"agent\", \"subagent\", \"list\""));
    assert!(subagent_widget.contains("\"agent\", \"subagent\", \"stop\""));
    assert!(
        !subagent_widget.contains("spawn(\"pi\""),
        "subagent-widget should delegate to the native epi subagent runtime"
    );
}

#[test]
fn anima_extension_uses_s4_runtime_modules_instead_of_local_stub_tools() {
    let root = repo_root();
    let source =
        fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-4p-anima/extension.ts")).unwrap();

    assert!(source.contains("./S4/agent-team.ts"));
    assert!(source.contains("./S4/agent-chain.ts"));
    assert!(source.contains("./S4/subagent-widget.ts"));
    assert!(source.contains("api.setActiveTools(["));
    assert!(source.contains("\"vak_evaluate\""));
    assert!(source.contains("\"anima_orchestrate\""));
    assert!(source.contains("\"dispatch_agent\""));
    assert!(source.contains("\"run_chain\""));
    assert!(source.contains("\"subagent_create\""));
    assert!(source.contains("\"tilldone\""));
    assert!(
        !source.contains("name: \"dispatch_agent\""),
        "dispatch_agent should come from the S4 agent-team port"
    );
    assert!(
        !source.contains("name: \"run_chain\""),
        "run_chain should come from the S4 agent-chain port"
    );
    assert!(
        !source.contains("name: \"subagent_create\""),
        "subagent lifecycle tools should come from the S4 subagent-widget port"
    );
}

#[test]
fn anima_manifests_match_the_ported_team_and_chain_parsers() {
    let root = repo_root();

    let teams = fs::read_to_string(root.join("Body/S/S4/pi-agent/agents/teams.yaml")).unwrap();
    assert!(
        !teams.contains("- id:"),
        "teams.yaml still uses the placeholder list format instead of upstream team keys"
    );
    assert!(teams.contains("constitutional:"));
    assert!(teams.contains("- psyche"));
    assert!(teams.contains("- sophia"));
    assert!(teams.contains("- nous"));

    let chains =
        fs::read_to_string(root.join("Body/S/S4/pi-agent/agents/agent-chain.yaml")).unwrap();
    assert!(
        !chains.contains("- id:"),
        "agent-chain.yaml still uses the placeholder list format instead of upstream chain keys"
    );
    assert!(
        chains.contains("No default chains"),
        "agent-chain.yaml should remain intentionally empty until Anima has a real CFP2 chain"
    );
}

#[test]
fn pleroma_supports_the_ported_anima_runtime_helpers() {
    let root = repo_root();

    let theme_map =
        fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-2p-pleroma/S2/themeMap.ts")).unwrap();
    assert!(theme_map.contains("export const THEME_MAP"));
    assert!(theme_map.contains("export function applyExtensionDefaults"));
    assert!(theme_map.contains("\"agent-team\""));
    assert!(theme_map.contains("\"subagent-widget\""));

    let khora_propagation = fs::read_to_string(
        root.join("Body/S/S4/ta-onta/S4-0p-khora/S0'/child-extension-propagation.ts"),
    )
    .unwrap();
    assert!(khora_propagation.contains("PI_AGENT_CHILD_EXTENSIONS"));
    assert!(khora_propagation.contains("EPI_GATE_SKILLS_PATHS"));
    assert!(khora_propagation.contains("--no-extensions"));
    assert!(khora_propagation.contains("--no-skills"));
    assert!(khora_propagation.contains("--extension"));
    assert!(khora_propagation.contains("--skill"));

    let pleroma_propagation = fs::read_to_string(
        root.join("Body/S/S4/ta-onta/S4-2p-pleroma/S2/child-extension-propagation.ts"),
    )
    .unwrap();
    assert!(pleroma_propagation.contains("export {"));
    assert!(pleroma_propagation.contains("../../khora/S0'/child-extension-propagation.ts"));
}

#[test]
fn khora_ports_cross_agent_and_system_select_from_copied_upstream_sources() {
    let root = repo_root();

    let cross_agent =
        fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-0p-khora/S0'/cross-agent.ts")).unwrap();
    assert!(
        !cross_agent.contains("return \"cross-agent\""),
        "khora cross-agent is still a placeholder"
    );
    assert!(cross_agent.contains("applyExtensionDefaults"));
    assert!(cross_agent.contains("pi.registerCommand(cmd.name"));
    assert!(cross_agent.contains("anima/S4'"));

    let system_select =
        fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-0p-khora/S0'/system-select.ts"))
            .unwrap();
    assert!(system_select.contains("pi.registerCommand(\"system\""));
    assert!(system_select.contains("pi.on(\"before_agent_start\""));
    assert!(system_select.contains("anima/S4'"));

    let system0select =
        fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-0p-khora/S0'/system0select.ts"))
            .unwrap();
    assert!(
        !system0select.contains("export { default }"),
        "system0select.ts should be a copied compatibility source, not a re-export wrapper"
    );
    assert!(system0select.contains("pi.registerCommand(\"system\""));
    assert!(system0select.contains("anima/S4'"));

    let khora =
        fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-0p-khora/extension.ts")).unwrap();
    assert!(khora.contains("./S0'/cross-agent.ts"));
    assert!(khora.contains("./S0'/system-select.ts"));
}

#[test]
fn pleroma_ports_damage_control_tilldone_and_cmux_visibility_helpers() {
    let root = repo_root();

    let damage_control =
        fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-2p-pleroma/S2/damage-control.ts"))
            .unwrap();
    assert!(damage_control.contains("pi.on(\"tool_call\""));
    assert!(damage_control.contains(".pi\", \"damage-control-rules.yaml"));

    let tilldone =
        fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-2p-pleroma/S2/tilldone.ts")).unwrap();
    let upstream_tilldone =
        fs::read_to_string(root.join("vendors/pi-vs-claude-code/extensions/tilldone.ts")).unwrap();
    assert_eq!(
        upstream_tilldone, tilldone,
        "tilldone should remain a fidelity port of the Disler vendor execution gate"
    );
    assert!(tilldone.contains("name: \"tilldone\""));
    assert!(tilldone.contains("pi.registerCommand(\"tilldone\""));
    assert!(tilldone.contains("pi.on(\"tool_call\""));

    let pleroma =
        fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-2p-pleroma/extension.ts")).unwrap();
    assert!(pleroma.contains("./S2/damage-control.ts"));
    assert!(pleroma.contains("import registerTilldone from \"./S2/tilldone.ts\""));
    assert!(pleroma.contains("registerTilldone(api);"));
    assert!(pleroma.contains("shouldRegisterTilldone"));
    assert!(pleroma.contains("EPI_TILLDONE_MODE"));
    assert!(pleroma.contains("EPI_AGENT_NAME"));
    assert!(!pleroma.contains("// import registerTilldone"));
    assert!(!pleroma.contains("// registerTilldone(api);"));
    assert!(
        pleroma.contains("techne_cmux_list_workspaces"),
        "pleroma should expose a bounded cmux visibility helper for the Techne operator layer"
    );
    assert!(pleroma.contains("techne_cmux_identify"));
    assert!(pleroma.contains("\"list-workspaces\", \"--projected\""));
    assert!(pleroma.contains("\"identify\", \"--projected\""));

    let matrix =
        fs::read_to_string(root.join("Body/S/S4/plugins/pleroma/capability-matrix.json")).unwrap();
    assert!(matrix.contains("\"execution_backbone\""));
    assert!(matrix.contains("\"name\": \"tilldone\""));
    assert!(matrix.contains("\"scope\": \"anima_execution_runs\""));
    assert!(matrix.contains("\"enabled_for\""));
    assert!(matrix.contains("\"agent_capability_gates\""));
    assert!(matrix.contains("\"anima\""));
    assert!(matrix.contains("\"dispatch_agent\""));
    assert!(matrix.contains("\"run_chain\""));
    assert!(matrix.contains("\"subagent_create\""));
    assert!(matrix.contains("\"tilldone\""));
}

#[test]
fn anima_agent_frontmatter_exposes_gated_team_chain_and_subagent_surface() {
    let root = repo_root();

    let anima =
        fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/anima.md")).unwrap();
    assert!(anima.contains("tools:"));
    for tool in [
        "vak_evaluate",
        "anima_orchestrate",
        "dispatch_agent",
        "dispatch_parallel_agents",
        "dispatch_fusion_agents",
        "run_chain",
        "subagent_create",
        "subagent_continue",
        "subagent_list",
        "subagent_remove",
        "tilldone",
    ] {
        assert!(
            anima.contains(tool),
            "anima frontmatter/body should expose gated tool {tool}"
        );
    }
    assert!(anima.contains("skills:"));
    for skill in [
        "vak-coordinate-frame",
        "vak-evaluate",
        "anima-orchestration",
        "day-night-pass",
    ] {
        assert!(
            anima.contains(skill),
            "anima should expose gated skill {skill}"
        );
    }
}

#[test]
fn anima_ports_pi_pi_meta_agent_and_team_manifest() {
    let root = repo_root();

    for path in [
        "Body/S/S4/pi-agent/agents/pi-pi/pi-orchestrator.md",
        "Body/S/S4/pi-agent/agents/pi-pi/ext-expert.md",
        "Body/S/S4/pi-agent/agents/pi-pi/skill-expert.md",
        "Body/S/S4/pi-agent/agents/pi-pi/tui-expert.md",
        "Body/S/S4/pi-agent/damage-control-rules.yaml",
    ] {
        assert!(root.join(path).exists(), "missing {}", path);
    }

    let pi_pi = fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-4p-anima/S4/pi-pi.ts")).unwrap();
    assert!(pi_pi.contains("name: \"query_experts\""));
    assert!(pi_pi.contains("pi.registerCommand(\"experts\""));
    assert!(pi_pi.contains("pi-orchestrator.md"));
    assert!(pi_pi.contains("childPiRuntimeArgs"));

    let anima =
        fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-4p-anima/extension.ts")).unwrap();
    assert!(anima.contains("./S4/pi-pi.ts"));

    let teams = fs::read_to_string(root.join("Body/S/S4/pi-agent/agents/teams.yaml")).unwrap();
    assert!(teams.contains("pi-pi:"));
    assert!(teams.contains("- ext-expert"));
    assert!(teams.contains("- skill-expert"));
    assert!(teams.contains("- tui-expert"));
}

#[test]
fn copied_runtime_modules_are_augmented_for_ta_onta_paths() {
    let root = repo_root();

    let anima_cross_agent =
        fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-4p-anima/S4/cross-agent.ts")).unwrap();
    assert!(
        !anima_cross_agent.contains("export { default }"),
        "anima cross-agent compatibility file should be a copied source, not a re-export wrapper"
    );
    assert!(
        anima_cross_agent.contains("join(cwd, \".pi\", \"extensions\", \"ta-onta\", \"anima\", \"S4'\", \"agents\")"),
        "anima cross-agent compatibility file should preserve the ta-onta constitutional agent discovery augment"
    );

    let cross_agent =
        fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-0p-khora/S0'/cross-agent.ts")).unwrap();
    assert!(
        cross_agent.contains(
            "join(cwd, \".pi\", \"extensions\", \"ta-onta\", \"anima\", \"S4'\", \"agents\")"
        ),
        "copied cross-agent should discover ta-onta constitutional agents"
    );

    let system_select =
        fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-0p-khora/S0'/system-select.ts"))
            .unwrap();
    assert!(
        system_select.contains(
            "join(cwd, \".pi\", \"extensions\", \"ta-onta\", \"anima\", \"S4'\", \"agents\")"
        ),
        "copied system-select should offer ta-onta constitutional agents as prompt options"
    );

    let pi_pi = fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-4p-anima/S4/pi-pi.ts")).unwrap();
    assert!(
        pi_pi.contains("\".pi\", \"agents\", \"pi-pi\""),
        "copied pi-pi should load the managed runtime expert knowledge base projected from Body/S/S4/pi-agent"
    );

    let damage_control =
        fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-2p-pleroma/S2/damage-control.ts"))
            .unwrap();
    assert!(
        damage_control.contains("\".pi\", \"damage-control-rules.yaml\""),
        "copied damage-control should enforce the managed runtime rules projected from Body/S/S4/pi-agent"
    );
}

#[test]
fn ta_onta_extensions_avoid_stale_cli_contracts() {
    let root = repo_root();
    for path in [
        "Body/S/S4/ta-onta/S4-1p-hen/extension.ts",
        "Body/S/S4/ta-onta/S4-3p-chronos/extension.ts",
        "Body/S/S4/ta-onta/S4-4p-anima/extension.ts",
        "Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts",
        "Body/S/S4/ta-onta/S4-5p-aletheia/modules/hen-integration.ts",
        "Body/S/S4/ta-onta/S4-5p-aletheia/modules/chronos-integration.ts",
    ] {
        let source = fs::read_to_string(root.join(path)).unwrap();
        assert!(
            !source.contains("spawnSync(\"obsidian\""),
            "{path} still shells out through the raw obsidian binary"
        );
        assert!(
            !source.contains("\"vault\", \"sync-status\""),
            "{path} still calls the non-existent vault sync-status command"
        );
        assert!(
            !source.contains("\"vault\", \"kairos-status\""),
            "{path} still calls the non-existent vault kairos-status command"
        );
        assert!(
            !source.contains("\"vault\", \"seed-read\""),
            "{path} still calls the non-existent vault seed-read command"
        );
        assert!(
            !source.contains("\"graph\", \"query\", \"--coordinate\""),
            "{path} still uses the invalid graph query flag contract"
        );
        assert!(
            !source.contains("\"agent\", \"spawn\", \"--list\""),
            "{path} still uses the invalid agent spawn list contract"
        );
        assert!(
            !source.contains("\"agent\", \"spawn\", \"--continue\""),
            "{path} still uses the invalid agent spawn continue contract"
        );
        assert!(
            !source.contains("\"agent\", \"spawn\", \"--remove\""),
            "{path} still uses the invalid agent spawn remove contract"
        );
        assert!(
            !source.contains("\"techne\", \"gnosis\", \"crystallise\""),
            "{path} still calls the non-existent gnosis crystallise command"
        );
        assert!(
            !source.contains("\"techne\", \"gnosis\", \"notebook\",\n        \"--session-id\""),
            "{path} still uses the invalid gnosis notebook flag contract"
        );
    }

    let hen = fs::read_to_string(root.join("Body/S/S4/ta-onta/S4-1p-hen/extension.ts")).unwrap();
    assert!(
        hen.contains("\"vault\", \"now-path\""),
        "hen should use the real vault now-path helper for NOW task routing"
    );
}

fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .nth(4)
        .expect("epi-cli manifest should live under Body/S/S0/epi-cli")
        .to_path_buf()
}
