use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use tokio::sync::mpsc;
use tokio_tungstenite::tungstenite::Message;

use crate::error::AppError;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GatewayHello {
    pub session_key: String,
    pub protocol_version: String,
    pub capabilities: Vec<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RpcRequest {
    pub id: String,
    pub method: String,
    pub params: serde_json::Value,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RpcResponse {
    pub id: String,
    pub result: Option<serde_json::Value>,
    pub error: Option<String>,
}

pub struct GatewayConnection {
    tx: mpsc::Sender<String>,
    pub session_key: String,
}

impl GatewayConnection {
    /// Connect to gateway WebSocket, perform handshake, return connection.
    pub async fn connect(
        url: &str,
        token: Option<&str>,
        password: Option<&str>,
    ) -> Result<Self, AppError> {
        let (ws_stream, _) = tokio_tungstenite::connect_async(url)
            .await
            .map_err(|e| AppError::Gateway(format!("ws connect: {e}")))?;

        let (mut write, mut read) = ws_stream.split();

        let hello_msg = read
            .next()
            .await
            .ok_or_else(|| AppError::Gateway("no hello from gateway".into()))?
            .map_err(|e| AppError::Gateway(format!("ws read: {e}")))?;

        let hello: GatewayHello = match hello_msg {
            Message::Text(t) => serde_json::from_str(&t)
                .map_err(|e| AppError::Gateway(format!("hello parse: {e}")))?,
            _ => return Err(AppError::Gateway("unexpected hello format".into())),
        };

        let auth = serde_json::json!({
            "type": "auth",
            "token": token.unwrap_or(""),
            "password": password.unwrap_or(""),
        });
        write
            .send(Message::Text(auth.to_string().into()))
            .await
            .map_err(|e| AppError::Gateway(format!("ws auth send: {e}")))?;

        let (tx, mut rx) = mpsc::channel::<String>(64);

        tokio::spawn(async move {
            while let Some(msg) = rx.recv().await {
                if write.send(Message::Text(msg.into())).await.is_err() {
                    break;
                }
            }
        });

        Ok(Self {
            tx,
            session_key: hello.session_key,
        })
    }

    /// Send a JSON-RPC request to the gateway.
    pub async fn rpc(&self, method: &str, params: serde_json::Value) -> Result<(), AppError> {
        let req = RpcRequest {
            id: uuid::Uuid::new_v4().to_string(),
            method: method.to_string(),
            params,
        };
        let json = serde_json::to_string(&req)
            .map_err(|e| AppError::Gateway(format!("rpc serialize: {e}")))?;
        self.tx
            .send(json)
            .await
            .map_err(|e| AppError::Gateway(format!("rpc send: {e}")))?;
        Ok(())
    }

    pub async fn send_raw(&self, msg: &str) -> Result<(), AppError> {
        self.tx
            .send(msg.to_string())
            .await
            .map_err(|e| AppError::Gateway(format!("send: {e}")))?;
        Ok(())
    }
}
