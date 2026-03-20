#!/usr/bin/env bash
set -euo pipefail

# Auth check
if ! npm whoami &>/dev/null; then
  echo "ERROR: not logged in to npm. Run 'npm login' first." >&2
  exit 1
fi

# Dirty tree check
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "ERROR: uncommitted changes. Commit or stash them first." >&2
  exit 1
fi

# Bump patch version (creates commit + tag)
echo "==> Bumping patch version..."
if ! npm version patch; then
  echo "ERROR: npm version patch failed." >&2
  exit 1
fi

NEW_VERSION=$(node -p "require('./package.json').version")
echo "==> New version: v${NEW_VERSION}"

# Publish (prepublishOnly runs tsc)
echo "==> Publishing to npm..."
if ! npm publish; then
  echo "ERROR: npm publish failed. Rolling back version bump..." >&2
  git reset --hard HEAD~1
  git tag -d "v${NEW_VERSION}" 2>/dev/null || true
  exit 1
fi

echo "==> Published v${NEW_VERSION} to npm"

# Push the version bump commit and tag
echo "==> Pushing version bump commit and tag..."
git push origin main --follow-tags
