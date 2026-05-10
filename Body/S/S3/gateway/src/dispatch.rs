use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum GatewayDispatchOwner {
    S3Gateway,
    S3TemporalGateway,
    S3GraphitiRuntime,
    S4S5DomainAdapter,
    S4TaOntaAgent,
    S5EpiiAgent,
    S5Autoresearch,
    S0ProductAdapter,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum GatewayDispatchClass {
    Connection,
    SessionRuntime,
    ChatRuntime,
    AgentRuntime,
    TemporalContext,
    GraphitiInvocation,
    ReviewInbox,
    EpiiAgentRuntime,
    AutoresearchRuntime,
    TaOntaAgentRuntime,
    NaraExtension,
    SystemSurface,
    ConfigurationSurface,
    AutomationSurface,
    DeviceSurface,
    NodeSurface,
    SkillSurface,
    ProductCompatibility,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GatewayDispatchRoute {
    pub method: &'static str,
    pub owner: GatewayDispatchOwner,
    pub class: GatewayDispatchClass,
    pub coordinate_owner: &'static str,
    pub agent_access_owner: &'static str,
    pub route_id: &'static str,
}

pub fn classify_method(method: &str) -> Option<GatewayDispatchRoute> {
    let class =
        match method {
            "connect" => route(
                method,
                GatewayDispatchOwner::S3Gateway,
                GatewayDispatchClass::Connection,
                "S3",
                "S0/S4/S5",
                "s3.gateway.connect",
            ),
            "sessions.list" | "sessions.resolve" | "sessions.preview" | "sessions.patch"
            | "sessions.reset" | "sessions.delete" | "sessions.compact" | "sessions.fork"
            | "sessions.resume" | "sessions.import" | "sessions.tree" | "chat.history"
            | "chat.send" | "chat.inject" | "chat.abort" | "channels.status"
            | "channels.logout" => route(
                method,
                GatewayDispatchOwner::S3Gateway,
                GatewayDispatchClass::SessionRuntime,
                "S3",
                "S4/S5",
                "s3.gateway.session-runtime",
            ),
            "send" | "agent" | "agent.identity.get" | "agent.wait" | "agents.list" => route(
                method,
                GatewayDispatchOwner::S3Gateway,
                GatewayDispatchClass::AgentRuntime,
                "S3",
                "S4/S5",
                "s3.gateway.agent-runtime",
            ),
            "s3'.temporal.context" => route(
                method,
                GatewayDispatchOwner::S3TemporalGateway,
                GatewayDispatchClass::TemporalContext,
                "S3'",
                "S4/S5",
                "s3-prime.temporal-context",
            ),
            "s5.episodic.search" | "s5.episodic.deposit" => route(
                method,
                GatewayDispatchOwner::S3GraphitiRuntime,
                GatewayDispatchClass::GraphitiInvocation,
                "S3/S5",
                "S5",
                "s3.graphiti-runtime.s5-episodic",
            ),
            "s5'.review.inbox" | "s5'.review.submit" | "s5'.review.resolve"
            | "s5'.review.history" => route(
                method,
                GatewayDispatchOwner::S5EpiiAgent,
                GatewayDispatchClass::ReviewInbox,
                "S5'",
                "S5",
                "s5-prime.epii-review-inbox",
            ),
            "s5'.epii.status"
            | "s5'.epii.deposit"
            | "s5'.epii.runtime.context"
            | "s5'.gnosis.context.retrieve"
            | "s5'.epii.user.orientation"
            | "s5'.epii.pratibimba.status"
            | "s5'.epii.kairos.context" => route(
                method,
                GatewayDispatchOwner::S5EpiiAgent,
                GatewayDispatchClass::EpiiAgentRuntime,
                "S5'",
                "S5",
                "s5-prime.epii-agent-runtime",
            ),
            "s5'.improve.status"
            | "s5'.improve.propose"
            | "s5'.improve.evaluate"
            | "s5'.improve.promote"
            | "s5'.improve.history" => route(
                method,
                GatewayDispatchOwner::S5Autoresearch,
                GatewayDispatchClass::AutoresearchRuntime,
                "S5'",
                "S5",
                "s5-prime.autoresearch-runtime",
            ),
            "s4.agent.query" | "s4.agent.notify" | "s4.agent.status" | "s4'.vak.evaluate"
            | "s4'.orchestrate" | "s4'.psyche.state" | "s4'.psyche.update"
            | "s4'.permission.get" => route(
                method,
                GatewayDispatchOwner::S4TaOntaAgent,
                GatewayDispatchClass::TaOntaAgentRuntime,
                "S4/S4'",
                "S4",
                "s4-prime.ta-onta-runtime",
            ),
            _ if method.starts_with("nara.") => route(
                method,
                GatewayDispatchOwner::S4S5DomainAdapter,
                GatewayDispatchClass::NaraExtension,
                "M4'/S4",
                "S4/S5",
                "m4-prime.nara-extension",
            ),
            "health" | "status" | "status.summary" | "health.snapshot" | "presence.list"
            | "system-presence" | "system-event" | "last-heartbeat" | "set-heartbeats" | "wake"
            | "models.list" | "logs.tail" | "usage.status" | "usage.cost" | "update.run"
            | "tts.status" | "tts.enable" | "tts.disable" | "tts.convert" | "tts.setProvider"
            | "tts.providers" | "voicewake.get" | "voicewake.set" | "talk.mode" => route(
                method,
                GatewayDispatchOwner::S0ProductAdapter,
                GatewayDispatchClass::SystemSurface,
                "S0",
                "S0/S4/S5",
                "s0.product-system-surface",
            ),
            "config.get" | "config.schema" | "config.set" | "config.patch" | "config.apply" => {
                route(
                    method,
                    GatewayDispatchOwner::S0ProductAdapter,
                    GatewayDispatchClass::ConfigurationSurface,
                    "S0",
                    "S0/S4/S5",
                    "s0.product-configuration",
                )
            }
            "cron.list" | "cron.status" | "cron.add" | "cron.update" | "cron.remove"
            | "cron.run" | "cron.runs" | "wizard.start" | "wizard.next" | "wizard.cancel"
            | "wizard.status" => route(
                method,
                GatewayDispatchOwner::S0ProductAdapter,
                GatewayDispatchClass::AutomationSurface,
                "S0",
                "S4/S5",
                "s0.product-automation",
            ),
            "device.pair.list"
            | "device.pair.approve"
            | "device.pair.reject"
            | "device.token.rotate"
            | "device.token.revoke"
            | "browser.request"
            | "web.login.start"
            | "web.login.wait" => route(
                method,
                GatewayDispatchOwner::S0ProductAdapter,
                GatewayDispatchClass::DeviceSurface,
                "S0",
                "S0/S4/S5",
                "s0.product-device-surface",
            ),
            "node.pair.request"
            | "node.pair.list"
            | "node.pair.approve"
            | "node.pair.reject"
            | "node.pair.verify"
            | "node.rename"
            | "node.list"
            | "node.describe"
            | "node.invoke"
            | "node.invoke.result"
            | "node.event"
            | "exec.approval.request"
            | "exec.approval.resolve"
            | "exec.approvals.get"
            | "exec.approvals.set"
            | "exec.approvals.node.get"
            | "exec.approvals.node.set" => route(
                method,
                GatewayDispatchOwner::S0ProductAdapter,
                GatewayDispatchClass::NodeSurface,
                "S0",
                "S0/S4/S5",
                "s0.product-node-surface",
            ),
            "skills.status" | "skills.bins" | "skills.install" | "skills.update" => route(
                method,
                GatewayDispatchOwner::S0ProductAdapter,
                GatewayDispatchClass::SkillSurface,
                "S0/S5",
                "S4/S5",
                "s0.product-skill-surface",
            ),
            _ => None,
        };

    class
}

fn route(
    method: &str,
    owner: GatewayDispatchOwner,
    class: GatewayDispatchClass,
    coordinate_owner: &'static str,
    agent_access_owner: &'static str,
    route_id: &'static str,
) -> Option<GatewayDispatchRoute> {
    let method = canonical_method_name(method)?;
    Some(GatewayDispatchRoute {
        method,
        owner,
        class,
        coordinate_owner,
        agent_access_owner,
        route_id,
    })
}

fn canonical_method_name(method: &str) -> Option<&'static str> {
    epi_s3_gateway_contract::method_names()
        .iter()
        .copied()
        .find(|candidate| *candidate == method)
        .or_else(|| match method {
            "s5'.epii.user.orientation" => Some("s5'.epii.user.orientation"),
            "s5'.epii.pratibimba.status" => Some("s5'.epii.pratibimba.status"),
            "s5'.epii.kairos.context" => Some("s5'.epii.kairos.context"),
            _ if method.starts_with("nara.") => Some("nara.*"),
            _ => None,
        })
}
