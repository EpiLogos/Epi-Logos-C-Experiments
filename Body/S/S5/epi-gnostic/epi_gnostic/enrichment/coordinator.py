"""CoordinateEnricher — post-ingestion Bimba coordinate assignment.

Runs after RAG-Anything extracts entities into the :gnostic namespace.
Assigns bimba coordinates and creates cross-namespace edges to
:Bimba coordinate nodes (matched by the ``coordinate`` property) that
already exist in Neo4j.
"""

from __future__ import annotations

import json
import logging
from typing import Any, Callable, Awaitable

from neo4j import AsyncDriver

from epi_gnostic.config import VALID_FAMILIES
from epi_gnostic.enrichment.prompts import (
    COORDINATE_TAXONOMY,
    RESONANCE_CLASSIFICATION_PROMPT,
)

logger = logging.getLogger(__name__)

# Type alias for an async LLM callable: (prompt: str) -> str
LLMFunc = Callable[[str], Awaitable[str]]


class CoordinateEnricher:
    """Assigns Bimba coordinates to gnostic entities post-ingestion.

    Parameters
    ----------
    driver:
        An open ``neo4j.AsyncDriver`` connected to the Neo4j instance that
        holds both the ``:gnostic`` workspace nodes and the ``:Bimba``
        coordinate nodes.
    database:
        The Neo4j database name (default ``"neo4j"``).
    workspace:
        The workspace label used on gnostic entity nodes (default ``"gnostic"``).
    """

    def __init__(
        self,
        driver: AsyncDriver,
        database: str = "neo4j",
        workspace: str = "gnostic",
    ) -> None:
        self._driver = driver
        self._db = database
        self._workspace = workspace

    # ------------------------------------------------------------------ #
    # Public API
    # ------------------------------------------------------------------ #

    async def assign_direct(
        self,
        entity_id: str,
        coordinate: str,
        family: str,
    ) -> None:
        """Directly assign a known coordinate to a gnostic entity node.

        Sets ``bimba_coordinate``, ``coordinate_family``, and
        ``assignment_method="direct"`` on the node, and creates a
        ``MAPS_TO_COORDINATE`` edge to the matching ``:Bimba`` coordinate node.

        Parameters
        ----------
        entity_id:
            The ``vector_id`` of the gnostic node to update.
        coordinate:
            A Bimba coordinate string (e.g. ``"M3"`` or ``"#0"``).
        family:
            One of the VALID_FAMILIES letters, or ``"#"``.
        """
        family = _normalise_family(family)
        coordinate = _normalise_coordinate(coordinate)
        ws = self._workspace

        cypher = (
            f"MATCH (n:`{ws}` {{vector_id: $vid}}) "
            f"SET n.bimba_coordinate = $coord, "
            f"    n.coordinate_family = $family, "
            f"    n.assignment_method = 'direct' "
            f"WITH n "
            f"MATCH (bc:Bimba {{coordinate: $coord}}) "
            f"MERGE (n)-[r:MAPS_TO_COORDINATE]->(bc) "
            f"SET r.confidence = 1.0, r.method = 'direct' "
            f"RETURN n"
        )
        async with self._driver.session(database=self._db) as session:
            await session.run(
                cypher,
                vid=entity_id,
                coord=coordinate,
                family=family,
            )

    async def assign_resonances(
        self,
        entity_id: str,
        resonances: list[str],
        confidences: list[float],
        family: str,
    ) -> None:
        """Assign LLM-classified resonances to a gnostic entity node.

        Sets ``bimba_resonances``, ``coordinate_family``, and
        ``assignment_method="llm_classified"`` on the node, and creates
        ``RESONATES_WITH`` edges for each resonance.

        Parameters
        ----------
        entity_id:
            The ``vector_id`` of the gnostic node.
        resonances:
            List of coordinate strings, ranked by relevance.
        confidences:
            Parallel list of float confidence scores (0.0–1.0).
        family:
            Primary family letter (from LLM classification).
        """
        family = _normalise_family(family)
        resonances = [_normalise_coordinate(c) for c in resonances]
        ws = self._workspace

        # Pair up resonances and confidences, filling missing confidences with 0.0
        pairs = list(
            zip(
                resonances,
                list(confidences) + [0.0] * max(0, len(resonances) - len(confidences)),
            )
        )

        # Update node properties. Coordinate family remains a property, not a label.
        set_cypher = (
            f"MATCH (n:`{ws}` {{vector_id: $vid}}) "
            f"SET n.bimba_resonances = $resonances, "
            f"    n.coordinate_family = $family, "
            f"    n.assignment_method = 'llm_classified' "
            f"RETURN n"
        )
        async with self._driver.session(database=self._db) as session:
            result = await session.run(
                set_cypher,
                vid=entity_id,
                resonances=resonances,
                family=family,
            )
            record = await result.single()
            if record is None:
                logger.warning(
                    "assign_resonances: no node found for vector_id=%s", entity_id
                )
                return

        # Create RESONATES_WITH edges for each resonance
        for coord, conf in pairs:
            edge_cypher = (
                f"MATCH (n:`{ws}` {{vector_id: $vid}}) "
                f"MATCH (bc:Bimba {{coordinate: $coord}}) "
                f"MERGE (n)-[r:RESONATES_WITH]->(bc) "
                f"SET r.confidence = $conf, r.method = 'llm_classified'"
            )
            async with self._driver.session(database=self._db) as session:
                await session.run(
                    edge_cypher,
                    vid=entity_id,
                    coord=coord,
                    conf=conf,
                )

    async def classify_entity(
        self,
        entity_id: str,
        entity_name: str,
        entity_description: str,
        source_context: str,
        llm_func: LLMFunc,
        family_hint: str = "#",
    ) -> None:
        """Classify a single entity via LLM and persist the resonances.

        Renders the classification prompt, calls *llm_func*, parses the JSON
        response, and calls :meth:`assign_resonances`.  On any parse failure
        the entity is recorded with empty resonances and the *family_hint*.

        Parameters
        ----------
        entity_id:
            The ``vector_id`` of the gnostic node.
        entity_name:
            Human-readable name of the entity.
        entity_description:
            Description or summary text for the entity.
        source_context:
            Where the entity came from (document path, section, etc.).
        llm_func:
            Async callable ``(prompt: str) -> str`` wrapping the LLM.
        family_hint:
            Family to fall back to if JSON parsing fails.
        """
        prompt = RESONANCE_CLASSIFICATION_PROMPT.format(
            taxonomy=COORDINATE_TAXONOMY,
            entity_name=entity_name,
            entity_description=entity_description,
            source_context=source_context,
        )

        resonances: list[str] = []
        confidences: list[float] = []
        family = _normalise_family(family_hint)

        try:
            raw = await llm_func(prompt)
            parsed = json.loads(raw)
            resonances = parsed.get("resonances", [])
            confidences = parsed.get("confidence", [])
            raw_family = parsed.get("primary_family", family_hint)
            family = _normalise_family(raw_family)
        except (json.JSONDecodeError, ValueError, TypeError) as exc:
            logger.warning(
                "classify_entity: JSON parse failed for entity_id=%s (%s): %s",
                entity_id,
                entity_name,
                exc,
            )

        await self.assign_resonances(entity_id, resonances, confidences, family)

    async def enrich_batch(
        self,
        entity_ids: list[str],
        llm_func: LLMFunc,
        family_hint: str = "#",
    ) -> None:
        """Fetch entity data from Neo4j and classify each entity.

        Entities are fetched in a single query, then each is classified
        sequentially via :meth:`classify_entity`.

        Parameters
        ----------
        entity_ids:
            List of ``vector_id`` values to enrich.
        llm_func:
            Async callable wrapping the LLM.
        family_hint:
            Default family when the LLM cannot determine one.
        """
        if not entity_ids:
            return

        ws = self._workspace
        fetch_cypher = (
            f"MATCH (n:`{ws}`) WHERE n.vector_id IN $ids "
            f"RETURN n.vector_id AS vid, "
            f"       n.entity_name AS name, "
            f"       n.content AS content, "
            f"       n.source_id AS source_id"
        )

        entities: list[dict[str, Any]] = []
        async with self._driver.session(database=self._db) as session:
            cursor = await session.run(fetch_cypher, ids=entity_ids)
            records = await cursor.data()
            for rec in records:
                entities.append(
                    {
                        "vid": rec.get("vid") or "",
                        "name": rec.get("name") or "",
                        "content": rec.get("content") or "",
                        "source_id": rec.get("source_id") or "unknown",
                    }
                )

        for entity in entities:
            await self.classify_entity(
                entity_id=entity["vid"],
                entity_name=entity["name"],
                entity_description=entity["content"],
                source_context=entity["source_id"],
                llm_func=llm_func,
                family_hint=family_hint,
            )


# ------------------------------------------------------------------ #
# Helpers
# ------------------------------------------------------------------ #


def _normalise_family(family: str) -> str:
    """Return *family* uppercased if valid, else ``"#"``."""
    upper = family.upper() if family else "#"
    return upper if upper in VALID_FAMILIES else "#"


_DOUBLING_RAW = "4.4.0-4.4/5"
_DOUBLING_TOK = chr(1)
_DOUBLING_CANON = "4.(4.0/1-4.4/5)"


def _normalise_coordinate(coord: str) -> str:
    """Normalise a Bimba coordinate's context frames to canonical parenthesised form.

    Idempotent. A position-N frame keeps its ``N.`` outside the parens
    (``4.0/1`` -> ``4.(0/1)``); the QL fractal-doubling frame stays atomic
    (``4.4.0-4.4/5`` -> ``4.(4.0/1-4.4/5)``).

    Does NOT convert ``#`` -> ``M``. ``#n`` (raw archetype / ``:Psychoid``) and
    ``Mn`` (M-family / ``:Subsystem``) are DISTINCT coordinates and distinct
    ``:Bimba`` nodes; a ``#`` coordinate must resolve to its own ``#`` node.
    The ``#`` -> ``M`` mapping was a one-time legacy port of the old neo4j
    coordinate data (done historically) and is NOT a live normalisation — never
    apply it at runtime here.
    """
    if not coord:
        return coord
    protected = coord.replace(_DOUBLING_RAW, _DOUBLING_TOK)
    segs: list[str] = []
    depth = 0
    cur = ""
    for ch in protected:
        if ch == "(":
            depth += 1
            cur += ch
        elif ch == ")":
            depth -= 1
            cur += ch
        elif ch == "-" and depth == 0:
            segs.append(cur)
            cur = ""
        else:
            cur += ch
    segs.append(cur)

    out: list[str] = []
    for seg in segs:
        if seg == _DOUBLING_TOK:
            out.append(_DOUBLING_CANON)
        elif "/" not in seg:
            out.append(seg)
        elif seg.startswith("(") and seg.endswith(")"):
            out.append(seg)
        else:
            dot = seg.find(".")
            if dot > 0 and seg[:dot].isdigit():
                rest = seg[dot + 1 :]
                out.append(seg if rest.startswith("(") and rest.endswith(")") else f"{seg[:dot]}.({rest})")
            else:
                out.append(f"({seg})")
    return "-".join(out)
