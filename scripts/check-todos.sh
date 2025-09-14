#!/bin/bash

# TODO/FIXME Comment Detection Script
# This script scans the codebase for TODO and FIXME comments
# and provides detailed reporting and analysis

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
EXTENSIONS=("ts" "tsx" "js" "jsx" "sh" "yml" "yaml" "md" "json")
SCAN_DIRS=("client/src" "server/src" "cron/src" "scripts" ".github" "docs")
EXCLUDE_PATTERNS=("node_modules" "dist" "build" "coverage" "data" ".git")

# Files to ignore (relative to project root)
# Add files here that should be excluded from TODO/FIXME scanning
IGNORE_FILES=(
    # Script files that contain TODO/FIXME as part of their functionality
    "scripts/check-todos.sh"
    "scripts/README-check-todos.md"

    # Workflow files that may contain TODO placeholders
    ".github/workflows/pr-validation.yml"

    "docs/github-actions-ci-cd.md"

    "scripts/package.json"

    # Lock files and generated files
    "package-lock.json"

    # Log files and temporary files
    "*.log"
    "*.tmp"
    "*.temp"
)

# Initialize counters
TOTAL_TODOS=0
TOTAL_FIXMES=0
NEW_TODOS=0
NEW_FIXMES=0
COMPLEX_TODOS=0

# Temporary files for collecting results
TODO_FILE=$(mktemp)
FIXME_FILE=$(mktemp)
NEW_TODO_FILE=$(mktemp)
NEW_FIXME_FILE=$(mktemp)
COMPLEX_TODO_FILE=$(mktemp)

# Cleanup function
cleanup() {
    rm -f "$TODO_FILE" "$FIXME_FILE" "$NEW_TODO_FILE" "$NEW_FIXME_FILE" "$COMPLEX_TODO_FILE"
}
trap cleanup EXIT

# Function to check if a file should be ignored
should_ignore_file() {
    local file="$1"

    # Convert to relative path from project root
    local rel_path="$file"
    if [[ "$file" == /* ]]; then
        # If absolute path, make it relative to current directory
        rel_path="${file#$(pwd)/}"
    fi

    # Check against ignore patterns
    for ignore_pattern in "${IGNORE_FILES[@]}"; do
        # Handle glob patterns
        if [[ "$ignore_pattern" == *"*"* ]]; then
            if [[ "$rel_path" == $ignore_pattern ]]; then
                return 0  # Should ignore
            fi
        else
            # Exact match
            if [[ "$rel_path" == "$ignore_pattern" ]]; then
                return 0  # Should ignore
            fi
        fi
    done

    return 1  # Should not ignore
}

# Function to check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️ Not in a git repository. Skipping PR-specific analysis.${NC}"
        return 1
    fi
    return 0
}

# Function to check if main branch exists
check_main_branch() {
    if ! git show-ref --verify --quiet refs/heads/main && ! git show-ref --verify --quiet refs/remotes/origin/main; then
        echo -e "${YELLOW}⚠️ Main branch not found. Skipping PR-specific analysis.${NC}"
        return 1
    fi
    return 0
}

# Function to scan for TODO/FIXME comments in a file
scan_file_comments() {
    local file="$1"
    local pattern="$2"
    local comment_type="$3"
    local output_file="$4"

    # Skip binary files
    if file "$file" | grep -q "binary"; then
        return
    fi

    # Define comment patterns for different file types
    local comment_patterns=""
    case "${file##*.}" in
        ts|tsx|js|jsx)
            # TypeScript/JavaScript: // TODO or /* TODO */
            comment_patterns="(//.*$pattern|/\*.*$pattern.*\*/)"
            ;;
        sh)
            # Shell: # TODO
            comment_patterns="#.*$pattern"
            ;;
        yml|yaml)
            # YAML: # TODO
            comment_patterns="#.*$pattern"
            ;;
        md)
            # Markdown: <!-- TODO --> or just TODO in text
            comment_patterns="(<!--.*$pattern.*-->|^.*$pattern.*$)"
            ;;
        json)
            # JSON: "// TODO" (in strings)
            comment_patterns="\".*$pattern.*\""
            ;;
        *)
            # Default: look for comment-like patterns
            comment_patterns="(//.*$pattern|#.*$pattern|/\*.*$pattern.*\*/|<!--.*$pattern.*-->)"
            ;;
    esac

    # Get line numbers and content for TODO/FIXME comments
    grep -n -i -E "$comment_patterns" "$file" 2>/dev/null | while IFS=':' read -r line_num content; do
        # Clean up the content (remove leading/trailing whitespace)
        clean_content=$(echo "$content" | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')

        # Additional filtering to avoid false positives
        # Skip if it's just a variable name or class name without comment syntax
        if [[ "$clean_content" =~ ^[[:space:]]*[a-zA-Z_][a-zA-Z0-9_]*.*$pattern.*[a-zA-Z0-9_] ]] && \
           [[ ! "$clean_content" =~ (//|#|/\*|\*|<!--) ]]; then
            continue
        fi

        echo "$file:$line_num:$clean_content" >> "$output_file"
    done
}

# Function to check if a comment is new in the current PR
is_new_comment() {
    local file="$1"
    local line_content="$2"
    
    if ! check_git_repo || ! check_main_branch; then
        return 1
    fi
    
    # Check if file was changed in this PR/branch
    if ! git diff --name-only origin/main...HEAD 2>/dev/null | grep -q "^$file$"; then
        return 1
    fi
    
    # Check if this specific line was added
    if git diff origin/main...HEAD "$file" 2>/dev/null | grep -q "^+.*$(echo "$line_content" | sed 's/[.*[\^$()+{}|]/\\&/g')"; then
        return 0
    fi
    
    return 1
}

# Function to check for complex TODOs that might warrant GitHub issues
check_complex_todos() {
    local file="$1"

    local complex_patterns=(
        "(//|#|/\*|\*).*TODO:.*implement.*"
        "(//|#|/\*|\*).*TODO:.*add.*feature"
        "(//|#|/\*|\*).*TODO:.*refactor.*"
        "(//|#|/\*|\*).*TODO:.*optimize.*"
        "(//|#|/\*|\*).*TODO:.*security.*"
        "(//|#|/\*|\*).*TODO:.*performance.*"
        "(//|#|/\*|\*).*TODO:.*breaking.*change"
        "(//|#|/\*|\*).*TODO:.*major.*"
        "(//|#|/\*|\*).*TODO:.*architecture.*"
        "(//|#|/\*|\*).*TODO:.*design.*"
        "(//|#|/\*|\*).*TODO:.*api.*"
        "(//|#|/\*|\*).*TODO:.*database.*"
        "(//|#|/\*|\*).*TODO:.*migration.*"
    )

    for pattern in "${complex_patterns[@]}"; do
        grep -n -i -E "$pattern" "$file" 2>/dev/null | while IFS=':' read -r line_num content; do
            clean_content=$(echo "$content" | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')
            echo "$file:$line_num:$clean_content" >> "$COMPLEX_TODO_FILE"
        done
    done
}

# Function to display results from a file
display_results() {
    local results_file="$1"
    local comment_type="$2"
    local color="$3"
    local show_new="$4"
    
    if [ ! -s "$results_file" ]; then
        return
    fi
    
    local current_file=""
    local count=0
    
    while IFS=':' read -r file line_num content; do
        if [ "$file" != "$current_file" ]; then
            if [ -n "$current_file" ]; then
                echo ""
            fi
            echo -e "${color}Found $comment_type comments in $file:${NC}"
            current_file="$file"
        fi
        
        echo -e "  ${BLUE}Line $line_num:${NC} $content"
        
        # Check if this is a new comment
        if [ "$show_new" = "true" ] && is_new_comment "$file" "$content"; then
            echo -e "    ${PURPLE}↳ NEW in this PR${NC}"
            if [ "$comment_type" = "TODO" ]; then
                echo "$file:$line_num:$content" >> "$NEW_TODO_FILE"
            else
                echo "$file:$line_num:$content" >> "$NEW_FIXME_FILE"
            fi
        fi
        
        count=$((count + 1))
    done < "$results_file"
    
    if [ $count -gt 0 ]; then
        echo ""
    fi
    
    if [ "$comment_type" = "TODO" ]; then
        TOTAL_TODOS=$count
    else
        TOTAL_FIXMES=$count
    fi
}

# Main scanning function
scan_codebase() {
    echo -e "${GREEN}🔍 Scanning codebase for TODO and FIXME comments...${NC}"
    echo ""
    
    echo "📂 Scanning directories:"
    for dir in "${SCAN_DIRS[@]}"; do
        if [ -d "$dir" ]; then
            echo -e "  ${GREEN}✓${NC} $dir"
        else
            echo -e "  ${YELLOW}⚠️${NC} $dir (not found)"
        fi
    done
    echo ""
    
    # Scan all specified directories
    for dir in "${SCAN_DIRS[@]}"; do
        if [ ! -d "$dir" ]; then
            continue
        fi
        
        echo -e "${CYAN}📂 Scanning $dir...${NC}"
        
        # Find files with specified extensions, excluding certain patterns
        for ext in "${EXTENSIONS[@]}"; do
            find "$dir" -name "*.${ext}" -type f | while read -r file; do
                # Skip if file doesn't exist
                [ ! -f "$file" ] && continue

                # Skip excluded patterns
                skip_file=false
                for exclude in "${EXCLUDE_PATTERNS[@]}"; do
                    if [[ "$file" == *"$exclude"* ]]; then
                        skip_file=true
                        break
                    fi
                done

                if [ "$skip_file" = true ]; then
                    continue
                fi

                # Skip ignored files
                if should_ignore_file "$file"; then
                    continue
                fi
                
                # Scan for TODO and FIXME comments
                scan_file_comments "$file" "TODO" "TODO" "$TODO_FILE"
                scan_file_comments "$file" "FIXME" "FIXME" "$FIXME_FILE"
                
                # Check for complex TODOs
                check_complex_todos "$file"
            done
        done
    done
}

# Function to generate summary report
generate_summary() {
    echo "📊 Summary Report:"
    echo "=================="
    
    # Count new comments
    NEW_TODOS=$(wc -l < "$NEW_TODO_FILE" 2>/dev/null || echo 0)
    NEW_FIXMES=$(wc -l < "$NEW_FIXME_FILE" 2>/dev/null || echo 0)
    COMPLEX_TODOS=$(wc -l < "$COMPLEX_TODO_FILE" 2>/dev/null || echo 0)
    
    echo -e "Total TODO comments found: ${YELLOW}$TOTAL_TODOS${NC}"
    echo -e "Total FIXME comments found: ${RED}$TOTAL_FIXMES${NC}"
    
    if check_git_repo && check_main_branch; then
        echo -e "New TODO comments in this PR: ${PURPLE}$NEW_TODOS${NC}"
        echo -e "New FIXME comments in this PR: ${PURPLE}$NEW_FIXMES${NC}"
    fi
    
    echo -e "Complex TODOs (consider creating issues): ${CYAN}$COMPLEX_TODOS${NC}"
    echo ""
    
    # Provide recommendations
    if [ $NEW_FIXMES -gt 0 ]; then
        echo -e "${RED}⚠️ Warning: This PR introduces $NEW_FIXMES new FIXME comment(s).${NC}"
        echo -e "${RED}   Consider addressing these issues before merging.${NC}"
        echo ""
    fi
    
    if [ $NEW_TODOS -gt 5 ]; then
        echo -e "${YELLOW}📝 Note: This PR introduces $NEW_TODOS new TODO comment(s).${NC}"
        echo -e "${YELLOW}   Consider creating GitHub issues for complex TODOs.${NC}"
        echo ""
    fi
    
    if [ $TOTAL_FIXMES -gt 10 ]; then
        echo -e "${RED}🚨 High number of FIXME comments ($TOTAL_FIXMES) in codebase.${NC}"
        echo -e "${RED}   Consider prioritizing these fixes.${NC}"
        echo ""
    fi
    
    if [ $TOTAL_TODOS -gt 50 ]; then
        echo -e "${YELLOW}📋 High number of TODO comments ($TOTAL_TODOS) in codebase.${NC}"
        echo -e "${YELLOW}   Consider creating a cleanup sprint or GitHub issues.${NC}"
        echo ""
    fi
}

# Function to display complex TODOs
display_complex_todos() {
    if [ ! -s "$COMPLEX_TODO_FILE" ]; then
        return
    fi
    
    echo -e "${PURPLE}💡 Complex TODOs that might warrant GitHub issues:${NC}"
    echo "=================================================="
    
    local current_file=""
    while IFS=':' read -r file line_num content; do
        if [ "$file" != "$current_file" ]; then
            if [ -n "$current_file" ]; then
                echo ""
            fi
            echo -e "${PURPLE}📄 $file:${NC}"
            current_file="$file"
        fi
        
        echo -e "  ${BLUE}Line $line_num:${NC} $content"
    done < "$COMPLEX_TODO_FILE"
    echo ""
}

# Main execution
main() {
    echo -e "${GREEN}📝 TODO/FIXME Comment Analysis${NC}"
    echo "=============================="
    echo ""
    
    # Change to repository root if possible
    if check_git_repo; then
        cd "$(git rev-parse --show-toplevel)" || exit 1
    fi
    
    # Scan the codebase
    scan_codebase
    
    # Display results
    echo -e "${YELLOW}📋 TODO Comments:${NC}"
    echo "=================="
    display_results "$TODO_FILE" "TODO" "$YELLOW" "true"
    
    echo -e "${RED}🔧 FIXME Comments:${NC}"
    echo "==================="
    display_results "$FIXME_FILE" "FIXME" "$RED" "true"
    
    # Display complex TODOs
    display_complex_todos
    
    # Generate summary
    generate_summary
    
    echo "✅ TODO/FIXME comment analysis complete!"
}

# Run main function
main "$@"
