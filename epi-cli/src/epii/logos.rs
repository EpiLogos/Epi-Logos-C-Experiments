pub fn dispatch(cmd: &crate::nara::LogosCmd, json: bool) -> Result<String, String> {
    match cmd {
        crate::nara::LogosCmd::Run {
            date,
            stage,
            json: as_json,
        } => crate::nara::logos::run(date.as_deref(), *stage, *as_json || json),
        crate::nara::LogosCmd::Status { json: as_json } => {
            crate::nara::logos::status(*as_json || json)
        }
        crate::nara::LogosCmd::Stage {
            stage,
            date,
            json: as_json,
        } => crate::nara::logos::stage(*stage, date.as_deref(), *as_json || json),
        crate::nara::LogosCmd::Curriculum { json: as_json } => {
            crate::nara::logos::curriculum(*as_json || json)
        }
        crate::nara::LogosCmd::Export { date, yes } => {
            crate::nara::logos::export(date.as_deref(), *yes)
        }
        crate::nara::LogosCmd::Weekly { json: as_json } => {
            crate::nara::logos::weekly(*as_json || json)
        }
    }
}
