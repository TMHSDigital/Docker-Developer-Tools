# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-03-29

### Added

#### MCP Server - Docker Compose Tools (+8, total 36)
- `docker_composeUp` - create and start Compose services (detached, build, pull, profiles, force-recreate)
- `docker_composeDown` - stop and remove containers, networks, optionally volumes and images
- `docker_composePs` - list containers for a Compose project (JSON output)
- `docker_composeLogs` - view logs for Compose services (tail, since, timestamps)
- `docker_composeBuild` - build or rebuild Compose service images (no-cache, pull)
- `docker_composeRestart` - restart Compose services with optional timeout
- `docker_composePull` - pull images for Compose services
- `docker_composeExec` - execute a command in a running Compose service container (user, workdir, env)

#### npm Publishing
- Published `@tmhs/docker-mcp` to npm registry
- Added GitHub Actions workflow for automated npm publishing on release
- Added dedicated npm package README with installation and configuration guide

---

## [0.3.0] - 2026-03-29

### Added

#### MCP Server - Image and Build Tools (+8, total 28)
- `docker_pull` - pull an image or repository from a registry (with platform and all-tags options)
- `docker_push` - push an image or repository to a registry (with all-tags option)
- `docker_build` - build an image from a Dockerfile and context (tags, build-args, target, no-cache, platform)
- `docker_tag` - create a tag that refers to a source image
- `docker_rmi` - remove one or more images (with force and no-prune options)
- `docker_commit` - create a new image from a container's changes (with message, author, pause options)
- `docker_save` - save one or more images to a tar archive
- `docker_load` - load images from a tar archive

---

## [0.2.0] - 2026-03-29

### Added

#### MCP Server - Container Lifecycle Tools (+10, total 20)
- `docker_run` - create and start a container from an image (detached, with ports, env, volumes, network, labels, restart policy)
- `docker_create` - create a container without starting it
- `docker_start` - start a stopped container
- `docker_stop` - stop a running container with optional grace period
- `docker_restart` - restart a container with optional grace period
- `docker_kill` - send a signal to a running container (default: SIGKILL)
- `docker_rm` - remove a container (with optional force and volume removal)
- `docker_pause` - pause all processes in a running container
- `docker_unpause` - unpause a paused container
- `docker_exec` - execute a command in a running container (with workdir, user, and env options)

#### Documentation
- Comprehensive roadmap rewrite with 59 planned MCP tools across v0.2.0 through v0.7.0
- Safety considerations section for destructive tools (dry-run defaults, explicit identifiers)

### Changed
- Bumped `docker_diskUsage` timeout from 30s to 120s for large Docker installs

---

## [0.1.0] - 2026-03-29

### Added

#### Plugin
- Plugin manifest (`.cursor-plugin/plugin.json`) with 12 skills, 6 rules, 10 MCP tools
- Example MCP configuration (`mcp.json`) for Cursor integration

#### MCP Server (10 tools)
- `docker_listContainers` - list running or all containers with status, ports, and names
- `docker_inspectContainer` - detailed container inspection (config, networking, mounts, state)
- `docker_containerLogs` - fetch recent logs with tail, since, and timestamp options
- `docker_listImages` - list local images with tags, sizes, and creation dates
- `docker_inspectImage` - detailed image metadata (layers, env, entrypoint, labels)
- `docker_listVolumes` - list volumes with driver and mount info
- `docker_listNetworks` - list networks with driver and scope
- `docker_systemInfo` - Docker system info (version, OS, storage driver, resource limits)
- `docker_diskUsage` - disk usage breakdown (images, containers, volumes, build cache)
- `docker_searchHub` - search Docker Hub for images by name
- Shared utilities: `execDocker()`, `checkDockerAvailable()`, `errorResponse()`, `parseJsonLines()`
- Custom error classes: `DockerError`, `DockerNotFoundError`, `DockerNotRunningError`, `ContainerNotFoundError`, `ImageNotFoundError`, `PermissionDeniedError`

#### Skills (12)
- `dockerfile-best-practices` - write and optimize Dockerfiles
- `docker-compose-helper` - write, debug, and optimize compose files
- `container-debugging` - debug running containers
- `image-optimization` - reduce Docker image sizes
- `docker-networking` - container networking configuration
- `docker-volumes` - data persistence and volume management
- `docker-security` - container security hardening
- `docker-ci-cd` - Docker in CI/CD pipelines
- `docker-registry` - container registry workflows
- `docker-troubleshooting` - common Docker problem diagnosis
- `docker-development-env` - development environments with Docker
- `docker-resource-management` - resource limits and monitoring

#### Rules (6)
- `dockerfile-lint` - flag Dockerfile antipatterns
- `docker-secrets` - flag hardcoded credentials (global, always active)
- `compose-validation` - flag compose file issues
- `docker-resource-limits` - flag missing resource limits
- `docker-image-pinning` - flag unpinned image tags
- `docker-port-conflicts` - flag commonly conflicting ports

#### Documentation
- README with badges, mermaid architecture diagram, feature tables, and installation guide
- ROADMAP with themed release plan (v0.1.0 through v1.0.0)
- CLAUDE.md project documentation
- CONTRIBUTING.md with skill and rule templates
- CODE_OF_CONDUCT.md (Contributor Covenant 2.1)
- SECURITY.md with reporting guidelines
- GitHub Pages landing site

#### CI/CD
- Plugin structure validation workflow
- MCP server build and test workflow (Node 20/22 matrix)
- GitHub Pages deployment workflow
- Release drafter workflow
- Stale issue management workflow
- Monthly link checker workflow

#### Testing
- Python test suite: plugin manifest, skills, rules, docs consistency, internal links, roadmap
- Vitest test suite: error classes, docker-api utilities, input validation

[0.4.0]: https://github.com/TMHSDigital/Docker-Developer-Tools/releases/tag/v0.4.0
[0.3.0]: https://github.com/TMHSDigital/Docker-Developer-Tools/releases/tag/v0.3.0
[0.2.0]: https://github.com/TMHSDigital/Docker-Developer-Tools/releases/tag/v0.2.0
[0.1.0]: https://github.com/TMHSDigital/Docker-Developer-Tools/releases/tag/v0.1.0
