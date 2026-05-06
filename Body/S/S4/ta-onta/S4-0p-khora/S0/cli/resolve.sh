#!/bin/sh
set -eu

usage() {
  echo "usage: $0 <read|search|listing|tree|navigation|json|select_interactive|git_host|task_runner>" >&2
  exit 64
}

[ "${1-}" ] || usage

has() {
  command -v "$1" >/dev/null 2>&1
}

capability="$1"

case "$capability" in
  read)
    if has bat; then
      echo bat
    elif has cat; then
      echo cat
    else
      echo "khora cli: no resolver for read (need bat or cat)" >&2
      exit 1
    fi
    ;;
  search)
    if has rg; then
      echo rg
    elif has grep; then
      echo grep
    else
      echo "khora cli: no resolver for search (need rg or grep)" >&2
      exit 1
    fi
    ;;
  listing)
    if has eza; then
      echo eza
    elif has ls; then
      echo ls
    else
      echo "khora cli: no resolver for listing (need eza or ls)" >&2
      exit 1
    fi
    ;;
  tree)
    if has eza; then
      echo eza
    elif has find; then
      echo find
    else
      echo "khora cli: no resolver for tree (need eza or find)" >&2
      exit 1
    fi
    ;;
  navigation)
    if has zoxide; then
      echo zoxide
    else
      echo "khora cli: no resolver for navigation (need zoxide)" >&2
      exit 1
    fi
    ;;
  json)
    if has jq; then
      echo jq
    else
      echo "khora cli: no resolver for json (need jq)" >&2
      exit 1
    fi
    ;;
  select_interactive)
    if has fzf; then
      echo fzf
    else
      echo "khora cli: no resolver for select_interactive (need fzf)" >&2
      exit 1
    fi
    ;;
  git_host)
    if has gh; then
      echo gh
    else
      echo "khora cli: no resolver for git_host (need gh)" >&2
      exit 1
    fi
    ;;
  task_runner)
    if has just; then
      echo just
    else
      echo "khora cli: no resolver for task_runner (need just)" >&2
      exit 1
    fi
    ;;
  *)
    usage
    ;;
esac
