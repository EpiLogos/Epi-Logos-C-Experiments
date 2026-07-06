//! Coordinate: M'
//! Residency: Body/M/pratibimba-app/src-tauri (active M' carrier per the
//!   Carrier Decision 2026-07-02 in M'-SYSTEM-SPEC)
//! Actualises: the one-binary organism — window + supervised gateway +
//!   vault workspace + face.
//! Public surface: run().
//! Does NOT own: kernel, gateway protocol, vault law (see module headers).

pub mod identity;
pub mod oracle;
pub mod supervisor;
pub mod vault;

use tauri::Manager;

pub fn run() {
    tauri::Builder::default()
        .manage(supervisor::SupervisorState::default())
        .manage(vault::VaultState::default())
        .invoke_handler(tauri::generate_handler![
            supervisor::gateway_status,
            supervisor::gateway_restart,
            vault::vault_root,
            vault::vault_list,
            vault::vault_read,
            vault::vault_write,
            vault::begin_today,
            oracle::oracle_cast,
            vault::ui_state_load,
            vault::ui_state_save,
            identity::natal_sky
        ])
        .setup(|app| {
            supervisor::start_supervisor(app.handle().clone());
            let root = vault::resolve_vault_root();
            *app.state::<vault::VaultState>()
                .root
                .lock()
                .expect("vault root poisoned") = root.clone();
            if let Some(root) = root {
                vault::start_vault_watcher(app.handle().clone(), root);
            }
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("pratibimba-app failed to build the tauri shell")
        .run(|app, event| {
            if let tauri::RunEvent::Exit = event {
                supervisor::shutdown(app);
            }
        });
}
