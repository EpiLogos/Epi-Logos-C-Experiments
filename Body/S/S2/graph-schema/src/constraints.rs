pub const CONSTRAINTS: &[&str] = &[
    "CREATE CONSTRAINT bimba_coord_unique IF NOT EXISTS FOR (n:Bimba) REQUIRE n.coordinate IS UNIQUE",
    "CREATE CONSTRAINT bimba_uuid_unique IF NOT EXISTS FOR (n:Bimba) REQUIRE n.c_2_uuid IS UNIQUE",
];

pub const INDEXES: &[&str] = &[
    "CREATE INDEX coord_family IF NOT EXISTS FOR (n:Bimba) ON (n.c_4_family)",
    "CREATE INDEX coord_position IF NOT EXISTS FOR (n:Bimba) ON (n.c_4_ql_position)",
    "CREATE INDEX coord_layer IF NOT EXISTS FOR (n:Bimba) ON (n.c_4_layer)",
    "CREATE INDEX coord_c_layer_role IF NOT EXISTS FOR (n:Bimba) ON (n.c_layer_role)",
    "CREATE INDEX coord_semantic_authority IF NOT EXISTS FOR (n:Bimba) ON (n.semantic_authority)",
    "CREATE INDEX coord_world_type_path IF NOT EXISTS FOR (n:Bimba) ON (n.world_type_path)",
    "CREATE INDEX coord_crystallisation_state IF NOT EXISTS FOR (n:Bimba) ON (n.crystallisation_state)",
    "CREATE INDEX coord_topo IF NOT EXISTS FOR (n:Bimba) ON (n.c_4_topo_mode)",
    "CREATE INDEX coord_vault_path IF NOT EXISTS FOR (n:Bimba) ON (n.s_1_vault_path)",
    "CREATE INDEX coord_source_dataset IF NOT EXISTS FOR (n:Bimba) ON (n.c_3_source_dataset)",
    "CREATE INDEX coord_dataset_branch IF NOT EXISTS FOR (n:Bimba) ON (n.c_3_dataset_branch)",
    "CREATE INDEX coord_ct_type IF NOT EXISTS FOR (n:Bimba) ON (n.c_1_ct_type)",
    "CREATE INDEX coord_artifact_role IF NOT EXISTS FOR (n:Bimba) ON (n.c_4_artifact_role)",
    "CREATE INDEX coord_kernel_resonance_index IF NOT EXISTS FOR (n:Bimba) ON (n.c_5_kernel_resonance_index)",
    "CREATE INDEX coord_kernel_resonance_square IF NOT EXISTS FOR (n:Bimba) ON (n.c_5_kernel_resonance_square)",
    "CREATE INDEX coord_kernel_tick IF NOT EXISTS FOR (n:Bimba) ON (n.c_5_kernel_tick)",
    "CREATE INDEX coord_pointer_count IF NOT EXISTS FOR (n:Bimba) ON (n.c_5_pointer_count)",
    "CREATE INDEX coord_session_key IF NOT EXISTS FOR (n:Bimba) ON (n.s_3_session_key)",
    "CREATE INDEX coord_graphiti_arc_id IF NOT EXISTS FOR (n:Bimba) ON (n.s_3_graphiti_arc_id)",
];

pub const RELATIONSHIP_INDEXES: &[&str] = &[
    "CREATE LOOKUP INDEX bimba_rel_type_lookup IF NOT EXISTS FOR ()-[r]-() ON EACH type(r)",
    "CREATE INDEX bimba_contains_source_coordinate IF NOT EXISTS FOR ()-[r:CONTAINS]-() ON (r.c_0_source_coordinate)",
    "CREATE INDEX bimba_contains_target_coordinate IF NOT EXISTS FOR ()-[r:CONTAINS]-() ON (r.c_0_target_coordinate)",
    "CREATE INDEX bimba_has_lens_source_coordinate IF NOT EXISTS FOR ()-[r:HAS_LENS]-() ON (r.c_0_source_coordinate)",
    "CREATE INDEX bimba_has_lens_target_coordinate IF NOT EXISTS FOR ()-[r:HAS_LENS]-() ON (r.c_0_target_coordinate)",
    "CREATE INDEX bimba_pos5_source_coordinate IF NOT EXISTS FOR ()-[r:POS5_INTEGRATES_INTO]-() ON (r.c_0_source_coordinate)",
    "CREATE INDEX bimba_pos5_target_coordinate IF NOT EXISTS FOR ()-[r:POS5_INTEGRATES_INTO]-() ON (r.c_0_target_coordinate)",
    "CREATE INDEX bimba_pos5_relation_type IF NOT EXISTS FOR ()-[r:POS5_INTEGRATES_INTO]-() ON (r.c_2_relation_type)",
    "CREATE INDEX bimba_kernel_resonance_index IF NOT EXISTS FOR ()-[r:HAS_KERNEL_RESONANCE]-() ON (r.c_5_kernel_resonance_index)",
    "CREATE INDEX bimba_kernel_resonance_source_coordinate IF NOT EXISTS FOR ()-[r:HAS_KERNEL_RESONANCE]-() ON (r.c_0_source_coordinate)",
];

pub const VECTOR_INDEX: &str = "CREATE VECTOR INDEX coord_embedding IF NOT EXISTS FOR (n:Bimba) ON (n.c_5_embedding) OPTIONS {indexConfig: {`vector.dimensions`: 3072, `vector.similarity_function`: 'cosine'}}";

pub const C_LAYER_AUTHORITY_MIGRATION: &str = r#"UNWIND [
  {coordinate: 'C0', role: 'source_ground', path: 'Idea/Bimba/World/Types/Coordinates/C/C0', md_path: 'Idea/Bimba/World/Types/Coordinates/C/C0/C0.md', canvas_path: 'Idea/Bimba/World/Types/Coordinates/C/C0/C0.canvas'},
  {coordinate: 'C1', role: 'forms_templates', path: 'Idea/Bimba/World/Types/Coordinates/C/C1', md_path: 'Idea/Bimba/World/Types/Coordinates/C/C1/C1.md', canvas_path: 'Idea/Bimba/World/Types/Coordinates/C/C1/C1.canvas'},
  {coordinate: 'C2', role: 'entities_properties_tags', path: 'Idea/Bimba/World/Types/Coordinates/C/C2', md_path: 'Idea/Bimba/World/Types/Coordinates/C/C2/C2.md', canvas_path: 'Idea/Bimba/World/Types/Coordinates/C/C2/C2.canvas'},
  {coordinate: 'C3', role: 'processes_canvases_diagrams', path: 'Idea/Bimba/World/Types/Coordinates/C/C3', md_path: 'Idea/Bimba/World/Types/Coordinates/C/C3/C3.md', canvas_path: 'Idea/Bimba/World/Types/Coordinates/C/C3/C3.canvas'},
  {coordinate: 'C4', role: 'types_contexts_mocs', path: 'Idea/Bimba/World/Types/Coordinates/C/C4', md_path: 'Idea/Bimba/World/Types/Coordinates/C/C4/C4.md', canvas_path: 'Idea/Bimba/World/Types/Coordinates/C/C4/C4.canvas'},
  {coordinate: 'C5', role: 'crystallisations_pratibimba', path: 'Idea/Bimba/World/Types/Coordinates/C/C5', md_path: 'Idea/Bimba/World/Types/Coordinates/C/C5/C5.md', canvas_path: 'Idea/Bimba/World/Types/Coordinates/C/C5/C5.canvas'}
] AS row
MERGE (n:Bimba {coordinate: row.coordinate})
SET n.c_layer_role = row.role,
    n.semantic_authority = 'authoritative',
    n.world_type_path = row.path,
    n.crystallisation_state = 'incubating_type_index',
    n.c_3_moc_evidence_paths = [row.md_path, row.canvas_path],
    n.coordinate_prefix = 'C',
    n.coordinate_axis = 'direct'
RETURN n.coordinate AS coordinate, n.world_type_path AS world_type_path"#;

pub const OBSOLETE_INDEXES: &[&str] = &[
    "DROP INDEX coord_family_legacy IF EXISTS",
    "DROP INDEX coord_position_legacy IF EXISTS",
    "DROP INDEX coord_layer_legacy IF EXISTS",
    "DROP INDEX coord_topo_legacy IF EXISTS",
    "DROP INDEX coord_vault_path_legacy IF EXISTS",
];
