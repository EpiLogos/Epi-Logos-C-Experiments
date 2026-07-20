#!/usr/bin/env python3
"""
eval_m1_canonical_derivation.py — Perplexity eval on held-out canonical-derivation corpus.

Per M5'-on-Paramaśiva spec §4.3 anti-drift verification: after every CPT pass,
this script evaluates a candidate checkpoint against the held-out canonical
derivation eval corpus and emits the halt-or-pass signal.

Usage:
    python eval_m1_canonical_derivation.py \\
        --checkpoint /path/to/checkpoint \\
        --corpus-dir /path/to/eval-corpus/m1-paramasiva \\
        --baseline-ppl 12.34 \\
        [--output-json results.json]

Returns exit code 0 on pass, 1 on halt (perplexity drift exceeds threshold).
"""

import argparse
import json
import logging
import math
import os
import sys
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Data types
# ---------------------------------------------------------------------------

@dataclass
class EvalPassage:
    """A single eval passage loaded from a .jsonl file."""
    passage_id: str
    text: str
    source_file: str
    source_section: str
    derivational_register_class: str
    canonical_register_features: List[str]

    @classmethod
    def from_dict(cls, d: dict) -> "EvalPassage":
        return cls(
            passage_id=d["passage_id"],
            text=d["text"],
            source_file=d.get("source_file", ""),
            source_section=d.get("source_section", ""),
            derivational_register_class=d.get(
                "derivational_register_class", "foundational-derivational"
            ),
            canonical_register_features=d.get("canonical_register_features", []),
        )


@dataclass
class EvalCorpusManifest:
    """Parsed manifest.json declaring the eval corpus shape."""
    version: str
    total_passages: int
    halt_threshold_pct: float
    files: List[dict] = field(default_factory=list)

    @classmethod
    def from_dict(cls, d: dict) -> "EvalCorpusManifest":
        halt_cfg = d.get("halt_threshold", {})
        return cls(
            version=d.get("version", "unknown"),
            total_passages=d.get("total_passages", 0),
            halt_threshold_pct=halt_cfg.get("threshold_pct", 10.0),
            files=d.get("files", []),
        )


@dataclass
class PerFilePerplexity:
    """Perplexity result for one corpus file."""
    filename: str
    passages_evaluated: int
    mean_perplexity: float
    total_tokens: int


@dataclass
class EvalResult:
    """Full evaluation result."""
    checkpoint_path: str
    baseline_perplexity: float
    current_perplexity: float
    drift_pct: float
    halt: bool
    per_file_results: List[PerFilePerplexity] = field(default_factory=list)
    total_passages: int = 0
    total_tokens: int = 0


# ---------------------------------------------------------------------------
# Corpus loading
# ---------------------------------------------------------------------------

def load_eval_corpus(corpus_dir: str) -> Tuple[List[EvalPassage], EvalCorpusManifest]:
    """Load all eval passages and manifest from the corpus directory."""
    manifest_path = os.path.join(corpus_dir, "manifest.json")
    if not os.path.exists(manifest_path):
        raise FileNotFoundError(f"Manifest not found: {manifest_path}")

    with open(manifest_path, "r") as f:
        manifest = EvalCorpusManifest.from_dict(json.load(f))

    passages: List[EvalPassage] = []
    jsonl_files = [f for f in os.listdir(corpus_dir) if f.endswith(".passages.jsonl")]

    for jsonl_file in sorted(jsonl_files):
        filepath = os.path.join(corpus_dir, jsonl_file)
        with open(filepath, "r") as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        passage = EvalPassage.from_dict(json.loads(line))
                        passages.append(passage)
                    except (json.JSONDecodeError, KeyError) as e:
                        logger.warning(f"Skipping malformed line in {jsonl_file}: {e}")

    logger.info(
        f"Loaded {len(passages)} passages from {len(jsonl_files)} files "
        f"(manifest declares {manifest.total_passages})"
    )

    return passages, manifest


# ---------------------------------------------------------------------------
# Perplexity computation (real forward pass — no synthetic values)
# ---------------------------------------------------------------------------

_EKSFT_MODULE = None


def _load_eksft():
    """Import the sibling ``eksft`` module — the canonical, unit-tested
    ``compute_perplexity`` (cross-entropy → perplexity) routine lives there."""
    global _EKSFT_MODULE
    if _EKSFT_MODULE is None:
        scripts_dir = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "scripts")
        )
        if scripts_dir not in sys.path:
            sys.path.insert(0, scripts_dir)
        import eksft  # noqa: E402  (path-injected sibling module)

        _EKSFT_MODULE = eksft
    return _EKSFT_MODULE


def load_eval_model(checkpoint_path: str):
    """Load a causal-LM checkpoint + tokenizer for real perplexity eval.

    Raises loudly if the checkpoint cannot be loaded — this eval NEVER falls
    back to a synthetic score. In production ``checkpoint_path`` is the CPT'd
    M1' checkpoint (or a slot-resolved eval model); any HF-format directory
    works.
    """
    import torch  # noqa: F401  (ensures the backend is present; fail loud if not)
    from transformers import AutoModelForCausalLM, AutoTokenizer

    tokenizer = AutoTokenizer.from_pretrained(checkpoint_path)
    model = AutoModelForCausalLM.from_pretrained(checkpoint_path)
    model.eval()
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token or tokenizer.unk_token
    return model, tokenizer


def compute_perplexity_real(
    model, tokenizer, passage: EvalPassage, max_length: int = 1024
) -> Tuple[float, int]:
    """Real per-passage perplexity: tokenize the passage, teacher-force it, and
    feed the logits into ``eksft.compute_perplexity`` (the canonical, already
    unit-tested cross-entropy → perplexity routine). No synthetic values, no
    hashing — the number comes from a real forward pass.

    Returns ``(perplexity, non_pad_token_count)``. A passage shorter than two
    tokens has no next-token target and yields ``(nan, tokens)``; callers skip
    such degenerate passages from the aggregate.
    """
    import torch

    eksft = _load_eksft()
    enc = tokenizer(
        passage.text, return_tensors="pt", truncation=True, max_length=max_length
    )
    input_ids = enc["input_ids"]
    attention_mask = enc.get("attention_mask")
    if attention_mask is None:
        attention_mask = torch.ones_like(input_ids)
    token_count = int(attention_mask.sum().item())
    if input_ids.shape[-1] < 2:
        return float("nan"), token_count
    with torch.no_grad():
        logits = model(input_ids=input_ids, attention_mask=attention_mask).logits
    perplexity = eksft.compute_perplexity(logits, input_ids, attention_mask)
    return perplexity, token_count


# ---------------------------------------------------------------------------
# Evaluation runner
# ---------------------------------------------------------------------------

def run_evaluation(
    checkpoint_path: str,
    corpus_dir: str,
    baseline_perplexity: Optional[float] = None,
    model_and_tokenizer=None,
) -> EvalResult:
    """Run real perplexity evaluation on the held-out corpus.

    Args:
        checkpoint_path: Path to the CPT'd checkpoint to evaluate (loaded via
            ``load_eval_model`` unless ``model_and_tokenizer`` is injected).
        corpus_dir: Path to the eval-corpus/m1-paramasiva directory.
        baseline_perplexity: Previous checkpoint's perplexity for drift computation.
            If None, this is a baseline evaluation (no drift check).
        model_and_tokenizer: Optional pre-loaded ``(model, tokenizer)`` pair — a
            dependency-injection seam for tests; production loads from the
            checkpoint path. A load failure raises loudly (no synthetic fallback).

    Returns:
        EvalResult with full evaluation data.
    """
    passages, manifest = load_eval_corpus(corpus_dir)

    if not passages:
        raise ValueError(f"No passages found in {corpus_dir}")

    # Load the eval model ONCE. Injectable for tests; production loads the real
    # checkpoint. Loading raises loudly rather than fabricating a score.
    if model_and_tokenizer is None:
        model, tokenizer = load_eval_model(checkpoint_path)
    else:
        model, tokenizer = model_and_tokenizer

    # Group passages by source file for per-file metrics
    per_file: Dict[str, List[float]] = {}
    per_file_tokens: Dict[str, int] = {}
    total_ppl = 0.0
    total_tokens = 0
    evaluated_passages = 0

    for passage in passages:
        ppl, tokens = compute_perplexity_real(model, tokenizer, passage)
        if not math.isfinite(ppl):
            # Degenerate (sub-two-token) passage — no next-token target.
            continue
        evaluated_passages += 1
        total_ppl += ppl * tokens
        total_tokens += tokens

        # Source file grouping
        source_key = os.path.basename(passage.source_file)
        if source_key not in per_file:
            per_file[source_key] = []
            per_file_tokens[source_key] = 0
        per_file[source_key].append(ppl)
        per_file_tokens[source_key] += tokens

    mean_ppl = total_ppl / total_tokens if total_tokens > 0 else 0.0

    # Build per-file results
    per_file_results = []
    for filename, ppls in per_file.items():
        per_file_results.append(
            PerFilePerplexity(
                filename=filename,
                passages_evaluated=len(ppls),
                mean_perplexity=sum(ppls) / len(ppls) if ppls else 0.0,
                total_tokens=per_file_tokens.get(filename, 0),
            )
        )

    # Drift check
    drift_pct = 0.0
    halt = False

    if baseline_perplexity is not None and baseline_perplexity > 0:
        drift_pct = ((mean_ppl - baseline_perplexity) / baseline_perplexity) * 100.0
        if drift_pct > manifest.halt_threshold_pct:
            halt = True
            logger.warning(
                f"HALT: Perplexity drift {drift_pct:.2f}% exceeds threshold "
                f"{manifest.halt_threshold_pct:.1f}%"
            )
        else:
            logger.info(
                f"PASS: Perplexity drift {drift_pct:.2f}% within threshold "
                f"{manifest.halt_threshold_pct:.1f}%"
            )
    elif baseline_perplexity is None:
        logger.info(
            f"Baseline evaluation: mean perplexity = {mean_ppl:.4f} "
            f"(no drift check — this is the baseline establishment run)"
        )

    return EvalResult(
        checkpoint_path=checkpoint_path,
        baseline_perplexity=baseline_perplexity or mean_ppl,
        current_perplexity=mean_ppl,
        drift_pct=drift_pct,
        halt=halt,
        per_file_results=per_file_results,
        total_passages=evaluated_passages,
        total_tokens=total_tokens,
    )


# ---------------------------------------------------------------------------
# Output formatting
# ---------------------------------------------------------------------------

def format_result(result: EvalResult) -> str:
    """Format evaluation result as human-readable text."""
    lines = [
        "=" * 60,
        "M1' PARAMAŚIVA CPT — CANONICAL DERIVATION EVAL",
        "=" * 60,
        f"Checkpoint:          {result.checkpoint_path}",
        f"Baseline perplexity: {result.baseline_perplexity:.4f}",
        f"Current perplexity:  {result.current_perplexity:.4f}",
        f"Drift:               {result.drift_pct:+.2f}%",
        f"HALT signal:         {'YES ⛔' if result.halt else 'NO ✅'}",
        f"Passages evaluated:  {result.total_passages}",
        f"Total tokens:        {result.total_tokens}",
        "",
        "Per-file breakdown:",
    ]

    for pf in result.per_file_results:
        lines.append(
            f"  {pf.filename:40s}  {pf.passages_evaluated:2d} passages  "
            f"ppl={pf.mean_perplexity:.4f}  tokens={pf.total_tokens}"
        )

    if result.halt:
        lines.extend([
            "",
            "⛔ HALT: Perplexity drift exceeds threshold.",
            "   Review corpus composition for register-pollution before resuming.",
            "   See EKSFT loss module for mask retuning options.",
        ])
    else:
        lines.extend([
            "",
            "✅ PASS: Perplexity within acceptable drift bounds.",
        ])

    lines.append("=" * 60)
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# CLI entrypoint
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="M1' Paramaśiva CPT canonical-derivation perplexity eval"
    )
    parser.add_argument(
        "--checkpoint", required=True,
        help="Path to CPT checkpoint to evaluate"
    )
    parser.add_argument(
        "--corpus-dir", required=True,
        help="Path to eval-corpus/m1-paramasiva directory"
    )
    parser.add_argument(
        "--baseline-ppl", type=float, default=None,
        help="Previous checkpoint perplexity for drift computation"
    )
    parser.add_argument(
        "--output-json", default=None,
        help="Write results as JSON to this path"
    )
    parser.add_argument(
        "--verbose", "-v", action="store_true",
        help="Enable verbose logging"
    )
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
    )

    # Validate paths
    if not os.path.isdir(args.corpus_dir):
        print(f"ERROR: corpus-dir not found: {args.corpus_dir}", file=sys.stderr)
        sys.exit(2)

    # Run evaluation
    result = run_evaluation(
        checkpoint_path=args.checkpoint,
        corpus_dir=args.corpus_dir,
        baseline_perplexity=args.baseline_ppl,
    )

    # Print human-readable output
    print(format_result(result))

    # Write JSON if requested
    if args.output_json:
        with open(args.output_json, "w") as f:
            json.dump(
                {
                    "checkpoint_path": result.checkpoint_path,
                    "baseline_perplexity": result.baseline_perplexity,
                    "current_perplexity": result.current_perplexity,
                    "drift_pct": result.drift_pct,
                    "halt": result.halt,
                    "total_passages": result.total_passages,
                    "total_tokens": result.total_tokens,
                    "per_file": [
                        {
                            "filename": pf.filename,
                            "passages_evaluated": pf.passages_evaluated,
                            "mean_perplexity": pf.mean_perplexity,
                            "total_tokens": pf.total_tokens,
                        }
                        for pf in result.per_file_results
                    ],
                },
                f,
                indent=2,
            )
        logger.info(f"Results written to {args.output_json}")

    sys.exit(1 if result.halt else 0)


if __name__ == "__main__":
    main()
