#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const datasetsRoot = path.join(repoRoot, "docs/datasets");
const outputDir = path.join(repoRoot, "Body/S/S5/epi-gnostic/cypher/generated");

const branches = [
  ["m0", "anuttara-deep", "nodes-full-data.json"],
  ["m1", "paramasiva-deep", "nodes-full-detail.json"],
  ["m2", "parashakti-deep", "nodes-full-detail.json"],
  ["m3", "mahamaya-deep", "nodes-full-detail.json"],
  ["m4", "nara-deep", "nodes-full-detail.json"],
  ["m5", "epii-deep", "nodes-full-details.json"],
];

const registeredTargets = new Set([
  "coordinate",
  "c_0_core_nature",
  "c_0_essence",
  "c_1_name",
  "c_1_description",
  "c_1_structure",
  "c_3_updated_at",
  "c_3_context_frame",
  "c_4_access_level",
  "c_4_ql_category",
  "c_4_ql_operator_types",
  "c_5_resonances",
  "p_1_variant",
  "p_1_weave",
  "p_1_position_id",
  "p_1_stage_id",
  "p_3_sequence",
  "l_2_therapeutic_properties",
  "l_2_temperament_balance",
  "l_2_healing_specialty",
  "l_2_chakra_correspondence",
  "l_2_breath_pattern",
  "l_4_mef_condition",
  "l_4_interpretive_role",
  "s_4_function_role",
  "s_4_input_contracts",
  "s_4_output_contracts",
  "s_4_queryable_properties",
  "s_5_agent",
  "s_5_tool_affinity",
  "t_1_epistemic_function",
  "t_5_next_evolution_phase",
  "q_1_theoretical_thesis",
  "q_2_sophia_logos_dialectic",
  "q_2_instantiation_mode",
  "q_3_dialectical_movement",
  "q_4_historical_diagnosis",
  "q_5_integration_template",
  "q_5_conjunctive_threshold",
  "m_1_topological_significance",
  "m_2_abjad_value",
  "m_3_degree",
  "m_4_two_stroke_doctrine",
  "m_5_lacanian_interface",
]);

const stringListTargets = new Set([
  "c_4_ql_operator_types",
  "c_5_resonances",
  "l_2_therapeutic_properties",
  "s_5_tool_affinity",
]);

const mappings = {
  c: {
    name: "c_1_name",
    description: "c_1_description",
    coreNature: "c_0_core_nature",
    operationalEssence: "c_0_essence",
    internalStructure: "c_1_structure",
    lastUpdated: "c_3_updated_at",
    updatedAt: "c_3_updated_at",
    updated_at: "c_3_updated_at",
    contextFrame: "c_3_context_frame",
    qlCategory: "c_4_ql_category",
    qlOperatorTypes: "c_4_ql_operator_types",
    accessLevel: "c_4_access_level",
    resonances: "c_5_resonances",
    qlVariant: "c_4_ql_variant",
    qlPositionWeave: "c_4_ql_position_weave",
    positionId: "c_2_position_id",
    stageId: "c_2_stage_id",
    sequence: "c_3_sequence",
    primaryDesignation: "c_1_primary_designation",
    completeFormulation: "c_1_complete_formulation",
    formulationBreakdown: "c_1_formulation_breakdown",
    architecturalFunction: "c_1_architectural_function",
    keyPrinciples: "c_1_key_principles",
    practicalApplications: "c_3_practical_applications",
    relatedCoordinates: "c_3_related_coordinates",
  },
  p: {},
  l: {
    therapeuticProperties: "l_2_therapeutic_properties",
    temperamentBalance: "l_2_temperament_balance",
    healingSpecialty: "l_2_healing_specialty",
    chakraCorrespondence: "l_2_chakra_correspondence",
    breathPattern: "l_2_breath_pattern",
    mefCondition: "l_4_mef_condition",
    interpretiveRole: "l_4_interpretive_role",
    elementalNature: "l_2_elemental_nature",
    seasonalPosition: "l_3_seasonal_position",
    modality: "l_4_modality",
    reflectionTable: "l_4_reflection_table",
  },
  s: {
    f_role: "s_4_function_role",
    f_inputContracts: "s_4_input_contracts",
    f_outputContracts: "s_4_output_contracts",
    f_queryableProperties: "s_4_queryable_properties",
    f_agent: "s_5_agent",
    f_tool_affinity: "s_5_tool_affinity",
    f_description: "s_4_function_description",
    f_translationSchema: "s_4_translation_schema",
    f_system_prompt: "s_5_system_prompt",
    f_capabilities: "s_5_capabilities",
    safetyClass: "s_4_safety_class",
    eligibleFormats: "s_4_eligible_formats",
  },
  t: {
    epistemicFunction: "t_1_epistemic_function",
    nextEvolutionPhase: "t_5_next_evolution_phase",
    developmentalStage: "t_3_developmental_stage",
    processRealization: "t_3_process_realization",
  },
  q: {
    q_theoreticalThesis: "q_1_theoretical_thesis",
    q_sophiaLogosDialectic: "q_2_sophia_logos_dialectic",
    q_instantiationMode: "q_2_instantiation_mode",
    q_dialecticalMovement: "q_3_dialectical_movement",
    q_historicalDiagnosis: "q_4_historical_diagnosis",
    q_integrationTemplate: "q_5_integration_template",
    q_conjunctiveThreshold: "q_5_conjunctive_threshold",
  },
  m_prime: {
    topologicalSignificance: "m_1_topological_significance",
    abjadValue: "m_2_abjad_value",
    degree: "m_3_degree",
    twoStrokeDoctrine: "m_4_two_stroke_doctrine",
    lacanianPublicInterface: "m_5_lacanian_interface",
    consciousnessOperation: "m_0_consciousness_operation",
    consciousnessFunction: "m_0_consciousness_function",
    grammaticalFunction: "m_0_grammatical_function",
    spandaRelationship: "m_0_spanda_relationship",
    topologicalFormula: "m_1_topological_formula",
    processualTopologyRole: "m_1_processual_topology_role",
    matrixType: "m_1_matrix_type",
    constructionPhase: "m_1_construction_phase",
    arabicText: "m_2_arabic_text",
    trilateralRoot: "m_2_trilateral_root",
    dhikrApplication: "m_2_dhikr_application",
    recitationCount: "m_2_recitation_count",
    zodiacalInfluence: "m_2_zodiacal_influence",
    therapeuticCluster: "m_2_therapeutic_cluster",
    quadrant: "m_3_quadrant",
    rotationalPhase: "m_3_rotational_phase",
    yinYangBalance: "m_3_yin_yang_balance",
    aminoAcidCode: "m_3_amino_acid_code",
    temporalStructure: "m_4_temporal_structure",
    temporalIntelligenceLayer: "m_4_temporal_intelligence_layer",
    whiteheadLacanSynthesis: "m_5_whitehead_lacanian",
    lacanianEtymologicalArchaeology: "m_5_archaeology_method",
  },
};

function sanitizeJson(text) {
  let result = "";
  let inString = false;
  let escaped = false;

  for (const char of text.replace(/^\uFEFF/, "")) {
    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }

    if (char === "\\") {
      result += char;
      escaped = true;
      continue;
    }

    if (char === "\"") {
      inString = !inString;
      result += char;
      continue;
    }

    if (inString && char === "\n") {
      result += "\\n";
      continue;
    }

    if (inString && char === "\r") {
      result += "\\r";
      continue;
    }

    if (inString && char === "\t") {
      result += "\\t";
      continue;
    }

    result += char;
  }

  return result;
}

function mCoordinate(coordinate) {
  if (coordinate === "#") return "M";
  if (coordinate.startsWith("#")) return `M${coordinate.slice(1)}`;
  return coordinate;
}

function cypherString(value) {
  return `'${String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

function cypherLiteral(value, target) {
  if (value === null || value === undefined) return null;
  if (stringListTargets.has(target)) {
    const values = Array.isArray(value) ? value : String(value).split(",").map((item) => item.trim());
    const items = values.filter((item) => String(item).trim() !== "").map((item) => cypherString(item));
    return `[${items.join(", ")}]`;
  }
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : null;
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) {
    const items = value
      .map((item) => (typeof item === "number" ? String(item) : cypherString(item)))
      .filter(Boolean);
    return `[${items.join(", ")}]`;
  }
  if (typeof value === "object") return cypherString(JSON.stringify(value));
  if (String(value).trim() === "") return null;
  return cypherString(value);
}

function blockForNode(coordinate, sourceBranch, assignments) {
  const executable = assignments.filter((item) => registeredTargets.has(item.target));
  const proposed = assignments.filter((item) => !registeredTargets.has(item.target));
  const lines = [
    `// ${coordinate} | ${sourceBranch} | ${executable.length} registered, ${proposed.length} proposed`,
    `MERGE (n:Bimba { coordinate: ${cypherString(coordinate)} })`,
  ];

  if (executable.length > 0) {
    lines.push("SET n += {");
    executable.forEach((item, index) => {
      lines.push(`  ${item.target}: ${item.literal}${index === executable.length - 1 ? "" : ","}`);
    });
    lines.push("}");
  }

  for (const item of proposed) {
    lines.push(`// PROPOSED_REVIEW ${item.target}: ${item.literal} // from ${item.sourceKey}`);
  }

  lines.push(";");
  return `${lines.join("\n")}\n`;
}

function readNodes(branchDir, fileName) {
  const filePath = path.join(datasetsRoot, branchDir, fileName);
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(sanitizeJson(raw));
  return Array.isArray(parsed) ? parsed : parsed.nodes ?? [parsed];
}

fs.mkdirSync(outputDir, { recursive: true });

const outputs = new Map(Object.keys(mappings).map((region) => [region, []]));
const summary = [];

for (const [branchId, branchDir, fileName] of branches) {
  const nodes = readNodes(branchDir, fileName);
  const branchCounts = Object.fromEntries(Object.keys(mappings).map((region) => [region, 0]));

  for (const node of nodes) {
    const props = node.filteredProps ?? node.filtered_props ?? {};
    const coordinate = mCoordinate(node.coordinate ?? props.bimbaCoordinate);
    if (!coordinate) continue;

    for (const [region, regionMappings] of Object.entries(mappings)) {
      const assignments = [];
      const seenTargets = new Set();

      for (const [sourceKey, target] of Object.entries(regionMappings)) {
        if (!Object.hasOwn(props, sourceKey) || seenTargets.has(target)) continue;
        const literal = cypherLiteral(props[sourceKey], target);
        if (!literal) continue;
        assignments.push({ sourceKey, target, literal });
        seenTargets.add(target);
      }

      if (assignments.length === 0) continue;
      branchCounts[region] += 1;
      outputs.get(region).push(blockForNode(coordinate, branchId, assignments));
    }
  }

  summary.push(`${branchId}: ${nodes.length} nodes | ${Object.entries(branchCounts).map(([k, v]) => `${k}=${v}`).join(", ")}`);
}

for (const [region, blocks] of outputs.entries()) {
  const filePath = path.join(outputDir, `deep-regional-${region}.cypher`);
  const header = [
    "// GENERATED REVIEW FILE. Do not execute wholesale without human approval.",
    `// Region: ${region}`,
    `// Generated at: ${new Date().toISOString()}`,
    "",
  ].join("\n");
  fs.writeFileSync(filePath, `${header}${blocks.join("\n")}`);
}

console.log(`Generated regional Cypher review files in ${path.relative(repoRoot, outputDir)}`);
for (const line of summary) console.log(line);
