use super::{parity, protocol};

#[derive(Debug, Clone)]
pub struct OmniPanelHelloContract {
    pub features: OmniPanelFeatures,
    pub session_metadata: Vec<&'static str>,
}

#[derive(Debug, Clone)]
pub struct OmniPanelFeatures {
    pub methods: Vec<&'static str>,
}

#[derive(Debug, Clone)]
pub struct ElectronVerificationPlan {
    pub port: u16,
    pub required_flows: Vec<&'static str>,
    pub notes_doc: &'static str,
}

pub fn hello_contract() -> OmniPanelHelloContract {
    let hello = protocol::hello_ok();
    OmniPanelHelloContract {
        features: OmniPanelFeatures {
            methods: hello.features.methods,
        },
        session_metadata: parity::OMNIPANEL_SESSION_METADATA.to_vec(),
    }
}

pub fn electron_verification_plan() -> ElectronVerificationPlan {
    ElectronVerificationPlan {
        port: parity::TEST_GATEWAY_PORT,
        required_flows: vec![
            "hello/connect handshake",
            "session alias",
            "subagent switch",
            "skills surface",
            "channels surface",
        ],
        notes_doc: "/Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-07-s3-electron-verification-notes.md",
    }
}
