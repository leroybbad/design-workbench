#!/bin/bash
set -e

# ------------------------------------------------------------------
# release.sh — Sync public-ready files from designkit-dev to designkit
#
# Usage:
#   ./release.sh              # sync files, prompt before committing
#   ./release.sh "v0.2.0"    # sync files with a specific commit message
# ------------------------------------------------------------------

DEV_REPO="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PUBLIC_REPO="$HOME/Dev/designkit"
PUBLIC_REMOTE="https://github.com/leroybbad/designkit.git"

# --- Clone the public repo if it doesn't exist yet ---
if [ ! -d "$PUBLIC_REPO" ]; then
  echo "Public repo not found at $PUBLIC_REPO — cloning..."
  git clone "$PUBLIC_REMOTE" "$PUBLIC_REPO"
fi

# --- Sync files ---
echo "Syncing from designkit-dev → designkit..."

rsync -av --delete \
  --exclude '.git/' \
  --exclude '.superpowers/' \
  --exclude 'superpowers-main/' \
  --exclude 'docs/' \
  --exclude 'release.sh' \
  --exclude 'node_modules/' \
  --exclude '.DS_Store' \
  "$DEV_REPO/" "$PUBLIC_REPO/"

echo ""
echo "Sync complete. Showing changes in public repo:"
echo "------------------------------------------------"
cd "$PUBLIC_REPO"
git status

# --- Commit if there are changes ---
if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  echo ""
  echo "No changes to commit. Public repo is up to date."
  exit 0
fi

echo ""
if [ -n "$1" ]; then
  MSG="$1"
else
  read -p "Commit message (leave empty to skip commit): " MSG
fi

if [ -n "$MSG" ]; then
  git add -A
  git commit -m "$MSG"
  echo ""
  read -p "Push to origin? [y/N] " PUSH
  if [[ "$PUSH" =~ ^[Yy]$ ]]; then
    git push origin main
    echo "Pushed to public repo."
  else
    echo "Committed locally. Run 'cd $PUBLIC_REPO && git push origin main' when ready."
  fi
else
  echo "Skipped commit. Review changes in $PUBLIC_REPO and commit manually."
fi
