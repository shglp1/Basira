#!/usr/bin/env bash
set -euo pipefail

# Run this in an environment with npm registry access.
# Optional: export NPM_REGISTRY_URL=https://<your-internal-registry>
if [[ -n "${NPM_REGISTRY_URL:-}" ]]; then
  npm config set registry "$NPM_REGISTRY_URL"
fi

npm install --package-lock-only
npm ci
npm run test
npm run build

echo "Lockfile generated and validated. Commit package-lock.json."
