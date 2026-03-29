# CLAUDE.md

Project documentation for Claude Code and AI assistants working on this repository.

## Project Overview

Docker Developer Tools is a Cursor IDE plugin that integrates Docker and container workflows into Cursor's AI chat. It includes 14 skills, 8 rules, and a companion MCP server with 68 tools for live Docker CLI integration.

This is a monorepo - the Cursor plugin (skills and rules) and the companion MCP server live in the same repository. Docker's API is local (Docker Engine socket / CLI), so one repo is simpler for users to install and maintain.

**Version:** 0.7.0
**License:** CC-BY-NC-ND-4.0
**Author:** TMHSDigital

## Plugin Architecture

```
Docker-Developer-Tools/
  .cursor-plugin/
    plugin.json              # Plugin manifest
  skills/
    <skill-name>/
      SKILL.md               # One skill per directory
  rules/
    <rule-name>.mdc           # Rule files
  mcp-server/
    src/
      index.ts               # MCP server entry point
      tools/                 # One file per MCP tool
      utils/
        docker-api.ts        # Docker CLI helpers
        errors.ts            # Custom error classes
  docs/
    index.html               # GitHub Pages site
  tests/                     # Python structure tests
```

## Skills (14)

| Skill | Description |
|-------|-------------|
| `dockerfile-best-practices` | Write and optimize Dockerfiles |
| `docker-compose-helper` | Write, debug, and optimize compose files |
| `container-debugging` | Debug running containers |
| `image-optimization` | Reduce Docker image sizes |
| `docker-networking` | Container networking configuration |
| `docker-volumes` | Data persistence and volume management |
| `docker-security` | Container security hardening |
| `docker-ci-cd` | Docker in CI/CD pipelines |
| `docker-registry` | Container registry workflows |
| `docker-troubleshooting` | Common Docker problem diagnosis |
| `docker-development-env` | Development environments with Docker |
| `docker-resource-management` | Resource limits and monitoring |
| `docker-advanced-workflows` | Multi-stage pipelines, sidecar patterns, healthchecks, signal handling |
| `docker-multi-platform` | Multi-arch builds, buildx configuration, manifest lists, platform targeting |

## Rules (8)

| Rule | Scope | Description |
|------|-------|-------------|
| `dockerfile-lint` | `**/Dockerfile*` | Flag Dockerfile antipatterns |
| `docker-secrets` | Global (always active) | Flag hardcoded credentials |
| `compose-validation` | `**/docker-compose*.yml`, `**/compose*.yml` | Flag compose issues |
| `docker-resource-limits` | Docker-related files | Flag missing resource limits |
| `docker-image-pinning` | Dockerfiles, compose files | Flag unpinned image tags |
| `docker-port-conflicts` | Dockerfiles, compose files | Flag port conflicts |
| `docker-logging` | Dockerfiles, compose files | Flag missing logging drivers and log rotation |
| `buildx-best-practices` | Dockerfiles, compose files | Flag multi-platform build issues, missing cache config |

## MCP Server (68 tools)

The MCP server talks to Docker via CLI exec (`docker` commands) rather than the Docker Engine REST API. It uses stdio transport and requires `docker` to be available on PATH.

### Read / Inspect (10)

| Tool | Description |
|------|-------------|
| `docker_listContainers` | List running/all containers |
| `docker_inspectContainer` | Detailed container info |
| `docker_containerLogs` | Fetch container logs |
| `docker_listImages` | List local images |
| `docker_inspectImage` | Detailed image metadata |
| `docker_listVolumes` | List volumes |
| `docker_listNetworks` | List networks |
| `docker_systemInfo` | Docker system info |
| `docker_diskUsage` | Disk usage breakdown |
| `docker_searchHub` | Search Docker Hub |

### Container Lifecycle (10)

| Tool | Description |
|------|-------------|
| `docker_run` | Create and start a container from an image |
| `docker_create` | Create a container without starting it |
| `docker_start` | Start a stopped container |
| `docker_stop` | Stop a running container |
| `docker_restart` | Restart a container |
| `docker_kill` | Send a signal to a running container |
| `docker_rm` | Remove a container |
| `docker_pause` | Pause all processes in a container |
| `docker_unpause` | Unpause a paused container |
| `docker_exec` | Execute a command in a running container |

### Image and Build (8)

| Tool | Description |
|------|-------------|
| `docker_pull` | Pull an image from a registry |
| `docker_push` | Push an image to a registry |
| `docker_build` | Build an image from a Dockerfile |
| `docker_tag` | Tag an image with a new name/tag |
| `docker_rmi` | Remove one or more images |
| `docker_commit` | Create image from container changes |
| `docker_save` | Save images to a tar archive |
| `docker_load` | Load images from a tar archive |

### Compose (8)

| Tool | Description |
|------|-------------|
| `docker_composeUp` | Create and start Compose services (detached) |
| `docker_composeDown` | Stop and remove containers, networks, volumes, images |
| `docker_composePs` | List containers for a Compose project |
| `docker_composeLogs` | View logs for Compose services |
| `docker_composeBuild` | Build or rebuild Compose service images |
| `docker_composeRestart` | Restart Compose services |
| `docker_composePull` | Pull images for Compose services |
| `docker_composeExec` | Execute a command in a running Compose service |

### Volume Management (4)

| Tool | Description |
|------|-------------|
| `docker_volumeCreate` | Create a named volume with driver and labels |
| `docker_volumeRm` | Remove one or more volumes |
| `docker_volumeInspect` | Display detailed volume information |
| `docker_volumePrune` | Remove all unused volumes |

### Network Management (6)

| Tool | Description |
|------|-------------|
| `docker_networkCreate` | Create a network (bridge, overlay, macvlan) |
| `docker_networkRm` | Remove one or more networks |
| `docker_networkConnect` | Connect a container to a network |
| `docker_networkDisconnect` | Disconnect a container from a network |
| `docker_networkInspect` | Display detailed network information |
| `docker_networkPrune` | Remove all unused networks |

### Cleanup / Prune (3)

| Tool | Description |
|------|-------------|
| `docker_systemPrune` | Remove unused containers, networks, images, volumes |
| `docker_containerPrune` | Remove all stopped containers |
| `docker_imagePrune` | Remove dangling or unused images |

### Advanced / Observability (6)

| Tool | Description |
|------|-------------|
| `docker_cp` | Copy files between container and host |
| `docker_stats` | Live resource usage (CPU, memory, net I/O) |
| `docker_top` | Running processes in a container |
| `docker_events` | Real-time Docker daemon events |
| `docker_update` | Update container resource config live |
| `docker_wait` | Block until container stops, return exit code |

### Buildx (8)

| Tool | Description |
|------|-------------|
| `docker_buildxBuild` | Multi-platform builds with cache export and provenance |
| `docker_buildxLs` | List builder instances |
| `docker_buildxCreate` | Create a new builder instance |
| `docker_buildxRm` | Remove a builder instance |
| `docker_buildxInspect` | Inspect a builder instance |
| `docker_buildxUse` | Set the default builder instance |
| `docker_buildxImagetools` | Inspect or create manifest lists via buildx |
| `docker_builderPrune` | Remove build cache |

### Manifest (5)

| Tool | Description |
|------|-------------|
| `docker_manifestCreate` | Create a local manifest list for multi-arch images |
| `docker_manifestInspect` | Display an image manifest or manifest list |
| `docker_manifestAnnotate` | Add platform info to a manifest list entry |
| `docker_manifestPush` | Push a manifest list to a registry |
| `docker_manifestRm` | Remove local manifest lists |

## Development Workflow

### Plugin development (symlink)

**macOS/Linux:**
```bash
ln -s "$(pwd)" ~/.cursor/plugins/docker-developer-tools
```

**Windows (PowerShell as Admin):**
```powershell
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.cursor\plugins\docker-developer-tools" -Target (Get-Location)
```

### MCP server development

```bash
cd mcp-server
npm install
npm run build
npm test
npm run dev  # watch mode
```

### Running tests

```bash
# MCP server tests (Vitest)
cd mcp-server && npm test

# Plugin structure tests (pytest)
pip install -r requirements-test.txt
pytest tests/ -v --tb=short
```

## Release Checklist

When bumping a version, update ALL of these (they must stay in sync):

| File | What to update |
|------|---------------|
| `.cursor-plugin/plugin.json` | `version`, tool count in `description` |
| `mcp-server/package.json` | `version`, `description` |
| `mcp-server/src/index.ts` | `version` in `McpServer` constructor |
| `README.md` | Version badge, tagline tool count, tools table |
| `CLAUDE.md` | Version, tool count, tool tables, CLI quick reference |
| `CHANGELOG.md` | New version section with Added/Changed/Fixed |
| `ROADMAP.md` | Mark new version `(current)`, previous `Released`, update Completed |
| `docs/index.html` | Meta tags, hero pill, stats counter, tools table, roadmap timeline |

After all updates: re-run tests (some validate doc consistency), commit, tag, push, create GitHub release, update repo description.

Full checklist with copy-paste commands: [CONTRIBUTING.md - Release Checklist](CONTRIBUTING.md#release-checklist)

## Key Conventions

- **No em dashes.** Use regular dashes (-) or rewrite the sentence.
- **No hardcoded credentials.** Always use environment variables or Docker secrets.
- **Skill frontmatter:** `name` (matching directory) and `description` only.
- **Rule frontmatter:** `description`, `alwaysApply`, and `globs` (when scoped).
- **Tool naming:** `docker_camelCase` (e.g., `docker_listContainers`).
- **Tool pattern:** Each file exports `register(server: McpServer)`.
- **ESM imports:** Use `.js` extensions for TypeScript ESM resolution.
- **Docker interaction:** All via `execDocker()` helper, never direct REST API.

## Docker CLI Quick Reference

| Command | Used By |
|---------|---------|
| `docker ps --format json` | `docker_listContainers` |
| `docker inspect --type container` | `docker_inspectContainer` |
| `docker logs --tail N` | `docker_containerLogs` |
| `docker images --format json` | `docker_listImages` |
| `docker inspect --type image` | `docker_inspectImage` |
| `docker volume ls --format json` | `docker_listVolumes` |
| `docker network ls --format json` | `docker_listNetworks` |
| `docker info --format json` | `docker_systemInfo` |
| `docker system df --format json` | `docker_diskUsage` |
| `docker search --format json` | `docker_searchHub` |
| `docker run -d` | `docker_run` |
| `docker create` | `docker_create` |
| `docker start` | `docker_start` |
| `docker stop` | `docker_stop` |
| `docker restart` | `docker_restart` |
| `docker kill` | `docker_kill` |
| `docker rm` | `docker_rm` |
| `docker pause` | `docker_pause` |
| `docker unpause` | `docker_unpause` |
| `docker exec` | `docker_exec` |
| `docker pull` | `docker_pull` |
| `docker push` | `docker_push` |
| `docker build` | `docker_build` |
| `docker tag` | `docker_tag` |
| `docker rmi` | `docker_rmi` |
| `docker commit` | `docker_commit` |
| `docker save -o` | `docker_save` |
| `docker load -i` | `docker_load` |
| `docker compose up -d` | `docker_composeUp` |
| `docker compose down` | `docker_composeDown` |
| `docker compose ps --format json` | `docker_composePs` |
| `docker compose logs` | `docker_composeLogs` |
| `docker compose build` | `docker_composeBuild` |
| `docker compose restart` | `docker_composeRestart` |
| `docker compose pull` | `docker_composePull` |
| `docker compose exec` | `docker_composeExec` |
| `docker volume create` | `docker_volumeCreate` |
| `docker volume rm` | `docker_volumeRm` |
| `docker volume inspect` | `docker_volumeInspect` |
| `docker volume prune -f` | `docker_volumePrune` |
| `docker network create` | `docker_networkCreate` |
| `docker network rm` | `docker_networkRm` |
| `docker network connect` | `docker_networkConnect` |
| `docker network disconnect` | `docker_networkDisconnect` |
| `docker network inspect` | `docker_networkInspect` |
| `docker network prune -f` | `docker_networkPrune` |
| `docker system prune -f` | `docker_systemPrune` |
| `docker container prune -f` | `docker_containerPrune` |
| `docker image prune -f` | `docker_imagePrune` |
| `docker cp` | `docker_cp` |
| `docker stats --no-stream --format json` | `docker_stats` |
| `docker top` | `docker_top` |
| `docker events --format json` | `docker_events` |
| `docker update` | `docker_update` |
| `docker wait` | `docker_wait` |
| `docker buildx build --platform` | `docker_buildxBuild` |
| `docker buildx ls` | `docker_buildxLs` |
| `docker buildx create` | `docker_buildxCreate` |
| `docker buildx rm` | `docker_buildxRm` |
| `docker buildx inspect` | `docker_buildxInspect` |
| `docker buildx use` | `docker_buildxUse` |
| `docker buildx imagetools` | `docker_buildxImagetools` |
| `docker buildx prune -f` | `docker_builderPrune` |
| `docker manifest create` | `docker_manifestCreate` |
| `docker manifest inspect` | `docker_manifestInspect` |
| `docker manifest annotate` | `docker_manifestAnnotate` |
| `docker manifest push` | `docker_manifestPush` |
| `docker manifest rm` | `docker_manifestRm` |
