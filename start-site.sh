#!/usr/bin/env bash
set -euo pipefail

if [[ -f package.json ]]; then
  npm start
  exit 0
fi

if [[ -d /workspace/Product-List && -f /workspace/Product-List/package.json ]]; then
  echo "package.json not found in $(pwd). Switching to /workspace/Product-List ..."
  cd /workspace/Product-List
  npm start
  exit 0
fi

if [[ -d /workspaces/Product-List && -f /workspaces/Product-List/package.json ]]; then
  echo "package.json not found in $(pwd). Switching to /workspaces/Product-List ..."
  cd /workspaces/Product-List
  npm start
  exit 0
fi

echo "Could not find package.json for Sales Sheet Builder."
echo "Try: cd /workspace/Product-List  (or /workspaces/Product-List in Codespaces)"
exit 1
