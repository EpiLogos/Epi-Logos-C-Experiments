/// Retry policy for reducer posts. Bounded attempts with linear backoff so
/// transient failures (e.g. SpaceTimeDB still booting, momentary 503) recover
/// without unbounded blocking.
#[derive(Debug, Clone, Copy)]
pub struct ReducerRetryPolicy {
    pub max_attempts: u32,
    pub base_backoff_ms: u64,
}

impl ReducerRetryPolicy {
    pub fn backoff(&self, attempt: u32) -> std::time::Duration {
        std::time::Duration::from_millis(self.base_backoff_ms.saturating_mul(attempt as u64))
    }
}

pub(crate) fn default_reducer_retry_policy() -> ReducerRetryPolicy {
    ReducerRetryPolicy {
        max_attempts: 3,
        base_backoff_ms: 50,
    }
}

pub(crate) fn run_blocking_http<T, F>(operation: F) -> Result<T, String>
where
    F: FnOnce() -> Result<T, String> + Send + 'static,
    T: Send + 'static,
{
    if tokio::runtime::Handle::try_current().is_ok() {
        return std::thread::spawn(operation)
            .join()
            .map_err(|_| "blocking SpacetimeDB HTTP worker panicked".to_owned())?;
    }

    operation()
}

// =============================================================================
