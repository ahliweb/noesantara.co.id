#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(dirname "$0")/.."

if [[ -z "${PUBLIC_CONTACT_API_URL:-}" ]]; then
  export PUBLIC_CONTACT_API_URL="https://api.example.com/api/contact"
fi

if [[ ! -f "$ROOT_DIR/.env.example" ]]; then
  echo "Missing .env.example"
  exit 1
fi

if [[ ! -f "$ROOT_DIR/worker/.dev.vars.example" ]]; then
  echo "Missing worker/.dev.vars.example"
  exit 1
fi

if [[ ! -f "$ROOT_DIR/services/lead-receiver/.env.example" ]]; then
  echo "Missing services/lead-receiver/.env.example"
  exit 1
fi

echo "Environment examples are present."
