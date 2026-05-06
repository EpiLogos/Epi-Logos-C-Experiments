---
coordinate: "S1'"
c_4_artifact_role: "flow"
c_1_ct_type: "CT4a"
c_3_created_at: "2026-04-25T00:00:00Z"
c_3_day_id: "25-04-2026"
c_3_ctx_frame: "5/0"
c_0_source_coordinates:
  - "[[FLOW 2026 04 24 PI AGENT API v0.1]]"
  - "[[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]]"
  - "[[FLOW 2026 04 24 ANIMA EPII ARCHITECTURE]]"
  - "[[S4']]"
  - "[[S5']]"
  - "[[S1']]"
---

# FLOW 2026 04 25 TS INTERFACE DEFINITIONS

> Canonical TypeScript type definitions for the Epi-Logos PI Agent API. Types the 100 methods from API v0.1 plus 8 additional methods needed to cover envelope field gaps. Organised by S/S' coordinate pair. These types are the shared type package used by both [[Anima]] and [[Epii]].

**Cross-reference:** Every type maps to envelope fields from [[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]]. Envelope field references are noted in comments as `// EF:{layer}.{field_name}`. Field renames and additions from [[FLOW 2026 04 24 ANIMA EPII ARCHITECTURE]] (S3' unification, s_3_agent_id) are applied.

---

## SharedTypes — Coordinate Primitives and Wire Protocol

```typescript
// ============================================================
// COORDINATE PRIMITIVES
// ============================================================

/** The six coordinate families */
type CoordinateFamily = "P" | "S" | "T" | "M" | "L" | "C";

/** Raw archetype position (0-5) */
type ArchetypePosition = 0 | 1 | 2 | 3 | 4 | 5;

/** Coordinate string: "S4'", "M2-3", "#4.4.4.4", "C0", etc. */
type CoordinateString = string;

/** S-coordinate layer (base or prime) */
type SLayer = "S0" | "S1" | "S2" | "S3" | "S4" | "S5";
type SPrimeLayer = "S0'" | "S1'" | "S2'" | "S3'" | "S4'" | "S5'";

/** The four topological modalities */
type TopologicalMode = "0-sphere" | "torus" | "lemniscate" | "klein_bottle";

/** QL modal variants */
type QLModal = "mod2" | "mod3" | "mod4" | "mod6" | "mod%";

/** Context frame variants — the () operator instantiations */
type ContextFrameVariant =
  | "(00/00)"    // Mod % — Receptive Dynamism
  | "(0/1)"      // Mod 2 — Non-dual binary
  | "(0/1/2)"    // Mod 3 — The Trika
  | "(0/1/2/3)"  // Mod 4 — Three Plus One
  | "(4.0/1-4.4/5)" // Mod 4/6 — Fractal doubling
  | "(5/0)";     // Mod 6 — Mobius return

/** Constitutional agent names */
type ConstitutionalAgent =
  | "nous" | "logos" | "eros" | "mythos"
  | "anima" | "psyche" | "sophia";

/** Aletheia subagent cluster names */
type AletheiaCluster =
  | "anansi" | "janus" | "moirai"
  | "mercurius" | "agora" | "zeithoven";

/** CT content-type levels */
type CTLevel =
  | "CT0" | "CT1" | "CT2" | "CT3"
  | "CT4a" | "CT4b'" | "CT5";

/** CP context-position (P-family) */
type CPPosition = "P0" | "P1" | "P2" | "P3" | "P4" | "P5";

/** MEF lens identifiers */
type MEFLens =
  | "L0" | "L1" | "L2" | "L3" | "L4" | "L5"
  | "L0'" | "L1'" | "L2'" | "L3'" | "L4'" | "L5'";

/** CS state machine positions */
type CSPosition = 0 | 1 | 2 | 3 | 4 | 5;
type CSLabel = "CS0" | "CS1" | "CS2" | "CS3" | "CS4" | "CS5";
type CSDirectionality = "day" | "night_prime";

/** Dialectical polarity */
type DialecticalPolarity = "yin" | "yang";

/** Disclosure density levels */
type DisclosureDensity = "minimal" | "standard" | "rich";

/** Cost tier for envelope assembly */
type CostTier = "hot" | "warm" | "cold";

/** Agent identifiers */
type AgentId = "anima" | "epii" | string;

// ============================================================
// WIRE PROTOCOL
// ============================================================

/** Base request frame (gateway wire protocol v3) */
interface WireRequest {
  type: "req";
  id: number;
  method: string;
  params: Record<string, unknown>;
}

/** Base response frame */
interface WireResponse {
  type: "res";
  id: number;
  result: unknown;
  error?: { code: number; message: string };
}

/** Event push frame */
interface WireEvent {
  type: "event";
  event: string;
  payload: Record<string, unknown>;
}

/** Async acknowledgement (for methods returning futures) */
interface AsyncAck {
  ack_id: string;
  status: "routed" | "queued";
}

/** Async result (delivered via event channel) */
interface AsyncResult<T = unknown> {
  method: string;
  result: T;
  error?: { code: number; message: string };
}

// ============================================================
// COORDINATE CONTEXT (shared across many methods)
// ============================================================

/** Full coordinate context — used in cross-agent queries and vak evaluation */
interface CoordinateContext {
  primary_family: CoordinateFamily;           // EF:4.c_4_primary_family
  primary_coordinate: CoordinateString;       // EF:4.c_4_primary_coordinate
  cf_frame: ContextFrameVariant;              // EF:4.c_4_cf
  ql_modal: QLModal;                          // EF:12.c_3_ql_modal
  topological_mode: TopologicalMode;          // EF:12.c_4_topological_mode
  cycle_position: ArchetypePosition;          // EF:12.c_3_ql_cycle_position
  inversion_state: boolean;                   // EF:12.c_5_inversion_state
}

// ============================================================
// MODAL STRUCTURES (QL variants)
// ============================================================

type ModalStructure =
  | { mode: "mod2"; frame: "(0/1)"; positions: [string, string] }
  | { mode: "mod3"; frame: "(0/1/2)"; positions: [string, string, string] }
  | { mode: "mod4"; frame: "(0/1/2/3)"; positions: [string, string, string, string] }
  | { mode: "mod6"; frame: "(0-5)"; positions: [string, string, string, string, string, string] }
  | { mode: "mod%"; frame: "(00/00)"; positions: [] };
```

---

## EnvelopeTypes — The 12-Layer Envelope Structure

```typescript
// ============================================================
// THE FULL ENVELOPE — 118 fields across 12 layers
// Base: FLOW 2026 04 22 ENVELOPE FIELD SCHEMA updated for Body/S build readiness
// + s_3_agent_id from FLOW 2026 04 24 ANIMA EPII ARCHITECTURE
// + s_5_review_inbox_item and s_5_review_resolution for Epii review governance
// Redis and Graphiti fields updated per S3' unification
// ============================================================

/** Layer 1: Transport — carriage, not meaning */
interface TransportLayer {
  s_3_session_key: string;                    // EF:1
  s_3_session_id: string;                     // EF:1
  s_3_agent_id: AgentId;                      // EF:1 — per Anima/Epii architecture
  s_3_request_id: string;                     // EF:1
  s_3_requester: string;                      // EF:1
  s_3_channel: string;                        // EF:1
  s_3_thread_scope: string | null;            // EF:1
  s_3_target_agent: AgentId | null;           // EF:1
  s_3_history_limit: number;                  // EF:1
  s_3_patch_lineage: string[];                // EF:1
  s_3_protocol_version: number;               // EF:1
}

/** Layer 2: Runtime — execution substrate */
interface RuntimeLayer {
  s_4_bootstrap_context: string;              // EF:2
  s_0_workspace_root: string;                 // EF:2
  s_3_session_store_handle: string;           // EF:2
  s_4_permission_boundary: PermissionBoundary; // EF:2
  s_0_tool_surface: ToolSurface;              // EF:2
  s_4_observability_mode: "verbose" | "headless" | "debug"; // EF:2
  s_0_terminal_substrate: string;             // EF:2
  s_0_env_config: Record<string, string>;     // EF:2
  s_3_app_surface: string | null;             // EF:2 (cold)
}

/** Layer 3: Temporal — when this run is */
interface TemporalLayer {
  s_3_day_id: string;                         // EF:3
  s_4_now_id: string | null;                  // EF:3
  s_4_now_path: string | null;                // EF:3
  s_3_session_start: number;                  // EF:3 (epoch ms)
  s_5_session_close: number | null;           // EF:3 (epoch ms; home moved to S3')
  s_5_archive_status: "active" | "archived" | "pending"; // EF:3
  s_4_continuation_status: "fresh" | "continued" | "compacted"; // EF:3
  s_3_arc_membership: ArcSummary[];           // EF:3 (cold; S3' temporal runtime, S5 governs use)
  s_4_cron_lineage: string | null;            // EF:3 (cold)
  s_3_kairos_tick: KairosSnapshot | null;     // EF:3 (cold)
  s_4_temporal_horizon: string | null;        // EF:3 (cold)
}

/** Layer 4: Coordinate — ontological targeting */
interface CoordinateLayer {
  c_4_primary_family: CoordinateFamily;       // EF:4
  c_4_primary_coordinate: CoordinateString;   // EF:4
  c_5_prime_targets: CoordinateString[];      // EF:4
  c_4_sub_targets: CoordinateString[];        // EF:4 (cold)
  c_3_cpf: ContextFrameVariant;              // EF:4
  c_1_ct: CTLevel;                            // EF:4
  c_4_cp: CPPosition;                         // EF:4 (cold)
  c_4_cf: ContextFrameVariant;               // EF:4 (cold)
  c_4_cfp: string | null;                     // EF:4 (cold)
  c_4_cs: CSLabel;                            // EF:4 (cold)
  l_4_guardrail_families: CoordinateFamily[]; // EF:4 (cold)
  c_5_residue_families: CoordinateFamily[];   // EF:4 (cold)
  c_5_manifestation_families: CoordinateFamily[]; // EF:4 (cold)
}

/** Layer 5: Residency — where things go */
interface ResidencyLayer {
  s_1_target_vault_zone: VaultZone;           // EF:5
  s_1_target_residency_class: ResidencyClass; // EF:5
  s_1_artifact_ct_type: CTLevel;              // EF:5
  s_1_typification_state: string | null;      // EF:5 (cold)
  c_0_source_coordinates: CoordinateString[]; // EF:5 (cold)
  s_1_graduation_path: string | null;         // EF:5 (cold)
  s_2_sync_destination: string | null;        // EF:5 (cold)
}

/** Layer 6: Context-Economy — assembled informational pool */
interface ContextEconomyLayer {
  s_2_source_set: string[];                   // EF:6
  s_2_retrieval_mode: RetrievalMode;          // EF:6
  s_3_context_key: string;                    // EF:6 — was s_2_redis_context_key, moved to S3' per unified temporal runtime
  s_2_scope_coordinates: CoordinateString[];  // EF:6
  s_2_disclosure_density: DisclosureDensity;  // EF:6
  s_2_project_horizon: string | null;         // EF:6 (cold)
  s_2_graph_region_handles: string[];         // EF:6 (cold)
  s_3_episodic_handles: string[];             // EF:6 (cold) — was s_2_episodic_handles, moved to S3'
  s_5_anansi_web: string | null;              // EF:6 (cold)
  s_2_kbase_pool_id: string | null;           // EF:6 (cold)
}

/** Layer 7: Lived-Environs — Psyche's domain */
interface LivedEnvironsLayer {
  s_4_active_context_pack: ContextPack;       // EF:7
  s_4_operative_notebook: string | null;      // EF:7
  s_4_current_task: string | null;            // EF:7
  s_4_current_subtasks: string[];             // EF:7
  s_4_active_artifact_set: string[];          // EF:7
  s_4_team_composition: AgentTeam | null;     // EF:7
  s_4_visibility_stance: "observable" | "headless"; // EF:7
  s_4_run_local_continuity: Record<string, unknown>; // EF:7 (Redis-backed)
}

/** Layer 8: Execution — operational run grammar */
interface ExecutionLayer {
  p_2_intent_class: string;                   // EF:8
  s_4_operative_goal: string | null;          // EF:8
  c_3_execution_mode: ContextFrameVariant;    // EF:8
  c_2_vak_frame: VakFrame;                    // EF:8
  p_3_agent_sequence_position: number;        // EF:8
  s_4_write_surface: string[];                // EF:8
  s_4_evaluation_gates: string[];             // EF:8 (cold)
  s_4_bounded_scope: BoundedScope | null;     // EF:8 (cold)
  s_4_helper_roles: string[];                 // EF:8 (cold)
}

/** Layer 9: Episodic Reporting — live run trace */
interface EpisodicLayer {
  t_3_episode_id: string | null;              // EF:9
  t_3_episode_state: "open" | "interim" | "closed"; // EF:9
  t_1_live_trace_stream: string | null;       // EF:9
  t_3_interim_summary: string | null;         // EF:9 (cold)
  t_3_t_lane_activations: number[];           // EF:9 (cold)
  t_3_arc_id: string | null;                  // EF:9 (cold)
  t_3_linked_prior_episodes: string[];        // EF:9 (cold)
  s_3_graphiti_node_ids: string[];            // EF:9 (cold; S3' Graphiti runtime nodes)
  t_3_reporting_density: DisclosureDensity;   // EF:9 (cold)
}

/** Layer 10: Crystallisation — Aletheian return */
interface CrystallisationLayer {
  s_5_crystallisation_state: "inactive" | "active" | "complete"; // EF:10
  t_5_yield_types: YieldType[];               // EF:10
  s_5_sophia_disclosure: string | null;       // EF:10
  s_5_anansi_placement: string | null;        // EF:10
  s_5_janus_threshold: string | null;         // EF:10
  s_5_moirai_weave_targets: string[];         // EF:10
  s_5_zeithoven_next_form: string | null;     // EF:10
  s_1_promoted_artifacts: string[];           // EF:10
  t_0_open_questions: string[];               // EF:10
  s_5_review_inbox_item: ReviewInboxItem | null; // EF:10
  s_5_review_resolution: ReviewResolution | null; // EF:10
}

/** Layer 11: Improvement — bounded self-development */
interface ImprovementLayer {
  s_5_improvement_mode: "developmental" | "precision" | null; // EF:11
  s_5_improvement_target_family: CoordinateFamily | "ql" | null; // EF:11
  s_5_baseline_artifact: ArtifactRef | null;  // EF:11
  s_5_challenger_artifact: ArtifactRef | null; // EF:11
  s_5_evaluation_surface: string | null;      // EF:11
  s_5_keep_discard_rule: string | null;       // EF:11
  s_1_promotion_destination: "seeds" | "world" | null; // EF:11
  t_2_residue_class: string | null;           // EF:11
  s_5_loop_count: number;                     // EF:11
  s_5_sophia_vector: ImprovementVector | null; // EF:11
}

/** Layer 12: QL Process — operative QL logic */
interface QLProcessLayer {
  c_0_ql_schema_version: string;              // EF:12
  c_3_ql_modal: QLModal;                      // EF:12
  c_4_ctx_frame_variant: ContextFrameVariant; // EF:12
  c_5_inversion_state: boolean;               // EF:12
  c_4_topological_mode: TopologicalMode;      // EF:12
  c_3_ql_cycle_position: ArchetypePosition;   // EF:12
  c_0_bimba_anchor: CoordinateString | null;  // EF:12 (warm)
  c_5_pratibimba_mirror: string | null;       // EF:12 (warm)
  c_2_dialectical_polarity: DialecticalPolarity; // EF:12 (cold)
  c_0_ql_extension_fields: Record<string, unknown>; // EF:12 (cold)
}

/** The full envelope — all 12 layers */
interface Envelope {
  transport: TransportLayer;
  runtime: RuntimeLayer;
  temporal: TemporalLayer;
  coordinate: CoordinateLayer;
  residency: ResidencyLayer;
  context_economy: ContextEconomyLayer;
  lived_environs: LivedEnvironsLayer;
  execution: ExecutionLayer;
  episodic: EpisodicLayer;
  crystallisation: CrystallisationLayer;
  improvement: ImprovementLayer;
  ql_process: QLProcessLayer;
}

/** Hot envelope — the 61 always-present fields */
type HotEnvelope = Pick<Envelope,
  "transport" | "runtime" | "temporal" | "coordinate" |
  "residency" | "context_economy" | "lived_environs" | "execution" |
  "episodic" | "ql_process"
>;

// Supporting types for envelope layers

type VaultZone = "Present" | "Seeds" | "World" | "Self" | "System" | "Map";
type ResidencyClass = "Self" | "System" | "Map" | "Seeds" | "World" | "Present";
type RetrievalMode = "kbase" | "semantic" | "episodic" | "hybrid";
type YieldType = "insight" | "pattern" | "discovery" | "seed" | "proposal" | "challenge" | "question";

interface PermissionBoundary {
  write_authority: string;    // "khora" — only khora writes
  tool_permissions: string[];
  skill_permissions: string[];
}

interface ToolSurface {
  preferred_tools: Record<string, string>;
  resolved_paths: Record<string, string>;
  epi_binary: string;
}

interface BoundedScope {
  in_scope: string[];
  out_of_scope: string[];
}

interface VakFrame {
  cf_frame: ContextFrameVariant;
  agent_route: ConstitutionalAgent;
  ct_type: CTLevel;
  cp_position: CPPosition;
  mef_lens: MEFLens;
}

interface ArtifactRef {
  path: string;
  coordinate?: CoordinateString;
  ct_type?: CTLevel;
}
```

---

## S0Types / S0PrimeTypes — CLI Ground

```typescript
// ============================================================
// S0 / S0' — CLI Ground
// ============================================================

// --- s0.exec ---
interface S0ExecRequest {
  command: string;
  args: string[];
  cwd?: string;
  timeout_ms?: number;
  env?: Record<string, string>;
}

interface S0ExecResponse {
  stdout: string;
  stderr: string;
  exit_code: number;
}

// --- s0.tool_surface ---
// No request params
type S0ToolSurfaceResponse = ToolSurface; // EF:2.s_0_tool_surface

// --- s0.env ---
interface S0EnvRequest {
  keys: string[];
}

interface S0EnvResponse {
  values: Record<string, string | null>; // EF:2.s_0_env_config
}

// --- s0'.cmux ---
interface CmuxWorkspace {
  name: string;
  panes: CmuxPane[];
  layout: string;
}

interface CmuxPane {
  id: string;
  name: string;
  command: string;
  active: boolean;
}

interface S0PrimeCmuxListResponse {
  workspaces: CmuxWorkspace[];
}

interface S0PrimeCmuxSurfaceRequest {
  action: "create" | "destroy";
  name: string;
  layout?: string;
}

interface S0PrimeCmuxFocusRequest {
  pane: string;
}
```

---

## S1Types / S1PrimeTypes — Vault and Compiler Spine

```typescript
// ============================================================
// S1 / S1' — Vault Material + Content Membrane + Compiler Spine
// ============================================================

// --- s1.read ---
interface S1ReadRequest {
  path: string;
  format?: "raw" | "parsed";
}

interface S1ReadResponse {
  content: string;
  frontmatter?: Record<string, unknown>;
  body?: string;
  ct_type?: CTLevel;
  coordinate?: CoordinateString;
}

// --- s1.write ---
interface S1WriteRequest {
  path: string;
  content: string;
  frontmatter?: Record<string, unknown>;
  sync_queue?: boolean;          // default true; queues for Neo4j sync
}

interface S1WriteResponse {
  ok: boolean;
  sync_queued: boolean;
}

// --- s1.search ---
interface S1SearchRequest {
  query: string;
  scope?: string;               // vault path prefix
  ct_type?: CTLevel;
  coordinate?: CoordinateString;
  limit?: number;
}

interface VaultSearchResult {
  path: string;
  title: string;
  excerpt: string;
  ct_type: CTLevel | null;
  coordinate: CoordinateString | null;
  score: number;
}

interface S1SearchResponse {
  results: VaultSearchResult[];
}

// --- s1.template ---
interface S1TemplateRequest {
  name: CTLevel;                 // CT0-CT5
  params: Record<string, unknown>;
}

interface S1TemplateResponse {
  rendered: string;
  path: string;
}

// --- s1.frontmatter ---
interface FrontmatterError {
  key: string;
  message: string;
  severity: "error" | "warning";
}

interface S1FrontmatterValidateRequest {
  path: string;
}

interface S1FrontmatterValidateResponse {
  valid: boolean;
  errors: FrontmatterError[];
}

interface S1FrontmatterSetRequest {
  path: string;
  key: string;
  value: unknown;
}

interface S1FrontmatterGetRequest {
  path: string;
  keys?: string[];
}

interface S1FrontmatterGetResponse {
  frontmatter: Record<string, unknown>;
}

// --- s1.backlinks ---
interface S1BacklinksRequest {
  path: string;
}

interface S1BacklinksResponse {
  backlinks: { path: string; title: string; context: string }[];
}

// --- s1.sync.flush --- (drains khora sync queue to Neo4j — CRITICAL for S1→S2 integration)
interface S1SyncFlushResponse {
  flushed: number;
  errors: { path: string; error: string }[];
  neo4j_nodes_updated: number;
}

// ============================================================
// S1'Cx — Type-to-Form System (C0-C5 manifestation cycle)
// ============================================================

// --- s1'.type.create --- (C4 manifestation)
interface S1PrimeTypeCreateRequest {
  name: string;
  parent_type?: string;
  coordinate?: CoordinateString; // C4 coordinate assignment
}

interface S1PrimeTypeCreateResponse {
  type_path: string;             // Bimba/World/Types/{Name}/
  moc_canvas_path: string;       // Bimba/World/Types/{Name}/{Name}.canvas
  neo4j_label: string;
}

// --- s1'.type.list ---
interface TypeSummary {
  name: string;
  path: string;
  moc_canvas: string;
  entity_count: number;
  neo4j_label: string;
  children: string[];
}

interface S1PrimeTypeListRequest {
  parent_type?: string;
}

interface S1PrimeTypeListResponse {
  types: TypeSummary[];
}

// --- s1'.form.birth --- (C1 manifestation)
interface S1PrimeFormBirthRequest {
  name: string;
  type: string;                  // which Type folder
  content: string;
  frontmatter: Record<string, unknown>;
  ct_type: CTLevel;
}

interface S1PrimeFormBirthResponse {
  birth_path: string;            // Types/{Type}/{Name}.md
  neo4j_label: string;
  status: "birthed";
}

// --- s1'.form.graduate --- (C1 → World canonical)
interface S1PrimeFormGraduateRequest {
  name: string;
  source_type: string;
}

interface S1PrimeFormGraduateResponse {
  graduated_path: string;        // Bimba/World/{Name}.md
  origin_type: string;
  neo4j_label: string;
  status: "canonical";
}

// --- s1'.form.list ---
interface FormSummary {
  name: string;
  path: string;
  zone: "world" | "types" | "seeds";
  ct_type: CTLevel | null;
  coordinate: CoordinateString | null;
  neo4j_label: string | null;
}

interface S1PrimeFormListRequest {
  zone?: "world" | "types" | "seeds";
  type_filter?: string;
  ct_type?: CTLevel;
}

interface S1PrimeFormListResponse {
  forms: FormSummary[];
}

// --- s1'.canvas.create --- (C3 manifestation)
interface CanvasNode {
  id: string;
  type: "text" | "file" | "link" | "group";
  text?: string;
  file?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CanvasEdge {
  id: string;
  fromNode: string;
  toNode: string;
  label?: string;
}

interface S1PrimeCanvasCreateRequest {
  name: string;
  type?: "moc" | "process" | "workspace";
  parent_path: string;
  nodes?: CanvasNode[];
  edges?: CanvasEdge[];
}

interface S1PrimeCanvasCreateResponse {
  canvas_path: string;
}

// --- s1'.residency.resolve --- (C0/C5 ground and graduation)
interface S1PrimeResidencyResolveRequest {
  artifact_role: string;
  ct_type: CTLevel;
  coordinate?: CoordinateString;
}

interface S1PrimeResidencyResolveResponse {
  zone: VaultZone;
  path_pattern: string;
  graduation_path: string | null;
}

// ============================================================
// S1' — Compiler Spine
// ============================================================

/** Ledger channel names — one per envelope layer */
type LedgerChannel =
  | "transport" | "runtime" | "temporal" | "coordinate"
  | "residency" | "context" | "environs" | "execution"
  | "episodic" | "crystallisation" | "improvement" | "ql";

interface LedgerEntry {
  timestamp: number;
  event_type: string;
  coordinate: CoordinateString | null;
  payload: Record<string, unknown>;
}

interface CompiledArtifact {
  channel: LedgerChannel;
  content: string;
  compiled_at: number;
  entry_count: number;
}

// --- s1'.compile ---
interface S1PrimeCompileRequest {
  channel: LedgerChannel;
  force?: boolean;
}

interface S1PrimeCompileResponse {
  artifacts: CompiledArtifact[];
  channel: LedgerChannel;
}

// --- s1'.ledger.append ---
interface S1PrimeLedgerAppendRequest {
  channel: LedgerChannel;
  entry: LedgerEntry;
}

interface S1PrimeLedgerAppendResponse {
  ok: boolean;
  sequence: number;
}

// --- s1'.query ---
interface S1PrimeQueryRequest {
  question: string;
  coordinate_filter?: CoordinateString;
  cost_tier?: CostTier;
}

interface SourceRef {
  path: string;
  title: string;
  coordinate: CoordinateString | null;
}

interface S1PrimeQueryResponse {
  answer: string;
  sources: SourceRef[];
  cost_tier: CostTier;
}

// --- s1'.injection ---
interface S1PrimeInjectionRequest {
  cost_tier: CostTier;
  char_budget?: number;          // default 18000
}

interface S1PrimeInjectionResponse {
  context_block: string;
  char_count: number;
  layers_included: LedgerChannel[];
  agent_id: AgentId;
}
```

---

## S2Types / S2PrimeTypes — Knowledge Graph

```typescript
// ============================================================
// S2 / S2' — Knowledge Graph
// ============================================================

// --- Domain models ---
interface BimbaNode {
  coordinate: CoordinateString;
  family: CoordinateFamily;
  position: ArchetypePosition;
  prime: boolean;
  name: string;
  labels: string[];
  properties: Record<string, unknown>;
}

interface Relation {
  type: string;                  // MAPS_TO_COORDINATE, RESONATES_WITH, etc.
  target: CoordinateString;
  target_name: string;
  properties: Record<string, unknown>;
}

interface CoordinateRef {
  coordinate: CoordinateString;
  name: string;
  family: CoordinateFamily;
}

interface GraphPath {
  nodes: BimbaNode[];
  edges: Relation[];
  length: number;
}

interface GnosticResult {
  chunk_id: string;
  content: string;
  source: string;
  namespace: string;
  score: number;
  embedding_dim: number;
}

interface NamespaceInfo {
  name: string;
  chunk_count: number;
  node_count: number;
  embedding_dim: number;
}

// --- s2.graph.query ---
interface S2GraphQueryRequest {
  cypher: string;
  params?: Record<string, unknown>;
}

interface S2GraphQueryResponse {
  rows: Record<string, unknown>[];
  columns: string[];
}

// --- s2.graph.node ---
interface S2GraphNodeRequest {
  coordinate: CoordinateString;
}

interface S2GraphNodeResponse {
  node: BimbaNode;
  relations: Relation[];
  maps_to: CoordinateRef[];
  resonates_with: CoordinateRef[];
}

// --- s2.graph.traverse ---
interface S2GraphTraverseRequest {
  from: CoordinateString;
  edge_types?: string[];
  direction?: "outbound" | "inbound" | "both";
  depth?: number;
  families?: CoordinateFamily[];
}

interface S2GraphTraverseResponse {
  paths: GraphPath[];
  nodes: BimbaNode[];
}

// Gnostic (s5.gnostic.*) and episodic (s5.episodic.*) types are in S5Types below.
// They use the S2 substrate but are S5 world-return concerns.

// --- s2'.retrieve ---
interface RetrievalResult {
  id: string;
  content: string;
  source: string;
  source_type: "bimba" | "gnostic" | "episodic" | "kbase" | "vault";
  coordinate: CoordinateString | null;
  score: number;
  metadata: Record<string, unknown>;
}

interface S2PrimeRetrieveRequest {
  query: string;
  scope_coordinates: CoordinateString[];
  mode: RetrievalMode;
  disclosure_density?: DisclosureDensity;
  top_k?: number;
}

interface S2PrimeRetrieveResponse {
  pool: RetrievalResult[];
  disclosure_density: DisclosureDensity;
  scope_applied: CoordinateString[];
  sources: string[];
}

// --- s2'.rerank ---
interface RerankCriteria {
  coordinate_proximity?: CoordinateString;
  recency_weight?: number;
  disclosure_density_target?: DisclosureDensity;
}

interface S2PrimeRerankRequest {
  pool: RetrievalResult[];
  criteria: RerankCriteria;
}

interface S2PrimeRerankResponse {
  ranked: RetrievalResult[];
}

// --- s2'.enrich ---
interface EnrichmentEdge {
  from: string;
  to: string;
  type: "MAPS_TO_COORDINATE" | "RESONATES_WITH";
  confidence: number;
}

interface S2PrimeEnrichRequest {
  node_id: string;
  cross_namespace?: boolean;
}

interface S2PrimeEnrichResponse {
  edges_created: EnrichmentEdge[];
}

// --- s2'.coordinate.resolve ---
interface S2PrimeCoordinateResolveRequest {
  coordinate_string: CoordinateString;
}

interface S2PrimeCoordinateResolveResponse {
  node: BimbaNode | null;
  family: CoordinateFamily;
  position: ArchetypePosition;
  prime: boolean;
  sub_coordinates: CoordinateString[];
  parent: CoordinateString | null;
}
```

---

## S3Types / S3PrimeTypes — Temporal Runtime

```typescript
// ============================================================
// S3 / S3' — Temporal Runtime (largest surface)
// ============================================================

// --- Domain models ---
interface SessionRecord {
  canonical_key: string;
  session_id: string;
  agent_id: AgentId;
  day_id: string;
  group_id: string;              // shared Day group
  vault_now_path: string | null;
  channel: string | null;
  active_agent_id: AgentId;
  workspace_root: string;
  updated_at_ms: number;
}

interface SessionPatch {
  label?: string;
  thinking_level?: string;
  channel?: string;
  [key: string]: unknown;
}

interface RegisteredChannel {
  channel_id: string;
  name: string;
  handler_agent: AgentId;
  status: "active" | "inactive";
}

interface ChannelConfig {
  adapter?: string;              // "telegram" | "whatsapp" | "slack" | custom
  credentials_key?: string;      // varlock reference
  [key: string]: unknown;
}

interface KairosSnapshot {
  planet_degrees: number[];      // [10] mod-10: Sun(0)–Pluto(9)
  sun_degree: number;
  moon_degree: number;
  sun_decan: DecanInfo;
  moon_decan: DecanInfo;
  mode: "natal" | "realtime" | "kairotic";
  timestamp: number;
}

interface DecanInfo {
  index: number;                 // 0-35
  name: string;
  ruler: string;
  element: string;
  body_zone: string;
  sign: string;
}

interface NatalChart {
  birth_date: string;
  birth_location: string;
  sun_degree: number;
  moon_degree: number;
  planet_degrees: number[];
  houses: number[];
}

interface Episode {
  episode_id: string;
  content: string;
  agent_id: AgentId;
  ql: ArchetypePosition;
  cpf: ContextFrameVariant;
  ct: number;
  arc_id: string | null;
  kairos: KairosSnapshot | null;
  timestamp: number;
}

interface ArcSummary {
  arc_id: string;
  name: string;
  ql: ArchetypePosition;
  status: "open" | "closed";
  agent_id: AgentId;
  episode_count: number;
  opened_at: number;
  closed_at: number | null;
}

interface ArcStatus extends ArcSummary {
  episodes: Episode[];
  metadata: Record<string, unknown>;
}

interface ThoughtEntry {
  content: string;
  t_lane: number;               // 0-5
  source: string;
  timestamp: number;
}

interface AgentSummary {
  agent_id: AgentId;
  capabilities: string[];
  connected_since: number;
  session_key: string;
}

interface OracleResult {
  method: "iching" | "tarot";
  result: Record<string, unknown>;
  cast_moment: number;
}

interface HexagramBodyEntry {
  hexagram: number;
  chakra_ids: number[];
  body_zones: string[];
}

// --- connect ---
interface ConnectRequest {
  agent_id: AgentId;
  agent_version: string;
  capabilities: string[];        // method prefixes served: ["s5", "s5'"]
  subscriptions: string[];       // event channel patterns
  auth: { nonce: string; token: string };
}

interface ConnectResponse {
  session_key: string;           // EF:1.s_3_session_key
  session_id: string;            // EF:1.s_3_session_id
  day_id: string;                // EF:3.s_3_day_id
  group_id: string;
  now_id: string | null;         // EF:3.s_4_now_id (v0.2 addition)
  now_path: string | null;       // EF:3.s_4_now_path (v0.2 addition)
  workspace_root: string;        // EF:2.s_0_workspace_root (v0.2 addition)
  temporal_state: TemporalState;
  protocol_version: 3;
  peer_agents: AgentSummary[];
}

interface TemporalState {
  day_id: string;
  now_id: string | null;
  kairos: KairosSnapshot | null;
  tick12: number;
  active_arcs: ArcSummary[];
  connected_agents: AgentId[];
  archive_status: "active" | "archived" | "pending"; // v0.2 addition
  continuation_status: "fresh" | "continued" | "compacted"; // v0.2 addition
}

// --- agent.capabilities ---
interface AgentCapabilitiesRequest {
  agent_id?: AgentId;
}

interface AgentCapabilitiesResponse {
  agents: AgentSummary[];
}

// --- s3.session ---
interface S3SessionListRequest {
  agent_id?: AgentId;
  day_id?: string;
  group_id?: string;
}

interface S3SessionGetRequest {
  session_key: string;
}

interface S3SessionPatchRequest {
  session_key: string;
  patch: SessionPatch;
}

// --- s3.channel ---
interface S3ChannelRegisterRequest {
  name: string;
  handler_agent: AgentId;
  config?: ChannelConfig;
}

interface S3ChannelRegisterResponse {
  channel_id: string;
  status: "registered";
}

interface S3ChannelSendRequest {
  channel: string;
  message: string;
  thread?: string;
  metadata?: Record<string, unknown>;
}

interface S3ChannelSendResponse {
  delivered: boolean;
  message_id: string;
}

// --- s3.message.route ---
interface S3MessageRouteRequest {
  target_agent: AgentId;
  method: string;
  params: Record<string, unknown>;
  callback_channel?: string;
}

// --- s3'.temporal ---
// s3'.temporal.state: no request params
type S3PrimeTemporalStateResponse = TemporalState;

interface S3PrimeTemporalSubscribeRequest {
  events: string[];              // supports wildcards
}

interface S3PrimeTemporalSubscribeResponse {
  subscription_id: string;
  active_subscriptions: string[];
}

// --- s3'.day ---
interface S3PrimeDayOpenRequest {
  day_id: string;
  seed_content?: string;
  kairos_snapshot?: KairosSnapshot;
}

interface S3PrimeDayOpenResponse {
  ok: boolean;
  arc_id: string;
  vault_path: string;
}

interface S3PrimeDayCloseRequest {
  day_id: string;
  crystallisation?: string;
  force?: boolean;
}

interface S3PrimeDayCloseResponse {
  ok: boolean;
  archive_path: string;
}

interface S3PrimeDayStatusRequest {
  day_id?: string;
}

interface S3PrimeDayStatusResponse {
  day_id: string;
  open: boolean;
  session_count: number;
  agents_active: AgentId[];
  arcs: ArcSummary[];
}

// --- s3'.kairos ---
interface S3PrimeKairosFetchResponse {
  planet_degrees: number[];      // [10]
  sun_decan: DecanInfo;
  moon_decan: DecanInfo;
  sun_degree: number;
  moon_degree: number;
  mode: "natal" | "realtime" | "kairotic";
  timestamp: number;
}

interface S3PrimeKairosStatusResponse {
  enabled: boolean;
  mode: string;
  last_fetch: number;
  planet_valid: number;
}

interface S3PrimeKairosNatalRequest {
  birth_date: string;
  birth_location: string;
}

interface S3PrimeKairosNatalResponse {
  natal_chart: NatalChart;
  sun_degree_anchor: number;
}

// Episodic types (s5.episodic.*) are in S5Types below.
// Graphiti is S5 world-return; it uses S3' temporal grounding but belongs at S5.

// --- s3'.presence ---
interface PresenceEntry {
  agent_id: AgentId;
  torus_position: number;        // tick12
  hexagram: number;              // 0-63
  hash: string;                  // BLAKE3 identity hash
  last_update: number;
}

// s3'.presence.state: no request params
interface S3PrimePresenceStateResponse {
  agents: PresenceEntry[];
}

interface S3PrimePresenceUpdateRequest {
  torus_position: number;
  hexagram: number;
  hash?: string;
}

// --- s3'.context (Redis unified) ---
interface S3PrimeContextGetRequest {
  key: string;
}

interface S3PrimeContextSetRequest {
  key: string;
  value: unknown;
  ttl_seconds?: number;
}

interface S3PrimeContextPoolRequest {
  keys: string[];
  include_shared?: boolean;
}

interface S3PrimeContextPoolResponse {
  values: Record<string, unknown>;
}

// --- Temporal Event Payloads ---
interface TemporalDayOpenEvent {
  day_id: string;
  kairos_snapshot: KairosSnapshot | null;
  seed_available: boolean;
}

interface TemporalDayCloseEvent {
  day_id: string;
  crystallisation_summary: string | null;
  archive_path: string;
}

interface TemporalKairosTickEvent {
  planet_degrees: number[];
  sun_decan: DecanInfo;
  moon_decan: DecanInfo;
  sun_degree: number;
  moon_degree: number;
}

interface TemporalDecanChangeEvent {
  body: "sun" | "moon";
  from: DecanInfo;
  to: DecanInfo;
}

interface TemporalArcEvent {
  arc_id: string;
  name: string;
  ql: ArchetypePosition;
  agent_id: AgentId;
}

interface TemporalSessionEvent {
  agent_id: AgentId;
  session_id: string;
  session_key: string;
}

interface TemporalPresenceEvent {
  agent_id: AgentId;
  torus_position: number;
  hexagram: number;
}
```

---

## S4Types / S4PrimeTypes — Agent Operations

```typescript
// ============================================================
// S4 / S4' — Agent Operations (Anima-native)
// ============================================================

// --- Domain models ---
interface AgentTeam {
  agents: AgentAssignment[];
  composition_mode: "sequential" | "parallel" | "fusion";
  cf_frame: ContextFrameVariant;
}

interface AgentAssignment {
  agent_name: ConstitutionalAgent;
  cf_frame: ContextFrameVariant;
  ct_type: CTLevel;
  cp_position: CPPosition;
  mef_lens: MEFLens;
  role: string;
}

interface TaskContext {
  description: string;
  coordinate_scope: CoordinateString[];
  user_input?: string;
  session_context?: Record<string, unknown>;
}

interface SessionState {
  session_id: string;
  day_id: string;
  cs_position: CSPosition;
  cf_frame: ContextFrameVariant;
  team: AgentTeam | null;
  turn_count: number;
}

interface CSState {
  position: CSPosition;
  label: CSLabel;
  directionality: CSDirectionality;
}

interface CSTransition {
  from: CSPosition;
  to: CSPosition;
  trigger: string;
}

interface SophiaAnalysis {
  vectors: ImprovementVector[];
  yield_types: YieldType[];
  disclosure: string;
  t_lane_activations: number[];
}

interface ThoughtArtifact {
  t_lane: number;                // 0-5
  content: string;
  path: string;
  session_id: string;
  day_id: string;
  timestamp: number;
  sophia_classified: boolean;
  epii_delegated: boolean;
}

interface ContextPack {
  kbase: KbaseResult[];
  gnosis: GnosticResult[];
  episodic: Episode[];
  bimba: BimbaNode[];
  vault: VaultSearchResult[];
  pool_id: string;               // → EF:6.s_2_kbase_pool_id
  assembled_at: number;
  coordinate_scope: CoordinateString[];
  disclosure_density: DisclosureDensity;
}

// --- s4.agent.query ---
interface S4AgentQueryRequest {
  target_agent: AgentId;
  method: string;
  params: Record<string, unknown>;
  coordinate_context?: CoordinateContext;
}
// Returns AsyncAck; result on "agent.result.{ack_id}"

// --- s4.agent.notify ---
interface S4AgentNotifyRequest {
  target_agent: AgentId;
  event: string;
  payload: Record<string, unknown>;
}

// --- s4.agent.status ---
interface S4AgentStatusRequest {
  agent_id?: AgentId;
}

interface S4AgentStatusResponse {
  agent_id: AgentId;
  state: "active" | "idle" | "improvement" | "crystallising";
  session_key: string;
  day_id: string;
  team_composition: AgentTeam | null;
  cs_position: CSPosition;
  cf_frame: ContextFrameVariant;
  uptime_ms: number;
}

// --- s4'.vak.evaluate --- (v0.2 expanded response)
interface S4PrimeVakEvaluateRequest {
  context: {
    user_input: string;
    session_state: SessionState;
    coordinate_context?: CoordinateContext;
  };
}

interface S4PrimeVakEvaluateResponse {
  cf_frame: ContextFrameVariant;              // EF:4.c_4_cf / EF:8.c_3_execution_mode
  agent_route: ConstitutionalAgent;
  ct_type: CTLevel;                           // EF:4.c_1_ct
  cp_position: CPPosition;                    // EF:4.c_4_cp
  mef_lens: MEFLens;
  rationale: string;
  // Full coordinate evaluation — populates hot envelope fields
  primary_family: CoordinateFamily;           // EF:4.c_4_primary_family
  primary_coordinate: CoordinateString;       // EF:4.c_4_primary_coordinate
  cpf: ContextFrameVariant;                   // EF:4.c_3_cpf
  prime_targets: CoordinateString[];          // EF:4.c_5_prime_targets
  intent_class: string;                       // EF:8.p_2_intent_class
  agent_sequence_position: number;            // EF:8.p_3_agent_sequence_position
}

// --- s4'.team ---
interface S4PrimeTeamComposeRequest {
  task_context: TaskContext;
  cf_frame: ContextFrameVariant;
}

interface S4PrimeTeamComposeResponse {
  agents: AgentAssignment[];
  roles: string[];
  dispatch_mode: "sequential" | "parallel" | "fusion";
}

// s4'.team.status: no request params
interface S4PrimeTeamStatusResponse {
  composition: AgentTeam;
  active_agents: ConstitutionalAgent[];
}

// --- s4'.cs ---
// s4'.cs.state: no request params
interface S4PrimeCsStateResponse {
  position: CSPosition;
  label: CSLabel;
  directionality: CSDirectionality;
  transitions: CSTransition[];
}

interface S4PrimeCsTransitionRequest {
  target: CSPosition;
}

// --- s4'.orchestrate ---
interface S4PrimeOrchestrateRequest {
  task: string;
  mode: "sequential" | "parallel" | "fusion";
  team?: AgentAssignment[];
  cf_frame?: ContextFrameVariant;
}
// Returns AsyncAck

// --- s4'.thought ---
interface S4PrimeThoughtRouteRequest {
  content: string;
  sophia_analysis?: SophiaAnalysis;
  t_lane?: number;               // 0-5, auto-classified if omitted
}

interface S4PrimeThoughtRouteResponse {
  t_lane: number;
  artifact_path: string;
  epii_delegation?: string;      // ack_id if delegated
}

interface S4PrimeThoughtListRequest {
  lane?: number;
  session_id?: string;
  day_id?: string;
}

interface S4PrimeThoughtListResponse {
  thoughts: ThoughtArtifact[];
}

// --- s4'.crystallise ---
interface S4PrimeCrystalliseRequest {
  session_id: string;
  vectors: ImprovementVector[];
  delegate_to_epii?: boolean;
}
// Returns AsyncAck

// --- s4'.notify_user ---
interface S4PrimeNotifyUserRequest {
  type: "decision" | "research_track" | "follow_up" | "report" | "notification";
  content: string;
  priority: "low" | "normal" | "high";
  action_required?: boolean;
  coordinate_context?: CoordinateString;
}

interface S4PrimeNotifyUserResponse {
  delivered: boolean;
  channel: string;
}

// --- s4'.context.assemble ---
interface S4PrimeContextAssembleRequest {
  task_context: TaskContext;
  coordinate_scope: CoordinateString[];
  disclosure_density: DisclosureDensity;
}

interface S4PrimeContextAssembleResponse {
  context_pack: ContextPack;                  // EF:7.s_4_active_context_pack
  sources: {
    kbase: KbaseResult[];
    gnosis: GnosticResult[];
    episodic: Episode[];
    bimba: BimbaNode[];
    vault: VaultSearchResult[];
  };
  pool_id: string;                            // EF:6.s_2_kbase_pool_id
  redis_key: string;                          // EF:6.s_3_context_key
  write_surface: string[];                    // EF:8.s_4_write_surface
}

// ============================================================
// S4' — Psyche (Layer 7 Lived-Environs surface)
// ============================================================

// --- s4'.psyche.state ---
interface PsycheState {
  operative_notebook: string | null;          // EF:7.s_4_operative_notebook
  current_task: string | null;                // EF:7.s_4_current_task
  current_subtasks: string[];                 // EF:7.s_4_current_subtasks
  active_artifact_set: string[];              // EF:7.s_4_active_artifact_set
  visibility_stance: "observable" | "headless"; // EF:7.s_4_visibility_stance
  run_local_continuity: Record<string, unknown>; // EF:7.s_4_run_local_continuity
}

type S4PrimePsycheStateResponse = PsycheState;

// --- s4'.psyche.update ---
interface S4PrimePsycheUpdateRequest {
  current_task?: string;
  current_subtasks?: string[];
  active_artifact_set?: string[];
  visibility_stance?: "observable" | "headless";
  run_local_continuity?: Record<string, unknown>;
}

// ============================================================
// S4' — Goal and Permission
// ============================================================

// --- s4'.goal ---
interface S4PrimeGoalSetRequest {
  goal: string;                               // EF:8.s_4_operative_goal
  coordinate_scope?: CoordinateString[];
}

interface S4PrimeGoalGetResponse {
  goal: string | null;
  coordinate_scope: CoordinateString[];
  set_at: number | null;
}

// --- s4'.permission ---
type S4PrimePermissionGetResponse = PermissionBoundary; // EF:2.s_4_permission_boundary
```

---

## S5Types / S5PrimeTypes — Knowledge Oracle and Improvement

```typescript
// ============================================================
// S5 / S5' — Knowledge Oracle, World Return, and Improvement (Epii-native)
// S5 is the integral world-boundary: gnostic corpus, episodic memory,
// bimba navigation, M' functions. S5' is governance and improvement.
// ============================================================

// --- S5 Gnostic (world-return corpus ingestion/retrieval) ---

interface S5GnosticIngestRequest {
  source: string;
  format?: string;
  namespace?: string;
}

interface S5GnosticIngestResponse {
  chunks_created: number;
  embeddings_written: number;
  namespace: string;
}

interface S5GnosticQueryRequest {
  query: string;
  mode?: RetrievalMode;
  top_k?: number;
  namespace?: string;
}

interface S5GnosticQueryResponse {
  results: GnosticResult[];
  scores: number[];
}

interface S5GnosticStatusResponse {
  namespaces: NamespaceInfo[];
  total_chunks: number;
  embedding_dim: number;
  health: string;
}

// --- S5 Episodic (world-return lived temporal memory via Graphiti) ---

interface S5EpisodicRecordRequest {
  content: string;
  agent_id: AgentId;
  ql: ArchetypePosition;
  cpf: ContextFrameVariant;
  ct: number;
  metadata?: {
    sun_degree?: number;
    moon_degree?: number;
    planet_degrees?: number[];
    sun_decan?: string;
    moon_decan?: string;
    tick12?: number;
  };
}

interface S5EpisodicRecordResponse {
  episode_id: string;
  arc_id: string | null;
}

interface S5EpisodicSearchRequest {
  query: string;
  time_range?: { from: number; to: number };
  agent_id?: AgentId;
  arc_id?: string;
  ql_range?: { min: number; max: number };
  limit?: number;
}

interface S5EpisodicSearchResponse {
  episodes: Episode[];
}

interface S5EpisodicArcOpenRequest {
  name: string;
  ql: ArchetypePosition;
  metadata?: Record<string, unknown>;
}

interface S5EpisodicArcCloseRequest {
  arc_id: string;
  crystallisation?: string;
  ql?: ArchetypePosition;
}

interface S5EpisodicArcOracleRequest {
  oracle_result: OracleResult;
  arc_name: string;
}

interface S5EpisodicArcOracleResponse {
  arc_id: string;
  hexagram_body: HexagramBodyEntry;
}

interface S5EpisodicArcMobiusRequest {
  closing_arc_id: string;
  synthesis: string;
}

interface S5EpisodicArcMobiusResponse {
  new_ground_arc_id: string;
  mobius_complete: boolean;
}

interface S5EpisodicIngestThoughtsRequest {
  thoughts: ThoughtEntry[];
  agent_id: AgentId;
}

interface S5EpisodicIngestThoughtsResponse {
  ingested: number;
  episode_ids: string[];
}

// --- Domain models ---
interface CoordinateStep {
  coordinate: CoordinateString;
  name: string;
  direction: "inward" | "outward" | "lateral" | "inverse";
  depth: number;
}

interface CoordinateTree {
  root: CoordinateString;
  children: CoordinateTreeNode[];
}

interface CoordinateTreeNode {
  coordinate: CoordinateString;
  name: string;
  family: CoordinateFamily;
  children: CoordinateTreeNode[];
}

interface MPrimeFunction {
  coordinate: CoordinateString;
  name: string;
  subsystem: "anuttara" | "paramasiva" | "parashakti" | "mahamaya" | "nara" | "epii";
  cli_command: string;
}

interface BimbaSearchResult {
  node: BimbaNode;
  relevance: number;
  relations: Relation[];
}

interface LensState {
  index: number;
  name: string;
  active: boolean;
}

interface QuintessenceState {
  hash: string;
  clock_position: number;
  quaternion: [number, number, number, number]; // [w, x, y, z]
}

interface DecanMapping {
  decan_index: number;
  card: string;
  body_part: string;
  herbs: string[];
  element: string;
  sign: string;
}

interface ContainerState {
  container: "bohm" | "talking_circle" | "diamond";
  phase: string;
  iterations: number;
}

interface LensApplication {
  lens_id: string;
  target: string;
  result: string;
  depth: number;
}

interface LogosCycleState {
  stages: LogosStage[];
  current: number;
  cycle_count: number;
}

interface LogosStage {
  index: number;
  name: string;
  status: "pending" | "active" | "complete";
}

interface LogosTransition {
  from: number;
  to: number;
  trigger: string;
}

interface IdentityFacet {
  type: string;
  data: Record<string, unknown>;
  source: string;
}

interface ChakraInfo {
  id: number;
  name: string;
  element: string;
  body_zones: string[];
}

interface DecanBodyInfo {
  decan_index: number;
  body_part: string;
  herbs: string[];
  ruler: string;
  element: string;
}

interface ImprovementVector {
  target_family: CoordinateFamily | "ql";
  target_coordinate: CoordinateString;
  direction: string;
  confidence: number;
  sophia_source: string;         // session_id where identified
}

interface ImprovementRun {
  run_id: string;
  target_family: string;
  target_coordinate: CoordinateString;
  baseline: ArtifactRef;
  challenger: ArtifactRef;
  winner: "baseline" | "challenger";
  rationale: string;
  timestamp: number;
}

type ReviewSource = "human_gate" | "anima" | "aletheia" | "autoresearch";
type ReviewStatus = "open" | "resolved" | "deferred";
type ReviewDecision = "approve" | "reject" | "revise" | "defer";

interface ReviewProposedAction {
  kind: "promote" | "modify" | "invoke_agent" | "record_decision" | "request_clarification";
  target?: ArtifactRef;
  destination?: "present" | "seeds" | "world";
  payload?: Record<string, unknown>;
}

interface ReviewInboxItem {
  item_id: string;
  source: ReviewSource;
  title: string;
  body: string;
  priority: "low" | "normal" | "high" | "blocking";
  status: ReviewStatus;
  coordinate_context: CoordinateContext;
  proposed_action?: ReviewProposedAction;
  requires_human: boolean;
  created_at: number;
}

interface ReviewResolution {
  item_id: string;
  decision: ReviewDecision;
  rationale: string;
  resolved_by: AgentId | "human";
  resolved_at: number;
  promotion_destination?: "present" | "seeds" | "world";
  promoted_artifact?: ArtifactRef;
}

interface EvaluationCriteria {
  dimensions: string[];
  weights?: Record<string, number>;
  required_pass?: string[];
}

interface RetrievalPlan {
  backends: { name: string; priority: number; params: Record<string, unknown> }[];
  coordinate_scope: CoordinateString[];
  expected_density: DisclosureDensity;
}

interface KbaseResult {
  id: string;
  url: string;
  title: string;
  description: string;
  tags: string[];
  score: number;
  path_candidates: string[];
}

interface KbaseFacet {
  path: string;
  relevance: number;
  type: string;
}

interface Exercise {
  prompt: string;
  difficulty: number;
  coordinate: CoordinateString;
}

// --- s5.bimba ---
interface S5BimbaNavigateRequest {
  from: CoordinateString;
  direction?: "inward" | "outward" | "lateral" | "inverse";
  depth?: number;
  families?: CoordinateFamily[];
}

interface S5BimbaNavigateResponse {
  path: CoordinateStep[];
  nodes: BimbaNode[];
  narrative: string;
}

interface S5BimbaContextRequest {
  coordinate: CoordinateString;
}

interface S5BimbaContextResponse {
  node: BimbaNode;
  family: CoordinateFamily;
  position: ArchetypePosition;
  prime: boolean;
  intra_openness: CoordinateRef[];            // 16-fold pointer web
  m_prime: MPrimeFunction | null;
  s_prime: SPrimeLayer | null;
  definition_path: string | null;
}

interface S5BimbaSearchRequest {
  concept: string;
  families?: CoordinateFamily[];
  include_relations?: boolean;
}

interface S5BimbaSearchResponse {
  matches: BimbaSearchResult[];
}

interface S5BimbaMapRequest {
  root?: CoordinateString;
  depth?: number;
  families?: CoordinateFamily[];
}

interface S5BimbaMapResponse {
  tree: CoordinateTree;
  node_count: number;
}

// --- s5.m (M' functions) ---
interface S5MClockRequest {
  mode?: "full" | "position" | "lenses";
}

interface S5MClockResponse {
  degree_360: number;
  tick12: number;
  torus_position: number;
  spanda_stage: string;
  active_lenses: LensState[];
  backbone: {
    seasonal_4: number;
    zodiac_12: number;
    amino_24: number;
    degree_360: number;
  };
  quintessence: QuintessenceState | null;
}

interface S5MOracleRequest {
  method: "iching" | "tarot";
  cast_params?: Record<string, unknown>;
}

interface S5MOracleResponse {
  result: OracleResult;
  body_dynamics: HexagramBodyEntry | null;
  decan_map: DecanMapping | null;
  kairos_moment: KairosSnapshot;
}

interface S5MMedicineRequest {
  query: string;
  mode?: "zone" | "herb" | "chakra" | "full";
}

interface S5MMedicineResponse {
  body_zones: string[];
  herbs: string[];
  chakras: ChakraInfo[];
  decan_context: DecanBodyInfo | null;
  element_signature: number;
}

interface S5MTransformRequest {
  container: "bohm" | "talking_circle" | "diamond";
  input: string;
  cycle_params?: Record<string, unknown>;
}

interface S5MTransformResponse {
  output: string;
  container_state: ContainerState;
}

interface S5MLensRequest {
  lens_id: string;
  target: string;
  mode?: string;
}

type S5MLensResponse = LensApplication;

interface S5MLogosRequest {
  stage?: number;
}

interface S5MLogosResponse {
  cycle_state: LogosCycleState;
  current_stage: number;
  transitions: LogosTransition[];
}

interface S5MIdentityRequest {
  query: "pasu" | "natal" | "quintessence" | "gene_keys" | "human_design" | "jungian";
}

interface S5MIdentityResponse {
  identity: IdentityFacet;
}

// --- s5'.mef ---
interface S5PrimeMefApplyRequest {
  lens: MEFLens;
  target: string;
  mode?: "day" | "night";
}

interface S5PrimeMefApplyResponse {
  lens_name: string;
  reading: string;
  depth: number;
  cross_references: CoordinateRef[];
}

interface MEFCriteria {
  dimensions: string[];
  weights?: Record<string, number>;
}

interface S5PrimeMefEvaluateRequest {
  artifact: string;
  criteria?: MEFCriteria;
  lenses?: MEFLens[];
}

interface S5PrimeMefEvaluateResponse {
  scores: Record<string, number>;
  overall: number;
  recommendations: string[];
  dominant_lens: MEFLens;
}

interface S5PrimeMefModalRequest {
  mode: QLModal;
}

interface S5PrimeMefModalResponse {
  frame: ContextFrameVariant;
  structure: ModalStructure;
  interpretation: string;
}

// --- s5'.ql ---
interface SchemaField {
  name: string;
  type: string;
  layer: number;
  cost: CostTier;
  coordinate_home: CoordinateString;
}

interface SchemaVersion {
  version: string;
  date: string;
  changes: string[];
}

// s5'.ql.schema: no request params
interface S5PrimeQlSchemaResponse {
  version: string;                            // EF:12.c_0_ql_schema_version
  fields: SchemaField[];
  extension_fields: Record<string, unknown>;  // EF:12.c_0_ql_extension_fields
  history: SchemaVersion[];
}

interface S5PrimeQlEvaluateRequest {
  context: {
    coordinate: CoordinateString;
    cf_frame: ContextFrameVariant;
    topological_mode: TopologicalMode;
  };
}

interface S5PrimeQlEvaluateResponse {
  ql_modal: QLModal;                          // EF:12.c_3_ql_modal
  cycle_position: ArchetypePosition;          // EF:12.c_3_ql_cycle_position
  inversion_state: boolean;                   // EF:12.c_5_inversion_state
  dialectical_polarity: DialecticalPolarity;  // EF:12.c_2_dialectical_polarity
  interpretation: string;
}

// --- s5'.kbase ---
interface S5PrimeKbaseSearchRequest {
  query: string;
  project?: string;
  mode?: "semantic" | "keyword" | "all";
  limit?: number;
}

interface S5PrimeKbaseSearchResponse {
  results: KbaseResult[];
  facets: KbaseFacet[];
  project: string;
}

interface S5PrimeKbaseAddRequest {
  url: string;
  tags?: string[];
  description?: string;
  project?: string;
}

interface S5PrimeKbaseAddResponse {
  ok: boolean;
  id: string;
  embedding_backfilled: boolean;
}

interface S5PrimeKbasePoolRequest {
  queries: string[];
  coordinate_scope?: CoordinateString[];
  project?: string;
  limit_per_query?: number;
}

interface S5PrimeKbasePoolResponse {
  pool: KbaseResult[];
  pool_id: string;                            // → EF:6.s_2_kbase_pool_id
  facets: KbaseFacet[];
  deduplicated: boolean;
}

interface S5PrimeKbaseStatusRequest {
  project?: string;
}

interface S5PrimeKbaseStatusResponse {
  project: string;
  total_bookmarks: number;
  embedded: number;
  db_path: string;
}

// --- s5'.improve ---
// s5'.improve.status: no request params
interface S5PrimeImproveStatusResponse {
  loop_state: "idle" | "hypothesis" | "evaluating" | "deciding";
  active_vectors: ImprovementVector[];
  last_run: number;
  total_runs: number;
  keep_count: number;
  discard_count: number;
}

interface S5PrimeImproveEvaluateRequest {
  baseline: ArtifactRef;
  challenger: ArtifactRef;
  criteria?: EvaluationCriteria;
}
// Returns AsyncAck; result: { winner, rationale, scores }

interface S5PrimeImproveProposeRequest {
  target_family: CoordinateFamily | "ql";
  target_coordinate: CoordinateString;
  direction?: string;
}
// Returns AsyncAck; result: { challenger_artifact, diff_summary, confidence }

interface S5PrimeImprovePromoteRequest {
  artifact: ArtifactRef;
  destination: "seeds" | "world";
}

interface S5PrimeImprovePromoteResponse {
  ok: boolean;
  promoted_path: string;
}

interface S5PrimeImproveHistoryRequest {
  limit?: number;
  target_family?: CoordinateFamily | "ql";
}

interface S5PrimeImproveHistoryResponse {
  runs: ImprovementRun[];
}

// --- s5'.review ---
interface S5PrimeReviewInboxRequest {
  status?: ReviewStatus;
  source?: ReviewSource;
  limit?: number;
}

interface S5PrimeReviewInboxResponse {
  items: ReviewInboxItem[];
}

interface S5PrimeReviewSubmitRequest {
  source: ReviewSource;
  title: string;
  body: string;
  priority: "low" | "normal" | "high" | "blocking";
  coordinate_context: CoordinateContext;
  proposed_action?: ReviewProposedAction;
  requires_human: boolean;
}

interface S5PrimeReviewSubmitResponse {
  item: ReviewInboxItem;
}

interface S5PrimeReviewResolveRequest {
  item_id: string;
  decision: ReviewDecision;
  rationale: string;
  promotion_destination?: "present" | "seeds" | "world";
}

interface S5PrimeReviewResolveResponse {
  resolution: ReviewResolution;
}

interface S5PrimeReviewHistoryRequest {
  limit?: number;
  coordinate?: CoordinateString;
  source?: ReviewSource;
}

interface S5PrimeReviewHistoryResponse {
  items: ReviewInboxItem[];
  resolutions: ReviewResolution[];
}

// --- s5'.gnosis ---
interface S5PrimeGnosisStrategyRequest {
  query: string;
  context: {
    coordinate_scope: CoordinateString[];
    cf_frame: ContextFrameVariant;
    disclosure_density: DisclosureDensity;
  };
}

interface S5PrimeGnosisStrategyResponse {
  retrieval_plan: RetrievalPlan;
  sources: string[];
  expected_density: DisclosureDensity;
}

interface S5PrimeGnosisGovernRequest {
  results: RetrievalResult[];
  coordinate_scope: CoordinateString[];
  disclosure_density: DisclosureDensity;
}

interface S5PrimeGnosisGovernResponse {
  filtered: RetrievalResult[];
  reranked: RetrievalResult[];
  disclosure: DisclosureDensity;
  rationale: string;
}

// --- s5'.explain / s5'.teach ---
interface S5PrimeExplainRequest {
  coordinate: CoordinateString;
  depth?: "overview" | "technical" | "philosophical";
  audience?: "developer" | "architect" | "student" | "user";
  mef_lens?: MEFLens;
}

interface S5PrimeExplainResponse {
  explanation: string;
  references: CoordinateRef[];
  related_coordinates: CoordinateString[];
  m_prime_context: string | null;
}

interface S5PrimeTeachRequest {
  topic: string;
  mef_lens?: MEFLens;
  ql_mode?: QLModal;
  depth?: number;
}

interface S5PrimeTeachResponse {
  lesson: string;
  exercises: Exercise[];
  coordinate_path: CoordinateStep[];
  further_reading: ArtifactRef[];
}

// --- s5'.seed.generate --- (SEED.md morning context generation)
interface S5PrimeSeedGenerateRequest {
  day_id?: string;
  include_questions?: boolean;
  include_tasks?: boolean;
}

interface S5PrimeSeedGenerateResponse {
  seed_content: string;
  t5_insights: string[];
  t0_questions: string[];
  carried_tasks: string[];
  mobius_synthesis: string | null;
}
```

---

## Method-to-Type Quick Reference

| Method | Request Type | Response Type |
|---|---|---|
| `connect` | `ConnectRequest` | `ConnectResponse` |
| `agent.capabilities` | `AgentCapabilitiesRequest` | `AgentCapabilitiesResponse` |
| `s0.exec` | `S0ExecRequest` | `S0ExecResponse` |
| `s0.tool_surface` | — | `ToolSurface` |
| `s0.env` | `S0EnvRequest` | `S0EnvResponse` |
| `s0'.cmux.list` | — | `S0PrimeCmuxListResponse` |
| `s0'.cmux.surface` | `S0PrimeCmuxSurfaceRequest` | `{ ok: boolean }` |
| `s0'.cmux.focus` | `S0PrimeCmuxFocusRequest` | `{ ok: boolean }` |
| `s1.read` | `S1ReadRequest` | `S1ReadResponse` |
| `s1.write` | `S1WriteRequest` | `S1WriteResponse` |
| `s1.search` | `S1SearchRequest` | `S1SearchResponse` |
| `s1.template` | `S1TemplateRequest` | `S1TemplateResponse` |
| `s1.frontmatter.validate` | `S1FrontmatterValidateRequest` | `S1FrontmatterValidateResponse` |
| `s1.frontmatter.set` | `S1FrontmatterSetRequest` | `{ ok: boolean }` |
| `s1.frontmatter.get` | `S1FrontmatterGetRequest` | `S1FrontmatterGetResponse` |
| `s1.backlinks` | `S1BacklinksRequest` | `S1BacklinksResponse` |
| `s1.sync.flush` | — | `S1SyncFlushResponse` |
| `s1'.type.create` | `S1PrimeTypeCreateRequest` | `S1PrimeTypeCreateResponse` |
| `s1'.type.list` | `S1PrimeTypeListRequest` | `S1PrimeTypeListResponse` |
| `s1'.form.birth` | `S1PrimeFormBirthRequest` | `S1PrimeFormBirthResponse` |
| `s1'.form.graduate` | `S1PrimeFormGraduateRequest` | `S1PrimeFormGraduateResponse` |
| `s1'.form.list` | `S1PrimeFormListRequest` | `S1PrimeFormListResponse` |
| `s1'.canvas.create` | `S1PrimeCanvasCreateRequest` | `S1PrimeCanvasCreateResponse` |
| `s1'.residency.resolve` | `S1PrimeResidencyResolveRequest` | `S1PrimeResidencyResolveResponse` |
| `s1'.compile` | `S1PrimeCompileRequest` | `S1PrimeCompileResponse` |
| `s1'.ledger.append` | `S1PrimeLedgerAppendRequest` | `S1PrimeLedgerAppendResponse` |
| `s1'.query` | `S1PrimeQueryRequest` | `S1PrimeQueryResponse` |
| `s1'.injection` | `S1PrimeInjectionRequest` | `S1PrimeInjectionResponse` |
| `s2.graph.query` | `S2GraphQueryRequest` | `S2GraphQueryResponse` |
| `s2.graph.node` | `S2GraphNodeRequest` | `S2GraphNodeResponse` |
| `s2.graph.traverse` | `S2GraphTraverseRequest` | `S2GraphTraverseResponse` |
| `s5.gnostic.ingest` | `S5GnosticIngestRequest` | `S5GnosticIngestResponse` |
| `s5.gnostic.query` | `S5GnosticQueryRequest` | `S5GnosticQueryResponse` |
| `s5.gnostic.status` | — | `S5GnosticStatusResponse` |
| `s2'.retrieve` | `S2PrimeRetrieveRequest` | `S2PrimeRetrieveResponse` |
| `s2'.rerank` | `S2PrimeRerankRequest` | `S2PrimeRerankResponse` |
| `s2'.enrich` | `S2PrimeEnrichRequest` | `S2PrimeEnrichResponse` |
| `s2'.coordinate.resolve` | `S2PrimeCoordinateResolveRequest` | `S2PrimeCoordinateResolveResponse` |
| `s3.session.list` | `S3SessionListRequest` | `{ sessions: SessionRecord[] }` |
| `s3.session.get` | `S3SessionGetRequest` | `{ session: SessionRecord }` |
| `s3.session.patch` | `S3SessionPatchRequest` | `{ ok: boolean; session: SessionRecord }` |
| `s3.channel.register` | `S3ChannelRegisterRequest` | `S3ChannelRegisterResponse` |
| `s3.channel.list` | — | `{ channels: RegisteredChannel[] }` |
| `s3.channel.send` | `S3ChannelSendRequest` | `S3ChannelSendResponse` |
| `s3.message.route` | `S3MessageRouteRequest` | `AsyncAck` |
| `s3'.temporal.state` | — | `TemporalState` |
| `s3'.temporal.subscribe` | `S3PrimeTemporalSubscribeRequest` | `S3PrimeTemporalSubscribeResponse` |
| `s3'.day.open` | `S3PrimeDayOpenRequest` | `S3PrimeDayOpenResponse` |
| `s3'.day.close` | `S3PrimeDayCloseRequest` | `S3PrimeDayCloseResponse` |
| `s3'.day.status` | `S3PrimeDayStatusRequest` | `S3PrimeDayStatusResponse` |
| `s3'.kairos.fetch` | — | `S3PrimeKairosFetchResponse` |
| `s3'.kairos.status` | — | `S3PrimeKairosStatusResponse` |
| `s3'.kairos.natal` | `S3PrimeKairosNatalRequest` | `S3PrimeKairosNatalResponse` |
| `s5.episodic.record` | `S5EpisodicRecordRequest` | `S5EpisodicRecordResponse` |
| `s5.episodic.search` | `S5EpisodicSearchRequest` | `S5EpisodicSearchResponse` |
| `s5.episodic.arc.open` | `S5EpisodicArcOpenRequest` | `{ arc_id: string }` |
| `s5.episodic.arc.close` | `S5EpisodicArcCloseRequest` | `{ ok: boolean }` |
| `s5.episodic.arc.status` | `{ arc_id?: string }` | `{ arcs: ArcStatus[] }` |
| `s5.episodic.arc.oracle` | `S5EpisodicArcOracleRequest` | `S5EpisodicArcOracleResponse` |
| `s5.episodic.arc.mobius` | `S5EpisodicArcMobiusRequest` | `S5EpisodicArcMobiusResponse` |
| `s5.episodic.ingest_thoughts` | `S5EpisodicIngestThoughtsRequest` | `S5EpisodicIngestThoughtsResponse` |
| `s3'.presence.state` | — | `S3PrimePresenceStateResponse` |
| `s3'.presence.update` | `S3PrimePresenceUpdateRequest` | `{ ok: boolean }` |
| `s3'.context.get` | `S3PrimeContextGetRequest` | `{ value: unknown }` |
| `s3'.context.set` | `S3PrimeContextSetRequest` | `{ ok: boolean }` |
| `s3'.context.shared.get` | `S3PrimeContextGetRequest` | `{ value: unknown }` |
| `s3'.context.shared.set` | `S3PrimeContextSetRequest` | `{ ok: boolean }` |
| `s3'.context.pool` | `S3PrimeContextPoolRequest` | `S3PrimeContextPoolResponse` |
| `s4.agent.query` | `S4AgentQueryRequest` | `AsyncAck` |
| `s4.agent.notify` | `S4AgentNotifyRequest` | `AsyncAck` |
| `s4.agent.status` | `S4AgentStatusRequest` | `S4AgentStatusResponse` |
| `s4'.vak.evaluate` | `S4PrimeVakEvaluateRequest` | `S4PrimeVakEvaluateResponse` |
| `s4'.team.compose` | `S4PrimeTeamComposeRequest` | `S4PrimeTeamComposeResponse` |
| `s4'.team.status` | — | `S4PrimeTeamStatusResponse` |
| `s4'.cs.state` | — | `S4PrimeCsStateResponse` |
| `s4'.cs.transition` | `S4PrimeCsTransitionRequest` | `{ ok: boolean; new_state: CSState }` |
| `s4'.orchestrate` | `S4PrimeOrchestrateRequest` | `AsyncAck` |
| `s4'.thought.route` | `S4PrimeThoughtRouteRequest` | `S4PrimeThoughtRouteResponse` |
| `s4'.thought.list` | `S4PrimeThoughtListRequest` | `S4PrimeThoughtListResponse` |
| `s4'.crystallise` | `S4PrimeCrystalliseRequest` | `AsyncAck` |
| `s4'.notify_user` | `S4PrimeNotifyUserRequest` | `S4PrimeNotifyUserResponse` |
| `s4'.context.assemble` | `S4PrimeContextAssembleRequest` | `S4PrimeContextAssembleResponse` |
| `s4'.psyche.state` | — | `PsycheState` |
| `s4'.psyche.update` | `S4PrimePsycheUpdateRequest` | `{ ok: boolean }` |
| `s4'.goal.set` | `S4PrimeGoalSetRequest` | `{ ok: boolean }` |
| `s4'.goal.get` | — | `S4PrimeGoalGetResponse` |
| `s4'.permission.get` | — | `PermissionBoundary` |
| `s5.bimba.navigate` | `S5BimbaNavigateRequest` | `S5BimbaNavigateResponse` |
| `s5.bimba.context` | `S5BimbaContextRequest` | `S5BimbaContextResponse` |
| `s5.bimba.search` | `S5BimbaSearchRequest` | `S5BimbaSearchResponse` |
| `s5.bimba.map` | `S5BimbaMapRequest` | `S5BimbaMapResponse` |
| `s5.m.clock` | `S5MClockRequest` | `S5MClockResponse` |
| `s5.m.oracle` | `S5MOracleRequest` | `S5MOracleResponse` |
| `s5.m.medicine` | `S5MMedicineRequest` | `S5MMedicineResponse` |
| `s5.m.transform` | `S5MTransformRequest` | `S5MTransformResponse` |
| `s5.m.lens` | `S5MLensRequest` | `LensApplication` |
| `s5.m.logos` | `S5MLogosRequest` | `S5MLogosResponse` |
| `s5.m.identity` | `S5MIdentityRequest` | `S5MIdentityResponse` |
| `s5'.mef.apply` | `S5PrimeMefApplyRequest` | `S5PrimeMefApplyResponse` |
| `s5'.mef.evaluate` | `S5PrimeMefEvaluateRequest` | `S5PrimeMefEvaluateResponse` |
| `s5'.mef.modal` | `S5PrimeMefModalRequest` | `S5PrimeMefModalResponse` |
| `s5'.ql.schema` | — | `S5PrimeQlSchemaResponse` |
| `s5'.ql.evaluate` | `S5PrimeQlEvaluateRequest` | `S5PrimeQlEvaluateResponse` |
| `s5'.kbase.search` | `S5PrimeKbaseSearchRequest` | `S5PrimeKbaseSearchResponse` |
| `s5'.kbase.add` | `S5PrimeKbaseAddRequest` | `S5PrimeKbaseAddResponse` |
| `s5'.kbase.pool` | `S5PrimeKbasePoolRequest` | `S5PrimeKbasePoolResponse` |
| `s5'.kbase.status` | `S5PrimeKbaseStatusRequest` | `S5PrimeKbaseStatusResponse` |
| `s5'.improve.status` | — | `S5PrimeImproveStatusResponse` |
| `s5'.improve.evaluate` | `S5PrimeImproveEvaluateRequest` | `AsyncAck` |
| `s5'.improve.propose` | `S5PrimeImproveProposeRequest` | `AsyncAck` |
| `s5'.improve.promote` | `S5PrimeImprovePromoteRequest` | `S5PrimeImprovePromoteResponse` |
| `s5'.improve.history` | `S5PrimeImproveHistoryRequest` | `S5PrimeImproveHistoryResponse` |
| `s5'.review.inbox` | `S5PrimeReviewInboxRequest` | `S5PrimeReviewInboxResponse` |
| `s5'.review.submit` | `S5PrimeReviewSubmitRequest` | `S5PrimeReviewSubmitResponse` |
| `s5'.review.resolve` | `S5PrimeReviewResolveRequest` | `S5PrimeReviewResolveResponse` |
| `s5'.review.history` | `S5PrimeReviewHistoryRequest` | `S5PrimeReviewHistoryResponse` |
| `s5'.gnosis.strategy` | `S5PrimeGnosisStrategyRequest` | `S5PrimeGnosisStrategyResponse` |
| `s5'.gnosis.govern` | `S5PrimeGnosisGovernRequest` | `S5PrimeGnosisGovernResponse` |
| `s5'.explain` | `S5PrimeExplainRequest` | `S5PrimeExplainResponse` |
| `s5'.teach` | `S5PrimeTeachRequest` | `S5PrimeTeachResponse` |
| `s5'.seed.generate` | `S5PrimeSeedGenerateRequest` | `S5PrimeSeedGenerateResponse` |

**Total: 108 methods — 100 from API v0.1 + 8 earlier envelope-gap methods (sync.flush, backlinks, psyche.state/update, goal.set/get, permission.get, seed.generate)**
