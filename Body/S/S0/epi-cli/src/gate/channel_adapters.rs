use serde::Serialize;
use serde_json::{json, Value};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum ChannelOperation {
    SendText,
    ListFiles,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChannelAdapterSpec {
    pub id: &'static str,
    pub coordinate_owner: &'static str,
    pub account_field: &'static str,
    pub secret_kind: &'static str,
    pub operations: &'static [ChannelOperation],
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ChannelHttpRequest {
    pub method: &'static str,
    pub url: String,
    pub headers: Vec<(String, String)>,
    pub body: Option<Value>,
}

pub const CHANNEL_ADAPTER_SPECS: &[ChannelAdapterSpec] = &[
    ChannelAdapterSpec {
        id: "telegram",
        coordinate_owner: "S3",
        account_field: "chat_id",
        secret_kind: "bot-token",
        operations: &[ChannelOperation::SendText],
    },
    ChannelAdapterSpec {
        id: "whatsapp",
        coordinate_owner: "S3",
        account_field: "phone_number_id/to",
        secret_kind: "cloud-api-token",
        operations: &[ChannelOperation::SendText],
    },
    ChannelAdapterSpec {
        id: "slack",
        coordinate_owner: "S3",
        account_field: "channel",
        secret_kind: "bot-token",
        operations: &[ChannelOperation::SendText],
    },
    ChannelAdapterSpec {
        id: "discord",
        coordinate_owner: "S3",
        account_field: "channel_id",
        secret_kind: "bot-token",
        operations: &[ChannelOperation::SendText],
    },
    ChannelAdapterSpec {
        id: "google-drive",
        coordinate_owner: "S3",
        account_field: "drive",
        secret_kind: "oauth-access-token",
        operations: &[ChannelOperation::ListFiles],
    },
];

pub fn adapter_spec(channel: &str) -> Option<&'static ChannelAdapterSpec> {
    CHANNEL_ADAPTER_SPECS.iter().find(|spec| spec.id == channel)
}

pub fn build_send_text_request(
    channel: &str,
    secret: &str,
    target: &str,
    text: &str,
    phone_number_id: Option<&str>,
) -> Result<ChannelHttpRequest, String> {
    match channel {
        "telegram" => Ok(ChannelHttpRequest {
            method: "POST",
            url: format!("https://api.telegram.org/bot{secret}/sendMessage"),
            headers: vec![("content-type".to_owned(), "application/json".to_owned())],
            body: Some(json!({"chat_id": target, "text": text})),
        }),
        "slack" => Ok(ChannelHttpRequest {
            method: "POST",
            url: "https://slack.com/api/chat.postMessage".to_owned(),
            headers: bearer_headers(secret, "Bearer"),
            body: Some(json!({"channel": target, "text": text})),
        }),
        "discord" => Ok(ChannelHttpRequest {
            method: "POST",
            url: format!("https://discord.com/api/v10/channels/{target}/messages"),
            headers: bearer_headers(secret, "Bot"),
            body: Some(json!({"content": text})),
        }),
        "whatsapp" => {
            let phone_number_id = phone_number_id
                .filter(|value| !value.trim().is_empty())
                .ok_or_else(|| "whatsapp send requires phone_number_id/workspace".to_owned())?;
            Ok(ChannelHttpRequest {
                method: "POST",
                url: format!("https://graph.facebook.com/v19.0/{phone_number_id}/messages"),
                headers: bearer_headers(secret, "Bearer"),
                body: Some(json!({
                    "messaging_product": "whatsapp",
                    "to": target,
                    "type": "text",
                    "text": {"body": text}
                })),
            })
        }
        "google-drive" => Err("google-drive does not support send-text; use list-files".to_owned()),
        other => Err(format!("unsupported channel adapter: {other}")),
    }
}

pub fn build_google_drive_list_files_request(
    secret: &str,
    page_size: u32,
) -> Result<ChannelHttpRequest, String> {
    let page_size = page_size.clamp(1, 100);
    Ok(ChannelHttpRequest {
        method: "GET",
        url: format!(
            "https://www.googleapis.com/drive/v3/files?pageSize={page_size}&fields=files(id,name,mimeType,modifiedTime)"
        ),
        headers: bearer_headers(secret, "Bearer"),
        body: None,
    })
}

pub fn execute_request(request: ChannelHttpRequest) -> Result<Value, String> {
    let client = reqwest::blocking::Client::new();
    let mut builder = match request.method {
        "GET" => client.get(&request.url),
        "POST" => client.post(&request.url),
        method => return Err(format!("unsupported channel HTTP method: {method}")),
    };
    for (key, value) in request.headers {
        builder = builder.header(key, value);
    }
    if let Some(body) = request.body {
        builder = builder.json(&body);
    }
    let response = builder.send().map_err(|err| err.to_string())?;
    let status = response.status();
    let body = response.text().map_err(|err| err.to_string())?;
    let parsed = serde_json::from_str::<Value>(&body).unwrap_or_else(|_| json!({"body": body}));
    if !status.is_success() {
        return Err(format!("channel request failed with {status}: {parsed}"));
    }
    Ok(parsed)
}

fn bearer_headers(secret: &str, scheme: &str) -> Vec<(String, String)> {
    vec![
        (
            "authorization".to_owned(),
            format!("{scheme} {secret}").trim().to_owned(),
        ),
        ("content-type".to_owned(), "application/json".to_owned()),
    ]
}
