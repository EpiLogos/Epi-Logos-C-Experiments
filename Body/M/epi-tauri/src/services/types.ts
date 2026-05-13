// Canonical TS types mirroring Rust structs across the Tauri IPC boundary.
// Hand-maintained — future path: ts-rs codegen from Rust.

// ── Portal Clock ──────────────────────────────────────────────────────

export interface OracleFaces {
  primary_degree: number;
  deficient_degree: number;
  implicate_degree: number;
  temporal_hex: number;
  primary_hex: number;
  changing_lines_mask: number;
}

export type Quaternion = [number, number, number, number];
export type Vec3 = [number, number, number];

export type CodonClass =
  | 'PerfectPalindromic'
  | 'ImperfectPalindromic'
  | 'NonPalindromicNonDual'
  | 'Dual';

export interface ActiveCodon {
  codon_a: number;
  codon_b: number;
  class_a: CodonClass;
  class_b: CodonClass;
  sequence_a: [number, number, number];
  amino_acid: number;
  anticodon: number;
  rotation_count_a: number;
}

export interface PlanetaryAspect {
  planet_a: number;
  planet_b: number;
  aspect_type: number;
  angle: number;
  orb: number;
}

export type WalkMode = 'Ground' | 'Torus' | 'Fiber' | 'Spanda';

export interface PlanetState {
  degree: number;
  is_retrograde: boolean;
  is_resonance: boolean;
  transiting_hex: number;
  transiting_tarot: number;
  transiting_chakra: number;
}

export interface KairosState {
  planets: PlanetState[];
  current_hour: number;
  hour_planet: number;
  active_chakra: number;
  timestamp: number;
  valid: boolean;
}

export interface PortalClockState {
  session_hash: number[];
  live_quaternion: Quaternion;
  composed_quaternion: Quaternion;
  quintessence_quaternion: Quaternion;
  current_degree: number;
  tick12: number;
  last_cast: OracleFaces | null;
  last_cast_timestamp: number;
  chakra_levels: number[];
  active_branch_lens: number;
  transform_stage: number;
  logos_stage: number;
  kairos: KairosState;
  orbital_position: Vec3;
  ql_position: number;
  walk_mode: WalkMode;
  bifurcation_param: number;
  resolution_level: number;
  active_codon: ActiveCodon;
  transit_quaternion: Quaternion;
  aspects: PlanetaryAspect[];
  micro_orbit: number[];
  natal_degrees: number[];
  generation: number;
  zoom_level: number;
}

// ── Graph ─────────────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  labels: string[];
  properties: Record<string, unknown>;
  coordinate: string | null;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  rel_type: string;
  properties: Record<string, unknown>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type WalkKind = 'topological' | 'semantic' | 'temporal';

export interface GraphWalkResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  depth_reached: number;
}

// ── Geometry ──────────────────────────────────────────────────────────

export interface BimbaPosition {
  x: number;
  y: number;
  z: number;
}

export type GeometryClass =
  | { class: 'hexagonal_6_fold' }
  | { class: 'double_hexagon_12_fold'; offset_degrees: number }
  | { class: 'triangular_3_fold' }
  | { class: 'square_4_fold' }
  | { class: 'octahedral' }
  | { class: 'icosahedral' }
  | { class: 'torus_genus_n'; genus: number }
  | { class: 'klein_bottle' }
  | { class: 'custom'; id: string };

export type GeometrySource =
  | { source: 'detected'; confidence: number }
  | { source: 'frontmatter' }
  | { source: 'manual' };

export interface SubGraphGeometry {
  root_coordinate: string;
  class: GeometryClass;
  orientation_quaternion: Quaternion;
  scale: number;
  source: GeometrySource;
}

// ── Vault ─────────────────────────────────────────────────────────────

export interface DailyNote {
  date: string;
  content: string;
  path: string;
}

export interface EntryMetadata {
  path: string;
  name: string;
  size: number;
  modified: number;
  section: string;
}

export interface FlowMetadata {
  content_hash: string;
  word_count: number;
  highlight_count: number;
}

export interface FlowEntry {
  date: string;
  content: string;
  metadata: FlowMetadata;
  version: number;
}

export interface FileTreeNode {
  name: string;
  path: string;
  is_dir: boolean;
  section: string;
  children: FileTreeNode[];
}

export interface BacklinksData {
  target: string;
  backlinks: BacklinkEntry[];
}

export interface BacklinkEntry {
  source_path: string;
  line_number: number;
  context: string;
}

// ── Highlight Registry ────────────────────────────────────────────────

export type HighlightCategoryId = string;

export interface HighlightCategory {
  id: HighlightCategoryId;
  display_name: string;
  default_color: string;
  description: string;
  envelope_template: EnvelopeTemplate;
  output_target: OutputTarget;
  is_custom: boolean;
}

export type EnvelopeTemplate =
  | { kind: 'inline'; inline_kind: string }
  | { kind: 'oracle_call' }
  | { kind: 'dream_analysis' }
  | { kind: 'daily_note_append'; section: string }
  | { kind: 'entry_create'; template: string }
  | { kind: 'anima_invocation'; skill: string }
  | { kind: 'aletheia_crystallise' }
  | { kind: 'custom'; handler: string };

export type OutputTarget =
  | { target: 'inline_rewrite' }
  | { target: 'daily_note_section'; p: number }
  | { target: 'oracle_log' }
  | { target: 'dream_log' }
  | { target: 'entry_folder' }
  | { target: 'inbox' }
  | { target: 'external'; channel: string };

export interface FlowHighlight {
  id: string;
  category: HighlightCategoryId;
  from: number;
  to: number;
  text: string;
  timestamp: number;
}

// ── Oracle ────────────────────────────────────────────────────────────

export type Arcana = 'Major' | 'Minor';
export type Suit = 'Wands' | 'Cups' | 'Swords' | 'Pentacles';
export type Element = 'Fire' | 'Water' | 'Air' | 'Earth';

export interface TarotCard {
  id: number;
  name: string;
  arcana: Arcana;
  suit: Suit | null;
  rank: number | null;
  keywords: string[];
  element: Element | null;
  hebrew_letter: string | null;
}

export interface TarotCast {
  cast_id: string;
  spread: TarotSpread;
  cards: DrawnCard[];
  origin: CastOrigin;
  timestamp: number;
  kairos_snapshot: KairosState | null;
  composed_quaternion_at_cast: Quaternion;
  source_highlight_id: string | null;
  interpretation: string | null;
}

export type TarotSpread =
  | 'single'
  | 'three_card'
  | 'celtic_cross'
  | { custom: { name: string; positions: number } };

export interface DrawnCard {
  position: number;
  position_meaning: string;
  card_id: number;
  reversed: boolean;
}

export type CastOrigin =
  | { type: 'live_draw' }
  | { type: 'randomness_engine'; seed: number };

export interface IChingHexagram {
  king_wen: number;
  name: string;
  upper: string;
  lower: string;
  binary: number;
}

export interface IChingCast {
  cast_id: string;
  primary_hex: number;
  changing_lines_mask: number;
  temporal_hex: number;
  method: 'three_coin' | 'yarrow_stalks' | 'recorded_only';
  origin: CastOrigin;
  timestamp: number;
  source_highlight_id: string | null;
  interpretation: string | null;
}

// ── Atelier ───────────────────────────────────────────────────────────

export type WordRegister = 'constitutional' | 'situational';
export type Confidence = 'certain' | 'probable' | 'speculative';

export interface AtelierWord {
  id: string;
  word: string;
  pie_root: string | null;
  definition: string | null;
  register: WordRegister | null;
  confidence: Confidence | null;
  cited_source: string | null;
}

export interface AtelierConstellation {
  id: string;
  constellation_id: string;
  name: string;
  fold: number;
  description: string | null;
  words: ConstellationMember[];
}

export interface ConstellationMember {
  word_id: string;
  word: string;
  ordinal: number;
  ql_position: number;
  essence: string | null;
}

export interface AtelierAphorism {
  id: string;
  aphorism_id: string;
  text: string;
  constellation_id: string | null;
  bimba_resonances: string[];
}

export interface AtelierSession {
  session_id: string;
  user_id_hash: string;
  started_at: number;
  words_explored: string[];
  constellations_formed: string[];
  aphorisms_crystallised: string[];
}

// ── Temporal / Runtime ────────────────────────────────────────────────

export interface PortalRuntimeState {
  day_id: string;
  now_path: string;
}

export interface ClockPresenceRow {
  session_hash: number[];
  pratibimba_coord: string;
  visibility: string;
  composed_quaternion: Quaternion;
  current_degree: number;
  tick12: number;
  walk_mode: number;
  orbital_position: Vec3;
  fibre_phase: number;
  last_cast_timestamp: number | null;
  label: string | null;
  updated_at: number;
}

export interface LocalPresence {
  composed_quaternion: Quaternion;
  current_degree: number;
  tick12: number;
  walk_mode: number;
  orbital_position: Vec3;
  fibre_phase: number;
}

// ── Gateway ───────────────────────────────────────────────────────────

export interface GatewayConfig {
  url: string;
  token?: string;
  password?: string;
}

// ── Library ───────────────────────────────────────────────────────────

export type LibraryNamespace = 'bimba' | 'gnostic' | 'atelier' | 'all';

export interface LibrarySearchResult {
  id: string;
  title: string;
  excerpt: string;
  score: number;
  source_path: string | null;
  coordinate: string | null;
  labels: string[];
}

export interface LibrarySearchQuery {
  query: string;
  namespace?: LibraryNamespace;
  limit?: number;
  min_score?: number;
}

export interface GraphitiEpisode {
  episode_id: string;
  arc_type: string;
  summary: string;
  timestamp: number;
  references: string[];
}

// ── Agent ─────────────────────────────────────────────────────────────

export interface InvocationEnvelope {
  kind: string;
  modality: string;
  session_key: string;
  payload: Record<string, unknown>;
  day_now: PortalRuntimeState | null;
  coordinate: string;
}

export interface AgentRunHandle {
  run_id: string;
  status: string;
}

export interface AgentRunEvent {
  run_id: string;
  event_type: string;
  data: unknown;
  timestamp: number;
}

export interface AgentDescriptor {
  name: string;
  coordinate: string;
  description: string;
  capabilities: string[];
}

// ── Settings ──────────────────────────────────────────────────────────

export interface Settings {
  gateway_url: string;
  gateway_token: string | null;
  gateway_password: string | null;
  neo4j_url: string;
  neo4j_user: string;
  neo4j_password: string | null;
  spacetime_mode: SpacetimeMode;
  spacetime_url: string;
  theme: string;
}

export type SpacetimeMode =
  | { mode: 'polling'; interval_ms: number }
  | { mode: 'native_web_socket' }
  | { mode: 'disabled' };

// ── MEF ───────────────────────────────────────────────────────────────

export type MefLensId = 0 | 1 | 2 | 3 | 4 | 5;

export interface MefLens {
  id: MefLensId;
  name: string;
  description: string;
}

// ── QL Position Colors ────────────────────────────────────────────────

export const QL_COLORS: Record<number, string> = {
  0: '#f472b6', // pink — Ground
  1: '#fb923c', // orange — Form
  2: '#facc15', // yellow — Entity
  3: '#4ade80', // green — Process
  4: '#60a5fa', // blue — Type
  5: '#c084fc', // purple — Integration
};
