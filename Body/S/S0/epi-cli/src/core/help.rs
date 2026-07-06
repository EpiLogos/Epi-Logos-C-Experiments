// S0 ADAPTER: Body/S/S0/epi-lib — help dispatch glue over the quintessential-view adapter; no domain law here.
pub(super) fn dispatch(topic: Option<&str>, json: bool) -> color_eyre::Result<()> {
    match topic {
        None => super::quintessential_view::knowing_hash_op(json),
        Some(name) => {
            let coord = match name.to_lowercase().as_str() {
                "mission" | "0" => "#-0",
                "architecture" | "arch" | "1" => "#-1",
                "install" | "setup" | "2" => "#-2",
                "cli" | "commands" | "3" => "#-3",
                "coordinates" | "coords" | "syntax" | "4" => "#-4",
                "plugin" | "agent" | "5" => "#-5",
                _ => {
                    eprintln!("Unknown help topic '{}'. Available: mission, architecture, install, cli, coordinates, plugin", name);
                    return Ok(());
                }
            };
            super::quintessential_view::knowing_subbranch(coord, json)
        }
    }
}
