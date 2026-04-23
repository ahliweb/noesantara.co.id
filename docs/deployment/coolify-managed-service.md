# Coolify Managed Service Setup

## Official References Used

- Coolify managed cloud overview: `https://coolify.io/docs/get-started/cloud.md`
- Coolify applications and build packs: `https://coolify.io/docs/applications.md`
- Dockerfile build pack: `https://coolify.io/docs/applications/build-packs/dockerfile.md`
- Environment variables: `https://coolify.io/docs/knowledge-base/environment-variables.md`
- Health checks: `https://coolify.io/docs/knowledge-base/health-checks.md`

## What This Service Does

The optional `services/lead-receiver` app accepts authenticated lead webhooks from the Cloudflare Worker and can persist leads to PostgreSQL.

## Deployment Shape

- Resource type: Application
- Build pack: Dockerfile
- Dockerfile path: `services/lead-receiver/Dockerfile`
- Exposed port: `3000`
- Health check: `GET /health`

## Required Environment Variables

- `PORT=3000`
- `NODE_ENV=production`
- `WEBHOOK_AUTH_TOKEN=<shared-secret-with-worker>`

## Optional Environment Variables

- `DATABASE_URL=<postgres-connection-string>`
- `LOG_LEVEL=info`

If `DATABASE_URL` is omitted, the service still accepts and logs leads but does not persist them.

## PostgreSQL Guidance

- Use a managed PostgreSQL service inside Coolify or an external database.
- Run `services/lead-receiver/sql/init.sql` before enabling persistence.
- Prefer TLS-enabled database connections where available.

## Domain And TLS

- Suggested domain: `leads.noesantara.co.id`
- Coolify-managed TLS is acceptable for the receiver.
- Restrict ingress to HTTPS only.

## Healthcheck

The Dockerfile includes a container-native healthcheck using Node's built-in `fetch()` against `/health`.

## Production Readiness Notes

- Keep `WEBHOOK_AUTH_TOKEN` unique per environment.
- Rotate the token in both Coolify and Cloudflare together.
- Use Coolify rolling updates if available for zero-downtime application updates.
