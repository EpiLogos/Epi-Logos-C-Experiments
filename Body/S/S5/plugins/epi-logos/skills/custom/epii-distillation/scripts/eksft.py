#!/usr/bin/env python3
"""
eksft.py — Epistemic Knowledge Supervised Fine-Tuning (EKSFT) loss for M1' CPT.

Per the Phase-I DiscoverAI research synthesis (wave-2 scout 4), EKSFT replaces
generic perplexity-only anti-drift with a structured loss that:
  1. Constructs a mask M via top-K entropy ∪ top-K KL-divergence from a frozen
     reference model (π_ref).
  2. Computes safe cross-entropy on un-masked tokens (M^C).
  3. Applies KL-regularization + entropy-regularization on masked tokens.

Loss formulation (from DiscoverAI research deep-dive [04-distillation-finetuning.txt] §1):
    mask M = top_K_entropy(token) ∪ top_K_KL_divergence(token, π_ref)
    loss = CE(safe_tokens=M^C) + λ_kl·KL_regularization(masked_tokens|π_ref)
           + λ_h·entropy_regularization(masked_tokens)

Empirical baseline: +7% pass@1, +5.1% pass@32 on Qwen 1.5 4B (AIM25).

All thresholds (K, λ_kl, λ_h, perplexity-drift-halt %) are from config, per the
no-hardcoding rule (Tranches 12.20 / 12.23 / 12.24).

Integration surface: consumed by the epii-distillation skill (Track 12.24 Phase 2),
extending the peft / unsloth / mlx-lora backends with custom loss override.

Config section: ~/.epi-logos/config.toml [ml.m1_paramasiva_cpt]
"""

import math
import logging
from dataclasses import dataclass, field
from typing import Optional, Dict, Any, List, Tuple

import torch
import torch.nn as nn
import torch.nn.functional as F

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Configuration (all from config.toml — no hardcoded constants)
# ---------------------------------------------------------------------------

@dataclass
class EksftConfig:
    """EKSFT loss configuration consumed from [ml.m1_paramasiva_cpt].

    Every field is config-driven per the no-hardcoding rule.
    """
    # Mask cardinality — top-K tokens selected by entropy and KL-divergence
    k_entropy: int = 32
    k_kl_divergence: int = 32

    # Regularization weights
    lambda_kl: float = 0.1
    lambda_h: float = 0.05

    # Perplexity drift halt threshold (outer gate — percentage rise allowed)
    perplexity_drift_halt_pct: float = 10.0

    # Whether to normalise the combined mask to k_total tokens
    mask_normalize: bool = True

    # Minimum token probability to avoid log(0)
    eps: float = 1e-8

    @classmethod
    def from_config(cls, config: Dict[str, Any]) -> "EksftConfig":
        """Construct from a TOML-parsed config dict."""
        return cls(
            k_entropy=config.get("k_entropy", 32),
            k_kl_divergence=config.get("k_kl_divergence", 32),
            lambda_kl=config.get("lambda_kl", 0.1),
            lambda_h=config.get("lambda_h", 0.05),
            perplexity_drift_halt_pct=config.get("perplexity_drift_halt_pct", 10.0),
            mask_normalize=config.get("mask_normalize", True),
            eps=config.get("eps", 1e-8),
        )


# ---------------------------------------------------------------------------
# Core EKSFT loss
# ---------------------------------------------------------------------------

class EksftLoss(nn.Module):
    """EKSFT (Epistemic Knowledge Supervised Fine-Tuning) loss module.

    Designed as a drop-in replacement for standard cross-entropy in CPT
    training loops. Accepts logits, labels, and the reference model's
    logits (π_ref) to construct the entropy-KL mask and compute the
    structured loss.

    Usage in a training loop::

        eksft = EksftLoss(config)
        ...
        with torch.no_grad():
            ref_logits = ref_model(input_ids).logits
        loss = eksft(student_logits, labels, ref_logits, attention_mask)
    """

    def __init__(self, config: EksftConfig):
        super().__init__()
        self.cfg = config

    def _compute_token_entropy(
        self, logits: torch.Tensor
    ) -> torch.Tensor:
        """Compute per-token entropy: H(token) = -Σ p * log(p)."""
        probs = F.softmax(logits, dim=-1)
        log_probs = F.log_softmax(logits, dim=-1)
        entropy = -(probs * log_probs).sum(dim=-1)  # [B, S]
        return entropy

    def _compute_token_kl_divergence(
        self, student_logits: torch.Tensor, ref_logits: torch.Tensor
    ) -> torch.Tensor:
        """Compute per-token KL divergence KL(student || ref)."""
        s_probs = F.softmax(student_logits, dim=-1)
        s_log_probs = F.log_softmax(student_logits, dim=-1)
        r_probs = F.softmax(ref_logits, dim=-1)
        r_log_probs = F.log_softmax(ref_logits, dim=-1)

        # KL(student || ref) = Σ s * (log s - log r)
        kl = (s_probs * (s_log_probs - r_log_probs)).sum(dim=-1)  # [B, S]
        return kl

    def _build_mask(
        self,
        student_logits: torch.Tensor,
        ref_logits: torch.Tensor,
        attention_mask: torch.Tensor,
    ) -> torch.Tensor:
        """Build the EKSFT mask M from entropy and KL divergence top-K.

        Returns a boolean mask where True = masked (high entropy/KL token).
        """
        batch_size, seq_len = student_logits.shape[:2]

        # Only consider non-padding positions
        valid_mask = attention_mask.bool()  # [B, S]

        # Compute per-token entropy and KL
        entropy = self._compute_token_entropy(student_logits)
        kl_div = self._compute_token_kl_divergence(student_logits, ref_logits)

        # Mask out padding positions (set to -inf so they are never selected)
        entropy = entropy.masked_fill(~valid_mask, float("-inf"))
        kl_div = kl_div.masked_fill(~valid_mask, float("-inf"))

        # Top-K entropy tokens
        k_ent = min(self.cfg.k_entropy, seq_len)
        _, ent_topk_indices = torch.topk(entropy, k_ent, dim=-1)  # [B, K]

        # Top-K KL divergence tokens
        k_kl = min(self.cfg.k_kl_divergence, seq_len)
        _, kl_topk_indices = torch.topk(kl_div, k_kl, dim=-1)  # [B, K]

        # Build union mask: True where token is in either top-K set
        mask = torch.zeros_like(entropy, dtype=torch.bool)  # [B, S]
        for b in range(batch_size):
            mask[b, ent_topk_indices[b]] = True
            mask[b, kl_topk_indices[b]] = True

        return mask  # True = high-entropy/KL (masked for special treatment)

    def forward(
        self,
        student_logits: torch.Tensor,   # [B, S, V]
        labels: torch.Tensor,            # [B, S]
        ref_logits: torch.Tensor,        # [B, S, V] — from frozen π_ref
        attention_mask: torch.Tensor,    # [B, S]
    ) -> Dict[str, torch.Tensor]:
        """Compute the EKSFT loss and return per-component breakdown.

        Returns:
            Dict with keys: 'loss' (total), 'ce_safe' (CE on safe tokens),
            'kl_masked' (KL on masked tokens), 'h_masked' (entropy on masked tokens).
        """
        batch_size, seq_len, vocab_size = student_logits.shape
        device = student_logits.device

        # Build the EKSFT mask
        mask = self._build_mask(student_logits, ref_logits, attention_mask)
        safe_mask = ~mask & attention_mask.bool()  # complement: safe tokens

        # --- Component 1: Cross-entropy on safe tokens (M^C) ---
        if safe_mask.any():
            safe_logits = student_logits[safe_mask]  # [N_safe, V]
            safe_labels = labels[safe_mask]           # [N_safe]
            ce_safe = F.cross_entropy(safe_logits, safe_labels, reduction="mean")
        else:
            ce_safe = torch.tensor(0.0, device=device)

        # --- Component 2: KL regularization on masked tokens ---
        if mask.any():
            s_masked_logits = student_logits[mask]  # [N_mask, V]
            r_masked_logits = ref_logits[mask]

            s_log_probs = F.log_softmax(s_masked_logits, dim=-1)
            r_log_probs = F.log_softmax(r_masked_logits, dim=-1)
            s_probs = F.softmax(s_masked_logits, dim=-1)

            kl_masked = (s_probs * (s_log_probs - r_log_probs)).sum(dim=-1).mean()
        else:
            kl_masked = torch.tensor(0.0, device=device)

        # --- Component 3: Entropy regularization on masked tokens ---
        if mask.any():
            s_masked_logits_for_ent = student_logits[mask]
            probs = F.softmax(s_masked_logits_for_ent, dim=-1)
            log_probs = F.log_softmax(s_masked_logits_for_ent, dim=-1)
            h_masked = -(probs * log_probs).sum(dim=-1).mean()
        else:
            h_masked = torch.tensor(0.0, device=device)

        # --- Total loss ---
        total_loss = (
            ce_safe
            + self.cfg.lambda_kl * kl_masked
            + self.cfg.lambda_h * h_masked
        )

        return {
            "loss": total_loss,
            "ce_safe": ce_safe.detach(),
            "kl_masked": kl_masked.detach(),
            "h_masked": h_masked.detach(),
        }


# ---------------------------------------------------------------------------
# Perplexity drift halt (outer gate)
# ---------------------------------------------------------------------------

def check_perplexity_drift_halt(
    current_perplexity: float,
    baseline_perplexity: float,
    config: EksftConfig,
) -> Tuple[bool, float, str]:
    """Check if perplexity has drifted beyond the allowed threshold.

    Per the spec §4.3: if perplexity on canonical material rises >10%
    relative to previous checkpoint, halt training.

    Returns:
        (should_halt: bool, drift_pct: float, reason: str)
    """
    if baseline_perplexity <= 0:
        return False, 0.0, "no baseline — cannot compute drift"

    drift_pct = ((current_perplexity - baseline_perplexity) / baseline_perplexity) * 100.0

    if drift_pct > config.perplexity_drift_halt_pct:
        reason = (
            f"PERPLEXITY DRIFT HALT: {drift_pct:.2f}% rise "
            f"(baseline={baseline_perplexity:.4f}, current={current_perplexity:.4f}, "
            f"threshold={config.perplexity_drift_halt_pct:.1f}%)"
        )
        return True, drift_pct, reason

    return False, drift_pct, ""


# ---------------------------------------------------------------------------
# Utility: compute perplexity from logits
# ---------------------------------------------------------------------------

def compute_perplexity(
    logits: torch.Tensor,
    labels: torch.Tensor,
    attention_mask: torch.Tensor,
    eps: float = 1e-8,
) -> float:
    """Compute perplexity over non-padding tokens."""
    shift_logits = logits[..., :-1, :].contiguous()
    shift_labels = labels[..., 1:].contiguous()
    shift_mask = attention_mask[..., 1:].contiguous()

    ce = F.cross_entropy(
        shift_logits.view(-1, shift_logits.size(-1)),
        shift_labels.view(-1),
        reduction="none",
    )
    ce = ce.view(shift_labels.shape)

    # Average over non-padding tokens
    total_tokens = shift_mask.sum().clamp(min=1)
    avg_ce = (ce * shift_mask).sum() / total_tokens

    perplexity = torch.exp(avg_ce).item()
    return perplexity


# ---------------------------------------------------------------------------
# Config loader from TOML
# ---------------------------------------------------------------------------

def load_eksft_config(config_path: Optional[str] = None) -> EksftConfig:
    """Load EKSFT config from ~/.epi-logos/config.toml.

    If config_path is None, defaults to ~/.epi-logos/config.toml.
    Falls back to defaults if file is missing or section is absent.
    """
    import os
    import sys

    if config_path is None:
        config_path = os.path.expanduser("~/.epi-logos/config.toml")

    cfg_dict: Dict[str, Any] = {}

    if os.path.exists(config_path):
        try:
            # Simple TOML parsing — try tomllib (3.11+) then tomli
            if sys.version_info >= (3, 11):
                import tomllib
            else:
                import tomli as tomllib

            with open(config_path, "rb") as f:
                data = tomllib.load(f)

            cfg_dict = data.get("ml", {}).get("m1_paramasiva_cpt", {})
            logger.info(f"Loaded EKSFT config from {config_path}: {cfg_dict}")
        except Exception as e:
            logger.warning(
                f"Could not load config from {config_path}: {e}. "
                f"Using defaults."
            )
    else:
        logger.info(f"No config file at {config_path}, using defaults.")

    return EksftConfig.from_config(cfg_dict)
