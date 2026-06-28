//! sidecar-compat — deprecated HTTP compatibility adapter for Graphiti.
//!
//! # Coordinate
//!
//! | Field | Value |
//! |-------|-------|
//! | Coordinate | S5/S5' |
//! | Residency  | Body/S/S3/graphiti-runtime/src/sidecar-compat/mod.rs (physically S3, conceptually actualises S5 world-return) |
//! | Position   | #3 — Runtime compatibility bridge |
//! | Actualises | [[S3-SPEC]] / [[S5-SPEC]] sidecar deprecation path per DR-S3-2 |
//!
//! # Public surface
//! * `HttpCompatibilityClient` — deprecated HTTP adapter for the retired Graphiti sidecar.
//!
//! # Does NOT own
//! * Native Graphiti library behavior; use `NativeLibraryClient` through `GraphitiClient`.

use crate::{status_value, GraphitiStatus};

#[deprecated(
    since = "2026-06-03",
    note = "Sidecar deprecated per DR-S3-2; use NativeLibraryClient"
)]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HttpCompatibilityClient {
    pub base_url: String,
}

#[allow(deprecated)]
impl Default for HttpCompatibilityClient {
    fn default() -> Self {
        Self {
            base_url: crate::GRAPHITI_BASE_URL.to_owned(),
        }
    }
}

#[allow(deprecated)]
impl HttpCompatibilityClient {
    pub async fn status(&self) -> GraphitiStatus {
        let _ = &self.base_url;
        status_value().await
    }
}
