---
name: docker-compose-helper
description: Write, debug, and optimize docker-compose.yml files with service definitions, networking, volumes, and healthchecks.
standards-version: 1.9.0
---

# Docker Compose Helper

## Trigger

Use this skill when:
- Writing a new `docker-compose.yml` or `compose.yml` from scratch
- Adding services, volumes, or networks to an existing compose file
- Debugging service startup order or dependency issues
- Configuring healthchecks and depends_on conditions
- Managing environment variables and `.env` files in compose
- Setting up multi-environment compose configurations with profiles

## Required Inputs

- Services to run (e.g., web app, database, cache, reverse proxy)
- Port mappings needed for local development
- Any persistent data requirements (databases, uploads)
- Whether the setup is for development, testing, or production

## Workflow

1. **Define services** - one service per container, with image or build context.
2. **Configure networking** - use named networks for service isolation; default bridge works for simple setups.
3. **Add healthchecks** - define health probes so `depends_on` with `condition: service_healthy` works correctly.
4. **Set up volumes** - use named volumes for persistent data (databases), bind mounts for development hot-reload.
5. **Manage environment variables** - use `.env` files for shared config, `environment:` for service-specific values.
6. **Configure depends_on** - use `condition: service_healthy` instead of bare `depends_on` to avoid race conditions.
7. **Add profiles** - group optional services (monitoring, debugging) under profiles so they only start when needed.
8. **Validate with MCP tools** - use `docker_listContainers`, `docker_listNetworks`, and `docker_listVolumes` to verify the running stack.

## Key References

- [Compose file reference](https://docs.docker.com/compose/compose-file/)
- [Compose networking](https://docs.docker.com/compose/networking/)
- [Environment variables in Compose](https://docs.docker.com/compose/environment-variables/)
- [Compose profiles](https://docs.docker.com/compose/profiles/)
- [Healthcheck in Compose](https://docs.docker.com/compose/compose-file/05-services/#healthcheck)

## Example Interaction

**User:** Create a compose file for a Node.js API with PostgreSQL and Redis.

**Agent:**

```yaml
# compose.yml
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://app:secret@db:5432/myapp
      REDIS_URL: redis://cache:6379
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_healthy
    volumes:
      - ./src:/app/src
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: myapp
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d myapp"]
      interval: 5s
      timeout: 3s
      retries: 5
    ports:
      - "5432:5432"

  cache:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

**User:** How do I add an optional pgAdmin service?

**Agent:** Use a compose profile so it only starts when you explicitly request it:

```yaml
  pgadmin:
    image: dpage/pgadmin4:latest
    profiles:
      - debug
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@local.dev
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "8080:80"
    depends_on:
      db:
        condition: service_healthy
```

Start it with:

```bash
docker compose --profile debug up
```

**User:** How do I use a .env file?

**Agent:** Create a `.env` file next to your `compose.yml`:

```env
POSTGRES_USER=app
POSTGRES_PASSWORD=secret
POSTGRES_DB=myapp
```

Reference in compose:

```yaml
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
```

Compose automatically loads `.env` from the project directory. Use `env_file:` to load from a custom path.

## MCP Usage

| Tool | Purpose |
|------|---------|
| `docker_listContainers` | Verify all compose services are running and check their status |
| `docker_inspectContainer` | Debug a specific service - check mounts, env vars, network settings |
| `docker_containerLogs` | Read logs from a service to diagnose startup failures |
| `docker_listNetworks` | Confirm compose created the expected networks |
| `docker_listVolumes` | Verify named volumes exist and check mount points |
| `docker_diskUsage` | Check disk consumed by volumes and containers in the stack |

**Verifying a compose stack is healthy:**
```
1. Call docker_listContainers to see all running services and their states.
2. For any service not in "running" state, call docker_containerLogs
   with the container ID to read error output.
3. Call docker_inspectContainer to check environment variables,
   mounts, and network configuration.
```

**Debugging network connectivity between services:**
```
1. Call docker_listNetworks to find the compose network name.
2. Call docker_inspectContainer on each service to verify they
   share the same network.
```

## Common Pitfalls

- **Bare depends_on without conditions** - `depends_on: [db]` only waits for the container to start, not for the service inside to be ready. Always use `condition: service_healthy` with a healthcheck.
- **Using `latest` tags** - pin image versions (e.g., `postgres:16-alpine`) to avoid breaking changes on rebuild.
- **Bind mounts for database data** - use named volumes for databases. Bind mounts can cause permission issues and are not portable.
- **Hardcoding secrets in compose** - use `.env` files (gitignored) or Docker secrets. Never commit passwords to version control.
- **Port conflicts** - check that host ports don't conflict with other services or the host system. Use `docker_listContainers` to see what's already bound.
- **Missing restart policy** - without `restart: unless-stopped`, services won't come back after a Docker daemon restart.
- **Forgetting to create named volumes** - declare them in the top-level `volumes:` section. Without it, Docker creates anonymous volumes that are hard to track.
- **Not using profiles for optional services** - tools like pgAdmin, mailhog, or monitoring stacks should use profiles so they don't start by default.
- **Confusing env_file and environment** - `env_file` loads from a file, `environment` sets inline. Values in `environment` override `env_file`.
- **Network mode host on non-Linux** - `network_mode: host` only works on Linux. On macOS/Windows, use port mapping instead.

## See Also

- [Dockerfile Best Practices](../dockerfile-best-practices/SKILL.md)
- [Container Debugging](../container-debugging/SKILL.md)
- [Image Optimization](../image-optimization/SKILL.md)
