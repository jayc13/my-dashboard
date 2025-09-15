#!/bin/bash

# PR Comment Script
# Posts or updates comments on pull requests
# Usage: pr-comment.sh [comment-key] <comment-body>
#   comment-key: Optional unique identifier for the comment (used to update existing comments)
#   comment-body: The actual comment content to post/update

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Required environment variables
GITHUB_TOKEN="${GITHUB_TOKEN}"
GITHUB_REPOSITORY="${GITHUB_REPOSITORY}"
PR_NUMBER="${PR_NUMBER}"

# Parameters - handle optional comment key
if [[ $# -eq 1 ]]; then
    # Only one parameter provided - treat as comment body
    COMMENT_KEY=""
    COMMENT_BODY="${1}"
elif [[ $# -eq 2 ]]; then
    # Two parameters provided - first is comment key, second is comment body
    COMMENT_KEY="${1}"
    COMMENT_BODY="${2}"
else
    # Invalid number of parameters
    echo -e "${RED}❌ Invalid number of parameters${NC}"
    echo -e "${YELLOW}Usage: $0 [comment-key] <comment-body>${NC}"
    exit 1
fi

# Comment body can be empty for deletion, but we need at least one parameter
if [[ $# -eq 0 ]]; then
    echo -e "${RED}❌ At least one parameter is required${NC}"
    echo -e "${YELLOW}Usage: $0 [comment-key] <comment-body>${NC}"
    echo -e "${YELLOW}Note: Empty comment-body will delete existing comment if comment-key is provided${NC}"
    exit 1
fi

# Check required environment variables
if [[ -z "$GITHUB_TOKEN" ]]; then
    echo -e "${RED}❌ GITHUB_TOKEN is required${NC}"
    exit 1
fi

if [[ -z "$GITHUB_REPOSITORY" ]]; then
    echo -e "${RED}❌ GITHUB_REPOSITORY is required${NC}"
    exit 1
fi

if [[ -z "$PR_NUMBER" ]]; then
    echo -e "${RED}❌ PR_NUMBER is required${NC}"
    exit 1
fi

if [[ -n "$COMMENT_KEY" ]]; then
    echo -e "${CYAN}💬 Processing comment for PR #${PR_NUMBER} with key: ${COMMENT_KEY}...${NC}"
else
    echo -e "${CYAN}💬 Processing comment for PR #${PR_NUMBER}...${NC}"
fi

# Function to find existing comment by comment key
find_existing_comment() {
    local comment_key="$1"

    # Get all comments for the PR
    local comments_response=$(curl -s \
        -H "Authorization: Bearer $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$GITHUB_REPOSITORY/issues/$PR_NUMBER/comments")

    # Search for comment containing the comment key
    local existing_comment_id=$(echo "$comments_response" | jq -r --arg key "$comment_key" '
        .[] | select(.body | contains("<!-- comment-key: " + $key + " -->")) | .id
    ')

    echo "$existing_comment_id"
}

# Prepare the final comment body with comment key marker (if provided)
if [[ -n "$COMMENT_KEY" ]]; then
    FINAL_COMMENT_BODY="<!-- comment-key: ${COMMENT_KEY} -->
${COMMENT_BODY}"
else
    FINAL_COMMENT_BODY="${COMMENT_BODY}"
fi

# Check if comment already exists (only if COMMENT_KEY is provided)
if [[ -n "$COMMENT_KEY" ]]; then
    EXISTING_COMMENT_ID=$(find_existing_comment "$COMMENT_KEY")
else
    EXISTING_COMMENT_ID="null"
fi

# Handle empty comment body as deletion request
if [[ -z "$COMMENT_BODY" || "$COMMENT_BODY" == "" ]]; then
    if [[ -n "$EXISTING_COMMENT_ID" && "$EXISTING_COMMENT_ID" != "null" ]]; then
        echo -e "${YELLOW}Empty comment body provided. Deleting existing comment with ID ${EXISTING_COMMENT_ID}...${NC}"
        ACTION="delete"
        API_URL="https://api.github.com/repos/$GITHUB_REPOSITORY/issues/comments/$EXISTING_COMMENT_ID"
        HTTP_METHOD="DELETE"
        SUCCESS_STATUS="204"
    else
        echo -e "${BLUE}Empty comment body and no existing comment found. Nothing to do.${NC}"
        exit 0
    fi
# Determine if we're creating or updating
elif [[ -n "$EXISTING_COMMENT_ID" && "$EXISTING_COMMENT_ID" != "null" ]]; then
    echo -e "${YELLOW}Found existing comment with ID ${EXISTING_COMMENT_ID}. Updating...${NC}"
    ACTION="update"
    API_URL="https://api.github.com/repos/$GITHUB_REPOSITORY/issues/comments/$EXISTING_COMMENT_ID"
    HTTP_METHOD="PATCH"
    SUCCESS_STATUS="200"
else
    echo -e "${BLUE}No existing comment found. Creating new comment...${NC}"
    ACTION="create"
    API_URL="https://api.github.com/repos/$GITHUB_REPOSITORY/issues/$PR_NUMBER/comments"
    HTTP_METHOD="POST"
    SUCCESS_STATUS="201"
fi

# Make the API call
echo -e "${BLUE}${ACTION^}ing comment via GitHub API...${NC}"

if [[ "$ACTION" == "delete" ]]; then
    # For DELETE, no payload is needed
    RESPONSE=$(curl -s -w "%{http_code}" \
      -X "$HTTP_METHOD" \
      -H "Authorization: Bearer $GITHUB_TOKEN" \
      -H "Accept: application/vnd.github.v3+json" \
      "$API_URL")
else
    # For CREATE/UPDATE, prepare the comment payload
    ESCAPED_COMMENT_BODY=$(echo "$FINAL_COMMENT_BODY" | jq -Rs .)
    COMMENT_PAYLOAD=$(cat <<EOF
{
  "body": $ESCAPED_COMMENT_BODY
}
EOF
)

    RESPONSE=$(curl -s -w "%{http_code}" \
      -X "$HTTP_METHOD" \
      -H "Authorization: Bearer $GITHUB_TOKEN" \
      -H "Accept: application/vnd.github.v3+json" \
      -H "Content-Type: application/json" \
      -d "$COMMENT_PAYLOAD" \
      "$API_URL")
fi

# Extract HTTP status code (last 3 characters)
HTTP_STATUS="${RESPONSE: -3}"
RESPONSE_BODY="${RESPONSE%???}"

if [[ "$HTTP_STATUS" == "$SUCCESS_STATUS" ]]; then
    if [[ "$ACTION" == "create" ]]; then
        echo -e "${GREEN}✅ Successfully created comment on PR #${PR_NUMBER}${NC}"
    elif [[ "$ACTION" == "delete" ]]; then
        echo -e "${GREEN}✅ Successfully deleted comment on PR #${PR_NUMBER}${NC}"
    else
        echo -e "${GREEN}✅ Successfully updated comment on PR #${PR_NUMBER}${NC}"
    fi

    # Extract comment URL from response (not available for delete)
    if [[ "$ACTION" != "delete" ]]; then
        COMMENT_URL=$(echo "$RESPONSE_BODY" | jq -r '.html_url // empty')
        if [[ -n "$COMMENT_URL" ]]; then
            echo -e "${BLUE}Comment URL: $COMMENT_URL${NC}"
        fi
    fi
else
    echo -e "${RED}❌ Failed to ${ACTION} comment. HTTP Status: $HTTP_STATUS${NC}"
    echo -e "${RED}Response: $RESPONSE_BODY${NC}"
    exit 1
fi

echo -e "${CYAN}✨ PR comment ${ACTION}d successfully!${NC}"
