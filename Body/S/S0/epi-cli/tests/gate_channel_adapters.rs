use epi_logos::gate::channel_adapters::{
    adapter_spec, build_google_drive_list_files_request, build_send_text_request, ChannelOperation,
};

#[test]
fn channel_adapter_specs_cover_all_gateway_platforms_with_s3_ownership() {
    for channel in ["telegram", "whatsapp", "slack", "discord", "google-drive"] {
        let spec = adapter_spec(channel).expect("channel adapter spec should exist");
        assert_eq!(spec.coordinate_owner, "S3");
        assert!(!spec.account_field.is_empty());
        assert!(!spec.secret_kind.is_empty());
    }

    assert_eq!(
        adapter_spec("telegram").unwrap().operations,
        &[ChannelOperation::SendText]
    );
    assert_eq!(
        adapter_spec("google-drive").unwrap().operations,
        &[ChannelOperation::ListFiles]
    );
}

#[test]
fn messaging_adapters_build_real_provider_http_requests() {
    let telegram = build_send_text_request("telegram", "token", "123", "hello", None).unwrap();
    assert_eq!(telegram.method, "POST");
    assert_eq!(
        telegram.url,
        "https://api.telegram.org/bottoken/sendMessage"
    );
    assert_eq!(telegram.body.unwrap()["chat_id"], "123");

    let slack = build_send_text_request("slack", "xoxb-token", "C123", "hello", None).unwrap();
    assert_eq!(slack.url, "https://slack.com/api/chat.postMessage");
    assert!(slack
        .headers
        .iter()
        .any(|(key, value)| key == "authorization" && value == "Bearer xoxb-token"));
    assert_eq!(slack.body.unwrap()["channel"], "C123");

    let discord =
        build_send_text_request("discord", "discord-token", "999", "hello", None).unwrap();
    assert_eq!(
        discord.url,
        "https://discord.com/api/v10/channels/999/messages"
    );
    assert!(discord
        .headers
        .iter()
        .any(|(key, value)| key == "authorization" && value == "Bot discord-token"));

    let whatsapp = build_send_text_request(
        "whatsapp",
        "wa-token",
        "447000000000",
        "hello",
        Some("phone-1"),
    )
    .unwrap();
    assert_eq!(
        whatsapp.url,
        "https://graph.facebook.com/v19.0/phone-1/messages"
    );
    let body = whatsapp.body.unwrap();
    assert_eq!(body["messaging_product"], "whatsapp");
    assert_eq!(body["text"]["body"], "hello");
}

#[test]
fn google_drive_adapter_builds_real_drive_files_request() {
    let request = build_google_drive_list_files_request("drive-token", 500).unwrap();
    assert_eq!(request.method, "GET");
    assert_eq!(
        request.url,
        "https://www.googleapis.com/drive/v3/files?pageSize=100&fields=files(id,name,mimeType,modifiedTime)"
    );
    assert!(request
        .headers
        .iter()
        .any(|(key, value)| key == "authorization" && value == "Bearer drive-token"));
    assert!(request.body.is_none());
}
