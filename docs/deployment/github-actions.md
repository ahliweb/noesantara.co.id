# GitHub Actions Setup

## Official References Used

- GitHub Actions secrets guidance: `https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions`
- GitHub environments guidance: `https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/deploy-to-environment`

## Workflows Included

- `validate.yml`: installs dependencies, typechecks, builds Astro, and builds the optional lead receiver Docker image.
- `deploy-pages.yml`: deploys the Astro static build to Cloudflare Pages.
- `deploy-worker.yml`: deploys the Cloudflare Worker API.

## Recommended Branch Strategy

- `main` => production
- `staging` => staging

## Required GitHub Repository Secrets

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

## Required GitHub Repository Variables

- `CLOUDFLARE_PAGES_PROJECT_NAME`
- `PUBLIC_CONTACT_API_URL`

## Recommended GitHub Environments

- `production`
- `staging`
- `ci`

Store environment-specific values in the matching GitHub environment whenever production and staging differ.

## Setup Helper

Use `scripts/setup-github-secrets.sh owner/repo` to create the repository-level values from your current shell environment.
