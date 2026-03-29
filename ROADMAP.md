# Roadmap

> Docker Developer Tools plugin roadmap. Versions follow semantic versioning.

## Current Status

**v0.9.0** - Container/Image Gaps, Context, and Auth release with 15 skills, 9 rules, and 98 MCP tools.

## Release Plan

| Version | Theme | New MCP Tools | Cumulative | Skills | Rules | Status |
|---------|-------|---------------|------------|--------|-------|--------|
| v0.1.0 | Foundation (read-only) | 10 | 10 | 12 | 6 | Released |
| v0.2.0 | Container Lifecycle | +10 | 20 | +0 | +0 | Released |
| v0.3.0 | Image and Build | +8 | 28 | +0 | +0 | Released |
| v0.4.0 | Compose | +8 | 36 | +1 | +1 | Released |
| v0.5.0 | Volumes, Networks, Cleanup | +13 | 49 | +0 | +0 | Released |
| v0.6.0 | Advanced and Observability | +6 | 55 | +1 | +1 | Released |
| v0.7.0 | Buildx, Manifests, and Registry | +13 | 68 | +1 | +1 | Released |
| v0.8.0 | Compose Completeness | +16 | 84 | +0 | +1 | Released |
| v0.9.0 | Container/Image Gaps, Context, Auth | +14 | 98 | +1 | +0 | (current) |
| v0.10.0 | Swarm Orchestration | +24 | 122 | +1 | +1 | Planned |
| v0.11.0 | Swarm Stacks, Configs, Secrets, Trust | +18 | 140 | +1 | +0 | Planned |
| v0.12.0 | Niche, Scout, and Extras | +10 | 150 | +0 | +0 | Planned |
| v1.0.0 | Stable | +0 | 150 | +0 | +0 | Planned |

---

## v0.1.0 - Foundation

The initial release establishes the core plugin structure and essential Docker workflows. All MCP tools are read-only.

### MCP Tools (10)
- `docker_listContainers` - list running/all containers
- `docker_inspectContainer` - detailed container info
- `docker_containerLogs` - fetch container logs
- `docker_listImages` - list local images
- `docker_inspectImage` - detailed image metadata
- `docker_listVolumes` - list volumes
- `docker_listNetworks` - list networks
- `docker_systemInfo` - Docker system information
- `docker_diskUsage` - disk usage breakdown
- `docker_searchHub` - search Docker Hub

### Skills (12)
- `dockerfile-best-practices` - writing and optimizing Dockerfiles
- `docker-compose-helper` - compose file creation and debugging
- `container-debugging` - debugging running containers
- `image-optimization` - reducing image sizes
- `docker-networking` - container networking configuration
- `docker-volumes` - data persistence and volume management
- `docker-security` - container security hardening
- `docker-ci-cd` - Docker in CI/CD pipelines
- `docker-registry` - container registry workflows
- `docker-troubleshooting` - common problem diagnosis
- `docker-development-env` - development environments with Docker
- `docker-resource-management` - resource limits and monitoring

### Rules (6)
- `dockerfile-lint` - Dockerfile antipattern detection
- `docker-secrets` - credential safety (global)
- `compose-validation` - compose file validation
- `docker-resource-limits` - missing resource limit detection
- `docker-image-pinning` - unpinned tag detection
- `docker-port-conflicts` - port conflict detection

---

## v0.2.0 - Container Lifecycle

The plugin gains the ability to act. Full container lifecycle management from creation through removal.

### MCP Tools (+10)
- `docker_run` - create and start a container from an image (ports, env, mounts, name, detach)
- `docker_create` - create a container without starting it
- `docker_start` - start one or more stopped containers
- `docker_stop` - stop running containers (with optional grace period)
- `docker_restart` - restart one or more containers
- `docker_kill` - send a signal to running containers
- `docker_rm` - remove one or more containers
- `docker_pause` - pause all processes in a container
- `docker_unpause` - unpause a paused container
- `docker_exec` - run a command in a running container

### Skills
- `docker-container-lifecycle` - container state management patterns

---

## v0.3.0 - Image and Build

Complete image pipeline from pulling to building to pushing to cleanup.

### MCP Tools (+8)
- `docker_pull` - pull an image or repository from a registry
- `docker_push` - push an image to a registry
- `docker_build` - build an image from a Dockerfile and context
- `docker_tag` - tag an image with a new name/tag
- `docker_rmi` - remove one or more images
- `docker_commit` - create a new image from a container's changes
- `docker_save` - save images to a tar archive
- `docker_load` - load images from a tar archive

### Skills
- `docker-compose-advanced` - multi-environment compose, profiles, extensions
- `kubernetes-migration` - migrating from Docker Compose to Kubernetes manifests

---

## v0.4.0 - Compose

Full Docker Compose V2 management. Create, control, and tear down multi-service stacks.

### MCP Tools (+8)
- `docker_composeUp` - create and start compose services (build, detach, profiles)
- `docker_composeDown` - stop and remove containers, networks, and optionally volumes/images
- `docker_composePs` - list containers for a compose project
- `docker_composeLogs` - view and follow logs for compose services
- `docker_composeBuild` - build or rebuild compose service images
- `docker_composeRestart` - restart compose services
- `docker_composePull` - pull images for compose services
- `docker_composeExec` - execute a command in a running compose service container

### Skills
- `docker-monitoring` - production monitoring with Prometheus, cAdvisor, Grafana

### Rules
- `compose-security` - security-focused compose validation

---

## v0.5.0 - Volumes, Networks, Cleanup

Infrastructure management and resource cleanup. Create, inspect, connect, and prune volumes, networks, and system resources.

### MCP Tools (+12)
- `docker_volumeCreate` - create a named volume with optional driver and labels
- `docker_volumeRm` - remove one or more volumes
- `docker_volumeInspect` - display detailed volume information
- `docker_volumePrune` - remove all unused local volumes
- `docker_networkCreate` - create a network (bridge, overlay, macvlan)
- `docker_networkRm` - remove one or more networks
- `docker_networkConnect` - connect a container to a network
- `docker_networkDisconnect` - disconnect a container from a network
- `docker_networkInspect` - display detailed network information
- `docker_networkPrune` - remove all unused networks
- `docker_systemPrune` - remove unused containers, networks, images, and optionally volumes
- `docker_containerPrune` - remove all stopped containers
- `docker_imagePrune` - remove dangling or unused images

---

## v0.6.0 - Advanced and Observability

File transfer, live monitoring, and container runtime updates.

### MCP Tools (+6)
- `docker_cp` - copy files or directories between a container and local filesystem
- `docker_stats` - live resource usage (CPU, memory, network I/O)
- `docker_top` - show running processes in a container
- `docker_events` - stream real-time events from the Docker daemon
- `docker_update` - update container resource configuration (CPU, memory, restart policy)
- `docker_wait` - block until a container stops and return its exit code

### Skills
- `docker-advanced-workflows` - multi-stage pipelines, sidecar patterns, health checks

### Rules
- `docker-logging` - logging driver and log rotation validation

---

## v0.7.0 - Buildx, Manifests, and Registry

Extended build capabilities, multi-architecture image manifests, and builder management.

### MCP Tools (+13)

#### Buildx (8)
- `docker_buildxBuild` - multi-platform builds with cache export and provenance
- `docker_buildxLs` - list builder instances
- `docker_buildxCreate` - create a new builder instance
- `docker_buildxRm` - remove a builder instance
- `docker_buildxInspect` - inspect a builder instance
- `docker_buildxUse` - set the default builder instance
- `docker_buildxImagetools` - create and inspect manifest lists via buildx
- `docker_builderPrune` - remove build cache

#### Manifest (5)
- `docker_manifestCreate` - create a local manifest list for multi-arch images
- `docker_manifestInspect` - display an image manifest or manifest list
- `docker_manifestAnnotate` - add platform info to a manifest list entry
- `docker_manifestPush` - push a manifest list to a registry
- `docker_manifestRm` - remove local manifest lists

### Skills
- `docker-multi-platform` - multi-arch builds, manifest lists, platform targeting, buildx patterns

### Rules
- `buildx-best-practices` - multi-platform build validation, cache configuration, provenance

---

## v0.8.0 - Compose Completeness

Every remaining Docker Compose V2 command for full lifecycle control.

### MCP Tools (+16)
- `docker_composeConfig` - validate, resolve, and render a compose file in canonical format
- `docker_composeCp` - copy files between a compose service container and the local filesystem
- `docker_composeCreate` - create service containers without starting them
- `docker_composeEvents` - receive real-time events from compose containers
- `docker_composeImages` - list images used by compose service containers
- `docker_composeKill` - force stop compose service containers
- `docker_composeLs` - list running compose projects
- `docker_composePause` - pause compose services
- `docker_composeUnpause` - unpause compose services
- `docker_composePort` - print the public port for a port binding
- `docker_composeRm` - remove stopped compose service containers
- `docker_composeRun` - run a one-off command on a compose service
- `docker_composeScale` - scale compose services up or down
- `docker_composeStart` - start existing compose service containers
- `docker_composeStop` - stop compose services without removing them
- `docker_composeTop` - display running processes per compose service

### Rules
- `compose-scaling` - service scaling best practices, replica constraints, resource allocation

---

## v0.9.0 - Container/Image Gaps, Context, and Auth

Fill remaining container and image command gaps, add remote Docker host management via contexts, and registry authentication.

### MCP Tools (+14)

#### Container gaps (4)
- `docker_diff` - inspect filesystem changes in a container (added, changed, deleted files)
- `docker_export` - export a container's filesystem as a tar archive
- `docker_port` - list port mappings or a specific mapping for a container
- `docker_rename` - rename a container

#### Image gaps (2)
- `docker_imageHistory` - show the layer history of an image (commands, sizes, timestamps)
- `docker_import` - import a tarball to create a filesystem image

#### Context management (6)
- `docker_contextCreate` - create a context for connecting to remote Docker hosts
- `docker_contextLs` - list available contexts
- `docker_contextInspect` - display detailed information on a context
- `docker_contextRm` - remove one or more contexts
- `docker_contextUse` - set the current active Docker context
- `docker_contextShow` - print the name of the current context

#### Registry authentication (2)
- `docker_login` - authenticate to a container registry
- `docker_logout` - log out from a container registry

### Skills
- `docker-context-management` - managing remote Docker hosts, SSH contexts, multi-host workflows

---

## v0.10.0 - Swarm Orchestration

Docker Swarm mode - cluster initialization, service management, and node administration. Swarm is built into Docker Engine (free, no extra install).

### MCP Tools (+24)

#### Swarm cluster (8)
- `docker_swarmInit` - initialize a new swarm
- `docker_swarmJoin` - join a swarm as a node or manager
- `docker_swarmLeave` - leave the swarm
- `docker_swarmJoinToken` - manage join tokens (worker and manager)
- `docker_swarmUpdate` - update swarm configuration (task history, snapshot interval)
- `docker_swarmUnlock` - unlock a locked swarm
- `docker_swarmUnlockKey` - manage the swarm unlock key
- `docker_swarmCa` - display and rotate the root CA certificate

#### Swarm services (9)
- `docker_serviceCreate` - create a new replicated or global service
- `docker_serviceUpdate` - update a service's image, replicas, resources, or config
- `docker_serviceRm` - remove one or more services
- `docker_serviceLs` - list services in the swarm
- `docker_serviceInspect` - display detailed service information
- `docker_serviceLogs` - fetch logs from a service or task
- `docker_servicePs` - list tasks (containers) of a service
- `docker_serviceScale` - scale one or more services to a target replica count
- `docker_serviceRollback` - revert a service to its previous configuration

#### Swarm nodes (7)
- `docker_nodeLs` - list nodes in the swarm
- `docker_nodeInspect` - display detailed node information
- `docker_nodePs` - list tasks running on a node
- `docker_nodeRm` - remove a node from the swarm
- `docker_nodeUpdate` - update node metadata (labels, availability, role)
- `docker_nodePromote` - promote a worker node to manager
- `docker_nodeDemote` - demote a manager node to worker

### Skills
- `docker-swarm` - Swarm mode orchestration patterns, service deployment, rolling updates, drain and failover

### Rules
- `swarm-security` - Swarm-specific security checks (autolock, certificate rotation, encrypted overlay networks)

---

## v0.11.0 - Swarm Stacks, Configs, Secrets, and Trust

Stack deployments, Swarm-native configuration management, secret storage, and Docker Content Trust for image signing.

### MCP Tools (+18)

#### Swarm stacks (6)
- `docker_stackDeploy` - deploy a new stack or update an existing stack from a compose file
- `docker_stackRm` - remove one or more stacks
- `docker_stackLs` - list stacks in the swarm
- `docker_stackPs` - list tasks (containers) in a stack
- `docker_stackServices` - list services in a stack
- `docker_stackConfig` - output the final merged config for a stack

#### Swarm configs (4)
- `docker_configCreate` - create a Swarm config from a file or stdin
- `docker_configInspect` - display detailed config information
- `docker_configLs` - list Swarm configs
- `docker_configRm` - remove one or more Swarm configs

#### Swarm secrets (4)
- `docker_secretCreate` - create a Swarm secret from a file or stdin
- `docker_secretInspect` - display detailed secret information (metadata only, not the value)
- `docker_secretLs` - list Swarm secrets
- `docker_secretRm` - remove one or more Swarm secrets

#### Docker Content Trust (4)
- `docker_trustInspect` - inspect trust data for an image
- `docker_trustSign` - sign an image for Docker Content Trust
- `docker_trustRevoke` - revoke trust for an image
- `docker_trustKey` - manage signing keys (generate, load)

### Skills
- `docker-image-signing` - Docker Content Trust, image verification, signing workflows

---

## v0.12.0 - Niche, Scout, and Extras

Remaining Docker CLI commands, vulnerability scanning, compose watch, plugin management, and version info.

### MCP Tools (+10)

#### Utility (2)
- `docker_version` - show Docker version information (client and server)
- `docker_composeVersion` - show Docker Compose version information

#### Compose extras (1)
- `docker_composeWatch` - watch build context for services and auto-rebuild on file changes

#### Docker Scout (3, requires Docker Scout CLI or Docker Desktop)
- `docker_scoutQuickview` - quick overview of image vulnerabilities
- `docker_scoutCves` - list CVEs found in an image
- `docker_scoutRecommendations` - get base image update recommendations

#### Plugin management (4)
- `docker_pluginLs` - list installed plugins
- `docker_pluginInstall` - install a Docker plugin
- `docker_pluginRm` - remove a plugin
- `docker_pluginEnable` - enable a disabled plugin

---

## v1.0.0 - Stable

Production release after community feedback and testing.

- Finalize all APIs and tool signatures
- Complete documentation coverage
- Performance optimization for MCP tool responses
- Full test coverage across all components
- Expand Common Pitfalls sections across all skills
- Add cross-references between related skills and rules
- Add workflow diagrams to complex skills
- Comprehensive error message review for all MCP tools

---

## Safety Considerations

All destructive MCP tools (`rm`, `rmi`, `prune`, `kill`, `down`, `leave`) will:

- Default to **dry-run** where Docker supports it (`--dry-run` on prune and compose commands)
- Require explicit identifiers - no blanket wildcards or "remove all" without a filter
- Return clear confirmation of what was affected in the response
- Never force-remove by default - `force` must be explicitly opted in
- Swarm destructive operations (leave, stack rm, service rm) require explicit confirmation parameters

---

## Completed

- [x] Plugin scaffold (plugin.json, directory structure)
- [x] MCP server with 10 read-only tools
- [x] 10 container lifecycle tools (run, create, start, stop, restart, kill, rm, pause, unpause, exec)
- [x] Comprehensive roadmap rewrite with ~150 planned MCP tools
- [x] 13 buildx and manifest tools (buildxBuild/Ls/Create/Rm/Inspect/Use/Imagetools, builderPrune, manifestCreate/Inspect/Annotate/Push/Rm)
- [x] 14 skills covering Docker workflows including multi-platform builds
- [x] 16 compose completeness tools (composeConfig/Cp/Create/Events/Images/Kill/Ls/Pause/Unpause/Port/Rm/Run/Scale/Start/Stop/Top)
- [x] 14 container/image gap, context, and auth tools (diff/export/port/rename/imageHistory/import/contextCreate/Ls/Inspect/Rm/Use/Show/login/logout)
- [x] 15 skills covering Docker workflows including context management
- [x] 9 rules including buildx best practices and compose scaling
- [x] 8 image and build tools (pull, push, build, tag, rmi, commit, save, load)
- [x] 8 compose tools (composeUp, composeDown, composePs, composeLogs, composeBuild, composeRestart, composePull, composeExec)
- [x] 13 volume, network, and cleanup tools (volumeCreate/Rm/Inspect/Prune, networkCreate/Rm/Connect/Disconnect/Inspect/Prune, systemPrune, containerPrune, imagePrune)
- [x] VolumeNotFoundError and NetworkNotFoundError error classes
- [x] npm publish of @tmhs/docker-mcp with GitHub Actions automation (OIDC trusted publishers)
- [x] 6 advanced/observability tools (cp, stats, top, events, update, wait)
- [x] 13 skills covering core Docker workflows
- [x] 7 rules for Dockerfile and compose validation
- [x] Python test suite for structure validation
- [x] Vitest test suite for MCP server
- [x] GitHub Actions CI/CD workflows
- [x] GitHub Pages landing site
- [x] Contributing guide and issue templates

---

## Release Process

Every release follows the checklist in [CONTRIBUTING.md](CONTRIBUTING.md#release-checklist). The short version:

1. Implement all tools/skills/rules for the milestone
2. Add tests, build, verify all tests pass
3. Bump version consistently across `plugin.json`, `package.json`, `index.ts`, `README.md`, `CLAUDE.md`, and this file
4. Update `CHANGELOG.md` and `docs/index.html` (GitHub Pages)
5. Re-run tests (some validate doc consistency)
6. Commit, tag, push, create GitHub release, update repo description

---

## Contributing

Have an idea for a new skill, rule, or MCP tool? Check the [Contributing Guide](CONTRIBUTING.md) and open an issue or pull request.
