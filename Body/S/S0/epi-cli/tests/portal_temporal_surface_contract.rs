use epi_logos::portal::plugins::command::CommandCenterPlugin;
use epi_logos::portal::plugins::m4::M4PratibimbaPlugin;
use epi_logos::portal::plugins::m5::M5ChatPlugin;
use epi_logos::portal::runtime_state::PortalRuntimeState;
use ratatui::buffer::Buffer;
use ratatui::layout::Rect;
use ratatui_hypertile_extras::HypertilePlugin;
use serde_json::json;

#[test]
fn portal_command_nara_and_epii_surfaces_share_the_same_gateway_temporal_identity() {
    let runtime = PortalRuntimeState::from_gateway_context_value(json!({
        "coordinateOwner": "S3'",
        "agentAccessOwner": "S4/S5",
        "day": { "dayId": "08-05-2026" },
        "now": {
            "path": "/vault/Empty/Present/08-05-2026/20260508-101500-run01/now.md",
            "wikilink": "[[Empty/Present/08-05-2026/20260508-101500-run01/now|NOW 20260508-101500-run01]]"
        },
        "session": {
            "canonicalKey": "agent:anima:main",
            "sessionId": "20260508-101500-run01",
            "activeAgentId": "anima",
            "resourceLoaderId": "loader://anima/plugin-runtime",
            "runtimeCwd": "/repo"
        },
        "kairos": {
            "available": true,
            "fresh": true,
            "source": "nara.kairos.current"
        },
        "pratibimba": {
            "anchorId": "pratibimba-abcd1234",
            "coordinate": "M4.4.4.4"
        },
        "redis": {
            "hydrated": true,
            "sessionNowKey": "s3:gateway:temporal:session:20260508-101500-run01:now:md"
        },
        "spacetimedb": {
            "projectionSource": "native-ws-subscription",
            "projectionTable": "session_surface",
            "kairosProjectionTable": "kairos_surface",
            "globalProjectionTable": "global_temporal_surface"
        }
    }))
    .expect("gateway temporal context should create portal runtime state");

    let command = render_plugin(
        CommandCenterPlugin::new_with_runtime(runtime.clone()),
        112,
        120,
    );
    let nara = render_plugin(
        M4PratibimbaPlugin::new_with_temporal(runtime.temporal()),
        92,
        24,
    );
    let epii = render_plugin(M5ChatPlugin::new_with_temporal(runtime.temporal()), 92, 20);

    assert_shared_identity("command", &command);
    assert_shared_identity("nara", &nara);
    assert_shared_identity("epii", &epii);
    assert!(command.contains("native-ws-subscription"));
    assert!(command.contains("session_surface/kairos_surface/global_temporal_surface"));
    assert!(nara.contains("Redis"));
    assert!(epii.contains("Epii Orientation"));
}

fn render_plugin(plugin: impl HypertilePlugin, width: u16, height: u16) -> String {
    let area = Rect::new(0, 0, width, height);
    let mut buffer = Buffer::empty(area);
    plugin.render(area, &mut buffer, true);
    buffer_to_string(&buffer, area)
}

fn assert_shared_identity(label: &str, content: &str) {
    assert!(
        content.contains("08-05-2026"),
        "{label} surface did not render DAY identity"
    );
    assert!(
        content.contains("20260508-101500-run01"),
        "{label} surface did not render session identity"
    );
    assert!(
        content.contains("pratibimba-abcd1234"),
        "{label} surface did not render Pratibimba identity"
    );
}

fn buffer_to_string(buffer: &Buffer, area: Rect) -> String {
    let mut output = String::new();
    for y in area.y..area.y + area.height {
        for x in area.x..area.x + area.width {
            output.push_str(buffer[(x, y)].symbol());
        }
        output.push('\n');
    }
    output
}
