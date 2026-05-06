use std::fs;
use std::path::{Path, PathBuf};

use rcgen::generate_simple_self_signed;
use sha2::{Digest, Sha256};

#[derive(Debug, Clone)]
pub struct GatewayTlsRuntime {
    pub cert_path: PathBuf,
    pub key_path: PathBuf,
    pub fingerprint_sha256: String,
}

impl GatewayTlsRuntime {
    pub fn load_or_generate(root: impl AsRef<Path>) -> Result<Self, String> {
        let tls_root = root.as_ref().join("tls");
        fs::create_dir_all(&tls_root).map_err(|err| err.to_string())?;

        let cert_path = tls_root.join("gateway-cert.pem");
        let key_path = tls_root.join("gateway-key.pem");

        if !cert_path.exists() || !key_path.exists() {
            let cert = generate_simple_self_signed(vec![
                "localhost".to_owned(),
                "127.0.0.1".to_owned(),
                "::1".to_owned(),
            ])
            .map_err(|err| err.to_string())?;

            fs::write(&cert_path, cert.cert.pem()).map_err(|err| err.to_string())?;
            fs::write(&key_path, cert.key_pair.serialize_pem()).map_err(|err| err.to_string())?;
        }

        let cert_bytes = fs::read(&cert_path).map_err(|err| err.to_string())?;
        let fingerprint_sha256 = format!("sha256:{}", hex::encode(Sha256::digest(cert_bytes)));

        Ok(Self {
            cert_path,
            key_path,
            fingerprint_sha256,
        })
    }
}
