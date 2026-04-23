#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <github-repo>"
  echo "Example: $0 owner/noesantara.co.id"
  exit 1
fi

REPO="$1"

required_envs=(
  CLOUDFLARE_ACCOUNT_ID
  CLOUDFLARE_API_TOKEN
  CLOUDFLARE_PAGES_PROJECT_NAME
  PUBLIC_CONTACT_API_URL
)

for key in "${required_envs[@]}"; do
  if [[ -z "${!key:-}" ]]; then
    echo "Missing required environment variable: $key"
    exit 1
  fi
done

printf '%s' "$CLOUDFLARE_ACCOUNT_ID" | gh secret set CLOUDFLARE_ACCOUNT_ID --repo "$REPO"
printf '%s' "$CLOUDFLARE_API_TOKEN" | gh secret set CLOUDFLARE_API_TOKEN --repo "$REPO"
printf '%s' "$CLOUDFLARE_PAGES_PROJECT_NAME" | gh variable set CLOUDFLARE_PAGES_PROJECT_NAME --repo "$REPO"
printf '%s' "$PUBLIC_CONTACT_API_URL" | gh variable set PUBLIC_CONTACT_API_URL --repo "$REPO"

echo "Repository-level GitHub Actions secrets and variables created for $REPO"
echo "Create environment-specific values with:"
echo "  gh secret set --env production SECRET_NAME --repo $REPO"
echo "  gh secret set --env staging SECRET_NAME --repo $REPO"
