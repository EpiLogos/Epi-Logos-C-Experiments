pub use epi_s3_gateway_contract::{
    s0_prime_settings_methods, ApiKeyStatusRequest, ApiKeyStatusResponse, OptInRequest,
    OptInResponse, S0_PRIME_SETTINGS_API_KEY_STATUS_METHOD, S0_PRIME_SETTINGS_METHODS,
    S0_PRIME_SETTINGS_OPT_IN_METHOD,
};

pub fn is_s0_prime_settings_method(method: &str) -> bool {
    s0_prime_settings_methods().contains(&method)
}
