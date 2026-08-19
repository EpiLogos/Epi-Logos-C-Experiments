use epi_pratibimba_bridge::{CurrentSituatedResponse, PERSONAL_PRODUCT_ID};
use serde_json::{json, Value};

pub const PERSONAL_PARENT_SCHEMA: &str = "epi.personal-450-application/v1";

/// Bind the D Current Situated event to the exact corrected-C Personal parent
/// socket. C remains owner of Personal subject identity; D contributes the
/// eventRef and situated quaternion/world relation only.
pub fn bind_personal_parent(
    mut response: CurrentSituatedResponse,
    personal_application: &Value,
    nara_identity_ref: &str,
) -> Result<Value, String> {
    expect_string(personal_application, "/schema", PERSONAL_PARENT_SCHEMA)?;
    expect_string(personal_application, "/productId", PERSONAL_PRODUCT_ID)?;
    expect_string(personal_application, "/nativeOwner", "epi")?;
    expect_bool(personal_application, "/subject/protectedBodyDisclosed", false)?;

    let subject_ref = required_string(personal_application, "/subject/subjectRef")?;
    let episode_ref = required_string(personal_application, "/subject/episodeRef")?;
    if subject_ref != episode_ref {
        return Err("corrected C Personal subject must remain the governed episode subject".to_owned());
    }
    let episode_revision = personal_application
        .pointer("/subject/episodeRevision")
        .and_then(Value::as_u64)
        .ok_or_else(|| "corrected C Personal application requires episodeRevision".to_owned())?;

    let socket_subject = required_string(personal_application, "/eventBinding/subjectRef")?;
    if socket_subject != subject_ref {
        return Err("corrected C event-binding socket drifted from Personal subject".to_owned());
    }
    if personal_application.pointer("/eventBinding/eventRef").is_some() {
        return Err("corrected C must arrive with an unbound eventRef socket; D may not overwrite a pre-existing Personal event".to_owned());
    }
    expect_bool(personal_application, "/eventBinding/bindableToEventRef", true)?;
    expect_bool(personal_application, "/eventBinding/parallelPersonalEventState", false)?;

    if response.event.personal.episode_ref != episode_ref {
        return Err(format!(
            "D episodeRef `{}` does not match corrected C Personal episode `{episode_ref}`",
            response.event.personal.episode_ref
        ));
    }
    if response.event.personal.subject_ref != nara_identity_ref {
        return Err("pre-binding D identity must still be the protected Nara identity handle; corrected C subject replacement is explicit".to_owned());
    }

    response.event.personal.subject_ref = subject_ref.clone();
    response.cosmic.subject_ref = subject_ref.clone();

    let event_ref = response.event.event_ref.clone();
    let c_source_revision = required_string(personal_application, "/provenance/epiSourceRevision")?;
    let c_ql_revision = required_string(personal_application, "/provenance/qlProviderRevision")?;

    let mut reading = serde_json::to_value(response)
        .map_err(|error| format!("serialize C-bound Current Situated response: {error}"))?;

    let personal = reading
        .pointer_mut("/event/personal")
        .and_then(Value::as_object_mut)
        .ok_or_else(|| "Current Situated response lost event.personal object".to_owned())?;
    personal.insert("naraIdentityRef".to_owned(), Value::String(nara_identity_ref.to_owned()));
    personal.insert("personalParentApplicationSchema".to_owned(), Value::String(PERSONAL_PARENT_SCHEMA.to_owned()));
    personal.insert("personalParentSourceRevision".to_owned(), Value::String(c_source_revision.clone()));

    let event = reading
        .pointer_mut("/event")
        .and_then(Value::as_object_mut)
        .ok_or_else(|| "Current Situated response lost event object".to_owned())?;
    event.insert(
        "personalParentBinding".to_owned(),
        json!({
            "productId": PERSONAL_PRODUCT_ID,
            "applicationSchema": PERSONAL_PARENT_SCHEMA,
            "subjectRef": subject_ref,
            "episodeRef": episode_ref,
            "episodeRevision": episode_revision,
            "naraIdentityRef": nara_identity_ref,
            "sourceEventRefBeforeBinding": Value::Null,
            "boundEventRef": event_ref,
            "bindableToEventRef": true,
            "parallelPersonalEventState": false,
            "epiSourceRevision": c_source_revision,
            "qlProviderRevision": c_ql_revision,
            "law": "corrected C owns the Personal subject; D binds this exact unbound socket to the Current Situated eventRef and creates no parallel PersonalEvent"
        }),
    );

    let cosmic_provenance = reading
        .pointer_mut("/cosmic/provenance")
        .and_then(Value::as_object_mut)
        .ok_or_else(|| "Cosmic response lost provenance object".to_owned())?;
    cosmic_provenance.insert(
        "correctedCPersonalBinding".to_owned(),
        json!({
            "applicationSchema": PERSONAL_PARENT_SCHEMA,
            "subjectRef": required_string(personal_application, "/subject/subjectRef")?,
            "episodeRef": required_string(personal_application, "/subject/episodeRef")?,
            "eventRef": event_ref,
            "naraIdentityRef": nara_identity_ref,
            "proof": [
                "same corrected-C subject/episode",
                "C socket unbound before D",
                "bindableToEventRef=true",
                "parallelPersonalEventState=false",
                "D retains Nara identity separately from Personal subject",
                "qIdentity/qTransit/qActivity/Qcomposed remain on the same D event"
            ]
        }),
    );

    Ok(reading)
}

fn required_string(value: &Value, pointer: &str) -> Result<String, String> {
    value
        .pointer(pointer)
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .map(ToOwned::to_owned)
        .ok_or_else(|| format!("corrected C Personal application requires string `{pointer}`"))
}

fn expect_string(value: &Value, pointer: &str, expected: &str) -> Result<(), String> {
    let observed = required_string(value, pointer)?;
    if observed == expected {
        Ok(())
    } else {
        Err(format!("corrected C Personal `{pointer}` expected `{expected}`, got `{observed}`"))
    }
}

fn expect_bool(value: &Value, pointer: &str, expected: bool) -> Result<(), String> {
    let observed = value
        .pointer(pointer)
        .and_then(Value::as_bool)
        .ok_or_else(|| format!("corrected C Personal application requires bool `{pointer}`"))?;
    if observed == expected {
        Ok(())
    } else {
        Err(format!("corrected C Personal `{pointer}` expected `{expected}`, got `{observed}`"))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use epi_pratibimba_bridge::{
        current_situated, snapshot, CelestialBodyObservation, CurrentSituatedRequest,
        NaraProtectedContext, SituatedActivityEvidence, WorldConditionObservation,
        WorldObservationClass,
    };
    use portal_core::{ElementalBalance, PersonalIdentityProfile, ProfilePrivacyClass};

    const NOW: u64 = 1_725_000_000_000;

    fn nara_context() -> NaraProtectedContext {
        NaraProtectedContext {
            identity_ref: "epi:nara:identity:test".to_owned(),
            personal_field_ref: Some("epi:personal:test".to_owned()),
            day_id: "2026-08-19".to_owned(),
            now_path: "DAY/2026-08-19/NOW/test".to_owned(),
            session_key: "session:test".to_owned(),
            episode_ref: Some("epi:episode:test".to_owned()),
            privacy_class: "protected-local".to_owned(),
            source_class: "human-authored".to_owned(),
            source_ref: None,
        }
    }

    fn request() -> CurrentSituatedRequest {
        CurrentSituatedRequest {
            event_at_unix_ms: NOW,
            personal_identity: PersonalIdentityProfile {
                q_personal: [1.0, 0.0, 0.0, 0.0],
                natal_chart_handle: "protected:natal:test".to_owned(),
                elemental_balance: ElementalBalance { earth: 0.25, fire: 0.25, water: 0.25, air: 0.25 },
                identity_hash: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef".to_owned(),
                privacy_class: ProfilePrivacyClass::ProtectedLocalDerived,
            },
            activity: SituatedActivityEvidence {
                activity_ref: "epi:activity:test".to_owned(),
                q_activity: [0.0, 0.0, 1.0, 0.0],
                observed_at_unix_ms: NOW,
                source_class: "protected-nara-activity".to_owned(),
            },
            world_condition: WorldConditionObservation {
                observation_ref: "fixture:world:test".to_owned(),
                observation_class: WorldObservationClass::Fixture,
                provider_ref: "fixture:sky".to_owned(),
                provider_revision: "fixture-rev".to_owned(),
                observed_at_unix_ms: NOW,
                observer_ref: "observer:earth:test".to_owned(),
                q_transit: [0.0, 1.0, 0.0, 0.0],
                q_transit_source_ref: "fixture:q-transit:test".to_owned(),
                solar: Some(CelestialBodyObservation { body: "Sun".to_owned(), longitude_degrees: 156.0, retrograde: false, sign: Some("Virgo".to_owned()), decan: Some(15), source_ref: None }),
                planets: vec![CelestialBodyObservation { body: "Moon".to_owned(), longitude_degrees: 90.0, retrograde: false, sign: Some("Cancer".to_owned()), decan: Some(9), source_ref: None }],
                correspondence_refs: vec![],
            },
        }
    }

    fn personal_application() -> Value {
        json!({
            "schema": PERSONAL_PARENT_SCHEMA,
            "productId": PERSONAL_PRODUCT_ID,
            "nativeOwner": "epi",
            "subject": { "subjectRef": "epi:episode:test", "episodeRef": "epi:episode:test", "episodeRevision": 4, "protectedBodyDisclosed": false },
            "eventBinding": { "subjectRef": "epi:episode:test", "bindableToEventRef": true, "parallelPersonalEventState": false },
            "provenance": { "epiSourceRevision": "c-rev", "qlProviderRevision": "ql-rev" }
        })
    }

    #[test]
    fn binds_corrected_c_subject_without_collapsing_nara_identity() {
        let snapshot = snapshot(NOW, 0, None, Some(nara_context())).unwrap();
        let response = current_situated(&snapshot, request()).unwrap();
        let value = bind_personal_parent(response, &personal_application(), "epi:nara:identity:test").unwrap();
        assert_eq!(value.pointer("/event/personal/subjectRef").and_then(Value::as_str), Some("epi:episode:test"));
        assert_eq!(value.pointer("/event/personal/naraIdentityRef").and_then(Value::as_str), Some("epi:nara:identity:test"));
        assert_eq!(value.pointer("/event/personalParentBinding/parallelPersonalEventState").and_then(Value::as_bool), Some(false));
        assert_eq!(value.pointer("/event/eventRef"), value.pointer("/event/personalParentBinding/boundEventRef"));
    }

    #[test]
    fn refuses_parallel_c_personal_event_state() {
        let snapshot = snapshot(NOW, 0, None, Some(nara_context())).unwrap();
        let response = current_situated(&snapshot, request()).unwrap();
        let mut c = personal_application();
        c["eventBinding"]["parallelPersonalEventState"] = json!(true);
        let error = bind_personal_parent(response, &c, "epi:nara:identity:test").unwrap_err();
        assert!(error.contains("expected `false`"));
    }
}