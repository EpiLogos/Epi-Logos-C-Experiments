use portal_core::tunable::metadata::{
    PrivacyClass, ResidencyClass, ScopeClass, TunableMetadata, TunableValue, TuningRiskClass,
};

#[test]
fn metadata_residency_class_variants_complete() {
    assert_eq!(ResidencyClass::HotReload.as_str(), "hot-reload");
    assert_eq!(
        ResidencyClass::FreezeOnSessionStart.as_str(),
        "freeze-on-session-start"
    );
    assert_eq!(ResidencyClass::RestartRequired.as_str(), "restart-required");
}

#[test]
fn metadata_scope_class_variants_complete() {
    assert_eq!(ScopeClass::Global.as_str(), "global");
    assert_eq!(ScopeClass::PerPasu.as_str(), "per-pasu");
    assert_eq!(ScopeClass::PerSession.as_str(), "per-session");
}

#[test]
fn metadata_tuning_risk_class_variants_complete() {
    assert_eq!(TuningRiskClass::A.as_str(), "A");
    assert_eq!(TuningRiskClass::B.as_str(), "B");
    assert_eq!(TuningRiskClass::C.as_str(), "C");
}

#[test]
fn metadata_privacy_class_variants_complete() {
    assert_eq!(PrivacyClass::LocalOnly.as_str(), "local-only");
    assert_eq!(PrivacyClass::VectorDerived.as_str(), "vector-derived");
    assert_eq!(PrivacyClass::NonSensitive.as_str(), "non-sensitive");
}

#[test]
fn metadata_defaults_are_conservative() {
    assert_eq!(
        ResidencyClass::default(),
        ResidencyClass::FreezeOnSessionStart
    );
    assert_eq!(ScopeClass::default(), ScopeClass::Global);
    assert_eq!(TuningRiskClass::default(), TuningRiskClass::A);
    assert_eq!(PrivacyClass::default(), PrivacyClass::NonSensitive);
}

#[test]
fn metadata_surface_exports_core_types() {
    fn accepts_metadata(_: Option<TunableMetadata>, _: Option<TunableValue>) {}
    accepts_metadata(None, None);
}
