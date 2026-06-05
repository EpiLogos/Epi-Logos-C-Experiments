// M2-1 direct L/L' branch migration.
// Purpose:
// - Port the existing rich sixfold M2-1-* branches into canonical L/L' coordinates.
// - Remove only the old lightweight flat L placeholders that block coordinate uniqueness.
// - Create the six missing full six-node lens branches.
// - Attach all twelve full lens branches to M2-1.
// - Lens child coordinates use branch syntax: Lx-y / Lx-y' (not dotted Lx.y).

MATCH (n:Bimba)
WHERE n.coordinate IN [
  "L0","L1","L2","L3","L4","L5",
  "L0'","L1'","L2'","L3'","L4'","L5'"
]
DETACH DELETE n;

MERGE (lroot:Bimba {coordinate: "L"})
SET lroot:Coordinate:LensFamily,
    lroot.c_1_name = "L Day Lens Family",
    lroot.c_1_description = "Day MEF lens family L0-L5; each lens is a full six-node branch attached to M2-1.",
    lroot.coordinate_parent = "M2-1",
    lroot.coordinate_axis = "direct",
    lroot.c_4_family = "L",
    lroot.sync_status = "m2_1_l_lprime_direct_port",
    lroot.sync_version = "m2-1-l-lprime-direct-port-2026-06-03";

MERGE (liroot:Bimba {coordinate: "L'"})
SET liroot:Coordinate:LensFamily,
    liroot.c_1_name = "L' Night Lens Family",
    liroot.c_1_description = "Night/prime MEF lens family L0'-L5'; each lens is a full six-node branch attached to M2-1.",
    liroot.coordinate_parent = "M2-1",
    liroot.coordinate_axis = "prime",
    liroot.c_4_family = "L",
    liroot.sync_status = "m2_1_l_lprime_direct_port",
    liroot.sync_version = "m2-1-l-lprime-direct-port-2026-06-03";

MATCH (m21:Bimba {coordinate: "M2-1"})
MATCH (lroot:Bimba {coordinate: "L"})
MATCH (liroot:Bimba {coordinate: "L'"})
MERGE (m21)-[:HAS_LENS_FAMILY]->(lroot)
MERGE (m21)-[:HAS_LENS_FAMILY]->(liroot);

WITH [
  {old:"M2-1-0", new:"L0'", name:"Archetypal-Numerical", parent:"L'", axis:"prime", idx:6, base:0, square:"A"},
  {old:"M2-1-1", new:"L1", name:"Causal", parent:"L", axis:"direct", idx:1, base:1, square:"B"},
  {old:"M2-1-2", new:"L2", name:"Logical", parent:"L", axis:"direct", idx:2, base:2, square:"C"},
  {old:"M2-1-3", new:"L3", name:"Processual", parent:"L", axis:"direct", idx:3, base:3, square:"C"},
  {old:"M2-1-4", new:"L4", name:"Phenomenological", parent:"L", axis:"direct", idx:4, base:4, square:"B"},
  {old:"M2-1-5", new:"L5", name:"Para Vak", parent:"L", axis:"direct", idx:5, base:5, square:"A"}
] AS ports
UNWIND ports AS port
MATCH (lens:Bimba {coordinate: port.old})
SET lens:Coordinate:Lens:MEFLens,
    lens.c_1_legacy_name = lens.c_1_name,
    lens.coordinate = port.new,
    lens.c_1_name = port.name,
    lens.coordinate_parent = port.parent,
    lens.coordinate_axis = port.axis,
    lens.c_4_family = "L",
    lens.c_4_ql_position = port.base,
    lens.l_0_index_12 = port.idx,
    lens.l_0_base_index_6 = port.base,
    lens.l_0_klein_square = port.square,
    lens.l_0_subposition_count = 6,
    lens.m_2_1_prior_coordinate = port.old,
    lens.sync_status = "m2_1_l_lprime_direct_port",
    lens.sync_version = "m2-1-l-lprime-direct-port-2026-06-03"
WITH port, lens
MATCH (parent:Bimba {coordinate: port.parent})
MATCH (m21:Bimba {coordinate: "M2-1"})
MERGE (parent)-[:CONTAINS]->(lens)
MERGE (m21)-[:REPRESENTS_LENS]->(lens);

WITH [
  {old:"M2-1-0", new:"L0'", axis:"prime", idx:6, base:0, square:"A"},
  {old:"M2-1-1", new:"L1", axis:"direct", idx:1, base:1, square:"B"},
  {old:"M2-1-2", new:"L2", axis:"direct", idx:2, base:2, square:"C"},
  {old:"M2-1-3", new:"L3", axis:"direct", idx:3, base:3, square:"C"},
  {old:"M2-1-4", new:"L4", axis:"direct", idx:4, base:4, square:"B"},
  {old:"M2-1-5", new:"L5", axis:"direct", idx:5, base:5, square:"A"}
] AS ports
UNWIND ports AS port
UNWIND range(0, 5) AS pos
MATCH (condition:Bimba {coordinate: port.old + "-" + toString(pos)})
MATCH (lens:Bimba {coordinate: port.new})
SET condition:Coordinate:LensCondition:MEFSubLens,
    condition.coordinate = CASE
      WHEN port.axis = "prime" THEN replace(port.new, "'", "") + "-" + toString(pos) + "'"
      ELSE port.new + "-" + toString(pos)
    END,
    condition.coordinate_parent = port.new,
    condition.coordinate_axis = port.axis,
    condition.c_4_family = "L",
    condition.c_4_ql_position = pos,
    condition.l_0_lens_index_12 = port.idx,
    condition.l_0_base_index_6 = port.base,
    condition.l_0_position_index = pos,
    condition.l_0_flat_index = port.idx * 6 + pos,
    condition.l_0_klein_square = port.square,
    condition.m_2_1_prior_coordinate = port.old + "-" + toString(pos),
    condition.sync_status = "m2_1_l_lprime_direct_port",
    condition.sync_version = "m2-1-l-lprime-direct-port-2026-06-03"
MERGE (lens)-[:HAS_INTERNAL_POSITION]->(condition);

WITH [
  {
    coord:"L0", name:"Quaternal", parent:"L", axis:"direct", idx:0, base:0, square:"A",
    description:"Quaternal/QL lens: primordial question-space where archetypal number becomes epistemic act.",
    positions:[
      ["Why / Insofar-as", "Presuppositional quantum of shared context before inquiry begins."],
      ["What", "Definitional question establishing identity and first boundary."],
      ["How", "Operational question introducing relation, dynamics, and process."],
      ["Whom / Which / When", "Pattern-identifying question seeking formal architecture and type."],
      ["Where / When / Why-four", "Contextual question where inquiry asks about its own conditions."],
      ["Why-so / Why-not", "Integrative pros-hen question relating multiple meanings to one focal structure."]
    ]
  },
  {
    coord:"L1'", name:"Phenomenal", parent:"L'", axis:"prime", idx:7, base:1, square:"B",
    description:"Phenomenal lens: subjective immediacy of experience through Jungian psychic functions.",
    positions:[
      ["Introversion", "Inward orientation of consciousness toward internal objects and the unconscious pole."],
      ["Sensation", "Immediate perception and registration of thereness."],
      ["Feeling", "Evaluative function assigning worth and affective valence."],
      ["Thinking", "Analytical function classifying what kind of thing this is."],
      ["Intuition", "Perceptive function grasping possibilities and hidden connections."],
      ["Extroversion", "Outward orientation of consciousness toward external objects and world-investment."]
    ]
  },
  {
    coord:"L2'", name:"Alchemical-Elemental", parent:"L'", axis:"prime", idx:8, base:2, square:"C",
    description:"Alchemical-elemental lens: elemental transformation, union of opposites, and assignment of elemental charge.",
    positions:[
      ["Aether", "Quintessence, prima materia and ultima materia as psychoid ground of transformation."],
      ["Earth", "Solidity, resistance, form, corpus, nigredo, fixed principle."],
      ["Water", "Fluidity, dissolution, feeling, aqua permanens, unconscious/emotional medium."],
      ["Air", "Thought, breath, connection, sublimatio, volatile principle."],
      ["Fire", "Transmutation, energy, will, calcinatio, transformative heat."],
      ["Mineral", "Lapis philosophorum, matter perfected through the alchemical work."]
    ]
  },
  {
    coord:"L3'", name:"Chronological", parent:"L'", axis:"prime", idx:9, base:3, square:"C",
    description:"Chronological lens: macro-temporal dialectic of Spirit moving through history.",
    positions:[
      ["Spirit / Geist", "Self-moving totality; the living process history is."],
      ["Spring", "Birth and emergence; thesis as first positing of Spirit's expression."],
      ["Summer", "Fullness and flourishing before contradiction appears."],
      ["Autumn", "Decline, harvest, wisdom; culture encountering its own limits."],
      ["Winter", "Death, dormancy, incubation; negation that gestates the next cycle."],
      ["Life", "Aufhebung: the whole seasonal cycle recognized as living spiral."]
    ]
  },
  {
    coord:"L4'", name:"Scientific", parent:"L'", axis:"prime", idx:10, base:4, square:"B",
    description:"Scientific lens: current-state to ideal-state movement through verifiable iteration.",
    positions:[
      ["Observe / Questions", "Gather context and establish current state."],
      ["Think / Traces", "Form hypotheses and imagine ideal state."],
      ["Plan / Challenges", "Choose method and sequence around resistance."],
      ["Build / Patterns", "Construct criteria, harnesses, and validation rules."],
      ["Execute / Discovery", "Conduct the experiment or intervention."],
      ["Verify / Insight", "Test results against criteria and crystallize or recurse."]
    ]
  },
  {
    coord:"L5'", name:"Divine Logos", parent:"L'", axis:"prime", idx:11, base:5, square:"A",
    description:"Divine Logos lens: personal, incarnational, historical dimension of divine speech.",
    positions:[
      ["Arche", "Originary ground: beginning, principle, and sovereignty of Logos."],
      ["Apokalypsis", "Revelation and unveiling as divine self-disclosure."],
      ["Dynamis", "Creative power of the speech-act, fiat lux."],
      ["Sophia", "Divine wisdom as formal cause within the creative Logos."],
      ["Parousia", "Presence: the Word made flesh and universal becoming particular."],
      ["Epi-Logos", "Word beyond words; resurrectional return from Logos into renewed ground."]
    ]
  }
] AS missing
UNWIND missing AS lensData
MERGE (lens:Bimba {coordinate: lensData.coord})
SET lens:Coordinate:Lens:MEFLens,
    lens.c_1_name = lensData.name,
    lens.c_1_description = lensData.description,
    lens.coordinate_parent = lensData.parent,
    lens.coordinate_axis = lensData.axis,
    lens.c_4_family = "L",
    lens.c_4_ql_position = lensData.base,
    lens.l_0_index_12 = lensData.idx,
    lens.l_0_base_index_6 = lensData.base,
    lens.l_0_klein_square = lensData.square,
    lens.l_0_subposition_count = 6,
    lens.sync_status = "m2_1_l_lprime_direct_port",
    lens.sync_version = "m2-1-l-lprime-direct-port-2026-06-03"
WITH lensData, lens
MATCH (parent:Bimba {coordinate: lensData.parent})
MATCH (m21:Bimba {coordinate:"M2-1"})
MERGE (parent)-[:CONTAINS]->(lens)
MERGE (m21)-[:REPRESENTS_LENS]->(lens)
WITH lensData, lens
UNWIND range(0, 5) AS pos
WITH lensData, lens, pos, lensData.positions[pos] AS p
MERGE (condition:Bimba {coordinate: CASE
  WHEN lensData.axis = "prime" THEN replace(lensData.coord, "'", "") + "-" + toString(pos) + "'"
  ELSE lensData.coord + "-" + toString(pos)
END})
SET condition:Coordinate:LensCondition:MEFSubLens,
    condition.c_1_name = p[0],
    condition.c_1_description = p[1],
    condition.coordinate_parent = lensData.coord,
    condition.coordinate_axis = lensData.axis,
    condition.c_4_family = "L",
    condition.c_4_ql_position = pos,
    condition.l_0_lens_index_12 = lensData.idx,
    condition.l_0_base_index_6 = lensData.base,
    condition.l_0_position_index = pos,
    condition.l_0_flat_index = lensData.idx * 6 + pos,
    condition.l_0_klein_square = lensData.square,
    condition.sync_status = "m2_1_l_lprime_direct_port",
    condition.sync_version = "m2-1-l-lprime-direct-port-2026-06-03"
MERGE (lens)-[:HAS_INTERNAL_POSITION]->(condition);

WITH [
  ["L0", "L0'", "#0"],
  ["L1", "L1'", "#1"],
  ["L2", "L2'", "#2"],
  ["L3", "L3'", "#3"],
  ["L4", "L4'", "#4"],
  ["L5", "L5'", "#5"]
] AS pairs
UNWIND pairs AS pair
MATCH (day:Bimba {coordinate: pair[0]})
MATCH (night:Bimba {coordinate: pair[1]})
MATCH (bedrock:Bimba {coordinate: pair[2]})
MERGE (day)-[:INVERTS_TO]->(night)
MERGE (day)-[:BEDROCK]->(bedrock)
MERGE (night)-[:BEDROCK]->(bedrock)
MERGE (bedrock)-[:MANIFESTS]->(day)
MERGE (bedrock)-[:MANIFESTS]->(night)
WITH day, night
MATCH (family:Bimba {coordinate:"Family_L"})
MERGE (family)-[:FAMILY_CONTAINS]->(day)
MERGE (family)-[:FAMILY_CONTAINS]->(night);

MATCH (m21:Bimba {coordinate:"M2-1"})-[r:REPRESENTS_LENS]->(lens:Bimba)
WHERE lens.coordinate STARTS WITH "L"
RETURN count(DISTINCT lens) AS canonical_lens_count;
