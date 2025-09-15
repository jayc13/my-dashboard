#!/bin/bash

# PR Comment Script
# Posts or updates comments on pull requests
# Usage: pr-comment.sh <comment-id> <comment-body>
#   comment-id: Unique identifier for the comment (used to update existing comments)
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

# Parameters
COMMENT_ID="${1}"
COMMENT_BODY="${2}"

# Check required parameters
if [[ -z "$COMMENT_ID" ]]; then
    echo -e "${RED}❌ comment-id parameter is required${NC}"
    echo -e "${YELLOW}Usage: $0 <comment-id> <comment-body>${NC}"
    exit 1
fi

if [[ -z "$COMMENT_BODY" ]]; then
    echo -e "${RED}❌ comment-body parameter is required${NC}"
    echo -e "${YELLOW}Usage: $0 <comment-id> <comment-body>${NC}"
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

echo -e "${CYAN}💬 Processing comment for PR #${PR_NUMBER} with ID: ${COMMENT_ID}...${NC}"

# Function to find existing comment by comment ID
find_existing_comment() {
    local comment_id="$1"
    echo -e "${BLUE}Searching for existing comment with ID: ${comment_id}...${NC}"

    # Get all comments for the PR
    local comments_response=$(curl -s \
        -H "Authorization: Bearer $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$GITHUB_REPOSITORY/issues/$PR_NUMBER/comments")

    # Search for comment containing the comment ID
    local existing_comment_id=$(echo "$comments_response" | jq -r --arg id "$comment_id" '
        .[] | select(.body | contains("<!-- comment-id: " + $id + " -->")) | .id
    ')

    echo "$existing_comment_id"
}

# Prepare the final comment body with comment ID marker
FINAL_COMMENT_BODY="<!-- comment-id: ${COMMENT_ID} -->
${COMMENT_BODY}"

# Check if comment already exists
# TODO: Explore solution to update existing comment instead of creating new one
EXISTING_COMMENT_ID="null" # $(find_existing_comment "$COMMENT_ID")

# Determine if we're creating or updating
if [[ -n "$EXISTING_COMMENT_ID" && "$EXISTING_COMMENT_ID" != "null" ]]; then
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

# Escape the comment body for JSON
ESCAPED_COMMENT_BODY=$(echo "$FINAL_COMMENT_BODY" | jq -Rs .)

# Create the comment payload
COMMENT_PAYLOAD=$(cat <<EOF
{
  "body": $ESCAPED_COMMENT_BODY
}
EOF
)

# Make the API call
echo -e "${BLUE}${ACTION^}ing comment via GitHub API...${NC}"

RESPONSE=$(curl -s -w "%{http_code}" \
  -X "$HTTP_METHOD" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Content-Type: application/json" \
  -d "$COMMENT_PAYLOAD" \
  "$API_URL")

# Extract HTTP status code (last 3 characters)
HTTP_STATUS="${RESPONSE: -3}"
RESPONSE_BODY="${RESPONSE%???}"

if [[ "$HTTP_STATUS" == "$SUCCESS_STATUS" ]]; then
    if [[ "$ACTION" == "create" ]]; then
        echo -e "${GREEN}✅ Successfully created comment on PR #${PR_NUMBER}${NC}"
    else
        echo -e "${GREEN}✅ Successfully updated comment on PR #${PR_NUMBER}${NC}"
    fi

    # Extract comment URL from response
    COMMENT_URL=$(echo "$RESPONSE_BODY" | jq -r '.html_url // empty')
    if [[ -n "$COMMENT_URL" ]]; then
        echo -e "${BLUE}Comment URL: $COMMENT_URL${NC}"
    fi
else
    echo -e "${RED}❌ Failed to ${ACTION} comment. HTTP Status: $HTTP_STATUS${NC}"
    echo -e "${RED}Response: $RESPONSE_BODY${NC}"
    exit 1
fi

echo -e "${CYAN}✨ PR comment ${ACTION}d successfully!${NC}"
