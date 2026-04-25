# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.3] - 2026-04-25

See [release notes](https://github.com/TMHSDigital/Docker-Developer-Tools/releases/tag/v1.3.3) for details.

## [1.3.2] - 2026-04-25

See [release notes](https://github.com/TMHSDigital/Docker-Developer-Tools/releases/tag/v1.3.2) for details.

## [1.3.1] - 2026-04-25

See [release notes](https://github.com/TMHSDigital/Docker-Developer-Tools/releases/tag/v1.3.1) for details.

## [1.3.0] - 2026-04-25

See [release notes](https://github.com/TMHSDigital/Docker-Developer-Tools/releases/tag/v1.3.0) for details.

## [Versions 1.0.1 through 1.2.x] - prior to 2026-04-25

Multiple patch and minor releases shipped between v1.0.0 and v1.3.0
without CHANGELOG entries due to release-doc-sync automation
not yet existing. See [GitHub releases](https://github.com/TMHSDigital/Docker-Developer-Tools/releases)
for the complete release history.

Going forward, release-doc-sync@v1.0 from
[TMHSDigital/Developer-Tools-Directory](https://github.com/TMHSDigital/Developer-Tools-Directory)
automatically maintains this file on each auto-release.

## [1.0.0] - 2026-03-29

### Changed

#### MCP Server - Enhanced Error Messages
- `errorResponse` now includes error type prefix, the Docker command that failed, and actionable fix suggestions
- Each error class (DockerNotFound, DockerNotRunning, ContainerNotFound, ImageNotFound, VolumeNotFound, NetworkNotFound, PermissionDenied) returns a targeted suggestion pointing to the relevant MCP tool or fix

#### Skills - Workflow Diagrams
- Added mermaid workflow diagrams to `docker-context-management`, `docker-image-signing`, and `docker-swarm` skills

#### Tests - Tool Export Smoke Test
- New integration test (`tool-exports.test.ts`) verifies all 150 tool files export a `register` function

#### Documentation - Full Sweep
- Fixed skill count (15 to 17) and rule count (9 to 10) in README.md
- Fixed tool count (140 to 150) in mcp-server/README.md
- GH Pages site overhaul: removed all emojis, replaced with SVG icons and CSS; added tool search/filter with `/` keyboard shortcut; added back-to-top button; added active nav highlighting via IntersectionObserver; fixed skills accordion (added 5 missing skills); added `swarm-security` rule card; fixed all timeline release tags; updated all counts and version references

---

## [0.12.0] - 2026-03-29

### Added

#### MCP Server - Niche, Scout, and Extras (+10, total 150)
- `docker_version` - show Docker client and server version information (JSON format)
- `docker_composeVersion` - show Docker Compose version information (JSON format)
- `docker_composeWatch` - watch build context for Compose services and auto-rebuild on file changes (120s timeout)
- `docker_scoutQuickview` - quick overview of image vulnerabilities using Docker Scout (requires Docker Desktop, 120s timeout)
- `docker_scoutCves` - list CVEs found in an image with optional severity and only-fixed filters (120s timeout)
- `docker_scoutRecommendations` - get base image update recommendations using Docker Scout (120s timeout)
- `docker_pluginLs` - list installed Docker plugins (JSON format)
- `docker_pluginInstall` - install a Docker plugin from a registry (grant-all-permissions, alias, 120s timeout)
- `docker_pluginRm` - remove one or more Docker plugins (force option)
- `docker_pluginEnable` - enable a disabled Docker plugin

---

## [0.11.0] - 2026-03-29

### Added

#### MCP Server - Swarm Stacks, Configs, Secrets, and Trust (+18, total 140)
- `docker_stackDeploy` - deploy or update a stack from a compose file (with prune, resolve-image, registry auth options, 120s timeout)
- `docker_stackRm` - remove one or more Swarm stacks
- `docker_stackLs` - list Swarm stacks (JSON format)
- `docker_stackPs` - list tasks in a stack with filters (JSON format)
- `docker_stackServices` - list services in a stack with filters (JSON format)
- `docker_stackConfig` - output the final merged configuration for a stack
- `docker_configCreate` - create a Swarm config from a file with optional labels
- `docker_configInspect` - inspect detailed Swarm config information (pretty or JSON)
- `docker_configLs` - list Swarm configs with filters (JSON format)
- `docker_configRm` - remove one or more Swarm configs
- `docker_secretCreate` - create a Swarm secret from a file with optional labels
- `docker_secretInspect` - inspect Swarm secret metadata (pretty or JSON, value not exposed)
- `docker_secretLs` - list Swarm secrets with filters (JSON format)
- `docker_secretRm` - remove one or more Swarm secrets
- `docker_trustInspect` - inspect Docker Content Trust data for an image (signers, signatures, keys)
- `docker_trustSign` - sign an image for Docker Content Trust (local or remote, 120s timeout)
- `docker_trustRevoke` - revoke Docker Content Trust for an image (auto-confirm)
- `docker_trustKey` - manage Docker Content Trust signing keys (generate or load)

#### Skill
- `docker-image-signing` - Docker Content Trust, image signing/verification, key management, CI/CD signing pipelines

## [0.10.0] - 2026-03-29

### Added

#### MCP Server - Swarm Orchestration (+24, total 122)
- `docker_swarmInit` - initialize a new Docker Swarm cluster
- `docker_swarmJoin` - join an existing Swarm as worker or manager node
- `docker_swarmLeave` - leave the Docker Swarm
- `docker_swarmJoinToken` - display or rotate join tokens for worker or manager nodes
- `docker_swarmUpdate` - update Swarm configuration (task history, cert expiry, autolock)
- `docker_swarmUnlock` - unlock a locked Swarm manager node (secure stdin key piping)
- `docker_swarmUnlockKey` - display or rotate the Swarm unlock key
- `docker_swarmCa` - display and rotate the cluster root CA certificate (120s timeout)
- `docker_serviceCreate` - create a replicated or global Swarm service with ports, env, mounts, networks, constraints, and resource limits (120s timeout)
- `docker_serviceUpdate` - rolling update of service image, replicas, env, labels, and resources (120s timeout)
- `docker_serviceRm` - remove one or more Swarm services
- `docker_serviceLs` - list Swarm services with optional filters (JSON format)
- `docker_serviceInspect` - inspect detailed service configuration (pretty or JSON)
- `docker_serviceLogs` - fetch service or task logs with tail, since, and timestamp options
- `docker_servicePs` - list tasks of a service with filters (JSON format)
- `docker_serviceScale` - scale one or more services to target replica count (120s timeout)
- `docker_serviceRollback` - revert a service to its previous configuration (120s timeout)
- `docker_nodeLs` - list nodes in the Swarm with filters (JSON format)
- `docker_nodeInspect` - inspect detailed node information (pretty or JSON)
- `docker_nodePs` - list tasks running on a node with filters (JSON format)
- `docker_nodeRm` - remove one or more nodes from the Swarm
- `docker_nodeUpdate` - update node availability (active/pause/drain), role, and labels
- `docker_nodePromote` - promote worker nodes to manager
- `docker_nodeDemote` - demote manager nodes to worker

#### Skill
- `docker-swarm` - Swarm mode orchestration covering cluster init, service deployment, scaling, rolling updates, node management, and drain/failover patterns

#### Rule
- `swarm-security` - flag missing autolock, unrotated certificates, unencrypted overlay networks, exposed manager ports, missing resource limits on services, join tokens in code, and missing healthchecks

## [0.9.0] - 2026-03-29

### Added

#### MCP Server - Container/Image Gaps, Context, and Auth (+14, total 98)
- `docker_diff` - inspect filesystem changes in a container (added, changed, deleted files)
- `docker_export` - export a container's filesystem as a tar archive (with 300s timeout for large filesystems)
- `docker_port` - list port mappings or a specific mapping for a container (tcp/udp protocol)
- `docker_rename` - rename a Docker container
- `docker_imageHistory` - show layer history of an image with commands, sizes, and timestamps (JSON format, no-trunc option)
- `docker_import` - import a tarball to create a filesystem image (with Dockerfile change instructions, 300s timeout)
- `docker_contextCreate` - create a Docker context for connecting to remote hosts (SSH, TCP endpoints)
- `docker_contextLs` - list available Docker contexts (JSON format)
- `docker_contextInspect` - display detailed information on a Docker context
- `docker_contextRm` - remove one or more Docker contexts (with force option)
- `docker_contextUse` - set the current active Docker context
- `docker_contextShow` - print the name of the current Docker context
- `docker_login` - authenticate to a container registry (password piped via stdin for security)
- `docker_logout` - log out from a container registry

#### Plugin
- `docker-context-management` skill - managing remote Docker hosts, SSH contexts, TLS contexts, multi-host workflows, context switching patterns

---

## [0.8.0] - 2026-03-29

### Added

#### MCP Server - Compose Completeness (+16, total 84)
- `docker_composeConfig` - validate, resolve, and render a Compose file in canonical format (yaml/json output)
- `docker_composeCp` - copy files between a Compose service container and the local filesystem (archive, index options)
- `docker_composeCreate` - create Compose service containers without starting them (build, force-recreate, pull policy)
- `docker_composeEvents` - receive real-time events from Compose containers (JSON format, service filter)
- `docker_composeImages` - list images used by Compose service containers (JSON format)
- `docker_composeKill` - force stop Compose service containers with configurable signal
- `docker_composeLs` - list running Compose projects (all, filter options)
- `docker_composePause` - pause Compose services
- `docker_composeUnpause` - unpause Compose services
- `docker_composePort` - print the public port for a Compose service port binding (tcp/udp protocol)
- `docker_composeRm` - remove stopped Compose service containers (stop, volumes options)
- `docker_composeRun` - run a one-off command on a Compose service (rm, detach, user, env, workdir, no-deps)
- `docker_composeScale` - scale Compose services to a specified replica count via up --scale
- `docker_composeStart` - start existing Compose service containers
- `docker_composeStop` - stop Compose services without removing containers (timeout option)
- `docker_composeTop` - display running processes in Compose service containers

#### Plugin
- `compose-scaling` rule - flag scaling blockers: container_name preventing replicas, fixed host ports, missing resource limits, missing restart policy

---

## [0.7.0] - 2026-03-29

### Added

#### MCP Server - Buildx and Manifest Tools (+13, total 68)
- `docker_buildxBuild` - multi-platform builds with buildx (cache export, provenance, push/load, platform targeting)
- `docker_buildxLs` - list buildx builder instances
- `docker_buildxCreate` - create a new buildx builder instance (driver, platform, buildkitd flags)
- `docker_buildxRm` - remove a buildx builder instance (force, all-inactive options)
- `docker_buildxInspect` - inspect a buildx builder instance (with optional bootstrap)
- `docker_buildxUse` - set the default buildx builder instance
- `docker_buildxImagetools` - inspect or create multi-platform manifest lists via buildx imagetools
- `docker_builderPrune` - remove buildx build cache (all, filter, keep-storage options)
- `docker_manifestCreate` - create a local manifest list for multi-architecture images
- `docker_manifestInspect` - display an image manifest or manifest list (verbose option)
- `docker_manifestAnnotate` - add platform information (os, arch, variant) to a manifest list entry
- `docker_manifestPush` - push a manifest list to a registry (with optional purge)
- `docker_manifestRm` - remove local manifest lists

#### Plugin
- `docker-multi-platform` skill - multi-arch builds, buildx builder configuration, manifest lists, platform targeting, cross-compilation patterns
- `buildx-best-practices` rule - flag multi-platform build issues, missing cache configuration, architecture-specific hardcoding, missing provenance

---

## [0.6.0] - 2026-03-29

### Added

#### MCP Server - Advanced and Observability Tools (+6, total 55)
- `docker_cp` - copy files or directories between a container and the local filesystem (archive, follow-link options)
- `docker_stats` - show live resource usage statistics for containers (CPU, memory, network I/O)
- `docker_top` - show running processes in a container (with optional ps arguments)
- `docker_events` - stream real-time events from the Docker daemon (since, until, filter options)
- `docker_update` - update container resource configuration live (CPU, memory, restart policy)
- `docker_wait` - block until a container stops and return its exit code

#### Plugin
- `docker-advanced-workflows` skill - multi-stage pipelines, sidecar patterns, healthchecks, init containers, signal handling, graceful shutdown
- `docker-logging` rule - flag missing logging drivers and log rotation settings in Docker and Compose files

### Changed
- Updated npm publish workflow to use OIDC trusted publishers (no NPM_TOKEN secret needed)

---

## [0.5.0] - 2026-03-29

### Added

#### MCP Server - Volume Management Tools (+4)
- `docker_volumeCreate` - create a named volume with optional driver, labels, and driver options
- `docker_volumeRm` - remove one or more volumes (with optional force)
- `docker_volumeInspect` - display detailed volume information
- `docker_volumePrune` - remove all unused volumes (non-interactive, with optional all flag and filter)

#### MCP Server - Network Management Tools (+6)
- `docker_networkCreate` - create a network with driver, subnet, gateway, ip-range, internal, and labels
- `docker_networkRm` - remove one or more networks (with optional force)
- `docker_networkConnect` - connect a container to a network (with optional IP and aliases)
- `docker_networkDisconnect` - disconnect a container from a network (with optional force)
- `docker_networkInspect` - display detailed network information
- `docker_networkPrune` - remove all unused networks (non-interactive, with optional filter)

#### MCP Server - Cleanup / Prune Tools (+3, total 49)
- `docker_systemPrune` - remove unused containers, networks, images, and optionally volumes (non-interactive)
- `docker_containerPrune` - remove all stopped containers (non-interactive, with optional filter)
- `docker_imagePrune` - remove dangling or unused images (non-interactive, with optional all flag and filter)

#### Error Handling
- Added `VolumeNotFoundError` and `NetworkNotFoundError` custom error classes
- Added stderr detection for "No such volume" and "No such network" messages in `execDocker()`

---

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
- Comprehensive roadmap rewrite with ~150 planned MCP tools across v0.2.0 through v0.12.0
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

[0.11.0]: https://github.com/TMHSDigital/Docker-Developer-Tools/releases/tag/v0.11.0
[0.10.0]: https://github.com/TMHSDigital/Docker-Developer-Tools/releases/tag/v0.10.0
[0.9.0]: https://github.com/TMHSDigital/Docker-Developer-Tools/releases/tag/v0.9.0
[0.8.0]: https://github.com/TMHSDigital/Docker-Developer-Tools/releases/tag/v0.8.0
[0.7.0]: https://github.com/TMHSDigital/Docker-Developer-Tools/releases/tag/v0.7.0
[0.6.0]: https://github.com/TMHSDigital/Docker-Developer-Tools/releases/tag/v0.6.0
[0.5.0]: https://github.com/TMHSDigital/Docker-Developer-Tools/releases/tag/v0.5.0
[0.4.0]: https://github.com/TMHSDigital/Docker-Developer-Tools/releases/tag/v0.4.0
[0.3.0]: https://github.com/TMHSDigital/Docker-Developer-Tools/releases/tag/v0.3.0
[0.2.0]: https://github.com/TMHSDigital/Docker-Developer-Tools/releases/tag/v0.2.0
[0.1.0]: https://github.com/TMHSDigital/Docker-Developer-Tools/releases/tag/v0.1.0
