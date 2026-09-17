"""Gemini Embedding 2 adapter — natively multimodal, one vector per input.

## Why this exists

`lightrag.llm.gemini.gemini_embed` passes a bare list of strings as `contents`.
That is correct for `gemini-embedding-001`, which "generates individual
embeddings for each string in a list of inputs". It is WRONG for Gemini
Embedding 2, which "produces a single, aggregated embedding when multiple
inputs are provided directly in one request" — the whole point of a natively
multimodal model is that interleaved parts describe ONE thing.

Handed a document batch, that difference is silent and destructive: LightRAG
asks for N vectors, the API returns 1 (or, for a single input, 2 — the
aggregate plus its part), and the mismatch aborts the insert with
"Vector count mismatch". Every document landed `status: failed`, so the gnostic
corpus stayed empty while `ingest` reported success.

Per Google's own migration guidance the fix is to **wrap each input in a
`Content` object**, which restores per-input embeddings without giving up
multimodality. Verified live: a bare list of 3 texts returns 1 vector; the same
3 wrapped return 3 vectors at 3072 dimensions.

## Why not just use gemini-embedding-001

Because the corpus is multimodal by design. RAG-Anything parses PDFs and images
through MinerU, and Gemini Embedding 2 maps text, images, video, audio and PDFs
into ONE space — text-only embedding would strand every non-text source. The
model is right; the calling convention was wrong.

## Coordinate-space warning

Vectors from `gemini-embedding-001` and `gemini-embedding-2` live in DIFFERENT
coordinate spaces and cannot be mixed in one index or compared with any distance
metric. Changing `GNOSTIC_EMBEDDING_MODEL` therefore invalidates every stored
vector: the corpus must be re-embedded, not topped up.
"""

from __future__ import annotations

import numpy as np
from google import genai
from google.genai import types

# Google's stable multimodal embedding model, confirmed against the live
# `models.list()` surface (`gemini-embedding-001`, `gemini-embedding-2-preview`,
# `gemini-embedding-2`). It is `-2`, not `-002`: the `00N` form belongs to the
# first generation only.
CANONICAL_EMBEDDING_MODEL = "gemini-embedding-2"

# Task types Gemini optimises retrieval for. Queries and documents are embedded
# asymmetrically — using one task type for both measurably degrades recall.
QUERY_TASK_TYPE = "RETRIEVAL_QUERY"
DOCUMENT_TASK_TYPE = "RETRIEVAL_DOCUMENT"


def task_type_for(context: str) -> str:
    """Map LightRAG's embedding `context` onto a Gemini task type."""
    return QUERY_TASK_TYPE if context == "query" else DOCUMENT_TASK_TYPE


def as_content_parts(texts: list[str]) -> list[types.Content]:
    """Wrap each input as its own `Content` so the API embeds them separately.

    This is the whole fix. A bare list is ONE multimodal input to Gemini
    Embedding 2; a list of `Content` objects is N inputs.
    """
    return [types.Content(parts=[types.Part(text=text)]) for text in texts]


async def gemini_multimodal_embed(
    texts: list[str],
    *,
    model: str = CANONICAL_EMBEDDING_MODEL,
    api_key: str,
    embedding_dim: int = 3072,
    context: str = "document",
) -> np.ndarray:
    """Embed *texts*, returning exactly one vector per input.

    Raises rather than returning a mis-sized batch: a silently truncated or
    aggregated result would be written to the vector index against the wrong
    ids, and every later retrieval would score against the wrong content.
    """
    if not texts:
        return np.zeros((0, embedding_dim), dtype=np.float32)

    client = genai.Client(api_key=api_key)
    response = await client.aio.models.embed_content(
        model=model,
        contents=as_content_parts(texts),
        config=types.EmbedContentConfig(
            task_type=task_type_for(context),
            output_dimensionality=embedding_dim,
        ),
    )

    embeddings = getattr(response, "embeddings", None)
    if not embeddings:
        raise RuntimeError(f"{model} returned no embeddings for {len(texts)} input(s)")
    if len(embeddings) != len(texts):
        raise RuntimeError(
            f"{model} returned {len(embeddings)} vector(s) for {len(texts)} input(s). "
            "Inputs must be wrapped in Content objects for per-input embeddings; a "
            "bare list is ONE aggregated multimodal input to this model."
        )

    vectors = np.array(
        [np.array(item.values, dtype=np.float32) for item in embeddings]
    )

    # 3072 comes back normalised; MRL-truncated dimensions do not, and cosine
    # similarity over un-normalised truncations is not a similarity.
    if embedding_dim < 3072:
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        norms = np.where(norms == 0, 1, norms)
        vectors = vectors / norms

    return vectors
