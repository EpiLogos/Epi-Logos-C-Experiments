use epi_logos::portal::topology::{
    coordinate_catalog, portal_domains, slash_command_surfaces, PortalActionKind, PortalDomain,
};

#[test]
fn portal_domains_encode_zero_slash_one_topology() {
    let domains = portal_domains();

    assert_eq!(domains.len(), 3);
    assert_eq!(domains[0].key, "0");
    assert_eq!(domains[0].domain, PortalDomain::StructuralClock);
    assert_eq!(domains[0].coordinates, &["M0'", "M1'", "M2'", "M3'"]);

    assert_eq!(domains[1].key, "/");
    assert_eq!(domains[1].domain, PortalDomain::CommandReturn);
    assert_eq!(
        domains[1].coordinates,
        &["S0", "S0'", "S1", "S2", "S3", "S4", "S5"]
    );

    assert_eq!(domains[2].key, "1");
    assert_eq!(domains[2].domain, PortalDomain::PersonalWorldReturn);
    assert_eq!(domains[2].coordinates, &["M4'", "M5'"]);
}

#[test]
fn slash_command_surfaces_cover_setup_config_services_agents_and_return() {
    let surfaces = slash_command_surfaces();
    let ids: Vec<&str> = surfaces.iter().map(|surface| surface.id).collect();

    for expected in [
        "setup.readiness",
        "config.schema",
        "s2.graph",
        "s3.gateway",
        "s4.agent",
        "s5.epii",
        "s0.return",
    ] {
        assert!(
            ids.contains(&expected),
            "slash panel missing command surface {expected}; got {ids:?}"
        );
    }

    assert!(surfaces
        .iter()
        .all(|surface| surface.coordinate.starts_with('S')));
    assert!(surfaces
        .iter()
        .any(|surface| surface.proves_agent_access_separately));
    assert!(surfaces
        .iter()
        .any(|surface| surface.proves_raw_service_health));
}

#[test]
fn slash_command_surfaces_are_interactive_from_the_start() {
    let surfaces = slash_command_surfaces();

    assert!(
        surfaces.iter().any(|surface| surface
            .actions
            .iter()
            .any(|action| action.kind == PortalActionKind::EditConfig)),
        "slash panel needs real editable config actions"
    );
    assert!(
        surfaces.iter().any(|surface| surface
            .actions
            .iter()
            .any(|action| action.kind == PortalActionKind::RunCommand)),
        "slash panel needs real command actions"
    );
    assert!(
        surfaces.iter().any(|surface| surface
            .actions
            .iter()
            .any(|action| action.kind == PortalActionKind::ApplyChanges)),
        "slash panel needs apply actions, not read-only status"
    );
    assert!(
        surfaces
            .iter()
            .flat_map(|surface| surface.config_fields)
            .any(|field| field.editable && field.apply_command.is_some()),
        "editable fields must declare the command authority used to apply them"
    );
}

#[test]
fn coordinate_catalog_lists_stack_and_visualisation_layers() {
    let catalog = coordinate_catalog();
    let s_ids: Vec<&str> = catalog
        .s_layers
        .iter()
        .map(|coordinate| coordinate.id)
        .collect();
    let m_ids: Vec<&str> = catalog
        .m_layers
        .iter()
        .map(|coordinate| coordinate.id)
        .collect();

    for expected in [
        "S0", "S0'", "S1", "S1'", "S2", "S2'", "S3", "S3'", "S4", "S4'", "S5", "S5'",
    ] {
        assert!(
            s_ids.contains(&expected),
            "missing S/S' coordinate {expected}; got {s_ids:?}"
        );
    }

    for expected in ["M0'", "M1'", "M2'", "M3'", "M4'", "M5'"] {
        assert!(
            m_ids.contains(&expected),
            "missing M/M' coordinate {expected}; got {m_ids:?}"
        );
    }

    assert!(catalog
        .m_layers
        .iter()
        .any(|coordinate| coordinate.applies_to_visualisation));
    assert!(catalog
        .s_layers
        .iter()
        .any(|coordinate| coordinate.applies_to_stack_instantiation));
}
