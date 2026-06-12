#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LedgerChannel {
    pub name: &'static str,
    pub ledger_name: &'static str,
    pub compiler_name: &'static str,
    pub return_name: &'static str,
}
pub const ENVELOPE_LEDGER_CHANNELS: &[LedgerChannel] = &[
    LedgerChannel {
        name: "transport",
        ledger_name: "transport.ledger",
        compiler_name: "transport_compiler",
        return_name: "transport_ctx",
    },
    LedgerChannel {
        name: "runtime",
        ledger_name: "runtime.ledger",
        compiler_name: "runtime_compiler",
        return_name: "runtime_ctx",
    },
    LedgerChannel {
        name: "temporal",
        ledger_name: "temporal.ledger",
        compiler_name: "temporal_compiler",
        return_name: "temporal_ctx",
    },
    LedgerChannel {
        name: "coordinate",
        ledger_name: "coordinate.ledger",
        compiler_name: "coordinate_compiler",
        return_name: "coordinate_ctx",
    },
    LedgerChannel {
        name: "residency",
        ledger_name: "residency.ledger",
        compiler_name: "residency_compiler",
        return_name: "residency_ctx",
    },
    LedgerChannel {
        name: "context",
        ledger_name: "context.ledger",
        compiler_name: "context_compiler",
        return_name: "context_pool",
    },
    LedgerChannel {
        name: "environs",
        ledger_name: "environs.ledger",
        compiler_name: "environs_compiler",
        return_name: "environs_ctx",
    },
    LedgerChannel {
        name: "execution",
        ledger_name: "execution.ledger",
        compiler_name: "execution_compiler",
        return_name: "execution_ctx",
    },
    LedgerChannel {
        name: "episodic",
        ledger_name: "episodic.ledger",
        compiler_name: "episodic_compiler",
        return_name: "episode_ctx",
    },
    LedgerChannel {
        name: "crystallisation",
        ledger_name: "crystallisation.ledger",
        compiler_name: "crystallisation_compiler",
        return_name: "crystallisation_ctx",
    },
    LedgerChannel {
        name: "improvement",
        ledger_name: "improvement.ledger",
        compiler_name: "improvement_compiler",
        return_name: "improvement_ctx",
    },
    LedgerChannel {
        name: "ql",
        ledger_name: "ql.ledger",
        compiler_name: "ql_compiler",
        return_name: "ql_ctx",
    },
];

pub fn ql_first_channels() -> Vec<LedgerChannel> {
    let mut channels = Vec::with_capacity(ENVELOPE_LEDGER_CHANNELS.len());
    channels.extend(
        ENVELOPE_LEDGER_CHANNELS
            .iter()
            .filter(|channel| channel.name == "ql")
            .cloned(),
    );
    channels.extend(
        ENVELOPE_LEDGER_CHANNELS
            .iter()
            .filter(|channel| channel.name != "ql")
            .cloned(),
    );
    channels
}
