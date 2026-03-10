#!/usr/bin/env python3
import argparse
import json
import os
import sys
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
VENV_PYTHON = SCRIPT_DIR / ".venv" / "bin" / "python3"
if VENV_PYTHON.exists() and Path(sys.executable).resolve() != VENV_PYTHON.resolve():
    os.execv(str(VENV_PYTHON), [str(VENV_PYTHON), str(Path(__file__).resolve()), *sys.argv[1:]])

for site_dir in sorted((SCRIPT_DIR / ".venv" / "lib").glob("python*/site-packages")):
    site_dir_str = str(site_dir)
    if site_dir_str not in sys.path:
        sys.path.insert(0, site_dir_str)


FILTERABLE_FIELDS = [
    {"name": "graph_revision", "type": "tag"},
    {"name": "embedding_version", "type": "tag"},
    {"name": "q_schema_version", "type": "tag"},
    {"name": "mode", "type": "tag"},
    {"name": "top_k", "type": "tag"},
]


def build_cache():
    try:
        from redisvl.extensions.cache.llm import SemanticCache
    except ImportError as exc:
        raise SystemExit(
            "redisvl is not installed. "
            f"python={sys.executable} sys_path={sys.path[:3]} err={exc!r} "
            "Run scripts/redisvl_cache_service/setup.sh first."
        ) from exc

    return SemanticCache(
        name=os.environ.get("EPILOGOS_SEMANTIC_CACHE_NAME", "epi_semantic_cache"),
        redis_url=os.environ["EPILOGOS_SEMANTIC_CACHE_REDIS_URL"],
        distance_threshold=float(os.environ.get("EPILOGOS_SEMANTIC_CACHE_THRESHOLD", "0.9")),
        filterable_fields=FILTERABLE_FIELDS,
    )


def build_filter_expression(attributes):
    if not attributes:
        return None

    try:
        from redisvl.query.filter import Tag
    except ImportError as exc:
        raise SystemExit(
            "redisvl filter helpers are unavailable. Run scripts/redisvl_cache_service/setup.sh first."
        ) from exc

    expression = None
    for key, value in attributes.items():
        if key not in {field["name"] for field in FILTERABLE_FIELDS}:
            continue
        clause = Tag(key) == str(value)
        expression = clause if expression is None else expression & clause
    return expression


def read_payload():
    raw = sys.stdin.read()
    if not raw.strip():
        return {}
    return json.loads(raw)


def write_payload(payload):
    sys.stdout.write(json.dumps(payload))


def command_search():
    payload = read_payload()
    cache = build_cache()
    filter_expression = build_filter_expression(payload.get("attributes", {}))
    results = cache.check(
        prompt=payload["prompt"],
        num_results=1,
        return_fields=["key", "prompt", "response"],
        filter_expression=filter_expression,
    )
    if results:
        first = results[0]
        write_payload(
            {
                "hit": True,
                "entry_id": first.get("key"),
                "response": first.get("response"),
            }
        )
    else:
        write_payload({"hit": False, "entry_id": None, "response": None})


def command_store():
    payload = read_payload()
    cache = build_cache()
    ttl_seconds = os.environ.get("EPILOGOS_SEMANTIC_CACHE_TTL_SECONDS")
    if ttl_seconds:
        cache.set_ttl(int(ttl_seconds))
    cache.store(
        prompt=payload["prompt"],
        response=payload["response"],
        filters=payload.get("attributes", {}),
    )
    write_payload({"ok": True})


def command_flush():
    cache = build_cache()
    cache.clear()
    write_payload({"ok": True})


def command_health():
    payload = read_payload()
    redis_url = os.environ["EPILOGOS_SEMANTIC_CACHE_REDIS_URL"]
    cache_name = os.environ.get("EPILOGOS_SEMANTIC_CACHE_NAME", "epi_semantic_cache")
    error = None
    redis_ping = False
    redis_stack = False
    search_indexes = []

    try:
        import redis

        client = redis.from_url(redis_url, decode_responses=True)
        redis_ping = bool(client.ping())
        search_indexes = client.execute_command("FT._LIST")
        redis_stack = True
    except Exception as exc:  # pragma: no cover - exercised from live integration tests
        error = str(exc)

    try:
        build_cache()
    except SystemExit as exc:
        error = str(exc)

    write_payload(
        {
            "ok": redis_ping and redis_stack and error is None,
            "python": sys.executable,
            "redis_url": redis_url,
            "cache_name": cache_name,
            "redis_ping": redis_ping,
            "redis_stack": redis_stack,
            "search_indexes": search_indexes,
            "filterable_fields": [field["name"] for field in FILTERABLE_FIELDS],
            "error": error,
        }
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=["search", "store", "flush", "health"])
    args = parser.parse_args()

    if args.command == "search":
        command_search()
    elif args.command == "store":
        command_store()
    elif args.command == "flush":
        command_flush()
    elif args.command == "health":
        command_health()


if __name__ == "__main__":
    main()
