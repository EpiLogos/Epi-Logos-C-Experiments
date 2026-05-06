"""Dry-run compile planning for the Hen compiler spine."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from hen_residency import ENVELOPE_LEDGER_CHANNELS, resolve_compiler_residency


@dataclass(frozen=True)
class CompilerInvocation:
    executor_kind: str
    target_agent: str
    required_plugin: str
    required_skill: str
    tool_boundary: str
    review_policy: str
    mutation_mode: str
    compatibility_backend: bool


@dataclass(frozen=True)
class S1PrimeCompileResponse:
    compiled: int
    ledger_entries: list[str]
    artifacts: list[str]
    errors: list[str]
    source_paths: list[str]
    invocation: CompilerInvocation | None = None


def _required_plugin_for(target_agent: str) -> str:
    if target_agent == "anima":
        return "pleroma"
    if target_agent == "epii":
        return "epi-logos"
    raise ValueError(f"unsupported compiler target agent: {target_agent}")


def _required_skill_for(target_agent: str, required_skill: str | None) -> str:
    if required_skill is not None:
        return required_skill
    if target_agent == "anima":
        return "anima-orchestration"
    if target_agent == "epii":
        return "autoresearch"
    raise ValueError(f"unsupported compiler target agent: {target_agent}")


def _tool_boundary_for(executor_kind: str, target_agent: str) -> str:
    if executor_kind == "vendor_claude_sdk":
        return "vendor_compat_read_write"
    if executor_kind == "pi_agent":
        return f"{target_agent}_bounded_pi_tools"
    raise ValueError(f"unsupported compiler executor kind: {executor_kind}")


def _compiler_invocation(
    *,
    executor_kind: str,
    target_agent: str,
    required_skill: str | None,
    dry_run: bool,
) -> CompilerInvocation:
    return CompilerInvocation(
        executor_kind=executor_kind,
        target_agent=target_agent,
        required_plugin=_required_plugin_for(target_agent),
        required_skill=_required_skill_for(target_agent, required_skill),
        tool_boundary=_tool_boundary_for(executor_kind, target_agent),
        review_policy="epii_inbox",
        mutation_mode="dry_run" if dry_run else "apply",
        compatibility_backend=executor_kind == "vendor_claude_sdk",
    )


def plan_compile(
    *,
    vault_root: Path,
    compiler_root: Path,
    now: datetime,
    channel: str,
    thought_lane: str,
    artifact_slug: str,
    executor_kind: str = "pi_agent",
    target_agent: str = "anima",
    required_skill: str | None = None,
    dry_run: bool = True,
) -> S1PrimeCompileResponse:
    """Plan an S1' compiler pass against canonical vault residency."""
    if not dry_run and executor_kind != "pi_agent":
        return S1PrimeCompileResponse(
            compiled=0,
            ledger_entries=[],
            artifacts=[],
            errors=["non-dry-run compile requires pi_agent executor"],
            source_paths=[],
        )

    try:
        invocation = _compiler_invocation(
            executor_kind=executor_kind,
            target_agent=target_agent,
            required_skill=required_skill,
            dry_run=dry_run,
        )
    except ValueError as error:
        return S1PrimeCompileResponse(
            compiled=0,
            ledger_entries=[],
            artifacts=[],
            errors=[str(error)],
            source_paths=[],
        )

    if not dry_run:
        return S1PrimeCompileResponse(
            compiled=0,
            ledger_entries=[],
            artifacts=[],
            errors=["non-dry-run compile is not implemented in the Hen facade yet"],
            source_paths=[],
            invocation=invocation,
        )

    channel_by_name = {ledger_channel.name: ledger_channel for ledger_channel in ENVELOPE_LEDGER_CHANNELS}
    ledger_channel = channel_by_name.get(channel)
    if ledger_channel is None:
        return S1PrimeCompileResponse(
            compiled=0,
            ledger_entries=[],
            artifacts=[],
            errors=[f"unknown ledger channel: {channel}"],
            source_paths=[],
            invocation=invocation,
        )

    try:
        residency = resolve_compiler_residency(
            vault_root=vault_root,
            compiler_root=compiler_root,
            now=now,
            thought_lane=thought_lane,
            artifact_slug=artifact_slug,
        )
    except ValueError as error:
        return S1PrimeCompileResponse(
            compiled=0,
            ledger_entries=[],
            artifacts=[],
            errors=[str(error)],
            source_paths=[],
            invocation=invocation,
        )

    if not residency.source_path.exists():
        return S1PrimeCompileResponse(
            compiled=0,
            ledger_entries=[],
            artifacts=[],
            errors=[f"source path does not exist: {residency.source_path}"],
            source_paths=[str(residency.source_path)],
            invocation=invocation,
        )

    return S1PrimeCompileResponse(
        compiled=0,
        ledger_entries=[ledger_channel.ledger_name],
        artifacts=[str(residency.compiled_path)],
        errors=[],
        source_paths=[str(residency.source_path)],
        invocation=invocation,
    )
