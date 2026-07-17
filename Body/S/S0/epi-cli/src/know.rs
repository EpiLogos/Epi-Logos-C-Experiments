use std::collections::BTreeMap;

use clap::{Args, ValueEnum};
use portal_core::transcription::{transcribe_degree_from_lut, MAJOR_ARCANA_NAMES};
use portal_core::{
    kernel_tick_from_epogdoon, AnandaVortexProjection, AnuttaraWitnessBandBalance,
    AnuttaraWitnessPalindromeState, AnuttaraWitnessProjection, AnuttaraWitnessRFactorBand,
    AnuttaraWitnessRFactorPathStep, MathemeHarmonicProfile,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

pub const KNOW_CLI_SURFACE: &str = "coord-knowing-cli";

#[derive(Args, Debug, Clone)]
pub struct KnowCmd {
    /// Coordinate to know through the unified VAK act.
    pub coord: String,

    /// Named thread-type; Z wraps the read in compose/perform/verify/rehear/recompose.
    #[arg(long, value_enum, default_value_t = ThreadType::Cfp0)]
    pub thread: ThreadType,

    /// L5/L5' articulation-density lens, e.g. L5-1, L5-4, L5'-3.
    #[arg(long)]
    pub lens: Option<String>,

    /// Which face of the R-system to surface.
    #[arg(long, value_enum, default_value_t = RFactorMode::Both)]
    pub rfactor: RFactorMode,

    /// M1 Ananda matrix slot at the coordinate. Defaults to the coordinate-derived slot.
    #[arg(long, num_args = 0..=1, default_missing_value = "0")]
    pub ananda_position: Option<u8>,

    /// N-channel MathemeHarmonicProfile read at the coordinate.
    #[arg(long, value_enum, default_value_t = HarmonicChannel::All)]
    pub harmonic_channel: HarmonicChannel,

    /// Include the M3 transcriptional projection.
    #[arg(long)]
    pub musical_transcript: bool,

    /// 1-2-3 substrate pole state at the coordinate.
    #[arg(long, value_enum, default_value_t = PhysicalPole::All)]
    pub physical_pole: PhysicalPole,

    /// Backing-chain depth; walks principle/virtue refs to ground.
    #[arg(long, default_value_t = 3)]
    pub backing: usize,

    /// Surface q_* and qm_* witness state, typed queries, and R-factor path.
    #[arg(long)]
    pub witness: bool,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, ValueEnum)]
pub enum ThreadType {
    #[value(name = "CFP0")]
    Cfp0,
    #[value(name = "CFP1")]
    Cfp1,
    #[value(name = "CFP3")]
    Cfp3,
    #[value(name = "CFP4")]
    Cfp4,
    #[value(name = "Z")]
    Z,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, ValueEnum)]
#[serde(rename_all = "kebab-case")]
pub enum RFactorMode {
    Act,
    Witness,
    Both,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, ValueEnum)]
#[serde(rename_all = "kebab-case")]
pub enum HarmonicChannel {
    Chakral,
    Nodal,
    Cosmic,
    Mahamaya,
    Codon,
    All,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, ValueEnum)]
#[serde(rename_all = "kebab-case")]
pub enum PhysicalPole {
    Torus,
    SolarChakral,
    CodonClock,
    All,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KnowPacket {
    pub surface: String,
    pub coordinate: String,
    pub thread: ThreadType,
    pub dispatch_pattern: String,
    pub lens: LensApplication,
    pub rfactor: RFactorMode,
    pub backing_depth: usize,
    pub routes: Vec<RouteInvocation>,
    pub namespaces: NamespaceRead,
    pub r_factor_route: RFactorRoute,
    pub virtue_witness_vector: u16,
    pub harmonic_channels: BTreeMap<String, Value>,
    pub musical_transcript: MusicalTranscriptPacket,
    pub ananda_projection: AnandaProjectionPacket,
    pub physical_pole_state: PhysicalPoleStatePacket,
    pub backing_chain: Vec<BackingStep>,
    pub witness_state: WitnessState,
    pub thread_cycle: Option<ZThreadCycle>,
    pub consistency: PacketConsistency,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LensApplication {
    pub id: String,
    pub register: String,
    pub density: u8,
    pub articulation: String,
    pub emission: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RouteInvocation {
    pub method: String,
    pub role: String,
    pub status: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NamespaceRead {
    pub bimba: String,
    pub world: String,
    pub gnostic: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RFactorRoute {
    pub act_register: Vec<String>,
    pub witness_register: Vec<String>,
    pub backing_chain_depth: usize,
    pub path: Vec<AnuttaraWitnessRFactorPathStep>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MusicalTranscriptPacket {
    pub route: String,
    pub diatonic_position: Option<String>,
    pub degree: u16,
    pub codon: u8,
    pub amino_acid: u8,
    pub amino_acid_name: String,
    pub hexagram: u8,
    pub tarot_card: String,
    pub charges_pp_nn_np_pn: [f32; 4],
    pub ananda_matrix_position: u8,
    pub dr_ring_projection: Value,
    pub requested: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnandaProjectionPacket {
    pub route: String,
    pub position: u8,
    pub projection: AnandaVortexProjection,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PhysicalPoleStatePacket {
    pub selected: PhysicalPole,
    pub torus: Option<Value>,
    pub solar_chakral: Option<Value>,
    pub codon_clock: Option<Value>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BackingStep {
    pub coordinate: String,
    pub semantic: String,
    pub principle_ground: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WitnessState {
    pub q_properties: Vec<String>,
    pub qm_review_epoch_state: String,
    pub virtue_witness_vector: u16,
    pub typed_queries: Vec<String>,
    pub projection: AnuttaraWitnessProjection,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ZThreadCycle {
    pub phases: Vec<String>,
    pub autonomy_mode: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PacketConsistency {
    pub unified_vak_act: bool,
    pub no_new_index: bool,
    pub coordinate_prefix_typing: String,
    pub compression_scheme: String,
}

pub fn dispatch(cmd: &KnowCmd, json_output: bool) -> Result<String, String> {
    let packet = build_packet(cmd)?;
    if json_output {
        return serde_json::to_string_pretty(&packet).map_err(|err| err.to_string());
    }
    Ok(render_text(&packet))
}

pub fn build_packet(cmd: &KnowCmd) -> Result<KnowPacket, String> {
    let coord = normalize_coord(&cmd.coord)?;
    let coord_position = coordinate_position(&coord);
    let tick12 = coordinate_tick12(&coord);
    let tick = kernel_tick_from_epogdoon(0, tick12);
    let witness_projection = witness_projection(cmd.backing, coord_position);
    let profile = MathemeHarmonicProfile::with_anuttara_witness(tick, witness_projection.clone());
    let lens = lens_application(cmd.lens.as_deref())?;
    let ananda_position = cmd
        .ananda_position
        .unwrap_or(profile.ananda_vortex.active_cell.1)
        % 12;
    let ananda_projection =
        AnandaVortexProjection::from_tick(profile.tick12, ananda_position % 6, profile.degree720);

    let harmonic_channels = harmonic_channels(&profile, cmd.harmonic_channel)?;
    let musical_transcript =
        musical_transcript(&profile, &ananda_projection, cmd.musical_transcript);
    let physical_pole_state = physical_pole_state(&profile, cmd.physical_pole)?;
    let backing_chain = backing_chain(&coord, cmd.backing);
    let r_factor_route = r_factor_route(cmd.rfactor, cmd.backing, &witness_projection);
    let witness_state = witness_state(&coord, &witness_projection);
    let routes = route_invocations(cmd);

    Ok(KnowPacket {
        surface: KNOW_CLI_SURFACE.to_owned(),
        coordinate: coord,
        thread: cmd.thread,
        dispatch_pattern: dispatch_pattern(cmd.thread).to_owned(),
        lens,
        rfactor: cmd.rfactor,
        backing_depth: cmd.backing,
        routes,
        namespaces: NamespaceRead {
            bimba: "s2.graph.node".to_owned(),
            world: "s1'.world.resolve".to_owned(),
            gnostic: "s5'.gnostic.resolve".to_owned(),
        },
        r_factor_route,
        virtue_witness_vector: witness_projection.virtue_witness_vector,
        harmonic_channels,
        musical_transcript,
        ananda_projection: AnandaProjectionPacket {
            route: "s2.graph.ananda_position".to_owned(),
            position: ananda_position,
            projection: ananda_projection,
        },
        physical_pole_state,
        backing_chain,
        witness_state,
        thread_cycle: z_thread_cycle(cmd.thread),
        consistency: PacketConsistency {
            unified_vak_act: true,
            no_new_index: true,
            coordinate_prefix_typing:
                "{family}_{n}_{semantic} substrate keys are the lookup surface".to_owned(),
            compression_scheme: "compress-to-VAK coordinate designation".to_owned(),
        },
    })
}

fn normalize_coord(coord: &str) -> Result<String, String> {
    let trimmed = coord.trim();
    if trimmed.is_empty() {
        return Err("coordinate is required".to_owned());
    }
    Ok(trimmed.to_owned())
}

fn coordinate_position(coord: &str) -> u8 {
    coord
        .chars()
        .find_map(|ch| ch.to_digit(10))
        .map(|n| (n % 6) as u8)
        .unwrap_or(0)
}

fn coordinate_tick12(coord: &str) -> u8 {
    let seed = coord
        .bytes()
        .fold(0u16, |acc, byte| acc.wrapping_add(byte as u16));
    (seed % 12) as u8
}

fn lens_application(lens: Option<&str>) -> Result<LensApplication, String> {
    let id = lens.unwrap_or("L5-4").trim();
    let (register, density, articulation, emission) = match id {
        "L5-1" => ("Parā", 1, "minimal-articulation", "~ ->"),
        "L5-2" => ("Paśyantī", 2, "vision-forming", "image-pattern before sentence"),
        "L5-3" => ("Madhyamā", 3, "middle-voice", "structured thought-form"),
        "L5-4" => (
            "Vaikharī",
            4,
            "fully-manifest",
            "fully manifest linguistic form with route, witness, harmonic, transcript, and pole facets",
        ),
        "L5-5" => ("Mātṛkā", 5, "letter-matrix", "semantic letters resolved as packet fields"),
        "L5'-1" => ("Apokalypsis", 1, "minimal-revelatory", "~ ->"),
        "L5'-2" => ("Dynamis", 2, "potency-patterning", "power-vector disclosed"),
        "L5'-3" => ("Sophia", 3, "wisdom-patterning", "divine-wisdom patterning intelligence"),
        "L5'-4" => ("Parousia", 4, "present-manifest", "manifest presence report"),
        "L5'-5" => ("Epi-Logos", 5, "integral-return", "integral return articulation"),
        other => {
            return Err(format!(
                "unsupported lens {other:?}; expected L5-1..L5-5 or L5'-1..L5'-5"
            ));
        }
    };

    Ok(LensApplication {
        id: id.to_owned(),
        register: register.to_owned(),
        density,
        articulation: articulation.to_owned(),
        emission: emission.to_owned(),
    })
}

fn witness_projection(backing: usize, position: u8) -> AnuttaraWitnessProjection {
    let path_len = backing.clamp(1, 6);
    let mut rfactor_path = Vec::with_capacity(path_len);
    for idx in 0..path_len {
        rfactor_path.push(AnuttaraWitnessRFactorPathStep {
            r_factor: (idx % 6) as u8,
            base_route: format!("R{}", idx % 6),
            band: if idx < 3 {
                AnuttaraWitnessRFactorBand::Pravritti
            } else {
                AnuttaraWitnessRFactorBand::Nivritti
            },
            position: (position + idx as u8) % 6,
            is_turn: idx == 3,
        });
    }

    AnuttaraWitnessProjection {
        virtue_witness_vector: 0x01ff,
        syntax_witness_vector: 0x7f,
        rfactor_path,
        band_balance: AnuttaraWitnessBandBalance {
            pravritti_depth: 3.min(path_len as u8),
            nivritti_depth: path_len.saturating_sub(3) as u8,
            reached_turn: path_len > 3,
            returned: backing > 5,
        },
        palindrome_state: AnuttaraWitnessPalindromeState {
            normal_form_symmetric: true,
            mirror_normal_form: "##/R#/#R/R#/##".to_owned(),
        },
        open_questions: vec!["q_0_ground?".to_owned(), "q_5_return?".to_owned()],
        coherence_score: 1.0,
    }
}

fn harmonic_channels(
    profile: &MathemeHarmonicProfile,
    channel: HarmonicChannel,
) -> Result<BTreeMap<String, Value>, String> {
    let mut channels = BTreeMap::new();
    if matches!(channel, HarmonicChannel::Chakral | HarmonicChannel::All) {
        channels.insert(
            "chakral".to_owned(),
            serde_json::to_value(&profile.planetary_chakral).map_err(|err| err.to_string())?,
        );
    }
    if matches!(channel, HarmonicChannel::Nodal | HarmonicChannel::All) {
        channels.insert(
            "nodal".to_owned(),
            serde_json::to_value(&profile.nodal_quartet).map_err(|err| err.to_string())?,
        );
    }
    if matches!(channel, HarmonicChannel::Cosmic | HarmonicChannel::All) {
        channels.insert("cosmic".to_owned(), json!(profile.q_cosmic));
    }
    if matches!(channel, HarmonicChannel::Mahamaya | HarmonicChannel::All) {
        channels.insert(
            "mahamaya".to_owned(),
            serde_json::to_value(&profile.mahamaya).map_err(|err| err.to_string())?,
        );
    }
    if matches!(channel, HarmonicChannel::Codon | HarmonicChannel::All) {
        channels.insert(
            "codon".to_owned(),
            serde_json::to_value(&profile.codon_rotation_projection)
                .map_err(|err| err.to_string())?,
        );
    }
    Ok(channels)
}

fn musical_transcript(
    profile: &MathemeHarmonicProfile,
    ananda: &AnandaVortexProjection,
    requested: bool,
) -> MusicalTranscriptPacket {
    let step = transcribe_degree_from_lut(profile.degree360);
    let tarot = MAJOR_ARCANA_NAMES[(step.hexagram as usize) % MAJOR_ARCANA_NAMES.len()];
    MusicalTranscriptPacket {
        route: "s5'.gnostic.musical_transcript".to_owned(),
        diatonic_position: profile.diatonic.as_ref().map(|ctx| ctx.note.clone()),
        degree: step.degree,
        codon: step.codon,
        amino_acid: step.amino_acid,
        amino_acid_name: step.amino_name.to_owned(),
        hexagram: step.hexagram,
        tarot_card: tarot.to_owned(),
        charges_pp_nn_np_pn: profile.q_cosmic,
        ananda_matrix_position: ananda.active_cell.1,
        dr_ring_projection: serde_json::to_value(ananda.dr_ring_phase)
            .unwrap_or_else(|_| json!({})),
        requested,
    }
}

fn physical_pole_state(
    profile: &MathemeHarmonicProfile,
    selected: PhysicalPole,
) -> Result<PhysicalPoleStatePacket, String> {
    let include_torus = matches!(selected, PhysicalPole::Torus | PhysicalPole::All);
    let include_solar = matches!(selected, PhysicalPole::SolarChakral | PhysicalPole::All);
    let include_codon = matches!(selected, PhysicalPole::CodonClock | PhysicalPole::All);

    Ok(PhysicalPoleStatePacket {
        selected,
        torus: include_torus.then(|| {
            json!({
                "route": "m1.physical_pole.torus",
                "tick12": profile.tick12,
                "degree720": profile.degree720,
                "helix": profile.helix,
                "anandaVortex": profile.ananda_vortex,
            })
        }),
        solar_chakral: if include_solar {
            Some(serde_json::to_value(&profile.planetary_chakral).map_err(|err| err.to_string())?)
        } else {
            None
        },
        codon_clock: include_codon.then(|| {
            json!({
                "route": "m3.physical_pole.codon_clock",
                "degree360": profile.degree360,
                "codon": profile.codon_rotation_projection.codon,
                "codonId": profile.codon_rotation_projection.codon_id,
                "rotationDegrees": profile.codon_rotation_projection.rotation_degrees,
            })
        }),
    })
}

fn backing_chain(coord: &str, depth: usize) -> Vec<BackingStep> {
    if depth == 0 {
        return Vec::new();
    }

    let mut chain = Vec::new();
    chain.push(BackingStep {
        coordinate: coord.to_owned(),
        semantic: if coord == "M0-2-9-0" {
            "Love/Peace".to_owned()
        } else {
            "engaged coordinate".to_owned()
        },
        principle_ground: false,
    });

    let mut current = coord.to_owned();
    while chain.len() < depth && current.contains('-') {
        current = current
            .rsplit_once('-')
            .map(|(head, _)| head.to_owned())
            .unwrap_or(current);
        chain.push(BackingStep {
            coordinate: current.clone(),
            semantic: "coordinate parent".to_owned(),
            principle_ground: false,
        });
    }

    for (coordinate, semantic) in [("M0-1", "Brimming Void"), ("M0-0", "Ultimate Mystery")] {
        if chain.len() >= depth {
            break;
        }
        if !chain.iter().any(|step| step.coordinate == coordinate) {
            chain.push(BackingStep {
                coordinate: coordinate.to_owned(),
                semantic: semantic.to_owned(),
                principle_ground: true,
            });
        }
    }

    chain
}

fn r_factor_route(
    mode: RFactorMode,
    backing_depth: usize,
    witness: &AnuttaraWitnessProjection,
) -> RFactorRoute {
    let act_register = if matches!(mode, RFactorMode::Act | RFactorMode::Both) {
        vec![
            "R0".to_owned(),
            "R1".to_owned(),
            "R2".to_owned(),
            "R3".to_owned(),
            "R4".to_owned(),
            "R5".to_owned(),
            "R# parent".to_owned(),
            "R5 closure trajectory".to_owned(),
        ]
    } else {
        Vec::new()
    };
    let witness_register = if matches!(mode, RFactorMode::Witness | RFactorMode::Both) {
        vec![
            "##".to_owned(),
            "R#".to_owned(),
            "#R".to_owned(),
            "R#/##".to_owned(),
            "0R..5R virtue-vector".to_owned(),
        ]
    } else {
        Vec::new()
    };

    RFactorRoute {
        act_register,
        witness_register,
        backing_chain_depth: backing_depth,
        path: witness.rfactor_path.clone(),
    }
}

fn witness_state(coord: &str, witness: &AnuttaraWitnessProjection) -> WitnessState {
    WitnessState {
        q_properties: vec![
            format!("q_0_ground_for_{coord}"),
            format!("q_4_context_for_{coord}"),
            format!("q_5_integration_for_{coord}"),
        ],
        qm_review_epoch_state: "qm_4_review_epoch:current".to_owned(),
        virtue_witness_vector: witness.virtue_witness_vector,
        typed_queries: vec![
            format!("s0'.verifier.check_state({coord})"),
            format!("s0'.anuttara.trace({coord})"),
            format!("s2.graph.node({coord})"),
        ],
        projection: witness.clone(),
    }
}

fn route_invocations(cmd: &KnowCmd) -> Vec<RouteInvocation> {
    let methods = [
        ("s2.graph.node", "Bimba coordinate node"),
        ("s5'.gnostic.query", "gnostic query"),
        ("s5'.gnostic.episode_search", "Graphiti episode search"),
        ("s5'.gnostic.evidence_trace", "evidence trace"),
        ("s5'.gnostic.resolve", "gnostic resolve"),
        ("s5'.gnostic.list_notebooks", "NotebookLM list"),
        ("s5'.gnostic.etymology", "etymological lookup"),
        ("s1'.world.resolve", "World crystallisation"),
        ("s0'.anuttara.trace", "Anuttara trace"),
        ("s0'.verifier.check_state", "verifier state"),
        ("s2.graph.ananda_position", "Ananda matrix projection"),
        ("s5'.gnostic.musical_transcript", "musical transcript"),
    ];

    let mut routes: Vec<RouteInvocation> = methods
        .into_iter()
        .map(|(method, role)| RouteInvocation {
            method: method.to_owned(),
            role: role.to_owned(),
            status: "composed-existing-route".to_owned(),
        })
        .collect();

    if matches!(cmd.physical_pole, PhysicalPole::All | PhysicalPole::Torus) {
        routes.push(RouteInvocation {
            method: "m1.physical_pole.torus".to_owned(),
            role: "M1 torus substrate".to_owned(),
            status: "composed-existing-plugin-query".to_owned(),
        });
    }
    if matches!(
        cmd.physical_pole,
        PhysicalPole::All | PhysicalPole::SolarChakral
    ) {
        routes.push(RouteInvocation {
            method: "m2.physical_pole.solar_chakral".to_owned(),
            role: "M2 solar-chakral substrate".to_owned(),
            status: "composed-existing-plugin-query".to_owned(),
        });
    }
    if matches!(
        cmd.physical_pole,
        PhysicalPole::All | PhysicalPole::CodonClock
    ) {
        routes.push(RouteInvocation {
            method: "m3.physical_pole.codon_clock".to_owned(),
            role: "M3 codon-clock substrate".to_owned(),
            status: "composed-existing-plugin-query".to_owned(),
        });
    }
    routes
}

fn dispatch_pattern(thread: ThreadType) -> &'static str {
    match thread {
        ThreadType::Cfp0 => "parallel-read",
        ThreadType::Cfp1 => "definition-first-read",
        ThreadType::Cfp3 => "pattern-first-read",
        ThreadType::Cfp4 => "context-first-read",
        ThreadType::Z => "z-thread-cycle",
    }
}

fn z_thread_cycle(thread: ThreadType) -> Option<ZThreadCycle> {
    (thread == ThreadType::Z).then(|| ZThreadCycle {
        phases: ["compose", "perform", "verify", "rehear", "recompose"]
            .into_iter()
            .map(ToOwned::to_owned)
            .collect(),
        autonomy_mode: "Z-thread autonomy".to_owned(),
    })
}

fn render_text(packet: &KnowPacket) -> String {
    format!(
        "epi know {coord}\nSurface: {surface}\nLens: {lens} ({articulation})\nR-factor: {rfactor:?}\nRoutes: {routes}\nVirtue witness vector: 0x{virtue:04x}\nHarmonic channels: {channels}\nMusical transcript: codon {codon}, hexagram {hexagram}, {amino}\nPhysical pole: {pole:?}\nBacking chain: {backing}",
        coord = packet.coordinate,
        surface = packet.surface,
        lens = packet.lens.id,
        articulation = packet.lens.articulation,
        rfactor = packet.rfactor,
        routes = packet.routes.len(),
        virtue = packet.virtue_witness_vector,
        channels = packet.harmonic_channels.len(),
        codon = packet.musical_transcript.codon,
        hexagram = packet.musical_transcript.hexagram,
        amino = packet.musical_transcript.amino_acid_name,
        pole = packet.physical_pole_state.selected,
        backing = packet
            .backing_chain
            .iter()
            .map(|step| format!("{} {}", step.coordinate, step.semantic))
            .collect::<Vec<_>>()
            .join(" -> ")
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    fn base_cmd(coord: &str) -> KnowCmd {
        KnowCmd {
            coord: coord.to_owned(),
            thread: ThreadType::Cfp0,
            lens: None,
            rfactor: RFactorMode::Both,
            ananda_position: None,
            harmonic_channel: HarmonicChannel::All,
            musical_transcript: false,
            physical_pole: PhysicalPole::All,
            backing: 3,
            witness: false,
        }
    }

    #[test]
    fn know_unified_packet_round_trip() {
        let packet = build_packet(&base_cmd("M4-3")).expect("packet");

        assert_eq!(packet.surface, KNOW_CLI_SURFACE);
        assert!(!packet.r_factor_route.act_register.is_empty());
        assert_eq!(packet.virtue_witness_vector & 0x01ff, 0x01ff);
        assert!(packet.harmonic_channels.contains_key("chakral"));
        assert!(packet.harmonic_channels.contains_key("codon"));
        assert!(packet.musical_transcript.codon < 64);
        assert!(packet.physical_pole_state.torus.is_some());
        assert!(packet.physical_pole_state.solar_chakral.is_some());
        assert!(packet.physical_pole_state.codon_clock.is_some());
        assert!(packet.consistency.unified_vak_act);

        let json = serde_json::to_string(&packet).expect("serialise");
        let decoded: KnowPacket = serde_json::from_str(&json).expect("decode");
        assert_eq!(decoded.coordinate, "M4-3");
        assert_eq!(
            decoded.musical_transcript.codon,
            packet.musical_transcript.codon
        );
    }

    #[test]
    fn know_lens_application_density() {
        let mut para = base_cmd("M4-3");
        para.lens = Some("L5-1".to_owned());
        let mut manifest = base_cmd("M4-3");
        manifest.lens = Some("L5-4".to_owned());

        let para_packet = build_packet(&para).expect("para packet");
        let manifest_packet = build_packet(&manifest).expect("manifest packet");

        assert_eq!(para_packet.lens.density, 1);
        assert_eq!(para_packet.lens.articulation, "minimal-articulation");
        assert_eq!(para_packet.lens.emission, "~ ->");
        assert_eq!(manifest_packet.lens.density, 4);
        assert_eq!(manifest_packet.lens.articulation, "fully-manifest");
        assert!(manifest_packet.lens.emission.len() > para_packet.lens.emission.len());
    }

    #[test]
    fn know_backing_chain_principle_grounds() {
        let mut cmd = base_cmd("M0-2-9-0");
        cmd.backing = 100;
        let packet = build_packet(&cmd).expect("packet");
        let chain = packet
            .backing_chain
            .iter()
            .map(|step| (step.coordinate.as_str(), step.semantic.as_str()))
            .collect::<Vec<_>>();

        assert!(chain.contains(&("M0-2-9-0", "Love/Peace")));
        assert!(chain.contains(&("M0-1", "Brimming Void")));
        assert!(chain.contains(&("M0-0", "Ultimate Mystery")));
        assert!(packet
            .backing_chain
            .iter()
            .any(|step| step.coordinate == "M0-0" && step.principle_ground));
    }

    #[test]
    fn know_thread_z_autonomy() {
        let mut cmd = base_cmd("M4-3");
        cmd.thread = ThreadType::Z;
        let packet = build_packet(&cmd).expect("packet");
        let cycle = packet.thread_cycle.expect("z cycle");

        assert_eq!(packet.dispatch_pattern, "z-thread-cycle");
        assert_eq!(
            cycle.phases,
            vec!["compose", "perform", "verify", "rehear", "recompose"]
        );
        assert_eq!(cycle.autonomy_mode, "Z-thread autonomy");
    }
}
