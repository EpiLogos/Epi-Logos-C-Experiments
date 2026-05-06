"""Hen compiler residency contracts over the vendor memory-compiler spine."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path


@dataclass(frozen=True)
class LedgerChannel:
    name: str
    ledger_name: str
    compiler_name: str
    return_name: str


@dataclass(frozen=True)
class CompilerResidencyPlan:
    source_path: Path
    compiled_path: Path
    vendor_source_alias: Path
    vendor_knowledge_alias: Path
    thought_lane: str
    day_id: str
    artifact_slug: str


ENVELOPE_LEDGER_CHANNELS: tuple[LedgerChannel, ...] = (
    LedgerChannel("transport", "transport.ledger", "transport_compiler", "transport_ctx"),
    LedgerChannel("runtime", "runtime.ledger", "runtime_compiler", "runtime_ctx"),
    LedgerChannel("temporal", "temporal.ledger", "temporal_compiler", "temporal_ctx"),
    LedgerChannel("coordinate", "coordinate.ledger", "coordinate_compiler", "coordinate_ctx"),
    LedgerChannel("residency", "residency.ledger", "residency_compiler", "residency_ctx"),
    LedgerChannel("context", "context.ledger", "context_compiler", "context_pool"),
    LedgerChannel("environs", "environs.ledger", "environs_compiler", "environs_ctx"),
    LedgerChannel("execution", "execution.ledger", "execution_compiler", "execution_ctx"),
    LedgerChannel("episodic", "episodic.ledger", "episodic_compiler", "episode_ctx"),
    LedgerChannel(
        "crystallisation",
        "crystallisation.ledger",
        "crystallisation_compiler",
        "crystallisation_ctx",
    ),
    LedgerChannel("improvement", "improvement.ledger", "improvement_compiler", "improvement_ctx"),
    LedgerChannel("ql", "ql.ledger", "ql_compiler", "ql_ctx"),
)


def ql_first_channels() -> tuple[LedgerChannel, ...]:
    """Return compiler channels in interpretation order."""
    ql = [channel for channel in ENVELOPE_LEDGER_CHANNELS if channel.name == "ql"]
    rest = [channel for channel in ENVELOPE_LEDGER_CHANNELS if channel.name != "ql"]
    return tuple(ql + rest)


def resolve_compiler_residency(
    *,
    vault_root: Path,
    compiler_root: Path,
    now: datetime,
    thought_lane: str,
    artifact_slug: str,
) -> CompilerResidencyPlan:
    """Resolve canonical Hen paths while preserving vendor compatibility aliases."""
    if thought_lane not in {f"T{i}" for i in range(6)}:
        raise ValueError("thought_lane must be T0 through T5")
    if not artifact_slug:
        raise ValueError("artifact_slug must be non-empty")

    day_id = now.strftime("%d-%m-%Y")
    vendor_day_id = now.strftime("%Y-%m-%d")

    source_path = vault_root / "Empty" / "Present" / day_id / "daily-note.md"
    compiled_path = (
        vault_root / "Pratibimba" / "Self" / "Thought" / "T" / thought_lane / f"{artifact_slug}.md"
    )

    return CompilerResidencyPlan(
        source_path=source_path,
        compiled_path=compiled_path,
        vendor_source_alias=compiler_root / "daily" / f"{vendor_day_id}.md",
        vendor_knowledge_alias=compiler_root / "knowledge" / "concepts" / f"{artifact_slug}.md",
        thought_lane=thought_lane,
        day_id=day_id,
        artifact_slug=artifact_slug,
    )
