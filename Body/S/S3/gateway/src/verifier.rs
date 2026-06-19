pub use epi_s3_gateway_contract::{
    s0_prime_verifier_methods, M0VerifierKernelState, M0VerifierMembershipRequest,
    M0VerifierOwlQuery, M0VerifierQuestion, M0VerifierReportContract, M0VerifierTypedQuery,
    S0_PRIME_VERIFIER_CHECK_STATE_METHOD, S0_PRIME_VERIFIER_EMIT_QUERY_METHOD,
    S0_PRIME_VERIFIER_METHODS, S0_PRIME_VERIFIER_OWL_QUERY_METHOD,
    S0_PRIME_VERIFIER_VALIDATE_MEMBERSHIP_METHOD,
};

pub fn is_s0_prime_verifier_method(method: &str) -> bool {
    s0_prime_verifier_methods().contains(&method)
}
