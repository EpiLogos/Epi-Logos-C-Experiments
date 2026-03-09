#!/usr/bin/env bash
#
# kbase.sh - Epi-Logos Knowledge Base Wrapper for bkmr
# Project-based bookmark management with auto-tagging, auto-backfill, and semantic search
#

set -e

# Configuration
BKMR_PROJECTS_DIR="${HOME}/.config/bkmr/projects"
CURRENT_FILE="${BKMR_PROJECTS_DIR}/.current"
SNAPSHOT_DIR="${BKMR_PROJECTS_DIR}/.snapshots"

# Environment overrides
BKMR_AUTO_BACKFILL="${BKMR_AUTO_BACKFILL:-1}"
BKMR_AUTO_TAG="${BKMR_AUTO_TAG:-1}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# Helper Functions
# ============================================================================

log_info() {
    echo -e "${BLUE}[kbase]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[kbase]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[kbase]${NC} $1"
}

log_error() {
    echo -e "${RED}[kbase]${NC} $1"
}

# Resolve which database to use based on context
resolve_db() {
    local project=""
    
    # Priority 1: BKMR_PROJECT env var
    if [ -n "$BKMR_PROJECT" ]; then
        project="$BKMR_PROJECT"
    # Priority 2: .current file
    elif [ -f "$CURRENT_FILE" ]; then
        project=$(cat "$CURRENT_FILE" 2>/dev/null | tr -d '\n')
    fi
    
    # Set BKMR_DB_URL based on project
    if [ -z "$project" ] || [ "$project" = "default" ]; then
        # Use default from config
        if [ -f "${HOME}/.config/bkmr/config.toml" ]; then
            BKMR_DB_URL=$(grep '^db_url' "${HOME}/.config/bkmr/config.toml" | head -1 | sed 's/.*= *//' | tr -d '"' | tr -d "'")
            BKMR_DB_URL="${BKMR_DB_URL/#\~/$HOME}"
        else
            BKMR_DB_URL="${HOME}/.config/bkmr/bkmr.db"
        fi
    else
        BKMR_DB_URL="${BKMR_PROJECTS_DIR}/${project}.db"
    fi
    
    export BKMR_DB_URL
}

# Get current project name
get_current_project() {
    if [ -n "$BKMR_PROJECT" ]; then
        echo "$BKMR_PROJECT"
    elif [ -f "$CURRENT_FILE" ]; then
        cat "$CURRENT_FILE" 2>/dev/null | tr -d '\n'
    else
        echo "default"
    fi
}

# Ensure projects directory exists
ensure_projects_dir() {
    if [ ! -d "$BKMR_PROJECTS_DIR" ]; then
        mkdir -p "$BKMR_PROJECTS_DIR"
        log_info "Created projects directory: $BKMR_PROJECTS_DIR"
    fi
}

# Auto-backfill embeddings
auto_backfill() {
    if [ "$BKMR_AUTO_BACKFILL" = "1" ]; then
        log_info "Auto-backfilling embeddings..."
        if bkmr --gemini backfill 2>/dev/null; then
            log_success "Embeddings updated"
        else
            log_warn "Backfill completed (some items may not need embedding)"
        fi
    fi
}

# Auto-tag with project name
auto_tag() {
    local tags="$1"
    if [ "$BKMR_AUTO_TAG" = "1" ]; then
        local project=$(get_current_project)
        if [ "$project" != "default" ] && [[ ! "$tags" =~ _$project ]]; then
            tags="${tags},_${project}"
        fi
    fi
    echo "$tags"
}

# ============================================================================
# Project Management Commands
# ============================================================================

cmd_init() {
    local project_name="$1"
    local template="$2"
    
    if [ -z "$project_name" ]; then
        log_error "Project name required"
        echo "Usage: epi kbase init <project-name> [--template <template>]"
        exit 1
    fi
    
    ensure_projects_dir
    local db_path="${BKMR_PROJECTS_DIR}/${project_name}.db"
    
    if [ -f "$db_path" ]; then
        log_error "Project '$project_name' already exists"
        exit 1
    fi
    
    # Create database
    bkmr create-db "$db_path"
    log_success "Created project: $project_name"
    
    # Apply template if specified
    if [ -n "$template" ]; then
        log_info "Applying template: $template"
        # Template logic would go here
        log_warn "Templates not yet implemented (infrastructure ready)"
    fi
    
    # Auto-switch to new project
    echo "$project_name" > "$CURRENT_FILE"
    log_info "Switched to new project: $project_name"
}

cmd_use() {
    local project_name="$1"
    
    ensure_projects_dir
    
    if [ "$project_name" = "--global" ] || [ -z "$project_name" ]; then
        echo "default" > "$CURRENT_FILE"
        log_success "Switched to default database"
    else
        local db_path="${BKMR_PROJECTS_DIR}/${project_name}.db"
        if [ ! -f "$db_path" ]; then
            log_error "Project '$project_name' does not exist"
            echo "Run: epi kbase init $project_name"
            exit 1
        fi
        echo "$project_name" > "$CURRENT_FILE"
        log_success "Switched to project: $project_name"
    fi
}

cmd_list() {
    ensure_projects_dir
    
    local current=$(get_current_project)
    local found=0
    
    echo "Available projects:"
    echo ""
    
    for db in "$BKMR_PROJECTS_DIR"/*.db; do
        if [ -f "$db" ]; then
            found=1
            local project=$(basename "$db" .db)
            local size=$(du -h "$db" | cut -f1)
            local count=$(sqlite3 "$db" "SELECT COUNT(*) FROM bookmarks;" 2>/dev/null || echo "?")
            
            if [ "$project" = "$current" ]; then
                echo -e "  ${GREEN}* $project${NC} ($count bookmarks, $size) [active]"
            else
                echo "    $project ($count bookmarks, $size)"
            fi
        fi
    done
    
    if [ "$found" = "0" ]; then
        echo "  (no projects yet)"
        echo ""
        echo "Create one with: epi kbase init <project-name>"
    fi
}

cmd_current() {
    local project=$(get_current_project)
    if [ "$project" = "default" ]; then
        echo "default (using global bkmr database)"
    else
        echo "$project"
    fi
}

cmd_info() {
    local project_name="${1:-$(get_current_project)}"
    
    if [ "$project_name" = "default" ]; then
        local db_path="${HOME}/.config/bkmr/bkmr.db"
    else
        local db_path="${BKMR_PROJECTS_DIR}/${project_name}.db"
    fi
    
    if [ ! -f "$db_path" ]; then
        log_error "Project '$project_name' not found"
        exit 1
    fi
    
    local count=$(sqlite3 "$db_path" "SELECT COUNT(*) FROM bookmarks;" 2>/dev/null || echo "0")
    local size=$(du -h "$db_path" | cut -f1)
    local modified=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$db_path" 2>/dev/null || stat -c "%y" "$db_path" 2>/dev/null | cut -d' ' -f1)
    local embedded=$(sqlite3 "$db_path" "SELECT COUNT(*) FROM bookmarks WHERE embeddable = 1;" 2>/dev/null || echo "0")
    
    echo "Project: $project_name"
    echo "Database: $db_path"
    echo "Bookmarks: $count"
    echo "Embedded: $embedded"
    echo "Size: $size"
    echo "Last modified: $modified"
}

cmd_delete() {
    local project_name="$1"
    
    if [ -z "$project_name" ]; then
        log_error "Project name required"
        exit 1
    fi
    
    local db_path="${BKMR_PROJECTS_DIR}/${project_name}.db"
    
    if [ ! -f "$db_path" ]; then
        log_error "Project '$project_name' not found"
        exit 1
    fi
    
    echo -n "Delete project '$project_name'? This cannot be undone. [y/N] "
    read -r confirm
    
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        rm "$db_path"
        
        # If this was the current project, reset to default
        local current=$(get_current_project)
        if [ "$current" = "$project_name" ]; then
            echo "default" > "$CURRENT_FILE"
            log_info "Reset to default database"
        fi
        
        log_success "Deleted project: $project_name"
    else
        log_info "Cancelled"
    fi
}

cmd_rename() {
    local old_name="$1"
    local new_name="$2"
    
    if [ -z "$old_name" ] || [ -z "$new_name" ]; then
        log_error "Usage: epi kbase rename <old-name> <new-name>"
        exit 1
    fi
    
    local old_path="${BKMR_PROJECTS_DIR}/${old_name}.db"
    local new_path="${BKMR_PROJECTS_DIR}/${new_name}.db"
    
    if [ ! -f "$old_path" ]; then
        log_error "Project '$old_name' not found"
        exit 1
    fi
    
    if [ -f "$new_path" ]; then
        log_error "Project '$new_name' already exists"
        exit 1
    fi
    
    mv "$old_path" "$new_path"
    
    # Update current if needed
    local current=$(get_current_project)
    if [ "$current" = "$old_name" ]; then
        echo "$new_name" > "$CURRENT_FILE"
    fi
    
    log_success "Renamed project: $old_name → $new_name"
}

# ============================================================================
# Fuzzy Project Matching
# ============================================================================

cmd_find() {
    local query="$1"
    
    if [ -z "$query" ]; then
        log_error "Search query required"
        echo "Usage: epi kbase find <partial-name>"
        exit 1
    fi
    
    ensure_projects_dir
    
    local matches=()
    local exact_match=""
    local partial_matches=()
    
    # Find matches
    for db in "$BKMR_PROJECTS_DIR"/*.db; do
        if [ -f "$db" ]; then
            local project=$(basename "$db" .db)
            
            # Exact match
            if [ "$project" = "$query" ]; then
                exact_match="$project"
            # Partial match (contains query)
            elif [[ "$project" == *"$query"* ]]; then
                partial_matches+=("$project")
            fi
        fi
    done
    
    # Display results
    if [ -n "$exact_match" ]; then
        echo "Exact match:"
        echo "  $exact_match"
        echo ""
    fi
    
    if [ ${#partial_matches[@]} -gt 0 ]; then
        echo "Partial matches:"
        for match in "${partial_matches[@]}"; do
            echo "  $match"
        done
        echo ""
    fi
    
    if [ -z "$exact_match" ] && [ ${#partial_matches[@]} -eq 0 ]; then
        log_warn "No projects matching '$query'"
        echo "Available projects:"
        epi kbase list
        exit 1
    fi
    
    # Return count
    local total=$(( ${#partial_matches[@]} + ( [ -n "$exact_match" ] && echo 1 || echo 0 ) ))
    echo "Found $total project(s) matching '$query'"
}

cmd_switch() {
    local query="$1"
    
    if [ -z "$query" ]; then
        log_error "Project name or partial match required"
        echo "Usage: epi kbase switch <partial-name>"
        exit 1
    fi
    
    ensure_projects_dir
    
    local exact_match=""
    local partial_matches=()
    
    # Find matches
    for db in "$BKMR_PROJECTS_DIR"/*.db; do
        if [ -f "$db" ]; then
            local project=$(basename "$db" .db)
            
            if [ "$project" = "$query" ]; then
                exact_match="$project"
                break
            elif [[ "$project" == *"$query"* ]]; then
                partial_matches+=("$project")
            fi
        fi
    done
    
    # Handle results
    if [ -n "$exact_match" ]; then
        cmd_use "$exact_match"
    elif [ ${#partial_matches[@]} -eq 1 ]; then
        cmd_use "${partial_matches[0]}"
    elif [ ${#partial_matches[@]} -gt 1 ]; then
        log_warn "Multiple matches found:"
        for match in "${partial_matches[@]}"; do
            echo "  $match"
        done
        echo ""
        echo "Please be more specific or use full name:"
        echo "  epi kbase use <full-project-name>"
    else
        log_error "No project matching '$query'"
        exit 1
    fi
}

# ============================================================================
# Content Commands with Auto-Features
# ============================================================================

cmd_add() {
    local url="$1"
    local tags="${2:-}"
    shift 2 || true
    local extra_args="$@"
    
    if [ -z "$url" ]; then
        log_error "URL required"
        echo "Usage: epi kbase add <url> [tags]"
        exit 1
    fi
    
    resolve_db
    
    # Auto-tag
    tags=$(auto_tag "$tags")
    
    # Add bookmark
    if bkmr add "$url" "$tags" $extra_args; then
        log_success "Added bookmark with tags: $tags"
        
        # Auto-backfill
        auto_backfill
    else
        log_error "Failed to add bookmark"
        exit 1
    fi
}

cmd_add_file() {
    local file_path="$1"
    local tags="${2:-}"
    
    if [ -z "$file_path" ] || [ ! -f "$file_path" ]; then
        log_error "File not found: $file_path"
        exit 1
    fi
    
    resolve_db
    
    # Auto-tag
    tags=$(auto_tag "$tags")
    tags="${tags},_md_"
    
    # Get file info
    local title=$(basename "$file_path" | sed 's/\.[^.]*$//')
    
    # Create a temp file with content for bkmr to read
    local temp_file=$(mktemp)
    echo "file://${file_path}" > "$temp_file"
    
    # Add as URL reference to file (safer than inline content)
    if bkmr add "file://${file_path}" "$tags" --title "$title"; then
        log_success "Added file reference: $title"
        auto_backfill
    else
        log_error "Failed to add file"
        rm "$temp_file"
        exit 1
    fi
    
    rm "$temp_file"
}

cmd_fetch() {
    local url="$1"
    local tags="${2:-}"
    
    if [ -z "$url" ]; then
        log_error "URL required"
        exit 1
    fi
    
    resolve_db
    
    log_info "Fetching content from: $url"
    
    # Fetch and convert to text
    local content
    if command -v pandoc >/dev/null 2>&1; then
        content=$(curl -sL "$url" | pandoc -f html -t plain --wrap=none 2>/dev/null || echo "")
    else
        content=$(curl -sL "$url" | sed 's/<[^\u003e]*>//g' | head -c 10000)
    fi
    
    if [ -z "$content" ]; then
        log_warn "Could not fetch content, adding as URL only"
        cmd_add "$url" "$tags"
        return
    fi
    
    # Auto-tag
    tags=$(auto_tag "$tags")
    tags="${tags},_fetched,url"
    
    # Add content as snippet with URL in title
    local title="Fetched: $(echo "$url" | sed 's/https\?://; s/^www\.//; s|/$||' | cut -d'/' -f1)"
    
    if bkmr add "$content" "$tags" --title "$title"; then
        log_success "Fetched and indexed: $title"
        auto_backfill
    fi
}

cmd_update() {
    local id="$1"
    shift
    local args="$@"
    
    resolve_db
    
    if bkmr update "$id" $args; then
        log_success "Updated bookmark $id"
        
        # Re-enable embedding if needed and backfill
        bkmr --gemini set-embeddable "$id" --enable 2>/dev/null || true
        auto_backfill
    fi
}

cmd_refresh() {
    local id="$1"
    
    if [ -z "$id" ]; then
        log_error "Bookmark ID required"
        exit 1
    fi
    
    resolve_db
    
    # Get current bookmark info
    local url=$(bkmr show "$id" 2>/dev/null | grep -oE 'https?://[^[:space:]]+' | head -1)
    
    if [ -z "$url" ]; then
        log_error "Could not find URL for bookmark $id"
        exit 1
    fi
    
    log_info "Refreshing: $url"
    
    # Fetch new content
    local new_content
    if command -v pandoc >/dev/null 2>&1; then
        new_content=$(curl -sL "$url" | pandoc -f html -t plain --wrap=none 2>/dev/null || echo "")
    else
        new_content=$(curl -sL "$url" | sed 's/<[^\u003e]*>//g' | head -c 10000)
    fi
    
    if [ -z "$new_content" ]; then
        log_error "Could not fetch content from $url"
        exit 1
    fi
    
    # Update bookmark with new content
    bkmr update "$id" --content "$new_content"
    bkmr update "$id" --tags "_updated-$(date +%Y%m%d)"
    
    # Re-embed
    bkmr --gemini set-embeddable "$id" --enable
    auto_backfill
    
    log_success "Refreshed bookmark $id and regenerated embedding"
}

# ============================================================================
# Cross-Project Search
# ============================================================================

cmd_search_all() {
    local query="$1"
    local use_gemini=""
    local limit=""
    
    # Parse args
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --gemini)
                use_gemini="1"
                shift
                ;;
            --limit)
                limit="$2"
                shift 2
                ;;
            *)
                query="$1"
                shift
                ;;
        esac
    done
    
    if [ -z "$query" ]; then
        log_error "Search query required"
        exit 1
    fi
    
    ensure_projects_dir
    
    log_info "Searching across all projects for: $query"
    echo ""
    
    local total_results=0
    
    # Search each project - simple approach, no subshells
    for db in "$BKMR_PROJECTS_DIR"/*.db; do
        if [ -f "$db" ]; then
            local project=$(basename "$db" .db)
            export BKMR_DB_URL="$db"
            
            if [ -n "$use_gemini" ]; then
                # Semantic search - output with project prefix immediately
                local output=$(bkmr --gemini sem-search "$query" --np 2>/dev/null || true)
                if [ -n "$output" ]; then
                    echo "═══ $project ═══"
                    echo "$output" | while IFS= read -r line; do
                        echo "  $line"
                    done
                    echo ""
                    total_results=$((total_results + 1))
                fi
            else
                # Full-text search
                local output=$(bkmr search "$query" 2>/dev/null || true)
                if [ -n "$output" ]; then
                    echo "═══ $project ═══"
                    echo "$output" | while IFS= read -r line; do
                        echo "  $line"
                    done
                    echo ""
                    total_results=$((total_results + 1))
                fi
            fi
        fi
    done
    
    if [ "$total_results" -eq 0 ]; then
        log_warn "No results found across any project"
    fi
}

cmd_list_all() {
    ensure_projects_dir
    
    for db in "$BKMR_PROJECTS_DIR"/*.db; do
        if [ -f "$db" ]; then
            local project=$(basename "$db" .db)
            export BKMR_DB_URL="$db"
            
            echo ""
            echo "═══════════════════════════════════════════════════════════"
            echo "  Project: $project"
            echo "═══════════════════════════════════════════════════════════"
            
            local count=$(bkmr show 1 2>/dev/null | grep -c "^ID:" || echo "0")
            if [ "$count" != "0" ]; then
                # List all bookmarks
                sqlite3 "$db" "SELECT id, title, tags FROM bookmarks ORDER BY id DESC LIMIT 20;" 2>/dev/null | \
                    while IFS='|' read -r id title tags; do
                        echo "  [$id] $title"
                        echo "       tags: $tags"
                    done
            else
                echo "  (no bookmarks)"
            fi
        fi
    done
}

# ============================================================================
# Snapshot / Versioning
# ============================================================================

cmd_snapshot() {
    local message="${1:-"Snapshot $(date +%Y-%m-%d-%H%M%S)"}"
    local project=$(get_current_project)
    
    if [ "$project" = "default" ]; then
        log_error "Cannot snapshot default database"
        log_info "Switch to a project: epi kbase use <project>"
        exit 1
    fi
    
    local db_path="${BKMR_PROJECTS_DIR}/${project}.db"
    
    ensure_projects_dir
    mkdir -p "$SNAPSHOT_DIR"
    
    local snapshot_name="${project}-$(date +%Y%m%d-%H%M%S).db.gz"
    local snapshot_path="${SNAPSHOT_DIR}/${snapshot_name}"
    
    log_info "Creating snapshot of $project..."
    
    if gzip -c "$db_path" > "$snapshot_path"; then
        log_success "Snapshot created: $snapshot_name"
        
        # Keep only last 10 snapshots for this project
        local snapshots=$(ls -t "${SNAPSHOT_DIR}/${project}"-*.db.gz 2>/dev/null | tail -n +11)
        if [ -n "$snapshots" ]; then
            echo "$snapshots" | xargs -r rm
            log_info "Cleaned up old snapshots"
        fi
    else
        log_error "Failed to create snapshot"
        exit 1
    fi
}

cmd_log() {
    local project=$(get_current_project)
    
    if [ "$project" = "default" ]; then
        log_error "No project selected"
        exit 1
    fi
    
    echo "Snapshots for project: $project"
    echo ""
    
    local found=0
    for snapshot in "${SNAPSHOT_DIR}/${project}"-*.db.gz; do
        if [ -f "$snapshot" ]; then
            found=1
            local name=$(basename "$snapshot")
            local size=$(du -h "$snapshot" | cut -f1)
            local date=$(echo "$name" | sed 's/.*-\([0-9]\{8\}\)-\([0-9]\{6\}\).*/\1 \2/' | sed 's/\(....\)\(..\)\(..\)/\1-\2-\3/' | sed 's/\(..\)\(..\)\(..\)/\1:\2:\3/')
            echo "  $date - $name ($size)"
        fi
    done
    
    if [ "$found" = "0" ]; then
        echo "  (no snapshots yet)"
        echo "  Create one with: epi kbase snapshot [message]"
    fi
}

# ============================================================================
# Help
# ============================================================================

show_help() {
    cat << 'EOF'
Epi-Logos Knowledge Base (kbase) - Project-based bookmark management

PROJECT MANAGEMENT:
  epi kbase init <project> [--template <template>]   Create new project
  epi kbase use <project>                          Switch to project
  epi kbase use --global                           Use default database
  epi kbase list                                   List all projects
  epi kbase current                                Show active project
  epi kbase info [project]                         Show project stats
  epi kbase delete <project>                       Delete project
  epi kbase rename <old> <new>                     Rename project
  epi kbase find <partial-name>                    Find projects (exact + partial match)
  epi kbase switch <partial-name>                  Fuzzy switch to matching project

CONTENT MANAGEMENT:
  epi kbase add <url> [tags]                       Add bookmark (auto-tags, auto-backfills)
  epi kbase add-file <path> [tags]                 Add file as bookmark
  epi kbase fetch <url> [tags]                     Fetch URL content and index
  epi kbase update <id> [options]                  Update bookmark (re-embeds)
  epi kbase refresh <id>                            Re-fetch URL and regenerate embedding

SEARCH:
  epi kbase search <query>                        Search current project
  epi kbase sem-search "<query>"                   Semantic search (current project)
  epi kbase search-all "<query>"                   Search all projects
  epi kbase search-all "<query>" --gemini          Semantic search all projects (ranked)
  epi kbase list-all                               List bookmarks from all projects

VERSIONING:
  epi kbase snapshot [message]                     Create compressed backup
  epi kbase log                                    List snapshots

OTHER:
  epi kbase tags                                   List tags in current project
  epi kbase show <id>                              Show bookmark details
  epi kbase open <id>                              Open bookmark in browser

ENVIRONMENT VARIABLES:
  BKMR_PROJECT            Override current project
  BKMR_AUTO_BACKFILL=0    Disable auto-backfill
  BKMR_AUTO_TAG=0         Disable auto-tagging

EXAMPLES:
  epi kbase init agent-payment-protocol
  epi kbase use agent-payment-protocol
  epi kbase add "https://eips.ethereum.org/EIPS/eip-4337" ethereum,research
  epi kbase search-all "session keys" --gemini
EOF
}

# ============================================================================
# Main
# ============================================================================

main() {
    local cmd="${1:-}"
    
    case "$cmd" in
        init)
            shift
            cmd_init "$@"
            ;;
        use)
            shift
            cmd_use "$@"
            ;;
        list)
            cmd_list
            ;;
        current)
            cmd_current
            ;;
        info)
            shift
            cmd_info "$@"
            ;;
        delete)
            shift
            cmd_delete "$@"
            ;;
        rename)
            shift
            cmd_rename "$@"
            ;;
        find)
            shift
            cmd_find "$@"
            ;;
        switch)
            shift
            cmd_switch "$@"
            ;;
        add)
            shift
            cmd_add "$@"
            ;;
        add-file)
            shift
            cmd_add_file "$@"
            ;;
        fetch)
            shift
            cmd_fetch "$@"
            ;;
        update)
            shift
            cmd_update "$@"
            ;;
        refresh)
            shift
            cmd_refresh "$@"
            ;;
        search-all)
            shift
            cmd_search_all "$@"
            ;;
        list-all)
            cmd_list_all
            ;;
        snapshot)
            shift
            cmd_snapshot "$@"
            ;;
        log)
            cmd_log
            ;;
        sem-search)
            shift
            resolve_db
            bkmr --gemini sem-search "$@"
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            # Pass through to bkmr with resolved DB
            resolve_db
            bkmr "$@"
            ;;
    esac
}

main "$@"
