pub use epi_s3_gateway_contract::{
    s0_prime_verifier_methods, M0VerifierKernelState, M0VerifierQuestion, M0VerifierReportContract,
    S0_PRIME_VERIFIER_CHECK_STATE_METHOD, S0_PRIME_VERIFIER_EMIT_QUESTION_METHOD,
    S0_PRIME_VERIFIER_METHODS,
};

pub fn is_s0_prime_verifier_method(method: &str) -> bool {
    s0_prime_verifier_methods().contains(&method)
}
