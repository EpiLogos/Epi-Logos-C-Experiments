use serde_json::Value;

#[derive(Debug)]
pub(super) struct DispatchResult {
    pub(super) result: Value,
    pub(super) post_response: Option<PostResponseAction>,
}

impl DispatchResult {
    pub(super) fn immediate(result: Value) -> Self {
        Self {
            result,
            post_response: None,
        }
    }

    pub(super) fn with_post_response(result: Value, post_response: PostResponseAction) -> Self {
        Self {
            result,
            post_response: Some(post_response),
        }
    }
}

#[derive(Debug)]
pub(super) enum PostResponseAction {
    StartAgentRun {
        run_id: String,
        session_key: String,
        message: String,
    },
    StartChatRun {
        run_id: String,
        session_key: String,
        message: String,
    },
}
