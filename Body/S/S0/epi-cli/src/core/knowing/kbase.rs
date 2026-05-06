// S0 thin delegation to S5 kbase-core.
// Domain logic lives in epi-s5-kbase-core; this module re-exports for backward compat.

pub use epi_s5_kbase_core::kbase::{build_kbase_field, selected_item_path};
