---
name: docker-development-env
description: Set up development environments with Docker including hot reload, dev containers, bind mounts, and database containers.
standards-version: 1.6.3
---

# Docker Development Environment

## Trigger

Use this skill when:
- Setting up a local development stack with Docker
- Configuring hot reload / live code reload in containers
- Creating dev vs production Dockerfiles or multi-stage builds
- Running database containers (Postgres, MySQL, Redis, MongoDB) for development
- Setting up VS Code or Cursor devcontainers
- Managing environment variables across dev and prod
- Debugging applications running inside containers
- Creating docker-compose files for full-stack development

## Required Inputs

- Application language/framework (Node.js, Python, Go, etc.)
- Services needed (database, cache, message queue, etc.)
- IDE (VS Code, Cursor, or other)
- Host OS (Windows, macOS, Linux)
- Whether hot reload is needed

## Workflow

1. **Create a dev Dockerfile** - use a multi-stage Dockerfile with a dev target that includes dev dependencies and debugging tools.
2. **Set up docker-compose for development** - define all services (app, database, cache) with dev-friendly settings.
3. **Configure bind mounts** - mount source code from the host into the container for live editing.
4. **Enable hot reload** - configure the framework's file watcher to work with bind-mounted volumes.
5. **Add database containers** - run Postgres, MySQL, Redis, or MongoDB with persistent named volumes.
6. **Set up environment variables** - use `.env` files for local dev, never commit secrets.
7. **Configure devcontainer** - optionally set up `.devcontainer/devcontainer.json` for a full IDE-in-container experience.

## Key References

- [Docker Compose for development](https://docs.docker.com/compose/)
- [Bind mounts](https://docs.docker.com/engine/storage/bind-mounts/)
- [Dev containers specification](https://containers.dev/)
- [VS Code devcontainers](https://code.visualstudio.com/docs/devcontainers/containers)
- [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)

## Example Interaction

**User:** Set up a Node.js dev environment with hot reload and Postgres.

**Agent:** Here's a multi-stage Dockerfile with a dev target:

```dockerfile
# Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

FROM base AS dev
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

FROM base AS prod
RUN npm ci --omit=dev
COPY . .
RUN npm run build
USER node
CMD ["node", "dist/index.js"]
```

And a Compose file for the full dev stack:

```yaml
# docker-compose.yml
services:
  app:
    build:
      context: .
      target: dev
    ports:
      - "3000:3000"
      - "9229:9229"  # Node.js debugger
    volumes:
      - .:/app
      - /app/node_modules  # anonymous volume prevents overwriting
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://devuser:devpass@db:5432/devdb
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: devuser
      POSTGRES_PASSWORD: devpass
      POSTGRES_DB: devdb
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U devuser -d devdb"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  pgdata:
```

The anonymous volume `/app/node_modules` prevents the host bind mount from overwriting the container's `node_modules`. This is critical because native modules compiled inside the container (Linux) won't work on the host (Windows/macOS) and vice versa.

**User:** How do I add Redis and MongoDB to that stack?

**Agent:**

```yaml
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: devuser
      MONGO_INITDB_ROOT_PASSWORD: devpass
    volumes:
      - mongodata:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  pgdata:
  redisdata:
  mongodata:
```

Update your app environment variables:

```yaml
    environment:
      - REDIS_URL=redis://redis:6379
      - MONGO_URL=mongodb://devuser:devpass@mongo:27017/devdb?authSource=admin
```

**User:** How do I set up a devcontainer for Cursor/VS Code?

**Agent:** Create `.devcontainer/devcontainer.json`:

```json
{
  "name": "My Project Dev",
  "dockerComposeFile": "../docker-compose.yml",
  "service": "app",
  "workspaceFolder": "/app",
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "ms-azuretools.vscode-docker"
      ],
      "settings": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode"
      }
    }
  },
  "forwardPorts": [3000, 5432, 6379],
  "postCreateCommand": "npm install",
  "remoteUser": "node"
}
```

Or use a standalone Dockerfile-based devcontainer:

```json
{
  "name": "Node.js Dev",
  "build": {
    "dockerfile": "Dockerfile",
    "context": ".."
  },
  "features": {
    "ghcr.io/devcontainers/features/git:1": {},
    "ghcr.io/devcontainers/features/github-cli:1": {},
    "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },
  "forwardPorts": [3000],
  "postCreateCommand": "npm install",
  "remoteUser": "node"
}
```

With its Dockerfile at `.devcontainer/Dockerfile`:

```dockerfile
FROM mcr.microsoft.com/devcontainers/javascript-node:20
RUN npm install -g npm@latest
```

**User:** How do I handle environment variables across dev and prod?

**Agent:** Use a `.env` file for local development, never committed to git:

```bash
# .env (add to .gitignore)
DATABASE_URL=postgresql://devuser:devpass@db:5432/devdb
REDIS_URL=redis://redis:6379
JWT_SECRET=dev-secret-not-for-production
LOG_LEVEL=debug
```

Reference it in Compose:

```yaml
services:
  app:
    env_file:
      - .env
```

Provide a template for other developers:

```bash
# .env.example (committed to git)
DATABASE_URL=postgresql://user:password@db:5432/mydb
REDIS_URL=redis://redis:6379
JWT_SECRET=change-me
LOG_LEVEL=info
```

For production, inject secrets via your orchestrator (Kubernetes secrets, ECS task definitions, Docker Swarm secrets) - never bake them into images.

**User:** How do I debug a Node.js app inside a container?

**Agent:** Expose the debug port and attach your IDE:

```yaml
  app:
    command: ["node", "--inspect=0.0.0.0:9229", "src/index.js"]
    ports:
      - "3000:3000"
      - "9229:9229"
```

In VS Code / Cursor, add a launch configuration:

```json
{
  "type": "node",
  "request": "attach",
  "name": "Docker: Attach",
  "port": 9229,
  "address": "localhost",
  "localRoot": "${workspaceFolder}",
  "remoteRoot": "/app",
  "restart": true
}
```

For Python with debugpy:

```yaml
  app:
    command: ["python", "-m", "debugpy", "--listen", "0.0.0.0:5678", "--wait-for-client", "app.py"]
    ports:
      - "5678:5678"
```

## MCP Usage

| Tool | Purpose |
|------|---------|
| `docker_listContainers` | Check which dev services are running and their status |
| `docker_containerLogs` | Read logs from dev containers to debug application errors |
| `docker_inspectContainer` | Check bind mounts, environment variables, and port mappings |
| `docker_listVolumes` | Verify named volumes for database persistence |
| `docker_listNetworks` | Check that dev services can communicate on the same network |
| `docker_listImages` | See local dev images and their sizes |
| `docker_diskUsage` | Monitor disk usage from dev images and volumes |

**Verifying dev environment setup:**
```
1. docker_listContainers - confirm all services are running (app, db, redis)
2. docker_containerLogs on each - check for startup errors
3. docker_inspectContainer on app - verify:
   - Mounts include the source code bind mount
   - Environment variables are set correctly
   - Ports are mapped (3000, 9229 for debug)
4. docker_listNetworks - confirm services share a network
5. docker_listVolumes - confirm database volumes exist for persistence
```

**Debugging a service that won't start:**
```
1. docker_listContainers (all=true) - find the crashed container
2. docker_containerLogs - read the error output
3. docker_inspectContainer - check State.ExitCode and depends_on health
4. docker_inspectContainer on dependency (db) - verify it's healthy
```

## Common Pitfalls

- **node_modules from host overwriting container** - a bind mount of `.:/app` replaces the container's `node_modules` with the host's. Use an anonymous volume (`/app/node_modules`) to preserve the container's copy.
- **File watchers not detecting changes** - on Docker Desktop (macOS/Windows), filesystem events may be delayed or missing. Use polling mode in your framework's watcher (e.g., `CHOKIDAR_USEPOLLING=true` for webpack, `WATCHPACK_POLLING=true` for Next.js).
- **Database data lost on rebuild** - use named volumes (`pgdata:/var/lib/postgresql/data`), not bind mounts to random directories. Named volumes survive `docker compose down` (but not `docker compose down -v`).
- **Port collisions with host services** - if Postgres is running on the host and in Docker, both can't bind to 5432. Stop the host service or remap: `5433:5432`.
- **Stale containers after Compose file changes** - run `docker compose up --build --force-recreate` after changing the Compose file or Dockerfile.
- **Slow bind mount performance on macOS** - Docker Desktop for macOS has slower file I/O on bind mounts. Use the VirtioFS file sharing backend (default in newer versions) or move heavy I/O (like `node_modules`) to named volumes.
- **Missing .env file** - Compose silently ignores a missing `.env` file referenced by `env_file`. This causes undefined variables at runtime with no error during startup.
- **Running dev tools in production images** - keep dev dependencies (debuggers, test frameworks, hot reload) in a dev stage. The production stage should only include runtime dependencies.
- **Hardcoded localhost in app config** - inside a container, `localhost` refers to the container itself, not the host. Use Docker DNS names (`db`, `redis`) from the Compose service names.
- **Not using health checks on dependencies** - without `healthcheck` and `depends_on.condition: service_healthy`, your app may start before the database is ready.

## See Also

- [Docker Compose Helper](../docker-compose-helper/SKILL.md)
- [Docker Volumes](../docker-volumes/SKILL.md)
- [Container Debugging](../container-debugging/SKILL.md)
- [Dockerfile Best Practices](../dockerfile-best-practices/SKILL.md)
