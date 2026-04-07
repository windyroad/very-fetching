#!/bin/bash
# Usage: npm run release:watch
# Merges the release PR, watches the workflow, reports publish status.

set -euo pipefail

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

PR_JSON=$(gh pr list --base main --state open --search "Version Packages in:title" --limit 1 --json number,url,title 2>/dev/null)
PR_NUMBER=$(echo "$PR_JSON" | jq -r '.[0].number // empty')
if [ -z "$PR_NUMBER" ]; then
  PR_JSON=$(gh pr list --base main --state open --search "chore: release in:title" --limit 1 --json number,url,title 2>/dev/null)
  PR_NUMBER=$(echo "$PR_JSON" | jq -r '.[0].number // empty')
fi
PR_URL=$(echo "$PR_JSON" | jq -r '.[0].url // empty')
PR_TITLE=$(echo "$PR_JSON" | jq -r '.[0].title // empty')

if [ -z "$PR_NUMBER" ]; then
  echo "No open release PR found." >&2
  exit 1
fi

echo "Found release PR #$PR_NUMBER: $PR_TITLE"
echo "  $PR_URL"
echo ""

echo "Checking CI status..."
BUILD_STATUS=""
for i in $(seq 1 30); do
  BUILD_STATUS=$(gh pr checks "$PR_NUMBER" --json name,state --jq '.[] | select(.name == "build") | .state' 2>/dev/null)
  case "$BUILD_STATUS" in
    SUCCESS) echo "Build check passed."; break ;;
    FAILURE|ERROR) echo "Build check failed." >&2; exit 1 ;;
    "") if [ "$i" -ge 6 ]; then echo "No build check found. Proceeding."; BUILD_STATUS="SKIPPED"; break; fi; printf '.'; sleep 10 ;;
    *) printf '.'; sleep 10 ;;
  esac
done
echo ""

echo "Merging release PR #$PR_NUMBER..."
gh pr merge "$PR_NUMBER" --merge
echo ""

printf 'Waiting for Release workflow'
RUN_ID=""
for i in $(seq 1 40); do
  RUN_ID=$(gh run list \
    --workflow=release.yml \
    --branch main \
    --limit 5 \
    --json databaseId,status,createdAt \
    --jq '[.[] | select(.status != "completed")] | sort_by(.createdAt) | reverse | .[0].databaseId' 2>/dev/null)
  [ -n "$RUN_ID" ] && [ "$RUN_ID" != "null" ] && break
  printf '.'
  sleep 3
done
echo ""

if [ -z "$RUN_ID" ] || [ "$RUN_ID" = "null" ]; then
  echo "No in-progress Release workflow found." >&2
  exit 1
fi

RUN_URL="https://github.com/$REPO/actions/runs/$RUN_ID"
echo "Release workflow: $RUN_URL"
echo ""

gh run watch "$RUN_ID" || true

RELEASE_CONCLUSION=$(gh run view "$RUN_ID" --json jobs --jq '.jobs[] | select(.name == "release") | .conclusion' 2>/dev/null)
if [ "$RELEASE_CONCLUSION" = "failure" ]; then
  echo "Release failed — $RUN_URL" >&2
  exit 1
fi

echo ""
echo "Release workflow completed successfully."
echo "  Release job: $RELEASE_CONCLUSION"
