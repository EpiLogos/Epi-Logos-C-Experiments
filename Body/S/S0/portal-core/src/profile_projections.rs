use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::vak_address::VakAddress;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum MonoPolyOperator {
    Mono,
    Poly,
    ActuallyMany,
    PotentiallyOne,
    ActualisingOne,
    PotentiatingMany,
    MonoPoly,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum PerspectiveRole {
    FirstPerson,
    SecondPerson,
    FirstPersonPlural,
    ThirdPerson,
    CollectiveWe,
    IntegralWeI,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum NaraFamilyRole {
    Father,
    Mother,
    Son,
    Daughter,
    Tao,
    IntegralConsciousness,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum PasuReviewRisk {
    None,
    ForcedUnification,
    PrivacyBoundary,
    CanonCandidate,
}

impl PasuReviewRisk {
    pub fn for_operator(operator: MonoPolyOperator) -> Self {
        match operator {
            MonoPolyOperator::ActualisingOne => Self::ForcedUnification,
            _ => Self::None,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BeingEntityRef {
    pub entity_id: String,
    pub entity_kind: String,
    pub graph_anchor: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub public_label: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StableIdentityHandle {
    pub graph_anchor: String,
    pub identity_handle: String,
    pub source: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BeingPatternProtectedRef {
    pub episode_id: String,
    pub source_ref: String,
    pub public_summary: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PasuLiveStateHandle {
    pub spacetime_row_id: String,
    #[serde(rename = "streamGeneration", alias = "generation")]
    pub generation: u64,
    pub redis_psyche: BTreeMap<String, String>,
    pub day_ref: String,
    pub now_ref: String,
    pub stream_delta: String,
    pub graphiti_episode_refs: Vec<BeingPatternProtectedRef>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BeingObserverAnchor {
    pub observer_entity_id: String,
    pub observer_role: PerspectiveRole,
    pub anchor_ref: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BeingPatternClockAddress {
    pub degree360: u16,
    pub tick12: u8,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub hexagram: Option<u8>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub line: Option<u8>,
    pub source: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M2M3RelationProjection {
    pub relation_handle: String,
    pub planetary_lens_aspect: String,
    pub source: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BioQuaternionHandle {
    pub handle: String,
    pub privacy: String,
    pub source: String,
}

#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ElementalWeightProjection {
    pub fire: f32,
    pub water: f32,
    pub air: f32,
    pub earth: f32,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BeingPatternRelationEdge {
    pub edge_id: String,
    pub source_entity_id: String,
    pub target_entity_id: String,
    pub edge_kind: String,
    pub aspect_label: String,
    pub generation: u64,
    pub m2_m3_relation: M2M3RelationProjection,
    pub elemental_delta: ElementalWeightProjection,
    pub verifier_refs: Vec<BeingPatternProtectedRef>,
    pub canon_status: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PasuBeingPatternProjection {
    pub entity_ref: BeingEntityRef,
    pub stable_identity: StableIdentityHandle,
    pub live_state: PasuLiveStateHandle,
    pub observer_anchor: BeingObserverAnchor,
    pub clock_address: BeingPatternClockAddress,
    pub monopoly_operator: MonoPolyOperator,
    pub perspective_role: PerspectiveRole,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub nara_family_role: Option<NaraFamilyRole>,
    pub m2_m3_relation: M2M3RelationProjection,
    pub bioquaternion_handles: Vec<BioQuaternionHandle>,
    pub elemental_weights: ElementalWeightProjection,
    pub relation_edges: Vec<BeingPatternRelationEdge>,
    pub verifier_refs: Vec<BeingPatternProtectedRef>,
    pub review_risk: PasuReviewRisk,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum AnuttaraWitnessRFactorBand {
    Pravritti,
    Nivritti,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnuttaraWitnessRFactorPathStep {
    pub r_factor: u8,
    pub base_route: String,
    pub band: AnuttaraWitnessRFactorBand,
    pub position: u8,
    pub is_turn: bool,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnuttaraWitnessBandBalance {
    pub pravritti_depth: u8,
    pub nivritti_depth: u8,
    pub reached_turn: bool,
    pub returned: bool,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnuttaraWitnessPalindromeState {
    pub normal_form_symmetric: bool,
    pub mirror_normal_form: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnuttaraWitnessProjection {
    pub virtue_witness_vector: u16,
    pub syntax_witness_vector: u8,
    pub rfactor_path: Vec<AnuttaraWitnessRFactorPathStep>,
    pub band_balance: AnuttaraWitnessBandBalance,
    pub palindrome_state: AnuttaraWitnessPalindromeState,
    pub open_questions: Vec<String>,
    pub coherence_score: f32,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnuttaraLayerProjection {
    pub active_layer: M0LayerView,
    pub data_layers: Vec<M0LayerView>,
    pub relation_family_partition: Option<RelationFamilyPartition>,
    pub kernel_core_audit: KernelCoreAuditState,
    pub asset_handles: Vec<AssetHandle>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum M0LayerView {
    Language,
    QlStructure,
    Relations,
    CommunityTime,
    PersonalBridge,
    PedagogyBridge,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RelationFamilyPartition {
    pub structural: u16,
    pub correspondential: u16,
    pub kernel_core: u16,
    pub inferred: u16,
    pub review_pending: u16,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelCoreAuditState {
    pub present: u8,
    pub missing: u8,
    pub mismatched: u8,
    pub provenance: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssetHandle {
    pub asset_uri: String,
    pub asset_kind: String,
    pub provenance: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M1TopologyProjection {
    pub double_cover_deg: u16,
    pub torus_genus: u8,
    pub euler_characteristic: i8,
    pub hopf_project_deg: u16,
    pub hopf_fiber: u8,
    pub hopf_identity: String,
    pub ring_quaternion: [f32; 4],
    pub element_count: u8,
    pub composed_quaternion: [f32; 4],
    pub walk_mode: String,
    pub bifurcation_lambda: f32,
    pub resolution_level: u8,
    pub torus_knot_phase: TorusKnotPhase,
    pub parent_attribution: String,
    pub prior_ground: String,
    pub downstream_double_torus: String,
}

#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TorusKnotPhase {
    pub p: f32,
    pub q: f32,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InversionOperatorHandle {
    pub operator: String,
    pub handle: String,
    pub provenance: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CanonicalSourceHandle {
    pub source_id: String,
    pub coordinate: String,
    pub canon_ref: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M1InstanceHandle {
    pub instance_id: String,
    pub coordinate: String,
    pub state_handle: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QLFloweringProjection {
    pub flowering_id: String,
    pub position_refs: Vec<String>,
    pub provenance: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ParashaktiMeaningProjection {
    pub address72: u8,
    pub axis_views: AxisViewsProjection,
    pub klein_flip: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub routing_trace: Option<String>,
    pub det_projection: DetProjection64,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AxisViewsProjection {
    pub mef: String,
    pub tattva_phase: String,
    pub decan_face: String,
    pub shem: String,
    pub maqam: String,
    pub det: String,
    pub planetary_axis: PlanetaryAxisProjection,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlanetaryAxisProjection {
    pub earth_centre_semantic: bool,
    pub observer_policy: String,
    pub source_handle: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DetProjection64 {
    pub address64: u8,
    pub epogdoon_ratio: String,
    pub provenance: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OracleFrameProjection {
    pub frame_id: String,
    pub subject_ref: String,
    pub deck_manifest_id: String,
    pub deck_order_hash: String,
    pub entropy_mode: String,
    pub entropy_provenance: String,
    pub spread_grammar: String,
    pub vak_address: VakAddress,
    pub cp_position_refs: Vec<String>,
    pub reading_frame: ReadingFrameProjection,
    pub day_ref: String,
    pub now_ref: String,
    pub redis_psyche_handle: String,
    pub kbase_source_pool_handle: String,
    pub graph_provenance_handles: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReadingFrameProjection {
    pub positions: Vec<ReadingPosition>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReadingPosition {
    pub cp_ref: String,
    pub label: String,
    pub index: u8,
}

impl ReadingPosition {
    pub fn cp_ref(&self) -> &str {
        &self.cp_ref
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TranscriptionalClockPacket {
    pub packet_id: String,
    pub clock: Value,
    pub aperture: Value,
    pub lens_stack: MahamayaLensStack,
    pub codon: Value,
    pub generation: Value,
    pub transcription: Value,
    pub expression: Value,
    pub vak: VakAddress,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub oracle_frame_ref: Option<String>,
    pub readiness: Value,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MahamayaLensStack {
    pub stack_id: String,
    pub aperture_count: u8,
    pub active_segments: Vec<u8>,
    pub fibonacci_ground_ref: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SymbolicProteinProjection {
    pub sequence_id: String,
    pub frame_id: String,
    pub sequence_mode: String,
    pub packet_refs: Vec<String>,
    pub packets: Vec<TranscriptionalClockPacket>,
    pub tarot_sequence_refs: Vec<String>,
    pub iching_sequence_refs: Vec<String>,
    pub codon_sequence_refs: Vec<String>,
    pub modulators: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub nara_pattern_packet_handle: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OracleSequenceProjection {
    pub sequence_id: String,
    pub frame_id: String,
    pub sequence_mode: String,
    pub symbolic_protein_ref: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CouplingFlowAlignment {
    pub symbolic_skeletons: Vec<String>,
    pub physics_descent: Vec<String>,
    pub measurement_faces: Vec<String>,
    pub recognition_context: RecognitionContext,
    pub caveats: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecognitionContext {
    pub warrant: String,
    pub handles: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PersonalPoleProjection {
    pub privacy: String,
    pub q_personal_handle: ProtectedHandle,
    pub q_composed_handle: ProtectedHandle,
    pub q_transit_handle: ProtectedHandle,
    pub q_activity_handle: ProtectedHandle,
    pub bioquaternion_handle: ProtectedHandle,
    pub pattern_packet_handle: ProtectedHandle,
    pub psychoid_field_handle: ProtectedHandle,
    pub oracle_frame_handle: ProtectedHandle,
    pub symbolic_protein_handle: ProtectedHandle,
    pub nara_deck_context_handle: ProtectedHandle,
    pub vama_recognition_handle: ProtectedHandle,
    pub resonance: PersonalPoleResonance,
    pub elemental_balance: PersonalPoleElementalBalance,
    pub torus_knot_phase: TorusKnotPhase,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProtectedHandle {
    pub target_kind: String,
    pub handle: String,
    pub privacy: String,
}

impl ProtectedHandle {
    pub fn new(target_kind: impl Into<String>, handle: impl Into<String>) -> Self {
        Self {
            target_kind: target_kind.into(),
            handle: handle.into(),
            privacy: "protected-local-body".to_owned(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PersonalPoleResonance {
    pub score: f32,
    pub conjugate_form_character: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PersonalPoleElementalBalance {
    pub earth: f32,
    pub fire: f32,
    pub water: f32,
    pub air: f32,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum CompositionLoadStatus {
    ReadyFull,
    ReadyBaseOnly,
    ReadyNoCodon,
    ReadyNoCymatic,
    BlockedBaseMissing,
    Pending,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum CosmicDegradationLevel {
    ReadyFull,
    ReadyBaseOnly,
    ReadyNoCodon,
    ReadyNoCymatic,
    BlockedBaseMissing,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CosmicCompositionMountPoint {
    pub contributor_id: String,
    pub coordinate: String,
    pub mount_point: String,
    pub load_status: CompositionLoadStatus,
    pub handle: ProtectedHandle,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CosmicCompositionState {
    pub load_status: CompositionLoadStatus,
    pub degradation_level: CosmicDegradationLevel,
    pub mount_points: Vec<CosmicCompositionMountPoint>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum PsychoidFieldReadiness {
    DeterministicLowerFidelity,
    FullPhysicsRunning,
    Pending,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum PsychoidDipyramidLocusRole {
    TopApex,
    BottomApex,
    BaseSquare,
    InvertedBase,
    CentralAxisPoint,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PsychoidDipyramidLocus {
    pub locus_id: String,
    pub role: PsychoidDipyramidLocusRole,
    pub position_refs: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PsychoidDipyramidGeometry {
    pub topology: String,
    pub logical_position_count: u8,
    pub hopf_linked_tori: bool,
    pub loci: Vec<PsychoidDipyramidLocus>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PsychoidFieldProjection {
    pub field_handle: ProtectedHandle,
    pub cymatic_signature: Vec<f32>,
    pub hopf_s2_projection: [f32; 3],
    pub torus_knot_phase_handle: ProtectedHandle,
    pub field_readiness: PsychoidFieldReadiness,
    pub dipyramid_geometry: PsychoidDipyramidGeometry,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum CanonWriteBackState {
    DryRun,
    PendingReview,
    Applied,
    Rejected,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CanonRecognitionEvent {
    pub bimba_coordinate: String,
    pub pattern_packet_handle: String,
    pub atelier_scent_path: Vec<String>,
    pub recognition_degree720: u16,
    pub write_back_state: CanonWriteBackState,
    pub recognized_at_ms: u64,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EpiiReviewWorkbenchProjection {
    pub inbox_summary: Value,
    pub capacity_lanes: Vec<String>,
    pub spine_inspector: Value,
    pub recursive_gates: Vec<String>,
    pub aletheia_lineages: Vec<String>,
    pub day_now_anchor: DayNowAnchor,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DayNowAnchor {
    pub day_id: String,
    pub now_path: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CanonRecognitionAnchor {
    pub mahamaya64: PointerAnchorProjection,
    pub parashakti72: PointerAnchorProjection,
    pub paramasiva_plus1: PointerAnchorProjection,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PointerAnchorProjection {
    pub coordinate: String,
    pub handle: String,
}
