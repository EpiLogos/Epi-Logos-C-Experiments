"""Real (non-synthetic) perplexity-eval test for eval_m1_canonical_derivation.

Builds a tiny but REAL causal-LM checkpoint + tokenizer + eval corpus fully
offline (no network, no downloads), runs ``run_evaluation`` against it, and
asserts a genuine perplexity — produced by a real forward pass fed into
``eksft.compute_perplexity`` — is returned. Also asserts the fabricated md5
synthetic stub is gone. This is the honest replacement for the prior stub: the
perplexity number comes from a real transformer, not a hash.

Run with the ML venv:
    Body/S/S5/epi-gnostic/.venv/bin/python -m pytest \
        Body/S/S5/plugins/epi-logos/skills/custom/epii-distillation/eval-corpus/m1-paramasiva/scripts/test_eval_m1_canonical_derivation.py -q
"""

import inspect
import json
import math
import os
import sys

import pytest

torch = pytest.importorskip("torch")
pytest.importorskip("transformers")
pytest.importorskip("tokenizers")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import eval_m1_canonical_derivation as ev  # noqa: E402


def _write_tiny_checkpoint(dirpath, vocab_words):
    """Save a real (randomly-initialised) GPT-2 + a real WordLevel tokenizer to
    ``dirpath`` — a genuine HF checkpoint directory, built without any network."""
    from transformers import GPT2Config, GPT2LMHeadModel, PreTrainedTokenizerFast
    from tokenizers import Tokenizer
    from tokenizers.models import WordLevel
    from tokenizers.pre_tokenizers import Whitespace

    vocab = {w: i for i, w in enumerate(vocab_words)}
    tok = Tokenizer(WordLevel(vocab=vocab, unk_token="[UNK]"))
    tok.pre_tokenizer = Whitespace()
    fast = PreTrainedTokenizerFast(
        tokenizer_object=tok, unk_token="[UNK]", pad_token="[UNK]"
    )
    cfg = GPT2Config(
        vocab_size=len(vocab_words), n_positions=64, n_embd=32, n_layer=2, n_head=2
    )
    GPT2LMHeadModel(cfg).eval().save_pretrained(dirpath)
    fast.save_pretrained(dirpath)


def _write_tiny_corpus(dirpath, passages):
    manifest = {
        "version": "test",
        "total_passages": len(passages),
        "halt_threshold": {"threshold_pct": 10.0},
        "files": [{"filename": "t.passages.jsonl", "passage_count": len(passages)}],
    }
    with open(os.path.join(dirpath, "manifest.json"), "w") as f:
        json.dump(manifest, f)
    with open(os.path.join(dirpath, "t.passages.jsonl"), "w") as f:
        for i, text in enumerate(passages):
            f.write(json.dumps({"passage_id": f"p{i}", "text": text, "source_file": "t.md"}) + "\n")


VOCAB = [
    "[UNK]", "the", "pattern", "reveals", "itself", "through", "repetition",
    "ql", "derivation", "matheme", "paramasiva", "spanda",
]


def test_run_evaluation_produces_real_perplexity_offline(tmp_path):
    ckpt = tmp_path / "checkpoint"
    corpus = tmp_path / "corpus"
    ckpt.mkdir()
    corpus.mkdir()
    _write_tiny_checkpoint(str(ckpt), VOCAB)
    _write_tiny_corpus(
        str(corpus),
        [
            "the pattern reveals itself through repetition",
            "ql derivation matheme paramasiva spanda the pattern",
        ],
    )

    result = ev.run_evaluation(
        checkpoint_path=str(ckpt), corpus_dir=str(corpus), baseline_perplexity=None
    )

    # A REAL forward pass produces a finite, positive perplexity — not the
    # synthetic ~8-12 md5 band, and not a fabricated constant.
    assert result.total_passages == 2
    assert result.total_tokens > 0
    assert math.isfinite(result.current_perplexity)
    assert result.current_perplexity > 1.0
    assert result.per_file_results and result.per_file_results[0].filename == "t.md"


def test_injected_model_seam_matches_checkpoint_load(tmp_path):
    """The DI seam feeds the SAME real perplexity path as a checkpoint load."""
    from transformers import AutoModelForCausalLM, AutoTokenizer

    ckpt = tmp_path / "checkpoint"
    corpus = tmp_path / "corpus"
    ckpt.mkdir()
    corpus.mkdir()
    _write_tiny_checkpoint(str(ckpt), VOCAB)
    _write_tiny_corpus(str(corpus), ["the pattern reveals itself"])

    model = AutoModelForCausalLM.from_pretrained(str(ckpt)).eval()
    tokenizer = AutoTokenizer.from_pretrained(str(ckpt))
    result = ev.run_evaluation(
        checkpoint_path="unused",
        corpus_dir=str(corpus),
        model_and_tokenizer=(model, tokenizer),
    )
    assert math.isfinite(result.current_perplexity) and result.current_perplexity > 1.0


def test_no_synthetic_stub_remains():
    """The fabricated md5 perplexity stub must be gone — no hashing, no seeded
    fake score. (The module comment may still say 'no synthetic values'; we
    assert on the actual fabrication markers, not that word.)"""
    assert not hasattr(ev, "compute_perplexity_stub")
    src = inspect.getsource(ev)
    assert "hashlib.md5" not in src
    assert "md5" not in src
    assert "base_ppl" not in src  # the seeded synthetic-perplexity variable
    # The real path must route through the canonical eksft perplexity routine.
    assert "eksft.compute_perplexity" in src
