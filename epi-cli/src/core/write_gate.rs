use std::io::{self, Write};
use std::sync::atomic::{AtomicBool, Ordering};

/// Session-level gate. Once unlocked, stays unlocked for the process lifetime.
static UNLOCKED: AtomicBool = AtomicBool::new(false);

const PASSPHRASE: &str = "satya";

/// Check if the gate is already unlocked. If not, prompt for the passphrase.
/// Returns Ok(()) if unlocked, Err with message if denied.
pub fn require_auth() -> Result<(), String> {
    if UNLOCKED.load(Ordering::Relaxed) {
        return Ok(());
    }

    eprint!("Enter passphrase for write operations: ");
    io::stderr().flush().ok();

    let mut input = String::new();
    io::stdin()
        .read_line(&mut input)
        .map_err(|e| format!("Failed to read input: {}", e))?;

    if input.trim() == PASSPHRASE {
        UNLOCKED.store(true, Ordering::Relaxed);
        Ok(())
    } else {
        Err("Incorrect passphrase. Write operations require authentication.".into())
    }
}
