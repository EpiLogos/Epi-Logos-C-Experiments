#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

ENV_FILE="$ROOT/Body/S/S5/epi-gnostic/.env"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

if [[ -z "${GEMINI_API_KEY:-}" || "${GEMINI_API_KEY:-}" == "your-key-here" || "${GEMINI_API_KEY:-}" == "test-key-not-real" ]]; then
  echo "GEMINI_API_KEY must be set to a real key for the live Graphiti runtime gate." >&2
  exit 2
fi

export GEMINI_API_KEY
export GNOSTIC_EMBEDDING_MODEL="${GNOSTIC_EMBEDDING_MODEL:-gemini-embedding-2-preview}"
export GNOSTIC_EMBEDDING_DIM="${GNOSTIC_EMBEDDING_DIM:-3072}"
export GNOSTIC_LLM_MODEL="${GNOSTIC_LLM_MODEL:-gemini-3.1-flash-lite}"

docker compose -f "$ROOT/docker-compose.epi-s2.yml" up -d --build neo4j redis graphiti

for _ in $(seq 1 60); do
  if curl -fsS http://127.0.0.1:37778/health >/dev/null; then
    break
  fi
  sleep 2
done

curl -fsS http://127.0.0.1:37778/health >/dev/null

CARGO_TARGET_DIR="${CARGO_TARGET_DIR:-/tmp/epi-logos-cargo-target}" \
  cargo test \
    --manifest-path "$ROOT/Body/S/S0/epi-cli/Cargo.toml" \
    --test gate_epii_agent_access \
    live_graphiti_runtime_round_trips_session_memory_through_gateway \
    -- --ignored --exact

echo "Live Graphiti runtime gate passed against Docker Neo4j, Docker Redis, the Graphiti adapter, and the gateway s5.episodic.* path."
