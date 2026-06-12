pub mod bridge_events;
pub mod flip_events;
pub mod kernel_events;

#[allow(unused_imports)]
pub use bridge_events::*;
pub use flip_events::*;
pub use kernel_events::*;

pub(super) fn non_empty(value: String, field: &str) -> Result<String, String> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        Err(format!("{field} is required"))
    } else {
        Ok(trimmed.to_owned())
    }
}
